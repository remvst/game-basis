'use strict';

const ActualGame = require('./game/actual-game');

const Params = require('./params');

const Resizer = require('./dom/resizer');

require('../../shared/util/math');
require('./util/pixi-utils');

// Put all the easing functions into Math (cause I'm lazy)
const Easing = require('animate').Easing;
for (let i in Easing) {
    Math[i] = Easing[i];
}

window.addEventListener('load', () => {
    // NW-specific params
    const nwParams = window.nwParams || {};
    Object.keys(nwParams).forEach(key => {
        Params[key] = nwParams[key];
    });

    // Launch the game
    window.G = new ActualGame(Params);
    window.G.setup();
}, false);

// Set up the resizer as soon as the DOM is loaded so the canvas container isn't empty before loading
window.addEventListener('DOMContentLoaded', () => {
    new Resizer({
        'element': window.document.getElementById('canvas-container'),
        'ratio': Params.width / Params.height
    }).setup();
}, false);
