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
const ctrlkeys = new Set([
    'Control', 'Alt', 'Meta'
])

type GeneralEvent = KeyboardEvent | MouseEvent | WheelEvent;
function general_keys(keyname: string, evt: GeneralEvent): string {
    let keystack = [];
    if (evt.ctrlKey) keystack.push('C');
    if (evt.altKey) keystack.push('S');
    if (evt.metaKey) keystack.push('M');
    keystack.push(keyname);
    let result = keystack.join('-');
    if (result.length > 1) return `<${result}>`
    return result;
}


export function keyevt2nvimkey(evt: KeyboardEvent): string {
    evt.preventDefault();
    if (ctrlkeys.has(evt.key)) return "";
    return general_keys(keymap.get(evt.key) || evt.key, evt);
    // return special_keys.get([
    //     evt.keyCode, evt.shiftKey, evt.ctrlKey, evt.metaKey, evt.altKey
    // ]) || general_keys(evt.keyCode, evt.shiftKey, evt.ctrlKey, evt.metaKey, evt.altKey);
}

const mousekeyname = ['Left', 'Middle', 'Right'];
export function mouseevt2nvimkey(evt: MouseEvent): string {
    let nvimmousetype = 'Mouse';
    if (evt.type == 'mousemove'){
        nvimmousetype = 'Drag';
    }
    return general_keys(mousekeyname[evt.button] + nvimmousetype, evt);
}

export function mousewhellevt2nvimkey(evt: MouseWheelEvent): string {
    let direction = '';
    if (evt.deltaX > 0) direction = 'Right';
    if (evt.deltaX < 0) direction = 'Left';
    if (evt.deltaY > 0) direction = 'Down';
    if (evt.deltaY < 0) direction = 'Up';
    return general_keys('ScrollWheel'+direction, evt);
}
