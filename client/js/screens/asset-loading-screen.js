'use strict';

const PIXI = require('pixi.js');

const Screen = require('../ui/screen');

const LoadingEffect = require('../ui/loading-effect');

const Timeline = require('animate').Timeline;
const Animation = require('animate').Animation;

const ArrayUtils = require('../../../shared/util/array-utils');

class AssetLoadingScreen extends Screen {
    constructor() {
        super();
        this.hideCursor = false;
    }

    getId() {
        return 'loading';
    }

    setup() {
        super.setup();

        const bg = new PIXI.Graphics();
        bg.beginFill(0x0);
        bg.drawRect(0, 0, this.game.params.width, this.game.params.height);
        this.view.addChild(bg);

        this.loadingEffect = new LoadingEffect({
            'width': this.game.params.width * 0.5,
            'height': 20
        });
        this.loadingEffect.position.x = (this.game.params.width - this.loadingEffect.width) / 2;
        this.loadingEffect.position.y = (this.game.params.height - this.loadingEffect.height) / 2;
        this.view.addChild(this.loadingEffect);

        this.startLoading();
    }

    startLoading() {
        this.loadFonts().then(() => {
            this.setProgress(0.5);
            return this.loadImages();
        }).then(() => {
            this.setProgress(0.75);
            return this.loadSounds();
        }).then(() => {
            this.complete();
        }).catch(error => {
            console.error(error);
        });
    }

    setMessage(m) {
        this.loadingEffect.setLabel(m);
    }

    loadFont(fontFamily, src) {
        return new Promise((resolve, reject) =>  {
            const font = new Font();
            font.onload = resolve;
            font.onerror = reject;
            font.fontFamily = fontFamily;
            font.src = src;
        });
    }

    loadFonts() {
        this.setMessage('Loading fonts...');

        return Promise.all([]);
    }

    loadImages() {
        const assets = [];

        if(assets.length === 0){
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.setMessage('Loading images...');

            const loader = new PIXI.loaders.Loader();
            for(let i = 0 ; i < assets.length ; i++){
                loader.add(assets[i], assets[i]);
            }

            loader.on('progress', event => {
                this.setMessage('Loading images... ' + Math.round(event.progress) + '%');
            });

            loader.on('complete', resolve);
            loader.on('error', reject);

            loader.load();
        });
    }

    loadSounds() {
        return new Promise(resolve => {
            this.setMessage('Loading sounds...');

            this.game.setupSounds();

            const sounds = this.game.soundManager.soundList;
            if (sounds.length === 0) {
                resolve();
                return;
            }

            const soundsLeft = sounds.slice(0);

            sounds.forEach(sound => {
                sound.on('load', () => {
                    ArrayUtils.remove(soundsLeft, sound);

                    this.setMessage('Loading sounds... ' + Math.round((1 - soundsLeft.length / sounds.length) * 100) + '%');

                    if (soundsLeft.length === 0) {
                        resolve();
                    }
                });

                sound.on('loaderror', () => {
                    // We failed, but let's not make the whole game crash because of that
                    console.warn('Failed to load sound at ' + sound._src + '. Proceeding anyway');
                    resolve();
                });
            });
        });
    }

    setProgress(progress) {
        new Animation(this.loadingEffect)
            .interp('progress', this.loadingEffect.progress, progress)
            .during(0.5)
            .run(this.interpolationPool);
    }

    complete() {
        this.setProgress(1);

        new Timeline()
            .add(new Animation(this.view).interp('alpha', 1, 0).during(1))
            .add(() => { this.game.assetLoadingComplete(); })
            .runAsMain(this.interpolationPool);
    }
}

module.exports = AssetLoadingScreen;
