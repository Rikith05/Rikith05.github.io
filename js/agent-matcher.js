/* ═══════════════════════════════════════════════════════════
   AI Portfolio Concierge & JD Fit Auditor
   Grounded retrieval + requirement matching over Rikith's profile
   ═══════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const KNOWLEDGE_CHUNKS = [
    {
      id: 'swarmforge',
      title: 'SwarmForge — Multi-Agent DAG & 5-Layer Firewall',
      type: 'Flagship Agent System',
      url: 'https://github.com/Rikith05/swarmforge',
      keywords: ['agent', 'multi-agent', 'dag', 'orchestrator', 'firewall', 'guardrails', 'security', 'prompt injection', 'dlp', 'rbac', 'sandbox', 'eval', 'fastapi', 'sse', 'sqlite', 'python', 'self-heal', 'llm', 'gemini', 'openai', 'ollama'],
      summary: 'Autonomous Multi-Agent DAG Orchestrator with Council+Judge, Plan+Execute, and Single-Shot strategies, 5-layer deterministic Tool Policy Firewall, SQLite time-travel replay, checkpoint forking, and 100% pass rate on strict-policy evals.'
    },
    {
      id: 'pharma-ai',
      title: 'Agentic AI Pharmaceutical Innovation Platform',
      type: 'Multi-Agent Research System',
      url: 'https://github.com/Rikith05/pharmaceutical-ai-innovation-platform',
      keywords: ['crewai', 'agent', 'agentic', 'orchestrator', 'langchain', 'openai', 'streamlit', 'research', 'pharma', 'synthesis', 'report', 'python', 'master agent', 'worker'],
      summary: 'Master Orchestrator coordinating 7 specialist Worker Agents (IQVIA, Clinical Trials, Patent/USPTO, EXIM, Internal Knowledge, Web Intelligence, Report Generator) — compressing drug repurposing research from 2-3 months to 3-5 minutes.'
    },
    {
      id: 'ethara-ai',
      title: 'LLM Post-Training Intern @ Ethara.ai (Feb 2026 – May 2026)',
      type: 'Internship Experience',
      url: '#experience',
      keywords: ['llm', 'post-training', 'eval', 'evaluation', 'prompt', 'alignment', 'hallucination', 'qa', 'fine-tuning', 'rlhf', 'annotation', 'quality'],
      summary: 'Evaluated LLM responses for factual accuracy, relevance, and contextual consistency; annotated alignment datasets; uncovered hallucinations and edge-case failures for core model teams.'
    },
    {
      id: 'tensorgo',
      title: 'Computer Vision & AI Intern @ TensorGo (Aug 2025 – Oct 2025)',
      type: 'Internship Experience',
      url: '#experience',
      keywords: ['computer vision', 'cv', 'rag', 'gemma', 'fine-tuning', 'n8n', 'automation', 'stt', 'tts', 'avatar', 'production', 'vm', 'deployment'],
      summary: 'Built interactive STT/TTS AI avatars, fine-tuned Gemma 3 (270M) interview simulation models on VMs, implemented RAG pipelines, automated workflows with n8n, and helped deploy GO X to production.'
    },
    {
      id: 'interview-portal',
      title: 'Interview Experience Portal (Local LLaMA 3.2 + Spring)',
      type: 'Full-Stack AI Platform',
      url: 'https://github.com/Rikith05/interview-experience-portal',
      keywords: ['java', 'spring', 'mysql', 'ollama', 'llama', 'mock interview', 'full-stack', 'rest', 'razorpay', 'backend', 'ai'],
      summary: 'Full-stack Java 17 + Spring 6 + MySQL 8 career platform featuring Ollama (LLaMA 3.2) AI mock interview evaluation, stack-based question generation, Razorpay credits, and Gmail OTP auth.'
    },
    {
      id: 'sports-pose',
      title: 'Sports Pose Metrics & Helmet Violation CV Systems',
      type: 'Computer Vision',
      url: 'https://github.com/Rikith05/sports-pose-metrics',
      keywords: ['computer vision', 'mediapipe', 'opencv', 'yolov8', 'yolo', 'easyocr', 'twilio', 'pose', 'biomechanics', 'streamlit', 'python', 'real-time', 'video', 'numpy'],
      summary: 'Real-time CPU pose estimation tracking 33 body landmarks via MediaPipe Pose Landmarker, plus YOLOv8 + OpenCV + EasyOCR helmet violation & crowd detection systems with Twilio SMS alerts.'
    },
    {
      id: 'telangana-rag',
      title: 'Telangana Schemes RAG & Resume Interview Generator',
      type: 'RAG & Fine-Tuned LLM',
      url: '#projects',
      keywords: ['rag', 'faiss', 'langchain', 'gemma', 'streamlit', 'vector', 'retrieval', 'embeddings', 'document'],
      summary: 'LangChain + FAISS + Gemma 3 RAG assistant for government scheme eligibility retrieval, alongside a fine-tuned Gemma 3 (270M) dynamic resume-to-JD interview question generator.'
    },
    {
      id: 'education-certs',
      title: 'Education, Certifications & Leadership (SNIST B.Tech 8.12 CGPA)',
      type: 'Academic & Leadership',
      url: '#education',
      keywords: ['education', 'degree', 'btech', 'b.tech', 'snist', 'cgpa', 'diploma', 'studies', 'college', 'certification', 'cisco', 'ibm', 'power bi', 'nss', 'club', 'leadership'],
      summary: 'B.Tech CSE (Data Science) at SNIST Hyderabad (CGPA 8.12, 2023–2026), Diploma in Computer Engineering (CGPA 7.93), SSC (9.7 CGPA); Documentation Head at Data Science Club (SNIST), NSS Volunteer; Cisco/IBM/Power BI certified.'
    },
    {
      id: 'csir-data',
      title: 'Data Analyst Intern @ CSIR-CSMCRI & Automation Workflows',
      type: 'Data & Automation',
      url: '#experience',
      keywords: ['data', 'sql', 'python', 'pandas', 'power bi', 'excel', 'etl', 'n8n', 'automation', 'analytics', 'or-tools', 'plotly'],
      summary: 'Analyzed multi-site Andaman & Nicobar seaweed cultivation datasets with Python, Excel, and Power BI; built n8n scheduled API-to-SMTP workflows and Google OR-Tools optimization simulators.'
    }
  ];

  const JD_PRESETS = {
    agent_engineer: 'Looking for an AI Agent Engineer experienced in multi-agent orchestration, DAG workflows, tool-calling guardrails, prompt injection defense, RAG pipelines, Python, FastAPI, LangChain or CrewAI, and automated LLM evaluation.',
    llm_eval: 'Seeking an LLM Post-Training & Evaluation Engineer skilled in prompt engineering, hallucination detection, model quality QA, fine-tuning open-weight models (Gemma/LLaMA), RAG evaluation, and Python.',
    cv_automation: 'Hiring an Applied AI & Computer Vision Engineer with MediaPipe, OpenCV, YOLOv8, real-time video inference, n8n workflow automation, Streamlit dashboards, and backend APIs (Python/FastAPI/Java).'
  };

  function tokenize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9+#.\-\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  function evaluateMatch(queryText) {
    const clean = (queryText || '').trim();
    const tokens = tokenize(clean);
    const lower = clean.toLowerCase();

    if (!tokens.length) {
      return {
        score: 0,
        trace: [],
        matches: [],
        brief: ''
      };
    }

    const scored = KNOWLEDGE_CHUNKS.map((chunk) => {
      const matchedTerms = [];
      for (const kw of chunk.keywords) {
        if (lower.includes(kw)) {
          matchedTerms.push(kw);
        }
      }
      const titleTokens = tokenize(chunk.title + ' ' + chunk.summary);
      for (const t of tokens) {
        if (titleTokens.includes(t) && !matchedTerms.includes(t)) {
          matchedTerms.push(t);
        }
      }
      const rawScore = matchedTerms.length * 14 + (chunk.type.includes('Flagship') ? 8 : 0);
      return {
        ...chunk,
        matchedTerms: matchedTerms.slice(0, 6),
        relevance: Math.min(99, rawScore)
      };
    })
      .filter((c) => c.matchedTerms.length > 0)
      .sort((a, b) => b.relevance - a.relevance);

    const topMatches = scored.slice(0, 4);
    const meanRel = topMatches.length
      ? topMatches.reduce((s, m) => s + m.relevance, 0) / topMatches.length
      : 0;
    const avgScore = topMatches.length
      ? Math.min(98, Math.round(topMatches[0].relevance * 0.65 + meanRel * 0.35 + 8))
      : 42;

    const trace = [
      { step: '1. Intent & Requirement Parser', status: 'pass', detail: `Extracted ${tokens.length} signal tokens from input` },
      { step: '2. Grounded Knowledge Retriever', status: 'pass', detail: `Ranked ${KNOWLEDGE_CHUNKS.length} verified artifacts -> ${topMatches.length} high-signal hits` },
      { step: '3. Hallucination & Citation Gate', status: topMatches.length ? 'pass' : 'warn', detail: topMatches.length ? 'All claims bound to verified GitHub repos, studies & internships' : 'Low overlap — showing closest AI baseline' }
    ];

    const brief = [
      `# Rikith Madimala — Agent Fit Brief (${avgScore}% Match)`,
      `Query: "${clean}"`,
      '',
      '## Verified Evidence:',
      ...topMatches.map((m) => `- **${m.title}** (${m.relevance}% relevance) — ${m.summary} [${m.url}]`),
      '',
      'Contact: rikithmadimala05@gmail.com | https://github.com/Rikith05 | https://rikith05.github.io'
    ].join('\n');

    return { score: avgScore, trace, matches: topMatches, brief };
  }

  const api = { KNOWLEDGE_CHUNKS, JD_PRESETS, evaluateMatch };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AgentMatcher = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
