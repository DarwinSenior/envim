import * as _ from 'lodash'

export type Color = number;
export type Maybe<T> = T | void;
export type MaybeColor = Maybe<Color>;

function color2string(color: Color): String {
    if (color == -1) return 'inherit';
    return `#${_.padStart(color.toString(16), 6, '0')}`;
}

/**
 * we set those to be styles we care about
 * and we will only respond to those styles
 * since we might need to manually update
 * the style later on
 */
export class ExternalStyle {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    constructor(style: CSSStyleDeclaration){
        this.fontSize = parseInt(style.fontSize);
        this.fontFamily = style.fontFamily;
        this.lineHeight = parseFloat(style.lineHeight);
    }
    get fontStyle(){
        return this.fontSize+'px '+this.fontFamily;
    }
}

export function fromAttribute2Style(attr: Object, defaultstyle: DefaultStyle): TextStyle {
    return new TextStyle(
        attr['foreground'] || null,
        attr['background'] || null,
        attr['special'] || null,
        attr['reverse'] || false,
        attr['italic'] || false,
        attr['bold'] || false,
        attr['underline'] || false,
        attr['undercurl'] || false,
        defaultstyle,
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
        private undercurl: boolean,
        private defaultstyle: DefaultStyle
    ) {
    }
    toString(): string {
        let attrs = [];
        let foreground = this.foreground || this.defaultstyle.foreground;
        attrs.push(`${this.reverse ? 'background-color' : 'color'}: ${color2string(foreground)}`);
        let background = this.background || this.defaultstyle.background;
        attrs.push(`${!this.reverse ? 'background-color' : 'color'}: ${color2string(background)}`);
        let special = this.special || this.defaultstyle.special;
        attrs.push(`text-decoration - color: ${color2string(special)}`);
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
            attrs.push('text-decoration-style: dashed');
        }
        if (this.reverse) {
        }
        return attrs.join(';');
    }
}
