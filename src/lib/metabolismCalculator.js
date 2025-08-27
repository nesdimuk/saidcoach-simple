/**
 * Calculadora de metabolismo basada en Precision Nutrition
 * Implementa las fórmulas exactas del manual para TMB y TDEE
 */

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando las fórmulas de Precision Nutrition
 * @param {Object} user - Datos del usuario
 * @param {number} user.weight - Peso en kg
 * @param {number} user.height - Altura en cm
 * @param {number} user.age - Edad en años
 * @param {string} user.gender - 'MALE' o 'FEMALE'
 * @returns {number} TMB en calorías por día
 */
export function calculateTMB(user) {
  const { weight, height, age, gender } = user;
  
  if (!weight || !height || !age || !gender) {
    throw new Error('Datos insuficientes para calcular TMB');
  }

  let tmb;
  
  if (gender === 'MALE') {
    // Hombres: TMB = 88.362 + (13.397 × peso en kg) + (4.799 × altura en cm) - (5.677 × edad)
    tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    // Mujeres: TMB = 447.593 + (9.247 × peso en kg) + (3.098 × altura en cm) - (4.330 × edad)
    tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  return Math.round(tmb);
}

/**
 * Calcula el Gasto Energético Total Diario (TDEE)
 * @param {number} tmb - Tasa Metabólica Basal
 * @param {string} activityLevel - Nivel de actividad del usuario
 * @returns {number} TDEE en calorías por día
 */
export function calculateTDEE(tmb, activityLevel) {
  const activityMultipliers = {
    'SEDENTARY': 1.2,      // Sedentario: poco o ningún ejercicio
    'LIGHT': 1.375,        // Ligero: ejercicio ligero 1-3 días/semana
    'MODERATE': 1.55,      // Moderado: ejercicio moderado 3-5 días/semana
    'ACTIVE': 1.725,       // Activo: ejercicio intenso 6-7 días/semana
    'VERY_ACTIVE': 1.9     // Muy activo: ejercicio muy intenso, trabajo físico
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(tmb * multiplier);
}

/**
 * Ajusta las calorías según el objetivo del usuario
 * @param {number} tdee - Gasto energético total diario
 * @param {string} goal - Objetivo: 'WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN'
 * @returns {number} Calorías objetivo ajustadas
 */
export function adjustCaloriesForGoal(tdee, goal) {
  const goalAdjustments = {
    'WEIGHT_LOSS': 0.8,    // -20% para pérdida de peso
    'MAINTENANCE': 1.0,     // Sin cambio para mantenimiento
    'MUSCLE_GAIN': 1.15    // +15% para ganancia muscular
  };

  const adjustment = goalAdjustments[goal] || 1.0;
  return Math.round(tdee * adjustment);
}

/**
 * Calcula las porciones de mano según género y objetivo calórico
 * Basado en las tablas de equivalencias del manual PN
 * @param {Object} user - Datos del usuario
 * @param {number} targetCalories - Calorías objetivo
 * @returns {Object} Porciones calculadas {P, C, G, V}
 */
export function calculatePNPortions(user) {
  const { gender, goal, activity, preference } = user;
  
  // Tabla de porciones exactas basada en Precision Nutrition
  const tablaPorciones = {
    FEMALE: {
      WEIGHT_LOSS: {
        carbohidratos: {
          SEDENTARY: [4, 4, 4, [4, 6]],
          LIGHT: [4, 5, 4, [4, 6]],
          MODERATE: [4, 6, 4, [4, 6]],
          ACTIVE: [5, 7, 4, [4, 6]],
          VERY_ACTIVE: [6, 8, 4, [4, 6]]
        },
        grasas: {
          SEDENTARY: [4, 4, 4, [4, 6]],
          LIGHT: [4, 4, 5, [4, 6]],
          MODERATE: [4, 4, 6, [4, 6]],
          ACTIVE: [5, 4, 7, [4, 6]],
          VERY_ACTIVE: [6, 4, 8, [4, 6]]
        },
        equilibrado: {
          SEDENTARY: [4, 4, 4, [4, 6]],
          LIGHT: [4, 4, 4, [4, 6]],
          MODERATE: [4, 5, 5, [4, 6]],
          ACTIVE: [5, 5, 5, [4, 6]],
          VERY_ACTIVE: [6, 6, 6, [4, 6]]
        }
      },
      MAINTENANCE: {
        carbohidratos: {
          SEDENTARY: [5, 5, 4, [4, 6]],
          LIGHT: [5, 6, 4, [4, 6]],
          MODERATE: [5, 6, 4, [4, 6]],
          ACTIVE: [6, 7, 4, [4, 6]],
          VERY_ACTIVE: [6, 8, 5, [4, 6]]
        },
        grasas: {
          SEDENTARY: [5, 4, 5, [4, 6]],
          LIGHT: [5, 4, 6, [4, 6]],
          MODERATE: [5, 4, 6, [4, 6]],
          ACTIVE: [6, 4, 6, [4, 6]],
          VERY_ACTIVE: [6, 5, 8, [4, 6]]
        },
        equilibrado: {
          SEDENTARY: [5, 4, 4, [4, 6]],
          LIGHT: [5, 5, 5, [4, 6]],
          MODERATE: [5, 5, 5, [4, 6]],
          ACTIVE: [6, 5, 5, [4, 6]],
          VERY_ACTIVE: [6, 6, 6, [4, 6]]
        }
      },
      MUSCLE_GAIN: {
        carbohidratos: {
          SEDENTARY: [5, 6, 4, [4, 6]],
          LIGHT: [5, 7, 4, [4, 6]],
          MODERATE: [6, 8, 4, [4, 6]],
          ACTIVE: [6, 8, 5, [4, 6]],
          VERY_ACTIVE: [6, 8, 5, [4, 6]]
        },
        grasas: {
          SEDENTARY: [5, 5, 5, [4, 6]],
          LIGHT: [5, 5, 6, [4, 6]],
          MODERATE: [6, 5, 6, [4, 6]],
          ACTIVE: [6, 6, 6, [4, 6]],
          VERY_ACTIVE: [6, 6, 6, [4, 6]]
        },
        equilibrado: {
          SEDENTARY: [5, 5, 4, [4, 6]],
          LIGHT: [5, 6, 5, [4, 6]],
          MODERATE: [6, 6, 5, [4, 6]],
          ACTIVE: [6, 7, 5, [4, 6]],
          VERY_ACTIVE: [6, 7, 5, [4, 6]]
        }
      }
    },
    MALE: {
      WEIGHT_LOSS: {
        carbohidratos: {
          SEDENTARY: [6, 6, 6, [6, 8]],
          LIGHT: [6, 7, 6, [6, 8]],
          MODERATE: [6, 8, 6, [6, 8]],
          ACTIVE: [7, 9, 6, [6, 8]],
          VERY_ACTIVE: [8, 10, 6, [6, 8]]
        },
        grasas: {
          SEDENTARY: [6, 6, 6, [6, 8]],
          LIGHT: [6, 6, 7, [6, 8]],
          MODERATE: [6, 6, 8, [6, 8]],
          ACTIVE: [7, 6, 8, [6, 8]],
          VERY_ACTIVE: [8, 6, 8, [6, 8]]
        },
        equilibrado: {
          SEDENTARY: [6, 6, 6, [6, 8]],
          LIGHT: [6, 6, 6, [6, 8]],
          MODERATE: [6, 7, 7, [6, 8]],
          ACTIVE: [7, 7, 7, [6, 8]],
          VERY_ACTIVE: [8, 8, 8, [6, 8]]
        }
      },
      MAINTENANCE: {
        carbohidratos: {
          SEDENTARY: [7, 7, 6, [6, 8]],
          LIGHT: [7, 8, 6, [6, 8]],
          MODERATE: [7, 8, 6, [6, 8]],
          ACTIVE: [8, 9, 6, [6, 8]],
          VERY_ACTIVE: [8, 10, 7, [6, 8]]
        },
        grasas: {
          SEDENTARY: [7, 6, 7, [6, 8]],
          LIGHT: [7, 6, 8, [6, 8]],
          MODERATE: [7, 6, 8, [6, 8]],
          ACTIVE: [8, 7, 8, [6, 8]],
          VERY_ACTIVE: [8, 8, 8, [6, 8]]
        },
        equilibrado: {
          SEDENTARY: [7, 6, 6, [6, 8]],
          LIGHT: [7, 7, 7, [6, 8]],
          MODERATE: [7, 7, 7, [6, 8]],
          ACTIVE: [8, 8, 8, [6, 8]],
          VERY_ACTIVE: [8, 8, 8, [6, 8]]
        }
      },
      MUSCLE_GAIN: {
        carbohidratos: {
          SEDENTARY: [7, 8, 6, [6, 8]],
          LIGHT: [7, 9, 6, [6, 8]],
          MODERATE: [8, 10, 6, [6, 8]],
          ACTIVE: [8, 10, 7, [6, 8]],
          VERY_ACTIVE: [8, 10, 7, [6, 8]]
        },
        grasas: {
          SEDENTARY: [7, 7, 7, [6, 8]],
          LIGHT: [7, 7, 8, [6, 8]],
          MODERATE: [8, 7, 8, [6, 8]],
          ACTIVE: [8, 8, 8, [6, 8]],
          VERY_ACTIVE: [8, 8, 8, [6, 8]]
        },
        equilibrado: {
          SEDENTARY: [7, 7, 6, [6, 8]],
          LIGHT: [7, 8, 7, [6, 8]],
          MODERATE: [8, 8, 7, [6, 8]],
          ACTIVE: [8, 9, 8, [6, 8]],
          VERY_ACTIVE: [8, 9, 8, [6, 8]]
        }
      }
    }
  };

  // Normalizar inputs
  const genderKey = gender || 'FEMALE';
  const goalKey = goal || 'MAINTENANCE';
  const activityKey = activity || 'SEDENTARY';
  const preferenceKey = preference || 'equilibrado';

  // Validar que existan los valores
  if (!tablaPorciones[genderKey] || 
      !tablaPorciones[genderKey][goalKey] ||
      !tablaPorciones[genderKey][goalKey][preferenceKey] ||
      !tablaPorciones[genderKey][goalKey][preferenceKey][activityKey]) {
    
    // Fallback a valores base seguros
    const fallback = genderKey === 'MALE' ? [6, 6, 6, [6, 8]] : [4, 4, 4, [4, 6]];
    return {
      P: fallback[0],
      C: fallback[1], 
      G: fallback[2],
      V: Math.round((fallback[3][0] + fallback[3][1]) / 2)
    };
  }

  // Obtener las porciones exactas
  const porciones = tablaPorciones[genderKey][goalKey][preferenceKey][activityKey];

  return {
    P: porciones[0],
    C: porciones[1],
    G: porciones[2],
    V: Math.round((porciones[3][0] + porciones[3][1]) / 2) // Promedio del rango de verduras
  };
}

// Función legacy para compatibilidad
export function calculateHandPortions(user, targetCalories) {
  // Usar el nuevo algoritmo inteligente con preferencias normales
  const smartPortions = calculateSmartPortions(user, {});
  
  // Convertir a formato de rangos para mostrar en UI
  const ranges = {
    P: [smartPortions.P, smartPortions.P + 2],
    C: [smartPortions.C, smartPortions.C + 2], 
    G: [smartPortions.G, smartPortions.G + 2],
    V: [smartPortions.V, smartPortions.V + 2]
  };

  return {
    ...smartPortions,
    ranges
  };
}

/**
 * Distribuye las porciones diarias entre comidas
 * @param {Object} dailyPortions - Porciones totales del día {P, C, G, V}
 * @returns {Object} Distribución por comida
 */
export function distributeMealPortions(dailyPortions) {
  return {
    DESAYUNO: {
      P: Math.round(dailyPortions.P * 0.25 * 10) / 10,
      C: Math.round(dailyPortions.C * 0.30 * 10) / 10,
      G: Math.round(dailyPortions.G * 0.25 * 10) / 10,
      V: Math.round(dailyPortions.V * 0.15 * 10) / 10
    },
    COLACION_AM: {
      P: Math.round(dailyPortions.P * 0.15 * 10) / 10,
      C: Math.round(dailyPortions.C * 0.15 * 10) / 10,
      G: Math.round(dailyPortions.G * 0.15 * 10) / 10,
      V: Math.round(dailyPortions.V * 0.10 * 10) / 10
    },
    ALMUERZO: {
      P: Math.round(dailyPortions.P * 0.35 * 10) / 10,
      C: Math.round(dailyPortions.C * 0.35 * 10) / 10,
      G: Math.round(dailyPortions.G * 0.35 * 10) / 10,
      V: Math.round(dailyPortions.V * 0.40 * 10) / 10
    },
    COLACION_PM: {
      P: Math.round(dailyPortions.P * 0.15 * 10) / 10,
      C: Math.round(dailyPortions.C * 0.10 * 10) / 10,
      G: Math.round(dailyPortions.G * 0.10 * 10) / 10,
      V: Math.round(dailyPortions.V * 0.15 * 10) / 10
    },
    CENA: {
      P: Math.round(dailyPortions.P * 0.25 * 10) / 10,
      C: Math.round(dailyPortions.C * 0.10 * 10) / 10,
      G: Math.round(dailyPortions.G * 0.15 * 10) / 10,
      V: Math.round(dailyPortions.V * 0.20 * 10) / 10
    }
  };
}

/**
 * Función principal que calcula todo el perfil nutricional personalizado
 * @param {Object} user - Datos completos del usuario
 * @returns {Object} Perfil nutricional completo
 */
export function calculatePersonalizedNutrition(user) {
  try {
    // 1. Calcular TMB
    const tmb = calculateTMB(user);
    
    // 2. Calcular TDEE
    const tdee = calculateTDEE(tmb, user.activity);
    
    // 3. Ajustar según objetivo
    const targetCalories = adjustCaloriesForGoal(tdee, user.goal);
    
    // 4. Calcular porciones usando tabla precisa de PN
    const smartPortions = calculatePNPortions(user);
    
    // 5. Mostrar valores exactos (no rangos)
    const dailyPortions = {
      ...smartPortions,
      // Solo mostrar el valor exacto calculado
      ranges: null
    };
    
    // 6. Distribuir entre comidas
    const mealDistribution = distributeMealPortions(dailyPortions);
    
    return {
      tmb,
      tdee,
      targetCalories,
      dailyPortions,
      mealDistribution,
      metadata: {
        gender: user.gender,
        goal: user.goal,
        activity: user.activity,
        preference: user.preference,
        calculatedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error calculando perfil nutricional:', error);
    throw error;
  }
}