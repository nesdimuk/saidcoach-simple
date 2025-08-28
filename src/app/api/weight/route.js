import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener peso de un día específico
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    const date = searchParams.get('date');
    
    if (!userCode || !date) {
      return NextResponse.json({ error: 'userCode and date required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const weightData = await redis.get(`weight-${userCode}-${date}`);
    
    const weight = weightData ? JSON.parse(weightData) : null;
    
    return NextResponse.json({ weight });
  } catch (error) {
    console.error('Error getting weight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar peso del día
export async function POST(request) {
  try {
    const body = await request.json();
    const { userCode, date, weight } = body;
    
    if (!userCode || !date || !weight) {
      return NextResponse.json({ error: 'userCode, date and weight required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    await redis.set(`weight-${userCode}-${date}`, JSON.stringify(weight));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving weight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}