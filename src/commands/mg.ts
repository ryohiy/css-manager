import fs from 'fs-extra';
import {glob} from 'glob';
import path from 'path';
import camelCase from 'camelcase';

export function mg(options: { module?: string }) {
    const targetFiles = typeof options.module === 'string'
        ? [options.module]
        : glob.sync('**/*.{css,sass,scss}', { ignore: '**/node_modules/**' });

    targetFiles.forEach((file) => {
        console.log(`Processing: ${file}`);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const dirName = path.dirname(file);
        const newFileName = `${baseName}.module${ext}`;
        const newFilePath = path.join(dirName, newFileName);

        // クラス名をキャメルケースに変換
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/\.(\w[\w-]*)/g, (_, className) => {
            const camelCased = camelCase(className);
            return `.${camelCased}`;
        });

        fs.writeFileSync(newFilePath, content);
        fs.removeSync(file);

        // インポート文の削除と使用箇所の書き換え
        const codeFiles = glob.sync('**/*.{jsx,tsx}', { ignore: '**/node_modules/**' });
        codeFiles.forEach((codeFile) => {
            console.log(`Processing: ${codeFile}`);
            let codeContent = fs.readFileSync(codeFile, 'utf8');

            // クラス名が使用されているか確認
            const classRegex = new RegExp(`className=["']([^"']*?)${baseName}([^"']*?)["']`, 'g');
            const isClassUsed = classRegex.test(codeContent);

            if (isClassUsed) {
                // インポート文のパスを修正または追加
                const importPath = path.relative(path.dirname(codeFile), newFilePath).replace(/\\/g, '/');
                const importStatement = `import styles from './${importPath}';\n`;
                    codeContent = importStatement + codeContent;
            }

            // クラス名の書き換え
            codeContent = codeContent.replace(
                new RegExp(`className=["']([^"']*?)${baseName}([^"']*?)["']`, 'g'),
                (match, p1, p2) => {
                    const classNames = `${p1}${baseName}${p2}`.split(' ').map((name) => camelCase(name)).join('.');
                    return `className={styles.${classNames}}`;
                }
            );

            fs.writeFileSync(codeFile, codeContent);
        });
    });
}
