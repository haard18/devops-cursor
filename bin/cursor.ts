#!/usr/bin/env ts-node

import { Command } from 'commander';
import { runInit } from '../src/commands/init';
import { runDeploy } from '../src/commands/deploy';
// Add other imports

const program = new Command();

program
  .name('cursor')
  .description('Cursor: AI-powered DevOps CLI')
  .version('0.1.0');

program.command('init').description('Scaffold infra + CI from prompt').action(runInit);
program.command('deploy').description('Deploy infra/app').action(runDeploy);
// Add more commands: explain, validate, etc.

program.parse();
