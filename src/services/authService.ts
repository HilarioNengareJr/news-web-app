import { supabase } from '../config/db';
import bcrypt from 'bcryptjs';
import { User } from '../types/userType';

export class AuthService {
  public async login(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    if (!passwordMatch) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      isAdmin: true
    };
  }

  public async register(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      email: data.email,
      isAdmin: true
    };
  }

  public async getAdminById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return {
      id: data.id,
      email: data.email,
      isAdmin: true
    };
  }
}
