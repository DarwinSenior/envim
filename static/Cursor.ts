import * as _ from 'lodash'

async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

export class Cursor {
    // set the blink time
    private blink_: boolean = true;
    // set the blink interval in ms
    private blink_interval_: number = 500;
    // it corresponds to the block height and block width
    private size: [number, number] = [0, 0];
    private element_: HTMLDivElement;

    constructor() {
        // this will keep blinking until it is detached from the dom
        this.element_ = <HTMLDivElement>document.createElement('x-cursor');
        this.cursor_style = 'block'
    }

    get element() {
        return this.element_;
    }

    static cursor_styles = ['block', 'underline', 'ibeam', 'custom'];
    set cursor_style(style: string) {
        if (_.includes(Cursor.cursor_styles, style)) {
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
        const [w, h] = this.size;
        this.element_.style.top = `${y * h}px`;
        this.element_.style.left = `${x * w}px`
    }

    noblink() {
        this.blink_ = false;
    }
    async blink() {
        if (this.blink_) return;
        const blink_class = 'blinked';
        this.blink_ = true;
        while (this.blink_) {
            await sleep(this.blink_interval_);
            this.element_.classList.toggle(blink_class);
        }
        this.element_.classList.remove(blink_class);
    }
}
