import { createClient } from 'redis';

let client;

export async function getRedisClient() {
  if (!client) {
    console.log('🔗 Conectando a Redis:', process.env.REDIS_URL ? 'URL configurada' : 'URL NO configurada');
    
    client = createClient({
      url: process.env.REDIS_URL
    });

    client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis conectado exitosamente');
    });

    client.on('ready', () => {
      console.log('🚀 Redis listo para usar');
    });

    await client.connect();
  }

  return client;
}