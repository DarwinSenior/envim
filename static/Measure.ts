import * as _ from 'lodash';

const canvas_ = <HTMLCanvasElement>document.createElement('canvas');
const ctx_ = canvas_.getContext('2d');

interface Absolute{
    kind: 'absolute';
    size: number;
}

interface Relative{
    kind: 'relative';
    size: number;
}

type CSSValue = Absolute | Relative;

export function textWidth(font: string, count?: number): number{
    ctx_.font = font;
    return ctx_.measureText(_.repeat('1234567890', count)).width/10;
}
// TODO: get support for all the style possibility
export function textHeight(fontsize: string, line_height: string): number{
    let base = parseInt(fontsize); // 10px -> 10
    let normal = 1.2; //https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
    return base*normal;
}

// I refuse to work on it at this moment
function cssvalue(val: string): CSSValue{
    return {kind: 'absolute', size: 0};
}
