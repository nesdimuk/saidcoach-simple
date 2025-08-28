'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { calculatePNPortions } from '@/lib/metabolismCalculator';

interface PortionCount {
  P: { [key: string]: number };
  C: { [key: string]: number };
  G: { [key: string]: number };
  V: number;
}

interface DailyWeight {
  weight: number;
  date: string;
  notes?: string;
}

interface DailyGoals {
  P: number;
  C: number;
  G: number;
  V: number;
}

interface UserProfile {
  name: string;
  gender: string;
  goal: string;
  activity: string;
  preference: string;
}

export default function ContadorPorciones() {
  const [portionCount, setPortionCount] = useState<PortionCount>({
    P: { P1: 0, P2: 0, P3: 0 },
    C: { C1: 0, C2: 0, C3: 0 },
    G: { G1: 0, G2: 0, G3: 0 },
    V: 0
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    P: 5,
    C: 4,
    G: 4,
    V: 5
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState<DailyGoals>({
    P: 5,
    C: 4,
    G: 4,
    V: 5
  });

  const [dailyWeight, setDailyWeight] = useState<DailyWeight | null>(null);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState('');
  const [isDayFinished, setIsDayFinished] = useState(false);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    // Obtener código de usuario activo
    const activeUserCode = localStorage.getItem('active-user-code');
    if (!activeUserCode) {
      alert('Error: No se encontró código de usuario. Redirigiendo al login...');
      window.location.href = '/login';
      return;
    }

    const today = new Date().toDateString();
    const savedData = localStorage.getItem(`portions-${activeUserCode}-${today}`);
    const savedGoals = localStorage.getItem(`daily-goals-${activeUserCode}`);
    const savedProfile = localStorage.getItem(`user-profile-${activeUserCode}`);
    const savedWeight = localStorage.getItem(`weight-${activeUserCode}-${today}`);
    const savedFinished = localStorage.getItem(`day-finished-${activeUserCode}-${today}`);
    
    if (savedData) {
      setPortionCount(JSON.parse(savedData));
    }
    
    if (savedWeight) {
      setDailyWeight(JSON.parse(savedWeight));
    }
    
    if (savedFinished) {
      setIsDayFinished(JSON.parse(savedFinished));
    }
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      
      // Calcular objetivos basados en el perfil del usuario
      try {
        const calculatedPortions = calculatePNPortions(profile) as any;
        const calculatedGoals = {
          P: calculatedPortions.P || 5,
          C: calculatedPortions.C || 5,
          G: calculatedPortions.G || 5,
          V: calculatedPortions.V || 5
        };
        
        // Si hay objetivos personalizados guardados, usar esos
        if (savedGoals) {
          setDailyGoals(JSON.parse(savedGoals));
          setTempGoals(JSON.parse(savedGoals));
        } else {
          // Usar objetivos calculados por defecto
          setDailyGoals(calculatedGoals);
          setTempGoals(calculatedGoals);
        }
      } catch (error) {
        console.error('Error calculando porciones:', error);
        // Usar objetivos guardados como fallback
        if (savedGoals) {
          setDailyGoals(JSON.parse(savedGoals));
          setTempGoals(JSON.parse(savedGoals));
        }
      }
    } else if (savedGoals) {
      setDailyGoals(JSON.parse(savedGoals));
      setTempGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Guardar en API y localStorage cada vez que cambia (solo si el día no está finalizado)
  useEffect(() => {
    const activeUserCode = localStorage.getItem('active-user-code');
    if (activeUserCode && !isDayFinished) {
      const today = new Date().toDateString();
      
      // Guardar en localStorage como backup
      localStorage.setItem(`portions-${activeUserCode}-${today}`, JSON.stringify(portionCount));
      
      // Guardar en la base de datos
      fetch('/api/portions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode: activeUserCode,
          date: today,
          portions: portionCount
        })
      }).catch(error => {
        console.error('Error guardando porciones en API:', error);
      });
    }
  }, [portionCount, isDayFinished]);

  const addPortion = (type: 'P' | 'C' | 'G' | 'V', subtype?: string, amount: number = 1) => {
    setPortionCount(prev => {
      const newCount = { ...prev };
      
      if (type === 'V') {
        newCount.V = Math.min(newCount.V + amount, 15); // máximo 15
      } else if (subtype) {
        newCount[type] = {
          ...newCount[type],
          [subtype]: Math.min(newCount[type][subtype] + amount, 10) // máximo 10 por subtipo
        };
      }
      
      return newCount;
    });
  };

  const removePortion = (type: 'P' | 'C' | 'G' | 'V', subtype?: string, amount: number = 1) => {
    setPortionCount(prev => {
      const newCount = { ...prev };
      
      if (type === 'V') {
        newCount.V = Math.max(newCount.V - amount, 0);
      } else if (subtype) {
        newCount[type] = {
          ...newCount[type],
          [subtype]: Math.max(newCount[type][subtype] - amount, 0)
        };
      }
      
      return newCount;
    });
  };

  const getTotalPortions = (type: 'P' | 'C' | 'G') => {
    return Object.values(portionCount[type]).reduce((sum, count) => sum + count, 0);
  };

  const getProgressColor = (current: number, goal: number) => {
    if (current >= goal) return 'text-green-600';
    if (current >= goal * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PortionButton = ({ 
    type, 
    subtype, 
    count, 
    icon 
  }: { 
    type: 'P' | 'C' | 'G' | 'V', 
    subtype?: string, 
    count: number, 
    icon: string 
  }) => (
    <div className={`flex flex-col items-center space-y-3 p-3 rounded-lg ${isDayFinished ? 'bg-gray-50 opacity-60' : 'bg-gray-100'}`}>
      {/* Ícono principal - Click para +1 porción */}
      <div className="relative">
        <button
          onClick={() => !isDayFinished && addPortion(type, subtype, 1)}
          className={`transition-transform ${isDayFinished ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          disabled={isDayFinished}
        >
          <Image 
            src={`/icons/${icon}.png`} 
            alt={icon}
            width={50}
            height={50}
            className={`w-12 h-12 ${isDayFinished ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
        </button>
        {count > 0 && (
          <div className={`absolute -top-2 -right-2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium ${isDayFinished ? 'bg-gray-400' : 'bg-blue-600'}`}>
            {count % 1 === 0 ? count : count.toFixed(1)}
          </div>
        )}
      </div>
      
      {/* Controles secundarios */}
      {!isDayFinished && (
        <div className="flex items-center justify-center gap-2">
          {/* Media porción (solo para P y C) */}
          {(type === 'P' || type === 'C') && (
            <button
              onClick={() => addPortion(type, subtype, 0.5)}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-md text-xs font-medium transition-colors"
              title="Agregar media porción"
            >
              +0.5
            </button>
          )}
          
          {/* Botón deshacer */}
          {count > 0 && (
            <button
              onClick={() => removePortion(type, subtype, count >= 1 ? 1 : 0.5)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 rounded-md text-sm transition-colors"
              title="Deshacer última acción"
            >
              ↶
            </button>
          )}
        </div>
      )}
    </div>
  );

  const resetDay = () => {
    setPortionCount({
      P: { P1: 0, P2: 0, P3: 0 },
      C: { C1: 0, C2: 0, C3: 0 },
      G: { G1: 0, G2: 0, G3: 0 },
      V: 0
    });
    setIsDayFinished(false);
    
    // Limpiar también del localStorage
    const activeUserCode = localStorage.getItem('active-user-code');
    const today = new Date().toDateString();
    if (activeUserCode) {
      localStorage.removeItem(`day-finished-${activeUserCode}-${today}`);
    }
  };

  const finishDay = async () => {
    const confirmed = confirm(
      '¿Finalizar y guardar este día?\n\n' +
      'Se guardará en tu historial personal\n' +
      'Aparecerá en los reportes para tu coach\n' +
      '🔒 Se marcará como día completado\n\n' +
      '💡 Después podrás usar "Editar Día" o "Reiniciar Día".'
    );
    
    if (!confirmed) return;
    
    const activeUserCode = localStorage.getItem('active-user-code');
    const today = new Date().toDateString();
    
    if (activeUserCode) {
      try {
        // Marcar día como finalizado
        setIsDayFinished(true);
        localStorage.setItem(`day-finished-${activeUserCode}-${today}`, JSON.stringify(true));
        
        // Guardar estado final en la base de datos
        await fetch('/api/portions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode: activeUserCode,
            date: today,
            portions: portionCount,
            isFinished: true
          })
        });
        
        // Ya no reseteamos automáticamente - el usuario puede ver sus datos finalizados
        alert('Día guardado en tu historial.\n\nUsa "Editar Día" si necesitas cambios o "Reiniciar Día" para empezar mañana.');
        
      } catch (error) {
        console.error('Error finalizando el día:', error);
        alert('Error al finalizar el día. Inténtalo nuevamente.');
        setIsDayFinished(false);
        localStorage.removeItem(`day-finished-${activeUserCode}-${today}`);
      }
    }
  };


  const handleEditGoals = () => {
    setIsEditingGoals(true);
  };

  const handleSaveGoals = async () => {
    const activeUserCode = localStorage.getItem('active-user-code');
    if (activeUserCode) {
      setDailyGoals(tempGoals);
      
      // Guardar en localStorage como backup
      localStorage.setItem(`daily-goals-${activeUserCode}`, JSON.stringify(tempGoals));
      
      // Guardar en la base de datos
      try {
        await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode: activeUserCode,
            goals: tempGoals
          })
        });
      } catch (error) {
        console.error('Error guardando objetivos en API:', error);
      }
      
      setIsEditingGoals(false);
    }
  };

  const handleCancelEdit = () => {
    setTempGoals(dailyGoals);
    setIsEditingGoals(false);
  };

  const updateTempGoal = (macro: keyof DailyGoals, value: number) => {
    setTempGoals(prev => ({
      ...prev,
      [macro]: Math.max(1, Math.min(15, value)) // Entre 1 y 15
    }));
  };

  const handleEditWeight = () => {
    setTempWeight(dailyWeight?.weight.toString() || '');
    setIsEditingWeight(true);
  };

  const handleSaveWeight = async () => {
    const activeUserCode = localStorage.getItem('active-user-code');
    const weight = parseFloat(tempWeight);
    if (weight && weight > 0 && activeUserCode) {
      const today = new Date().toDateString();
      const weightData: DailyWeight = {
        weight: weight,
        date: today,
        notes: ''
      };
      
      setDailyWeight(weightData);
      
      // Guardar en localStorage como backup
      localStorage.setItem(`weight-${activeUserCode}-${today}`, JSON.stringify(weightData));
      
      // Guardar en la base de datos
      try {
        await fetch('/api/weight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode: activeUserCode,
            date: today,
            weight: weightData
          })
        });
      } catch (error) {
        console.error('Error guardando peso en API:', error);
      }
      
      setIsEditingWeight(false);
      setTempWeight('');
    }
  };

  const handleCancelWeight = () => {
    setTempWeight('');
    setIsEditingWeight(false);
  };

  // Calcular porcentajes de calidad nutricional
  const calculateQualityPercentages = () => {
    const totalPortions = getTotalPortions('P') + getTotalPortions('C') + getTotalPortions('G');
    
    if (totalPortions === 0) {
      return { comerMas: 0, comerOcasionalmente: 0, comerMenos: 0 };
    }

    const comerMas = portionCount.P.P1 + portionCount.C.C1 + portionCount.G.G1;
    const comerOcasionalmente = portionCount.P.P2 + portionCount.C.C2 + portionCount.G.G2;
    const comerMenos = portionCount.P.P3 + portionCount.C.C3 + portionCount.G.G3;

    return {
      comerMas: Math.round((comerMas / totalPortions) * 100),
      comerOcasionalmente: Math.round((comerOcasionalmente / totalPortions) * 100),
      comerMenos: Math.round((comerMenos / totalPortions) * 100)
    };
  };

  const qualityPercentages = calculateQualityPercentages();

  const handleChangeUser = () => {
    const confirmed = confirm('¿Estás seguro? Esto cerrará la sesión del usuario actual y te llevará al login para acceder con otro código.');
    
    if (confirmed) {
      // Limpiar código de usuario activo
      localStorage.removeItem('active-user-code');
      
      // Resetear estado
      setUserProfile(null);
      setDailyGoals({ P: 5, C: 4, G: 4, V: 5 });
      setTempGoals({ P: 5, C: 4, G: 4, V: 5 });
      
      // Redirigir al login
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contador de Porciones</h1>
          <p className="text-gray-600">Rastrea tus porciones diarias del método PN</p>
        </div>

        {/* Resumen diario */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Progreso del Día</h2>
            {userProfile && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEditGoals}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Personalizar Objetivos
                </button>
                <button
                  onClick={handleChangeUser}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                >
                  👤 Cambiar Usuario
                </button>
              </div>
            )}
          </div>
          
          {userProfile && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-800">
                Calculado para: <strong>{userProfile.name}</strong> - {userProfile.gender === 'MALE' ? 'Hombre' : 'Mujer'}, 
                {' '}{userProfile.goal === 'WEIGHT_LOSS' ? 'Pérdida de peso' : userProfile.goal === 'MAINTENANCE' ? 'Mantenimiento' : 'Ganancia muscular'}, 
                {' '}{userProfile.activity === 'SEDENTARY' ? 'sedentario' : 
                      userProfile.activity === 'LIGHT' ? 'ligero' :
                      userProfile.activity === 'MODERATE' ? 'moderado' :
                      userProfile.activity === 'ACTIVE' ? 'activo' : 'muy activo'}, 
                {' '}prefiere {userProfile.preference}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="text-center py-2">
              <div className={`text-xl sm:text-2xl font-bold ${getProgressColor(getTotalPortions('P'), dailyGoals.P)}`}>
                {getTotalPortions('P') % 1 === 0 ? getTotalPortions('P') : getTotalPortions('P').toFixed(1)}/{dailyGoals.P}
              </div>
              <div className="text-sm text-gray-800">Proteína</div>
            </div>
            <div className="text-center py-2">
              <div className={`text-xl sm:text-2xl font-bold ${getProgressColor(getTotalPortions('C'), dailyGoals.C)}`}>
                {getTotalPortions('C') % 1 === 0 ? getTotalPortions('C') : getTotalPortions('C').toFixed(1)}/{dailyGoals.C}
              </div>
              <div className="text-xs sm:text-sm text-gray-800">Carbohidratos</div>
            </div>
            <div className="text-center py-2">
              <div className={`text-xl sm:text-2xl font-bold ${getProgressColor(getTotalPortions('G'), dailyGoals.G)}`}>
                {getTotalPortions('G') % 1 === 0 ? getTotalPortions('G') : getTotalPortions('G').toFixed(1)}/{dailyGoals.G}
              </div>
              <div className="text-sm text-gray-800">Grasas</div>
            </div>
            <div className="text-center py-2">
              <div className={`text-xl sm:text-2xl font-bold ${getProgressColor(portionCount.V, dailyGoals.V)}`}>
                {portionCount.V % 1 === 0 ? portionCount.V : portionCount.V.toFixed(1)}/{dailyGoals.V}
              </div>
              <div className="text-sm text-gray-800">Verduras</div>
            </div>
            <div className="text-center py-2">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                {dailyWeight ? `${dailyWeight.weight} kg` : '- kg'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="hidden sm:inline">Peso Hoy</span><span className="sm:hidden">Peso</span>
                <button
                  onClick={handleEditWeight}
                  className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Calidad Nutricional */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Calidad Nutricional del Día</h2>
          <p className="text-gray-700 text-sm mb-6">
            Distribución según categorías de Precision Nutrition
          </p>
          
          {/* Barra de progreso visual */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Calidad de alimentos consumidos</span>
              <span className="text-sm text-gray-900">
                {getTotalPortions('P') + getTotalPortions('C') + getTotalPortions('G')} porciones totales
              </span>
            </div>
            
            {/* Barra de progreso tricolor */}
            <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
              <div 
                className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${qualityPercentages.comerMas}%` }}
              >
                {qualityPercentages.comerMas > 10 && `${qualityPercentages.comerMas}%`}
              </div>
              <div 
                className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${qualityPercentages.comerOcasionalmente}%` }}
              >
                {qualityPercentages.comerOcasionalmente > 10 && `${qualityPercentages.comerOcasionalmente}%`}
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${qualityPercentages.comerMenos}%` }}
              >
                {qualityPercentages.comerMenos > 10 && `${qualityPercentages.comerMenos}%`}
              </div>
            </div>
          </div>

          {/* Leyenda y estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center py-2">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Comer Más</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {qualityPercentages.comerMas}%
              </div>
              <div className="text-xs text-gray-800 mt-1">
                P1: {portionCount.P.P1} | C1: {portionCount.C.C1} | G1: {portionCount.G.G1}
              </div>
            </div>
            
            <div className="text-center py-2">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Comer Ocasionalmente</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {qualityPercentages.comerOcasionalmente}%
              </div>
              <div className="text-xs text-gray-800 mt-1">
                P2: {portionCount.P.P2} | C2: {portionCount.C.C2} | G2: {portionCount.G.G2}
              </div>
            </div>
            
            <div className="text-center py-2">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-900">Comer Menos</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {qualityPercentages.comerMenos}%
              </div>
              <div className="text-xs text-gray-800 mt-1">
                P3: {portionCount.P.P3} | C3: {portionCount.C.C3} | G3: {portionCount.G.G3}
              </div>
            </div>
          </div>

          {/* Mensaje motivacional */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-900">
              {qualityPercentages.comerMas >= 70 ? (
                <span className="text-green-700 font-medium">
                  ¡Excelente! Más del 70% de tus alimentos son de alta calidad.
                </span>
              ) : qualityPercentages.comerMas >= 50 ? (
                <span className="text-yellow-700 font-medium">
                  Buen trabajo. Trata de aumentar los alimentos &quot;Comer Más&quot; (P1, C1, G1).
                </span>
              ) : (
                <span className="text-red-700 font-medium">
                  Oportunidad de mejora. Intenta elegir más alimentos de alta calidad (P1, C1, G1).
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contador por categorías */}
        <div className="space-y-6">
          {/* Proteínas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Proteínas (Palmas)</h3>
            <div className="grid grid-cols-3 gap-4">
              <PortionButton 
                type="P" 
                subtype="P1" 
                count={portionCount.P.P1} 
                icon="P1" 
              />
              <PortionButton 
                type="P" 
                subtype="P2" 
                count={portionCount.P.P2} 
                icon="P2" 
              />
              <PortionButton 
                type="P" 
                subtype="P3" 
                count={portionCount.P.P3} 
                icon="P3" 
              />
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-600">✊ Carbohidratos (Puños)</h3>
            <div className="grid grid-cols-3 gap-4">
              <PortionButton 
                type="C" 
                subtype="C1" 
                count={portionCount.C.C1} 
                icon="C1" 
              />
              <PortionButton 
                type="C" 
                subtype="C2" 
                count={portionCount.C.C2} 
                icon="C2" 
              />
              <PortionButton 
                type="C" 
                subtype="C3" 
                count={portionCount.C.C3} 
                icon="C3" 
              />
            </div>
          </div>

          {/* Grasas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">Grasas (Pulgares)</h3>
            <div className="grid grid-cols-3 gap-4">
              <PortionButton 
                type="G" 
                subtype="G1" 
                count={portionCount.G.G1} 
                icon="G1" 
              />
              <PortionButton 
                type="G" 
                subtype="G2" 
                count={portionCount.G.G2} 
                icon="G2" 
              />
              <PortionButton 
                type="G" 
                subtype="G3" 
                count={portionCount.G.G3} 
                icon="G3" 
              />
            </div>
          </div>

          {/* Verduras */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600">✊ Verduras (Puños)</h3>
            <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
              <PortionButton 
                type="V" 
                count={portionCount.V} 
                icon="V" 
              />
            </div>
          </div>
        </div>

        {/* Estado del día */}
        {isDayFinished && (
          <div className="mt-8 mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <div className="text-green-800 font-semibold mb-2">
              Día Finalizado y Guardado
            </div>
            <div className="text-green-700 text-sm mb-3">
              Este día está registrado en tu historial con los datos que ves arriba. 
            </div>
            <div className="text-green-600 text-xs">
              💡 Ve al "Historial" para editarlo o usa "Reiniciar Día" para empezar mañana
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-8 text-center space-x-4 flex flex-wrap justify-center gap-4">
          {!isDayFinished ? (
            <button
              onClick={finishDay}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Finalizar Día
            </button>
          ) : (
            <button
              onClick={resetDay}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Reiniciar Día
            </button>
          )}
          
          {userProfile && (
            <a 
              href="/dashboard/reportes"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📚 Historial
            </a>
          )}
          
          <a 
            href="/dashboard"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Volver al Dashboard
          </a>
        </div>
        
        {/* Modal de edición de objetivos */}
        {isEditingGoals && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Personalizar Objetivos</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Proteína (palmas):</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateTempGoal('P', tempGoals.P - 1)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{tempGoals.P}</span>
                    <button
                      onClick={() => updateTempGoal('P', tempGoals.P + 1)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Carbohidratos (puños):</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateTempGoal('C', tempGoals.C - 1)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{tempGoals.C}</span>
                    <button
                      onClick={() => updateTempGoal('C', tempGoals.C + 1)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Grasas (pulgares):</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateTempGoal('G', tempGoals.G - 1)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{tempGoals.G}</span>
                    <button
                      onClick={() => updateTempGoal('G', tempGoals.G + 1)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Verduras (puños):</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateTempGoal('V', tempGoals.V - 1)}
                      className="bg-red-500 text-white w-8 h-8 rounded-full text-sm hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{tempGoals.V}</span>
                    <button
                      onClick={() => updateTempGoal('V', tempGoals.V + 1)}
                      className="bg-green-500 text-white w-8 h-8 rounded-full text-sm hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveGoals}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de edición de peso */}
        {isEditingWeight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Registrar Peso del Día</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 70.5"
                    autoFocus
                  />
                </div>
                
                <div className="text-xs text-gray-700">
                  💡 Tip: Pésate en ayunas, sin ropa, después de ir al baño
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveWeight}
                  disabled={!tempWeight || parseFloat(tempWeight) <= 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Guardar Peso
                </button>
                <button
                  onClick={handleCancelWeight}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}