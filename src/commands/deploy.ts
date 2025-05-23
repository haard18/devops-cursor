// src/commands/deploy.ts
import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';

function runCommand(cmd: string, cwd = process.cwd()): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = exec(cmd, { cwd }, (err, stdout, stderr) => {
      if (err) {
        console.error(chalk.red(`❌ Error executing: ${cmd}`));
        console.error(stderr);
        reject(err);
      } else {
        console.log(chalk.green(`✅ Success: ${cmd}`));
        console.log(stdout);
        resolve();
      }
    });

    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
  });
}

export async function runDeploy() {
  const spinner = ora('🚀 Starting deployment...').start();

  try {
    spinner.text = '🔍 Checking Terraform files...';
    await runCommand('terraform init', path.join(process.cwd(), 'infra'));

    spinner.text = '🧠 Validating infrastructure...';
    await runCommand('terraform validate', path.join(process.cwd(), 'infra'));

    spinner.text = '📦 Planning infrastructure changes...';
    await runCommand('terraform plan', path.join(process.cwd(), 'infra'));

    spinner.text = '⚙️ Applying changes...';
    await runCommand('terraform apply -auto-approve', path.join(process.cwd(), 'infra'));

    spinner.succeed('🚢 Deployment successful!');
  } catch (err) {
    spinner.fail('💥 Deployment failed.');
    process.exit(1);
  }
}
