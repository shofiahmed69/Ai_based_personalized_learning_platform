#!/usr/bin/env node
/**
 * Test Groq via backend env/config - run: node scripts/test-groq-backend.mjs
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Groq } from 'groq-sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
dotenv.config({ path: join(projectRoot, '.env') });

const apiKey = (process.env.GROQ_API_KEY ?? '').trim();
console.log('API key length:', apiKey.length);
console.log('API key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : '(empty)');

async function test() {
  if (!apiKey) {
    console.error('GROQ_API_KEY not set in .env');
    process.exit(1);
  }

  const groq = new Groq({ apiKey });
  try {
    const r = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      model: 'llama-3.3-70b-versatile',
      max_completion_tokens: 50,
      stream: false,
    });
    console.log('Response:', r.choices[0]?.message?.content ?? '(empty)');
    console.log('✓ Groq API OK');
  } catch (err) {
    console.error('Groq error:', err.message);
    process.exit(1);
  }
}

test();
