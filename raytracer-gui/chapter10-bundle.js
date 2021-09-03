/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../raytracer/dist/camera.js":
/*!***********************************!*\
  !*** ../raytracer/dist/camera.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Camera = void 0;
const canvas_1 = __webpack_require__(/*! ./canvas */ "../raytracer/dist/canvas.js");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const ray_1 = __webpack_require__(/*! ./ray */ "../raytracer/dist/ray.js");
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
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
//# sourceMappingURL=camera.js.map

/***/ }),

/***/ "../raytracer/dist/canvas.js":
/*!***********************************!*\
  !*** ../raytracer/dist/canvas.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Canvas = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/dist/color.js");
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
//# sourceMappingURL=canvas.js.map

/***/ }),

/***/ "../raytracer/dist/collection.js":
/*!***************************************!*\
  !*** ../raytracer/dist/collection.js ***!
  \***************************************/
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
//# sourceMappingURL=collection.js.map

/***/ }),

/***/ "../raytracer/dist/color.js":
/*!**********************************!*\
  !*** ../raytracer/dist/color.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Color = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/dist/constants.js");
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
//# sourceMappingURL=color.js.map

/***/ }),

/***/ "../raytracer/dist/computations.js":
/*!*****************************************!*\
  !*** ../raytracer/dist/computations.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Computations = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/dist/constants.js");
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
//# sourceMappingURL=computations.js.map

/***/ }),

/***/ "../raytracer/dist/constants.js":
/*!**************************************!*\
  !*** ../raytracer/dist/constants.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EPSILON = void 0;
exports.EPSILON = 0.00001;
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "../raytracer/dist/intersection.js":
/*!*****************************************!*\
  !*** ../raytracer/dist/intersection.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Intersections = exports.Intersection = void 0;
const collection_1 = __webpack_require__(/*! ./collection */ "../raytracer/dist/collection.js");
const sort_1 = __webpack_require__(/*! ./sort */ "../raytracer/dist/sort.js");
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
//# sourceMappingURL=intersection.js.map

/***/ }),

/***/ "../raytracer/dist/material.js":
/*!*************************************!*\
  !*** ../raytracer/dist/material.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Material = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/dist/color.js");
class Material {
    constructor() {
        this.color = color_1.Color.WHITE.clone();
        this.ambient = 0.1;
        this.diffuse = 0.9;
        this.specular = 0.9;
        this.shininess = 200;
        this.pattern = null;
    }
    lighting(light, object, point, eyev, normalv, inShadow = false) {
        var color = this.pattern != null ? this.pattern.patternAtShape(object, point) : this.color;
        var effectiveColor = color.hadamardProduct(light.intensity);
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
//# sourceMappingURL=material.js.map

/***/ }),

/***/ "../raytracer/dist/matrix.js":
/*!***********************************!*\
  !*** ../raytracer/dist/matrix.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Matrix3x3 = exports.Matrix2x2 = exports.Matrix4x4 = exports.Matrix = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/dist/constants.js");
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
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
                matrix.data[index] = this.data[indexTransposed];
                matrix.data[indexTransposed] = this.data[index];
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
//# sourceMappingURL=matrix.js.map

/***/ }),

/***/ "../raytracer/dist/patterns.js":
/*!*************************************!*\
  !*** ../raytracer/dist/patterns.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PerlinPattern = exports.Checker3DPattern4Sphere = exports.Checker3dPattern = exports.RingPattern = exports.GradientPattern = exports.StripePattern = exports.Pattern = void 0;
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const fast_simplex_noise_1 = __webpack_require__(/*! fast-simplex-noise */ "../raytracer/node_modules/fast-simplex-noise/lib/mod.js");
class Pattern {
    constructor(transform) {
        this.transform = transform;
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
    patternAtShape(object, worldPoint) {
        var objectPoint = object.inverseTransform.multiply(worldPoint);
        var patternPoint = this.inverseTransform.multiply(objectPoint);
        return this.patternAt(patternPoint);
    }
}
exports.Pattern = Pattern;
Pattern.tempMatrix1 = new matrix_1.Matrix4x4();
class StripePattern extends Pattern {
    constructor(a, b, transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.colors = [a, b];
    }
    get a() {
        return this.colors[0];
    }
    get b() {
        return this.colors[1];
    }
    patternAt(point) {
        return this.colors[Math.floor(Math.abs(point.x)) % 2];
    }
}
exports.StripePattern = StripePattern;
class GradientPattern extends Pattern {
    constructor(a, b, transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.a = a;
        this.b = b;
    }
    patternAt(point) {
        var distance = this.b.substract(this.a);
        var fraction = point.x - Math.floor(point.x);
        return this.a.add(distance.multiply(fraction));
    }
}
exports.GradientPattern = GradientPattern;
class RingPattern extends Pattern {
    constructor(a, b, transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.a = a;
        this.b = b;
    }
    patternAt(point) {
        return (Math.floor(Math.sqrt(point.x * point.x + point.z * point.z)) % 2 == 0) ? this.a : this.b;
    }
}
exports.RingPattern = RingPattern;
class Checker3dPattern extends Pattern {
    constructor(a, b, transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.a = a;
        this.b = b;
    }
    patternAt(point) {
        return ((Math.floor(point.x) + Math.floor(point.y) + Math.floor(point.z)) % 2 == 0) ? this.a : this.b;
    }
}
exports.Checker3dPattern = Checker3dPattern;
class Checker3DPattern4Sphere extends Pattern {
    constructor(a, b, transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone(), uvScale = 1) {
        super(transform);
        this.a = a;
        this.b = b;
        this.uvScale = uvScale;
    }
    patternAt(point) {
        var tu = Math.atan2(point.x, point.z) / Math.PI / 2 * this.uvScale;
        var tv = point.y / 2 * this.uvScale;
        return (((Math.floor(tu) + Math.floor(tv))) % 2 == 0) ? this.a : this.b;
    }
}
exports.Checker3DPattern4Sphere = Checker3DPattern4Sphere;
class PerlinPattern extends Pattern {
    constructor(a, b, threshold = 0.5, seed = Math.random(), transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.a = a;
        this.b = b;
        this.noise3d = fast_simplex_noise_1.makeNoise3D(() => seed);
        this.threshold = threshold;
    }
    patternAt(point) {
        return this.noise3d(point.x, point.y, point.z) > this.threshold ? this.a : this.b;
    }
}
exports.PerlinPattern = PerlinPattern;
//# sourceMappingURL=patterns.js.map

/***/ }),

/***/ "../raytracer/dist/plane.js":
/*!**********************************!*\
  !*** ../raytracer/dist/plane.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Plane = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/dist/intersection.js");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const material_1 = __webpack_require__(/*! ./material */ "../raytracer/dist/material.js");
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/dist/constants.js");
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
//# sourceMappingURL=plane.js.map

/***/ }),

/***/ "../raytracer/dist/pointLight.js":
/*!***************************************!*\
  !*** ../raytracer/dist/pointLight.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PointLight = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/dist/color.js");
class PointLight {
    constructor(position, intensity) {
        this.positon = position !== null && position !== void 0 ? position : tuple_1.Tuple.point(0, 0, 0);
        this.intensity = intensity !== null && intensity !== void 0 ? intensity : new color_1.Color(1, 1, 1);
    }
}
exports.PointLight = PointLight;
//# sourceMappingURL=pointLight.js.map

/***/ }),

/***/ "../raytracer/dist/ray.js":
/*!********************************!*\
  !*** ../raytracer/dist/ray.js ***!
  \********************************/
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
//# sourceMappingURL=ray.js.map

/***/ }),

/***/ "../raytracer/dist/sort.js":
/*!*********************************!*\
  !*** ../raytracer/dist/sort.js ***!
  \*********************************/
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
//# sourceMappingURL=sort.js.map

/***/ }),

/***/ "../raytracer/dist/sphere.js":
/*!***********************************!*\
  !*** ../raytracer/dist/sphere.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sphere = void 0;
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/dist/intersection.js");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const material_1 = __webpack_require__(/*! ./material */ "../raytracer/dist/material.js");
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
//# sourceMappingURL=sphere.js.map

/***/ }),

/***/ "../raytracer/dist/tuple.js":
/*!**********************************!*\
  !*** ../raytracer/dist/tuple.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tuple = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../raytracer/dist/constants.js");
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
//# sourceMappingURL=tuple.js.map

/***/ }),

/***/ "../raytracer/dist/world.js":
/*!**********************************!*\
  !*** ../raytracer/dist/world.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.World = void 0;
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/dist/color.js");
const computations_1 = __webpack_require__(/*! ./computations */ "../raytracer/dist/computations.js");
const intersection_1 = __webpack_require__(/*! ./intersection */ "../raytracer/dist/intersection.js");
const ray_1 = __webpack_require__(/*! ./ray */ "../raytracer/dist/ray.js");
class World {
    constructor() {
    }
    shadeHit(comps) {
        return comps.object.material.lighting(this.light, comps.object, comps.point, comps.eyev, comps.normalv, this.isShadowed(comps.overPoint));
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
//# sourceMappingURL=world.js.map

/***/ }),

/***/ "../raytracer/node_modules/fast-simplex-noise/lib/2d.js":
/*!**************************************************************!*\
  !*** ../raytracer/node_modules/fast-simplex-noise/lib/2d.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


/*
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeNoise2D = void 0;
var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
var Grad = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
];
function makeNoise2D(random) {
    if (random === void 0) { random = Math.random; }
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++)
        p[i] = i;
    var n;
    var q;
    for (var i = 255; i > 0; i--) {
        n = Math.floor((i + 1) * random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
    }
    var perm = new Uint8Array(512);
    var permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = perm[i] % 12;
    }
    return function (x, y) {
        // Skew the input space to determine which simplex cell we're in
        var s = (x + y) * 0.5 * (Math.sqrt(3.0) - 1.0); // Hairy factor for 2D
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = x - X0; // The x,y distances from the cell origin
        var y0 = y - Y0;
        // Determine which simplex we are in.
        var i1 = x0 > y0 ? 1 : 0;
        var j1 = x0 > y0 ? 0 : 1;
        // Offsets for corners
        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2;
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var g0 = Grad[permMod12[ii + perm[jj]]];
        var g1 = Grad[permMod12[ii + i1 + perm[jj + j1]]];
        var g2 = Grad[permMod12[ii + 1 + perm[jj + 1]]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        var n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0);
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        var n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1);
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        var n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2);
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1, 1]
        return 70.14805770653952 * (n0 + n1 + n2);
    };
}
exports.makeNoise2D = makeNoise2D;


/***/ }),

/***/ "../raytracer/node_modules/fast-simplex-noise/lib/3d.js":
/*!**************************************************************!*\
  !*** ../raytracer/node_modules/fast-simplex-noise/lib/3d.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


/*
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeNoise3D = void 0;
var G3 = 1.0 / 6.0;
var Grad = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, -1],
    [0, 1, -1],
    [0, -1, -1],
];
function makeNoise3D(random) {
    if (random === void 0) { random = Math.random; }
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++)
        p[i] = i;
    var n;
    var q;
    for (var i = 255; i > 0; i--) {
        n = Math.floor((i + 1) * random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
    }
    var perm = new Uint8Array(512);
    var permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = perm[i] % 12;
    }
    return function (x, y, z) {
        // Skew the input space to determine which simplex cell we're in
        var s = (x + y + z) / 3.0; // Very nice and simple skew factor for 3D
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);
        var t = (i + j + k) * G3;
        var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = x - X0; // The x,y,z distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        // Deterine which simplex we are in
        var i1, j1, k1 // Offsets for second corner of simplex in (i,j,k) coords
        ;
        var i2, j2, k2 // Offsets for third corner of simplex in (i,j,k) coords
        ;
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = i2 = j2 = 1;
                j1 = k1 = k2 = 0;
            }
            else if (x0 >= z0) {
                i1 = i2 = k2 = 1;
                j1 = k1 = j2 = 0;
            }
            else {
                k1 = i2 = k2 = 1;
                i1 = j1 = j2 = 0;
            }
        }
        else {
            if (y0 < z0) {
                k1 = j2 = k2 = 1;
                i1 = j1 = i2 = 0;
            }
            else if (x0 < z0) {
                j1 = j2 = k2 = 1;
                i1 = k1 = i2 = 0;
            }
            else {
                j1 = i2 = j2 = 1;
                i1 = k1 = k2 = 0;
            }
        }
        var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
        var y2 = y0 - j2 + 2.0 * G3;
        var z2 = z0 - k2 + 2.0 * G3;
        var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
        var y3 = y0 - 1.0 + 3.0 * G3;
        var z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var g0 = Grad[permMod12[ii + perm[jj + perm[kk]]]];
        var g1 = Grad[permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]];
        var g2 = Grad[permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]];
        var g3 = Grad[permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]];
        // Calculate the contribution from the four corners
        var t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
        var n0 = t0 < 0
            ? 0.0
            : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
        var t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
        var n1 = t1 < 0
            ? 0.0
            : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
        var t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
        var n2 = t2 < 0
            ? 0.0
            : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
        var t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
        var n3 = t3 < 0
            ? 0.0
            : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 94.68493150681972 * (n0 + n1 + n2 + n3);
    };
}
exports.makeNoise3D = makeNoise3D;


/***/ }),

/***/ "../raytracer/node_modules/fast-simplex-noise/lib/4d.js":
/*!**************************************************************!*\
  !*** ../raytracer/node_modules/fast-simplex-noise/lib/4d.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


/*
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeNoise4D = void 0;
var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
var Grad = [
    [0, 1, 1, 1],
    [0, 1, 1, -1],
    [0, 1, -1, 1],
    [0, 1, -1, -1],
    [0, -1, 1, 1],
    [0, -1, 1, -1],
    [0, -1, -1, 1],
    [0, -1, -1, -1],
    [1, 0, 1, 1],
    [1, 0, 1, -1],
    [1, 0, -1, 1],
    [1, 0, -1, -1],
    [-1, 0, 1, 1],
    [-1, 0, 1, -1],
    [-1, 0, -1, 1],
    [-1, 0, -1, -1],
    [1, 1, 0, 1],
    [1, 1, 0, -1],
    [1, -1, 0, 1],
    [1, -1, 0, -1],
    [-1, 1, 0, 1],
    [-1, 1, 0, -1],
    [-1, -1, 0, 1],
    [-1, -1, 0, -1],
    [1, 1, 1, 0],
    [1, 1, -1, 0],
    [1, -1, 1, 0],
    [1, -1, -1, 0],
    [-1, 1, 1, 0],
    [-1, 1, -1, 0],
    [-1, -1, 1, 0],
    [-1, -1, -1, 0],
];
function makeNoise4D(random) {
    if (random === void 0) { random = Math.random; }
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++)
        p[i] = i;
    var n;
    var q;
    for (var i = 255; i > 0; i--) {
        n = Math.floor((i + 1) * random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
    }
    var perm = new Uint8Array(512);
    var permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = perm[i] % 12;
    }
    return function (x, y, z, w) {
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        var s = (x + y + z + w) * (Math.sqrt(5.0) - 1.0) / 4.0; // Factor for 4D skewing
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);
        var l = Math.floor(w + s);
        var t = (i + j + k + l) * G4; // Factor for 4D unskewing
        var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
        var Y0 = j - t;
        var Z0 = k - t;
        var W0 = l - t;
        var x0 = x - X0; // The x,y,z,w distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        var w0 = w - W0;
        // To find out which of the 24 possible simplices we're in, we need to determine the
        // magnitude ordering of x0, y0, z0 and w0. Six pair-wise comparisons are performed between
        // each possible pair of the four coordinates, and the results are used to rank the numbers.
        var rankx = 0;
        var ranky = 0;
        var rankz = 0;
        var rankw = 0;
        if (x0 > y0)
            rankx++;
        else
            ranky++;
        if (x0 > z0)
            rankx++;
        else
            rankz++;
        if (x0 > w0)
            rankx++;
        else
            rankw++;
        if (y0 > z0)
            ranky++;
        else
            rankz++;
        if (y0 > w0)
            ranky++;
        else
            rankw++;
        if (z0 > w0)
            rankz++;
        else
            rankw++;
        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        var i1 = rankx >= 3 ? 1 : 0;
        var j1 = ranky >= 3 ? 1 : 0;
        var k1 = rankz >= 3 ? 1 : 0;
        var l1 = rankw >= 3 ? 1 : 0;
        // Rank 2 denotes the second largest coordinate.
        var i2 = rankx >= 2 ? 1 : 0;
        var j2 = ranky >= 2 ? 1 : 0;
        var k2 = rankz >= 2 ? 1 : 0;
        var l2 = rankw >= 2 ? 1 : 0;
        // Rank 1 denotes the second smallest coordinate.
        var i3 = rankx >= 1 ? 1 : 0;
        var j3 = ranky >= 1 ? 1 : 0;
        var k3 = rankz >= 1 ? 1 : 0;
        var l3 = rankw >= 1 ? 1 : 0;
        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
        var y1 = y0 - j1 + G4;
        var z1 = z0 - k1 + G4;
        var w1 = w0 - l1 + G4;
        var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
        var y2 = y0 - j2 + 2.0 * G4;
        var z2 = z0 - k2 + 2.0 * G4;
        var w2 = w0 - l2 + 2.0 * G4;
        var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
        var y3 = y0 - j3 + 3.0 * G4;
        var z3 = z0 - k3 + 3.0 * G4;
        var w3 = w0 - l3 + 3.0 * G4;
        var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
        var y4 = y0 - 1.0 + 4.0 * G4;
        var z4 = z0 - 1.0 + 4.0 * G4;
        var w4 = w0 - 1.0 + 4.0 * G4;
        // Work out the hashed gradient indices of the five simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var ll = l & 255;
        var g0 = Grad[perm[ii + perm[jj + perm[kk + perm[ll]]]] %
            32];
        var g1 = Grad[perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32];
        var g2 = Grad[perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32];
        var g3 = Grad[perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32];
        var g4 = Grad[perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32];
        // Calculate the contribution from the five corners
        var t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        var n0 = t0 < 0
            ? 0.0
            : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0 + g0[3] * w0);
        var t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        var n1 = t1 < 0
            ? 0.0
            : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1 + g1[3] * w1);
        var t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        var n2 = t2 < 0
            ? 0.0
            : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2 + g2[3] * w2);
        var t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        var n3 = t3 < 0
            ? 0.0
            : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3 + g3[3] * w3);
        var t4 = 0.5 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        var n4 = t4 < 0
            ? 0.0
            : Math.pow(t4, 4) * (g4[0] * x4 + g4[1] * y4 + g4[2] * z4 + g4[3] * w4);
        // Sum up and scale the result to cover the range [-1,1]
        return 72.37855765153665 * (n0 + n1 + n2 + n3 + n4);
    };
}
exports.makeNoise4D = makeNoise4D;


/***/ }),

/***/ "../raytracer/node_modules/fast-simplex-noise/lib/mod.js":
/*!***************************************************************!*\
  !*** ../raytracer/node_modules/fast-simplex-noise/lib/mod.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeNoise4D = exports.makeNoise3D = exports.makeNoise2D = void 0;
var _2d_1 = __webpack_require__(/*! ./2d */ "../raytracer/node_modules/fast-simplex-noise/lib/2d.js");
Object.defineProperty(exports, "makeNoise2D", ({ enumerable: true, get: function () { return _2d_1.makeNoise2D; } }));
var _3d_1 = __webpack_require__(/*! ./3d */ "../raytracer/node_modules/fast-simplex-noise/lib/3d.js");
Object.defineProperty(exports, "makeNoise3D", ({ enumerable: true, get: function () { return _3d_1.makeNoise3D; } }));
var _4d_1 = __webpack_require__(/*! ./4d */ "../raytracer/node_modules/fast-simplex-noise/lib/4d.js");
Object.defineProperty(exports, "makeNoise4D", ({ enumerable: true, get: function () { return _4d_1.makeNoise4D; } }));


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
/*!**************************!*\
  !*** ./src/chapter10.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const color_1 = __webpack_require__(/*! raytracer/color */ "../raytracer/dist/color.js");
const material_1 = __webpack_require__(/*! raytracer/material */ "../raytracer/dist/material.js");
const matrix_1 = __webpack_require__(/*! raytracer/matrix */ "../raytracer/dist/matrix.js");
const pointLight_1 = __webpack_require__(/*! raytracer/pointLight */ "../raytracer/dist/pointLight.js");
const world_1 = __webpack_require__(/*! raytracer/world */ "../raytracer/dist/world.js");
const sphere_1 = __webpack_require__(/*! raytracer/sphere */ "../raytracer/dist/sphere.js");
const tuple_1 = __webpack_require__(/*! raytracer/tuple */ "../raytracer/dist/tuple.js");
const camera_1 = __webpack_require__(/*! raytracer/camera */ "../raytracer/dist/camera.js");
const plane_1 = __webpack_require__(/*! raytracer/plane */ "../raytracer/dist/plane.js");
const patterns_1 = __webpack_require__(/*! raytracer/patterns */ "../raytracer/dist/patterns.js");
const constants_1 = __webpack_require__(/*! raytracer/constants */ "../raytracer/dist/constants.js");
var world = new world_1.World();
var floor = new plane_1.Plane(0);
floor.material = new material_1.Material();
floor.material.pattern = new patterns_1.GradientPattern(new color_1.Color(0.2, 0.4, 0.5), new color_1.Color(0.1, 0.9, 0.7));
floor.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1));
var middle = new sphere_1.Sphere(3);
middle.transform = matrix_1.Matrix4x4.translation(0, 1, 0).multiply(matrix_1.Matrix4x4.rotationY(0.1).multiply(matrix_1.Matrix4x4.rotationZ(0.2)));
middle.material = new material_1.Material();
middle.material.color = new color_1.Color(0.1, 1, 0.5);
middle.material.diffuse = 0.7;
middle.material.specular = 0.3;
middle.material.pattern = new patterns_1.StripePattern(new color_1.Color(0.1, 0.1, 0.6), new color_1.Color(0.1, 0.7, 0.2), matrix_1.Matrix4x4.translation(1, 0, 0).multiply(matrix_1.Matrix4x4.scaling(0.2, 0.2, 0.2)));
var right = new sphere_1.Sphere(4);
right.transform = matrix_1.Matrix4x4.translation(2, 0.5, -0.5).multiply(matrix_1.Matrix4x4.scaling(0.5, 0.5, 0.5));
right.material = new material_1.Material();
right.material.color = new color_1.Color(0.1, 0.7, 0.2);
right.material.diffuse = 0.7;
right.material.specular = 0.3;
right.material.pattern = new patterns_1.PerlinPattern(new color_1.Color(0.1, 0.7, 0.2), new color_1.Color(1, 1, 1), 0.15);
var left = new sphere_1.Sphere(5);
left.transform = matrix_1.Matrix4x4.translation(-5, 2, 9).multiply(matrix_1.Matrix4x4.scaling(2, 2, 2));
left.material = new material_1.Material();
left.material.color = new color_1.Color(1, 0.8, 0.1);
left.material.diffuse = 0.7;
left.material.specular = 0.3;
left.material.pattern = new patterns_1.Checker3DPattern4Sphere(new color_1.Color(0.9, 0.9, 0.9), new color_1.Color(0.1, 0.1, 0.1), matrix_1.Matrix4x4.IDENTITY_MATRIX.clone(), 20);
var wall = new plane_1.Plane(6);
wall.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2)));
wall.material = new material_1.Material();
wall.material.color = new color_1.Color(1, 1, 1);
wall.material.diffuse = 0.7;
wall.material.specular = 0.3;
wall.material.pattern = new patterns_1.RingPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.scaling(1, 1, 1));
var wall2 = new plane_1.Plane(7);
wall2.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1 - Math.PI / 2).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2)));
wall2.material = new material_1.Material();
wall2.material.color = new color_1.Color(0, 0, 0.8);
wall2.material.diffuse = 0.7;
wall2.material.specular = 0.3;
wall2.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
world.objects = [left, right, middle, floor, wall, wall2];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFp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Iiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW1lcmEuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW52YXMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb2xsZWN0aW9uLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29sb3IuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb21wdXRhdGlvbnMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9pbnRlcnNlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9tYXRlcmlhbC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L21hdHJpeC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3BhdHRlcm5zLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcGxhbmUuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9wb2ludExpZ2h0LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcmF5LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc29ydC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3NwaGVyZS5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3R1cGxlLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvd29ybGQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvMmQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvM2QuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvNGQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvbW9kLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uL3NyYy9jaGFwdGVyMTAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhbWVyYSA9IHZvaWQgMDtcbmNvbnN0IGNhbnZhc18xID0gcmVxdWlyZShcIi4vY2FudmFzXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCByYXlfMSA9IHJlcXVpcmUoXCIuL3JheVwiKTtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNsYXNzIENhbWVyYSB7XG4gICAgY29uc3RydWN0b3IoaHNpemUsIHZzaXplLCBmaWVsZE9mVmlldywgdHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMuaHNpemUgPSBoc2l6ZTtcbiAgICAgICAgdGhpcy52c2l6ZSA9IHZzaXplO1xuICAgICAgICB0aGlzLmZpZWxkT2ZWaWV3ID0gZmllbGRPZlZpZXc7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtICE9PSBudWxsICYmIHRyYW5zZm9ybSAhPT0gdm9pZCAwID8gdHJhbnNmb3JtIDogbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBnZXQgaGFsZldpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICAgIH1cbiAgICBnZXQgaGFsZmhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbGZXaWR0aDtcbiAgICB9XG4gICAgZ2V0IHBpeGVsU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BpeGVsU2l6ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAgICovXG4gICAgZ2V0IHRyYW5zZm9ybSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICB9XG4gICAgc2V0IHRyYW5zZm9ybSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtID0gdmFsdWUuaW52ZXJzZSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiByZWNhbGN1bGF0ZSBkZXJpdmVkIHZhbHVlc1xuICAgICAqL1xuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdmFyIGhhbGZWaWV3ID0gTWF0aC50YW4odGhpcy5maWVsZE9mVmlldyAvIDIpO1xuICAgICAgICB2YXIgYXNwZWN0ID0gdGhpcy5oc2l6ZSAvIHRoaXMudnNpemU7XG4gICAgICAgIGlmIChhc3BlY3QgPj0gMSkge1xuICAgICAgICAgICAgdGhpcy5faGFsZldpZHRoID0gaGFsZlZpZXc7XG4gICAgICAgICAgICB0aGlzLl9oYWxmSGVpZ2h0ID0gaGFsZlZpZXcgLyBhc3BlY3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9oYWxmV2lkdGggPSBoYWxmVmlldyAqIGFzcGVjdDtcbiAgICAgICAgICAgIHRoaXMuX2hhbGZIZWlnaHQgPSBoYWxmVmlldztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9waXhlbFNpemUgPSAodGhpcy5faGFsZldpZHRoICogMikgLyB0aGlzLmhzaXplO1xuICAgIH1cbiAgICByYXlGb3JQaXhlbCh4LCB5KSB7XG4gICAgICAgIHZhciB4T2Zmc2V0ID0gKHggKyAwLjUpICogdGhpcy5fcGl4ZWxTaXplO1xuICAgICAgICB2YXIgeU9mZnNldCA9ICh5ICsgMC41KSAqIHRoaXMuX3BpeGVsU2l6ZTtcbiAgICAgICAgdmFyIHdvcmxkWCA9IHRoaXMuX2hhbGZXaWR0aCAtIHhPZmZzZXQ7XG4gICAgICAgIHZhciB3b3JsZFkgPSB0aGlzLl9oYWxmSGVpZ2h0IC0geU9mZnNldDtcbiAgICAgICAgdmFyIHBpeGVsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHR1cGxlXzEuVHVwbGUucG9pbnQod29ybGRYLCB3b3JsZFksIC0xKSk7XG4gICAgICAgIHZhciBvcmlnaW4gPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkodHVwbGVfMS5UdXBsZS5wb2ludCgwLCAwLCAwKSk7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBwaXhlbC5zdWJzdHJhY3Qob3JpZ2luKS5ub3JtYWxpemUoKTtcbiAgICAgICAgcmV0dXJuIG5ldyByYXlfMS5SYXkob3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgIH1cbiAgICByZW5kZXIod29ybGQpIHtcbiAgICAgICAgdmFyIGltYWdlID0gbmV3IGNhbnZhc18xLkNhbnZhcyh0aGlzLmhzaXplLCB0aGlzLnZzaXplKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLnZzaXplOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5oc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJheSA9IHRoaXMucmF5Rm9yUGl4ZWwoeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICAgICAgICAgIGltYWdlLndyaXRlUGl4ZWwoeCwgeSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG59XG5leHBvcnRzLkNhbWVyYSA9IENhbWVyYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbWVyYS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FudmFzID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgQ2FudmFzIHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFBpeGVsKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5IDwgMCB8fCB5ID49IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdmFyIHBpeGVsSW5kZXggPSBNYXRoLmZsb29yKHkpICogdGhpcy53aWR0aCAqIDMgKyBNYXRoLmZsb29yKHgpICogMztcbiAgICAgICAgcmV0dXJuIG5ldyBjb2xvcl8xLkNvbG9yKHRoaXMuZGF0YVtwaXhlbEluZGV4XSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAxXSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSk7XG4gICAgfVxuICAgIHdyaXRlUGl4ZWwoeCwgeSwgYykge1xuICAgICAgICBpZiAoeCA8IDAgfHwgeCA+PSB0aGlzLndpZHRoIHx8IHkgPCAwIHx8IHkgPj0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciBwaXhlbEluZGV4ID0gTWF0aC5mbG9vcih5KSAqIHRoaXMud2lkdGggKiAzICsgTWF0aC5mbG9vcih4KSAqIDM7XG4gICAgICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4XSA9IGMucmVkO1xuICAgICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleCArIDFdID0gYy5ncmVlbjtcbiAgICAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSA9IGMuYmx1ZTtcbiAgICB9XG4gICAgdG9QcG0oKSB7XG4gICAgICAgIHZhciBwcG0gPSBcIlAzXFxuXCI7XG4gICAgICAgIHBwbSArPSB0aGlzLndpZHRoICsgXCIgXCIgKyB0aGlzLmhlaWdodCArIFwiXFxuXCI7XG4gICAgICAgIHBwbSArPSBcIjI1NVwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcHBtICs9IChpICUgMTUgPT0gMCkgPyBcIlxcblwiIDogXCIgXCI7XG4gICAgICAgICAgICBwcG0gKz0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaV0gKiAyNTUpLCAyNTUpLCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2kgKyAxXSAqIDI1NSksIDI1NSksIDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICArIFwiIFwiICsgTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSArIDJdICogMjU1KSwgMjU1KSwgMCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBwcG0gKz0gXCJcXG5cIjtcbiAgICAgICAgcmV0dXJuIHBwbTtcbiAgICB9XG4gICAgdG9VaW50OENsYW1wZWRBcnJheSgpIHtcbiAgICAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiA0KTtcbiAgICAgICAgdmFyIGFyckluZGV4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGFyclthcnJJbmRleF0gPSB0aGlzLmRhdGFbaV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAxXSA9IHRoaXMuZGF0YVtpICsgMV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAyXSA9IHRoaXMuZGF0YVtpICsgMl0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAzXSA9IDI1NTtcbiAgICAgICAgICAgIGFyckluZGV4ICs9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG59XG5leHBvcnRzLkNhbnZhcyA9IENhbnZhcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbnZhcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2JqZWN0UG9vbCA9IHZvaWQgMDtcbi8qKlxuICogT2JqZWN0IHBvb2wgdGhhdCB3aWxsIG1pbmltaXplIGdhcmJhZ2UgY29sbGVjdGlvbiB1c2FnZVxuICovXG5jbGFzcyBPYmplY3RQb29sIHtcbiAgICBjb25zdHJ1Y3RvcihhcnJheUxlbmd0aCA9IDApIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IG5ldyBBcnJheShhcnJheUxlbmd0aCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSB0aGlzLmNyZWF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobmV3SXRlbSwgaSk7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbmRleE9mKGl0ZW0pIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLmluZGV4TWFwLmdldChpdGVtKTtcbiAgICAgICAgcmV0dXJuIChpID09PSB1bmRlZmluZWQgfHwgaSA+PSB0aGlzLl9sZW5ndGgpID8gLTEgOiBpO1xuICAgIH1cbiAgICByZW1vdmUoYSkge1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW5kZXhNYXAuZ2V0KGEpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sZW5ndGgtLTtcbiAgICAgICAgdmFyIHJlbW92ZUl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgdmFyIGxhc3RJdGVtID0gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdO1xuICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IGxhc3RJdGVtO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF0gPSByZW1vdmVJdGVtO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChyZW1vdmVJdGVtLCB0aGlzLl9sZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChsYXN0SXRlbSwgaW5kZXgpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiB1bnVzZWQgaXRlbSBvciBjcmVhdGVzIGEgbmV3IG9uZSwgaWYgbm8gdW51c2VkIGl0ZW0gYXZhaWxhYmxlXG4gICAgKi9cbiAgICBhZGQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PSB0aGlzLl9sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sIHRoaXMuX2xlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9sZW5ndGggPSB0aGlzLml0ZW1zLnB1c2gobmV3SXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGgrK107XG4gICAgfVxuICAgIGdldChpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cbn1cbmV4cG9ydHMuT2JqZWN0UG9vbCA9IE9iamVjdFBvb2w7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb2xsZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db2xvciA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29sb3Ige1xuICAgIGNvbnN0cnVjdG9yKHJlZCwgZ3JlZW4sIGJsdWUpIHtcbiAgICAgICAgdGhpcy5yZWQgPSByZWQ7XG4gICAgICAgIHRoaXMuZ3JlZW4gPSBncmVlbjtcbiAgICAgICAgdGhpcy5ibHVlID0gYmx1ZTtcbiAgICB9XG4gICAgYWRkKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKyBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKyBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICsgY29sb3IuYmx1ZSk7XG4gICAgfVxuICAgIG11bHRpcGx5KHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICogc2NhbGFyLCB0aGlzLmdyZWVuICogc2NhbGFyLCB0aGlzLmJsdWUgKiBzY2FsYXIpO1xuICAgIH1cbiAgICBkaXZpZGUoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLyBzY2FsYXIsIHRoaXMuZ3JlZW4gLyBzY2FsYXIsIHRoaXMuYmx1ZSAvIHNjYWxhcik7XG4gICAgfVxuICAgIHN1YnN0cmFjdChjb2xvcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkIC0gY29sb3IucmVkLCB0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4sIHRoaXMuYmx1ZSAtIGNvbG9yLmJsdWUpO1xuICAgIH1cbiAgICBoYWRhbWFyZFByb2R1Y3QoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAqIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAqIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgKiBjb2xvci5ibHVlKTtcbiAgICB9XG4gICAgZXF1YWxzKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnJlZCAtIGNvbG9yLnJlZCkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4pIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ibHVlIC0gY29sb3IuYmx1ZSkgPCBjb25zdGFudHNfMS5FUFNJTE9OO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCwgdGhpcy5ncmVlbiwgdGhpcy5ibHVlKTtcbiAgICB9XG59XG5leHBvcnRzLkNvbG9yID0gQ29sb3I7XG5Db2xvci5CTEFDSyA9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDAsIDAsIDApKTtcbkNvbG9yLldISVRFID0gT2JqZWN0LmZyZWV6ZShuZXcgQ29sb3IoMSwgMSwgMSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sb3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbXB1dGF0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29tcHV0YXRpb25zIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgc3RhdGljIHByZXBhcmUoaW50ZXJzZWN0aW9uLCByYXkpIHtcbiAgICAgICAgdmFyIGNvbXBzID0gbmV3IENvbXB1dGF0aW9ucygpO1xuICAgICAgICBjb21wcy50ID0gaW50ZXJzZWN0aW9uLnQ7XG4gICAgICAgIGNvbXBzLm9iamVjdCA9IGludGVyc2VjdGlvbi5vYmplY3Q7XG4gICAgICAgIGNvbXBzLnBvaW50ID0gcmF5LnBvc2l0aW9uKGNvbXBzLnQpO1xuICAgICAgICBjb21wcy5leWV2ID0gcmF5LmRpcmVjdGlvbi5uZWdhdGUoKTtcbiAgICAgICAgY29tcHMubm9ybWFsdiA9IGNvbXBzLm9iamVjdC5ub3JtYWxBdChjb21wcy5wb2ludCk7XG4gICAgICAgIGlmIChjb21wcy5ub3JtYWx2LmRvdChjb21wcy5leWV2KSA8IDApIHtcbiAgICAgICAgICAgIGNvbXBzLmluc2lkZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wcy5ub3JtYWx2ID0gY29tcHMubm9ybWFsdi5uZWdhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBzLmluc2lkZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBzLm92ZXJQb2ludCA9IGNvbXBzLnBvaW50LmFkZChjb21wcy5ub3JtYWx2Lm11bHRpcGx5KGNvbnN0YW50c18xLkVQU0lMT04pKTtcbiAgICAgICAgcmV0dXJuIGNvbXBzO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29tcHV0YXRpb25zID0gQ29tcHV0YXRpb25zO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcHV0YXRpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FUFNJTE9OID0gdm9pZCAwO1xuZXhwb3J0cy5FUFNJTE9OID0gMC4wMDAwMTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSW50ZXJzZWN0aW9ucyA9IGV4cG9ydHMuSW50ZXJzZWN0aW9uID0gdm9pZCAwO1xuY29uc3QgY29sbGVjdGlvbl8xID0gcmVxdWlyZShcIi4vY29sbGVjdGlvblwiKTtcbmNvbnN0IHNvcnRfMSA9IHJlcXVpcmUoXCIuL3NvcnRcIik7XG5jbGFzcyBJbnRlcnNlY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKHQsIG9iamVjdCkge1xuICAgICAgICB0aGlzLnQgPSB0O1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50ID09IGludGVyc2VjdGlvbi50ICYmIHRoaXMub2JqZWN0ID09PSBpbnRlcnNlY3Rpb24ub2JqZWN0O1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJzZWN0aW9uID0gSW50ZXJzZWN0aW9uO1xuY2xhc3MgSW50ZXJzZWN0aW9ucyBleHRlbmRzIGNvbGxlY3Rpb25fMS5PYmplY3RQb29sIHtcbiAgICBzdGF0aWMgc29ydEludGVyc2VjdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLnQgLSBiLnQ7XG4gICAgfVxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcnNlY3Rpb24oMCwgbnVsbCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBoaXQsIHJlZ2FyZGxlc3Mgb2Ygc29ydFxuICAgICovXG4gICAgaGl0KCkge1xuICAgICAgICB2YXIgaGl0ID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKChoaXQgPT0gbnVsbCB8fCBpdGVtLnQgPCBoaXQudCkgJiYgaXRlbS50ID4gMClcbiAgICAgICAgICAgICAgICBoaXQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxuICAgIHNvcnQoKSB7XG4gICAgICAgIHNvcnRfMS5tZXJnZVNvcnRJbnBsYWNlKHRoaXMuaXRlbXMsIEludGVyc2VjdGlvbnMuc29ydEludGVyc2VjdGlvbiwgMCwgdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGhpcy5pdGVtc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbnMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCAhPSBpbnRlcnNlY3Rpb25zLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1zW2ldLmVxdWFscyhpbnRlcnNlY3Rpb25zLml0ZW1zW2ldKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJzZWN0aW9ucyA9IEludGVyc2VjdGlvbnM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcnNlY3Rpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1hdGVyaWFsID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgTWF0ZXJpYWwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3JfMS5Db2xvci5XSElURS5jbG9uZSgpO1xuICAgICAgICB0aGlzLmFtYmllbnQgPSAwLjE7XG4gICAgICAgIHRoaXMuZGlmZnVzZSA9IDAuOTtcbiAgICAgICAgdGhpcy5zcGVjdWxhciA9IDAuOTtcbiAgICAgICAgdGhpcy5zaGluaW5lc3MgPSAyMDA7XG4gICAgICAgIHRoaXMucGF0dGVybiA9IG51bGw7XG4gICAgfVxuICAgIGxpZ2h0aW5nKGxpZ2h0LCBvYmplY3QsIHBvaW50LCBleWV2LCBub3JtYWx2LCBpblNoYWRvdyA9IGZhbHNlKSB7XG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMucGF0dGVybiAhPSBudWxsID8gdGhpcy5wYXR0ZXJuLnBhdHRlcm5BdFNoYXBlKG9iamVjdCwgcG9pbnQpIDogdGhpcy5jb2xvcjtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZUNvbG9yID0gY29sb3IuaGFkYW1hcmRQcm9kdWN0KGxpZ2h0LmludGVuc2l0eSk7XG4gICAgICAgIHZhciBhbWJpZW50ID0gZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5hbWJpZW50KTtcbiAgICAgICAgaWYgKGluU2hhZG93KVxuICAgICAgICAgICAgcmV0dXJuIGFtYmllbnQ7XG4gICAgICAgIHZhciBsaWdodHYgPSBsaWdodC5wb3NpdG9uLnN1YnN0cmFjdChwb2ludCkubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciBsaWdodERvdE5vcm1hbCA9IGxpZ2h0di5kb3Qobm9ybWFsdik7XG4gICAgICAgIHZhciBkaWZmdXNlO1xuICAgICAgICB2YXIgc3BlY3VsYXI7XG4gICAgICAgIGlmIChsaWdodERvdE5vcm1hbCA8IDApIHtcbiAgICAgICAgICAgIGRpZmZ1c2UgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICAgICAgc3BlY3VsYXIgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGlmZnVzZSA9IGVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuZGlmZnVzZSAqIGxpZ2h0RG90Tm9ybWFsKTtcbiAgICAgICAgICAgIHZhciByZWZsZWN0diA9IGxpZ2h0di5uZWdhdGUoKS5yZWZsZWN0KG5vcm1hbHYpO1xuICAgICAgICAgICAgdmFyIHJlZmxlY3REb3RFeWUgPSByZWZsZWN0di5kb3QoZXlldik7XG4gICAgICAgICAgICBpZiAocmVmbGVjdERvdEV5ZSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgc3BlY3VsYXIgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IE1hdGgucG93KHJlZmxlY3REb3RFeWUsIHRoaXMuc2hpbmluZXNzKTtcbiAgICAgICAgICAgICAgICBzcGVjdWxhciA9IGxpZ2h0LmludGVuc2l0eS5tdWx0aXBseSh0aGlzLnNwZWN1bGFyICogZmFjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYW1iaWVudC5hZGQoZGlmZnVzZSkuYWRkKHNwZWN1bGFyKTtcbiAgICB9XG59XG5leHBvcnRzLk1hdGVyaWFsID0gTWF0ZXJpYWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRlcmlhbC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTWF0cml4M3gzID0gZXhwb3J0cy5NYXRyaXgyeDIgPSBleHBvcnRzLk1hdHJpeDR4NCA9IGV4cG9ydHMuTWF0cml4ID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jbGFzcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIpIHtcbiAgICAgICAgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGE7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCA9PSAwIHx8IG1hdHJpeFswXS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBtYXRyaXhbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBtYXRyaXgubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gbWF0cml4W3ldO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJvd1t4XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBhO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBiO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvZmFjdG9yKHJvdywgY29sdW1uKSB7XG4gICAgICAgIHJldHVybiAoKHJvdyArIGNvbHVtbikgJSAyICogMiAtIDEpICogLXRoaXMubWlub3Iocm93LCBjb2x1bW4pO1xuICAgIH1cbiAgICBtaW5vcihyb3csIGNvbHVtbikge1xuICAgICAgICB2YXIgbSA9IHRoaXMuc3VibWF0cml4KHJvdywgY29sdW1uKTtcbiAgICAgICAgcmV0dXJuIG0uZGV0ZXJtaW5hbnQoKTtcbiAgICB9XG4gICAgaXNJbnZlcnRpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmFudCgpICE9IDA7XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICBpZiAodGhpcy53aWR0aCAhPSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSAyKVxuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeDJ4Mi5wcm90b3R5cGUuZGV0ZXJtaW5hbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIGRldCA9IDA7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICBkZXQgKz0gdGhpcy5kYXRhW3hdICogdGhpcy5jb2ZhY3RvcigwLCB4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgc3RyaW5nICs9IFwifFwiO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gdGhpcy5kYXRhW3RoaXMud2lkdGggKiB5ICsgeF0udG9GaXhlZCgyKSArIFwiXFx0fFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyaW5nICs9IFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG4gICAgZ2V0KHJvdywgY29sdW1uKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLndpZHRoICogcm93ICsgY29sdW1uXTtcbiAgICB9XG4gICAgc2V0KHJvdywgY29sdW1uLCB2YWx1ZSkge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMClcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHRoaXMuZGF0YVt0aGlzLndpZHRoICogcm93ICsgY29sdW1uXSA9IHZhbHVlO1xuICAgIH1cbiAgICBtdWx0aXBseShtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeC5oZWlnaHQgIT0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4KG1hdHJpeC53aWR0aCwgbWF0cml4LmhlaWdodCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBtYXRyaXguaGVpZ2h0OyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IG1hdHJpeC5kYXRhW3RoaXMud2lkdGggKiByICsgeF0gKiB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyByXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW3RoaXMud2lkdGggKiB5ICsgeF0gPSBzdW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIHRyYW5zcG9zZSgpIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IG5ldyBNYXRyaXgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IHk7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMud2lkdGggKiB5ICsgeDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXhUcmFuc3Bvc2VkID0gdGhpcy53aWR0aCAqIHggKyB5O1xuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4XSA9IHRoaXMuZGF0YVtpbmRleFRyYW5zcG9zZWRdO1xuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4VHJhbnNwb3NlZF0gPSB0aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXg7XG4gICAgfVxuICAgIHN1Ym1hdHJpeChyb3csIGNvbHVtbikge1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgodGhpcy53aWR0aCAtIDEsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIHZhciB5MiA9IDA7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgaWYgKHkgPT0gcm93KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgeDIgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeCA9PSBjb2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0uZGF0YVttLndpZHRoICogeTIgKyB4Ml0gPSB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XTtcbiAgICAgICAgICAgICAgICB4MisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeTIrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgZXF1YWxzKG1hdHJpeCkge1xuICAgICAgICBpZiAodGhpcy53aWR0aCAhPSBtYXRyaXgud2lkdGggfHwgdGhpcy5oZWlnaHQgIT0gbWF0cml4LmhlaWdodClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IE1hdGguYWJzKHRoaXMuZGF0YVtpXSAtIG1hdHJpeC5kYXRhW2ldKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA+PSBjb25zdGFudHNfMS5FUFNJTE9OKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXggPSBNYXRyaXg7XG5jbGFzcyBNYXRyaXg0eDQgZXh0ZW5kcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKG1hdHJpeCkge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoICE9IDQgfHwgbWF0cml4WzBdLmxlbmd0aCAhPSA0IHx8IG1hdHJpeFsxXS5sZW5ndGggIT0gNCB8fCBtYXRyaXhbMl0ubGVuZ3RoICE9IDQgfHwgbWF0cml4WzNdLmxlbmd0aCAhPSA0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlcihtYXRyaXgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoNCwgNCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHZpZXdUcmFuc2Zvcm0oZnJvbSwgdG8sIHVwLCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdmFyIGZvcndhcmQgPSB0by5zdWJzdHJhY3QoZnJvbSkubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciB1cG4gPSB1cC5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIGxlZnQgPSBmb3J3YXJkLmNyb3NzKHVwbik7XG4gICAgICAgIHZhciB0cnVlVXAgPSBsZWZ0LmNyb3NzKGZvcndhcmQpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IGxlZnQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSBsZWZ0Lnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gbGVmdC56O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHRydWVVcC54O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHRydWVVcC55O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHRydWVVcC56O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IC1mb3J3YXJkLng7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gLWZvcndhcmQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gLWZvcndhcmQuejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgTWF0cml4NHg0LnRyYW5zbGF0aW9uKC1mcm9tLngsIC1mcm9tLnksIC1mcm9tLnosIE1hdHJpeDR4NC50ZW1wTWF0cml4NHg0KTtcbiAgICAgICAgdGFyZ2V0Lm11bHRpcGx5KE1hdHJpeDR4NC50ZW1wTWF0cml4NHg0LCB0YXJnZXQpO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgdHJhbnNsYXRpb24oeCwgeSwgeiwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IHg7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0geTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHJvdGF0aW9uWChyYWRpYW5zLCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gLXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHJvdGF0aW9uWShyYWRpYW5zLCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gLXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSBzaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHJvdGF0aW9uWihyYWRpYW5zLCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luID0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IC1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHNjYWxpbmcoeCwgeSwgeiwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0geDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSB5O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSB6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHNoZWFyaW5nKHh5LCB4eiwgeXgsIHl6LCB6eCwgenksIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0geXg7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0geng7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0geHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSB6eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSB4ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB5ejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHRyYW5zcG9zZSh0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdmFyIHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSBzd2FwO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHRoaXMuZGF0YVs4XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBzd2FwO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSBzd2FwO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbMTFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSB0aGlzLmRhdGFbMTRdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBpbnZlcnNlKHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICB2YXIgZGV0ZXJtaW5hbnQgPSAoYTAwICogKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpICtcbiAgICAgICAgICAgIGEwMSAqIC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMyIC0gYTIyICogYTMwKSkgK1xuICAgICAgICAgICAgYTAyICogKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMyAqIC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkpO1xuICAgICAgICBpZiAoZGV0ZXJtaW5hbnQgPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMDIgKiAtKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMDMgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMDMgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpICsgYTAyICogLShhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAzICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGEwMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGEwMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMCAqIGEzMyAtIGExMyAqIGEzMCkgKyBhMDMgKiAoYTEwICogYTMyIC0gYTEyICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgKyBhMDIgKiAtKGExMCAqIGEyMyAtIGExMyAqIGEyMCkgKyBhMDMgKiAoYTEwICogYTIyIC0gYTEyICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTAzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IChhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEwMSAqIC0oYTEwICogYTMzIC0gYTEzICogYTMwKSArIGEwMyAqIChhMTAgKiBhMzEgLSBhMTEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjMgLSBhMTMgKiBhMjApICsgYTAzICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTAyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMDEgKiAtKGExMCAqIGEzMiAtIGExMiAqIGEzMCkgKyBhMDIgKiAoYTEwICogYTMxIC0gYTExICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgYTAyICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gKGEwMCAqIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSArXG4gICAgICAgICAgICBhMDEgKiAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMiAqIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMSAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSArXG4gICAgICAgICAgICBhMDMgKiAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTEyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpKTtcbiAgICB9XG4gICAgYXNzaWduKG1hdHJpeCkge1xuICAgICAgICB0aGlzLmRhdGFbMF0gPSBtYXRyaXguZGF0YVswXTtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gbWF0cml4LmRhdGFbMV07XG4gICAgICAgIHRoaXMuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdO1xuICAgICAgICB0aGlzLmRhdGFbM10gPSBtYXRyaXguZGF0YVszXTtcbiAgICAgICAgdGhpcy5kYXRhWzRdID0gbWF0cml4LmRhdGFbNF07XG4gICAgICAgIHRoaXMuZGF0YVs1XSA9IG1hdHJpeC5kYXRhWzVdO1xuICAgICAgICB0aGlzLmRhdGFbNl0gPSBtYXRyaXguZGF0YVs2XTtcbiAgICAgICAgdGhpcy5kYXRhWzddID0gbWF0cml4LmRhdGFbN107XG4gICAgICAgIHRoaXMuZGF0YVs4XSA9IG1hdHJpeC5kYXRhWzhdO1xuICAgICAgICB0aGlzLmRhdGFbOV0gPSBtYXRyaXguZGF0YVs5XTtcbiAgICAgICAgdGhpcy5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzEwXTtcbiAgICAgICAgdGhpcy5kYXRhWzExXSA9IG1hdHJpeC5kYXRhWzExXTtcbiAgICAgICAgdGhpcy5kYXRhWzEyXSA9IG1hdHJpeC5kYXRhWzEyXTtcbiAgICAgICAgdGhpcy5kYXRhWzEzXSA9IG1hdHJpeC5kYXRhWzEzXTtcbiAgICAgICAgdGhpcy5kYXRhWzE0XSA9IG1hdHJpeC5kYXRhWzE0XTtcbiAgICAgICAgdGhpcy5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzE1XTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBtLmRhdGFbMF0gPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIG0uZGF0YVsxXSA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgbS5kYXRhWzJdID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICBtLmRhdGFbM10gPSB0aGlzLmRhdGFbM107XG4gICAgICAgIG0uZGF0YVs0XSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgbS5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBtLmRhdGFbNl0gPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIG0uZGF0YVs3XSA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgbS5kYXRhWzhdID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICBtLmRhdGFbOV0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIG0uZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBtLmRhdGFbMTFdID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgbS5kYXRhWzEyXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIG0uZGF0YVsxM10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICBtLmRhdGFbMTRdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgbS5kYXRhWzE1XSA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBtdWx0aXBseShhLCBiKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTWF0cml4NHg0KSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYiAhPT0gbnVsbCAmJiBiICE9PSB2b2lkIDAgPyBiIDogbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICAgICAgaWYgKG1hdHJpeCA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhO1xuICAgICAgICAgICAgdmFyIGEwMCA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICAgICAgdmFyIGEwMyA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICAgICAgdmFyIGExMiA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIGEyMSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgICAgICB2YXIgYTMwID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgICAgICB2YXIgYTMzID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzBdID0gbWF0cml4LmRhdGFbMF0gKiBhMDAgKyBtYXRyaXguZGF0YVs0XSAqIGEwMSArIG1hdHJpeC5kYXRhWzhdICogYTAyICsgbWF0cml4LmRhdGFbMTJdICogYTAzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSBtYXRyaXguZGF0YVsxXSAqIGEwMCArIG1hdHJpeC5kYXRhWzVdICogYTAxICsgbWF0cml4LmRhdGFbOV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxM10gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdICogYTAwICsgbWF0cml4LmRhdGFbNl0gKiBhMDEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVszXSA9IG1hdHJpeC5kYXRhWzNdICogYTAwICsgbWF0cml4LmRhdGFbN10gKiBhMDEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IG1hdHJpeC5kYXRhWzBdICogYTEwICsgbWF0cml4LmRhdGFbNF0gKiBhMTEgKyBtYXRyaXguZGF0YVs4XSAqIGExMiArIG1hdHJpeC5kYXRhWzEyXSAqIGExMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzVdID0gbWF0cml4LmRhdGFbMV0gKiBhMTAgKyBtYXRyaXguZGF0YVs1XSAqIGExMSArIG1hdHJpeC5kYXRhWzldICogYTEyICsgbWF0cml4LmRhdGFbMTNdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSBtYXRyaXguZGF0YVsyXSAqIGExMCArIG1hdHJpeC5kYXRhWzZdICogYTExICsgbWF0cml4LmRhdGFbMTBdICogYTEyICsgbWF0cml4LmRhdGFbMTRdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSBtYXRyaXguZGF0YVszXSAqIGExMCArIG1hdHJpeC5kYXRhWzddICogYTExICsgbWF0cml4LmRhdGFbMTFdICogYTEyICsgbWF0cml4LmRhdGFbMTVdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBtYXRyaXguZGF0YVswXSAqIGEyMCArIG1hdHJpeC5kYXRhWzRdICogYTIxICsgbWF0cml4LmRhdGFbOF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IG1hdHJpeC5kYXRhWzFdICogYTIwICsgbWF0cml4LmRhdGFbNV0gKiBhMjEgKyBtYXRyaXguZGF0YVs5XSAqIGEyMiArIG1hdHJpeC5kYXRhWzEzXSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzJdICogYTIwICsgbWF0cml4LmRhdGFbNl0gKiBhMjEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSBtYXRyaXguZGF0YVszXSAqIGEyMCArIG1hdHJpeC5kYXRhWzddICogYTIxICsgbWF0cml4LmRhdGFbMTFdICogYTIyICsgbWF0cml4LmRhdGFbMTVdICogYTIzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gbWF0cml4LmRhdGFbMF0gKiBhMzAgKyBtYXRyaXguZGF0YVs0XSAqIGEzMSArIG1hdHJpeC5kYXRhWzhdICogYTMyICsgbWF0cml4LmRhdGFbMTJdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gbWF0cml4LmRhdGFbMV0gKiBhMzAgKyBtYXRyaXguZGF0YVs1XSAqIGEzMSArIG1hdHJpeC5kYXRhWzldICogYTMyICsgbWF0cml4LmRhdGFbMTNdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gbWF0cml4LmRhdGFbMl0gKiBhMzAgKyBtYXRyaXguZGF0YVs2XSAqIGEzMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEzMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEzMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzNdICogYTMwICsgbWF0cml4LmRhdGFbN10gKiBhMzEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMzIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMzM7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEgaW5zdGFuY2VvZiB0dXBsZV8xLlR1cGxlKSB7XG4gICAgICAgICAgICB2YXIgdCA9IGE7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHR1cGxlXzEuVHVwbGUodGhpcy5kYXRhWzBdICogdC54ICsgdGhpcy5kYXRhWzFdICogdC55ICsgdGhpcy5kYXRhWzJdICogdC56ICsgdGhpcy5kYXRhWzNdICogdC53LCB0aGlzLmRhdGFbNF0gKiB0LnggKyB0aGlzLmRhdGFbNV0gKiB0LnkgKyB0aGlzLmRhdGFbNl0gKiB0LnogKyB0aGlzLmRhdGFbN10gKiB0LncsIHRoaXMuZGF0YVs4XSAqIHQueCArIHRoaXMuZGF0YVs5XSAqIHQueSArIHRoaXMuZGF0YVsxMF0gKiB0LnogKyB0aGlzLmRhdGFbMTFdICogdC53LCB0aGlzLmRhdGFbMTJdICogdC54ICsgdGhpcy5kYXRhWzEzXSAqIHQueSArIHRoaXMuZGF0YVsxNF0gKiB0LnogKyB0aGlzLmRhdGFbMTVdICogdC53KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vYSBpbnN0YW5jZW9mIE1hdHJpeCAobm90IHN1cHBvcnRlZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXg0eDQgPSBNYXRyaXg0eDQ7XG5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYID0gbmV3IE1hdHJpeDR4NChbXG4gICAgWzEsIDAsIDAsIDBdLFxuICAgIFswLCAxLCAwLCAwXSxcbiAgICBbMCwgMCwgMSwgMF0sXG4gICAgWzAsIDAsIDAsIDFdXG5dKTtcbk1hdHJpeDR4NC50ZW1wTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NCgpO1xuY2xhc3MgTWF0cml4MngyIGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSAyIHx8IG1hdHJpeFswXS5sZW5ndGggIT0gMiB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyKG1hdHJpeCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlcigyLCAyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSAqIHRoaXMuZGF0YVszXSAtIHRoaXMuZGF0YVsxXSAqIHRoaXMuZGF0YVsyXTtcbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeDJ4MiA9IE1hdHJpeDJ4MjtcbmNsYXNzIE1hdHJpeDN4MyBleHRlbmRzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggIT0gMyB8fCBtYXRyaXhbMF0ubGVuZ3RoICE9IDMgfHwgbWF0cml4WzFdLmxlbmd0aCAhPSAzIHx8IG1hdHJpeFsyXS5sZW5ndGggIT0gMykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDMsIDMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YVswXSAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgdGhpcy5kYXRhWzFdICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgdGhpcy5kYXRhWzJdICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4M3gzID0gTWF0cml4M3gzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0cml4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QZXJsaW5QYXR0ZXJuID0gZXhwb3J0cy5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSA9IGV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IGV4cG9ydHMuUmluZ1BhdHRlcm4gPSBleHBvcnRzLkdyYWRpZW50UGF0dGVybiA9IGV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IGV4cG9ydHMuUGF0dGVybiA9IHZvaWQgMDtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgZmFzdF9zaW1wbGV4X25vaXNlXzEgPSByZXF1aXJlKFwiZmFzdC1zaW1wbGV4LW5vaXNlXCIpO1xuY2xhc3MgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IodHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIHBhdHRlcm5BdFNoYXBlKG9iamVjdCwgd29ybGRQb2ludCkge1xuICAgICAgICB2YXIgb2JqZWN0UG9pbnQgPSBvYmplY3QuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh3b3JsZFBvaW50KTtcbiAgICAgICAgdmFyIHBhdHRlcm5Qb2ludCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShvYmplY3RQb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdHRlcm5BdChwYXR0ZXJuUG9pbnQpO1xuICAgIH1cbn1cbmV4cG9ydHMuUGF0dGVybiA9IFBhdHRlcm47XG5QYXR0ZXJuLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuY2xhc3MgU3RyaXBlUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmNvbG9ycyA9IFthLCBiXTtcbiAgICB9XG4gICAgZ2V0IGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1swXTtcbiAgICB9XG4gICAgZ2V0IGIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1sxXTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1tNYXRoLmZsb29yKE1hdGguYWJzKHBvaW50LngpKSAlIDJdO1xuICAgIH1cbn1cbmV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IFN0cmlwZVBhdHRlcm47XG5jbGFzcyBHcmFkaWVudFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuYi5zdWJzdHJhY3QodGhpcy5hKTtcbiAgICAgICAgdmFyIGZyYWN0aW9uID0gcG9pbnQueCAtIE1hdGguZmxvb3IocG9pbnQueCk7XG4gICAgICAgIHJldHVybiB0aGlzLmEuYWRkKGRpc3RhbmNlLm11bHRpcGx5KGZyYWN0aW9uKSk7XG4gICAgfVxufVxuZXhwb3J0cy5HcmFkaWVudFBhdHRlcm4gPSBHcmFkaWVudFBhdHRlcm47XG5jbGFzcyBSaW5nUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmEgPSBhO1xuICAgICAgICB0aGlzLmIgPSBiO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIChNYXRoLmZsb29yKE1hdGguc3FydChwb2ludC54ICogcG9pbnQueCArIHBvaW50LnogKiBwb2ludC56KSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbn1cbmV4cG9ydHMuUmluZ1BhdHRlcm4gPSBSaW5nUGF0dGVybjtcbmNsYXNzIENoZWNrZXIzZFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiAoKE1hdGguZmxvb3IocG9pbnQueCkgKyBNYXRoLmZsb29yKHBvaW50LnkpICsgTWF0aC5mbG9vcihwb2ludC56KSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IENoZWNrZXIzZFBhdHRlcm47XG5jbGFzcyBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSwgdXZTY2FsZSA9IDEpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy51dlNjYWxlID0gdXZTY2FsZTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciB0dSA9IE1hdGguYXRhbjIocG9pbnQueCwgcG9pbnQueikgLyBNYXRoLlBJIC8gMiAqIHRoaXMudXZTY2FsZTtcbiAgICAgICAgdmFyIHR2ID0gcG9pbnQueSAvIDIgKiB0aGlzLnV2U2NhbGU7XG4gICAgICAgIHJldHVybiAoKChNYXRoLmZsb29yKHR1KSArIE1hdGguZmxvb3IodHYpKSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUgPSBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZTtcbmNsYXNzIFBlcmxpblBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0aHJlc2hvbGQgPSAwLjUsIHNlZWQgPSBNYXRoLnJhbmRvbSgpLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy5ub2lzZTNkID0gZmFzdF9zaW1wbGV4X25vaXNlXzEubWFrZU5vaXNlM0QoKCkgPT4gc2VlZCk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9pc2UzZChwb2ludC54LCBwb2ludC55LCBwb2ludC56KSA+IHRoaXMudGhyZXNob2xkID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbn1cbmV4cG9ydHMuUGVybGluUGF0dGVybiA9IFBlcmxpblBhdHRlcm47XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXR0ZXJucy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUGxhbmUgPSB2b2lkIDA7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCBpbnRlcnNlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgbWF0ZXJpYWxfMSA9IHJlcXVpcmUoXCIuL21hdGVyaWFsXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jbGFzcyBQbGFuZSB7XG4gICAgY29uc3RydWN0b3IoaWQsIHRyYW5zZm9ybSwgbWF0ZXJpYWwpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsICE9PSBudWxsICYmIG1hdGVyaWFsICE9PSB2b2lkIDAgPyBtYXRlcmlhbCA6IG5ldyBtYXRlcmlhbF8xLk1hdGVyaWFsKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgcmF5ID0gcmF5LnRyYW5zZm9ybSh0aGlzLmludmVyc2VUcmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmxvY2FsSW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBub3JtYWxBdChwKSB7XG4gICAgICAgIHZhciBvYmplY3ROb3JtYWwgPSB0dXBsZV8xLlR1cGxlLnZlY3RvcigwLCAxLCAwKTtcbiAgICAgICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShQbGFuZS50ZW1wTWF0cml4MSkubXVsdGlwbHkob2JqZWN0Tm9ybWFsKTtcbiAgICAgICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgICB9XG4gICAgbG9jYWxJbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICBpZiAoTWF0aC5hYnMocmF5LmRpcmVjdGlvbi55KSA8IGNvbnN0YW50c18xLkVQU0lMT04pXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICAgICAgdmFyIGkgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgICAgICBpLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIGkudCA9IC1yYXkub3JpZ2luLnkgLyByYXkuZGlyZWN0aW9uLnk7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbn1cbmV4cG9ydHMuUGxhbmUgPSBQbGFuZTtcblBsYW5lLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGxhbmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBvaW50TGlnaHQgPSB2b2lkIDA7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCBjb2xvcl8xID0gcmVxdWlyZShcIi4vY29sb3JcIik7XG5jbGFzcyBQb2ludExpZ2h0IHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbiwgaW50ZW5zaXR5KSB7XG4gICAgICAgIHRoaXMucG9zaXRvbiA9IHBvc2l0aW9uICE9PSBudWxsICYmIHBvc2l0aW9uICE9PSB2b2lkIDAgPyBwb3NpdGlvbiA6IHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gaW50ZW5zaXR5ICE9PSBudWxsICYmIGludGVuc2l0eSAhPT0gdm9pZCAwID8gaW50ZW5zaXR5IDogbmV3IGNvbG9yXzEuQ29sb3IoMSwgMSwgMSk7XG4gICAgfVxufVxuZXhwb3J0cy5Qb2ludExpZ2h0ID0gUG9pbnRMaWdodDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvaW50TGlnaHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJheSA9IHZvaWQgMDtcbmNsYXNzIFJheSB7XG4gICAgY29uc3RydWN0b3Iob3JpZ2luLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cbiAgICBwb3NpdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5hZGQodGhpcy5kaXJlY3Rpb24ubXVsdGlwbHkodCkpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0obWF0cml4KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBtYXRyaXgubXVsdGlwbHkodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICB2YXIgb3JpZ2luID0gbWF0cml4Lm11bHRpcGx5KHRoaXMub3JpZ2luKTtcbiAgICAgICAgdmFyIHJheSA9IG5ldyBSYXkob3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgICAgICByZXR1cm4gcmF5O1xuICAgIH1cbn1cbmV4cG9ydHMuUmF5ID0gUmF5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmF5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tZXJnZVNvcnRJbnBsYWNlID0gdm9pZCAwO1xuLyoqXG4gKiBNZXJnZXMgMiBzb3J0ZWQgcmVnaW9ucyBpbiBhbiBhcnJheSBpbnRvIDEgc29ydGVkIHJlZ2lvbiAoaW4tcGxhY2Ugd2l0aG91dCBleHRyYSBtZW1vcnksIHN0YWJsZSlcbiAqIEBwYXJhbSBpdGVtcyBhcnJheSB0byBtZXJnZVxuICogQHBhcmFtIGxlZnQgbGVmdCBhcnJheSBib3VuZGFyeSBpbmNsdXNpdmVcbiAqIEBwYXJhbSBtaWRkbGUgYm91bmRhcnkgYmV0d2VlbiByZWdpb25zIChsZWZ0IHJlZ2lvbiBleGNsdXNpdmUsIHJpZ2h0IHJlZ2lvbiBpbmNsdXNpdmUpXG4gKiBAcGFyYW0gcmlnaHQgcmlnaHQgYXJyYXkgYm91bmRhcnkgZXhjbHVzaXZlXG4gKi9cbmZ1bmN0aW9uIG1lcmdlSW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCBsZWZ0LCBtaWRkbGUsIHJpZ2h0KSB7XG4gICAgaWYgKHJpZ2h0ID09IG1pZGRsZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSBsZWZ0OyBpIDwgbWlkZGxlOyBpKyspIHtcbiAgICAgICAgdmFyIG1pblJpZ2h0ID0gaXRlbXNbbWlkZGxlXTtcbiAgICAgICAgaWYgKGNvbXBhcmVGbihtaW5SaWdodCwgaXRlbXNbaV0pIDwgMCkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGl0ZW1zW2ldO1xuICAgICAgICAgICAgaXRlbXNbaV0gPSBtaW5SaWdodDtcbiAgICAgICAgICAgIHZhciBuZXh0SXRlbTtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbWlkZGxlICsgMTtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0IDwgcmlnaHQgJiYgY29tcGFyZUZuKChuZXh0SXRlbSA9IGl0ZW1zW25leHRdKSwgdG1wKSA8IDApIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tuZXh0IC0gMV0gPSBuZXh0SXRlbTtcbiAgICAgICAgICAgICAgICBuZXh0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtc1tuZXh0IC0gMV0gPSB0bXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEluLXBsYWNlIGJvdHRvbSB1cCBtZXJnZSBzb3J0XG4gKi9cbmZ1bmN0aW9uIG1lcmdlU29ydElucGxhY2UoaXRlbXMsIGNvbXBhcmVGbiwgZnJvbSwgdG8pIHtcbiAgICBmcm9tICE9PSBudWxsICYmIGZyb20gIT09IHZvaWQgMCA/IGZyb20gOiAoZnJvbSA9IDApO1xuICAgIHRvICE9PSBudWxsICYmIHRvICE9PSB2b2lkIDAgPyB0byA6ICh0byA9IGl0ZW1zLmxlbmd0aCk7XG4gICAgdmFyIG1heFN0ZXAgPSAodG8gLSBmcm9tKSAqIDI7XG4gICAgZm9yICh2YXIgc3RlcCA9IDI7IHN0ZXAgPCBtYXhTdGVwOyBzdGVwICo9IDIpIHtcbiAgICAgICAgdmFyIG9sZFN0ZXAgPSBzdGVwIC8gMjtcbiAgICAgICAgZm9yICh2YXIgeCA9IGZyb207IHggPCB0bzsgeCArPSBzdGVwKSB7XG4gICAgICAgICAgICBtZXJnZUlucGxhY2UoaXRlbXMsIGNvbXBhcmVGbiwgeCwgeCArIG9sZFN0ZXAsIE1hdGgubWluKHggKyBzdGVwLCB0bykpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5tZXJnZVNvcnRJbnBsYWNlID0gbWVyZ2VTb3J0SW5wbGFjZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNvcnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNwaGVyZSA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5jbGFzcyBTcGhlcmUge1xuICAgIGNvbnN0cnVjdG9yKGlkLCB0cmFuc2Zvcm0sIG1hdGVyaWFsKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IG51bGwgJiYgdHJhbnNmb3JtICE9PSB2b2lkIDAgPyB0cmFuc2Zvcm0gOiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBtYXRlcmlhbCAhPT0gbnVsbCAmJiBtYXRlcmlhbCAhPT0gdm9pZCAwID8gbWF0ZXJpYWwgOiBuZXcgbWF0ZXJpYWxfMS5NYXRlcmlhbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIGludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIHJheSA9IHJheS50cmFuc2Zvcm0odGhpcy5pbnZlcnNlVHJhbnNmb3JtKTtcbiAgICAgICAgdmFyIHNwaGVyZTJyYXkgPSByYXkub3JpZ2luLnN1YnN0cmFjdCh0dXBsZV8xLlR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICAgICAgdmFyIGEgPSByYXkuZGlyZWN0aW9uLmRvdChyYXkuZGlyZWN0aW9uKTtcbiAgICAgICAgdmFyIGIgPSAyICogcmF5LmRpcmVjdGlvbi5kb3Qoc3BoZXJlMnJheSk7XG4gICAgICAgIHZhciBjID0gc3BoZXJlMnJheS5kb3Qoc3BoZXJlMnJheSkgLSAxO1xuICAgICAgICB2YXIgZGlzY3JpbWluYW50ID0gYiAqIGIgLSA0ICogYSAqIGM7XG4gICAgICAgIGlmIChkaXNjcmltaW5hbnQgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgICAgIHZhciBzcXJ0RGlzY3JpbWluYW50ID0gTWF0aC5zcXJ0KGRpc2NyaW1pbmFudCk7XG4gICAgICAgIHZhciBpMSA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkxLnQgPSAoLWIgLSBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgICAgIGkxLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIHZhciBpMiA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkyLnQgPSAoLWIgKyBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgICAgIGkyLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBub3JtYWxBdChwKSB7XG4gICAgICAgIHZhciBvYmplY3ROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkocCk7XG4gICAgICAgIG9iamVjdE5vcm1hbC53ID0gMDtcbiAgICAgICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShTcGhlcmUudGVtcE1hdHJpeDEpLm11bHRpcGx5KG9iamVjdE5vcm1hbCk7XG4gICAgICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgICAgICByZXR1cm4gd29ybGROb3JtYWwubm9ybWFsaXplKCk7XG4gICAgfVxufVxuZXhwb3J0cy5TcGhlcmUgPSBTcGhlcmU7XG5TcGhlcmUudGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zcGhlcmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlR1cGxlID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jbGFzcyBUdXBsZSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgeiwgdykge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICB0aGlzLncgPSB3O1xuICAgIH1cbiAgICBpc1BvaW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDE7XG4gICAgfVxuICAgIGlzVmVjdG9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDA7XG4gICAgfVxuICAgIGFkZCh0dXBsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCArIHR1cGxlLngsIHRoaXMueSArIHR1cGxlLnksIHRoaXMueiArIHR1cGxlLnosIHRoaXMudyArIHR1cGxlLncpO1xuICAgIH1cbiAgICBtdWx0aXBseShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyLCB0aGlzLncgKiBzY2FsYXIpO1xuICAgIH1cbiAgICBkaXZpZGUoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54IC8gc2NhbGFyLCB0aGlzLnkgLyBzY2FsYXIsIHRoaXMueiAvIHNjYWxhciwgdGhpcy53IC8gc2NhbGFyKTtcbiAgICB9XG4gICAgc3Vic3RyYWN0KHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54IC0gdHVwbGUueCwgdGhpcy55IC0gdHVwbGUueSwgdGhpcy56IC0gdHVwbGUueiwgdGhpcy53IC0gdHVwbGUudyk7XG4gICAgfVxuICAgIG5lZ2F0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSgtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56LCAtdGhpcy53KTtcbiAgICB9XG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5tYWduaXR1ZGUoKSk7XG4gICAgfVxuICAgIG1hZ25pdHVkZSgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLncpO1xuICAgIH1cbiAgICBkb3QodHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCAqIHR1cGxlLnggKyB0aGlzLnkgKiB0dXBsZS55ICsgdGhpcy56ICogdHVwbGUueiArIHRoaXMudyAqIHR1cGxlLnc7XG4gICAgfVxuICAgIGNyb3NzKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBUdXBsZS52ZWN0b3IodGhpcy55ICogdHVwbGUueiAtIHRoaXMueiAqIHR1cGxlLnksIHRoaXMueiAqIHR1cGxlLnggLSB0aGlzLnggKiB0dXBsZS56LCB0aGlzLnggKiB0dXBsZS55IC0gdGhpcy55ICogdHVwbGUueCk7XG4gICAgfVxuICAgIHJlZmxlY3Qobm9ybWFsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnN0cmFjdChub3JtYWwubXVsdGlwbHkoMiAqIHRoaXMuZG90KG5vcm1hbCkpKTtcbiAgICB9XG4gICAgZXF1YWxzKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnggLSB0dXBsZS54KSA8IGNvbnN0YW50c18xLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueSAtIHR1cGxlLnkpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy56IC0gdHVwbGUueikgPCBjb25zdGFudHNfMS5FUFNJTE9OO1xuICAgIH1cbiAgICBzdGF0aWMgcG9pbnQoeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDEpO1xuICAgIH1cbiAgICBzdGF0aWMgdmVjdG9yKHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAwKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcbiAgICB9XG59XG5leHBvcnRzLlR1cGxlID0gVHVwbGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10dXBsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ybGQgPSB2b2lkIDA7XG5jb25zdCBjb2xvcl8xID0gcmVxdWlyZShcIi4vY29sb3JcIik7XG5jb25zdCBjb21wdXRhdGlvbnNfMSA9IHJlcXVpcmUoXCIuL2NvbXB1dGF0aW9uc1wiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgcmF5XzEgPSByZXF1aXJlKFwiLi9yYXlcIik7XG5jbGFzcyBXb3JsZCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuICAgIHNoYWRlSGl0KGNvbXBzKSB7XG4gICAgICAgIHJldHVybiBjb21wcy5vYmplY3QubWF0ZXJpYWwubGlnaHRpbmcodGhpcy5saWdodCwgY29tcHMub2JqZWN0LCBjb21wcy5wb2ludCwgY29tcHMuZXlldiwgY29tcHMubm9ybWFsdiwgdGhpcy5pc1NoYWRvd2VkKGNvbXBzLm92ZXJQb2ludCkpO1xuICAgIH1cbiAgICBjb2xvckF0KHJheSkge1xuICAgICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgICB0aGlzLmludGVyc2VjdChyYXksIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdmFyIGkgPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgICAgaWYgKGkgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjb2xvcl8xLkNvbG9yLkJMQUNLLmNsb25lKCk7XG4gICAgICAgIHZhciBjb21wID0gY29tcHV0YXRpb25zXzEuQ29tcHV0YXRpb25zLnByZXBhcmUoaSwgcmF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGVIaXQoY29tcCk7XG4gICAgfVxuICAgIGludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIGZvciAodmFyIG8gb2YgdGhpcy5vYmplY3RzKSB7XG4gICAgICAgICAgICBvLmludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBpc1NoYWRvd2VkKHBvaW50KSB7XG4gICAgICAgIHZhciB2ID0gdGhpcy5saWdodC5wb3NpdG9uLnN1YnN0cmFjdChwb2ludCk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHYubWFnbml0dWRlKCk7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB2Lm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgciA9IG5ldyByYXlfMS5SYXkocG9pbnQsIGRpcmVjdGlvbik7XG4gICAgICAgIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0KHIsIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdmFyIGggPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgICAgcmV0dXJuIChoICE9IG51bGwgJiYgaC50IDwgZGlzdGFuY2UpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ybGQgPSBXb3JsZDtcbldvcmxkLnRlbXBJbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoMTAwKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmxkLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHBsYWNlZCBpbiB0aGUgcHVibGljIGRvbWFpbiBieSBpdHMgb3JpZ2luYWwgYXV0aG9yLFxuICogU3RlZmFuIEd1c3RhdnNvbi4gWW91IG1heSB1c2UgaXQgYXMgeW91IHNlZSBmaXQsIGJ1dFxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlMkQgPSB2b2lkIDA7XG52YXIgRzIgPSAoMy4wIC0gTWF0aC5zcXJ0KDMuMCkpIC8gNi4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzEsIDFdLFxuICAgIFstMSwgMV0sXG4gICAgWzEsIC0xXSxcbiAgICBbLTEsIC0xXSxcbiAgICBbMSwgMF0sXG4gICAgWy0xLCAwXSxcbiAgICBbMSwgMF0sXG4gICAgWy0xLCAwXSxcbiAgICBbMCwgMV0sXG4gICAgWzAsIC0xXSxcbiAgICBbMCwgMV0sXG4gICAgWzAsIC0xXSxcbl07XG5mdW5jdGlvbiBtYWtlTm9pc2UyRChyYW5kb20pIHtcbiAgICBpZiAocmFuZG9tID09PSB2b2lkIDApIHsgcmFuZG9tID0gTWF0aC5yYW5kb207IH1cbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcbiAgICAgICAgcFtpXSA9IGk7XG4gICAgdmFyIG47XG4gICAgdmFyIHE7XG4gICAgZm9yICh2YXIgaSA9IDI1NTsgaSA+IDA7IGktLSkge1xuICAgICAgICBuID0gTWF0aC5mbG9vcigoaSArIDEpICogcmFuZG9tKCkpO1xuICAgICAgICBxID0gcFtpXTtcbiAgICAgICAgcFtpXSA9IHBbbl07XG4gICAgICAgIHBbbl0gPSBxO1xuICAgIH1cbiAgICB2YXIgcGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdmFyIHBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgICBwZXJtW2ldID0gcFtpICYgMjU1XTtcbiAgICAgICAgcGVybU1vZDEyW2ldID0gcGVybVtpXSAlIDEyO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgICB2YXIgcyA9ICh4ICsgeSkgKiAwLjUgKiAoTWF0aC5zcXJ0KDMuMCkgLSAxLjApOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqKSAqIEcyO1xuICAgICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgICB2YXIgaTEgPSB4MCA+IHkwID8gMSA6IDA7XG4gICAgICAgIHZhciBqMSA9IHgwID4geTAgPyAwIDogMTtcbiAgICAgICAgLy8gT2Zmc2V0cyBmb3IgY29ybmVyc1xuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7XG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMjtcbiAgICAgICAgdmFyIHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgICAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBwZXJtW2pqXV1dO1xuICAgICAgICB2YXIgZzEgPSBHcmFkW3Blcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxXV1dO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMV1dXTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwID8gMC4wIDogTWF0aC5wb3codDAsIDQpICogKGcwWzBdICogeDAgKyBnMFsxXSAqIHkwKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTE7XG4gICAgICAgIHZhciBuMSA9IHQxIDwgMCA/IDAuMCA6IE1hdGgucG93KHQxLCA0KSAqIChnMVswXSAqIHgxICsgZzFbMV0gKiB5MSk7XG4gICAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDAgPyAwLjAgOiBNYXRoLnBvdyh0MiwgNCkgKiAoZzJbMF0gKiB4MiArIGcyWzFdICogeTIpO1xuICAgICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwgMV1cbiAgICAgICAgcmV0dXJuIDcwLjE0ODA1NzcwNjUzOTUyICogKG4wICsgbjEgKyBuMik7XG4gICAgfTtcbn1cbmV4cG9ydHMubWFrZU5vaXNlMkQgPSBtYWtlTm9pc2UyRDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHBsYWNlZCBpbiB0aGUgcHVibGljIGRvbWFpbiBieSBpdHMgb3JpZ2luYWwgYXV0aG9yLFxuICogU3RlZmFuIEd1c3RhdnNvbi4gWW91IG1heSB1c2UgaXQgYXMgeW91IHNlZSBmaXQsIGJ1dFxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlM0QgPSB2b2lkIDA7XG52YXIgRzMgPSAxLjAgLyA2LjA7XG52YXIgR3JhZCA9IFtcbiAgICBbMSwgMSwgMF0sXG4gICAgWy0xLCAxLCAwXSxcbiAgICBbMSwgLTEsIDBdLFxuICAgIFstMSwgLTEsIDBdLFxuICAgIFsxLCAwLCAxXSxcbiAgICBbLTEsIDAsIDFdLFxuICAgIFsxLCAwLCAtMV0sXG4gICAgWy0xLCAwLCAtMV0sXG4gICAgWzAsIDEsIDFdLFxuICAgIFswLCAtMSwgLTFdLFxuICAgIFswLCAxLCAtMV0sXG4gICAgWzAsIC0xLCAtMV0sXG5dO1xuZnVuY3Rpb24gbWFrZU5vaXNlM0QocmFuZG9tKSB7XG4gICAgaWYgKHJhbmRvbSA9PT0gdm9pZCAwKSB7IHJhbmRvbSA9IE1hdGgucmFuZG9tOyB9XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgIHBbaV0gPSBpO1xuICAgIHZhciBuO1xuICAgIHZhciBxO1xuICAgIGZvciAodmFyIGkgPSAyNTU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoKGkgKyAxKSAqIHJhbmRvbSgpKTtcbiAgICAgICAgcSA9IHBbaV07XG4gICAgICAgIHBbaV0gPSBwW25dO1xuICAgICAgICBwW25dID0gcTtcbiAgICB9XG4gICAgdmFyIHBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHZhciBwZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgICAgcGVybVtpXSA9IHBbaSAmIDI1NV07XG4gICAgICAgIHBlcm1Nb2QxMltpXSA9IHBlcm1baV0gJSAxMjtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gICAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgICAgdmFyIHMgPSAoeCArIHkgKyB6KSAvIDMuMDsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqICsgaykgKiBHMztcbiAgICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgICAvLyBEZXRlcmluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpblxuICAgICAgICB2YXIgaTEsIGoxLCBrMSAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgICAgO1xuICAgICAgICB2YXIgaTIsIGoyLCBrMiAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgICA7XG4gICAgICAgIGlmICh4MCA+PSB5MCkge1xuICAgICAgICAgICAgaWYgKHkwID49IHowKSB7XG4gICAgICAgICAgICAgICAgaTEgPSBpMiA9IGoyID0gMTtcbiAgICAgICAgICAgICAgICBqMSA9IGsxID0gazIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeDAgPj0gejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IGkyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGoxID0gazEgPSBqMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrMSA9IGkyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gajEgPSBqMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoeTAgPCB6MCkge1xuICAgICAgICAgICAgICAgIGsxID0gajIgPSBrMiA9IDE7XG4gICAgICAgICAgICAgICAgaTEgPSBqMSA9IGkyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHgwIDwgejApIHtcbiAgICAgICAgICAgICAgICBqMSA9IGoyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gazEgPSBpMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBqMSA9IGkyID0gajIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gazEgPSBrMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMztcbiAgICAgICAgdmFyIHoxID0gejAgLSBrMSArIEczO1xuICAgICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzM7XG4gICAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHMztcbiAgICAgICAgdmFyIHgzID0geDAgLSAxLjAgKyAzLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgdmFyIHkzID0geTAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgICAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVyc1xuICAgICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgICB2YXIgZzAgPSBHcmFkW3Blcm1Nb2QxMltpaSArIHBlcm1bamogKyBwZXJtW2trXV1dXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMV1dXV07XG4gICAgICAgIHZhciBnMiA9IEdyYWRbcGVybU1vZDEyW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazJdXV1dO1xuICAgICAgICB2YXIgZzMgPSBHcmFkW3Blcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxXV1dXTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MCwgNCkgKiAoZzBbMF0gKiB4MCArIGcwWzFdICogeTAgKyBnMFsyXSAqIHowKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxO1xuICAgICAgICB2YXIgbjEgPSB0MSA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQxLCA0KSAqIChnMVswXSAqIHgxICsgZzFbMV0gKiB5MSArIGcxWzJdICogejEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejI7XG4gICAgICAgIHZhciBuMiA9IHQyIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyICsgZzJbMl0gKiB6Mik7XG4gICAgICAgIHZhciB0MyA9IDAuNSAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MztcbiAgICAgICAgdmFyIG4zID0gdDMgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MywgNCkgKiAoZzNbMF0gKiB4MyArIGczWzFdICogeTMgKyBnM1syXSAqIHozKTtcbiAgICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byBzdGF5IGp1c3QgaW5zaWRlIFstMSwxXVxuICAgICAgICByZXR1cm4gOTQuNjg0OTMxNTA2ODE5NzIgKiAobjAgKyBuMSArIG4yICsgbjMpO1xuICAgIH07XG59XG5leHBvcnRzLm1ha2VOb2lzZTNEID0gbWFrZU5vaXNlM0Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTREID0gdm9pZCAwO1xudmFyIEc0ID0gKDUuMCAtIE1hdGguc3FydCg1LjApKSAvIDIwLjA7XG52YXIgR3JhZCA9IFtcbiAgICBbMCwgMSwgMSwgMV0sXG4gICAgWzAsIDEsIDEsIC0xXSxcbiAgICBbMCwgMSwgLTEsIDFdLFxuICAgIFswLCAxLCAtMSwgLTFdLFxuICAgIFswLCAtMSwgMSwgMV0sXG4gICAgWzAsIC0xLCAxLCAtMV0sXG4gICAgWzAsIC0xLCAtMSwgMV0sXG4gICAgWzAsIC0xLCAtMSwgLTFdLFxuICAgIFsxLCAwLCAxLCAxXSxcbiAgICBbMSwgMCwgMSwgLTFdLFxuICAgIFsxLCAwLCAtMSwgMV0sXG4gICAgWzEsIDAsIC0xLCAtMV0sXG4gICAgWy0xLCAwLCAxLCAxXSxcbiAgICBbLTEsIDAsIDEsIC0xXSxcbiAgICBbLTEsIDAsIC0xLCAxXSxcbiAgICBbLTEsIDAsIC0xLCAtMV0sXG4gICAgWzEsIDEsIDAsIDFdLFxuICAgIFsxLCAxLCAwLCAtMV0sXG4gICAgWzEsIC0xLCAwLCAxXSxcbiAgICBbMSwgLTEsIDAsIC0xXSxcbiAgICBbLTEsIDEsIDAsIDFdLFxuICAgIFstMSwgMSwgMCwgLTFdLFxuICAgIFstMSwgLTEsIDAsIDFdLFxuICAgIFstMSwgLTEsIDAsIC0xXSxcbiAgICBbMSwgMSwgMSwgMF0sXG4gICAgWzEsIDEsIC0xLCAwXSxcbiAgICBbMSwgLTEsIDEsIDBdLFxuICAgIFsxLCAtMSwgLTEsIDBdLFxuICAgIFstMSwgMSwgMSwgMF0sXG4gICAgWy0xLCAxLCAtMSwgMF0sXG4gICAgWy0xLCAtMSwgMSwgMF0sXG4gICAgWy0xLCAtMSwgLTEsIDBdLFxuXTtcbmZ1bmN0aW9uIG1ha2VOb2lzZTREKHJhbmRvbSkge1xuICAgIGlmIChyYW5kb20gPT09IHZvaWQgMCkgeyByYW5kb20gPSBNYXRoLnJhbmRvbTsgfVxuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBwW2ldID0gaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgcTtcbiAgICBmb3IgKHZhciBpID0gMjU1OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIG4gPSBNYXRoLmZsb29yKChpICsgMSkgKiByYW5kb20oKSk7XG4gICAgICAgIHEgPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtuXTtcbiAgICAgICAgcFtuXSA9IHE7XG4gICAgfVxuICAgIHZhciBwZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB2YXIgcGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICAgIHBlcm1baV0gPSBwW2kgJiAyNTVdO1xuICAgICAgICBwZXJtTW9kMTJbaV0gPSBwZXJtW2ldICUgMTI7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xuICAgICAgICAvLyBTa2V3IHRoZSAoeCx5LHosdykgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIGNlbGwgb2YgMjQgc2ltcGxpY2VzIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHggKyB5ICsgeiArIHcpICogKE1hdGguc3FydCg1LjApIC0gMS4wKSAvIDQuMDsgLy8gRmFjdG9yIGZvciA0RCBza2V3aW5nXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICAgIHZhciBsID0gTWF0aC5mbG9vcih3ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqICsgayArIGwpICogRzQ7IC8vIEZhY3RvciBmb3IgNEQgdW5za2V3aW5nXG4gICAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6LHcpIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgICAgdmFyIFcwID0gbCAtIHQ7XG4gICAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6LHcgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgICB2YXIgdzAgPSB3IC0gVzA7XG4gICAgICAgIC8vIFRvIGZpbmQgb3V0IHdoaWNoIG9mIHRoZSAyNCBwb3NzaWJsZSBzaW1wbGljZXMgd2UncmUgaW4sIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHRoZVxuICAgICAgICAvLyBtYWduaXR1ZGUgb3JkZXJpbmcgb2YgeDAsIHkwLCB6MCBhbmQgdzAuIFNpeCBwYWlyLXdpc2UgY29tcGFyaXNvbnMgYXJlIHBlcmZvcm1lZCBiZXR3ZWVuXG4gICAgICAgIC8vIGVhY2ggcG9zc2libGUgcGFpciBvZiB0aGUgZm91ciBjb29yZGluYXRlcywgYW5kIHRoZSByZXN1bHRzIGFyZSB1c2VkIHRvIHJhbmsgdGhlIG51bWJlcnMuXG4gICAgICAgIHZhciByYW5reCA9IDA7XG4gICAgICAgIHZhciByYW5reSA9IDA7XG4gICAgICAgIHZhciByYW5reiA9IDA7XG4gICAgICAgIHZhciByYW5rdyA9IDA7XG4gICAgICAgIGlmICh4MCA+IHkwKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgaWYgKHgwID4gejApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBpZiAoeDAgPiB3MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt3Kys7XG4gICAgICAgIGlmICh5MCA+IHowKVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgaWYgKHkwID4gdzApXG4gICAgICAgICAgICByYW5reSsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICBpZiAoejAgPiB3MClcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt3Kys7XG4gICAgICAgIC8vIHNpbXBsZXhbY10gaXMgYSA0LXZlY3RvciB3aXRoIHRoZSBudW1iZXJzIDAsIDEsIDIgYW5kIDMgaW4gc29tZSBvcmRlci5cbiAgICAgICAgLy8gTWFueSB2YWx1ZXMgb2YgYyB3aWxsIG5ldmVyIG9jY3VyLCBzaW5jZSBlLmcuIHg+eT56PncgbWFrZXMgeDx6LCB5PHcgYW5kIHg8d1xuICAgICAgICAvLyBpbXBvc3NpYmxlLiBPbmx5IHRoZSAyNCBpbmRpY2VzIHdoaWNoIGhhdmUgbm9uLXplcm8gZW50cmllcyBtYWtlIGFueSBzZW5zZS5cbiAgICAgICAgLy8gV2UgdXNlIGEgdGhyZXNob2xkaW5nIHRvIHNldCB0aGUgY29vcmRpbmF0ZXMgaW4gdHVybiBmcm9tIHRoZSBsYXJnZXN0IG1hZ25pdHVkZS5cbiAgICAgICAgLy8gUmFuayAzIGRlbm90ZXMgdGhlIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgICAgdmFyIGkxID0gcmFua3ggPj0gMyA/IDEgOiAwO1xuICAgICAgICB2YXIgajEgPSByYW5reSA+PSAzID8gMSA6IDA7XG4gICAgICAgIHZhciBrMSA9IHJhbmt6ID49IDMgPyAxIDogMDtcbiAgICAgICAgdmFyIGwxID0gcmFua3cgPj0gMyA/IDEgOiAwO1xuICAgICAgICAvLyBSYW5rIDIgZGVub3RlcyB0aGUgc2Vjb25kIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgICAgdmFyIGkyID0gcmFua3ggPj0gMiA/IDEgOiAwO1xuICAgICAgICB2YXIgajIgPSByYW5reSA+PSAyID8gMSA6IDA7XG4gICAgICAgIHZhciBrMiA9IHJhbmt6ID49IDIgPyAxIDogMDtcbiAgICAgICAgdmFyIGwyID0gcmFua3cgPj0gMiA/IDEgOiAwO1xuICAgICAgICAvLyBSYW5rIDEgZGVub3RlcyB0aGUgc2Vjb25kIHNtYWxsZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMyA9IHJhbmt4ID49IDEgPyAxIDogMDtcbiAgICAgICAgdmFyIGozID0gcmFua3kgPj0gMSA/IDEgOiAwO1xuICAgICAgICB2YXIgazMgPSByYW5reiA+PSAxID8gMSA6IDA7XG4gICAgICAgIHZhciBsMyA9IHJhbmt3ID49IDEgPyAxIDogMDtcbiAgICAgICAgLy8gVGhlIGZpZnRoIGNvcm5lciBoYXMgYWxsIGNvb3JkaW5hdGUgb2Zmc2V0cyA9IDEsIHNvIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGF0LlxuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzQ7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzQ7XG4gICAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHNDtcbiAgICAgICAgdmFyIHcxID0gdzAgLSBsMSArIEc0O1xuICAgICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzQ7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHNDtcbiAgICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEc0O1xuICAgICAgICB2YXIgdzIgPSB3MCAtIGwyICsgMi4wICogRzQ7XG4gICAgICAgIHZhciB4MyA9IHgwIC0gaTMgKyAzLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgZm91cnRoIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5MyA9IHkwIC0gajMgKyAzLjAgKiBHNDtcbiAgICAgICAgdmFyIHozID0gejAgLSBrMyArIDMuMCAqIEc0O1xuICAgICAgICB2YXIgdzMgPSB3MCAtIGwzICsgMy4wICogRzQ7XG4gICAgICAgIHZhciB4NCA9IHgwIC0gMS4wICsgNC4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHk0ID0geTAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgdmFyIHo0ID0gejAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgdmFyIHc0ID0gdzAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmaXZlIHNpbXBsZXggY29ybmVyc1xuICAgICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgICB2YXIgbGwgPSBsICYgMjU1O1xuICAgICAgICB2YXIgZzAgPSBHcmFkW3Blcm1baWkgKyBwZXJtW2pqICsgcGVybVtrayArIHBlcm1bbGxdXV1dICVcbiAgICAgICAgICAgIDMyXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazEgKyBwZXJtW2xsICsgbDFdXV1dICUgMzJdO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1baWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMiArIHBlcm1bbGwgKyBsMl1dXV0gJSAzMl07XG4gICAgICAgIHZhciBnMyA9IEdyYWRbcGVybVtpaSArIGkzICsgcGVybVtqaiArIGozICsgcGVybVtrayArIGszICsgcGVybVtsbCArIGwzXV1dXSAlIDMyXTtcbiAgICAgICAgdmFyIGc0ID0gR3JhZFtwZXJtW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDEgKyBwZXJtW2xsICsgMV1dXV0gJSAzMl07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejAgLSB3MCAqIHcwO1xuICAgICAgICB2YXIgbjAgPSB0MCA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQwLCA0KSAqIChnMFswXSAqIHgwICsgZzBbMV0gKiB5MCArIGcwWzJdICogejAgKyBnMFszXSAqIHcwKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxIC0gdzEgKiB3MTtcbiAgICAgICAgdmFyIG4xID0gdDEgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEgKyBnMVsyXSAqIHoxICsgZzFbM10gKiB3MSk7XG4gICAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MiAtIHcyICogdzI7XG4gICAgICAgIHZhciBuMiA9IHQyIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyICsgZzJbMl0gKiB6MiArIGcyWzNdICogdzIpO1xuICAgICAgICB2YXIgdDMgPSAwLjUgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejMgLSB3MyAqIHczO1xuICAgICAgICB2YXIgbjMgPSB0MyA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQzLCA0KSAqIChnM1swXSAqIHgzICsgZzNbMV0gKiB5MyArIGczWzJdICogejMgKyBnM1szXSAqIHczKTtcbiAgICAgICAgdmFyIHQ0ID0gMC41IC0geDQgKiB4NCAtIHk0ICogeTQgLSB6NCAqIHo0IC0gdzQgKiB3NDtcbiAgICAgICAgdmFyIG40ID0gdDQgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0NCwgNCkgKiAoZzRbMF0gKiB4NCArIGc0WzFdICogeTQgKyBnNFsyXSAqIHo0ICsgZzRbM10gKiB3NCk7XG4gICAgICAgIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXG4gICAgICAgIHJldHVybiA3Mi4zNzg1NTc2NTE1MzY2NSAqIChuMCArIG4xICsgbjIgKyBuMyArIG40KTtcbiAgICB9O1xufVxuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IG1ha2VOb2lzZTREO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTREID0gZXhwb3J0cy5tYWtlTm9pc2UzRCA9IGV4cG9ydHMubWFrZU5vaXNlMkQgPSB2b2lkIDA7XG52YXIgXzJkXzEgPSByZXF1aXJlKFwiLi8yZFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1ha2VOb2lzZTJEXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfMmRfMS5tYWtlTm9pc2UyRDsgfSB9KTtcbnZhciBfM2RfMSA9IHJlcXVpcmUoXCIuLzNkXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFrZU5vaXNlM0RcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF8zZF8xLm1ha2VOb2lzZTNEOyB9IH0pO1xudmFyIF80ZF8xID0gcmVxdWlyZShcIi4vNGRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtYWtlTm9pc2U0RFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXzRkXzEubWFrZU5vaXNlNEQ7IH0gfSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2FudmFzIH0gZnJvbSBcInJheXRyYWNlci9jYW52YXNcIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcInJheXRyYWNlci9jb2xvclwiO1xuaW1wb3J0IHsgSW50ZXJzZWN0aW9uLCBJbnRlcnNlY3Rpb25zIH0gZnJvbSBcInJheXRyYWNlci9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcInJheXRyYWNlci9tYXRlcmlhbFwiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcInJheXRyYWNlci9tYXRyaXhcIjtcbmltcG9ydCB7IFBvaW50TGlnaHQgfSBmcm9tIFwicmF5dHJhY2VyL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSBcInJheXRyYWNlci93b3JsZFwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcInJheXRyYWNlci9zcGhlcmVcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcInJheXRyYWNlci90dXBsZVwiO1xuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSBcInJheXRyYWNlci9jYW1lcmFcIjtcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSBcInJheXRyYWNlci9wbGFuZVwiO1xuaW1wb3J0IHsgR3JhZGllbnRQYXR0ZXJuLCBSaW5nUGF0dGVybiwgU3RyaXBlUGF0dGVybiwgQ2hlY2tlcjNkUGF0dGVybiwgQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUsIFBlcmxpblBhdHRlcm4gfSBmcm9tIFwicmF5dHJhY2VyL3BhdHRlcm5zXCI7XG5pbXBvcnQgeyBFUFNJTE9OIH0gZnJvbSBcInJheXRyYWNlci9jb25zdGFudHNcIjtcblxuXG52YXIgd29ybGQ9IG5ldyBXb3JsZCgpO1xudmFyIGZsb29yID0gbmV3IFBsYW5lKDApO1xuZmxvb3IubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xuZmxvb3IubWF0ZXJpYWwucGF0dGVybj1uZXcgR3JhZGllbnRQYXR0ZXJuKG5ldyBDb2xvcigwLjIsMC40LDAuNSksIG5ldyBDb2xvcigwLjEsMC45LDAuNykpO1xuZmxvb3IudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsMTUpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoMSkpO1xuXG52YXIgbWlkZGxlPW5ldyBTcGhlcmUoMyk7XG5taWRkbGUudHJhbnNmb3JtPSAgTWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMSwwKS5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25ZKDAuMSkubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWigwLjIpKSk7XG5taWRkbGUubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xubWlkZGxlLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDEsMC41KTtcbm1pZGRsZS5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbm1pZGRsZS5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5taWRkbGUubWF0ZXJpYWwucGF0dGVybj1uZXcgU3RyaXBlUGF0dGVybihuZXcgQ29sb3IoMC4xLDAuMSwwLjYpLCBuZXcgQ29sb3IoMC4xLDAuNywwLjIpLE1hdHJpeDR4NC50cmFuc2xhdGlvbigxLDAsMCkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMC4yLDAuMiwwLjIpKSk7XG5cbnZhciByaWdodD1uZXcgU3BoZXJlKDQpO1xucmlnaHQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigyLDAuNSwtMC41KS5tdWx0aXBseShNYXRyaXg0eDQuc2NhbGluZygwLjUsMC41LDAuNSkpO1xucmlnaHQubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xucmlnaHQubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLjEsMC43LDAuMik7XG5yaWdodC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbnJpZ2h0Lm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcbnJpZ2h0Lm1hdGVyaWFsLnBhdHRlcm49IG5ldyBQZXJsaW5QYXR0ZXJuKG5ldyBDb2xvcigwLjEsMC43LDAuMiksbmV3IENvbG9yKDEsMSwxKSwwLjE1KTtcblxuXG52YXIgbGVmdD1uZXcgU3BoZXJlKDUpO1xubGVmdC50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKC01LDIsOSkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMiwyLDIpKTtcbmxlZnQubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xubGVmdC5tYXRlcmlhbC5jb2xvcj0gbmV3IENvbG9yKDEsMC44LDAuMSk7XG5sZWZ0Lm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xubGVmdC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5sZWZ0Lm1hdGVyaWFsLnBhdHRlcm49IG5ldyBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSggbmV3IENvbG9yKDAuOSwwLjksMC45KSxuZXcgQ29sb3IoMC4xLDAuMSwwLjEpLCBNYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCksMjApO1xuXG5cbnZhciB3YWxsPW5ldyBQbGFuZSg2KTtcbndhbGwudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsMTUpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoMSkubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWChNYXRoLlBJLzIpKSk7XG53YWxsLm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoKTtcbndhbGwubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigxLDEsMSk7XG53YWxsLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xud2FsbC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG53YWxsLm1hdGVyaWFsLnBhdHRlcm49IG5ldyBSaW5nUGF0dGVybihuZXcgQ29sb3IoMCwwLjEsMC43KSwgbmV3IENvbG9yKDEsMSwxKSxNYXRyaXg0eDQuc2NhbGluZygxLDEsMSkpO1xuXG52YXIgd2FsbDI9bmV3IFBsYW5lKDcpO1xud2FsbDIudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsMTUpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoMS1NYXRoLlBJLzIpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblgoTWF0aC5QSS8yKSkpO1xud2FsbDIubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xud2FsbDIubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLDAsMC44KTtcbndhbGwyLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xud2FsbDIubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xud2FsbDIubWF0ZXJpYWwucGF0dGVybj0gbmV3IENoZWNrZXIzZFBhdHRlcm4obmV3IENvbG9yKDAsMC4xLDAuNyksIG5ldyBDb2xvcigxLDEsMSksTWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsRVBTSUxPTiwwKSk7XG5cbndvcmxkLm9iamVjdHM9IFtsZWZ0LHJpZ2h0LG1pZGRsZSxmbG9vcix3YWxsLHdhbGwyXTtcbndvcmxkLmxpZ2h0PSBuZXcgUG9pbnRMaWdodChUdXBsZS5wb2ludCgtMTAsMTAsLTEwKSxDb2xvci5XSElURS5jbG9uZSgpKTtcblxudmFyIGNhbWVyYT0gbmV3IENhbWVyYSgxMDI0LDEwMjQsTWF0aC5QSS8zLFxuICAgIE1hdHJpeDR4NC52aWV3VHJhbnNmb3JtKFR1cGxlLnBvaW50KDAsMS41LC01KSxUdXBsZS5wb2ludCgwLDEsMCksVHVwbGUudmVjdG9yKDAsMSwwKSlcbiAgICApO1xuXG5cbnZhciByYXl0cmFjZXJDYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYXl0cmFjZXJDYW52YXNcIik7XG5yYXl0cmFjZXJDYW52YXMud2lkdGg9Y2FtZXJhLmhzaXplO1xucmF5dHJhY2VyQ2FudmFzLmhlaWdodD1jYW1lcmEudnNpemU7XG52YXIgcmVuZGVyRGF0YSA9IGNhbWVyYS5yZW5kZXIod29ybGQpLnRvVWludDhDbGFtcGVkQXJyYXkoKTtcbnZhciBpbWFnZURhdGEgPSBuZXcgSW1hZ2VEYXRhKHJlbmRlckRhdGEsIGNhbWVyYS5oc2l6ZSwgY2FtZXJhLnZzaXplKTtcbnZhciBjdHggPSByYXl0cmFjZXJDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuXG5cblxuXG5cblxuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==