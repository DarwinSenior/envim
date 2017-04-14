const {lib, hterm} = require("hterm-umdjs");
// import {lib, hterm} from './hterm_all'
import * as pty from 'pty.js'
import * as e from 'electron'
// we will use the hterm here
// since the api is relatively simple,
// I will just pretend it works
//
hterm.defaultStorage = new lib.Storage.Local();
export class Terminal {
    private element_ = <HTMLDivElement>document.createElement('x-term');
    private hterm_: any;
    private tty_: pty.Terminal;
    private io_;

    bind(
        hterm_profile: string,
        pty_config: Object
    ) {
        this.tty_ = pty.spawn('zsh', [], pty_config);
        this.hterm_ = new hterm.Terminal();
        this.hterm_.decorate(this.element_);
        this.hterm_.onTerminalReady = this.hterm_ready.bind(this);
    }
    get element() {
        return this.element_;
    }

    hterm_ready() {
        this.io_ = this.hterm_.io.push();
        this.io_.onVTKeystroke = (data) => this.tty_.write(data);
        this.io_.sendString = (data) => {
            this.tty_.write(data);
            console.log(data);
        }
        this.io_.onTerminalResize = (cols, rows) => this.tty_.resize(cols, rows);
        this.tty_.on('data', (data) => this.io_.print(data));
        // FIXME remove this and find a better way
        this.tty_.on('close', () => e.remote.getCurrentWindow().close());
        this.hterm_.installKeyboard();
        window['tty'] = this.tty_;
    }
}
