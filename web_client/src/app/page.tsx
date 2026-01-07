import { TopicCard } from '@/components/TopicCard';
import { MathDisplay } from '@/components/MathDisplay';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Spaced Repetition Learning
          </h1>
          <p className="text-lg text-gray-600">
            Master calculus with intelligent spaced repetition
          </p>
        </header>

        <main>
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
              Choose a Topic to Practice
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <TopicCard
                id="1"
                name="Chain Rule"
                masteryScore={45}
                onClick={() => console.log('Start Chain Rule quiz')}
              />
            </div>
          </section>

          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
              Sample Math Rendering
            </h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Question Examples:</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <MathDisplay latex="Find the derivative of f(x) = sin(x^2)" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <MathDisplay latex="Find the derivative of f(x) = cos(3x)" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <MathDisplay latex="Find the derivative of f(x) = e^{2x}" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
