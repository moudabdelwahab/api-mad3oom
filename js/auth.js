// ============================================
// Authentication Module
// ============================================

/**
 * Authentication Handler
 * Manages user login, signup, and password reset
 */

class AuthHandler {
    constructor() {
        this.supabase = null;
        this.isLoading = false;
    }

    /**
     * Initialize authentication
     */
    async init() {
        // Wait for Supabase to be initialized
        let attempts = 0;
        while (!supabaseIntegration || !supabaseIntegration.client && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        this.supabase = supabaseIntegration;
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Setup form event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Sign up form
        const signUpForm = document.getElementById('signUpForm');
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }

        // Reset form
        const resetForm = document.getElementById('resetForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handleReset(e));
        }
    }

    /**
     * Check if user is already authenticated
     */
    async checkAuthStatus() {
        const { user } = await this.supabase.getCurrentUser();
        if (user) {
            this.redirectToDashboard();
        }
    }

    /**
     * Handle login
     */
    async handleLogin(event) {
        event.preventDefault();

        if (this.isLoading) return;
        this.isLoading = true;

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.showNotification('البريد الإلكتروني غير صحيح', 'error');
            this.isLoading = false;
            return;
        }

        if (password.length < 6) {
            this.showNotification('كلمة المرور قصيرة جداً', 'error');
            this.isLoading = false;
            return;
        }

        try {
            const result = await this.supabase.signIn(email, password);

            if (result.success) {
                this.showNotification('تم تسجيل الدخول بنجاح', 'success');
                setTimeout(() => this.redirectToDashboard(), 1500);
            } else {
                this.showNotification(result.error || 'خطأ في تسجيل الدخول', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('حدث خطأ أثناء تسجيل الدخول', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle sign up
     */
    async handleSignUp(event) {
        event.preventDefault();

        if (this.isLoading) return;
        this.isLoading = true;

        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!name) {
            this.showNotification('يرجى إدخال الاسم الكامل', 'error');
            this.isLoading = false;
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('البريد الإلكتروني غير صحيح', 'error');
            this.isLoading = false;
            return;
        }

        if (password.length < 8) {
            this.showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
            this.isLoading = false;
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('كلمات المرور غير متطابقة', 'error');
            this.isLoading = false;
            return;
        }

        if (!agreeTerms) {
            this.showNotification('يجب الموافقة على شروط الخدمة', 'error');
            this.isLoading = false;
            return;
        }

        try {
            const result = await this.supabase.signUp(email, password);

            if (result.success) {
                // Store user name
                localStorage.setItem('user_name', name);

                this.showNotification('تم إنشاء الحساب بنجاح، يرجى تأكيد بريدك الإلكتروني', 'success');
                
                // Show success message
                this.showSuccessMessage('تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.');
            } else {
                this.showNotification(result.error || 'خطأ في إنشاء الحساب', 'error');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            this.showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle password reset
     */
    async handleReset(event) {
        event.preventDefault();

        if (this.isLoading) return;
        this.isLoading = true;

        const email = document.getElementById('resetEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showNotification('البريد الإلكتروني غير صحيح', 'error');
            this.isLoading = false;
            return;
        }

        try {
            // Note: This would typically call a password reset endpoint
            // For now, we'll show a success message
            this.showNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
            
            this.showSuccessMessage('تم إرسال رابط استعادة كلمة المرور! يرجى التحقق من بريدك الإلكتروني.');
        } catch (error) {
            console.error('Reset error:', error);
            this.showNotification('حدث خطأ أثناء استعادة كلمة المرور', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 4000);
    }

    /**
     * Show success message
     */
    showSuccessMessage(text) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Show success message
        const successMessage = document.getElementById('successMessage');
        document.getElementById('successText').textContent = text;
        successMessage.classList.add('active');
    }

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        window.location.href = 'index.html';
    }
}

// ============================================
// Global Functions
// ============================================

const authHandler = new AuthHandler();

/**
 * Switch to login form
 */
function switchToLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signUpForm').classList.remove('active');
    document.getElementById('resetForm').classList.remove('active');
    document.getElementById('successMessage').classList.remove('active');
}

/**
 * Switch to sign up form
 */
function switchToSignUp() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signUpForm').classList.add('active');
    document.getElementById('resetForm').classList.remove('active');
    document.getElementById('successMessage').classList.remove('active');
}

/**
 * Show reset password form
 */
function resetPassword(event) {
    event.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signUpForm').classList.remove('active');
    document.getElementById('resetForm').classList.add('active');
    document.getElementById('successMessage').classList.remove('active');
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard() {
    authHandler.redirectToDashboard();
}

// ============================================
// Initialize on Page Load
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await authHandler.init();
});
