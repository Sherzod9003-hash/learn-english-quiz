'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type QuizMode = 'en-uz' | 'uz-en';

type Word = {
  id: number;
  en: string;
  uz: string;
};

const WORDS: Word[] = [
  { id: 1, en: 'Hello', uz: 'Salom' },
  { id: 2, en: 'Thank you', uz: 'Rahmat' },
  { id: 3, en: 'Goodbye', uz: 'Xayr' },
  { id: 4, en: 'Please', uz: 'Iltimos' },
  { id: 5, en: 'Yes', uz: 'Ha' },
  { id: 6, en: 'No', uz: "Yo'q" },
  { id: 7, en: 'Water', uz: 'Suv' },
  { id: 8, en: 'Food', uz: 'Ovqat' },
  { id: 9, en: 'House', uz: 'Uy' },
  { id: 10, en: 'Car', uz: 'Mashina' },
];

const MAX_QUESTIONS = 10; // Maksimal savollar soni

export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>('en-uz');
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [usedWords, setUsedWords] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);

    // Ishlatilmagan so'zlardan tanlash
    const availableWords = WORDS.filter(w => !usedWords.includes(w.id));
    
    if (availableWords.length === 0) {
      setQuizFinished(true);
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(word);
    setUsedWords([...usedWords, word.id]);

    // 4 ta variant yaratish
    const correctAnswer = mode === 'en-uz' ? word.uz : word.en;
    const incorrectOptions = WORDS
      .filter(w => w.id !== word.id)
      .map(w => mode === 'en-uz' ? w.uz : w.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [correctAnswer, ...incorrectOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  useEffect(() => {
    generateQuestion();
  }, [mode]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correctAnswer = mode === 'en-uz' ? currentWord?.uz : currentWord?.en;
    const correct = answer === correctAnswer;
    
    setIsCorrect(correct);
    const newScore = { 
      correct: score.correct + (correct ? 1 : 0), 
      total: score.total + 1 
    };
    setScore(newScore);

    // 10 ta savoldan keyin tugatish
    if (newScore.total >= MAX_QUESTIONS) {
      setQuizFinished(true);
    }
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
    generateQuestion();
  };

  // Natija sahifasi
  if (quizFinished) {
    const percentage = Math.round((score.correct / score.total) * 100);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="text-8xl mb-6">{emoji}</div>
          <h1 className="text-4xl font-bold mb-4 text-indigo-900">
            Quiz tugadi!
          </h1>
          <p className="text-xl text-gray-600 mb-8">{message}</p>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold text-indigo-600">{score.correct}</div>
                <div className="text-gray-600 mt-2">To'g'ri javoblar</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-600">{score.total - score.correct}</div>
                <div className="text-gray-600 mt-2">Xato javoblar</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">{percentage}%</div>
                <div className="text-gray-600 mt-2">Natija</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={restartQuiz}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
            >
              🔄 Qayta boshlash
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all hover:scale-105"
            >
              🏠 Bosh sahifa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return <div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>;

  const question = mode === 'en-uz' ? currentWord.en : currentWord.uz;
  const correctAnswer = mode === 'en-uz' ? currentWord.uz : currentWord.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-indigo-900">
            🎓 Ingliz tili Quiz
          </h1>
          
          {/* Mode selector */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={() => {
                setMode('en-uz');
                restartQuiz();
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
                mode === 'en-uz'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇬🇧 → 🇺🇿 Inglizcha → O&apos;zbekcha
            </button>
            <button
              onClick={() => {
                setMode('uz-en');
                restartQuiz();
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm md:text-base ${
                mode === 'uz-en'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇺🇿 → 🇬🇧 O&apos;zbekcha → Inglizcha
            </button>
          </div>

          {/* Progress */}
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="text-gray-600">
              Savol: <span className="font-bold text-indigo-600">{score.total + 1}/{MAX_QUESTIONS}</span>
            </div>
            <div className="text-gray-600">
              Ball: <span className="font-bold text-green-600">{score.correct}/{score.total}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(score.total / MAX_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-2">
              {mode === 'en-uz' ? 'Tarjima qiling:' : 'Translate:'}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-2">
              {question}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === correctAnswer;
              
              let className = 'w-full py-4 px-6 rounded-xl font-semibold text-base md:text-lg transition-all border-2 ';
              
              if (!selectedAnswer) {
                className += 'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:scale-102 cursor-pointer';
              } else if (isSelected && isCorrect) {
                className += 'bg-green-100 border-green-500 text-green-800';
              } else if (isSelected && !isCorrect) {
                className += 'bg-red-100 border-red-500 text-red-800';
              } else if (isCorrectOption) {
                className += 'bg-green-100 border-green-500 text-green-800';
              } else {
                className += 'bg-gray-50 border-gray-200 opacity-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={className}
                >
                  <span className="mr-3 text-gray-400 font-bold">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                  {isSelected && isCorrect && ' ✅'}
                  {isSelected && !isCorrect && ' ❌'}
                  {!isSelected && isCorrectOption && selectedAnswer && ' ✅'}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {selectedAnswer && (
            <div className="mt-6 text-center">
              {isCorrect ? (
                <div className="text-green-600 font-semibold text-lg">
                  🎉 To&apos;g&apos;ri! Ajoyib!
                </div>
              ) : (
                <div className="text-red-600 font-semibold text-lg">
                  ❌ Noto&apos;g&apos;ri. To&apos;g&apos;ri javob: <span className="text-green-600">{correctAnswer}</span>
                </div>
              )}
              <button
                onClick={nextQuestion}
                className="mt-4 bg-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:scale-105"
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