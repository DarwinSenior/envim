import {attach, Nvim} from 'promised-neovim-client'
import { spawn } from 'child_process'

export async function createNvim(){
    const neovim_proc = spawn('nvim', ['--embed']);
    let nvim = await attach(neovim_proc.stdin, neovim_proc.stdout);
    return nvim;
}
