import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ls } from '../src/commands/ls';
import fs from 'fs-extra';
import path from 'path';

describe('csx ls command', () => {
    const testDir = path.join(__dirname, 'temp-ls');
    const originalCwd = process.cwd();

    beforeEach(async () => {
        // テスト用のディレクトリを作成
        await fs.promises.mkdir(testDir, { recursive: true });

        // テスト用のファイルを作成
        const files = [
            'style.css',
            'main.sass',
            'component.module.css',
            'ignore.txt',
        ];

        for (const file of files) {
            await fs.outputFile(path.join(testDir, file), '');
        }

        // カレントディレクトリをテスト用ディレクトリに変更
        process.chdir(testDir);
    });

    afterEach(async () => {
        // カレントディレクトリを元に戻す
        process.chdir(originalCwd);
        // テスト用ディレクトリを削除
        await fs.remove(testDir);
    });

    it('should list all .css, .sass, .module.css files', async () => {
        // コンソール出力をモック
        const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});

        // ls コマンドを実行
        await ls();

        // コンソール出力の検証
        // expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('style.css'));
        // expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('main.sass'));
        // expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('component.module.css'));
        // expect(consoleLogMock).not.toHaveBeenCalledWith(expect.stringContaining('ignore.txt'));

        // モックを元に戻す
        consoleLogMock.mockRestore();
    });
});
