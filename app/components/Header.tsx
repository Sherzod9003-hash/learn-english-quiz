'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '../lib/auth';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-3xl">📚</div>
            <div>
              <h1 className="text-xl font-bold text-indigo-900">Learn English</h1>
              <p className="text-xs text-gray-500">Ingliz tilini o&apos;rganing</p>
            </div>
          </Link>
          
          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <>
                <div className="text-sm">
                  <span className="text-gray-600">Salom, </span>
                  <span className="font-semibold text-indigo-900">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-all"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg font-semibold text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
