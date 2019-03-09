'use strict';

const ArrayUtils = require('../../../shared/util/array-utils');

class SoundPool {

    constructor(soundManager) {
        this._soundManager = soundManager;
        this._sounds = []; // sounds being played
        this._proxies = [];
    }

    addProxy(proxy) {
        this._proxies.push(proxy);
    }

    removeProxy(proxy) {
        ArrayUtils.remove(this._proxies, proxy);
    }

    playWithVolume(soundId, volume) {
        let soundParams = {
            'soundId': soundId,
            'volume': volume
        };
        this._proxies.forEach(proxy => soundParams = proxy(soundParams));

        const sound = this._soundManager.playWithVolume(soundParams.soundId, soundParams.volume);
        if (sound) {
            if (!sound.loop()) {
                return sound.once('end', () => ArrayUtils.remove(this._sounds, sound));
            }

            sound.once('stop', () => ArrayUtils.remove(this._sounds, sound));

            this._sounds.push(sound);
        }
        return sound;
    }

    stopAll() {
        this._sounds.slice().forEach(sound => sound.stop());
        this._sounds = [];
    }

}

module.exports = SoundPool;
