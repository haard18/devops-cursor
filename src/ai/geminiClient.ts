// src/ai/geminiClient.ts
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey });

export async function generateInfraFromPromptGemini(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: `You are an expert DevOps engineer. Only output a valid GitHub Actions YAML file, nothing else. Do not include explanations or instructions.\n\n${prompt}`,
  });
  let code = response.text || '';
  // Remove code block markers if present
  code = code.replace(/```yaml[\r\n]*/i, '').replace(/```[\r\n]*$/i, '').trim();
  console.log('Gemini response:', code);
  return { githubActions: code, terraform: '' };
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
