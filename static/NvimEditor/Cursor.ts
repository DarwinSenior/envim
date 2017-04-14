import * as _ from 'lodash'

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export class Cursor {
    // set the blink time
    private blink_: boolean = true;
    // set the blink interval in ms
    private blink_interval_: number = 1000;
    // it corresponds to the block height and block width
    private size: [number, number] = [0, 0];
    private element_: HTMLDivElement;
    private cursor_style_: string;

    constructor() {
        // this will keep blinking until it is detached from the dom
        this.element_ = <HTMLDivElement>document.createElement('x-cursor');
        this.cursor_style = 'block'
        this.element_.tabIndex = -1;
    }

    attach() {

    }

    get element() {
        return this.element_;
    }


    static cursor_styles = ['block', 'underline', 'ibeam', 'custom', 'hide'];
    set cursor_style(style: string) {
        if (style != this.cursor_style_
            && _.includes(Cursor.cursor_styles, style)) {
                this.cursor_style_ = style;
            Cursor.cursor_styles.forEach(cur_style =>
                this.element_.classList.remove(cur_style));
            this.element_.classList.add(style);
        }
    }

    setCursorSize(w: number, h: number) {
        this.element_.style.width = `${w}px`;
        this.element_.style.height = `${h}px`;
        this.size = [w, h];
    }

    moveCursor(x: number, y: number) {
        this.element_.style.top = `${y}px`;
        this.element_.style.left = `${x}px`
    }

    static blink_class = 'blinked';
    noblink() {
        this.element_.classList.remove(Cursor.blink_class);
    }
    blink() {
        this.element_.classList.add(Cursor.blink_class);
    }
}
