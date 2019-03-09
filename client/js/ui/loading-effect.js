'use strict';

const PIXI = require('pixi.js');

const Gauge = require('../ui/gauge');

class LoadingEffect extends PIXI.Container {
    constructor(options) {
        super();

        this.soundManager = options.soundManager;

        this.labelOverride = null;

        this.gauge = new Gauge({
            'width': options.width,
            'height': options.height
        });
        this.addChild(this.gauge);

        this.label = new PIXI.Text('', {
            'fill': 'white',
            'fontFamily': 'Arial',
            'fontSize': 50,
            'align': 'center'
        });
        this.label.anchor.x = 0.5;
        this.label.anchor.y = 0.5;
        this.label.position.x = options.width / 2;
        this.label.position.y = -50;
        this.addChild(this.label);
    }

    get progress() {
        return this.gauge.value;
    }

    set progress(progress) {
        this.gauge.value = progress;

        if (this.labelOverride) {
            this.label.text = this.labelOverride;
        } else if (progress < 1) {
            this.label.text = Math.round(progress * 100) + '%';
        } else {
            this.label.text = 'Ready';
        }
    }

    setLabel(label) {
        this.labelOverride = label;
    }
}

module.exports = LoadingEffect;
