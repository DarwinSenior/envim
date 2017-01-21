import { Screen } from './Screen'
import { Canvas } from './Canvas'
import { Cursor } from './Cursor'
import { Emitter } from './Event'
import { createNvim } from './Process'
import * as e from 'electron'
import { Nvim, RPCValue } from 'promised-neovim-client'
import './style.css'

function eventFeedback(
    emitter: Emitter,
    nvim: Nvim
) {

    emitter.on('resize', ([width, height]: [number, number]) => {
        console.log(width, height);
        nvim.emit(`resize ${width} ${height}`, true);
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
    nvim.uiAttach(width, height, true);
    nvim.on('notification', (command: string, args: RPCValue[]) => {
        if (command == 'redraw') {
            canvas.redraw(args);
        }
    });
    const current_window = e.remote.getCurrentWindow();

    window.onbeforeunload = () => {
        nvim.quit();
    }
    // canvas.window.addEventListener('resize', function fn(evt: CustomEvent){
    //     current_window.setContentSize(evt.detail[0], evt.detail[1]);
    //     canvas.window.removeEventListener('resize', fn);
    // });
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
    window['visuals'] = editorVisual;

    e.ipcRenderer.send('render-ready');
    e.ipcRenderer.on('nvim-start', async (evt, [width, height]: [number, number]) => {
        const nvim = await createNvim();
        attachUI(editorCanvas, nvim, width, height);
        eventFeedback(editorEmitter, nvim);
    });

});
