import { Nvim, RPCValue } from 'promised-neovim-client'

export class PluginRegister {
    notification_dispatcher_: Map<string, Function> = new Map();
    request_dispatch_: Map<string, Function> = new Map();
    constructor(
        private nvim: Nvim, // nvim instance
        private channel: number, // the channel number, I believe it to be 1
    ) {
        nvim.on('notification', this.notification.bind(this));
        nvim.on('request', this.request.bind(this));
    }

    notification(command: string, args: RPCValue[]){
        if (this.notification_dispatcher_.has(command)){
            let fn = this.notification_dispatcher_.get(command);
            fn(this.nvim, ...args);
        }
    }

    request(command: string, args: RPCValue[], rt: RPCValue){
        if (this.request_dispatch_.has(command)){
            let fn = this.notification_dispatcher_.get(command);
            fn.apply(fn, args);
        }
    }

    register_command(command: string, listener: (nvim: Nvim, ...args: string[])=>void, cmdflags?: string){
        cmdflags = cmdflags || '';
        this.nvim.command(`command! -nargs=* ${cmdflags} ${command} call rpcnotify(${this.channel}, "${command}", <f-args>)`, true);
        this.notification_dispatcher_.set(command, listener);
        console.log(this.notification_dispatcher_);
    }
}
