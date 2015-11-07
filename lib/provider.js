'use babel';

import {filter} from 'fuzzaldrin';
import {dispatch} from './functional';
import cmake_context from './cmake-context';
import commands from './commands';
import constants from './constants';
import find_modules from './find-modules';
import modules from './modules';
import variables from './variables';

export const selector = '.source.cmake';
export const disableForSelector = '.source.cmake .comment';
export const inclusionPriority = 1;

function find_modules_suggestions(prefix) {
    return filter(find_modules, prefix).map((module) => ({
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

const suggest = dispatch(
    (context, prefix) => {
        if (context === 'find_package') {
            return find_modules_suggestions(prefix);
        }
    },
    (context, prefix) => {
        if (context === 'include') {
            return modules_suggestions(prefix);
        }
    },
    (context, prefix) => {
        if (context.length > 0) {
            return [
                ...constants_suggestions(prefix),
                ...variables_suggestions(prefix)
            ];
        }
    },
    (context, prefix) => commands_suggestions(prefix)
)

export function getSuggestions({editor, prefix, scopeDescriptor: scope_descriptor}) {
    return suggest(cmake_context(editor, scope_descriptor), prefix);
}

export function onDidInsertSuggestion({editor, suggestion}) {
    if (suggestion && suggestion.type === 'function') {
        editor.moveLeft(1);
    }
}
