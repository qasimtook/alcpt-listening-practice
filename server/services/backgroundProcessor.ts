import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  getUserProfile, 
  getQuestionById, 
  updateQuestionAudio,
  updateQuestionArabicExplanation 
} from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface AudioJob {
  type: 'audio';
  questionId: number;
  text: string;
  priority: number;
}

interface ArabicExplanationJob {
  type: 'arabic_explanation';
  questionId: number;
  questionText: string;
  correctAnswer: string;
  priority: number;
}

type BackgroundJob = AudioJob | ArabicExplanationJob;

export class BackgroundProcessor {
  private jobQueue: BackgroundJob[] = [];
  private isProcessing = false;
  private readonly audioStoragePath = path.join(__dirname, '../../audio_storage');

  constructor() {
    // Ensure audio storage directory exists
    if (!fs.existsSync(this.audioStoragePath)) {
      fs.mkdirSync(this.audioStoragePath, { recursive: true });
    }
  }

  addAudioJob(questionId: number, text: string, priority: number = 0) {
    const job: AudioJob = {
      type: 'audio',
      questionId,
      text,
      priority
    };
    
    this.jobQueue.push(job);
    this.jobQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.processNextJob();
    }
  }

  addArabicExplanationJob(questionId: number, questionText: string, correctAnswer: string, priority: number = 0) {
    const job: ArabicExplanationJob = {
      type: 'arabic_explanation',
      questionId,
      questionText,
      correctAnswer,
      priority
    };
    
    this.jobQueue.push(job);
    this.jobQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessing) {
      this.processNextJob();
    }
  }

  private async processNextJob() {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.jobQueue.shift();

    if (!job) {
      this.isProcessing = false;
      return;
    }

    try {
      if (job.type === 'audio') {
        await this.processAudioJob(job);
      } else if (job.type === 'arabic_explanation') {
        await this.processArabicExplanationJob(job);
      }
    } catch (error) {
      console.error(`Failed to process job:`, error);
      // Could implement retry logic here
    }

    this.isProcessing = false;
    
    // Process next job if any
    if (this.jobQueue.length > 0) {
      setTimeout(() => this.processNextJob(), 1000); // Small delay between jobs
    }
  }

  private async processAudioJob(job: AudioJob) {
    try {
      console.log(`Generating audio for question ${job.questionId}`);
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: job.text,
      });

      const fileName = `question_${job.questionId}.mp3`;
      const filePath = path.join(this.audioStoragePath, fileName);
      
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Update database with audio path
      await updateQuestionAudio(job.questionId, fileName);
      
      console.log(`Audio generated and saved for question ${job.questionId}`);
    } catch (error) {
      console.error(`Failed to generate audio for question ${job.questionId}:`, error);
      throw error;
    }
  }

  private async processArabicExplanationJob(job: ArabicExplanationJob) {
    try {
      console.log(`Generating Arabic explanation for question ${job.questionId}`);
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Explain this English test question in Arabic, focusing on why the correct answer is right:

Question: ${job.questionText}
Correct Answer: ${job.correctAnswer}

Please provide a clear, educational explanation in Arabic that helps Arabic speakers understand:
1. The meaning of the question
2. Why the correct answer is the best choice
3. Any relevant grammar or vocabulary points

Keep the explanation concise but helpful.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const arabicExplanation = response.text();

      // Update database with Arabic explanation
      await updateQuestionArabicExplanation(job.questionId, arabicExplanation);
      
      console.log(`Arabic explanation generated for question ${job.questionId}`);
    } catch (error) {
      console.error(`Failed to generate Arabic explanation for question ${job.questionId}:`, error);
      throw error;
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.jobQueue.length,
      isProcessing: this.isProcessing,
      jobs: this.jobQueue.map(job => ({
        type: job.type,
        questionId: job.questionId,
        priority: job.priority
      }))
    };
  }
}

export const backgroundProcessor = new BackgroundProcessor();
