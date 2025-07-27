import { generateArabicExplanation } from "../arabicExplanation";
import { generateAudioFromText } from "./openai";
import type { Question } from "@shared/schema";

export interface BatchResult {
  processed: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export class BatchOptimizer {
  private maxConcurrency = 3; // Limit concurrent API calls
  private batchSize = 5; // Process in batches

  // Batch generate Arabic explanations with rate limiting
  async batchGenerateArabicExplanations(questions: Question[]): Promise<BatchResult> {
    const result: BatchResult = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Filter questions that need Arabic explanations
    const questionsNeedingExplanations = questions.filter(q => !q.arabicExplanation);
    
    if (questionsNeedingExplanations.length === 0) {
      result.skipped = questions.length;
      return result;
    }

    console.log(`🚀 Starting batch Arabic explanation generation for ${questionsNeedingExplanations.length} questions`);

    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < questionsNeedingExplanations.length; i += this.batchSize) {
      const batch = questionsNeedingExplanations.slice(i, i + this.batchSize);
      
      try {
        await this.processBatchWithConcurrency(
          batch,
          async (question: Question) => {
            console.log(`📝 Generating Arabic explanation for question ${question.id}...`);
            const explanation = await generateArabicExplanation(question);
            result.processed++;
            return explanation;
          }
        );
        
        // Rate limiting: wait between batches
        if (i + this.batchSize < questionsNeedingExplanations.length) {
          await this.delay(2000); // 2 second delay between batches
        }
      } catch (error) {
        console.error(`❌ Batch processing error:`, error);
        result.failed += batch.length;
        result.errors.push(`Batch ${Math.floor(i / this.batchSize) + 1}: ${error}`);
      }
    }

    console.log(`✅ Batch Arabic explanation generation complete: ${result.processed} processed, ${result.failed} failed`);
    return result;
  }

  // Batch generate audio with smart optimization
  async batchGenerateAudio(questions: Question[]): Promise<BatchResult> {
    const result: BatchResult = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Filter listening questions (1-66) that need audio
    const questionsNeedingAudio = questions.filter(q => 
      q.questionIndex <= 66 && !q.audioUrl
    );

    if (questionsNeedingAudio.length === 0) {
      result.skipped = questions.length;
      return result;
    }

    console.log(`🔊 Starting batch audio generation for ${questionsNeedingAudio.length} listening questions`);

    // Process in smaller batches for audio (more expensive)
    const audioBatchSize = 2;
    
    for (let i = 0; i < questionsNeedingAudio.length; i += audioBatchSize) {
      const batch = questionsNeedingAudio.slice(i, i + audioBatchSize);
      
      try {
        await this.processBatchWithConcurrency(
          batch,
          async (question: Question) => {
            console.log(`🎵 Generating audio for question ${question.id}...`);
            const { audioUrl } = await generateAudioFromText(question.questionText, question.id);
            result.processed++;
            return audioUrl;
          }
        );
        
        // Longer delay for audio generation
        if (i + audioBatchSize < questionsNeedingAudio.length) {
          await this.delay(3000); // 3 second delay between audio batches
        }
      } catch (error) {
        console.error(`❌ Audio batch processing error:`, error);
        result.failed += batch.length;
        result.errors.push(`Audio batch ${Math.floor(i / audioBatchSize) + 1}: ${error}`);
      }
    }

    console.log(`✅ Batch audio generation complete: ${result.processed} processed, ${result.failed} failed`);
    return result;
  }

  // Process items with controlled concurrency
  private async processBatchWithConcurrency<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.maxConcurrency) {
      const batch = items.slice(i, i + this.maxConcurrency);
      const batchPromises = batch.map(processor);
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        // If any promise fails, try them individually
        for (const item of batch) {
          try {
            const result = await processor(item);
            results.push(result);
          } catch (itemError) {
            console.error(`❌ Individual item processing failed:`, itemError);
            throw itemError;
          }
        }
      }
    }
    
    return results;
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Smart retry with exponential backoff
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await this.delay(delay);
      }
    }
    
    throw new Error("Should not reach here");
  }

  // Estimate API costs for batch operations
  estimateCosts(questions: Question[]) {
    const arabicExplanationsNeeded = questions.filter(q => !q.arabicExplanation).length;
    const audioGenerationsNeeded = questions.filter(q => 
      q.questionIndex <= 66 && !q.audioUrl
    ).length;

    // Rough cost estimates (adjust based on actual API pricing)
    const geminiCostPerExplanation = 0.001; // $0.001 per explanation
    const openaiCostPerAudio = 0.006; // $0.006 per audio file

    const estimatedGeminiCost = arabicExplanationsNeeded * geminiCostPerExplanation;
    const estimatedOpenaiCost = audioGenerationsNeeded * openaiCostPerAudio;
    const totalEstimatedCost = estimatedGeminiCost + estimatedOpenaiCost;

    return {
      arabicExplanationsNeeded,
      audioGenerationsNeeded,
      estimatedGeminiCost,
      estimatedOpenaiCost,
      totalEstimatedCost,
      savings: {
        withoutCaching: (questions.length * geminiCostPerExplanation) + 
                       (questions.filter(q => q.questionIndex <= 66).length * openaiCostPerAudio),
        withCaching: totalEstimatedCost,
        percentageSaved: Math.round(
          (1 - (totalEstimatedCost / 
            ((questions.length * geminiCostPerExplanation) + 
             (questions.filter(q => q.questionIndex <= 66).length * openaiCostPerAudio))
          )) * 100
        )
      }
    };
  }
}

export const batchOptimizer = new BatchOptimizer();