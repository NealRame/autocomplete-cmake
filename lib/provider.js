'use babel';

import {filter} from 'fuzzaldrin';
import commands from './commands';
import variables from './variables';

export const selector = '.source.cmake';
export const disableForSelector = '.source.cmake .comment';
export const inclusionPriority = 1;

function existy(value) {
    return value != null;
}

function dispatch() {
    var funs = arguments;
    return function() {
        for (var f of funs) {
            var ret = f.apply(null, arguments);
            if (existy(ret)) {
                return ret;
            }
        }
    };
}

function variables_suggestions(prefix) {
    return filter(variables, prefix.toUpperCase()).map((variable) => ({
        text: variable,
        displayText: variable,
        type: 'variable'
    }));
}

function  commands_suggestions(prefix) {
    return filter(commands, prefix.toLowerCase()).map((command) => ({
        text: `${command}()`,
        displayText: command,
        type: 'function'
    }));
}

const suggest = dispatch(
    (prefix, scopes) => {
        if (scopes.length > 1) {
            return variables_suggestions(prefix);
        }
    },
    (prefix) => commands_suggestions(prefix)
)

export function getSuggestions({editor, bufferPosition, prefix, scopeDescriptor: scope_descriptor}) {
    console.log(editor);
    console.log(bufferPosition);
    console.log(scope_descriptor);
    return suggest(prefix, scope_descriptor.scopes);
}
