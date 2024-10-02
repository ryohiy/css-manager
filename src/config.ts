import { cosmiconfigSync } from 'cosmiconfig';

export interface CssManagerConfig {
    exclude?: string[];
}

export function loadConfig(): CssManagerConfig {
    const explorer = cosmiconfigSync('css-manager');
    const result = explorer.search();

    if (result && !result.isEmpty) {
        return result.config as CssManagerConfig;
    } else {
        return {};
    }
}
