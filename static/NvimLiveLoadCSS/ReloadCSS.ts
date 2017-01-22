import { Nvim, RPCValue } from 'promised-neovim-client'
import * as e from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { PluginRegister } from './Util'
// this is a plugin, thus we will register for the script once we loaded in

/**
 * we assume there is only one browser availabe
 */
const readfile = async (filename: string) =>
    new Promise<string>((r, c) => fs.readFile(filename, 'utf-8', (e, d) => e ? c(e) : r(d)));

export function loadReloadCSS(register: PluginRegister, browser: Electron.BrowserWindow) {
    const livestyles = document.createElement('style');
    livestyles.id = 'live-style';
    // to insert at the very beginning because it might get overwritten
    document.head.insertBefore(livestyles, document.head.firstChild);
    register.register_command('CSSLoad', async (nvim: Nvim, ...filenames: string[]) => {
        const cur_dir = <string>await nvim.eval('getcwd()');
        let styles = await Promise.all(filenames.map(filename => {
            let filepath = path.join(cur_dir, filename);
            if (fs.existsSync(filepath) && filename.endsWith('.css')) {
                return readfile(filepath);
            } else {
                return '';
            }
        }));
        livestyles.innerHTML = styles.join('\n');
        nvim.command('echo "styles loaded"', true);
    }, '-complete=file');
}

