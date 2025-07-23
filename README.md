# ALCPT Listening Practice Application

A comprehensive web application for ALCPT (American Language Course Placement Test) listening comprehension practice. Features AI-powered audio generation, intelligent question management, and optimized performance through advanced caching systems.

## 🚀 Features

### Core Functionality
- **6 Complete ALCPT Tests**: Tests 065-070 with 583 total questions
- **Intelligent Question Types**: Automatic detection of listening (1-66) vs reading/grammar (67+) questions
- **AI-Powered Audio**: OpenAI TTS with "alloy" voice for natural speech generation
- **Arabic Explanations**: Comprehensive Arabic-only feedback system powered by Google Gemini AI
- **Progress Tracking**: User performance analytics and learning insights

### Performance Optimizations
- **Permanent Audio Storage**: Files generated once and cached permanently
- **Database Caching**: AI-generated content stored to prevent regeneration
- **Smart API Usage**: Massive reduction in external API costs
- **Fast Loading**: Optimized with consistent file naming and database tracking

### User Experience
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Modern UI**: Clean design with shadcn/ui components and Radix UI primitives
- **User Authentication**: Secure login with Replit Auth integration
- **Real-time Feedback**: Immediate answer validation and explanations
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling
- **shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout the stack
- **PostgreSQL** with Drizzle ORM
- **Session management** with database storage

### AI Services
- **OpenAI TTS** for audio generation
- **Google Gemini** for content formatting and explanations

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── services/           # External API integrations
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database configuration
├── shared/                 # Shared TypeScript schemas
├── data/                   # Question data files
└── audio_storage/          # Permanent audio file cache
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Google Gemini API key

### Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
```

### Installation
```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

## 🎯 Question Types

### Listening Questions (1-66)
- Audio generation with OpenAI TTS
- Interactive audio player with speed controls
- Blue "Listening" badge for easy identification
- Replay functionality

### Reading & Grammar Questions (67+)
- Text-based questions without audio
- Green "Reading & Grammar" badge
- Optimized layout for reading comprehension

## 🔧 Performance Features

### Audio Optimization
- **One-time Generation**: Audio files created once per question
- **Permanent Storage**: Files cached indefinitely in `audio_storage/`
- **Consistent Naming**: `question_{id}.mp3` format for reliable access
- **Database Tracking**: Audio URLs stored to prevent regeneration

### Content Caching
- **AI Explanations**: Arabic explanations cached in database
- **Formatted Questions**: Processed content stored permanently
- **Smart Loading**: Check cache before calling external APIs

### Cost Reduction
- **90%+ API Cost Savings**: Through comprehensive caching
- **Faster Response Times**: Serve cached content immediately
- **Scalable Architecture**: Handles growing user base efficiently

## 📊 Database Schema

### Core Tables
- **tests**: Test metadata and configuration
- **questions**: Question content, answers, and explanations
- **users**: User authentication and profile data
- **user_progress**: Performance tracking and analytics
- **sessions**: Secure session management

## 🌟 Key Benefits

1. **Educational Impact**: Authentic ALCPT practice experience
2. **Cost Efficiency**: Permanent caching reduces operational costs
3. **Performance**: Fast loading and responsive user experience
4. **Scalability**: Architecture supports growing user base
5. **Accessibility**: Multi-language support with Arabic explanations

## 🔐 Security

- Secure user authentication with Replit Auth
- Session management with PostgreSQL storage
- Environment variable protection for API keys
- HTTPS-ready configuration

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Touch-friendly interface for tablets and phones
- Adaptive layouts for different screen sizes
- Consistent experience across devices

## 🎨 UI/UX Features

- **Visual Feedback**: Color-coded question types and status
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Loading States**: Smooth transitions and progress indicators
- **Error Handling**: Clear error messages and recovery options

## 🚀 Deployment

The application is optimized for deployment on Replit with automatic:
- Environment configuration
- Database connection
- Static file serving
- Session management

## 📈 Future Enhancements

- Additional ALCPT test sets
- Advanced analytics dashboard
- Offline mode capabilities
- Multi-language interface
- Social learning features

---

Built with ❤️ for effective ALCPT preparation