import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Test operations
export async function getAllTests() {
  return db.select().from(schema.tests);
}

export async function getTestById(testId: number) {
  const result = await db.select().from(schema.tests).where(eq(schema.tests.id, testId));
  return result[0] || null;
}

// Question operations
export async function getAllQuestions(testId?: number) {
  if (testId) {
    return db.select().from(schema.questions).where(eq(schema.questions.testId, testId));
  }
  return db.select().from(schema.questions);
}

export async function getQuestionById(questionId: number) {
  const result = await db.select().from(schema.questions).where(eq(schema.questions.id, questionId));
  return result[0] || null;
}

export async function updateQuestionAudio(questionId: number, audioPath: string) {
  return db.update(schema.questions)
    .set({ audioPath })
    .where(eq(schema.questions.id, questionId));
}

export async function updateQuestionArabicExplanation(questionId: number, arabicExplanation: string) {
  return db.update(schema.questions)
    .set({ arabicExplanation })
    .where(eq(schema.questions.id, questionId));
}

// User operations
export async function getUserProfile(userId: string) {
  const result = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  return result[0] || null;
}

export async function createUser(userId: string, name: string, email?: string) {
  return db.insert(schema.users).values({
    id: userId,
    name,
    email,
    createdAt: new Date()
  }).returning();
}

export async function updateUserProfile(userId: string, updates: Partial<typeof schema.users.$inferInsert>) {
  return db.update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, userId))
    .returning();
}

// Progress operations
export async function getUserProgress(userId: string, testId?: number) {
  let query = db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, userId));
  
  if (testId) {
    query = query.where(eq(schema.userProgress.testId, testId));
  }
  
  return query;
}

export async function submitAnswer(userId: string, questionId: number, answer: string, isCorrect: boolean) {
  // Get the question to find the test ID
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  // Check if user already answered this question
  const existingAnswer = await db.select()
    .from(schema.userAnswers)
    .where(and(
      eq(schema.userAnswers.userId, userId),
      eq(schema.userAnswers.questionId, questionId)
    ));

  let answerResult;
  if (existingAnswer.length > 0) {
    // Update existing answer
    answerResult = await db.update(schema.userAnswers)
      .set({
        answer,
        isCorrect,
        answeredAt: new Date()
      })
      .where(and(
        eq(schema.userAnswers.userId, userId),
        eq(schema.userAnswers.questionId, questionId)
      ))
      .returning();
  } else {
    // Create new answer
    answerResult = await db.insert(schema.userAnswers).values({
      userId,
      questionId,
      answer,
      isCorrect,
      answeredAt: new Date()
    }).returning();
  }

  // Update or create user progress for this test
  const existingProgress = await db.select()
    .from(schema.userProgress)
    .where(and(
      eq(schema.userProgress.userId, userId),
      eq(schema.userProgress.testId, question.testId)
    ));

  if (existingProgress.length > 0) {
    // Update existing progress
    const progress = existingProgress[0];
    const newCorrectAnswers = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers;
    const newTotalAnswers = progress.totalAnswers + 1;
    const newScore = Math.round((newCorrectAnswers / newTotalAnswers) * 100);

    await db.update(schema.userProgress)
      .set({
        correctAnswers: newCorrectAnswers,
        totalAnswers: newTotalAnswers,
        score: newScore,
        lastAnsweredAt: new Date()
      })
      .where(and(
        eq(schema.userProgress.userId, userId),
        eq(schema.userProgress.testId, question.testId)
      ));
  } else {
    // Create new progress
    const score = isCorrect ? 100 : 0;
    await db.insert(schema.userProgress).values({
      userId,
      testId: question.testId,
      correctAnswers: isCorrect ? 1 : 0,
      totalAnswers: 1,
      score,
      lastAnsweredAt: new Date()
    });
  }

  return answerResult[0];
}
