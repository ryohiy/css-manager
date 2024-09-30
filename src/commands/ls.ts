import {glob} from 'glob';

export function ls() {
    const patterns = ['**/*.css', '**/*.sass','**/*.scss', '**/*.module.css','**/*.module.scss'];
    patterns.forEach((pattern) => {
        glob(pattern, { ignore: 'node_modules/**' }).then((files) => {
            console.log(`Pattern: ${pattern}`);
            files.forEach((file) => console.log(file));
        }).catch((err) => {
            throw err;
        });
    });
}

