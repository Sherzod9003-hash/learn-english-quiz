'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, Word } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';
import { getCurrentUser } from '../lib/auth';
import { saveQuizHistory, WrongAnswer } from '../lib/progress';

type QuizMode = 'en-uz' | 'uz-en';

const MAX_QUESTIONS = 10;

function QuizContent() {
  const [mode, setMode] = useState<QuizMode>('en-uz');
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [usedWords, setUsedWords] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    async function fetchWords() {
      try {
        const { data, error } = await supabase
          .from('words')
          .select('*')
          .limit(50);
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Ma\'lumotlar bazasida so\'zlar topilmadi');
        }
        
        setWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kutilmagan xato');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWords();
  }, []);

  const generateQuestion = useCallback(() => {
    if (words.length === 0) return;
    
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);

    const availableWords = words.filter(w => !usedWords.includes(w.id));
    
    if (availableWords.length === 0 || score.total >= MAX_QUESTIONS) {
      setQuizFinished(true);
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(word);
    setUsedWords(prev => [...prev, word.id]);

    const correctAnswer = mode === 'en-uz' ? word.uz : word.en;
    
    const incorrectOptions = words
      .filter(w => w.id !== word.id)
      .map(w => mode === 'en-uz' ? w.uz : w.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...incorrectOptions]
      .sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);
  }, [words, usedWords, mode, score.total]);

  useEffect(() => {
    if (!loading && !quizFinished && words.length > 0 && !currentWord) {
      generateQuestion();
    }
  }, [loading, quizFinished, words, currentWord, generateQuestion]);

  const selectOption = (option: string) => {
    if (selectedAnswer) return;
    setSelectedOption(option);
  };

  const confirmAnswer = () => {
    if (!selectedOption || !currentWord) return;

    const correctAnswer = mode === 'en-uz' ? currentWord.uz : currentWord.en;
    const correct = selectedOption === correctAnswer;
    
    setSelectedAnswer(selectedOption);
    setIsCorrect(correct);
    
    // Xato javobni saqlash
    if (!correct) {
      const wrongAnswer: WrongAnswer = {
        question: mode === 'en-uz' ? currentWord.en : currentWord.uz,
        userAnswer: selectedOption,
        correctAnswer: correctAnswer,
        mode: mode
      };
      setWrongAnswers(prev => [...prev, wrongAnswer]);
    }
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    if (score.total >= MAX_QUESTIONS) {
      finishQuiz();
    } else {
      generateQuestion();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    setSavingProgress(true);
    
    try {
      const user = await getCurrentUser();
      if (user) {
        await saveQuizHistory(user.id, {
          score: score.correct,
          totalQuestions: score.total,
          wrongAnswers: wrongAnswers
        });
      }
    } catch (err) {
      console.error('Progress saqlashda xato:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const restartQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setUsedWords([]);
    setWrongAnswers([]);
    setQuizFinished(false);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentWord(null);
    setOptions([]);
    
    setTimeout(() => {
      if (words.length > 0) {
        const word = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(word);
        setUsedWords([word.id]);
        
        const correctAnswer = mode === 'en-uz' ? word.uz : word.en;
        
        const incorrectOptions = words
          .filter(w => w.id !== word.id)
          .map(w => mode === 'en-uz' ? w.uz : w.en)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [correctAnswer, ...incorrectOptions]
          .sort(() => Math.random() - 0.5);
        
        setOptions(allOptions);
      }
    }, 150);
  };

  const changeMode = (newMode: QuizMode) => {
    if (mode === newMode) return;
    
    setMode(newMode);
    setScore({ correct: 0, total: 0 });
    setUsedWords([]);
    setWrongAnswers([]);
    setQuizFinished(false);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentWord(null);
    setOptions([]);
    
    setTimeout(() => {
      if (words.length > 0) {
        const availableWords = words;
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentWord(word);
        setUsedWords([word.id]);
        
        const correctAnswer = newMode === 'en-uz' ? word.uz : word.en;
        
        const incorrectOptions = words
          .filter(w => w.id !== word.id)
          .map(w => newMode === 'en-uz' ? w.uz : w.en)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        const allOptions = [correctAnswer, ...incorrectOptions]
          .sort(() => Math.random() - 0.5);
        
        setOptions(allOptions);
      }
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">📚</div>
          <div className="text-xl font-semibold text-indigo-900">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Xatolik yuz berdi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              🔄 Qayta urinish
            </button>
            <Link
              href="/"
              className="block bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              🏠 Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const getResult = () => {
      if (percentage >= 90) return { 
        message: "Ajoyib! Siz zo'r natija ko'rsatdingiz!", 
        emoji: '🏆',
        color: 'text-yellow-600'
      };
      if (percentage >= 70) return { 
        message: "Yaxshi! Davom eting!", 
        emoji: '🎉',
        color: 'text-green-600'
      };
      if (percentage >= 50) return { 
        message: "Yomon emas, lekin ko'proq mashq qiling!", 
        emoji: '👍',
        color: 'text-blue-600'
      };
      return { 
        message: "Harakat qiling! Ko'proq o'rganishingiz kerak.", 
        emoji: '📚',
        color: 'text-orange-600'
      };
    };
    
    const result = getResult();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-center mb-6">
            <div className="text-7xl mb-5">{result.emoji}</div>
            <h1 className="text-3xl font-bold mb-3 text-indigo-900">Quiz tugadi!</h1>
            <p className={`text-xl font-semibold mb-6 ${result.color}`}>{result.message}</p>
            
            {savingProgress && (
              <p className="text-sm text-gray-500 mb-4">Natija saqlanmoqda...</p>
            )}
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">{score.correct}</div>
                  <div className="text-sm text-gray-600 mt-1">To&apos;g&apos;ri</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{score.total - score.correct}</div>
                  <div className="text-sm text-gray-600 mt-1">Xato</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600 mt-1">Natija</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={restartQuiz}
                className="w-full bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
              >
                🔄 Qayta boshlash
              </button>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold text-base hover:bg-gray-300 transition-all"
              >
                🏠 Bosh sahifa
              </Link>
            </div>
          </div>

          {/* Xato javoblar */}
          {wrongAnswers.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                ❌ Xato javoblar ({wrongAnswers.length})
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Bu so&apos;zlarni qayta takrorlang:
              </p>
              
              <div className="space-y-3">
                {wrongAnswers.map((wrong, index) => (
                  <div 
                    key={index}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg font-bold text-red-600 min-w-[24px]">
                        {index + 1}.
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {wrong.question}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-red-700">
                            <span className="font-semibold">Sizning javobingiz:</span> {wrong.userAnswer}
                          </div>
                          <div className="text-green-700">
                            <span className="font-semibold">To&apos;g&apos;ri javob:</span> {wrong.correctAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentWord) return null;

  const question = mode === 'en-uz' ? currentWord.en : currentWord.uz;
  const correctAnswer = mode === 'en-uz' ? currentWord.uz : currentWord.en;
  const progressPercentage = Math.min(((score.total + 1) / MAX_QUESTIONS) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-3 md:py-4 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-3">
          <h1 className="text-2xl font-bold text-center mb-4 text-indigo-900">
            🎓 Ingliz tili Quiz
          </h1>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => changeMode('en-uz')}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                mode === 'en-uz'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇬🇧 → 🇺🇿 Inglizcha → O&apos;zbekcha
            </button>
            <button
              onClick={() => changeMode('uz-en')}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                mode === 'uz-en'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇺🇿 → 🇬🇧 O&apos;zbekcha → Inglizcha
            </button>
          </div>

          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-600">
              Savol: <strong className="text-indigo-600">{Math.min(score.total + 1, MAX_QUESTIONS)}/{MAX_QUESTIONS}</strong>
            </span>
            <span className="text-gray-600">
              Ball: <strong className="text-green-600">{score.correct}/{score.total}</strong>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="text-center mb-5">
            <p className="text-xs text-gray-500 mb-2">
              {mode === 'en-uz' ? 'Tarjima qiling:' : 'Translate:'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">{question}</h2>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isFinalAnswer = selectedAnswer === option;
              const isCorrectOption = option === correctAnswer;
              
              let btnClass = 'w-full py-2.5 px-4 rounded-lg font-semibold text-base transition-all border-2 text-left ';
              
              if (selectedAnswer) {
                if (isFinalAnswer && isCorrect) {
                  btnClass += 'bg-green-100 border-green-500 text-green-800';
                } else if (isFinalAnswer && !isCorrect) {
                  btnClass += 'bg-red-100 border-red-500 text-red-800';
                } else if (isCorrectOption) {
                  btnClass += 'bg-green-100 border-green-500 text-green-800';
                } else {
                  btnClass += 'bg-gray-50 border-gray-200 opacity-50';
                }
              } else if (isSelected) {
                btnClass += 'bg-yellow-100 border-yellow-500 text-yellow-900 scale-105 shadow-lg';
              } else {
                btnClass += 'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer hover:scale-102';
              }

              return (
                <button
                  key={index}
                  onClick={() => selectOption(option)}
                  disabled={selectedAnswer !== null}
                  className={btnClass}
                >
                  <span className="mr-2 text-gray-400 font-bold">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                  {isFinalAnswer && isCorrect && ' ✅'}
                  {isFinalAnswer && !isCorrect && ' ❌'}
                  {!isFinalAnswer && isCorrectOption && selectedAnswer && ' ✅'}
                </button>
              );
            })}
          </div>

          {selectedOption && !selectedAnswer && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={confirmAnswer}
                className="bg-green-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-all shadow-lg"
              >
                ✅ Tasdiqlash
              </button>
              <button
                onClick={() => setSelectedOption(null)}
                className="bg-gray-300 text-gray-700 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-400 transition-all"
              >
                ❌ Bekor qilish
              </button>
            </div>
          )}

          {selectedAnswer && (
            <div className="mt-4 text-center">
              <div className={`font-semibold text-base mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? (
                  '🎉 To\'g\'ri! Ajoyib!'
                ) : (
                  <>❌ Noto'g'ri. To'g'ri javob: <span className="text-green-600">{correctAnswer}</span></>
                )}
              </div>
              <button
                onClick={nextQuestion}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-base hover:bg-indigo-700 transition-all shadow-lg"
              >
                {score.total >= MAX_QUESTIONS - 1 ? 'Natijani ko\'rish →' : 'Keyingi savol →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}
