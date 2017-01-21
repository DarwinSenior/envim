// to communicate with the keyboard
// there are two cases so that we do not waste time
// and only do async update
// The worker will try to push the current key strokes
// if the requester is ready, push immediately
// if the requester is not ready, stack the keystroke
// import {range} from 'lodash'
let special_keys = new Map<[number, boolean, boolean, boolean, boolean], string>(
    [
    ]);

// insert the key here and we will
// insert the key here and we will see how the thing goes
let keymap = new Map([
    ['Escape', 'Esc'],
    ['ArrowUp', 'Up'], ['ArrowDown', 'Down'], ['ArrowLeft', 'Left'],
    ['ArrowRight', 'Right']
]);
let ctrlkeys = new Set([
    'Control', 'Alt', 'Meta'
])

function general_keys(evt: KeyboardEvent): string {
    let keystack = [];
    if (evt.ctrlKey) keystack.push('C');
    if (evt.altKey) keystack.push('S');
    if (evt.metaKey) keystack.push('M');
    keystack.push(keymap.get(evt.key) || evt.key);
    let result = keystack.join('-');
    if (result.length > 1) return `<${result}>`
    return result;
}


export function keyevt2nvimkey(evt: KeyboardEvent): string {
    evt.preventDefault();
    if (ctrlkeys.has(evt.key)) return "";
    return general_keys(evt);
    // return special_keys.get([
    //     evt.keyCode, evt.shiftKey, evt.ctrlKey, evt.metaKey, evt.altKey
    // ]) || general_keys(evt.keyCode, evt.shiftKey, evt.ctrlKey, evt.metaKey, evt.altKey);
}
