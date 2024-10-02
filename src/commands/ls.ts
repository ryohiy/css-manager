import {glob} from 'glob';
import { loadConfig } from '../config';

export function ls() {
    const { exclude = [] } = loadConfig();
    const patterns = ['**/*.css', '**/*.sass','**/*.scss', '**/*.module.css','**/*.module.scss'];
    const ignorePatterns = ['**node_modules/**', ...exclude];

    patterns.forEach((pattern) => {
        glob(pattern, { ignore: ignorePatterns }).then((files) => {
            console.info(`Pattern: ${pattern}`);
            files.forEach((file) => console.log(file));
        }).catch((err) => {
            throw err;
        });
    });
}

