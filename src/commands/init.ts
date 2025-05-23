// src/commands/init.ts
import prompts from 'prompts';
import { generateInfraFromPrompt } from '../ai/openAIClient';
import { writeInfraFiles } from '../utils/file';
import { generateInfraFromPromptGemini } from '../ai/geminiClient';

export async function runInit() {
  const base = await prompts([
    {
      type: 'select',
      name: 'type',
      message: 'What are you deploying?',
      choices: [
        { title: 'Frontend', value: 'frontend' },
        { title: 'Backend', value: 'backend' },
        { title: 'Fullstack', value: 'fullstack' },
      ],
    },
  ]);

  let feFramework = '';
  let beLang = '';

  if (base.type === 'frontend' || base.type === 'fullstack') {
    const fe = await prompts({
      type: 'select',
      name: 'feFramework',
      message: 'Pick a frontend framework',
      choices: [
        { title: 'React (Vite)', value: 'react' },
        { title: 'Next.js', value: 'next' },
        { title: 'Vue', value: 'vue' },
        { title: 'Astro', value: 'astro' },
      ],
    });
    feFramework = fe.feFramework;
  }

  if (base.type === 'backend' || base.type === 'fullstack') {
    const be = await prompts({
      type: 'select',
      name: 'beLang',
      message: 'Pick a backend language',
      choices: [
        { title: 'Node.js', value: 'node' },
        { title: 'Python (FastAPI)', value: 'python' },
        { title: 'Go', value: 'go' },
        { title: 'Rust', value: 'rust' },
      ],
    });
    beLang = be.beLang;
  }

  const cloud = await prompts({
    type: 'select',
    name: 'cloud',
    message: 'Choose your cloud provider',
    choices: [
      { title: 'AWS', value: 'aws' },
      { title: 'GCP', value: 'gcp' },
      { title: 'Azure', value: 'azure' },
      { title: 'Render', value: 'render' },
    ],
  });

  const extras = await prompts([
    {
      type: 'multiselect',
      name: 'services',
      message: 'What extra infra do you need?',
      choices: [
        { title: 'PostgreSQL', value: 'postgres' },
        { title: 'MongoDB', value: 'mongo' },
        { title: 'Redis', value: 'redis' },
      ],
    },
    {
      type: 'confirm',
      name: 'useCI',
      message: 'Do you want GitHub Actions CI/CD?',
      initial: true,
    },
  ]);

  // 🧠 Construct the prompt
  const finalPrompt = `I want to deploy a ${base.type} app using ${feFramework || ''}${feFramework && beLang ? ' + ' : ''}${beLang || ''} on ${cloud.cloud}. 
Include Terraform infra for ${extras.services.join(', ') || 'no databases'}, and ${extras.useCI ? 'a GitHub Actions CI pipeline' : 'no CI/CD'}.`;

  console.log('\n🧠 Prompt to AI:\n' + finalPrompt + '\n');

  const infraCode = await generateInfraFromPromptGemini(finalPrompt);
  await writeInfraFiles(infraCode);

  console.log('✅ Infra files generated in /infra and /.github/workflows');
}
