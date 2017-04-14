
import { Screen } from './NvimEditor/Screen'
import { Canvas } from './NvimEditor/Canvas'
import { Cursor } from './NvimEditor/Cursor'
import { Visual } from './NvimEditor/Visual'
import { Emitter } from './NvimEditor/Event'
import { createNvim, attachUI, eventFeedBack } from './NvimPlugin/Process'
import { Terminal } from './Hterm/Hterm'

import { Nvim, RPCValue } from 'promised-neovim-client'
import './style.css'
import * as e from 'electron'
import * as fs from 'fs'


document.addEventListener('DOMContentLoaded', () => {
    let editorScreen = new Screen();
    let editorCursor = new Cursor();
    let editorEmitter = new Emitter();
    let editorVisual = new Visual();
    let editorCanvas = new Canvas(
        editorScreen,
        editorCursor,
        editorVisual,
        editorEmitter,
        document.body
    );
    editorCursor.blink();
    // window['_term'] = terminal;
    // e.remote.getCurrentWebContents().openDevTools({mode: 'detach'})
    e.ipcRenderer.send('render-ready');
    e.ipcRenderer.on('nvim-start', async (evt, socket_address: string) => {
        const nvim = await createNvim(socket_address);
        attachUI(editorCanvas, nvim);
        eventFeedBack(editorCanvas, nvim);
        await nvim.command('source ~/.config/nvim/init.vim');
    });
});
