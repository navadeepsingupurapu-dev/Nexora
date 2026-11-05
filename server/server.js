/**
 * ============================================================================
 * NEXORA BACKEND API SERVER
 * Brand: NEXORA | Tagline: Ideas Meet Opportunity
 * Compatible with Local Node.js and Vercel Serverless Functions
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve safe database and upload locations for local vs serverless
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_FILE = isVercel ? path.join('/tmp', 'nexora_database.json') : path.join(__dirname, 'database.json');
const UPLOAD_DIR = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');

// Safe filesystem initialization
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  // Read-only filesystem fallback — serverless safe
}

// ----------------------------------------------------------------------------
// In-Memory Fallback & Safe JSON Database Layer
// Guarantees zero crash on read-only environments while persisting to disk/tmp when possible.
// ----------------------------------------------------------------------------
let memoryDB = {
  users: [],
  ventures: [],
  investmentRequests: [],
  investorHistories: [],
  sponsorHistories: [],
  messages: []
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(content);
      memoryDB = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        ventures: Array.isArray(parsed.ventures) ? parsed.ventures : [],
        investmentRequests: Array.isArray(parsed.investmentRequests) ? parsed.investmentRequests : [],
        investorHistories: Array.isArray(parsed.investorHistories) ? parsed.investorHistories : (Array.isArray(parsed.sponsorHistories) ? parsed.sponsorHistories : []),
        sponsorHistories: Array.isArray(parsed.sponsorHistories) ? parsed.sponsorHistories : (Array.isArray(parsed.investorHistories) ? parsed.investorHistories : []),
        messages: Array.isArray(parsed.messages) ? parsed.messages : []
      };
      return memoryDB;
    } else {
      saveDB(memoryDB);
    }
  } catch (err) {
    // Graceful fallback to memory store
  }
  return memoryDB;
}

function saveDB(data) {
  memoryDB = data || memoryDB;
  if (!memoryDB.sponsorHistories) memoryDB.sponsorHistories = memoryDB.investorHistories || [];
  if (!memoryDB.investorHistories) memoryDB.investorHistories = memoryDB.sponsorHistories || [];
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2));
  } catch (err) {
    // In serverless / read-only environment, keep updated in memoryDB
  }
}

// ----------------------------------------------------------------------------
// Middleware Configuration
// ----------------------------------------------------------------------------
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------------------------------
// Static Frontend File Serving
// Guarantees that requests to /, /style.css, /script.js, /db.js, etc. are served
// seamlessly whether run locally or through Vercel Serverless Functions.
// ----------------------------------------------------------------------------
const ROOT_DIR = path.join(__dirname, '..');

// Serve static assets from project root
app.use(express.static(ROOT_DIR));

// Explicit root route handler to prevent "Cannot GET /"
app.get('/', (req, res) => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.sendFile('index.html', { root: ROOT_DIR }, (err) => {
    if (err) {
      res.status(200).send('<!DOCTYPE html><html><head><title>NEXORA</title><meta http-equiv="refresh" content="0; url=/index.html"></head><body>Loading NEXORA...</body></html>');
    }
  });
});

// Static uploads serving (for local environments when uploads exist)
try {
  if (fs.existsSync(UPLOAD_DIR)) {
    app.use('/uploads', express.static(UPLOAD_DIR));
  }
} catch (e) {}

// ----------------------------------------------------------------------------
// Safe File Upload Handling (Memory-based, No persistent disk write requirement)
// ----------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype || 'application/octet-stream'};base64,${base64Data}`;

    // Return document metadata and safe data URI for client-side rendering
    return res.status(201).json({
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype || ext,
      dataUrl: dataUrl,
      isConfidential: true
    });
  });
});

// ----------------------------------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------------------------------

// Registration
app.post('/api/auth/register', (req, res) => {
  const { identifier, termsAccepted, method, googleProfile } = req.body;

  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the Terms and Conditions and Privacy Policy.' });
  }

  const db = loadDB();
  const existingUser = db.users.find(u => u.email === identifier || u.phone === identifier);

  if (existingUser) {
    return res.status(200).json({
      message: 'Welcome back!',
      user: existingUser,
      isExisting: true
    });
  }

  const newUser = {
    id: 'user_' + Date.now(),
    email: identifier.includes('@') ? identifier : (googleProfile ? googleProfile.email : ''),
    phone: !identifier.includes('@') ? identifier : '',
    name: googleProfile ? googleProfile.name : identifier.split('@')[0],
    role: null,
    termsAccepted: true,
    authMethod: method || 'standard',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  return res.status(201).json({
    message: 'Account created successfully.',
    user: newUser,
    isExisting: false
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email or phone is required.' });
  }

  const db = loadDB();
  const user = db.users.find(u =>
    (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
    (u.phone && u.phone === identifier)
  );

  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please sign up first.' });
  }

  return res.status(200).json({
    message: 'Logged in successfully.',
    user: user
  });
});

// Update Role (Journey choice: investor or entrepreneur)
app.post('/api/auth/role', (req, res) => {
  const { userId, role } = req.body;
  const normalizedRole = role === 'sponsor' ? 'investor' : role;
  if (!['investor', 'sponsor', 'entrepreneur'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role choice.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.role = normalizedRole;
    saveDB(db);
    return res.json({ message: 'Role updated successfully', user });
  }
  return res.status(404).json({ error: 'User not found' });
});

// ----------------------------------------------------------------------------
// Investor / Sponsor Track Record Questionnaire
// ----------------------------------------------------------------------------
const handleInvestorHistory = (req, res) => {
  const { userId, sponsorName, investorName, entrepreneurName, ideaSponsored, ideaInvested, supportType, details } = req.body;
  const db = loadDB();

  const record = {
    id: 'hist_' + Date.now(),
    userId,
    investorName: investorName || sponsorName || 'Investor',
    sponsorName: sponsorName || investorName || 'Investor',
    entrepreneurName: entrepreneurName || '',
    ideaInvested: ideaInvested || ideaSponsored || '',
    ideaSponsored: ideaSponsored || ideaInvested || '',
    supportType: supportType || 'Financial',
    details: details || '',
    createdAt: new Date().toISOString()
  };

  if (!db.investorHistories) db.investorHistories = [];
  if (!db.sponsorHistories) db.sponsorHistories = db.investorHistories;

  db.investorHistories.push(record);
  if (db.sponsorHistories !== db.investorHistories) {
    db.sponsorHistories.push(record);
  }
  saveDB(db);

  res.status(201).json({ message: 'Investment track record recorded successfully', record });
};

app.post('/api/investors/history', handleInvestorHistory);
app.post('/api/sponsors/history', handleInvestorHistory);

// ----------------------------------------------------------------------------
// Ventures Endpoints
// ----------------------------------------------------------------------------

// Get all ventures (with search and multi-facet filters)
app.get('/api/ventures', (req, res) => {
  const { search, industry, stage, fundingMax } = req.query;
  const db = loadDB();
  let list = [...db.ventures];

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(v =>
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.tagline && v.tagline.toLowerCase().includes(q)) ||
      (v.problem && v.problem.toLowerCase().includes(q)) ||
      (v.solution && v.solution.toLowerCase().includes(q)) ||
      (v.founderName && v.founderName.toLowerCase().includes(q))
    );
  }

  if (industry && industry !== 'all') {
    list = list.filter(v => v.industry && v.industry.toLowerCase() === industry.toLowerCase());
  }

  if (stage && stage !== 'all') {
    list = list.filter(v => v.stage && v.stage.toLowerCase() === stage.toLowerCase());
  }

  if (fundingMax && fundingMax !== 'all') {
    const max = parseInt(fundingMax, 10);
    if (!isNaN(max)) {
      list = list.filter(v => v.fundingNeeded <= max);
    }
  }

  res.json({ ventures: list });
});

// Get venture by ID
app.get('/api/ventures/:id', (req, res) => {
  const db = loadDB();
  const venture = db.ventures.find(v => v.id === req.params.id);
  if (!venture) {
    return res.status(404).json({ error: 'Venture not found' });
  }
  venture.views = (venture.views || 0) + 1;
  saveDB(db);
  res.json({ venture });
});

// Create new venture (Entrepreneur Step 5 submission)
app.post('/api/ventures', (req, res) => {
  const {
    userId,
    personal,
    venture,
    funding,
    documents
  } = req.body;

  if (!venture || !venture.name || !venture.industry || !funding || !funding.amount) {
    return res.status(400).json({ error: 'Missing required venture or funding information.' });
  }

  const db = loadDB();
  const numFunding = parseFloat(String(funding.amount).replace(/[^0-9.]/g, '')) || 50000;

  const newVenture = {
    id: 'v_' + Date.now(),
    entrepreneurId: userId,
    founderName: personal?.fullName || 'Innovator',
    personalDetails: personal,
    title: venture.name,
    industry: venture.industry,
    tagline: venture.shortDescription || 'Disruptive new venture',
    stage: venture.stage || 'Idea',
    fundingNeeded: numFunding,
    fundingDisplay: '$' + numFunding.toLocaleString(),
    supportTypes: funding.supportTypes || ['Financial Investment'],
    problem: venture.problem || '',
    solution: venture.solution || '',
    beneficiaries: venture.beneficiaries || '',
    uniqueValue: venture.uniqueValue || '',
    fundingUse: funding.fundingUse || '',
    expectedOutcome: funding.expectedOutcome || '',
    documents: documents || [],
    confidentialProtected: true,
    inquiries: 0,
    views: 1,
    createdAt: new Date().toISOString()
  };

  db.ventures.unshift(newVenture);
  saveDB(db);

  res.status(201).json({
    message: 'Venture registered successfully on Nexora.',
    venture: newVenture
  });
});

// Update Venture Details
app.put('/api/ventures/:id', (req, res) => {
  const db = loadDB();
  const venture = db.ventures.find(v => v.id === req.params.id);
  if (!venture) {
    return res.status(404).json({ error: 'Venture not found' });
  }

  Object.assign(venture, req.body);
  saveDB(db);
  res.json({ message: 'Venture updated successfully', venture });
});

// Express Interest in Venture
app.post('/api/ventures/:id/express-interest', (req, res) => {
  const { sponsorId, investorId, sponsorName, investorName, sponsorEmail, investorEmail, offeredSupport, proposedAmount, message } = req.body;
  const db = loadDB();
  const venture = db.ventures.find(v => v.id === req.params.id);
  if (!venture) {
    return res.status(404).json({ error: 'Venture not found' });
  }

  const effectiveId = investorId || sponsorId || 'anon_investor';
  const effectiveName = investorName || sponsorName || 'Verified Investor';
  const effectiveEmail = investorEmail || sponsorEmail || 'investor@example.com';

  const request = {
    id: 'inv_req_' + Date.now(),
    ventureId: venture.id,
    ventureTitle: venture.title,
    investorId: effectiveId,
    sponsorId: effectiveId,
    investorName: effectiveName,
    sponsorName: effectiveName,
    investorEmail: effectiveEmail,
    sponsorEmail: effectiveEmail,
    offeredSupport: offeredSupport || ['Financial Investment'],
    proposedAmount: proposedAmount || 'Flexible',
    message: message || 'I am interested in backing this opportunity.',
    status: 'Pending Review',
    createdAt: new Date().toISOString()
  };

  if (!db.investmentRequests) db.investmentRequests = [];
  if (!db.sponsorshipRequests) db.sponsorshipRequests = db.investmentRequests;

  db.investmentRequests.unshift(request);
  if (db.sponsorshipRequests !== db.investmentRequests) {
    db.sponsorshipRequests.unshift(request);
  }

  venture.inquiries = (venture.inquiries || 0) + 1;

  // Automatically start message thread
  if (!db.messages) db.messages = [];
  db.messages.push({
    id: 'msg_' + Date.now(),
    ventureId: venture.id,
    senderRole: 'investor',
    senderName: effectiveName,
    text: message,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.status(201).json({ message: 'Interest registered successfully', request });
});

// Get Messages for a Venture
app.get('/api/messages/:ventureId', (req, res) => {
  const db = loadDB();
  const msgs = (db.messages || []).filter(m => m.ventureId === req.params.ventureId);
  res.json({ messages: msgs });
});

// Post a new message
app.post('/api/messages', (req, res) => {
  const { ventureId, senderRole, senderName, text } = req.body;
  if (!ventureId || !text) {
    return res.status(400).json({ error: 'Venture ID and text required.' });
  }

  const db = loadDB();
  if (!db.messages) db.messages = [];
  const msg = {
    id: 'msg_' + Date.now(),
    ventureId,
    senderRole: senderRole || 'investor',
    senderName: senderName || 'User',
    text,
    timestamp: new Date().toISOString()
  };

  db.messages.push(msg);
  saveDB(db);
  res.status(201).json({ message: msg });
});

// Root API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'active',
    brand: 'NEXORA',
    tagline: 'Ideas Meet Opportunity',
    serverless: isVercel,
    timestamp: new Date().toISOString()
  });
});

// Root fallback for /api
app.get('/api', (req, res) => {
  res.json({
    message: 'NEXORA API Gateway Active',
    endpoints: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/ventures',
      '/api/investors/history',
      '/api/messages',
      '/api/upload'
    ]
  });
});

// Client-side route fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.sendFile('index.html', { root: ROOT_DIR }, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

// Start HTTP listener only when run standalone (not in Vercel serverless)
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  NEXORA BACKEND SERVER ACTIVE`);
    console.log(`  Port: ${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
}

module.exports = app;
