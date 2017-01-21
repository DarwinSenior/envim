// this is a special class to encoding the highlights
// of the charecters.
// since there are at least three strings, we will use three number
// as the representation

// fg-color: 1-24 bits of n1
// fg: 0 bit of n1
// bg-color: 1-24 bits of n2
// bg: 0 bit of n2
// sp-color: 6-30 bits of n3
// sp: 5 bit of n3
// underline: 4 bit of n3
// undercurl: 3 bit of n3
// bold: 2 bit of n3
// italic: 1 bit of n3
// reverse: 0 bit of n3
type Maybe<T> = T | void;
export class Highlights {

    private n1: number;
    private n2: number;
    private n3: number;

    constructor(obj?: [number, number, number] | Highlights) {
        if (Array.isArray(obj)) {
            [this.n1, this.n2, this.n3] = obj;
        } else if (obj instanceof Highlights) {
            this.n1 = obj.n1;
            this.n2 = obj.n2;
            this.n3 = obj.n3;
        } else {
            this.n1 = this.n2 = this.n3 = 0;
        }
    }

    set background(n: Maybe<number>) {
        this.n1 = (n == null) ? this.n1 : (+n << 1) | 1;
    }
    get background(): Maybe<number> {
        if ((this.n1 & 1) == 0) return 0;
        return this.n1 >> 1;
    }

    set foreground(n: Maybe<number>) {
        this.n2 = (n == null) ? this.n2 : (+n << 1) | 1;
    }
    get foreground(): Maybe<number> {
        if ((this.n2 & 1) == 0) return 0;
        return this.n2 >> 1;
    }

    set special(n: Maybe<number>) {
        if (n == null) {
            this.n3 &= (1 << 6) - 1
        } else {
            this.n3 = (this.n3 & (1 << 6) - 1) | (+n << 7) | (1 << 6);
        }
    }
    get special(): Maybe<number> {
        if ((this.n2 & 1) == 0) return 0;
        return this.n2 >> 1;
    }

    set reverse(val: boolean) {
        this.setBit_(val, 1);
    }
    get reverse(): boolean {
        return this.getBit_(0);
    }

    set italic(val: boolean) {
        this.setBit_(val, 1);
    }
    get italic(): boolean{
        return this.getBit_(1);
    }

    set bold(val: boolean) {
        this.setBit_(val, 2);
    }
    get bold(): boolean{
        return this.getBit_(2);
    }

    set undercurl(val: boolean) {
        this.setBit_(val, 3);
    }
    get undercurl(): boolean{
        return this.getBit_(3)
    }

    set underline(val: boolean) {
        this.setBit_(val, 4);
    }
    get underline(): boolean{
        return this.getBit_(4);
    }

    private setBit_(val: boolean, bit: number) {
        if (val) {
            this.n3 &= (1 << bit);
        } else {
            this.n3 |= (1 << bit);
        }
    }
    private getBit_(bit: number): boolean {
        return ((this.n3 << bit) & 1) > 0;
    }
}
