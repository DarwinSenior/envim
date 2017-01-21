import { attach, RPCValue, Nvim } from 'promised-neovim-client'
import { spawn } from 'child_process'
import { app, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs';

export async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    const browser = new BrowserWindow({
        // frame: false,
    });
    browser.setMenu(null);
    browser.loadURL("file://" + __dirname + '/index.html');
    console.log(`file://${__dirname}/index.html`)
    browser.webContents.openDevTools({mode: 'detach'});
    ipcMain.on('render-ready', (e)=>{
        e.sender.send('nvim-start', [150, 40]);
    })
    await new Promise(r => browser.on('close', r));
    app.quit();
}

app.on('ready', main);
