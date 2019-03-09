'use strict';

const PIXI = require('pixi.js');

const Button = require('./button');

const Animation = require('animate').Animation;

class TextButton extends Button {

    constructor(options) {
        options.enabled = !options.disabled;
        super(options);

        this.label = options.label || '';
        this.fontSize = options.fontSize || 36;

        this.isDown = false;

        this.view = this.createView();
        this.view.debugLabel = 'TextButton';
        this.updateView();
    }

    createView() {
        const view = new PIXI.Container();

        this.labelText = new PIXI.Text('', {
            'fill': '#fff',
            'fontFamily': 'Gameplay',
            'fontSize': this.fontSize,
            'dropShadow': true,
            'dropShadowColor': '#000',
            'dropShadowAngle': Math.PI / 2,
            'dropShadowDistance': 3
        });
        view.addChild(this.labelText);

        return view;
    }

    setLabel(label) {
        this.label = label.toString();
        this.updateView();
    }

    updateView() {
        super.updateView();

        if (!this.view) {
            return;
        }

        this.view.position.x = this.x;
        this.view.position.y = this.y;

        this.labelText.text = '+ ' + this.label;

        if (this.isDown) {
            this.labelText.style.fill = '#000';
        } else if (this.focused) {
            this.labelText.style.fill = '#fff';
        } else {
            this.labelText.style.fill = '#999';
        }

        this.labelText.updateText();

        this.labelText.alpha = this.enabled ? 1 : 0.5;
    }

    get width() {
        return 450;
    }

    get height() {
        return this.labelText.height;
    }

    setFocused(focused) {
        if (focused === this.focused) {
            return;
        }

        super.setFocused(focused);

        if (!this.labelText) {
            return;
        }

        const targetX = this.focused ? -50 : 0;

        if (!this.interpolationPool) {
            this.labelText.position.x = targetX;
            return;
        }

        new Animation(this.labelText).interpTo('position.x', targetX).during(0.1)
            .run(this.interpolationPool);
    }

}

module.exports = TextButton;
