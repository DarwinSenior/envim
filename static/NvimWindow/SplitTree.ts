/**
 * This class gives the inner representation of a split tree.
 * then it is possible to do operations on each of the trees
 * however, we think the tree will be responsible for the dom
 * manipulation
 * For a tree, there are two types of node, horizontal and vertical
 * and children nodes, for each type of nodes, the rules are different.
 * and each node has its own value.
 */
import * as _ from 'lodash'

export type Orientation = 'vertical' | 'horizontal';
type Info = { name: string, next: Orientation }

const o_map = new Map<Orientation, Info>([
    [
        'vertical',
        {
            name: 'x-window-vertical',
            next: 'horizontal'
        }
    ],
    [
        'horizontal',
        {
            name: 'x-window-horizontal',
            next: 'vertical'
        }
    ]
]);

abstract class Dragbar {
    protected element_: HTMLDivElement;
    protected parent_: HTMLDivElement;
    protected first_: HTMLDivElement;
    protected second_: HTMLDivElement;

    private ondrag_: boolean;
    attach(parent: HTMLDivElement) {
        this.element_ = this.create();
        this.parent_ = parent;
        this.parent_.appendChild(this.element_);
        this.element_.onmousedown = this.dragstart.bind(this);
        this.element_.onmousemove = this.dragmove.bind(this);
        this.element_.onmouseleave = this.dragend.bind(this);
        this.element_.onmouseup = this.dragend.bind(this);
    }

    remove() {
        this.parent_.removeChild(this.element_);
        this.element_ = null;
    }

    hook(first: HTMLDivElement, second: HTMLDivElement) {
        this.first_ = first;
        this.second_ = second;
    }

    private resize_event(eventname: string) {
        return new CustomEvent(eventname, {
            detail: {
                first: this.first_,
                second: this.second_
            }
        });
    }

    private dragstart(evt: MouseEvent) {
        this.reposition(evt);
        this.ondrag_ = true;
    }
    private dragmove(evt: MouseEvent) {
        if (this.ondrag_) {
            this.reposition(evt);
        }
    }

    private dragend(evt: MouseEvent) {
        this.ondrag_ = false;
    }

    protected abstract create(): HTMLDivElement;
    protected abstract reposition(evt: MouseEvent);
    protected abstract get pos(): number;
    protected abstract put();
}

class DragbarHorizontal extends Dragbar {

    get pos() {
        return this.element_.offsetLeft + this.element_.offsetWidth / 2;
    }

    create() {
        const element = <HTMLDivElement>document.createElement('x-dragebar-horizontal');
        return element;
    }

    reposition(evt: MouseEvent) {
        const x1 = this.first_.offsetLeft;
        const x2 = this.second_.offsetLeft + this.second_.offsetWidth;
        const x = Math.min(x2, Math.max(x1, evt.clientX));
        if (!this.first_ || !this.second_) return;
        this.first_.style.left = `${x1}px`;
        this.first_.style.width = `${x - x1}px`;
        this.second_.style.left = `${x}px`;
        this.second_.style.width = `${x2 - x}px`;
        this.element_.style.left = `${x}px`;
    }
    put(){
        this.element_.style.left = this.second_.style.left;
    }
}

class DragbarVertical extends Dragbar {

    get pos() {
        return this.element_.offsetTop + this.element_.offsetHeight / 2;
    }

    create() {
        const element = <HTMLDivElement>document.createElement('x-dragebar-vertical');
        return element;
    }

    reposition(evt: MouseEvent) {
        const y1 = this.first_.offsetLeft;
        const y2 = this.second_.offsetLeft + this.second_.offsetWidth;
        const y = Math.min(y2, Math.max(y1, evt.clientY));
        if (!this.first_ || !this.second_) return;
        this.first_.style.top = `${y1}px`;
        this.first_.style.height = `${y - y1}px`;
        this.second_.style.top = `${y}px`;
        this.second_.style.height = `${y2 - y}px`;
        this.element_.style.top = `${y}px`;
    }

    put(){
        this.element_.style.top = this.second_.style.top;
    }
}

class SplitNode {
    private children_ = new Array<SplitNode>();
    private element_: HTMLDivElement;
    private orientation_: Orientation;

    constructor(
        private parent_?: SplitNode
    ) {
        this.orientation_ = parent_ ? o_map.get(parent_.orientation_).next : 'horizontal';
        this.element_ = <HTMLDivElement>document.createElement(
            o_map.get(this.orientation_).name
        );
    }

    isleaf() {
        return this.children_.length == 0;
    }

    /**
     * If it is a leaf node and there is no split
     * we will split
     */
    split() {

    }
}
