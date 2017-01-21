import { Screen } from './Screen'
import { TextStyle, DefaultStyle } from './Style'
import { textWidth, textHeight } from './Measure'
import { Cursor } from './Cursor'
import { Emitter } from './Event'
import * as _ from 'lodash'


export class Canvas {
    // this element is responsible for
    // calculating the outer style of the element
    // You could set any external style to this element
    // such as font family/size, line height etc
    private window_: HTMLDivElement = <HTMLDivElement>document.createElement('x-window');
    // this element takes charge of the default configuration
    // of the neovim style (default value for foreground background special color)
    // the style of this element will get constantly overwritten
    // thus, you could not touch this element
    private canvas_: HTMLDivElement = <HTMLDivElement>document.createElement('x-canvas');
    private rows_: HTMLDivElement[] = [];
    private texts_: string[] = [];
    private styles_: TextStyle[][] = [];
    private offsets_: number[][] = [];
    private height_: number = 0;
    private width_: number = 0;

    // this will calculate the size of each block
    private block_height_: number = 0;
    private block_width_: number = 0;

    // we will provide event listeners to use

    constructor(private screen_: Screen,
        private cursor_: Cursor,
        private emitter_: Emitter
    ) {
        this.window_.appendChild(this.canvas_);
        this.canvas_.appendChild(this.cursor_.element);
        this.window_.tabIndex = 1;
    }

    // you could easily attach the window elements to the outside
    get window() {
        return this.window_;
    }

    // or when the screen try to resize
    // the update only take place when the element of the line change
    redraw(commands: any[]) {
        commands.forEach((command) => {
            const [instruction, ...args] = command;
            if (this.screen_[instruction]) {
                args.forEach(arg => this.screen_[instruction](...arg));
            } else {
                console.log('ignored instruction: ' + instruction);
            }
        });
        // if size changed, resize the screen
        this.updateStyle();
        this.updateCursor();
        const new_texts = this.screen_.texts;
        const [new_offsets, new_styles] = this.screen_.styles;
        for (let i = 0; i < this.width_; i++) {
            if (!_.isEqual(this.texts_[i], new_texts[i])
                || !_.isEqual(this.styles_[i], new_styles[i])
                || !_.isEqual(this.offsets_[i], new_offsets[i])) {
                this.texts_[i] = new_texts[i];
                this.styles_[i] = new_styles[i];
                this.offsets_[i] = new_offsets[i];
                this.updateLine(i);
            }
        }
        // this.emitter_.fire('redraw', [new_texts, new_styles]);
    }

    updateScreen() {
        // in this case, we probably need to redraw everything.
        // we first calcuate the size of our elements
        this.height_ = this.screen_.height;
        this.width_ = this.screen_.width;

        const style = window.getComputedStyle(this.canvas_);
        this.block_width_ = textWidth(style.fontSize + " " + style.fontFamily, 1);
        this.block_height_ = 20;
        // console.log(this.rows_[0].clientHeight);
        this.cursor_.setCursorSize(this.block_width_, this.block_height_);
        this.emitter_.setCursorSize(this.block_width_, this.block_height_);
        this.window_.style.width = `${this.block_width_ * this.width_}px`;
        this.window_.style.height = `${this.block_height_ * this.height_}px`;

        // we then position everything
        this.rows_.forEach(row => this.canvas_.removeChild(row));
        this.rows_.length = 0;
        for (let i = 0; i < this.height_; i++) {
            let row = <HTMLDivElement>document.createElement('x-row');
            row.textContent = _.repeat('a', this.width_);
            row.style.top = i * this.block_height_ + 'px';
            row.style.left = '0';
            this.rows_.push(row);
        }
        this.rows_.forEach(row => this.canvas_.appendChild(row));
        this.window_.dispatchEvent(new CustomEvent('resize', {
            detail: [
                Math.ceil(this.block_width_ * this.width_),
                Math.ceil(this.block_height_ * this.height_)
            ]}));
        // this.emitter_.fire(
        //     'resize', [
        //         this.block_width_ * this.width_,
        //         this.block_height_ * this.height_
        //     ]);
    }
    static testspan = <HTMLSpanElement>document.createElement('span');
    static spantext(content: string, style: TextStyle) {
        Canvas.testspan.style.cssText = style.toString();
        Canvas.testspan.textContent = content;
        return Canvas.testspan.outerHTML;
    }
    updateLine(i: number) {
        const text = this.texts_[i];
        const style = this.styles_[i];
        const offset = this.offsets_[i];
        const row = this.rows_[i];
        let pos = 0;
        let innertext = [];
        for (let j = 0; j < style.length; j++) {
            innertext.push(
                Canvas.spantext(
                    text.substr(pos, offset[j]), style[j]));
            pos += offset[j];
        }
        row.innerHTML = innertext.join('');
    }

    updateStyle() {
        // first we update the text style
        let newstyle = this.screen_.default_style.toString();
        if (this.canvas_.style.cssText != newstyle) {
            this.canvas_.style.cssText = newstyle;
        }
        // then we adjust the outer size height and width
        if (this.width_ != this.screen_.width
            || this.height_ != this.screen_.height) {
            this.updateScreen();
        }
    }

    updateCursor() {
        this.cursor_.moveCursor(this.screen_.cursorX, this.screen_.cursorY);
        this.cursor_.cursor_style = this.screen_.cursor_shape;
    }
}
