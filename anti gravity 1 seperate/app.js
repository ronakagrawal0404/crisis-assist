/**
 * CRISIS ASSIST - MAIN APPLICATION CONTROLLER
 * High fidelity emergency management interface.
 */

// Initialize lucide icons on load
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  app.init();
});

const app = {
  currentView: 'landing',
  activeModule: null,
  activeStep: 0,
  totalSteps: 1,
  answers: {},
  particles: [],
  mapSVG: null,
  mapFilter: 'all',
  
  settings: {
    theme: 'dark',
    accent: 'orange',
    compactMode: false,
    language: 'en',
    dateFormat: 'local',
    aiStyle: 'balanced',
    aiLength: 'medium',
    aiFollowups: true,
    aiPrompts: true,
    privacyStore: true,
    privacyDuration: 'never',
    locationGPS: false,
    locationManual: '',
    locationRecs: true,
    contacts: []
  },
  
  chatHistory: [],
  
  init() {
    this.loadSettings();
    this.setupNavigation();
    this.setupParallax();
    this.generateParticles();
    this.setupDragAndDrop();
    this.setupSettingsAccordion();
    this.renderHistoryItems();
    
    // Listen for scroll to toggle header styling
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  },

  // ==========================================================================
  // SPA NAVIGATION & ROUTING
  // ==========================================================================
  
  setupNavigation() {
    // Logo click handles scroll to top and landing page
    document.querySelector('.logo').addEventListener('click', (e) => {
      e.preventDefault();
      this.showPage('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  showPage(viewId) {
    this.currentView = viewId;
    
    // Hide all main views
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('workspace-view').classList.add('hidden');
    
    // Deactivate header links
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('nav-dashboard').classList.remove('active');

    if (viewId === 'landing') {
      document.getElementById('landing-view').classList.remove('hidden');
      document.getElementById('nav-home').classList.add('active');
    } else if (viewId === 'dashboard') {
      document.getElementById('dashboard-view').classList.remove('hidden');
      document.getElementById('nav-dashboard').classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    this.toggleMobileMenu(true); // close mobile menu if open
  },

  toggleMobileMenu(forceClose = false) {
    const navLinks = document.querySelector('.nav-links');
    if (forceClose) {
      navLinks.style.display = '';
      return;
    }
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'rgba(8, 6, 18, 0.95)';
      navLinks.style.backdropFilter = 'blur(10px)';
      navLinks.style.padding = '1.5rem';
      navLinks.style.borderBottom = '1px solid var(--border-glass)';
      navLinks.style.gap = '1rem';
    }
  },

  scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
      this.showPage('landing');
      section.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // ==========================================================================
  // PARALLAX & HERO DECORATIONS
  // ==========================================================================

  setupParallax() {
    const heroBg = document.getElementById('hero-parallax-bg');
    const hero = document.getElementById('hero-section');
    
    // Parallax scrolling
    window.addEventListener('scroll', () => {
      if (this.currentView === 'landing') {
        const scrollOffset = window.pageYOffset;
        heroBg.style.transform = `scale(1.05) translateY(${scrollOffset * 0.15}px)`;
      }
    });

    // Mouse tilt effect on floating elements
    hero.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 50;
      const y = (window.innerHeight / 2 - e.clientY) / 50;
      
      const fg1 = document.querySelector('.fg-1');
      const fg2 = document.querySelector('.fg-2');
      const fg3 = document.querySelector('.fg-3');
      
      fg1.style.transform = `translate(${x * 1.5}px, ${y * 1.5}px)`;
      fg2.style.transform = `translate(${-x * 2}px, ${y * 2}px)`;
      fg3.style.transform = `translate(${x * 0.8}px, ${-y * 0.8}px)`;
    });
  },

  generateParticles() {
    const container = document.getElementById('global-particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 8 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random speed and delay
      particle.style.animationDuration = `${Math.random() * 12 + 8}s`;
      particle.style.animationDelay = `${Math.random() * -10}s`;
      particle.style.opacity = Math.random() * 0.4 + 0.1;
      
      // Assign subtle gradient tints
      if (Math.random() > 0.5) {
        particle.style.background = 'rgba(0, 230, 118, 0.35)'; // emerald
      } else {
        particle.style.background = 'rgba(255, 122, 0, 0.35)'; // orange
      }
      
      container.appendChild(particle);
    }
  },

  // ==========================================================================
  // DRAG & DROP FOR CONTENT ANALYZER
  // ==========================================================================

  setupDragAndDrop() {
    // Drag over and leave events will be wired during module instantiation
  },

  // ==========================================================================
  // SPA MODULE CONTROLLERS & DIAGNOSTICS DATA
  // ==========================================================================

  openModule(moduleKey) {
    this.activeModule = moduleKey;
    this.activeStep = 0;
    this.answers = {};
    
    // Hide main landing and dashboard views, show workspace view
    document.getElementById('landing-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('workspace-view').classList.remove('hidden');
    
    // Setup Header details based on active module
    const breadcrumb = document.getElementById('workspace-breadcrumb-active');
    const title = document.getElementById('workspace-module-title');
    const subtitle = document.getElementById('workspace-module-subtitle');
    const icon = document.getElementById('workspace-module-icon');
    const iconContainer = document.getElementById('workspace-module-icon-container');
    
    // Reset classes
    iconContainer.className = 'dashboard-module-icon';
    
    // Module setup details
    const modulesInfo = {
      phone: {
        title: 'Lost Phone Recovery',
        breadcrumb: 'Lost Phone Recovery',
        subtitle: 'Intelligent questioning and remote protection commands for Android and iOS devices.',
        icon: 'smartphone',
        colorClass: 'orange-theme'
      },
      fraud: {
        title: 'Cyber Fraud Assistant',
        breadcrumb: 'Cyber Fraud Assistant',
        subtitle: 'Emergency workflow to suspend assets, protect banking credentials, and document evidence.',
        icon: 'shield-alert',
        colorClass: 'cyan-card'
      },
      wallet: {
        title: 'Lost Wallet Recovery',
        breadcrumb: 'Lost Wallet Recovery',
        subtitle: 'Customized replacement checklists tailored to specific cards and documents lost.',
        icon: 'wallet',
        colorClass: 'orange-theme'
      },
      travel: {
        title: 'Travel Emergency Assistant',
        breadcrumb: 'Travel Emergency Help',
        subtitle: 'Interactive map navigation widget, transport re-routes, and emergency service directory.',
        icon: 'map-pin',
        colorClass: 'purple-card'
      },
      analyzer: {
        title: 'AI Scam & Content Analyzer',
        breadcrumb: 'AI Scam Analyzer',
        subtitle: 'Unified workspace for scanning links, SMS texts, screenshots, and deepfake media.',
        icon: 'file-search',
        colorClass: 'orange-theme'
      },
      ai_assistant: {
        title: 'AI Conversational Assistant',
        breadcrumb: 'AI Assistant',
        subtitle: 'Get intelligent guidance for emergency recovery and general everyday questions.',
        icon: 'bot',
        colorClass: 'purple-card'
      }
    };

    const mod = modulesInfo[moduleKey];
    breadcrumb.textContent = mod.breadcrumb;
    title.textContent = mod.title;
    subtitle.textContent = mod.subtitle;
    icon.setAttribute('data-lucide', mod.icon);
    
    if (mod.colorClass === 'cyan-card') {
      iconContainer.classList.add('cyan-theme');
      iconContainer.style.color = 'var(--accent-green)';
      iconContainer.style.borderColor = 'rgba(0, 230, 118, 0.2)';
      iconContainer.style.background = 'rgba(0, 230, 118, 0.08)';
    } else if (mod.colorClass === 'purple-card') {
      iconContainer.classList.add('purple-theme');
      iconContainer.style.color = 'var(--accent-purple)';
      iconContainer.style.borderColor = 'rgba(124, 77, 255, 0.2)';
      iconContainer.style.background = 'rgba(124, 77, 255, 0.08)';
    } else {
      iconContainer.style.color = 'var(--accent-orange)';
      iconContainer.style.borderColor = 'rgba(255, 122, 0, 0.2)';
      iconContainer.style.background = 'rgba(255, 122, 0, 0.08)';
    }

    lucide.createIcons();

    // Toggle universal input panel
    const universalInput = document.getElementById('workspace-universal-input-container');
    if (universalInput) {
      if (moduleKey === 'ai_assistant') {
        universalInput.classList.add('hidden');
      } else {
        universalInput.classList.remove('hidden');
        document.getElementById('universal-situation-input').value = '';
      }
    }

    // Reset results side to default waiting state
    document.getElementById('results-waiting-placeholder').classList.remove('hidden');
    document.getElementById('results-loading-skeleton').classList.add('hidden');
    document.getElementById('results-active-content').classList.add('hidden');
    document.getElementById('results-special-widget').innerHTML = '';
    document.getElementById('results-checklist-container').innerHTML = '';

    // Initialize Question Step on Left Panel
    this.renderModuleQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==========================================================================
  // RENDER DYNAMIC QUESTIONS & FLOW
  // ==========================================================================

  renderModuleQuestions() {
    const container = document.getElementById('workspace-questions-container');
    container.innerHTML = '';
    
    const progress = document.getElementById('workspace-progress-bar');
    progress.style.width = '0%';

    if (this.activeModule === 'ai_assistant') {
      this.renderChatInterface();
      return;
    }

    const moduleQuestions = {
      phone: [
        {
          key: 'platform',
          text: 'What operating system is the lost mobile phone running?',
          options: [
            { text: 'Apple iPhone (iOS)', value: 'ios' },
            { text: 'Android Device (Samsung, Pixel, etc.)', value: 'android' }
          ]
        },
        {
          key: 'incident_type',
          text: 'What was the nature of the incident?',
          options: [
            { text: 'I misplaced it (Lost)', value: 'lost' },
            { text: 'It was pickpocketed or forcibly taken (Stolen)', value: 'stolen' }
          ]
        },
        {
          key: 'missing_time',
          text: 'Approximate time since the device went missing?',
          options: [
            { text: 'Less than 1 hour ago', value: '1h' },
            { text: '1 to 6 hours ago', value: '6h' },
            { text: 'Over 6 hours / Unknown', value: 'long' }
          ]
        },
        {
          key: 'tracking',
          text: 'Was device location tracking enabled on the phone?',
          options: [
            { text: 'Yes, location services were active', value: 'yes' },
            { text: 'No / Not sure', value: 'no' }
          ]
        },
        {
          key: 'find_my',
          text: 'Was "Find My iPhone" or "Find My Device" enabled?',
          options: [
            { text: 'Yes, I set it up previously', value: 'yes' },
            { text: 'No, it was not configured', value: 'no' }
          ]
        },
        {
          key: 'sim_status',
          text: 'Is the physical SIM or eSIM inside the phone still active?',
          options: [
            { text: 'Yes, cellular network is active', value: 'yes' },
            { text: 'No, I have suspended it / SIM card removed', value: 'no' }
          ]
        },
        {
          key: 'other_device',
          text: 'Do you have access to another trusted device (Laptop, Tablet, or PC)?',
          options: [
            { text: 'Yes, a laptop or partner\'s phone is ready', value: 'yes' },
            { text: 'No, I have no secondary display right now', value: 'no' }
          ]
        },
        {
          key: 'sensitive_apps',
          text: 'Are active banking credentials, UPI keys, or sensitive codes stored on the device?',
          options: [
            { text: 'Yes, banking apps and wallet integrations are stored', value: 'yes' },
            { text: 'No, it only contains public personal accounts', value: 'no' }
          ]
        }
      ],
      
      fraud: [
        {
          key: 'fraud_type',
          text: 'What category of cyber fraud incident occurred?',
          options: [
            { text: 'UPI / Immediate Bank Transfer Fraud', value: 'upi' },
            { text: 'Unauthorized Credit or Debit Card transaction', value: 'card' },
            { text: 'One-Time Password (OTP) Sharing Scam', value: 'otp' },
            { text: 'Phishing Email / Fake SMS scam Link clicked', value: 'phishing' },
            { text: 'Fake Investment scheme or Crypto scam', value: 'investment' },
            { text: 'Other unauthorized wallet transactions', value: 'other' }
          ]
        },
        {
          key: 'elapsed_time',
          text: 'When did the fraudulent transaction or scam take place?',
          options: [
            { text: 'Within the last 2 hours (Golden window)', value: 'golden' },
            { text: '2 to 24 hours ago', value: 'day' },
            { text: 'More than 24 hours ago', value: 'long' }
          ]
        },
        {
          key: 'amount',
          text: 'Approximate financial amount involved in the incident?',
          options: [
            { text: 'Under ₹5,000 / $100', value: 'low' },
            { text: '₹5,000 to ₹50,000 / $100 to $600', value: 'medium' },
            { text: 'Above ₹50,000 / $600 (High Alert)', value: 'high' }
          ]
        },
        {
          key: 'account_access',
          text: 'Do you still have access to your primary banking email and banking app?',
          options: [
            { text: 'Yes, credentials are safe and accessible', value: 'yes' },
            { text: 'No, password was changed / locked out', value: 'no' }
          ]
        },
        {
          key: 'bank_contacted',
          text: 'Have you contacted your bank or card provider yet?',
          options: [
            { text: 'No, I need to know what details to tell them first', value: 'no' },
            { text: 'Yes, I called customer service but need next steps', value: 'yes' }
          ]
        },
        {
          key: 'unauthorized_activity',
          text: 'Have you noticed any further unauthorized attempts on other accounts?',
          options: [
            { text: 'No, only the initial transaction occurred', value: 'no' },
            { text: 'Yes, suspicious logins or OTP requests are incoming', value: 'yes' }
          ]
        }
      ],

      wallet: [
        {
          key: 'items',
          text: 'Which critical items were inside the wallet? (Select all that apply)',
          type: 'multiselect',
          options: [
            { text: 'Debit Card', value: 'debit', icon: 'credit-card' },
            { text: 'Credit Card', value: 'credit', icon: 'credit-card' },
            { text: 'Aadhaar / Nat ID Card', value: 'aadhaar', icon: 'indent' },
            { text: 'PAN Card', value: 'pan', icon: 'file-text' },
            { text: 'Driving Licence', value: 'dl', icon: 'car' },
            { text: 'Office ID Badge', value: 'office', icon: 'id-card' },
            { text: 'Passport', value: 'passport', icon: 'book-open' },
            { text: 'Cash Only', value: 'cash', icon: 'coins' },
            { text: 'Other Documents', value: 'other', icon: 'files' }
          ]
        }
      ],

      travel: [
        {
          key: 'incident',
          text: 'What emergency event has impacted your transit?',
          options: [
            { text: 'Missed my Train', value: 'train' },
            { text: 'Missed my Bus connection', value: 'bus' },
            { text: 'Missed my Flight / Cancelled', value: 'flight' },
            { text: 'Missed my Cab or driver stranded', value: 'cab' },
            { text: 'Baggage lost / misplaced by airline', value: 'baggage' },
            { text: 'Stranded in unfamiliar location / extreme weather', value: 'stranded' },
            { text: 'Emergency accommodation needed', value: 'accommodation' }
          ]
        }
      ],

      analyzer: [
        {
          key: 'analyzer_type',
          text: 'Select suspicious content analysis workspace:',
          type: 'tab_select',
          options: [
            { text: '🔗 Paste Link / URL', value: 'link' },
            { text: '💬 Scam Message Text', value: 'message' },
            { text: '📸 Image / Screenshot Upload', value: 'image' },
            { text: '🎥 Video / Audio Deepfake scan', value: 'video' }
          ]
        }
      ]
    };

    const questions = moduleQuestions[this.activeModule];
    if (!questions) return;

    // Store total steps for this module
    this.totalSteps = questions.length;

    questions.forEach((q, qIndex) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = `question-step ${qIndex === 0 ? 'active' : ''}`;
      stepDiv.id = `q-step-${qIndex}`;

      const textPara = document.createElement('p');
      textPara.className = 'question-text';
      textPara.textContent = q.text;
      stepDiv.appendChild(textPara);

      // Handle custom selector types
      if (q.type === 'multiselect') {
        const multiselectGrid = document.createElement('div');
        multiselectGrid.className = 'multiselect-grid';

        q.options.forEach(opt => {
          const card = document.createElement('div');
          card.className = 'glass-card multiselect-card';
          card.setAttribute('data-val', opt.value);
          card.innerHTML = `
            <div class="multiselect-icon"><i data-lucide="${opt.icon || 'shield'}"></i></div>
            <span class="multiselect-text">${opt.text}</span>
          `;
          
          card.addEventListener('click', () => {
            card.classList.toggle('selected');
          });
          multiselectGrid.appendChild(card);
        });

        stepDiv.appendChild(multiselectGrid);

      } else if (q.type === 'tab_select') {
        // Set default analyzer_type
        this.answers.analyzer_type = 'link';

        // Renders tabs interface + custom drag zone
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'analyzer-tabs';
        
        q.options.forEach((opt, idx) => {
          const tab = document.createElement('div');
          tab.className = `analyzer-tab ${idx === 0 ? 'active' : ''}`;
          tab.textContent = opt.text.split(' ').slice(1).join(' '); // remove emoji for tab title
          tab.setAttribute('data-tab', opt.value);
          tab.addEventListener('click', () => {
            document.querySelectorAll('.analyzer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            app.switchAnalyzerMode(opt.value);
          });
          tabsDiv.appendChild(tab);
        });
        stepDiv.appendChild(tabsDiv);

        // Core Workspace container
        const dynamicWorkspace = document.createElement('div');
        dynamicWorkspace.id = 'analyzer-workspace-pane';
        
        // Link component default
        dynamicWorkspace.innerHTML = this.getAnalyzerInputHTML('link');
        stepDiv.appendChild(dynamicWorkspace);

      } else {
        // Normal radio list
        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'options-grid';

        q.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.innerHTML = `
            <span>${opt.text}</span>
            <div class="option-btn-checkmark"></div>
          `;
          btn.addEventListener('click', () => {
            // Unselect others
            optionsGrid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Auto progress on choice selection
            setTimeout(() => {
              this.handleNextStep(q.key, opt.value, questions.length);
            }, 300);
          });
          optionsGrid.appendChild(btn);
        });
        stepDiv.appendChild(optionsGrid);
      }

      // Step Actions Footer
      const footer = document.createElement('div');
      footer.className = 'step-actions';

      const prevBtn = document.createElement('button');
      prevBtn.className = `btn btn-secondary btn-sm ${qIndex === 0 ? 'hidden' : ''}`;
      prevBtn.innerHTML = `<i data-lucide="chevron-left"></i> Previous`;
      prevBtn.addEventListener('click', () => this.navigateStep(qIndex - 1));
      footer.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary btn-sm';
      if (qIndex === questions.length - 1) {
        nextBtn.innerHTML = `Generate Plan <i data-lucide="check"></i>`;
        nextBtn.style.background = 'linear-gradient(135deg, var(--accent-green) 0%, #00b050 100%)';
        nextBtn.style.color = '#06040a';
      } else {
        nextBtn.innerHTML = `Next <i data-lucide="chevron-right"></i>`;
      }

      nextBtn.addEventListener('click', () => {
        if (q.type === 'multiselect') {
          const selected = [];
          document.querySelectorAll('.multiselect-card.selected').forEach(c => {
            selected.push(c.getAttribute('data-val'));
          });
          
          if (selected.length === 0) {
            alert('Please select at least one item to proceed.');
            return;
          }
          this.answers[q.key] = selected;
          this.generateRecoveryPlan();
        } else if (q.type === 'tab_select') {
          // Analyzer run
          this.runAnalyzerScans();
        } else {
          // Standard check
          const activeSelected = document.querySelector(`#q-step-${qIndex} .option-btn.selected`);
          if (!activeSelected) {
            alert('Please pick an option to proceed.');
            return;
          }
          // Already saved via auto-progress, otherwise save and move
          this.navigateStep(qIndex + 1);
        }
      });

      footer.appendChild(nextBtn);
      stepDiv.appendChild(footer);
      container.appendChild(stepDiv);
    });

    lucide.createIcons();
  },

  handleNextStep(key, val, totalSteps) {
    this.answers[key] = val;
    this.navigateStep(this.activeStep + 1, totalSteps);
  },

  navigateStep(targetStepIndex, totalSteps = null) {
    if (totalSteps !== null) {
      this.totalSteps = totalSteps;
    } else {
      totalSteps = this.totalSteps;
    }

    if (targetStepIndex >= totalSteps) {
      this.generateRecoveryPlan();
      return;
    }

    // Hide active step, show target step
    const prevEl = document.getElementById(`q-step-${this.activeStep}`);
    const nextEl = document.getElementById(`q-step-${targetStepIndex}`);
    if (prevEl) prevEl.classList.remove('active');
    if (nextEl) nextEl.classList.add('active');
    
    this.activeStep = targetStepIndex;
    
    // Update progress bar
    const progressPercent = (targetStepIndex / totalSteps) * 100;
    document.getElementById('workspace-progress-bar').style.width = `${progressPercent}%`;
  },

  // ==========================================================================
  // PLAN GENERATION & SIMULATION ENGINE
  // ==========================================================================

  generateRecoveryPlan() {
    // Hide default placeholder
    document.getElementById('results-waiting-placeholder').classList.add('hidden');
    document.getElementById('results-active-content').classList.add('hidden');
    
    // Show skeleton and change message
    const skeleton = document.getElementById('results-loading-skeleton');
    const loadingText = document.getElementById('skeleton-loading-text');
    skeleton.classList.remove('hidden');
    
    const messages = {
      phone: 'Analyzing device ecosystem and location protocols...',
      fraud: 'Calculating transaction timestamps and routing to cyber security nodes...',
      wallet: 'Synthesizing application portals for selected lost identity assets...',
      travel: 'Pulsing emergency search coordinates for local services...',
      analyzer: 'AI core parsing message strings and validating URL safety records...'
    };
    loadingText.textContent = messages[this.activeModule] || 'Generating custom checklist...';

    // Store history record automatically
    let queryText = "";
    let titleText = "";
    if (this.activeModule === 'phone') {
      queryText = `OS: ${this.answers.platform || 'Unknown'}, Nature: ${this.answers.incident_type || 'Unknown'}, Banking: ${this.answers.sensitive_apps || 'No'}`;
      titleText = "Lost Phone Recovery Plan";
    } else if (this.activeModule === 'fraud') {
      queryText = `Type: ${this.answers.fraud_type || 'Unknown'}, Golden Window: ${this.answers.elapsed_time === 'golden' ? 'Yes' : 'No'}, Financial: ${this.answers.amount || 'Unknown'}`;
      titleText = "Cyber Fraud Incident Lock";
    } else if (this.activeModule === 'wallet') {
      queryText = `Lost Items: ${(this.answers.items || []).join(', ')}`;
      titleText = "Lost Wallet Replacement Plan";
    } else if (this.activeModule === 'travel') {
      queryText = `Disruption: ${this.answers.incident || 'Unknown'}`;
      titleText = "Transit Re-Route Checklist";
    } else if (this.activeModule === 'analyzer') {
      queryText = `Mode: ${this.answers.analyzer_type || 'Unknown'}, Input: ${this.answers.scan_input || this.answers.file_name || 'Upload'}`;
      titleText = "Scam Analyzer Security Scan";
    }

    if (this.activeModule !== 'ai_assistant' && this.activeModule && !this.isReopeningHistory) {
      this.addHistoryRecord(this.activeModule, queryText, titleText);
    }

    // Simulate scanning/AI wait window
    setTimeout(() => {
      skeleton.classList.add('hidden');
      document.getElementById('results-active-content').classList.remove('hidden');
      
      this.renderPlanContent();
    }, 1500);
  },

  renderPlanContent() {
    const specialWidget = document.getElementById('results-special-widget');
    const checklistContainer = document.getElementById('results-checklist-container');
    const contentHeader = document.getElementById('results-content-header');
    
    specialWidget.innerHTML = '';
    checklistContainer.innerHTML = '';
    contentHeader.innerHTML = '';

    // Standard header status
    contentHeader.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--accent-orange); font-family:var(--font-heading);">Structured Recovery Protocol</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Complete tasks step-by-step to mitigate risk.</p>
        </div>
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); padding:0.4rem 0.8rem; border-radius:8px; display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.8rem; color:var(--text-secondary);">Progress:</span>
          <span id="plan-progress-percent" style="font-weight:700; color:var(--accent-green);">0%</span>
        </div>
      </div>
    `;

    if (this.activeModule === 'phone') {
      this.buildPhonePlan(specialWidget, checklistContainer);
    } else if (this.activeModule === 'fraud') {
      this.buildFraudPlan(specialWidget, checklistContainer);
    } else if (this.activeModule === 'wallet') {
      this.buildWalletPlan(specialWidget, checklistContainer);
    } else if (this.activeModule === 'travel') {
      this.buildTravelPlan(specialWidget, checklistContainer);
    } else if (this.activeModule === 'analyzer') {
      this.buildAnalyzerPlan(specialWidget, checklistContainer);
    }

    lucide.createIcons();
    this.updateChecklistProgress();
  },

  // ==========================================================================
  // LOST PHONE WORKFLOW BUILDER
  // ==========================================================================

  buildPhonePlan(widget, checklist) {
    const ans = this.answers;
    const isIos = ans.platform === 'ios';
    const isStolen = ans.incident_type === 'stolen';
    
    // Add Containment Trigger in Widget area
    widget.innerHTML = `
      <div class="fail-alert-box" id="phone-fail-trigger-card">
        <i data-lucide="alert-octagon" class="fail-alert-icon"></i>
        <div class="fail-alert-text" style="flex-grow:1;">
          <h4>Phone Recovery Unsuccessful?</h4>
          <p>If you cannot locate the device and suspect it is permanently compromised, switch to the Not Recovered containment protocol.</p>
        </div>
        <button class="btn btn-outline-orange btn-sm" onclick="app.triggerPhoneNotRecoveredFlow()" style="white-space:nowrap; border-color:var(--color-critical); color:var(--color-critical);">Contain Device</button>
      </div>
    `;

    // Tasks definition
    const criticalTasks = [];
    const highTasks = [];
    const recommendedTasks = [];

    // Critical Checklist items
    if (ans.find_my === 'yes') {
      const link = isIos ? 'https://www.icloud.com/find' : 'https://www.google.com/android/find';
      criticalTasks.push({
        title: isIos ? 'Trigger Find My iPhone immediately' : 'Launch Android Find My Device',
        desc: `Locate, ring, lock, or erase the device remotely via the official account console.`,
        btnText: isIos ? 'Go to iCloud Find' : 'Go to Android Find',
        link: link
      });
    }

    if (ans.sensitive_apps === 'yes') {
      criticalTasks.push({
        title: 'Lock banking apps and UPI credentials',
        desc: 'Contact your bank to temporarily disable active UPI handles, mobile banking credentials, and secure registered card profiles.',
        btnText: 'National Cyber Crime Portal',
        link: 'https://cybercrime.gov.in/'
      });
    }

    criticalTasks.push({
      title: 'Secure primary email and recovery accounts',
      desc: 'If your phone is lost, your recovery email is vulnerable. Log out of all mobile sessions from your email dashboard.',
      btnText: 'Security Dashboard',
      link: isIos ? 'https://appleid.apple.com/' : 'https://myaccount.google.com/security'
    });

    // High Priority Checklist
    if (ans.sim_status === 'yes') {
      highTasks.push({
        title: 'Suspend SIM card network active line',
        desc: 'Call your mobile operator customer support to temporarily suspend cellular operations. Prevents OTP interception by bad actors.',
        btnText: 'Operator Directories',
        link: 'https://www.trai.gov.in/' // general directory
      });
    }

    highTasks.push({
      title: 'Sign out of active messaging apps (WhatsApp/Telegram)',
      desc: 'Open web portal or another device to revoke session permissions. Prevents scanners from spoofing messages to contacts.',
      btnText: 'WhatsApp Support',
      link: 'https://web.whatsapp.com/'
    });

    // Recommended Checklist
    if (isStolen) {
      recommendedTasks.push({
        title: 'File official police report (CEIR / Lost complaint)',
        desc: 'Write down details and submit a formal report to block the phone\'s hardware IMEI address globally.',
        btnText: 'CEIR Portal (IMEI Block)',
        link: 'https://www.ceir.gov.in/'
      });
    }

    recommendedTasks.push({
      title: 'Record IMEI hardware serial number',
      desc: 'Keep device purchase documents, IMEI stickers, and details safe in case coordinates are requested by legal networks.',
      btnText: 'CEIR IMEI Check',
      link: 'https://www.ceir.gov.in/'
    });

    this.renderChecklistPriorityGroups(checklist, criticalTasks, highTasks, recommendedTasks);
  },

  triggerPhoneNotRecoveredFlow() {
    const container = document.getElementById('results-checklist-container');
    const widget = document.getElementById('results-special-widget');
    
    // Clear and override warning card
    widget.innerHTML = `
      <div style="background:rgba(255, 56, 56, 0.12); border:2px solid var(--color-critical); border-radius:12px; padding:1.5rem; display:flex; gap:15px; align-items:center;">
        <i data-lucide="shield-alert" style="font-size: 2.2rem; color: var(--color-critical);"></i>
        <div style="flex-grow:1;">
          <h4 style="color:var(--color-critical); font-family:var(--font-heading); font-size:1.1rem; font-weight:700;">Containment Protocol Activated</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">The following tasks represent structural containment to isolate and lock down your digital presence completely.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="app.renderPlanContent()">Back to Recovery</button>
      </div>
    `;

    // Specialized lock tasks
    const critical = [
      {
        title: 'Permanently Erase Device Remotely',
        desc: 'Submit a full device factory wipe request through Find My iPhone / Android. The wipe triggers automatically once it connects to internet.',
        btnText: 'Submit Wipe Command',
        link: this.answers.platform === 'ios' ? 'https://www.icloud.com/find' : 'https://www.google.com/android/find'
      },
      {
        title: 'Lock cellular IMEI hardware number globally',
        desc: 'Register the phone\'s IMEI number to prevent it from ever joining any cellular network using local SIM cards.',
        btnText: 'CEIR Device Block',
        link: 'https://www.ceir.gov.in/'
      },
      {
        title: 'Change credentials for all financial portals',
        desc: 'Change passwords for Google Pay, Apple Pay, Paytm, credit line apps, and banking apps. Block connected cards.',
        btnText: 'Contact Banking Helpline',
        link: 'https://cybercrime.gov.in/'
      }
    ];

    const high = [
      {
        title: 'Invalidate Google/Apple Auth credentials',
        desc: 'Log in to your master account and remove the missing device from the "Trusted Devices" list to invalidate all authenticator keys.',
        btnText: 'Revoke Device Tokens',
        link: this.answers.platform === 'ios' ? 'https://appleid.apple.com/' : 'https://myaccount.google.com/security'
      },
      {
        title: 'Pre-register Police Complaint & file Copy',
        desc: 'Provide details for the formal complaint: device model, serial number, place missing, amount of cash / files inside.',
        btnText: 'Submit Online FIR Complaint',
        link: 'https://cybercrime.gov.in/'
      }
    ];

    const recommended = [
      {
        title: 'Inform primary contacts about compromise',
        desc: 'Notify colleagues, relatives, and close friends to ignore incoming WhatsApp requests, payment links, or distress texts.',
        btnText: 'WhatsApp Help Center',
        link: 'https://www.whatsapp.com/contact'
      }
    ];

    this.renderChecklistPriorityGroups(container, critical, high, recommended);
    this.updateChecklistProgress();
  },

  // ==========================================================================
  // CYBER FRAUD WORKFLOW BUILDER
  // ==========================================================================

  buildFraudPlan(widget, checklist) {
    const ans = this.answers;
    
    // Add Emergency Incident detail box in widget
    widget.innerHTML = `
      <div class="glass-card" style="padding:1.5rem; display:flex; flex-direction:column; gap:12px; border-color: rgba(0, 230, 118, 0.25);">
        <h4 style="font-family:var(--font-heading); color:var(--accent-green); display:flex; align-items:center; gap:8px;">
          <i data-lucide="shield-alert"></i> Incident Summary Record
        </h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.85rem;">
          <div><span style="color:var(--text-secondary);">Fraud Type:</span> <strong style="color:var(--text-primary); text-transform:uppercase;">${ans.fraud_type}</strong></div>
          <div><span style="color:var(--text-secondary);">Timeframe:</span> <strong style="color:var(--text-primary);">${ans.elapsed_time === 'golden' ? 'Golden Window (<2h)' : 'Over 2 hours'}</strong></div>
          <div><span style="color:var(--text-secondary);">Estimated Amount:</span> <strong style="color:var(--text-primary);">${ans.amount === 'high' ? 'High Amount (Critical Alert)' : 'Standard'}</strong></div>
          <div><span style="color:var(--text-secondary);">Bank Contacted:</span> <strong style="color:var(--text-primary);">${ans.bank_contacted === 'yes' ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>
    `;

    const critical = [];
    const high = [];
    const recommended = [];

    // Critical tasks
    critical.push({
      title: 'Call official bank security hotline instantly',
      desc: 'Initiate a transaction hold or freeze order immediately. For Indian UPI scams, dial 1930 to trigger national transaction freezing locks.',
      btnText: 'National Cyber Crime Portal',
      link: 'https://cybercrime.gov.in/'
    });

    if (ans.fraud_type === 'upi' || ans.fraud_type === 'bank' || ans.fraud_type === 'card') {
      critical.push({
        title: 'Freeze connected Debit / Credit cards',
        desc: 'Log in to your netbanking app or call the bank customer line to permanently freeze the compromised card number.',
        btnText: 'SBI NetBanking block',
        link: 'https://onlinesbi.sbi/'
      });
    }

    critical.push({
      title: 'Preserve transaction evidence & screenshots',
      desc: 'Save UPI transaction IDs, debit bank details, SMS transaction text, fake investment chat backups, and receipts.',
      btnText: 'How to report scams',
      link: 'https://cybercrime.gov.in/'
    });

    // High Tasks
    if (ans.account_access === 'no') {
      high.push({
        title: 'Request temporary email suspension',
        desc: 'If password was compromised, contact provider support to freeze email logins. Prevents hackers from accessing account OTP reset tokens.',
        btnText: 'Google Account Support',
        link: 'https://support.google.com/accounts'
      });
    }

    high.push({
      title: 'Change connected UPI application app lock passwords',
      desc: 'Force reset your GPay PIN, PhonePe password, and banking access codes on all financial mobile wallets.',
      btnText: 'GPay Security Guide',
      link: 'https://support.google.com/googlepay'
    });

    // Recommended Tasks
    recommended.push({
      title: 'File formal Cyber Police complaint',
      desc: 'Register an official cybercrime report on cybercrime.gov.in. Keep transaction ID and bank confirmation letters ready.',
      btnText: 'Report to Government Portal',
      link: 'https://cybercrime.gov.in/'
    });

    this.renderChecklistPriorityGroups(checklist, critical, high, recommended);
  },

  // ==========================================================================
  // LOST WALLET WORKFLOW BUILDER
  // ==========================================================================

  buildWalletPlan(widget, checklist) {
    const items = this.answers.items || [];
    
    widget.innerHTML = `
      <div style="font-size:0.85rem; color:var(--text-secondary);">
        Generating personalized replacements portal list for: 
        <strong style="color:var(--accent-orange);">${items.map(i => i.toUpperCase()).join(', ')}</strong>
      </div>
    `;

    const critical = [];
    const high = [];
    const recommended = [];

    if (items.includes('debit') || items.includes('credit')) {
      critical.push({
        title: 'Block lost banking Debit and Credit cards',
        desc: 'Report the cards lost to prevent illegal tap/online transactions. SBI customer line: 1800 1234, HDFC block line: 1800 202 6161.',
        btnText: 'SBI Card Portal',
        link: 'https://www.sbicard.com/'
      });
    }

    if (items.includes('passport')) {
      critical.push({
        title: 'File Passport Loss complaint at nearest Police Station',
        desc: 'An official FIR document is mandatory to get a duplicate passport. Prevents identity spoofing at airports.',
        btnText: 'Passport India Portal',
        link: 'https://www.passportindia.gov.in/'
      });
    }

    if (items.includes('aadhaar')) {
      high.push({
        title: 'Apply for duplicate Aadhaar card online (UIDAI)',
        desc: 'Log in to the UIDAI Portal using registered mobile OTP and order an official PVC card replacement.',
        btnText: 'UIDAI PVC replacement',
        link: 'https://myaadhaar.uidai.gov.in/'
      });
    }

    if (items.includes('pan')) {
      high.push({
        title: 'Order duplicate PAN card via NSDL/UTIITSL',
        desc: 'Order PAN PVC reprint by supplying your primary PAN ID, Aadhaar number, and paying the nominal print charge.',
        btnText: 'NSDL PAN Card print',
        link: 'https://www.tin-nsdl.com/'
      });
    }

    if (items.includes('dl')) {
      high.push({
        title: 'Apply for duplicate Driving License (Sarathi)',
        desc: 'Open the Ministry of Road Transport Parivahan portal, select your state, and submit application for DL duplicate booklet.',
        btnText: 'Parivahan License portal',
        link: 'https://sarathi.parivahan.gov.in/'
      });
    }

    if (items.includes('office')) {
      high.push({
        title: 'Inform company security / HR operations',
        desc: 'Report ID badge loss to deactivate door entry credentials and prevent unauthorised workspace access.',
        btnText: 'Deactivate Access Badge',
        link: '#'
      });
    }

    // Recommended
    recommended.push({
      title: 'Keep tracking reports and records saved',
      desc: 'Create a folder containing replacement receipts, complaint copies, and token numbers for administrative verification.',
      btnText: 'Track applications',
      link: '#'
    });

    this.renderChecklistPriorityGroups(checklist, critical, high, recommended);
  },

  // ==========================================================================
  // TRAVEL ASSISTANT & RADAR MAP
  // ==========================================================================

  buildTravelPlan(widget, checklist) {
    const issue = this.answers.incident;
    
    // 1. Render Radar Map SVG
    widget.innerHTML = `
      <div class="map-widget-container">
        <svg class="map-svg-element" viewBox="0 0 500 350" id="travel-svg-map">
          <!-- Definitions for gradients -->
          <defs>
            <radialGradient id="radar-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--accent-orange)" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="var(--accent-orange)" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="purple-radar-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--accent-purple)" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="var(--accent-purple)" stop-opacity="0"/>
            </radialGradient>
          </defs>
          
          <!-- Grid Lines -->
          <line x1="0" y1="175" x2="500" y2="175" stroke="#1c1635" stroke-width="1" />
          <line x1="250" y1="0" x2="250" y2="350" stroke="#1c1635" stroke-width="1" />
          
          <!-- Concentric radar circles -->
          <circle cx="250" cy="175" r="50" fill="none" stroke="#251e44" stroke-width="1" />
          <circle cx="250" cy="175" r="100" fill="none" stroke="#251e44" stroke-width="1" />
          <circle cx="250" cy="175" r="150" fill="none" stroke="#251e44" stroke-width="1" />
          
          <!-- Animated Radar Sweep -->
          <circle cx="250" cy="175" r="148" class="map-radar-sweep" />
          <circle cx="250" cy="175" r="50" class="map-radar-ring" />
          <circle cx="250" cy="175" r="100" class="map-radar-ring" style="animation-delay:1.5s;" />

          <!-- Center Node: YOU -->
          <g transform="translate(250, 175)">
            <circle cx="0" cy="0" r="12" fill="none" stroke="var(--accent-orange)" stroke-width="2" />
            <circle cx="0" cy="0" r="6" fill="var(--accent-orange)" class="map-dot" />
            <text x="12" y="4" fill="var(--text-primary)" font-size="10" font-weight="700">YOU (GPS LOCK)</text>
          </g>

          <!-- Nearby POI Nodes -->
          <!-- Hotels -->
          <g class="map-pin map-poi-hotel" transform="translate(100, 80)" onclick="app.showPoiDetail('Premium Transit Hotel', 'Distance: 400m, Open 24/7')">
            <circle cx="0" cy="0" r="7" fill="var(--accent-purple)" />
            <text x="10" y="4" fill="var(--text-secondary)" font-size="9">Hotel Crown</text>
          </g>
          <g class="map-pin map-poi-hotel" transform="translate(380, 240)" onclick="app.showPoiDetail('Express Stay Lounge', 'Distance: 1.2km, Rooms Available')">
            <circle cx="0" cy="0" r="7" fill="var(--accent-purple)" />
            <text x="10" y="4" fill="var(--text-secondary)" font-size="9">Express Inn</text>
          </g>
          
          <!-- Hospitals -->
          <g class="map-pin map-poi-hospital" transform="translate(320, 70)" onclick="app.showPoiDetail('Metro Trauma Center', 'Emergency Desk Active, 700m')">
            <circle cx="0" cy="0" r="7" fill="#ff3838" />
            <text x="10" y="4" fill="var(--text-secondary)" font-size="9">City Hospital</text>
          </g>
          
          <!-- Police -->
          <g class="map-pin map-poi-police" transform="translate(150, 280)" onclick="app.showPoiDetail('Transit Police Substation', 'Force deployed, reporting window active')">
            <circle cx="0" cy="0" r="7" fill="#2979ff" />
            <text x="10" y="4" fill="var(--text-secondary)" font-size="9">Police Station</text>
          </g>

          <!-- Fuel -->
          <g class="map-pin map-poi-fuel" transform="translate(420, 100)" onclick="app.showPoiDetail('National Petrol Pump', '24h Fuel, EV charging terminal')">
            <circle cx="0" cy="0" r="7" fill="var(--accent-green)" />
            <text x="10" y="4" fill="var(--text-secondary)" font-size="9">Fuel Pump</text>
          </g>

          <!-- Route overlay line (will be animated in via JS) -->
          <path id="map-route-line" d="" fill="none" stroke="var(--accent-orange)" stroke-width="2" stroke-dasharray="5,5" />
        </svg>

        <!-- Filter Map controls overlay -->
        <div class="map-controls">
          <button class="map-filter-btn active" id="map-btn-all" onclick="app.filterMap('all')">
            <div class="map-filter-dot" style="background-color:var(--text-primary)"></div> All Nodes
          </button>
          <button class="map-filter-btn" id="map-btn-hotel" onclick="app.filterMap('hotel')">
            <div class="map-filter-dot" style="background-color:var(--accent-purple)"></div> Hotels
          </button>
          <button class="map-filter-btn" id="map-btn-hospital" onclick="app.filterMap('hospital')">
            <div class="map-filter-dot" style="background-color:#ff3838"></div> Hospitals
          </button>
          <button class="map-filter-btn" id="map-btn-police" onclick="app.filterMap('police')">
            <div class="map-filter-dot" style="background-color:#2979ff"></div> Police
          </button>
          <button class="map-filter-btn" id="map-btn-fuel" onclick="app.filterMap('fuel')">
            <div class="map-filter-dot" style="background-color:var(--accent-green)"></div> Fuel
          </button>
        </div>
      </div>
      <div id="poi-info-pane" class="glass-card" style="margin-top:10px; padding:10px; font-size:0.8rem; border-color:var(--border-glass); text-align:center; color:var(--text-secondary);">
        Click any node icon on the radar map to display direction routes and coordinates.
      </div>
    `;

    // Tasks list
    const critical = [];
    const high = [];
    const recommended = [];

    // Transit options
    let backupPlanDesc = "";
    if (issue === 'flight') {
      backupPlanDesc = "Alternative flights exist via Terminal 2 boardings. Contact carrier desk for rescheduling permissions.";
      critical.push({
        title: 'Submit flight baggage hold request',
        desc: 'If luggage was checked in, contact ground cargo operations immediately to recall or secure bag routing.',
        btnText: 'IndiGo Helpdesk',
        link: 'https://www.goindigo.in/'
      });
      high.push({
        title: 'Check transit hotel lounge entries',
        desc: 'If stranded overnight, secure premium terminal lounge room entries using credit card points.',
        btnText: 'Find Airport Lounges',
        link: '#'
      });
    } else if (issue === 'train') {
      backupPlanDesc = "Alternate express train leaves in 3 hours. Tatkal booking quota is active.";
      critical.push({
        title: 'Check alternate tickets via IRCTC Tatkal / UTS app',
        desc: 'Open tickets booking console to purchase duplicate transit permissions or emergency unreserved slip.',
        btnText: 'IRCTC ticketing portal',
        link: 'https://www.irctc.co.in/'
      });
    } else if (issue === 'cab' || issue === 'stranded') {
      backupPlanDesc = "Local micro-booking units are active. Check Uber, Rapido, or local taxi helpline networks.";
    }

    critical.push({
      title: 'Initialize local GPS transit tracking',
      desc: 'Verify nearby options and locate transit stations, hospitals, or accommodations using coordinates.',
      btnText: 'Open Google Maps',
      link: 'https://maps.google.com/'
    });

    // High
    high.push({
      title: 'Order local micro-cabs or bike taxi',
      desc: 'Launch Rapido or Uber portals. Verify driver details, verify license, and share live location link.',
      btnText: 'Open Uber Web app',
      link: 'https://www.uber.com/'
    });

    recommended.push({
      title: 'Contact emergency travel insurance provider',
      desc: 'Report Missed departure or Baggage Loss within the 24-hour limit to declare compensation coverage tickets.',
      btnText: 'Submit Insurance ticket',
      link: '#'
    });

    // Add Booking Widget
    const bookingWidget = document.createElement('div');
    bookingWidget.innerHTML = `
      <div style="margin-top:20px;">
        <h4 style="font-family:var(--font-heading); font-size:0.95rem; margin-bottom:10px; color:var(--accent-purple);">Quick-Access Transit Bookings</h4>
        <div class="transit-providers-grid">
          <button class="transit-provider-btn" onclick="window.open('https://www.uber.com/','_blank')">🚕 Uber Cab</button>
          <button class="transit-provider-btn" onclick="window.open('https://www.rapido.in/','_blank')">🏍️ Rapido Bike</button>
          <button class="transit-provider-btn" onclick="alert('Calling Local Taxi Association emergency: 108 / 112')">📞 Local Taxi (Emergency)</button>
        </div>
      </div>
    `;
    
    this.renderChecklistPriorityGroups(checklist, critical, high, recommended);
    checklist.appendChild(bookingWidget);
  },

  showPoiDetail(name, desc) {
    const pane = document.getElementById('poi-info-pane');
    const escapedName = name.replace(/'/g, "\\'");
    pane.innerHTML = `<strong style="color:var(--accent-orange); font-family:var(--font-heading);">${name}</strong> &nbsp;|&nbsp; ${desc} &nbsp;|&nbsp; <a href="#" style="color:var(--accent-green); font-weight:600;" onclick="event.preventDefault(); app.drawRouteToPoi('${escapedName}')">📍 Plot Route</a>`;
    lucide.createIcons();
  },

  drawRouteToPoi(poiName) {
    const path = document.getElementById('map-route-line');
    
    // Select path depending on name
    if (poiName.includes('Crown')) {
      path.setAttribute('d', 'M 250 175 L 100 80');
    } else if (poiName.includes('Express')) {
      path.setAttribute('d', 'M 250 175 L 380 240');
    } else if (poiName.includes('Hospital')) {
      path.setAttribute('d', 'M 250 175 L 320 70');
    } else if (poiName.includes('Police')) {
      path.setAttribute('d', 'M 250 175 L 150 280');
    } else if (poiName.includes('Petrol')) {
      path.setAttribute('d', 'M 250 175 L 420 100');
    }
  },

  filterMap(type) {
    // Update active filter btn
    document.querySelectorAll('.map-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`map-btn-${type}`).classList.add('active');

    // Show/Hide POI elements
    const hotels = document.querySelectorAll('.map-poi-hotel');
    const hospitals = document.querySelectorAll('.map-poi-hospital');
    const police = document.querySelectorAll('.map-poi-police');
    const fuel = document.querySelectorAll('.map-poi-fuel');

    // Hide all
    hotels.forEach(el => el.style.display = 'none');
    hospitals.forEach(el => el.style.display = 'none');
    police.forEach(el => el.style.display = 'none');
    fuel.forEach(el => el.style.display = 'none');

    // Draw lines
    const route = document.getElementById('map-route-line');
    route.setAttribute('d', ''); // clear previous

    if (type === 'all') {
      hotels.forEach(el => el.style.display = '');
      hospitals.forEach(el => el.style.display = '');
      police.forEach(el => el.style.display = '');
      fuel.forEach(el => el.style.display = '');
    } else if (type === 'hotel') {
      hotels.forEach(el => el.style.display = '');
    } else if (type === 'hospital') {
      hospitals.forEach(el => el.style.display = '');
    } else if (type === 'police') {
      police.forEach(el => el.style.display = '');
    } else if (type === 'fuel') {
      fuel.forEach(el => el.style.display = '');
    }
  },

  // ==========================================================================
  // AI SCAM & CONTENT ANALYZER WORKSPACE
  // ==========================================================================

  getAnalyzerInputHTML(tab) {
    if (tab === 'link') {
      return `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <label style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">Suspicious Link / URL to analyze:</label>
          <input type="url" id="analyzer-url-input" class="input-field" placeholder="https://sbi-card-verification.net/verify-login" value="">
          <p style="font-size:0.75rem; color:var(--text-muted);">Paste the complete address including http:// or https:// tags.</p>
        </div>
      `;
    } else if (tab === 'message') {
      return `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <label style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">Suspicious SMS / WhatsApp message text:</label>
          <textarea id="analyzer-msg-input" class="input-field" rows="5" placeholder="Dear Customer, your Credit Card account is suspended today due to KYC update failure. Call support at 88201-XXXXX or click link here to reactivate now."></textarea>
          <p style="font-size:0.75rem; color:var(--text-muted);">Paste the exact spelling, contact numbers, and formatting of the message.</p>
        </div>
      `;
    } else {
      // File Drop area for Image/Video
      const fileText = tab === 'image' ? 'screenshot/image' : 'video file';
      return `
        <div class="analyzer-dropzone" id="analyzer-file-dropzone">
          <i data-lucide="upload-cloud" class="dropzone-icon"></i>
          <div>
            <h4 style="font-size:1.05rem; font-weight:600;">Drag and Drop Suspicious ${fileText}</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:5px;">Or click to browse from local directories</p>
          </div>
          <span style="font-size:0.7rem; color:var(--text-muted);">Supported formats: PNG, JPG, MP4, WEBM (Max size 15MB)</span>
          <input type="file" id="analyzer-hidden-file-input" style="display:none;" accept="${tab === 'image' ? 'image/*' : 'video/*'}">
        </div>
      `;
    }
  },

  switchAnalyzerMode(mode) {
    this.answers.analyzer_type = mode;
    const pane = document.getElementById('analyzer-workspace-pane');
    pane.innerHTML = this.getAnalyzerInputHTML(mode);
    lucide.createIcons();
    
    if (mode === 'image' || mode === 'video') {
      this.wireFileDropZone();
    }
  },

  wireFileDropZone() {
    const dropzone = document.getElementById('analyzer-file-dropzone');
    const hiddenInput = document.getElementById('analyzer-hidden-file-input');

    dropzone.addEventListener('click', () => hiddenInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.simulateFileSelection(files[0]);
      }
    });

    hiddenInput.addEventListener('change', () => {
      if (hiddenInput.files.length > 0) {
        this.simulateFileSelection(hiddenInput.files[0]);
      }
    });
  },

  simulateFileSelection(file) {
    const dropzone = document.getElementById('analyzer-file-dropzone');
    dropzone.innerHTML = `
      <i data-lucide="check-circle-2" style="font-size: 3rem; color: var(--accent-green); animation: pulseSlow 2s infinite ease-in-out;"></i>
      <div>
        <h4 style="font-size:1.05rem; font-weight:600;">File Ready: ${file.name}</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:5px;">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.switchAnalyzerMode('${this.answers.analyzer_type}')">Remove File</button>
    `;
    this.answers.file_name = file.name;
    lucide.createIcons();
  },

  runAnalyzerScans() {
    const mode = this.answers.analyzer_type || 'link';
    
    // Check if input details are empty
    if (mode === 'link') {
      const val = document.getElementById('analyzer-url-input').value.trim();
      if (!val) {
        alert('Please paste a URL to scan.');
        return;
      }
      this.answers.scan_input = val;
    } else if (mode === 'message') {
      const val = document.getElementById('analyzer-msg-input').value.trim();
      if (!val) {
        alert('Please paste the scam text to verify.');
        return;
      }
      this.answers.scan_input = val;
    } else {
      if (!this.answers.file_name) {
        alert('Please upload a screenshot or video file first.');
        return;
      }
    }

    this.generateRecoveryPlan(); // Trigger AI simulation pipeline
  },

  buildAnalyzerPlan(widget, checklist) {
    const mode = this.answers.analyzer_type || 'link';
    const rawVal = this.answers.scan_input || '';
    
    // Prepare Report Data
    let summary = "";
    let risk = "low";
    let findings = [];
    let recommendations = [];
    let highlightedText = "";

    if (mode === 'link') {
      const url = rawVal.toLowerCase();
      highlightedText = rawVal;
      
      // Heuristics checks
      const isImpersonation = url.includes('sbi') || url.includes('amazon') || url.includes('bank') || url.includes('card');
      const isSusExtension = url.includes('.net') || url.includes('.info') || url.includes('.xyz') || url.includes('.verify') || url.includes('-security');
      
      if (isImpersonation && isSusExtension) {
        risk = "high";
        summary = "Potential Spoofing link detected. The URL appears to mimic an official brand portal to harvest credentials.";
        findings = [
          "Impersonation signals: The domain contains brand letters but does not match official WHOIS registrant records.",
          "Warning indicators: Domain extension (.net/.verify) is commonly used in phishing networks instead of .co.in / .com.",
          "Connection: Certificate lacks Organization Verification logs."
        ];
        recommendations = [
          "Do not type netbanking credentials or logins into this page.",
          "Verify domain records directly on standard WHOIS databases.",
          "Discard the message containing this link immediately."
        ];
      } else if (isSusExtension) {
        risk = "medium";
        summary = "Uncommon domain extension detected. Proceed with caution.";
        findings = [
          "Warning indicators: The URL redirects to a country code domain with limited trust metrics.",
          "Structure breakdown: Uses subdomains to create false safety layers."
        ];
        recommendations = [
          "Close the portal tab immediately.",
          "Contact the official sender using their primary support number."
        ];
      } else {
        risk = "low";
        summary = "No immediate phishing structure discovered. However, absolute security cannot be guaranteed.";
        findings = [
          "Matches standard domain extensions.",
          "No blacklisted records found in active phishing feeds."
        ];
        recommendations = [
          "Check if the link was received unexpectedly.",
          "Verify authenticity manually via official service centers."
        ];
      }

    } else if (mode === 'message') {
      highlightedText = rawVal;
      
      // Analyze text strings
      const urgency = /urgent|suspend|blocked|immediate|penalty|fine|won|cashback/i.test(rawVal);
      const credentials = /otp|password|login|card|cvv|kyc|verify/i.test(rawVal);
      
      if (urgency && credentials) {
        risk = "high";
        summary = "High Phishing signal found. Message exhibits key psychological pressure indicators designed to steal OTP credentials.";
        findings = [
          "Urgency signal: Explicit threat of suspension/fines if actions are not taken immediately.",
          "Harvesting metrics: Requests inputs of sensitive credential records (OTP / KYC check).",
          "Verification failure: Sent from private cell gateway instead of verified brand header ID."
        ];
        recommendations = [
          "Never click links or call mobile numbers supplied in these messages.",
          "Banks never threaten immediate suspension via simple SMS text.",
          "Report this number to TRAI / Cyber Police networks."
        ];
      } else if (urgency || credentials) {
        risk = "medium";
        summary = "Warning indicators observed. Message matches common bait patterns.";
        findings = [
          "Contains typical emotional triggers (Cashback rewards or warning logs).",
          "Matches syntax associated with random spam campaigns."
        ];
        recommendations = [
          "Contact the bank directly using numbers printed on your physical card.",
          "Ignore or delete the SMS file."
        ];
      } else {
        risk = "low";
        summary = "No standard scam threat signatures observed in content text.";
        findings = [
          "Normal transactional text layout.",
          "Lacks typical urgent coercion terms."
        ];
        recommendations = [
          "Confirm sender identity before taking action."
        ];
      }

    } else if (mode === 'image') {
      // Mock Screenshot OCR scan
      highlightedText = "Dear Customer, NetBanking App Alert: Your Card account is locked. Reactivate at secure-bank-portal.net/unlock";
      risk = "high";
      summary = "Extracted text contains phishing links and account suspension flags.";
      findings = [
        "Text translation found: 'NetBanking account locked. reactivate at secure-bank-portal.net'.",
        "Layout anomalies: Screenshot matches mock interfaces designed to impersonate official mobile wallet templates."
      ];
      recommendations = [
        "Discard the image details and delete the source files.",
        "Secure your linked bank cards immediately."
      ];

    } else {
      // Mock Video deepfake scan
      risk = "medium";
      summary = "Synthetic audio or visual patterns detected. Video may contain deepfake content.";
      findings = [
        "Frame translation check: Key mouth synchronization and lip alignment anomalies noticed.",
        "Audio signals: Speech cadence shows mechanical pacing patterns indicative of AI speech cloning."
      ];
      recommendations = [
        "Independently check the speaker's official social profile for verifying announcement records.",
        "Do not forward or spread unverified videos."
      ];
    }

    // Render Unified analysis report
    const badgeClass = risk === 'high' ? 'high-risk' : (risk === 'medium' ? 'medium-risk' : 'low-risk');
    const badgeText = risk.toUpperCase() + " RISK";

    widget.innerHTML = `
      <div class="report-title-bar">
        <h4 style="font-family:var(--font-heading); font-size:1.1rem; color:var(--text-primary);">Unified Security Report</h4>
        <span class="report-risk-badge ${badgeClass}">
          <i data-lucide="shield-alert"></i> ${badgeText}
        </span>
      </div>

      <div class="report-content-panel">
        <div class="report-section">
          <div class="report-section-title"><i data-lucide="info"></i> Analysis Summary</div>
          <div class="report-section-content">${summary}</div>
        </div>

        ${highlightedText ? `
          <div class="report-section">
            <div class="report-section-title"><i data-lucide="text-cursor"></i> Highlighting Scanned Content</div>
            <div class="report-highlighted-message">${highlightedText}</div>
          </div>
        ` : ''}

        <div class="report-section">
          <div class="report-section-title"><i data-lucide="alert-triangle"></i> Potential Risk Indicators</div>
          <div class="report-section-content">
            <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:6px;">
              ${findings.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="report-section">
          <div class="report-section-title"><i data-lucide="check-circle-2"></i> Safety Recommendations</div>
          <div class="report-section-content">
            <ul style="padding-left:1.2rem; display:flex; flex-direction:column; gap:6px;">
              ${recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="report-actions">
        <button class="btn btn-outline-orange btn-sm" onclick="app.copyReportToClipboard()">
          <i data-lucide="copy"></i> Copy Full Report
        </button>
        <button class="btn btn-secondary btn-sm" onclick="app.saveReportAsFile()">
          <i data-lucide="download"></i> Save Report (.txt)
        </button>
      </div>
    `;
    
    // Clear checklist since report is self-contained
    checklist.innerHTML = '';
  },

  copyReportToClipboard() {
    const summary = document.querySelector('.report-section-content').textContent;
    const indicators = Array.from(document.querySelectorAll('.report-section:nth-child(3) li')).map(el => el.textContent).join('\n');
    const recs = Array.from(document.querySelectorAll('.report-section:nth-child(4) li')).map(el => el.textContent).join('\n');
    
    const text = `
CRISIS ASSIST - SCAN REPORT
==================================
Risk Score: ${this.answers.analyzer_type.toUpperCase()} SCAN
Summary: ${summary}

Key Indicators:
${indicators}

Recommendations:
${recs}
    `;

    navigator.clipboard.writeText(text).then(() => {
      alert('Report copied to clipboard successfully.');
    });
  },

  saveReportAsFile() {
    const summary = document.querySelector('.report-section-content').textContent;
    const indicators = Array.from(document.querySelectorAll('.report-section:nth-child(3) li')).map(el => el.textContent).join('\n');
    const recs = Array.from(document.querySelectorAll('.report-section:nth-child(4) li')).map(el => el.textContent).join('\n');
    
    const text = `
CRISIS ASSIST - SCAN REPORT
==================================
Type: ${this.answers.analyzer_type.toUpperCase()} SCAN
Summary: ${summary}

Key Indicators:
${indicators}

Recommendations:
${recs}
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crisis-assist-report-${this.answers.analyzer_type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ==========================================================================
  // RENDER CHECKS & PROGRESS LOGIC
  // ==========================================================================

  renderChecklistPriorityGroups(container, critical, high, recommended) {
    container.innerHTML = '';
    
    const renderGroup = (title, items, key) => {
      if (items.length === 0) return;
      
      const groupDiv = document.createElement('div');
      groupDiv.className = `recovery-priority-group ${key}`;
      
      const badge = key === 'critical' ? '🔴' : (key === 'high' ? '🟠' : '🟡');
      
      groupDiv.innerHTML = `
        <div class="priority-header ${key}">
          <span>${badge} ${title}</span>
        </div>
        <div class="priority-tasks"></div>
      `;
      
      const tasksDiv = groupDiv.querySelector('.priority-tasks');
      
      items.forEach((item, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
          <div class="task-checkbox-container">
            <input type="checkbox" class="task-checkbox" onchange="app.updateChecklistProgress()">
          </div>
          <div class="task-body">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
            ${item.link && item.link !== '#' ? `<a href="${item.link}" target="_blank" class="task-btn">${item.btnText} <i data-lucide="external-link" style="width:12px; height:12px;"></i></a>` : ''}
          </div>
        `;
        
        // Listen to checkbox line-through
        const cb = taskItem.querySelector('.task-checkbox');
        const body = taskItem.querySelector('.task-body');
        cb.addEventListener('change', () => {
          if (cb.checked) {
            body.classList.add('completed');
          } else {
            body.classList.remove('completed');
          }
        });

        tasksDiv.appendChild(taskItem);
      });

      container.appendChild(groupDiv);
    };

    renderGroup('Critical – Do immediately', critical, 'critical');
    renderGroup('High Priority Tasks', high, 'high');
    renderGroup('Recommended Actions', recommended, 'recommended');
  },

  updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('#results-checklist-container .task-checkbox');
    const checked = document.querySelectorAll('#results-checklist-container .task-checkbox:checked');
    const progressText = document.getElementById('plan-progress-percent');
    
    if (checkboxes.length === 0) return;
    
    const percent = Math.round((checked.length / checkboxes.length) * 100);
    progressText.textContent = `${percent}%`;
    
    if (percent === 100) {
      progressText.style.color = 'var(--accent-green)';
      // Trigger subtle notification sound/animation if desired
    } else {
      progressText.style.color = 'var(--accent-orange)';
    }
  },

  // ==========================================================================
  // NEW SYSTEM EXTENSIONS (AI ASSISTANT, HISTORY & DRAWERS)
  // ==========================================================================

  isReopeningHistory: false,

  isReopeningHistory: false,

  renderChatInterface() {
    const container = document.getElementById('workspace-questions-container');
    
    let promptsHtml = '';
    if (this.settings.aiPrompts) {
      promptsHtml = `
        <div class="chat-suggested-prompts" id="chat-suggested-prompts-container">
          <span class="suggested-prompt-tag" onclick="app.clickSuggestedPrompt('I lost my passport while travelling')">I lost my passport while travelling</span>
          <span class="suggested-prompt-tag" onclick="app.clickSuggestedPrompt('Someone hacked my email')">Someone hacked my email</span>
          <span class="suggested-prompt-tag" onclick="app.clickSuggestedPrompt('Explain phishing and OTP scams')">Explain phishing and OTP scams</span>
          <span class="suggested-prompt-tag" onclick="app.clickSuggestedPrompt('Draft an FIR report template')">Draft an FIR report template</span>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages-log">
          <div class="chat-message bot">
            <p><strong>System Core Online:</strong> Hello! I am your AI Emergency Assistant.</p>
            <p>Describe your emergency or question in natural language, and I will generate a custom recovery checklist or draft documents instantly.</p>
            <div class="chat-message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </div>
        ${promptsHtml}
        <div class="chat-input-wrapper">
          <textarea id="chat-user-input" class="input-field" placeholder="Describe your situation here..." rows="1" onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); app.sendChatMessage(); }"></textarea>
          <button class="btn btn-primary btn-sm" onclick="app.sendChatMessage()" style="height: 44px; padding: 0 1.25rem;">
            Send <i data-lucide="send" style="width:14px; height:14px;"></i>
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
    
    // Set progress bar to 100% since it's an interactive module
    document.getElementById('workspace-progress-bar').style.width = '100%';

    // Initialize right-side view for AI Assistant
    document.getElementById('results-waiting-placeholder').classList.remove('hidden');
    document.getElementById('results-loading-skeleton').classList.add('hidden');
    document.getElementById('results-active-content').classList.add('hidden');
  },

  clickSuggestedPrompt(text) {
    const input = document.getElementById('chat-user-input');
    if (input) {
      input.value = text;
      this.sendChatMessage();
    }
  },

  sendChatMessage() {
    const input = document.getElementById('chat-user-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    // Clear input
    input.value = '';
    
    // Append user message
    const chatLog = document.getElementById('chat-messages-log');
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user';
    userMsgDiv.innerHTML = `
      <p>${msg}</p>
      <div class="chat-message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    chatLog.appendChild(userMsgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
    
    if (!this.chatHistory) this.chatHistory = [];
    this.chatHistory.push({ role: 'user', content: msg });
    
    // Store in history
    this.addHistoryRecord('ai_assistant', msg, 'AI Assistant Chat Session');
    
    // Trigger typing indicator in chat log
    const typingIndicatorDiv = document.createElement('div');
    typingIndicatorDiv.className = 'chat-message bot typing-indicator-msg';
    typingIndicatorDiv.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatLog.appendChild(typingIndicatorDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Trigger loader state on the right side
    document.getElementById('results-waiting-placeholder').classList.add('hidden');
    document.getElementById('results-active-content').classList.add('hidden');
    
    const skeleton = document.getElementById('results-loading-skeleton');
    const loadingText = document.getElementById('skeleton-loading-text');
    skeleton.classList.remove('hidden');
    loadingText.textContent = "AI Core parsing prompt & compiling security guidelines...";
    
    // Simulate thinking delay
    setTimeout(() => {
      // Remove typing indicator
      const indicator = chatLog.querySelector('.typing-indicator-msg');
      if (indicator) indicator.remove();

      skeleton.classList.add('hidden');
      document.getElementById('results-active-content').classList.remove('hidden');
      
      // Generate response
      this.processChatResponse(msg);
    }, 1200);
  },

  processChatResponse(msg) {
    const query = msg.toLowerCase();
    let responseHtml = "";
    
    // Tone Style Modifiers
    let tonePrefix = "";
    let toneSuffix = "";
    if (this.settings.aiStyle === 'friendly') {
      tonePrefix = "<p><em>Hello! I am so sorry to hear you are dealing with this, but I'm here to support you step-by-step. Let's secure everything.</em></p>";
      toneSuffix = "<p><em>Feel free to ask any other questions. We can get this sorted out!</em></p>";
    } else if (this.settings.aiStyle === 'professional') {
      tonePrefix = "<p><strong>INCIDENT LOG INITIATED:</strong> Commencing emergency guidance analysis.</p>";
      toneSuffix = "<p>Security assessment completed. Please follow the checklist steps immediately.</p>";
    } else if (this.settings.aiStyle === 'concise') {
      tonePrefix = "";
      toneSuffix = "";
    }
    
    const isShort = this.settings.aiLength === 'short';
    const isDetailed = this.settings.aiLength === 'detailed';

    // Checklist Arrays
    const critical = [];
    const high = [];
    const recommended = [];
    
    // Module recommendation logic
    let redirectHtml = "";
    if (/phone|mobile|iphone|android|device/i.test(query) && !/fraud|bank|card|wallet/i.test(query)) {
      redirectHtml = `
        <div class="module-recommendation-banner">
          <div class="module-recommendation-text">
            <h5>📱 Specialized Lost Phone Recovery Available</h5>
            <p>Trigger a full device lock protocol and eSIM block sequences.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModule('phone')" style="background:var(--accent-orange); border-color:var(--accent-orange); color:#06040a;">Go <i data-lucide="arrow-right"></i></button>
        </div>
      `;
    } else if (/fraud|card|credit|debit|bank|upi|money|scam/i.test(query) && !/wallet|message|link|sms/i.test(query)) {
      redirectHtml = `
        <div class="module-recommendation-banner">
          <div class="module-recommendation-text">
            <h5>💳 Specialized Cyber Fraud Assistant Available</h5>
            <p>Freeze banking credentials and dial 1930 fraud tracking nodes.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModule('fraud')" style="background:var(--accent-green); border-color:var(--accent-green); color:#06040a;">Go <i data-lucide="arrow-right"></i></button>
        </div>
      `;
    } else if (/wallet|license|licence|pan|aadhaar|id/i.test(query) && !/phone|flight/i.test(query)) {
      redirectHtml = `
        <div class="module-recommendation-banner">
          <div class="module-recommendation-text">
            <h5>👛 Specialized Lost Wallet Recovery Available</h5>
            <p>Generate card cancellation templates and request ID pvc re-prints.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModule('wallet')" style="background:var(--accent-orange); border-color:var(--accent-orange); color:#06040a;">Go <i data-lucide="arrow-right"></i></button>
        </div>
      `;
    } else if (/flight|train|bus|cab|taxi|stranded|travel|airport/i.test(query)) {
      redirectHtml = `
        <div class="module-recommendation-banner">
          <div class="module-recommendation-text">
            <h5>🚆 Specialized Travel Help Available</h5>
            <p>Find nearby POIs on radar mapping and re-schedule connections.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModule('travel')" style="background:var(--accent-purple); border-color:var(--accent-purple); color:white;">Go <i data-lucide="arrow-right"></i></button>
        </div>
      `;
    } else if (/link|sms|email|screenshot|deepfake|message|fake/i.test(query)) {
      redirectHtml = `
        <div class="module-recommendation-banner">
          <div class="module-recommendation-text">
            <h5>🕵️ Specialized Scam & Content Analyzer Available</h5>
            <p>Scan links, analyze urgency syntax, and verify synthetic media.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openModule('analyzer')" style="background:var(--accent-orange); border-color:var(--accent-orange); color:#06040a;">Go <i data-lucide="arrow-right"></i></button>
        </div>
      `;
    }

    // Intents matching
    const isWriting = /draft|write|template|letter|complaint|fir|email|format/i.test(query);
    const isDocUnderstand = /explain|notice|understand|summary|summarize|red flag|warning sign/i.test(query);
    const isDigitalSafety = /phishing|otp|scam|secure|protect|password|privacy|social engineering/i.test(query) && !isWriting;
    const isProductivity = /checklist|packing|organize|contacts|decision|matrix|prepare/i.test(query);
    const isTravelPlan = /passport|alternate|missed|stranded|insurance/i.test(query) && !isWriting;

    // AI Safety Boundaries
    const isEmergencyServices = /police|ambulance|hospital|fire|murder|accident|bleeding|injury/i.test(query);
    const isMedical = /medical|medicine|symptom|disease|doctor|diagnose/i.test(query);
    const isLegal = /court|lawyer|sue|legal advice|advocate/i.test(query) && !isWriting;

    if (isEmergencyServices) {
      responseHtml = `
        <p style="color:var(--color-critical); font-weight:700;">⚠️ URGENT EMERGENCY ADVICE WARNING:</p>
        <p>If you are experiencing immediate physical danger, medical trauma, or ongoing security threats, please bypass this digital application and contact standard emergency services immediately:</p>
        <ul>
          <li><strong>India Emergency:</strong> Dial 112 (National Emergency Number)</li>
          <li><strong>United States:</strong> Dial 911 (Police / EMS)</li>
          <li><strong>United Kingdom:</strong> Dial 999</li>
        </ul>
        <p>I am a digital AI assistant and cannot contact local authorities or dispatch responders for you.</p>
      `;
      critical.push({ title: 'Contact emergency helpline 112 / 911', desc: 'Secure physical safety and dial official emergency responders immediately.' });
      high.push({ title: 'Find immediate safe shelter', desc: 'Move to a public space or official police substation.' });
      recommended.push({ title: 'Alert emergency contacts', desc: 'Pulsed SMS notifications or calls to your saved contacts in settings.' });

    } else if (isMedical) {
      responseHtml = `
        <p style="color:var(--color-critical); font-weight:700;">⚠️ MEDICAL DISCLAIMER:</p>
        <p>I cannot provide medical diagnoses, suggest prescription drugs, or replace licensed healthcare advice. Please consult a qualified doctor or contact local medical services for health inquiries.</p>
      `;
      critical.push({ title: 'Consult licensed medical professional', desc: 'Seek advice from a doctor or visit nearest health center.' });
    } else if (isLegal) {
      responseHtml = `
        <p style="color:var(--color-warning); font-weight:700;">⚠️ LEGAL DISCLAIMER:</p>
        <p>I cannot provide licensed legal advice or represent you in litigation. The templates provided are for reference only. Please consult a certified legal advisor or attorney for specific legal actions.</p>
      `;
      critical.push({ title: 'Consult qualified legal counselor', desc: 'Engage a certified lawyer to review security incidents.' });

    } else if (isWriting) {
      let docTitle = "Document Draft Template";
      let docContent = "";
      
      if (query.includes('fir') || query.includes('police') || query.includes('report')) {
        docTitle = "Official FIR Report Template";
        docContent = `To,\nThe Station House Officer,\n[Local Police Station Name]\n[City, State, Zip]\n\nSubject: Formal Complaint for Lost/Stolen Articles\n\nRespected Sir/Madam,\n\nI am writing to report the loss of my [Lost Article, e.g., Passport/Wallet/Mobile Phone] on [Date] at approximately [Time] near [Approximate Location].\n\nThe details of the lost articles are as follows:\n1. Model/Document No: [No. or Serial Number]\n2. Estimated Value: [Valuation]\n3. Associated Credentials: [e.g., linked SIM number +91 99999-xxxxx]\n\nI request you to kindly register this report and issue a Lost Document Report (LDR) copy to facilitate duplicate applications.\n\nThanking you,\n\nSincerely,\n\n[Your Name]\n[Contact Number]\n[Address]`;
      } else if (query.includes('bank') || query.includes('card') || query.includes('dispute') || query.includes('fraud') || query.includes('letter')) {
        docTitle = "Bank Fraud Transaction Dispute Letter";
        docContent = `To,\nThe Branch Manager,\n[Bank Name]\n[Branch Location Address]\n\nSubject: Dispute of Unauthorized Financial Transactions - Account No: [Account Number]\n\nDear Sir/Madam,\n\nI am writing to formally dispute the following unauthorized transaction(s) debited from my account on [Date of Transaction]:\n- Transaction Reference ID: [Ref Number]\n- Transaction Amount: [Amount in Rs/USD]\n- Merchant Name: [Merchant Info]\n\nI did not authorize or participate in this transaction, nor did I share my OTP/credentials with any third party. I request you to block my card/netbanking access immediately, initiate a chargeback claim, and reverse the disputed amount into my account.\n\nSincerely,\n\n[Your Name]\n[Contact Phone]\n[Email Address]`;
      } else {
        docTitle = "General Support Dispute Draft";
        docContent = `To,\nCustomer Support,\n[Service Provider Name]\n\nSubject: Urgent Account Restoration Request\n\nDear Support Team,\n\nI am writing to report that my user account linked to the email [Your Email] has been compromised. I have noticed unauthorized modifications to my settings and am currently locked out.\n\nPlease freeze account transactions and restore my access using my registered phone number [Your Phone].\n\nSincerely,\n\n[Your Name]`;
      }

      responseHtml = `
        <p>I have compiled a professional, copyable draft template for your request. You can copy the text below and customize the bracketed fields before sending it.</p>
        <div class="report-section" style="margin-top: 10px;">
          <div class="report-section-title"><i data-lucide="file-text"></i> ${docTitle}</div>
          <textarea id="ai-draft-textarea" readonly style="width:100%; height:180px; background:rgba(0,0,0,0.2); border:1px solid var(--border-glass); border-radius:8px; padding:10px; color:var(--text-primary); font-family:monospace; font-size:0.8rem; resize:none;">${docContent}</textarea>
          <button class="btn btn-secondary btn-sm" style="margin-top:8px; width:100%;" onclick="app.copyDraftToClipboard()">
            <i data-lucide="copy"></i> Copy Draft Template
          </button>
        </div>
      `;

      critical.push({ title: 'Block related cards/accounts', desc: 'Ensure that the account or document being written about is fully blocked first.' });
      high.push({ title: 'Copy the draft and fill details', desc: 'Copy the template, replace placeholder brackets, and submit to authorities.' });
      recommended.push({ title: 'Obtain submission receipt', desc: 'Keep a copy of the acknowledgment stamp, ticket ID, or online FIR copy for tracking.' });

    } else if (isDocUnderstand) {
      responseHtml = `
        <p><strong>Notice/Document Breakdown:</strong></p>
        <p>Based on document analysis guidelines, here is a simplified summary of the notice or message details:</p>
        <ul>
          <li><strong>Simplified Summary:</strong> This notice is requesting verification of account records. Suspicious markers indicate it is not from official bank channels.</li>
          <li><strong>Warning Signs / Red Flags:</strong>
            <br>- Sender address is non-standard.
            <br>- Employs urgency terms threat of suspension.
            <br>- Requests input of OTP or password.
          </li>
          <li><strong>Clarified Terms:</strong> <em>KYC Verification</em> refers to Know Your Customer compliance, which banks NEVER request via SMS links.</li>
        </ul>
      `;

      critical.push({ title: 'Do not click links or share codes', desc: 'Do not interact with the notice sender or click any attached links.' });
      high.push({ title: 'Verify on official portal', desc: 'Open the official website of the service directly (do not use the notice links) to check status.' });
      recommended.push({ title: 'Report to cyber authorities', desc: 'File a spam or fraud report using TRAI or Cyber Crime portals.' });

    } else if (isDigitalSafety) {
      responseHtml = `
        <p><strong>Digital Safety & Cyber Protection Guide:</strong></p>
        <p>To shield yourself from phishing and online identity scams, follow these primary rules:</p>
        <ol>
          <li><strong>Phishing Scams:</strong> Fraudulent emails or texts mimicking official portals (like banks, Amazon, or utilities) to steal credentials. Always inspect the URL.</li>
          <li><strong>OTP/UPI Scams:</strong> Scammers calling to claim a "refund" or "KYC failure" and requesting OTPs. Remember, OTPs are only for debiting/resetting, not receiving money.</li>
          <li><strong>Password Security:</strong> Use a password manager and enable Multi-Factor Authentication (MFA) on all primary email and bank portals.</li>
        </ol>
      `;

      critical.push({ title: 'Enable MFA/2FA on primary email', desc: 'Secure your master email account using Google/Microsoft Authenticator keys.' });
      high.push({ title: 'Inspect URLs before login', desc: 'Always verify that the address bar matches the official brand site exactly (e.g. check for typos).' });
      recommended.push({ title: 'Audit online credentials', desc: 'Run a security check on saved browser passwords to check for compromises.' });

    } else if (isProductivity) {
      responseHtml = `
        <p><strong>Emergency Preparedness & Packing Checklist:</strong></p>
        <p>I have built an emergency resource checklist to help you stay organized. You can check off items on the right side panel.</p>
        <ul>
          <li><strong>Essential Documentation:</strong> Physical photocopies, digital scans in secure clouds, offline maps.</li>
          <li><strong>Financial Backups:</strong> Emergency cash in a separate pocket, secondary bank card, offline support numbers.</li>
          <li><strong>Physical Toolkit:</strong> Powerbank, flashlight, first-aid pack, primary medication.</li>
        </ul>
      `;

      critical.push({ title: 'Backup primary credentials offline', desc: 'Write down emergency contacts and backup keys on paper.' });
      high.push({ title: 'Prepare physical travel toolkit', desc: 'Pack a powerbank, flashlight, and secondary card.' });
      recommended.push({ title: 'Configure SOS triggers on phone', desc: 'Enable native power-button SOS calls on Android or iOS.' });

    } else if (isTravelPlan) {
      responseHtml = `
        <p><strong>Emergency Travel Assistance:</strong></p>
        <p>If you've experienced a passport loss or missed connection while traveling, follow these guidelines:</p>
        <ul>
          <li><strong>Passport Lost Abroad:</strong> Contact your national embassy or consulate immediately to apply for an Emergency Certificate (EC) for transit.</li>
          <li><strong>Missed Flight / Connection:</strong> Request the airline desk for "Rule 240" transit or look up Tatkal train berths on IRCTC.</li>
          <li><strong>Travel Insurance:</strong> Declare disruptions to your insurance operator within 24 hours to secure compensation coverage.</li>
        </ul>
      `;

      critical.push({ title: 'Contact nearest embassy/consulate', desc: 'Report passport loss to secure an Emergency Certificate (EC).' });
      high.push({ title: 'Request airline re-routing berths', desc: 'Ask airline desk for alternate flights or accommodation allowance.' });
      recommended.push({ title: 'Notify travel insurance agent', desc: 'Register the connection failure claim within 24 hours.' });

    } else {
      // General Q&A Fallback
      responseHtml = `
        <p>I am here to guide you. I can provide instructions for Lost Phones, Cyber Scams, Lost Wallets, Travel issues, and Scam Reports.</p>
        <p>To help you best, could you tell me a bit more about the specific incident? For example, did you lose an article, click a link, or need a draft letter?</p>
      `;

      critical.push({ title: 'Identify safety risks', desc: 'Secure your physical safety and isolate any compromised accounts.' });
      high.push({ title: 'Detail the emergency', desc: 'Describe the incident in the chat or open the specialized dashboard module.' });
      recommended.push({ title: 'Access Emergency Contacts', desc: 'Open Settings to check your saved SOS support details.' });
    }

    // Adjust length modifiers in output text
    if (isShort && responseHtml.includes('</p>')) {
      responseHtml = responseHtml.split('</p>')[0] + "</p>" + toneSuffix;
    } else {
      responseHtml = tonePrefix + responseHtml + redirectHtml + toneSuffix;
    }

    // Append response to chat log
    const chatLog = document.getElementById('chat-messages-log');
    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'chat-message bot';
    botMsgDiv.innerHTML = `
      ${responseHtml}
      <div class="chat-message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    chatLog.appendChild(botMsgDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
    
    // Store bot response in conversational history
    this.chatHistory.push({ role: 'assistant', content: botMsgDiv.innerText });

    // Render the structured plan checklist on the right side panel
    this.renderChatPlanChecklist(critical, high, recommended);
  },

  renderChatPlanChecklist(critical, high, recommended) {
    const specialWidget = document.getElementById('results-special-widget');
    const checklistContainer = document.getElementById('results-checklist-container');
    const contentHeader = document.getElementById('results-content-header');
    
    specialWidget.innerHTML = '';
    checklistContainer.innerHTML = '';
    contentHeader.innerHTML = '';

    contentHeader.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="font-size:1.15rem; color:var(--accent-orange); font-family:var(--font-heading);">AI Structured Response Checklist</h3>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">Check off containment steps dynamically.</p>
        </div>
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); padding:0.4rem 0.8rem; border-radius:8px; display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.8rem; color:var(--text-secondary);">Progress:</span>
          <span id="plan-progress-percent" style="font-weight:700; color:var(--accent-green);">0%</span>
        </div>
      </div>
    `;
    
    this.renderChecklistPriorityGroups(checklistContainer, critical, high, recommended);
    lucide.createIcons();
    this.updateChecklistProgress();
  },

  toggleHistoryPanel(show = null) {
    const panel = document.getElementById('history-panel');
    if (show === null) {
      const active = panel.classList.toggle('active');
      if (active) this.renderHistoryItems();
    } else if (show) {
      panel.classList.add('active');
      this.renderHistoryItems();
    } else {
      panel.classList.remove('active');
    }
  },

  toggleSettingsPanel(show = null) {
    const panel = document.getElementById('settings-panel');
    if (show === null) {
      panel.classList.toggle('active');
    } else if (show) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  },

  setupSettingsAccordion() {
    const cards = document.querySelectorAll('.settings-card');
    cards.forEach(card => {
      const header = card.querySelector('.settings-card-header');
      header.addEventListener('click', () => {
        const body = card.querySelector('.settings-card-body');
        const isExpanded = card.classList.toggle('expanded');
        if (isExpanded) {
          body.style.display = 'block';
        } else {
          body.style.display = 'none';
        }
      });
      // Prevent clicks inside body from collapsing accordion
      const body = card.querySelector('.settings-card-body');
      if (body) {
        body.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    });
  },

  addHistoryRecord(moduleKey, queryText, titleText) {
    let history = JSON.parse(localStorage.getItem('crisis_assist_history') || '[]');
    
    // To prevent duplicate records of identical queries
    history = history.filter(item => !(item.module === moduleKey && item.query === queryText));
    
    const record = {
      id: Date.now().toString(),
      module: moduleKey,
      query: queryText,
      title: titleText,
      timestamp: new Date().toLocaleString(),
      answers: JSON.parse(JSON.stringify(this.answers))
    };
    
    history.unshift(record);
    
    if (history.length > 5) {
      history = history.slice(0, 5);
    }
    
    localStorage.setItem('crisis_assist_history', JSON.stringify(history));
    this.renderHistoryItems();
  },

  renderHistoryItems() {
    const container = document.getElementById('history-items-container');
    if (!container) return;
    container.innerHTML = '';
    
    const history = JSON.parse(localStorage.getItem('crisis_assist_history') || '[]');
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-secondary);">
          <i data-lucide="info" style="font-size:2rem; color:var(--text-muted); margin-bottom:1rem; display:block; margin-left:auto; margin-right:auto;"></i>
          <p>No history records found.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
    const iconMap = {
      phone: 'smartphone',
      fraud: 'shield-alert',
      wallet: 'wallet',
      travel: 'map-pin',
      analyzer: 'file-search',
      ai_assistant: 'bot'
    };

    const nameMap = {
      phone: 'Lost Phone Recovery',
      fraud: 'Cyber Fraud Assistant',
      wallet: 'Lost Wallet Recovery',
      travel: 'Travel Help',
      analyzer: 'Scam Analyzer',
      ai_assistant: 'AI Assistant'
    };

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-card history-item-card';
      card.style.padding = '1rem';
      card.style.marginBottom = '1rem';
      card.style.cursor = 'pointer';
      card.style.display = 'flex';
      card.style.alignItems = 'flex-start';
      card.style.gap = '12px';
      
      const iconName = iconMap[item.module] || 'activity';
      const moduleName = nameMap[item.module] || item.module;
      const queryPreview = item.query.length > 65 ? item.query.substring(0, 65) + '...' : item.query;
      
      card.innerHTML = `
        <div class="history-item-icon" style="color:var(--accent-orange); margin-top:2px;">
          <i data-lucide="${iconName}"></i>
        </div>
        <div class="history-item-content" style="flex-grow:1;">
          <h4 style="font-size:0.95rem; font-family:var(--font-heading);">${moduleName}</h4>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">${queryPreview}</p>
          <span style="font-size:0.7rem; color:var(--text-muted); display:block; margin-top:6px;">${item.timestamp}</span>
        </div>
        <button class="history-delete-btn" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:4px; margin-top:-2px;">
          <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
        </button>
      `;
      
      // Wire click-to-reopen on card body
      card.querySelector('.history-item-content').addEventListener('click', () => {
        app.reopenHistoryItem(item.id);
      });
      
      // Wire individual delete button
      const delBtn = card.querySelector('.history-delete-btn');
      delBtn.addEventListener('mouseenter', () => delBtn.style.color = 'var(--color-critical)');
      delBtn.addEventListener('mouseleave', () => delBtn.style.color = 'var(--text-muted)');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        app.deleteHistoryItem(item.id);
      });
      
      container.appendChild(card);
    });
    
    lucide.createIcons();
  },

  deleteHistoryItem(id) {
    if (confirm("Are you sure you want to permanently delete this history item?")) {
      let history = JSON.parse(localStorage.getItem('crisis_assist_history') || '[]');
      history = history.filter(item => item.id !== id);
      localStorage.setItem('crisis_assist_history', JSON.stringify(history));
      this.renderHistoryItems();
    }
  },

  clearAllHistory() {
    if (confirm("Are you sure you want to permanently clear all history?")) {
      localStorage.removeItem('crisis_assist_history');
      this.renderHistoryItems();
    }
  },

  reopenHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem('crisis_assist_history') || '[]');
    const record = history.find(r => r.id === id);
    if (!record) return;
    
    // Close history panel
    this.toggleHistoryPanel(false);
    
    // Load answers and state
    this.isReopeningHistory = true;
    this.answers = record.answers || {};
    this.activeModule = record.module;
    
    // Open the module
    this.openModule(record.module);
    
    if (record.module === 'ai_assistant') {
      // Reopen AI Assistant chat with the user's past query
      const chatInput = document.getElementById('chat-user-input');
      if (chatInput) {
        chatInput.value = record.query;
        this.sendChatMessage();
      }
    } else {
      // Re-generate recovery checklist plan directly
      this.generateRecoveryPlan();
    }
    
    this.isReopeningHistory = false;
  },

  loadSettings() {
    const stored = localStorage.getItem('crisis_assist_settings');
    if (stored) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }
    this.applySettings();
  },

  applySettings() {
    // Theme
    let theme = this.settings.theme;
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', theme);
    
    // Theme Active buttons class update
    ['dark', 'light', 'system'].forEach(t => {
      const btn = document.getElementById(`theme-btn-${t}`);
      if (btn) {
        if (t === this.settings.theme) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    // Accent
    document.documentElement.setAttribute('data-accent', this.settings.accent);
    ['orange', 'green', 'purple', 'cyan'].forEach(c => {
      const opt = document.getElementById(`accent-opt-${c}`);
      if (opt) {
        if (c === this.settings.accent) opt.classList.add('active');
        else opt.classList.remove('active');
      }
    });

    // Compact Mode
    if (this.settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
    const compactCb = document.getElementById('setting-compact-mode');
    if (compactCb) compactCb.checked = this.settings.compactMode;

    // Sync Input elements
    const langInput = document.getElementById('setting-language');
    if (langInput) langInput.value = this.settings.language;

    const dateInput = document.getElementById('setting-date-format');
    if (dateInput) dateInput.value = this.settings.dateFormat;

    const aiStyleSelect = document.getElementById('setting-ai-style');
    if (aiStyleSelect) aiStyleSelect.value = this.settings.aiStyle;

    const aiLengthSelect = document.getElementById('setting-ai-length');
    if (aiLengthSelect) aiLengthSelect.value = this.settings.aiLength;

    const aiFollowupsCb = document.getElementById('setting-ai-followups');
    if (aiFollowupsCb) aiFollowupsCb.checked = this.settings.aiFollowups;

    const aiPromptsCb = document.getElementById('setting-ai-prompts');
    if (aiPromptsCb) aiPromptsCb.checked = this.settings.aiPrompts;

    const privacyStoreCb = document.getElementById('setting-privacy-store');
    if (privacyStoreCb) privacyStoreCb.checked = this.settings.privacyStore;

    const privacyDurationSelect = document.getElementById('setting-privacy-duration');
    if (privacyDurationSelect) privacyDurationSelect.value = this.settings.privacyDuration;

    const locationGpsCb = document.getElementById('setting-location-gps');
    if (locationGpsCb) locationGpsCb.checked = this.settings.locationGPS;

    const locationManualInput = document.getElementById('setting-location-manual');
    if (locationManualInput) locationManualInput.value = this.settings.locationManual;

    const locationRecsCb = document.getElementById('setting-location-recs');
    if (locationRecsCb) locationRecsCb.checked = this.settings.locationRecs;

    // Contacts & History counts
    this.renderEmergencyContacts();
    this.updateHistoryCountDisplay();
  },

  saveSettings() {
    localStorage.setItem('crisis_assist_settings', JSON.stringify(this.settings));
  },

  setThemeSetting(theme) {
    this.settings.theme = theme;
    this.saveSettings();
    this.applySettings();
  },

  setAccentSetting(accent) {
    this.settings.accent = accent;
    this.saveSettings();
    this.applySettings();
  },

  toggleCompactMode(checked) {
    this.settings.compactMode = checked;
    this.saveSettings();
    this.applySettings();
  },

  saveLanguageSettings() {
    this.settings.language = document.getElementById('setting-language').value;
    this.settings.dateFormat = document.getElementById('setting-date-format').value;
    this.saveSettings();
    alert("Language and localization settings saved successfully!");
    this.applySettings();
  },

  saveAISettings() {
    this.settings.aiStyle = document.getElementById('setting-ai-style').value;
    this.settings.aiLength = document.getElementById('setting-ai-length').value;
    this.settings.aiFollowups = document.getElementById('setting-ai-followups').checked;
    this.settings.aiPrompts = document.getElementById('setting-ai-prompts').checked;
    this.saveSettings();
    if (this.activeModule === 'ai_assistant') {
      this.renderChatInterface();
    }
  },

  savePrivacySettings() {
    this.settings.privacyStore = document.getElementById('setting-privacy-store').checked;
    this.settings.privacyDuration = document.getElementById('setting-privacy-duration').value;
    this.saveSettings();
  },

  toggleGPSLocation(checked) {
    this.settings.locationGPS = checked;
    if (checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const lon = pos.coords.longitude.toFixed(4);
            this.settings.locationManual = `GPS: ${lat}, ${lon}`;
            const manualInput = document.getElementById('setting-location-manual');
            if (manualInput) manualInput.value = this.settings.locationManual;
            this.saveSettings();
            alert(`Location coordinates retrieved: ${lat}, ${lon}`);
          },
          (err) => {
            console.error(err);
            alert("Could not retrieve GPS coordinates automatically. Please input location manually.");
            document.getElementById('setting-location-gps').checked = false;
            this.settings.locationGPS = false;
            this.saveSettings();
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        document.getElementById('setting-location-gps').checked = false;
        this.settings.locationGPS = false;
        this.saveSettings();
      }
    } else {
      this.saveSettings();
    }
  },

  saveLocationSettings() {
    this.settings.locationManual = document.getElementById('setting-location-manual').value.trim();
    this.settings.locationRecs = document.getElementById('setting-location-recs').checked;
    this.saveSettings();
    alert("Location parameters saved successfully!");
  },

  updateHistoryCountDisplay() {
    const countEl = document.getElementById('settings-history-count');
    if (countEl) {
      const history = JSON.parse(localStorage.getItem('crisis_assist_history') || '[]');
      countEl.textContent = history.length;
    }
  },

  renderEmergencyContacts() {
    const listContainer = document.getElementById('settings-contacts-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    const contacts = this.settings.contacts || [];
    if (contacts.length === 0) {
      listContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding: 10px 0;">No emergency contacts added yet.</p>`;
      return;
    }
    contacts.forEach((contact, idx) => {
      const card = document.createElement('div');
      card.className = 'contact-item-card';
      card.innerHTML = `
        <div class="contact-card-info">
          <h5>${contact.name}</h5>
          <p>${contact.phone} (${contact.relationship})</p>
        </div>
        <div class="contact-card-actions">
          <button class="contact-action-btn delete" onclick="app.deleteEmergencyContact(${idx})" title="Delete">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        </div>
      `;
      listContainer.appendChild(card);
    });
    lucide.createIcons();
  },

  addNewEmergencyContact() {
    const name = document.getElementById('contact-new-name').value.trim();
    const phone = document.getElementById('contact-new-phone').value.trim();
    const relationship = document.getElementById('contact-new-rel').value.trim();
    if (!name || !phone || !relationship) {
      alert("Please fill in all contact fields.");
      return;
    }
    if (!this.settings.contacts) this.settings.contacts = [];
    this.settings.contacts.push({ name, phone, relationship });
    this.saveSettings();
    this.applySettings();
    document.getElementById('contact-new-name').value = '';
    document.getElementById('contact-new-phone').value = '';
    document.getElementById('contact-new-rel').value = '';
    alert("Emergency contact added successfully.");
  },

  deleteEmergencyContact(idx) {
    if (confirm("Are you sure you want to remove this emergency contact?")) {
      this.settings.contacts.splice(idx, 1);
      this.saveSettings();
      this.applySettings();
    }
  },

  submitSituationText() {
    const textarea = document.getElementById('universal-situation-input');
    const text = textarea.value.trim();
    if (!text) {
      alert("Please type a description of your situation first.");
      return;
    }
    
    // Clear textarea
    textarea.value = '';
    
    // Trigger loading state in the results panel
    document.getElementById('results-waiting-placeholder').classList.add('hidden');
    document.getElementById('results-active-content').classList.add('hidden');
    const skeleton = document.getElementById('results-loading-skeleton');
    skeleton.classList.remove('hidden');
    
    const loadingMessages = {
      phone: 'Extracting device parameters and loss metrics...',
      fraud: 'Parsing transaction details and checking golden recovery window...',
      wallet: 'Scanning document listings and blocking procedures...',
      travel: 'Re-routing transit systems and mapping emergency shelters...',
      analyzer: 'Scanning links and running threat analysis heuristics...'
    };
    document.getElementById('skeleton-loading-text').textContent = loadingMessages[this.activeModule] || 'Analyzing situation...';
    
    setTimeout(() => {
      skeleton.classList.add('hidden');
      app.parseSituationTextAndRoute(text);
    }, 1500);
  },

  parseSituationTextAndRoute(text) {
    const query = text.toLowerCase();
    const answers = {};
    
    if (this.activeModule === 'phone') {
      if (query.includes('iphone') || query.includes('ios') || query.includes('apple') || query.includes('mac')) {
        answers.platform = 'ios';
      } else if (query.includes('android') || query.includes('samsung') || query.includes('pixel') || query.includes('oneplus') || query.includes('mi ') || query.includes('redmi') || query.includes('motorola')) {
        answers.platform = 'android';
      }
      
      if (query.includes('stolen') || query.includes('robbed') || query.includes('pickpocket') || query.includes('thief') || query.includes('took') || query.includes('snatch')) {
        answers.incident_type = 'stolen';
      } else if (query.includes('lost') || query.includes('misplaced') || query.includes('forgot') || query.includes('left') || query.includes('drop')) {
        answers.incident_type = 'lost';
      }

      if (query.includes('bank') || query.includes('card') || query.includes('gpay') || query.includes('paytm') || query.includes('upi') || query.includes('phonepe') || query.includes('financial') || query.includes('money') || query.includes('wallet')) {
        answers.sensitive_apps = 'yes';
      } else if (query.includes('no bank') || query.includes('no upi') || query.includes('nothing sensitive') || query.includes('public')) {
        answers.sensitive_apps = 'no';
      }

      // Defaults
      answers.missing_time = '1h';
      answers.tracking = 'yes';
      answers.find_my = 'yes';
      answers.sim_status = 'yes';
      answers.other_device = 'yes';

      const missing = [];
      if (!answers.platform) missing.push('platform');
      if (!answers.incident_type) missing.push('incident_type');
      if (!answers.sensitive_apps) missing.push('sensitive_apps');

      if (missing.length > 0) {
        this.renderSituationFollowups(missing, answers);
      } else {
        this.answers = answers;
        this.generateRecoveryPlan();
      }

    } else if (this.activeModule === 'fraud') {
      if (query.includes('upi') || query.includes('gpay') || query.includes('phonepe') || query.includes('paytm') || query.includes('immediate transfer')) {
        answers.fraud_type = 'upi';
      } else if (query.includes('card') || query.includes('credit') || query.includes('debit') || query.includes('atm')) {
        answers.fraud_type = 'card';
      } else if (query.includes('otp') || query.includes('one-time password') || query.includes('code sharing')) {
        answers.fraud_type = 'otp';
      } else if (query.includes('link') || query.includes('phishing') || query.includes('email') || query.includes('sms link')) {
        answers.fraud_type = 'phishing';
      } else if (query.includes('investment') || query.includes('crypto') || query.includes('shares') || query.includes('trading')) {
        answers.fraud_type = 'investment';
      }

      if (query.includes('just now') || query.includes('hour') || query.includes('minutes') || query.includes('recent') || query.includes('golden')) {
        answers.elapsed_time = 'golden';
      } else if (query.includes('yesterday') || query.includes('hours') || query.includes('day')) {
        answers.elapsed_time = 'day';
      } else if (query.includes('days') || query.includes('week') || query.includes('long ago')) {
        answers.elapsed_time = 'long';
      }

      // Defaults
      answers.amount = 'medium';
      answers.account_access = 'yes';
      answers.bank_contacted = 'no';
      answers.unauthorized_activity = 'no';

      const missing = [];
      if (!answers.fraud_type) missing.push('fraud_type');
      if (!answers.elapsed_time) missing.push('elapsed_time');

      if (missing.length > 0) {
        this.renderSituationFollowups(missing, answers);
      } else {
        this.answers = answers;
        this.generateRecoveryPlan();
      }

    } else if (this.activeModule === 'wallet') {
      const items = [];
      if (query.includes('debit')) items.push('debit');
      if (query.includes('credit')) items.push('credit');
      if (query.includes('aadhaar') || query.includes('uidai') || query.includes('national id') || query.includes('aadhar')) items.push('aadhaar');
      if (query.includes('pan') || query.includes('income tax')) items.push('pan');
      if (query.includes('license') || query.includes('licence') || query.includes('dl') || query.includes('driving')) items.push('dl');
      if (query.includes('office') || query.includes('badge') || query.includes('work id')) items.push('office');
      if (query.includes('passport')) items.push('passport');
      if (query.includes('cash')) items.push('cash');
      
      answers.items = items;

      if (items.length === 0) {
        this.renderSituationFollowups(['items'], answers);
      } else {
        this.answers = answers;
        this.generateRecoveryPlan();
      }

    } else if (this.activeModule === 'travel') {
      if (query.includes('train')) answers.incident = 'train';
      else if (query.includes('bus')) answers.incident = 'bus';
      else if (query.includes('flight') || query.includes('plane') || query.includes('airport')) answers.incident = 'flight';
      else if (query.includes('cab') || query.includes('taxi') || query.includes('uber') || query.includes('driver')) answers.incident = 'cab';
      else if (query.includes('baggage') || query.includes('luggage') || query.includes('suitcase') || query.includes('bags')) answers.incident = 'baggage';
      else if (query.includes('stranded') || query.includes('location') || query.includes('weather') || query.includes('lost')) answers.incident = 'stranded';
      else if (query.includes('hotel') || query.includes('stay') || query.includes('accommodation')) answers.incident = 'accommodation';

      if (!answers.incident) {
        this.renderSituationFollowups(['incident'], answers);
      } else {
        this.answers = answers;
        this.generateRecoveryPlan();
      }

    } else if (this.activeModule === 'analyzer') {
      const isUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(query) || query.includes('http') || query.includes('.com') || query.includes('.net') || query.includes('.info') || query.includes('.org') || query.includes('www.');
      if (isUrl) {
        this.answers.analyzer_type = 'link';
        this.answers.scan_input = text;
      } else {
        this.answers.analyzer_type = 'message';
        this.answers.scan_input = text;
      }
      this.generateRecoveryPlan();
    }
  },

  renderSituationFollowups(missingFields, extractedAnswers) {
    document.getElementById('results-waiting-placeholder').classList.add('hidden');
    document.getElementById('results-loading-skeleton').classList.add('hidden');
    
    const activeContent = document.getElementById('results-active-content');
    activeContent.classList.remove('hidden');
    
    const specialWidget = document.getElementById('results-special-widget');
    const checklistContainer = document.getElementById('results-checklist-container');
    const contentHeader = document.getElementById('results-content-header');
    
    specialWidget.innerHTML = '';
    checklistContainer.innerHTML = '';
    
    contentHeader.innerHTML = `
      <div class="glass-card" style="padding:1.5rem; border-color:var(--accent-purple); display:flex; flex-direction:column; gap:12px;">
        <h3 style="font-size:1.15rem; color:var(--accent-purple); display:flex; align-items:center; gap:8px;">
          <i data-lucide="sparkles"></i> AI Situation Analyzer
        </h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">I parsed your situation description but need to clarify a few details to generate your custom recovery checklist.</p>
      </div>
    `;

    const formDiv = document.createElement('div');
    formDiv.style.display = 'flex';
    formDiv.style.flexDirection = 'column';
    formDiv.style.gap = '1.25rem';
    formDiv.style.marginTop = '1.5rem';

    const questionsMap = {
      phone: {
        platform: {
          label: "What operating system is the phone running?",
          options: [{text: "Apple iOS (iPhone)", value: "ios"}, {text: "Android", value: "android"}]
        },
        incident_type: {
          label: "Was the phone misplaced (Lost) or pickpocketed (Stolen)?",
          options: [{text: "Misplaced / Lost", value: "lost"}, {text: "Stolen / Taken", value: "stolen"}]
        },
        sensitive_apps: {
          label: "Are active banking, UPI, or financial credentials stored on it?",
          options: [{text: "Yes, banking apps are stored", value: "yes"}, {text: "No", value: "no"}]
        }
      },
      fraud: {
        fraud_type: {
          label: "What category of cyber fraud incident occurred?",
          options: [
            {text: "UPI / Bank Transfer Fraud", value: "upi"},
            {text: "Credit / Debit Card Transaction", value: "card"},
            {text: "OTP Sharing scam", value: "otp"},
            {text: "Phishing link clicked", value: "phishing"},
            {text: "Fake investment / Crypto scam", value: "investment"}
          ]
        },
        elapsed_time: {
          label: "When did the fraudulent transaction take place?",
          options: [
            {text: "Within the last 2 hours (Golden window)", value: "golden"},
            {text: "2 to 24 hours ago", value: "day"},
            {text: "More than 24 hours ago", value: "long"}
          ]
        }
      },
      wallet: {
        items: {
          label: "Confirm which critical documents/cards were inside the wallet:",
          type: "multiselect",
          options: [
            {text: "Debit Card", value: "debit"},
            {text: "Credit Card", value: "credit"},
            {text: "Aadhaar / Nat ID Card", value: "aadhaar"},
            {text: "PAN Card", value: "pan"},
            {text: "Driving Licence", value: "dl"},
            {text: "Office ID Badge", value: "office"},
            {text: "Passport", value: "passport"},
            {text: "Cash Only", value: "cash"}
          ]
        }
      },
      travel: {
        incident: {
          label: "What emergency event has impacted your transit?",
          options: [
            {text: "Missed Train connection", value: "train"},
            {text: "Missed Bus", value: "bus"},
            {text: "Missed / Cancelled Flight", value: "flight"},
            {text: "Missed Cab / Stranded driver", value: "cab"},
            {text: "Baggage lost by transit operator", value: "baggage"},
            {text: "Stranded in unfamiliar location", value: "stranded"},
            {text: "Emergency accommodation needed", value: "accommodation"}
          ]
        }
      }
    };

    const activeModQuestions = questionsMap[this.activeModule];

    missingFields.forEach(field => {
      const qData = activeModQuestions[field];
      if (!qData) return;

      const qBox = document.createElement('div');
      qBox.className = 'glass-card';
      qBox.style.padding = '1.2rem';
      qBox.style.borderColor = 'rgba(255,255,255,0.05)';
      
      const label = document.createElement('h4');
      label.style.fontSize = '0.9rem';
      label.style.marginBottom = '0.75rem';
      label.textContent = qData.label;
      qBox.appendChild(label);

      if (qData.type === 'multiselect') {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr 1fr';
        grid.style.gap = '8px';

        qData.options.forEach(opt => {
          const cbLabel = document.createElement('label');
          cbLabel.style.fontSize = '0.8rem';
          cbLabel.style.display = 'flex';
          cbLabel.style.alignItems = 'center';
          cbLabel.style.gap = '8px';
          cbLabel.style.cursor = 'pointer';

          cbLabel.innerHTML = `<input type="checkbox" name="followup-${field}" value="${opt.value}" class="task-checkbox" style="margin: 0; width:16px; height:16px;"> <span style="font-weight: 500;">${opt.text}</span>`;
          grid.appendChild(cbLabel);
        });
        qBox.appendChild(grid);
      } else {
        const grid = document.createElement('div');
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.gap = '6px';

        qData.options.forEach(opt => {
          const radLabel = document.createElement('label');
          radLabel.style.fontSize = '0.8rem';
          radLabel.style.display = 'flex';
          radLabel.style.alignItems = 'center';
          radLabel.style.gap = '8px';
          radLabel.style.cursor = 'pointer';
          radLabel.style.padding = '0.5rem';
          radLabel.style.background = 'rgba(255,255,255,0.02)';
          radLabel.style.border = '1px solid var(--border-glass)';
          radLabel.style.borderRadius = '8px';

          radLabel.innerHTML = `<input type="radio" name="followup-${field}" value="${opt.value}" style="margin:0; width:16px; height:16px; accent-color:var(--accent-purple);"> <span style="font-weight: 500;">${opt.text}</span>`;
          grid.appendChild(radLabel);
        });
        qBox.appendChild(grid);
      }

      formDiv.appendChild(qBox);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.background = 'linear-gradient(135deg, var(--accent-purple) 0%, #6200ea 100%)';
    submitBtn.style.color = '#fff';
    submitBtn.style.width = '100%';
    submitBtn.innerHTML = `Compile Recovery Plan <i data-lucide="activity"></i>`;
    submitBtn.addEventListener('click', () => {
      const finalAnswers = { ...extractedAnswers };
      let missingInput = false;

      missingFields.forEach(field => {
        const qData = activeModQuestions[field];
        if (qData.type === 'multiselect') {
          const checked = Array.from(document.querySelectorAll(`input[name="followup-${field}"]:checked`)).map(el => el.value);
          if (checked.length === 0) {
            missingInput = true;
          }
          finalAnswers[field] = checked;
        } else {
          const checkedEl = document.querySelector(`input[name="followup-${field}"]:checked`);
          if (!checkedEl) {
            missingInput = true;
          } else {
            finalAnswers[field] = checkedEl.value;
          }
        }
      });

      if (missingInput) {
        alert("Please answer all follow-up questions to generate the plan.");
        return;
      }

      app.answers = finalAnswers;
      app.generateRecoveryPlan();
    });

    formDiv.appendChild(submitBtn);
    checklistContainer.appendChild(formDiv);
    lucide.createIcons();
  },

  clearChatSessionHistory() {
    this.chatHistory = [];
    if (this.activeModule === 'ai_assistant') {
      this.renderChatInterface();
    }
    alert("Chat session history cleared.");
  },

  copyDraftToClipboard() {
    const textarea = document.getElementById('ai-draft-textarea');
    if (textarea) {
      textarea.select();
      navigator.clipboard.writeText(textarea.value).then(() => {
        alert("Draft template copied to clipboard!");
      });
    }
  }
};
