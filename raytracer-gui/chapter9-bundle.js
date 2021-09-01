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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Color = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/src/constants.ts");
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
        return Math.abs(this.red - color.red) < constants_1.EPSILON
            && Math.abs(this.green - color.green) < constants_1.EPSILON
            && Math.abs(this.blue - color.blue) < constants_1.EPSILON;
    }
    clone() {
        return new Color(this.red, this.green, this.blue);
    }
}
exports.Color = Color;
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
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/src/constants.ts");
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
        comps.overPoint = comps.point.add(comps.normalv.multiply(constants_1.EPSILON));
        return comps;
    }
}
exports.Computations = Computations;


/***/ }),

/***/ "../raytracer/src/constants.ts":
/*!*************************************!*\
  !*** ../raytracer/src/constants.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EPSILON = void 0;
exports.EPSILON = 0.00001;


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
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/src/constants.ts");
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
                if (diff >= constants_1.EPSILON)
                    return false;
            }
        }
        return true;
    }
}
exports.Matrix = Matrix;
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

/***/ "../raytracer/src/plane.ts":
/*!*********************************!*\
  !*** ../raytracer/src/plane.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Plane = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/src/tuple.ts");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/src/intersection.ts");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/src/matrix.ts");
const material_1 = __webpack_require__(/*! ./material */ "../raytracer/src/material.ts");
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/src/constants.ts");
class Plane {
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
        this.localIntersect(ray, intersections);
        return intersections;
    }
    normalAt(p) {
        var objectNormal = tuple_1.Tuple.vector(0, 1, 0);
        var worldNormal = this.inverseTransform.transpose(Plane.tempMatrix1).multiply(objectNormal);
        worldNormal.w = 0;
        return worldNormal.normalize();
    }
    localIntersect(ray, intersections = new intersection_1.Intersections()) {
        if (Math.abs(ray.direction.y) < constants_1.EPSILON)
            return intersections;
        var i = intersections.add();
        i.object = this;
        i.t = -ray.origin.y / ray.direction.y;
        return intersections;
    }
}
exports.Plane = Plane;
Plane.tempMatrix1 = new matrix_1.Matrix4x4();


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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tuple = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/src/constants.ts");
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
        return Math.abs(this.x - tuple.x) < constants_1.EPSILON
            && Math.abs(this.y - tuple.y) < constants_1.EPSILON
            && Math.abs(this.z - tuple.z) < constants_1.EPSILON;
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
  !*** ./src/chapter9.ts ***!
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
const plane_1 = __webpack_require__(/*! raytracer/plane */ "../raytracer/src/plane.ts");
var world = new world_1.World();
var floor = new plane_1.Plane(0);
floor.material = new material_1.Material();
floor.material.color = new color_1.Color(0.9, 1.0, 0.9);
floor.material.specular = 0.5;
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
world.objects = [left, right, middle, floor];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksQ0FBQyxVQUFVLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2pDLENBQUM7SUFDRCxLQUFLO1FBRUosSUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDO1FBQ2YsR0FBRyxJQUFFLElBQUksQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDO1FBQ3JDLEdBQUcsSUFBRSxLQUFLLENBQUM7UUFDWCxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFDcEM7WUFDSSxHQUFHLElBQUUsQ0FBQyxDQUFDLEdBQUMsRUFBRSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsQ0FBQyxJQUFHLENBQUM7WUFDNUIsR0FBRyxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUNqRSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUN4RSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUks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TyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUzQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUdNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFbEYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBYyxFQUFDLFNBQWtCLElBQUksU0FBUyxFQUFFO1FBRXBFLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxHQUFHLEdBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDTSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQWMsRUFBQyxTQUFrQixJQUFJLFNBQVMsRUFBRTtRQUVwRSxJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksR0FBRyxHQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFjLEVBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFcEUsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLEdBQUcsR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFOUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFaEgsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQWdCRCxTQUFTLENBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFdkMsSUFBSSxJQUFXLENBQUM7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxPQUFPLENBQUMsU0FBa0IsSUFBSSxTQUFTLEVBQUU7UUFFckMsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLFdBQVcsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLFdBQVcsSUFBRSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbkcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNuRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ25HLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE9BQU8sTUFBTSxDQUFDO0lBRWxCLENBQUM7SUFDRCxXQUFXO1FBRVAsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBZ0I7UUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBS0QsUUFBUSxDQUFDLENBQUssRUFBQyxDQUFNO1FBRW5CLElBQUksQ0FBQyxZQUFZLFNBQVMsRUFDMUI7WUFDRSxJQUFJLE1BQU0sR0FBSSxDQUFDLGFBQUQsQ0FBQyxjQUFELENBQUMsR0FBSyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3BDLElBQUksTUFBTSxLQUFHLElBQUk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFFLENBQWMsQ0FBQztZQUMzQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFHbEcsT0FBTyxNQUFNLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxZQUFZLGFBQUssRUFDN0I7WUFDRSxJQUFJLENBQUMsR0FBRSxDQUFVLENBQUM7WUFDbEIsT0FBTyxJQUFJLGFBQUssQ0FDZixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3RFLENBQUM7U0FDTjthQUNEO1lBQ0kscUNBQXFDO1lBQ3JDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztTQUNyQjtJQUNILENBQUM7O0FBN1lMLDhCQStZQztBQTdZMEIseUJBQWUsR0FBRSxJQUFJLFNBQVMsQ0FDakQ7SUFDSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztDQUNaLENBQ0osQ0FBQztBQUNhLHVCQUFhLEdBQUUsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQXVZbEQsTUFBYSxTQUFVLFNBQVEsTUFBTTtJQUdqQyxZQUFZLE1BQTZCO1FBRXJDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUV6QixJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUNsRTtnQkFDSSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7YUFDckI7WUFDQSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDZjthQUFNO1lBQ0wsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUNELFdBQVc7UUFFVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNKO0FBcEJELDhCQW9CQztBQUVELE1BQWEsU0FBVSxTQUFRLE1BQU07SUFHakMsWUFBWSxNQUE2QjtRQUVyQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFFekIsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFFLENBQUMsRUFDekY7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2FBQ3JCO1lBQ0EsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2Y7YUFBTTtZQUNMLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDYjtJQUNMLENBQUM7SUFHRCxXQUFXO1FBRVAsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRyxDQUFDO0NBRUo7QUE5QkQsOEJBOEJDOzs7Ozs7Ozs7Ozs7OztBQ25tQkQsZ0ZBQWdDO0FBQ2hDLHFHQUE2RDtBQUM3RCxtRkFBcUM7QUFDckMseUZBQXNDO0FBRXRDLDRGQUFzQztBQUN0QyxNQUFhLEtBQUs7SUFvQmhCLFlBQVksRUFBVSxFQUFFLFNBQXFCLEVBQUUsUUFBbUI7UUFDaEUsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLGtCQUFTLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxhQUFSLFFBQVEsY0FBUixRQUFRLEdBQUksSUFBSSxtQkFBUSxFQUFFLENBQUM7SUFDN0MsQ0FBQztJQW5CRDs7T0FFRztJQUNILElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQUNELElBQVcsU0FBUyxDQUFDLEtBQWdCO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsR0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQVlELFNBQVMsQ0FBQyxHQUFRLEVBQUUsZ0JBQThCLElBQUksNEJBQWEsRUFBRTtRQUNuRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBQyxhQUFhLENBQUMsQ0FBQztRQUN2QyxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRUQsUUFBUSxDQUFDLENBQVE7UUFDZixJQUFJLFlBQVksR0FBRSxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVGLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxjQUFjLENBQUMsR0FBTyxFQUFDLGdCQUE4QixJQUFJLDRCQUFhLEVBQUU7UUFFdEUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsbUJBQU87WUFBRSxPQUFPLGFBQWEsQ0FBQztRQUM5RCxJQUFJLENBQUMsR0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFDLE1BQU0sR0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQzs7QUE5Q0gsc0JBK0NDO0FBOUJnQixpQkFBVyxHQUFHLElBQUksa0JBQVMsRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3hCL0MsZ0ZBQTZCO0FBQzdCLGdGQUE2QjtBQUM3QixNQUFhLFVBQVU7SUFJbkIsWUFBWSxRQUFlLEVBQUMsU0FBZ0I7UUFFMUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBRyxhQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBRyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FDSjtBQVRELGdDQVNDOzs7Ozs7Ozs7Ozs7OztBQ1JELE1BQWEsR0FBRztJQUlaLFlBQVksTUFBWSxFQUFDLFNBQWU7UUFFdEMsSUFBSSxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBQyxTQUFTLENBQUM7SUFDM0IsQ0FBQztJQUNELFFBQVEsQ0FBQyxDQUFRO1FBRWIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxTQUFTLENBQUMsTUFBZ0I7UUFFekIsSUFBSSxTQUFTLEdBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0MsSUFBSSxNQUFNLEdBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekMsSUFBSSxHQUFHLEdBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNKO0FBdEJELGtCQXNCQzs7Ozs7Ozs7Ozs7Ozs7QUN6QkQ7Ozs7OztHQU1HO0FBQ0YsU0FBUyxZQUFZLENBQUksS0FBVSxFQUFFLFNBQWdDLEVBQUMsSUFBVyxFQUFDLE1BQWEsRUFBRSxLQUFZO0lBQzFHLElBQUksS0FBSyxJQUFFLE1BQU07UUFBRSxPQUFPO0lBQzFCLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUU7UUFFL0IsSUFBSSxRQUFRLEdBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLElBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEVBQ25DO1lBQ0ksSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRSxRQUFRLENBQUM7WUFDbkIsSUFBSSxRQUFVLENBQUM7WUFDZixJQUFJLElBQUksR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1lBQ2xCLE9BQU0sSUFBSSxHQUFDLEtBQUssSUFBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLEdBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxFQUMxRDtnQkFDRSxLQUFLLENBQUMsSUFBSSxHQUFDLENBQUMsQ0FBQyxHQUFDLFFBQVEsQ0FBQztnQkFDdkIsSUFBSSxFQUFFLENBQUM7YUFDUjtZQUNELEtBQUssQ0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1NBQ3JCO0tBQ0o7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBSSxLQUFVLEVBQUUsU0FBZ0MsRUFBQyxJQUFZLEVBQUMsRUFBVTtJQUNwRyxJQUFJLGFBQUosSUFBSSxjQUFKLElBQUksSUFBSixJQUFJLEdBQUcsQ0FBQyxFQUFDO0lBQ1QsRUFBRSxhQUFGLEVBQUUsY0FBRixFQUFFLElBQUYsRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUM7SUFDbEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxPQUFPLEVBQUMsSUFBSSxJQUFFLENBQUMsRUFBRTtRQUN2QyxJQUFJLE9BQU8sR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDO1FBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUVyQyxZQUFZLENBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE9BQU8sRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxJQUFJLEVBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztTQUNoRTtLQUNKO0FBR0wsQ0FBQztBQWJELDRDQWFDOzs7Ozs7Ozs7Ozs7OztBQzNDRCxnRkFBZ0M7QUFDaEMscUdBQTZEO0FBQzdELG1GQUFxQztBQUNyQyx5RkFBc0M7QUFFdEMsTUFBYSxNQUFNO0lBb0JqQixZQUFZLEVBQVUsRUFBRSxTQUFxQixFQUFFLFFBQW1CO1FBQ2hFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxrQkFBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsYUFBUixRQUFRLGNBQVIsUUFBUSxHQUFJLElBQUksbUJBQVEsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFuQkQ7O09BRUc7SUFDSCxJQUFXLFNBQVM7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFDRCxJQUFXLFNBQVMsQ0FBQyxLQUFnQjtRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsZ0JBQWdCLEdBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFZRCxTQUFTLENBQUMsR0FBUSxFQUFFLGdCQUE4QixJQUFJLDRCQUFhLEVBQUU7UUFDbkUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLFlBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLElBQUksWUFBWSxHQUFHLENBQUM7WUFBRSxPQUFPLGFBQWEsQ0FBQztRQUMzQyxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVqQixPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRUQsUUFBUSxDQUFDLENBQVE7UUFDZixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RixXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQixPQUFPLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxDQUFDOztBQW5ESCx3QkFvREM7QUFuQ2dCLGtCQUFXLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDdkIvQyw0RkFBc0M7QUFFdEMsTUFBYSxLQUFLO0lBU2QsWUFBWSxDQUFVLEVBQUUsQ0FBVSxFQUFFLENBQVUsRUFBRSxDQUFVO1FBQ3RELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUNNLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFDTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRU0sR0FBRyxDQUFDLEtBQVk7UUFDbkIsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUNNLFFBQVEsQ0FBQyxNQUFjO1FBQzFCLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDeEYsQ0FBQztJQUNNLE1BQU0sQ0FBQyxNQUFjO1FBQ3hCLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDeEYsQ0FBQztJQUNNLFNBQVMsQ0FBQyxLQUFZO1FBQ3pCLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFDTSxNQUFNO1FBQ1QsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUNNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUNNLEdBQUcsQ0FBQyxLQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFDTSxLQUFLLENBQUMsS0FBWTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFDbkQsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFDbkMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FDdEMsQ0FBQztJQUNOLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBWTtRQUVsQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNNLE1BQU0sQ0FBQyxLQUFZO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxtQkFBTztlQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLG1CQUFPO2VBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsbUJBQU8sQ0FBQztJQUNoRCxDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDeEMsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDekMsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsS0FBSztRQUNELE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDSjtBQXZFRCxzQkF1RUM7Ozs7Ozs7Ozs7Ozs7O0FDeEVELGdGQUFnQztBQUNoQyxxR0FBOEM7QUFDOUMscUdBQStDO0FBSS9DLDBFQUE0QjtBQUk1QixNQUFhLEtBQUs7SUFRZDtJQUdBLENBQUM7SUFDRCxRQUFRLENBQUMsS0FBbUI7UUFDMUIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFDOUMsS0FBSyxDQUFDLEtBQUssRUFDWCxLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssQ0FBQyxPQUFPLEVBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQy9CLENBQUM7SUFDTixDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQU87UUFFYixLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEdBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFFLElBQUk7WUFBRSxPQUFPLGFBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEMsSUFBSSxJQUFJLEdBQUMsMkJBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQU8sRUFBRSxnQkFBOEIsSUFBSSw0QkFBYSxFQUFFO1FBRWxFLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFDMUI7WUFDRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBQyxhQUFhLENBQUM7U0FDL0I7UUFDRCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBQ0QsVUFBVSxDQUFDLEtBQVc7UUFFckIsSUFBSSxDQUFDLEdBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLElBQUksUUFBUSxHQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM1QixJQUFJLFNBQVMsR0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUUsSUFBSSxTQUFHLENBQUMsS0FBSyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckMsT0FBTyxDQUFDLENBQUMsSUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxRQUFRLENBQUMsQ0FBQztJQUNuQyxDQUFDOztBQWhETCxzQkFpREM7QUEzQ2tCLHVCQUFpQixHQUFFLElBQUksNEJBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7OztVQ2pCN0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7O0FDckJBLHdGQUF3QztBQUV4QyxpR0FBOEM7QUFDOUMsMkZBQTZDO0FBQzdDLHVHQUFrRDtBQUNsRCx3RkFBd0M7QUFDeEMsMkZBQTBDO0FBQzFDLHdGQUF3QztBQUN4QywyRkFBMEM7QUFDMUMsd0ZBQXdDO0FBR3hDLElBQUksS0FBSyxHQUFFLElBQUksYUFBSyxFQUFFLENBQUM7QUFDdkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsS0FBSyxDQUFDLFFBQVEsR0FBRSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUMvQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxJQUFJLGFBQUssQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFDLEdBQUcsQ0FBQztBQUc1QixJQUFJLE1BQU0sR0FBQyxJQUFJLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixNQUFNLENBQUMsU0FBUyxHQUFDLGtCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUM7QUFDbEQsTUFBTSxDQUFDLFFBQVEsR0FBRSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUNoQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRSxJQUFJLGFBQUssQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLEdBQUcsQ0FBQztBQUM1QixNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBQyxHQUFHLENBQUM7QUFFN0IsSUFBSSxLQUFLLEdBQUMsSUFBSSxlQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsS0FBSyxDQUFDLFNBQVMsR0FBQyxrQkFBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3RixLQUFLLENBQUMsUUFBUSxHQUFFLElBQUksbUJBQVEsRUFBRSxDQUFDO0FBQy9CLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFFLElBQUksYUFBSyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsR0FBRyxDQUFDO0FBQzNCLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFDLEdBQUcsQ0FBQztBQUU1QixJQUFJLElBQUksR0FBQyxJQUFJLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixJQUFJLENBQUMsU0FBUyxHQUFDLGtCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEcsSUFBSSxDQUFDLFFBQVEsR0FBRSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFDLEdBQUcsQ0FBQztBQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBQyxHQUFHLENBQUM7QUFHM0IsS0FBSyxDQUFDLE9BQU8sR0FBRSxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLEtBQUssQ0FBQyxLQUFLLEdBQUUsSUFBSSx1QkFBVSxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsYUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRXpFLElBQUksTUFBTSxHQUFFLElBQUksZUFBTSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLEVBQ3RDLGtCQUFTLENBQUMsYUFBYSxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxhQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDcEYsQ0FBQztBQUdOLElBQUksZUFBZSxHQUFzQixRQUFRLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEYsZUFBZSxDQUFDLEtBQUssR0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ25DLGVBQWUsQ0FBQyxNQUFNLEdBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNwQyxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RFLElBQUksR0FBRyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2NhbWVyYS50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY2FudmFzLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb2xsZWN0aW9uLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb2xvci50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY29tcHV0YXRpb25zLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2ludGVyc2VjdGlvbi50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvbWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL21hdHJpeC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvcGxhbmUudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3BvaW50TGlnaHQudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3JheS50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvc29ydC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvc3BoZXJlLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy90dXBsZS50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvd29ybGQudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4vc3JjL2NoYXB0ZXI5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbnZhcyB9IGZyb20gXCIuL2NhbnZhc1wiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcIi4vbWF0cml4XCI7XG5pbXBvcnQgeyBSYXkgfSBmcm9tIFwiLi9yYXlcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSBcIi4vd29ybGRcIjtcblxuZXhwb3J0IGNsYXNzIENhbWVyYVxue1xuICB2c2l6ZTpudW1iZXI7XG4gIGhzaXplOm51bWJlcjtcbiAgZmllbGRPZlZpZXc6bnVtYmVyO1xuXG4gIHByaXZhdGUgX2hhbGZXaWR0aDogbnVtYmVyO1xuICBwdWJsaWMgZ2V0IGhhbGZXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gIH1cblxuICBwcml2YXRlIF9oYWxmSGVpZ2h0OiBudW1iZXI7XG4gIHB1YmxpYyBnZXQgaGFsZmhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gIH1cblxuICBwcml2YXRlIF9waXhlbFNpemU6IG51bWJlcjtcbiAgcHVibGljIGdldCBwaXhlbFNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcGl4ZWxTaXplO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlVHJhbnNmb3JtOiBNYXRyaXg0eDQ7IFxuICBwcml2YXRlIF90cmFuc2Zvcm06IE1hdHJpeDR4NDsgICAgXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNmb3JtKCk6IE1hdHJpeDR4NCB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgfVxuICBwdWJsaWMgc2V0IHRyYW5zZm9ybSh2YWx1ZTogTWF0cml4NHg0KSB7XG4gICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtPXZhbHVlLmludmVyc2UoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGhzaXplOm51bWJlcix2c2l6ZTpudW1iZXIsIGZpZWxkT2ZWaWV3Om51bWJlcix0cmFuc2Zvcm0/Ok1hdHJpeDR4NCkgIFxuICB7XG4gICAgICB0aGlzLmhzaXplPWhzaXplO1xuICAgICAgdGhpcy52c2l6ZT12c2l6ZTtcbiAgICAgIHRoaXMuZmllbGRPZlZpZXc9ZmllbGRPZlZpZXc7XG4gICAgICB0aGlzLnRyYW5zZm9ybT0gdHJhbnNmb3JtID8/IE1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICBcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlY2FsY3VsYXRlIGRlcml2ZWQgdmFsdWVzXG4gICAqL1xuICB1cGRhdGUoKVxuICB7XG4gICAgdmFyIGhhbGZWaWV3PU1hdGgudGFuKHRoaXMuZmllbGRPZlZpZXcvMik7XG4gICAgdmFyIGFzcGVjdD10aGlzLmhzaXplL3RoaXMudnNpemU7XG4gICAgaWYgKGFzcGVjdCA+PTEpXG4gICAge1xuICAgICAgdGhpcy5faGFsZldpZHRoPWhhbGZWaWV3O1xuICAgICAgdGhpcy5faGFsZkhlaWdodD1oYWxmVmlldy9hc3BlY3Q7XG4gICAgfSBlbHNlXG4gICAge1xuICAgICAgdGhpcy5faGFsZldpZHRoPWhhbGZWaWV3KmFzcGVjdDtcbiAgICAgIHRoaXMuX2hhbGZIZWlnaHQ9aGFsZlZpZXc7XG4gICAgfVxuICAgIHRoaXMuX3BpeGVsU2l6ZT0odGhpcy5faGFsZldpZHRoKjIpIC90aGlzLmhzaXplO1xuICAgIFxuICB9XG4gIFxuICByYXlGb3JQaXhlbCh4Om51bWJlcix5Om51bWJlcik6UmF5XG4gIHtcblxuICAgIHZhciB4T2Zmc2V0PSh4KzAuNSkqdGhpcy5fcGl4ZWxTaXplO1xuICAgIHZhciB5T2Zmc2V0PSh5KzAuNSkqdGhpcy5fcGl4ZWxTaXplO1xuXG4gICAgdmFyIHdvcmxkWD10aGlzLl9oYWxmV2lkdGgteE9mZnNldDtcbiAgICB2YXIgd29ybGRZPXRoaXMuX2hhbGZIZWlnaHQteU9mZnNldDtcbiAgICBcbiAgICB2YXIgcGl4ZWw9dGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KFR1cGxlLnBvaW50KHdvcmxkWCx3b3JsZFksLTEpKTtcbiAgICB2YXIgb3JpZ2luPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkoVHVwbGUucG9pbnQoMCwwLDApKTtcbiAgICB2YXIgZGlyZWN0aW9uPXBpeGVsLnN1YnN0cmFjdChvcmlnaW4pLm5vcm1hbGl6ZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBSYXkob3JpZ2luLGRpcmVjdGlvbik7XG4gIH1cblxuICByZW5kZXIod29ybGQ6V29ybGQpOkNhbnZhc1xuICB7XG4gICAgdmFyIGltYWdlID0gbmV3IENhbnZhcyh0aGlzLmhzaXplLHRoaXMudnNpemUpO1xuICAgIGZvciAodmFyIHk9IDA7eTwgdGhpcy52c2l6ZTt5KyspXG4gICAge1xuICAgICAgZm9yICh2YXIgeD0gMDt4PCB0aGlzLmhzaXplO3grKylcbiAgICAgIHtcbiAgICAgICAgdmFyIHJheSA9IHRoaXMucmF5Rm9yUGl4ZWwoeCx5KTtcbiAgICAgICAgdmFyIGNvbG9yPSB3b3JsZC5jb2xvckF0KHJheSk7XG4gICAgICAgIGltYWdlLndyaXRlUGl4ZWwoeCx5LGNvbG9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9XG5cbn0iLCJpbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL2NvbG9yXCI7XG5cbmV4cG9ydCBjbGFzcyBDYW52YXMgXG57ICBcbiAgIGRhdGE6RmxvYXQ2NEFycmF5O1xuICAgd2lkdGg6bnVtYmVyO1xuICAgaGVpZ2h0Om51bWJlcjtcblxuICAgY29uc3RydWN0b3Iod2lkdGg6bnVtYmVyLGhlaWdodDpudW1iZXIpXG4gICB7XG4gICAgIHRoaXMud2lkdGg9d2lkdGg7XG4gICAgIHRoaXMuaGVpZ2h0PWhlaWdodDtcbiAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0NjRBcnJheSh3aWR0aCpoZWlnaHQqMyk7XG4gICAgIGZvciAodmFyIGk9MDtpPHRoaXMuZGF0YS5sZW5ndGg7aSsrKVxuICAgICB7XG4gICAgICAgICB0aGlzLmRhdGFbaV09MDtcbiAgICAgfVxuICAgfVxuXG4gICByZWFkUGl4ZWwoeDpudW1iZXIseTpudW1iZXIpOkNvbG9yXG4gICB7XG4gICAgIGlmICh4PDB8fCB4Pj10aGlzLndpZHRoIHx8IHk8MCB8fCB5Pj0gdGhpcy5oZWlnaHQpIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgIHZhciBwaXhlbEluZGV4PSBNYXRoLmZsb29yKHkpKiB0aGlzLndpZHRoKjMrTWF0aC5mbG9vcih4KSozO1xuICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMuZGF0YVtwaXhlbEluZGV4XSx0aGlzLmRhdGFbcGl4ZWxJbmRleCArMV0sdGhpcy5kYXRhW3BpeGVsSW5kZXggKzJdKTtcbiAgIH1cbiAgIHdyaXRlUGl4ZWwgKHg6bnVtYmVyLHk6bnVtYmVyLGM6Q29sb3IpOnZvaWRcbiAgIHtcbiAgICAgaWYgKHg8MHx8IHg+PXRoaXMud2lkdGggfHwgeTwwIHx8IHk+PSB0aGlzLmhlaWdodCkgcmV0dXJuO1xuICAgICB2YXIgcGl4ZWxJbmRleD0gTWF0aC5mbG9vcih5KSogdGhpcy53aWR0aCozK01hdGguZmxvb3IoeCkqMztcbiAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXhdPWMucmVkO1xuICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleCsxXT1jLmdyZWVuO1xuICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleCsyXT1jLmJsdWU7XG4gICB9XG4gICB0b1BwbSgpOnN0cmluZ1xuICAge1xuICAgIHZhciBwcG09XCJQM1xcblwiO1xuICAgIHBwbSs9dGhpcy53aWR0aCtcIiBcIit0aGlzLmhlaWdodCtcIlxcblwiO1xuICAgIHBwbSs9XCIyNTVcIjtcbiAgICBmb3IgKHZhciBpPTA7aTx0aGlzLmRhdGEubGVuZ3RoO2krPTMpXG4gICAge1xuICAgICAgICBwcG0rPShpJTE1PT0wKSA/ICBcIlxcblwiIDpcIiBcIjtcbiAgICAgICAgcHBtKz0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaV0qMjU1KSwyNTUpLDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgICsgXCIgXCIrTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSsxXSoyNTUpLDI1NSksMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgK1wiIFwiK01hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2krMl0qMjU1KSwyNTUpLDApLnRvU3RyaW5nKCk7IFxuXG4gICAgfVxuICAgIHBwbSs9XCJcXG5cIjtcbiAgICByZXR1cm4gcHBtO1xuICAgfVxuICAgdG9VaW50OENsYW1wZWRBcnJheSgpOlVpbnQ4Q2xhbXBlZEFycmF5XG4gICB7XG4gICAgIHZhciBhcnIgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy53aWR0aCp0aGlzLmhlaWdodCo0KTtcbiAgICAgdmFyIGFyckluZGV4PTA7XG4gICAgIGZvciAodmFyIGk9MDtpPHRoaXMuZGF0YS5sZW5ndGg7aSs9MylcbiAgICAgeyAgICAgICAgXG4gICAgICAgICBhcnJbYXJySW5kZXhdPSB0aGlzLmRhdGFbaV0qMjU1O1xuICAgICAgICAgYXJyW2FyckluZGV4KzFdPSAgdGhpcy5kYXRhW2krMV0qMjU1O1xuICAgICAgICAgYXJyW2FyckluZGV4KzJdPSB0aGlzLmRhdGFbaSsyXSoyNTU7XG4gICAgICAgICBhcnJbYXJySW5kZXgrM109IDI1NTtcbiAgICAgICAgIGFyckluZGV4Kz00OyBcbiAgICAgfVxuICAgICBcbiAgICAgcmV0dXJuIGFycjtcbiAgIH1cbn0iLCJcbi8qKlxuICogT2JqZWN0IHBvb2wgdGhhdCB3aWxsIG1pbmltaXplIGdhcmJhZ2UgY29sbGVjdGlvbiB1c2FnZVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgT2JqZWN0UG9vbDxUPlxue1xuICAgIHByb3RlY3RlZCBpdGVtczpUW107XG4gICAgcHJvdGVjdGVkIF9sZW5ndGg6bnVtYmVyO1xuICAgIHByb3RlY3RlZCBpbmRleE1hcDpNYXA8VCxudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IoYXJyYXlMZW5ndGg6bnVtYmVyPTApXG4gICAge1xuICAgICAgdGhpcy5pdGVtcz1uZXcgQXJyYXk8VD4oYXJyYXlMZW5ndGgpO1xuICAgICAgdGhpcy5pbmRleE1hcD0gbmV3IE1hcDxULG51bWJlcj4oKTtcbiAgICAgIHRoaXMuX2xlbmd0aD0wO1xuICAgICAgZm9yICh2YXIgaT0wO2k8YXJyYXlMZW5ndGg7aSsrKVxuICAgICAge1xuICAgICAgICB2YXIgbmV3SXRlbT10aGlzLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChuZXdJdGVtLGkpO1xuICAgICAgICB0aGlzLml0ZW1zW2ldPW5ld0l0ZW07XG4gICAgICB9XG4gICAgICBcbiAgICB9XG5cbiAgICBpbmRleE9mKGl0ZW06VCk6bnVtYmVyXG4gICAge1xuICAgICB2YXIgaT0gdGhpcy5pbmRleE1hcC5nZXQoaXRlbSk7XG4gICAgIHJldHVybiAoaT09PXVuZGVmaW5lZCB8fCBpPj10aGlzLl9sZW5ndGgpICA/IC0xOiBpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYW4gaXRlbSBhbmQgZmlsbHMgdGhlIGdhcCB3aXRoIHRoZSBsYXN0IGl0ZW0uXG4gICAgICogUmVtb3ZlZCBpdGVtcyB3aWxsIGJlIHJldXNlZCB3aGVuIGNhbGxpbmcgLmFkZCgpIFxuICAgICovXG4gICAgcmVtb3ZlKGl0ZW06VCk6dm9pZDtcbiAgICByZW1vdmUoaW5kZXg6bnVtYmVyKTp2b2lkO1xuICAgIHB1YmxpYyByZW1vdmUoYTphbnkpOnZvaWRcbiAgICB7IFxuICAgICAgICB2YXIgaW5kZXg6bnVtYmVyO1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE9iamVjdClcbiAgICAgICAge1xuICAgICAgICAgICAgaW5kZXg9dGhpcy5pbmRleE1hcC5nZXQoYSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgaW5kZXg9IE1hdGguZmxvb3IoYSBhcyBudW1iZXIpOyBcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPDAgfHwgaW5kZXggPj10aGlzLl9sZW5ndGgpIHJldHVybjtcbiAgICAgICAgdGhpcy5fbGVuZ3RoLS07ICAgICAgICBcbiAgICAgICAgdmFyIHJlbW92ZUl0ZW09ICB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgdmFyIGxhc3RJdGVtPXRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoXTtcbiAgICAgICAgdGhpcy5pdGVtc1tpbmRleF0gPSBsYXN0SXRlbTtcbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdPXJlbW92ZUl0ZW07XG4gICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KHJlbW92ZUl0ZW0sdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobGFzdEl0ZW0saW5kZXgpO1xuICAgIH1cbiAgICBwdWJsaWMgY2xlYXIoKVxuICAgIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoPTA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiB1bnVzZWQgaXRlbSBvciBjcmVhdGVzIGEgbmV3IG9uZSwgaWYgbm8gdW51c2VkIGl0ZW0gYXZhaWxhYmxlXG4gICAgKi9cbiAgICBwdWJsaWMgYWRkKCk6VFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlbXMubGVuZ3RoPT10aGlzLl9sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtPXRoaXMuY3JlYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwLnNldChuZXdJdGVtLHRoaXMuX2xlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9sZW5ndGg9dGhpcy5pdGVtcy5wdXNoKG5ld0l0ZW0pOyAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aCsrXTsgIFxuICAgIH1cbiAgICBwdWJsaWMgZ2V0KGluZGV4Om51bWJlcik6VCB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgaWYgKGluZGV4ID49dGhpcy5fbGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkOyAgIFxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1tpbmRleF07XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpIDogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG5cbiAgICBcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlKCk6VDtcbn1cblxuIiwiaW1wb3J0IHsgRVBTSUxPTiB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5leHBvcnQgY2xhc3MgQ29sb3Ige1xuICAgIHB1YmxpYyByZWQ6IG51bWJlcjtcbiAgICBwdWJsaWMgZ3JlZW46IG51bWJlcjtcbiAgICBwdWJsaWMgYmx1ZTogbnVtYmVyOyAgXG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJMQUNLPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigwLDAsMCkpO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgV0hJVEU9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDEsMSwxKSk7XG4gICAgY29uc3RydWN0b3IoKVxuICAgIGNvbnN0cnVjdG9yKHJlZDogbnVtYmVyLCBncmVlbjogbnVtYmVyLCBibHVlOiBudW1iZXIpXG4gICAgY29uc3RydWN0b3IocmVkPzogbnVtYmVyLCBncmVlbj86IG51bWJlciwgYmx1ZT86IG51bWJlcikge1xuICAgICAgICB0aGlzLnJlZCA9IHJlZDtcbiAgICAgICAgdGhpcy5ncmVlbiA9IGdyZWVuO1xuICAgICAgICB0aGlzLmJsdWUgPSBibHVlOyAgICAgICAgXG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWRkKGNvbG9yOiBDb2xvcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCArIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiArIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgKyBjb2xvci5ibHVlKVxuICAgIH1cbiAgICBwdWJsaWMgbXVsdGlwbHkoc2NhbGFyOiBudW1iZXIpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKiBzY2FsYXIsIHRoaXMuZ3JlZW4gKiBzY2FsYXIsIHRoaXMuYmx1ZSAqIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIGRpdmlkZShzY2FsYXI6IG51bWJlcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAvIHNjYWxhciwgdGhpcy5ncmVlbiAvIHNjYWxhciwgdGhpcy5ibHVlIC8gc2NhbGFyKVxuICAgIH1cbiAgICBwdWJsaWMgc3Vic3RyYWN0KGNvbG9yOiBDb2xvcik6IENvbG9yIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAtIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgLSBjb2xvci5ibHVlKVxuICAgIH1cbiAgICBwdWJsaWMgaGFkYW1hcmRQcm9kdWN0KGNvbG9yOkNvbG9yKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCpjb2xvci5yZWQsdGhpcy5ncmVlbipjb2xvci5ncmVlbix0aGlzLmJsdWUqY29sb3IuYmx1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGVxdWFscyhjb2xvcjogQ29sb3IpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMucmVkIC0gY29sb3IucmVkKSA8IEVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMuZ3JlZW4gLSBjb2xvci5ncmVlbikgPCBFUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmJsdWUgLSBjb2xvci5ibHVlKSA8IEVQU0lMT047XG4gICAgfVxuICAgIGNsb25lKClcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQsdGhpcy5ncmVlbix0aGlzLmJsdWUpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBFUFNJTE9OIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBJbnRlcnNlY3Rpb24gfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuaW1wb3J0IHsgSVNoYXBlIH0gZnJvbSBcIi4vd29ybGRcIjtcblxuZXhwb3J0IGNsYXNzIENvbXB1dGF0aW9uc1xue1xuICAgIHQ6IG51bWJlcjtcbiAgICBvYmplY3Q6IElTaGFwZTtcbiAgICBwb2ludDogVHVwbGU7XG4gICAgZXlldjpUdXBsZTtcbiAgICBub3JtYWx2OiBUdXBsZTtcbiAgICBpbnNpZGU6IGJvb2xlYW47XG4gICAgb3ZlclBvaW50OiBUdXBsZTtcbiAgICBwdWJsaWMgc3RhdGljIHByZXBhcmUoaW50ZXJzZWN0aW9uOkludGVyc2VjdGlvbixyYXk6UmF5ICk6Q29tcHV0YXRpb25zXG4gICAge1xuICAgICAgdmFyIGNvbXBzID0gbmV3IENvbXB1dGF0aW9ucygpO1xuICAgICAgY29tcHMudD1pbnRlcnNlY3Rpb24udDtcbiAgICAgIGNvbXBzLm9iamVjdD1pbnRlcnNlY3Rpb24ub2JqZWN0O1xuXG4gICAgICBjb21wcy5wb2ludD1yYXkucG9zaXRpb24oY29tcHMudCk7XG4gICAgICBjb21wcy5leWV2PXJheS5kaXJlY3Rpb24ubmVnYXRlKCk7XG4gICAgICBjb21wcy5ub3JtYWx2PSBjb21wcy5vYmplY3Qubm9ybWFsQXQoY29tcHMucG9pbnQpO1xuICAgICAgaWYgKGNvbXBzLm5vcm1hbHYuZG90KGNvbXBzLmV5ZXYpPDApXG4gICAgICB7XG4gICAgICAgIGNvbXBzLmluc2lkZT10cnVlO1xuICAgICAgICBjb21wcy5ub3JtYWx2PWNvbXBzLm5vcm1hbHYubmVnYXRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wcy5pbnNpZGU9ZmFsc2U7XG4gICAgICB9XG4gICAgICBjb21wcy5vdmVyUG9pbnQ9Y29tcHMucG9pbnQuYWRkKGNvbXBzLm5vcm1hbHYubXVsdGlwbHkoRVBTSUxPTikpO1xuXG4gICAgICByZXR1cm4gY29tcHM7XG4gICAgfVxuXG4gICAgXG4gICAgY29uc3RydWN0b3IoKVxuICAgIHtcblxuICAgIH1cblxufSIsImV4cG9ydCB2YXIgRVBTSUxPTjogbnVtYmVyID0gMC4wMDAwMTsiLCJpbXBvcnQgeyBPYmplY3RQb29sIH0gZnJvbSBcIi4vY29sbGVjdGlvblwiXG5pbXBvcnQge21lcmdlU29ydElucGxhY2V9IGZyb20gXCIuL3NvcnRcIlxuaW1wb3J0IHsgSVNoYXBlIH0gZnJvbSBcIi4vd29ybGRcIjtcbmV4cG9ydCBjbGFzcyBJbnRlcnNlY3Rpb24ge1xuICAgIHQ6IG51bWJlcjtcbiAgICBvYmplY3Q6IElTaGFwZTtcbiAgICBjb25zdHJ1Y3Rvcih0OiBudW1iZXIsIG9iamVjdDogYW55KSB7XG5cbiAgICAgICAgdGhpcy50ID0gdDtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb246IEludGVyc2VjdGlvbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy50ID09IGludGVyc2VjdGlvbi50ICYmIHRoaXMub2JqZWN0ID09PSBpbnRlcnNlY3Rpb24ub2JqZWN0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludGVyc2VjdGlvbnMgZXh0ZW5kcyBPYmplY3RQb29sPEludGVyc2VjdGlvbj4ge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgc29ydEludGVyc2VjdGlvbihhOkludGVyc2VjdGlvbiAsYjpJbnRlcnNlY3Rpb24pOm51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIGEudC1iLnQ7XG4gICAgfVxuXG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlKCk6IEludGVyc2VjdGlvbiB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uKDAsIG51bGwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaGl0LCByZWdhcmRsZXNzIG9mIHNvcnRcbiAgICAqL1xuICAgIGhpdCgpOiBJbnRlcnNlY3Rpb24ge1xuICAgICAgICB2YXIgaGl0OiBJbnRlcnNlY3Rpb24gPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoKGhpdCA9PSBudWxsIHx8IGl0ZW0udCA8IGhpdC50KSAmJiBpdGVtLnQgPiAwKSBoaXQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxuICAgIHNvcnQoKTogdm9pZCB7ICAgICAgIFxuICAgICAgICBtZXJnZVNvcnRJbnBsYWNlKHRoaXMuaXRlbXMsSW50ZXJzZWN0aW9ucy5zb3J0SW50ZXJzZWN0aW9uLDAsdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGhpcy5pdGVtc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbnM6IEludGVyc2VjdGlvbnMpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCAhPSBpbnRlcnNlY3Rpb25zLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXRlbXNbaV0uZXF1YWxzKGludGVyc2VjdGlvbnMuaXRlbXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbG9yIH0gZnJvbSBcIi4vY29sb3JcIjtcbmltcG9ydCB7IFBvaW50TGlnaHQgfSBmcm9tIFwiLi9wb2ludExpZ2h0XCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRlcmlhbFxue1xuICAgIGNvbG9yOkNvbG9yPUNvbG9yLldISVRFLmNsb25lKCk7XG4gICAgYW1iaWVudDpudW1iZXI9MC4xO1xuICAgIGRpZmZ1c2U6bnVtYmVyPTAuOTtcbiAgICBzcGVjdWxhcjpudW1iZXI9MC45O1xuICAgIHNoaW5pbmVzczpudW1iZXI9MjAwO1xuXG4gICAgbGlnaHRpbmcobGlnaHQ6UG9pbnRMaWdodCxwb2ludDpUdXBsZSxleWV2OlR1cGxlLG5vcm1hbHY6VHVwbGUsaW5TaGFkb3c6Ym9vbGVhbj1mYWxzZSk6Q29sb3JcbiAgICB7XG4gICAgICAgdmFyIGVmZmVjdGl2ZUNvbG9yPXRoaXMuY29sb3IuaGFkYW1hcmRQcm9kdWN0KGxpZ2h0LmludGVuc2l0eSk7XG4gICAgICAgdmFyIGFtYmllbnQ9ZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5hbWJpZW50KTtcbiAgICAgICBpZiAoaW5TaGFkb3cpIHJldHVybiBhbWJpZW50O1xuICAgICAgIHZhciBsaWdodHY9bGlnaHQucG9zaXRvbi5zdWJzdHJhY3QocG9pbnQpLm5vcm1hbGl6ZSgpO1xuXG4gICAgICAgdmFyIGxpZ2h0RG90Tm9ybWFsPWxpZ2h0di5kb3Qobm9ybWFsdik7XG4gICAgICAgdmFyIGRpZmZ1c2U7XG4gICAgICAgdmFyIHNwZWN1bGFyO1xuICAgICAgIGlmIChsaWdodERvdE5vcm1hbDwwKVxuICAgICAgIHtcbiAgICAgICAgIGRpZmZ1c2U9Q29sb3IuQkxBQ0s7XG4gICAgICAgICBzcGVjdWxhcj1Db2xvci5CTEFDSztcbiAgICAgICB9IGVsc2VcbiAgICAgICB7XG4gICAgICAgICAgIGRpZmZ1c2U9ZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5kaWZmdXNlKmxpZ2h0RG90Tm9ybWFsKTtcbiAgICAgICAgICAgdmFyIHJlZmxlY3R2PWxpZ2h0di5uZWdhdGUoKS5yZWZsZWN0KG5vcm1hbHYpO1xuICAgICAgICAgICB2YXIgcmVmbGVjdERvdEV5ZT0gcmVmbGVjdHYuZG90KGV5ZXYpO1xuICAgICAgICAgICBpZiAocmVmbGVjdERvdEV5ZSA8PTApXG4gICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIHNwZWN1bGFyPUNvbG9yLkJMQUNLO1xuICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAge1xuICAgICAgICAgICAgIHZhciBmYWN0b3I9TWF0aC5wb3cocmVmbGVjdERvdEV5ZSx0aGlzLnNoaW5pbmVzcyk7XG4gICAgICAgICAgICAgc3BlY3VsYXI9IGxpZ2h0LmludGVuc2l0eS5tdWx0aXBseSh0aGlzLnNwZWN1bGFyKmZhY3RvciApO1xuXG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgICAgcmV0dXJuIGFtYmllbnQuYWRkKGRpZmZ1c2UpLmFkZChzcGVjdWxhcik7XG4gICAgfVxufSIsImltcG9ydCB7IEVQU0lMT04gfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcblxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7ICAgXG4gICAgcHJvdGVjdGVkIGRhdGE6IEZsb2F0NjRBcnJheTtcbiAgICBcbiAgIFxuICAgIHB1YmxpYyByZWFkb25seSB3aWR0aDogbnVtYmVyO1xuICAgIHB1YmxpYyByZWFkb25seSBoZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeDogQXJyYXk8QXJyYXk8bnVtYmVyPj4pXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpXG4gICAgY29uc3RydWN0b3IoYTogYW55LCBiPzogYW55KSB7XG4gICAgICAgIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhIGFzIEFycmF5PEFycmF5PG51bWJlcj4+O1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGg9PTAgfHwgbWF0cml4WzBdLmxlbmd0aD09MCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoPW1hdHJpeFswXS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodD1tYXRyaXgubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KCB0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeD0wO3g8IHRoaXMud2lkdGg7eCsrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWU9IHJvd1t4XTtcbiAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUhPT11bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3RoaXMud2lkdGgqeSt4XT12YWx1ZTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBhIGFzIG51bWJlcjtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gYiBhcyBudW1iZXI7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGgqdGhpcy5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvZmFjdG9yKHJvdzpudW1iZXIsY29sdW1uOm51bWJlcik6bnVtYmVyXG4gICAge1xuICAgICAgIHJldHVybiAoKHJvdytjb2x1bW4pICUgMiAqMiAtMSkqIC10aGlzLm1pbm9yKHJvdyxjb2x1bW4pO1xuICAgIH1cbiAgICBtaW5vcihyb3c6bnVtYmVyLGNvbHVtbjpudW1iZXIpOm51bWJlclxuICAgIHsgICBcbiAgICAgICAgdmFyIG09IHRoaXMuc3VibWF0cml4KHJvdyxjb2x1bW4pOyAgICAgICAgXG4gICAgICAgIHJldHVybiBtLmRldGVybWluYW50KCk7IFxuICAgIH1cbiAgICBpc0ludmVydGlibGUoKTpib29sZWFuXG4gICAge1xuICAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmFudCgpIT0wO1xuICAgIH1cbiAgIFxuICAgIGRldGVybWluYW50KCk6bnVtYmVyXG4gICAge1xuICAgICAgICBpZiAodGhpcy53aWR0aCE9dGhpcy5oZWlnaHQpIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICBpZiAodGhpcy53aWR0aD09MikgcmV0dXJuIE1hdHJpeDJ4Mi5wcm90b3R5cGUuZGV0ZXJtaW5hbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIGRldD0wO1xuICAgICAgICBmb3IgKHZhciB4PTA7eDx0aGlzLndpZHRoO3grKylcbiAgICAgICAge1xuICAgICAgICAgZGV0Kz0gdGhpcy5kYXRhW3hdKnRoaXMuY29mYWN0b3IoMCx4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICB2YXIgc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7IFxuICAgICAgICAgICAgc3RyaW5nICs9IFwifFwiICAgXG4gICAgICAgICAgICBmb3IgKHZhciB4PTA7eDwgdGhpcy53aWR0aDt4KyspXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RyaW5nICs9ICB0aGlzLmRhdGFbdGhpcy53aWR0aCp5K3hdLnRvRml4ZWQoMikrXCJcXHR8XCI7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHJpbmcgKz0gIFwiXFxuXCI7ICAgXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuXG4gICAgZ2V0KHJvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcikge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLndpZHRoKnJvdytjb2x1bW5dIDtcbiAgICB9XG5cbiAgICBzZXQocm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICB0aGlzLmRhdGFbdGhpcy53aWR0aCpyb3crY29sdW1uXSA9IHZhbHVlO1xuICAgIH1cbiAgICBcblxuICAgIG11bHRpcGx5KG1hdHJpeDogTWF0cml4KTogTWF0cml4XG4gICAgeyAgICAgXG4gICAgICAgICAgIFxuICAgICAgICBpZiAobWF0cml4LmhlaWdodCAhPSB0aGlzLmhlaWdodCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeChtYXRyaXgud2lkdGgsIG1hdHJpeC5oZWlnaHQpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgbWF0cml4LmhlaWdodDsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBtYXRyaXguZGF0YVt0aGlzLndpZHRoKnIreF0gKiB0aGlzLmRhdGFbdGhpcy53aWR0aCp5K3JdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbdGhpcy53aWR0aCp5K3hdID0gc3VtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cblxuICAgIHRyYW5zcG9zZSgpIDpNYXRyaXhcbiAgICB7XG4gICAgICAgIHZhciBtYXRyaXg9IG5ldyBNYXRyaXgodGhpcy5oZWlnaHQsdGhpcy53aWR0aCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0geTsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4PXRoaXMud2lkdGgqeSt4O1xuICAgICAgICAgICAgICAgIHZhciBpbmRleFRyYW5zcG9zZWQ9dGhpcy53aWR0aCp4K3k7XG4gICAgICAgICAgICAgICAgdmFyIHN3YXA9ICB0aGlzLmRhdGFbaW5kZXhdOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleF0gPSB0aGlzLmRhdGFbaW5kZXhUcmFuc3Bvc2VkXTtcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleFRyYW5zcG9zZWRdID0gc3dhcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0cml4O1xuICAgIH1cbiAgICBcblxuICAgIHN1Ym1hdHJpeChyb3c6bnVtYmVyLGNvbHVtbjpudW1iZXIpOk1hdHJpeFxuICAgIHtcbiAgICAgICAgdmFyIG09IG5ldyBNYXRyaXgodGhpcy53aWR0aC0xLHRoaXMuaGVpZ2h0LTEpOyAgICAgICBcbiAgICAgICAgdmFyIHkyPTA7ICAgICAgICBcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBpZiAoeT09cm93KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHgyPTA7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIGlmICh4PT1jb2x1bW4pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW20ud2lkdGgqeTIreDJdPXRoaXMuZGF0YVt0aGlzLndpZHRoKnkreF07XG4gICAgICAgICAgICAgICAgeDIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHkyKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuIFxuXG4gICAgZXF1YWxzKG1hdHJpeDogTWF0cml4KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IG1hdHJpeC53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBtYXRyaXguaGVpZ2h0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZj0gTWF0aC5hYnModGhpcy5kYXRhW2ldIC0gbWF0cml4LmRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaWZmID49IEVQU0lMT04pIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeDR4NCBleHRlbmRzIE1hdHJpeFxue1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURFTlRJVFlfTUFUUklYID1uZXcgTWF0cml4NHg0KFxuICAgICAgICBbXG4gICAgICAgICAgICBbMSwwLDAsMF0sXG4gICAgICAgICAgICBbMCwxLDAsMF0sXG4gICAgICAgICAgICBbMCwwLDEsMF0sXG4gICAgICAgICAgICBbMCwwLDAsMV1cbiAgICAgICAgXVxuICAgICk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdGVtcE1hdHJpeDR4ND0gbmV3IE1hdHJpeDR4NCgpO1xuXG4gICAgcHVibGljIHN0YXRpYyB2aWV3VHJhbnNmb3JtKGZyb206VHVwbGUsdG86VHVwbGUsdXA6VHVwbGUgLHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB2YXIgZm9yd2FyZD10by5zdWJzdHJhY3QoZnJvbSkubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciB1cG49IHVwLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgbGVmdCA9Zm9yd2FyZC5jcm9zcyh1cG4pO1xuICAgICAgICB2YXIgdHJ1ZVVwPWxlZnQuY3Jvc3MoZm9yd2FyZCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPWxlZnQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09bGVmdC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXT1sZWZ0Lno7XG5cblxuICAgICAgICB0YXJnZXQuZGF0YVs0XT10cnVlVXAueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09dHJ1ZVVwLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPXRydWVVcC56O1xuXG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09LWZvcndhcmQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09LWZvcndhcmQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPS1mb3J3YXJkLno7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIFxuICAgICAgICBNYXRyaXg0eDQudHJhbnNsYXRpb24oLWZyb20ueCwtZnJvbS55LC1mcm9tLnosIE1hdHJpeDR4NC50ZW1wTWF0cml4NHg0KTtcblxuICAgICAgICB0YXJnZXQubXVsdGlwbHkoTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQsdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRpb24oeDpudW1iZXIseTpudW1iZXIsejpudW1iZXIsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT14O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT15O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgcm90YXRpb25YKHJhZGlhbnM6bnVtYmVyLHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAgeyAgICAgICBcbiAgICAgICAgdmFyIGNvcz1NYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbj0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09c2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0tc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgcm90YXRpb25ZKHJhZGlhbnM6bnVtYmVyLHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAgeyAgICAgICBcbiAgICAgICAgdmFyIGNvcz1NYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbj0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09LXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09c2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgcm90YXRpb25aKHJhZGlhbnM6bnVtYmVyLHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAgeyAgICAgICAgXG4gICAgICAgIHZhciBjb3M9TWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW49IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09LXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxpbmcoeDpudW1iZXIseTpudW1iZXIsejpudW1iZXIsdGFyZ2V0Ok1hdHJpeDR4NCA9bmV3IE1hdHJpeDR4NCgpKTpNYXRyaXg0eDRcbiAgICB7ICAgICAgICBcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBzaGVhcmluZyh4eTpudW1iZXIseHo6bnVtYmVyLHl4Om51bWJlcix5ejpudW1iZXIseng6bnVtYmVyLHp5Om51bWJlcix0YXJnZXQ6TWF0cml4NHg0ID1uZXcgTWF0cml4NHg0KCkpOk1hdHJpeDR4NFxuICAgIHsgICAgICAgXG4gICAgICAgIHRhcmdldC5kYXRhWzBdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPXl4O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT16eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09eHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPTE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPXp5O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT14ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09eXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg/OiBBcnJheTxBcnJheTxudW1iZXI+PikgXG4gICAge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgXG4gICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCE9NCB8fCBtYXRyaXhbMF0ubGVuZ3RoIT00IHx8IG1hdHJpeFsxXS5sZW5ndGghPTQgfHwgbWF0cml4WzJdLmxlbmd0aCE9NCB8fCBtYXRyaXhbM10ubGVuZ3RoIT00KVxuICAgICAgICAge1xuICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgfVxuICAgICAgICAgIHN1cGVyKG1hdHJpeCk7IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1cGVyKDQgLDQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRyYW5zcG9zZSh0YXJnZXQ6TWF0cml4NHg0ID1uZXcgTWF0cml4NHg0KCkpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdmFyIHN3YXA6bnVtYmVyOyAgICAgIFxuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVsxXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVsyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVszXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHRoaXMuZGF0YVs1XTtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVs2XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gc3dhcDtcbiAgICAgICAgc3dhcD0gIHRoaXMuZGF0YVs3XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBpbnZlcnNlKHRhcmdldDpNYXRyaXg0eDQgPW5ldyBNYXRyaXg0eDQoKSk6TWF0cml4NHg0XG4gICAgeyAgICAgICBcbiAgICAgICAgdmFyIGEwMD10aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDE9dGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyPXRoaXMuZGF0YVsyXTtcbiAgICAgICAgdmFyIGEwMz10aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTA9dGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgdmFyIGExMj10aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTM9dGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMz10aGlzLmRhdGFbMTFdO1xuICAgICAgICB2YXIgYTMwPXRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzE9dGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMj10aGlzLmRhdGFbMTRdO1xuICAgICAgICB2YXIgYTMzPXRoaXMuZGF0YVsxNV07XG4gICAgICAgIHZhciBkZXRlcm1pbmFudD0gKGEwMCooYTExKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMSphMzMtYTIzKmEzMSkrYTEzKihhMjEqYTMyLWEyMiphMzEpKStcbiAgICAgICAgICAgICAgICAgICAgICAgIGEwMSotKGExMCooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMi1hMjIqYTMwKSkrXG4gICAgICAgICAgICAgICAgICAgICAgICBhMDIqKGExMCooYTIxKmEzMy1hMjMqYTMxKSthMTEqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMS1hMjEqYTMwKSkrXG4gICAgICAgICAgICAgICAgICAgICAgICBhMDMqLShhMTAqKGEyMSphMzItYTIyKmEzMSkrYTExKi0oYTIwKmEzMi1hMjIqYTMwKSthMTIqKGEyMCphMzEtYTIxKmEzMCkpKTsgICBcbiAgICAgICAgaWYgKGRldGVybWluYW50PT0wKSByZXR1cm4gbnVsbDsgICAgICAgICAgICAgICBcblxuICAgICAgICB0YXJnZXQuZGF0YVswXT0gKGExMSooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjEqYTMzLWEyMyphMzEpK2ExMyooYTIxKmEzMi1hMjIqYTMxKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdPSAtKGEwMSooYTIyKmEzMy1hMjMqYTMyKSthMDIqLShhMjEqYTMzLWEyMyphMzEpK2EwMyooYTIxKmEzMi1hMjIqYTMxKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdPSAoYTAxKihhMTIqYTMzLWExMyphMzIpK2EwMiotKGExMSphMzMtYTEzKmEzMSkrYTAzKihhMTEqYTMyLWExMiphMzEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM109IC0oYTAxKihhMTIqYTIzLWExMyphMjIpK2EwMiotKGExMSphMjMtYTEzKmEyMSkrYTAzKihhMTEqYTIyLWExMiphMjEpKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09IC0oYTEwKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMyLWEyMiphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09IChhMDAqKGEyMiphMzMtYTIzKmEzMikrYTAyKi0oYTIwKmEzMy1hMjMqYTMwKSthMDMqKGEyMCphMzItYTIyKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0gLShhMDAqKGExMiphMzMtYTEzKmEzMikrYTAyKi0oYTEwKmEzMy1hMTMqYTMwKSthMDMqKGExMCphMzItYTEyKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0gKGEwMCooYTEyKmEyMy1hMTMqYTIyKSthMDIqLShhMTAqYTIzLWExMyphMjApK2EwMyooYTEwKmEyMi1hMTIqYTIwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPSAoYTEwKihhMjEqYTMzLWEyMyphMzEpK2ExMSotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMxLWEyMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09IC0oYTAwKihhMjEqYTMzLWEyMyphMzEpK2EwMSotKGEyMCphMzMtYTIzKmEzMCkrYTAzKihhMjAqYTMxLWEyMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPSAoYTAwKihhMTEqYTMzLWExMyphMzEpK2EwMSotKGExMCphMzMtYTEzKmEzMCkrYTAzKihhMTAqYTMxLWExMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPSAtKGEwMCooYTExKmEyMy1hMTMqYTIxKSthMDEqLShhMTAqYTIzLWExMyphMjApK2EwMyooYTEwKmEyMS1hMTEqYTIwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0gLShhMTAqKGEyMSphMzItYTIyKmEzMSkrYTExKi0oYTIwKmEzMi1hMjIqYTMwKSthMTIqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109IChhMDAqKGEyMSphMzItYTIyKmEzMSkrYTAxKi0oYTIwKmEzMi1hMjIqYTMwKSthMDIqKGEyMCphMzEtYTIxKmEzMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09IC0oYTAwKihhMTEqYTMyLWExMiphMzEpK2EwMSotKGExMCphMzItYTEyKmEzMCkrYTAyKihhMTAqYTMxLWExMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPSAoYTAwKihhMTEqYTIyLWExMiphMjEpK2EwMSotKGExMCphMjItYTEyKmEyMCkrYTAyKihhMTAqYTIxLWExMSphMjApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgXG4gICAgfVxuICAgIGRldGVybWluYW50KClcbiAgICB7IFxuICAgICAgICB2YXIgYTAwPXRoaXMuZGF0YVswXTtcbiAgICAgICAgdmFyIGEwMT10aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDI9dGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMD10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTE9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGExMz10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjA9dGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxPXRoaXMuZGF0YVs5XTtcbiAgICAgICAgdmFyIGEyMj10aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzPXRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzA9dGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdmFyIGEzMT10aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyPXRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzM9dGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIChhMDAqKGExMSooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjEqYTMzLWEyMyphMzEpK2ExMyooYTIxKmEzMi1hMjIqYTMxKSkrXG4gICAgICAgICAgICAgICAgYTAxKi0oYTEwKihhMjIqYTMzLWEyMyphMzIpK2ExMiotKGEyMCphMzMtYTIzKmEzMCkrYTEzKihhMjAqYTMyLWEyMiphMzApKStcbiAgICAgICAgICAgICAgICBhMDIqKGExMCooYTIxKmEzMy1hMjMqYTMxKSthMTEqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMS1hMjEqYTMwKSkrXG4gICAgICAgICAgICAgICAgYTAzKi0oYTEwKihhMjEqYTMyLWEyMiphMzEpK2ExMSotKGEyMCphMzItYTIyKmEzMCkrYTEyKihhMjAqYTMxLWEyMSphMzApKSk7ICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgYXNzaWduKG1hdHJpeDpNYXRyaXg0eDQpXG4gICAge1xuICAgICAgICB0aGlzLmRhdGFbMF09IG1hdHJpeC5kYXRhWzBdO1xuICAgICAgICB0aGlzLmRhdGFbMV09IG1hdHJpeC5kYXRhWzFdO1xuICAgICAgICB0aGlzLmRhdGFbMl09IG1hdHJpeC5kYXRhWzJdO1xuICAgICAgICB0aGlzLmRhdGFbM109IG1hdHJpeC5kYXRhWzNdO1xuICAgICAgICB0aGlzLmRhdGFbNF09IG1hdHJpeC5kYXRhWzRdO1xuICAgICAgICB0aGlzLmRhdGFbNV09IG1hdHJpeC5kYXRhWzVdO1xuICAgICAgICB0aGlzLmRhdGFbNl09IG1hdHJpeC5kYXRhWzZdO1xuICAgICAgICB0aGlzLmRhdGFbN109IG1hdHJpeC5kYXRhWzddO1xuICAgICAgICB0aGlzLmRhdGFbOF09IG1hdHJpeC5kYXRhWzhdO1xuICAgICAgICB0aGlzLmRhdGFbOV09IG1hdHJpeC5kYXRhWzldO1xuICAgICAgICB0aGlzLmRhdGFbMTBdPSBtYXRyaXguZGF0YVsxMF07XG4gICAgICAgIHRoaXMuZGF0YVsxMV09IG1hdHJpeC5kYXRhWzExXTtcbiAgICAgICAgdGhpcy5kYXRhWzEyXT0gbWF0cml4LmRhdGFbMTJdO1xuICAgICAgICB0aGlzLmRhdGFbMTNdPSBtYXRyaXguZGF0YVsxM107XG4gICAgICAgIHRoaXMuZGF0YVsxNF09IG1hdHJpeC5kYXRhWzE0XTtcbiAgICAgICAgdGhpcy5kYXRhWzE1XT0gbWF0cml4LmRhdGFbMTVdO1xuICAgIH1cblxuICAgIGNsb25lKCk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgbS5kYXRhWzBdPXRoaXMuZGF0YVswXTtcbiAgICAgICAgbS5kYXRhWzFdPXRoaXMuZGF0YVsxXTtcbiAgICAgICAgbS5kYXRhWzJdPXRoaXMuZGF0YVsyXTtcbiAgICAgICAgbS5kYXRhWzNdPXRoaXMuZGF0YVszXTtcbiAgICAgICAgbS5kYXRhWzRdPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgbS5kYXRhWzVdPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgbS5kYXRhWzZdPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgbS5kYXRhWzddPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgbS5kYXRhWzhdPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgbS5kYXRhWzldPXRoaXMuZGF0YVs5XTtcbiAgICAgICAgbS5kYXRhWzEwXT10aGlzLmRhdGFbMTBdO1xuICAgICAgICBtLmRhdGFbMTFdPXRoaXMuZGF0YVsxMV07XG4gICAgICAgIG0uZGF0YVsxMl09dGhpcy5kYXRhWzEyXTtcbiAgICAgICAgbS5kYXRhWzEzXT10aGlzLmRhdGFbMTNdO1xuICAgICAgICBtLmRhdGFbMTRdPXRoaXMuZGF0YVsxNF07XG4gICAgICAgIG0uZGF0YVsxNV09dGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuXG5cbiAgICBtdWx0aXBseSh0dXBsZTogVHVwbGUpOiBUdXBsZVxuICAgIG11bHRpcGx5KG1hdHJpeDogTWF0cml4NHg0LHRhcmdldD86TWF0cml4NHg0KTogTWF0cml4NHg0XG4gICAgbXVsdGlwbHkoYTphbnksYj86YW55KTphbnlcbiAgICB7XG4gICAgICBpZiAoYSBpbnN0YW5jZW9mIE1hdHJpeDR4NClcbiAgICAgIHtcbiAgICAgICAgdmFyIHRhcmdldCA9ICBiID8/ICBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIGlmIChtYXRyaXg9PT10aGlzKSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgdmFyIG1hdHJpeD0gYSBhcyBNYXRyaXg0eDQ7XG4gICAgICAgIHZhciBhMDA9dGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxPXRoaXMuZGF0YVsxXTtcbiAgICAgICAgdmFyIGEwMj10aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDM9dGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgdmFyIGEyMD10aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjE9dGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIHZhciBhMjM9dGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMD10aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxPXRoaXMuZGF0YVsxM107XG4gICAgICAgIHZhciBhMzI9dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMz10aGlzLmRhdGFbMTVdO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzBdPW1hdHJpeC5kYXRhWzBdKiBhMDArbWF0cml4LmRhdGFbNF0qIGEwMSttYXRyaXguZGF0YVs4XSogYTAyK21hdHJpeC5kYXRhWzEyXSogYTAzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXT1tYXRyaXguZGF0YVsxXSogYTAwK21hdHJpeC5kYXRhWzVdKiBhMDErbWF0cml4LmRhdGFbOV0qIGEwMittYXRyaXguZGF0YVsxM10qIGEwMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09bWF0cml4LmRhdGFbMl0qIGEwMCttYXRyaXguZGF0YVs2XSogYTAxK21hdHJpeC5kYXRhWzEwXSogYTAyK21hdHJpeC5kYXRhWzE0XSogYTAzO1xuICAgICAgICB0YXJnZXQuZGF0YVszXT1tYXRyaXguZGF0YVszXSogYTAwK21hdHJpeC5kYXRhWzddKiBhMDErbWF0cml4LmRhdGFbMTFdKiBhMDIrbWF0cml4LmRhdGFbMTVdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPW1hdHJpeC5kYXRhWzBdKiBhMTArbWF0cml4LmRhdGFbNF0qIGExMSttYXRyaXguZGF0YVs4XSogYTEyK21hdHJpeC5kYXRhWzEyXSogYTEzO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT1tYXRyaXguZGF0YVsxXSogYTEwK21hdHJpeC5kYXRhWzVdKiBhMTErbWF0cml4LmRhdGFbOV0qIGExMittYXRyaXguZGF0YVsxM10qIGExMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09bWF0cml4LmRhdGFbMl0qIGExMCttYXRyaXguZGF0YVs2XSogYTExK21hdHJpeC5kYXRhWzEwXSogYTEyK21hdHJpeC5kYXRhWzE0XSogYTEzO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT1tYXRyaXguZGF0YVszXSogYTEwK21hdHJpeC5kYXRhWzddKiBhMTErbWF0cml4LmRhdGFbMTFdKiBhMTIrbWF0cml4LmRhdGFbMTVdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdPW1hdHJpeC5kYXRhWzBdKiBhMjArbWF0cml4LmRhdGFbNF0qIGEyMSttYXRyaXguZGF0YVs4XSogYTIyK21hdHJpeC5kYXRhWzEyXSogYTIzO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT1tYXRyaXguZGF0YVsxXSogYTIwK21hdHJpeC5kYXRhWzVdKiBhMjErbWF0cml4LmRhdGFbOV0qIGEyMittYXRyaXguZGF0YVsxM10qIGEyMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPW1hdHJpeC5kYXRhWzJdKiBhMjArbWF0cml4LmRhdGFbNl0qIGEyMSttYXRyaXguZGF0YVsxMF0qIGEyMittYXRyaXguZGF0YVsxNF0qIGEyMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPW1hdHJpeC5kYXRhWzNdKiBhMjArbWF0cml4LmRhdGFbN10qIGEyMSttYXRyaXguZGF0YVsxMV0qIGEyMittYXRyaXguZGF0YVsxNV0qIGEyMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPW1hdHJpeC5kYXRhWzBdKiBhMzArbWF0cml4LmRhdGFbNF0qIGEzMSttYXRyaXguZGF0YVs4XSogYTMyK21hdHJpeC5kYXRhWzEyXSogYTMzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109bWF0cml4LmRhdGFbMV0qIGEzMCttYXRyaXguZGF0YVs1XSogYTMxK21hdHJpeC5kYXRhWzldKiBhMzIrbWF0cml4LmRhdGFbMTNdKiBhMzM7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT1tYXRyaXguZGF0YVsyXSogYTMwK21hdHJpeC5kYXRhWzZdKiBhMzErbWF0cml4LmRhdGFbMTBdKiBhMzIrbWF0cml4LmRhdGFbMTRdKiBhMzM7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT1tYXRyaXguZGF0YVszXSogYTMwK21hdHJpeC5kYXRhWzddKiBhMzErbWF0cml4LmRhdGFbMTFdKiBhMzIrbWF0cml4LmRhdGFbMTVdKiBhMzM7XG4gICAgICAgIFxuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9IGVsc2UgaWYgKGEgaW5zdGFuY2VvZiBUdXBsZSlcbiAgICAgIHtcbiAgICAgICAgdmFyIHQ9IGEgYXMgVHVwbGU7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoIFxuICAgICAgICAgdGhpcy5kYXRhWzBdKnQueCArIHRoaXMuZGF0YVsxXSp0LnkrdGhpcy5kYXRhWzJdKnQueit0aGlzLmRhdGFbM10qdC53LFxuICAgICAgICAgdGhpcy5kYXRhWzRdKnQueCArIHRoaXMuZGF0YVs1XSp0LnkrdGhpcy5kYXRhWzZdKnQueit0aGlzLmRhdGFbN10qdC53LCBcbiAgICAgICAgIHRoaXMuZGF0YVs4XSp0LnggKyB0aGlzLmRhdGFbOV0qdC55K3RoaXMuZGF0YVsxMF0qdC56K3RoaXMuZGF0YVsxMV0qdC53LFxuICAgICAgICAgdGhpcy5kYXRhWzEyXSp0LnggKyB0aGlzLmRhdGFbMTNdKnQueSt0aGlzLmRhdGFbMTRdKnQueit0aGlzLmRhdGFbMTVdKnQud1xuICAgICAgICAgICApO1xuICAgICAgfSBlbHNlXG4gICAgICB7XG4gICAgICAgICAgLy9hIGluc3RhbmNlb2YgTWF0cml4IChub3Qgc3VwcG9ydGVkKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgfVxuICAgIH1cblxufVxuXG5leHBvcnQgY2xhc3MgTWF0cml4MngyIGV4dGVuZHMgTWF0cml4XG57ICAgXG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg/OiBBcnJheTxBcnJheTxudW1iZXI+PikgXG4gICAge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgXG4gICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCE9MiB8fCBtYXRyaXhbMF0ubGVuZ3RoIT0yIHx8IG1hdHJpeFsxXS5sZW5ndGghPTIgKVxuICAgICAgICAge1xuICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgfVxuICAgICAgICAgIHN1cGVyKG1hdHJpeCk7IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1cGVyKDIgLDIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCk6bnVtYmVyXG4gICAge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSp0aGlzLmRhdGFbM10tdGhpcy5kYXRhWzFdKnRoaXMuZGF0YVsyXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgzeDMgZXh0ZW5kcyBNYXRyaXhcbnsgICBcblxuICAgIGNvbnN0cnVjdG9yKG1hdHJpeD86IEFycmF5PEFycmF5PG51bWJlcj4+KSBcbiAgICB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBcbiAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoIT0zIHx8IG1hdHJpeFswXS5sZW5ndGghPTMgfHwgbWF0cml4WzFdLmxlbmd0aCE9MyB8fCBtYXRyaXhbMl0ubGVuZ3RoIT0zKVxuICAgICAgICAge1xuICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgfVxuICAgICAgICAgIHN1cGVyKG1hdHJpeCk7IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1cGVyKDMgLDMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICBcbiAgICBkZXRlcm1pbmFudCgpOm51bWJlclxuICAgIHtcbiAgICAgICAgdmFyIGExMD10aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTE9dGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTEyPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgdmFyIGEyMD10aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMjE9dGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIyPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAodGhpcy5kYXRhWzBdKihhMTEqYTIyLWExMiphMjEpK3RoaXMuZGF0YVsxXSotKGExMCphMjItYTEyKmEyMCkrdGhpcy5kYXRhWzJdKihhMTAqYTIxLWExMSphMjApKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBSYXkgfSBmcm9tIFwiLi9yYXlcIlxuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuaW1wb3J0IHsgSW50ZXJzZWN0aW9uLCBJbnRlcnNlY3Rpb25zIH0gZnJvbSBcIi4vaW50ZXJzZWN0aW9uXCI7XG5pbXBvcnQgeyBNYXRyaXg0eDQgfSBmcm9tIFwiLi9tYXRyaXhcIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWxcIjtcbmltcG9ydCB7IElTaGFwZSB9IGZyb20gXCIuL3dvcmxkXCI7XG5pbXBvcnQgeyBFUFNJTE9OIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5leHBvcnQgY2xhc3MgUGxhbmUgaW1wbGVtZW50cyBJU2hhcGUge1xuXG4gIGlkOiBudW1iZXI7XG4gIHByaXZhdGUgaW52ZXJzZVRyYW5zZm9ybTogTWF0cml4NHg0O1xuICBwcml2YXRlIF90cmFuc2Zvcm06IE1hdHJpeDR4NDtcbiAgLyoqXG4gICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2Zvcm0oKTogTWF0cml4NHg0IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICB9XG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKHZhbHVlOiBNYXRyaXg0eDQpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm09dmFsdWUuaW52ZXJzZSgpO1xuICB9XG5cbiAgbWF0ZXJpYWw6IE1hdGVyaWFsO1xuICBwcml2YXRlIHN0YXRpYyB0ZW1wTWF0cml4MSA9IG5ldyBNYXRyaXg0eDQoKTtcblxuXG4gIGNvbnN0cnVjdG9yKGlkOiBudW1iZXIsIHRyYW5zZm9ybT86IE1hdHJpeDR4NCwgbWF0ZXJpYWw/OiBNYXRlcmlhbCkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSA/PyBNYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsID8/IG5ldyBNYXRlcmlhbCgpO1xuICB9XG4gIFxuICBpbnRlcnNlY3QocmF5OiBSYXksIGludGVyc2VjdGlvbnM6IEludGVyc2VjdGlvbnM9IG5ldyBJbnRlcnNlY3Rpb25zKCkpOiBJbnRlcnNlY3Rpb25zIHtcbiAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7ICAgXG4gICAgdGhpcy5sb2NhbEludGVyc2VjdChyYXksaW50ZXJzZWN0aW9ucyk7XG4gICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gIH1cblxuICBub3JtYWxBdChwOiBUdXBsZSk6IFR1cGxlIHsgICBcbiAgICB2YXIgb2JqZWN0Tm9ybWFsID1UdXBsZS52ZWN0b3IoMCwxLDApOyBcbiAgICB2YXIgd29ybGROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0udHJhbnNwb3NlKFBsYW5lLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgfVxuXG4gIGxvY2FsSW50ZXJzZWN0KHJheTpSYXksaW50ZXJzZWN0aW9uczpJbnRlcnNlY3Rpb25zID0gbmV3IEludGVyc2VjdGlvbnMoKSk6SW50ZXJzZWN0aW9uc1xuICB7XG4gICAgaWYgKE1hdGguYWJzKHJheS5kaXJlY3Rpb24ueSkgPCBFUFNJTE9OKSByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICB2YXIgaT1pbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgIGkub2JqZWN0PXRoaXM7XG4gICAgaS50PS1yYXkub3JpZ2luLnkvcmF5LmRpcmVjdGlvbi55O1xuICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICB9XG59IiwiaW1wb3J0IHtUdXBsZX0gZnJvbSBcIi4vdHVwbGVcIlxuaW1wb3J0IHtDb2xvcn0gZnJvbSBcIi4vY29sb3JcIlxuZXhwb3J0IGNsYXNzIFBvaW50TGlnaHRcbntcbiAgICBwdWJsaWMgcG9zaXRvbjpUdXBsZTtcbiAgICBwdWJsaWMgaW50ZW5zaXR5OkNvbG9yO1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uPzpUdXBsZSxpbnRlbnNpdHk/OkNvbG9yKVxuICAgIHtcbiAgICAgIHRoaXMucG9zaXRvbj1wb3NpdGlvbj8/IFR1cGxlLnBvaW50KDAsMCwwKTtcbiAgICAgIHRoaXMuaW50ZW5zaXR5PWludGVuc2l0eT8/IG5ldyBDb2xvcigxLDEsMSk7XG4gICAgfVxufSIsImltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuXG5leHBvcnQgY2xhc3MgUmF5XG57XG4gICAgb3JpZ2luOiBUdXBsZTtcbiAgICBkaXJlY3Rpb246VHVwbGU7XG4gICAgY29uc3RydWN0b3Iob3JpZ2luOlR1cGxlLGRpcmVjdGlvbjpUdXBsZSlcbiAgICB7XG4gICAgICB0aGlzLm9yaWdpbj1vcmlnaW47XG4gICAgICB0aGlzLmRpcmVjdGlvbj1kaXJlY3Rpb247XG4gICAgfVxuICAgIHBvc2l0aW9uKHQ6bnVtYmVyKTpUdXBsZVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLmFkZCh0aGlzLmRpcmVjdGlvbi5tdWx0aXBseSh0KSk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKG1hdHJpeDpNYXRyaXg0eDQpOlJheVxuICAgIHtcbiAgICAgdmFyIGRpcmVjdGlvbj0gbWF0cml4Lm11bHRpcGx5KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgdmFyIG9yaWdpbj0gbWF0cml4Lm11bHRpcGx5KHRoaXMub3JpZ2luKTtcbiAgICAgXG4gICAgIHZhciByYXk9bmV3IFJheShvcmlnaW4sZGlyZWN0aW9uKTtcbiAgICAgcmV0dXJuIHJheTtcbiAgICB9XG59IiwiLyoqXG4gKiBNZXJnZXMgMiBzb3J0ZWQgcmVnaW9ucyBpbiBhbiBhcnJheSBpbnRvIDEgc29ydGVkIHJlZ2lvbiAoaW4tcGxhY2Ugd2l0aG91dCBleHRyYSBtZW1vcnksIHN0YWJsZSkgXG4gKiBAcGFyYW0gaXRlbXMgYXJyYXkgdG8gbWVyZ2VcbiAqIEBwYXJhbSBsZWZ0IGxlZnQgYXJyYXkgYm91bmRhcnkgaW5jbHVzaXZlXG4gKiBAcGFyYW0gbWlkZGxlIGJvdW5kYXJ5IGJldHdlZW4gcmVnaW9ucyAobGVmdCByZWdpb24gZXhjbHVzaXZlLCByaWdodCByZWdpb24gaW5jbHVzaXZlKVxuICogQHBhcmFtIHJpZ2h0IHJpZ2h0IGFycmF5IGJvdW5kYXJ5IGV4Y2x1c2l2ZVxuICovXG4gZnVuY3Rpb24gbWVyZ2VJbnBsYWNlPFQ+KGl0ZW1zOiBUW10sIGNvbXBhcmVGbjogKGE6IFQsYjogVCApPT4gbnVtYmVyLGxlZnQ6bnVtYmVyLG1pZGRsZTpudW1iZXIsIHJpZ2h0Om51bWJlcikge1xuICAgIGlmIChyaWdodD09bWlkZGxlKSByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IGxlZnQ7IGkgPCBtaWRkbGU7aSsrKSB7XG4gICAgICAgICBcbiAgICAgICAgdmFyIG1pblJpZ2h0PWl0ZW1zW21pZGRsZV07XG4gICAgICAgIGlmKGNvbXBhcmVGbihtaW5SaWdodCwgaXRlbXNbaV0pIDwwKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdG1wPWl0ZW1zW2ldO1xuICAgICAgICAgICAgaXRlbXNbaV0gPW1pblJpZ2h0O1xuICAgICAgICAgICAgdmFyIG5leHRJdGVtOlQ7XG4gICAgICAgICAgICB2YXIgbmV4dD1taWRkbGUrMTtcbiAgICAgICAgICAgIHdoaWxlKG5leHQ8cmlnaHQmJiBjb21wYXJlRm4oKG5leHRJdGVtPWl0ZW1zW25leHRdKSx0bXApPDApXG4gICAgICAgICAgICB7ICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaXRlbXNbbmV4dC0xXT1uZXh0SXRlbTtcbiAgICAgICAgICAgICAgbmV4dCsrO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGl0ZW1zW25leHQtMV09dG1wOyAgICAgICAgICAgICAgICBcbiAgICAgICAgfSAgICBcbiAgICB9XG59XG5cbi8qKlxuICogSW4tcGxhY2UgYm90dG9tIHVwIG1lcmdlIHNvcnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU29ydElucGxhY2U8VD4oaXRlbXM6IFRbXSwgY29tcGFyZUZuOiAoYTogVCxiOiBUICk9PiBudW1iZXIsZnJvbT86bnVtYmVyLHRvPzpudW1iZXIpIHtcbiAgICBmcm9tPz89MDtcbiAgICB0bz8/PWl0ZW1zLmxlbmd0aDtcbiAgICB2YXIgbWF4U3RlcCA9ICh0by1mcm9tKSAqIDI7ICAgXG4gICAgZm9yICh2YXIgc3RlcCA9IDI7IHN0ZXAgPCBtYXhTdGVwO3N0ZXAqPTIpIHtcbiAgICAgICAgdmFyIG9sZFN0ZXA9c3RlcC8yO1xuICAgICAgICBmb3IgKHZhciB4ID0gZnJvbTsgeCA8IHRvOyB4ICs9IHN0ZXApIHtcbiAgICAgICAgXG4gICAgICAgICBtZXJnZUlucGxhY2UoaXRlbXMsY29tcGFyZUZuLHgsIHgrb2xkU3RlcCxNYXRoLm1pbih4K3N0ZXAsdG8pICk7XG4gICAgICAgIH0gICAgICAgXG4gICAgfVxuXG5cbn1cblxuIiwiaW1wb3J0IHsgUmF5IH0gZnJvbSBcIi4vcmF5XCJcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbiwgSW50ZXJzZWN0aW9ucyB9IGZyb20gXCIuL2ludGVyc2VjdGlvblwiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcIi4vbWF0cml4XCI7XG5pbXBvcnQgeyBNYXRlcmlhbCB9IGZyb20gXCIuL21hdGVyaWFsXCI7XG5pbXBvcnQgeyBJU2hhcGUgfSBmcm9tIFwiLi93b3JsZFwiO1xuZXhwb3J0IGNsYXNzIFNwaGVyZSBpbXBsZW1lbnRzIElTaGFwZSB7XG5cbiAgaWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBpbnZlcnNlVHJhbnNmb3JtOiBNYXRyaXg0eDQ7XG4gIHByaXZhdGUgX3RyYW5zZm9ybTogTWF0cml4NHg0O1xuICAvKipcbiAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpOiBNYXRyaXg0eDQge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gIH1cbiAgcHVibGljIHNldCB0cmFuc2Zvcm0odmFsdWU6IE1hdHJpeDR4NCkge1xuICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybT12YWx1ZS5pbnZlcnNlKCk7XG4gIH1cblxuICBtYXRlcmlhbDogTWF0ZXJpYWw7XG4gIHByaXZhdGUgc3RhdGljIHRlbXBNYXRyaXgxID0gbmV3IE1hdHJpeDR4NCgpO1xuXG5cbiAgY29uc3RydWN0b3IoaWQ6IG51bWJlciwgdHJhbnNmb3JtPzogTWF0cml4NHg0LCBtYXRlcmlhbD86IE1hdGVyaWFsKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtID8/IE1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWwgPz8gbmV3IE1hdGVyaWFsKCk7XG4gIH1cbiAgXG4gIGludGVyc2VjdChyYXk6IFJheSwgaW50ZXJzZWN0aW9uczogSW50ZXJzZWN0aW9ucz0gbmV3IEludGVyc2VjdGlvbnMoKSk6IEludGVyc2VjdGlvbnMge1xuICAgIHJheSA9IHJheS50cmFuc2Zvcm0odGhpcy5pbnZlcnNlVHJhbnNmb3JtKTtcbiAgICB2YXIgc3BoZXJlMnJheSA9IHJheS5vcmlnaW4uc3Vic3RyYWN0KFR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICB2YXIgYSA9IHJheS5kaXJlY3Rpb24uZG90KHJheS5kaXJlY3Rpb24pO1xuICAgIHZhciBiID0gMiAqIHJheS5kaXJlY3Rpb24uZG90KHNwaGVyZTJyYXkpO1xuICAgIHZhciBjID0gc3BoZXJlMnJheS5kb3Qoc3BoZXJlMnJheSkgLSAxO1xuICAgIHZhciBkaXNjcmltaW5hbnQgPSBiICogYiAtIDQgKiBhICogYztcbiAgICBpZiAoZGlzY3JpbWluYW50IDwgMCkgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgdmFyIHNxcnREaXNjcmltaW5hbnQgPSBNYXRoLnNxcnQoZGlzY3JpbWluYW50KTtcbiAgICB2YXIgaTEgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgIGkxLnQgPSAoLWIgLSBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgaTEub2JqZWN0ID0gdGhpcztcbiAgICB2YXIgaTIgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgIGkyLnQgPSAoLWIgKyBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgaTIub2JqZWN0ID0gdGhpcztcblxuICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICB9XG5cbiAgbm9ybWFsQXQocDogVHVwbGUpOiBUdXBsZSB7ICAgXG4gICAgdmFyIG9iamVjdE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShwKTtcbiAgICBvYmplY3ROb3JtYWwudyA9IDA7XG4gICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShTcGhlcmUudGVtcE1hdHJpeDEpLm11bHRpcGx5KG9iamVjdE5vcm1hbCk7XG4gICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgcmV0dXJuIHdvcmxkTm9ybWFsLm5vcm1hbGl6ZSgpO1xuICB9XG59IiwiaW1wb3J0IHsgRVBTSUxPTiB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5leHBvcnQgY2xhc3MgVHVwbGUge1xuICAgIHB1YmxpYyB4OiBudW1iZXI7XG4gICAgcHVibGljIHk6IG51bWJlcjtcbiAgICBwdWJsaWMgejogbnVtYmVyO1xuICAgIHB1YmxpYyB3OiBudW1iZXI7XG5cbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHo/OiBudW1iZXIsIHc/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICAgICAgdGhpcy53ID0gdztcbiAgICB9XG4gICAgcHVibGljIGlzUG9pbnQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMTtcbiAgICB9XG4gICAgcHVibGljIGlzVmVjdG9yKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCh0dXBsZTogVHVwbGUpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICsgdHVwbGUueCwgdGhpcy55ICsgdHVwbGUueSwgdGhpcy56ICsgdHVwbGUueiwgdGhpcy53ICsgdHVwbGUudylcbiAgICB9XG4gICAgcHVibGljIG11bHRpcGx5KHNjYWxhcjogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIGRpdmlkZShzY2FsYXI6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBzdWJzdHJhY3QodHVwbGU6IFR1cGxlKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAtIHR1cGxlLngsIHRoaXMueSAtIHR1cGxlLnksIHRoaXMueiAtIHR1cGxlLnosIHRoaXMudyAtIHR1cGxlLncpXG4gICAgfVxuICAgIHB1YmxpYyBuZWdhdGUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncpXG4gICAgfVxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5tYWduaXR1ZGUoKSk7XG4gICAgfVxuICAgIHB1YmxpYyBtYWduaXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG4gICAgcHVibGljIGRvdCh0dXBsZTogVHVwbGUpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54ICogdHVwbGUueCArIHRoaXMueSAqIHR1cGxlLnkgKyB0aGlzLnogKiB0dXBsZS56ICsgdGhpcy53ICogdHVwbGUudztcbiAgICB9XG4gICAgcHVibGljIGNyb3NzKHR1cGxlOiBUdXBsZSk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIFR1cGxlLnZlY3Rvcih0aGlzLnkgKiB0dXBsZS56IC0gdGhpcy56ICogdHVwbGUueSxcbiAgICAgICAgICAgIHRoaXMueiAqIHR1cGxlLnggLSB0aGlzLnggKiB0dXBsZS56LFxuICAgICAgICAgICAgdGhpcy54ICogdHVwbGUueSAtIHRoaXMueSAqIHR1cGxlLnhcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgcmVmbGVjdChub3JtYWw6VHVwbGUgKTpUdXBsZVxuICAgIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnN0cmFjdChub3JtYWwubXVsdGlwbHkoMip0aGlzLmRvdChub3JtYWwpKSk7XG4gICAgfVxuICAgIHB1YmxpYyBlcXVhbHModHVwbGU6IFR1cGxlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnggLSB0dXBsZS54KSA8IEVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueSAtIHR1cGxlLnkpIDwgRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy56IC0gdHVwbGUueikgPCBFUFNJTE9OO1xuICAgIH1cbiAgICBzdGF0aWMgcG9pbnQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAxKTtcbiAgICB9XG4gICAgc3RhdGljIHZlY3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDApO1xuICAgIH1cbiAgICBjbG9uZSgpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcbiAgICB9XG59IiwiXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL2NvbG9yXCI7XG5pbXBvcnQgeyBDb21wdXRhdGlvbnMgfSBmcm9tIFwiLi9jb21wdXRhdGlvbnNcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbnMgfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWxcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgUG9pbnRMaWdodCB9IGZyb20gXCIuL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcIi4vc3BoZXJlXCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBXb3JsZFxue1xuXG4gICAgbGlnaHQ6UG9pbnRMaWdodDtcbiAgICBvYmplY3RzOklTaGFwZVtdO1xuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIHRlbXBJbnRlcnNlY3Rpb25zPSBuZXcgSW50ZXJzZWN0aW9ucygxMDApO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBzaGFkZUhpdChjb21wczogQ29tcHV0YXRpb25zKTpDb2xvciB7XG4gICAgICByZXR1cm4gY29tcHMub2JqZWN0Lm1hdGVyaWFsLmxpZ2h0aW5nKHRoaXMubGlnaHQsXG4gICAgICAgIGNvbXBzLnBvaW50LFxuICAgICAgICBjb21wcy5leWV2LFxuICAgICAgICBjb21wcy5ub3JtYWx2LFxuICAgICAgICB0aGlzLmlzU2hhZG93ZWQoY29tcHMub3ZlclBvaW50KVxuICAgICAgICApO1xuICAgIH0gIFxuICAgIGNvbG9yQXQocmF5OlJheSlcbiAgICB7XG4gICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgdGhpcy5pbnRlcnNlY3QocmF5LFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgIHZhciBpPVdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICAgaWYgKGk9PW51bGwpIHJldHVybiBDb2xvci5CTEFDSy5jbG9uZSgpO1xuICAgICAgdmFyIGNvbXA9Q29tcHV0YXRpb25zLnByZXBhcmUoaSxyYXkpO1xuICAgICAgcmV0dXJuIHRoaXMuc2hhZGVIaXQoY29tcCk7XG4gICAgfSBcblxuICAgIGludGVyc2VjdChyYXk6UmF5LCBpbnRlcnNlY3Rpb25zOiBJbnRlcnNlY3Rpb25zID1uZXcgSW50ZXJzZWN0aW9ucygpKTpJbnRlcnNlY3Rpb25zXG4gICAgeyAgICBcbiAgICAgIGZvciAodmFyIG8gb2YgdGhpcy5vYmplY3RzKVxuICAgICAge1xuICAgICAgICBvLmludGVyc2VjdChyYXksaW50ZXJzZWN0aW9ucylcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBpc1NoYWRvd2VkKHBvaW50OlR1cGxlKTpib29sZWFuXG4gICAge1xuICAgICB2YXIgdj0gdGhpcy5saWdodC5wb3NpdG9uLnN1YnN0cmFjdChwb2ludCk7XG4gICAgIHZhciBkaXN0YW5jZT0gdi5tYWduaXR1ZGUoKTtcbiAgICAgdmFyIGRpcmVjdGlvbj12Lm5vcm1hbGl6ZSgpO1xuICAgICB2YXIgcj0gbmV3IFJheShwb2ludCxkaXJlY3Rpb24pO1xuICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICB0aGlzLmludGVyc2VjdChyLFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgdmFyIGg9IFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICByZXR1cm4gKGghPW51bGwgJiYgaC50PCBkaXN0YW5jZSk7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTaGFwZVxue1xuICBtYXRlcmlhbDpNYXRlcmlhbDsgXG4gIHRyYW5zZm9ybTpNYXRyaXg0eDQ7IFxuICBpbnRlcnNlY3QocmF5OlJheSxpbnRlcnNlY3Rpb25zPzogSW50ZXJzZWN0aW9ucyApOkludGVyc2VjdGlvbnM7XG4gIG5vcm1hbEF0KHA6VHVwbGUpOlR1cGxlOyAgICBcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2FudmFzIH0gZnJvbSBcInJheXRyYWNlci9jYW52YXNcIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcInJheXRyYWNlci9jb2xvclwiO1xuaW1wb3J0IHsgSW50ZXJzZWN0aW9uLCBJbnRlcnNlY3Rpb25zIH0gZnJvbSBcInJheXRyYWNlci9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcInJheXRyYWNlci9tYXRlcmlhbFwiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcInJheXRyYWNlci9tYXRyaXhcIjtcbmltcG9ydCB7IFBvaW50TGlnaHQgfSBmcm9tIFwicmF5dHJhY2VyL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSBcInJheXRyYWNlci93b3JsZFwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcInJheXRyYWNlci9zcGhlcmVcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcInJheXRyYWNlci90dXBsZVwiO1xuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSBcInJheXRyYWNlci9jYW1lcmFcIjtcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSBcInJheXRyYWNlci9wbGFuZVwiO1xuXG5cbnZhciB3b3JsZD0gbmV3IFdvcmxkKCk7XG52YXIgZmxvb3IgPSBuZXcgUGxhbmUoMCk7XG5mbG9vci5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKCk7XG5mbG9vci5tYXRlcmlhbC5jb2xvcj1uZXcgQ29sb3IoMC45LDEuMCwwLjkpO1xuZmxvb3IubWF0ZXJpYWwuc3BlY3VsYXI9MC41O1xuXG5cbnZhciBtaWRkbGU9bmV3IFNwaGVyZSgzKTtcbm1pZGRsZS50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKC0wLjUsMSwwLjUpXG5taWRkbGUubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xubWlkZGxlLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDEsMC41KTtcbm1pZGRsZS5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbm1pZGRsZS5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5cbnZhciByaWdodD1uZXcgU3BoZXJlKDQpO1xucmlnaHQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigxLjUsMC41LC0wLjUpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDAuNSwwLjUsMC41KSk7XG5yaWdodC5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKCk7XG5yaWdodC5tYXRlcmlhbC5jb2xvcj0gbmV3IENvbG9yKDAuNSwxLDAuMSk7XG5yaWdodC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbnJpZ2h0Lm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcblxudmFyIGxlZnQ9bmV3IFNwaGVyZSg1KTtcbmxlZnQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigtMS41LDAuMzMsLTAuNzUpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDAuMzMsMC4zMywwLjMzKSk7XG5sZWZ0Lm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoKTtcbmxlZnQubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigxLDAuOCwwLjEpO1xubGVmdC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbmxlZnQubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xuXG5cbndvcmxkLm9iamVjdHM9IFtsZWZ0LHJpZ2h0LG1pZGRsZSxmbG9vcl07XG53b3JsZC5saWdodD0gbmV3IFBvaW50TGlnaHQoVHVwbGUucG9pbnQoLTEwLDEwLC0xMCksQ29sb3IuV0hJVEUuY2xvbmUoKSk7XG5cbnZhciBjYW1lcmE9IG5ldyBDYW1lcmEoMTAyNCwxMDI0LE1hdGguUEkvMyxcbiAgICBNYXRyaXg0eDQudmlld1RyYW5zZm9ybShUdXBsZS5wb2ludCgwLDEuNSwtNSksVHVwbGUucG9pbnQoMCwxLDApLFR1cGxlLnZlY3RvcigwLDEsMCkpXG4gICAgKTtcblxuXG52YXIgcmF5dHJhY2VyQ2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF5dHJhY2VyQ2FudmFzXCIpO1xucmF5dHJhY2VyQ2FudmFzLndpZHRoPWNhbWVyYS5oc2l6ZTtcbnJheXRyYWNlckNhbnZhcy5oZWlnaHQ9Y2FtZXJhLnZzaXplO1xudmFyIHJlbmRlckRhdGEgPSBjYW1lcmEucmVuZGVyKHdvcmxkKS50b1VpbnQ4Q2xhbXBlZEFycmF5KCk7XG52YXIgaW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShyZW5kZXJEYXRhLCBjYW1lcmEuaHNpemUsIGNhbWVyYS52c2l6ZSk7XG52YXIgY3R4ID0gcmF5dHJhY2VyQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbmN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuXG5cblxuXG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=