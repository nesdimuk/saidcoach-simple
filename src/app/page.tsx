export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            SaidCoach
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Tu coach nutricional personalizado basado en Precision Nutrition
          </p>
          
          <div className="space-y-4">
            <a 
              href="/login" 
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🔐 Acceder con tu Código
            </a>
            <div>
              <a 
                href="/entrenador" 
                className="inline-block text-gray-600 hover:text-gray-800 text-sm underline"
              >
                ¿Eres entrenador? Accede aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
