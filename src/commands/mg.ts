import {module} from "./mg/module";

export function mg(options: { module?: string }) {
    if (module){
        module(options.module);
        console.info('module command executed');
    }
}
