import { tests, questions, userProgress, type Test, type InsertTest, type Question, type InsertQuestion, type UserProgress, type InsertUserProgress } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  // Test operations
  getAllTests(): Promise<Test[]>;
  getTestById(id: number): Promise<Test | undefined>;
  getTestByNumber(testNumber: string): Promise<Test | undefined>;
  createTest(test: InsertTest): Promise<Test>;
  
  // Question operations
  getQuestionsByTestId(testId: number): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getRandomQuestion(testId?: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionAudio(id: number, audioUrl: string): Promise<Question | undefined>;
  
  // User progress operations
  saveUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressByTest(testId: number): Promise<UserProgress[]>;
  
  // JSON file operations
  loadQuestionsFromFile(filePath: string): Promise<void>;
  getAllTestFiles(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private tests: Map<number, Test>;
  private questions: Map<number, Question>;
  private userProgress: Map<number, UserProgress>;
  private currentTestId: number;
  private currentQuestionId: number;
  private currentProgressId: number;

  constructor() {
    this.tests = new Map();
    this.questions = new Map();
    this.userProgress = new Map();
    this.currentTestId = 1;
    this.currentQuestionId = 1;
    this.currentProgressId = 1;
  }

  async getAllTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async getTestById(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async getTestByNumber(testNumber: string): Promise<Test | undefined> {
    return Array.from(this.tests.values()).find(test => test.testNumber === testNumber);
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const test: Test = {
      ...insertTest,
      id: this.currentTestId++,
      duration: insertTest.duration || null,
      description: insertTest.description || null,
    };
    this.tests.set(test.id, test);
    return test;
  }

  async getQuestionsByTestId(testId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.testId === testId);
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getRandomQuestion(testId?: number): Promise<Question | undefined> {
    const questionList = Array.from(this.questions.values());
    const filteredQuestions = testId 
      ? questionList.filter(q => q.testId === testId)
      : questionList;
    
    if (filteredQuestions.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const question: Question = {
      ...insertQuestion,
      id: this.currentQuestionId++,
      testId: insertQuestion.testId || null,
      questionType: insertQuestion.questionType || "listening",
      explanation: insertQuestion.explanation || null,
      audioUrl: insertQuestion.audioUrl || null,
    };
    this.questions.set(question.id, question);
    return question;
  }

  async updateQuestionAudio(id: number, audioUrl: string): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, audioUrl };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async saveUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const progress: UserProgress = {
      ...insertProgress,
      id: this.currentProgressId++,
      testId: insertProgress.testId || null,
      questionId: insertProgress.questionId || null,
      userAnswer: insertProgress.userAnswer || null,
      isCorrect: insertProgress.isCorrect ?? null,
      answeredAt: insertProgress.answeredAt || null,
    };
    this.userProgress.set(progress.id, progress);
    return progress;
  }

  async getUserProgressByTest(testId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.testId === testId);
  }

  async loadQuestionsFromFile(filePath: string): Promise<void> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const questionsData = JSON.parse(fileContent);
      
      const testNumber = path.basename(filePath, '.json');
      
      // Create or get test
      let test = await this.getTestByNumber(testNumber);
      if (!test) {
        test = await this.createTest({
          testNumber,
          title: `Test ${testNumber}`,
          description: `ALCPT Listening Practice Test ${testNumber}`,
          questionCount: questionsData.length,
          duration: `~${Math.ceil(questionsData.length * 1.5)} minutes`,
        });
      }

      // Load questions
      for (const questionData of questionsData) {
        const question: InsertQuestion = {
          testId: test.id,
          questionIndex: questionData.question_index,
          questionType: questionData.question_type || "listening",
          questionText: questionData.question_text,
          correctAnswer: questionData.correct_answer,
          otherOptions: questionData.other_options,
          explanation: questionData.explanation || null,
          audioUrl: null,
        };
        
        await this.createQuestion(question);
      }
    } catch (error) {
      console.error(`Error loading questions from ${filePath}:`, error);
      throw error;
    }
  }

  async getAllTestFiles(): Promise<string[]> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.promises.readdir(dataDir);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      console.error('Error reading test files:', error);
      return [];
    }
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getAllTests(): Promise<Test[]> {
    return await db.select().from(tests);
  }

  async getTestById(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test || undefined;
  }

  async getTestByNumber(testNumber: string): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.testNumber, testNumber));
    return test || undefined;
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const [test] = await db
      .insert(tests)
      .values(insertTest)
      .returning();
    return test;
  }

  async getQuestionsByTestId(testId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.testId, testId));
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async getRandomQuestion(testId?: number): Promise<Question | undefined> {
    let questionList: Question[];
    
    if (testId) {
      questionList = await db.select().from(questions).where(eq(questions.testId, testId));
    } else {
      questionList = await db.select().from(questions);
    }
    
    if (questionList.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * questionList.length);
    return questionList[randomIndex];
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestionAudio(id: number, audioUrl: string): Promise<Question | undefined> {
    const [updatedQuestion] = await db
      .update(questions)
      .set({ audioUrl })
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion || undefined;
  }

  async saveUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async getUserProgressByTest(testId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.testId, testId));
  }

  async loadQuestionsFromFile(filePath: string): Promise<void> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const questionsData = JSON.parse(fileContent);
      
      const testNumber = path.basename(filePath, '.json');
      
      // Create or get test
      let test = await this.getTestByNumber(testNumber);
      if (!test) {
        test = await this.createTest({
          testNumber,
          title: `Test ${testNumber}`,
          description: `ALCPT Listening Practice Test ${testNumber}`,
          questionCount: questionsData.length,
          duration: `~${Math.ceil(questionsData.length * 1.5)} minutes`,
        });
      }

      // Check if questions already exist for this test to avoid duplicates
      const existingQuestions = await this.getQuestionsByTestId(test.id);
      if (existingQuestions.length > 0) {
        console.log(`Questions for test ${testNumber} already exist, skipping...`);
        return;
      }

      // Load questions
      for (const questionData of questionsData) {
        const question: InsertQuestion = {
          testId: test.id,
          questionIndex: questionData.question_index,
          questionType: questionData.question_type || "listening",
          questionText: questionData.question_text,
          correctAnswer: questionData.correct_answer,
          otherOptions: questionData.other_options,
          explanation: questionData.explanation || null,
          audioUrl: null,
        };
        
        await this.createQuestion(question);
      }
      
      console.log(`Loaded ${questionsData.length} questions for test ${testNumber}`);
    } catch (error) {
      console.error(`Error loading questions from ${filePath}:`, error);
      throw error;
    }
  }

  async getAllTestFiles(): Promise<string[]> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.promises.readdir(dataDir);
      return files.filter(file => file.endsWith('.json') && !file.includes('template'));
    } catch (error) {
      console.error('Error reading test files:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
