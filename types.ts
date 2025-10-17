export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  email: string;
  created_at: Date;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: Date;
  created_at: Date;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  created_at: Date;
  updated_at: Date;
}