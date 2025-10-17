import pool from './client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  created_at: Date;
}

interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: Date;
  created_at: Date;
}

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
}

export const db = {
  users: {
    async create(email: string, password: string): Promise<User> {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        await connection.execute(
          'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
          [userId, email, passwordHash]
        );
        
        // Create profile
        await connection.execute(
          'INSERT INTO profiles (id, email) VALUES (?, ?)',
          [userId, email]
        );
        
        // Create default role
        await connection.execute(
          'INSERT INTO user_roles (user_id, role) VALUES (?, ?)',
          [userId, 'user']
        );
        
        // Create default settings
        await connection.execute(
          'INSERT INTO user_settings (user_id, theme, language) VALUES (?, ?, ?)',
          [userId, 'light', 'en']
        );
        
        await connection.commit();
        
        return { id: userId, email, created_at: new Date() };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },
    
    async checkAdminRole(userId: string): Promise<boolean> {
      const [rows] = await pool.execute(
        'SELECT role FROM user_roles WHERE user_id = ? AND role = ?',
        [userId, 'admin']
      );
      return Array.isArray(rows) && rows.length > 0;
    },
    
    async authenticate(email: string, password: string): Promise<User | null> {
      const [rows] = await pool.execute(
        'SELECT u.*, p.created_at FROM users u JOIN profiles p ON u.id = p.id WHERE u.email = ?',
        [email]
      );
      
      if (!Array.isArray(rows) || rows.length === 0) return null;
      
      const user = rows[0] as any;
      const valid = await bcrypt.compare(password, user.password_hash);
      
      if (!valid) return null;
      
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      };
    }
  },
  
  expenses: {
    async create(data: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO expenses (id, user_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?, ?)',
        [id, data.user_id, data.amount, data.category, data.description, data.expense_date]
      );
      
      return {
        ...data,
        id,
        created_at: new Date()
      };
    },
    
    async list(userId: string): Promise<Expense[]> {
      const [rows] = await pool.execute(
        'SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC',
        [userId]
      );
      return rows as Expense[];
    },
    
    async update(id: string, data: Partial<Omit<Expense, 'id' | 'created_at' | 'user_id'>>): Promise<void> {
      const setFields = Object.entries(data)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      
      const values = [...Object.values(data), id];
      
      await pool.execute(
        `UPDATE expenses SET ${setFields} WHERE id = ?`,
        values
      );
    },
    
    async delete(id: string): Promise<void> {
      await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    }
  },
  
  settings: {
    async get(userId: string): Promise<UserSettings | null> {
      const [rows] = await pool.execute(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );
      
      return Array.isArray(rows) && rows.length > 0 ? rows[0] as UserSettings : null;
    },
    
    async update(userId: string, settings: Partial<Omit<UserSettings, 'id' | 'user_id'>>): Promise<void> {
      const setFields = Object.entries(settings)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      
      const values = [...Object.values(settings), userId];
      
      await pool.execute(
        `UPDATE user_settings SET ${setFields} WHERE user_id = ?`,
        values
      );
    }
  }
};