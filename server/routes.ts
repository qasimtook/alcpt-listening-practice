import { Router } from 'express';
import { 
  getAllTests, 
  getTestById, 
  getAllQuestions, 
  getQuestionById,
  getUserProfile,
  updateUserProfile,
  submitAnswer,
  getUserProgress 
} from './storage.js';

const router = Router();

// Test routes
router.get('/tests', async (req, res) => {
  try {
    const tests = await getAllTests();
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

router.get('/tests/:id', async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const test = await getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// Question routes
router.get('/questions', async (req, res) => {
  try {
    const testId = req.query.testId ? parseInt(req.query.testId as string) : undefined;
    const questions = await getAllQuestions(testId);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.get('/questions/:id', async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const question = await getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// User routes
router.get('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;
    const profile = await updateUserProfile(userId, updates);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Progress routes
router.get('/progress/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const testId = req.query.testId ? parseInt(req.query.testId as string) : undefined;
    const progress = await getUserProgress(userId, testId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.post('/submit-answer', async (req, res) => {
  try {
    const { userId, questionId, answer, isCorrect } = req.body;
    const result = await submitAnswer(userId, questionId, answer, isCorrect);
    res.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
