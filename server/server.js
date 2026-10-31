/**
 * ============================================================================
 * NEXORA BACKEND API SERVER
 * Brand: NEXORA | Tagline: Ideas Meet Opportunity
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ----------------------------------------------------------------------------
// Built-in Database Handler (Clean starting state with zero initial data)
// ----------------------------------------------------------------------------
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      ventures: [],
      investmentRequests: [],
      investorHistories: [],
      messages: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ----------------------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

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
    role: null, // to be chosen on Journey selection
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
  const user = db.users.find(u => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier);

  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please sign up first.' });
  }

  return res.status(200).json({
    message: 'Logged in successfully.',
    user: user
  });
});

// Update Role (Journey choice)
app.post('/api/auth/role', (req, res) => {
  const { userId, role } = req.body;
  if (!['sponsor', 'entrepreneur'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role choice.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.role = role;
    saveDB(db);
    return res.json({ message: 'Role updated successfully', user });
  }
  return res.status(404).json({ error: 'User not found' });
});

// ----------------------------------------------------------------------------
// Sponsor Track Record Questionnaire
// ----------------------------------------------------------------------------
app.post('/api/sponsors/history', (req, res) => {
  const { userId, sponsorName, entrepreneurName, ideaSponsored, supportType, details } = req.body;
  const db = loadDB();

  const record = {
    id: 'hist_' + Date.now(),
    userId,
    sponsorName,
    entrepreneurName,
    ideaSponsored,
    supportType,
    details: details || '',
    createdAt: new Date().toISOString()
  };

  db.sponsorHistories.push(record);
  saveDB(db);

  res.status(201).json({ message: 'Sponsor track record recorded successfully', record });
});

// ----------------------------------------------------------------------------
// Ventures Endpoints
// ----------------------------------------------------------------------------

// Get all ventures (with search and multi-facet filters)
app.get('/api/ventures', (req, res) => {
  const { search, industry, stage, fundingMax } = req.query;
  const db = loadDB();
  let list = db.ventures;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.tagline.toLowerCase().includes(q) ||
      v.problem.toLowerCase().includes(q) ||
      v.solution.toLowerCase().includes(q) ||
      v.founderName.toLowerCase().includes(q)
    );
  }

  if (industry && industry !== 'all') {
    list = list.filter(v => v.industry.toLowerCase() === industry.toLowerCase());
  }

  if (stage && stage !== 'all') {
    list = list.filter(v => v.stage.toLowerCase() === stage.toLowerCase());
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
    supportTypes: funding.supportTypes || ['Financial'],
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
  const { sponsorId, sponsorName, sponsorEmail, offeredSupport, proposedAmount, message } = req.body;
  const db = loadDB();
  const venture = db.ventures.find(v => v.id === req.params.id);
  if (!venture) {
    return res.status(404).json({ error: 'Venture not found' });
  }

  const request = {
    id: 'req_' + Date.now(),
    ventureId: venture.id,
    ventureTitle: venture.title,
    sponsorId: sponsorId || 'anon_sponsor',
    sponsorName: sponsorName || 'Venture Sponsor',
    sponsorEmail: sponsorEmail || 'sponsor@example.com',
    offeredSupport: offeredSupport || ['Financial'],
    proposedAmount: proposedAmount || 'Flexible',
    message: message || 'I am interested in backing this opportunity.',
    status: 'Pending Review',
    createdAt: new Date().toISOString()
  };

  db.sponsorshipRequests.unshift(request);
  venture.inquiries = (venture.inquiries || 0) + 1;

  // Automatically start message thread
  db.messages.push({
    id: 'msg_' + Date.now(),
    ventureId: venture.id,
    senderRole: 'sponsor',
    senderName: sponsorName,
    text: message,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.status(201).json({ message: 'Interest registered successfully', request });
});

// Get Messages for a Venture
app.get('/api/messages/:ventureId', (req, res) => {
  const db = loadDB();
  const msgs = db.messages.filter(m => m.ventureId === req.params.ventureId);
  res.json({ messages: msgs });
});

// Post a new message
app.post('/api/messages', (req, res) => {
  const { ventureId, senderRole, senderName, text } = req.body;
  if (!ventureId || !text) {
    return res.status(400).json({ error: 'Venture ID and text required.' });
  }

  const db = loadDB();
  const msg = {
    id: 'msg_' + Date.now(),
    ventureId,
    senderRole,
    senderName,
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
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  NEXORA BACKEND SERVER ACTIVE`);
  console.log(`  Port: ${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`  Database: ${DB_FILE}`);
  console.log(`=================================================`);
});

