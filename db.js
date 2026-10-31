/**
 * ============================================================================
 * NEXORA CLIENT DATABASE & PERSISTENCE LAYER (db.js)
 * High-performance browser-native storage with zero pre-loaded data.
 * Starts completely fresh from the beginning.
 * ============================================================================
 */

(function () {
  // New storage key to guarantee completely fresh, empty state
  const STORAGE_KEY = 'NEXORA_CLEAN_DATABASE_V1';
  const CURRENT_USER_KEY = 'NEXORA_CLEAN_SESSION_V1';
  const BACKEND_URL = 'http://localhost:5000/api';

  // Clear any legacy test data from prior iterations
  try {
    localStorage.removeItem('NEXORA_APP_DATABASE_V1');
    localStorage.removeItem('NEXORA_CURRENT_SESSION');
  } catch (e) {}

  // Clean empty state — ready to receive live user registrations and ventures
  const DEFAULT_CLEAN_DATA = {
    users: [],
    ventures: [],
    investmentRequests: [],
    savedIdeas: [],
    investorHistories: [],
    messages: []
  };

  class NexoraDatabase {
    constructor() {
      this.data = this.init();
      this.isBackendAvailable = false;
      this.checkBackend();
    }

    init() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.users) parsed.users = [];
          if (!parsed.ventures) parsed.ventures = [];
          if (!parsed.investmentRequests) parsed.investmentRequests = [];
          if (!parsed.savedIdeas) parsed.savedIdeas = [];
          if (!parsed.investorHistories) parsed.investorHistories = [];
          if (!parsed.messages) parsed.messages = [];
          return parsed;
        }
      } catch (err) {
        console.warn('LocalStorage error, using clean state:', err);
      }
      this.persist(DEFAULT_CLEAN_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_CLEAN_DATA));
    }

    persist(state) {
      this.data = state || this.data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }

    async checkBackend() {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          this.isBackendAvailable = true;
          console.log('%c[NEXORA]%c Connected to Node.js Backend API at ' + BACKEND_URL, 'color:#2563eb;font-weight:bold;', 'color:#10b981;');
        }
      } catch (e) {
        this.isBackendAvailable = false;
        console.log('%c[NEXORA]%c Clean Mode Active (Local Database Engine)', 'color:#2563eb;font-weight:bold;', 'color:#0ea5e9;');
      }
    }

    // ---------------------------------------------------------
    // Session / Auth Management
    // ---------------------------------------------------------
    getCurrentUser() {
      try {
        const user = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    }

    setCurrentUser(user, remember = true) {
      const serialized = JSON.stringify(user);
      sessionStorage.setItem(CURRENT_USER_KEY, serialized);
      if (remember) {
        localStorage.setItem(CURRENT_USER_KEY, serialized);
      }
    }

    logout() {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }

    registerUser(identifier, options = {}) {
      const isEmail = identifier.includes('@');
      const email = isEmail ? identifier.trim() : (options.email || '');
      const phone = !isEmail ? identifier.trim() : (options.phone || '');
      const name = options.name || (email ? email.split('@')[0] : 'User');

      let existing = this.data.users.find(u =>
        (email && u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        (phone && u.phone && u.phone === phone)
      );

      if (existing) {
        return { user: existing, isNew: false };
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        role: options.role || null, // 'investor' or 'entrepreneur'
        termsAccepted: true,
        authMethod: options.method || 'direct',
        joinedDate: new Date().toISOString()
      };

      this.data.users.push(newUser);
      this.persist();
      return { user: newUser, isNew: true };
    }

    loginUser(identifier) {
      const idf = identifier.trim().toLowerCase();
      const user = this.data.users.find(u =>
        (u.email && u.email.toLowerCase() === idf) ||
        (u.phone && u.phone === idf)
      );
      return user || null;
    }

    updateUserRole(userId, role) {
      // Normalize 'sponsor' to 'investor'
      const normalizedRole = role === 'sponsor' ? 'investor' : role;
      const user = this.data.users.find(u => u.id === userId);
      if (user) {
        user.role = normalizedRole;
        this.persist();
        const current = this.getCurrentUser();
        if (current && current.id === userId) {
          current.role = normalizedRole;
          this.setCurrentUser(current);
        }
      }
      return user;
    }

    // ---------------------------------------------------------
    // Investor Questionnaire Track Record
    // ---------------------------------------------------------
    saveInvestorHistory(userId, payload) {
      const record = {
        id: 'inv_hist_' + Date.now(),
        userId,
        investorName: payload.investorName || payload.sponsorName,
        entrepreneurName: payload.entrepreneurName,
        ideaInvested: payload.ideaInvested || payload.ideaSponsored,
        supportType: payload.supportType,
        details: payload.details || '',
        createdAt: new Date().toISOString()
      };
      this.data.investorHistories.push(record);
      this.persist();
      return record;
    }

    // Alias for compatibility
    saveSponsorHistory(userId, payload) {
      return this.saveInvestorHistory(userId, payload);
    }

    // ---------------------------------------------------------
    // Ventures Management
    // ---------------------------------------------------------
    getVentures(filters = {}) {
      let list = [...this.data.ventures];

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(v =>
          (v.title && v.title.toLowerCase().includes(q)) ||
          (v.tagline && v.tagline.toLowerCase().includes(q)) ||
          (v.industry && v.industry.toLowerCase().includes(q)) ||
          (v.founderName && v.founderName.toLowerCase().includes(q)) ||
          (v.problem && v.problem.toLowerCase().includes(q)) ||
          (v.solution && v.solution.toLowerCase().includes(q))
        );
      }

      if (filters.industry && filters.industry !== 'all') {
        list = list.filter(v => v.industry.toLowerCase() === filters.industry.toLowerCase());
      }

      if (filters.stage && filters.stage !== 'all') {
        list = list.filter(v => v.stage.toLowerCase() === filters.stage.toLowerCase());
      }

      if (filters.fundingMax && filters.fundingMax !== 'all') {
        const max = parseInt(filters.fundingMax, 10);
        if (!isNaN(max)) {
          list = list.filter(v => v.fundingNeeded <= max);
        }
      }

      return list;
    }

    getVentureById(id) {
      const v = this.data.ventures.find(item => item.id === id);
      if (v) {
        v.views = (v.views || 0) + 1;
        this.persist();
      }
      return v;
    }

    getMyVentures(userId) {
      return this.data.ventures.filter(v => v.entrepreneurId === userId);
    }

    createVenture(payload) {
      const numFunding = parseFloat(String(payload.funding.amount).replace(/[^0-9.]/g, '')) || 50000;

      const newVenture = {
        id: 'v_' + Date.now(),
        entrepreneurId: payload.userId,
        founderName: payload.personal?.fullName || 'Innovator',
        founderEmail: payload.personal?.email || '',
        personalDetails: payload.personal,
        title: payload.venture.name,
        industry: payload.venture.industry,
        tagline: payload.venture.shortDescription,
        stage: payload.venture.stage || 'Idea',
        fundingNeeded: numFunding,
        fundingDisplay: '$' + numFunding.toLocaleString(),
        supportTypes: payload.funding.supportTypes || ['Financial Investment'],
        problem: payload.venture.problem || '',
        solution: payload.venture.solution || '',
        beneficiaries: payload.venture.beneficiaries || '',
        uniqueValue: payload.venture.uniqueValue || '',
        fundingUse: payload.funding.fundingUse || '',
        expectedOutcome: payload.funding.expectedOutcome || '',
        documents: payload.documents || [],
        confidentialProtected: true,
        inquiries: 0,
        views: 1,
        isDemo: false,
        createdAt: new Date().toISOString()
      };

      this.data.ventures.unshift(newVenture);
      this.persist();
      return newVenture;
    }

    updateVenture(id, fields) {
      const index = this.data.ventures.findIndex(v => v.id === id);
      if (index !== -1) {
        this.data.ventures[index] = { ...this.data.ventures[index], ...fields };
        this.persist();
        return this.data.ventures[index];
      }
      return null;
    }

    // ---------------------------------------------------------
    // Bookmarking / Saved Ideas
    // ---------------------------------------------------------
    toggleSaveIdea(ventureId) {
      if (!this.data.savedIdeas) this.data.savedIdeas = [];
      const index = this.data.savedIdeas.indexOf(ventureId);
      let isSaved = false;
      if (index > -1) {
        this.data.savedIdeas.splice(index, 1);
        isSaved = false;
      } else {
        this.data.savedIdeas.push(ventureId);
        isSaved = true;
      }
      this.persist();
      return isSaved;
    }

    isIdeaSaved(ventureId) {
      return (this.data.savedIdeas || []).includes(ventureId);
    }

    getSavedVentures() {
      const ids = this.data.savedIdeas || [];
      return this.data.ventures.filter(v => ids.includes(v.id));
    }

    // ---------------------------------------------------------
    // Investment Proposals & Inquiries
    // ---------------------------------------------------------
    expressInterest(ventureId, payload) {
      const venture = this.getVentureById(ventureId);
      if (!venture) return null;

      const request = {
        id: 'inv_req_' + Date.now(),
        ventureId: venture.id,
        ventureTitle: venture.title,
        investorId: payload.investorId || payload.sponsorId,
        investorName: payload.investorName || payload.sponsorName,
        investorEmail: payload.investorEmail || payload.sponsorEmail,
        offeredSupport: payload.offeredSupport || ['Financial Investment'],
        proposedAmount: payload.proposedAmount || 'Negotiable',
        message: payload.message || 'I am excited to invest in your venture.',
        status: 'Under Review',
        createdAt: new Date().toISOString()
      };

      this.data.investmentRequests.unshift(request);
      venture.inquiries = (venture.inquiries || 0) + 1;

      // Start message thread
      this.data.messages.push({
        id: 'msg_' + Date.now(),
        ventureId: venture.id,
        senderRole: 'investor',
        senderName: payload.investorName || payload.sponsorName,
        text: payload.message,
        timestamp: new Date().toISOString()
      });

      this.persist();
      return request;
    }

    getInvestmentRequestsForVenture(ventureId) {
      return (this.data.investmentRequests || []).filter(r => r.ventureId === ventureId);
    }
    // Alias
    getSponsorshipRequestsForVenture(ventureId) {
      return this.getInvestmentRequestsForVenture(ventureId);
    }

    getInvestmentRequestsByInvestor(investorId) {
      return (this.data.investmentRequests || []).filter(r => (r.investorId === investorId || r.sponsorId === investorId));
    }
    // Alias
    getSponsorshipRequestsBySponsor(investorId) {
      return this.getInvestmentRequestsByInvestor(investorId);
    }

    // ---------------------------------------------------------
    // Secure Messaging
    // ---------------------------------------------------------
    getMessages(ventureId) {
      return (this.data.messages || []).filter(m => m.ventureId === ventureId);
    }

    sendMessage(ventureId, senderRole, senderName, text) {
      if (!this.data.messages) this.data.messages = [];
      const msg = {
        id: 'msg_' + Date.now(),
        ventureId,
        senderRole,
        senderName,
        text,
        timestamp: new Date().toISOString()
      };
      this.data.messages.push(msg);
      this.persist();
      return msg;
    }
  }

  // Expose global database singleton
  window.NexoraDB = new NexoraDatabase();
})();
