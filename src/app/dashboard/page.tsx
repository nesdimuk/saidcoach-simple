'use client';

import { useState, useEffect } from 'react';
import { calculatePersonalizedNutrition } from '@/lib/metabolismCalculator';

interface UserData {
  name: string;
  age: number | '';
  weight: number | '';
  height: number | '';
  gender: 'MALE' | 'FEMALE' | '';
  activity: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE' | '';
  goal: 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN' | '';
  preference: 'carbohidratos' | 'grasas' | 'equilibrado' | '';
}

interface NutritionResult {
  tmb: number;
  tdee: number;
  targetCalories: number;
  dailyPortions: {
    P: number;
    C: number;
    G: number;
    V: number;
    ranges?: {
      P: [number, number];
      C: [number, number];
      G: [number, number];
      V: [number, number];
    };
  };
  mealDistribution: unknown;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activity: '',
    goal: '',
    preference: ''
  });

  const [result, setResult] = useState<NutritionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadUserData = async () => {
      const activeUserCode = localStorage.getItem('active-user-code');
      if (!activeUserCode) {
        return;
      }

      try {
        // Intentar cargar desde la API primero
        const response = await fetch(`/api/user-profile?userCode=${activeUserCode}`);
        const data = await response.json();
        
        if (data.profile) {
          // Convertir el perfil guardado al formato del formulario
          const profile = data.profile;
          
          setUserData({
            name: profile.name || '',
            age: profile.age || '',
            weight: profile.weight || '',
            height: profile.height || '',
            gender: profile.gender || '',
            activity: profile.activity || '',
            goal: profile.goal || '',
            preference: profile.preference || ''
          });
          
          // Si tenemos todos los datos, calcular el plan automáticamente
          if (profile.name && profile.age && profile.weight && profile.height) {
            const nutrition = calculatePersonalizedNutrition({
              name: profile.name,
              age: profile.age,
              weight: profile.weight,
              height: profile.height,
              gender: profile.gender,
              activity: profile.activity,
              goal: profile.goal,
              preference: profile.preference
            });
            setResult(nutrition as NutritionResult);
            setIsEditingProfile(false);
          } else {
            setIsEditingProfile(true); // Mostrar formulario si faltan datos
          }
        } else {
          setIsEditingProfile(true); // Nuevo usuario
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        setIsEditingProfile(true);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' ? 
        (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nutrition = calculatePersonalizedNutrition(userData as Required<UserData>);
      setResult(nutrition as NutritionResult);
      
      // Obtener código de usuario activo
      const activeUserCode = localStorage.getItem('active-user-code');
      if (!activeUserCode) {
        alert('Error: No se encontró código de usuario. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      // Guardar perfil completo de usuario incluyendo datos básicos
      const userProfile = {
        name: userData.name,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender,
        goal: userData.goal,
        activity: userData.activity,
        preference: userData.preference
      };
      
      // Verificar si es un nuevo usuario (perfil diferente)
      const profileResponse = await fetch(`/api/user-profile?userCode=${activeUserCode}`);
      const profileData = await profileResponse.json();
      const savedProfile = profileData.profile;
      const isNewUser = !savedProfile || JSON.stringify(savedProfile) !== JSON.stringify(userProfile);
      
      // Guardar perfil en la base de datos
      await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode: activeUserCode, profile: userProfile })
      });
      
      // También mantener en localStorage como backup local
      localStorage.setItem(`user-profile-${activeUserCode}`, JSON.stringify(userProfile));
      
      // Si es un nuevo usuario, limpiar objetivos personalizados anteriores
      if (isNewUser) {
        localStorage.removeItem(`daily-goals-${activeUserCode}`);
        console.log('Nuevo usuario detectado - objetivos reseteados');
      }
      
      setIsEditingProfile(false);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al calcular el plan nutricional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard SaidCoach</h1>
          <p className="text-gray-600">Calcula tu plan nutricional personalizado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Datos Personales</h2>
              {result && !isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
            
            {!result || isEditingProfile ? (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={userData.age}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={userData.weight}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={userData.height}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Género
                </label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="MALE">Hombre</option>
                  <option value="FEMALE">Mujer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nivel de Actividad
                </label>
                <select
                  name="activity"
                  value={userData.activity}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="SEDENTARY">Sedentario</option>
                  <option value="LIGHT">Ligero (1-3 días/semana)</option>
                  <option value="MODERATE">Moderado (3-5 días/semana)</option>
                  <option value="ACTIVE">Activo (6-7 días/semana)</option>
                  <option value="VERY_ACTIVE">Muy Activo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Objetivo
                </label>
                <select
                  name="goal"
                  value={userData.goal}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="WEIGHT_LOSS">Pérdida de Peso</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="MUSCLE_GAIN">Ganancia Muscular</option>
                </select>
              </div>

              {/* Preferencia Alimentaria */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ¿Qué prefieres comer más?
                </label>
                <select
                  name="preference"
                  value={userData.preference}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="carbohidratos">Más Carbohidratos (arroz, pasta, pan)</option>
                  <option value="grasas">Más Grasas (aguacate, frutos secos, aceites)</option>
                  <option value="equilibrado">Equilibrado (de todo por igual)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Calculando...' : 'Calcular Plan Personalizado'}
              </button>
            </form>
            ) : (
              <div className="space-y-4 text-gray-900">
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Nombre:</strong> <span className="font-medium">{userData.name}</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Edad:</strong> <span className="font-medium">{userData.age} años</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Peso:</strong> <span className="font-medium">{userData.weight} kg</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Altura:</strong> <span className="font-medium">{userData.height} cm</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Género:</strong> <span className="font-medium">{userData.gender === 'MALE' ? 'Hombre' : 'Mujer'}</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Actividad:</strong> <span className="font-medium">{
                  userData.activity === 'SEDENTARY' ? 'Sedentario' :
                  userData.activity === 'LIGHT' ? 'Ligero' :
                  userData.activity === 'MODERATE' ? 'Moderado' :
                  userData.activity === 'ACTIVE' ? 'Activo' : 'Muy Activo'
                }</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Objetivo:</strong> <span className="font-medium">{
                  userData.goal === 'WEIGHT_LOSS' ? 'Pérdida de Peso' :
                  userData.goal === 'MAINTENANCE' ? 'Mantenimiento' : 'Ganancia Muscular'
                }</span></div>
                <div className="p-3 bg-gray-50 rounded-lg"><strong className="text-gray-800">Preferencia:</strong> <span className="font-medium">{
                  userData.preference === 'carbohidratos' ? 'Más Carbohidratos' :
                  userData.preference === 'grasas' ? 'Más Grasas' : 'Equilibrado'
                }</span></div>
              </div>
            )}
          </div>

          {/* Resultados */}
          {result && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Tu Plan Nutricional</h2>
              
              <div className="space-y-6">
                {/* Métricas principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-800">{result.tmb}</div>
                    <div className="text-sm text-gray-600">TMB (cal/día)</div>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-800">{result.tdee}</div>
                    <div className="text-sm text-gray-600">TDEE (cal/día)</div>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-lg text-center col-span-2">
                    <div className="text-3xl font-bold text-orange-800">{result.targetCalories}</div>
                    <div className="text-sm text-gray-600">Calorías Objetivo</div>
                  </div>
                </div>

                {/* Porciones de mano */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Porciones Diarias (Método de la Mano)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-red-100 rounded-lg">
                      <div className="text-xl font-bold text-red-800">
                        {result.dailyPortions.P}
                      </div>
                      <div className="text-xs text-gray-600">Proteína<br/>(palmas)</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-100 rounded-lg">
                      <div className="text-xl font-bold text-yellow-800">
                        {result.dailyPortions.C}
                      </div>
                      <div className="text-xs text-gray-600">Carbohidratos<br/>(puños)</div>
                    </div>
                    <div className="text-center p-3 bg-purple-100 rounded-lg">
                      <div className="text-xl font-bold text-purple-800">
                        {result.dailyPortions.G}
                      </div>
                      <div className="text-xs text-gray-600">Grasas<br/>(pulgares)</div>
                    </div>
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <div className="text-xl font-bold text-green-800">
                        {result.dailyPortions.V}
                      </div>
                      <div className="text-xs text-gray-600">Verduras<br/>(puños)</div>
                    </div>
                  </div>
                </div>

                {/* Enlace al contador */}
                <div className="mt-6 text-center">
                  <a 
                    href="/dashboard/contador"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Contador de Porciones Diario
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}