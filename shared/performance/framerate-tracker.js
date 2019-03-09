'use strict';

const Rx = require('rxjs/Rx');

class FramerateTracker {

    constructor(options) {
        this.measurementInterval = options.measurementInterval || 5000;

        this.resetForNextMeasurement();

        this.rx = {};
        this.rx.framerateMeasured = new Rx.Subject();
    }

    resetForNextMeasurement() {
        this.frameCount = 0;
        this.measurementStartTime = Date.now();
    }

    frameDone() {
        this.frameCount++;

        const measuredInterval = Date.now() - this.measurementStartTime;
        if (measuredInterval > this.measurementInterval) {
            const framerate = 1000 * this.frameCount / measuredInterval;

            this.rx.framerateMeasured.next(framerate);
            this.resetForNextMeasurement();
        }
    }

}

module.exports = FramerateTracker;
