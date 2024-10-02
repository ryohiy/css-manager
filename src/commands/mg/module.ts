import {glob} from "glob";
import path from "path";
import fs from "fs-extra";
import camelCase from "camelcase";
import { loadConfig } from '../../config';

export function module( module?:string ) {
    const { exclude = [] } = loadConfig();
    const ignorePatterns = ['**/node_modules/**', '**/*.module.*', ...exclude];
    const targetCssFiles = typeof module === 'string'
        ? [module]
        : glob.sync('**/*.{css,sass,scss}', { ignore: ignorePatterns});

    targetCssFiles.forEach((file) => {
        console.log(`Processing: ${file}`);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const dirName = path.dirname(file);
        const newFileName = `${baseName}.module${ext}`;
        const newFilePath = path.join(dirName, newFileName);

        // クラス名をキャメルケースに変換
        let content = fs.readFileSync(file, 'utf8');
        let oldClassNames:string[]=[]
        content = content.replace(/(?:^|\s)\.(?<className>\w[\w-]*)/g, (match, className) => {
            const camelCased = camelCase(className);
            oldClassNames.push(className)
            return `.${camelCased}`;
        });

        fs.writeFileSync(newFilePath, content);
        fs.removeSync(file);

        // インポート文の削除と使用箇所の書き換え
        const jsxFiles = glob.sync('**/*.{jsx,tsx}', { ignore: '**/node_modules/**' });
        jsxFiles.forEach((codeFile) => {
            console.log(`Processing: ${codeFile}`);
            let codeContent = fs.readFileSync(codeFile, 'utf8');

            // クラス名が使用されているか確認
            const isClassUsed = oldClassNames.some(name=> codeContent.includes(name))

            if (isClassUsed) {
                // インポート文のパスを修正または追加
                const importPath = path.relative(path.dirname(codeFile), newFilePath).replace(/\\/g, '/');
                const importStatement = `import styles from './${importPath}';\n`;
                codeContent = importStatement + codeContent;

                // className="oldClassName" to className={oldClassName}
                for (const name of oldClassNames) {
                    codeContent = codeContent.replace(
                        new RegExp(`className=(?<quote>["'])(?<content>.*?)\\k<quote>`, 'g'),
                        (match, quote, content, offset, string, groups) => {
                            return `className={${groups.content}}`;
                        }
                    );
                }

                // // kebab-case to styles.camelCase
                for (const  name of oldClassNames) {
                    codeContent = codeContent.replace(
                        new RegExp(`(?:\{)(?<name>${name})(?:\})`, 'g'),
                        (match, name, offset, string, groups) => {
                            return `{styles.${camelCase(groups.name)}}`;
                        }
                    );
                    codeContent = codeContent.replace(
                        new RegExp(`(?:^|\s)(?<name>${name})(?:\s)`, 'g'),
                        (match, name, offset, string, groups) => {
                            return `styles.${camelCase(groups.name)}`;
                        }
                    );
                }
            }
            fs.writeFileSync(codeFile, codeContent);
        });
    });
}