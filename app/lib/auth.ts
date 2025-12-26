
import { supabase } from './supabase';

export type User = {
  id: string;
  email: string;
  name?: string;
};

// Sign Up
export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      }
    }
  });
  
  return { data, error };
}

// Sign In
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Sign Out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Check if user is logged in
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}