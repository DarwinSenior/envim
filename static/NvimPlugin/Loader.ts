import * as e from 'electron'

import { Nvim } from 'promised-neovim-client'
import { Canvas } from '../NvimEditor/Canvas'

let context = new Map<string, Object>();
export function executeScript(script: string, nvim: Nvim, canvas: Canvas, space: string) {
    if (!context.get(space)) context.set(space, {});
    return execute(script, { nvim: nvim, canvas: canvas, context: context.get(space) });
}

export function evalExpression(expression: string) {
    return execute(`ret=${expression}`, {});
}

/**
 * This will ensure that function would only be executed with certain
 * global variables exposed,
 */
function execute(script: string, variables: Object) {
    const keys = Object.keys(variables);
    keys.push('ret');
    const args = keys.join(',');
    const values = keys.map(k => `variables['${k}']`).join(',');
    eval(`console.log(variables, 0)`);
    return eval(`(function(${args}){\n${script}\n;return ret})(${values})`);
}
