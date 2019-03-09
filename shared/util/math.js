'use strict';

Math.between = function(a, b, c) {
    if (b < a) {
        return a;
    } else if (b > c) {
        return c;
    } else {
        return b;
    }
};

Math.isBetween = function(a, b, c) {
    return a <= b && b <= c || a >= b && b >= c;
};

Math.distance = function(a, b) {
    return Math.pointDistance(a.x, a.y, b.x, b.y);
};

Math.pointDistance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

Math.inRectangle = function(x, y, rectX, rectY, rectWidth, rectHeight, deltaX, deltaY) {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;

    return x + deltaX >= rectX &&
           y + deltaY >= rectY &&
           x - deltaX <= rectX + rectWidth &&
           y - deltaY <= rectY + rectHeight;
};

Math.sign = function(x) {
    if (x < 0) {
        return -1;
    } else if (x > 0) {
        return 1;
    } else {
        return 0;
    }
};

Math.roundToNearest = function(x, precision){
    return Math.round(x / precision) * precision;
};

Math.roundFloat = function(x, precision){
    precision = precision || 0;
    var power = Math.pow(10, precision);
    return Math.round(x * power) / power;
};

Math.normalizeAngle = function(a){
    while (a < -Math.PI) a += Math.PI * 2;
    while (a > Math.PI) a -= Math.PI * 2;
    return a;
};

Math.rectangleIntersection = function(rectangle1, rectangle2) {
    var xInter = Math.isBetween(rectangle1.x, rectangle2.x, rectangle1.x + rectangle1.width) ||
                 Math.isBetween(rectangle1.x, rectangle2.x + rectangle2.width, rectangle1.x + rectangle1.width) ||
                 Math.isBetween(rectangle2.x, rectangle1.x, rectangle2.x + rectangle2.width);
    var yInter = Math.isBetween(rectangle1.y, rectangle2.y, rectangle1.y + rectangle1.height) ||
                 Math.isBetween(rectangle1.y, rectangle2.y + rectangle2.height, rectangle1.y + rectangle1.height) ||
                 Math.isBetween(rectangle2.y, rectangle1.y, rectangle2.y + rectangle2.height);
    return xInter && yInter;
};
