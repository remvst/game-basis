'use strict';

const PIXI = require('pixi.js');

const Game = require('./game');

const Constants = require('../../../shared/constants');

const Keyboard = require('../interaction/keyboard');
const Gamepad = require('../interaction/gamepad');

const AssetLoadingScreen = require('../screens/asset-loading-screen');

const Tracker = require('../metrics/tracker');

const ElementToggler = require('../dom/element-toggler');

class UFO extends Game {

    setup() {
        super.setup();

        this.keyboardInstructionsToggler = new ElementToggler(window.document.querySelector('#keyboard-instructions'));

        window.addEventListener('blur', () => this.windowHasFocus(false), false);
        window.addEventListener('focus', () => this.windowHasFocus(true), false);

        this.setupMetrics();

        this.setScreen(new AssetLoadingScreen());

        const version = new PIXI.Text('v' + Constants.GAME_VERSION, {
            'fontFamily': 'Courier',
            'fontSize': 12,
            'fill': '#fff'
        });
        version.anchor.x = 1;
        version.anchor.y = 1;
        version.position.x = this.params.width - 20;
        version.position.y = this.params.height - 10;
        this.stage.addChild(version);
    }

    setResolution(r) {
        super.setResolution(r);

        if (window.nw) {
            window.resizeTo(this.canvas.width, this.canvas.height);
        }
    }

    setWindowed(windowed) {
        if (!windowed) {
            try {
                this.enableFullscreen();
            } catch(err) {
                console.error(err);
            }
        } else {
            this.disableFullscreen();
        }
    }

    assetLoadingComplete() {
        // TODO
        console.log('READY');
    }

    cycle(e) {
        if (this.params.timekeys) {
            if (this.interactionManager.isDown(Keyboard.F) || this.interactionManager.isButtonDown(Gamepad.TRIGGER_R1)) {
                e *= 6;
            } else if (this.interactionManager.isDown(Keyboard.G) || this.interactionManager.isButtonDown(Gamepad.TRIGGER_L1)) {
                e *= 0.1;
            }
        }

        const screen = this.screen();
        if (screen && screen.timeFactor) {
            e *= screen.timeFactor();
        }

        super.cycle(e);
    }

    setupMetrics() {
        this.tracker = new Tracker();
    }

    setupSounds() {
        if (this.params.mute) {
            this.soundManager.suppressWarnings = true;
            return;
        }


    }

    openURL(url) {
        if (window.nw && window.gui) {
            window.gui.Shell.openExternal(url);
        } else {
            window.open(url);
        }
    }

    windowHasFocus(hasFocus) {
        if (window.nw) {
            return; // For the standalone version, don't mute in order to avoid people pressing tab and getting no sound
        }
        this.soundManager.setMuted(!hasFocus);
    }

}

module.exports = UFO;
