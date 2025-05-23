// src/commands/init.ts
import prompts from 'prompts';
import { generateInfraFromPrompt } from '../ai/openAIClient';
import { writeInfraFiles } from '../utils/file';

export async function runInit() {
  const response = await prompts({
    type: 'text',
    name: 'infraPrompt',
    message: 'Describe your desired infra (e.g. Node app + Postgres on AWS ECS)',
  });

  const infraCode = await generateInfraFromPrompt(response.infraPrompt);
  await writeInfraFiles(infraCode);

  console.log('✅ Infra files generated in /infra and /.github/workflows');
}
