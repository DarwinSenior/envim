import { attach, Nvim, RPCValue } from 'promised-neovim-client'
import { Canvas } from '../NvimEditor/Canvas'
import { Socket } from 'net'
import { evalExpression, executeScript } from './Loader'
import * as e from 'electron'
import * as fs from 'fs'

export function eventFeedBack({emitter}: Canvas, nvim: Nvim) {
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

export function attachUI(canvas: Canvas, nvim: Nvim) {
    const current_window = e.remote.getCurrentWindow();
    nvim.on('notification', (command: string, args: RPCValue[]) => {
        if (command == 'redraw') {
            canvas.redraw(args);
        }
        else if (command == 'envim-script-eval') {
            let [script, space] = <string[]>args;
            executeScript(script, nvim, canvas, space);
        }
        else if (command == 'envim-script-load-file') {
            let [filepath, space] = <string[]>args;
            fs.readFile(filepath, 'utf8', (err, script) => {
                if (err) throw err;
                executeScript(script, nvim, canvas, space);
            });
        }
    });
    nvim.on('request', async (command: string, args: RPCValue[], res) => {
        if (command == 'envim-simple-eval') {
            let [script] = <string[]>args;
            let val = evalExpression(script);
            res.send(val);
        }
        if (command == 'envim-script-load-file') {
            let [filepath, space] = <string[]>args;
            let val = await new Promise((resolve) => {
                fs.readFile(filepath, 'utf8', (err, script) => {
                    if (err) {
                        resolve({ 'error': err });
                    } else {
                        return resolve(
                            executeScript(script, nvim, canvas, space)
                        );
                    }
                });
            });
            res.send(val || null);
        }
        if (command == 'envim-script-execute') {
            let [script, space] = <string[]>args;
            let val = executeScript(script, nvim, canvas, space);
            res.send(val);
        }
    })
    nvim.on('disconnect', () => {
        window.onbeforeunload = undefined;
        nvim.removeAllListeners();
        current_window.close();
    });
    window.onbeforeunload = () => nvim.quit();
    // const [width, height, ,] = canvas.dimension;
    const [width, height] = [100, 100];
    nvim.uiAttach(width, height, true);
}

export async function createNvim(socket_address: string) {
    // const neovim_proc = spawn('nvim', ['--embed', '-u', 'NONE']);
    const socket = new Socket();
    socket.connect(socket_address);
    let nvim = await attach(socket, socket);
    await nvim.command(`let g:envim_notify_number=${1}`);
    await nvim.command(`let g:envim=1`);
    return nvim;
}
