'use strict';

const Howler = require('howler').Howler;

const random = require('../../../shared/util/random');

class PlayedSound {

    constructor(howl, id) {
        this._howl = howl;
        this._id = id;
    }

    stop() {
        this._howl.stop(this._id);
        return this;
    }

    volume(volume) {
        this._howl.volume(volume, this._id);
        return this;
    }

    getVolume() {
        return this._howl.volume(this._id);
    }

    rate(rate) {
        this._howl.rate(rate, this._id);
        return this;
    }

    fade(fromVolume, toVolume, duration) {
        this._howl.fade(fromVolume, toVolume, duration);
        return this;
    }

    once(event, fn) {
        this._howl.once(event, fn, this._id);
        return this;
    }

    loop() {
        return this._howl.loop();
    }

    setMuted(muted) {
        return this._howl.mute(muted);
    }

}

class SoundManager {

    constructor() {
        this.soundMap = {};
        this.currentLoopId = null;
        this.currentLoopSound = null;
        this.suppressWarnings = false;
        this.soundList = [];

        this.effectsVolume = 1;
        this.soundtrackVolume = 1;
    }

    prepare(soundId, howlerSounds) {
        this.soundMap[soundId] = howlerSounds;

        howlerSounds.forEach(sound => {
            this.soundList.push(sound);
        });
    }

    randomSound(soundId) {
        if (!this.soundMap[soundId]) {
            if (!this.suppressWarnings) {
                console.warn('Unknown sound ' + soundId);
            }
            return;
        }

        return random.randPick(this.soundMap[soundId]);
    }

    play(soundId) {
        return this.playWithVolume(soundId, 1);
    }

    playWithVolume(soundId, volume) {
        return this.playWithVolumeAndRate(soundId, volume, 1);
    }

    playWithVolumeAndRate(soundId, volume, rate) {
        const howl = this.randomSound(soundId);
        if (!howl) {
            return;
        }

        return new PlayedSound(howl, howl.play())
            .volume(volume * this.effectsVolume)
            .rate(rate);
    }

    playLoop(soundId) {
        if (this.currentLoopId === soundId) {
            return;
        }

        this.stopLoop();

        const sound = this.play(soundId);

        if (!sound) {
            return;
        }

        this.currentLoopId = soundId;
        this.currentLoopSound = sound;

        this.currentLoopSound.rate(1).fade(0, this.soundtrackVolume, 3000);
        this.currentLoopSound.once('end', () => {
            this.stopLoop();
            this.playLoop(soundId);
        });
    }

    stopLoop() {
        if (!this.currentLoopSound) {
            return Promise.resolve();
        }

        this.currentLoopSound.stop();
        this.currentLoopId = null;
        this.currentLoopSound = null;
    }

    setSoundtrackVolume(volume) {
        this.soundtrackVolume = volume;

        if (this.currentLoopSound) {
            this.currentLoopSound.volume(volume);
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = volume;
    }

    setMuted(muted) {
        Howler.mute(muted);
    }

    setLoopMuted(muted) {
        if (!this.currentLoopSound) {
            return;
        }

        this.currentLoopSound.setMuted(muted);
    }

}

module.exports = SoundManager;
