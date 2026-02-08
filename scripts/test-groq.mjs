#!/usr/bin/env node
/**
 * Test Groq API - run: node scripts/test-groq.mjs
 */
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log('Testing Groq API...\n');
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not set in .env');
    process.exit(1);
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Hello" in one word only.' }],
      model: 'groq/compound-mini',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      compound_custom: {
        tools: {
          enabled_tools: ['web_search', 'code_interpreter', 'visit_website'],
        },
      },
    });

    const content = chatCompletion.choices[0]?.message?.content ?? '';
    console.log('Response:', content);
    console.log('\n✓ Groq API responded successfully');
  } catch (err) {
    console.error('Groq API error:', err.message);
    process.exit(1);
  }
}

test();
