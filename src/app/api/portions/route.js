import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener porciones de un día específico
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    const date = searchParams.get('date');
    
    if (!userCode || !date) {
      return NextResponse.json({ error: 'userCode and date required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const portionsData = await redis.get(`portions-${userCode}-${date}`);
    
    const portions = portionsData ? JSON.parse(portionsData) : null;
    
    return NextResponse.json({ portions });
  } catch (error) {
    console.error('Error getting portions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar porciones del día
export async function POST(request) {
  try {
    const body = await request.json();
    const { userCode, date, portions } = body;
    
    if (!userCode || !date || !portions) {
      return NextResponse.json({ error: 'userCode, date and portions required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    await redis.set(`portions-${userCode}-${date}`, JSON.stringify(portions));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving portions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}