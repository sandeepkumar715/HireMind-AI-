/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'User' | 'Admin';
  createdAt: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  targetRole?: string;
  targetIndustry?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  parsedText: string;
  sizeBytes: number;
  version: number;
}

export interface JobDescription {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  rawText: string;
  url?: string;
  createdAt: string;
}

export interface WeakSection {
  section: string;
  suggestions: string[];
}

export interface ATSReport {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId?: string;
  score: number;
  formattingScore: number;
  keywordScore: number;
  technicalSkills: string[];
  softSkills: string[];
  grammarScore: number;
  missingKeywords: string[];
  strengthSummary: string;
  weakSections: WeakSection[];
  suggestions: string[];
  createdAt: string;
}

export interface BulletPointOptimization {
  original: string;
  optimized: string;
  starMethod: {
    situationTask: string;
    action: string;
    result: string;
  };
}

export interface ResumeOptimization {
  id: string;
  userId: string;
  resumeId: string;
  summary: string;
  bulletPoints: BulletPointOptimization[];
  experienceSuggestions: string[];
  projectSuggestions: string[];
  createdAt: string;
}

export interface SkillRoadmapItem {
  skill: string;
  type: 'Technical' | 'Soft' | 'Framework' | 'Library' | 'Certification';
  importance: 'High' | 'Medium' | 'Low';
  resources: { name: string; url: string; duration: string }[];
  estimatedHours: number;
}

export interface SkillGapAnalysis {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  roadmap: SkillRoadmapItem[];
  overallAdvice: string;
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'Situational' | 'CompanySpecific';
  expectedKeywords: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'AI' | 'User';
  text: string;
  timestamp: string;
  evaluation?: {
    communicationScore: number;
    confidence: number;
    technicalAccuracy: number;
    grammar: number;
    suggestions: string;
    followUp?: string;
  };
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: 'HR' | 'Technical' | 'Behavioral' | 'Situational' | 'CompanySpecific';
  role: string;
  company: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'In-Progress' | 'Completed';
  questions: Question[];
  currentQuestionIndex: number;
  chatHistory: ChatMessage[];
  overallPerformance?: {
    score: number;
    summary: string;
    recommendations: string[];
  };
  createdAt: string;
}

export interface RecommendedProject {
  name: string;
  description: string;
  techStack: string[];
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  careerPath: string;
  salaryEstimate: string;
  learningRoadmap: string[];
  recommendedProjects: RecommendedProject[];
  recommendedCertifications: string[];
  portfolioSuggestions: string[];
  linkedinSuggestions: string[];
  githubSuggestions: string[];
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string;
  companyName: string;
  jobTitle: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  message: string;
  rating: number;
  createdAt: string;
}
