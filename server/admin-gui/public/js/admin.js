// Hacklahoma Admin GUI JavaScript
// Modern ES6+ code for beautiful admin interface

class AdminGUI {
  constructor() {
    this.currentTab = 'dashboard';
    this.isAuthenticated = false;
    this.apiCache = new Map();
    this.refreshInterval = null;
    
    this.init();
  }

  async init() {
    console.log('🐝 Initializing Hacklahoma Admin GUI...');
    
    // Check if we're on login page by looking for the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      this.initLogin();
      return;
    }
    
    // Initialize main dashboard (server has already checked authentication)
    this.isAuthenticated = true;
    this.initDashboard();
    this.bindEvents();
    await this.loadInitialData();
    this.startAutoRefresh();
  }

  initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const adminSecret = formData.get('adminSecret');
    
    if (!adminSecret) {
      this.showAlert('Please enter the admin secret', 'danger');
      return;
    }

    try {
      this.showLoading('Authenticating...');
      
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminSecret })
      });

      const result = await response.json();
      
      if (result.success) {
        this.showAlert('Authentication successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        this.showAlert(result.error || 'Authentication failed', 'danger');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAlert('Connection error. Please try again.', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  initDashboard() {
    // Set initial tab
    this.switchTab('dashboard');
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Use currentTarget to always get the button, not the clicked child element
        const tabName = e.currentTarget.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshAllData());
    }

    // Database action buttons
    this.bindDatabaseActions();
    
    // User management buttons
    this.bindUserActions();
    
    // Impersonation buttons
    this.bindImpersonationActions();
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    this.currentTab = tabName;
    
    // Load tab-specific data
    this.loadTabData(tabName);
  }

  async loadTabData(tabName) {
    switch (tabName) {
      case 'dashboard':
        await this.loadDashboardData();
        break;
      case 'users':
        await this.loadUsersData();
        break;
      case 'database':
        await this.loadDatabaseData();
        break;
      case 'impersonate':
        await this.loadImpersonationData();
        break;
    }
  }

  async loadInitialData() {
    await Promise.all([
      this.loadDashboardData(),
      this.loadSystemInfo()
    ]);
  }

  async loadDashboardData() {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        this.apiCall('/api/dashboard/stats'),
        this.apiCall('/api/dashboard/health')
      ]);

      if (statsResponse.success) {
        this.updateStatsCards(statsResponse.data);
      }

      if (healthResponse.success) {
        this.updateHealthStatus(healthResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.showAlert('Failed to load dashboard data', 'warning');
    }
  }

  async loadUsersData() {
    try {
      this.showTableLoading('usersTable');
      
      const [usersResponse, statsResponse] = await Promise.all([
        this.apiCall('/api/users'),
        this.apiCall('/api/dashboard/stats')
      ]);
      
      if (usersResponse.success) {
        this.updateUsersTable(usersResponse.data);
      } else {
        this.showAlert('Failed to load users data', 'warning');
      }
      
      // Update user statistics card
      if (statsResponse.success) {
        this.updateUserStats(statsResponse.data, usersResponse.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      this.showAlert('Failed to load users', 'danger');
    }
  }

  async loadDatabaseData() {
    try {
      const response = await this.apiCall('/api/dashboard/stats');
      
      if (response.success) {
        this.updateDatabaseStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load database data:', error);
    }
  }

  async loadImpersonationData() {
    // Load recent impersonations or user list for impersonation
    await this.loadUsersData();
  }

  async loadSystemInfo() {
    try {
      const response = await this.apiCall('/api/system-info');
      
      if (response.success) {
        this.updateSystemInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  }

  updateStatsCards(data) {
    const stats = data.stats || {};
    
    // Update user stats
    this.updateStatCard('totalUsers', stats.users?.total || 0);
    this.updateStatCard('hackersCount', stats.users?.hackers || 0);
    this.updateStatCard('staffCount', stats.users?.staff || 0);
    
    // Update with REAL MongoDB database size
    const element = document.getElementById('databaseSize');
    if (element) {
      element.textContent = this.formatBytes(stats.database?.size || 0);
    }
  }

  updateStatCard(cardId, value, change = null) {
    const numberEl = document.getElementById(cardId);
    if (numberEl) {
      // Animate number change
      this.animateNumber(numberEl, parseInt(numberEl.textContent) || 0, value);
      
      // Update change indicator if provided
      if (change) {
        const card = numberEl.parentElement;
        const changeEl = card?.querySelector('.stat-change');
        if (changeEl) {
          changeEl.textContent = change > 0 ? `+${change}` : change;
          changeEl.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
        }
      }
    }
  }

  animateNumber(element, from, to) {
    const duration = 1000;
    const start = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(from + (to - from) * this.easeOutCubic(progress));
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  updateHealthStatus(data) {
    const statusEl = document.getElementById('systemStatus');
    if (statusEl) {
      statusEl.textContent = data.status || 'Unknown';
      statusEl.className = 'status-indicator';
      
      // Add appropriate status class
      if (data.status && data.status.toLowerCase().includes('ok')) {
        statusEl.classList.add('status-healthy');
      }
    }
  }

  updateUsersTable(data) {
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody) return;

    const users = data.users || [];
    
    tableBody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div class="user-info">
            <div class="user-avatar">${user.firstName?.[0] || '?'}</div>
            <div>
              <div class="user-name">${user.firstName || ''} ${user.lastName || ''}</div>
              <div class="user-email">${user.email || ''}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="role-badge role-${user.role || 'unknown'}">${user.role || 'Unknown'}</span>
        </td>
        <td>${user.school || 'N/A'}</td>
        <td>${user.major || 'N/A'}</td>
        <td>${this.formatDate(user.createdAt)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" onclick="adminGUI.impersonateUser('${user.id}')">
              Impersonate
            </button>
            <button class="btn btn-sm btn-warning" onclick="adminGUI.editUser('${user.id}')">
              Edit
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    this.hideTableLoading('usersTable');
  }

  updateUserStats(statsData, usersData) {
    const stats = statsData.stats || {};
    const users = usersData.users || [];
    
    // Update basic stats
    const totalUsersEl = document.getElementById('userStatsTotal');
    const hackersEl = document.getElementById('userStatsHackers');
    const staffEl = document.getElementById('userStatsStaff');
    const weekEl = document.getElementById('userStatsWeek');
    
    if (totalUsersEl) totalUsersEl.textContent = stats.users?.total || 0;
    if (hackersEl) hackersEl.textContent = stats.users?.hackers || 0;
    if (staffEl) staffEl.textContent = stats.users?.staff || 0;
    
    // Calculate users created this week
    if (weekEl) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const usersThisWeek = users.filter(user => {
        if (!user.createdAt) return false;
        const createdDate = new Date(user.createdAt);
        return createdDate >= oneWeekAgo;
      }).length;
      
      weekEl.textContent = usersThisWeek;
    }
  }

  updateDatabaseStats(data) {
    const stats = data.stats || {};
    
    // Update database info display with REAL MongoDB stats
    const dbInfoEl = document.getElementById('databaseInfo');
    if (dbInfoEl) {
      dbInfoEl.innerHTML = `
        <div class="db-stat">
          <span class="db-stat-label">Total Collections:</span>
          <span class="db-stat-value">${stats.database?.collections || 0}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat-label">Total Documents:</span>
          <span class="db-stat-value">${stats.database?.documents || 0}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat-label">Total Indexes:</span>
          <span class="db-stat-value">${stats.database?.indexes || 0}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat-label">Data Size:</span>
          <span class="db-stat-value">${this.formatBytes(stats.database?.size || 0)}</span>
        </div>
        <div class="db-stat">
          <span class="db-stat-label">Storage Size (with indexes):</span>
          <span class="db-stat-value">${this.formatBytes(stats.database?.storageSize || 0)}</span>
        </div>
      `;
    }
  }

  updateSystemInfo(data) {
    const systemInfoEl = document.getElementById('systemInfo');
    if (systemInfoEl) {
      const dbStatus = data.database?.connected ? 
        `<span style="color: var(--success-green)">✅ ${data.database.uri}</span>` : 
        `<span style="color: var(--danger-red)">❌ Disconnected</span>`;
      
      systemInfoEl.innerHTML = `
        <div class="system-stat">
          <span class="system-stat-label">Platform:</span>
          <span class="system-stat-value">${data.platform || 'Unknown'}</span>
        </div>
        <div class="system-stat">
          <span class="system-stat-label">Node.js Version:</span>
          <span class="system-stat-value">${data.nodeVersion || 'Unknown'}</span>
        </div>
        <div class="system-stat">
          <span class="system-stat-label">Server Memory (RAM):</span>
          <span class="system-stat-value">${this.formatBytes(data.memoryUsage?.heapUsed || 0)}</span>
        </div>
        <div class="system-stat">
          <span class="system-stat-label">Server Uptime:</span>
          <span class="system-stat-value">${this.formatUptime(data.uptime || 0)}</span>
        </div>
        <div class="system-stat">
          <span class="system-stat-label">Database Connection:</span>
          <span class="system-stat-value">${dbStatus}</span>
        </div>
        <div class="system-stat">
          <span class="system-stat-label">Database Name:</span>
          <span class="system-stat-value">${data.database?.dbName || 'Unknown'}</span>
        </div>
      `;
    }
  }

  bindDatabaseActions() {
    // Seed users button
    const seedUsersBtn = document.getElementById('seedUsersBtn');
    if (seedUsersBtn) {
      seedUsersBtn.addEventListener('click', () => this.seedUsers());
    }

    // Seed all button
    const seedAllBtn = document.getElementById('seedAllBtn');
    if (seedAllBtn) {
      seedAllBtn.addEventListener('click', () => this.seedAll());
    }

    // Clear database button
    const clearDbBtn = document.getElementById('clearDbBtn');
    if (clearDbBtn) {
      clearDbBtn.addEventListener('click', () => this.clearDatabase());
    }
  }

  bindUserActions() {
    // Create user form
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
      createUserForm.addEventListener('submit', (e) => this.handleCreateUser(e));
    }
  }

  bindImpersonationActions() {
    // Impersonate hacker button
    const impersonateHackerBtn = document.getElementById('impersonateHackerBtn');
    if (impersonateHackerBtn) {
      impersonateHackerBtn.addEventListener('click', () => this.impersonateRole('hacker'));
    }

    // Impersonate staff button
    const impersonateStaffBtn = document.getElementById('impersonateStaffBtn');
    if (impersonateStaffBtn) {
      impersonateStaffBtn.addEventListener('click', () => this.impersonateRole('staff'));
    }
  }

  async seedUsers() {
    if (!confirm('This will add sample users to the database. Continue?')) return;

    try {
      this.showLoading('Seeding users...');
      
      const response = await this.apiCall('/api/database/seed-users', 'POST');
      
      if (response.success) {
        this.showAlert('Users seeded successfully!', 'success');
        await this.refreshAllData();
      } else {
        this.showAlert(response.error || 'Failed to seed users', 'danger');
      }
    } catch (error) {
      console.error('Seed users error:', error);
      this.showAlert('Failed to seed users', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  async seedAll() {
    if (!confirm('This will seed the entire database with sample data. Continue?')) return;

    try {
      this.showLoading('Seeding database...');
      
      const response = await this.apiCall('/api/database/seed-all', 'POST');
      
      if (response.success) {
        this.showAlert('Database seeded successfully!', 'success');
        await this.refreshAllData();
      } else {
        this.showAlert(response.error || 'Failed to seed database', 'danger');
      }
    } catch (error) {
      console.error('Seed all error:', error);
      this.showAlert('Failed to seed database', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  async clearDatabase() {
    const confirmation = prompt('This will DELETE ALL DATA from the database. Type "DELETE ALL DATA" to confirm:');
    if (confirmation !== 'DELETE ALL DATA') {
      this.showAlert('Database clear cancelled', 'info');
      return;
    }

    try {
      this.showLoading('Clearing database...');
      
      const response = await this.apiCall('/api/database/clear', 'POST');
      
      if (response.success) {
        this.showAlert('Database cleared successfully!', 'success');
        await this.refreshAllData();
      } else {
        this.showAlert(response.error || 'Failed to clear database', 'danger');
      }
    } catch (error) {
      console.error('Clear database error:', error);
      this.showAlert('Failed to clear database', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  async handleCreateUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    // Set default password if blank
    if (!userData.password || userData.password.trim() === '') {
      userData.password = 'TempPassword123@';
    }

    try {
      this.showLoading('Creating user...');
      
      const response = await this.apiCall('/api/users', 'POST', userData);
      
      if (response.success) {
        this.showAlert('User created successfully!', 'success');
        e.target.reset();
        
        // Refresh user table and dashboard stats
        await Promise.all([
          this.loadUsersData(),
          this.loadDashboardData()
        ]);
      } else {
        // Show specific error message from server
        const errorMsg = response.data?.error || response.error || 'Failed to create user';
        this.showAlert(errorMsg, 'danger');
      }
    } catch (error) {
      console.error('Create user error:', error);
      this.showAlert('Failed to create user', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  async impersonateUser(userId) {
    try {
      this.showLoading('Generating impersonation token...');
      
      const response = await this.apiCall(`/api/impersonate/user/${userId}`, 'POST');
      
      if (response.success) {
        this.showImpersonationResult(response.data);
      } else {
        this.showAlert(response.error || 'Failed to impersonate user', 'danger');
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      this.showAlert('Failed to impersonate user', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  async impersonateRole(role) {
    try {
      this.showLoading(`Generating ${role} impersonation token...`);
      
      const response = await this.apiCall(`/api/impersonate/role/${role}`, 'POST');
      
      if (response.success) {
        this.showImpersonationResult(response.data);
      } else {
        this.showAlert(response.error || `Failed to impersonate ${role}`, 'danger');
      }
    } catch (error) {
      console.error('Role impersonation error:', error);
      this.showAlert(`Failed to impersonate ${role}`, 'danger');
    } finally {
      this.hideLoading();
    }
  }

  showImpersonationResult(data) {
    const modal = this.createModal('Impersonation Token Generated', `
      <div class="impersonation-result">
        <div class="alert alert-success">
          <strong>Success!</strong> ${data.message}
        </div>
        
        <div class="user-details">
          <h4>User Details:</h4>
          <p><strong>Name:</strong> ${data.user.firstName} ${data.user.lastName}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
          <p><strong>Role:</strong> ${data.user.role}</p>
        </div>
        
        <div class="token-section">
          <h4>Access Token:</h4>
          <div class="token-container">
            <textarea class="token-display" readonly>${data.accessToken}</textarea>
            <button class="btn btn-secondary btn-sm" onclick="adminGUI.copyToClipboard('${data.accessToken}')">
              Copy Token
            </button>
          </div>
        </div>
        
        <div class="usage-instructions">
          <h4>Usage Instructions:</h4>
          <p>Use this token in the Authorization header:</p>
          <code>Authorization: Bearer ${data.accessToken.substring(0, 20)}...</code>
        </div>
      </div>
    `);
    
    modal.show();
  }

  async handleLogout() {
    try {
      await this.apiCall('/auth/logout', 'POST');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      window.location.href = '/login';
    }
  }

  async refreshAllData() {
    this.clearCache();
    await this.loadTabData(this.currentTab);
    this.showAlert('Data refreshed successfully!', 'success');
  }

  startAutoRefresh() {
    // Refresh dashboard data every 30 seconds
    this.refreshInterval = setInterval(() => {
      if (this.currentTab === 'dashboard') {
        this.loadDashboardData();
      }
    }, 30000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Utility methods
  async apiCall(endpoint, method = 'GET', data = null) {
    const cacheKey = `${method}:${endpoint}`;
    
    // Check cache for GET requests
    if (method === 'GET' && this.apiCache.has(cacheKey)) {
      const cached = this.apiCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 30 second cache
        return cached.data;
      }
    }

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, options);
      const result = await response.json();
      
      const apiResponse = {
        success: response.ok,
        data: result,
        status: response.status
      };

      // Cache successful GET requests
      if (method === 'GET' && response.ok) {
        this.apiCache.set(cacheKey, {
          data: apiResponse,
          timestamp: Date.now()
        });
      }

      return apiResponse;
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  clearCache() {
    this.apiCache.clear();
  }

  showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertId = 'alert-' + Date.now();
    const alertEl = document.createElement('div');
    alertEl.id = alertId;
    alertEl.className = `alert alert-${type} fade-in`;
    alertEl.innerHTML = `
      <span>${message}</span>
      <button class="alert-close" onclick="adminGUI.closeAlert('${alertId}')">&times;</button>
    `;

    alertContainer.appendChild(alertEl);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.closeAlert(alertId);
    }, 5000);
  }

  closeAlert(alertId) {
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
      alertEl.remove();
    }
  }

  showLoading(message = 'Loading...') {
    const loadingEl = document.getElementById('loadingOverlay');
    if (loadingEl) {
      loadingEl.querySelector('.loading-message').textContent = message;
      loadingEl.classList.remove('hidden');
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('loadingOverlay');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
  }

  showTableLoading(tableId) {
    const table = document.getElementById(tableId);
    if (table) {
      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="100%" class="loading">
              <div class="spinner"></div>
              Loading data...
            </td>
          </tr>
        `;
      }
    }
  }

  hideTableLoading(tableId) {
    // Loading will be hidden when table data is updated
  }

  createModal(title, content) {
    const modalId = 'modal-' + Date.now();
    const modalEl = document.createElement('div');
    modalEl.id = modalId;
    modalEl.className = 'modal-overlay';
    modalEl.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="adminGUI.closeModal('${modalId}')">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="adminGUI.closeModal('${modalId}')">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    return {
      show: () => modalEl.classList.add('active'),
      hide: () => this.closeModal(modalId)
    };
  }

  closeModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.remove();
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showAlert('Copied to clipboard!', 'success');
    }).catch(() => {
      this.showAlert('Failed to copy to clipboard', 'warning');
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  async editUser(userId) {
    try {
      this.showLoading('Loading user data...');
      
      // Fetch all users to find the one we want to edit
      const response = await this.apiCall('/api/users');
      
      if (!response.success) {
        this.showAlert('Failed to load user data', 'danger');
        return;
      }
      
      const user = response.data.users.find(u => u._id === userId || u.id === userId);
      
      if (!user) {
        this.showAlert('User not found', 'danger');
        return;
      }
      
      // Create and show edit modal
      this.showEditUserModal(user);
      
    } catch (error) {
      console.error('Edit user error:', error);
      this.showAlert('Failed to load user for editing', 'danger');
    } finally {
      this.hideLoading();
    }
  }

  showEditUserModal(user) {
    const modalContent = `
      <form id="editUserForm">
        <input type="hidden" id="editUserId" value="${user._id || user.id}">
        
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" id="editFirstName" class="form-input" value="${user.firstName || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" id="editLastName" class="form-input" value="${user.lastName || ''}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="editEmail" class="form-input" value="${user.email || ''}" required>
        </div>
        
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Role</label>
            <select id="editRole" class="form-select" required>
              <option value="hacker" ${user.role === 'hacker' ? 'selected' : ''}>Hacker</option>
              <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">School</label>
            <input type="text" id="editSchool" class="form-input" value="${user.school || ''}">
          </div>
        </div>
        
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Major</label>
            <input type="text" id="editMajor" class="form-input" value="${user.major || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Grade</label>
            <input type="text" id="editGrade" class="form-input" value="${user.grade || ''}">
          </div>
        </div>
        
        <div class="modal-footer" style="border-top: 1px solid var(--glass-border); margin-top: 20px; padding-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="adminGUI.closeModal('editUserModal')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            💾 Save Changes
          </button>
        </div>
      </form>
    `;
    
    const modal = this.createModal('Edit User', modalContent);
    modal.show();
    
    // Set the modal ID so we can close it
    const modalEl = document.querySelector('.modal-overlay:last-child');
    if (modalEl) {
      modalEl.id = 'editUserModal';
    }
    
    // Bind form submit
    const form = document.getElementById('editUserForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleUpdateUser(e));
    }
  }

  async handleUpdateUser(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const userData = {
      firstName: document.getElementById('editFirstName').value,
      lastName: document.getElementById('editLastName').value,
      email: document.getElementById('editEmail').value,
      role: document.getElementById('editRole').value,
      school: document.getElementById('editSchool').value,
      major: document.getElementById('editMajor').value,
      grade: document.getElementById('editGrade').value
    };

    try {
      this.showLoading('Updating user...');
      
      const response = await this.apiCall(`/api/users/${userId}`, 'PUT', userData);
      
      if (response.success) {
        this.showAlert('User updated successfully!', 'success');
        this.closeModal('editUserModal');
        
        // Refresh user table and dashboard stats
        await Promise.all([
          this.loadUsersData(),
          this.loadDashboardData()
        ]);
      } else {
        const errorMsg = response.data?.error || response.error || 'Failed to update user';
        this.showAlert(errorMsg, 'danger');
      }
    } catch (error) {
      console.error('Update user error:', error);
      this.showAlert('Failed to update user', 'danger');
    } finally {
      this.hideLoading();
    }
  }
}

// Initialize the admin GUI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminGUI = new AdminGUI();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (window.adminGUI) {
    if (document.hidden) {
      window.adminGUI.stopAutoRefresh();
    } else {
      window.adminGUI.startAutoRefresh();
    }
  }
});
