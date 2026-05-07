// ============================================
// Configuration
// ============================================

const API_BASE_URL = 'https://api.mad3oom.online/api/v1';
const API_KEY = localStorage.getItem('api_key') || '';
const JWT_TOKEN = localStorage.getItem('jwt_token') || '';

// ============================================
// API Client
// ============================================

class APIClient {
    constructor(baseUrl, apiKey = '', jwtToken = '') {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.jwtToken = jwtToken;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.jwtToken) {
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
        } else if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }

        return headers;
    }

    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders()
        };

        if (data && (method === 'POST' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Ticket Methods
    async createTicket(subject, description, priority, createdBy) {
        return this.request('POST', '/tickets', {
            subject,
            description,
            priority,
            created_by: createdBy
        });
    }

    async getTickets(page = 1, limit = 20, status = null, priority = null) {
        let endpoint = `/tickets?page=${page}&limit=${limit}`;
        if (status) endpoint += `&status=${status}`;
        if (priority) endpoint += `&priority=${priority}`;
        return this.request('GET', endpoint);
    }

    async getTicket(id) {
        return this.request('GET', `/tickets/${id}`);
    }

    async replyToTicket(ticketId, message, author) {
        return this.request('POST', `/tickets/${ticketId}/reply`, {
            message,
            author
        });
    }

    async updateTicketStatus(ticketId, status, assignedTo = null) {
        return this.request('PATCH', `/tickets/${ticketId}/status`, {
            status,
            assigned_to: assignedTo
        });
    }

    // API Key Methods
    async generateAPIKey(name, permissions, expiresAt = null) {
        return this.request('POST', '/api-keys', {
            name,
            permissions,
            expires_at: expiresAt
        });
    }

    async listAPIKeys() {
        return this.request('GET', '/api-keys');
    }

    async revokeAPIKey(keyId) {
        return this.request('DELETE', `/api-keys/${keyId}`);
    }

    // Webhook Methods
    async createWebhook(url, events, secret) {
        return this.request('POST', '/webhooks', {
            url,
            events,
            secret
        });
    }

    async listWebhooks() {
        return this.request('GET', '/webhooks');
    }

    async updateWebhook(webhookId, url = null, events = null, isActive = null) {
        const data = {};
        if (url) data.url = url;
        if (events) data.events = events;
        if (isActive !== null) data.is_active = isActive;
        return this.request('PATCH', `/webhooks/${webhookId}`, data);
    }

    async deleteWebhook(webhookId) {
        return this.request('DELETE', `/webhooks/${webhookId}`);
    }
}

const apiClient = new APIClient(API_BASE_URL, API_KEY, JWT_TOKEN);

// ============================================
// Navigation & Section Management
// ============================================

function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Setup navigation click handlers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            navigateTo(sectionId);
        });
    });

    // Load data on page load
    loadTickets();
    loadAPIKeys();
    loadWebhooks();
});

// ============================================
// Tab Management
// ============================================

function switchTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Show target pane
    const targetPane = document.getElementById(tabId);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mark current tab as active
    event.target.classList.add('active');
}

function switchExample(exampleId) {
    // Hide all example panes
    document.querySelectorAll('.example-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Show target pane
    const targetPane = document.getElementById(exampleId);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    // Update example tabs
    document.querySelectorAll('.example-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mark current tab as active
    event.target.classList.add('active');
}

// ============================================
// Tickets Management
// ============================================

async function loadTickets() {
    try {
        const response = await apiClient.getTickets();
        renderTickets(response.data || []);
    } catch (error) {
        console.error('Error loading tickets:', error);
        showNotification('خطأ في تحميل التذاكر', 'error');
    }
}

function renderTickets(tickets) {
    const ticketsList = document.getElementById('tickets-list');
    
    if (!tickets || tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <p>لا توجد تذاكر حالياً</p>
                <p class="small">انقر على زر "إنشاء تذكرة جديدة" للبدء</p>
            </div>
        `;
        return;
    }

    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-item">
            <div class="ticket-header">
                <div>
                    <div class="ticket-subject">${escapeHtml(ticket.subject)}</div>
                    <div class="ticket-priority" style="color: ${getPriorityColor(ticket.priority)};">
                        الأولوية: ${getPriorityLabel(ticket.priority)}
                    </div>
                </div>
                <span class="status-badge">${getStatusLabel(ticket.status)}</span>
            </div>
            
            <div class="ticket-details">
                <div class="ticket-detail">
                    <div class="ticket-detail-label">الحالة:</div>
                    <div class="ticket-detail-value">${getStatusLabel(ticket.status)}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">المنشئ:</div>
                    <div class="ticket-detail-value">${escapeHtml(ticket.created_by)}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">تاريخ الإنشاء:</div>
                    <div class="ticket-detail-value">${formatDate(ticket.created_at)}</div>
                </div>
            </div>

            <div class="ticket-actions">
                <button class="btn btn-secondary btn-small" onclick="viewTicket('${ticket.id}')">
                    👁️ عرض
                </button>
                <button class="btn btn-secondary btn-small" onclick="updateTicketStatusUI('${ticket.id}')">
                    ✏️ تحديث
                </button>
            </div>
        </div>
    `).join('');
}

function showCreateTicketModal() {
    document.getElementById('createTicketModal').classList.remove('hidden');
}

function closeCreateTicketModal() {
    document.getElementById('createTicketModal').classList.add('hidden');
    document.getElementById('createTicketForm').reset();
}

async function handleCreateTicket(event) {
    event.preventDefault();

    const subject = document.getElementById('ticketSubject').value;
    const description = document.getElementById('ticketDescription').value;
    const priority = document.getElementById('ticketPriority').value;
    const createdBy = document.getElementById('ticketCreatedBy').value;

    try {
        await apiClient.createTicket(subject, description, priority, createdBy);
        showNotification('تم إنشاء التذكرة بنجاح', 'success');
        closeCreateTicketModal();
        loadTickets();
    } catch (error) {
        console.error('Error creating ticket:', error);
        showNotification('خطأ في إنشاء التذكرة', 'error');
    }
}

function viewTicket(ticketId) {
    showNotification('ميزة عرض التذكرة قيد التطوير', 'info');
}

function updateTicketStatusUI(ticketId) {
    showNotification('ميزة تحديث التذكرة قيد التطوير', 'info');
}

// ============================================
// API Keys Management
// ============================================

async function loadAPIKeys() {
    try {
        const response = await apiClient.listAPIKeys();
        renderAPIKeys(response.data || []);
    } catch (error) {
        console.error('Error loading API keys:', error);
    }
}

function renderAPIKeys(keys) {
    const keysList = document.getElementById('keys-list');
    
    if (!keys || keys.length === 0) {
        keysList.innerHTML = `
            <div class="empty-state">
                <p>لا توجد مفاتيح API حالياً</p>
                <p class="small">انقر على زر "إنشاء مفتاح جديد" للبدء</p>
            </div>
        `;
        return;
    }

    keysList.innerHTML = keys.map(key => `
        <div class="key-item">
            <div class="key-header">
                <div>
                    <div class="key-name">${escapeHtml(key.name)}</div>
                    <div class="key-value" id="key-${key.id}">
                        ${maskAPIKey(key.key || key.prefix)}
                        <button class="btn btn-small" onclick="copyToClipboard('key-${key.id}', '${key.key || ''}')">
                            📋 نسخ
                        </button>
                    </div>
                </div>
                <span class="status-badge ${key.is_active ? 'active' : 'inactive'}">
                    ${key.is_active ? 'نشط' : 'معطل'}
                </span>
            </div>
            
            <div class="key-details">
                <div class="key-detail">
                    <div class="key-detail-label">الصلاحيات:</div>
                    <div class="key-detail-value">${formatPermissions(key.permissions)}</div>
                </div>
                <div class="key-detail">
                    <div class="key-detail-label">تاريخ الإنشاء:</div>
                    <div class="key-detail-value">${formatDate(key.created_at)}</div>
                </div>
                <div class="key-detail">
                    <div class="key-detail-label">آخر استخدام:</div>
                    <div class="key-detail-value">${key.last_used_at ? formatDate(key.last_used_at) : 'لم يتم الاستخدام'}</div>
                </div>
            </div>

            <div class="key-actions">
                <button class="btn btn-danger btn-small" onclick="revokeAPIKey('${key.id}', '${key.name}')">
                    🗑️ إلغاء
                </button>
            </div>
        </div>
    `).join('');
}

function showCreateKeyModal() {
    document.getElementById('createKeyModal').classList.remove('hidden');
}

function closeCreateKeyModal() {
    document.getElementById('createKeyModal').classList.add('hidden');
    document.getElementById('createKeyForm').reset();
}

async function handleCreateKey(event) {
    event.preventDefault();

    const name = document.getElementById('keyName').value;
    const permissions = Array.from(document.querySelectorAll('[name="permissions"]:checked'))
        .map(cb => cb.value);
    const expiresAt = document.getElementById('keyExpires').value;

    if (!name.trim()) {
        showNotification('يرجى إدخال اسم المفتاح', 'error');
        return;
    }

    if (permissions.length === 0) {
        showNotification('يرجى تحديد صلاحية واحدة على الأقل', 'error');
        return;
    }

    try {
        const response = await apiClient.generateAPIKey(
            name,
            { read: permissions.includes('read'), create: permissions.includes('create'), update: permissions.includes('update'), delete: permissions.includes('delete') },
            expiresAt || null
        );
        showNotification('تم إنشاء المفتاح بنجاح', 'success');
        closeCreateKeyModal();
        loadAPIKeys();
    } catch (error) {
        console.error('Error creating API key:', error);
        showNotification('خطأ في إنشاء المفتاح', 'error');
    }
}

async function revokeAPIKey(keyId, keyName) {
    if (!confirm(`هل أنت متأكد من إلغاء المفتاح "${keyName}"؟`)) {
        return;
    }

    try {
        await apiClient.revokeAPIKey(keyId);
        showNotification('تم إلغاء المفتاح بنجاح', 'success');
        loadAPIKeys();
    } catch (error) {
        console.error('Error revoking API key:', error);
        showNotification('خطأ في إلغاء المفتاح', 'error');
    }
}

// ============================================
// Webhooks Management
// ============================================

async function loadWebhooks() {
    try {
        const response = await apiClient.listWebhooks();
        renderWebhooks(response.data || []);
    } catch (error) {
        console.error('Error loading webhooks:', error);
    }
}

function renderWebhooks(webhooks) {
    const webhooksList = document.getElementById('webhooks-list');
    
    if (!webhooks || webhooks.length === 0) {
        webhooksList.innerHTML = `
            <div class="empty-state">
                <p>لا توجد ويب هوك حالياً</p>
                <p class="small">انقر على زر "إنشاء ويب هوك جديد" للبدء</p>
            </div>
        `;
        return;
    }

    webhooksList.innerHTML = webhooks.map(webhook => `
        <div class="webhook-item">
            <div class="webhook-header">
                <div>
                    <div class="webhook-url">${escapeHtml(webhook.url)}</div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">
                        الأحداث: ${webhook.events.join('، ')}
                    </div>
                </div>
                <span class="status-badge ${webhook.is_active ? 'active' : 'inactive'}">
                    ${webhook.is_active ? 'نشط' : 'معطل'}
                </span>
            </div>
            
            <div class="webhook-details">
                <div class="webhook-detail">
                    <div class="webhook-detail-label">آخر تفعيل:</div>
                    <div class="webhook-detail-value">${webhook.last_triggered_at ? formatDate(webhook.last_triggered_at) : 'لم يتم التفعيل'}</div>
                </div>
                <div class="webhook-detail">
                    <div class="webhook-detail-label">عدد الفشل:</div>
                    <div class="webhook-detail-value">${webhook.failure_count || 0}</div>
                </div>
                <div class="webhook-detail">
                    <div class="webhook-detail-label">تاريخ الإنشاء:</div>
                    <div class="webhook-detail-value">${formatDate(webhook.created_at)}</div>
                </div>
            </div>

            <div class="webhook-actions">
                <button class="btn btn-secondary btn-small" onclick="editWebhook('${webhook.id}')">
                    ✏️ تعديل
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteWebhook('${webhook.id}')">
                    🗑️ حذف
                </button>
            </div>
        </div>
    `).join('');
}

function showCreateWebhookModal() {
    document.getElementById('createWebhookModal').classList.remove('hidden');
}

function closeCreateWebhookModal() {
    document.getElementById('createWebhookModal').classList.add('hidden');
    document.getElementById('createWebhookForm').reset();
}

async function handleCreateWebhook(event) {
    event.preventDefault();

    const url = document.getElementById('webhookUrl').value;
    const events = Array.from(document.querySelectorAll('[name="events"]:checked'))
        .map(cb => cb.value);
    const secret = document.getElementById('webhookSecret').value;

    if (!url.trim()) {
        showNotification('يرجى إدخال رابط الويب هوك', 'error');
        return;
    }

    if (events.length === 0) {
        showNotification('يرجى تحديد حدث واحد على الأقل', 'error');
        return;
    }

    try {
        await apiClient.createWebhook(url, events, secret);
        showNotification('تم إنشاء الويب هوك بنجاح', 'success');
        closeCreateWebhookModal();
        loadWebhooks();
    } catch (error) {
        console.error('Error creating webhook:', error);
        showNotification('خطأ في إنشاء الويب هوك', 'error');
    }
}

function editWebhook(webhookId) {
    showNotification('ميزة تعديل الويب هوك قيد التطوير', 'info');
}

async function deleteWebhook(webhookId) {
    if (!confirm('هل أنت متأكد من حذف الويب هوك؟')) {
        return;
    }

    try {
        await apiClient.deleteWebhook(webhookId);
        showNotification('تم حذف الويب هوك بنجاح', 'success');
        loadWebhooks();
    } catch (error) {
        console.error('Error deleting webhook:', error);
        showNotification('خطأ في حذف الويب هوك', 'error');
    }
}

// ============================================
// Utility Functions
// ============================================

function maskAPIKey(key) {
    if (!key || key.length < 8) return '***';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

function formatPermissions(permissions) {
    if (!permissions) return 'بدون صلاحيات';
    if (typeof permissions === 'string') {
        return permissions.split(',').map(p => {
            const labels = {
                'read': 'قراءة',
                'create': 'إنشاء',
                'update': 'تحديث',
                'delete': 'حذف'
            };
            return labels[p.trim()] || p;
        }).join('، ');
    }
    if (typeof permissions === 'object') {
        return Object.entries(permissions)
            .filter(([_, v]) => v)
            .map(([k]) => {
                const labels = {
                    'read': 'قراءة',
                    'create': 'إنشاء',
                    'update': 'تحديث',
                    'delete': 'حذف'
                };
                return labels[k] || k;
            })
            .join('، ');
    }
    return 'بدون صلاحيات';
}

function getStatusLabel(status) {
    const labels = {
        'open': 'مفتوحة',
        'in_progress': 'قيد المعالجة',
        'closed': 'مغلقة',
        'pending': 'قيد الانتظار',
        'delivered': 'تم التسليم',
        'failed': 'فشل'
    };
    return labels[status] || status;
}

function getPriorityLabel(priority) {
    const labels = {
        'low': 'منخفضة',
        'medium': 'متوسطة',
        'high': 'عالية'
    };
    return labels[priority] || priority;
}

function getPriorityColor(priority) {
    const colors = {
        'low': '#10b981',
        'medium': '#f59e0b',
        'high': '#ef4444'
    };
    return colors[priority] || '#94a3b8';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function copyToClipboard(elementId, text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ المفتاح إلى الحافظة', 'success');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        showNotification('خطأ في نسخ المفتاح', 'error');
    });
}

// ============================================
// Notifications
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        background: ${getNotificationColor(type)};
        color: white;
        z-index: 3000;
        animation: slideIn 0.3s ease-in;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'info': '#3b82f6',
        'warning': '#f59e0b'
    };
    return colors[type] || colors.info;
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Logout Handler
// ============================================

async function handleLogout() {
    if (!confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        return;
    }

    try {
        if (supabaseIntegration && supabaseIntegration.client) {
            await supabaseIntegration.signOut();
        }
        
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('api_key');
        localStorage.removeItem('team_id');
        
        showNotification('تم تسجيل الخروج بنجاح', 'success');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('خطأ في تسجيل الخروج', 'error');
    }
}

// ============================================
// Initialize on Page Load
// ============================================

window.addEventListener('load', () => {
    const jwtToken = localStorage.getItem('jwt_token');
    if (!jwtToken) {
        window.location.href = 'auth.html';
        return;
    }
    
    navigateTo('home');
});
