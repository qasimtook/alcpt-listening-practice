import { pgTable, text, serial, integer, boolean, json, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  testNumber: text("test_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  questionCount: integer("question_count").notNull(),
  duration: text("duration"),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => tests.id),
  questionIndex: integer("question_index").notNull(),
  questionType: text("question_type").notNull().default("listening"),
  questionText: text("question_text").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  otherOptions: json("other_options").$type<string[]>().notNull(),
  explanation: text("explanation"),
  arabicExplanation: json("arabic_explanation"),
  audioUrl: text("audio_url"),
});

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  testId: integer("test_id").references(() => tests.id),
  questionId: integer("question_id").references(() => questions.id),
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  answeredAt: text("answered_at"),
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// API Response types
export const answerSubmissionSchema = z.object({
  questionId: z.number(),
  selectedAnswer: z.string(),
});

export const feedbackResponseSchema = z.object({
  isCorrect: z.boolean(),
  correctAnswer: z.string(),
  arabicExplanation: z.any().optional(),
  selectedAnswer: z.string(),
});

export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>;
export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;
