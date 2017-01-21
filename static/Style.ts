import * as _ from 'lodash'

type Color = number;
type Maybe<T> = T | void;
type MaybeColor = Maybe<Color>;

function color2string(color: Color): String {
    if (color == -1) return 'inherit';
    return `#${_.padStart(color.toString(16), 6, '0')}`;
}

export function fromAttribute2Style(attr: Object): TextStyle {
    return new TextStyle(
        attr['foreground'] || null,
        attr['background'] || null,
        attr['special'] || null,
        attr['reverse'] || false,
        attr['italic'] || false,
        attr['bold'] || false,
        attr['underline'] || false,
        attr['undercurl'] || false,
    );
}
export class DefaultStyle {
    constructor(
        public foreground: Color,
        public background: Color,
        public special: Color
    ) { }
    toString(): string {
        let styles = [];
        styles.push(`color: ${color2string(this.foreground)}`);
        styles.push(`background-color: ${color2string(this.background)}`);
        styles.push(`text-decoration-color: ${color2string(this.special)}`);
        return styles.join(';');
    }
}
export class TextStyle {
    constructor(
        private foreground: MaybeColor,
        private background: MaybeColor,
        private special: MaybeColor,
        private reverse: boolean,
        private italic: boolean,
        private bold: boolean,
        private underline: boolean,
        private undercurl: boolean) { }
    toString(): string {
        let attrs = [];
        if (this.foreground) {
            attrs.push(`color: ${color2string(this.foreground)}`);
        }
        if (this.background) {
            attrs.push(`background-color: ${color2string(this.background)}`);
        }
        if (this.special) {
            attrs.push(`text-decoration - color: ${color2string(this.special)}`);
        }
        if (this.italic) {
            attrs.push('font-style: italic');
        }
        if (this.bold) {
            attrs.push('font-weight: bold');
        }
        if (this.underline || this.undercurl) {
            attrs.push('text-decoration: underline');
        }
        if (this.undercurl) {
            attrs.push('text-decoration-style: wavy');
        }
        if (this.reverse) {
            attrs.push('filter: invert(100%)');
        }
        return attrs.join(';');
    }
}
