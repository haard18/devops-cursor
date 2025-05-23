// src/utils/file.ts
import fs from 'fs-extra';
import path from 'path';

export async function writeInfraFiles(code: { terraform: string, githubActions: string }) {
  await fs.ensureDir('infra');
  await fs.ensureDir('.github/workflows');

  await fs.writeFile(path.join('infra', 'main.tf'), code.terraform);
  await fs.writeFile(path.join('.github/workflows', 'deploy.yml'), code.githubActions);
}
