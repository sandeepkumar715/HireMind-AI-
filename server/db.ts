import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, 
  Resume, 
  JobDescription, 
  ATSReport, 
  ResumeOptimization, 
  SkillGapAnalysis, 
  InterviewSession, 
  CareerRoadmap, 
  CoverLetter, 
  Feedback, 
  ActivityLog 
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  users: (User & { passwordHash: string; salt: string })[];
  resumes: Resume[];
  jobDescriptions: JobDescription[];
  atsReports: ATSReport[];
  optimizations: ResumeOptimization[];
  skillGaps: SkillGapAnalysis[];
  interviewSessions: InterviewSession[];
  careerRoadmaps: CareerRoadmap[];
  coverLetters: CoverLetter[];
  feedback: Feedback[];
  activityLogs: ActivityLog[];
}

const initialData: Schema = {
  users: [
    {
      id: 'admin-123',
      email: 'admin@smarthire.ai',
      name: 'Admin User',
      role: 'Admin',
      createdAt: new Date().toISOString(),
      headline: 'Lead Technical Recruiter @ SmartHire AI',
      bio: 'Helping candidates find their dream jobs through automated and intelligent feedback systems.',
      passwordHash: '', // Set on load
      salt: '',
    },
    {
      id: 'demo-user',
      email: 'demo@smarthire.ai',
      name: 'Jane Doe',
      role: 'User',
      createdAt: new Date().toISOString(),
      headline: 'Software Engineering Graduate',
      bio: 'Passionate full-stack developer looking to transition from college projects to enterprise systems.',
      targetRole: 'Full Stack Engineer',
      targetIndustry: 'Technology',
      passwordHash: '', // Set on load
      salt: '',
    }
  ],
  resumes: [
    {
      id: 'resume-demo',
      userId: 'demo-user',
      fileName: 'Jane_Doe_Software_Engineer.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString(),
      parsedText: `Jane Doe
jane.doe@email.com | (555) 123-4567 | San Francisco, CA
github.com/janedoe | linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Highly motivated Software Engineering graduate with internship experience building responsive web applications and REST APIs. Proficient in React, JavaScript, Node.js, and Express. Active contributor to open-source and passionate about developing scalable SaaS products.

EDUCATION
University of California, Berkeley - B.S. in Computer Science
Graduation: May 2026

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Bootstrap
Databases & Tools: PostgreSQL, Git, Docker, RESTful APIs

EXPERIENCE
Software Engineer Intern | TechCorp Inc. | May 2025 - Aug 2025
- Designed and built a dynamic customer analytics dashboard using React and Tailwind CSS, improving page load speeds by 25%.
- Developed clean backend API routes in Node.js and Express to handle user session tracking and transaction histories.
- Written test suites with Jest and achieved a 90% code coverage threshold.

Personal Project: TaskManager Pro | Sep 2025 - Dec 2025
- Developed a full-stack project management application with React, Express, and PostgreSQL.
- Implemented JWT authentication and real-time task progress tracking using Socket.io.
- Containerized the application using Docker, facilitating consistent deployment pipelines.`,
      sizeBytes: 125430,
      version: 1
    }
  ],
  jobDescriptions: [
    {
      id: 'jd-demo',
      userId: 'demo-user',
      companyName: 'Stripe',
      jobTitle: 'Frontend Engineer, Dashboard',
      rawText: `Stripe is looking for a Software Engineer to join our Dashboard Foundations team. In this role, you will help design, build, and scale Stripe's core web application used by millions of merchants worldwide.

Minimum Requirements:
- Experience building web applications using React and TypeScript.
- Strong proficiency in modern CSS frameworks like Tailwind CSS.
- Understanding of web performance optimization and bundling strategies (Webpack, Vite).
- Experience working with RESTful APIs or GraphQL.
- High attention to detail and a passion for crafting elegant user interfaces.
- Familiarity with CI/CD, Git, and automated testing.

Bonus Qualifications:
- Experience with full-stack development using Node.js or Ruby.
- Experience with custom chart visualization tools like D3.js or Recharts.`,
      createdAt: new Date().toISOString()
    }
  ],
  atsReports: [],
  optimizations: [],
  skillGaps: [],
  interviewSessions: [],
  careerRoadmaps: [],
  coverLetters: [],
  feedback: [
    {
      id: 'f-1',
      userId: 'demo-user',
      userName: 'Jane Doe',
      message: 'The interactive mock interview with real-time grammar and accuracy feedback is mind-blowing! Absolutely love the clean bento dashboard.',
      rating: 5,
      createdAt: new Date().toISOString()
    }
  ],
  activityLogs: [
    {
      id: 'act-1',
      userId: 'demo-user',
      action: 'User Registered',
      details: 'Account created with email demo@smarthire.ai',
      timestamp: new Date().toISOString()
    }
  ]
};

// Set demo passwords (salted 'password123')
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Write helper
function saveDb(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save DB:', error);
  }
}

// Load database
export function getDb(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Seed password123 for default accounts
      const seeded = { ...initialData };
      seeded.users = seeded.users.map(u => {
        const { hash, salt } = hashPassword('password123');
        return { ...u, passwordHash: hash, salt };
      });
      saveDb(seeded);
      return seeded;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as Schema;
  } catch (error) {
    console.error('Error loading DB, returning in-memory fallback:', error);
    return initialData;
  }
}

// Auth operations
export const dbOps = {
  // Users
  getUserByEmail: (email: string) => {
    const db = getDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById: (id: string) => {
    const db = getDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return undefined;
    // Return copy without sensitive fields
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  },
  createUser: (email: string, name: string, passwordPlain: string): User => {
    const db = getDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already exists');
    }
    const { hash, salt } = hashPassword(passwordPlain);
    const newUser = {
      id: 'u-' + crypto.randomBytes(8).toString('hex'),
      email: email.toLowerCase(),
      name,
      role: 'User' as const,
      createdAt: new Date().toISOString(),
      headline: 'Job Seeker',
      bio: 'Preparing for my next career milestone.',
      passwordHash: hash,
      salt
    };
    db.users.push(newUser);
    saveDb(db);

    // Log activity
    dbOps.logActivity(newUser.id, 'User Registered', `Account created for ${email}`);

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return safeUser;
  },
  authenticateUser: (email: string, passwordPlain: string): User | null => {
    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (verifyPassword(passwordPlain, user.passwordHash, user.salt)) {
      const { passwordHash, salt, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },
  updateProfile: (id: string, updates: Partial<User>): User => {
    const db = getDb();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    db.users[idx] = { ...db.users[idx], ...updates };
    saveDb(db);
    const { passwordHash, salt, ...safeUser } = db.users[idx];
    return safeUser;
  },
  getUsersList: () => {
    const db = getDb();
    return db.users.map(({ passwordHash, salt, ...u }) => u);
  },
  deleteUser: (id: string) => {
    const db = getDb();
    db.users = db.users.filter(u => u.id !== id);
    db.resumes = db.resumes.filter(r => r.userId !== id);
    db.jobDescriptions = db.jobDescriptions.filter(j => j.userId !== id);
    db.atsReports = db.atsReports.filter(a => a.userId !== id);
    db.interviewSessions = db.interviewSessions.filter(i => i.userId !== id);
    db.careerRoadmaps = db.careerRoadmaps.filter(c => c.userId !== id);
    db.coverLetters = db.coverLetters.filter(l => l.userId !== id);
    saveDb(db);
  },

  // Resumes
  getResumes: (userId: string) => {
    const db = getDb();
    return db.resumes.filter(r => r.userId === userId);
  },
  getResumeById: (id: string) => {
    const db = getDb();
    return db.resumes.find(r => r.id === id);
  },
  addResume: (userId: string, fileName: string, fileType: string, parsedText: string, sizeBytes: number): Resume => {
    const db = getDb();
    const newResume: Resume = {
      id: 'res-' + crypto.randomBytes(8).toString('hex'),
      userId,
      fileName,
      fileType,
      uploadDate: new Date().toISOString(),
      parsedText,
      sizeBytes,
      version: 1
    };
    db.resumes.push(newResume);
    saveDb(db);
    dbOps.logActivity(userId, 'Resume Uploaded', `Uploaded resume: ${fileName}`);
    return newResume;
  },

  // Job Descriptions
  addJobDescription: (userId: string, companyName: string, jobTitle: string, rawText: string, url?: string): JobDescription => {
    const db = getDb();
    const newJd: JobDescription = {
      id: 'jd-' + crypto.randomBytes(8).toString('hex'),
      userId,
      companyName,
      jobTitle,
      rawText,
      url,
      createdAt: new Date().toISOString()
    };
    db.jobDescriptions.push(newJd);
    saveDb(db);
    dbOps.logActivity(userId, 'Job Description Added', `Added JD for ${jobTitle} at ${companyName}`);
    return newJd;
  },
  getJobDescriptions: (userId: string) => {
    const db = getDb();
    return db.jobDescriptions.filter(j => j.userId === userId);
  },

  // ATS Reports
  addAtsReport: (report: Omit<ATSReport, 'id' | 'createdAt'>): ATSReport => {
    const db = getDb();
    const newReport: ATSReport = {
      ...report,
      id: 'ats-' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.atsReports.push(newReport);
    saveDb(db);
    dbOps.logActivity(report.userId, 'ATS Analyzed', `Generated ATS Score: ${report.score}%`);
    return newReport;
  },
  getAtsReports: (userId: string) => {
    const db = getDb();
    return db.atsReports.filter(r => r.userId === userId);
  },

  // Optimizations
  addOptimization: (opt: Omit<ResumeOptimization, 'id' | 'createdAt'>): ResumeOptimization => {
    const db = getDb();
    const newOpt: ResumeOptimization = {
      ...opt,
      id: 'opt-' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.optimizations.push(newOpt);
    saveDb(db);
    dbOps.logActivity(opt.userId, 'Resume Optimized', 'Created AI bullets rewrite suggestions');
    return newOpt;
  },
  getOptimizations: (userId: string) => {
    const db = getDb();
    return db.optimizations.filter(o => o.userId === userId);
  },

  // Skill Gaps
  addSkillGap: (gap: Omit<SkillGapAnalysis, 'id' | 'createdAt'>): SkillGapAnalysis => {
    const db = getDb();
    const newGap: SkillGapAnalysis = {
      ...gap,
      id: 'gap-' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.skillGaps.push(newGap);
    saveDb(db);
    dbOps.logActivity(gap.userId, 'Skill Gap Analyzed', `Analyzed gaps, match percentage: ${gap.matchPercentage}%`);
    return newGap;
  },
  getSkillGaps: (userId: string) => {
    const db = getDb();
    return db.skillGaps.filter(s => s.userId === userId);
  },

  // Interview Sessions
  createInterviewSession: (session: Omit<InterviewSession, 'id' | 'createdAt' | 'status' | 'chatHistory' | 'currentQuestionIndex'>): InterviewSession => {
    const db = getDb();
    const newSession: InterviewSession = {
      ...session,
      id: 'int-' + crypto.randomBytes(8).toString('hex'),
      status: 'In-Progress',
      currentQuestionIndex: 0,
      chatHistory: [],
      createdAt: new Date().toISOString()
    };
    db.interviewSessions.push(newSession);
    saveDb(db);
    dbOps.logActivity(session.userId, 'Interview Started', `Mock interview started for ${session.role} (${session.type})`);
    return newSession;
  },
  updateInterviewSession: (id: string, updates: Partial<InterviewSession>): InterviewSession => {
    const db = getDb();
    const idx = db.interviewSessions.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Interview session not found');
    db.interviewSessions[idx] = { ...db.interviewSessions[idx], ...updates };
    saveDb(db);
    return db.interviewSessions[idx];
  },
  getInterviewSessions: (userId: string) => {
    const db = getDb();
    return db.interviewSessions.filter(i => i.userId === userId);
  },
  getInterviewSessionById: (id: string) => {
    const db = getDb();
    return db.interviewSessions.find(i => i.id === id);
  },

  // Career Roadmaps
  addCareerRoadmap: (roadmap: Omit<CareerRoadmap, 'id' | 'createdAt'>): CareerRoadmap => {
    const db = getDb();
    const newRoadmap: CareerRoadmap = {
      ...roadmap,
      id: 'car-' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.careerRoadmaps.push(newRoadmap);
    saveDb(db);
    dbOps.logActivity(roadmap.userId, 'Career Guided', `Generated career advisor plan for ${roadmap.careerPath}`);
    return newRoadmap;
  },
  getCareerRoadmaps: (userId: string) => {
    const db = getDb();
    return db.careerRoadmaps.filter(c => c.userId === userId);
  },

  // Cover Letters
  addCoverLetter: (letter: Omit<CoverLetter, 'id' | 'createdAt'>): CoverLetter => {
    const db = getDb();
    const newLetter: CoverLetter = {
      ...letter,
      id: 'let-' + crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString()
    };
    db.coverLetters.push(newLetter);
    saveDb(db);
    dbOps.logActivity(letter.userId, 'Cover Letter Generated', `Generated letter for ${letter.jobTitle} at ${letter.companyName}`);
    return newLetter;
  },
  getCoverLetters: (userId: string) => {
    const db = getDb();
    return db.coverLetters.filter(l => l.userId === userId);
  },

  // Feedback
  addFeedback: (userId: string, userName: string, message: string, rating: number): Feedback => {
    const db = getDb();
    const newFeedback: Feedback = {
      id: 'f-' + crypto.randomBytes(8).toString('hex'),
      userId,
      userName,
      message,
      rating,
      createdAt: new Date().toISOString()
    };
    db.feedback.push(newFeedback);
    saveDb(db);
    dbOps.logActivity(userId, 'Feedback Submitted', `Rated ${rating} stars`);
    return newFeedback;
  },
  getFeedbackList: () => {
    const db = getDb();
    return db.feedback;
  },

  // Activity Logs
  logActivity: (userId: string, action: string, details: string): ActivityLog => {
    const db = getDb();
    const log: ActivityLog = {
      id: 'act-' + crypto.randomBytes(8).toString('hex'),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    db.activityLogs.push(log);
    // Keep logs list trimmed to last 100 entries for efficiency
    if (db.activityLogs.length > 100) {
      db.activityLogs.shift();
    }
    saveDb(db);
    return log;
  },
  getActivityLogs: (userId?: string) => {
    const db = getDb();
    if (userId) {
      return db.activityLogs.filter(l => l.userId === userId).reverse();
    }
    return db.activityLogs.reverse();
  }
};
