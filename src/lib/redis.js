import { createClient } from 'redis';

let client;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL
    });

    client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await client.connect();
  }

  return client;
}