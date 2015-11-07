'use babel';

import {filter} from 'fuzzaldrin';
import commands from './commands';
import constants from './constants';
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

function constants_suggestions(prefix) {
    return filter(constants, prefix.toUpperCase()).map((constant) => ({
        text: constant,
        displayText: constant,
        type: 'constant'
    }));
}

function commands_suggestions(prefix) {
    return filter(commands, prefix.toLowerCase()).map((command) => ({
        text: `${command}()`,
        displayText: command,
        type: 'function'
    }));
}

const suggest = dispatch(
    (prefix, scope_descriptor) => {
        if (scope_descriptor.scopes.length > 1) {
            return [
                ...constants_suggestions(prefix),
                ...variables_suggestions(prefix)
            ];
        }
    },
    (prefix) => commands_suggestions(prefix)
)

export function getSuggestions({prefix, scopeDescriptor: scope_descriptor}) {
    return suggest(prefix, scope_descriptor);
}

export function onDidInsertSuggestion({editor, suggestion}) {
    if (suggestion && suggestion.type === 'function') {
        editor.moveLeft(1);
    }
}
