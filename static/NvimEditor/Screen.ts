import { fromAttribute2Style, TextStyle, DefaultStyle } from './Style'
import * as _ from 'lodash'
/**
 *  This is the class to represent the screen object
 *  This representation is to mimic the representation
 *  from the hterm shell, however, since the most of
 *  lifting work has been handled by the neovim itself
 *  here we simplifies the representation so that we
 *  only need to fullfil the api provided by the neovim
 *  and at the same time maintaining the state of the program
 */
export class Screen {
    static modeMouseMap = new Map([
        ['normal', 'block'],
        ['visual', 'block'],
        ['insert', 'ibeam'],
        ['cmdline', 'ibeam'],
        ['terminal', 'hide'],
    ]);
    // how many rows are there in the terminal
    private height_: number = 0;
    // how many columns are there in the terminal
    private width_: number = 0;
    // the current position of the mouse, (x, y) coordianate
    private cu_pos_: [number, number] = [0, 0];

    // set the scroll region (top, bottom, left, right)
    private scroll_region_: [number, number, number, number] = [0, 0, 0, 0];

    // set the fg color, mutable state
    // since there are 8 attributes, we could encode and
    // decode the attributes each with one bit
    // and we could get the result
    private default_style_: DefaultStyle = new DefaultStyle((1 << 24) - 1, 0, (1 << 24) - 1);;
    private nullcode = ' ';
    private nullstyle = fromAttribute2Style({}, this.default_style_);
    private current_style_: TextStyle = this.nullstyle;
    // text internally was stored as the utf-8 string
    // we could then compare and change the corresponding
    // reprensentation
    private dirty_: boolean[] = [];
    private texts_: string[][] = [];
    private styles_: TextStyle[][] = [];
    // determine the current mode of the editor

    // this will be consumed, and after
    private visualbell_: boolean;
    // events like busy on and busy off
    private busy_: boolean;

    private mode_: string;
    constructor() {
    }

    /**
     * this function consumes a visual bell
     * it returns false is visual bell is not set
     * it returns true if there is a visual bell waiting
     * to be consumed, and we also consume this visual bell
     */
    consume_visualbell() {
        const visualbell = this.visualbell_;
        this.visualbell_ = false;
        return visualbell;
    }

    get busy(): boolean {
        return this.busy_;
    }

    get cursor_shape(): string {
        if (!Screen.modeMouseMap.has(this.mode_) && this.mode_) console.log("unhandled mode: " + this.mode_);
        return Screen.modeMouseMap.get(this.mode_) || 'block';
    }
    get height(): number {
        return this.height_;
    }
    get width(): number {
        return this.width_;
    }
    // the texts is an array of strings that each string represent each line
    get texts(): string[] {
        let texts = this.texts_.map(
            (chars, i) => this.dirty_[i] ? chars.join('') : null);
        return texts;
    }

    get cursorX(): number {
        return this.cu_pos_[0];
    }

    get cursorY(): number {
        return this.cu_pos_[1];
    }

    // the style is an array of style that each (number, style) represent
    // the style and how long the string is from that style
    get styles(): [number[][], TextStyle[][]] {
        let textstyles = new Array<TextStyle[]>();
        let offsets = new Array<number[]>();
        this.styles_.forEach((linestyle, i) => {
            if (!this.dirty_[i]) {
                textstyles.push(null);
                offsets.push(null);
                return;
            }
            let offset = new Array<number>();
            let textstyle = new Array<TextStyle>();
            let pos = 0;
            while (pos < this.width_) {
                let cur_style = linestyle[pos];
                let counter = 1;
                while (_.eq(cur_style, linestyle[pos + counter]))
                    counter++;
                offset.push(counter);
                textstyle.push(cur_style);
                pos += counter;
            }
            textstyles.push(textstyle);
            offsets.push(offset);
        });
        return [offsets, textstyles];
    }
    get default_style(): DefaultStyle {
        return this.default_style_;
    }

    // remove all the texts on the screen
    clear() {
        this.clearRange(0, this.height_, 0, this.width_);
    }

    clean() {
        this.dirty_.fill(false);
    }

    mode_change(mode: string) {
        this.mode_ = mode;
    }

    resize(width: number, height: number) {
        const old_styles = this.styles_;
        const old_texts = this.texts_;
        const old_height = this.height_;
        const old_width = this.width_;
        this.height_ = height;
        this.width_ = width;
        this.styles_ = [];
        this.texts_ = [];
        for (let y = 0; y < height; y++) {
            let style = [];
            let text = [];
            for (let x = 0; x < width; x++) {
                if (x < old_width && y < old_height) {
                    style.push(old_styles[y][x]);
                    text.push(old_texts[y][x]);
                } else {
                    style.push(this.nullstyle);
                    text.push(this.nullcode);
                }
            }
            this.styles_.push(style);
            this.texts_.push(text);
        }
        this.cu_pos_ = [0, 0];
        this.dirty_ = new Array(height).fill(true);
    }

    // clear EOL
    eol_clear() {
        const [x, y] = this.cu_pos_;
        this.clearRange(y, y + 1, x, this.width_);
    }

    update_fg(fg: number) {
        if (fg == -1) {
            this.default_style_.foreground = (1 << 24) - 1;
        } else { this.default_style_.foreground = fg; }
    }

    update_bg(bg: number) {
        if (bg == -1) {
            this.default_style_.background = 0;
        } this.default_style_.background = bg;
    }

    update_sp(sp: number) {
        this.default_style_.special = sp;
    }

    highlight_set(attrs: Object) {
        this.current_style_ = fromAttribute2Style(attrs, this.default_style_);
    }

    cursor_goto(row: number, col: number) {
        this.cu_pos_ = [col, row];
    }

    set_scroll_region(top: number, bottom: number, left: number, right: number) {
        this.scroll_region_ = [top, bottom + 1, left, right];
    }

    scroll(count: number) {
        const [top, bottom, left, right] = this.scroll_region_;
        if (count > 0) {
            for (let i = top + count; i < bottom; i++) {
                this.copyLineRange(i - count, i, left, right);
            }
            this.clearRange(bottom - count, bottom, left, right);
        } else {
            // easier if use positive number
            count = -count;
            for (let i = bottom - count - 1; i >= top; i--) {
                this.copyLineRange(i + count, i, left, right);
            }
            this.clearRange(top, top + count, left, right);
        }
    }

    put(...text: string[]) {
        let [x, y] = this.cu_pos_;
        for (var i = 0; i < text.length; i++) {
            this.texts_[y][x + i] = text[i];
            this.styles_[y][x + i] = this.current_style_;
        }
        this.cu_pos_ = [x + i, y];
        this.dirty_[y] = true;
    }

    visual_bell() {
        this.visualbell_ = true;
    }

    bell() {
        this.visualbell_ = true;
    }

    busy_start() {
        this.busy_ = true;
    }

    busy_stop() {
        this.busy_ = false;
    }

    private clearRange(top: number, bottom: number, left: number, right: number) {
        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                this.texts_[y][x] = this.nullcode;
                this.styles_[y][x] = this.nullstyle;
            }
        }
        this.dirty_.fill(true, top, bottom);
    }

    private copyLineRange(ydst: number, ysrc: number, start: number, end: number) {
        for (let x = start; x < end; x++) {
            this.texts_[ydst][x] = this.texts_[ysrc][x];
            this.styles_[ydst][x] = this.styles_[ysrc][x];
        }
        this.dirty_[ydst] = true;
    }
}
