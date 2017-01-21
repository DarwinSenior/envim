import { intercepted_events } from './Event'

/**
 * this will represent a class
 */
export class Visual {
    static bell_class = 'bell';
    static bell_animation = 'visualbell-animation';
    static busy_class = 'busy';
    static available_class = 'available';

    private element_: HTMLDivElement = <HTMLDivElement>document.createElement('x-visual');
    private intercept_events_: boolean;

    constructor() {
        this.intercept_events_ = false;
        intercepted_events.forEach(evt =>
            this.element_.addEventListener(evt, this.prevent_event.bind(this)));
        this.element_.appendChild(document.createElement('x-loader'))
        this.element_.addEventListener('animationend',
            (evt: AnimationEvent) => {
                if (evt.animationName == Visual.bell_animation){
                    this.element_.classList.remove(Visual.bell_class);
                }
            });
    }

    get element() {
        return this.element_;
    }

    private prevent_event(evt) {
        // this event will prevent the window to recieve any events
        if (this.intercept_events_) {
            console.log('intercepted');
            evt.stopPropagation();
        }
    }

    bell() {
        this.element_.classList.add(Visual.bell_class);
    }
    /**
     *
     */
    busy() {
        this.intercept_events_ = true;
        this.element_.classList.add(Visual.busy_class);
        this.element_.classList.remove(Visual.available_class);
    }
    /**
     *
     */
    available() {
        this.intercept_events_ = false;
        this.element_.classList.remove(Visual.busy_class);
        this.element_.classList.add(Visual.available_class);
    }
}
