import { storage } from "../storage";
import { generateArabicExplanation } from "../arabicExplanation";
import { generateAudioFromText } from "./openai";
import type { Question } from "@shared/schema";

interface BackgroundJob {
  id: string;
  type: 'arabic_explanation' | 'audio_generation' | 'batch_process';
  questionId?: number;
  testId?: number;
  priority: 'low' | 'medium' | 'high';
  retries: number;
  createdAt: Date;
  data?: any;
}

export class BackgroundProcessor {
  private jobs: Map<string, BackgroundJob> = new Map();
  private processing = false;
  private maxRetries = 3;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessor();
  }

  // Start the background processor
  startProcessor() {
    if (this.processingInterval) return;
    
    this.processingInterval = setInterval(async () => {
      if (!this.processing && this.jobs.size > 0) {
        await this.processJobs();
      }
    }, 5000); // Process every 5 seconds

    console.log("🚀 Background processor started");
  }

  // Stop the background processor
  stopProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("⏹️ Background processor stopped");
  }

  // Add a job to the queue
  addJob(type: BackgroundJob['type'], options: {
    questionId?: number;
    testId?: number;
    priority?: 'low' | 'medium' | 'high';
    data?: any;
  }) {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: BackgroundJob = {
      id,
      type,
      questionId: options.questionId,
      testId: options.testId,
      priority: options.priority || 'medium',
      retries: 0,
      createdAt: new Date(),
      data: options.data
    };

    this.jobs.set(id, job);
    console.log(`📝 Added background job: ${type} (${id})`);
    return id;
  }

  // Process jobs in the queue
  private async processJobs() {
    this.processing = true;
    
    try {
      // Sort jobs by priority and creation time
      const sortedJobs = Array.from(this.jobs.values()).sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      // Process jobs one by one
      for (const job of sortedJobs) {
        try {
          await this.executeJob(job);
          this.jobs.delete(job.id);
          console.log(`✅ Completed background job: ${job.type} (${job.id})`);
        } catch (error) {
          await this.handleJobError(job, error);
        }
      }
    } catch (error) {
      console.error("❌ Error in background processor:", error);
    } finally {
      this.processing = false;
    }
  }

  // Execute a specific job
  private async executeJob(job: BackgroundJob) {
    switch (job.type) {
      case 'arabic_explanation':
        await this.generateArabicExplanationJob(job);
        break;
      case 'audio_generation':
        await this.generateAudioJob(job);
        break;
      case 'batch_process':
        await this.batchProcessJob(job);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  // Generate Arabic explanation for a question
  private async generateArabicExplanationJob(job: BackgroundJob) {
    if (!job.questionId) throw new Error("Question ID required for Arabic explanation job");

    const question = await storage.getQuestionById(job.questionId);
    if (!question) throw new Error(`Question ${job.questionId} not found`);

    if (question.arabicExplanation) {
      console.log(`⏭️ Arabic explanation already exists for question ${job.questionId}`);
      return;
    }

    console.log(`🔄 Generating Arabic explanation for question ${job.questionId}...`);
    const arabicExplanation = await generateArabicExplanation(question);
    await storage.updateQuestionArabicExplanation(job.questionId, arabicExplanation);
    console.log(`✨ Arabic explanation generated for question ${job.questionId}`);
  }

  // Generate audio for a question
  private async generateAudioJob(job: BackgroundJob) {
    if (!job.questionId) throw new Error("Question ID required for audio generation job");

    const question = await storage.getQuestionById(job.questionId);
    if (!question) throw new Error(`Question ${job.questionId} not found`);

    // Only generate audio for listening questions (1-66)
    if (question.questionIndex > 66) {
      console.log(`⏭️ Skipping audio generation for reading question ${job.questionId}`);
      return;
    }

    if (question.audioUrl) {
      console.log(`⏭️ Audio already exists for question ${job.questionId}`);
      return;
    }

    console.log(`🔊 Generating audio for question ${job.questionId}...`);
    const { audioUrl } = await generateAudioFromText(question.questionText, job.questionId);
    await storage.updateQuestionAudio(job.questionId, audioUrl);
    console.log(`🎵 Audio generated for question ${job.questionId}`);
  }

  // Batch process all questions in a test
  private async batchProcessJob(job: BackgroundJob) {
    if (!job.testId) throw new Error("Test ID required for batch processing job");

    console.log(`📦 Starting batch processing for test ${job.testId}...`);
    const questions = await storage.getQuestionsByTestId(job.testId);
    
    let processedCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      try {
        // Generate Arabic explanation if missing
        if (!question.arabicExplanation) {
          this.addJob('arabic_explanation', { 
            questionId: question.id, 
            priority: 'low' 
          });
          processedCount++;
        } else {
          skippedCount++;
        }

        // Generate audio if missing and it's a listening question
        if (question.questionIndex <= 66 && !question.audioUrl) {
          this.addJob('audio_generation', { 
            questionId: question.id, 
            priority: 'low' 
          });
          processedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing question ${question.id}:`, error);
      }
    }

    console.log(`📊 Batch processing complete for test ${job.testId}: ${processedCount} jobs added, ${skippedCount} skipped`);
  }

  // Handle job errors
  private async handleJobError(job: BackgroundJob, error: any) {
    job.retries++;
    console.error(`❌ Job ${job.id} failed (attempt ${job.retries}/${this.maxRetries}):`, error);

    if (job.retries >= this.maxRetries) {
      this.jobs.delete(job.id);
      console.error(`💀 Job ${job.id} failed permanently after ${this.maxRetries} attempts`);
    } else {
      // Retry with exponential backoff
      setTimeout(() => {
        console.log(`🔄 Retrying job ${job.id} (attempt ${job.retries + 1}/${this.maxRetries})`);
      }, Math.pow(2, job.retries) * 1000);
    }
  }

  // Get queue statistics
  getStats() {
    const stats = {
      totalJobs: this.jobs.size,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      processing: this.processing
    };

    for (const job of this.jobs.values()) {
      stats.byType[job.type] = (stats.byType[job.type] || 0) + 1;
      stats.byPriority[job.priority] = (stats.byPriority[job.priority] || 0) + 1;
    }

    return stats;
  }

  // Pre-generate Arabic explanations for all questions missing them
  async preGenerateArabicExplanations(testId?: number) {
    console.log("🚀 Starting pre-generation of Arabic explanations...");
    
    let questions: Question[];
    if (testId) {
      questions = await storage.getQuestionsByTestId(testId);
    } else {
      // Get all tests and their questions
      const tests = await storage.getAllTests();
      questions = [];
      for (const test of tests) {
        const testQuestions = await storage.getQuestionsByTestId(test.id);
        questions.push(...testQuestions);
      }
    }

    const missingExplanations = questions.filter(q => !q.arabicExplanation);
    console.log(`📊 Found ${missingExplanations.length} questions missing Arabic explanations`);

    for (const question of missingExplanations) {
      this.addJob('arabic_explanation', {
        questionId: question.id,
        priority: 'medium'
      });
    }

    return {
      totalQuestions: questions.length,
      missingExplanations: missingExplanations.length,
      jobsAdded: missingExplanations.length
    };
  }

  // Pre-generate audio for all listening questions missing them
  async preGenerateAudio(testId?: number) {
    console.log("🔊 Starting pre-generation of audio files...");
    
    let questions: Question[];
    if (testId) {
      questions = await storage.getQuestionsByTestId(testId);
    } else {
      // Get all tests and their questions
      const tests = await storage.getAllTests();
      questions = [];
      for (const test of tests) {
        const testQuestions = await storage.getQuestionsByTestId(test.id);
        questions.push(...testQuestions);
      }
    }

    // Filter for listening questions (1-66) without audio
    const missingAudio = questions.filter(q => 
      q.questionIndex <= 66 && !q.audioUrl
    );
    
    console.log(`🎵 Found ${missingAudio.length} listening questions missing audio`);

    for (const question of missingAudio) {
      this.addJob('audio_generation', {
        questionId: question.id,
        priority: 'medium'
      });
    }

    return {
      totalQuestions: questions.length,
      listeningQuestions: questions.filter(q => q.questionIndex <= 66).length,
      missingAudio: missingAudio.length,
      jobsAdded: missingAudio.length
    };
  }
}

// Create global background processor instance
export const backgroundProcessor = new BackgroundProcessor();