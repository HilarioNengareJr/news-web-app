import { supabase } from '../db.js';
import { AppError, ErrorMessages } from '../utils/errors.js';

export const authService = {
  async signIn(email, password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return {
          success: false,
          error: ErrorMessages.AUTHENTICATION.invalid
        };
      }

      // Check if user has admin role in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: ErrorMessages.AUTHORIZATION.adminOnly
        };
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: profile.role
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw AppError.authentication(ErrorMessages.AUTHENTICATION.default);
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw AppError.authentication('Error signing out');
    }
  },

  getCurrentUser(req) {
    return req.session.user || null;
  }
};