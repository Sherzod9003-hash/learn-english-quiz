import Link from 'next/link';
import Header from './components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ingliz tilini o&apos;rganing
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Interaktiv mashqlar va testlar orqali ingliz tilini tez va oson o&apos;rganing. 
            O&apos;zbekcha tushuntirishlar bilan!
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Quiz */}
          <Link href="/quiz">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group border-2 border-transparent hover:border-indigo-300">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <h3 className="text-2xl font-bold mb-3 text-indigo-900">
                So&apos;zlarni yod olish
              </h3>
              <p className="text-gray-600 mb-4">
                350+ so&apos;z bilan interaktiv quiz. Inglizcha-O&apos;zbekcha va aksincha!
              </p>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                <span>Boshlash</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden border-2 border-gray-200">
            <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
              Tez orada
            </div>
            <div className="text-6xl mb-4 opacity-50">
              📖
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-400">
              Grammatika
            </h3>
            <p className="text-gray-400 mb-4">
              Ingliz tili grammatikasi (Ishlab chiqilmoqda)
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">350+</div>
              <div className="text-sm text-gray-600">So&apos;zlar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
              <div className="text-sm text-gray-600">Rejim</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">∞</div>
              <div className="text-sm text-gray-600">Takrorlash</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Bepul</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📚</div>
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-indigo-900">Learn English Platform</div>
                <div>Ingliz tilini oson o&apos;rganing</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © 2024 <span className="font-semibold text-indigo-600">Sherzod Usarov</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
