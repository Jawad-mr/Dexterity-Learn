import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Models
import User from '../models/User.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected for seeding...");

    // Clear existing collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Announcement.deleteMany({});
    console.log("Cleaned up existing database records.");

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'AI Engineering', slug: 'ai-engineering', icon: 'Cpu' },
      { name: 'Workflow Automation', slug: 'workflow-automation', icon: 'Briefcase' },
      { name: 'AI Design & Creative', slug: 'ai-design-creative', icon: 'Layout' },
      { name: 'AI Career Prep', slug: 'ai-career-prep', icon: 'Award' },
    ]);
    console.log("Categories seeded!");

    // 2. Seed Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const seededUsers = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@dexteritylearn.com',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        progress: { xp: 1500, streak: 12, badges: ['AI Master', 'Elite Admin'] },
      },
      {
        username: 'student',
        email: 'student@dexteritylearn.com',
        password: userPassword,
        role: 'user',
        isVerified: true,
        progress: { xp: 250, streak: 3, badges: ['AI Novice'] },
      },
    ]);
    console.log("Users seeded!");

    // 3. Seed Announcements
    await Announcement.insertMany([
      {
        title: 'New Dynamic AI Courses Seeding Active!',
        content: 'Explore our 9 brand-new AI masterclass syllabus pathways, hands-on capstone challenges, and verifiable gold certificate options.',
        category: 'Feature Launch',
        active: true,
      },
      {
        title: 'Earn Verified Credentials',
        content: 'Finish 100% of any course syllabus, complete quizzes, and claim your official graduation certificate via WhatsApp verification.',
        category: 'General',
        active: true,
      },
      {
        title: 'JSN Creative & Founder Message ❤️',
        content: 'This premium version of Dexterity Learn is proudly built by JSN Creative and the founder Muhammad Jawad M R. One Love to all our student community!',
        category: 'Founder Message',
        active: true,
      },
    ]);
    console.log("Announcements seeded!");

    // Helper mapping for the 9 courses
    const coursesMeta = [
      {
        title: 'Prompt Engineering Masterclass',
        slug: 'prompt-engineering',
        description: 'Master advanced instruction tuning, context compression, Few-Shot framing, Chain-of-Thought reasoning, ReAct agent architectures, and LLM guardrail protection systems.',
        shortDescription: 'Master instruction tuning, Few-Shot formatting, Chain-of-Thought, and LLM defense systems.',
        difficulty: 'Beginner',
        estimatedTime: '6 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        modules: [
          'Foundations of Prompting',
          'Context Engineering & Windows',
          'Few-Shot Instruction Tuning',
          'Chain-of-Thought Reasoning',
          'ReAct Tool Pattern Architecture',
          'System Messages & Persona Tuning',
          'Anti-Jailbreak Guardrail Systems',
          'Multi-Agent Prompt Orchestration'
        ],
        lessons: [
          ['LLM Basics & Tokenization', 'System vs User Messages', 'Vibe-less Precise Instructions', 'Temperature & Top-P settings'],
          ['Context Windows & Limitations', 'Context Compression Tricks', 'Information Retrieval Anchoring', 'Instruction Ordering Rules'],
          ['Zero-Shot vs Few-Shot Tuning', 'Few-Shot Example Structuring', 'Handling Out-Of-Distribution Prompts', 'Synthesizing Synthetic Few-Shot Sets'],
          ['Basic Chain-of-Thought', 'Zero-Shot CoT Techniques', 'Self-Consistency CoT decoding', 'Tree of Thoughts Framework'],
          ['Introduction to ReAct Loop', 'Formulating Action Prompts', 'Interpreting Tool Outputs', 'Handling Infinite Loop Crashes'],
          ['Persona Architecture Design', 'Instruction Injection Bounds', 'Consistent Style Constraints', 'Structuring Outputs (JSON/Markdown)'],
          ['Prompt Injection Attacks', 'Leaking System Prompts', 'Delimiter Anchored Defenses', 'Prompt Evaluation Guardrails'],
          ['Collaborative Prompt Teams', 'Agent-to-Agent Communication', 'Debating Agent Frameworks', 'Compiling Prompts dynamically']
        ]
      },
      {
        title: 'AI Workflow Automation',
        slug: 'workflow-automation',
        description: 'Build enterprise-grade automated event triggers, custom webhooks, multi-step API pipelines, error handling logic, and cron scheduling systems.',
        shortDescription: 'Build enterprise-grade automated event pipelines, custom webhooks, and cron logic.',
        difficulty: 'Intermediate',
        estimatedTime: '8 hours',
        category: 'Workflow Automation',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
        modules: [
          'Introduction to Automation',
          'Webhooks & Event Triggers',
          'Multi-Step API Integrations',
          'Error Handling & Retries',
          'Cron Scheduling Systems',
          'Data Transformations',
          'Production Deployments',
          'API Rate Limiting & Logs'
        ],
        lessons: [
          ['Automation Mindset & Architecture', 'Choosing Make, n8n, or Custom Node', 'API Key & OAuth Security', 'Payload Structures (JSON/XML)'],
          ['Webhook Triggers & Listeners', 'Handling Payload Verification', 'Rate Limits on Inbound Webhooks', 'Debug Inbound Webhooks Locally'],
          ['Chaining Web Services', 'Dynamic Field Mapping', 'Conditional Router Branches', 'Looping through Arrays in n8n'],
          ['Graceful Error Recovery', 'Exponential Backoff Retries', 'Slack Alert Failures', 'Data Fallbacks & Storing Dead Letters'],
          ['Cron Expression Syntax', 'Interval Triggers (Minutes/Hours)', 'Idempotency in Scheduled Tasks', 'Handling Large Offset Datetime Zones'],
          ['Regular Expressions in Pipelines', 'Mapping XML to Flat JSON', 'Base64 Encrypted File Streams', 'JSON Schema Validation'],
          ['Deploying n8n on Docker', 'Using Cloud Services (Render/Railway)', 'Scaling Memory for Concurrent Runs', 'Team Collaboration Workspaces'],
          ['API Token Rotations', 'Caching Responses with Redis', 'Tracing Logs on Automation Failures', 'Rate Limit Throttling Policies']
        ]
      },
      {
        title: 'AI Image Generation & Design',
        slug: 'ai-image-generation',
        description: 'Harness Midjourney parameters, Stable Diffusion ControlNet, custom LoRAs, image outpainting, and AI design pipelines for professional marketing creative assets.',
        shortDescription: 'Harness Midjourney parameters, Stable Diffusion ControlNet, custom LoRAs, and outpainting.',
        difficulty: 'Beginner',
        estimatedTime: '5 hours',
        category: 'AI Design & Creative',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
        modules: [
          'Text-to-Image Foundations',
          'Midjourney Advanced Parameters',
          'Stable Diffusion Operations',
          'ControlNet Architectures',
          'Custom LoRA Training',
          'Inpainting & Outpainting',
          'Professional AI Retouching',
          'Commercial Pipelines'
        ],
        lessons: [
          ['Image Model Architecture', 'Generative Adversarial Nets vs Diffusion', 'Model Weights & Checkpoints', 'Seed Parameters & Determinism'],
          ['Aspect Ratios & Versions (--v)', 'Stylize and Weird parameters', 'Multi-prompt Weighting (::)', 'Image Prompt Blends'],
          ['Automatic1111 GUI Walkthrough', 'Sampling Steps & CFG Scale', 'Sampling Methods (Euler, DPM++)', 'Upscaler Comparison (RealESRGAN)'],
          ['ControlNet Canny Edge detection', 'Depth Map & Pose Alignment', 'Scribble & Line Art inputs', 'Combining Multiple ControlNets'],
          ['Preparing LoRA Datasets', 'Tagging & Capturing Concepts', 'Epochs, Learning Rates & Training', 'Evaluating Model Loss Logs'],
          ['Masked Inpainting Principles', 'Prompt-guided Outpainting', 'Canvas Extender Layouts', 'Resolution Grid Matching'],
          ['Upscaling Resolution cleanly', 'Correcting Hands & Faces', 'Color Grading Generative Images', 'Photoshop & Vector Compositing'],
          ['Generating Cohesive Ad Assets', 'UX/UI Mockup Pipelines', 'Licensing & Copyright Laws', 'Automating Bulk Image Workflows']
        ]
      },
      {
        title: 'Vibe Coding & Rapid Prototyping',
        slug: 'vibe-coding',
        description: 'Vibe Coding is conversational software development. Build, test, and deploy interactive frontend mockups and full-stack MVPs using purely natural language instruction.',
        shortDescription: 'Build, test, and deploy web applications using natural language vibe loops.',
        difficulty: 'Beginner',
        estimatedTime: '4 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
        modules: [
          'Concept of Vibe Coding',
          'Conversational Setup & Editors',
          'Designing UI Mockups Fast',
          'Iterative Refinement Loops',
          'CSS & Tailored Styling',
          'Mocking DBs & API Services',
          'Deploying Prototype MVPs',
          'From Prototype to Production'
        ],
        lessons: [
          ['Vibe Coding Definition', 'Natural Language Compiler Idea', 'AI Chat as a Coding Partner', 'Managing the Developer State'],
          ['Cursor Editor & v0 Setup', 'Configuring AI System Rules', 'Multi-file Coding Contexts', 'Reading Compiler Error Logs'],
          ['Drafting wireframes in text', 'Adding Interactive JS States', 'Vibe Coding Responsive Menus', 'Component Separation rules'],
          ['Interpreting AI Code Changes', 'Refinement Prompting Patterns', 'Dealing with Feature Creep', 'Locating Broken References'],
          ['Injecting Tailwind CSS Classes', 'Dark Mode Vibe Settings', 'Layout Polish & Grid Alignments', 'Hover and Micro-animations'],
          ['Simulating Local Storage DBs', 'Creating Mock Express routes', 'Vibe-generated JSON feeds', 'State Synchronization'],
          ['Vercel & Netlify Deployments', 'Static Site Hosting setup', 'Dynamic SPA route handling', 'Domain mapping prototypes'],
          ['Adding real DB collections', 'Refactoring Vibe spaghetti code', 'Securing API credentials', 'Writing custom test assertions']
        ]
      },
      {
        title: 'Custom GPTs & Assistants',
        slug: 'custom-gpts',
        description: 'Build custom AI assistants, connect external knowledge sources, configure OAuth client actions, and implement security controls for enterprise assistants.',
        shortDescription: 'Build custom AI assistants, connect external knowledge, and configure OAuth client actions.',
        difficulty: 'Intermediate',
        estimatedTime: '6 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=400&q=80',
        modules: [
          'OpenAI Assistants Overview',
          'Custom Instructions Architecture',
          'RAG Document Uploads',
          'Third-Party Actions Setup',
          'API Authentication Flows',
          'Custom Interface Builders',
          'Security & Safety Bounds',
          'Publishing & Analytics'
        ],
        lessons: [
          ['GPT Builder Interface walkthrough', 'Assistants API Lifecycle', 'System Prompts vs Custom GPTs', 'Billing & Token Usage Rules'],
          ['Structuring System Instructions', 'Defining Assistive Personas', 'Formatting Output Rules', 'Instruction Priorities'],
          ['Uploading Knowledge Databases', 'Document Parsers & Chunking', 'Vector Search Under the Hood', 'Querying Internal PDF Data'],
          ['OpenAPI Specification JSON', 'Connecting External HTTP APIs', 'Testing Actions in Sandbox', 'Dynamic Action Parameters'],
          ['OAuth 2.0 Client Credentials', 'Bearer Authentication Keys', 'Validating Token Handshakes', 'Security of Private Keys'],
          ['Designing Dashboard Layouts', 'Handling Voice-to-Text inputs', 'Displaying Rich Card responses', 'Feedback collection nodes'],
          ['Preventing Knowledge Leaks', 'Sanitizing System Inputs', 'Refusing Malicious Requests', 'Instruction Leak Defenses'],
          ['Publishing to public directories', 'SEO for Custom Assistants', 'Analyzing User Query Metrics', 'Scaling API Backends']
        ]
      },
      {
        title: 'AI Video Generation & Cinema',
        slug: 'ai-video-generation',
        description: 'Produce cinematic video loops, orchestrate camera angles using Runway Gen-2, lip-sync character dialogues, and direct cohesive AI-generated visual narratives.',
        shortDescription: 'Produce cinematic video loops, Runway Gen-2 camera moves, and lip-sync dialogue.',
        difficulty: 'Beginner',
        estimatedTime: '5 hours',
        category: 'AI Design & Creative',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80',
        modules: [
          'Cinematic Video Pipelines',
          'Text-to-Video Operations',
          'Runway Gen-2 Camera Tools',
          'Pika Labs Motion Settings',
          'Character Dialogue LipSync',
          'Frame Interpolation & SlowMo',
          'Cinematic Color Grading',
          'Cohesive Audio & Sound FX'
        ],
        lessons: [
          ['Video Frame Rate Mechanics', 'Diffusion Models for Motion', 'Storyboard & Narrative Prep', 'AI Video Tool Stack Review'],
          ['Drafting Motion Prompts', 'Controlling Physics & Chaos', 'Generating Video from Images', 'Upscaling video clip quality'],
          ['Motion Brush Directions', 'Camera Zoom, Pan & Roll', 'Creating Consistent Camera Moves', 'Refining Video Seeds'],
          ['Command Syntax in Pika Labs', 'Controlling Motion Intensity (-motion)', 'Fixing FPS rate constraints', 'Looping video segments'],
          ['Audio-to-LipSync pipelines', 'Voice cloning with ElevenLabs', 'Character consistency strategies', 'Facial Expression triggers'],
          ['Flow Frame Interpolation', 'Smooth Slow Motion (Twixtor)', 'Fixing Morphing Artifacts', 'Clean Loop Transitions'],
          ['LUTS & Cinematic Color Grids', 'Matching clip lighting states', 'Visual FX Overlay additions', 'Resolving Grain & Noise'],
          ['Soundtrack Layering techniques', 'Foley & SFX AI generators', 'Non-linear Video editing', 'Exporting UHD AI video files']
        ]
      },
      {
        title: 'AI-Assisted Software Development',
        slug: 'ai-assisted-dev',
        description: 'Maximize productivity using GitHub Copilot and Codeium. Automate boilerplate code, execute refactoring blocks, write automated unit tests, and diagnose compiler trace stack frames.',
        shortDescription: 'Maximize productivity using GitHub Copilot, refactor code, and automate unit tests.',
        difficulty: 'Beginner',
        estimatedTime: '7 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400&q=80',
        modules: [
          'GitHub Copilot Ecosystem',
          'Inline Code Generation',
          'Refactoring Spaghetti Code',
          'Automated Unit Testing',
          'AI Code Review Workflows',
          'Shell Terminal Automations',
          'Diagnosing Stack Traces',
          'Production Deployment CI/CD'
        ],
        lessons: [
          ['Configuring Copilot Extensions', 'Contextual Files Selection', 'Copilot Chat Pane controls', 'Telemetry & Privacy parameters'],
          ['Inline Code Completion shortcuts', 'Instruction Commenting guides', 'Generating complex SQL queries', 'Building API routes fast'],
          ['Automated Style Standardization', 'Replacing Loops with Map/Reduce', 'Reducing Cognitive Complexity', 'Isolating Utility Functions'],
          ['Writing Jest & Mocha tests', 'Mocking HTTP dependencies', 'Covering Edge Failure Cases', 'Evaluating Code Coverage metrics'],
          ['Analyzing Pull Requests with AI', 'Identifying Performance bottlenecks', 'Security vulnerability detection', 'Code optimization checks'],
          ['Natural Language Terminal commands', 'Automating Build Shell Scripts', 'Git Log parsing shortcuts', 'Container command generators'],
          ['Parsing NestJS / Spring Stacktraces', 'Debugging Database Timeout Logs', 'Resolving Dependency Conflicts', 'Fixing Null Pointer Errors'],
          ['Automated Release Notes', 'AI-assisted GitHub Actions YAML', 'CI/CD pipeline monitoring', 'Rollback scripts creation']
        ]
      },
      {
        title: 'Agentic Coding & AI Agents',
        slug: 'agentic-coding',
        description: 'Design multi-agent systems, establish agent communication protocols, configure tool calling capabilities, and create self-debugging code execution loops.',
        shortDescription: 'Design multi-agent systems, tool calling configurations, and self-debugging loops.',
        difficulty: 'Advanced',
        estimatedTime: '9 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
        modules: [
          'Multi-Agent Architectures',
          'Tool Calling Configurations',
          'Communication Protocols',
          'Human-in-the-Loop Triggers',
          'Self-Debugging Run loops',
          'CrewAI & AutoGen Frameworks',
          'Memory & State Persistence',
          'Scaling Agent Clusters'
        ],
        lessons: [
          ['Agentic Loop Mindset', 'ReAct Loop vs Custom Agents', 'Autonomous Execution Boundaries', 'Preventing Infinite loops'],
          ['Defining JSON Tool Schemas', 'Binding tools to OpenAI API', 'Validating tool parameters', 'Graceful tool failure handling'],
          ['Agent Collaboration Layouts', 'Hierarchical Orchestrators', 'Message passing structures', 'Resolving Agent consensus blocks'],
          ['Setting Interrupter Checkpoints', 'Interactive shell prompts', 'User validation input hooks', 'Overriding Agent actions'],
          ['Running Compiler Sandbox tests', 'Extracting Standard Error stack', 'Feeding backtrace into Agent', 'Validating success benchmarks'],
          ['CrewAI Tasks & Agents layout', 'AutoGen Conversational agents', 'Using local LLMs with agents', 'Comparing agent frameworks'],
          ['Adding Redis/MongoDB memories', 'Short-term vs Long-term caching', 'Vectorizing Agent history logs', 'Session state management'],
          ['Hosting Agents on Kubernetes', 'Queue-based task managers', 'Monitoring logs with Prometheus', 'Managing Rate limit schedules']
        ]
      },
      {
        title: 'Production RAG Systems',
        slug: 'rag-systems',
        description: 'Deploy advanced Retrieval-Augmented Generation systems. Optimise vector database indices, configure semantic search chunking, re-rank outcomes, and monitor query latencies.',
        shortDescription: 'Deploy advanced Retrieval-Augmented Generation systems, optimize vector indexing, and re-rank outcomes.',
        difficulty: 'Advanced',
        estimatedTime: '8 hours',
        category: 'AI Engineering',
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80',
        modules: [
          'Vector Index Architectures',
          'Pinecone & Milvus Database Setup',
          'Document Chunking & Overlaps',
          'Semantic Search Operations',
          'Re-ranking Search Results',
          'Context Window Compression',
          'Hybrid Keyword Vector Search',
          'Production Monitoring & Latency'
        ],
        lessons: [
          ['RAG Pipeline overview', 'Embeddings Models (ADA, Cohere)', 'Vector Distance Metrics (Cosine, L2)', 'Indexing speeds vs Recall rates'],
          ['Creating namespaces in Pinecone', 'Partitioning Collections in Milvus', 'Metadata Filtering configurations', 'Scale-up Index operations'],
          ['Sentence Splitter strategies', 'Slide Window Chunk overlap sizing', 'Parsing Complex PDFs & Tables', 'Semantic token boundaries'],
          ['Embedding User Search queries', 'Retrieval Top-K query speeds', 'Sparse vs Dense vectors', 'Evaluating Retrieval Accuracy'],
          ['Introduction to Cohere Re-ranker', 'Filtering out irrelevant chunks', 'Optimizing Token usage parameters', 'Improving Answer relevance'],
          ['Summarizing Long Context feeds', 'Information extraction limits', 'LLM context limits tricks', 'Instruction placement guidelines'],
          ['BM25 Keyword search algorithm', 'Reciprocal Rank Fusion (RRF)', 'Combining dense & sparse matrices', 'Tuning Hybrid weights'],
          ['RAGAS Evaluation Framework', 'Ground Truth comparison metrics', 'Pinecone Index latency charts', 'Caching Vector Queries']
        ]
      }
    ];

    // Seed Courses & Lessons programmatically
    for (const courseMeta of coursesMeta) {
      // 1. Create Course
      const course = await Course.create({
        title: courseMeta.title,
        slug: courseMeta.slug,
        description: courseMeta.description,
        shortDescription: courseMeta.shortDescription,
        difficulty: courseMeta.difficulty,
        estimatedTime: courseMeta.estimatedTime,
        category: courseMeta.category,
        image: courseMeta.image,
        certificatePrice: 499,
        isDraft: false,
        quizzes: [
          {
            question: `What is the primary objective of ${courseMeta.title}?`,
            options: ['To learn theory only', 'To build production-ready implementations', 'To generate templates without editing', 'To deploy static assets only'],
            answerIndex: 1,
            explanation: `The primary objective of ${courseMeta.title} is to build and deploy production-ready practical implementations.`
          },
          {
            question: 'True or False: All learning content is 100% free on Dexterity Learn.',
            options: ['True', 'False'],
            answerIndex: 0,
            explanation: 'Yes, learning lessons and syllabus topics is 100% free. Only official credentials/certificates are paid.'
          }
        ]
      });

      // 2. Generate and Insert the 32 Lessons (8 modules * 4 lessons)
      const lessonsToInsert = [];
      let order = 1;
      for (let m = 0; m < 8; m++) {
        const moduleName = courseMeta.modules[m];
        for (let l = 0; l < 4; l++) {
          const lessonTitle = courseMeta.lessons[m][l];
          const lessonSlug = `module-${m + 1}-lesson-${l + 1}`;

          lessonsToInsert.push({
            courseId: course._id,
            title: `${moduleName} — ${lessonTitle}`,
            slug: lessonSlug,
            content: `# ${lessonTitle}\n\nWelcome to this comprehensive lesson on **${lessonTitle}** as part of our **${courseMeta.title}** syllabus.\n\n### 🎓 Learning Objectives\n- Learn the core mechanics of ${lessonTitle}.\n- Implement secure execution scopes.\n- Debug execution trace logs and fix bottlenecks.\n\n### 💡 Conceptual Background\nDeveloping systems around ${lessonTitle} requires strict input validation, proper rate limit fallbacks, and handling system failures. Separating business logic from prompt templates is crucial for scale.\n\n### 💻 Practical Implementation Sample\nHere is a production-grade Javascript template for this workflow:\n\n\`\`\`javascript\n// Developer implementation trace\nfunction runTask() {\n  console.log("Starting task execution for ${lessonTitle}...");\n  const isVerified = true;\n  return {\n    success: isVerified,\n    timestamp: Date.now()\n  };\n}\nrunTask();\n\`\`\`\n\n### ⚠️ Common Mistakes\n1. **Unescaped Input**: Always sanitize variable inputs to prevent script injections.\n2. **Rate Limit Timeouts**: Always use exponential backoff timers on API requests.\n\n### 💡 Pro Tip\nFor production stability, log all inputs/outputs to a persistent database for monitoring.`,
            codeSnippets: [
              {
                language: 'javascript',
                code: `// Test script for ${lessonTitle}\nconsole.log("Executing sandbox trace...");\nconst active = true;\nconsole.log("Task successful:", active);`
              }
            ],
            order: order++
          });
        }
      }

      await Lesson.insertMany(lessonsToInsert);
      console.log(`Course "${courseMeta.title}" and its 32 lessons seeded successfully!`);
    }

    // 4. Seed Playbooks (5 Books)
    await Book.insertMany([
      {
        title: 'AI Freelancer Playbook',
        slug: 'ai-freelancer-playbook',
        description: 'Complete freelance blueprints. Master client acquisitions, proposal writing, pricing architectures, master services agreements, and case studies to grow a high-margin AI agency.',
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
        author: 'JSN Creative',
        price: 299,
        rating: 4.9,
        pages: [
          {
            pageNumber: 1,
            content: '# Finding High-Paying AI Clients\n\nTo build a successful AI consulting or freelance business, you must target clients looking for high-ROI automation solutions. Learn how to source high-ticket leads on Upwork, LinkedIn, and cold email campaigns.',
            readingTime: '2 mins'
          },
          {
            pageNumber: 2,
            content: '# Pricing Architectures & SLA Setup\n\nAvoid hourly billing! Implement project-based pricing and recurring retainers. This page outlines standard rates for custom chatbot integration (₹75,000+) and automated workflows (₹50,000+).',
            readingTime: '3 mins'
          },
          {
            pageNumber: 3,
            content: '# Professional Proposal Template\n\nUse this proven client proposal layout. Cover the scope of work, integration architecture, delivery milestones, training guides, and maintenance SLAs clearly to guarantee high close rates.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 4,
            content: '# Premium Chapter: Master Service Agreement (MSA)\n\nThis premium page outlines standard contract SLA terms, safety bounds, liability constraints on AI hallucinations, and intellectual property transfers.',
            readingTime: '4 mins'
          },
          {
            pageNumber: 5,
            content: '# Premium Case Study: ₹1,00,000/mo AI Agency\n\nRead our step-by-step breakdown of how a single freelancer scaled to ₹1,00,000 monthly recurring revenue by integrating webhooks & vector search RAGs for regional real estate businesses.',
            readingTime: '5 mins'
          }
        ]
      },
      {
        title: 'AI Business Blueprint',
        slug: 'ai-business-blueprint',
        description: 'Build premium AI SaaS platforms. Learn how to validate product ideas, sketch Lean MVP frameworks, execute monetization strategies, and scale search engine optimizations.',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
        author: 'Muhammad Jawad M R',
        price: 299,
        rating: 4.8,
        pages: [
          {
            pageNumber: 1,
            content: '# AI SaaS Ideation & Niches\n\nLocate high-margin software business models. Look for manual, repetitive, text-heavy operations. Target narrow niches (e.g. AI proposal writers for construction firms) to avoid LLM wrapper price competition.',
            readingTime: '2 mins'
          },
          {
            pageNumber: 2,
            content: '# Fast Product Validation\n\nBuild landing pages before writing code. Capture pre-sales using simple Stripe triggers or WhatsApp payment links. If you get 10+ paid signups, build the MVP.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 3,
            content: '# Building a 2-Week MVP\n\nUse bubble components, cursor vibe coding, and existing boilerplate templates. Connect OpenAI assistants API directly rather than coding complex neural networks from scratch.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 4,
            content: '# Premium Chapter: Tiered Subscription Billing\n\nSet up credit limits per pricing tier. Configure middleware checks to trace customer usage and prevent API cost runaway.',
            readingTime: '4 mins'
          },
          {
            pageNumber: 5,
            content: '# Premium Scaling: SEO & Cold Email Loops\n\nLearn how to generate 100+ programmatically targeted landing pages to capture search queries, and automate cold outreach campaigns to B2B targets.',
            readingTime: '4 mins'
          }
        ]
      },
      {
        title: 'Ultimate Prompt Vault',
        slug: 'ultimate-prompt-vault',
        description: 'Over 1,000 categorized professional system instructions and templates across software development, marketing, sales, SEO, customer support, and automations.',
        coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80',
        author: 'JSN Creative',
        price: 199,
        rating: 4.9,
        pages: [
          {
            pageNumber: 1,
            content: '# Software Engineering & Refactoring Prompts\n\nUse this standard instruction template to clean code:\n\n`Refactor this code to follow SOLID principles and isolate utility dependencies. Exclude third-party libraries unless specified.`',
            readingTime: '2 mins'
          },
          {
            pageNumber: 2,
            content: '# High-Conversion Marketing Prompts\n\nPrompt for copywriting frameworks:\n\n`Write an ad copy using the AIDA framework. Hook the reader immediately and focus on the time-saving ROI value.`',
            readingTime: '3 mins'
          },
          {
            pageNumber: 3,
            content: '# Student & Academic Outlining Prompts\n\nInstruction tuning prompts:\n\n`Generate a detailed structured outline for a research topic. Categorize references and highlight key open debates.`',
            readingTime: '2 mins'
          },
          {
            pageNumber: 4,
            content: '# Premium Chapter: Advanced Business & Sales Scripts\n\nUnlock system instructions that handle objection handling, cold outreach script tuning, and customer retention email automations.',
            readingTime: '4 mins'
          },
          {
            pageNumber: 5,
            content: '# Premium Chapter: SEO & Keyword Matrix compilation\n\nGet the master prompt to extract search intents, outline semantic gaps, and write complete SEO articles that rank on Google.',
            readingTime: '5 mins'
          }
        ]
      },
      {
        title: 'Build 25 AI Projects',
        slug: 'build-25-ai-projects',
        description: 'Complete coding guide. Build 25 practical AI projects, featuring folder structures, architecture flowcharts, backend source code, and CI/CD deployment instructions.',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        author: 'Dexterity Learn Dev Team',
        price: 299,
        rating: 4.9,
        pages: [
          {
            pageNumber: 1,
            content: '# Projects 1-5: AI Chatbots & Voice Assistants\n\nLearn the folder structures, API routes, and standard integration for a custom voice assistant using ElevenLabs and Node.js.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 2,
            content: '# Projects 6-10: Multi-Agent AI teams & Sandboxes\n\nEstablish state management rules for local CrewAI tasks, code executing containers, and safe sandboxing scripts.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 3,
            content: '# Projects 11-15: Automated Portfolio Generators\n\nBuild database schema collections, connect local storage API feeds, and render responsive CSS wireframes.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 4,
            content: '# Premium Chapter: RAG Database Query Dashboards\n\nUnlock complete Express JS routes, Pinecone vector query controllers, and PDF parsing scripts to build private knowledge search dashboards.',
            readingTime: '5 mins'
          },
          {
            pageNumber: 5,
            content: '# Premium Chapter: Enterprise SaaS Billing Integration\n\nLearn how to construct Stripe webhook validators, manage dynamic user credit limits, and deploy backends on Docker Containers.',
            readingTime: '5 mins'
          }
        ]
      },
      {
        title: 'AI Career Accelerator',
        slug: 'ai-career-accelerator',
        description: 'Command high salaries. Learn AI roadmap steps, system design questions, portfolio construction, resume layouts, and ATS screening optimization blueprints.',
        coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
        author: 'JSN Creative',
        price: 299,
        rating: 4.8,
        pages: [
          {
            pageNumber: 1,
            content: '# 30-Day AI Engineer Learning Roadmap\n\nDay 1-10: Prompt engineering and token limitations.\nDay 11-20: Vector databases, chunking strategies, and semantic searches.\nDay 21-30: Autonomous agentic loops and tool calling integrations.',
            readingTime: '2 mins'
          },
          {
            pageNumber: 2,
            content: '# System Design & Vector search scaling\n\nHow to design and whiteboard production RAG systems during tech reviews. Explain context window compaction and embedding model selection.',
            readingTime: '3 mins'
          },
          {
            pageNumber: 3,
            content: '# Professional Resume & Portfolio layouts\n\nAvoid generic descriptions. Focus on performance gains: `Optimized context window search, reducing token latency by 42% and API cost by ₹15,000/mo.`',
            readingTime: '3 mins'
          },
          {
            pageNumber: 4,
            content: '# Premium Chapter: GitHub Portfolio that Commands Attention\n\nStep-by-step instructions on making your GitHub profile showcase interactive live sandboxes, custom API actions, and production-ready codebases.',
            readingTime: '4 mins'
          },
          {
            pageNumber: 5,
            content: '# Premium Chapter: LinkedIn Brand Scaling and ATS Optimization\n\nUnlock copywriting layouts to document your daily learning, pass automated resume screening bots, and land high-ticket remote contracts.',
            readingTime: '5 mins'
          }
        ]
      }
    ]);
    console.log("Playbooks seeded successfully!");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();
