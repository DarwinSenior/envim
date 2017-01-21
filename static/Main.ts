import { Screen } from './Screen'
import { Canvas } from './Canvas'
import { Cursor } from './Cursor'
import { createNvim } from './Process'
import * as e from 'electron'
import { Nvim, RPCValue } from 'promised-neovim-client'
import './style.css'



async function attachUI(canvas: Canvas, nvim: Nvim, width: number, height: number) {
    nvim.uiAttach(width, height, true);
    nvim.on('notification', (command: string, args: RPCValue[]) => {
        if (command == 'redraw') {
            canvas.redraw(args);
        }
    });
    const current_window = e.remote.getCurrentWindow();

    let keypresstack = {
        stack: [],
        input: nvim.input('')
    }
    canvas.on('keypress', async (key: string) => {
        if (key.length) keypresstack.stack.push(key);
        await keypresstack.input;
        if (keypresstack.stack.length > 0) {
            keypresstack.input = nvim.input(keypresstack.stack.join(''));
            keypresstack.stack.length = 0;
        }
    });

    canvas.on('resize', ([width, height]: [number, number]) => {
        console.log(width, height);
        // current_window.setContentSize(width, height);
    });

    window.onbeforeunload = () => {
        nvim.quit();
    }
    nvim.on('disconnect', () => {
        window.onbeforeunload = undefined;
        nvim.removeAllListeners();
        current_window.close();
    });
}
document.addEventListener('DOMContentLoaded', () => {
    let editorScreen = new Screen();
    let editorCursor = new Cursor();
    let editorCanvas = new Canvas(editorScreen, editorCursor);

    document.body.appendChild(editorCanvas.window);
    editorCursor.blink();

    e.ipcRenderer.send('render-ready');
    e.ipcRenderer.on('nvim-start', async (evt, [width, height]: [number, number]) => {
        const nvim = await createNvim();
        await attachUI(editorCanvas, nvim, width, height);
    });

});
