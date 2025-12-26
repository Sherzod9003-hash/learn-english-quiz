import { supabase } from './supabase';

export type WrongAnswer = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  mode: 'en-uz' | 'uz-en';
};

export type QuizResult = {
  score: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
};

// User progress'ni olish
export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
    console.error('Error fetching progress:', error);
    return null;
  }

  return data;
}

// Progress yaratish yoki yangilash
export async function updateUserProgress(userId: string, newScore: number) {
  // Avval mavjud progress'ni tekshirish
  const existing = await getUserProgress(userId);

  if (existing) {
    // Mavjud bo'lsa - yangilash
    const { error } = await supabase
      .from('user_progress')
      .update({
        total_games: existing.total_games + 1,
        total_score: existing.total_score + newScore,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  } else {
    // Yo'q bo'lsa - yaratish
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_games: 1,
        total_score: newScore,
      });

    if (error) {
      console.error('Error creating progress:', error);
      return false;
    }
  }

  return true;
}

// Quiz tarixiga qo'shish
export async function saveQuizHistory(userId: string, result: QuizResult) {
  const { error } = await supabase
    .from('quiz_history')
    .insert({
      user_id: userId,
      score: result.score,
      total_questions: result.totalQuestions,
      wrong_answers: JSON.stringify(result.wrongAnswers),
    });

  if (error) {
    console.error('Error saving quiz history:', error);
    return false;
  }

  // Progress'ni ham yangilash
  await updateUserProgress(userId, result.score);

  return true;
}

// User'ning oxirgi quiz'larini olish
export async function getRecentQuizzes(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching quiz history:', error);
    return [];
  }

  return data || [];
}