'use strict';

const PIXI = require('pixi.js');
const Rx = require('rxjs/Rx');

const InterpolationPool = require('animate').InterpolationPool;
const Keyboard = require('../interaction/keyboard');
const Gamepad = require('../interaction/gamepad');
const SoundPool = require('../sound/sound-pool');

const ArrayUtils = require('../../../shared/util/array-utils');

const PIXIUtils = require('../util/pixi-utils');

class Screen {

    constructor() {
        this.game = null; // To be set by the game
        this.hideCursor = true;
    }

    getId() {
        throw new Error('Unimplemented getId() for screen');
    }

    setup() {
        this.clickableAreas = [];
        this.currentArea = null;
        this.subscriptions = [];
        this.age = 0;
        this.focusedArea = null;

        this.rx = {};
        this.rx.cycle = new Rx.Subject();
        this.rx.postCycle = new Rx.Subject();
        this.rx.foreground = new Rx.BehaviorSubject(false);
        this.rx.keyDown = new Rx.Subject();
        this.rx.keyUp = new Rx.Subject();
        this.rx.isKeyDown = key => {
            const down = this.rx.keyDown.filter(k => k === key).map(() => true);
            const up = this.rx.keyUp.filter(k => k === key).map(() => false);
            return Rx.Observable.merge(up, down);
        };
        this.rx.buttonDown = new Rx.Subject();
        this.rx.buttonUp = new Rx.Subject();
        this.rx.axisChange = new Rx.Subject();
        this.rx.destroy = new Rx.Subject();

        this.view = new PIXI.Container();
        this.view.debugLabel = 'Screen/' + this.getId();

        this.interpolationPool = new InterpolationPool();

        this.soundPool = new SoundPool(this.game.soundManager);

        this.subscription(this.rx.keyDown
            .filter(key => key === Keyboard.ENTER))
            .subscribe(() => this.interpolationPool.skip());

        this.subscription(this.rx.buttonDown
            .filter(event => event.buttonIndex === Gamepad.BUTTON_ACTION_BOTTOM))
            .subscribe(() => this.interpolationPool.skip());
    }

    destroy() {
        PIXIUtils.remove(this.view);
        this.view = null;
        this.interpolationPool = null;
        this.focusedArea = null;
        this.soundPool.stopAll();
        this.rx.destroy.next();
    }

    foreground() {
        this.rx.foreground.next(true);
    }

    background() {
        this.soundPool.stopAll();
        this.rx.foreground.next(false);
    }

    cycle(e) {
        this.age += e;
        this.rx.cycle.next(e);
    }

    postCycle(e) {
        this.interpolationPool.cycle(e);
        this.rx.postCycle.next(e);
    }

    subscription(sub) {
        return sub.takeUntil(this.rx.destroy);
    }

    keyDown(key) {
        this.rx.keyDown.next(key);
    }

    keyUp(key) {
        this.rx.keyUp.next(key);
    }

    buttonDown(gamepad, buttonIndex) {
        this.rx.buttonDown.next({
            'gamepad': gamepad,
            'buttonIndex': buttonIndex
        });
   }

    buttonUp(gamepad, buttonIndex) {
        this.rx.buttonUp.next({
            'gamepad': gamepad,
            'buttonIndex': buttonIndex
        });
    }

    axisChange(gamepad, index, value) {
        this.rx.axisChange.next({
            'gamepad': gamepad,
            'axisIndex': index,
            'value': value
        });
    }

    addClickableArea(area) {
        this.clickableAreas.push(area);
    }

    removeClickableArea(area) {
        ArrayUtils.remove(this.clickableAreas, area);
    }

    cycleFocus(direction) {
        const enabledAreas = this.enabledAreas();

        if (!this.focusedArea) {
            if (enabledAreas.length > 0) {
                this.focusOn(enabledAreas[0]);
            }
            return;
        }

        if (enabledAreas.length === 0) {
            this.focusOn(null);
            return;
        }

        const focusedAreaIndex = enabledAreas.indexOf(this.focusedArea);

        let newFocusedAreaIndex;
        if (focusedAreaIndex >= 0) {
            newFocusedAreaIndex = (focusedAreaIndex + direction + this.clickableAreas.length) % this.clickableAreas.length;
        } else {
            newFocusedAreaIndex = 0;
        }

        this.focusOn(this.clickableAreas[newFocusedAreaIndex]);
    }

    moveFocus(x, y) {
        const enabledAreas = this.enabledAreas();

        if (!this.focusedArea) {
            if (enabledAreas.length > 0) {
                this.focusOn(enabledAreas[0]);
            }
            return;
        }

        const currentPosition = this.focusedArea.center();
        const moveAngle = Math.atan2(y, x);

        const eligibleAreas = enabledAreas.filter(area => {
            return area !== this.focusedArea;
        }).filter(area => {
            const center = area.center();
            const angle = Math.atan2(center.y - currentPosition.y, center.x - currentPosition.x);
            const angleDiff = Math.normalizeAngle(angle - moveAngle);
            return Math.abs(angleDiff) < Math.PI / 3;
        }).sort((a, b) => {
            return Math.distance(a.center(), currentPosition) - Math.distance(b.center(), currentPosition);
        });

        if (eligibleAreas.length === 0) {
            return;
        }

        this.focusOn(eligibleAreas[0]);
    }

    focusOn(area) {
        if (area !== this.focusedArea) {
            if (this.focusedArea) {
                this.focusedArea.setFocused(false);
                this.focusedArea.cancel();
            }
        }

        this.focusedArea = area;

        if (this.focusedArea) {
            this.focusedArea.setFocused(true);
        }
    }

    enabledAreas() {
        return this.clickableAreas.filter(area => area.enabled);
    }

    getAreaForCoordinates(x, y) {
        return this.enabledAreas().filter(area => {
            return area.contains(x, y);
        })[0] || null;
    }

    touchStart(x, y) {
        this.currentArea = this.getAreaForCoordinates(x, y);

        if (this.currentArea) {
            if (this.focusedArea) {
                this.focusedArea.setFocused(false);
            }

            this.focusedArea = this.currentArea;

            this.overCurrentArea = true;
            this.currentArea.down(x, y);
        }
    }

    touchMove(x, y) {
        if (this.currentArea) {
            if (this.overCurrentArea && !this.currentArea.contains(x, y)) {
                this.currentArea.cancel();
                this.overCurrentArea = false;
            }

            if (this.overCurrentArea) {
                this.currentArea.move(x, y);
            }

            if (!this.overCurrentArea && this.currentArea.contains(x, y)) {
                this.currentArea.down(x, y);
                this.overCurrentArea = true;
            }
        }
    }

    touchEnd() {
        if (this.currentArea) {
            if (this.overCurrentArea) {
                this.currentArea.action();
            }

            this.currentArea = null;
            this.overCurrentArea = false;
        }
    }

    mouseMove(x, y) { // jshint ignore:line
        // no-op, will be implemented in subclasses
    }

    addDebugValues(values) {
        values['Screen ID'] = this.getId();
    }

    pop() {
        if (!this.game || this.game.screen() !== this) {
            console.warn('Attempted to pop a screen that wasn\'t at the top of the stack');
            return;
        }

        this.game.popScreen();
    }

    makeCurrent() {
        if (!this.game || this.game.screens.indexOf(this) === -1) {
            console.warn('Attempted to make a screen current while not being on a game');
            return;
        }

        while (this.game.screen() !== this) {
            this.game.popScreen();
        }
    }

}

module.exports = Screen;
