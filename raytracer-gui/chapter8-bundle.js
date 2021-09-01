/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../raytracer/src/camera.ts":
/*!**********************************!*\
  !*** ../raytracer/src/camera.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Camera = void 0;
const canvas_1 = __webpack_require__(/*! ./canvas */ "../raytracer/src/canvas.ts");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/src/matrix.ts");
const ray_1 = __webpack_require__(/*! ./ray */ "../raytracer/src/ray.ts");
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
class Camera {
    constructor(hsize, vsize, fieldOfView, transform) {
        this.hsize = hsize;
        this.vsize = vsize;
        this.fieldOfView = fieldOfView;
        this.transform = transform !== null && transform !== void 0 ? transform : matrix_1.Matrix4x4.IDENTITY_MATRIX.clone();
        this.update();
    }
    get halfWidth() {
        return this._halfWidth;
    }
    get halfheight() {
        return this._halfWidth;
    }
    get pixelSize() {
        return this._pixelSize;
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
    /**
     * recalculate derived values
     */
    update() {
        var halfView = Math.tan(this.fieldOfView / 2);
        var aspect = this.hsize / this.vsize;
        if (aspect >= 1) {
            this._halfWidth = halfView;
            this._halfHeight = halfView / aspect;
        }
        else {
            this._halfWidth = halfView * aspect;
            this._halfHeight = halfView;
        }
        this._pixelSize = (this._halfWidth * 2) / this.hsize;
    }
    rayForPixel(x, y) {
        var xOffset = (x + 0.5) * this._pixelSize;
        var yOffset = (y + 0.5) * this._pixelSize;
        var worldX = this._halfWidth - xOffset;
        var worldY = this._halfHeight - yOffset;
        var pixel = this.inverseTransform.multiply(tuple_1.Tuple.point(worldX, worldY, -1));
        var origin = this.inverseTransform.multiply(tuple_1.Tuple.point(0, 0, 0));
        var direction = pixel.substract(origin).normalize();
        return new ray_1.Ray(origin, direction);
    }
    render(world) {
        var image = new canvas_1.Canvas(this.hsize, this.vsize);
        for (var y = 0; y < this.vsize; y++) {
            for (var x = 0; x < this.hsize; x++) {
                var ray = this.rayForPixel(x, y);
                var color = world.colorAt(ray);
                image.writePixel(x, y, color);
            }
        }
        return image;
    }
}
exports.Camera = Camera;


/***/ }),

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

/***/ "../raytracer/src/computations.ts":
/*!****************************************!*\
  !*** ../raytracer/src/computations.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Computations = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
class Computations {
    constructor() {
    }
    static prepare(intersection, ray) {
        var comps = new Computations();
        comps.t = intersection.t;
        comps.object = intersection.object;
        comps.point = ray.position(comps.t);
        comps.eyev = ray.direction.negate();
        comps.normalv = comps.object.normalAt(comps.point);
        if (comps.normalv.dot(comps.eyev) < 0) {
            comps.inside = true;
            comps.normalv = comps.normalv.negate();
        }
        else {
            comps.inside = false;
        }
        comps.overPoint = comps.point.add(comps.normalv.multiply(tuple_1.Tuple.EPSILON));
        return comps;
    }
}
exports.Computations = Computations;


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
    lighting(light, point, eyev, normalv, inShadow = false) {
        var effectiveColor = this.color.hadamardProduct(light.intensity);
        var ambient = effectiveColor.multiply(this.ambient);
        if (inShadow)
            return ambient;
        var lightv = light.positon.substract(point).normalize();
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
    static viewTransform(from, to, up, target = new Matrix4x4()) {
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
    static translation(x, y, z, target = new Matrix4x4()) {
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
    static rotationX(radians, target = new Matrix4x4()) {
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
    static rotationY(radians, target = new Matrix4x4()) {
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
    static rotationZ(radians, target = new Matrix4x4()) {
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
    static scaling(x, y, z, target = new Matrix4x4()) {
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
    static shearing(xy, xz, yx, yz, zx, zy, target = new Matrix4x4()) {
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
    transpose(target = new Matrix4x4()) {
        var swap;
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
    inverse(target = new Matrix4x4()) {
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
    intersect(ray, intersections = new intersection_1.Intersections()) {
        ray = ray.transform(this.inverseTransform);
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


/***/ }),

/***/ "../raytracer/src/world.ts":
/*!*********************************!*\
  !*** ../raytracer/src/world.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.World = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/src/color.ts");
const computations_1 = __webpack_require__(/*! ./computations */ "../raytracer/src/computations.ts");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/src/intersection.ts");
const ray_1 = __webpack_require__(/*! ./ray */ "../raytracer/src/ray.ts");
class World {
    constructor() {
    }
    shadeHit(comps) {
        return comps.object.material.lighting(this.light, comps.point, comps.eyev, comps.normalv, this.isShadowed(comps.overPoint));
    }
    colorAt(ray) {
        World.tempIntersections.clear();
        this.intersect(ray, World.tempIntersections);
        var i = World.tempIntersections.hit();
        if (i == null)
            return color_1.Color.BLACK.clone();
        var comp = computations_1.Computations.prepare(i, ray);
        return this.shadeHit(comp);
    }
    intersect(ray, intersections = new intersection_1.Intersections()) {
        for (var o of this.objects) {
            o.intersect(ray, intersections);
        }
        return intersections;
    }
    isShadowed(point) {
        var v = this.light.positon.substract(point);
        var distance = v.magnitude();
        var direction = v.normalize();
        var r = new ray_1.Ray(point, direction);
        World.tempIntersections.clear();
        this.intersect(r, World.tempIntersections);
        var h = World.tempIntersections.hit();
        return (h != null && h.t < distance);
    }
}
exports.World = World;
World.tempIntersections = new intersection_1.Intersections(100);


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
  !*** ./src/chapter8.ts ***!
  \*************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const color_1 = __webpack_require__(/*! raytracer/color */ "../raytracer/src/color.ts");
const material_1 = __webpack_require__(/*! raytracer/material */ "../raytracer/src/material.ts");
const matrix_1 = __webpack_require__(/*! raytracer/matrix */ "../raytracer/src/matrix.ts");
const pointLight_1 = __webpack_require__(/*! raytracer/pointLight */ "../raytracer/src/pointLight.ts");
const world_1 = __webpack_require__(/*! raytracer/world */ "../raytracer/src/world.ts");
const sphere_1 = __webpack_require__(/*! raytracer/sphere */ "../raytracer/src/sphere.ts");
const tuple_1 = __webpack_require__(/*! raytracer/tuple */ "../raytracer/src/tuple.ts");
const camera_1 = __webpack_require__(/*! raytracer/camera */ "../raytracer/src/camera.ts");
var world = new world_1.World();
var floor = new sphere_1.Sphere(0);
floor.transform = matrix_1.Matrix4x4.scaling(10, 0.01, 10);
floor.material = new material_1.Material();
floor.material.color = new color_1.Color(1, 0.9, 0.9);
floor.material.specular = 0;
var leftWall = new sphere_1.Sphere(1);
leftWall.transform = matrix_1.Matrix4x4.translation(0, 0, 5)
    .multiply(matrix_1.Matrix4x4.rotationY(-Math.PI / 4))
    .multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2))
    .multiply(matrix_1.Matrix4x4.scaling(10, 0.01, 10));
leftWall.material = floor.material;
var rightWall = new sphere_1.Sphere(2);
rightWall.transform = matrix_1.Matrix4x4.translation(0, 0, 5)
    .multiply(matrix_1.Matrix4x4.rotationY(Math.PI / 4))
    .multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2))
    .multiply(matrix_1.Matrix4x4.scaling(10, 0.01, 10));
rightWall.material = floor.material;
var middle = new sphere_1.Sphere(3);
middle.transform = matrix_1.Matrix4x4.translation(-0.5, 1, 0.5);
middle.material = new material_1.Material();
middle.material.color = new color_1.Color(0.1, 1, 0.5);
middle.material.diffuse = 0.7;
middle.material.specular = 0.3;
var right = new sphere_1.Sphere(4);
right.transform = matrix_1.Matrix4x4.translation(1.5, 0.5, -0.5).multiply(matrix_1.Matrix4x4.scaling(0.5, 0.5, 0.5));
right.material = new material_1.Material();
right.material.color = new color_1.Color(0.5, 1, 0.1);
right.material.diffuse = 0.7;
right.material.specular = 0.3;
var left = new sphere_1.Sphere(5);
left.transform = matrix_1.Matrix4x4.translation(-1.5, 0.33, -0.75).multiply(matrix_1.Matrix4x4.scaling(0.33, 0.33, 0.33));
left.material = new material_1.Material();
left.material.color = new color_1.Color(1, 0.8, 0.1);
left.material.diffuse = 0.7;
left.material.specular = 0.3;
world.objects = [left, right, middle, rightWall, leftWall, floor];
world.light = new pointLight_1.PointLight(tuple_1.Tuple.point(-10, 10, -10), color_1.Color.WHITE.clone());
var camera = new camera_1.Camera(1024, 1024, Math.PI / 3, matrix_1.Matrix4x4.viewTransform(tuple_1.Tuple.point(0, 1.5, -5), tuple_1.Tuple.point(0, 1, 0), tuple_1.Tuple.vector(0, 1, 0)));
var raytracerCanvas = document.getElementById("raytracerCanvas");
raytracerCanvas.width = camera.hsize;
raytracerCanvas.height = camera.vsize;
var renderData = camera.render(world).toUint8ClampedArray();
var imageData = new ImageData(renderData, camera.hsize, camera.vsize);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksQ0FBQyxVQUFVLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2pDLENBQUM7SUFDRCxLQUFLO1FBRUosSUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDO1FBQ2YsR0FBRyxJQUFFLElBQUksQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDO1FBQ3JDLEdBQUcsSUFBRSxLQUFLLENBQUM7UUFDWCxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFDcEM7WUFDSSxHQUFHLElBQUUsQ0FBQyxDQUFDLEdBQUMsRUFBRSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsQ0FBQyxJQUFHLENBQUM7WUFDNUIsR0FBRyxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUNqRSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUN4RSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUks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QUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFHTSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsQ0FBUSxFQUFDLFNBQWtCLElBQUksU0FBUyxFQUFFO1FBRWxGLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJ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LEdBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBYyxFQUFDLFNBQWtCLElBQUksU0FBUyxFQUFFO1FBRXBFLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxHQUFHLEdBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsQ0FBUSxFQUFDLFNBQWtCLElBQUksU0FBUyxFQUFFO1FBRTlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsRUFBUyxFQUFDLFNBQWtCLElBQUksU0FBUyxFQUFFO1FBRWhILE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxD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QUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxXQUFXLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFFLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RSxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxXQUFXLElBQUUsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ25HLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbkcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNuRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxPQUFPLE1BQU0sQ0FBQztJQUVsQixDQUFDO0lBQ0QsV0FBVztRQUVQLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQWdCO1FBRW5CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSztRQUVELElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUtELFFBQVEsQ0FBQyxDQUFLLEVBQUMsQ0FBTTtRQUVuQixJQUFJLENBQUMsWUFBWSxTQUFTLEVBQzFCO1lBQ0UsSUFBSSxNQUFNLEdBQUksQ0FBQyxhQUFELENBQUMsY0FBRCxDQUFDLEdBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE1BQU0sS0FBRyxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNyQyxJQUFJLE1BQU0sR0FBRSxDQUFjLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV0QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBR2xHLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7YUFBTSxJQUFJLENBQUMsWUFBWSxhQUFLLEVBQzdCO1lBQ0UsSUFBSSxDQUFDLEdBQUUsQ0FBVSxDQUFDO1lBQ2xCLE9BQU8sSUFBSSxhQUFLLENBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMs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LEdBQUMsQ0FBQyxFQUN0QyxrQkFBUyxDQUFDLGFBQWEsQ0FBQyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3BGLENBQUM7QUFHTixJQUFJLGVBQWUsR0FBc0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3BGLGVBQWUsQ0FBQyxLQUFLLEdBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNuQyxlQUFlLENBQUMsTUFBTSxHQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDcEMsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzVELElBQUksU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0RSxJQUFJLEdBQUcsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jYW1lcmEudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2NhbnZhcy50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY29sbGVjdGlvbi50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY29sb3IudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2NvbXB1dGF0aW9ucy50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvaW50ZXJzZWN0aW9uLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9tYXRlcmlhbC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvbWF0cml4LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9wb2ludExpZ2h0LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9yYXkudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3NvcnQudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvdHVwbGUudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3dvcmxkLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uL3NyYy9jaGFwdGVyOC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYW52YXMgfSBmcm9tIFwiLi9jYW52YXNcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgUmF5IH0gZnJvbSBcIi4vcmF5XCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gXCIuL3dvcmxkXCI7XG5cbmV4cG9ydCBjbGFzcyBDYW1lcmFcbntcbiAgdnNpemU6bnVtYmVyO1xuICBoc2l6ZTpudW1iZXI7XG4gIGZpZWxkT2ZWaWV3Om51bWJlcjtcblxuICBwcml2YXRlIF9oYWxmV2lkdGg6IG51bWJlcjtcbiAgcHVibGljIGdldCBoYWxmV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFsZkhlaWdodDogbnVtYmVyO1xuICBwdWJsaWMgZ2V0IGhhbGZoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGl4ZWxTaXplOiBudW1iZXI7XG4gIHB1YmxpYyBnZXQgcGl4ZWxTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3BpeGVsU2l6ZTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZVRyYW5zZm9ybTogTWF0cml4NHg0OyBcbiAgcHJpdmF0ZSBfdHJhbnNmb3JtOiBNYXRyaXg0eDQ7ICAgIFxuICAvKipcbiAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpOiBNYXRyaXg0eDQge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gIH1cbiAgcHVibGljIHNldCB0cmFuc2Zvcm0odmFsdWU6IE1hdHJpeDR4NCkge1xuICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybT12YWx1ZS5pbnZlcnNlKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihoc2l6ZTpudW1iZXIsdnNpemU6bnVtYmVyLCBmaWVsZE9mVmlldzpudW1iZXIsdHJhbnNmb3JtPzpNYXRyaXg0eDQpICBcbiAge1xuICAgICAgdGhpcy5oc2l6ZT1oc2l6ZTtcbiAgICAgIHRoaXMudnNpemU9dnNpemU7XG4gICAgICB0aGlzLmZpZWxkT2ZWaWV3PWZpZWxkT2ZWaWV3O1xuICAgICAgdGhpcy50cmFuc2Zvcm09IHRyYW5zZm9ybSA/PyBNYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZWNhbGN1bGF0ZSBkZXJpdmVkIHZhbHVlc1xuICAgKi9cbiAgdXBkYXRlKClcbiAge1xuICAgIHZhciBoYWxmVmlldz1NYXRoLnRhbih0aGlzLmZpZWxkT2ZWaWV3LzIpO1xuICAgIHZhciBhc3BlY3Q9dGhpcy5oc2l6ZS90aGlzLnZzaXplO1xuICAgIGlmIChhc3BlY3QgPj0xKVxuICAgIHtcbiAgICAgIHRoaXMuX2hhbGZXaWR0aD1oYWxmVmlldztcbiAgICAgIHRoaXMuX2hhbGZIZWlnaHQ9aGFsZlZpZXcvYXNwZWN0O1xuICAgIH0gZWxzZVxuICAgIHtcbiAgICAgIHRoaXMuX2hhbGZXaWR0aD1oYWxmVmlldyphc3BlY3Q7XG4gICAgICB0aGlzLl9oYWxmSGVpZ2h0PWhhbGZWaWV3O1xuICAgIH1cbiAgICB0aGlzLl9waXhlbFNpemU9KHRoaXMuX2hhbGZXaWR0aCoyKSAvdGhpcy5oc2l6ZTtcbiAgICBcbiAgfVxuICBcbiAgcmF5Rm9yUGl4ZWwoeDpudW1iZXIseTpudW1iZXIpOlJheVxuICB7XG5cbiAgICB2YXIgeE9mZnNldD0oeCswLjUpKnRoaXMuX3BpeGVsU2l6ZTtcbiAgICB2YXIgeU9mZnNldD0oeSswLjUpKnRoaXMuX3BpeGVsU2l6ZTtcblxuICAgIHZhciB3b3JsZFg9dGhpcy5faGFsZldpZHRoLXhPZmZzZXQ7XG4gICAgdmFyIHdvcmxkWT10aGlzLl9oYWxmSGVpZ2h0LXlPZmZzZXQ7XG4gICAgXG4gICAgdmFyIHBpeGVsPXRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShUdXBsZS5wb2ludCh3b3JsZFgsd29ybGRZLC0xKSk7XG4gICAgdmFyIG9yaWdpbj0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KFR1cGxlLnBvaW50KDAsMCwwKSk7XG4gICAgdmFyIGRpcmVjdGlvbj1waXhlbC5zdWJzdHJhY3Qob3JpZ2luKS5ub3JtYWxpemUoKTtcblxuICAgIHJldHVybiBuZXcgUmF5KG9yaWdpbixkaXJlY3Rpb24pO1xuICB9XG5cbiAgcmVuZGVyKHdvcmxkOldvcmxkKTpDYW52YXNcbiAge1xuICAgIHZhciBpbWFnZSA9IG5ldyBDYW52YXModGhpcy5oc2l6ZSx0aGlzLnZzaXplKTtcbiAgICBmb3IgKHZhciB5PSAwO3k8IHRoaXMudnNpemU7eSsrKVxuICAgIHtcbiAgICAgIGZvciAodmFyIHg9IDA7eDwgdGhpcy5oc2l6ZTt4KyspXG4gICAgICB7XG4gICAgICAgIHZhciByYXkgPSB0aGlzLnJheUZvclBpeGVsKHgseSk7XG4gICAgICAgIHZhciBjb2xvcj0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICBpbWFnZS53cml0ZVBpeGVsKHgseSxjb2xvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfVxuXG59IiwiaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiLi9jb2xvclwiO1xuXG5leHBvcnQgY2xhc3MgQ2FudmFzIFxueyAgXG4gICBkYXRhOkZsb2F0NjRBcnJheTtcbiAgIHdpZHRoOm51bWJlcjtcbiAgIGhlaWdodDpudW1iZXI7XG5cbiAgIGNvbnN0cnVjdG9yKHdpZHRoOm51bWJlcixoZWlnaHQ6bnVtYmVyKVxuICAge1xuICAgICB0aGlzLndpZHRoPXdpZHRoO1xuICAgICB0aGlzLmhlaWdodD1oZWlnaHQ7XG4gICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkod2lkdGgqaGVpZ2h0KjMpO1xuICAgICBmb3IgKHZhciBpPTA7aTx0aGlzLmRhdGEubGVuZ3RoO2krKylcbiAgICAge1xuICAgICAgICAgdGhpcy5kYXRhW2ldPTA7XG4gICAgIH1cbiAgIH1cblxuICAgcmVhZFBpeGVsKHg6bnVtYmVyLHk6bnVtYmVyKTpDb2xvclxuICAge1xuICAgICBpZiAoeDwwfHwgeD49dGhpcy53aWR0aCB8fCB5PDAgfHwgeT49IHRoaXMuaGVpZ2h0KSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICB2YXIgcGl4ZWxJbmRleD0gTWF0aC5mbG9vcih5KSogdGhpcy53aWR0aCozK01hdGguZmxvb3IoeCkqMztcbiAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLmRhdGFbcGl4ZWxJbmRleF0sdGhpcy5kYXRhW3BpeGVsSW5kZXggKzFdLHRoaXMuZGF0YVtwaXhlbEluZGV4ICsyXSk7XG4gICB9XG4gICB3cml0ZVBpeGVsICh4Om51bWJlcix5Om51bWJlcixjOkNvbG9yKTp2b2lkXG4gICB7XG4gICAgIGlmICh4PDB8fCB4Pj10aGlzLndpZHRoIHx8IHk8MCB8fCB5Pj0gdGhpcy5oZWlnaHQpIHJldHVybjtcbiAgICAgdmFyIHBpeGVsSW5kZXg9IE1hdGguZmxvb3IoeSkqIHRoaXMud2lkdGgqMytNYXRoLmZsb29yKHgpKjM7XG4gICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4XT1jLnJlZDtcbiAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXgrMV09Yy5ncmVlbjtcbiAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXgrMl09Yy5ibHVlO1xuICAgfVxuICAgdG9QcG0oKTpzdHJpbmdcbiAgIHtcbiAgICB2YXIgcHBtPVwiUDNcXG5cIjtcbiAgICBwcG0rPXRoaXMud2lkdGgrXCIgXCIrdGhpcy5oZWlnaHQrXCJcXG5cIjtcbiAgICBwcG0rPVwiMjU1XCI7XG4gICAgZm9yICh2YXIgaT0wO2k8dGhpcy5kYXRhLmxlbmd0aDtpKz0zKVxuICAgIHtcbiAgICAgICAgcHBtKz0oaSUxNT09MCkgPyAgXCJcXG5cIiA6XCIgXCI7XG4gICAgICAgIHBwbSs9IE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2ldKjI1NSksMjU1KSwwKS50b1N0cmluZygpXG4gICAgICAgICAgICArIFwiIFwiK01hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2krMV0qMjU1KSwyNTUpLDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgICtcIiBcIitNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpKzJdKjI1NSksMjU1KSwwKS50b1N0cmluZygpOyBcblxuICAgIH1cbiAgICBwcG0rPVwiXFxuXCI7XG4gICAgcmV0dXJuIHBwbTtcbiAgIH1cbiAgIHRvVWludDhDbGFtcGVkQXJyYXkoKTpVaW50OENsYW1wZWRBcnJheVxuICAge1xuICAgICB2YXIgYXJyID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHRoaXMud2lkdGgqdGhpcy5oZWlnaHQqNCk7XG4gICAgIHZhciBhcnJJbmRleD0wO1xuICAgICBmb3IgKHZhciBpPTA7aTx0aGlzLmRhdGEubGVuZ3RoO2krPTMpXG4gICAgIHsgICAgICAgIFxuICAgICAgICAgYXJyW2FyckluZGV4XT0gdGhpcy5kYXRhW2ldKjI1NTtcbiAgICAgICAgIGFyclthcnJJbmRleCsxXT0gIHRoaXMuZGF0YVtpKzFdKjI1NTtcbiAgICAgICAgIGFyclthcnJJbmRleCsyXT0gdGhpcy5kYXRhW2krMl0qMjU1O1xuICAgICAgICAgYXJyW2FyckluZGV4KzNdPSAyNTU7XG4gICAgICAgICBhcnJJbmRleCs9NDsgXG4gICAgIH1cbiAgICAgXG4gICAgIHJldHVybiBhcnI7XG4gICB9XG59IiwiXG4vKipcbiAqIE9iamVjdCBwb29sIHRoYXQgd2lsbCBtaW5pbWl6ZSBnYXJiYWdlIGNvbGxlY3Rpb24gdXNhZ2VcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE9iamVjdFBvb2w8VD5cbntcbiAgICBwcm90ZWN0ZWQgaXRlbXM6VFtdO1xuICAgIHByb3RlY3RlZCBfbGVuZ3RoOm51bWJlcjtcbiAgICBwcm90ZWN0ZWQgaW5kZXhNYXA6TWFwPFQsbnVtYmVyPjtcblxuICAgIGNvbnN0cnVjdG9yKGFycmF5TGVuZ3RoOm51bWJlcj0wKVxuICAgIHtcbiAgICAgIHRoaXMuaXRlbXM9bmV3IEFycmF5PFQ+KGFycmF5TGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5kZXhNYXA9IG5ldyBNYXA8VCxudW1iZXI+KCk7XG4gICAgICB0aGlzLl9sZW5ndGg9MDtcbiAgICAgIGZvciAodmFyIGk9MDtpPGFycmF5TGVuZ3RoO2krKylcbiAgICAgIHtcbiAgICAgICAgdmFyIG5ld0l0ZW09dGhpcy5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobmV3SXRlbSxpKTtcbiAgICAgICAgdGhpcy5pdGVtc1tpXT1uZXdJdGVtO1xuICAgICAgfVxuICAgICAgXG4gICAgfVxuXG4gICAgaW5kZXhPZihpdGVtOlQpOm51bWJlclxuICAgIHtcbiAgICAgdmFyIGk9IHRoaXMuaW5kZXhNYXAuZ2V0KGl0ZW0pO1xuICAgICByZXR1cm4gKGk9PT11bmRlZmluZWQgfHwgaT49dGhpcy5fbGVuZ3RoKSAgPyAtMTogaTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFuIGl0ZW0gYW5kIGZpbGxzIHRoZSBnYXAgd2l0aCB0aGUgbGFzdCBpdGVtLlxuICAgICAqIFJlbW92ZWQgaXRlbXMgd2lsbCBiZSByZXVzZWQgd2hlbiBjYWxsaW5nIC5hZGQoKSBcbiAgICAqL1xuICAgIHJlbW92ZShpdGVtOlQpOnZvaWQ7XG4gICAgcmVtb3ZlKGluZGV4Om51bWJlcik6dm9pZDtcbiAgICBwdWJsaWMgcmVtb3ZlKGE6YW55KTp2b2lkXG4gICAgeyBcbiAgICAgICAgdmFyIGluZGV4Om51bWJlcjtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4PXRoaXMuaW5kZXhNYXAuZ2V0KGEpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4PSBNYXRoLmZsb29yKGEgYXMgbnVtYmVyKTsgXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4IDwwIHx8IGluZGV4ID49dGhpcy5fbGVuZ3RoKSByZXR1cm47XG4gICAgICAgIHRoaXMuX2xlbmd0aC0tOyAgICAgICAgXG4gICAgICAgIHZhciByZW1vdmVJdGVtPSAgdGhpcy5pdGVtc1tpbmRleF07XG4gICAgICAgIHZhciBsYXN0SXRlbT10aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF07XG4gICAgICAgIHRoaXMuaXRlbXNbaW5kZXhdID0gbGFzdEl0ZW07XG4gICAgICAgIHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoXT1yZW1vdmVJdGVtO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChyZW1vdmVJdGVtLHRoaXMuX2xlbmd0aCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KGxhc3RJdGVtLGluZGV4KTtcbiAgICB9XG4gICAgcHVibGljIGNsZWFyKClcbiAgICB7XG4gICAgICAgIHRoaXMuX2xlbmd0aD0wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gdW51c2VkIGl0ZW0gb3IgY3JlYXRlcyBhIG5ldyBvbmUsIGlmIG5vIHVudXNlZCBpdGVtIGF2YWlsYWJsZVxuICAgICovXG4gICAgcHVibGljIGFkZCgpOlRcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aD09dGhpcy5fbGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbT10aGlzLmNyZWF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobmV3SXRlbSx0aGlzLl9sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoPXRoaXMuaXRlbXMucHVzaChuZXdJdGVtKTsgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGgrK107ICBcbiAgICB9XG4gICAgcHVibGljIGdldChpbmRleDpudW1iZXIpOlQgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIGlmIChpbmRleCA+PXRoaXMuX2xlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDsgICBcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBsZW5ndGgoKSA6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XG4gICAgfVxuXG4gICAgXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZSgpOlQ7XG59XG5cbiIsImV4cG9ydCBjbGFzcyBDb2xvciB7XG4gICAgcHVibGljIHJlZDogbnVtYmVyO1xuICAgIHB1YmxpYyBncmVlbjogbnVtYmVyO1xuICAgIHB1YmxpYyBibHVlOiBudW1iZXI7XG4gICAgXG4gICAgcHJpdmF0ZSBzdGF0aWMgRVBTSUxPTjogbnVtYmVyID0gMC4wMDAwMTtcbiAgICBcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJMQUNLPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigwLDAsMCkpO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgV0hJVEU9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDEsMSwxKSk7XG4gICAgY29uc3RydWN0b3IoKVxuICAgIGNvbnN0cnVjdG9yKHJlZDogbnVtYmVyLCBncmVlbjogbnVtYmVyLCBibHVlOiBudW1iZXIpXG4gICAgY29uc3RydWN0b3IocmVkPzogbnVtYmVyLCBncmVlbj86IG51bWJlciwgYmx1ZT86IG51bWJlcikge1xuICAgICAgICB0aGlzLnJlZCA9IHJlZDtcbiAgICAgICAgdGhpcy5ncmVlbiA9IGdyZWVuO1xuICAgICAgICB0aGlzLmJsdWUgPSBibHVlOyAgICAgICAgXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWRkKGNvbG9yOiBDb2xvcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCArIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiArIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgKyBjb2xvci5ibHVlKVxuICAgIH1cbiAgICBwdWJsaWMgbXVsdGlwbHkoc2NhbGFyOiBudW1iZXIpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKiBzY2FsYXIsIHRoaXMuZ3JlZW4gKiBzY2FsYXIsIHRoaXMuYmx1ZSAqIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIGRpdmlkZShzY2FsYXI6IG51bWJlcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAvIHNjYWxhciwgdGhpcy5ncmVlbiAvIHNjYWxhciwgdGhpcy5ibHVlIC8gc2NhbGFyKVxuICAgIH1cbiAgICBwdWJsaWMgc3Vic3RyYWN0KGNvbG9yOiBDb2xvcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAtIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgLSBjb2xvci5ibHVlKVxuICAgIH1cbiAgICBwdWJsaWMgaGFkYW1hcmRQcm9kdWN0KGNvbG9yOkNvbG9yKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCpjb2xvci5yZWQsdGhpcy5ncmVlbipjb2xvci5ncmVlbix0aGlzLmJsdWUqY29sb3IuYmx1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGVxdWFscyhjb2xvcjogQ29sb3IpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMucmVkIC0gY29sb3IucmVkKSA8IENvbG9yLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMuZ3JlZW4gLSBjb2xvci5ncmVlbikgPCBDb2xvci5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmJsdWUgLSBjb2xvci5ibHVlKSA8IENvbG9yLkVQU0lMT047XG4gICAgfVxuICAgIGNsb25lKClcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQsdGhpcy5ncmVlbix0aGlzLmJsdWUpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBJbnRlcnNlY3Rpb24gfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuaW1wb3J0IHsgSVdvcmxkT2JqZWN0IH0gZnJvbSBcIi4vd29ybGRcIjtcblxuZXhwb3J0IGNsYXNzIENvbXB1dGF0aW9uc1xue1xuICAgIHQ6IG51bWJlcjtcbiAgICBvYmplY3Q6IElXb3JsZE9iamVjdDtcbiAgICBwb2ludDogVHVwbGU7XG4gICAgZXlldjpUdXBsZTtcbiAgICBub3JtYWx2OiBUdXBsZTtcbiAgICBpbnNpZGU6IGJvb2xlYW47XG4gICAgb3ZlclBvaW50OiBUdXBsZTtcbiAgICBwdWJsaWMgc3RhdGljIHByZXBhcmUoaW50ZXJzZWN0aW9uOkludGVyc2VjdGlvbixyYXk6UmF5ICk6Q29tcHV0YXRpb25zXG4gICAge1xuICAgICAgdmFyIGNvbXBzID0gbmV3IENvbXB1dGF0aW9ucygpO1xuICAgICAgY29tcHMudD1pbnRlcnNlY3Rpb24udDtcbiAgICAgIGNvbXBzLm9iamVjdD1pbnRlcnNlY3Rpb24ub2JqZWN0O1xuXG4gICAgICBjb21wcy5wb2ludD1yYXkucG9zaXRpb24oY29tcHMudCk7XG4gICAgICBjb21wcy5leWV2PXJheS5kaXJlY3Rpb24ubmVnYXRlKCk7XG4gICAgICBjb21wcy5ub3JtYWx2PSBjb21wcy5vYmplY3Qubm9ybWFsQXQoY29tcHMucG9pbnQpO1xuICAgICAgaWYgKGNvbXBzLm5vcm1hbHYuZG90KGNvbXBzLmV5ZXYpPDApXG4gICAgICB7XG4gICAgICAgIGNvbXBzLmluc2lkZT10cnVlO1xuICAgICAgICBjb21wcy5ub3JtYWx2PWNvbXBzLm5vcm1hbHYubmVnYXRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wcy5pbnNpZGU9ZmFsc2U7XG4gICAgICB9XG4gICAgICBjb21wcy5vdmVyUG9pbnQ9Y29tcHMucG9pbnQuYWRkKGNvbXBzLm5vcm1hbHYubXVsdGlwbHkoVHVwbGUuRVBTSUxPTikpO1xuXG4gICAgICByZXR1cm4gY29tcHM7XG4gICAgfVxuXG4gICAgXG4gICAgY29uc3RydWN0b3IoKVxuICAgIHtcblxuICAgIH1cblxufSIsImltcG9ydCB7IE9iamVjdFBvb2wgfSBmcm9tIFwiLi9jb2xsZWN0aW9uXCJcbmltcG9ydCB7bWVyZ2VTb3J0SW5wbGFjZX0gZnJvbSBcIi4vc29ydFwiXG5pbXBvcnQgeyBJV29ybGRPYmplY3QgfSBmcm9tIFwiLi93b3JsZFwiO1xuZXhwb3J0IGNsYXNzIEludGVyc2VjdGlvbiB7XG4gICAgdDogbnVtYmVyO1xuICAgIG9iamVjdDogSVdvcmxkT2JqZWN0O1xuICAgIGNvbnN0cnVjdG9yKHQ6IG51bWJlciwgb2JqZWN0OiBhbnkpIHtcblxuICAgICAgICB0aGlzLnQgPSB0O1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbjogSW50ZXJzZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnQgPT0gaW50ZXJzZWN0aW9uLnQgJiYgdGhpcy5vYmplY3QgPT09IGludGVyc2VjdGlvbi5vYmplY3Q7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW50ZXJzZWN0aW9ucyBleHRlbmRzIE9iamVjdFBvb2w8SW50ZXJzZWN0aW9uPiB7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBzb3J0SW50ZXJzZWN0aW9uKGE6SW50ZXJzZWN0aW9uICxiOkludGVyc2VjdGlvbik6bnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gYS50LWIudDtcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBjcmVhdGUoKTogSW50ZXJzZWN0aW9uIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcnNlY3Rpb24oMCwgbnVsbCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBoaXQsIHJlZ2FyZGxlc3Mgb2Ygc29ydFxuICAgICovXG4gICAgaGl0KCk6IEludGVyc2VjdGlvbiB7XG4gICAgICAgIHZhciBoaXQ6IEludGVyc2VjdGlvbiA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmICgoaGl0ID09IG51bGwgfHwgaXRlbS50IDwgaGl0LnQpICYmIGl0ZW0udCA+IDApIGhpdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpdDtcbiAgICB9XG4gICAgc29ydCgpOiB2b2lkIHsgICAgICAgXG4gICAgICAgIG1lcmdlU29ydElucGxhY2UodGhpcy5pdGVtcyxJbnRlcnNlY3Rpb25zLnNvcnRJbnRlcnNlY3Rpb24sMCx0aGlzLl9sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwLnNldCh0aGlzLml0ZW1zW2ldLCBpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlcXVhbHMoaW50ZXJzZWN0aW9uczogSW50ZXJzZWN0aW9ucyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fbGVuZ3RoICE9IGludGVyc2VjdGlvbnMubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pdGVtc1tpXS5lcXVhbHMoaW50ZXJzZWN0aW9ucy5pdGVtc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwiLi9jb2xvclwiO1xuaW1wb3J0IHsgUG9pbnRMaWdodCB9IGZyb20gXCIuL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcblxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsXG57XG4gICAgY29sb3I6Q29sb3I9Q29sb3IuV0hJVEUuY2xvbmUoKTtcbiAgICBhbWJpZW50Om51bWJlcj0wLjE7XG4gICAgZGlmZnVzZTpudW1iZXI9MC45O1xuICAgIHNwZWN1bGFyOm51bWJlcj0wLjk7XG4gICAgc2hpbmluZXNzOm51bWJlcj0yMDA7XG5cbiAgICBsaWdodGluZyhsaWdodDpQb2ludExpZ2h0LHBvaW50OlR1cGxlLGV5ZXY6VHVwbGUsbm9ybWFsdjpUdXBsZSxpblNoYWRvdzpib29sZWFuPWZhbHNlKTpDb2xvclxuICAgIHtcbiAgICAgICB2YXIgZWZmZWN0aXZlQ29sb3I9dGhpcy5jb2xvci5oYWRhbWFyZFByb2R1Y3QobGlnaHQuaW50ZW5zaXR5KTtcbiAgICAgICB2YXIgYW1iaWVudD1lZmZlY3RpdmVDb2xvci5tdWx0aXBseSh0aGlzLmFtYmllbnQpO1xuICAgICAgIGlmIChpblNoYWRvdykgcmV0dXJuIGFtYmllbnQ7XG4gICAgICAgdmFyIGxpZ2h0dj1saWdodC5wb3NpdG9uLnN1YnN0cmFjdChwb2ludCkubm9ybWFsaXplKCk7XG5cbiAgICAgICB2YXIgbGlnaHREb3ROb3JtYWw9bGlnaHR2LmRvdChub3JtYWx2KTtcbiAgICAgICB2YXIgZGlmZnVzZTtcbiAgICAgICB2YXIgc3BlY3VsYXI7XG4gICAgICAgaWYgKGxpZ2h0RG90Tm9ybWFsPDApXG4gICAgICAge1xuICAgICAgICAgZGlmZnVzZT1Db2xvci5CTEFDSztcbiAgICAgICAgIHNwZWN1bGFyPUNvbG9yLkJMQUNLO1xuICAgICAgIH0gZWxzZVxuICAgICAgIHtcbiAgICAgICAgICAgZGlmZnVzZT1lZmZlY3RpdmVDb2xvci5tdWx0aXBseSh0aGlzLmRpZmZ1c2UqbGlnaHREb3ROb3JtYWwpO1xuICAgICAgICAgICB2YXIgcmVmbGVjdHY9bGlnaHR2Lm5lZ2F0ZSgpLnJlZmxlY3Qobm9ybWFsdik7XG4gICAgICAgICAgIHZhciByZWZsZWN0RG90RXllPSByZWZsZWN0di5kb3QoZXlldik7XG4gICAgICAgICAgIGlmIChyZWZsZWN0RG90RXllIDw9MClcbiAgICAgICAgICAge1xuICAgICAgICAgICAgICAgc3BlY3VsYXI9Q29sb3IuQkxBQ0s7XG4gICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICB7XG4gICAgICAgICAgICAgdmFyIGZhY3Rvcj1NYXRoLnBvdyhyZWZsZWN0RG90RXllLHRoaXMuc2hpbmluZXNzKTtcbiAgICAgICAgICAgICBzcGVjdWxhcj0gbGlnaHQuaW50ZW5zaXR5Lm11bHRpcGx5KHRoaXMuc3BlY3VsYXIqZmFjdG9yICk7XG5cbiAgICAgICAgICAgfVxuICAgICAgIH1cbiAgICAgICByZXR1cm4gYW1iaWVudC5hZGQoZGlmZnVzZSkuYWRkKHNwZWN1bGFyKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuXG5leHBvcnQgY2xhc3MgTWF0cml4IHtcbiAgICBwcml2YXRlIHN0YXRpYyBFUFNJTE9OOiBudW1iZXIgPSAwLjAwMDAxO1xuICAgIHByb3RlY3RlZCBkYXRhOiBGbG9hdDY0QXJyYXk7XG4gICAgXG4gICBcbiAgICBwdWJsaWMgcmVhZG9ubHkgd2lkdGg6IG51bWJlcjtcbiAgICBwdWJsaWMgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg6IEFycmF5PEFycmF5PG51bWJlcj4+KVxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKGE6IGFueSwgYj86IGFueSkge1xuICAgICAgICBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgbWF0cml4ID0gYSBhcyBBcnJheTxBcnJheTxudW1iZXI+PjtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoPT0wIHx8IG1hdHJpeFswXS5sZW5ndGg9PTApIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgdGhpcy53aWR0aD1tYXRyaXhbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQ9bWF0cml4Lmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IEZsb2F0NjRBcnJheSggdGhpcy53aWR0aCp0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gbWF0cml4W3ldO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHg9MDt4PCB0aGlzLndpZHRoO3grKylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlPSByb3dbeF07XG4gICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlIT09dW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YVt0aGlzLndpZHRoKnkreF09dmFsdWU7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gYSBhcyBudW1iZXI7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGIgYXMgbnVtYmVyO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2ZhY3Rvcihyb3c6bnVtYmVyLGNvbHVtbjpudW1iZXIpOm51bWJlclxuICAgIHtcbiAgICAgICByZXR1cm4gKChyb3crY29sdW1uKSAlIDIgKjIgLTEpKiAtdGhpcy5taW5vcihyb3csY29sdW1uKTtcbiAgICB9XG4gICAgbWlub3Iocm93Om51bWJlcixjb2x1bW46bnVtYmVyKTpudW1iZXJcbiAgICB7ICAgXG4gICAgICAgIHZhciBtPSB0aGlzLnN1Ym1hdHJpeChyb3csY29sdW1uKTsgICAgICAgIFxuICAgICAgICByZXR1cm4gbS5kZXRlcm1pbmFudCgpOyBcbiAgICB9XG4gICAgaXNJbnZlcnRpYmxlKCk6Ym9vbGVhblxuICAgIHtcbiAgICAgcmV0dXJuIHRoaXMuZGV0ZXJtaW5hbnQoKSE9MDtcbiAgICB9XG4gICBcbiAgICBkZXRlcm1pbmFudCgpOm51bWJlclxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMud2lkdGghPXRoaXMuaGVpZ2h0KSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgaWYgKHRoaXMud2lkdGg9PTIpIHJldHVybiBNYXRyaXgyeDIucHJvdG90eXBlLmRldGVybWluYW50LmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBkZXQ9MDtcbiAgICAgICAgZm9yICh2YXIgeD0wO3g8dGhpcy53aWR0aDt4KyspXG4gICAgICAgIHtcbiAgICAgICAgIGRldCs9IHRoaXMuZGF0YVt4XSp0aGlzLmNvZmFjdG9yKDAseCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG4gICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykgeyBcbiAgICAgICAgICAgIHN0cmluZyArPSBcInxcIiAgIFxuICAgICAgICAgICAgZm9yICh2YXIgeD0wO3g8IHRoaXMud2lkdGg7eCsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSAgdGhpcy5kYXRhW3RoaXMud2lkdGgqeSt4XS50b0ZpeGVkKDIpK1wiXFx0fFwiOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyaW5nICs9ICBcIlxcblwiOyAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cblxuICAgIGdldChyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHJvdyA+PSB0aGlzLmhlaWdodCB8fCBjb2x1bW4gPj0gdGhpcy53aWR0aCB8fCByb3cgPCAwIHx8IGNvbHVtbiA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy53aWR0aCpyb3crY29sdW1uXSA7XG4gICAgfVxuXG4gICAgc2V0KHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdGhpcy5kYXRhW3RoaXMud2lkdGgqcm93K2NvbHVtbl0gPSB2YWx1ZTtcbiAgICB9XG4gICAgXG5cbiAgICBtdWx0aXBseShtYXRyaXg6IE1hdHJpeCk6IE1hdHJpeFxuICAgIHsgICAgIFxuICAgICAgICAgICBcbiAgICAgICAgaWYgKG1hdHJpeC5oZWlnaHQgIT0gdGhpcy5oZWlnaHQpIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgobWF0cml4LndpZHRoLCBtYXRyaXguaGVpZ2h0KTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBtYXRyaXguaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbWF0cml4LndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IG1hdHJpeC5oZWlnaHQ7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gbWF0cml4LmRhdGFbdGhpcy53aWR0aCpyK3hdICogdGhpcy5kYXRhW3RoaXMud2lkdGgqeStyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW3RoaXMud2lkdGgqeSt4XSA9IHN1bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cbiAgICB0cmFuc3Bvc2UoKSA6TWF0cml4XG4gICAge1xuICAgICAgICB2YXIgbWF0cml4PSBuZXcgTWF0cml4KHRoaXMuaGVpZ2h0LHRoaXMud2lkdGgpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IHk7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleD10aGlzLndpZHRoKnkreDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXhUcmFuc3Bvc2VkPXRoaXMud2lkdGgqeCt5O1xuICAgICAgICAgICAgICAgIHZhciBzd2FwPSAgdGhpcy5kYXRhW2luZGV4XTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhdID0gdGhpcy5kYXRhW2luZGV4VHJhbnNwb3NlZF07XG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhUcmFuc3Bvc2VkXSA9IHN3YXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdHJpeDtcbiAgICB9XG4gICAgXG5cbiAgICBzdWJtYXRyaXgocm93Om51bWJlcixjb2x1bW46bnVtYmVyKTpNYXRyaXhcbiAgICB7XG4gICAgICAgIHZhciBtPSBuZXcgTWF0cml4KHRoaXMud2lkdGgtMSx0aGlzLmhlaWdodC0xKTsgICAgICAgXG4gICAgICAgIHZhciB5Mj0wOyAgICAgICAgXG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgaWYgKHk9PXJvdylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB4Mj0wO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeD09Y29sdW1uKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0uZGF0YVttLndpZHRoKnkyK3gyXT10aGlzLmRhdGFbdGhpcy53aWR0aCp5K3hdO1xuICAgICAgICAgICAgICAgIHgyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5MisrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiBcblxuICAgIGVxdWFscyhtYXRyaXg6IE1hdHJpeCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy53aWR0aCAhPSBtYXRyaXgud2lkdGggfHwgdGhpcy5oZWlnaHQgIT0gbWF0cml4LmhlaWdodCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGRpZmY9IE1hdGguYWJzKHRoaXMuZGF0YVtpXSAtIG1hdHJpeC5kYXRhW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA+PSBNYXRyaXguRVBTSUxPTikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWF0cml4NHg0IGV4dGVuZHMgTWF0cml4XG57XG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBJREVOVElUWV9NQVRSSVggPW5ldyBNYXRyaXg0eDQoXG4gICAgICAgIFtcbiAgICAgICAgICAgIFsxLDAsMCwwXSxcbiAgICAgICAgICAgIFswLDEsMCwwXSxcbiAgICAgICAgICAgIFswLDAsMSwwXSxcbiAgICAgICAgICAgIFswLDAsMCwxXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBwcml2YXRlIHN0YXRpYyB0ZW1wTWF0cml4NHg0PSBuZXcgTWF0cml4NHg0KCk7XG5cbiAgICBwdWJsaWMgc3RhdGljIHZpZXdUcmFuc2Zvcm0oZnJvbTpUdXBsZSx0bzpUdXBsZSx1cDpUdXBsZSAsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHZhciBmb3J3YXJkPXRvLnN1YnN0cmFjdChmcm9tKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIHVwbj0gdXAubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciBsZWZ0ID1mb3J3YXJkLmNyb3NzKHVwbik7XG4gICAgICAgIHZhciB0cnVlVXA9bGVmdC5jcm9zcyhmb3J3YXJkKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09bGVmdC54O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXT1sZWZ0Lnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdPWxlZnQuejtcblxuXG4gICAgICAgIHRhcmdldC5kYXRhWzRdPXRydWVVcC54O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT10cnVlVXAueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09dHJ1ZVVwLno7XG5cblxuICAgICAgICB0YXJnZXQuZGF0YVs4XT0tZm9yd2FyZC54O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0tZm9yd2FyZC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09LWZvcndhcmQuejtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgXG4gICAgICAgIE1hdHJpeDR4NC50cmFuc2xhdGlvbigtZnJvbS54LC1mcm9tLnksLWZyb20ueiwgTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQpO1xuXG4gICAgICAgIHRhcmdldC5tdWx0aXBseShNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCx0YXJnZXQpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuXG4gICAgcHVibGljIHN0YXRpYyB0cmFuc2xhdGlvbih4Om51bWJlcix5Om51bWJlcix6Om51bWJlcix0YXJnZXQ6TWF0cml4NHg0ID1uZXcgTWF0cml4NHg0KCkpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPXk7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT16O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyByb3RhdGlvblgocmFkaWFuczpudW1iZXIsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7ICAgICAgIFxuICAgICAgICB2YXIgY29zPU1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPS1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyByb3RhdGlvblkocmFkaWFuczpudW1iZXIsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7ICAgICAgIFxuICAgICAgICB2YXIgY29zPU1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT0tc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyByb3RhdGlvbloocmFkaWFuczpudW1iZXIsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7ICAgICAgICBcbiAgICAgICAgdmFyIGNvcz1NYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbj0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09c2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT0tc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGluZyh4Om51bWJlcix5Om51bWJlcix6Om51bWJlcix0YXJnZXQ6TWF0cml4NHg0ID1uZXcgTWF0cml4NHg0KCkpOk1hdHJpeDR4NFxuICAgIHsgICAgICAgIFxuICAgICAgICB0YXJnZXQuZGF0YVswXT14O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT15O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIHNoZWFyaW5nKHh5Om51bWJlcix4ejpudW1iZXIseXg6bnVtYmVyLHl6Om51bWJlcix6eDpudW1iZXIsenk6bnVtYmVyLHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAgeyAgICAgICBcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09eXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPXp4O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT14eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09enk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPXh6O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT15ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeD86IEFycmF5PEFycmF5PG51bWJlcj4+KSBcbiAgICB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcbiAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoIT00IHx8IG1hdHJpeFswXS5sZW5ndGghPTQgfHwgbWF0cml4WzFdLmxlbmd0aCE9NCB8fCBtYXRyaXhbMl0ubGVuZ3RoIT00IHx8IG1hdHJpeFszXS5sZW5ndGghPTQpXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoNCAsNCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdHJhbnNwb3NlKHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB2YXIgc3dhcDpudW1iZXI7ICAgICAgXG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHRoaXMuZGF0YVs4XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzNdO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzZdO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzddO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgIHN3YXA9ICB0aGlzLmRhdGFbMTFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSB0aGlzLmRhdGFbMTRdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGludmVyc2UodGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7ICAgICAgIFxuICAgICAgICB2YXIgYTAwPXRoaXMuZGF0YVswXTtcbiAgICAgICAgdmFyIGEwMT10aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDI9dGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMD10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTE9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGExMz10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjA9dGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxPXRoaXMuZGF0YVs5XTtcbiAgICAgICAgdmFyIGEyMj10aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzPXRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzA9dGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdmFyIGEzMT10aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyPXRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzM9dGhpcy5kYXRhWzE1XTtcbiAgICAgICAgdmFyIGRldGVybWluYW50PSAoYTAwKihhMTEqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIxKmEzMy1hMjMqYTMxKSthMTMqKGEyMSphMzItYTIyKmEzMSkpK1xuICAgICAgICAgICAgICAgICAgICAgICAgYTAxKi0oYTEwKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMyLWEyMiphMzApKStcbiAgICAgICAgICAgICAgICAgICAgICAgIGEwMiooYTEwKihhMjEqYTMzLWEyMyphMzEpK2ExMSotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMxLWEyMSphMzApKStcbiAgICAgICAgICAgICAgICAgICAgICAgIGEwMyotKGExMCooYTIxKmEzMi1hMjIqYTMxKSthMTEqLShhMjAqYTMyLWEyMiphMzApK2ExMiooYTIwKmEzMS1hMjEqYTMwKSkpOyAgIFxuICAgICAgICBpZiAoZGV0ZXJtaW5hbnQ9PTApIHJldHVybiBudWxsOyAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHRhcmdldC5kYXRhWzBdPSAoYTExKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMSphMzMtYTIzKmEzMSkrYTEzKihhMjEqYTMyLWEyMiphMzEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09IC0oYTAxKihhMjIqYTMzLWEyMyphMzIpK2EwMiotKGEyMSphMzMtYTIzKmEzMSkrYTAzKihhMjEqYTMyLWEyMiphMzEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09IChhMDEqKGExMiphMzMtYTEzKmEzMikrYTAyKi0oYTExKmEzMy1hMTMqYTMxKSthMDMqKGExMSphMzItYTEyKmEzMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVszXT0gLShhMDEqKGExMiphMjMtYTEzKmEyMikrYTAyKi0oYTExKmEyMy1hMTMqYTIxKSthMDMqKGExMSphMjItYTEyKmEyMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT0gLShhMTAqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzItYTIyKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT0gKGEwMCooYTIyKmEzMy1hMjMqYTMyKSthMDIqLShhMjAqYTMzLWEyMyphMzApK2EwMyooYTIwKmEzMi1hMjIqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPSAtKGEwMCooYTEyKmEzMy1hMTMqYTMyKSthMDIqLShhMTAqYTMzLWExMyphMzApK2EwMyooYTEwKmEzMi1hMTIqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPSAoYTAwKihhMTIqYTIzLWExMyphMjIpK2EwMiotKGExMCphMjMtYTEzKmEyMCkrYTAzKihhMTAqYTIyLWExMiphMjApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09IChhMTAqKGEyMSphMzMtYTIzKmEzMSkrYTExKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0gLShhMDAqKGEyMSphMzMtYTIzKmEzMSkrYTAxKi0oYTIwKmEzMy1hMjMqYTMwKSthMDMqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09IChhMDAqKGExMSphMzMtYTEzKmEzMSkrYTAxKi0oYTEwKmEzMy1hMTMqYTMwKSthMDMqKGExMCphMzEtYTExKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09IC0oYTAwKihhMTEqYTIzLWExMyphMjEpK2EwMSotKGExMCphMjMtYTEzKmEyMCkrYTAzKihhMTAqYTIxLWExMSphMjApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPSAtKGExMCooYTIxKmEzMi1hMjIqYTMxKSthMTEqLShhMjAqYTMyLWEyMiphMzApK2ExMiooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0gKGEwMCooYTIxKmEzMi1hMjIqYTMxKSthMDEqLShhMjAqYTMyLWEyMiphMzApK2EwMiooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0gLShhMDAqKGExMSphMzItYTEyKmEzMSkrYTAxKi0oYTEwKmEzMi1hMTIqYTMwKSthMDIqKGExMCphMzEtYTExKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09IChhMDAqKGExMSphMjItYTEyKmEyMSkrYTAxKi0oYTEwKmEyMi1hMTIqYTIwKSthMDIqKGExMCphMjEtYTExKmEyMCkpL2RldGVybWluYW50O1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICBcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKVxuICAgIHsgXG4gICAgICAgIHZhciBhMDA9dGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxPXRoaXMuZGF0YVsxXTtcbiAgICAgICAgdmFyIGEwMj10aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDM9dGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgdmFyIGEyMD10aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjE9dGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIHZhciBhMjM9dGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMD10aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxPXRoaXMuZGF0YVsxM107XG4gICAgICAgIHZhciBhMzI9dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMz10aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gKGEwMCooYTExKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMSphMzMtYTIzKmEzMSkrYTEzKihhMjEqYTMyLWEyMiphMzEpKStcbiAgICAgICAgICAgICAgICBhMDEqLShhMTAqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzItYTIyKmEzMCkpK1xuICAgICAgICAgICAgICAgIGEwMiooYTEwKihhMjEqYTMzLWEyMyphMzEpK2ExMSotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMxLWEyMSphMzApKStcbiAgICAgICAgICAgICAgICBhMDMqLShhMTAqKGEyMSphMzItYTIyKmEzMSkrYTExKi0oYTIwKmEzMi1hMjIqYTMwKSthMTIqKGEyMCphMzEtYTIxKmEzMCkpKTsgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBhc3NpZ24obWF0cml4Ok1hdHJpeDR4NClcbiAgICB7XG4gICAgICAgIHRoaXMuZGF0YVswXT0gbWF0cml4LmRhdGFbMF07XG4gICAgICAgIHRoaXMuZGF0YVsxXT0gbWF0cml4LmRhdGFbMV07XG4gICAgICAgIHRoaXMuZGF0YVsyXT0gbWF0cml4LmRhdGFbMl07XG4gICAgICAgIHRoaXMuZGF0YVszXT0gbWF0cml4LmRhdGFbM107XG4gICAgICAgIHRoaXMuZGF0YVs0XT0gbWF0cml4LmRhdGFbNF07XG4gICAgICAgIHRoaXMuZGF0YVs1XT0gbWF0cml4LmRhdGFbNV07XG4gICAgICAgIHRoaXMuZGF0YVs2XT0gbWF0cml4LmRhdGFbNl07XG4gICAgICAgIHRoaXMuZGF0YVs3XT0gbWF0cml4LmRhdGFbN107XG4gICAgICAgIHRoaXMuZGF0YVs4XT0gbWF0cml4LmRhdGFbOF07XG4gICAgICAgIHRoaXMuZGF0YVs5XT0gbWF0cml4LmRhdGFbOV07XG4gICAgICAgIHRoaXMuZGF0YVsxMF09IG1hdHJpeC5kYXRhWzEwXTtcbiAgICAgICAgdGhpcy5kYXRhWzExXT0gbWF0cml4LmRhdGFbMTFdO1xuICAgICAgICB0aGlzLmRhdGFbMTJdPSBtYXRyaXguZGF0YVsxMl07XG4gICAgICAgIHRoaXMuZGF0YVsxM109IG1hdHJpeC5kYXRhWzEzXTtcbiAgICAgICAgdGhpcy5kYXRhWzE0XT0gbWF0cml4LmRhdGFbMTRdO1xuICAgICAgICB0aGlzLmRhdGFbMTVdPSBtYXRyaXguZGF0YVsxNV07XG4gICAgfVxuXG4gICAgY2xvbmUoKTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBtLmRhdGFbMF09dGhpcy5kYXRhWzBdO1xuICAgICAgICBtLmRhdGFbMV09dGhpcy5kYXRhWzFdO1xuICAgICAgICBtLmRhdGFbMl09dGhpcy5kYXRhWzJdO1xuICAgICAgICBtLmRhdGFbM109dGhpcy5kYXRhWzNdO1xuICAgICAgICBtLmRhdGFbNF09dGhpcy5kYXRhWzRdO1xuICAgICAgICBtLmRhdGFbNV09dGhpcy5kYXRhWzVdO1xuICAgICAgICBtLmRhdGFbNl09dGhpcy5kYXRhWzZdO1xuICAgICAgICBtLmRhdGFbN109dGhpcy5kYXRhWzddO1xuICAgICAgICBtLmRhdGFbOF09dGhpcy5kYXRhWzhdO1xuICAgICAgICBtLmRhdGFbOV09dGhpcy5kYXRhWzldO1xuICAgICAgICBtLmRhdGFbMTBdPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIG0uZGF0YVsxMV09dGhpcy5kYXRhWzExXTtcbiAgICAgICAgbS5kYXRhWzEyXT10aGlzLmRhdGFbMTJdO1xuICAgICAgICBtLmRhdGFbMTNdPXRoaXMuZGF0YVsxM107XG4gICAgICAgIG0uZGF0YVsxNF09dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgbS5kYXRhWzE1XT10aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cblxuICAgIG11bHRpcGx5KHR1cGxlOiBUdXBsZSk6IFR1cGxlXG4gICAgbXVsdGlwbHkobWF0cml4OiBNYXRyaXg0eDQsdGFyZ2V0PzpNYXRyaXg0eDQpOiBNYXRyaXg0eDRcbiAgICBtdWx0aXBseShhOmFueSxiPzphbnkpOmFueVxuICAgIHtcbiAgICAgIGlmIChhIGluc3RhbmNlb2YgTWF0cml4NHg0KVxuICAgICAge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gIGIgPz8gIG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgaWYgKG1hdHJpeD09PXRoaXMpIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB2YXIgbWF0cml4PSBhIGFzIE1hdHJpeDR4NDtcbiAgICAgICAgdmFyIGEwMD10aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDE9dGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyPXRoaXMuZGF0YVsyXTtcbiAgICAgICAgdmFyIGEwMz10aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTA9dGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgdmFyIGExMj10aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTM9dGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMz10aGlzLmRhdGFbMTFdO1xuICAgICAgICB2YXIgYTMwPXRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzE9dGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMj10aGlzLmRhdGFbMTRdO1xuICAgICAgICB2YXIgYTMzPXRoaXMuZGF0YVsxNV07XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09bWF0cml4LmRhdGFbMF0qIGEwMCttYXRyaXguZGF0YVs0XSogYTAxK21hdHJpeC5kYXRhWzhdKiBhMDIrbWF0cml4LmRhdGFbMTJdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdPW1hdHJpeC5kYXRhWzFdKiBhMDArbWF0cml4LmRhdGFbNV0qIGEwMSttYXRyaXguZGF0YVs5XSogYTAyK21hdHJpeC5kYXRhWzEzXSogYTAzO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXT1tYXRyaXguZGF0YVsyXSogYTAwK21hdHJpeC5kYXRhWzZdKiBhMDErbWF0cml4LmRhdGFbMTBdKiBhMDIrbWF0cml4LmRhdGFbMTRdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdPW1hdHJpeC5kYXRhWzNdKiBhMDArbWF0cml4LmRhdGFbN10qIGEwMSttYXRyaXguZGF0YVsxMV0qIGEwMittYXRyaXguZGF0YVsxNV0qIGEwMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09bWF0cml4LmRhdGFbMF0qIGExMCttYXRyaXguZGF0YVs0XSogYTExK21hdHJpeC5kYXRhWzhdKiBhMTIrbWF0cml4LmRhdGFbMTJdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPW1hdHJpeC5kYXRhWzFdKiBhMTArbWF0cml4LmRhdGFbNV0qIGExMSttYXRyaXguZGF0YVs5XSogYTEyK21hdHJpeC5kYXRhWzEzXSogYTEzO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT1tYXRyaXguZGF0YVsyXSogYTEwK21hdHJpeC5kYXRhWzZdKiBhMTErbWF0cml4LmRhdGFbMTBdKiBhMTIrbWF0cml4LmRhdGFbMTRdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPW1hdHJpeC5kYXRhWzNdKiBhMTArbWF0cml4LmRhdGFbN10qIGExMSttYXRyaXguZGF0YVsxMV0qIGExMittYXRyaXguZGF0YVsxNV0qIGExMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09bWF0cml4LmRhdGFbMF0qIGEyMCttYXRyaXguZGF0YVs0XSogYTIxK21hdHJpeC5kYXRhWzhdKiBhMjIrbWF0cml4LmRhdGFbMTJdKiBhMjM7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPW1hdHJpeC5kYXRhWzFdKiBhMjArbWF0cml4LmRhdGFbNV0qIGEyMSttYXRyaXguZGF0YVs5XSogYTIyK21hdHJpeC5kYXRhWzEzXSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09bWF0cml4LmRhdGFbMl0qIGEyMCttYXRyaXguZGF0YVs2XSogYTIxK21hdHJpeC5kYXRhWzEwXSogYTIyK21hdHJpeC5kYXRhWzE0XSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09bWF0cml4LmRhdGFbM10qIGEyMCttYXRyaXguZGF0YVs3XSogYTIxK21hdHJpeC5kYXRhWzExXSogYTIyK21hdHJpeC5kYXRhWzE1XSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09bWF0cml4LmRhdGFbMF0qIGEzMCttYXRyaXguZGF0YVs0XSogYTMxK21hdHJpeC5kYXRhWzhdKiBhMzIrbWF0cml4LmRhdGFbMTJdKiBhMzM7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT1tYXRyaXguZGF0YVsxXSogYTMwK21hdHJpeC5kYXRhWzVdKiBhMzErbWF0cml4LmRhdGFbOV0qIGEzMittYXRyaXguZGF0YVsxM10qIGEzMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPW1hdHJpeC5kYXRhWzJdKiBhMzArbWF0cml4LmRhdGFbNl0qIGEzMSttYXRyaXguZGF0YVsxMF0qIGEzMittYXRyaXguZGF0YVsxNF0qIGEzMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPW1hdHJpeC5kYXRhWzNdKiBhMzArbWF0cml4LmRhdGFbN10qIGEzMSttYXRyaXguZGF0YVsxMV0qIGEzMittYXRyaXguZGF0YVsxNV0qIGEzMztcbiAgICAgICAgXG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH0gZWxzZSBpZiAoYSBpbnN0YW5jZW9mIFR1cGxlKVxuICAgICAge1xuICAgICAgICB2YXIgdD0gYSBhcyBUdXBsZTtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSggXG4gICAgICAgICB0aGlzLmRhdGFbMF0qdC54ICsgdGhpcy5kYXRhWzFdKnQueSt0aGlzLmRhdGFbMl0qdC56K3RoaXMuZGF0YVszXSp0LncsXG4gICAgICAgICB0aGlzLmRhdGFbNF0qdC54ICsgdGhpcy5kYXRhWzVdKnQueSt0aGlzLmRhdGFbNl0qdC56K3RoaXMuZGF0YVs3XSp0LncsIFxuICAgICAgICAgdGhpcy5kYXRhWzhdKnQueCArIHRoaXMuZGF0YVs5XSp0LnkrdGhpcy5kYXRhWzEwXSp0LnordGhpcy5kYXRhWzExXSp0LncsXG4gICAgICAgICB0aGlzLmRhdGFbMTJdKnQueCArIHRoaXMuZGF0YVsxM10qdC55K3RoaXMuZGF0YVsxNF0qdC56K3RoaXMuZGF0YVsxNV0qdC53XG4gICAgICAgICAgICk7XG4gICAgICB9IGVsc2VcbiAgICAgIHtcbiAgICAgICAgICAvL2EgaW5zdGFuY2VvZiBNYXRyaXggKG5vdCBzdXBwb3J0ZWQpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgyeDIgZXh0ZW5kcyBNYXRyaXhcbnsgICBcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeD86IEFycmF5PEFycmF5PG51bWJlcj4+KSBcbiAgICB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcbiAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoIT0yIHx8IG1hdHJpeFswXS5sZW5ndGghPTIgfHwgbWF0cml4WzFdLmxlbmd0aCE9MiApXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoMiAsMik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKTpudW1iZXJcbiAgICB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhWzBdKnRoaXMuZGF0YVszXS10aGlzLmRhdGFbMV0qdGhpcy5kYXRhWzJdO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeDN4MyBleHRlbmRzIE1hdHJpeFxueyAgIFxuXG4gICAgY29uc3RydWN0b3IobWF0cml4PzogQXJyYXk8QXJyYXk8bnVtYmVyPj4pIFxuICAgIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFxuICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGghPTMgfHwgbWF0cml4WzBdLmxlbmd0aCE9MyB8fCBtYXRyaXhbMV0ubGVuZ3RoIT0zIHx8IG1hdHJpeFsyXS5sZW5ndGghPTMpXG4gICAgICAgICB7XG4gICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICB9XG4gICAgICAgICAgc3VwZXIobWF0cml4KTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoMyAsMyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgIFxuICAgIGRldGVybWluYW50KCk6bnVtYmVyXG4gICAge1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzhdO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuICh0aGlzLmRhdGFbMF0qKGExMSphMjItYTEyKmEyMSkrdGhpcy5kYXRhWzFdKi0oYTEwKmEyMi1hMTIqYTIwKSt0aGlzLmRhdGFbMl0qKGExMCphMjEtYTExKmEyMCkpO1xuICAgIH1cblxufSIsImltcG9ydCB7VHVwbGV9IGZyb20gXCIuL3R1cGxlXCJcbmltcG9ydCB7Q29sb3J9IGZyb20gXCIuL2NvbG9yXCJcbmV4cG9ydCBjbGFzcyBQb2ludExpZ2h0XG57XG4gICAgcHVibGljIHBvc2l0b246VHVwbGU7XG4gICAgcHVibGljIGludGVuc2l0eTpDb2xvcjtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbj86VHVwbGUsaW50ZW5zaXR5PzpDb2xvcilcbiAgICB7XG4gICAgICB0aGlzLnBvc2l0b249cG9zaXRpb24/PyBUdXBsZS5wb2ludCgwLDAsMCk7XG4gICAgICB0aGlzLmludGVuc2l0eT1pbnRlbnNpdHk/PyBuZXcgQ29sb3IoMSwxLDEpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBNYXRyaXg0eDQgfSBmcm9tIFwiLi9tYXRyaXhcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcblxuZXhwb3J0IGNsYXNzIFJheVxue1xuICAgIG9yaWdpbjogVHVwbGU7XG4gICAgZGlyZWN0aW9uOlR1cGxlO1xuICAgIGNvbnN0cnVjdG9yKG9yaWdpbjpUdXBsZSxkaXJlY3Rpb246VHVwbGUpXG4gICAge1xuICAgICAgdGhpcy5vcmlnaW49b3JpZ2luO1xuICAgICAgdGhpcy5kaXJlY3Rpb249ZGlyZWN0aW9uO1xuICAgIH1cbiAgICBwb3NpdGlvbih0Om51bWJlcik6VHVwbGVcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5hZGQodGhpcy5kaXJlY3Rpb24ubXVsdGlwbHkodCkpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShtYXRyaXg6TWF0cml4NHg0KTpSYXlcbiAgICB7XG4gICAgIHZhciBkaXJlY3Rpb249IG1hdHJpeC5tdWx0aXBseSh0aGlzLmRpcmVjdGlvbik7XG4gICAgIHZhciBvcmlnaW49IG1hdHJpeC5tdWx0aXBseSh0aGlzLm9yaWdpbik7XG4gICAgIFxuICAgICB2YXIgcmF5PW5ldyBSYXkob3JpZ2luLGRpcmVjdGlvbik7XG4gICAgIHJldHVybiByYXk7XG4gICAgfVxufSIsIi8qKlxuICogTWVyZ2VzIDIgc29ydGVkIHJlZ2lvbnMgaW4gYW4gYXJyYXkgaW50byAxIHNvcnRlZCByZWdpb24gKGluLXBsYWNlIHdpdGhvdXQgZXh0cmEgbWVtb3J5LCBzdGFibGUpIFxuICogQHBhcmFtIGl0ZW1zIGFycmF5IHRvIG1lcmdlXG4gKiBAcGFyYW0gbGVmdCBsZWZ0IGFycmF5IGJvdW5kYXJ5IGluY2x1c2l2ZVxuICogQHBhcmFtIG1pZGRsZSBib3VuZGFyeSBiZXR3ZWVuIHJlZ2lvbnMgKGxlZnQgcmVnaW9uIGV4Y2x1c2l2ZSwgcmlnaHQgcmVnaW9uIGluY2x1c2l2ZSlcbiAqIEBwYXJhbSByaWdodCByaWdodCBhcnJheSBib3VuZGFyeSBleGNsdXNpdmVcbiAqL1xuIGZ1bmN0aW9uIG1lcmdlSW5wbGFjZTxUPihpdGVtczogVFtdLCBjb21wYXJlRm46IChhOiBULGI6IFQgKT0+IG51bWJlcixsZWZ0Om51bWJlcixtaWRkbGU6bnVtYmVyLCByaWdodDpudW1iZXIpIHtcbiAgICBpZiAocmlnaHQ9PW1pZGRsZSkgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSBsZWZ0OyBpIDwgbWlkZGxlO2krKykge1xuICAgICAgICAgXG4gICAgICAgIHZhciBtaW5SaWdodD1pdGVtc1ttaWRkbGVdO1xuICAgICAgICBpZihjb21wYXJlRm4obWluUmlnaHQsIGl0ZW1zW2ldKSA8MClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHRtcD1pdGVtc1tpXTtcbiAgICAgICAgICAgIGl0ZW1zW2ldID1taW5SaWdodDtcbiAgICAgICAgICAgIHZhciBuZXh0SXRlbTpUO1xuICAgICAgICAgICAgdmFyIG5leHQ9bWlkZGxlKzE7XG4gICAgICAgICAgICB3aGlsZShuZXh0PHJpZ2h0JiYgY29tcGFyZUZuKChuZXh0SXRlbT1pdGVtc1tuZXh0XSksdG1wKTwwKVxuICAgICAgICAgICAgeyAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGl0ZW1zW25leHQtMV09bmV4dEl0ZW07XG4gICAgICAgICAgICAgIG5leHQrKztcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICBpdGVtc1tuZXh0LTFdPXRtcDsgICAgICAgICAgICAgICAgXG4gICAgICAgIH0gICAgXG4gICAgfVxufVxuXG4vKipcbiAqIEluLXBsYWNlIGJvdHRvbSB1cCBtZXJnZSBzb3J0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVNvcnRJbnBsYWNlPFQ+KGl0ZW1zOiBUW10sIGNvbXBhcmVGbjogKGE6IFQsYjogVCApPT4gbnVtYmVyLGZyb20/Om51bWJlcix0bz86bnVtYmVyKSB7XG4gICAgZnJvbT8/PTA7XG4gICAgdG8/Pz1pdGVtcy5sZW5ndGg7XG4gICAgdmFyIG1heFN0ZXAgPSAodG8tZnJvbSkgKiAyOyAgIFxuICAgIGZvciAodmFyIHN0ZXAgPSAyOyBzdGVwIDwgbWF4U3RlcDtzdGVwKj0yKSB7XG4gICAgICAgIHZhciBvbGRTdGVwPXN0ZXAvMjtcbiAgICAgICAgZm9yICh2YXIgeCA9IGZyb207IHggPCB0bzsgeCArPSBzdGVwKSB7XG4gICAgICAgIFxuICAgICAgICAgbWVyZ2VJbnBsYWNlKGl0ZW1zLGNvbXBhcmVGbix4LCB4K29sZFN0ZXAsTWF0aC5taW4oeCtzdGVwLHRvKSApO1xuICAgICAgICB9ICAgICAgIFxuICAgIH1cblxuXG59XG5cbiIsImltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiXG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5pbXBvcnQgeyBJbnRlcnNlY3Rpb24sIEludGVyc2VjdGlvbnMgfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tIFwiLi9tYXRlcmlhbFwiO1xuaW1wb3J0IHsgSVdvcmxkT2JqZWN0IH0gZnJvbSBcIi4vd29ybGRcIjtcbmV4cG9ydCBjbGFzcyBTcGhlcmUgaW1wbGVtZW50cyBJV29ybGRPYmplY3Qge1xuXG4gIGlkOiBudW1iZXI7XG4gIHByaXZhdGUgaW52ZXJzZVRyYW5zZm9ybTogTWF0cml4NHg0O1xuICBwcml2YXRlIF90cmFuc2Zvcm06IE1hdHJpeDR4NDtcbiAgLyoqXG4gICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2Zvcm0oKTogTWF0cml4NHg0IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICB9XG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKHZhbHVlOiBNYXRyaXg0eDQpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm09dmFsdWUuaW52ZXJzZSgpO1xuICB9XG5cbiAgbWF0ZXJpYWw6IE1hdGVyaWFsO1xuICBwcml2YXRlIHN0YXRpYyB0ZW1wTWF0cml4MSA9IG5ldyBNYXRyaXg0eDQoKTtcblxuXG4gIGNvbnN0cnVjdG9yKGlkOiBudW1iZXIsIHRyYW5zZm9ybT86IE1hdHJpeDR4NCwgbWF0ZXJpYWw/OiBNYXRlcmlhbCkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSA/PyBNYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsID8/IG5ldyBNYXRlcmlhbCgpO1xuICB9XG4gIFxuICBpbnRlcnNlY3QocmF5OiBSYXksIGludGVyc2VjdGlvbnM6IEludGVyc2VjdGlvbnM9IG5ldyBJbnRlcnNlY3Rpb25zKCkpOiBJbnRlcnNlY3Rpb25zIHtcbiAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7XG4gICAgdmFyIHNwaGVyZTJyYXkgPSByYXkub3JpZ2luLnN1YnN0cmFjdChUdXBsZS5wb2ludCgwLCAwLCAwKSk7XG4gICAgdmFyIGEgPSByYXkuZGlyZWN0aW9uLmRvdChyYXkuZGlyZWN0aW9uKTtcbiAgICB2YXIgYiA9IDIgKiByYXkuZGlyZWN0aW9uLmRvdChzcGhlcmUycmF5KTtcbiAgICB2YXIgYyA9IHNwaGVyZTJyYXkuZG90KHNwaGVyZTJyYXkpIC0gMTtcbiAgICB2YXIgZGlzY3JpbWluYW50ID0gYiAqIGIgLSA0ICogYSAqIGM7XG4gICAgaWYgKGRpc2NyaW1pbmFudCA8IDApIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIHZhciBzcXJ0RGlzY3JpbWluYW50ID0gTWF0aC5zcXJ0KGRpc2NyaW1pbmFudCk7XG4gICAgdmFyIGkxID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICBpMS50ID0gKC1iIC0gc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgIGkxLm9iamVjdCA9IHRoaXM7XG4gICAgdmFyIGkyID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICBpMi50ID0gKC1iICsgc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgIGkyLm9iamVjdCA9IHRoaXM7XG5cbiAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgfVxuXG4gIG5vcm1hbEF0KHA6IFR1cGxlKTogVHVwbGUgeyAgIFxuICAgIHZhciBvYmplY3ROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkocCk7XG4gICAgb2JqZWN0Tm9ybWFsLncgPSAwO1xuICAgIHZhciB3b3JsZE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS50cmFuc3Bvc2UoU3BoZXJlLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgfVxufSIsImV4cG9ydCBjbGFzcyBUdXBsZSB7XG4gICAgcHVibGljIHg6IG51bWJlcjtcbiAgICBwdWJsaWMgeTogbnVtYmVyO1xuICAgIHB1YmxpYyB6OiBudW1iZXI7XG4gICAgcHVibGljIHc6IG51bWJlcjtcblxuICAgIHB1YmxpYyBzdGF0aWMgRVBTSUxPTjogbnVtYmVyID0gMC4wMDAwMTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHo/OiBudW1iZXIsIHc/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICAgICAgdGhpcy53ID0gdztcbiAgICB9XG4gICAgcHVibGljIGlzUG9pbnQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMTtcbiAgICB9XG4gICAgcHVibGljIGlzVmVjdG9yKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCh0dXBsZTogVHVwbGUpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICsgdHVwbGUueCwgdGhpcy55ICsgdHVwbGUueSwgdGhpcy56ICsgdHVwbGUueiwgdGhpcy53ICsgdHVwbGUudylcbiAgICB9XG4gICAgcHVibGljIG11bHRpcGx5KHNjYWxhcjogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIGRpdmlkZShzY2FsYXI6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBzdWJzdHJhY3QodHVwbGU6IFR1cGxlKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAtIHR1cGxlLngsIHRoaXMueSAtIHR1cGxlLnksIHRoaXMueiAtIHR1cGxlLnosIHRoaXMudyAtIHR1cGxlLncpXG4gICAgfVxuICAgIHB1YmxpYyBuZWdhdGUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncpXG4gICAgfVxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5tYWduaXR1ZGUoKSk7XG4gICAgfVxuICAgIHB1YmxpYyBtYWduaXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG4gICAgcHVibGljIGRvdCh0dXBsZTogVHVwbGUpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54ICogdHVwbGUueCArIHRoaXMueSAqIHR1cGxlLnkgKyB0aGlzLnogKiB0dXBsZS56ICsgdGhpcy53ICogdHVwbGUudztcbiAgICB9XG4gICAgcHVibGljIGNyb3NzKHR1cGxlOiBUdXBsZSk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIFR1cGxlLnZlY3Rvcih0aGlzLnkgKiB0dXBsZS56IC0gdGhpcy56ICogdHVwbGUueSxcbiAgICAgICAgICAgIHRoaXMueiAqIHR1cGxlLnggLSB0aGlzLnggKiB0dXBsZS56LFxuICAgICAgICAgICAgdGhpcy54ICogdHVwbGUueSAtIHRoaXMueSAqIHR1cGxlLnhcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgcmVmbGVjdChub3JtYWw6VHVwbGUgKTpUdXBsZVxuICAgIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnN0cmFjdChub3JtYWwubXVsdGlwbHkoMip0aGlzLmRvdChub3JtYWwpKSk7XG4gICAgfVxuICAgIHB1YmxpYyBlcXVhbHModHVwbGU6IFR1cGxlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnggLSB0dXBsZS54KSA8IFR1cGxlLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueSAtIHR1cGxlLnkpIDwgVHVwbGUuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy56IC0gdHVwbGUueikgPCBUdXBsZS5FUFNJTE9OO1xuICAgIH1cbiAgICBzdGF0aWMgcG9pbnQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAxKTtcbiAgICB9XG4gICAgc3RhdGljIHZlY3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDApO1xuICAgIH1cbiAgICBjbG9uZSgpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcbiAgICB9XG59IiwiXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL2NvbG9yXCI7XG5pbXBvcnQgeyBDb21wdXRhdGlvbnMgfSBmcm9tIFwiLi9jb21wdXRhdGlvbnNcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbnMgfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWxcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgUG9pbnRMaWdodCB9IGZyb20gXCIuL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcIi4vc3BoZXJlXCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBXb3JsZFxue1xuXG4gICAgbGlnaHQ6UG9pbnRMaWdodDtcbiAgICBvYmplY3RzOklXb3JsZE9iamVjdFtdO1xuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIHRlbXBJbnRlcnNlY3Rpb25zPSBuZXcgSW50ZXJzZWN0aW9ucygxMDApO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBzaGFkZUhpdChjb21wczogQ29tcHV0YXRpb25zKTpDb2xvciB7XG4gICAgICByZXR1cm4gY29tcHMub2JqZWN0Lm1hdGVyaWFsLmxpZ2h0aW5nKHRoaXMubGlnaHQsXG4gICAgICAgIGNvbXBzLnBvaW50LFxuICAgICAgICBjb21wcy5leWV2LFxuICAgICAgICBjb21wcy5ub3JtYWx2LFxuICAgICAgICB0aGlzLmlzU2hhZG93ZWQoY29tcHMub3ZlclBvaW50KVxuICAgICAgICApO1xuICAgIH0gIFxuICAgIGNvbG9yQXQocmF5OlJheSlcbiAgICB7XG4gICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgdGhpcy5pbnRlcnNlY3QocmF5LFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgIHZhciBpPVdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICAgaWYgKGk9PW51bGwpIHJldHVybiBDb2xvci5CTEFDSy5jbG9uZSgpO1xuICAgICAgdmFyIGNvbXA9Q29tcHV0YXRpb25zLnByZXBhcmUoaSxyYXkpO1xuICAgICAgcmV0dXJuIHRoaXMuc2hhZGVIaXQoY29tcCk7XG4gICAgfSBcblxuICAgIGludGVyc2VjdChyYXk6UmF5LCBpbnRlcnNlY3Rpb25zOiBJbnRlcnNlY3Rpb25zID1uZXcgSW50ZXJzZWN0aW9ucygpKTpJbnRlcnNlY3Rpb25zXG4gICAgeyAgICBcbiAgICAgIGZvciAodmFyIG8gb2YgdGhpcy5vYmplY3RzKVxuICAgICAge1xuICAgICAgICBvLmludGVyc2VjdChyYXksaW50ZXJzZWN0aW9ucylcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBpc1NoYWRvd2VkKHBvaW50OlR1cGxlKTpib29sZWFuXG4gICAge1xuICAgICB2YXIgdj0gdGhpcy5saWdodC5wb3NpdG9uLnN1YnN0cmFjdChwb2ludCk7XG4gICAgIHZhciBkaXN0YW5jZT0gdi5tYWduaXR1ZGUoKTtcbiAgICAgdmFyIGRpcmVjdGlvbj12Lm5vcm1hbGl6ZSgpO1xuICAgICB2YXIgcj0gbmV3IFJheShwb2ludCxkaXJlY3Rpb24pO1xuICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICB0aGlzLmludGVyc2VjdChyLFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgdmFyIGg9IFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICByZXR1cm4gKGghPW51bGwgJiYgaC50PCBkaXN0YW5jZSk7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXb3JsZE9iamVjdFxue1xuICBtYXRlcmlhbDpNYXRlcmlhbDsgXG4gIGludGVyc2VjdChyYXk6UmF5LGludGVyc2VjdGlvbnM/OiBJbnRlcnNlY3Rpb25zICk6SW50ZXJzZWN0aW9ucztcbiAgbm9ybWFsQXQocDpUdXBsZSk6VHVwbGU7XG4gICAgXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENhbnZhcyB9IGZyb20gXCJyYXl0cmFjZXIvY2FudmFzXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJyYXl0cmFjZXIvY29sb3JcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbiwgSW50ZXJzZWN0aW9ucyB9IGZyb20gXCJyYXl0cmFjZXIvaW50ZXJzZWN0aW9uXCI7XG5pbXBvcnQgeyBNYXRlcmlhbCB9IGZyb20gXCJyYXl0cmFjZXIvbWF0ZXJpYWxcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCJyYXl0cmFjZXIvbWF0cml4XCI7XG5pbXBvcnQgeyBQb2ludExpZ2h0IH0gZnJvbSBcInJheXRyYWNlci9wb2ludExpZ2h0XCI7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gXCJyYXl0cmFjZXIvd29ybGRcIjtcbmltcG9ydCB7IFNwaGVyZSB9IGZyb20gXCJyYXl0cmFjZXIvc3BoZXJlXCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCJyYXl0cmFjZXIvdHVwbGVcIjtcbmltcG9ydCB7IENhbWVyYSB9IGZyb20gXCJyYXl0cmFjZXIvY2FtZXJhXCI7XG5cblxuXG52YXIgd29ybGQ9IG5ldyBXb3JsZCgpO1xudmFyIGZsb29yID0gbmV3IFNwaGVyZSgwKTtcbmZsb29yLnRyYW5zZm9ybT1NYXRyaXg0eDQuc2NhbGluZygxMCwwLjAxLDEwKTtcbmZsb29yLm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoKTtcbmZsb29yLm1hdGVyaWFsLmNvbG9yPW5ldyBDb2xvcigxLDAuOSwwLjkpO1xuZmxvb3IubWF0ZXJpYWwuc3BlY3VsYXI9MDtcbnZhciBsZWZ0V2FsbD0gbmV3IFNwaGVyZSgxKTtcbmxlZnRXYWxsLnRyYW5zZm9ybT1NYXRyaXg0eDQudHJhbnNsYXRpb24oMCwwLDUpXG4gICAgLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoLU1hdGguUEkvNCkpXG4gICAgLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblgoTWF0aC5QSS8yKSlcbiAgICAubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMTAsMC4wMSwxMCkpOyBcbmxlZnRXYWxsLm1hdGVyaWFsPWZsb29yLm1hdGVyaWFsO1xuXG52YXIgcmlnaHRXYWxsPSBuZXcgU3BoZXJlKDIpO1xucmlnaHRXYWxsLnRyYW5zZm9ybT1NYXRyaXg0eDQudHJhbnNsYXRpb24oMCwwLDUpXG4ubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWShNYXRoLlBJLzQpKVxuLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblgoTWF0aC5QSS8yKSlcbi5tdWx0aXBseShNYXRyaXg0eDQuc2NhbGluZygxMCwwLjAxLDEwKSk7XG5yaWdodFdhbGwubWF0ZXJpYWw9Zmxvb3IubWF0ZXJpYWw7XG5cbnZhciBtaWRkbGU9bmV3IFNwaGVyZSgzKTtcbm1pZGRsZS50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKC0wLjUsMSwwLjUpXG5taWRkbGUubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xubWlkZGxlLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDEsMC41KTtcbm1pZGRsZS5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbm1pZGRsZS5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5cbnZhciByaWdodD1uZXcgU3BoZXJlKDQpO1xucmlnaHQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigxLjUsMC41LC0wLjUpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDAuNSwwLjUsMC41KSk7XG5yaWdodC5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKCk7XG5yaWdodC5tYXRlcmlhbC5jb2xvcj0gbmV3IENvbG9yKDAuNSwxLDAuMSk7XG5yaWdodC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbnJpZ2h0Lm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcblxudmFyIGxlZnQ9bmV3IFNwaGVyZSg1KTtcbmxlZnQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigtMS41LDAuMzMsLTAuNzUpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDAuMzMsMC4zMywwLjMzKSk7XG5sZWZ0Lm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoKTtcbmxlZnQubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigxLDAuOCwwLjEpO1xubGVmdC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbmxlZnQubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xuXG5cbndvcmxkLm9iamVjdHM9IFtsZWZ0LHJpZ2h0LG1pZGRsZSxyaWdodFdhbGwsbGVmdFdhbGwsZmxvb3JdO1xud29ybGQubGlnaHQ9IG5ldyBQb2ludExpZ2h0KFR1cGxlLnBvaW50KC0xMCwxMCwtMTApLENvbG9yLldISVRFLmNsb25lKCkpO1xuXG52YXIgY2FtZXJhPSBuZXcgQ2FtZXJhKDEwMjQsMTAyNCxNYXRoLlBJLzMsXG4gICAgTWF0cml4NHg0LnZpZXdUcmFuc2Zvcm0oVHVwbGUucG9pbnQoMCwxLjUsLTUpLFR1cGxlLnBvaW50KDAsMSwwKSxUdXBsZS52ZWN0b3IoMCwxLDApKVxuICAgICk7XG5cblxudmFyIHJheXRyYWNlckNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJheXRyYWNlckNhbnZhc1wiKTtcbnJheXRyYWNlckNhbnZhcy53aWR0aD1jYW1lcmEuaHNpemU7XG5yYXl0cmFjZXJDYW52YXMuaGVpZ2h0PWNhbWVyYS52c2l6ZTtcbnZhciByZW5kZXJEYXRhID0gY2FtZXJhLnJlbmRlcih3b3JsZCkudG9VaW50OENsYW1wZWRBcnJheSgpO1xudmFyIGltYWdlRGF0YSA9IG5ldyBJbWFnZURhdGEocmVuZGVyRGF0YSwgY2FtZXJhLmhzaXplLCBjYW1lcmEudnNpemUpO1xudmFyIGN0eCA9IHJheXRyYWNlckNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5jdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgMCwgMCk7XG5cblxuXG5cblxuXG5cblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9