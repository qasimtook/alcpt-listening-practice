import { pgTable, serial, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

// Tests table
export const tests = pgTable('tests', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  totalQuestions: integer('total_questions').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Questions table
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  testId: integer('test_id').references(() => tests.id).notNull(),
  questionNumber: integer('question_number').notNull(),
  text: text('text').notNull(),
  options: text('options').array().notNull(), // JSON array of options
  correctAnswer: varchar('correct_answer', { length: 1 }).notNull(), // A, B, C, or D
  audioPath: varchar('audio_path', { length: 255 }), // Path to audio file
  arabicExplanation: text('arabic_explanation'), // Arabic explanation
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // User ID from auth system
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
});

// User progress table
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id).notNull(),
  testId: integer('test_id').references(() => tests.id).notNull(),
  correctAnswers: integer('correct_answers').notNull().default(0),
  totalAnswers: integer('total_answers').notNull().default(0),
  score: integer('score').notNull().default(0), // Percentage
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastAnsweredAt: timestamp('last_answered_at').defaultNow(),
});

// User answers table
export const userAnswers = pgTable('user_answers', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id).notNull(),
  questionId: integer('question_id').references(() => questions.id).notNull(),
  answer: varchar('answer', { length: 1 }).notNull(), // A, B, C, or D
  isCorrect: boolean('is_correct').notNull(),
  answeredAt: timestamp('answered_at').defaultNow().notNull(),
});

// Type exports
export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;
