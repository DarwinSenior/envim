import { attach, RPCValue, Nvim } from 'promised-neovim-client'
import { spawn } from 'child_process'
import { app, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs';
import { v4 } from 'uuid';
import { Socket } from 'net';

export async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    const browser = new BrowserWindow({
        webPreferences: { experimentalFeatures: true },
        icon: `file://${__dirname}/assets/neovim-icon.ico`,
    });
    browser.setMenu(null);
    if (!fs.existsSync('/tmp/envim')) fs.mkdirSync('/tmp/envim');
    const socket_location = `/tmp/envim/${v4()}.sock`;
    const nvim = spawn('nvim', [
        '-u',
        'NONE',
        '--headless',
        ...process.argv.slice(2)
    ], {
        cwd: process.env['PWD'],
        env: Object.assign({ 'NVIM_LISTEN_ADDRESS': socket_location }, process.env)
    });
    browser.loadURL("file://" + __dirname + '/index.html');
    ipcMain.on('render-ready', (e) => {
        e.sender.send('nvim-start', socket_location);
    });
    await new Promise(r => browser.on('close', r));
    app.quit();
}

app.on('ready', main);
