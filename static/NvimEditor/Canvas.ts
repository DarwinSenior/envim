import { Screen } from './Screen'
import { TextStyle, DefaultStyle, ExternalStyle } from './Style'
import { textWidth, textHeight } from './Measure'
import { Cursor } from './Cursor'
import { Emitter } from './Event'
import { Visual } from './Visual'
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
    private externalcss_: ExternalStyle;

    // this will calculate the size of each block
    private block_height_: number = 0;
    private block_width_: number = 0;

    // we will provide event listeners to use

    constructor(
        private screen_: Screen,
        private cursor_: Cursor,
        private visual_: Visual,
        private emitter_: Emitter,
    ) {
        this.window_.appendChild(this.canvas_);
        this.window_.appendChild(this.cursor_.element);
        this.window_.appendChild(this.visual_.element);
        this.emitter_.init(this.window_);
        this.window_.tabIndex = 0;
    }

    get window() {
        return this.window_;
    }

    redraw(commands: any[]) {
        commands.forEach((command) => {
            const [instruction, ...args] = command;
            if (this.screen_[instruction]) {
                args.forEach(arg => this.screen_[instruction](...arg));
            } else {
                console.log('ignored instruction: ' + instruction);
            }
        });
        this.updateScreen();
        this.updateStyle();
        this.updateCursor();
        this.updateContents();
        this.updateEffects();
    }

    private updateScreen() {
        // in this case, we probably need to redraw everything.
        // we first calcuate the size of our elements
        if (this.height_ != this.screen_.height
            || this.width_ != this.screen_.width) {
            this.height_ = this.screen_.height;
            this.width_ = this.screen_.width;

            // we then position everything
            this.rows_.forEach(row => this.canvas_.removeChild(row));
            this.rows_.length = 0;
            for (let i = 0; i < this.height_; i++) {
                let row = <HTMLDivElement>document.createElement('x-row');
                row.innerText = _.repeat(' ', this.width_);
                row.style.cssText = this.screen_.default_style.toString();
                this.rows_.push(row);
            }
            this.rows_.forEach(row => this.canvas_.appendChild(row));
        }
    }
    static testspan = <HTMLSpanElement>document.createElement('span');
    static spantext(content: string, style: TextStyle) {
        Canvas.testspan.style.cssText = style.toString();
        Canvas.testspan.innerText = content;
        return Canvas.testspan.outerHTML;
    }

    private updateContents() {
        const new_texts = this.screen_.texts;
        const [new_offsets, new_styles] = this.screen_.styles;
        for (let i = 0; i < this.height_; i++) {
            if (!_.isEqual(this.texts_[i], new_texts[i])
                || !_.isEqual(this.styles_[i], new_styles[i])
                || !_.isEqual(this.offsets_[i], new_offsets[i])) {
                this.texts_[i] = new_texts[i];
                this.styles_[i] = new_styles[i];
                this.offsets_[i] = new_offsets[i];
                this.updateLine(i);
            }
        }
    }

    /**
     *  helper function update one line
     */
    private updateLine(i: number) {
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

    /**
     *  it updates when the external style change
     *  it also tries to update the screen since
     *  when there is an resize event
     */
    private updateStyle() {
        // first we update the text style
        const css = new ExternalStyle(window.getComputedStyle(this.canvas_));
        if (!_.isEqual(css, this.externalcss_)) {
            this.externalcss_ = css;
            this.block_width_ = textWidth(css.fontStyle, 1);
            this.block_height_ = css.lineHeight;
            this.cursor_.setCursorSize(
                this.block_width_,
                this.block_height_
            );
            this.emitter_.setCurrentSize(
                this.block_width_,
                this.block_height_,
            );
        }
    }

    /*
     * it updates the cursor position
     * it also detects mode change,
     * it will change the cursor shape
     * correspond to different mode
     */
    private updateCursor() {
        const x = this.screen_.cursorX;
        const y = this.screen_.cursorY;
        const style = window.getComputedStyle(this.rows_[y]);
        // const left = this.block_width_ * x;
        const left = textWidth(`${style.fontSize} ${style.fontFamily}`, x);
        const top = this.rows_[y].offsetTop;
        this.cursor_.moveCursor(left, top);
        this.cursor_.cursor_style = this.screen_.cursor_shape;
    }

    /*
     * It will trigger effects including bell visual bell
     *
     */
    private updateEffects() {
        if (this.screen_.consume_visualbell()) {
            this.visual_.bell();
        }
        if (this.screen_.busy) {
            this.visual_.busy();
        } else {
            this.visual_.available();
        }
    }
}
