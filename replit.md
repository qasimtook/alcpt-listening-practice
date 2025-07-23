# ALCPT Listening Practice Application

## Overview

This is a full-stack web application designed for ALCPT (American Language Course Placement Test) listening comprehension practice. The application provides an interactive platform where users can practice listening questions with authentic audio, receive immediate feedback, and track their progress.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **API**: RESTful API design with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM (ACTIVE)
- **Connection**: Replit PostgreSQL database with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **File Storage**: Local filesystem for temporary audio files
- **Current Data**: 6 tests with 583 total questions stored in database
- **Storage Type**: Migrated from in-memory to persistent PostgreSQL storage (Jan 2024)

## Key Components

### Database Schema
- **Tests Table**: Stores test metadata (test number, title, description, question count)
- **Questions Table**: Contains question content, answers, explanations, and audio URLs
- **User Progress Table**: Tracks user answers and performance metrics

### ALCPT Test Structure
- **Listening Questions**: Questions 1-66 (require audio generation and playback)
- **Reading/Grammar Questions**: Questions 67+ (text-based, no audio needed)
- **Test Coverage**: 6 complete tests (065-070) with 583 total questions

### Audio Generation System
- **Text-to-Speech**: OpenAI TTS API for generating audio from question text
- **Audio Management**: Temporary file storage with cleanup mechanisms
- **Audio Player**: Custom React component with playback controls and speed adjustment
- **Audio Scope**: Applied only to listening questions (1-66)

### Question Processing
- **Content Formatting**: Google Gemini AI for cleaning and formatting question data
- **Arabic Explanation Generation**: AI-powered Arabic-only explanations for all questions
- **Answer Validation**: Server-side validation of user responses
- **Question Types**: Automatic categorization based on question index (listening vs reading/grammar)

### User Interface Components
- **Audio Player**: Full-featured player with volume, speed, and progress controls (listening questions only)
- **Question Interface**: Interactive question display with multiple choice options
- **Arabic Explanations**: Comprehensive Arabic-only feedback system with structured explanations
- **Progress Tracking**: Visual feedback and performance analytics
- **Help System**: Integrated help modal with usage instructions
- **Test Navigation**: Clear test identification (Test XXX - Question YY format)

## Data Flow

1. **Question Loading**: Questions are loaded from JSON files or database
2. **Audio Generation**: Question text is converted to audio using OpenAI TTS
3. **User Interaction**: Users listen to audio and select answers
4. **Answer Submission**: Responses are validated and feedback is generated
5. **Progress Tracking**: User performance is recorded and analyzed

## External Dependencies

### AI Services
- **OpenAI**: Text-to-speech generation for audio content
- **Google Gemini**: Question formatting and explanation generation

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent icon library

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Database**: Connected to remote PostgreSQL instance
- **Environment Variables**: API keys and database credentials

### Production Build
- **Frontend**: Static build output served by Express
- **Backend**: Bundled Node.js application with ESM modules
- **Database**: Migrations applied via Drizzle Kit
- **Audio Storage**: Temporary files with automatic cleanup

### Environment Configuration
- **Database URL**: PostgreSQL connection string
- **API Keys**: OpenAI and Gemini API credentials
- **Build Scripts**: Separate development and production workflows

The application follows a monorepo structure with shared TypeScript schemas and utilities, enabling type safety across the entire stack. The architecture prioritizes developer experience with fast hot-reload, type safety, and modern tooling while maintaining a simple deployment model suitable for educational environments.