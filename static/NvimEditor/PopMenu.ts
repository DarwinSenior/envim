
export class PopMenu{
    private element_: HTMLDivElement = <HTMLDivElement>document.createElement('<x-menu>');
    private rows_: HTMLDivElement[] = [];
    private selected_ = -1;

    get element(){
        return this.element_;
    }

    menuhide(){
        this.element.style.display = 'none';
        this.selected_ = -1;
    }

    menushow(items, row, col){
        this.element.style.display = 'block';
    }
}
