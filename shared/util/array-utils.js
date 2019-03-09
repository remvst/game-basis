'use strict';

const random = require('./random');

const ArrayUtils = {};

ArrayUtils.addUnique = function(array, item) {
    if (!array) {
        return false;
    }

    const index = array.indexOf(item);
    if (index >= 0) {
        return false;
    }

    array.push(item);
    return true;
};

ArrayUtils.remove = function(array, item) {
    if (!array) {
        return false;
    }

    const index = array.indexOf(item);
    if (index === -1) {
        return false;
    }

    array.splice(index, 1);
    return true;
};

ArrayUtils.unique = function(array) {
    return array.filter(function(item, index, array) {
        return item && array.indexOf(item) === index;
    });
};

ArrayUtils.minus = function(array, elementsToRemove) {
    var copy = array.slice(0);
    elementsToRemove.forEach(function(element) {
        ArrayUtils.remove(copy, element);
    });
    return copy;
};

ArrayUtils.padMatrix = function(matrix, padAmount, padValue) {
    var rows = matrix.length + padAmount * 2,
        cols = matrix[0].length + padAmount * 2,
        padded = [],
        row,
        col;

    // Fill with padding
    for (row = 0 ; row < rows ; row++) {
        padded.push([]);
        for (col = 0 ; col < cols ; col++) {
            padded[row][col] = padValue;
        }
    }

    // Add the original matrix
    for (row = 0 ; row < matrix.length ; row++) {
        for (col = 0 ; col < matrix[0].length ; col++) {
            padded[row + padAmount][col + padAmount] = matrix[row][col];
        }
    }

    return padded;
};

ArrayUtils.pickAndRemove = function(array, condition) {
    var candidates = condition ? array.filter(condition) : array;

    if (!candidates.length) {
        return null;
    }

    var element = random.randPick(candidates);
    this.remove(array, element);
    return element;
};

ArrayUtils.pickAndRemoveMultiple = function(array, n, condition) {
    var picked = [];
    for (var i = 0 ; i < n && array.length > 0 ; i++) {
        var element = this.pickAndRemove(array, condition);
        if (element !== null) {
            picked.push(element);
        }
    }
    return picked;
};

ArrayUtils.arrayToMap = function(array, keyFunc) {
    var map = {};
    array.forEach(function(value) {
        map[keyFunc(value)] = value;
    });
    return map;
};

ArrayUtils.arrayToListMap = function(array, keyFunc) {
    var map = {};
    array.forEach(function(value) {
        var key = keyFunc(value);
        if (!map[key]) {
            map[key] = [];
        }

        map[key].push(value);
    });
    return map;
};

ArrayUtils.areSame = function(array1, array2) {
    if (array1 === array2) {
        return true;
    }

    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0 ; i < array1.length ; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;
};

module.exports = ArrayUtils;
