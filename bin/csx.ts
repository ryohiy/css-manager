#!/usr/bin/env node
import { Command } from 'commander';
import { ls } from '../src/commands/ls';
import { mg } from '../src/commands/mg';

const program = new Command();

program
    .command('ls')
    .description('プロジェクト内の .css, .sass, .module.css ファイルの数とパスを一覧表示します。')
    .action(ls);

program
    .command('mg')
    .description('.css または .sass ファイルを .module.css または .module.sass 形式に変換します。')
    .option('--module [fileName]', '変換するファイル名を指定します。')
    .action(mg);

program.parse(process.argv);
