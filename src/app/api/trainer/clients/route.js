import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener todos los clientes para el entrenador
export async function GET(request) {
  try {
    const redis = await getRedisClient();
    
    // Buscar todas las keys que empiecen con "user-profile-"
    const profileKeys = await redis.keys('user-profile-*');
    
    const clientsData = [];
    
    for (const key of profileKeys) {
      const userCode = key.replace('user-profile-', '');
      const profileData = await redis.get(key);
      
      if (profileData) {
        const profile = JSON.parse(profileData);
        
        // Calcular estadísticas del cliente
        const stats = await calculateClientStats(redis, userCode);
        
        clientsData.push({
          userCode,
          profile,
          lastActivity: stats.lastActivity,
          totalDays: stats.totalDays,
          recentCompliance: stats.recentCompliance
        });
      }
    }
    
    // Ordenar por nombre
    clientsData.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
    
    return NextResponse.json({ clients: clientsData });
  } catch (error) {
    console.error('Error getting clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function calculateClientStats(redis, userCode) {
  let totalDays = 0;
  let lastActivity = 'Nunca';
  let recentCompliance = { P: 0, C: 0, G: 0, V: 0 };
  
  // Buscar datos de los últimos 30 días
  const recentData = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toDateString();
    
    const portionsKey = `portions-${userCode}-${dateString}`;
    const portionsData = await redis.get(portionsKey);
    
    if (portionsData) {
      totalDays++;
      if (i === 0 || lastActivity === 'Nunca') {
        lastActivity = date.toLocaleDateString('es-ES');
      }
      
      if (i < 7) { // Solo últimos 7 días para compliance
        try {
          const portions = JSON.parse(portionsData);
          const goalsData = await redis.get(`daily-goals-${userCode}`);
          const goals = goalsData ? JSON.parse(goalsData) : { P: 5, C: 5, G: 5, V: 5 };
          
          const totalP = Object.values(portions.P || {}).reduce((sum, val) => sum + (val || 0), 0);
          const totalC = Object.values(portions.C || {}).reduce((sum, val) => sum + (val || 0), 0);
          const totalG = Object.values(portions.G || {}).reduce((sum, val) => sum + (val || 0), 0);
          const totalV = portions.V || 0;
          
          recentData.push({
            P: Math.min((totalP / goals.P) * 100, 100),
            C: Math.min((totalC / goals.C) * 100, 100),
            G: Math.min((totalG / goals.G) * 100, 100),
            V: Math.min((totalV / goals.V) * 100, 100)
          });
        } catch (error) {
          console.error('Error calculating stats for', userCode, error);
        }
      }
    }
  }
  
  // Promediar compliance de los últimos 7 días
  if (recentData.length > 0) {
    recentCompliance = {
      P: Math.round(recentData.reduce((sum, data) => sum + data.P, 0) / recentData.length),
      C: Math.round(recentData.reduce((sum, data) => sum + data.C, 0) / recentData.length),
      G: Math.round(recentData.reduce((sum, data) => sum + data.G, 0) / recentData.length),
      V: Math.round(recentData.reduce((sum, data) => sum + data.V, 0) / recentData.length)
    };
  }
  
  return { totalDays, lastActivity, recentCompliance };
}