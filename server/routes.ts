import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAudioFromText } from "./services/openai";
import { formatQuestionText, parseBulkQuestionText } from "./services/gemini";
import { generateArabicExplanation } from "./arabicExplanation";
import { answerSubmissionSchema } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve audio files from permanent storage
  app.use('/api/audio', express.static(path.join(process.cwd(), 'audio_storage'), {
    maxAge: '1d', // Cache for 1 day
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=86400');
    }
  }));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all available tests
  app.get("/api/tests", async (req, res) => {
    try {
      const tests = await storage.getAllTests();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  // Get a specific test by ID or number
  app.get("/api/tests/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      let test;
      
      if (isNaN(Number(identifier))) {
        // It's a test number (string)
        test = await storage.getTestByNumber(identifier);
      } else {
        // It's a test ID (number)
        test = await storage.getTestById(Number(identifier));
      }
      
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Get questions for a specific test
  app.get("/api/tests/:testId/questions", async (req, res) => {
    try {
      const testId = Number(req.params.testId);
      const questions = await storage.getQuestionsByTestId(testId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get a random question (optionally from a specific test)
  app.get("/api/question", async (req, res) => {
    try {
      const testId = req.query.testId ? Number(req.query.testId) : undefined;
      const question = await storage.getRandomQuestion(testId);
      
      if (!question) {
        return res.status(404).json({ message: "No questions available" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching random question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Get a specific question by ID
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const questionId = Number(req.params.id);
      const question = await storage.getQuestionById(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Generate audio for a question
  app.post("/api/questions/:id/audio", async (req, res) => {
    try {
      const questionId = Number(req.params.id);
      const question = await storage.getQuestionById(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if this is a listening question (1-66)
      if (question.questionIndex > 66) {
        return res.status(400).json({ 
          message: "Audio not available for reading/grammar questions",
          isListeningQuestion: false 
        });
      }

      // Check if audio URL already exists in database
      if (question.audioUrl) {
        // Verify the audio file still exists on disk
        const audioFilename = path.basename(question.audioUrl);
        const audioPath = path.join(process.cwd(), "audio_storage", audioFilename);
        
        if (fs.existsSync(audioPath)) {
          return res.json({ audioUrl: question.audioUrl });
        } else {
          console.log(`Audio file missing for question ${questionId}, will regenerate`);
        }
      }

      // Generate audio with permanent storage
      const { audioUrl } = await generateAudioFromText(question.questionText, questionId);
      
      // Update question with audio URL in database
      await storage.updateQuestionAudio(questionId, audioUrl);
      
      res.json({ audioUrl });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  // Submit an answer and get feedback
  app.post("/api/questions/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const questionId = Number(req.params.id);
      const question = await storage.getQuestionById(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const submission = answerSubmissionSchema.parse({
        questionId,
        selectedAnswer: req.body.selectedAnswer
      });

      const isCorrect = submission.selectedAnswer === question.correctAnswer;
      


      // Generate Arabic explanation
      let arabicExplanation = question.arabicExplanation;
      if (!arabicExplanation) {
        try {
          arabicExplanation = await generateArabicExplanation(question);
          // Update question with Arabic explanation
          await storage.updateQuestionArabicExplanation(question.id, arabicExplanation);
        } catch (error) {
          console.error("Failed to generate Arabic explanation:", error);
          // Continue without Arabic explanation rather than failing the request
        }
      }

      // Save user progress
      const userId = req.user.claims.sub;
      await storage.saveUserProgress({
        userId,
        testId: question.testId,
        questionId: question.id,
        userAnswer: submission.selectedAnswer,
        isCorrect,
        answeredAt: new Date().toISOString(),
      });

      const feedback = {
        isCorrect,
        correctAnswer: question.correctAnswer,
        arabicExplanation,
        selectedAnswer: submission.selectedAnswer,
      };

      res.json(feedback);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Format question data using Gemini
  app.post("/api/format-question", async (req, res) => {
    try {
      const rawQuestionData = req.body;
      const formattedQuestion = await formatQuestionText(rawQuestionData);
      res.json(formattedQuestion);
    } catch (error) {
      console.error("Error formatting question:", error);
      res.status(500).json({ message: "Failed to format question" });
    }
  });

  // Parse bulk question text using Gemini
  app.post("/api/parse-bulk-questions", async (req, res) => {
    try {
      const { bulkText } = req.body;
      if (!bulkText || typeof bulkText !== 'string') {
        return res.status(400).json({ message: "bulkText is required and must be a string" });
      }
      
      const parsedQuestions = await parseBulkQuestionText(bulkText);
      res.json({ 
        message: `Successfully parsed ${parsedQuestions.length} questions`,
        questions: parsedQuestions 
      });
    } catch (error) {
      console.error("Error parsing bulk questions:", error);
      res.status(500).json({ message: "Failed to parse bulk questions" });
    }
  });

  // Load questions from JSON files
  app.post("/api/load-test-data", async (req, res) => {
    try {
      const files = await storage.getAllTestFiles();
      const loadedTests = [];

      for (const file of files) {
        const filePath = path.join(process.cwd(), 'data', file);
        await storage.loadQuestionsFromFile(filePath);
        loadedTests.push(file);
      }

      res.json({ 
        message: "Test data loaded successfully", 
        loadedFiles: loadedTests 
      });
    } catch (error) {
      console.error("Error loading test data:", error);
      res.status(500).json({ message: "Failed to load test data" });
    }
  });

  // Get user progress for a test
  app.get("/api/tests/:testId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const testId = Number(req.params.testId);
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgressByTest(testId);
      // Filter progress for current user
      const userProgress = progress.filter(p => p.userId === userId);
      res.json(userProgress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get all user progress
  app.get("/api/user/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgressByUser(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
