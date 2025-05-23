// src/ai/openaiClient.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateInfraFromPrompt(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an infra-as-code expert. Output only valid Terraform + GitHub Actions YAML.' },
      { role: 'user', content: prompt },
    ],
  });

  const code = completion.choices[0].message.content!;
  return parseAIResponse(code);
}

function parseAIResponse(raw: string) {
  // Split code blocks into Terraform and CI chunks
  return {
    terraform: extractCode(raw, 'hcl'),
    githubActions: extractCode(raw, 'yaml'),
  };
}

function extractCode(raw: string, lang: string) {
  const regex = new RegExp(`\`\`\`${lang}([\\s\\S]*?)\`\`\``, 'm');
  const match = raw.match(regex);
  return match ? match[1].trim() : '';
}
