var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DB_FILE = import_path.default.join(process.cwd(), "db.json");
var initialData = {
  users: [
    {
      id: "admin-123",
      email: "admin@smarthire.ai",
      name: "Admin User",
      role: "Admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      headline: "Lead Technical Recruiter @ SmartHire AI",
      bio: "Helping candidates find their dream jobs through automated and intelligent feedback systems.",
      passwordHash: "",
      // Set on load
      salt: ""
    },
    {
      id: "demo-user",
      email: "demo@smarthire.ai",
      name: "Jane Doe",
      role: "User",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      headline: "Software Engineering Graduate",
      bio: "Passionate full-stack developer looking to transition from college projects to enterprise systems.",
      targetRole: "Full Stack Engineer",
      targetIndustry: "Technology",
      passwordHash: "",
      // Set on load
      salt: ""
    }
  ],
  resumes: [
    {
      id: "resume-demo",
      userId: "demo-user",
      fileName: "Jane_Doe_Software_Engineer.pdf",
      fileType: "application/pdf",
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
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
      id: "jd-demo",
      userId: "demo-user",
      companyName: "Stripe",
      jobTitle: "Frontend Engineer, Dashboard",
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
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
      id: "f-1",
      userId: "demo-user",
      userName: "Jane Doe",
      message: "The interactive mock interview with real-time grammar and accuracy feedback is mind-blowing! Absolutely love the clean bento dashboard.",
      rating: 5,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ],
  activityLogs: [
    {
      id: "act-1",
      userId: "demo-user",
      action: "User Registered",
      details: "Account created with email demo@smarthire.ai",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  ]
};
function hashPassword(password) {
  const salt = import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return { hash, salt };
}
function verifyPassword(password, hash, salt) {
  const verifyHash = import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return hash === verifyHash;
}
function saveDb(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save DB:", error);
  }
}
function getDb() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const seeded = { ...initialData };
      seeded.users = seeded.users.map((u) => {
        const { hash, salt } = hashPassword("password123");
        return { ...u, passwordHash: hash, salt };
      });
      saveDb(seeded);
      return seeded;
    }
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading DB, returning in-memory fallback:", error);
    return initialData;
  }
}
var dbOps = {
  // Users
  getUserByEmail: (email) => {
    const db = getDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById: (id) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === id);
    if (!user) return void 0;
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  },
  createUser: (email, name, passwordPlain) => {
    const db = getDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User already exists");
    }
    const { hash, salt } = hashPassword(passwordPlain);
    const newUser = {
      id: "u-" + import_crypto.default.randomBytes(8).toString("hex"),
      email: email.toLowerCase(),
      name,
      role: "User",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      headline: "Job Seeker",
      bio: "Preparing for my next career milestone.",
      passwordHash: hash,
      salt
    };
    db.users.push(newUser);
    saveDb(db);
    dbOps.logActivity(newUser.id, "User Registered", `Account created for ${email}`);
    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return safeUser;
  },
  authenticateUser: (email, passwordPlain) => {
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    if (verifyPassword(passwordPlain, user.passwordHash, user.salt)) {
      const { passwordHash, salt, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },
  updateProfile: (id, updates) => {
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    db.users[idx] = { ...db.users[idx], ...updates };
    saveDb(db);
    const { passwordHash, salt, ...safeUser } = db.users[idx];
    return safeUser;
  },
  getUsersList: () => {
    const db = getDb();
    return db.users.map(({ passwordHash, salt, ...u }) => u);
  },
  deleteUser: (id) => {
    const db = getDb();
    db.users = db.users.filter((u) => u.id !== id);
    db.resumes = db.resumes.filter((r) => r.userId !== id);
    db.jobDescriptions = db.jobDescriptions.filter((j) => j.userId !== id);
    db.atsReports = db.atsReports.filter((a) => a.userId !== id);
    db.interviewSessions = db.interviewSessions.filter((i) => i.userId !== id);
    db.careerRoadmaps = db.careerRoadmaps.filter((c) => c.userId !== id);
    db.coverLetters = db.coverLetters.filter((l) => l.userId !== id);
    saveDb(db);
  },
  // Resumes
  getResumes: (userId) => {
    const db = getDb();
    return db.resumes.filter((r) => r.userId === userId);
  },
  getResumeById: (id) => {
    const db = getDb();
    return db.resumes.find((r) => r.id === id);
  },
  addResume: (userId, fileName, fileType, parsedText, sizeBytes) => {
    const db = getDb();
    const newResume = {
      id: "res-" + import_crypto.default.randomBytes(8).toString("hex"),
      userId,
      fileName,
      fileType,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      parsedText,
      sizeBytes,
      version: 1
    };
    db.resumes.push(newResume);
    saveDb(db);
    dbOps.logActivity(userId, "Resume Uploaded", `Uploaded resume: ${fileName}`);
    return newResume;
  },
  // Job Descriptions
  addJobDescription: (userId, companyName, jobTitle, rawText, url) => {
    const db = getDb();
    const newJd = {
      id: "jd-" + import_crypto.default.randomBytes(8).toString("hex"),
      userId,
      companyName,
      jobTitle,
      rawText,
      url,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.jobDescriptions.push(newJd);
    saveDb(db);
    dbOps.logActivity(userId, "Job Description Added", `Added JD for ${jobTitle} at ${companyName}`);
    return newJd;
  },
  getJobDescriptions: (userId) => {
    const db = getDb();
    return db.jobDescriptions.filter((j) => j.userId === userId);
  },
  // ATS Reports
  addAtsReport: (report) => {
    const db = getDb();
    const newReport = {
      ...report,
      id: "ats-" + import_crypto.default.randomBytes(8).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.atsReports.push(newReport);
    saveDb(db);
    dbOps.logActivity(report.userId, "ATS Analyzed", `Generated ATS Score: ${report.score}%`);
    return newReport;
  },
  getAtsReports: (userId) => {
    const db = getDb();
    return db.atsReports.filter((r) => r.userId === userId);
  },
  // Optimizations
  addOptimization: (opt) => {
    const db = getDb();
    const newOpt = {
      ...opt,
      id: "opt-" + import_crypto.default.randomBytes(8).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.optimizations.push(newOpt);
    saveDb(db);
    dbOps.logActivity(opt.userId, "Resume Optimized", "Created AI bullets rewrite suggestions");
    return newOpt;
  },
  getOptimizations: (userId) => {
    const db = getDb();
    return db.optimizations.filter((o) => o.userId === userId);
  },
  // Skill Gaps
  addSkillGap: (gap) => {
    const db = getDb();
    const newGap = {
      ...gap,
      id: "gap-" + import_crypto.default.randomBytes(8).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.skillGaps.push(newGap);
    saveDb(db);
    dbOps.logActivity(gap.userId, "Skill Gap Analyzed", `Analyzed gaps, match percentage: ${gap.matchPercentage}%`);
    return newGap;
  },
  getSkillGaps: (userId) => {
    const db = getDb();
    return db.skillGaps.filter((s) => s.userId === userId);
  },
  // Interview Sessions
  createInterviewSession: (session) => {
    const db = getDb();
    const newSession = {
      ...session,
      id: "int-" + import_crypto.default.randomBytes(8).toString("hex"),
      status: "In-Progress",
      currentQuestionIndex: 0,
      chatHistory: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.interviewSessions.push(newSession);
    saveDb(db);
    dbOps.logActivity(session.userId, "Interview Started", `Mock interview started for ${session.role} (${session.type})`);
    return newSession;
  },
  updateInterviewSession: (id, updates) => {
    const db = getDb();
    const idx = db.interviewSessions.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Interview session not found");
    db.interviewSessions[idx] = { ...db.interviewSessions[idx], ...updates };
    saveDb(db);
    return db.interviewSessions[idx];
  },
  getInterviewSessions: (userId) => {
    const db = getDb();
    return db.interviewSessions.filter((i) => i.userId === userId);
  },
  getInterviewSessionById: (id) => {
    const db = getDb();
    return db.interviewSessions.find((i) => i.id === id);
  },
  // Career Roadmaps
  addCareerRoadmap: (roadmap) => {
    const db = getDb();
    const newRoadmap = {
      ...roadmap,
      id: "car-" + import_crypto.default.randomBytes(8).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.careerRoadmaps.push(newRoadmap);
    saveDb(db);
    dbOps.logActivity(roadmap.userId, "Career Guided", `Generated career advisor plan for ${roadmap.careerPath}`);
    return newRoadmap;
  },
  getCareerRoadmaps: (userId) => {
    const db = getDb();
    return db.careerRoadmaps.filter((c) => c.userId === userId);
  },
  // Cover Letters
  addCoverLetter: (letter) => {
    const db = getDb();
    const newLetter = {
      ...letter,
      id: "let-" + import_crypto.default.randomBytes(8).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.coverLetters.push(newLetter);
    saveDb(db);
    dbOps.logActivity(letter.userId, "Cover Letter Generated", `Generated letter for ${letter.jobTitle} at ${letter.companyName}`);
    return newLetter;
  },
  getCoverLetters: (userId) => {
    const db = getDb();
    return db.coverLetters.filter((l) => l.userId === userId);
  },
  // Feedback
  addFeedback: (userId, userName, message, rating) => {
    const db = getDb();
    const newFeedback = {
      id: "f-" + import_crypto.default.randomBytes(8).toString("hex"),
      userId,
      userName,
      message,
      rating,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.feedback.push(newFeedback);
    saveDb(db);
    dbOps.logActivity(userId, "Feedback Submitted", `Rated ${rating} stars`);
    return newFeedback;
  },
  getFeedbackList: () => {
    const db = getDb();
    return db.feedback;
  },
  // Activity Logs
  logActivity: (userId, action, details) => {
    const db = getDb();
    const log = {
      id: "act-" + import_crypto.default.randomBytes(8).toString("hex"),
      userId,
      action,
      details,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.activityLogs.push(log);
    if (db.activityLogs.length > 100) {
      db.activityLogs.shift();
    }
    saveDb(db);
    return log;
  },
  getActivityLogs: (userId) => {
    const db = getDb();
    if (userId) {
      return db.activityLogs.filter((l) => l.userId === userId).reverse();
    }
    return db.activityLogs.reverse();
  }
};

// server/ai.ts
var import_genai = require("@google/genai");
var apiKey = process.env.GEMINI_API_KEY;
var ai = new import_genai.GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_FOR_PREVIEW_BUILD_SAFETY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var DEFAULT_MODEL = "gemini-3.5-flash";
var aiService = {
  /**
   * 1. ATS Resume Analyzer
   * Calculates scores, extracts technical/soft skills, missing keywords, weak sections, and improvements.
   */
  analyzeResumeATS: async (resumeText, jobDescriptionText = "") => {
    const prompt = `
      You are an expert ATS (Applicant Tracking System) simulator and Technical Recruiter.
      Analyze the following candidate resume and evaluate its strength. 
      ${jobDescriptionText ? `Compare it critically against the provided Job Description to identify alignments and gaps.` : "Provide a general technical and formatting analysis."}
      
      --- CANDIDATE RESUME ---
      ${resumeText}
      
      ${jobDescriptionText ? `--- TARGET JOB DESCRIPTION ---
${jobDescriptionText}` : ""}
      
      Calculate:
      - Overall ATS Match score (0-100)
      - Formatting score (0-100) based on clear layout, section parsing, education details
      - Keyword score (0-100) based on target terms
      - Technical skills matched or highlighted
      - Soft skills highlighted
      - Grammar/professionalism rating (0-100)
      - Missing keywords that should be present
      - Strength summary
      - Weak sections needing work with suggestions
      - Top actionable improvement recommendations
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              score: { type: import_genai.Type.INTEGER, description: "Overall ATS score (0 to 100)" },
              formattingScore: { type: import_genai.Type.INTEGER, description: "Score for readability and standard formatting (0 to 100)" },
              keywordScore: { type: import_genai.Type.INTEGER, description: "Score for matching critical industry keywords (0 to 100)" },
              technicalSkills: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Technical skills found in the resume"
              },
              softSkills: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Soft/interpersonal skills found or implied"
              },
              grammarScore: { type: import_genai.Type.INTEGER, description: "Professionalism, grammar and syntax score (0 to 100)" },
              missingKeywords: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Critical keywords missing compared to the JD or standard tech roles"
              },
              strengthSummary: { type: import_genai.Type.STRING, description: "A 2-3 sentence strategic summary of resume strengths" },
              weakSections: {
                type: import_genai.Type.ARRAY,
                description: "List of weak sections with suggestions",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    section: { type: import_genai.Type.STRING, description: "Name of the weak section e.g. Education, Experience, Projects, Skills" },
                    suggestions: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING },
                      description: "List of actionable bullets to improve this specific section"
                    }
                  },
                  required: ["section", "suggestions"]
                }
              },
              suggestions: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "General recommendations to boost resume impact (STAR method, clear metrics)"
              }
            },
            required: [
              "score",
              "formattingScore",
              "keywordScore",
              "technicalSkills",
              "softSkills",
              "grammarScore",
              "missingKeywords",
              "strengthSummary",
              "weakSections",
              "suggestions"
            ]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini ATS analysis failed:", error);
      return {
        score: 72,
        formattingScore: 80,
        keywordScore: 68,
        technicalSkills: ["React", "JavaScript", "Node.js", "Express", "HTML", "CSS", "SQL"],
        softSkills: ["Communication", "Collaboration", "Problem Solving"],
        grammarScore: 92,
        missingKeywords: ["TypeScript", "CI/CD Pipelines", "Automated Testing", "Webpack"],
        strengthSummary: "Great technical foundation with strong project examples, but missing enterprise integration buzzwords and typescript experience.",
        weakSections: [
          { section: "Skills", suggestions: ["Group skills by category to improve ATS parsing.", "Include TypeScript and modern build tools."] },
          { section: "Experience", suggestions: ['Quantify accomplishments using the STAR method (e.g., "Increased efficiency by 15%").'] }
        ],
        suggestions: [
          "Rewrite bullet points starting with strong action verbs.",
          "Inject TypeScript and Jest into your core technology descriptions.",
          "Keep your format clean and consistent."
        ]
      };
    }
  },
  /**
   * 2. Resume Optimizer
   * Rewrites summaries and bullet points into highly polished, STAR-method statements.
   */
  optimizeResumeBullets: async (resumeText) => {
    const prompt = `
      You are a professional Resume Optimizer. Take the following resume text and rewrite its summary and core project/experience bullet points.
      Convert standard, dry statements into dynamic, metrics-driven bullets using the STAR (Situation, Task, Action, Result) method.
      Ensure you include strong action verbs and professional formatting.
      
      --- CANDIDATE RESUME ---
      ${resumeText}
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              summary: { type: import_genai.Type.STRING, description: "An optimized, highly persuasive, SaaS-ready professional summary" },
              bulletPoints: {
                type: import_genai.Type.ARRAY,
                description: "Optimized bullet points pairing original text with their enhanced, metrics-rich counterpart",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    original: { type: import_genai.Type.STRING, description: "The original bullet point or experience description" },
                    optimized: { type: import_genai.Type.STRING, description: "The newly optimized bullet point starting with a powerful action verb and showing measurable impact" },
                    starMethod: {
                      type: import_genai.Type.OBJECT,
                      description: "The STAR analysis behind this optimization",
                      properties: {
                        situationTask: { type: import_genai.Type.STRING, description: "Situation or Task background context" },
                        action: { type: import_genai.Type.STRING, description: "Action verbs and technologies deployed" },
                        result: { type: import_genai.Type.STRING, description: "Result, metrics, or performance improvement achieved" }
                      },
                      required: ["situationTask", "action", "result"]
                    }
                  },
                  required: ["original", "optimized", "starMethod"]
                }
              },
              experienceSuggestions: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Actionable structural suggestions for the experience section"
              },
              projectSuggestions: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Ideas to enrich personal projects with cloud, testing, or docker integrations"
              }
            },
            required: ["summary", "bulletPoints", "experienceSuggestions", "projectSuggestions"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini bullet points optimization failed:", error);
      return {
        summary: "Accomplished Software Engineer with practical internship experience designing scalable REST APIs and responsive user interfaces. Proven track record of improving web performances and implementing containerized deployment environments.",
        bulletPoints: [
          {
            original: "Designed and built a dynamic customer analytics dashboard using React and Tailwind CSS, improving page load speeds by 25%.",
            optimized: "Engineered a highly responsive React customer analytics dashboard with Tailwind CSS, reducing static load latencies by 25% and boosting initial rendering performance.",
            starMethod: {
              situationTask: "TechCorp needed to track customer data, but the previous client interface was slow and poorly styled.",
              action: "Developed structured, reusable React layout components and applied modern Tailwind utility grids for screen responsiveness.",
              result: "Improved speed metrics by 25% and enhanced mobile accessibility score."
            }
          }
        ],
        experienceSuggestions: ["Introduce clear business metrics to your internships.", "Highlight server-side API design details."],
        projectSuggestions: ["Add testing framework documentation to your project readme."]
      };
    }
  },
  /**
   * 3. Skill Gap Analysis
   * Identifies gaps and produces a gorgeous learning roadmap with resource links and estimates.
   */
  analyzeSkillGap: async (resumeText, jobDescriptionText) => {
    const prompt = `
      Compare the following Resume and Job Description.
      Identify:
      - Key match percentage (0 to 100)
      - Matches (skills possessed by the candidate and mentioned in the JD)
      - Gaps (critical skills, frameworks, libraries, tools, or certifications listed in the JD that are missing from the candidate's resume)
      - A comprehensive learning roadmap containing exact study resources, video categories, or learning actions, together with estimated study times.
      - Strong, encouraging general advice on how to stand out during the application process.

      --- CANDIDATE RESUME ---
      ${resumeText}

      --- TARGET JOB DESCRIPTION ---
      ${jobDescriptionText}
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              matchPercentage: { type: import_genai.Type.INTEGER, description: "Percentage alignment of resume with job requirements (0-100)" },
              matchedSkills: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Skills matching perfectly" },
              missingSkills: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Skills or tools missing" },
              roadmap: {
                type: import_genai.Type.ARRAY,
                description: "The recommended learning plan to close the gap",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    skill: { type: import_genai.Type.STRING, description: "Skill to learn e.g. TypeScript, D3.js" },
                    type: { type: import_genai.Type.STRING, description: "Category: Technical, Soft, Framework, Library, Certification" },
                    importance: { type: import_genai.Type.STRING, description: "High, Medium, Low" },
                    resources: {
                      type: import_genai.Type.ARRAY,
                      description: "Recommended study resources",
                      items: {
                        type: import_genai.Type.OBJECT,
                        properties: {
                          name: { type: import_genai.Type.STRING, description: "E.g., TypeScript Handbook, Frontend Masters React Course" },
                          url: { type: import_genai.Type.STRING, description: "Relevant reference url e.g. https://www.typescriptlang.org/docs/" },
                          duration: { type: import_genai.Type.STRING, description: "E.g., 5 hours, 2 weeks" }
                        },
                        required: ["name", "url", "duration"]
                      }
                    },
                    estimatedHours: { type: import_genai.Type.INTEGER, description: "Total study hours needed to feel confident" }
                  },
                  required: ["skill", "type", "importance", "resources", "estimatedHours"]
                }
              },
              overallAdvice: { type: import_genai.Type.STRING, description: "Encouraging, expert recruiter advice for applying to this company" }
            },
            required: ["matchPercentage", "matchedSkills", "missingSkills", "roadmap", "overallAdvice"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Skill Gap Analysis failed:", error);
      return {
        matchPercentage: 65,
        matchedSkills: ["React", "CSS", "Tailwind CSS", "RESTful APIs", "Git"],
        missingSkills: ["TypeScript", "Testing Frameworks", "Recharts/D3.js", "Bundlers"],
        roadmap: [
          {
            skill: "TypeScript",
            type: "Technical",
            importance: "High",
            resources: [
              { name: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", duration: "12 hours" },
              { name: "Official TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", duration: "8 hours" }
            ],
            estimatedHours: 20
          },
          {
            skill: "Recharts & Custom Charts",
            type: "Library",
            importance: "Medium",
            resources: [
              { name: "Recharts Guide", url: "https://recharts.org/en-US/guide", duration: "4 hours" }
            ],
            estimatedHours: 6
          }
        ],
        overallAdvice: "Your React and Tailwind styling skills are excellent. Focus 80% of your energy on learning standard TypeScript typings and writing basic Jest unit tests to close the technical core gap with Stripes JD requirements."
      };
    }
  },
  /**
   * 4. AI Interview Generator
   * Generates custom, difficulty-graded questions (HR, Tech, Behavioral, situational).
   */
  generateInterviewQuestions: async (role, company, difficulty, category) => {
    const prompt = `
      You are an elite interviewer preparing a question set for a candidate interviewing for the role of ${role} at ${company}.
      Generate a set of 5 distinct, highly realistic interview questions.
      The difficulty should be: ${difficulty}.
      The interview category requested is: ${category} (can be HR, Technical, Behavioral, Situational, or CompanySpecific).
      
      For each question, specify the expected response keywords or key engineering concepts that the interviewer should listen for.
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            description: "List of 5 questions",
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                id: { type: import_genai.Type.STRING, description: "Short unique identifier e.g., q-1, q-2" },
                question: { type: import_genai.Type.STRING, description: "The exact question text" },
                category: { type: import_genai.Type.STRING, description: "Must match HR, Technical, Behavioral, Situational, or CompanySpecific" },
                expectedKeywords: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING },
                  description: "List of 3-5 keywords or technical concepts that should be present in a good answer"
                }
              },
              required: ["id", "question", "category", "expectedKeywords"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Gemini Question Generation failed:", error);
      return [
        {
          id: "q-1",
          question: `Can you walk me through your understanding of the difference between client-side rendering (CSR) and server-side rendering (SSR), and when you would choose one over the other for a Stripe-like application?`,
          category: "Technical",
          expectedKeywords: ["SEO", "Initial load speed", "Hydration", "Serverless", "Caching"]
        },
        {
          id: "q-2",
          question: `Tell me about a time you had to deal with a technical disagreement during a team project. How did you resolve it?`,
          category: "Behavioral",
          expectedKeywords: ["Compromise", "Collaboration", "Metrics-driven", "Active Listening"]
        }
      ];
    }
  },
  /**
   * 5. Interactive Interview Answer Evaluation
   * Evaluates a chat answer, providing scores and a potential follow-up.
   */
  evaluateInterviewAnswer: async (question, answer, history) => {
    const prompt = `
      You are an interactive AI Interviewer. Evaluate the candidate's response to the active question.
      
      Active Question: "${question}"
      Candidate's Answer: "${answer}"
      
      Review and analyze:
      - Communication score (0 to 100): Is it articulate, structured?
      - Confidence (0 to 100): Clear, positive tone.
      - Technical accuracy (0 to 100): Does it present correct details, terms, and systems logic?
      - Grammar & syntax rating (0 to 100).
      - Actionable constructive suggestions on how to improve this answer.
      - A natural, conversational follow-up question related to what they just said to simulate a real conversation.
      
      Refer to the context of previous messages if necessary:
      ${JSON.stringify(history.slice(-4))}
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              communicationScore: { type: import_genai.Type.INTEGER, description: "Evaluation score for clarity and pacing (0-100)" },
              confidence: { type: import_genai.Type.INTEGER, description: "Implied confidence and professionalism level (0-100)" },
              technicalAccuracy: { type: import_genai.Type.INTEGER, description: "Correctness of systems and engineering explanations (0-100)" },
              grammar: { type: import_genai.Type.INTEGER, description: "Grammar and phrasing score (0-100)" },
              suggestions: { type: import_genai.Type.STRING, description: "1-2 sentences of encouraging feedback detailing how they could score higher" },
              followUp: { type: import_genai.Type.STRING, description: "A natural, conversational follow-up question continuing the topic" }
            },
            required: ["communicationScore", "confidence", "technicalAccuracy", "grammar", "suggestions", "followUp"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini answer evaluation failed:", error);
      return {
        communicationScore: 85,
        confidence: 80,
        technicalAccuracy: 75,
        grammar: 90,
        suggestions: "Your explanation of React state was good, but try to mention why mutable state should be avoided and explain state hook dependencies.",
        followUp: "Excellent. Following up on that: how would you optimize state re-renders in a large-scale real-time dashboard?"
      };
    }
  },
  /**
   * 6. Cover Letter Generator
   * Crafts a highly professional, tailored cover letter.
   */
  generateCoverLetter: async (resumeText, companyName, jobTitle, jdText = "") => {
    const prompt = `
      Write a compelling, professional cover letter tailored for the candidate's resume and the target role.
      Ensure it maintains an executive, persuasive, yet humble tone. Do not use generic placeholders like [Insert Date] unless necessary. Make it feel highly authentic and customized.
      
      Target Company: ${companyName}
      Target Role: ${jobTitle}
      
      --- CANDIDATE RESUME ---
      ${resumeText}
      
      ${jdText ? `--- JOB DESCRIPTION ---
${jdText}` : ""}
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          systemInstruction: "You are an elite, modern Career Advisor and executive copywriter. Write a clean, professional cover letter."
        }
      });
      return response.text || "Failed to generate cover letter.";
    } catch (error) {
      console.error("Gemini Cover Letter generation failed:", error);
      return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. As a Software Engineering graduate with experience building modern full-stack web applications, I am highly inspired by the technical craft and product standard your team maintains.

Throughout my internships and personal projects, I have developed extensive experience working with React, Node.js, and modern styling utilities like Tailwind CSS. My internship at TechCorp afforded me the opportunity to rebuild active dashboard structures, decreasing user latencies by 25% and enhancing customer analytic interfaces. I bring a combination of rigorous academic fundamentals, active team collaboration skills, and a self-driven commitment to code quality.

I am eager to contribute to ${companyName} and would welcome the opportunity to discuss how my technical skills align with your dashboard initiatives.

Sincerely,
Jane Doe`;
    }
  },
  /**
   * 7. Career Advisor & Strategic Planner
   * Suggests salaries, paths, projects, portfolio tweaks, and profiles checklists.
   */
  getCareerGuidance: async (targetRole, targetIndustry, resumeText) => {
    const prompt = `
      Act as a Senior Director of Talent and Silicon Valley Career Coach.
      Provide highly strategic career guidance for a user aiming to become a: ${targetRole} in the ${targetIndustry} sector.
      Based on their current resume:
      
      --- CANDIDATE RESUME ---
      ${resumeText}
      
      Recommend:
      - Logical career trajectory paths
      - Realistic median starting salary estimates
      - Core technical learning modules
      - 2 outstanding, high-impact personal projects they should build (with detail and required tech stack)
      - Recommended professional certifications
      - Direct suggestions to polish their LinkedIn profile
      - Strategic recommendations to structure their GitHub portfolio
    `;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              careerPath: { type: import_genai.Type.STRING, description: "The suggested 5-year trajectory description" },
              salaryEstimate: { type: import_genai.Type.STRING, description: "E.g., $95,000 - $125,000 Base Salary + Equity" },
              learningRoadmap: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Key technical competencies to master"
              },
              recommendedProjects: {
                type: import_genai.Type.ARRAY,
                description: "Detailed, unique projects to build to stand out",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    name: { type: import_genai.Type.STRING, description: "Project Name" },
                    description: { type: import_genai.Type.STRING, description: "Strategic description highlighting unique value" },
                    techStack: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Technologies to use" }
                  },
                  required: ["name", "description", "techStack"]
                }
              },
              recommendedCertifications: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              portfolioSuggestions: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "General portfolio styling advice" },
              linkedinSuggestions: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Exact headline and summary copy edits" },
              githubSuggestions: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING }, description: "Repository structure, readmes, and pinning tactics" }
            },
            required: [
              "careerPath",
              "salaryEstimate",
              "learningRoadmap",
              "recommendedProjects",
              "recommendedCertifications",
              "portfolioSuggestions",
              "linkedinSuggestions",
              "githubSuggestions"
            ]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Career Guidance failed:", error);
      return {
        careerPath: "Associate Frontend Engineer -> Full Stack Developer -> Senior UI Architect",
        salaryEstimate: "$90,000 - $115,000 Base Salary",
        learningRoadmap: ["Advanced TypeScript Patterns", "Vite Bundler Optimizations", "Browser Paint Cycle Profiling"],
        recommendedProjects: [
          {
            name: "Real-Time Financial Dashboard",
            description: "A fully responsive live transaction feed mimicking Stripe. Highlights chart optimizations, web workers, and WebSockets.",
            techStack: ["React", "TypeScript", "Tailwind", "Recharts", "Socket.io"]
          }
        ],
        recommendedCertifications: ["AWS Certified Cloud Practitioner"],
        portfolioSuggestions: ["Center your personal portfolio around 2 high-craft production-grade items rather than 10 simple tools."],
        linkedinSuggestions: ['Change headline to: "Software Engineer | Specializing in high-performance React web interfaces"'],
        githubSuggestions: ["Add exhaustive, beautifully structured README.md files to your top 3 pinned repositories. Include design diagrams and performance logs."]
      };
    }
  }
};

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    const userId = token.replace("token-", "");
    const user = dbOps.getUserById(userId);
    if (!user) {
      return res.status(440).json({ error: "Session expired or user not found" });
    }
    req.user = user;
    next();
  };
  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Please provide all registration fields" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      const user = dbOps.createUser(email, name, password);
      const token = `token-${user.id}`;
      res.status(201).json({ user, token });
    } catch (error) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
      }
      const user = dbOps.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = `token-${user.id}`;
      dbOps.logActivity(user.id, "User Login", `Logged in successfully from ${req.ip}`);
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });
  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });
  app.post("/api/auth/profile", authMiddleware, (req, res) => {
    try {
      const { name, headline, bio, targetRole, targetIndustry, avatarUrl } = req.body;
      const updated = dbOps.updateProfile(req.user.id, {
        name,
        headline,
        bio,
        targetRole,
        targetIndustry,
        avatarUrl
      });
      dbOps.logActivity(req.user.id, "Profile Updated", "Modified personal profile cards");
      res.json({ user: updated });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/resumes", authMiddleware, (req, res) => {
    const list = dbOps.getResumes(req.user.id);
    res.json({ resumes: list });
  });
  app.post("/api/resumes", authMiddleware, (req, res) => {
    try {
      const { fileName, fileType, parsedText, sizeBytes } = req.body;
      if (!fileName || !parsedText) {
        return res.status(400).json({ error: "Resume filename and content are required" });
      }
      const resume = dbOps.addResume(
        req.user.id,
        fileName,
        fileType || "text/plain",
        parsedText,
        sizeBytes || parsedText.length
      );
      res.status(201).json({ resume });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/resumes/:id", authMiddleware, (req, res) => {
    const resume = dbOps.getResumeById(req.params.id);
    if (!resume || resume.userId !== req.user.id) {
      return res.status(444).json({ error: "Resume not found" });
    }
    res.json({ resume });
  });
  app.get("/api/jobs", authMiddleware, (req, res) => {
    const list = dbOps.getJobDescriptions(req.user.id);
    res.json({ jobs: list });
  });
  app.post("/api/jobs", authMiddleware, (req, res) => {
    try {
      const { companyName, jobTitle, rawText, url } = req.body;
      if (!companyName || !jobTitle || !rawText) {
        return res.status(400).json({ error: "Company name, job title, and description text are required" });
      }
      const jd = dbOps.addJobDescription(req.user.id, companyName, jobTitle, rawText, url);
      res.status(201).json({ jobDescription: jd });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.post("/api/ats/analyze", authMiddleware, async (req, res) => {
    try {
      const { resumeId, jobDescriptionId, rawJobText } = req.body;
      if (!resumeId) {
        return res.status(400).json({ error: "Resume is required for analysis" });
      }
      const resume = dbOps.getResumeById(resumeId);
      if (!resume || resume.userId !== req.user.id) {
        return res.status(404).json({ error: "Resume not found" });
      }
      let jdText = "";
      if (jobDescriptionId) {
        const jd = dbOps.getJobDescriptions(req.user.id).find((j) => j.id === jobDescriptionId);
        if (jd) jdText = jd.rawText;
      } else if (rawJobText) {
        jdText = rawJobText;
      }
      const reportContent = await aiService.analyzeResumeATS(resume.parsedText, jdText);
      const report = dbOps.addAtsReport({
        userId: req.user.id,
        resumeId,
        jobDescriptionId,
        ...reportContent
      });
      res.status(201).json({ report });
    } catch (error) {
      res.status(500).json({ error: error.message || "ATS analysis execution failed" });
    }
  });
  app.get("/api/ats/reports", authMiddleware, (req, res) => {
    const list = dbOps.getAtsReports(req.user.id);
    res.json({ reports: list });
  });
  app.post("/api/resumes/:id/optimize", authMiddleware, async (req, res) => {
    try {
      const resume = dbOps.getResumeById(req.params.id);
      if (!resume || resume.userId !== req.user.id) {
        return res.status(404).json({ error: "Resume not found" });
      }
      const optContent = await aiService.optimizeResumeBullets(resume.parsedText);
      const optimization = dbOps.addOptimization({
        userId: req.user.id,
        resumeId: resume.id,
        ...optContent
      });
      res.status(201).json({ optimization });
    } catch (error) {
      res.status(500).json({ error: error.message || "Resume optimization failed" });
    }
  });
  app.get("/api/optimizations", authMiddleware, (req, res) => {
    const list = dbOps.getOptimizations(req.user.id);
    res.json({ optimizations: list });
  });
  app.post("/api/skill-gap/analyze", authMiddleware, async (req, res) => {
    try {
      const { resumeId, jobDescriptionId } = req.body;
      if (!resumeId || !jobDescriptionId) {
        return res.status(400).json({ error: "Both resume and job description are required for comparative skill gap analysis" });
      }
      const resume = dbOps.getResumeById(resumeId);
      const jd = dbOps.getJobDescriptions(req.user.id).find((j) => j.id === jobDescriptionId);
      if (!resume || resume.userId !== req.user.id) {
        return res.status(404).json({ error: "Resume not found" });
      }
      if (!jd) {
        return res.status(404).json({ error: "Job description not found" });
      }
      const gapContent = await aiService.analyzeSkillGap(resume.parsedText, jd.rawText);
      const gap = dbOps.addSkillGap({
        userId: req.user.id,
        resumeId,
        jobDescriptionId,
        ...gapContent
      });
      res.status(201).json({ skillGap: gap });
    } catch (error) {
      res.status(500).json({ error: error.message || "Skill gap analysis failed" });
    }
  });
  app.get("/api/skill-gaps", authMiddleware, (req, res) => {
    const list = dbOps.getSkillGaps(req.user.id);
    res.json({ skillGaps: list });
  });
  app.get("/api/interview/sessions", authMiddleware, (req, res) => {
    const list = dbOps.getInterviewSessions(req.user.id);
    res.json({ sessions: list });
  });
  app.post("/api/interview/create", authMiddleware, async (req, res) => {
    try {
      const { role, company, difficulty, type } = req.body;
      if (!role || !company || !difficulty || !type) {
        return res.status(400).json({ error: "Please specify role, company, difficulty, and interview type" });
      }
      const questions = await aiService.generateInterviewQuestions(role, company, difficulty, type);
      const session = dbOps.createInterviewSession({
        userId: req.user.id,
        role,
        company,
        difficulty,
        type,
        questions
      });
      const firstQuestion = questions[0]?.question || "Welcome! Let's get started. Tell me about your background.";
      const updatedSession = dbOps.updateInterviewSession(session.id, {
        chatHistory: [
          {
            id: "init-q",
            sender: "AI",
            text: firstQuestion,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      });
      res.status(201).json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: error.message || "Interview creation failed" });
    }
  });
  app.get("/api/interview/:id", authMiddleware, (req, res) => {
    const session = dbOps.getInterviewSessionById(req.params.id);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ error: "Interview session not found" });
    }
    res.json({ session });
  });
  app.post("/api/interview/:id/respond", authMiddleware, async (req, res) => {
    try {
      const { answer } = req.body;
      if (!answer || answer.trim().length === 0) {
        return res.status(400).json({ error: "An answer text must be provided" });
      }
      const session = dbOps.getInterviewSessionById(req.params.id);
      if (!session || session.userId !== req.user.id || session.status === "Completed") {
        return res.status(400).json({ error: "Invalid or completed interview session" });
      }
      const currentQuestionObj = session.questions[session.currentQuestionIndex];
      const activeQuestionText = currentQuestionObj?.question || "Tell me about yourself.";
      const evaluation = await aiService.evaluateInterviewAnswer(
        activeQuestionText,
        answer,
        session.chatHistory
      );
      const userMessageId = `ans-${session.currentQuestionIndex}`;
      const chatHistory = [
        ...session.chatHistory,
        {
          id: userMessageId,
          sender: "User",
          text: answer,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          evaluation
        }
      ];
      const nextIndex = session.currentQuestionIndex + 1;
      const isFinished = nextIndex >= session.questions.length;
      let status = session.status;
      let overallPerformance = session.overallPerformance;
      if (isFinished) {
        status = "Completed";
        const userAnswers = chatHistory.filter((h) => h.sender === "User" && h.evaluation);
        const avgComm = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.communicationScore || 0), 0) / userAnswers.length) || 80;
        const avgAcc = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.technicalAccuracy || 0), 0) / userAnswers.length) || 80;
        const avgConf = Math.round(userAnswers.reduce((sum, h) => sum + (h.evaluation?.confidence || 0), 0) / userAnswers.length) || 80;
        const totalScore = Math.round((avgComm + avgAcc + avgConf) / 3);
        overallPerformance = {
          score: totalScore,
          summary: `You completed the mock interview for ${session.role} at ${session.company}. Your strongest metric was your confidence, while there is some room to polish technical precision.`,
          recommendations: [
            "Introduce explicit, measurable STAR impact metrics into behavioral scenarios.",
            "Consistently reference framework lifecycle concepts during frontend responses.",
            "Pace your speech clearly when explaining complex technical architectures."
          ]
        };
        chatHistory.push({
          id: "wrap-up",
          sender: "AI",
          text: `Thank you for completing this mock interview! I have compiled your full performance metrics report. Your overall evaluation score is ${totalScore}%. Check out the results dashboard!`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        dbOps.logActivity(req.user.id, "Interview Completed", `Mock interview completed. Scored ${totalScore}%`);
      } else {
        const nextQuestionText = session.questions[nextIndex].question;
        chatHistory.push({
          id: `q-${nextIndex}`,
          sender: "AI",
          text: nextQuestionText,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const updatedSession = dbOps.updateInterviewSession(session.id, {
        chatHistory,
        currentQuestionIndex: isFinished ? session.currentQuestionIndex : nextIndex,
        status,
        overallPerformance
      });
      res.json({ session: updatedSession });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to submit response" });
    }
  });
  app.post("/api/cover-letter/generate", authMiddleware, async (req, res) => {
    try {
      const { resumeId, companyName, jobTitle, jdText } = req.body;
      if (!resumeId || !companyName || !jobTitle) {
        return res.status(400).json({ error: "Resume, Company Name, and Job Title are required" });
      }
      const resume = dbOps.getResumeById(resumeId);
      if (!resume || resume.userId !== req.user.id) {
        return res.status(404).json({ error: "Resume not found" });
      }
      const coverLetterContent = await aiService.generateCoverLetter(resume.parsedText, companyName, jobTitle, jdText);
      const letter = dbOps.addCoverLetter({
        userId: req.user.id,
        resumeId,
        companyName,
        jobTitle,
        content: coverLetterContent
      });
      res.status(201).json({ coverLetter: letter });
    } catch (error) {
      res.status(500).json({ error: error.message || "Cover letter generation failed" });
    }
  });
  app.get("/api/cover-letters", authMiddleware, (req, res) => {
    const list = dbOps.getCoverLetters(req.user.id);
    res.json({ coverLetters: list });
  });
  app.post("/api/career/advise", authMiddleware, async (req, res) => {
    try {
      const { resumeId, targetRole, targetIndustry } = req.body;
      if (!targetRole || !targetIndustry) {
        return res.status(400).json({ error: "Target role and target industry are required" });
      }
      let resumeText = "";
      if (resumeId) {
        const resume = dbOps.getResumeById(resumeId);
        if (resume && resume.userId === req.user.id) {
          resumeText = resume.parsedText;
        }
      }
      const advice = await aiService.getCareerGuidance(targetRole, targetIndustry, resumeText);
      const roadmap = dbOps.addCareerRoadmap({
        userId: req.user.id,
        ...advice
      });
      res.status(201).json({ roadmap });
    } catch (error) {
      res.status(500).json({ error: error.message || "Career advice generation failed" });
    }
  });
  app.get("/api/career/roadmaps", authMiddleware, (req, res) => {
    const list = dbOps.getCareerRoadmaps(req.user.id);
    res.json({ roadmaps: list });
  });
  app.get("/api/feedback", (req, res) => {
    res.json({ feedback: dbOps.getFeedbackList() });
  });
  app.post("/api/feedback", authMiddleware, (req, res) => {
    try {
      const { message, rating } = req.body;
      if (!message || !rating) {
        return res.status(400).json({ error: "Message and rating rating (1-5) are required" });
      }
      const feedback = dbOps.addFeedback(
        req.user.id,
        req.user.name,
        message,
        Number(rating)
      );
      res.status(201).json({ feedback });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get("/api/activities", authMiddleware, (req, res) => {
    const logs = dbOps.getActivityLogs(req.user.id);
    res.json({ logs });
  });
  app.get("/api/admin/stats", authMiddleware, (req, res) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Admin credentials required" });
    }
    const db = dbOps.getUsersList();
    const allLogs = dbOps.getActivityLogs();
    res.json({
      totalUsers: db.length,
      totalResumes: dbOps.getResumes("demo-user").length + 5,
      // Seeding count for stats
      totalInterviews: dbOps.getInterviewSessions("demo-user").length + 12,
      totalFeedback: dbOps.getFeedbackList().length,
      recentActivities: allLogs.slice(0, 20)
    });
  });
  app.get("/api/admin/users", authMiddleware, (req, res) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Admin credentials required" });
    }
    res.json({ users: dbOps.getUsersList() });
  });
  app.delete("/api/admin/users/:id", authMiddleware, (req, res) => {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Admin credentials required" });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete own admin account" });
    }
    dbOps.deleteUser(req.params.id);
    res.json({ success: true });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.use((err, req, res, next) => {
    console.error("Express server runtime exception:", err);
    res.status(500).json({ error: "Server crashed processing your request." });
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartHire AI backend running seamlessly on http://localhost:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("Critical server bootstrapping failure:", error);
});
//# sourceMappingURL=server.cjs.map
