'use babel';

import {filter} from 'fuzzaldrin';
import commands from './commands';
import variables from './variables';

export const selector = '.source.cmake';
export const disableForSelector = '.source.cmake .comment';
export const inclusionPriority = 1;

export function getSuggestions({prefix}) {
    const cmds = filter(commands, prefix.toLowerCase()).map((command) => ({
        text: `${command}()`,
        displayText: command,
        type: 'function'
    }));
    const vars = filter(variables, prefix.toUpperCase()).map((variable) => ({
        text: variable,
        displayText: variable,
        type: 'variable'
    }));
    return [...cmds, ...vars];
}
