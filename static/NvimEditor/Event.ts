import { EventEmitter } from 'events'
import {
    keyevt2nvimkey,
    mouseevt2nvimkey,
    mousewhellevt2nvimkey
} from './Keyboard'

export type CanvasEventType =
    'resize' | 'restyle' | 'keypress' | 'click'

const CanvasEventTypes = <CanvasEventType[]>[
    'resize', 'restyle', 'keypress', 'click'
];

export const intercepted_events = ['keydown', 'mousedown', 'mousewheel'];
export class Emitter {
    private emitter_ = new EventEmitter();
    private window_: HTMLDivElement;
    private block_height_ = 0;
    private block_width_ = 0;
    private rows_ = 0;
    private cols_ = 0;

    // for dragging event
    private ondrag = false;
    init(window_: HTMLDivElement) {
        this.window_ = window_;
        // so that the window is indexable
        this.window_.tabIndex = 1;
        this.window_.addEventListener('keydown', (evt: KeyboardEvent) => {
            let key = keyevt2nvimkey(evt);
            if (key) {
                this.emitter_.emit('keypress', key);
            }
        });
        this.window_.addEventListener('mousedown', (evt: MouseEvent) => {
            const keyname = mouseevt2nvimkey(evt);
            const x = Math.floor(evt.clientX / this.block_width_);
            const y = Math.floor(evt.clientY / this.block_height_);
            const key = `${keyname}<${x},${y}>`;
            this.ondrag = true;
            this.emitter_.emit('keypress', key);
        });
        this.window_.addEventListener('mousemove', (evt: MouseEvent) => {
            if (this.ondrag) {
                const keyname = mouseevt2nvimkey(evt);
                const x = Math.floor(evt.clientX / this.block_width_);
                const y = Math.floor(evt.clientY / this.block_height_);
                const key = `${keyname}<${x},${y}>`;
                this.emitter_.emit('keypress', key);
            }
        });
        this.window_.addEventListener('mousewheel', (evt: MouseWheelEvent) => {
            const keyname = mousewhellevt2nvimkey(evt);
            const x = Math.floor(evt.clientX / this.block_width_);
            const y = Math.floor(evt.clientY / this.block_height_);
            const key = `${keyname}<${x},${y}>`;
            this.emitter_.emit('keypress', key);
        }, <any>{ passive: true });
        let unfocus = () => this.ondrag = false;
        this.window_.addEventListener('mouseup', unfocus);
        this.window_.addEventListener('blur', unfocus);
        this.window_.addEventListener('mouseout', unfocus);
        window.addEventListener('resize', (evt) => {
            const rows = Math.ceil(window.innerHeight / this.block_height_);
            const cols = Math.ceil(window.innerWidth / this.block_width_);
            if (this.rows_ != rows || this.cols_ != cols) {
                this.rows_ = rows;
                this.cols_ = cols;
                this.emitter_.emit('resize', [cols, rows]);
            }
        });
    }
    // update the current size
    setCurrentSize(block_width: number, block_height: number) {
        const new_rows = Math.ceil(window.innerHeight / block_height);
        const new_cols = Math.ceil(window.innerWidth / block_width);
        this.block_width_ = block_width;
        this.block_height_ = block_height;
        if (new_rows != this.rows_ || new_cols != this.cols_){
            this.cols_ = new_cols;
            this.rows_ = new_rows;
            this.emitter_.emit('resize', [this.cols_, this.rows_]);
        }
    }
    on(evt_type: CanvasEventType, fn: Function) {
        this.emitter_.on(evt_type, fn);
    }
}
