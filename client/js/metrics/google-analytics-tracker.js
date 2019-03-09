'use strict';

const Tracker = require('./tracker');

class Property {

    constructor(id, prefix, ga, name) {
        this.id = id;
        this.prefix = prefix || '';
        this.ga = ga;
        this.name = name;

        this.ga('create', this.id, 'auto', this.name);
    }

    pageView(label) {
        this.ga(
            this.name + '.send',
            'pageview',
            this.prefix + label
        );
    }

    event(category, action, label) {
        this.ga(
            this.name + '.send',
            'event',
            this.prefix + category,
            this.prefix + action,
            this.prefix + label
        );
    }

}

class GoogleAnalyticsTracker extends Tracker {

    constructor(ga) {
        super();
        this.ga = ga;
        this.properties = [];
    }

    addProperty(id, prefix) {
        this.properties.push(new Property(id, prefix, this.ga, 'tracker' + (this.properties.length + 1)));
    }

    screen(label) {
        this.properties.forEach(property => property.pageView(label));
    }

    event(category, action, label) {
        this.properties.forEach(property => property.event(category, action, label));
    }

}

module.exports = GoogleAnalyticsTracker;
