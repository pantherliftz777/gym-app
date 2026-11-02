/* FitFuel Beta Features & Access Management Client Module
   Enforces feature gating, renders admin controls, beta badges, locked states, and feedback collection.
*/
(function () {
  'use strict';

  const VIEW_FEATURE_MAP = {
    'posture': 'posture',
    'body-analysis': 'body-analysis',
    'activity': 'gps-activity',
    'food-scanner': 'food-scanner',
    'voice-coach': 'voice-coach',
    'barcode-scanner': 'barcode-scanner'
  };

  const FEATURE_TITLES = {
    'posture': 'Posture AI / Posture Camera',
    'body-analysis': 'Body Analysis & Transformation Scan',
    'gps-activity': 'GPS Activity Tracking',
    'food-scanner': 'Food Photo Scan',
    'voice-coach': 'Voice Mode',
    'barcode-scanner': 'Barcode Scanner'
  };

  class BetaFeatureManagerClient {
    constructor() {
      this.state = {
        userRole: 'guest',
        isAdmin: false,
        isTester: false,
        features: {}
      };
      this.adminFlags = [];
      this.adminTesters = [];
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return;
      this.initialized = true;

      // Initial fetch of features
      await this.fetchBetaFeatures();

      // Bind feedback modal events
      this._bindFeedbackModal();

      // Bind admin portal events
      this._bindAdminEvents();

      // Periodically refresh if auth state changes
      window.addEventListener('fitfuel:auth-changed', () => {
        this.fetchBetaFeatures();
      });
    }

    _getToken() {
      return localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token') || null;
    }

    async fetchBetaFeatures() {
      try {
        const token = this._getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch('/api/beta-features', { headers });
        if (res.ok) {
          const data = await res.json();
          this.state = {
            userRole: data.userRole || 'guest',
            isAdmin: Boolean(data.isAdmin),
            isTester: Boolean(data.isTester),
            features: data.features || {}
          };
          this.applyVisibility();
          return this.state;
        }
      } catch (err) {
        console.warn('[FitFuelBeta] Failed to fetch beta features:', err.message);
      }
      return this.state;
    }

    isFeatureEnabled(viewOrKey) {
      const key = VIEW_FEATURE_MAP[viewOrKey] || viewOrKey;
      // Pre-existing production features must always remain open and accessible to all members
      if (['body-analysis', 'activity', 'gps-activity'].includes(key)) {
        return true;
      }
      if (!this.state.features[key]) {
        // Safe default: if unknown or not loaded yet, assume false for experimental features
        return false;
      }
      return Boolean(this.state.features[key].enabled);
    }

    getFeatureMeta(viewOrKey) {
      const key = VIEW_FEATURE_MAP[viewOrKey] || viewOrKey;
      return this.state.features[key] || {
        key,
        name: FEATURE_TITLES[key] || key,
        enabled: false,
        access_level: 'admin_only',
        is_beta: true
      };
    }

    applyVisibility() {
      const { features, isTester, isAdmin } = this.state;

      // 1. Sidebar Labs / Posture button
      const sidebarLabsBtn = document.getElementById('sidebarPostureBtn');
      if (sidebarLabsBtn) {
        const postureOk = this.isFeatureEnabled('posture');
        const bodyOk = this.isFeatureEnabled('body-analysis');
        const showLabs = postureOk || bodyOk;
        sidebarLabsBtn.style.display = showLabs ? 'inline-flex' : 'none';

        // Ensure BETA tag is visible if it's beta tier
        let tag = sidebarLabsBtn.querySelector('.beta-nav-tag');
        if (showLabs && (features['posture']?.is_beta || features['body-analysis']?.is_beta)) {
          if (!tag) {
            tag = document.createElement('span');
            tag.className = 'beta-nav-tag';
            tag.textContent = 'BETA';
            sidebarLabsBtn.appendChild(tag);
          }
        } else if (tag) {
          tag.remove();
        }
      }

      // 2. Hub Subnavs for Posture, Body Analysis, Activity
      document.querySelectorAll('.hub-subnav-btn[data-hubview]').forEach(btn => {
        const view = btn.dataset.hubview;
        if (['posture', 'body-analysis', 'activity'].includes(view)) {
          // Pre-existing features and closed-beta views remain navigable so users can see active or preview cards
          btn.style.display = 'inline-flex';

          // Ensure beta indicator
          if (!btn.querySelector('.beta-pill-subnav')) {
            const featKey = VIEW_FEATURE_MAP[view];
            if (features[featKey]?.is_beta || view === 'posture') {
              const pill = document.createElement('span');
              pill.className = 'beta-pill-subnav';
              pill.style.cssText = 'font-size:0.6rem;background:#0284c7;color:#fff;padding:1px 5px;border-radius:99px;margin-left:5px;font-weight:800;';
              pill.textContent = 'BETA';
              btn.appendChild(pill);
            }
          }
        }
      });

      // 3. Food Photo Scan buttons
      const foodScannerOk = this.isFeatureEnabled('food-scanner');
      const camBtn = document.getElementById('openCameraBtn');
      if (camBtn) camBtn.style.display = foodScannerOk ? 'inline-flex' : 'none';
      const coachCamBtn = document.getElementById('coachChatCameraBtn');
      if (coachCamBtn) coachCamBtn.style.display = foodScannerOk ? 'inline-flex' : 'none';

      // 4. Barcode Scanner buttons
      const barcodeOk = this.isFeatureEnabled('barcode-scanner');
      const barcodeBtn = document.getElementById('openBarcodeScannerBtn');
      if (barcodeBtn) barcodeBtn.style.display = barcodeOk ? 'inline-flex' : 'none';
      const modalBarcodeBtn = document.getElementById('modalScanBarcodeBtn');
      if (modalBarcodeBtn) modalBarcodeBtn.style.display = barcodeOk ? 'inline-flex' : 'none';

      // 5. Voice Coach
      const voiceOk = this.isFeatureEnabled('voice-coach');
      const voiceToggleBtn = document.getElementById('btnVoiceCoachToggle');
      if (voiceToggleBtn) voiceToggleBtn.style.display = voiceOk ? 'flex' : 'none';
      const coachVoiceMic = document.getElementById('coachVoiceTriggerBtn');
      if (coachVoiceMic) coachVoiceMic.style.display = voiceOk ? 'inline-flex' : 'none';

      // 6. Dashboard Action / Hero triggers
      ['featCardPosture', 'actHeroCheckPostureBtn', 'actQaCameraPosture', 'actQaExerciseForm', 'actOpenPostureCheckerBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });

      ['actHeroTrackGpsBtn', 'actCardRunGps'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });

      // 7. Inject / update Beta Tester Banners on accessible beta views
      ['posture', 'body-analysis', 'activity'].forEach(view => {
        const featKey = VIEW_FEATURE_MAP[view];
        const isAccessible = this.isFeatureEnabled(view);
        const feat = features[featKey];
        if (isAccessible && (isTester || isAdmin) && feat && feat.is_beta) {
          this._injectTesterBanner(view, feat);
        } else {
          this._removeTesterBanner(view);
        }
      });
    }

    _injectTesterBanner(viewName, feature) {
      const viewEl = document.getElementById('view-' + viewName);
      if (!viewEl) return;

      let banner = viewEl.querySelector('.beta-tester-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.className = 'beta-tester-banner';
        const intro = viewEl.querySelector('.view-intro');
        if (intro) {
          intro.insertAdjacentElement('afterend', banner);
        } else {
          viewEl.insertBefore(banner, viewEl.firstChild);
        }
      }

      banner.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="beta-badge pulse">BETA PREVIEW</span>
          <span style="font-weight:600;color:var(--ff-text-primary);">You are testing <b>${feature.name}</b>. Feedback helps us reach general availability.</span>
        </div>
        <button type="button" class="beta-report-btn" onclick="FitFuelBeta.openFeedbackModal('${feature.key}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Report Bug / Feedback
        </button>
      `;
    }

    _removeTesterBanner(viewName) {
      const viewEl = document.getElementById('view-' + viewName);
      const banner = viewEl?.querySelector('.beta-tester-banner');
      if (banner) banner.remove();
    }

    renderLockedState(viewName) {
      const featKey = VIEW_FEATURE_MAP[viewName] || viewName;
      const feat = this.getFeatureMeta(featKey);
      const { userRole } = this.state;

      return `
        <div class="beta-locked-card">
          <div class="beta-locked-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span class="beta-badge" style="margin-bottom:12px;">PRIVATE BETA MODULE</span>
          <h2 class="beta-locked-title">Beta Access Required</h2>
          <p class="beta-locked-desc">
            The <b>${feat.name}</b> module is currently in active private preview. To safeguard data integrity, experimental functionality is disabled for standard production accounts.
          </p>
          <div style="display:inline-block;padding:8px 16px;border-radius:10px;background:rgba(2,132,199,0.08);border:1px solid rgba(2,132,199,0.2);margin-bottom:24px;font-size:0.84rem;color:#0284c7;">
            ${userRole === 'guest'
              ? '🔒 You are not currently logged in. Please sign in with an authorized account.'
              : `🔒 Logged in as Standard Member (${userRole}). Feature requires Beta Tester or Administrator enrollment.`}
          </div>
          <div class="beta-locked-actions">
            <button type="button" class="solid-button" onclick="switchView('today')" style="background:#2563eb;padding:10px 22px;font-weight:700;">
              Return to Overview
            </button>
            ${userRole === 'guest'
              ? `<button type="button" class="outline-button" onclick="openModal('#authModal')" style="padding:10px 20px;">Sign In to Account</button>`
              : `<button type="button" class="outline-button" onclick="FitFuelBeta.openFeedbackModal('${featKey}')" style="padding:10px 20px;">Request Beta Access</button>`}
          </div>
        </div>
      `;
    }

    /* ---------------- Admin Controls ---------------- */
    async loadAdminDashboard() {
      try {
        const token = this._getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const [flagsRes, testersRes] = await Promise.all([
          fetch('/api/admin/feature-flags', { headers }),
          fetch('/api/admin/beta-testers', { headers })
        ]);

        if (flagsRes.ok) {
          const data = await flagsRes.json();
          this.adminFlags = data.flags || [];
          this.renderAdminFlags();
        }

        if (testersRes.ok) {
          const data = await testersRes.json();
          this.adminTesters = data.testers || [];
          this.renderAdminTesters();
        }
      } catch (err) {
        console.error('[FitFuelBeta] Error loading admin dashboard:', err);
      }
    }

    renderAdminFlags() {
      const grid = document.getElementById('adminBetaFeaturesCardsGrid');
      if (!grid) return;

      if (!this.adminFlags.length) {
        grid.innerHTML = '<div style="color:var(--ff-text-secondary);padding:14px;">No feature flags loaded.</div>';
        return;
      }

      const summaryPill = document.getElementById('betaFlagSummaryPill');
      if (summaryPill) {
        const activeCount = this.adminFlags.filter(f => f.access_level !== 'disabled').length;
        summaryPill.textContent = `${activeCount} of ${this.adminFlags.length} Enabled`;
      }

      const accessBadgeClass = {
        'disabled': 'disabled',
        'admin_only': 'admin_only',
        'beta_testers': 'beta_testers',
        'all_users': 'all_users'
      };

      const accessLabels = {
        'disabled': 'Disabled (Off)',
        'admin_only': 'Admin Only',
        'beta_testers': 'Beta Testers',
        'all_users': 'Public (All Users)'
      };

      grid.innerHTML = this.adminFlags.map(flag => `
        <div class="beta-admin-flag-card" data-key="${flag.key}">
          <div class="beta-flag-card-top">
            <div>
              <span class="beta-flag-category">${flag.category || 'Module'}</span>
              <h5 class="beta-flag-name">${flag.name}</h5>
            </div>
            <span class="beta-status-badge ${accessBadgeClass[flag.access_level] || 'beta_testers'}">
              ${accessLabels[flag.access_level] || flag.access_level}
            </span>
          </div>
          <p class="beta-flag-desc">${flag.description || ''}</p>
          <div class="beta-flag-control-row">
            <div style="display:flex;align-items:center;gap:8px;">
              <label style="font-size:0.78rem;font-weight:700;color:var(--ff-text-secondary);">Access Level:</label>
              <select class="beta-access-select" onchange="FitFuelBeta.updateFeatureFlag('${flag.key}', this.value)">
                <option value="disabled" ${flag.access_level === 'disabled' ? 'selected' : ''}>Disabled (Hidden)</option>
                <option value="admin_only" ${flag.access_level === 'admin_only' ? 'selected' : ''}>Admin Only</option>
                <option value="beta_testers" ${flag.access_level === 'beta_testers' ? 'selected' : ''}>Beta Testers</option>
                <option value="all_users" ${flag.access_level === 'all_users' ? 'selected' : ''}>All Users (Public)</option>
              </select>
            </div>
            <button type="button" class="beta-test-action-btn" onclick="FitFuelBeta.testFeature('${flag.key}')">
              Test Feature
            </button>
          </div>
        </div>
      `).join('');
    }

    renderAdminTesters(searchQuery = '') {
      const container = document.getElementById('adminBetaTestersList');
      if (!container) return;

      const q = searchQuery.toLowerCase().trim();
      const filtered = this.adminTesters.filter(u => {
        if (!q) return true;
        return (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      });

      if (!filtered.length) {
        container.innerHTML = '<div style="color:var(--ff-text-secondary);padding:14px;background:var(--card);border-radius:10px;">No registered members match search.</div>';
        return;
      }

      container.innerHTML = filtered.map(u => {
        const initials = (u.name || u.email || 'FF').slice(0, 2).toUpperCase();
        const isTester = Boolean(u.is_beta_tester);
        return `
          <div class="beta-tester-user-row">
            <div class="beta-tester-user-info">
              <div class="beta-tester-avatar">${initials}</div>
              <div>
                <b style="font-size:0.9rem;color:var(--ff-text-primary);display:block;">${u.name || 'Member'}</b>
                <span style="font-size:0.78rem;color:var(--ff-text-secondary);">${u.email}</span>
                ${u.is_admin ? '<span style="font-size:0.65rem;background:#1e3a8a;color:#38bdf8;padding:1px 6px;border-radius:4px;margin-left:6px;font-weight:700;">ADMIN</span>' : ''}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="beta-status-badge ${isTester ? 'beta_testers' : 'disabled'}">
                ${isTester ? 'Enrolled Tester' : 'Standard User'}
              </span>
              <button type="button" class="beta-tester-toggle-btn ${isTester ? 'enrolled' : 'not-enrolled'}" onclick="FitFuelBeta.toggleTesterStatus(${u.id}, ${isTester})">
                ${isTester ? 'Revoke Beta Access' : 'Grant Beta Access'}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    async updateFeatureFlag(key, accessLevel) {
      try {
        const token = this._getToken();
        const res = await fetch('/api/admin/feature-flags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ key, access_level: accessLevel })
        });
        const data = await res.json();
        if (data.ok) {
          if (typeof toast === 'function') toast(`Updated ${key} access to: ${accessLevel}`);
          await this.fetchBetaFeatures();
          await this.loadAdminDashboard();
        } else {
          if (typeof toast === 'function') toast('Failed: ' + (data.error || 'Server error'));
        }
      } catch (err) {
        if (typeof toast === 'function') toast('Error updating flag: ' + err.message);
      }
    }

    async toggleTesterStatus(userId, currentStatus) {
      try {
        const token = this._getToken();
        const res = await fetch('/api/admin/beta-testers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ user_id: userId, is_beta_tester: currentStatus ? 0 : 1 })
        });
        const data = await res.json();
        if (data.ok) {
          if (typeof toast === 'function') toast(currentStatus ? 'Revoked Beta Tester access' : 'Enrolled user as Beta Tester!');
          await this.loadAdminDashboard();
          await this.fetchBetaFeatures();
        }
      } catch (err) {
        if (typeof toast === 'function') toast('Error toggling tester: ' + err.message);
      }
    }

    testFeature(key) {
      if (typeof toast === 'function') toast(`Opening ${key} for administrative testing...`);
      switch (key) {
        case 'posture':
          switchView('posture');
          break;
        case 'body-analysis':
          switchView('body-analysis');
          break;
        case 'gps-activity':
          switchView('activity');
          break;
        case 'food-scanner':
          switchView('food-log');
          setTimeout(() => {
            if (typeof openCameraScanner === 'function') openCameraScanner();
            else document.getElementById('openCameraBtn')?.click();
          }, 150);
          break;
        case 'barcode-scanner':
          switchView('food-log');
          setTimeout(() => {
            document.getElementById('openBarcodeScannerBtn')?.click();
          }, 150);
          break;
        case 'voice-coach':
          switchView('ai-coach');
          setTimeout(() => {
            document.getElementById('coachVoiceTriggerBtn')?.click();
          }, 150);
          break;
        default:
          switchView('today');
      }
    }

    /* ---------------- Feedback Modal ---------------- */
    openFeedbackModal(featureKey = 'posture') {
      const keyInput = document.getElementById('betaFeedbackFeatureKey');
      const nameEl = document.getElementById('betaFeedbackFeatureName');
      if (keyInput) keyInput.value = featureKey;
      if (nameEl) nameEl.textContent = FEATURE_TITLES[featureKey] || featureKey;

      const commentEl = document.getElementById('betaFeedbackComment');
      if (commentEl) commentEl.value = '';

      if (typeof openModal === 'function') {
        openModal('#betaFeedbackModal');
      }
      const modal = document.getElementById('betaFeedbackModal');
      if (modal) {
        modal.classList.add('open');
        modal.classList.add('active');
      }
    }

    closeFeedbackModal() {
      if (typeof closeModal === 'function') {
        closeModal('#betaFeedbackModal');
      }
      const modal = document.getElementById('betaFeedbackModal');
      if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
      }
    }

    _bindFeedbackModal() {
      const closeBtn = document.getElementById('closeBetaFeedbackModalBtn');
      const cancelBtn = document.getElementById('cancelBetaFeedbackBtn');
      if (closeBtn) closeBtn.onclick = () => this.closeFeedbackModal();
      if (cancelBtn) cancelBtn.onclick = () => this.closeFeedbackModal();

      const form = document.getElementById('betaFeedbackForm');
      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const key = document.getElementById('betaFeedbackFeatureKey')?.value || 'general';
          const type = form.querySelector('input[name="betaFeedbackType"]:checked')?.value || 'feedback';
          const rating = document.getElementById('betaFeedbackRating')?.value || '5';
          const comment = document.getElementById('betaFeedbackComment')?.value || '';

          if (!comment.trim()) {
            if (typeof toast === 'function') toast('Please enter comments before submitting.');
            return;
          }

          try {
            const token = this._getToken();
            const res = await fetch('/api/beta/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': 'Bearer ' + token } : {})
              },
              body: JSON.stringify({
                feature_key: key,
                feedback_type: type,
                rating,
                comment,
                metadata: {
                  userAgent: navigator.userAgent,
                  timestamp: Date.now(),
                  url: window.location.href
                }
              })
            });

            const data = await res.json();
            if (data.ok) {
              this.closeFeedbackModal();
              if (typeof toast === 'function') toast('Thank you! Your beta feedback was submitted to the team.');
            } else {
              if (typeof toast === 'function') toast('Error submitting feedback: ' + (data.error || 'Server error'));
            }
          } catch (err) {
            if (typeof toast === 'function') toast('Network error submitting feedback.');
          }
        };
      }
    }

    _bindAdminEvents() {
      const refreshBtn = document.getElementById('adminRefreshBetaFlagsBtn');
      if (refreshBtn) {
        refreshBtn.onclick = () => {
          if (typeof toast === 'function') toast('Reloading feature flags...');
          this.loadAdminDashboard();
        };
      }

      const searchInput = document.getElementById('adminBetaTesterSearchInput');
      if (searchInput) {
        searchInput.oninput = () => {
          this.renderAdminTesters(searchInput.value);
        };
      }
    }
  }

  const manager = new BetaFeatureManagerClient();
  window.FitFuelBeta = manager;

  // Auto-init on DOMContentLoaded or immediate if ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => manager.init());
  } else {
    manager.init();
  }
})();
