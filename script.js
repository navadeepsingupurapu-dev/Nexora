/**
 * ============================================================================
 * NEXORA INTERACTIVE PLATFORM CORE ENGINE (script.js)
 * Brand: NEXORA | Tagline: Ideas Meet Opportunity
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. STATE & ROUTING
  // --------------------------------------------------------------------------
  const state = {
    currentView: 'view-entrance',
    authMode: 'signup', // 'signup' or 'login'
    activeSponsorTab: 'discover',
    activeEntTab: 'my-venture',
    selectedVentureForModal: null,
    selectedChatVentureId: null,
    wizardData: {
      personal: {},
      venture: {},
      funding: {},
      documents: []
    },
    wizardCurrentStep: 1
  };

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENTS CACHE
  // --------------------------------------------------------------------------
  const views = {
    entrance: document.getElementById('view-entrance'),
    auth: document.getElementById('view-auth'),
    journey: document.getElementById('view-journey'),
    sponsorGate: document.getElementById('view-sponsor-gate'),
    sponsorDash: document.getElementById('view-sponsor-dashboard'),
    entWizard: document.getElementById('view-entrepreneur-wizard'),
    entDash: document.getElementById('view-entrepreneur-dashboard')
  };

  const toastContainer = document.getElementById('toast-container');

  // Auth elements
  const tabSignup = document.getElementById('tab-signup');
  const tabLogin = document.getElementById('tab-login');
  const panelSignup = document.getElementById('panel-signup');
  const panelLogin = document.getElementById('panel-login');
  const authMainTitle = document.getElementById('auth-main-title');
  const authMainSubtitle = document.getElementById('auth-main-subtitle');
  const signupTermsCheckbox = document.getElementById('signup-terms-checkbox');
  const btnSignupContinue = document.getElementById('btn-signup-continue');
  const formSignup = document.getElementById('form-signup');
  const formLogin = document.getElementById('form-login');
  const signupIdentifier = document.getElementById('signup-identifier');
  const loginIdentifier = document.getElementById('login-identifier');
  const termsHintMsg = document.getElementById('terms-hint-msg');
  const btnGoogleSignup = document.getElementById('btn-google-signup');
  const switchToSignup = document.getElementById('switch-to-signup');

  // Modals
  const modalGoogleAuth = document.getElementById('modal-google-auth');
  const modalLegal = document.getElementById('modal-legal');
  const modalVentureDetail = document.getElementById('modal-venture-detail');
  const modalExpressInterest = document.getElementById('modal-express-interest');
  const modalCelebration = document.getElementById('modal-submission-celebration');

  // --------------------------------------------------------------------------
  // 2.5 AESTHETIC THEME CONTROLLER & SWITCHER
  // --------------------------------------------------------------------------
  let currentTheme = 'iris';
  let particleColorA = 'rgba(99, 102, 241, ';
  let particleColorB = 'rgba(14, 165, 233, ';

  function applyTheme(themeName, persist = true) {
    const validThemes = ['iris', 'sage', 'aurora'];
    if (!validThemes.includes(themeName)) themeName = 'iris';
    currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);

    // Update palette picker button states
    const pickerBtns = document.querySelectorAll('[data-pick-theme]');
    pickerBtns.forEach(btn => {
      if (btn.getAttribute('data-pick-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (persist) {
      try {
        localStorage.setItem('NEXORA_AESTHETIC_THEME', themeName);
      } catch (e) {}
    }

    // Set particle color palette
    if (themeName === 'sage') {
      particleColorA = 'rgba(13, 148, 136, ';
      particleColorB = 'rgba(5, 150, 105, ';
    } else if (themeName === 'aurora') {
      particleColorA = 'rgba(225, 29, 72, ';
      particleColorB = 'rgba(168, 85, 247, ';
    } else {
      // celestial iris
      particleColorA = 'rgba(99, 102, 241, ';
      particleColorB = 'rgba(14, 165, 233, ';
    }
  }

  // Restore saved theme on startup
  try {
    const saved = localStorage.getItem('NEXORA_AESTHETIC_THEME') || 'iris';
    applyTheme(saved, false);
  } catch (e) {
    applyTheme('iris', false);
  }

  // Bind palette clicks
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pick-theme]');
    if (btn) {
      const theme = btn.getAttribute('data-pick-theme');
      applyTheme(theme, true);
    }
  });

  // --------------------------------------------------------------------------
  // 3. BACKGROUND CANVAS (CYBER GRID & NODES)
  // --------------------------------------------------------------------------
  initBackgroundCanvas();

  function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Create particles with dynamic dual-tone palette
    const particleCount = Math.floor(Math.min(window.innerWidth / 20, 45));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8,
        isPrimary: i % 2 === 0
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 130) * 0.14;
            ctx.strokeStyle = particleColorA + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw and move particles
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const colorPrefix = p.isPrimary ? particleColorA : particleColorB;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorPrefix + '0.45)';
        ctx.shadowBlur = 6;
        ctx.shadowColor = colorPrefix + '0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // --------------------------------------------------------------------------
  // 4. VIEW ROUTER (INSTANT TOP-ALIGNED SWITCH, ZERO SCROLL LAG)
  // --------------------------------------------------------------------------
  function switchView(targetViewId) {
    Object.values(views).forEach(v => {
      if (v) v.classList.remove('active');
    });

    const target = document.getElementById(targetViewId);
    if (target) {
      target.classList.add('active');
      state.currentView = targetViewId;
      // Immediate synchronous scroll to top so options appear directly without scrolling
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }

  // Toast System
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // 5. ENTRANCE SCREEN & INSTANT ACTION ROUTING
  // --------------------------------------------------------------------------
  const btnEntranceSignup = document.getElementById('btn-entrance-signup');
  const btnEntranceLogin = document.getElementById('btn-entrance-login');
  const btnEnterNexora = document.getElementById('btn-enter-nexora');

  if (btnEntranceSignup) {
    btnEntranceSignup.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode('signup');
      switchView('view-auth');
    });
  }

  if (btnEntranceLogin) {
    btnEntranceLogin.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode('login');
      switchView('view-auth');
    });
  }

  if (btnEnterNexora) {
    btnEnterNexora.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode('signup');
      switchView('view-auth');
    });
  }

  // Quick Action Handlers for Demo/Testing
  document.querySelectorAll('[data-quick-login]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.dataset.quickLogin;
      if (role === 'sponsor' || role === 'investor') {
        let investorUser = window.NexoraDB.loginUser('investor.demo@nexora.io');
        if (!investorUser) {
          const res = window.NexoraDB.registerUser('investor.demo@nexora.io', { name: 'Demo Investor', role: 'sponsor' });
          investorUser = res.user;
        }
        window.NexoraDB.setCurrentUser(investorUser);
        setupSponsorDashboard();
        switchView('view-sponsor-dashboard');
        showToast('Logged in as Demo Investor', 'success');
      } else {
        let founderUser = window.NexoraDB.loginUser('founder.demo@nexora.io');
        if (!founderUser) {
          const res = window.NexoraDB.registerUser('founder.demo@nexora.io', { name: 'Demo Founder', role: 'entrepreneur' });
          founderUser = res.user;
        }
        window.NexoraDB.setCurrentUser(founderUser);
        setupEntrepreneurDashboard();
        switchView('view-entrepreneur-dashboard');
        showToast('Logged in as Demo Entrepreneur', 'success');
      }
    });
  });

  // Quick-fill credentials inside Login Panel
  document.querySelectorAll('[data-fill-account]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (loginIdentifier) {
        loginIdentifier.value = btn.dataset.fillAccount;
        loginIdentifier.focus();
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. AUTHENTICATION & MANDATORY TERMS BEHAVIOR
  // --------------------------------------------------------------------------
  // Tab Switching
  if (tabSignup && tabLogin) {
    tabSignup.addEventListener('click', () => setAuthMode('signup'));
    tabLogin.addEventListener('click', () => setAuthMode('login'));
  }
  if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode('signup');
    });
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    if (mode === 'signup') {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      panelSignup.classList.add('active');
      panelLogin.classList.remove('active');
      authMainTitle.textContent = 'Join the Innovation Network';
      authMainSubtitle.textContent = 'Choose your preferred sign up method to get started';
    } else {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      panelLogin.classList.add('active');
      panelSignup.classList.remove('active');
      authMainTitle.textContent = 'Welcome Back to Nexora';
      authMainSubtitle.textContent = 'Sign in to access your dashboard and opportunities';
    }
  }

  // MANDATORY TERMS & CONDITIONS CHECKBOX LOGIC
  if (signupTermsCheckbox && btnSignupContinue) {
    signupTermsCheckbox.addEventListener('change', () => {
      const isAccepted = signupTermsCheckbox.checked;
      if (isAccepted) {
        btnSignupContinue.disabled = false;
        btnSignupContinue.classList.remove('disabled-state');
        termsHintMsg.textContent = '✓ Terms accepted. You may now continue.';
        termsHintMsg.style.color = '#10b981';
      } else {
        btnSignupContinue.disabled = true;
        btnSignupContinue.classList.add('disabled-state');
        termsHintMsg.textContent = 'Check the box above to unlock registration.';
        termsHintMsg.style.color = 'var(--text-muted)';
      }
    });
  }

  // Sign Up Form Submission
  if (formSignup) {
    formSignup.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = signupIdentifier.value.trim();
      const errEl = document.getElementById('signup-identifier-error');
      errEl.textContent = '';

      if (!identifier) {
        errEl.textContent = 'Please provide an email or phone number.';
        signupIdentifier.focus();
        return;
      }

      if (!signupTermsCheckbox.checked) {
        showToast('You must agree to the Terms and Conditions first.', 'error');
        return;
      }

      // Register via NexoraDB
      const result = window.NexoraDB.registerUser(identifier, { method: 'credentials' });
      window.NexoraDB.setCurrentUser(result.user);

      showToast('Registration successful! Choose your journey.', 'success');
      switchView('view-journey');
    });
  }

  // Login Form Submission
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = loginIdentifier.value.trim();
      const errEl = document.getElementById('login-identifier-error');
      errEl.textContent = '';

      if (!identifier) {
        errEl.textContent = 'Please enter your email or phone.';
        loginIdentifier.focus();
        return;
      }

      let user = window.NexoraDB.loginUser(identifier);
      if (!user) {
        // Auto-register session seamlessly so the user is never stuck with an error
        const res = window.NexoraDB.registerUser(identifier, { method: 'login-autocreate' });
        user = res.user;
        window.NexoraDB.setCurrentUser(user);
        showToast(`Welcome to Nexora, ${user.name}! Choose your journey.`, 'success');
        switchView('view-journey');
        return;
      }

      window.NexoraDB.setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'sponsor') {
        setupSponsorDashboard();
        switchView('view-sponsor-dashboard');
      } else if (user.role === 'entrepreneur') {
        setupEntrepreneurDashboard();
        switchView('view-entrepreneur-dashboard');
      } else {
        switchView('view-journey');
      }
    });
  }

  // Google Authentication Button & Modal
  if (btnGoogleSignup) {
    btnGoogleSignup.addEventListener('click', () => {
      if (!signupTermsCheckbox.checked) {
        showToast('Please check and agree to the Terms & Conditions before Google sign-in.', 'error');
        signupTermsCheckbox.focus();
        return;
      }
      modalGoogleAuth.classList.remove('hidden');
    });
  }

  const btnCancelGoogle = document.getElementById('btn-cancel-google');
  if (btnCancelGoogle) {
    btnCancelGoogle.addEventListener('click', () => {
      modalGoogleAuth.classList.add('hidden');
    });
  }

  document.querySelectorAll('.google-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const email = item.dataset.googleEmail;
      const name = item.dataset.googleName;
      modalGoogleAuth.classList.add('hidden');

      const result = window.NexoraDB.registerUser(email, { name, email, method: 'google' });
      window.NexoraDB.setCurrentUser(result.user);

      showToast(`Authenticated with Google as ${name}`, 'success');
      switchView('view-journey');
    });
  });

  // Terms and Privacy Modals
  const linkOpenTerms = document.getElementById('link-open-terms');
  const linkOpenPrivacy = document.getElementById('link-open-privacy');
  const btnCloseLegal = document.getElementById('btn-close-legal-modal');
  const btnAgreeLegal = document.getElementById('btn-agree-legal-close');

  [linkOpenTerms, linkOpenPrivacy].forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        modalLegal.classList.remove('hidden');
      });
    }
  });

  [btnCloseLegal, btnAgreeLegal].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        modalLegal.classList.add('hidden');
        if (btn === btnAgreeLegal) {
          signupTermsCheckbox.checked = true;
          signupTermsCheckbox.dispatchEvent(new Event('change'));
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 7. VIEW 2: CHOOSE YOUR JOURNEY
  // --------------------------------------------------------------------------
  const cardJourneySponsor = document.getElementById('card-journey-sponsor');
  const cardJourneyEntrepreneur = document.getElementById('card-journey-entrepreneur');

  if (cardJourneySponsor) {
    cardJourneySponsor.addEventListener('click', () => {
      const currentUser = window.NexoraDB.getCurrentUser();
      if (currentUser) {
        window.NexoraDB.updateUserRole(currentUser.id, 'sponsor');
      }
      switchView('view-sponsor-gate');
    });
  }

  if (cardJourneyEntrepreneur) {
    cardJourneyEntrepreneur.addEventListener('click', () => {
      const currentUser = window.NexoraDB.getCurrentUser();
      if (currentUser) {
        window.NexoraDB.updateUserRole(currentUser.id, 'entrepreneur');
        // Pre-fill email/phone in Step 1 if available
        if (currentUser.email) document.getElementById('ent-email').value = currentUser.email;
        if (currentUser.phone) document.getElementById('ent-phone').value = currentUser.phone;
        if (currentUser.name) document.getElementById('ent-fullname').value = currentUser.name;
      }
      switchView('view-entrepreneur-wizard');
    });
  }

  // --------------------------------------------------------------------------
  // 8. VIEW 3: SPONSOR QUESTIONNAIRE (PREVIOUS SPONSORSHIP)
  // --------------------------------------------------------------------------
  const btnSponsorYes = document.getElementById('btn-sponsor-yes');
  const btnSponsorNo = document.getElementById('btn-sponsor-no');
  const sponsorYesPanel = document.getElementById('sponsor-yes-form-panel');
  const sponsorNoPanel = document.getElementById('sponsor-no-welcome-panel');
  const formSponsorHistory = document.getElementById('form-sponsor-history');
  const btnEnterSponsorDash = document.getElementById('btn-enter-sponsor-dash');

  if (btnSponsorYes) {
    btnSponsorYes.addEventListener('click', () => {
      sponsorYesPanel.classList.remove('hidden');
      sponsorNoPanel.classList.add('hidden');
      btnSponsorYes.style.borderColor = 'var(--primary)';
      btnSponsorNo.style.borderColor = '#cbd5e1';
    });
  }

  if (btnSponsorNo) {
    btnSponsorNo.addEventListener('click', () => {
      sponsorNoPanel.classList.remove('hidden');
      sponsorYesPanel.classList.add('hidden');
      btnSponsorNo.style.borderColor = 'var(--primary)';
      btnSponsorYes.style.borderColor = '#cbd5e1';
    });
  }

  // Support chip toggle for investor form
  document.querySelectorAll('#sp-support-types .support-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // Submit track record
  if (formSponsorHistory) {
    formSponsorHistory.addEventListener('submit', (e) => {
      e.preventDefault();
      const spName = document.getElementById('sp-name').value.trim();
      const entName = document.getElementById('sp-entrepreneur-name').value.trim();
      const idea = document.getElementById('sp-idea').value.trim();
      const details = document.getElementById('sp-details').value.trim();

      const activeChips = Array.from(document.querySelectorAll('#sp-support-types .support-chip.active')).map(c => c.dataset.val);
      if (activeChips.length === 0) {
        showToast('Please select at least one type of support provided.', 'error');
        return;
      }

      const currentUser = window.NexoraDB.getCurrentUser();
      window.NexoraDB.saveInvestorHistory(currentUser ? currentUser.id : 'anon', {
        sponsorName: spName,
        investorName: spName,
        entrepreneurName: entName,
        ideaSponsored: idea,
        supportType: activeChips,
        details
      });

      showToast('Investment track record recorded!', 'success');
      setupSponsorDashboard();
      switchView('view-sponsor-dashboard');
    });
  }

  if (btnEnterSponsorDash) {
    btnEnterSponsorDash.addEventListener('click', () => {
      setupSponsorDashboard();
      switchView('view-sponsor-dashboard');
    });
  }

  // --------------------------------------------------------------------------
  // 9. VIEW 4: SPONSOR DASHBOARD
  // --------------------------------------------------------------------------
  const sponsorTabs = document.querySelectorAll('[data-sponsor-tab]');
  const sponsorSubtabs = {
    discover: document.getElementById('tab-content-discover'),
    saved: document.getElementById('tab-content-saved'),
    sponsorships: document.getElementById('tab-content-sponsorships'),
    messages: document.getElementById('tab-content-messages')
  };

  sponsorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSubtab = tab.dataset.sponsorTab;
      state.activeSponsorTab = targetSubtab;

      sponsorTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.keys(sponsorSubtabs).forEach(k => {
        if (sponsorSubtabs[k]) {
          sponsorSubtabs[k].classList.toggle('active', k === targetSubtab);
        }
      });

      if (targetSubtab === 'saved') renderSavedVentures();
      if (targetSubtab === 'sponsorships') renderSponsorProposals();
      if (targetSubtab === 'messages') renderSponsorChatPortal();
    });
  });

  const btnSponsorLogout = document.getElementById('btn-sponsor-logout');
  if (btnSponsorLogout) {
    btnSponsorLogout.addEventListener('click', () => {
      window.NexoraDB.logout();
      showToast('Logged out securely.', 'info');
      switchView('view-entrance');
    });
  }

  // Search & Filtering in Discover Ideas
  const sponsorSearchInput = document.getElementById('sponsor-search-input');
  const filterIndustry = document.getElementById('filter-industry');
  const filterStage = document.getElementById('filter-stage');
  const filterFunding = document.getElementById('filter-funding');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const venturesGrid = document.getElementById('ventures-grid');
  const venturesCountPill = document.getElementById('ventures-count-pill');
  const savedIdeasBadge = document.getElementById('saved-ideas-badge');

  function setupSponsorDashboard() {
    const user = window.NexoraDB.getCurrentUser();
    const greeting = document.getElementById('sp-user-greeting');
    if (greeting && user) {
      greeting.textContent = `Welcome, ${user.name || 'Investor'}`;
    }
    updateSavedIdeasCounter();
    renderVenturesFeed();
  }

  function updateSavedIdeasCounter() {
    const saved = window.NexoraDB.data.savedIdeas || [];
    if (savedIdeasBadge) savedIdeasBadge.textContent = saved.length;
  }

  function renderVenturesFeed() {
    if (!venturesGrid) return;
    const searchVal = sponsorSearchInput ? sponsorSearchInput.value : '';
    const indVal = filterIndustry ? filterIndustry.value : 'all';
    const stageVal = filterStage ? filterStage.value : 'all';
    const fundVal = filterFunding ? filterFunding.value : 'all';

    const ventures = window.NexoraDB.getVentures({
      search: searchVal,
      industry: indVal,
      stage: stageVal,
      fundingMax: fundVal
    });

    if (venturesCountPill) {
      venturesCountPill.textContent = `Showing ${ventures.length} Opportunit${ventures.length === 1 ? 'y' : 'ies'}`;
    }

    if (ventures.length === 0) {
      venturesGrid.innerHTML = `
        <div class="empty-feed">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;opacity:0.4;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No Ventures Registered Yet</h3>
          <p>Nexora is starting in a clean state with zero initial data. Be the first to register an idea as an innovator!</p>
          <button class="btn-glow-primary" id="btn-feed-create-first" style="margin-top:8px;">
            <span>Register a Venture as Innovator</span>
          </button>
        </div>
      `;
      const btnFeedCreate = venturesGrid.querySelector('#btn-feed-create-first');
      if (btnFeedCreate) {
        btnFeedCreate.addEventListener('click', () => {
          const u = window.NexoraDB.getCurrentUser();
          if (u) window.NexoraDB.updateUserRole(u.id, 'entrepreneur');
          switchView('view-entrepreneur-wizard');
        });
      }
      return;
    }

    venturesGrid.innerHTML = ventures.map(v => createVentureCardHTML(v)).join('');
    bindVentureCardEvents(venturesGrid);
  }

  function createVentureCardHTML(v) {
    const isSaved = window.NexoraDB.isIdeaSaved(v.id);
    const docStatusText = v.confidentialProtected
      ? `<span class="doc-badge-confidential">🔒 Pitch Deck (Access upon request)</span>`
      : `<span class="doc-badge-public">📄 Overview Available</span>`;

    const supportTags = (v.supportTypes || ['Financial'])
      .map(s => `<span class="mini-support-tag">${s}</span>`)
      .join('');

    return `
      <div class="venture-card" data-venture-id="${v.id}">
        <div class="venture-card-header">
          <div class="venture-main-meta">
            <h3 class="venture-title">${escapeHTML(v.title)}</h3>
            <span class="venture-founder">by ${escapeHTML(v.founderName)}</span>
          </div>
          <button class="venture-save-btn ${isSaved ? 'saved' : ''}" data-action="save" title="${isSaved ? 'Remove Bookmark' : 'Save Idea'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        <p class="venture-tagline">${escapeHTML(v.tagline)}</p>

        <div class="venture-tags-row">
          <span class="pill-industry">${escapeHTML(v.industry)}</span>
          <span class="pill-stage">${escapeHTML(v.stage)}</span>
        </div>

        <div class="venture-funding-block">
          <div>
            <div class="funding-amount-label">Funding Needed</div>
            <div class="funding-amount-val">${v.fundingDisplay || '$' + v.fundingNeeded.toLocaleString()}</div>
          </div>
          <div class="support-tags-list">
            ${supportTags}
          </div>
        </div>

        <div class="venture-doc-status">
          ${docStatusText}
        </div>

        <div class="venture-card-actions">
          <button class="btn-view-details" data-action="details">View Details</button>
          <button class="btn-express-interest" data-action="express">Express Interest</button>
        </div>
      </div>
    `;
  }

  function bindVentureCardEvents(container) {
    container.querySelectorAll('.venture-card').forEach(card => {
      const vId = card.dataset.ventureId;

      const btnSave = card.querySelector('[data-action="save"]');
      if (btnSave) {
        btnSave.addEventListener('click', (e) => {
          e.stopPropagation();
          const nowSaved = window.NexoraDB.toggleSaveIdea(vId);
          btnSave.classList.toggle('saved', nowSaved);
          btnSave.querySelector('svg').setAttribute('fill', nowSaved ? 'currentColor' : 'none');
          updateSavedIdeasCounter();
          showToast(nowSaved ? 'Idea added to your Saved list!' : 'Idea removed from Saved list.', 'info');
        });
      }

      const btnDetails = card.querySelector('[data-action="details"]');
      if (btnDetails) {
        btnDetails.addEventListener('click', () => openVentureDetailsModal(vId));
      }

      const btnExpress = card.querySelector('[data-action="express"]');
      if (btnExpress) {
        btnExpress.addEventListener('click', () => openExpressInterestModal(vId));
      }
    });
  }

  // Filter Event Listeners
  if (sponsorSearchInput) sponsorSearchInput.addEventListener('input', renderVenturesFeed);
  if (filterIndustry) filterIndustry.addEventListener('change', renderVenturesFeed);
  if (filterStage) filterStage.addEventListener('change', renderVenturesFeed);
  if (filterFunding) filterFunding.addEventListener('change', renderVenturesFeed);
  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (sponsorSearchInput) sponsorSearchInput.value = '';
      if (filterIndustry) filterIndustry.value = 'all';
      if (filterStage) filterStage.value = 'all';
      if (filterFunding) filterFunding.value = 'all';
      renderVenturesFeed();
    });
  }

  // Saved Ideas Subtab
  function renderSavedVentures() {
    const savedGrid = document.getElementById('saved-ventures-grid');
    if (!savedGrid) return;
    const savedList = window.NexoraDB.getSavedVentures();

    if (savedList.length === 0) {
      savedGrid.innerHTML = `
        <div class="empty-feed">
          <p>You haven't saved any ventures yet. Click the bookmark icon on any venture card to shortlist it here.</p>
        </div>
      `;
      return;
    }

    savedGrid.innerHTML = savedList.map(v => createVentureCardHTML(v)).join('');
    bindVentureCardEvents(savedGrid);
  }

  // My Investments Subtab
  function renderSponsorProposals() {
    const container = document.getElementById('sponsorships-list-container');
    if (!container) return;
    const user = window.NexoraDB.getCurrentUser();
    const proposals = window.NexoraDB.getInvestmentRequestsByInvestor(user ? user.id : 'anon');

    if (proposals.length === 0) {
      container.innerHTML = `
        <div class="empty-feed">
          <p>No active proposals submitted yet. Browse opportunities and click "Express Interest" to send an investment proposal.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table style="width:100%; border-collapse: collapse; text-align:left; font-size: 0.9rem;">
        <thead>
          <tr style="border-bottom: 1px solid #e2e8f0; color: var(--text-muted); font-size:0.75rem; text-transform:uppercase;">
            <th style="padding: 12px 16px;">Venture</th>
            <th style="padding: 12px 16px;">Proposed Support</th>
            <th style="padding: 12px 16px;">Amount / Tranche</th>
            <th style="padding: 12px 16px;">Status</th>
            <th style="padding: 12px 16px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${proposals.map(p => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 14px 16px; font-weight:700; color:var(--text-primary);">${escapeHTML(p.ventureTitle)}</td>
              <td style="padding: 14px 16px; color: var(--primary); font-weight:600;">${p.offeredSupport.join(', ')}</td>
              <td style="padding: 14px 16px; color:var(--text-secondary);">${escapeHTML(p.proposedAmount)}</td>
              <td style="padding: 14px 16px;"><span class="badge" style="background:#ecfdf5; color:#059669; padding:4px 8px; border-radius:4px; font-weight:600;">${p.status}</span></td>
              <td style="padding: 14px 16px;">
                <button class="btn-secondary-glow" style="padding:4px 10px; font-size:0.75rem;" onclick="openChatForVenture('${p.ventureId}')">Open Thread</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Investor Messages Subtab
  function renderSponsorChatPortal() {
    const threadList = document.getElementById('sponsor-chat-threads');
    const activeChat = document.getElementById('sponsor-active-chat');
    if (!threadList || !activeChat) return;

    const allVentures = window.NexoraDB.data.ventures;
    if (allVentures.length === 0) {
      threadList.innerHTML = `<div style="padding:16px; font-size:0.85rem; color:var(--text-muted);">No active venture discussions yet.</div>`;
      activeChat.innerHTML = `
        <div class="chat-placeholder">
          <p>Once ventures are registered, encrypted communication threads with founders will appear here.</p>
        </div>
      `;
      return;
    }

    threadList.innerHTML = allVentures.map(v => {
      const msgs = window.NexoraDB.getMessages(v.id);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : 'No messages yet';
      return `
        <div class="thread-item ${state.selectedChatVentureId === v.id ? 'active' : ''}" data-chat-vid="${v.id}">
          <div class="thread-title">${escapeHTML(v.title)}</div>
          <div class="thread-preview">${escapeHTML(lastMsg)}</div>
        </div>
      `;
    }).join('');

    threadList.querySelectorAll('.thread-item').forEach(item => {
      item.addEventListener('click', () => {
        const vid = item.dataset.chatVid;
        state.selectedChatVentureId = vid;
        renderSponsorChatPortal();
        loadConversationIntoArea(vid, activeChat, 'sponsor');
      });
    });

    if (state.selectedChatVentureId) {
      loadConversationIntoArea(state.selectedChatVentureId, activeChat, 'sponsor');
    }
  }

  function loadConversationIntoArea(ventureId, container, currentUserRole) {
    const venture = window.NexoraDB.getVentureById(ventureId);
    if (!venture) return;
    const msgs = window.NexoraDB.getMessages(ventureId);

    container.innerHTML = `
      <div style="padding:14px 18px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#ffffff;">
        <div>
          <h4 style="color:var(--text-primary); font-size:1.05rem; font-weight:700;">${escapeHTML(venture.title)}</h4>
          <span style="font-size:0.78rem; color:var(--text-muted);">Founder: ${escapeHTML(venture.founderName)}</span>
        </div>
        <span class="badge" style="background:var(--primary-light); color:var(--primary); padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">Encrypted Thread</span>
      </div>
      <div class="chat-messages-container" id="chat-msgs-flow">
        ${msgs.map(m => `
          <div class="msg-bubble ${m.senderRole === currentUserRole ? 'sent' : 'received'}">
            <div class="msg-sender">${escapeHTML(m.senderName)}</div>
            <div>${escapeHTML(m.text)}</div>
          </div>
        `).join('')}
      </div>
      <form class="chat-input-bar" id="chat-input-form">
        <input type="text" id="chat-text-input" placeholder="Type an encrypted message..." autocomplete="off" required />
        <button type="submit" class="btn-glow-primary" style="padding:8px 16px; font-size:0.85rem;">Send</button>
      </form>
    `;

    const msgsFlow = container.querySelector('#chat-msgs-flow');
    if (msgsFlow) msgsFlow.scrollTop = msgsFlow.scrollHeight;

    const chatForm = container.querySelector('#chat-input-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#chat-text-input');
        const text = input.value.trim();
        if (!text) return;

        const user = window.NexoraDB.getCurrentUser();
        const senderName = user ? user.name : (currentUserRole === 'sponsor' ? 'Investor' : 'Founder');
        window.NexoraDB.sendMessage(ventureId, currentUserRole, senderName, text);
        input.value = '';
        loadConversationIntoArea(ventureId, container, currentUserRole);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 10. VIEW 5: ENTREPRENEUR MULTI-STEP WIZARD
  // --------------------------------------------------------------------------
  const stepperNodes = document.querySelectorAll('.step-node');
  const stepperConnectors = document.querySelectorAll('.step-connector');
  const wizardPanes = document.querySelectorAll('.wizard-step-pane');
  const formEntrepreneurWizard = document.getElementById('form-entrepreneur-wizard');

  // Next / Back buttons
  document.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.nextStep, 10);
      if (validateWizardStep(state.wizardCurrentStep)) {
        saveWizardStepData(state.wizardCurrentStep);
        goToWizardStep(targetStep);
      }
    });
  });

  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.prevStep, 10);
      goToWizardStep(targetStep);
    });
  });

  document.querySelectorAll('[data-jump-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.jumpStep, 10);
      goToWizardStep(step);
    });
  });

  function goToWizardStep(stepNum) {
    state.wizardCurrentStep = stepNum;

    // Update stepper nodes
    stepperNodes.forEach(node => {
      const s = parseInt(node.dataset.step, 10);
      node.classList.toggle('active', s === stepNum);
      node.classList.toggle('completed', s < stepNum);
    });

    // Update connectors
    stepperConnectors.forEach((conn, idx) => {
      conn.classList.toggle('filled', idx < stepNum - 1);
    });

    // Update panes
    wizardPanes.forEach(pane => {
      pane.classList.remove('active');
    });
    const currentPane = document.getElementById(`wizard-step-${stepNum}`);
    if (currentPane) currentPane.classList.add('active');

    // If step 5 (review), build summary
    if (stepNum === 5) {
      buildWizardReviewSummary();
    }
  }

  function validateWizardStep(stepNum) {
    let isValid = true;

    if (stepNum === 1) {
      const name = document.getElementById('ent-fullname').value.trim();
      const age = document.getElementById('ent-age').value.trim();
      const email = document.getElementById('ent-email').value.trim();
      const phone = document.getElementById('ent-phone').value.trim();
      const org = document.getElementById('ent-org').value.trim();
      const occ = document.getElementById('ent-occupation').value.trim();
      const loc = document.getElementById('ent-location').value.trim();

      document.getElementById('err-ent-fullname').textContent = !name ? 'Full name is required.' : '';
      document.getElementById('err-ent-age').textContent = !age ? 'Age is required.' : '';
      document.getElementById('err-ent-email').textContent = !email ? 'Valid email is required.' : '';
      document.getElementById('err-ent-phone').textContent = !phone ? 'Phone number is required.' : '';
      document.getElementById('err-ent-org').textContent = !org ? 'Organization is required.' : '';
      document.getElementById('err-ent-occupation').textContent = !occ ? 'Occupation is required.' : '';
      document.getElementById('err-ent-location').textContent = !loc ? 'Location is required.' : '';

      if (!name || !age || !email || !phone || !org || !occ || !loc) isValid = false;
    } else if (stepNum === 2) {
      const vname = document.getElementById('ent-vname').value.trim();
      const ind = document.getElementById('ent-industry').value;
      const sdesc = document.getElementById('ent-shortdesc').value.trim();
      const prob = document.getElementById('ent-problem').value.trim();
      const sol = document.getElementById('ent-solution').value.trim();
      const ben = document.getElementById('ent-beneficiaries').value.trim();
      const uniq = document.getElementById('ent-unique').value.trim();

      document.getElementById('err-ent-vname').textContent = !vname ? 'Venture name is required.' : '';
      document.getElementById('err-ent-industry').textContent = !ind ? 'Please select an industry.' : '';
      document.getElementById('err-ent-shortdesc').textContent = !sdesc ? 'Short description is required.' : '';
      document.getElementById('err-ent-problem').textContent = !prob ? 'Problem statement is required.' : '';
      document.getElementById('err-ent-solution').textContent = !sol ? 'Proposed solution is required.' : '';
      document.getElementById('err-ent-beneficiaries').textContent = !ben ? 'Target beneficiaries required.' : '';
      document.getElementById('err-ent-unique').textContent = !uniq ? 'Unique proposition is required.' : '';

      if (!vname || !ind || !sdesc || !prob || !sol || !ben || !uniq) isValid = false;
    } else if (stepNum === 3) {
      const amt = document.getElementById('ent-funding-amount').value.trim();
      const use = document.getElementById('ent-funding-use').value.trim();
      const out = document.getElementById('ent-expected-outcome').value.trim();
      const checkedTypes = Array.from(document.querySelectorAll('#ent-support-checkboxes input:checked'));

      document.getElementById('err-ent-funding-amount').textContent = !amt ? 'Funding amount is required.' : '';
      document.getElementById('err-ent-support-types').textContent = checkedTypes.length === 0 ? 'Select at least one support type.' : '';
      document.getElementById('err-ent-funding-use').textContent = !use ? 'Please explain how funding will be used.' : '';
      document.getElementById('err-ent-expected-outcome').textContent = !out ? 'Expected outcome is required.' : '';

      if (!amt || checkedTypes.length === 0 || !use || !out) isValid = false;
    } else if (stepNum === 4) {
      const docConfirm = document.getElementById('ent-doc-confirm-checkbox').checked;
      const errDoc = document.getElementById('err-ent-doc-confirm');
      if (!docConfirm) {
        errDoc.textContent = 'You must confirm accuracy and authorization to share these documents.';
        isValid = false;
      } else {
        errDoc.textContent = '';
      }
    }

    if (!isValid) {
      showToast('Please fill all required fields correctly to continue.', 'error');
    }
    return isValid;
  }

  function saveWizardStepData(stepNum) {
    if (stepNum === 1) {
      state.wizardData.personal = {
        fullName: document.getElementById('ent-fullname').value.trim(),
        age: document.getElementById('ent-age').value.trim(),
        gender: document.getElementById('ent-gender').value,
        email: document.getElementById('ent-email').value.trim(),
        phone: document.getElementById('ent-phone').value.trim(),
        org: document.getElementById('ent-org').value.trim(),
        occupation: document.getElementById('ent-occupation').value.trim(),
        location: document.getElementById('ent-location').value.trim()
      };
    } else if (stepNum === 2) {
      const selectedStage = document.querySelector('input[name="ent-stage"]:checked');
      state.wizardData.venture = {
        name: document.getElementById('ent-vname').value.trim(),
        industry: document.getElementById('ent-industry').value,
        shortDescription: document.getElementById('ent-shortdesc').value.trim(),
        problem: document.getElementById('ent-problem').value.trim(),
        solution: document.getElementById('ent-solution').value.trim(),
        beneficiaries: document.getElementById('ent-beneficiaries').value.trim(),
        uniqueValue: document.getElementById('ent-unique').value.trim(),
        stage: selectedStage ? selectedStage.value : 'Idea'
      };
    } else if (stepNum === 3) {
      const checkedTypes = Array.from(document.querySelectorAll('#ent-support-checkboxes input:checked')).map(c => c.value);
      state.wizardData.funding = {
        amount: document.getElementById('ent-funding-amount').value.trim(),
        supportTypes: checkedTypes,
        fundingUse: document.getElementById('ent-funding-use').value.trim(),
        expectedOutcome: document.getElementById('ent-expected-outcome').value.trim()
      };
    }
  }

  // Drag & Drop Document Upload
  const dropZone = document.getElementById('drop-zone');
  const fileInputElement = document.getElementById('file-input-element');
  const btnBrowseFiles = document.getElementById('btn-browse-files');
  const uploadedFilesList = document.getElementById('uploaded-files-list');
  const uploadFilesCount = document.getElementById('upload-files-count');

  if (btnBrowseFiles && fileInputElement) {
    btnBrowseFiles.addEventListener('click', () => fileInputElement.click());
  }
  if (dropZone && fileInputElement) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      handleFilesSelected(e.dataTransfer.files);
    });
    fileInputElement.addEventListener('change', () => {
      handleFilesSelected(fileInputElement.files);
    });
  }

  function handleFilesSelected(files) {
    if (!files || files.length === 0) return;
    const allowedExts = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        showToast(`Invalid file format: ${file.name}. Only PDF, PPT, DOC & Images allowed.`, 'error');
        return;
      }
      if (file.size > maxSizeBytes) {
        showToast(`File too large: ${file.name}. Max limit is 25MB.`, 'error');
        return;
      }

      const fileObj = {
        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || ext,
        isConfidential: true
      };

      state.wizardData.documents.push(fileObj);
      showToast(`Uploaded: ${file.name}`, 'success');
    });

    renderUploadedFilesList();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderUploadedFilesList() {
    if (!uploadedFilesList) return;
    const docs = state.wizardData.documents;
    if (uploadFilesCount) uploadFilesCount.textContent = docs.length;

    if (docs.length === 0) {
      uploadedFilesList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">No documents uploaded yet. (Optional, you can also add them later from your dashboard)</p>`;
      return;
    }

    uploadedFilesList.innerHTML = docs.map(doc => {
      let icon = '📄';
      if (doc.name.includes('.pdf')) icon = '📕';
      if (doc.name.includes('.ppt')) icon = '📊';
      if (doc.name.includes('.doc')) icon = '📘';

      return `
        <div class="uploaded-file-item" data-doc-id="${doc.id}">
          <div class="file-info">
            <span class="file-ext-icon">${icon}</span>
            <div class="file-details">
              <span class="file-name">${escapeHTML(doc.name)}</span>
              <span class="file-size">${doc.size}</span>
            </div>
          </div>
          <div class="file-actions">
            <button type="button" class="btn-privacy-toggle ${doc.isConfidential ? 'confidential' : ''}" data-action="toggle-confidential">
              ${doc.isConfidential ? '🔒 Confidential' : '🌐 Public'}
            </button>
            <button type="button" class="btn-remove-file" data-action="remove-doc" title="Remove File">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    uploadedFilesList.querySelectorAll('.uploaded-file-item').forEach(item => {
      const docId = item.dataset.docId;
      const btnToggle = item.querySelector('[data-action="toggle-confidential"]');
      if (btnToggle) {
        btnToggle.addEventListener('click', () => {
          const doc = state.wizardData.documents.find(d => d.id === docId);
          if (doc) {
            doc.isConfidential = !doc.isConfidential;
            renderUploadedFilesList();
          }
        });
      }
      const btnRemove = item.querySelector('[data-action="remove-doc"]');
      if (btnRemove) {
        btnRemove.addEventListener('click', () => {
          state.wizardData.documents = state.wizardData.documents.filter(d => d.id !== docId);
          renderUploadedFilesList();
        });
      }
    });
  }

  function buildWizardReviewSummary() {
    const p = state.wizardData.personal;
    const v = state.wizardData.venture;
    const f = state.wizardData.funding;
    const d = state.wizardData.documents;

    document.getElementById('summary-personal-grid').innerHTML = `
      <div class="review-item"><span class="review-lbl">Founder Name</span><span class="review-val">${escapeHTML(p.fullName || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Email</span><span class="review-val">${escapeHTML(p.email || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Phone</span><span class="review-val">${escapeHTML(p.phone || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Organization</span><span class="review-val">${escapeHTML(p.org || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Location</span><span class="review-val">${escapeHTML(p.location || '')}</span></div>
    `;

    document.getElementById('summary-venture-grid').innerHTML = `
      <div class="review-item"><span class="review-lbl">Venture Name</span><span class="review-val">${escapeHTML(v.name || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Industry</span><span class="review-val">${escapeHTML(v.industry || '')}</span></div>
      <div class="review-item"><span class="review-lbl">Development Stage</span><span class="review-val">${escapeHTML(v.stage || '')}</span></div>
      <div class="review-item" style="grid-column:1/-1;"><span class="review-lbl">Tagline</span><span class="review-val">${escapeHTML(v.shortDescription || '')}</span></div>
    `;

    document.getElementById('summary-funding-grid').innerHTML = `
      <div class="review-item"><span class="review-lbl">Target Funding</span><span class="review-val" style="color:var(--green); font-weight:700;">$${parseFloat(f.amount || 0).toLocaleString()}</span></div>
      <div class="review-item"><span class="review-lbl">Support Types</span><span class="review-val">${(f.supportTypes || []).join(', ')}</span></div>
      <div class="review-item" style="grid-column:1/-1;"><span class="review-lbl">Use of Funds</span><span class="review-val">${escapeHTML(f.fundingUse || '')}</span></div>
    `;

    document.getElementById('summary-docs-list').innerHTML = d.length === 0
      ? `<span style="font-size:0.85rem; color:var(--text-muted);">No documents attached (can be added later)</span>`
      : d.map(doc => `<div style="font-size:0.85rem; padding:4px 0;">📎 ${escapeHTML(doc.name)} (${doc.size}) — ${doc.isConfidential ? '🔒 Confidential' : '🌐 Public'}</div>`).join('');
  }

  // Submit Venture
  if (formEntrepreneurWizard) {
    formEntrepreneurWizard.addEventListener('submit', (e) => {
      e.preventDefault();
      saveWizardStepData(4);

      const currentUser = window.NexoraDB.getCurrentUser();
      const newVenture = window.NexoraDB.createVenture({
        userId: currentUser ? currentUser.id : 'usr_' + Date.now(),
        personal: state.wizardData.personal,
        venture: state.wizardData.venture,
        funding: state.wizardData.funding,
        documents: state.wizardData.documents
      });

      // Show celebration modal
      modalCelebration.classList.remove('hidden');
    });
  }

  const btnProceedToEntDash = document.getElementById('btn-proceed-to-ent-dash');
  if (btnProceedToEntDash) {
    btnProceedToEntDash.addEventListener('click', () => {
      modalCelebration.classList.add('hidden');
      setupEntrepreneurDashboard();
      switchView('view-entrepreneur-dashboard');
    });
  }

  // --------------------------------------------------------------------------
  // 11. VIEW 6: ENTREPRENEUR DASHBOARD
  // --------------------------------------------------------------------------
  const entTabs = document.querySelectorAll('[data-ent-tab]');
  const entSubtabs = {
    'my-venture': document.getElementById('ent-tab-my-venture'),
    'edit-venture': document.getElementById('ent-tab-edit-venture'),
    'documents': document.getElementById('ent-tab-documents'),
    'requests': document.getElementById('ent-tab-requests'),
    'messages': document.getElementById('ent-tab-messages'),
    'privacy': document.getElementById('ent-tab-privacy')
  };

  entTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSubtab = tab.dataset.entTab;
      state.activeEntTab = targetSubtab;

      entTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.keys(entSubtabs).forEach(k => {
        if (entSubtabs[k]) {
          entSubtabs[k].classList.toggle('active', k === targetSubtab);
        }
      });

      if (targetSubtab === 'edit-venture') populateEditVentureForm();
      if (targetSubtab === 'documents') renderEntVaultFiles();
      if (targetSubtab === 'requests') renderEntRequests();
      if (targetSubtab === 'messages') renderEntChatPortal();
    });
  });

  const btnEntLogout = document.getElementById('btn-ent-logout');
  if (btnEntLogout) {
    btnEntLogout.addEventListener('click', () => {
      window.NexoraDB.logout();
      showToast('Logged out securely.', 'info');
      switchView('view-entrance');
    });
  }

  function setupEntrepreneurDashboard() {
    const user = window.NexoraDB.getCurrentUser();
    const greeting = document.getElementById('ent-user-greeting');
    if (greeting && user) {
      greeting.textContent = `Welcome, ${user.name || 'Founder'}`;
    }

    renderLiveVentureView();
    updateEntMetrics();
  }

  function updateEntMetrics() {
    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const v = myVentures.length > 0 ? myVentures[0] : window.NexoraDB.data.ventures[0];

    const metricViews = document.getElementById('metric-views');
    const metricInquiries = document.getElementById('metric-inquiries');
    const entInquiriesBadge = document.getElementById('ent-inquiries-badge');

    if (v) {
      if (metricViews) metricViews.textContent = v.views || 0;
      if (metricInquiries) metricInquiries.textContent = v.inquiries || 0;
      if (entInquiriesBadge) entInquiriesBadge.textContent = v.inquiries || 0;
    }
  }

  function renderLiveVentureView() {
    const container = document.getElementById('ent-live-venture-container');
    if (!container) return;
    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const venture = myVentures.length > 0 ? myVentures[0] : (window.NexoraDB.data.ventures.length > 0 ? window.NexoraDB.data.ventures[0] : null);

    if (!venture) {
      container.innerHTML = `
        <div class="empty-feed">
          <h3>No Venture Registered Yet</h3>
          <p>You haven't submitted your innovation idea yet. Launch your venture using the multi-step founder wizard!</p>
          <button class="btn-glow-primary" onclick="switchView('view-entrepreneur-wizard')" style="margin-top:8px;">
            <span>Submit Your Innovation Idea</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="glass-card" style="display:flex; flex-direction:column; gap:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="badge" style="background:var(--primary-light); color:var(--primary); padding:4px 10px; border-radius:4px; font-size:0.75rem; font-weight:700;">${venture.industry}</span>
            <span class="badge" style="background:var(--cyan-light); color:var(--cyan); padding:4px 10px; border-radius:4px; font-size:0.75rem; font-weight:700; margin-left:6px;">${venture.stage}</span>
            <h2 style="font-size:2rem; font-weight:800; color:var(--text-primary); margin-top:8px;">${escapeHTML(venture.title)}</h2>
            <p style="font-size:1.05rem; color:var(--primary); font-style:italic;">"${escapeHTML(venture.tagline)}"</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Funding Target</div>
            <div style="font-size:1.6rem; font-weight:800; color:#059669;">${venture.fundingDisplay || '$' + venture.fundingNeeded.toLocaleString()}</div>
          </div>
        </div>

        <div class="grid-form two-cols" style="gap:20px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Problem Statement</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.problem || 'Not specified')}</p>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Proposed Solution</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.solution || 'Not specified')}</p>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:16px;">
          <div style="font-size:0.85rem; color:var(--text-muted);">
            Shield Status: <strong>${venture.confidentialProtected ? '🔒 Strict Confidentiality Active' : '🌐 Public Preview'}</strong>
          </div>
          <button class="btn-secondary-glow" onclick="document.querySelector('[data-ent-tab=\\'edit-venture\\']').click()">
            Edit Venture Highlights
          </button>
        </div>
      </div>
    `;
  }

  function populateEditVentureForm() {
    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const venture = myVentures.length > 0 ? myVentures[0] : (window.NexoraDB.data.ventures.length > 0 ? window.NexoraDB.data.ventures[0] : null);
    if (!venture) return;

    document.getElementById('edit-vname').value = venture.title || '';
    document.getElementById('edit-tagline').value = venture.tagline || '';
    document.getElementById('edit-industry').value = venture.industry || 'AI & Robotics';
    document.getElementById('edit-stage').value = venture.stage || 'Prototype';
    document.getElementById('edit-funding').value = venture.fundingNeeded || 150000;
    document.getElementById('edit-problem').value = venture.problem || '';
    document.getElementById('edit-solution').value = venture.solution || '';

    const editForm = document.getElementById('form-edit-venture');
    editForm.onsubmit = (e) => {
      e.preventDefault();
      const updated = window.NexoraDB.updateVenture(venture.id, {
        title: document.getElementById('edit-vname').value.trim(),
        tagline: document.getElementById('edit-tagline').value.trim(),
        industry: document.getElementById('edit-industry').value,
        stage: document.getElementById('edit-stage').value,
        fundingNeeded: parseFloat(document.getElementById('edit-funding').value),
        fundingDisplay: '$' + parseFloat(document.getElementById('edit-funding').value).toLocaleString(),
        problem: document.getElementById('edit-problem').value.trim(),
        solution: document.getElementById('edit-solution').value.trim()
      });
      showToast('Venture highlights updated successfully!', 'success');
      renderLiveVentureView();
      document.querySelector('[data-ent-tab="my-venture"]').click();
    };
  }

  function renderEntVaultFiles() {
    const list = document.getElementById('ent-vault-files-list');
    if (!list) return;
    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const venture = myVentures.length > 0 ? myVentures[0] : (window.NexoraDB.data.ventures.length > 0 ? window.NexoraDB.data.ventures[0] : null);
    const docs = venture ? (venture.documents || []) : [];

    if (docs.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); font-size:0.88rem;">No documents uploaded for this venture yet.</p>`;
      return;
    }

    list.innerHTML = docs.map(doc => `
      <div class="uploaded-file-item">
        <div class="file-info">
          <span class="file-ext-icon">📄</span>
          <div class="file-details">
            <span class="file-name">${escapeHTML(doc.name)}</span>
            <span class="file-size">${doc.size || '2.4 MB'}</span>
          </div>
        </div>
        <div class="file-actions">
          <span class="btn-privacy-toggle ${doc.isConfidential ? 'confidential' : ''}">
            ${doc.isConfidential ? '🔒 Confidential' : '🌐 Public Overview'}
          </span>
        </div>
      </div>
    `).join('');
  }

  function renderEntRequests() {
    const container = document.getElementById('ent-requests-container');
    if (!container) return;
    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const venture = myVentures.length > 0 ? myVentures[0] : (window.NexoraDB.data.ventures.length > 0 ? window.NexoraDB.data.ventures[0] : null);

    const requests = venture ? window.NexoraDB.getInvestmentRequestsForVenture(venture.id) : [];

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="empty-feed">
          <p>No investment proposals received yet. As investors browse your venture, proposals will appear here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(r => `
      <div class="glass-card" style="display:flex; flex-direction:column; gap:12px; border-color:#e2e8f0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="font-size:1.1rem; color:var(--text-primary); font-weight:700;">${escapeHTML(r.sponsorName || r.investorName || 'Accredited Investor')}</h4>
          <span class="badge" style="background:#ecfdf5; color:#059669; font-size:0.75rem; padding:4px 8px; border-radius:4px; font-weight:600;">${r.status}</span>
        </div>
        <div style="font-size:0.85rem; color:var(--primary); font-weight:600;">Support: ${r.offeredSupport.join(', ')} • ${escapeHTML(r.proposedAmount)}</div>
        <p style="font-size:0.88rem; color:var(--text-secondary); background:#f8fafc; border:1px solid #e2e8f0; padding:10px 14px; border-radius:8px;">"${escapeHTML(r.message)}"</p>
        <div style="display:flex; justify-content:flex-end;">
          <button class="btn-glow-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="openChatForVenture('${r.ventureId}', 'entrepreneur')">
            Reply via Encrypted Chat
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderEntChatPortal() {
    const threadList = document.getElementById('ent-chat-threads');
    const activeChat = document.getElementById('ent-active-chat');
    if (!threadList || !activeChat) return;

    const user = window.NexoraDB.getCurrentUser();
    const myVentures = window.NexoraDB.getMyVentures(user ? user.id : '');
    const ventures = myVentures.length > 0 ? myVentures : [window.NexoraDB.data.ventures[0]];

    threadList.innerHTML = ventures.map(v => {
      const msgs = window.NexoraDB.getMessages(v.id);
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : 'No messages yet';
      return `
        <div class="thread-item active" data-chat-vid="${v.id}">
          <div class="thread-title">${escapeHTML(v.title)}</div>
          <div class="thread-preview">${escapeHTML(lastMsg)}</div>
        </div>
      `;
    }).join('');

    if (ventures.length > 0) {
      loadConversationIntoArea(ventures[0].id, activeChat, 'entrepreneur');
    }
  }

  // Helper to open chat from any button
  window.openChatForVenture = function(vid, role = 'sponsor') {
    state.selectedChatVentureId = vid;
    if (role === 'sponsor') {
      document.querySelector('[data-sponsor-tab="messages"]').click();
    } else {
      document.querySelector('[data-ent-tab="messages"]').click();
    }
  };

  // --------------------------------------------------------------------------
  // 12. MODAL INTERACTIONS (VENTURE DETAILS & EXPRESS INTEREST)
  // --------------------------------------------------------------------------
  function openVentureDetailsModal(ventureId) {
    const venture = window.NexoraDB.getVentureById(ventureId);
    if (!venture) return;
    state.selectedVentureForModal = venture;

    const body = document.getElementById('modal-venture-body');
    const docs = venture.documents || [];

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:22px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; gap:8px; margin-bottom:6px;">
              <span class="pill-industry">${venture.industry}</span>
              <span class="pill-stage">${venture.stage}</span>
            </div>
            <h2 style="font-size:2rem; font-weight:800; color:var(--text-primary);">${escapeHTML(venture.title)}</h2>
            <p style="font-size:1.05rem; color:var(--primary); font-style:italic;">"${escapeHTML(venture.tagline)}"</p>
            <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Founder: <strong>${escapeHTML(venture.founderName)}</strong></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Funding Target</div>
            <div style="font-size:1.8rem; font-weight:800; color:#059669;">${venture.fundingDisplay || '$' + venture.fundingNeeded.toLocaleString()}</div>
          </div>
        </div>

        <div class="grid-form two-cols">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Problem Statement</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.problem)}</p>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Proposed Solution</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.solution)}</p>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Beneficiaries & Market</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.beneficiaries)}</p>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
            <h4 style="color:var(--primary); margin-bottom:8px; font-weight:700;">Unique Competitive Edge</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6;">${escapeHTML(venture.uniqueValue)}</p>
          </div>
        </div>

        <div>
          <h4 style="color:var(--text-primary); margin-bottom:10px; font-weight:700;">Attached Materials</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${docs.map(doc => `
              <div class="uploaded-file-item">
                <div class="file-info">
                  <span class="file-ext-icon">📄</span>
                  <div class="file-details">
                    <span class="file-name">${escapeHTML(doc.name)}</span>
                    <span class="file-size">${doc.size || '3.2 MB'}</span>
                  </div>
                </div>
                <div>
                  ${doc.isConfidential
                    ? `<span class="badge" style="background:var(--primary-light); color:var(--primary); padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">🔒 Confidential (Access Upon Request)</span>`
                    : `<button class="btn-secondary-glow" style="padding:4px 10px; font-size:0.75rem;" onclick="alert('Viewing preview of: ${escapeHTML(doc.name)}')">Preview Document</button>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:18px;">
          <button class="btn-outline-back" id="btn-close-detail-inner">Close Overview</button>
          <button class="btn-glow-primary" id="btn-open-express-from-modal">
            <span>Submit Investment Proposal</span>
          </button>
        </div>
      </div>
    `;

    modalVentureDetail.classList.remove('hidden');

    document.getElementById('btn-close-detail-inner').onclick = () => modalVentureDetail.classList.add('hidden');
    document.getElementById('btn-open-express-from-modal').onclick = () => {
      modalVentureDetail.classList.add('hidden');
      openExpressInterestModal(venture.id);
    };
  }

  const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
  if (btnCloseDetailModal) {
    btnCloseDetailModal.onclick = () => modalVentureDetail.classList.add('hidden');
  }

  function openExpressInterestModal(ventureId) {
    const venture = window.NexoraDB.getVentureById(ventureId);
    if (!venture) return;

    document.getElementById('interest-venture-id').value = venture.id;
    document.getElementById('interest-modal-venture-title').textContent = `Investment Proposal: ${venture.title}`;

    const user = window.NexoraDB.getCurrentUser();
    if (user) {
      document.getElementById('interest-sponsor-name').value = user.name || '';
      document.getElementById('interest-sponsor-email').value = user.email || '';
    }

    modalExpressInterest.classList.remove('hidden');
  }

  const btnCloseInterestModal = document.getElementById('btn-close-interest-modal');
  if (btnCloseInterestModal) {
    btnCloseInterestModal.onclick = () => modalExpressInterest.classList.add('hidden');
  }

  // Support chips in express modal
  document.querySelectorAll('#interest-support-chips .support-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  const formExpressInterest = document.getElementById('form-express-interest');
  if (formExpressInterest) {
    formExpressInterest.addEventListener('submit', (e) => {
      e.preventDefault();
      const vId = document.getElementById('interest-venture-id').value;
      const spName = document.getElementById('interest-sponsor-name').value.trim();
      const spEmail = document.getElementById('interest-sponsor-email').value.trim();
      const amount = document.getElementById('interest-proposed-amount').value.trim();
      const msg = document.getElementById('interest-message').value.trim();

      const offered = Array.from(document.querySelectorAll('#interest-support-chips .support-chip.active')).map(c => c.dataset.val);

      const user = window.NexoraDB.getCurrentUser();
      window.NexoraDB.expressInterest(vId, {
        sponsorId: user ? user.id : 'anon_investor',
        investorId: user ? user.id : 'anon_investor',
        sponsorName: spName,
        investorName: spName,
        sponsorEmail: spEmail,
        investorEmail: spEmail,
        proposedAmount: amount,
        offeredSupport: offered,
        message: msg
      });

      modalExpressInterest.classList.add('hidden');
      showToast('Investment proposal sent successfully to the founder!', 'success');
      renderVenturesFeed();
    });
  }

  // --------------------------------------------------------------------------
  // 13. UTILITIES
  // --------------------------------------------------------------------------
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Check initial session
  const activeSession = window.NexoraDB.getCurrentUser();
  if (activeSession) {
    if (activeSession.role === 'sponsor') {
      setupSponsorDashboard();
      switchView('view-sponsor-dashboard');
    } else if (activeSession.role === 'entrepreneur') {
      setupEntrepreneurDashboard();
      switchView('view-entrepreneur-dashboard');
    }
  }
});

