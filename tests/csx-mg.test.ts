import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mg } from '../src/commands/mg';
import fs from 'fs-extra';
import path from 'path';

describe('csx mg command', () => {
    const testDir = path.join(__dirname, 'temp-mg');
    const originalCwd = process.cwd();

    beforeEach(async () => {
        // テスト用ディレクトリの作成
        await fs.promises.mkdir(testDir, { recursive: true });
        process.chdir(testDir);

        // テスト用のスタイルファイルとコードファイルを作成
        await fs.outputFile('hoge.sass', '.hoge-container\n  margin: 10px');
        await fs.outputFile('index.tsx', '<div className="hoge-container">hello world</div>');
    });

    afterEach(async () => {
        // カレントディレクトリを元に戻す
        process.chdir(originalCwd);
        // テスト用ディレクトリを削除
        await fs.remove(testDir);
    });

    it('should convert .sass file to .module.sass with camelCased class names', async () => {
        await mg({ module: 'hoge.sass' });

        // 元のファイルが削除されていることを確認
        const existsOriginal = await fs.pathExists('hoge.sass');
        const existsModule = await fs.pathExists('hoge.module.sass');
        expect(existsOriginal).toBe(false);
        expect(existsModule).toBe(true);

        // 変換後のファイル内容を検証
        const moduleContent = await fs.readFile('hoge.module.sass', 'utf8');
        expect(moduleContent).toContain('.hogeContainer');

        // コードファイルが書き換えられていることを確認
        const codeContent = await fs.readFile('index.tsx', 'utf8');
        expect(codeContent).toContain('className={styles.hogeContainer}');
    });
});
