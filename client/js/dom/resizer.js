'use strict';

class Resizer {

    constructor(options) {
        this.element = options.element;
        this.ratio = options.ratio;
    }

    setup() {
        window.addEventListener('resize', () => this.resize(), false);
        this.resize();
    }

    resize() {
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        const availableRatio = maxWidth / maxHeight;

        let width,
            height;

        if(availableRatio <= this.ratio){
            width = maxWidth;
            height = width / this.ratio;
        }else{
            height = maxHeight;
            width = height * this.ratio;
        }

        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';
    }

}

module.exports = Resizer;
