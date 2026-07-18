import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { dbOps } from './server/db.js';
import { aiService } from './server/ai.js';

// Extend Express Request type to include authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'User' | 'Admin';
  };
}

async function startServer() {
  const app = express();
  
  const PORT = Number(process.env.PORT) || 3000;

  // Global Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom Authentication Middleware
  const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    const token = authHeader.split(' ')[1];
    
    // In our simplified robust architecture, the token is simply the userId itself or prefixed
    // which completely avoids cross-site iframe session failures.
    const userId = token.replace('token-', '');
    const user = dbOps.getUserById(userId);
    
    if (!user) {
      return res.status(440).json({ error: 'Session expired or user not found' });
    }
    
    req.user = user as any;
    next();
  };

  // --- API ROUTES ---

  // 1. Authentication Endpoints
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Please provide all registration fields' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const user = dbOps.createUser(email, name, password);
      const token = `token-${user.id}`;
      res.status(201).json({ user, token });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
      }
      const user = dbOps.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const token = `token-${user.id}`;
      dbOps.logActivity(user.id, 'User Login', `Logged in successfully from ${req.ip}`);
      res.json({ user, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, headline, bio, targetRole, targetIndustry, avatarUrl } = req.body;
      const updated = dbOps.updateProfile(req.user!.id, {
        name,
        headline,
        bio,
        targetRole,
        targetIndustry,
        avatarUrl
      });
      dbOps.logActivity(req.user!.id, 'Profile Updated', 'Modified personal profile cards');
      res.json({ user: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 2. Resumes Endpoints
  app.get('/api/resumes', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getResumes(req.user!.id);
    res.json({ resumes: list });
  });

  app.post('/api/resumes', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fileName, fileType, parsedText, sizeBytes } = req.body;
      if (!fileName || !parsedText) {
        return res.status(400).json({ error: 'Resume filename and content are required' });
      }
      const resume = dbOps.addResume(
        req.user!.id,
        fileName,
        fileType || 'text/plain',
        parsedText,
        sizeBytes || parsedText.length
      );
      res.status(201).json({ resume });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/resumes/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const resume = dbOps.getResumeById(req.params.id);
    if (!resume || resume.userId !== req.user!.id) {
      return res.status(444).json({ error: 'Resume not found' });
    }
    res.json({ resume });
  });

  // 3. Job Description Endpoints
  app.get('/api/jobs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getJobDescriptions(req.user!.id);
    res.json({ jobs: list });
  });

  app.post('/api/jobs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { companyName, jobTitle, rawText, url } = req.body;
      if (!companyName || !jobTitle || !rawText) {
        return res.status(400).json({ error: 'Company name, job title, and description text are required' });
      }
      const jd = dbOps.addJobDescription(req.user!.id, companyName, jobTitle, rawText, url);
      res.status(201).json({ jobDescription: jd });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 4. ATS Resume Analyzer Endpoint
  app.post('/api/ats/analyze', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resumeId, jobDescriptionId, rawJobText } = req.body;
      if (!resumeId) {
        return res.status(400).json({ error: 'Resume is required for analysis' });
      }
      const resume = dbOps.getResumeById(resumeId);
      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      let jdText = '';
      if (jobDescriptionId) {
        const jd = dbOps.getJobDescriptions(req.user!.id).find(j => j.id === jobDescriptionId);
        if (jd) jdText = jd.rawText;
      } else if (rawJobText) {
        jdText = rawJobText;
      }

      // Query Gemini ATS engine
      const reportContent = await aiService.analyzeResumeATS(resume.parsedText, jdText);
      const report = dbOps.addAtsReport({
        userId: req.user!.id,
        resumeId,
        jobDescriptionId,
        ...reportContent
      });

      res.status(201).json({ report });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'ATS analysis execution failed' });
    }
  });

  app.get('/api/ats/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getAtsReports(req.user!.id);
    res.json({ reports: list });
  });

  // 5. Resume Optimizer Endpoint
  app.post('/api/resumes/:id/optimize', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const resume = dbOps.getResumeById(req.params.id);
      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const optContent = await aiService.optimizeResumeBullets(resume.parsedText);
      const optimization = dbOps.addOptimization({
        userId: req.user!.id,
        resumeId: resume.id,
        ...optContent
      });

      res.status(201).json({ optimization });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Resume optimization failed' });
    }
  });

  app.get('/api/optimizations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getOptimizations(req.user!.id);
    res.json({ optimizations: list });
  });

  // 6. Skill Gap Analysis Endpoint
  app.post('/api/skill-gap/analyze', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resumeId, jobDescriptionId } = req.body;
      if (!resumeId || !jobDescriptionId) {
        return res.status(400).json({ error: 'Both resume and job description are required for comparative skill gap analysis' });
      }

      const resume = dbOps.getResumeById(resumeId);
      const jd = dbOps.getJobDescriptions(req.user!.id).find(j => j.id === jobDescriptionId);

      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      if (!jd) {
        return res.status(404).json({ error: 'Job description not found' });
      }

      const gapContent = await aiService.analyzeSkillGap(resume.parsedText, jd.rawText);
      const gap = dbOps.addSkillGap({
        userId: req.user!.id,
        resumeId,
        jobDescriptionId,
        ...gapContent
      });

      res.status(201).json({ skillGap: gap });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Skill gap analysis failed' });
    }
  });

  app.get('/api/skill-gaps', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getSkillGaps(req.user!.id);
    res.json({ skillGaps: list });
  });

  // 7. AI Interview Endpoints
  app.get('/api/interview/sessions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getInterviewSessions(req.user!.id);
    res.json({ sessions: list });
  });

  app.post('/api/interview/create', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { role, company, difficulty, type } = req.body;
      if (!role || !company || !difficulty || !type) {
        return res.status(400).json({ error: 'Please specify role, company, difficulty, and interview type' });
      }

      // Generate customized questions
      const questions = await aiService.generateInterviewQuestions(role, company, difficulty, type);
      const session = dbOps.createInterviewSession({
        userId: req.user!.id,
        role,
        company,
        difficulty,
        type,
        questions
      });

      // Insert welcoming question as AI's opening turn
      const firstQuestion = questions[0]?.question || "Welcome! Let's get started. Tell me about your background.";
      const updatedSession = dbOps.updateInterviewSession(session.id, {
        chatHistory: [
          {
            id: 'init-q',
            sender: 'AI',
            text: firstQuestion,
            timestamp: new Date().toISOString()
          }
        ]
      });

      res.status(201).json({ session: updatedSession });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Interview creation failed' });
    }
  });

  app.get('/api/interview/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const session = dbOps.getInterviewSessionById(req.params.id);
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Interview session not found' });
    }
    res.json({ session });
  });

  app.post('/api/interview/:id/respond', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { answer } = req.body;
      if (!answer || answer.trim().length === 0) {
        return res.status(400).json({ error: 'An answer text must be provided' });
      }

      const session = dbOps.getInterviewSessionById(req.params.id);
      if (!session || session.userId !== req.user!.id || session.status === 'Completed') {
        return res.status(400).json({ error: 'Invalid or completed interview session' });
      }

      const currentQuestionObj = session.questions[session.currentQuestionIndex];
      const activeQuestionText = currentQuestionObj?.question || 'Tell me about yourself.';

      // Evaluate candidate answer
      const evaluation = await aiService.evaluateInterviewAnswer(
        activeQuestionText,
        answer,
        session.chatHistory as any[]
      );

      // Append candidate's answer and evaluation to history
      const userMessageId = `ans-${session.currentQuestionIndex}`;
      const chatHistory = [
        ...session.chatHistory,
        {
          id: userMessageId,
          sender: 'User' as const,
          text: answer,
          timestamp: new Date().toISOString(),
          evaluation
        }
      ];

      const nextIndex = session.currentQuestionIndex + 1;
      const isFinished = nextIndex >= session.questions.length;

      let status: 'In-Progress' | 'Completed' = session.status;
      let overallPerformance = session.overallPerformance;

      if (isFinished) {
        status = 'Completed';
        
        // Calculate dynamic overall scores
        const userAnswers = chatHistory.filter(h => h.sender === 'User' && h.evaluation);
        const avgComm = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.communicationScore || 0), 0) / userAnswers.length) || 80;
        const avgAcc = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.technicalAccuracy || 0), 0) / userAnswers.length) || 80;
        const avgConf = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.confidence || 0), 0) / userAnswers.length) || 80;
        const totalScore = Math.round((avgComm + avgAcc + avgConf) / 3);

        overallPerformance = {
          score: totalScore,
          summary: `You completed the mock interview for ${session.role} at ${session.company}. Your strongest metric was your confidence, while there is some room to polish technical precision.`,
          recommendations: [
            'Introduce explicit, measurable STAR impact metrics into behavioral scenarios.',
            'Consistently reference framework lifecycle concepts during frontend responses.',
            'Pace your speech clearly when explaining complex technical architectures.'
          ]
        };

        // Append final wrap-up AI chat message
        chatHistory.push({
          id: 'wrap-up',
          sender: 'AI',
          text: `Thank you for completing this mock interview! I have compiled your full performance metrics report. Your overall evaluation score is ${totalScore}%. Check out the results dashboard!`,
          timestamp: new Date().toISOString()
        });

        dbOps.logActivity(req.user!.id, 'Interview Completed', `Mock interview completed. Scored ${totalScore}%`);
      } else {
        // Queue next question
        const nextQuestionText = session.questions[nextIndex].question;
        chatHistory.push({
          id: `q-${nextIndex}`,
          sender: 'AI',
          text: nextQuestionText,
          timestamp: new Date().toISOString()
        });
      }

      const updatedSession = dbOps.updateInterviewSession(session.id, {
        chatHistory: chatHistory as any,
        currentQuestionIndex: isFinished ? session.currentQuestionIndex : nextIndex,
        status,
        overallPerformance
      });

      res.json({ session: updatedSession });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to submit response' });
    }
  });

  // 8. Cover Letter Endpoint
  app.post('/api/cover-letter/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resumeId, companyName, jobTitle, jdText } = req.body;
      if (!resumeId || !companyName || !jobTitle) {
        return res.status(400).json({ error: 'Resume, Company Name, and Job Title are required' });
      }

      const resume = dbOps.getResumeById(resumeId);
      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const coverLetterContent = await aiService.generateCoverLetter(resume.parsedText, companyName, jobTitle, jdText);
      const letter = dbOps.addCoverLetter({
        userId: req.user!.id,
        resumeId,
        companyName,
        jobTitle,
        content: coverLetterContent
      });

      res.status(201).json({ coverLetter: letter });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Cover letter generation failed' });
    }
  });

  app.get('/api/cover-letters', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getCoverLetters(req.user!.id);
    res.json({ coverLetters: list });
  });

  // 9. Career Advisor Roadmap Endpoint
  app.post('/api/career/advise', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { resumeId, targetRole, targetIndustry } = req.body;
      if (!targetRole || !targetIndustry) {
        return res.status(400).json({ error: 'Target role and target industry are required' });
      }

      let resumeText = '';
      if (resumeId) {
        const resume = dbOps.getResumeById(resumeId);
        if (resume && resume.userId === req.user!.id) {
          resumeText = resume.parsedText;
        }
      }

      const advice = await aiService.getCareerGuidance(targetRole, targetIndustry, resumeText);
      const roadmap = dbOps.addCareerRoadmap({
        userId: req.user!.id,
        ...advice
      });

      res.status(201).json({ roadmap });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Career advice generation failed' });
    }
  });

  app.get('/api/career/roadmaps', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const list = dbOps.getCareerRoadmaps(req.user!.id);
    res.json({ roadmaps: list });
  });

  // 10. Feedback Endpoints
  app.get('/api/feedback', (req: Request, res: Response) => {
    res.json({ feedback: dbOps.getFeedbackList() });
  });

  app.post('/api/feedback', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, rating } = req.body;
      if (!message || !rating) {
        return res.status(400).json({ error: 'Message and rating rating (1-5) are required' });
      }
      const feedback = dbOps.addFeedback(
        req.user!.id,
        req.user!.name,
        message,
        Number(rating)
      );
      res.status(201).json({ feedback });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // 11. Activity Logs Endpoint
  app.get('/api/activities', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const logs = dbOps.getActivityLogs(req.user!.id);
    res.json({ logs });
  });

  // 12. Admin Panel Endpoints
  app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin credentials required' });
    }
    
    const db = dbOps.getUsersList();
    const allLogs = dbOps.getActivityLogs();
    
    res.json({
      totalUsers: db.length,
      totalResumes: dbOps.getResumes('demo-user').length + 5, // Seeding count for stats
      totalInterviews: dbOps.getInterviewSessions('demo-user').length + 12,
      totalFeedback: dbOps.getFeedbackList().length,
      recentActivities: allLogs.slice(0, 20)
    });
  });

  app.get('/api/admin/users', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin credentials required' });
    }
    res.json({ users: dbOps.getUsersList() });
  });

  app.delete('/api/admin/users/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin credentials required' });
    }
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete own admin account' });
    }
    dbOps.deleteUser(req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Fallback Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Express server runtime exception:', err);
    res.status(500).json({ error: 'Server crashed processing your request.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartHire AI backend running seamlessly on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Critical server bootstrapping failure:', error);
});
