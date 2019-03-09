'use strict';

const PIXI = require('pixi.js');
const Stats = require('stats.js');
const fscreen = require('fscreen').default;

const PIXIUtils = require('../util/pixi-utils');

const InteractionManager = require('../interaction/interaction-manager');
const SoundManager = require('../sound/sound-manager');

class Game {

    constructor(params) {
        this.params = params;
        this.parseURL();

        this.time = 0;
    }

    setup() {
        this.canvasContainer = window.document.getElementById('canvas-container');

        this.stage = new PIXI.Container();

        this.screenContainer = new PIXI.Container();
        this.stage.addChild(this.screenContainer);

        this.setResolution(this.params.resolution || 1);

        this.interactionManager = new InteractionManager(this);
        this.interactionManager.setup();

        this.screens = [];

        this.lastFrame = window.performance.now();
        this.scheduleFrame();

        if(this.params.debug){
            this.debugger = new PIXI.Text('', {
                'fill': 'white',
                'align': 'left',
                'fontFamily': 'Courier',
                'fontSize': '14pt'
            });
            this.debugger.position.x = 20;
            this.debugger.position.y = 20;
            this.stage.addChild(this.debugger);

            this.stats = new Stats();
            this.stats.showPanel(1);
            window.document.body.appendChild(this.stats.dom);

            this.renderStats = new Stats();
            this.renderStats.showPanel(1);
            this.renderStats.dom.style.left = '80px';
            window.document.body.appendChild(this.renderStats.dom);
        }

        this.soundManager = new SoundManager();

        // window.onblur = this.stopLoop.bind(this);
        // window.onfocus = () => {
        //     this.lastFrame = window.performance.now();
        //     this.scheduleFrame();
        // };
    }

    pushScreen(screen) {
        const previousScreen = this.screen();

        screen.game = this;
        screen.setup();

        this.screenContainer.addChild(screen.view);
        this.screens.push(screen);

        if (previousScreen) {
            previousScreen.background();
        }

        screen.foreground();

        screen.cycle(0);
        screen.postCycle(0);

        this.canvasContainer.style.cursor = screen.hideCursor ? 'none' : 'default';

        window.S = screen;
    }

    popScreen() {
        const screen = this.screens.pop();
        if (screen) {
            screen.destroy();
            PIXIUtils.remove(screen.view);
        }

        const newScreen = this.screens[this.screens.length - 1];
        if (newScreen) {
            newScreen.foreground();
            this.canvasContainer.style.cursor = newScreen.hideCursor ? 'none' : 'default';
        }

        window.S = newScreen;
    }

    setScreen(screen) {
        while (this.screens.length > 0) {
            // Not calling popScreen() in case the child class needs to do something in it
            const screen = this.screens.pop();
            screen.destroy();
            PIXIUtils.remove(screen.view);
        }

        this.pushScreen(screen);
    }

    reloadCurrentScreen() {
        const screen = this.screen();
        this.popScreen();
        this.pushScreen(screen);
        screen.foreground();
    }

    screen() {
        return this.screens[this.screens.length - 1] || null;
    }

    scheduleFrame() {
        if (this.animationFrameId) {
            return;
        }

        const callback = () => {
            this.animationFrameId = null;
            this.frame();
        };

        this.runningLoop = true;

        if (!this.params.fps) {
            this.animationFrameId = window.requestAnimationFrame(callback);
        } else {
            setTimeout(callback, 1000 / parseInt(this.params.fps));
        }
    }

    stopLoop() {
        this.runningLoop = false;
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }

    frame() {
        if (this.stats) {
            this.stats.begin();
        }

        const now = window.performance.now();
        const elapsedMs = now - this.lastFrame;
        const elapsed = elapsedMs / 1000;

        this.frameStart = window.performance.now();
        this.previousFrame = this.lastFrame;
        this.lastFrame = now;

        this.cycle(elapsed);

        this.cycleEnd = window.performance.now();

        if (this.renderStats) {
            this.renderStats.begin();
        }

        if (this.runningLoop) {
            this.scheduleFrame();
        }

        this.renderer.render(this.stage);

        if (this.renderStats) {
            this.renderStats.end();
        }

        this.frameEnd = window.performance.now();

        if(this.params.debug){
            var values = this.getDebugValues();
            var s = '';
            for(var i in values){
                s += i + ': ' + values[i] + '\n';
            }
            this.debugger.text = s;
        }

        if (this.stats) {
            this.stats.end();
        }
    }

    cycle(elapsed) {
        // Safety in case we resume the game after a while
        elapsed = Math.min(elapsed, this.params.maxElapsed || 1);

        this.time += elapsed;

        this.screens.forEach(screen => {
            screen.cycle(elapsed);
            screen.postCycle(elapsed);
        });
    }

    getDebugValues() {
        const values = {
            'Frame time': Math.roundFloat(this.frameEnd - this.frameStart, 2),
            'Cycle time': Math.roundFloat(this.cycleEnd - this.frameStart, 2),
            'Render time': Math.roundFloat(this.frameEnd - this.cycleEnd, 2),
            'FPS (theoretical)': Math.roundFloat(1000 / (this.frameEnd - this.frameStart), 1),
            'FPS (real)': Math.roundFloat(1000 / (this.frameEnd - this.previousFrame), 1),
            'Elements': PIXIUtils.nNodes(this.stage),
            'Leaves': PIXIUtils.nLeaves(this.stage),
            'Visible': PIXIUtils.nVisible(this.stage),
            'Rendered': PIXIUtils.nRendered(this.stage),
            'Filters': PIXIUtils.nFilters(this.stage),
            'Interpolations': this.screen().interpolationPool.size
        };
        this.screen().addDebugValues(values);
        return values;
    }

    parseURL() {
        const split = (window.document.location.search || '?').substr(1).split('&');
        split.forEach(s => {
            const splitParam = s.split('=');

            if(splitParam.length !== 2){
                return;
            }

            const param = splitParam[0];
            let value = splitParam[1];

            if (value === 'true' || value === 'false') {
                value = JSON.parse(value);
            } else if (!isNaN(value)) {
                value = parseFloat(value);
            }

            this.params[param] = value;
        });
    }

    setResolution(resolution) {
        if (resolution === this.resolution) {
            return;
        }

        this.resolution = resolution;

        const canvasWidth = this.params.width * this.resolution;
        const canvasHeight = this.params.height * this.resolution;

        if (!this.renderer) {
            this.renderer = new PIXI.autoDetectRenderer(canvasWidth, canvasHeight, {
                'resolution': 1
            });
            this.renderer.clearBeforeRender = false;
            this.renderer.roundPixels = true;
            this.renderer.antiAlias = true;
            this.renderer.transparent = false;

            this.canvas = this.renderer.view;
            this.canvasContainer.appendChild(this.canvas);
        } else {
            this.renderer.resize(canvasWidth, canvasHeight);
        }

        this.stage.scale.x = resolution;
        this.stage.scale.y = resolution;
    }

    enableFullscreen() {
        fscreen.requestFullscreen(window.document.body);
    }

    disableFullscreen() {
        fscreen.exitFullscreen();
    }

    get isFullscreen() {
        return fscreen.fullscreenElement !== null;
    }

    quit() {
        window.close(true);
    }

}

module.exports = Game;
