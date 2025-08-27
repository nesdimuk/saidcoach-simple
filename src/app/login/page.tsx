'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [userCode, setUserCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!userCode.trim()) {
        setError('Por favor ingresa tu código de usuario');
        return;
      }

      // Validar formato básico del código
      if (userCode.length < 3) {
        setError('El código debe tener al menos 3 caracteres');
        return;
      }

      // Guardar el código de usuario activo
      localStorage.setItem('active-user-code', userCode.toUpperCase());
      
      // Verificar si el usuario ya tiene perfil
      const existingProfile = localStorage.getItem(`user-profile-${userCode.toUpperCase()}`);
      
      if (existingProfile) {
        // Usuario existente - ir al contador
        router.push('/dashboard/contador');
      } else {
        // Usuario nuevo - ir al dashboard para configurar perfil
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error al acceder. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">SaidCoach</h1>
            <p className="text-gray-600">Precision Nutrition Tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Usuario
              </label>
              <input
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono uppercase"
                placeholder="Ej: SAID-ANA-2024"
                required
                autoFocus
              />
              <p className="text-xs text-gray-700 mt-1">
                Ingresa el código que te proporcionó tu entrenador
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Accediendo...' : '🔐 Acceder'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-2">¿Eres entrenador?</p>
              <button
                onClick={() => router.push('/entrenador')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Acceso para Entrenadores
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-700">
            Sistema de seguimiento nutricional basado en Precision Nutrition
          </p>
        </div>
      </div>
    </div>
  );
}