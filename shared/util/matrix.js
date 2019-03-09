'use strict';

class Matrix {
    constructor(m) {
        this.matrix = m;
        this.rows = m.length;
        this.cols = m[0].length;
    }

    toJSON() {
        return this.matrix;
    }

    static fromJSON(json) {
        return new Matrix(json);
    }

    get(row, col, defaultValue) {
        if (row < 0 || row > this.rows - 1) {
            return defaultValue;
        }
        if (col < 0 || col > this.cols - 1) {
            return defaultValue;
        }
        return this.matrix[row][col];
    }

    set(row, col, x) {
        this.matrix[row][col] = x;
    }

    symetrical() {
        const symetrical = Matrix.empty(this.cols, this.rows, 0);
        for (let row = 0 ; row < this.cols ; row++) {
            for (let col = 0 ; col < this.rows ; col++) {
                symetrical.set(row, col, this.matrix[col][row]);
            }
        }
        return symetrical;
    }

    flipped() {
        const flipped = Matrix.empty(this.rows, this.cols, 0);
        for (let row = 0 ; row < this.rows ; row++) {
            for (let col = 0 ; col < this.cols ; col++) {
                flipped.set(row, col, this.matrix[this.rows - row - 1][col]);
            }
        }
        return flipped;
    }

    convertFlippedCell(cell) {
        return {
            'row': this.rows - cell.row - 1,
            'col': cell.col
        };
    }

    convertSymetricalCell(cell) {
        return {
            'row': cell.col,
            'col': cell.row
        };
    }

    prettyString() {
        const rows = [];

        for (let row = 0 ; row < this.rows ; row++) {
            rows.push(this.matrix[row].join(''));
        }

        return rows.join('\n');
    }

    extract(row, col, rows, cols, defaultValue) {
        const subMatrix = [];
        for (let r = 0 ; r < rows ; r++) {
            subMatrix.push([]);
            for (let c = 0 ; c < cols ; c++) {
                const globalRow = r + row;
                const globalCol = c + col;

                if (globalRow < this.rows && globalCol < this.cols) {
                    subMatrix[r][c] = this.matrix[globalRow][globalCol];
                } else {
                    subMatrix[r][c] = defaultValue || 0;
                }
            }
        }

        return new Matrix(subMatrix);
    }

    copy() {
        return this.extract(0, 0, this.rows, this.cols);
    }

    forEachCell(callback) {
        for (let row = 0 ; row < this.rows ; row++) {
            for (let col = 0 ; col < this.cols ; col++) {
                callback(row, col, this.matrix[row][col]);
            }
        }
    }

    map(mapper) {
        const matrix = this.copy();
        for (let row = 0 ; row < this.rows ; row++) {
            for (let col = 0 ; col < this.cols ; col++) {
                const mappedValue = mapper(row, col, this.matrix[row][col]);
                matrix.set(row, col, mappedValue);
            }
        }
        return matrix;
    }

    flattened() {
        const list = [];
        this.forEachCell((row, col, value) => list.push(value));
        return list;
    }

    equals(otherMatrix) {
        if (otherMatrix.rows !== this.rows || otherMatrix.cols !== this.cols) {
            return false;
        }

        for (let row = 0 ; row < this.rows ; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.matrix[row][col] !== otherMatrix.matrix[row][col]) {
                    return false;
                }
            }
        }

        return true;
    }

    static empty(rows, cols, x) {
        x = x || 0;

        const matrix = [];
        for (let row = 0 ; row < rows ; row++) {
            matrix.push([]);
            for (let col = 0 ; col < cols ; col++) {
                matrix[row].push(x);
            }
        }

        return new Matrix(matrix);
    }
}

module.exports = Matrix;
