'use babel';

import {filter} from 'fuzzaldrin';
import {Range} from 'atom';
import commands from './commands';
import constants from './constants';
import find_modules from './find-modules';
import modules from './modules';
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

function find_modules_suggestions(prefix) {
    return filter(find_modules, prefix.toLowerCase(), {key: 'id'}).map((module) => ({
        text: module.name,
        displayText: module.name,
        type: 'constant'
    }));
}

function modules_suggestions(prefix) {
    return filter(modules, prefix).map((module) => ({
        text: module,
        displayText: module,
        type: 'constant'
    }));
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

function skip(i, predicate) {
    while (i >= 0 && predicate(i)) {
        i--;
    }
    return i;
}

function function_scope_name(editor) {
    const range = new Range([0, 0], editor.getCursorBufferPosition());
    const text = editor.getTextInRange(range);
    const last = skip(
        skip(text.length - 1, index => text.charAt(index) !== '(') - 1,
        index => /\s/.test(text.charAt(index))
    ) + 1;
    const first = skip(
        last - 1,
        index => !/\s/.test(text.charAt(index))
    );
    return text.substring(first, last).trim();
}

const suggest_function_scope = dispatch(
    (name, prefix) => {
        if (name === 'find_package') {
            return find_modules_suggestions(prefix);
        }
    },
    (name, prefix) => {
        if (name === 'include') {
            return modules_suggestions(prefix);
        }
    },
    (name, prefix) => [
        ...constants_suggestions(prefix),
        ...variables_suggestions(prefix)
    ]
);

const suggest = dispatch(
    (editor, prefix, scope_descriptor) => {
        if (scope_descriptor.scopes.length > 1) {
            const scope_name = function_scope_name(editor, prefix);
            return suggest_function_scope(scope_name, prefix);
        }
    },
    (editor, prefix) => commands_suggestions(prefix)
)

export function getSuggestions({editor, prefix, scopeDescriptor: scope_descriptor}) {
    return suggest(editor, prefix, scope_descriptor);
}

export function onDidInsertSuggestion({editor, suggestion}) {
    if (suggestion && suggestion.type === 'function') {
        editor.moveLeft(1);
    }
}
