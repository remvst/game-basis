'use strict';

const PIXI = require('pixi.js');

const Button = require('./button');

const Timeline = require('animate').Timeline;
const Animation = require('animate').Animation;

const SIZE = 40;

class ColorButton extends Button {

    constructor(options) {
        super(options);

        this.color = options.color || 0xffffff;
    }

    get width() {
        return SIZE;
    }

    get height() {
        return SIZE;
    }

    createView() {
        const view = new PIXI.Graphics();

        view.beginFill(0x0);
        view.drawRect(2, 2, this.width, this.height);
        view.lineStyle(2, 0xffffff);
        view.beginFill(this.color);
        view.drawRect(0, 0, this.width, this.height);

        const arrowRadius = 15;

        view.arrow = new PIXI.Graphics();
        view.arrow.beginFill(0xffffff);
        view.arrow.moveTo(0, 0);
        view.arrow.lineTo(arrowRadius, -arrowRadius);
        view.arrow.lineTo(-arrowRadius, -arrowRadius);
        view.addChild(view.arrow);

        return view;
    }

    updateView() {
        super.updateView();

        if (!this.view) {
            return;
        }

        this.view.arrow.visible = this.focused;

        this.view.arrow.position.x = this.width / 2;
        this.view.arrow.position.y = -5;

        this.view.position.x = this.x;
        this.view.position.y = this.y;
    }

    setFocused(focused) {
        if (focused === this.focused) {
            return;
        }

        super.setFocused(focused);

        if (!this.interpolationPool || !focused) {
            return;
        }

        const d = 0.1;

        new Timeline()
            .add(0, new Animation(this.view.arrow).interp('alpha', 0, 1).during(d))
            .add(0, new Animation(this.view.arrow).interpFromOffset('position.y', -100).during(d))
            .run(this.interpolationPool);
    }
}

module.exports = ColorButton;
