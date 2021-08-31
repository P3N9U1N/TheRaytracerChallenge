/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../raytracer/src/canvas.ts":
/*!**********************************!*\
  !*** ../raytracer/src/canvas.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Canvas = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/src/color.ts");
class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Float64Array(width * height * 3);
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] = 0;
        }
    }
    readPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new RangeError();
        var pixelIndex = Math.floor(y) * this.width * 3 + Math.floor(x) * 3;
        return new color_1.Color(this.data[pixelIndex], this.data[pixelIndex + 1], this.data[pixelIndex + 2]);
    }
    writePixel(x, y, c) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return;
        var pixelIndex = Math.floor(y) * this.width * 3 + Math.floor(x) * 3;
        this.data[pixelIndex] = c.red;
        this.data[pixelIndex + 1] = c.green;
        this.data[pixelIndex + 2] = c.blue;
    }
    toPpm() {
        var ppm = "P3\n";
        ppm += this.width + " " + this.height + "\n";
        ppm += "255";
        for (var i = 0; i < this.data.length; i += 3) {
            ppm += (i % 15 == 0) ? "\n" : " ";
            ppm += Math.max(Math.min(Math.round(this.data[i] * 255), 255), 0).toString()
                + " " + Math.max(Math.min(Math.round(this.data[i + 1] * 255), 255), 0).toString()
                + " " + Math.max(Math.min(Math.round(this.data[i + 2] * 255), 255), 0).toString();
        }
        ppm += "\n";
        return ppm;
    }
    toUint8ClampedArray() {
        var arr = new Uint8ClampedArray(this.width * this.height * 4);
        var arrIndex = 0;
        for (var i = 0; i < this.data.length; i += 3) {
            arr[arrIndex] = this.data[i] * 255;
            arr[arrIndex + 1] = this.data[i + 1] * 255;
            arr[arrIndex + 2] = this.data[i + 2] * 255;
            arr[arrIndex + 3] = 255;
            arrIndex += 4;
        }
        return arr;
    }
}
exports.Canvas = Canvas;


/***/ }),

/***/ "../raytracer/src/collection.ts":
/*!**************************************!*\
  !*** ../raytracer/src/collection.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectPool = void 0;
/**
 * Object pool that will minimize garbage collection usage
 */
class ObjectPool {
    constructor(arrayLength = 0) {
        this.items = new Array(arrayLength);
        this.indexMap = new Map();
        this._length = 0;
        for (var i = 0; i < arrayLength; i++) {
            var newItem = this.create();
            this.indexMap.set(newItem, i);
            this.items[i] = newItem;
        }
    }
    indexOf(item) {
        var i = this.indexMap.get(item);
        return (i === undefined || i >= this._length) ? -1 : i;
    }
    remove(a) {
        var index;
        if (a instanceof Object) {
            index = this.indexMap.get(a);
            if (index === undefined)
                return;
        }
        else {
            index = Math.floor(a);
        }
        if (index < 0 || index >= this._length)
            return;
        this._length--;
        var removeItem = this.items[index];
        var lastItem = this.items[this._length];
        this.items[index] = lastItem;
        this.items[this._length] = removeItem;
        this.indexMap.set(removeItem, this._length);
        this.indexMap.set(lastItem, index);
    }
    clear() {
        this._length = 0;
    }
    /**
     * Returns an unused item or creates a new one, if no unused item available
    */
    add() {
        if (this.items.length == this._length) {
            var newItem = this.create();
            this.indexMap.set(newItem, this._length);
            this._length = this.items.push(newItem);
            return newItem;
        }
        return this.items[this._length++];
    }
    get(index) {
        if (index >= this._length)
            return undefined;
        return this.items[index];
    }
    get length() {
        return this._length;
    }
}
exports.ObjectPool = ObjectPool;


/***/ }),

/***/ "../raytracer/src/color.ts":
/*!*********************************!*\
  !*** ../raytracer/src/color.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Color = void 0;
class Color {
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    add(color) {
        return new Color(this.red + color.red, this.green + color.green, this.blue + color.blue);
    }
    multiply(scalar) {
        return new Color(this.red * scalar, this.green * scalar, this.blue * scalar);
    }
    divide(scalar) {
        return new Color(this.red / scalar, this.green / scalar, this.blue / scalar);
    }
    substract(color) {
        return new Color(this.red - color.red, this.green - color.green, this.blue - color.blue);
    }
    hadamardProduct(color) {
        return new Color(this.red * color.red, this.green * color.green, this.blue * color.blue);
    }
    equals(color) {
        return Math.abs(this.red - color.red) < Color.EPSILON
            && Math.abs(this.green - color.green) < Color.EPSILON
            && Math.abs(this.blue - color.blue) < Color.EPSILON;
    }
    clone() {
        return new Color(this.red, this.green, this.blue);
    }
}
exports.Color = Color;
Color.EPSILON = 0.00001;
Color.BLACK = Object.freeze(new Color(0, 0, 0));
Color.WHITE = Object.freeze(new Color(1, 1, 1));


/***/ }),

/***/ "../raytracer/src/intersection.ts":
/*!****************************************!*\
  !*** ../raytracer/src/intersection.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Intersections = exports.Intersection = void 0;
const collection_1 = __webpack_require__(/*! ./collection */ "../raytracer/src/collection.ts");
const sort_1 = __webpack_require__(/*! ./sort */ "../raytracer/src/sort.ts");
class Intersection {
    constructor(t, object) {
        this.t = t;
        this.object = object;
    }
    equals(intersection) {
        return this.t == intersection.t && this.object === intersection.object;
    }
}
exports.Intersection = Intersection;
class Intersections extends collection_1.ObjectPool {
    static sortIntersection(a, b) {
        return a.t - b.t;
    }
    create() {
        return new Intersection(0, null);
    }
    /**
     * Get hit, regardless of sort
    */
    hit() {
        var hit = null;
        for (var i = 0; i < this._length; i++) {
            var item = this.items[i];
            if ((hit == null || item.t < hit.t) && item.t > 0)
                hit = item;
        }
        return hit;
    }
    sort() {
        sort_1.mergeSortInplace(this.items, Intersections.sortIntersection, 0, this._length);
        for (var i = 0; i < this._length; i++) {
            this.indexMap.set(this.items[i], i);
        }
    }
    equals(intersections) {
        if (this._length != intersections.length)
            return false;
        for (var i = 0; i < this._length; i++) {
            if (!this.items[i].equals(intersections.items[i]))
                return false;
        }
        return false;
    }
}
exports.Intersections = Intersections;


/***/ }),

/***/ "../raytracer/src/material.ts":
/*!************************************!*\
  !*** ../raytracer/src/material.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Material = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/src/color.ts");
class Material {
    constructor() {
        this.color = color_1.Color.WHITE.clone();
        this.ambient = 0.1;
        this.diffuse = 0.9;
        this.specular = 0.9;
        this.shininess = 200;
    }
    lighting(light, point, eyev, normalv) {
        var effectiveColor = this.color.hadamardProduct(light.intensity);
        var lightv = light.positon.substract(point).normalize();
        var ambient = effectiveColor.multiply(this.ambient);
        var lightDotNormal = lightv.dot(normalv);
        var diffuse;
        var specular;
        if (lightDotNormal < 0) {
            diffuse = color_1.Color.BLACK;
            specular = color_1.Color.BLACK;
        }
        else {
            diffuse = effectiveColor.multiply(this.diffuse * lightDotNormal);
            var reflectv = lightv.negate().reflect(normalv);
            var reflectDotEye = reflectv.dot(eyev);
            if (reflectDotEye <= 0) {
                specular = color_1.Color.BLACK;
            }
            else {
                var factor = Math.pow(reflectDotEye, this.shininess);
                specular = light.intensity.multiply(this.specular * factor);
            }
        }
        return ambient.add(diffuse).add(specular);
    }
}
exports.Material = Material;


/***/ }),

/***/ "../raytracer/src/matrix.ts":
/*!**********************************!*\
  !*** ../raytracer/src/matrix.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Matrix3x3 = exports.Matrix2x2 = exports.Matrix4x4 = exports.Matrix = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
class Matrix {
    constructor(a, b) {
        if (b === undefined) {
            var matrix = a;
            if (matrix.length == 0 || matrix[0].length == 0)
                throw new Error();
            this.width = matrix[0].length;
            this.height = matrix.length;
            var data = new Float64Array(this.width * this.height);
            for (var y = 0; y < this.height; y++) {
                var row = matrix[y];
                for (var x = 0; x < this.width; x++) {
                    var value = row[x];
                    if (value !== undefined) {
                        data[this.width * y + x] = value;
                    }
                }
            }
            this.data = data;
        }
        else {
            this.width = a;
            this.height = b;
            this.data = new Float64Array(this.width * this.height);
        }
    }
    cofactor(row, column) {
        return ((row + column) % 2 * 2 - 1) * -this.minor(row, column);
    }
    minor(row, column) {
        var m = this.submatrix(row, column);
        return m.determinant();
    }
    isInvertible() {
        return this.determinant() != 0;
    }
    determinant() {
        if (this.width != this.height)
            throw new Error();
        if (this.width == 2)
            return Matrix2x2.prototype.determinant.call(this);
        var det = 0;
        for (var x = 0; x < this.width; x++) {
            det += this.data[x] * this.cofactor(0, x);
        }
        return det;
    }
    toString() {
        var string = "";
        for (var y = 0; y < this.height; y++) {
            string += "|";
            for (var x = 0; x < this.width; x++) {
                string += this.data[this.width * y + x].toFixed(2) + "\t|";
            }
            string += "\n";
        }
        return string;
    }
    get(row, column) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0)
            throw new RangeError();
        return this.data[this.width * row + column];
    }
    set(row, column, value) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0)
            throw new RangeError();
        this.data[this.width * row + column] = value;
    }
    multiply(matrix) {
        if (matrix.height != this.height)
            throw new Error();
        var m = new Matrix(matrix.width, matrix.height);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = 0; x < matrix.width; x++) {
                var sum = 0;
                for (var r = 0; r < matrix.height; r++) {
                    sum += matrix.data[this.width * r + x] * this.data[this.width * y + r];
                }
                m.data[this.width * y + x] = sum;
            }
        }
        return m;
    }
    transpose() {
        var matrix = new Matrix(this.height, this.width);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = y; x < matrix.width; x++) {
                var index = this.width * y + x;
                var indexTransposed = this.width * x + y;
                var swap = this.data[index];
                matrix.data[index] = this.data[indexTransposed];
                matrix.data[indexTransposed] = swap;
            }
        }
        return matrix;
    }
    submatrix(row, column) {
        var m = new Matrix(this.width - 1, this.height - 1);
        var y2 = 0;
        for (var y = 0; y < this.height; y++) {
            if (y == row) {
                continue;
            }
            var x2 = 0;
            for (var x = 0; x < this.width; x++) {
                if (x == column) {
                    continue;
                }
                m.data[m.width * y2 + x2] = this.data[this.width * y + x];
                x2++;
            }
            y2++;
        }
        return m;
    }
    equals(matrix) {
        if (this.width != matrix.width || this.height != matrix.height)
            return false;
        for (var i = 0; i < this.data.length; i++) {
            {
                var diff = Math.abs(this.data[i] - matrix.data[i]);
                if (diff >= Matrix.EPSILON)
                    return false;
            }
        }
        return true;
    }
}
exports.Matrix = Matrix;
Matrix.EPSILON = 0.00001;
class Matrix4x4 extends Matrix {
    constructor(matrix) {
        if (matrix !== undefined) {
            if (matrix.length != 4 || matrix[0].length != 4 || matrix[1].length != 4 || matrix[2].length != 4 || matrix[3].length != 4) {
                throw new Error();
            }
            super(matrix);
        }
        else {
            super(4, 4);
        }
    }
    static viewTransform(from, to, up, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        var forward = to.substract(from).normalize();
        var upn = up.normalize();
        var left = forward.cross(upn);
        var trueUp = left.cross(forward);
        target.data[0] = left.x;
        target.data[1] = left.y;
        target.data[2] = left.z;
        target.data[4] = trueUp.x;
        target.data[5] = trueUp.y;
        target.data[6] = trueUp.z;
        target.data[8] = -forward.x;
        target.data[9] = -forward.y;
        target.data[10] = -forward.z;
        target.data[15] = 1;
        Matrix4x4.translation(-from.x, -from.y, -from.z, Matrix4x4.tempMatrix4x4);
        target.multiply(Matrix4x4.tempMatrix4x4, target);
        return target;
    }
    static translation(x, y, z, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        target.data[0] = 1;
        target.data[4] = 0;
        target.data[8] = 0;
        target.data[12] = 0;
        target.data[1] = 0;
        target.data[5] = 1;
        target.data[9] = 0;
        target.data[13] = 0;
        target.data[2] = 0;
        target.data[6] = 0;
        target.data[10] = 1;
        target.data[14] = 0;
        target.data[3] = x;
        target.data[7] = y;
        target.data[11] = z;
        target.data[15] = 1;
        return target;
    }
    static rotationX(radians, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        target.data[0] = 1;
        target.data[4] = 0;
        target.data[8] = 0;
        target.data[12] = 0;
        target.data[1] = 0;
        target.data[5] = cos;
        target.data[9] = sin;
        target.data[13] = 0;
        target.data[2] = 0;
        target.data[6] = -sin;
        target.data[10] = cos;
        target.data[14] = 0;
        target.data[3] = 0;
        target.data[7] = 0;
        target.data[11] = 0;
        target.data[15] = 1;
        return target;
    }
    static rotationY(radians, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        target.data[0] = cos;
        target.data[4] = 0;
        target.data[8] = -sin;
        target.data[12] = 0;
        target.data[1] = 0;
        target.data[5] = 1;
        target.data[9] = 0;
        target.data[13] = 0;
        target.data[2] = sin;
        target.data[6] = 0;
        target.data[10] = cos;
        target.data[14] = 0;
        target.data[3] = 0;
        target.data[7] = 0;
        target.data[11] = 0;
        target.data[15] = 1;
        return target;
    }
    static rotationZ(radians, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        target.data[0] = cos;
        target.data[4] = sin;
        target.data[8] = 0;
        target.data[12] = 0;
        target.data[1] = -sin;
        target.data[5] = cos;
        target.data[9] = 0;
        target.data[13] = 0;
        target.data[2] = 0;
        target.data[6] = 0;
        target.data[10] = 1;
        target.data[14] = 0;
        target.data[3] = 0;
        target.data[7] = 0;
        target.data[11] = 0;
        target.data[15] = 1;
        return target;
    }
    static scaling(x, y, z, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        target.data[0] = x;
        target.data[4] = 0;
        target.data[8] = 0;
        target.data[12] = 0;
        target.data[1] = 0;
        target.data[5] = y;
        target.data[9] = 0;
        target.data[13] = 0;
        target.data[2] = 0;
        target.data[6] = 0;
        target.data[10] = z;
        target.data[14] = 0;
        target.data[3] = 0;
        target.data[7] = 0;
        target.data[11] = 0;
        target.data[15] = 1;
        return target;
    }
    static shearing(xy, xz, yx, yz, zx, zy, target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        target.data[0] = 1;
        target.data[4] = yx;
        target.data[8] = zx;
        target.data[12] = 0;
        target.data[1] = xy;
        target.data[5] = 1;
        target.data[9] = zy;
        target.data[13] = 0;
        target.data[2] = xz;
        target.data[6] = yz;
        target.data[10] = 1;
        target.data[14] = 0;
        target.data[3] = 0;
        target.data[7] = 0;
        target.data[11] = 0;
        target.data[15] = 1;
        return target;
    }
    transpose(target) {
        var swap;
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        target.data[0] = this.data[0];
        swap = this.data[1];
        target.data[1] = this.data[4];
        target.data[4] = swap;
        swap = this.data[2];
        target.data[2] = this.data[8];
        target.data[8] = swap;
        swap = this.data[3];
        target.data[3] = this.data[12];
        target.data[12] = swap;
        target.data[5] = this.data[5];
        swap = this.data[6];
        target.data[6] = this.data[9];
        target.data[9] = swap;
        swap = this.data[7];
        target.data[7] = this.data[13];
        target.data[13] = swap;
        target.data[10] = this.data[10];
        swap = this.data[11];
        target.data[11] = this.data[14];
        target.data[14] = swap;
        target.data[15] = this.data[15];
        return target;
    }
    inverse(target) {
        target !== null && target !== void 0 ? target : (target = new Matrix4x4());
        var a00 = this.data[0];
        var a01 = this.data[1];
        var a02 = this.data[2];
        var a03 = this.data[3];
        var a10 = this.data[4];
        var a11 = this.data[5];
        var a12 = this.data[6];
        var a13 = this.data[7];
        var a20 = this.data[8];
        var a21 = this.data[9];
        var a22 = this.data[10];
        var a23 = this.data[11];
        var a30 = this.data[12];
        var a31 = this.data[13];
        var a32 = this.data[14];
        var a33 = this.data[15];
        var determinant = (a00 * (a11 * (a22 * a33 - a23 * a32) + a12 * -(a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31)) +
            a01 * -(a10 * (a22 * a33 - a23 * a32) + a12 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a32 - a22 * a30)) +
            a02 * (a10 * (a21 * a33 - a23 * a31) + a11 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a31 - a21 * a30)) +
            a03 * -(a10 * (a21 * a32 - a22 * a31) + a11 * -(a20 * a32 - a22 * a30) + a12 * (a20 * a31 - a21 * a30)));
        if (determinant == 0)
            return null;
        target.data[0] = (a11 * (a22 * a33 - a23 * a32) + a12 * -(a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31)) / determinant;
        target.data[1] = -(a01 * (a22 * a33 - a23 * a32) + a02 * -(a21 * a33 - a23 * a31) + a03 * (a21 * a32 - a22 * a31)) / determinant;
        target.data[2] = (a01 * (a12 * a33 - a13 * a32) + a02 * -(a11 * a33 - a13 * a31) + a03 * (a11 * a32 - a12 * a31)) / determinant;
        target.data[3] = -(a01 * (a12 * a23 - a13 * a22) + a02 * -(a11 * a23 - a13 * a21) + a03 * (a11 * a22 - a12 * a21)) / determinant;
        target.data[4] = -(a10 * (a22 * a33 - a23 * a32) + a12 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a32 - a22 * a30)) / determinant;
        target.data[5] = (a00 * (a22 * a33 - a23 * a32) + a02 * -(a20 * a33 - a23 * a30) + a03 * (a20 * a32 - a22 * a30)) / determinant;
        target.data[6] = -(a00 * (a12 * a33 - a13 * a32) + a02 * -(a10 * a33 - a13 * a30) + a03 * (a10 * a32 - a12 * a30)) / determinant;
        target.data[7] = (a00 * (a12 * a23 - a13 * a22) + a02 * -(a10 * a23 - a13 * a20) + a03 * (a10 * a22 - a12 * a20)) / determinant;
        target.data[8] = (a10 * (a21 * a33 - a23 * a31) + a11 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a31 - a21 * a30)) / determinant;
        target.data[9] = -(a00 * (a21 * a33 - a23 * a31) + a01 * -(a20 * a33 - a23 * a30) + a03 * (a20 * a31 - a21 * a30)) / determinant;
        target.data[10] = (a00 * (a11 * a33 - a13 * a31) + a01 * -(a10 * a33 - a13 * a30) + a03 * (a10 * a31 - a11 * a30)) / determinant;
        target.data[11] = -(a00 * (a11 * a23 - a13 * a21) + a01 * -(a10 * a23 - a13 * a20) + a03 * (a10 * a21 - a11 * a20)) / determinant;
        target.data[12] = -(a10 * (a21 * a32 - a22 * a31) + a11 * -(a20 * a32 - a22 * a30) + a12 * (a20 * a31 - a21 * a30)) / determinant;
        target.data[13] = (a00 * (a21 * a32 - a22 * a31) + a01 * -(a20 * a32 - a22 * a30) + a02 * (a20 * a31 - a21 * a30)) / determinant;
        target.data[14] = -(a00 * (a11 * a32 - a12 * a31) + a01 * -(a10 * a32 - a12 * a30) + a02 * (a10 * a31 - a11 * a30)) / determinant;
        target.data[15] = (a00 * (a11 * a22 - a12 * a21) + a01 * -(a10 * a22 - a12 * a20) + a02 * (a10 * a21 - a11 * a20)) / determinant;
        return target;
    }
    determinant() {
        var a00 = this.data[0];
        var a01 = this.data[1];
        var a02 = this.data[2];
        var a03 = this.data[3];
        var a10 = this.data[4];
        var a11 = this.data[5];
        var a12 = this.data[6];
        var a13 = this.data[7];
        var a20 = this.data[8];
        var a21 = this.data[9];
        var a22 = this.data[10];
        var a23 = this.data[11];
        var a30 = this.data[12];
        var a31 = this.data[13];
        var a32 = this.data[14];
        var a33 = this.data[15];
        return (a00 * (a11 * (a22 * a33 - a23 * a32) + a12 * -(a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31)) +
            a01 * -(a10 * (a22 * a33 - a23 * a32) + a12 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a32 - a22 * a30)) +
            a02 * (a10 * (a21 * a33 - a23 * a31) + a11 * -(a20 * a33 - a23 * a30) + a13 * (a20 * a31 - a21 * a30)) +
            a03 * -(a10 * (a21 * a32 - a22 * a31) + a11 * -(a20 * a32 - a22 * a30) + a12 * (a20 * a31 - a21 * a30)));
    }
    assign(matrix) {
        this.data[0] = matrix.data[0];
        this.data[1] = matrix.data[1];
        this.data[2] = matrix.data[2];
        this.data[3] = matrix.data[3];
        this.data[4] = matrix.data[4];
        this.data[5] = matrix.data[5];
        this.data[6] = matrix.data[6];
        this.data[7] = matrix.data[7];
        this.data[8] = matrix.data[8];
        this.data[9] = matrix.data[9];
        this.data[10] = matrix.data[10];
        this.data[11] = matrix.data[11];
        this.data[12] = matrix.data[12];
        this.data[13] = matrix.data[13];
        this.data[14] = matrix.data[14];
        this.data[15] = matrix.data[15];
    }
    clone() {
        var m = new Matrix4x4();
        m.data[0] = this.data[0];
        m.data[1] = this.data[1];
        m.data[2] = this.data[2];
        m.data[3] = this.data[3];
        m.data[4] = this.data[4];
        m.data[5] = this.data[5];
        m.data[6] = this.data[6];
        m.data[7] = this.data[7];
        m.data[8] = this.data[8];
        m.data[9] = this.data[9];
        m.data[10] = this.data[10];
        m.data[11] = this.data[11];
        m.data[12] = this.data[12];
        m.data[13] = this.data[13];
        m.data[14] = this.data[14];
        m.data[15] = this.data[15];
        return m;
    }
    multiply(a, b) {
        if (a instanceof Matrix4x4) {
            var target = b !== null && b !== void 0 ? b : new Matrix4x4();
            if (matrix === this)
                throw new Error();
            var matrix = a;
            var a00 = this.data[0];
            var a01 = this.data[1];
            var a02 = this.data[2];
            var a03 = this.data[3];
            var a10 = this.data[4];
            var a11 = this.data[5];
            var a12 = this.data[6];
            var a13 = this.data[7];
            var a20 = this.data[8];
            var a21 = this.data[9];
            var a22 = this.data[10];
            var a23 = this.data[11];
            var a30 = this.data[12];
            var a31 = this.data[13];
            var a32 = this.data[14];
            var a33 = this.data[15];
            target.data[0] = matrix.data[0] * a00 + matrix.data[4] * a01 + matrix.data[8] * a02 + matrix.data[12] * a03;
            target.data[1] = matrix.data[1] * a00 + matrix.data[5] * a01 + matrix.data[9] * a02 + matrix.data[13] * a03;
            target.data[2] = matrix.data[2] * a00 + matrix.data[6] * a01 + matrix.data[10] * a02 + matrix.data[14] * a03;
            target.data[3] = matrix.data[3] * a00 + matrix.data[7] * a01 + matrix.data[11] * a02 + matrix.data[15] * a03;
            target.data[4] = matrix.data[0] * a10 + matrix.data[4] * a11 + matrix.data[8] * a12 + matrix.data[12] * a13;
            target.data[5] = matrix.data[1] * a10 + matrix.data[5] * a11 + matrix.data[9] * a12 + matrix.data[13] * a13;
            target.data[6] = matrix.data[2] * a10 + matrix.data[6] * a11 + matrix.data[10] * a12 + matrix.data[14] * a13;
            target.data[7] = matrix.data[3] * a10 + matrix.data[7] * a11 + matrix.data[11] * a12 + matrix.data[15] * a13;
            target.data[8] = matrix.data[0] * a20 + matrix.data[4] * a21 + matrix.data[8] * a22 + matrix.data[12] * a23;
            target.data[9] = matrix.data[1] * a20 + matrix.data[5] * a21 + matrix.data[9] * a22 + matrix.data[13] * a23;
            target.data[10] = matrix.data[2] * a20 + matrix.data[6] * a21 + matrix.data[10] * a22 + matrix.data[14] * a23;
            target.data[11] = matrix.data[3] * a20 + matrix.data[7] * a21 + matrix.data[11] * a22 + matrix.data[15] * a23;
            target.data[12] = matrix.data[0] * a30 + matrix.data[4] * a31 + matrix.data[8] * a32 + matrix.data[12] * a33;
            target.data[13] = matrix.data[1] * a30 + matrix.data[5] * a31 + matrix.data[9] * a32 + matrix.data[13] * a33;
            target.data[14] = matrix.data[2] * a30 + matrix.data[6] * a31 + matrix.data[10] * a32 + matrix.data[14] * a33;
            target.data[15] = matrix.data[3] * a30 + matrix.data[7] * a31 + matrix.data[11] * a32 + matrix.data[15] * a33;
            return target;
        }
        else if (a instanceof tuple_1.Tuple) {
            var t = a;
            return new tuple_1.Tuple(this.data[0] * t.x + this.data[1] * t.y + this.data[2] * t.z + this.data[3] * t.w, this.data[4] * t.x + this.data[5] * t.y + this.data[6] * t.z + this.data[7] * t.w, this.data[8] * t.x + this.data[9] * t.y + this.data[10] * t.z + this.data[11] * t.w, this.data[12] * t.x + this.data[13] * t.y + this.data[14] * t.z + this.data[15] * t.w);
        }
        else {
            //a instanceof Matrix (not supported)
            throw new Error();
        }
    }
}
exports.Matrix4x4 = Matrix4x4;
Matrix4x4.IDENTITY_MATRIX = new Matrix4x4([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]);
Matrix4x4.tempMatrix4x4 = new Matrix4x4();
class Matrix2x2 extends Matrix {
    constructor(matrix) {
        if (matrix !== undefined) {
            if (matrix.length != 2 || matrix[0].length != 2 || matrix[1].length != 2) {
                throw new Error();
            }
            super(matrix);
        }
        else {
            super(2, 2);
        }
    }
    determinant() {
        return this.data[0] * this.data[3] - this.data[1] * this.data[2];
    }
}
exports.Matrix2x2 = Matrix2x2;
class Matrix3x3 extends Matrix {
    constructor(matrix) {
        if (matrix !== undefined) {
            if (matrix.length != 3 || matrix[0].length != 3 || matrix[1].length != 3 || matrix[2].length != 3) {
                throw new Error();
            }
            super(matrix);
        }
        else {
            super(3, 3);
        }
    }
    determinant() {
        var a10 = this.data[3];
        var a11 = this.data[4];
        var a12 = this.data[5];
        var a20 = this.data[6];
        var a21 = this.data[7];
        var a22 = this.data[8];
        return (this.data[0] * (a11 * a22 - a12 * a21) + this.data[1] * -(a10 * a22 - a12 * a20) + this.data[2] * (a10 * a21 - a11 * a20));
    }
}
exports.Matrix3x3 = Matrix3x3;


/***/ }),

/***/ "../raytracer/src/pointLight.ts":
/*!**************************************!*\
  !*** ../raytracer/src/pointLight.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PointLight = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/src/color.ts");
class PointLight {
    constructor(position, intensity) {
        this.positon = position !== null && position !== void 0 ? position : tuple_1.Tuple.point(0, 0, 0);
        this.intensity = intensity !== null && intensity !== void 0 ? intensity : new color_1.Color(1, 1, 1);
    }
}
exports.PointLight = PointLight;


/***/ }),

/***/ "../raytracer/src/ray.ts":
/*!*******************************!*\
  !*** ../raytracer/src/ray.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Ray = void 0;
class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    position(t) {
        return this.origin.add(this.direction.multiply(t));
    }
    transform(matrix) {
        var direction = matrix.multiply(this.direction);
        var origin = matrix.multiply(this.origin);
        var ray = new Ray(origin, direction);
        return ray;
    }
}
exports.Ray = Ray;


/***/ }),

/***/ "../raytracer/src/sort.ts":
/*!********************************!*\
  !*** ../raytracer/src/sort.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergeSortInplace = void 0;
/**
 * Merges 2 sorted regions in an array into 1 sorted region (in-place without extra memory, stable)
 * @param items array to merge
 * @param left left array boundary inclusive
 * @param middle boundary between regions (left region exclusive, right region inclusive)
 * @param right right array boundary exclusive
 */
function mergeInplace(items, compareFn, left, middle, right) {
    if (right == middle)
        return;
    for (var i = left; i < middle; i++) {
        var minRight = items[middle];
        if (compareFn(minRight, items[i]) < 0) {
            var tmp = items[i];
            items[i] = minRight;
            var nextItem;
            var next = middle + 1;
            while (next < right && compareFn((nextItem = items[next]), tmp) < 0) {
                items[next - 1] = nextItem;
                next++;
            }
            items[next - 1] = tmp;
        }
    }
}
/**
 * In-place bottom up merge sort
 */
function mergeSortInplace(items, compareFn, from, to) {
    from !== null && from !== void 0 ? from : (from = 0);
    to !== null && to !== void 0 ? to : (to = items.length);
    var maxStep = (to - from) * 2;
    for (var step = 2; step < maxStep; step *= 2) {
        var oldStep = step / 2;
        for (var x = from; x < to; x += step) {
            mergeInplace(items, compareFn, x, x + oldStep, Math.min(x + step, to));
        }
    }
}
exports.mergeSortInplace = mergeSortInplace;


/***/ }),

/***/ "../raytracer/src/sphere.ts":
/*!**********************************!*\
  !*** ../raytracer/src/sphere.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sphere = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/src/intersection.ts");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/src/matrix.ts");
const material_1 = __webpack_require__(/*! ./material */ "../raytracer/src/material.ts");
class Sphere {
    constructor(id, transform, material) {
        this.id = id;
        this.transform = transform !== null && transform !== void 0 ? transform : matrix_1.Matrix4x4.IDENTITY_MATRIX.clone();
        this.material = material !== null && material !== void 0 ? material : new material_1.Material();
    }
    /**
     * Transformation matrix. Call setter after change for updating inverse.
     */
    get transform() {
        return this._transform;
    }
    set transform(value) {
        this._transform = value;
        this.inverseTransform = value.inverse();
    }
    intersect(ray, intersections) {
        ray = ray.transform(this.inverseTransform);
        intersections !== null && intersections !== void 0 ? intersections : (intersections = new intersection_1.Intersections());
        var sphere2ray = ray.origin.substract(tuple_1.Tuple.point(0, 0, 0));
        var a = ray.direction.dot(ray.direction);
        var b = 2 * ray.direction.dot(sphere2ray);
        var c = sphere2ray.dot(sphere2ray) - 1;
        var discriminant = b * b - 4 * a * c;
        if (discriminant < 0)
            return intersections;
        var sqrtDiscriminant = Math.sqrt(discriminant);
        var i1 = intersections.add();
        i1.t = (-b - sqrtDiscriminant) / (2 * a);
        i1.object = this;
        var i2 = intersections.add();
        i2.t = (-b + sqrtDiscriminant) / (2 * a);
        i2.object = this;
        return intersections;
    }
    normalAt(p) {
        var objectNormal = this.inverseTransform.multiply(p);
        objectNormal.w = 0;
        var worldNormal = this.inverseTransform.transpose(Sphere.tempMatrix1).multiply(objectNormal);
        worldNormal.w = 0;
        return worldNormal.normalize();
    }
}
exports.Sphere = Sphere;
Sphere.tempMatrix1 = new matrix_1.Matrix4x4();


/***/ }),

/***/ "../raytracer/src/tuple.ts":
/*!*********************************!*\
  !*** ../raytracer/src/tuple.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tuple = void 0;
class Tuple {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    isPoint() {
        return this.w == 1;
    }
    isVector() {
        return this.w == 0;
    }
    add(tuple) {
        return new Tuple(this.x + tuple.x, this.y + tuple.y, this.z + tuple.z, this.w + tuple.w);
    }
    multiply(scalar) {
        return new Tuple(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }
    divide(scalar) {
        return new Tuple(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    }
    substract(tuple) {
        return new Tuple(this.x - tuple.x, this.y - tuple.y, this.z - tuple.z, this.w - tuple.w);
    }
    negate() {
        return new Tuple(-this.x, -this.y, -this.z, -this.w);
    }
    normalize() {
        return this.divide(this.magnitude());
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    dot(tuple) {
        return this.x * tuple.x + this.y * tuple.y + this.z * tuple.z + this.w * tuple.w;
    }
    cross(tuple) {
        return Tuple.vector(this.y * tuple.z - this.z * tuple.y, this.z * tuple.x - this.x * tuple.z, this.x * tuple.y - this.y * tuple.x);
    }
    reflect(normal) {
        return this.substract(normal.multiply(2 * this.dot(normal)));
    }
    equals(tuple) {
        return Math.abs(this.x - tuple.x) < Tuple.EPSILON
            && Math.abs(this.y - tuple.y) < Tuple.EPSILON
            && Math.abs(this.z - tuple.z) < Tuple.EPSILON;
    }
    static point(x, y, z) {
        return new Tuple(x, y, z, 1);
    }
    static vector(x, y, z) {
        return new Tuple(x, y, z, 0);
    }
    clone() {
        return new Tuple(this.x, this.y, this.z, this.w);
    }
}
exports.Tuple = Tuple;
Tuple.EPSILON = 0.00001;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*************************!*\
  !*** ./src/chapter6.ts ***!
  \*************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const canvas_1 = __webpack_require__(/*! raytracer/canvas */ "../raytracer/src/canvas.ts");
const color_1 = __webpack_require__(/*! raytracer/color */ "../raytracer/src/color.ts");
const intersection_1 = __webpack_require__(/*! raytracer/intersection */ "../raytracer/src/intersection.ts");
const material_1 = __webpack_require__(/*! raytracer/material */ "../raytracer/src/material.ts");
const pointLight_1 = __webpack_require__(/*! raytracer/pointLight */ "../raytracer/src/pointLight.ts");
const ray_1 = __webpack_require__(/*! raytracer/ray */ "../raytracer/src/ray.ts");
const sphere_1 = __webpack_require__(/*! raytracer/sphere */ "../raytracer/src/sphere.ts");
const tuple_1 = __webpack_require__(/*! raytracer/tuple */ "../raytracer/src/tuple.ts");
function chapter6Render() {
    var c = new canvas_1.Canvas(1024, 1024);
    var rayOrigin = tuple_1.Tuple.point(0, 0, -5);
    var wallz = 10;
    var wallSize = 7;
    var pixelSize = wallSize / c.height;
    var half = wallSize / 2;
    var shape = new sphere_1.Sphere(1);
    shape.material = new material_1.Material();
    shape.material.color = new color_1.Color(1, 0.2, 1);
    var light = new pointLight_1.PointLight(tuple_1.Tuple.point(-10, 10, -10), color_1.Color.WHITE.clone());
    var xs = new intersection_1.Intersections(10);
    for (var y = 0; y < c.height; y++) {
        var worldY = half - pixelSize * y;
        for (var x = 0; x < c.width; x++) {
            var worldX = -half + pixelSize * x;
            var position = tuple_1.Tuple.point(worldX, worldY, wallz);
            var r = new ray_1.Ray(rayOrigin, position.substract(rayOrigin).normalize());
            shape.intersect(r, xs);
            if (xs.length > 0) {
                var hit = xs.hit();
                var point = r.position(hit.t);
                var normal = shape.normalAt(point);
                var color = shape.material.lighting(light, point, r.direction.negate(), normal);
                c.writePixel(x, y, color);
            }
            xs.clear();
        }
    }
    return c;
}
var canvas = chapter6Render();
var raytracerCanvas = document.getElementById("raytracerCanvas");
raytracerCanvas.width = canvas.width;
raytracerCanvas.height = canvas.height;
var renderData = canvas.toUint8ClampedArray();
var imageData = new ImageData(renderData, canvas.width, canvas.height);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcHRlcjYtYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxnRkFBZ0M7QUFFaEMsTUFBYSxNQUFNO0lBTWhCLFlBQVksS0FBWSxFQUFDLE1BQWE7UUFFcEMsSUFBSSxDQUFDLEtBQUssR0FBQyxLQUFLLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLEdBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdDLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFDbkM7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFRCxTQUFTLENBQUMsQ0FBUSxFQUFDLENBQVE7UUFFekIsSUFBSSxDQUFDLEdBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLElBQUksQ0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzFFLElBQUksVUFBVSxHQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUUsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDNUQsT0FBTyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFFLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUNELFVBQVUsQ0FBRSxDQUFRLEVBQUMsQ0FBUSxFQUFDLENBQU87UUFFbkMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLElBQUksQ0FBQyxJQUFHLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUMxRCxJQUFJLFVBQVUsR0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFFLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDakMsQ0FBQztJQUNELEtBQUs7UUFFSixJQUFJLEdBQUcsR0FBQyxNQUFNLENBQUM7UUFDZixHQUFHLElBQUUsSUFBSSxDQUFDLEtBQUssR0FBQyxHQUFHLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxJQUFJLENBQUM7UUFDckMsR0FBRyxJQUFFLEtBQUssQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUNwQztZQUNJLEdBQUcsSUFBRSxDQUFDLENBQUMsR0FBQyxFQUFFLElBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxDQUFDLElBQUcsQ0FBQztZQUM1QixHQUFHLElBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxD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VSxFQUFFLENBQUM7UUFDaEcsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxDQUFFO0lBQzdDLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBVyxFQUFFLE1BQWMsRUFBRSxLQUFhO1FBQzFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsQ0FBQztZQUFFLE1BQU0sSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNoRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM3QyxDQUFDO0lBR0QsUUFBUSxDQUFDLE1BQWM7UUFHbkIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNO1lBQUUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3BDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFH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SSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUd0QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUd4QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUzQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUdNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsTUFBaUI7UUFFbEUsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBYyxFQUFDLE1BQWlCO1FBRXBELE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxJQUFOLE1BQU0sR0FBSSxJQUFJLFNBQVMsRUFBRSxFQUFDO1FBQzFCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxHQUFHLEdBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQWMsRUFBQyxNQUFpQjtRQUVwRCxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sSUFBTixNQUFNLEdBQUksSUFBSSxTQUFTLEVBQUUsRUFBQztRQUMxQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksR0FBRyxHQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFjLEVBQUMsTUFBaUI7UUFFcEQsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLEdBQUcsR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsTUFBaUI7UUFFOUQsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsTUFBaUI7UUFFaEcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQWdCRCxTQUFTLENBQUMsTUFBaUI7UUFFdkIsSUFBSSxJQUFXLENBQUM7UUFDaEIsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBaUI7UUFFckIsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFLLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDM0IsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLFdBQVcsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLFdBQVcsSUFBRSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbkcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNuRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ25HLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE9BQU8sTUFBTSxDQUFDO0lBRWxCLENBQUM7SUFDRCxXQUFXO1FBRVAsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBZ0I7UUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBS0QsUUFBUSxDQUFDLENBQUssRUFBQyxDQUFNO1FBRW5CLElBQUksQ0FBQyxZQUFZLFNBQVMsRUFDMUI7WUFDRSxJQUFJLE1BQU0sR0FBSSxDQUFDLGFBQUQsQ0FBQyxjQUFELENBQUMsR0FBSyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3BDLElBQUksTUFBTSxLQUFHLElBQUk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFFLENBQWMsQ0FBQztZQUMzQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFHbEcsT0FBTyxNQUFNLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxZQUFZLGFBQUssRUFDN0I7WUFDRSxJQUFJLENBQUMsR0FBRSxDQUFVLENBQUM7WUFDbEIsT0FBTyxJQUFJLGFBQUssQ0FDZixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3RFLENBQUM7U0FDTjthQUNEO1lBQ0kscUNBQXFDO1lBQ3JDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztTQUNyQjtJQUNILENBQUM7O0FBdlpMLDhCQXlaQztBQXZaMEIseUJBQWUsR0FBRSxJQUFJLFNBQVMsQ0FDakQ7SUFDSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztDQUNaLENBQ0osQ0FBQztBQUNhLHVCQUFhLEdBQUUsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQWlabEQsTUFBYSxTQUFVLFNBQVEsTUFBTTtJQUdqQyxZQUFZLE1BQTZCO1FBRXJDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUV6QixJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUNsRTtnQkFDSSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7YUFDckI7WUFDQSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDZjthQUFNO1lBQ0wsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUNELFdBQVc7UUFFVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKO0FBcEJELDhCQW9CQztBQUVELE1BQWEsU0FBVSxTQUFRLE1BQU07SUFHakMsWUFBWSxNQUE2QjtRQUVyQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFFekIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsRUFDekY7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2FBQ3JCO1lBQ0EsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2Y7YUFBTTtZQUNMLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDYjtJQUNMLENBQUM7SUFHRCxXQUFXO1FBRVAsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRyxDQUFDO0NBRUo7QUE5QkQsOEJBOEJDOzs7Ozs7Ozs7Ozs7OztBQzltQkQsZ0ZBQTZCO0FBQzdCLGdGQUE2QjtBQUM3QixNQUFhLFVBQVU7SUFJbkIsWUFBWSxRQUFlLEVBQUMsU0FBZ0I7UUFFMUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBRyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBRyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQVRELGdDQVNDOzs7Ozs7Ozs7Ozs7OztBQ1JELE1BQWEsR0FBRztJQUlaLFlBQVksTUFBWSxFQUFDLFNBQWU7UUFFdEMsSUFBSSxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBQyxTQUFTLENBQUM7SUFDM0IsQ0FBQztJQUNELFFBQVEsQ0FBQyxDQUFRO1FBRWIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxTQUFTLENBQUMsTUFBZ0I7UUFFekIsSUFBSSxTQUFTLEdBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsSUFBSSxNQUFNLEdBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekMsSUFBSSxHQUFHLEdBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNKO0FBdEJELGtCQXNCQzs7Ozs7Ozs7Ozs7Ozs7QUN6QkQ7Ozs7OztHQU1HO0FBQ0YsU0FBUyxZQUFZLENBQUksS0FBVSxFQUFFLFNBQWdDLEVBQUMsSUFBVyxFQUFDLE1BQWEsRUFBRSxLQUFZO0lBQzFHLElBQUksS0FBSyxJQUFFLE1BQU07UUFBRSxPQUFPO0lBQzFCLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUU7UUFFL0IsSUFBSSxRQUFRLEdBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLElBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEVBQ25DO1lBQ0ksSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRSxRQUFRLENBQUM7WUFDbkIsSUFBSSxRQUFVLENBQUM7WUFDZixJQUFJLElBQUksR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1lBQ2xCLE9BQU0sSUFBSSxHQUFDLEtBQUssSUFBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxFQUMxRDtnQkFDRSxLQUFLLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLFFBQVEsQ0FBQztnQkFDdkIsSUFBSSxFQUFFLENBQUM7YUFDUjtZQUNELEtBQUssQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1NBQ3JCO0tBQ0o7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBSSxLQUFVLEVBQUUsU0FBZ0MsRUFBQyxJQUFZLEVBQUMsRUFBVTtJQUNwRyxJQUFJLGFBQUosSUFBSSxjQUFKLElBQUksSUFBSixJQUFJLEdBQUcsQ0FBQyxFQUFDO0lBQ1QsRUFBRSxhQUFGLEVBQUUsY0FBRixFQUFFLElBQUYsRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUM7SUFDbEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxPQUFPLEVBQUMsSUFBSSxJQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLE9BQU8sR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDO1FBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUVyQyxZQUFZLENBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE9BQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEVBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztTQUNoRTtLQUNKO0FBR0wsQ0FBQztBQWJELDRDQWFDOzs7Ozs7Ozs7Ozs7OztBQzNDRCxnRkFBZ0M7QUFDaEMscUdBQTZEO0FBQzdELG1GQUFxQztBQUNyQyx5RkFBc0M7QUFFdEMsTUFBYSxNQUFNO0lBb0JqQixZQUFZLEVBQVUsRUFBRSxTQUFxQixFQUFFLFFBQW1CO1FBQ2hFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxrQkFBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLElBQUksbUJBQVEsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFuQkQ7O09BRUc7SUFDSCxJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFXLFNBQVMsQ0FBQyxLQUFnQjtRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsZ0JBQWdCLEdBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFZRCxTQUFTLENBQUMsR0FBUSxFQUFFLGFBQTZCO1FBQy9DLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNDLGFBQWEsYUFBYixhQUFhLGNBQWIsYUFBYSxJQUFiLGFBQWEsR0FBSyxJQUFJLDRCQUFhLEVBQUUsRUFBQztRQUN0QyxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksWUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsSUFBSSxZQUFZLEdBQUcsQ0FBQztZQUFFLE9BQU8sYUFBYSxDQUFDO1FBQzNDLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvQyxJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRWpCLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxRQUFRLENBQUMsQ0FBUTtRQUNmLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdGLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7O0FBcERILHdCQXFEQztBQXBDZ0Isa0JBQVcsR0FBRyxJQUFJLGtCQUFTLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUN2Qi9DLE1BQWEsS0FBSztJQVVkLFlBQVksQ0FBVSxFQUFFLENBQVUsRUFBRSxDQUFVLEVBQUUsQ0FBVTtRQUN0RCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7SUFDTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBQ00sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVNLEdBQUcsQ0FBQyxLQUFZO1FBQ25CLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFDTSxRQUFRLENBQUMsTUFBYztRQUMxQixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3hGLENBQUM7SUFDTSxNQUFNLENBQUMsTUFBYztRQUN4QixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3hGLENBQUM7SUFDTSxTQUFTLENBQUMsS0FBWTtRQUN6QixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBQ00sTUFBTTtRQUNULE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFDTSxHQUFHLENBQUMsS0FBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBQ00sS0FBSyxDQUFDLEtBQVk7UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQ25ELElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQ25DLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQ3RDLENBQUM7SUFDTixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQVk7UUFFbEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDTSxNQUFNLENBQUMsS0FBWTtRQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU87ZUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTztlQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDdEQsQ0FBQztJQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3hDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3pDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNELEtBQUs7UUFDRCxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDOztBQXZFTCxzQkF3RUM7QUFsRWtCLGFBQU8sR0FBVyxPQUFPLENBQUM7Ozs7Ozs7VUNON0M7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7O0FDdEJBLDJGQUEwQztBQUMxQyx3RkFBd0M7QUFDeEMsNkdBQXFFO0FBQ3JFLGlHQUE4QztBQUM5Qyx1R0FBa0Q7QUFDbEQsa0ZBQW9DO0FBQ3BDLDJGQUEwQztBQUMxQyx3RkFBd0M7QUFHeEMsU0FBUyxjQUFjO0lBRW5CLElBQUksQ0FBQyxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixJQUFJLFNBQVMsR0FBRyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxJQUFJLEtBQUssR0FBQyxFQUFFLENBQUM7SUFDYixJQUFJLFFBQVEsR0FBQyxDQUFDLENBQUM7SUFDZixJQUFJLFNBQVMsR0FBQyxRQUFRLEdBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxJQUFJLElBQUksR0FBQyxRQUFRLEdBQUMsQ0FBQyxDQUFDO0lBQ3BCLElBQUksS0FBSyxHQUFDLElBQUksZUFBTSxDQUFDLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUMsUUFBUSxHQUFFLElBQUksbUJBQVEsRUFBRSxDQUFDO0lBQy9CLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFDLElBQUksYUFBSyxDQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsSUFBSSxLQUFLLEdBQUcsSUFBSSx1QkFBVSxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLElBQUksRUFBRSxHQUFFLElBQUksNEJBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFDM0I7UUFDSSxJQUFJLE1BQU0sR0FBQyxJQUFJLEdBQUMsU0FBUyxHQUFDLENBQUMsQ0FBQztRQUM1QixLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUUsRUFDMUI7WUFFSSxJQUFJLE1BQU0sR0FBQyxDQUFDLElBQUksR0FBQyxTQUFTLEdBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksUUFBUSxHQUFHLGFBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsR0FBRSxJQUFJLFNBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBRSxDQUFDO1lBQ3RFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQ2Y7Z0JBQ0ksSUFBSSxHQUFHLEdBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNsQixJQUFJLEtBQUssR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxNQUFNLEdBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDLElBQUksS0FBSyxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDN0UsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1lBQ0QsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBRWQ7S0FDSjtJQUNELE9BQU8sQ0FBQyxDQUFDO0FBQ2IsQ0FBQztBQUVELElBQUksTUFBTSxHQUFHLGNBQWMsRUFBRSxDQUFDO0FBQzlCLElBQUksZUFBZSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEYsZUFBZSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3JDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN2QyxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUM5QyxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkUsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY2FudmFzLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb2xsZWN0aW9uLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb2xvci50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvaW50ZXJzZWN0aW9uLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9tYXRlcmlhbC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvbWF0cml4LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9wb2ludExpZ2h0LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9yYXkudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3NvcnQudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvdHVwbGUudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4vc3JjL2NoYXB0ZXI2LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbG9yIH0gZnJvbSBcIi4vY29sb3JcIjtcblxuZXhwb3J0IGNsYXNzIENhbnZhcyBcbnsgIFxuICAgZGF0YTpGbG9hdDY0QXJyYXk7XG4gICB3aWR0aDpudW1iZXI7XG4gICBoZWlnaHQ6bnVtYmVyO1xuXG4gICBjb25zdHJ1Y3Rvcih3aWR0aDpudW1iZXIsaGVpZ2h0Om51bWJlcilcbiAgIHtcbiAgICAgdGhpcy53aWR0aD13aWR0aDtcbiAgICAgdGhpcy5oZWlnaHQ9aGVpZ2h0O1xuICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHdpZHRoKmhlaWdodCozKTtcbiAgICAgZm9yICh2YXIgaT0wO2k8dGhpcy5kYXRhLmxlbmd0aDtpKyspXG4gICAgIHtcbiAgICAgICAgIHRoaXMuZGF0YVtpXT0wO1xuICAgICB9XG4gICB9XG5cbiAgIHJlYWRQaXhlbCh4Om51bWJlcix5Om51bWJlcik6Q29sb3JcbiAgIHtcbiAgICAgaWYgKHg8MHx8IHg+PXRoaXMud2lkdGggfHwgeTwwIHx8IHk+PSB0aGlzLmhlaWdodCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgdmFyIHBpeGVsSW5kZXg9IE1hdGguZmxvb3IoeSkqIHRoaXMud2lkdGgqMytNYXRoLmZsb29yKHgpKjM7XG4gICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5kYXRhW3BpeGVsSW5kZXhdLHRoaXMuZGF0YVtwaXhlbEluZGV4ICsxXSx0aGlzLmRhdGFbcGl4ZWxJbmRleCArMl0pO1xuICAgfVxuICAgd3JpdGVQaXhlbCAoeDpudW1iZXIseTpudW1iZXIsYzpDb2xvcik6dm9pZFxuICAge1xuICAgICBpZiAoeDwwfHwgeD49dGhpcy53aWR0aCB8fCB5PDAgfHwgeT49IHRoaXMuaGVpZ2h0KSByZXR1cm47XG4gICAgIHZhciBwaXhlbEluZGV4PSBNYXRoLmZsb29yKHkpKiB0aGlzLndpZHRoKjMrTWF0aC5mbG9vcih4KSozO1xuICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleF09Yy5yZWQ7XG4gICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4KzFdPWMuZ3JlZW47XG4gICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4KzJdPWMuYmx1ZTtcbiAgIH1cbiAgIHRvUHBtKCk6c3RyaW5nXG4gICB7XG4gICAgdmFyIHBwbT1cIlAzXFxuXCI7XG4gICAgcHBtKz10aGlzLndpZHRoK1wiIFwiK3RoaXMuaGVpZ2h0K1wiXFxuXCI7XG4gICAgcHBtKz1cIjI1NVwiO1xuICAgIGZvciAodmFyIGk9MDtpPHRoaXMuZGF0YS5sZW5ndGg7aSs9MylcbiAgICB7XG4gICAgICAgIHBwbSs9KGklMTU9PTApID8gIFwiXFxuXCIgOlwiIFwiO1xuICAgICAgICBwcG0rPSBNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpXSoyNTUpLDI1NSksMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgKyBcIiBcIitNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpKzFdKjI1NSksMjU1KSwwKS50b1N0cmluZygpXG4gICAgICAgICAgICArXCIgXCIrTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSsyXSoyNTUpLDI1NSksMCkudG9TdHJpbmcoKTsgXG5cbiAgICB9XG4gICAgcHBtKz1cIlxcblwiO1xuICAgIHJldHVybiBwcG07XG4gICB9XG4gICB0b1VpbnQ4Q2xhbXBlZEFycmF5KCk6VWludDhDbGFtcGVkQXJyYXlcbiAgIHtcbiAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KjQpO1xuICAgICB2YXIgYXJySW5kZXg9MDtcbiAgICAgZm9yICh2YXIgaT0wO2k8dGhpcy5kYXRhLmxlbmd0aDtpKz0zKVxuICAgICB7ICAgICAgICBcbiAgICAgICAgIGFyclthcnJJbmRleF09IHRoaXMuZGF0YVtpXSoyNTU7XG4gICAgICAgICBhcnJbYXJySW5kZXgrMV09ICB0aGlzLmRhdGFbaSsxXSoyNTU7XG4gICAgICAgICBhcnJbYXJySW5kZXgrMl09IHRoaXMuZGF0YVtpKzJdKjI1NTtcbiAgICAgICAgIGFyclthcnJJbmRleCszXT0gMjU1O1xuICAgICAgICAgYXJySW5kZXgrPTQ7IFxuICAgICB9XG4gICAgIFxuICAgICByZXR1cm4gYXJyO1xuICAgfVxufSIsIlxuLyoqXG4gKiBPYmplY3QgcG9vbCB0aGF0IHdpbGwgbWluaW1pemUgZ2FyYmFnZSBjb2xsZWN0aW9uIHVzYWdlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPYmplY3RQb29sPFQ+XG57XG4gICAgcHJvdGVjdGVkIGl0ZW1zOlRbXTtcbiAgICBwcm90ZWN0ZWQgX2xlbmd0aDpudW1iZXI7XG4gICAgcHJvdGVjdGVkIGluZGV4TWFwOk1hcDxULG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcihhcnJheUxlbmd0aDpudW1iZXI9MClcbiAgICB7XG4gICAgICB0aGlzLml0ZW1zPW5ldyBBcnJheTxUPihhcnJheUxlbmd0aCk7XG4gICAgICB0aGlzLmluZGV4TWFwPSBuZXcgTWFwPFQsbnVtYmVyPigpO1xuICAgICAgdGhpcy5fbGVuZ3RoPTA7XG4gICAgICBmb3IgKHZhciBpPTA7aTxhcnJheUxlbmd0aDtpKyspXG4gICAgICB7XG4gICAgICAgIHZhciBuZXdJdGVtPXRoaXMuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0saSk7XG4gICAgICAgIHRoaXMuaXRlbXNbaV09bmV3SXRlbTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH1cblxuICAgIGluZGV4T2YoaXRlbTpUKTpudW1iZXJcbiAgICB7XG4gICAgIHZhciBpPSB0aGlzLmluZGV4TWFwLmdldChpdGVtKTtcbiAgICAgcmV0dXJuIChpPT09dW5kZWZpbmVkIHx8IGk+PXRoaXMuX2xlbmd0aCkgID8gLTE6IGk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGFuZCBmaWxscyB0aGUgZ2FwIHdpdGggdGhlIGxhc3QgaXRlbS5cbiAgICAgKiBSZW1vdmVkIGl0ZW1zIHdpbGwgYmUgcmV1c2VkIHdoZW4gY2FsbGluZyAuYWRkKCkgXG4gICAgKi9cbiAgICByZW1vdmUoaXRlbTpUKTp2b2lkO1xuICAgIHJlbW92ZShpbmRleDpudW1iZXIpOnZvaWQ7XG4gICAgcHVibGljIHJlbW92ZShhOmFueSk6dm9pZFxuICAgIHsgXG4gICAgICAgIHZhciBpbmRleDpudW1iZXI7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleD10aGlzLmluZGV4TWFwLmdldChhKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgIH0gZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleD0gTWF0aC5mbG9vcihhIGFzIG51bWJlcik7IFxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8MCB8fCBpbmRleCA+PXRoaXMuX2xlbmd0aCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sZW5ndGgtLTsgICAgICAgIFxuICAgICAgICB2YXIgcmVtb3ZlSXRlbT0gIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgICAgICB2YXIgbGFzdEl0ZW09dGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdO1xuICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IGxhc3RJdGVtO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF09cmVtb3ZlSXRlbTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQocmVtb3ZlSXRlbSx0aGlzLl9sZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChsYXN0SXRlbSxpbmRleCk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpXG4gICAge1xuICAgICAgICB0aGlzLl9sZW5ndGg9MDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIHVudXNlZCBpdGVtIG9yIGNyZWF0ZXMgYSBuZXcgb25lLCBpZiBubyB1bnVzZWQgaXRlbSBhdmFpbGFibGVcbiAgICAqL1xuICAgIHB1YmxpYyBhZGQoKTpUXG4gICAge1xuICAgICAgICBpZiAodGhpcy5pdGVtcy5sZW5ndGg9PXRoaXMuX2xlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW09dGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aD10aGlzLml0ZW1zLnB1c2gobmV3SXRlbSk7ICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBuZXdJdGVtO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoKytdOyAgXG4gICAgfVxuICAgIHB1YmxpYyBnZXQoaW5kZXg6bnVtYmVyKTpUIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBpZiAoaW5kZXggPj10aGlzLl9sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7ICAgXG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCkgOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuICAgIFxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoKTpUO1xufVxuXG4iLCJleHBvcnQgY2xhc3MgQ29sb3Ige1xuICAgIHB1YmxpYyByZWQ6IG51bWJlcjtcbiAgICBwdWJsaWMgZ3JlZW46IG51bWJlcjtcbiAgICBwdWJsaWMgYmx1ZTogbnVtYmVyO1xuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIEVQU0lMT046IG51bWJlciA9IDAuMDAwMDE7XG4gICAgXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBCTEFDSz0gT2JqZWN0LmZyZWV6ZShuZXcgQ29sb3IoMCwwLDApKTtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdISVRFPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigxLDEsMSkpO1xuICAgIGNvbnN0cnVjdG9yKClcbiAgICBjb25zdHJ1Y3RvcihyZWQ6IG51bWJlciwgZ3JlZW46IG51bWJlciwgYmx1ZTogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKHJlZD86IG51bWJlciwgZ3JlZW4/OiBudW1iZXIsIGJsdWU/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yZWQgPSByZWQ7XG4gICAgICAgIHRoaXMuZ3JlZW4gPSBncmVlbjtcbiAgICAgICAgdGhpcy5ibHVlID0gYmx1ZTsgICAgICAgIFxuICAgIH1cblxuXG4gICAgcHVibGljIGFkZChjb2xvcjogQ29sb3IpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKyBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKyBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICsgY29sb3IuYmx1ZSlcbiAgICB9XG4gICAgcHVibGljIG11bHRpcGx5KHNjYWxhcjogbnVtYmVyKTogQ29sb3Ige1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICogc2NhbGFyLCB0aGlzLmdyZWVuICogc2NhbGFyLCB0aGlzLmJsdWUgKiBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBkaXZpZGUoc2NhbGFyOiBudW1iZXIpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLyBzY2FsYXIsIHRoaXMuZ3JlZW4gLyBzY2FsYXIsIHRoaXMuYmx1ZSAvIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIHN1YnN0cmFjdChjb2xvcjogQ29sb3IpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLSBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gLSBjb2xvci5ncmVlbiwgdGhpcy5ibHVlIC0gY29sb3IuYmx1ZSlcbiAgICB9XG4gICAgcHVibGljIGhhZGFtYXJkUHJvZHVjdChjb2xvcjpDb2xvcilcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQqY29sb3IucmVkLHRoaXMuZ3JlZW4qY29sb3IuZ3JlZW4sdGhpcy5ibHVlKmNvbG9yLmJsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBlcXVhbHMoY29sb3I6IENvbG9yKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnJlZCAtIGNvbG9yLnJlZCkgPCBDb2xvci5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4pIDwgQ29sb3IuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ibHVlIC0gY29sb3IuYmx1ZSkgPCBDb2xvci5FUFNJTE9OO1xuICAgIH1cbiAgICBjbG9uZSgpXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkLHRoaXMuZ3JlZW4sdGhpcy5ibHVlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgT2JqZWN0UG9vbCB9IGZyb20gXCIuL2NvbGxlY3Rpb25cIlxuaW1wb3J0IHttZXJnZVNvcnRJbnBsYWNlfSBmcm9tIFwiLi9zb3J0XCJcbmltcG9ydCB7IElXb3JsZE9iamVjdCB9IGZyb20gXCIuL3dvcmxkXCI7XG5leHBvcnQgY2xhc3MgSW50ZXJzZWN0aW9uIHtcbiAgICB0OiBudW1iZXI7XG4gICAgb2JqZWN0OiBJV29ybGRPYmplY3Q7XG4gICAgY29uc3RydWN0b3IodDogbnVtYmVyLCBvYmplY3Q6IGFueSkge1xuXG4gICAgICAgIHRoaXMudCA9IHQ7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgIH1cbiAgICBlcXVhbHMoaW50ZXJzZWN0aW9uOiBJbnRlcnNlY3Rpb24pOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudCA9PSBpbnRlcnNlY3Rpb24udCAmJiB0aGlzLm9iamVjdCA9PT0gaW50ZXJzZWN0aW9uLm9iamVjdDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcnNlY3Rpb25zIGV4dGVuZHMgT2JqZWN0UG9vbDxJbnRlcnNlY3Rpb24+IHtcblxuICAgIHByaXZhdGUgc3RhdGljIHNvcnRJbnRlcnNlY3Rpb24oYTpJbnRlcnNlY3Rpb24gLGI6SW50ZXJzZWN0aW9uKTpudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiBhLnQtYi50O1xuICAgIH1cblxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZSgpOiBJbnRlcnNlY3Rpb24ge1xuICAgICAgICByZXR1cm4gbmV3IEludGVyc2VjdGlvbigwLCBudWxsKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGhpdCwgcmVnYXJkbGVzcyBvZiBzb3J0XG4gICAgKi9cbiAgICBoaXQoKTogSW50ZXJzZWN0aW9uIHtcbiAgICAgICAgdmFyIGhpdDogSW50ZXJzZWN0aW9uID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKChoaXQgPT0gbnVsbCB8fCBpdGVtLnQgPCBoaXQudCkgJiYgaXRlbS50ID4gMCkgaGl0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGl0O1xuICAgIH1cbiAgICBzb3J0KCk6IHZvaWQgeyAgICAgICBcbiAgICAgICAgbWVyZ2VTb3J0SW5wbGFjZSh0aGlzLml0ZW1zLEludGVyc2VjdGlvbnMuc29ydEludGVyc2VjdGlvbiwwLHRoaXMuX2xlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KHRoaXMuaXRlbXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb25zOiBJbnRlcnNlY3Rpb25zKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggIT0gaW50ZXJzZWN0aW9ucy5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1zW2ldLmVxdWFscyhpbnRlcnNlY3Rpb25zLml0ZW1zW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL2NvbG9yXCI7XG5pbXBvcnQgeyBQb2ludExpZ2h0IH0gZnJvbSBcIi4vcG9pbnRMaWdodFwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxcbntcbiAgICBjb2xvcjpDb2xvcj1Db2xvci5XSElURS5jbG9uZSgpO1xuICAgIGFtYmllbnQ6bnVtYmVyPTAuMTtcbiAgICBkaWZmdXNlOm51bWJlcj0wLjk7XG4gICAgc3BlY3VsYXI6bnVtYmVyPTAuOTtcbiAgICBzaGluaW5lc3M6bnVtYmVyPTIwMDtcblxuICAgIGxpZ2h0aW5nKGxpZ2h0OlBvaW50TGlnaHQscG9pbnQ6VHVwbGUsZXlldjpUdXBsZSxub3JtYWx2OlR1cGxlKTpDb2xvclxuICAgIHtcbiAgICAgICB2YXIgZWZmZWN0aXZlQ29sb3I9dGhpcy5jb2xvci5oYWRhbWFyZFByb2R1Y3QobGlnaHQuaW50ZW5zaXR5KTtcbiAgICAgICB2YXIgbGlnaHR2PWxpZ2h0LnBvc2l0b24uc3Vic3RyYWN0KHBvaW50KS5ub3JtYWxpemUoKTtcbiAgICAgICB2YXIgYW1iaWVudD1lZmZlY3RpdmVDb2xvci5tdWx0aXBseSh0aGlzLmFtYmllbnQpO1xuICAgICAgIHZhciBsaWdodERvdE5vcm1hbD1saWdodHYuZG90KG5vcm1hbHYpO1xuICAgICAgIHZhciBkaWZmdXNlO1xuICAgICAgIHZhciBzcGVjdWxhcjtcbiAgICAgICBpZiAobGlnaHREb3ROb3JtYWw8MClcbiAgICAgICB7XG4gICAgICAgICBkaWZmdXNlPUNvbG9yLkJMQUNLO1xuICAgICAgICAgc3BlY3VsYXI9Q29sb3IuQkxBQ0s7XG4gICAgICAgfSBlbHNlXG4gICAgICAge1xuICAgICAgICAgICBkaWZmdXNlPWVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuZGlmZnVzZSpsaWdodERvdE5vcm1hbCk7XG4gICAgICAgICAgIHZhciByZWZsZWN0dj1saWdodHYubmVnYXRlKCkucmVmbGVjdChub3JtYWx2KTtcbiAgICAgICAgICAgdmFyIHJlZmxlY3REb3RFeWU9IHJlZmxlY3R2LmRvdChleWV2KTtcbiAgICAgICAgICAgaWYgKHJlZmxlY3REb3RFeWUgPD0wKVxuICAgICAgICAgICB7XG4gICAgICAgICAgICAgICBzcGVjdWxhcj1Db2xvci5CTEFDSztcbiAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgIHtcbiAgICAgICAgICAgICB2YXIgZmFjdG9yPU1hdGgucG93KHJlZmxlY3REb3RFeWUsdGhpcy5zaGluaW5lc3MpO1xuICAgICAgICAgICAgIHNwZWN1bGFyPSBsaWdodC5pbnRlbnNpdHkubXVsdGlwbHkodGhpcy5zcGVjdWxhcipmYWN0b3IgKTtcblxuICAgICAgICAgICB9XG4gICAgICAgfVxuICAgICAgIHJldHVybiBhbWJpZW50LmFkZChkaWZmdXNlKS5hZGQoc3BlY3VsYXIpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgge1xuICAgIHByaXZhdGUgc3RhdGljIEVQU0lMT046IG51bWJlciA9IDAuMDAwMDE7XG4gICAgcHJvdGVjdGVkIGRhdGE6IEZsb2F0NjRBcnJheTtcbiAgICBcbiAgIFxuICAgIHB1YmxpYyByZWFkb25seSB3aWR0aDogbnVtYmVyO1xuICAgIHB1YmxpYyByZWFkb25seSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeDogQXJyYXk8QXJyYXk8bnVtYmVyPj4pXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpXG4gICAgY29uc3RydWN0b3IoYTogYW55LCBiPzogYW55KSB7XG4gICAgICAgIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhIGFzIEFycmF5PEFycmF5PG51bWJlcj4+O1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGg9PTAgfHwgbWF0cml4WzBdLmxlbmd0aD09MCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoPW1hdHJpeFswXS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodD1tYXRyaXgubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KCB0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeD0wO3g8IHRoaXMud2lkdGg7eCsrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWU9IHJvd1t4XTtcbiAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUhPT11bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3RoaXMud2lkdGgqeSt4XT12YWx1ZTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBhIGFzIG51bWJlcjtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gYiBhcyBudW1iZXI7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGgqdGhpcy5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvZmFjdG9yKHJvdzpudW1iZXIsY29sdW1uOm51bWJlcik6bnVtYmVyXG4gICAge1xuICAgICAgIHJldHVybiAoKHJvdytjb2x1bW4pICUgMiAqMiAtMSkqIC10aGlzLm1pbm9yKHJvdyxjb2x1bW4pO1xuICAgIH1cbiAgICBtaW5vcihyb3c6bnVtYmVyLGNvbHVtbjpudW1iZXIpOm51bWJlclxuICAgIHsgICBcbiAgICAgICAgdmFyIG09IHRoaXMuc3VibWF0cml4KHJvdyxjb2x1bW4pOyAgICAgICAgXG4gICAgICAgIHJldHVybiBtLmRldGVybWluYW50KCk7IFxuICAgIH1cbiAgICBpc0ludmVydGlibGUoKTpib29sZWFuXG4gICAge1xuICAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmFudCgpIT0wO1xuICAgIH1cbiAgIFxuICAgIGRldGVybWluYW50KCk6bnVtYmVyXG4gICAge1xuICAgICAgICBpZiAodGhpcy53aWR0aCE9dGhpcy5oZWlnaHQpIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICBpZiAodGhpcy53aWR0aD09MikgcmV0dXJuIE1hdHJpeDJ4Mi5wcm90b3R5cGUuZGV0ZXJtaW5hbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIGRldD0wO1xuICAgICAgICBmb3IgKHZhciB4PTA7eDx0aGlzLndpZHRoO3grKylcbiAgICAgICAge1xuICAgICAgICAgZGV0Kz0gdGhpcy5kYXRhW3hdKnRoaXMuY29mYWN0b3IoMCx4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICB2YXIgc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7IFxuICAgICAgICAgICAgc3RyaW5nICs9IFwifFwiICAgXG4gICAgICAgICAgICBmb3IgKHZhciB4PTA7eDwgdGhpcy53aWR0aDt4KyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RyaW5nICs9ICB0aGlzLmRhdGFbdGhpcy53aWR0aCp5K3hdLnRvRml4ZWQoMikrXCJcXHR8XCI7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHJpbmcgKz0gIFwiXFxuXCI7ICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0KHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcikge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLndpZHRoKnJvdytjb2x1bW5dIDtcbiAgICB9XG5cbiAgICBzZXQocm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICB0aGlzLmRhdGFbdGhpcy53aWR0aCpyb3crY29sdW1uXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcblxuICAgIG11bHRpcGx5KG1hdHJpeDogTWF0cml4KTogTWF0cml4XG4gICAgeyAgICAgXG4gICAgICAgICAgIFxuICAgICAgICBpZiAobWF0cml4LmhlaWdodCAhPSB0aGlzLmhlaWdodCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeChtYXRyaXgud2lkdGgsIG1hdHJpeC5oZWlnaHQpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgbWF0cml4LmhlaWdodDsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBtYXRyaXguZGF0YVt0aGlzLndpZHRoKnIreF0gKiB0aGlzLmRhdGFbdGhpcy53aWR0aCp5K3JdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbdGhpcy53aWR0aCp5K3hdID0gc3VtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cblxuICAgIHRyYW5zcG9zZSgpIDpNYXRyaXhcbiAgICB7XG4gICAgICAgIHZhciBtYXRyaXg9IG5ldyBNYXRyaXgodGhpcy5oZWlnaHQsdGhpcy53aWR0aCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0geTsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4PXRoaXMud2lkdGgqeSt4O1xuICAgICAgICAgICAgICAgIHZhciBpbmRleFRyYW5zcG9zZWQ9dGhpcy53aWR0aCp4K3k7XG4gICAgICAgICAgICAgICAgdmFyIHN3YXA9ICB0aGlzLmRhdGFbaW5kZXhdOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleF0gPSB0aGlzLmRhdGFbaW5kZXhUcmFuc3Bvc2VkXTtcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleFRyYW5zcG9zZWRdID0gc3dhcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0cml4O1xuICAgIH1cbiAgICBcblxuICAgIHN1Ym1hdHJpeChyb3c6bnVtYmVyLGNvbHVtbjpudW1iZXIpOk1hdHJpeFxuICAgIHtcbiAgICAgICAgdmFyIG09IG5ldyBNYXRyaXgodGhpcy53aWR0aC0xLHRoaXMuaGVpZ2h0LTEpOyAgICAgICBcbiAgICAgICAgdmFyIHkyPTA7ICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBpZiAoeT09cm93KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHgyPTA7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIGlmICh4PT1jb2x1bW4pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW20ud2lkdGgqeTIreDJdPXRoaXMuZGF0YVt0aGlzLndpZHRoKnkreF07XG4gICAgICAgICAgICAgICAgeDIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHkyKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuIFxuXG4gICAgZXF1YWxzKG1hdHJpeDogTWF0cml4KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IG1hdHJpeC53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBtYXRyaXguaGVpZ2h0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZj0gTWF0aC5hYnModGhpcy5kYXRhW2ldIC0gbWF0cml4LmRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaWZmID49IE1hdHJpeC5FUFNJTE9OKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXg0eDQgZXh0ZW5kcyBNYXRyaXhcbntcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElERU5USVRZX01BVFJJWCA9bmV3IE1hdHJpeDR4NChcbiAgICAgICAgW1xuICAgICAgICAgICAgWzEsMCwwLDBdLFxuICAgICAgICAgICAgWzAsMSwwLDBdLFxuICAgICAgICAgICAgWzAsMCwxLDBdLFxuICAgICAgICAgICAgWzAsMCwwLDFdXG4gICAgICAgIF1cbiAgICApO1xuICAgIHByaXZhdGUgc3RhdGljIHRlbXBNYXRyaXg0eDQ9IG5ldyBNYXRyaXg0eDQoKTtcblxuICAgIHB1YmxpYyBzdGF0aWMgdmlld1RyYW5zZm9ybShmcm9tOlR1cGxlLHRvOlR1cGxlLHVwOlR1cGxlICx0YXJnZXQ/Ok1hdHJpeDR4NCk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB0YXJnZXQ/Pz1uZXcgTWF0cml4NHg0KCk7XG5cbiAgICAgICAgdmFyIGZvcndhcmQ9dG8uc3Vic3RyYWN0KGZyb20pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgdXBuPSB1cC5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIGxlZnQgPWZvcndhcmQuY3Jvc3ModXBuKTtcbiAgICAgICAgdmFyIHRydWVVcD1sZWZ0LmNyb3NzKGZvcndhcmQpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT1sZWZ0Lng7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdPWxlZnQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09bGVmdC56O1xuXG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09dHJ1ZVVwLng7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPXRydWVVcC55O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT10cnVlVXAuejtcblxuXG4gICAgICAgIHRhcmdldC5kYXRhWzhdPS1mb3J3YXJkLng7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPS1mb3J3YXJkLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT0tZm9yd2FyZC56O1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICBcbiAgICAgICAgTWF0cml4NHg0LnRyYW5zbGF0aW9uKC1mcm9tLngsLWZyb20ueSwtZnJvbS56LCBNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCk7XG5cbiAgICAgICAgdGFyZ2V0Lm11bHRpcGx5KE1hdHJpeDR4NC50ZW1wTWF0cml4NHg0LHRhcmdldCk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0aW9uKHg6bnVtYmVyLHk6bnVtYmVyLHo6bnVtYmVyLHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldD8/PW5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPXk7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT16O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyByb3RhdGlvblgocmFkaWFuczpudW1iZXIsdGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0Pz89IG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgdmFyIGNvcz1NYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbj0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09c2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0tc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgcm90YXRpb25ZKHJhZGlhbnM6bnVtYmVyLHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldD8/PSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIHZhciBjb3M9TWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW49IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPS1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uWihyYWRpYW5zOm51bWJlcix0YXJnZXQ/Ok1hdHJpeDR4NCk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB0YXJnZXQ/Pz0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB2YXIgY29zPU1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPS1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBzY2FsaW5nKHg6bnVtYmVyLHk6bnVtYmVyLHo6bnVtYmVyLHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldD8/PSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPXk7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT16O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgc2hlYXJpbmcoeHk6bnVtYmVyLHh6Om51bWJlcix5eDpudW1iZXIseXo6bnVtYmVyLHp4Om51bWJlcix6eTpudW1iZXIsdGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0Pz89IG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09eXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPXp4O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT14eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09enk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPXh6O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT15ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeD86IEFycmF5PEFycmF5PG51bWJlcj4+KSBcbiAgICB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcbiAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoIT00IHx8IG1hdHJpeFswXS5sZW5ndGghPTQgfHwgbWF0cml4WzFdLmxlbmd0aCE9NCB8fCBtYXRyaXhbMl0ubGVuZ3RoIT00IHx8IG1hdHJpeFszXS5sZW5ndGghPTQpXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoNCAsNCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdHJhbnNwb3NlKHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHZhciBzd2FwOm51bWJlcjtcbiAgICAgICAgdGFyZ2V0Pz89bmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVsxXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVsyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVszXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHRoaXMuZGF0YVs1XTtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVs2XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVs3XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpbnZlcnNlKHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldCA/Pz0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB2YXIgYTAwPXRoaXMuZGF0YVswXTtcbiAgICAgICAgdmFyIGEwMT10aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDI9dGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMD10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTE9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGExMz10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjA9dGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxPXRoaXMuZGF0YVs5XTtcbiAgICAgICAgdmFyIGEyMj10aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzPXRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzA9dGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdmFyIGEzMT10aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyPXRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzM9dGhpcy5kYXRhWzE1XTtcbiAgICAgICAgdmFyIGRldGVybWluYW50PSAoYTAwKihhMTEqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIxKmEzMy1hMjMqYTMxKSthMTMqKGEyMSphMzItYTIyKmEzMSkpK1xuICAgICAgICAgICAgICAgICAgICAgICAgYTAxKi0oYTEwKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMyLWEyMiphMzApKStcbiAgICAgICAgICAgICAgICAgICAgICAgIGEwMiooYTEwKihhMjEqYTMzLWEyMyphMzEpK2ExMSotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMxLWEyMSphMzApKStcbiAgICAgICAgICAgICAgICAgICAgICAgIGEwMyotKGExMCooYTIxKmEzMi1hMjIqYTMxKSthMTEqLShhMjAqYTMyLWEyMiphMzApK2ExMiooYTIwKmEzMS1hMjEqYTMwKSkpOyAgIFxuICAgICAgICBpZiAoZGV0ZXJtaW5hbnQ9PTApIHJldHVybiBudWxsOyAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHRhcmdldC5kYXRhWzBdPSAoYTExKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMSphMzMtYTIzKmEzMSkrYTEzKihhMjEqYTMyLWEyMiphMzEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09IC0oYTAxKihhMjIqYTMzLWEyMyphMzIpK2EwMiotKGEyMSphMzMtYTIzKmEzMSkrYTAzKihhMjEqYTMyLWEyMiphMzEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09IChhMDEqKGExMiphMzMtYTEzKmEzMikrYTAyKi0oYTExKmEzMy1hMTMqYTMxKSthMDMqKGExMSphMzItYTEyKmEzMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVszXT0gLShhMDEqKGExMiphMjMtYTEzKmEyMikrYTAyKi0oYTExKmEyMy1hMTMqYTIxKSthMDMqKGExMSphMjItYTEyKmEyMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT0gLShhMTAqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzItYTIyKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT0gKGEwMCooYTIyKmEzMy1hMjMqYTMyKSthMDIqLShhMjAqYTMzLWEyMyphMzApK2EwMyooYTIwKmEzMi1hMjIqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPSAtKGEwMCooYTEyKmEzMy1hMTMqYTMyKSthMDIqLShhMTAqYTMzLWExMyphMzApK2EwMyooYTEwKmEzMi1hMTIqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPSAoYTAwKihhMTIqYTIzLWExMyphMjIpK2EwMiotKGExMCphMjMtYTEzKmEyMCkrYTAzKihhMTAqYTIyLWExMiphMjApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09IChhMTAqKGEyMSphMzMtYTIzKmEzMSkrYTExKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0gLShhMDAqKGEyMSphMzMtYTIzKmEzMSkrYTAxKi0oYTIwKmEzMy1hMjMqYTMwKSthMDMqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09IChhMDAqKGExMSphMzMtYTEzKmEzMSkrYTAxKi0oYTEwKmEzMy1hMTMqYTMwKSthMDMqKGExMCphMzEtYTExKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09IC0oYTAwKihhMTEqYTIzLWExMyphMjEpK2EwMSotKGExMCphMjMtYTEzKmEyMCkrYTAzKihhMTAqYTIxLWExMSphMjApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPSAtKGExMCooYTIxKmEzMi1hMjIqYTMxKSthMTEqLShhMjAqYTMyLWEyMiphMzApK2ExMiooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0gKGEwMCooYTIxKmEzMi1hMjIqYTMxKSthMDEqLShhMjAqYTMyLWEyMiphMzApK2EwMiooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0gLShhMDAqKGExMSphMzItYTEyKmEzMSkrYTAxKi0oYTEwKmEzMi1hMTIqYTMwKSthMDIqKGExMCphMzEtYTExKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09IChhMDAqKGExMSphMjItYTEyKmEyMSkrYTAxKi0oYTEwKmEyMi1hMTIqYTIwKSthMDIqKGExMCphMjEtYTExKmEyMCkpL2RldGVybWluYW50O1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICBcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKVxuICAgIHsgXG4gICAgICAgIHZhciBhMDA9dGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxPXRoaXMuZGF0YVsxXTtcbiAgICAgICAgdmFyIGEwMj10aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDM9dGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgdmFyIGEyMD10aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjE9dGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIHZhciBhMjM9dGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMD10aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxPXRoaXMuZGF0YVsxM107XG4gICAgICAgIHZhciBhMzI9dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMz10aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gKGEwMCooYTExKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMSphMzMtYTIzKmEzMSkrYTEzKihhMjEqYTMyLWEyMiphMzEpKStcbiAgICAgICAgICAgICAgICBhMDEqLShhMTAqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzItYTIyKmEzMCkpK1xuICAgICAgICAgICAgICAgIGEwMiooYTEwKihhMjEqYTMzLWEyMyphMzEpK2ExMSotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMxLWEyMSphMzApKStcbiAgICAgICAgICAgICAgICBhMDMqLShhMTAqKGEyMSphMzItYTIyKmEzMSkrYTExKi0oYTIwKmEzMi1hMjIqYTMwKSthMTIqKGEyMCphMzEtYTIxKmEzMCkpKTsgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBhc3NpZ24obWF0cml4Ok1hdHJpeDR4NClcbiAgICB7XG4gICAgICAgIHRoaXMuZGF0YVswXT0gbWF0cml4LmRhdGFbMF07XG4gICAgICAgIHRoaXMuZGF0YVsxXT0gbWF0cml4LmRhdGFbMV07XG4gICAgICAgIHRoaXMuZGF0YVsyXT0gbWF0cml4LmRhdGFbMl07XG4gICAgICAgIHRoaXMuZGF0YVszXT0gbWF0cml4LmRhdGFbM107XG4gICAgICAgIHRoaXMuZGF0YVs0XT0gbWF0cml4LmRhdGFbNF07XG4gICAgICAgIHRoaXMuZGF0YVs1XT0gbWF0cml4LmRhdGFbNV07XG4gICAgICAgIHRoaXMuZGF0YVs2XT0gbWF0cml4LmRhdGFbNl07XG4gICAgICAgIHRoaXMuZGF0YVs3XT0gbWF0cml4LmRhdGFbN107XG4gICAgICAgIHRoaXMuZGF0YVs4XT0gbWF0cml4LmRhdGFbOF07XG4gICAgICAgIHRoaXMuZGF0YVs5XT0gbWF0cml4LmRhdGFbOV07XG4gICAgICAgIHRoaXMuZGF0YVsxMF09IG1hdHJpeC5kYXRhWzEwXTtcbiAgICAgICAgdGhpcy5kYXRhWzExXT0gbWF0cml4LmRhdGFbMTFdO1xuICAgICAgICB0aGlzLmRhdGFbMTJdPSBtYXRyaXguZGF0YVsxMl07XG4gICAgICAgIHRoaXMuZGF0YVsxM109IG1hdHJpeC5kYXRhWzEzXTtcbiAgICAgICAgdGhpcy5kYXRhWzE0XT0gbWF0cml4LmRhdGFbMTRdO1xuICAgICAgICB0aGlzLmRhdGFbMTVdPSBtYXRyaXguZGF0YVsxNV07XG4gICAgfVxuXG4gICAgY2xvbmUoKTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBtLmRhdGFbMF09dGhpcy5kYXRhWzBdO1xuICAgICAgICBtLmRhdGFbMV09dGhpcy5kYXRhWzFdO1xuICAgICAgICBtLmRhdGFbMl09dGhpcy5kYXRhWzJdO1xuICAgICAgICBtLmRhdGFbM109dGhpcy5kYXRhWzNdO1xuICAgICAgICBtLmRhdGFbNF09dGhpcy5kYXRhWzRdO1xuICAgICAgICBtLmRhdGFbNV09dGhpcy5kYXRhWzVdO1xuICAgICAgICBtLmRhdGFbNl09dGhpcy5kYXRhWzZdO1xuICAgICAgICBtLmRhdGFbN109dGhpcy5kYXRhWzddO1xuICAgICAgICBtLmRhdGFbOF09dGhpcy5kYXRhWzhdO1xuICAgICAgICBtLmRhdGFbOV09dGhpcy5kYXRhWzldO1xuICAgICAgICBtLmRhdGFbMTBdPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIG0uZGF0YVsxMV09dGhpcy5kYXRhWzExXTtcbiAgICAgICAgbS5kYXRhWzEyXT10aGlzLmRhdGFbMTJdO1xuICAgICAgICBtLmRhdGFbMTNdPXRoaXMuZGF0YVsxM107XG4gICAgICAgIG0uZGF0YVsxNF09dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgbS5kYXRhWzE1XT10aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cblxuICAgIG11bHRpcGx5KHR1cGxlOiBUdXBsZSk6IFR1cGxlXG4gICAgbXVsdGlwbHkobWF0cml4OiBNYXRyaXg0eDQsdGFyZ2V0PzpNYXRyaXg0eDQpOiBNYXRyaXg0eDRcbiAgICBtdWx0aXBseShhOmFueSxiPzphbnkpOmFueVxuICAgIHtcbiAgICAgIGlmIChhIGluc3RhbmNlb2YgTWF0cml4NHg0KVxuICAgICAge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gIGIgPz8gIG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgaWYgKG1hdHJpeD09PXRoaXMpIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB2YXIgbWF0cml4PSBhIGFzIE1hdHJpeDR4NDtcbiAgICAgICAgdmFyIGEwMD10aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDE9dGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyPXRoaXMuZGF0YVsyXTtcbiAgICAgICAgdmFyIGEwMz10aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTA9dGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgdmFyIGExMj10aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTM9dGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMz10aGlzLmRhdGFbMTFdO1xuICAgICAgICB2YXIgYTMwPXRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzE9dGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMj10aGlzLmRhdGFbMTRdO1xuICAgICAgICB2YXIgYTMzPXRoaXMuZGF0YVsxNV07XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09bWF0cml4LmRhdGFbMF0qIGEwMCttYXRyaXguZGF0YVs0XSogYTAxK21hdHJpeC5kYXRhWzhdKiBhMDIrbWF0cml4LmRhdGFbMTJdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdPW1hdHJpeC5kYXRhWzFdKiBhMDArbWF0cml4LmRhdGFbNV0qIGEwMSttYXRyaXguZGF0YVs5XSogYTAyK21hdHJpeC5kYXRhWzEzXSogYTAzO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXT1tYXRyaXguZGF0YVsyXSogYTAwK21hdHJpeC5kYXRhWzZdKiBhMDErbWF0cml4LmRhdGFbMTBdKiBhMDIrbWF0cml4LmRhdGFbMTRdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdPW1hdHJpeC5kYXRhWzNdKiBhMDArbWF0cml4LmRhdGFbN10qIGEwMSttYXRyaXguZGF0YVsxMV0qIGEwMittYXRyaXguZGF0YVsxNV0qIGEwMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09bWF0cml4LmRhdGFbMF0qIGExMCttYXRyaXguZGF0YVs0XSogYTExK21hdHJpeC5kYXRhWzhdKiBhMTIrbWF0cml4LmRhdGFbMTJdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPW1hdHJpeC5kYXRhWzFdKiBhMTArbWF0cml4LmRhdGFbNV0qIGExMSttYXRyaXguZGF0YVs5XSogYTEyK21hdHJpeC5kYXRhWzEzXSogYTEzO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT1tYXRyaXguZGF0YVsyXSogYTEwK21hdHJpeC5kYXRhWzZdKiBhMTErbWF0cml4LmRhdGFbMTBdKiBhMTIrbWF0cml4LmRhdGFbMTRdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPW1hdHJpeC5kYXRhWzNdKiBhMTArbWF0cml4LmRhdGFbN10qIGExMSttYXRyaXguZGF0YVsxMV0qIGExMittYXRyaXguZGF0YVsxNV0qIGExMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09bWF0cml4LmRhdGFbMF0qIGEyMCttYXRyaXguZGF0YVs0XSogYTIxK21hdHJpeC5kYXRhWzhdKiBhMjIrbWF0cml4LmRhdGFbMTJdKiBhMjM7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPW1hdHJpeC5kYXRhWzFdKiBhMjArbWF0cml4LmRhdGFbNV0qIGEyMSttYXRyaXguZGF0YVs5XSogYTIyK21hdHJpeC5kYXRhWzEzXSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09bWF0cml4LmRhdGFbMl0qIGEyMCttYXRyaXguZGF0YVs2XSogYTIxK21hdHJpeC5kYXRhWzEwXSogYTIyK21hdHJpeC5kYXRhWzE0XSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09bWF0cml4LmRhdGFbM10qIGEyMCttYXRyaXguZGF0YVs3XSogYTIxK21hdHJpeC5kYXRhWzExXSogYTIyK21hdHJpeC5kYXRhWzE1XSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09bWF0cml4LmRhdGFbMF0qIGEzMCttYXRyaXguZGF0YVs0XSogYTMxK21hdHJpeC5kYXRhWzhdKiBhMzIrbWF0cml4LmRhdGFbMTJdKiBhMzM7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT1tYXRyaXguZGF0YVsxXSogYTMwK21hdHJpeC5kYXRhWzVdKiBhMzErbWF0cml4LmRhdGFbOV0qIGEzMittYXRyaXguZGF0YVsxM10qIGEzMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPW1hdHJpeC5kYXRhWzJdKiBhMzArbWF0cml4LmRhdGFbNl0qIGEzMSttYXRyaXguZGF0YVsxMF0qIGEzMittYXRyaXguZGF0YVsxNF0qIGEzMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPW1hdHJpeC5kYXRhWzNdKiBhMzArbWF0cml4LmRhdGFbN10qIGEzMSttYXRyaXguZGF0YVsxMV0qIGEzMittYXRyaXguZGF0YVsxNV0qIGEzMztcbiAgICAgICAgXG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH0gZWxzZSBpZiAoYSBpbnN0YW5jZW9mIFR1cGxlKVxuICAgICAge1xuICAgICAgICB2YXIgdD0gYSBhcyBUdXBsZTtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSggXG4gICAgICAgICB0aGlzLmRhdGFbMF0qdC54ICsgdGhpcy5kYXRhWzFdKnQueSt0aGlzLmRhdGFbMl0qdC56K3RoaXMuZGF0YVszXSp0LncsXG4gICAgICAgICB0aGlzLmRhdGFbNF0qdC54ICsgdGhpcy5kYXRhWzVdKnQueSt0aGlzLmRhdGFbNl0qdC56K3RoaXMuZGF0YVs3XSp0LncsIFxuICAgICAgICAgdGhpcy5kYXRhWzhdKnQueCArIHRoaXMuZGF0YVs5XSp0LnkrdGhpcy5kYXRhWzEwXSp0LnordGhpcy5kYXRhWzExXSp0LncsXG4gICAgICAgICB0aGlzLmRhdGFbMTJdKnQueCArIHRoaXMuZGF0YVsxM10qdC55K3RoaXMuZGF0YVsxNF0qdC56K3RoaXMuZGF0YVsxNV0qdC53XG4gICAgICAgICAgICk7XG4gICAgICB9IGVsc2VcbiAgICAgIHtcbiAgICAgICAgICAvL2EgaW5zdGFuY2VvZiBNYXRyaXggKG5vdCBzdXBwb3J0ZWQpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgyeDIgZXh0ZW5kcyBNYXRyaXhcbnsgICBcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeD86IEFycmF5PEFycmF5PG51bWJlcj4+KSBcbiAgICB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcbiAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoIT0yIHx8IG1hdHJpeFswXS5sZW5ndGghPTIgfHwgbWF0cml4WzFdLmxlbmd0aCE9MiApXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoMiAsMik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKTpudW1iZXJcbiAgICB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVszXS10aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeDN4MyBleHRlbmRzIE1hdHJpeFxueyAgIFxuXG4gICAgY29uc3RydWN0b3IobWF0cml4PzogQXJyYXk8QXJyYXk8bnVtYmVyPj4pIFxuICAgIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFxuICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGghPTMgfHwgbWF0cml4WzBdLmxlbmd0aCE9MyB8fCBtYXRyaXhbMV0ubGVuZ3RoIT0zIHx8IG1hdHJpeFsyXS5sZW5ndGghPTMpXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoMyAsMyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgIFxuICAgIGRldGVybWluYW50KCk6bnVtYmVyXG4gICAge1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzhdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICh0aGlzLmRhdGFbMF0qKGExMSphMjItYTEyKmEyMSkrdGhpcy5kYXRhWzFdKi0oYTEwKmEyMi1hMTIqYTIwKSt0aGlzLmRhdGFbMl0qKGExMCphMjEtYTExKmEyMCkpO1xuICAgIH1cblxufSIsImltcG9ydCB7VHVwbGV9IGZyb20gXCIuL3R1cGxlXCJcbmltcG9ydCB7Q29sb3J9IGZyb20gXCIuL2NvbG9yXCJcbmV4cG9ydCBjbGFzcyBQb2ludExpZ2h0XG57XG4gICAgcHVibGljIHBvc2l0b246VHVwbGU7XG4gICAgcHVibGljIGludGVuc2l0eTpDb2xvcjtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbj86VHVwbGUsaW50ZW5zaXR5PzpDb2xvcilcbiAgICB7XG4gICAgICB0aGlzLnBvc2l0b249cG9zaXRpb24/PyBUdXBsZS5wb2ludCgwLDAsMCk7XG4gICAgICB0aGlzLmludGVuc2l0eT1pbnRlbnNpdHk/PyBuZXcgQ29sb3IoMSwxLDEpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNYXRyaXg0eDQgfSBmcm9tIFwiLi9tYXRyaXhcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcblxuZXhwb3J0IGNsYXNzIFJheVxue1xuICAgIG9yaWdpbjogVHVwbGU7XG4gICAgZGlyZWN0aW9uOlR1cGxlO1xuICAgIGNvbnN0cnVjdG9yKG9yaWdpbjpUdXBsZSxkaXJlY3Rpb246VHVwbGUpXG4gICAge1xuICAgICAgdGhpcy5vcmlnaW49b3JpZ2luO1xuICAgICAgdGhpcy5kaXJlY3Rpb249ZGlyZWN0aW9uO1xuICAgIH1cbiAgICBwb3NpdGlvbih0Om51bWJlcik6VHVwbGVcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5hZGQodGhpcy5kaXJlY3Rpb24ubXVsdGlwbHkodCkpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShtYXRyaXg6TWF0cml4NHg0KTpSYXlcbiAgICB7XG4gICAgIHZhciBkaXJlY3Rpb249IG1hdHJpeC5tdWx0aXBseSh0aGlzLmRpcmVjdGlvbik7XG4gICAgIHZhciBvcmlnaW49IG1hdHJpeC5tdWx0aXBseSh0aGlzLm9yaWdpbik7XG4gICAgIFxuICAgICB2YXIgcmF5PW5ldyBSYXkob3JpZ2luLGRpcmVjdGlvbik7XG4gICAgIHJldHVybiByYXk7XG4gICAgfVxufSIsIi8qKlxuICogTWVyZ2VzIDIgc29ydGVkIHJlZ2lvbnMgaW4gYW4gYXJyYXkgaW50byAxIHNvcnRlZCByZWdpb24gKGluLXBsYWNlIHdpdGhvdXQgZXh0cmEgbWVtb3J5LCBzdGFibGUpIFxuICogQHBhcmFtIGl0ZW1zIGFycmF5IHRvIG1lcmdlXG4gKiBAcGFyYW0gbGVmdCBsZWZ0IGFycmF5IGJvdW5kYXJ5IGluY2x1c2l2ZVxuICogQHBhcmFtIG1pZGRsZSBib3VuZGFyeSBiZXR3ZWVuIHJlZ2lvbnMgKGxlZnQgcmVnaW9uIGV4Y2x1c2l2ZSwgcmlnaHQgcmVnaW9uIGluY2x1c2l2ZSlcbiAqIEBwYXJhbSByaWdodCByaWdodCBhcnJheSBib3VuZGFyeSBleGNsdXNpdmVcbiAqL1xuIGZ1bmN0aW9uIG1lcmdlSW5wbGFjZTxUPihpdGVtczogVFtdLCBjb21wYXJlRm46IChhOiBULGI6IFQgKT0+IG51bWJlcixsZWZ0Om51bWJlcixtaWRkbGU6bnVtYmVyLCByaWdodDpudW1iZXIpIHtcbiAgICBpZiAocmlnaHQ9PW1pZGRsZSkgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSBsZWZ0OyBpIDwgbWlkZGxlO2krKykge1xuICAgICAgICAgXG4gICAgICAgIHZhciBtaW5SaWdodD1pdGVtc1ttaWRkbGVdO1xuICAgICAgICBpZihjb21wYXJlRm4obWluUmlnaHQsIGl0ZW1zW2ldKSA8MClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHRtcD1pdGVtc1tpXTtcbiAgICAgICAgICAgIGl0ZW1zW2ldID1taW5SaWdodDtcbiAgICAgICAgICAgIHZhciBuZXh0SXRlbTpUO1xuICAgICAgICAgICAgdmFyIG5leHQ9bWlkZGxlKzE7XG4gICAgICAgICAgICB3aGlsZShuZXh0PHJpZ2h0JiYgY29tcGFyZUZuKChuZXh0SXRlbT1pdGVtc1tuZXh0XSksdG1wKTwwKVxuICAgICAgICAgICAgeyAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGl0ZW1zW25leHQtMV09bmV4dEl0ZW07XG4gICAgICAgICAgICAgIG5leHQrKztcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBpdGVtc1tuZXh0LTFdPXRtcDsgICAgICAgICAgICAgICAgXG4gICAgICAgIH0gICAgXG4gICAgfVxufVxuXG4vKipcbiAqIEluLXBsYWNlIGJvdHRvbSB1cCBtZXJnZSBzb3J0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNvcnRJbnBsYWNlPFQ+KGl0ZW1zOiBUW10sIGNvbXBhcmVGbjogKGE6IFQsYjogVCApPT4gbnVtYmVyLGZyb20/Om51bWJlcix0bz86bnVtYmVyKSB7XG4gICAgZnJvbT8/PTA7XG4gICAgdG8/Pz1pdGVtcy5sZW5ndGg7XG4gICAgdmFyIG1heFN0ZXAgPSAodG8tZnJvbSkgKiAyOyAgIFxuICAgIGZvciAodmFyIHN0ZXAgPSAyOyBzdGVwIDwgbWF4U3RlcDtzdGVwKj0yKSB7XG4gICAgICAgIHZhciBvbGRTdGVwPXN0ZXAvMjtcbiAgICAgICAgZm9yICh2YXIgeCA9IGZyb207IHggPCB0bzsgeCArPSBzdGVwKSB7XG4gICAgICAgIFxuICAgICAgICAgbWVyZ2VJbnBsYWNlKGl0ZW1zLGNvbXBhcmVGbix4LCB4K29sZFN0ZXAsTWF0aC5taW4oeCtzdGVwLHRvKSApO1xuICAgICAgICB9ICAgICAgIFxuICAgIH1cblxuXG59XG5cbiIsImltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiXG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5pbXBvcnQgeyBJbnRlcnNlY3Rpb24sIEludGVyc2VjdGlvbnMgfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tIFwiLi9tYXRlcmlhbFwiO1xuaW1wb3J0IHsgSVdvcmxkT2JqZWN0IH0gZnJvbSBcIi4vd29ybGRcIjtcbmV4cG9ydCBjbGFzcyBTcGhlcmUgaW1wbGVtZW50cyBJV29ybGRPYmplY3Qge1xuXG4gIGlkOiBudW1iZXI7XG4gIHByaXZhdGUgaW52ZXJzZVRyYW5zZm9ybTogTWF0cml4NHg0O1xuICBwcml2YXRlIF90cmFuc2Zvcm06IE1hdHJpeDR4NDtcbiAgLyoqXG4gICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2Zvcm0oKTogTWF0cml4NHg0IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICB9XG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKHZhbHVlOiBNYXRyaXg0eDQpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm09dmFsdWUuaW52ZXJzZSgpO1xuICB9XG5cbiAgbWF0ZXJpYWw6IE1hdGVyaWFsO1xuICBwcml2YXRlIHN0YXRpYyB0ZW1wTWF0cml4MSA9IG5ldyBNYXRyaXg0eDQoKTtcblxuXG4gIGNvbnN0cnVjdG9yKGlkOiBudW1iZXIsIHRyYW5zZm9ybT86IE1hdHJpeDR4NCwgbWF0ZXJpYWw/OiBNYXRlcmlhbCkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSA/PyBNYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsID8/IG5ldyBNYXRlcmlhbCgpO1xuICB9XG4gIFxuICBpbnRlcnNlY3QocmF5OiBSYXksIGludGVyc2VjdGlvbnM/OiBJbnRlcnNlY3Rpb25zKTogSW50ZXJzZWN0aW9ucyB7XG4gICAgcmF5ID0gcmF5LnRyYW5zZm9ybSh0aGlzLmludmVyc2VUcmFuc2Zvcm0pO1xuICAgIGludGVyc2VjdGlvbnMgPz89IG5ldyBJbnRlcnNlY3Rpb25zKCk7XG4gICAgdmFyIHNwaGVyZTJyYXkgPSByYXkub3JpZ2luLnN1YnN0cmFjdChUdXBsZS5wb2ludCgwLCAwLCAwKSk7XG4gICAgdmFyIGEgPSByYXkuZGlyZWN0aW9uLmRvdChyYXkuZGlyZWN0aW9uKTtcbiAgICB2YXIgYiA9IDIgKiByYXkuZGlyZWN0aW9uLmRvdChzcGhlcmUycmF5KTtcbiAgICB2YXIgYyA9IHNwaGVyZTJyYXkuZG90KHNwaGVyZTJyYXkpIC0gMTtcbiAgICB2YXIgZGlzY3JpbWluYW50ID0gYiAqIGIgLSA0ICogYSAqIGM7XG4gICAgaWYgKGRpc2NyaW1pbmFudCA8IDApIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIHZhciBzcXJ0RGlzY3JpbWluYW50ID0gTWF0aC5zcXJ0KGRpc2NyaW1pbmFudCk7XG4gICAgdmFyIGkxID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICBpMS50ID0gKC1iIC0gc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgIGkxLm9iamVjdCA9IHRoaXM7XG4gICAgdmFyIGkyID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICBpMi50ID0gKC1iICsgc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgIGkyLm9iamVjdCA9IHRoaXM7XG5cbiAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgfVxuXG4gIG5vcm1hbEF0KHA6IFR1cGxlKTogVHVwbGUgeyAgIFxuICAgIHZhciBvYmplY3ROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkocCk7XG4gICAgb2JqZWN0Tm9ybWFsLncgPSAwO1xuICAgIHZhciB3b3JsZE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS50cmFuc3Bvc2UoU3BoZXJlLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgfVxufSIsImV4cG9ydCBjbGFzcyBUdXBsZSB7XG4gICAgcHVibGljIHg6IG51bWJlcjtcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xuICAgIHB1YmxpYyB6OiBudW1iZXI7XG4gICAgcHVibGljIHc6IG51bWJlcjtcblxuICAgIHByaXZhdGUgc3RhdGljIEVQU0lMT046IG51bWJlciA9IDAuMDAwMDE7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKVxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcilcbiAgICBjb25zdHJ1Y3Rvcih4PzogbnVtYmVyLCB5PzogbnVtYmVyLCB6PzogbnVtYmVyLCB3PzogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgIHRoaXMudyA9IHc7XG4gICAgfVxuICAgIHB1YmxpYyBpc1BvaW50KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDE7XG4gICAgfVxuICAgIHB1YmxpYyBpc1ZlY3RvcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudyA9PSAwO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQodHVwbGU6IFR1cGxlKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCArIHR1cGxlLngsIHRoaXMueSArIHR1cGxlLnksIHRoaXMueiArIHR1cGxlLnosIHRoaXMudyArIHR1cGxlLncpXG4gICAgfVxuICAgIHB1YmxpYyBtdWx0aXBseShzY2FsYXI6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyLCB0aGlzLncgKiBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBkaXZpZGUoc2NhbGFyOiBudW1iZXIpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54IC8gc2NhbGFyLCB0aGlzLnkgLyBzY2FsYXIsIHRoaXMueiAvIHNjYWxhciwgdGhpcy53IC8gc2NhbGFyKVxuICAgIH1cbiAgICBwdWJsaWMgc3Vic3RyYWN0KHR1cGxlOiBUdXBsZSk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLSB0dXBsZS54LCB0aGlzLnkgLSB0dXBsZS55LCB0aGlzLnogLSB0dXBsZS56LCB0aGlzLncgLSB0dXBsZS53KVxuICAgIH1cbiAgICBwdWJsaWMgbmVnYXRlKCk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSgtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56LCAtdGhpcy53KVxuICAgIH1cbiAgICBwdWJsaWMgbm9ybWFsaXplKCk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGl2aWRlKHRoaXMubWFnbml0dWRlKCkpO1xuICAgIH1cbiAgICBwdWJsaWMgbWFnbml0dWRlKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudyk7XG4gICAgfVxuICAgIHB1YmxpYyBkb3QodHVwbGU6IFR1cGxlKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCAqIHR1cGxlLnggKyB0aGlzLnkgKiB0dXBsZS55ICsgdGhpcy56ICogdHVwbGUueiArIHRoaXMudyAqIHR1cGxlLnc7XG4gICAgfVxuICAgIHB1YmxpYyBjcm9zcyh0dXBsZTogVHVwbGUpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBUdXBsZS52ZWN0b3IodGhpcy55ICogdHVwbGUueiAtIHRoaXMueiAqIHR1cGxlLnksXG4gICAgICAgICAgICB0aGlzLnogKiB0dXBsZS54IC0gdGhpcy54ICogdHVwbGUueixcbiAgICAgICAgICAgIHRoaXMueCAqIHR1cGxlLnkgLSB0aGlzLnkgKiB0dXBsZS54XG4gICAgICAgICk7XG4gICAgfVxuICAgIFxuICAgIHJlZmxlY3Qobm9ybWFsOlR1cGxlICk6VHVwbGVcbiAgICB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzdHJhY3Qobm9ybWFsLm11bHRpcGx5KDIqdGhpcy5kb3Qobm9ybWFsKSkpO1xuICAgIH1cbiAgICBwdWJsaWMgZXF1YWxzKHR1cGxlOiBUdXBsZSkge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy54IC0gdHVwbGUueCkgPCBUdXBsZS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLnkgLSB0dXBsZS55KSA8IFR1cGxlLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueiAtIHR1cGxlLnopIDwgVHVwbGUuRVBTSUxPTjtcbiAgICB9XG4gICAgc3RhdGljIHBvaW50KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoeCwgeSwgeiwgMSk7XG4gICAgfVxuICAgIHN0YXRpYyB2ZWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAwKTtcbiAgICB9XG4gICAgY2xvbmUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XG4gICAgfVxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBDYW52YXMgfSBmcm9tIFwicmF5dHJhY2VyL2NhbnZhc1wiO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwicmF5dHJhY2VyL2NvbG9yXCI7XG5pbXBvcnQgeyBJbnRlcnNlY3Rpb24sIEludGVyc2VjdGlvbnMgfSBmcm9tIFwicmF5dHJhY2VyL2ludGVyc2VjdGlvblwiO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tIFwicmF5dHJhY2VyL21hdGVyaWFsXCI7XG5pbXBvcnQgeyBQb2ludExpZ2h0IH0gZnJvbSBcInJheXRyYWNlci9wb2ludExpZ2h0XCI7XG5pbXBvcnQgeyBSYXkgfSBmcm9tIFwicmF5dHJhY2VyL3JheVwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcInJheXRyYWNlci9zcGhlcmVcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcInJheXRyYWNlci90dXBsZVwiO1xuXG5cbmZ1bmN0aW9uIGNoYXB0ZXI2UmVuZGVyKCk6Q2FudmFzXG57XG4gICAgdmFyIGMgPSBuZXcgQ2FudmFzKDEwMjQsMTAyNCk7XG4gICAgdmFyIHJheU9yaWdpbiA9IFR1cGxlLnBvaW50KDAsMCwtNSk7XG4gICAgdmFyIHdhbGx6PTEwO1xuICAgIHZhciB3YWxsU2l6ZT03O1xuICAgIHZhciBwaXhlbFNpemU9d2FsbFNpemUvIGMuaGVpZ2h0O1xuICAgIHZhciBoYWxmPXdhbGxTaXplLzI7XG4gICAgdmFyIHNoYXBlPW5ldyBTcGhlcmUoMSlcbiAgICBzaGFwZS5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKCk7XG4gICAgc2hhcGUubWF0ZXJpYWwuY29sb3I9bmV3IENvbG9yKDEsMC4yLDEpO1xuICAgIHZhciBsaWdodCA9IG5ldyBQb2ludExpZ2h0KFR1cGxlLnBvaW50KC0xMCwxMCwtMTApLENvbG9yLldISVRFLmNsb25lKCkpO1xuICAgIHZhciB4cz0gbmV3IEludGVyc2VjdGlvbnMoMTApO1xuICAgIGZvciAodmFyIHk9MDt5PGMuaGVpZ2h0O3krKylcbiAgICB7XG4gICAgICAgIHZhciB3b3JsZFk9aGFsZi1waXhlbFNpemUqeTtcbiAgICAgICAgZm9yICh2YXIgeD0wO3g8Yy53aWR0aDt4KyspXG4gICAgICAgIHtcbiAgICAgICAgXG4gICAgICAgICAgICB2YXIgd29ybGRYPS1oYWxmK3BpeGVsU2l6ZSp4O1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gVHVwbGUucG9pbnQod29ybGRYLHdvcmxkWSx3YWxseik7XG4gICAgICAgICAgICB2YXIgcj0gbmV3IFJheShyYXlPcmlnaW4sIHBvc2l0aW9uLnN1YnN0cmFjdChyYXlPcmlnaW4pLm5vcm1hbGl6ZSgpICk7XG4gICAgICAgICAgICBzaGFwZS5pbnRlcnNlY3Qocix4cyk7XG4gICAgICAgICAgICBpZiAoeHMubGVuZ3RoPjApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGhpdD0geHMuaGl0KCk7XG4gICAgICAgICAgICAgICAgdmFyIHBvaW50PXIucG9zaXRpb24oaGl0LnQpO1xuICAgICAgICAgICAgICAgIHZhciBub3JtYWw9c2hhcGUubm9ybWFsQXQocG9pbnQpXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yPXNoYXBlLm1hdGVyaWFsLmxpZ2h0aW5nKGxpZ2h0LHBvaW50LCByLmRpcmVjdGlvbi5uZWdhdGUoKSAsbm9ybWFsKTtcbiAgICAgICAgICAgICAgICBjLndyaXRlUGl4ZWwoeCx5LGNvbG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhzLmNsZWFyKCk7XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYztcbn1cblxudmFyIGNhbnZhcyA9IGNoYXB0ZXI2UmVuZGVyKCk7XG52YXIgcmF5dHJhY2VyQ2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF5dHJhY2VyQ2FudmFzXCIpO1xucmF5dHJhY2VyQ2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoO1xucmF5dHJhY2VyQ2FudmFzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG52YXIgcmVuZGVyRGF0YSA9IGNhbnZhcy50b1VpbnQ4Q2xhbXBlZEFycmF5KCk7XG52YXIgaW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShyZW5kZXJEYXRhLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xudmFyIGN0eCA9IHJheXRyYWNlckNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==