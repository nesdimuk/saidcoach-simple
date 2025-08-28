import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener porciones de un día específico
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    const date = searchParams.get('date');
    
    console.log('📥 GET portions request:', { userCode, date });
    
    if (!userCode || !date) {
      return NextResponse.json({ error: 'userCode and date required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const key = `portions-${userCode}-${date}`;
    const portionsData = await redis.get(key);
    
    console.log('💾 Datos en Redis para key:', { key, data: portionsData });
    
    const portions = portionsData ? JSON.parse(portionsData) : null;
    
    console.log('📤 Enviando portions:', portions);
    
    return NextResponse.json({ portions });
  } catch (error) {
    console.error('❌ Error getting portions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar porciones del día
export async function POST(request) {
  try {
    const body = await request.json();
    const { userCode, date, portions, isFinished } = body;
    
    if (!userCode || !date || !portions) {
      return NextResponse.json({ error: 'userCode, date and portions required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    
    // Guardar las porciones
    await redis.set(`portions-${userCode}-${date}`, JSON.stringify(portions));
    
    // Manejar el estado de finalización
    if (isFinished === true) {
      await redis.set(`day-finished-${userCode}-${date}`, JSON.stringify(true));
      console.log('📅 Día finalizado guardado:', { userCode, date, isFinished: true });
    } else if (isFinished === false) {
      await redis.del(`day-finished-${userCode}-${date}`);
      console.log('🔄 Día reactivado:', { userCode, date, isFinished: false });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving portions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Eliminar registro de un día específico
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    const date = searchParams.get('date');
    
    if (!userCode || !date) {
      return NextResponse.json({ error: 'userCode and date required' }, { status: 400 });
    }

    console.log('🗑️ Eliminando registro:', { userCode, date });

    const redis = await getRedisClient();
    
    // Eliminar todos los datos relacionados con ese día
    const keysToDelete = [
      `portions-${userCode}-${date}`,
      `day-finished-${userCode}-${date}`,
      `weight-${userCode}-${date}`
    ];
    
    for (const key of keysToDelete) {
      await redis.del(key);
      console.log(`🗑️ Eliminado: ${key}`);
    }
    
    console.log('✅ Registro eliminado completamente');
    return NextResponse.json({ success: true, message: 'Registro eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}