import { Screen } from './NvimEditor/Screen'
import { Canvas } from './NvimEditor/Canvas'
import { Cursor } from './NvimEditor/Cursor'
import { Visual } from './NvimEditor/Visual'
import { Emitter } from './NvimEditor/Event'
import { createNvim } from './NvimEditor/Process'
import { Nvim, RPCValue } from 'neovim-client/promise'
import './style.css'
import * as e from 'electron'

function eventFeedback(
    emitter: Emitter,
    nvim: Nvim
) {

    emitter.on('resize', ([width, height]: [number, number]) => {
        nvim.uiTryResize(width, height, false);
    });
    let keypresstack = {
        stack: [],
        input: nvim.input('')
    }
    emitter.on('keypress', async (key: string) => {
        if (key.length) keypresstack.stack.push(key);
        keypresstack.input;
        if (keypresstack.stack.length > 0) {
            keypresstack.input = nvim.input(keypresstack.stack.join(''));
            keypresstack.stack.length = 0;
        }
    });
}

function attachUI(
    canvas: Canvas,
    nvim: Nvim,
    width: number,
    height: number
) {
    nvim.on('notification', (command: string, args: RPCValue[]) => {
        if (command == 'redraw') {
            canvas.redraw(args);
        }
    });

    window.onbeforeunload = () => {
        nvim.quit();
    }
    // canvas.window.addEventListener('resize', function fn(evt: CustomEvent){
    //     let [width, height] = evt.detail;
    //     current_window.setContentSize(width, height);
    //     // canvas.window.removeEventListener('resize', fn);
    // });

    const current_window = e.remote.getCurrentWindow();
    nvim.on('disconnect', () => {
        window.onbeforeunload = undefined;
        nvim.removeAllListeners();
        current_window.close();
    });
    nvim.uiAttach(width, height, true);
}

document.addEventListener('DOMContentLoaded', () => {
    let editorScreen = new Screen();
    let editorCursor = new Cursor();
    let editorEmitter = new Emitter();
    let editorVisual = new Visual();
    let editorCanvas = new Canvas(
        editorScreen,
        editorCursor,
        editorVisual,
        editorEmitter
    );

    document.body.appendChild(editorCanvas.window);
    editorCursor.blink();
    window['_visual'] = editorVisual;
    window['_screen'] = editorScreen;
    window['_cursor'] = editorCursor;
    window['_canvas'] = editorCanvas;

    e.ipcRenderer.send('render-ready');
    e.ipcRenderer.on('nvim-start', async (evt, [width, height]: [number, number]) => {
        const nvim = await createNvim();
        attachUI(editorCanvas, nvim, width, height);
        eventFeedback(editorEmitter, nvim);
    });

});
