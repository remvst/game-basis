'use strict';

const PIXIUtils = {};

PIXIUtils.addFilter = function(element, filter) {
    if (!element) {
        return;
    }

    const filters = element.filters;

    if (!filters) {
        element.filters = [filter];
    } else {
        filters.push(filter);
        element.filters = filters;
    }
};

PIXIUtils.removeFilter = function(element, filter) {
    if (!element) {
        return;
    }

    const filters = element.filters;

    if (!filters) {
        return;
    }

    const index = filters.indexOf(filter);
    if (index === -1) {
        return;
    }

    filters.splice(index, 1);
    element.filters = filters;
};

PIXIUtils.remove = function(element) {
    if (!element || !element.parent) {
        return;
    }

    element.parent.removeChild(element);
};

PIXIUtils.removeAllChildren = function(element) {
    if (!element) {
        return;
    }

    element.removeChildren(0, element.children.length);
};

PIXIUtils.nNodes = function(rootElement) {
    function pp(element) {
        return 1 + element.children.reduce(function(acc, child) {
            return acc + pp(child);
        }, 0);
    }

    return pp(rootElement);
};

PIXIUtils.nLeaves = function(rootElement) {
    function pp(element) {
        return element.children.reduce(function(acc, child) {
            if (child.children.length === 0) {
                return acc + 1;
            }

            return acc + pp(child);
        }, 0);
    }

    return pp(rootElement);
};

PIXIUtils.nVisible = function(rootElement) {
    function pp(element) {
        if (!element.visible) {
            return 0;
        }

        return 1 + element.children.reduce(function(acc, child) {
            return acc + pp(child);
        }, 0);
    }

    return pp(rootElement);
};

PIXIUtils.nRendered = function(rootElement) {
    function pp(element) {
        if (!element.visible) {
            return 0;
        }

        if (element.cacheAsBitmap) {
            return 1;
        }

        return 1 + element.children.reduce(function(acc, child) {
            return acc + pp(child);
        }, 0);
    }

    return pp(rootElement);
};

PIXIUtils.nFilters = function(rootElement) {
    function pp(element) {
        if (!element.visible) {
            return 0;
        }

        return (element.filters ? element.filters.length : 0) + element.children.reduce(function(acc, child) {
            return acc + pp(child);
        }, 0);
    }

    return pp(rootElement);
};

PIXIUtils.treeStrings = function(element, depth) {
    depth = depth || 0;

    let elementDescription = '';
    for (let i = 0 ; i < depth ; i++) {
        elementDescription += ' ';
    }

    elementDescription += ' ' + element.constructor.name;
    if (element.debugLabel) {
        elementDescription += ' - ' + element.debugLabel;
    }

    if (!element.children) {
        return [elementDescription];
    }

    return element.children.reduce((list, child) => {
        return list.concat(PIXIUtils.treeStrings(child, depth + 1));
    }, [elementDescription]);
};

PIXIUtils.treeDescription = function(root) {
    return PIXIUtils.treeStrings(root).join('\n');
};

module.exports = PIXIUtils;
