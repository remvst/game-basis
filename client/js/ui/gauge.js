'use strict';

const PIXI = require('pixi.js');

const Timeline = require('animate').Timeline;
const Animation = require('animate').Animation;

const PIXIUtils = require('../util/pixi-utils');

class Gauge extends PIXI.Container {
    constructor(options) {
        super();

        this.trackWidth = options.width;
        this.trackHeight = options.height;

        this.track = new PIXI.Graphics();
        this.track.beginFill(0x888888);
        this.track.drawRect(0, 0, options.width, options.height);
        this.addChild(this.track);

        this.loader = new PIXI.Graphics();
        this.loader.beginFill(0xffffff);
        this.loader.drawRect(0, 0, options.width, options.height);
        this.addChild(this.loader);

        this.value = 0;
    }

    get value() {
        return this.currentValue;
    }

    set value(value) {
        this.currentValue = Math.between(0, value, 1);
        this.loader.scale.x = this.currentValue;
    }

    setValueWithAnimation(value) {
        const oldValue = this.value;
        const diff = value - this.value;

        if (diff === 0) {
            return;
        }

        this.value = value;

        if (diff < -0.05) {
            const diffView = new PIXI.Graphics();
            diffView.beginFill(0xffffff);
            diffView.drawRect(0, 0, diff * this.trackWidth, this.trackHeight);
            diffView.endFill();
            diffView.position.x = oldValue * this.trackWidth;
            this.addChild(diffView);

            return new Timeline()
                .add(0, new Animation(diffView).interp('alpha', 1, 0).during(0.3))
                .add(0, new Animation(diffView).interp('position.y', 0, 20, Math.easeInQuart).during(0.3))
                .add(() => PIXIUtils.remove(diff));
        } else if (diff > 0) {
            const diffView = new PIXI.Graphics();
            diffView.beginFill(0x00ff00);
            diffView.drawRect(0, 0, -diff * this.trackWidth, this.trackHeight);
            diffView.endFill();
            diffView.position.x = this.value * this.trackWidth;
            this.addChild(diffView);

            return new Timeline()
                .add(0, new Animation(diffView).interp('alpha', 1, 0).during(0.5))
                .add(0, new Animation(diffView).interp('scale.x', 1, 0).during(0.5))
                .add(() => PIXIUtils.remove(diff));
        }
    }
}

module.exports = Gauge;
