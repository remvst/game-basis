'use strict';

const ClickableArea = require('../interaction/clickable-area');

class Button extends ClickableArea {

    constructor(options) {
        super();

        this.x = options.x || 0;
        this.y = options.y || 0;
        this.enabled = !!options.enabled;
        this.isDown = false;

        this.actionCallback = options.actionCallback;

        this.interpolationPool = null; // to be set after being instantiated

        this.setFocused(false);
    }

    getView() {
        if (!this.view) {
            this.view = this.createView();
        }

        this.updateView();

        return this.view;
    }

    createView() {
        return null;
    }

    updateView() {

    }

    action() {
        if (!this.isDown) {
            return;
        }

        this.isDown = false;

        if (this.actionCallback) {
            this.actionCallback();
        }

        this.updateView();
    }

    contains(x, y) {
        return Math.inRectangle(x, y, this.x, this.y, this.width, this.height);
    }

    move(x, y) { // jshint ignore:line
        // no-op
    }

    center() {
        return {
            'x': this.x,
            'y': this.y
        };
    }

    down() {
        this.isDown = true;
        this.setFocused(true);
        this.updateView();
    }

    cancel() {
        this.isDown = false;
        this.updateView();
    }

    setFocused(b) {
        if (b === this.focused) {
            return;
        }

        this.focused = b;
        this.updateView();
    }

    setEnabled(b) {
        if (b === this.enabled) {
            return;
        }

        this.enabled = b;
        this.updateView();
    }

}

module.exports = Button;
