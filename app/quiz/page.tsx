'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Word } from '../lib/supabase';

type QuizMode = 'en-uz' | 'uz-en';

const MAX_QUESTIONS = 10;

export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>('en-uz');
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [usedWords, setUsedWords] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Database'dan so'zlarni yuklash
  useEffect(() => {
    async function fetchWords() {
      console.log('🔍 Fetching words from Supabase...');
      
      try {
        const { data, error } = await supabase
          .from('words')
          .select('*');
        
        console.log('📊 Data received:', data);
        console.log('❌ Error:', error);
        
        if (error) {
          console.error('Error fetching words:', error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('✅ Words loaded successfully:', data.length);
          setWords(data);
          setLoading(false);
        } else {
          console.warn('⚠️ No words found in database');
          setError('Ma\'lumotlar bazasida so\'zlar topilmadi');
          setLoading(false);
        }
      } catch (err) {
        console.error('💥 Unexpected error:', err);
        setError('Kutilmagan xato yuz berdi');
        setLoading(false);
      }
    }
    
    fetchWords();
  }, []);

  const generateQuestion = () => {
    console.log('🎲 Generating question...');
    console.log('📚 Total words:', words.length);
    console.log('✅ Used words:', usedWords.length);
    console.log('🔄 Current mode:', mode);
    
    if (words.length === 0) {
      console.warn('⚠️ No words available');
      return;
    }
    
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);

    const availableWords = words.filter(w => !usedWords.includes(w.id));
    console.log('📝 Available words:', availableWords.length);
    
    if (availableWords.length === 0) {
      console.log('🏁 Quiz finished - no more words');
      setQuizFinished(true);
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    console.log('🎯 Selected word:', word);
    console.log('   EN:', word.en, '→ UZ:', word.uz);
    
    setCurrentWord(word);
    setUsedWords([...usedWords, word.id]);

    // mode === 'en-uz': Savol inglizcha, javob o'zbekcha
    // mode === 'uz-en': Savol o'zbekcha, javob inglizcha
    const correctAnswer = mode === 'en-uz' ? word.uz : word.en;
    console.log('✔️ Correct answer:', correctAnswer);
    
    const incorrectOptions = words
      .filter(w => w.id !== word.id)
      .map(w => mode === 'en-uz' ? w.uz : w.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...incorrectOptions].sort(() => Math.random() - 0.5);
    console.log('📋 All options:', allOptions);
    setOptions(allOptions);
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('Quiz finished:', quizFinished);
    console.log('Used words length:', usedWords.length);
    console.log('Words length:', words.length);
    console.log('Loading:', loading);
    
    if (!quizFinished && !loading && usedWords.length === 0 && words.length > 0) {
      console.log('▶️ Calling generateQuestion()');
      generateQuestion();
    }
  }, [words, mode, loading]);

  const selectOption = (option: string) => {
    if (selectedAnswer) return;
    setSelectedOption(option);
  };

  const confirmAnswer = () => {
    if (!selectedOption) return;

    const correctAnswer = mode === 'en-uz' ? currentWord?.uz : currentWord?.en;
    const correct = selectedOption === correctAnswer;
    
    setSelectedAnswer(selectedOption);
    setIsCorrect(correct);
    
    const newScore = { 
      correct: score.correct + (correct ? 1 : 0), 
      total: score.total + 1 
    };
    setScore(newScore);

    if (newScore.total >= MAX_QUESTIONS) {
      setTimeout(() => {
        setQuizFinished(true);
      }, 1500);
    }
  };

  const cancelSelection = () => {
    setSelectedOption(null);
  };

  const nextQuestion = () => {
    if (score.total >= MAX_QUESTIONS) {
      setQuizFinished(true);
    } else {
      generateQuestion();
    }
  };

  const restartQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setUsedWords([]);
    setQuizFinished(false);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentWord(null);
    setOptions([]);
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  const changeMode = (newMode: QuizMode) => {
    if (mode === newMode) return; // Agar bir xil rejim bo'lsa, hech narsa qilma
    
    console.log('🔄 Changing mode from', mode, 'to', newMode);
    
    // To'liq reset - State'larni tartib bilan tozalash
    setCurrentWord(null);
    setOptions([]);
    setSelectedOption(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore({ correct: 0, total: 0 });
    setUsedWords([]);
    setQuizFinished(false);
    
    // Rejimni o'zgartirish
    setMode(newMode);
    
    // Loading holatini yoqish
    setLoading(true);
    
    // Bir oz kutib, qayta yuklash
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
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
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            🏠 Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
      message = "Ajoyib! Siz zo'r natija ko'rsatdingiz!";
      emoji = '🏆';
    } else if (percentage >= 70) {
      message = "Yaxshi! Davom eting!";
      emoji = '🎉';
    } else if (percentage >= 50) {
      message = "Yomon emas, lekin ko'proq mashq qiling!";
      emoji = '👍';
    } else {
      message = "Ko'proq o'rganishingiz kerak!";
      emoji = '📚';
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-12 text-center">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6">{emoji}</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-indigo-900">
            Quiz tugadi!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">{message}</p>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-6 md:mb-8">
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">{score.correct}</div>
                <div className="text-xs md:text-base text-gray-600 mt-1 md:mt-2">To&apos;g&apos;ri</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-red-600">{score.total - score.correct}</div>
                <div className="text-xs md:text-base text-gray-600 mt-1 md:mt-2">Xato</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-600">{percentage}%</div>
                <div className="text-xs md:text-base text-gray-600 mt-1 md:mt-2">Natija</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <button
              onClick={restartQuiz}
              className="w-full bg-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg active:scale-95"
            >
              🔄 Qayta boshlash
            </button>
            <Link
              href="/"
              className="w-full bg-gray-200 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-300 transition-all hover:scale-105 inline-block active:scale-95"
            >
              🏠 Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl font-semibold text-indigo-900">Savol tayyorlanmoqda...</div>
        </div>
      </div>
    );
  }

  const question = mode === 'en-uz' ? currentWord.en : currentWord.uz;
  const correctAnswer = mode === 'en-uz' ? currentWord.uz : currentWord.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 pb-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-indigo-900">
            🎓 Ingliz tili Quiz
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
            <button
              onClick={() => changeMode('en-uz')}
              className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-xl font-semibold transition-all text-xs md:text-base ${
                mode === 'en-uz'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇬🇧 → 🇺🇿 Inglizcha → O&apos;zbekcha
            </button>
            <button
              onClick={() => changeMode('uz-en')}
              className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-xl font-semibold transition-all text-xs md:text-base ${
                mode === 'uz-en'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇺🇿 → 🇬🇧 O&apos;zbekcha → Inglizcha
            </button>
          </div>

          <div className="flex justify-between items-center text-xs md:text-sm mb-2">
            <div className="text-gray-600">
              Savol: <span className="font-bold text-indigo-600">{score.total + 1}/{MAX_QUESTIONS}</span>
            </div>
            <div className="text-gray-600">
              Ball: <span className="font-bold text-green-600">{score.correct}/{score.total}</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(score.total / MAX_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-4 md:mb-6">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-xs md:text-sm text-gray-500 mb-2">
              {mode === 'en-uz' ? 'Tarjima qiling:' : 'Translate:'}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-indigo-900 mb-2">
              {question}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isFinalAnswer = selectedAnswer === option;
              const isCorrectOption = option === correctAnswer;
              
              let className = 'w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-sm md:text-lg transition-all border-2 ';
              
              if (selectedAnswer) {
                if (isFinalAnswer && isCorrect) {
                  className += 'bg-green-100 border-green-500 text-green-800';
                } else if (isFinalAnswer && !isCorrect) {
                  className += 'bg-red-100 border-red-500 text-red-800';
                } else if (isCorrectOption) {
                  className += 'bg-green-100 border-green-500 text-green-800';
                } else {
                  className += 'bg-gray-50 border-gray-200 opacity-50';
                }
              } else if (isSelected) {
                className += 'bg-yellow-100 border-yellow-500 text-yellow-900 scale-105';
              } else {
                className += 'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer active:scale-98';
              }

              return (
                <button
                  key={index}
                  onClick={() => selectOption(option)}
                  disabled={selectedAnswer !== null}
                  className={className}
                >
                  <span className="mr-2 md:mr-3 text-gray-400 font-bold">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                  {isFinalAnswer && isCorrect && ' ✅'}
                  {isFinalAnswer && !isCorrect && ' ❌'}
                  {!isFinalAnswer && isCorrectOption && selectedAnswer && ' ✅'}
                  {isSelected && !selectedAnswer && ' 👈'}
                </button>
              );
            })}
          </div>

          {selectedOption && !selectedAnswer && (
            <div className="mt-4 md:mt-6 flex gap-3">
              <button
                onClick={confirmAnswer}
                className="flex-1 bg-green-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base hover:bg-green-700 transition-all shadow-lg active:scale-95"
              >
                ✅ Tasdiqlash
              </button>
              <button
                onClick={cancelSelection}
                className="flex-1 bg-gray-300 text-gray-700 py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base hover:bg-gray-400 transition-all active:scale-95"
              >
                ❌ Bekor qilish
              </button>
            </div>
          )}

          {selectedAnswer && (
            <div className="mt-4 md:mt-6 text-center">
              {isCorrect ? (
                <div className="text-green-600 font-semibold text-base md:text-lg mb-3 md:mb-4">
                  🎉 To&apos;g&apos;ri! Ajoyib!
                </div>
              ) : (
                <div className="text-red-600 font-semibold text-sm md:text-lg mb-3 md:mb-4">
                  ❌ Noto&apos;g&apos;ri. To&apos;g&apos;ri javob: <span className="text-green-600">{correctAnswer}</span>
                </div>
              )}
              <button
                onClick={nextQuestion}
                className="w-full bg-indigo-600 text-white py-3.5 md:py-4 px-6 md:px-8 rounded-xl font-bold text-base md:text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
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