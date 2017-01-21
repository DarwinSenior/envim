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
export class Emitter {
    private emitter_ = new EventEmitter();
    private window_: HTMLDivElement;
    private block_height_: number = 0;
    private block_width_: number = 0;
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
            const x = Math.floor(evt.clientX/this.block_width_);
            const y = Math.floor(evt.clientY/this.block_height_);
            const key = `${keyname}<${x},${y}>`;
            this.emitter_.emit('keypress', key);
        });
        this.window_.addEventListener('mousewheel', (evt: MouseWheelEvent) => {
            const keyname = mousewhellevt2nvimkey(evt);
            const x = Math.floor(evt.clientX/this.block_width_);
            const y = Math.floor(evt.clientY/this.block_height_);
            const key = `${keyname}<${x},${y}>`;
            this.emitter_.emit('keypress', key);
            console.log(key);
        });
        window.addEventListener('resize', (evt) => {
        })
    }
    setCursorSize(width: number, height: number){
        this.block_width_ = width;
        this.block_height_ = height;
    }
    on(evt_type: CanvasEventType, fn: Function) {
        this.emitter_.on(evt_type, fn);
    }
}
