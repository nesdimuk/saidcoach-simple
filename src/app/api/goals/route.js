import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener objetivos diarios de un usuario
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    
    if (!userCode) {
      return NextResponse.json({ error: 'userCode required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const goalsData = await redis.get(`daily-goals-${userCode}`);
    
    const goals = goalsData ? JSON.parse(goalsData) : null;
    
    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error getting goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar objetivos diarios
export async function POST(request) {
  try {
    const body = await request.json();
    const { userCode, goals } = body;
    
    if (!userCode || !goals) {
      return NextResponse.json({ error: 'userCode and goals required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    await redis.set(`daily-goals-${userCode}`, JSON.stringify(goals));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}