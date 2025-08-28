import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

// GET: Obtener perfil de usuario
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userCode = searchParams.get('userCode');
    
    if (!userCode) {
      return NextResponse.json({ error: 'userCode required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const profileData = await redis.get(`user-profile-${userCode}`);
    
    const profile = profileData ? JSON.parse(profileData) : null;
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar perfil de usuario
export async function POST(request) {
  try {
    const body = await request.json();
    const { userCode, profile } = body;
    
    console.log('📝 Intentando guardar perfil:', { userCode, profile });
    
    if (!userCode || !profile) {
      console.log('❌ Datos faltantes:', { userCode: !!userCode, profile: !!profile });
      return NextResponse.json({ error: 'userCode and profile required' }, { status: 400 });
    }

    const redis = await getRedisClient();
    const key = `user-profile-${userCode}`;
    const value = JSON.stringify(profile);
    
    console.log('💾 Guardando en Redis:', { key, value });
    await redis.set(key, value);
    
    // Verificar que se guardó
    const saved = await redis.get(key);
    console.log('✅ Verificación de guardado:', { saved });
    
    return NextResponse.json({ success: true, saved: !!saved });
  } catch (error) {
    console.error('❌ Error saving user profile:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}