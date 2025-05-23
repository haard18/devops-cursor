// src/ai/openaiClient.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateInfraFromPrompt(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
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
  // Extract YAML code blocks or plain YAML from the response
  // Prefer code blocks, but fallback to the whole response if not found
  const codeBlockRegex = /```(?:yaml)?([\s\S]*?)```/i;
  const match = raw.match(codeBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  // If no code block, try to find the first YAML document start
  const yamlStart = raw.indexOf('name:');
  if (yamlStart !== -1) {
    return raw.slice(yamlStart).trim();
  }
  return raw.trim();
}
