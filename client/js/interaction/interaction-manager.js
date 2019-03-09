'use strict';

const Rx = require('rxjs/Rx');

const Keyboard = require('./keyboard');

class InteractionManager {

    constructor(game) {
        this.game = game;
        this.mouseIsDown = false;

        this.touches = [];

        this.gamepads = [];
        this.currentGamepad = null;
        this.previousGamepadStates = {};
        this.deadAxisThreshold = 0.2;
        this.axisChangeThreshold = 0.1;

        this.ignoringAllInputs = false;

        this.controlStyle = null;

        this.rx = {};
        this.rx.controlStyle = new Rx.BehaviorSubject(this.controlStyle);

        // Set a default control style
        this.updateControlStyle(InteractionManager.KEYBOARD);
    }

    keyOrButtonLabel() {
        if (this.controlStyle === InteractionManager.GAMEPAD) {
            return 'button';
        }

        return 'key';
    }

    updateControlStyle(style) {
        if (style === this.controlStyle) {
            return;
        }

        // Reset all keys
        this.downKeys = {};

        this.controlStyle = style;
        this.rx.controlStyle.next(this.controlStyle);
    }

    setup() {
        window.addEventListener('keydown', this.keyDown.bind(this), false);
        window.addEventListener('keyup', this.keyUp.bind(this), false);
        window.addEventListener('mousedown', this.mouseDown.bind(this), false);
        window.addEventListener('mousemove', this.mouseMove.bind(this), false);
        window.addEventListener('mouseup', this.mouseUp.bind(this), false);
        window.addEventListener('touchstart', this.touchStart.bind(this), false);
        window.addEventListener('touchmove', this.touchMove.bind(this), false);
        window.addEventListener('touchend', this.touchEnd.bind(this), false);

        window.addEventListener('gamepadconnected', this.gamepadConnected.bind(this), false);
        window.addEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this), false);

        this.gamepadsCycle();
    }

    ignoreAllInputs() {
        this.ignoringAllInputs = true;

        Object.keys(this.downKeys).forEach(keyCode => {
            if (!this.downKeys[keyCode]) {
                return;
            }

            this.downKeys[keyCode] = 0;

            const screen = this.game.screen();
            if (screen) {
                screen.keyUp(keyCode);
            }
        });
    }

    stopIgnoringAllInputs() {
        this.ignoringAllInputs = false;
    }

    keyDown(e) {
        this.updateControlStyle(InteractionManager.KEYBOARD);

        if (!this.downKeys[e.keyCode]) {
            this.downKeys[e.keyCode] = Date.now();

            const screen = this.game.screen();
            if (screen && !this.ignoringAllInputs) {
                screen.keyDown(e.keyCode);
            }
        }

        // Just in case, prevent scrolling with arrow keys
        if (e.keyCode === Keyboard.UP || e.keyCode === Keyboard.DOWN || e.keyCode === Keyboard.TAB || e.keyCode === Keyboard.SPACE && !this.game.formInputManager.visible) {
            e.preventDefault();
        }
    }

    keyUp(e) {
        this.updateControlStyle(InteractionManager.KEYBOARD);

        if (this.downKeys[e.keyCode]) {
            this.downKeys[e.keyCode] = 0;

            const screen = this.game.screen();
            if (screen) {
                screen.keyUp(e.keyCode);
            }
        }
    }

    updateTouches(e) {
        this.touches = [];

        for (let i = 0 ; i < e.touches.length ; i++) {
            const coords = this.getCoordinates(e.touches[i]);
            this.touches.push(coords);
        }
    }

    touchStart(e) {
        this.updateControlStyle(InteractionManager.TOUCH);
        this.updateTouches(e);

        const screen = this.game.screen();
        if (screen) {
            screen.touchStart(this.touches[0].x, this.touches[0].y);
        }
    }

    touchMove(e) {
        this.updateTouches(e);

        const screen = this.game.screen();
        if (screen) {
            screen.touchMove(this.touches[0].x, this.touches[0].y);
        }
    }

    touchEnd(e) {
        this.updateTouches(e);

        const screen = this.game.screen();
        if (screen) {
            screen.touchEnd();
        }
    }

    mouseDown(e) {
        this.mouseIsDown = true;

        const coords = this.getCoordinates(e);

        const screen = this.game.screen();
        if (screen && !this.ignoringAllInputs) {
            screen.touchStart(coords.x, coords.y);
        }
    }

    mouseMove(e) {
        const screen = this.game.screen();
        if (!screen || this.ignoringAllInputs) {
            return;
        }

        const coords = this.getCoordinates(e);
        const area = this.game.screen().getAreaForCoordinates(coords.x, coords.y);

        if (!this.game.screen().hideCursor) {
            this.game.canvasContainer.style.cursor = area ? 'pointer' : 'default';
        }

        screen.mouseMove(coords.x, coords.y);

        if (!this.mouseIsDown) {
            return;
        }

        screen.touchMove(coords.x, coords.y);
    }

    mouseUp(e) {
        if (!this.mouseIsDown) {
            return;
        }

        const coords = this.getCoordinates(e);

        const screen = this.game.screen();
        if (screen && !this.ignoringAllInputs) {
            screen.touchEnd(coords.x, coords.y);
        }
    }

    getCoordinates(e) {
        const rect = this.game.canvas.getBoundingClientRect();

        return {
            'x': this.game.params.width * (e.pageX - rect.left) / rect.width,
            'y': this.game.params.height * (e.pageY - rect.top) / rect.height
        };
    }

    isDown(key) {
        return !!this.downKeys[key];
    }

    isButtonDown(buttonIndex) {
        if (!this.currentGamepad || !this.currentGamepad.buttons[buttonIndex]) {
            return false;
        }

        return this.currentGamepad.buttons[buttonIndex].pressed;
    }

    getAxisValue(axisIndex) {
        if (!this.currentGamepad) {
            return 0;
        }

        const value = this.currentGamepad.axes[axisIndex];
        if (Math.abs(value) < this.deadAxisThreshold) {
            return 0;
        }

        return value;
    }

    addGamepad(gamepad) {
        if (!gamepad) {
            return;
        }

        if (this.gamepads.indexOf(gamepad) !== -1) {
            return;
        }

        this.gamepads.push(gamepad);

        if (!this.currentGamepad) {
            this.currentGamepad = gamepad;
        }
    }

    gamepadConnected(e) {
        console.log('Gamepad connected', e.gamepad.index, e.gamepad.id);
        this.findGamepads();
    }

    gamepadDisconnected(e) {
        console.log('Gamepad disconnected', e.gamepad.index, e.gamepad.id);
        this.findGamepads();
    }

    findGamepads() {
        this.gamepads = [];
        this.currentGamepad = null;

        if (!window.navigator.getGamepads){
            return;
        }

        const gamepads = window.navigator.getGamepads();

        for (var i = 0 ; i < gamepads.length ; i++) {
            this.addGamepad(gamepads[i]);
        }
    }

    gamepadsCycle() {
        this.findGamepads();

        // Done first the cycle crashes
        window.requestAnimationFrame(this.gamepadsCycle.bind(this));

        this.gamepads.forEach(gamepad => {
            const previousState = this.previousGamepadStates[gamepad.id];

            let saveDifferences = true;
            if (previousState) {
                const screen = this.game.screen();

                saveDifferences = false;

                gamepad.buttons.forEach((button, index) => {
                    if (screen && button.pressed !== previousState.buttons[index].pressed) {
                        if (button.pressed) {
                            screen.buttonDown(gamepad, index);
                        } else {
                            screen.buttonUp(gamepad, index);
                        }

                        saveDifferences = true;
                    }
                });

                gamepad.axes.forEach((value, index) => {
                    if (screen && Math.abs(value - previousState.axes[index]) > this.axisChangeThreshold) {
                        screen.axisChange(gamepad, index, value);

                        saveDifferences = true;
                    }
                });
            }

            if (saveDifferences) {
                this.updateControlStyle(InteractionManager.GAMEPAD);

                this.previousGamepadStates[gamepad.id] = {
                    'buttons': gamepad.buttons.map(button => {
                        return {'pressed': button.pressed};
                    }),
                    'axes': gamepad.axes.slice()
                };
            }
        });
    }
}

InteractionManager.KEYBOARD = 1;
InteractionManager.GAMEPAD = 2;
InteractionManager.TOUCH = 3;

module.exports = InteractionManager;
