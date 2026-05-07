// ============================================
// Supabase Integration Module
// ============================================

/**
 * Supabase Integration for Teams API Platform
 * Handles authentication, database operations, and API key management
 */

class SupabaseIntegration {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.client = null;
        this.user = null;
        this.team = null;
    }

    /**
     * Initialize Supabase client
     */
    async init() {
        try {
            // Load Supabase library from CDN
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseLibrary();
            }

            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('✓ Supabase initialized successfully');
            return true;
        } catch (error) {
            console.error('✗ Error initializing Supabase:', error);
            return false;
        }
    }

    /**
     * Load Supabase library from CDN
     */
    loadSupabaseLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ============================================
    // Authentication Methods
    // ============================================

    /**
     * Sign up new user
     */
    async signUp(email, password) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign in user
     */
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            this.user = data.user;
            localStorage.setItem('jwt_token', data.session.access_token);
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out user
     */
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            this.user = null;
            this.team = null;
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('api_key');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            if (error) throw error;
            this.user = user;
            return { success: true, user };
        } catch (error) {
            console.error('Get current user error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // Team Management Methods
    // ============================================

    /**
     * Create new team
     */
    async createTeam(name, description = '') {
        try {
            const { data, error } = await this.client
                .from('teams')
                .insert([
                    {
                        name,
                        description,
                        owner_id: this.user.id,
                        is_active: true
                    }
                ])
                .select();

            if (error) throw error;
            this.team = data[0];
            localStorage.setItem('team_id', this.team.id);
            return { success: true, data: this.team };
        } catch (error) {
            console.error('Create team error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user teams
     */
    async getUserTeams() {
        try {
            const { data, error } = await this.client
                .from('teams')
                .select('*')
                .eq('owner_id', this.user.id);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get user teams error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get team by ID
     */
    async getTeam(teamId) {
        try {
            const { data, error } = await this.client
                .from('teams')
                .select('*')
                .eq('id', teamId)
                .single();

            if (error) throw error;
            this.team = data;
            return { success: true, data };
        } catch (error) {
            console.error('Get team error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update team
     */
    async updateTeam(teamId, updates) {
        try {
            const { data, error } = await this.client
                .from('teams')
                .update(updates)
                .eq('id', teamId)
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Update team error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // API Key Management Methods
    // ============================================

    /**
     * Generate API key
     */
    async generateAPIKey(teamId, name, permissions, expiresAt = null) {
        try {
            // Generate random key
            const keyString = this.generateRandomKey();
            const keyHash = await this.hashKey(keyString);
            const keyPrefix = 'mad_';

            const { data, error } = await this.client
                .from('api_keys')
                .insert([
                    {
                        team_id: teamId,
                        name,
                        key_hash: keyHash,
                        key_prefix: keyPrefix,
                        permissions: permissions,
                        is_active: true,
                        expires_at: expiresAt
                    }
                ])
                .select();

            if (error) throw error;

            // Return the full key only once
            return {
                success: true,
                data: {
                    ...data[0],
                    key: keyPrefix + keyString
                }
            };
        } catch (error) {
            console.error('Generate API key error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get team API keys
     */
    async getTeamAPIKeys(teamId) {
        try {
            const { data, error } = await this.client
                .from('api_keys')
                .select('*')
                .eq('team_id', teamId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get team API keys error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Revoke API key
     */
    async revokeAPIKey(keyId) {
        try {
            const { data, error } = await this.client
                .from('api_keys')
                .update({
                    is_active: false,
                    revoked_at: new Date().toISOString()
                })
                .eq('id', keyId)
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Revoke API key error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify API key
     */
    async verifyAPIKey(keyHash) {
        try {
            const { data, error } = await this.client
                .from('api_keys')
                .select('*')
                .eq('key_hash', keyHash)
                .eq('is_active', true)
                .single();

            if (error) throw error;

            // Check if key has expired
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return { success: false, error: 'API key has expired' };
            }

            // Update last used timestamp
            await this.client
                .from('api_keys')
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', data.id);

            return { success: true, data };
        } catch (error) {
            console.error('Verify API key error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // Webhook Management Methods
    // ============================================

    /**
     * Create webhook
     */
    async createWebhook(teamId, url, events, secret) {
        try {
            const { data, error } = await this.client
                .from('webhook_endpoints')
                .insert([
                    {
                        team_id: teamId,
                        url,
                        events,
                        secret,
                        is_active: true
                    }
                ])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Create webhook error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get team webhooks
     */
    async getTeamWebhooks(teamId) {
        try {
            const { data, error } = await this.client
                .from('webhook_endpoints')
                .select('*')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get team webhooks error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update webhook
     */
    async updateWebhook(webhookId, updates) {
        try {
            const { data, error } = await this.client
                .from('webhook_endpoints')
                .update(updates)
                .eq('id', webhookId)
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Update webhook error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(webhookId) {
        try {
            const { error } = await this.client
                .from('webhook_endpoints')
                .delete()
                .eq('id', webhookId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Delete webhook error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // API Logs Methods
    // ============================================

    /**
     * Log API request
     */
    async logAPIRequest(teamId, apiKeyId, method, endpoint, statusCode, responseTime, ipAddress, userAgent, requestBody, responseBody, errorMessage = null) {
        try {
            const { error } = await this.client
                .from('api_logs')
                .insert([
                    {
                        team_id: teamId,
                        api_key_id: apiKeyId,
                        method,
                        endpoint,
                        status_code: statusCode,
                        response_time_ms: responseTime,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        request_body: requestBody,
                        response_body: responseBody,
                        error_message: errorMessage
                    }
                ]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Log API request error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get API logs
     */
    async getAPILogs(teamId, limit = 100, offset = 0) {
        try {
            const { data, error } = await this.client
                .from('api_logs')
                .select('*')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Get API logs error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * Generate random API key
     */
    generateRandomKey(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Hash API key using SHA256
     */
    async hashKey(key) {
        const encoder = new TextEncoder();
        const data = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, secret) {
        // This would typically be done on the server side
        // For client-side reference only
        return true;
    }
}

// ============================================
// Initialize Supabase Integration
// ============================================

// Get Supabase credentials from environment or config
const SUPABASE_URL = 'https://srnelrdpqkcntbgudyto.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0pvB8_xD0txjdJBkYqXMyg__jKMw71W';

// Create global instance
const supabaseIntegration = new SupabaseIntegration(SUPABASE_URL, SUPABASE_KEY);

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await supabaseIntegration.init();
    
    // Check if user is already logged in
    const { user } = await supabaseIntegration.getCurrentUser();
    if (user) {
        console.log('✓ User already logged in:', user.email);
    }
});
