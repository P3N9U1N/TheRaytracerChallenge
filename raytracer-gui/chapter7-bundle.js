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
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Computations = void 0;
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
class World {
    constructor() {
    }
    shadeHit(comps) {
        return comps.object.material.lighting(this.light, comps.point, comps.eyev, comps.normalv);
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
    intersect(ray, intersections) {
        intersections !== null && intersections !== void 0 ? intersections : (intersections = new intersection_1.Intersections());
        for (var o of this.objects) {
            o.intersect(ray, intersections);
        }
        return intersections;
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
  !*** ./src/chapter7.ts ***!
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksQ0FBQyxVQUFVLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2pDLENBQUM7SUFDRCxLQUFLO1FBRUosSUFBSSxHQUFHLEdBQUMsTUFBTSxDQUFDO1FBQ2YsR0FBRyxJQUFFLElBQUksQ0FBQyxLQUFLLEdBQUMsR0FBRyxHQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsSUFBSSxDQUFDO1FBQ3JDLEdBQUcsSUFBRSxLQUFLLENBQUM7UUFDWCxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFDcEM7WUFDSSxHQUFHLElBQUUsQ0FBQyxDQUFDLEdBQUMsRUFBRSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsQ0FBQyxJQUFHLENBQUM7WUFDNUIsR0FBRyxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUNqRSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2tCQUN4RSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUks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SUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUzQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUdNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsTUFBaUI7UUFFbEUsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFHLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFD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QUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNsQixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ00sTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFjLEVBQUMsTUFBaUI7UUFFcEQsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLEdBQUcsR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxHQUFHLENBQUM7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBUSxFQUFDLENBQVEsRUFBQyxDQUFRLEVBQUMsTUFBaUI7UUFFOUQsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNNLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsRUFBUyxFQUFDLEVBQVMsRUFBQyxFQUFTLEVBQUMsTUFBaUI7UUFFaEcsTUFBTSxhQUFOLE1BQU0sY0FBTixNQUFNLElBQU4sTUFBTSxHQUFJLElBQUksU0FBUyxFQUFFLEVBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFD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SSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLFdBQVcsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDMUUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEUsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLFdBQVcsSUFBRSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUM7UUFDbkcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNuRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQztRQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ25HLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsV0FBVyxDQUFDO1FBQ2xHLE9BQU8sTUFBTSxDQUFDO0lBRWxCLENBQUM7SUFDRCxXQUFXO1FBRVAsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxHQUFHLEdBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsR0FBRyxHQUFDLEdBQUcsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBZ0I7UUFFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBS0QsUUFBUSxDQUFDLENBQUssRUFBQyxDQUFNO1FBRW5CLElBQUksQ0FBQyxZQUFZLFNBQVMsRUFDMUI7WUFDRSxJQUFJLE1BQU0sR0FBSSxDQUFDLGFBQUQsQ0FBQyxjQUFELENBQUMsR0FBSyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3BDLElBQUksTUFBTSxLQUFHLElBQUk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3JDLElBQUksTUFBTSxHQUFFLENBQWMsQ0FBQztZQUMzQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLElBQUksR0FBRyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNoRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDaEcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNsRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFDakcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFFLEdBQUcsR0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFFLEdBQUcsQ0FBQztZQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUUsR0FBRyxDQUFDO1lBQ2xHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRSxHQUFHLENBQUM7WUFHbEcsT0FBTyxNQUFNLENBQUM7U0FDZjthQUFNLElBQUksQ0FBQyxZQUFZLGFBQUssRUFDN0I7WUFDRSxJQUFJLENBQUMsR0FBRSxDQUFVLENBQUM7WUFDbEIsT0FBTyxJQUFJLGFBQUssQ0FDZixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFD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LENBQUM7QUFDOUMsS0FBSyxDQUFDLFFBQVEsR0FBRSxJQUFJLG1CQUFRLEVBQUUsQ0FBQztBQUMvQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBQyxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFDLENBQUMsQ0FBQztBQUMxQixJQUFJLFFBQVEsR0FBRSxJQUFJLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLENBQUMsU0FBUyxHQUFDLGtCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzFDLFFBQVEsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUM7S0FDekMsUUFBUSxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEMsUUFBUSxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxRQUFRLENBQUMsUUFBUSxHQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFFakMsSUFBSSxTQUFTLEdBQUUsSUFBSSxlQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsU0FBUyxDQUFDLFNBQVMsR0FBQyxrQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztLQUMvQyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4QyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4QyxRQUFRLENBQUMsa0JBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxF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QyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUNwRixDQUFDO0FBR04sSUFBSSxlQUFlLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNwRixlQUFlLENBQUMsS0FBSyxHQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDbkMsZUFBZSxDQUFDLE1BQU0sR0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3BDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUM1RCxJQUFJLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEUsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvY2FtZXJhLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jYW52YXMudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2NvbGxlY3Rpb24udHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2NvbG9yLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9jb21wdXRhdGlvbnMudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL2ludGVyc2VjdGlvbi50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvbWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL21hdHJpeC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvcG9pbnRMaWdodC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9zcmMvcmF5LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9zb3J0LnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvc3JjL3R1cGxlLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL3NyYy93b3JsZC50cyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi9zcmMvY2hhcHRlcjcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2FudmFzIH0gZnJvbSBcIi4vY2FudmFzXCI7XG5pbXBvcnQgeyBNYXRyaXg0eDQgfSBmcm9tIFwiLi9tYXRyaXhcIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuaW1wb3J0IHsgV29ybGQgfSBmcm9tIFwiLi93b3JsZFwiO1xuXG5leHBvcnQgY2xhc3MgQ2FtZXJhXG57XG4gIHZzaXplOm51bWJlcjtcbiAgaHNpemU6bnVtYmVyO1xuICBmaWVsZE9mVmlldzpudW1iZXI7XG5cbiAgcHJpdmF0ZSBfaGFsZldpZHRoOiBudW1iZXI7XG4gIHB1YmxpYyBnZXQgaGFsZldpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbGZXaWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbGZIZWlnaHQ6IG51bWJlcjtcbiAgcHVibGljIGdldCBoYWxmaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2hhbGZXaWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgX3BpeGVsU2l6ZTogbnVtYmVyO1xuICBwdWJsaWMgZ2V0IHBpeGVsU2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9waXhlbFNpemU7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2VUcmFuc2Zvcm06IE1hdHJpeDR4NDsgXG4gIHByaXZhdGUgX3RyYW5zZm9ybTogTWF0cml4NHg0OyAgICBcbiAgLyoqXG4gICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2Zvcm0oKTogTWF0cml4NHg0IHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICB9XG4gIHB1YmxpYyBzZXQgdHJhbnNmb3JtKHZhbHVlOiBNYXRyaXg0eDQpIHtcbiAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm09dmFsdWUuaW52ZXJzZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoaHNpemU6bnVtYmVyLHZzaXplOm51bWJlciwgZmllbGRPZlZpZXc6bnVtYmVyLHRyYW5zZm9ybT86TWF0cml4NHg0KSAgXG4gIHtcbiAgICAgIHRoaXMuaHNpemU9aHNpemU7XG4gICAgICB0aGlzLnZzaXplPXZzaXplO1xuICAgICAgdGhpcy5maWVsZE9mVmlldz1maWVsZE9mVmlldztcbiAgICAgIHRoaXMudHJhbnNmb3JtPSB0cmFuc2Zvcm0gPz8gTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpO1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgIFxuICB9XG4gIFxuICAvKipcbiAgICogcmVjYWxjdWxhdGUgZGVyaXZlZCB2YWx1ZXNcbiAgICovXG4gIHVwZGF0ZSgpXG4gIHtcbiAgICB2YXIgaGFsZlZpZXc9TWF0aC50YW4odGhpcy5maWVsZE9mVmlldy8yKTtcbiAgICB2YXIgYXNwZWN0PXRoaXMuaHNpemUvdGhpcy52c2l6ZTtcbiAgICBpZiAoYXNwZWN0ID49MSlcbiAgICB7XG4gICAgICB0aGlzLl9oYWxmV2lkdGg9aGFsZlZpZXc7XG4gICAgICB0aGlzLl9oYWxmSGVpZ2h0PWhhbGZWaWV3L2FzcGVjdDtcbiAgICB9IGVsc2VcbiAgICB7XG4gICAgICB0aGlzLl9oYWxmV2lkdGg9aGFsZlZpZXcqYXNwZWN0O1xuICAgICAgdGhpcy5faGFsZkhlaWdodD1oYWxmVmlldztcbiAgICB9XG4gICAgdGhpcy5fcGl4ZWxTaXplPSh0aGlzLl9oYWxmV2lkdGgqMikgL3RoaXMuaHNpemU7XG4gICAgXG4gIH1cbiAgXG4gIHJheUZvclBpeGVsKHg6bnVtYmVyLHk6bnVtYmVyKTpSYXlcbiAge1xuXG4gICAgdmFyIHhPZmZzZXQ9KHgrMC41KSp0aGlzLl9waXhlbFNpemU7XG4gICAgdmFyIHlPZmZzZXQ9KHkrMC41KSp0aGlzLl9waXhlbFNpemU7XG5cbiAgICB2YXIgd29ybGRYPXRoaXMuX2hhbGZXaWR0aC14T2Zmc2V0O1xuICAgIHZhciB3b3JsZFk9dGhpcy5faGFsZkhlaWdodC15T2Zmc2V0O1xuICAgIFxuICAgIHZhciBwaXhlbD10aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkoVHVwbGUucG9pbnQod29ybGRYLHdvcmxkWSwtMSkpO1xuICAgIHZhciBvcmlnaW49IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShUdXBsZS5wb2ludCgwLDAsMCkpO1xuICAgIHZhciBkaXJlY3Rpb249cGl4ZWwuc3Vic3RyYWN0KG9yaWdpbikubm9ybWFsaXplKCk7XG5cbiAgICByZXR1cm4gbmV3IFJheShvcmlnaW4sZGlyZWN0aW9uKTtcbiAgfVxuXG4gIHJlbmRlcih3b3JsZDpXb3JsZCk6Q2FudmFzXG4gIHtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgQ2FudmFzKHRoaXMuaHNpemUsdGhpcy52c2l6ZSk7XG4gICAgZm9yICh2YXIgeT0gMDt5PCB0aGlzLnZzaXplO3krKylcbiAgICB7XG4gICAgICBmb3IgKHZhciB4PSAwO3g8IHRoaXMuaHNpemU7eCsrKVxuICAgICAge1xuICAgICAgICB2YXIgcmF5ID0gdGhpcy5yYXlGb3JQaXhlbCh4LHkpO1xuICAgICAgICB2YXIgY29sb3I9IHdvcmxkLmNvbG9yQXQocmF5KTtcbiAgICAgICAgaW1hZ2Uud3JpdGVQaXhlbCh4LHksY29sb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW1hZ2U7XG4gIH1cblxufSIsImltcG9ydCB7IENvbG9yIH0gZnJvbSBcIi4vY29sb3JcIjtcblxuZXhwb3J0IGNsYXNzIENhbnZhcyBcbnsgIFxuICAgZGF0YTpGbG9hdDY0QXJyYXk7XG4gICB3aWR0aDpudW1iZXI7XG4gICBoZWlnaHQ6bnVtYmVyO1xuXG4gICBjb25zdHJ1Y3Rvcih3aWR0aDpudW1iZXIsaGVpZ2h0Om51bWJlcilcbiAgIHtcbiAgICAgdGhpcy53aWR0aD13aWR0aDtcbiAgICAgdGhpcy5oZWlnaHQ9aGVpZ2h0O1xuICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHdpZHRoKmhlaWdodCozKTtcbiAgICAgZm9yICh2YXIgaT0wO2k8dGhpcy5kYXRhLmxlbmd0aDtpKyspXG4gICAgIHtcbiAgICAgICAgIHRoaXMuZGF0YVtpXT0wO1xuICAgICB9XG4gICB9XG5cbiAgIHJlYWRQaXhlbCh4Om51bWJlcix5Om51bWJlcik6Q29sb3JcbiAgIHtcbiAgICAgaWYgKHg8MHx8IHg+PXRoaXMud2lkdGggfHwgeTwwIHx8IHk+PSB0aGlzLmhlaWdodCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgdmFyIHBpeGVsSW5kZXg9IE1hdGguZmxvb3IoeSkqIHRoaXMud2lkdGgqMytNYXRoLmZsb29yKHgpKjM7XG4gICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5kYXRhW3BpeGVsSW5kZXhdLHRoaXMuZGF0YVtwaXhlbEluZGV4ICsxXSx0aGlzLmRhdGFbcGl4ZWxJbmRleCArMl0pO1xuICAgfVxuICAgd3JpdGVQaXhlbCAoeDpudW1iZXIseTpudW1iZXIsYzpDb2xvcik6dm9pZFxuICAge1xuICAgICBpZiAoeDwwfHwgeD49dGhpcy53aWR0aCB8fCB5PDAgfHwgeT49IHRoaXMuaGVpZ2h0KSByZXR1cm47XG4gICAgIHZhciBwaXhlbEluZGV4PSBNYXRoLmZsb29yKHkpKiB0aGlzLndpZHRoKjMrTWF0aC5mbG9vcih4KSozO1xuICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleF09Yy5yZWQ7XG4gICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4KzFdPWMuZ3JlZW47XG4gICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4KzJdPWMuYmx1ZTtcbiAgIH1cbiAgIHRvUHBtKCk6c3RyaW5nXG4gICB7XG4gICAgdmFyIHBwbT1cIlAzXFxuXCI7XG4gICAgcHBtKz10aGlzLndpZHRoK1wiIFwiK3RoaXMuaGVpZ2h0K1wiXFxuXCI7XG4gICAgcHBtKz1cIjI1NVwiO1xuICAgIGZvciAodmFyIGk9MDtpPHRoaXMuZGF0YS5sZW5ndGg7aSs9MylcbiAgICB7XG4gICAgICAgIHBwbSs9KGklMTU9PTApID8gIFwiXFxuXCIgOlwiIFwiO1xuICAgICAgICBwcG0rPSBNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpXSoyNTUpLDI1NSksMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgKyBcIiBcIitNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpKzFdKjI1NSksMjU1KSwwKS50b1N0cmluZygpXG4gICAgICAgICAgICArXCIgXCIrTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSsyXSoyNTUpLDI1NSksMCkudG9TdHJpbmcoKTsgXG5cbiAgICB9XG4gICAgcHBtKz1cIlxcblwiO1xuICAgIHJldHVybiBwcG07XG4gICB9XG4gICB0b1VpbnQ4Q2xhbXBlZEFycmF5KCk6VWludDhDbGFtcGVkQXJyYXlcbiAgIHtcbiAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLndpZHRoKnRoaXMuaGVpZ2h0KjQpO1xuICAgICB2YXIgYXJySW5kZXg9MDtcbiAgICAgZm9yICh2YXIgaT0wO2k8dGhpcy5kYXRhLmxlbmd0aDtpKz0zKVxuICAgICB7ICAgICAgICBcbiAgICAgICAgIGFyclthcnJJbmRleF09IHRoaXMuZGF0YVtpXSoyNTU7XG4gICAgICAgICBhcnJbYXJySW5kZXgrMV09ICB0aGlzLmRhdGFbaSsxXSoyNTU7XG4gICAgICAgICBhcnJbYXJySW5kZXgrMl09IHRoaXMuZGF0YVtpKzJdKjI1NTtcbiAgICAgICAgIGFyclthcnJJbmRleCszXT0gMjU1O1xuICAgICAgICAgYXJySW5kZXgrPTQ7IFxuICAgICB9XG4gICAgIFxuICAgICByZXR1cm4gYXJyO1xuICAgfVxufSIsIlxuLyoqXG4gKiBPYmplY3QgcG9vbCB0aGF0IHdpbGwgbWluaW1pemUgZ2FyYmFnZSBjb2xsZWN0aW9uIHVzYWdlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPYmplY3RQb29sPFQ+XG57XG4gICAgcHJvdGVjdGVkIGl0ZW1zOlRbXTtcbiAgICBwcm90ZWN0ZWQgX2xlbmd0aDpudW1iZXI7XG4gICAgcHJvdGVjdGVkIGluZGV4TWFwOk1hcDxULG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcihhcnJheUxlbmd0aDpudW1iZXI9MClcbiAgICB7XG4gICAgICB0aGlzLml0ZW1zPW5ldyBBcnJheTxUPihhcnJheUxlbmd0aCk7XG4gICAgICB0aGlzLmluZGV4TWFwPSBuZXcgTWFwPFQsbnVtYmVyPigpO1xuICAgICAgdGhpcy5fbGVuZ3RoPTA7XG4gICAgICBmb3IgKHZhciBpPTA7aTxhcnJheUxlbmd0aDtpKyspXG4gICAgICB7XG4gICAgICAgIHZhciBuZXdJdGVtPXRoaXMuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0saSk7XG4gICAgICAgIHRoaXMuaXRlbXNbaV09bmV3SXRlbTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH1cblxuICAgIGluZGV4T2YoaXRlbTpUKTpudW1iZXJcbiAgICB7XG4gICAgIHZhciBpPSB0aGlzLmluZGV4TWFwLmdldChpdGVtKTtcbiAgICAgcmV0dXJuIChpPT09dW5kZWZpbmVkIHx8IGk+PXRoaXMuX2xlbmd0aCkgID8gLTE6IGk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGFuZCBmaWxscyB0aGUgZ2FwIHdpdGggdGhlIGxhc3QgaXRlbS5cbiAgICAgKiBSZW1vdmVkIGl0ZW1zIHdpbGwgYmUgcmV1c2VkIHdoZW4gY2FsbGluZyAuYWRkKCkgXG4gICAgKi9cbiAgICByZW1vdmUoaXRlbTpUKTp2b2lkO1xuICAgIHJlbW92ZShpbmRleDpudW1iZXIpOnZvaWQ7XG4gICAgcHVibGljIHJlbW92ZShhOmFueSk6dm9pZFxuICAgIHsgXG4gICAgICAgIHZhciBpbmRleDpudW1iZXI7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleD10aGlzLmluZGV4TWFwLmdldChhKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgIH0gZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBpbmRleD0gTWF0aC5mbG9vcihhIGFzIG51bWJlcik7IFxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8MCB8fCBpbmRleCA+PXRoaXMuX2xlbmd0aCkgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sZW5ndGgtLTsgICAgICAgIFxuICAgICAgICB2YXIgcmVtb3ZlSXRlbT0gIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgICAgICB2YXIgbGFzdEl0ZW09dGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdO1xuICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IGxhc3RJdGVtO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF09cmVtb3ZlSXRlbTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQocmVtb3ZlSXRlbSx0aGlzLl9sZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChsYXN0SXRlbSxpbmRleCk7XG4gICAgfVxuICAgIHB1YmxpYyBjbGVhcigpXG4gICAge1xuICAgICAgICB0aGlzLl9sZW5ndGg9MDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIHVudXNlZCBpdGVtIG9yIGNyZWF0ZXMgYSBuZXcgb25lLCBpZiBubyB1bnVzZWQgaXRlbSBhdmFpbGFibGVcbiAgICAqL1xuICAgIHB1YmxpYyBhZGQoKTpUXG4gICAge1xuICAgICAgICBpZiAodGhpcy5pdGVtcy5sZW5ndGg9PXRoaXMuX2xlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW09dGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aD10aGlzLml0ZW1zLnB1c2gobmV3SXRlbSk7ICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBuZXdJdGVtO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoKytdOyAgXG4gICAgfVxuICAgIHB1YmxpYyBnZXQoaW5kZXg6bnVtYmVyKTpUIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBpZiAoaW5kZXggPj10aGlzLl9sZW5ndGgpIHJldHVybiB1bmRlZmluZWQ7ICAgXG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbGVuZ3RoKCkgOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuICAgIFxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGUoKTpUO1xufVxuXG4iLCJleHBvcnQgY2xhc3MgQ29sb3Ige1xuICAgIHB1YmxpYyByZWQ6IG51bWJlcjtcbiAgICBwdWJsaWMgZ3JlZW46IG51bWJlcjtcbiAgICBwdWJsaWMgYmx1ZTogbnVtYmVyO1xuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIEVQU0lMT046IG51bWJlciA9IDAuMDAwMDE7XG4gICAgXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBCTEFDSz0gT2JqZWN0LmZyZWV6ZShuZXcgQ29sb3IoMCwwLDApKTtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdISVRFPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigxLDEsMSkpO1xuICAgIGNvbnN0cnVjdG9yKClcbiAgICBjb25zdHJ1Y3RvcihyZWQ6IG51bWJlciwgZ3JlZW46IG51bWJlciwgYmx1ZTogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKHJlZD86IG51bWJlciwgZ3JlZW4/OiBudW1iZXIsIGJsdWU/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yZWQgPSByZWQ7XG4gICAgICAgIHRoaXMuZ3JlZW4gPSBncmVlbjtcbiAgICAgICAgdGhpcy5ibHVlID0gYmx1ZTsgICAgICAgIFxuICAgIH1cblxuXG4gICAgcHVibGljIGFkZChjb2xvcjogQ29sb3IpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKyBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKyBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICsgY29sb3IuYmx1ZSlcbiAgICB9XG4gICAgcHVibGljIG11bHRpcGx5KHNjYWxhcjogbnVtYmVyKTogQ29sb3Ige1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICogc2NhbGFyLCB0aGlzLmdyZWVuICogc2NhbGFyLCB0aGlzLmJsdWUgKiBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBkaXZpZGUoc2NhbGFyOiBudW1iZXIpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLyBzY2FsYXIsIHRoaXMuZ3JlZW4gLyBzY2FsYXIsIHRoaXMuYmx1ZSAvIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIHN1YnN0cmFjdChjb2xvcjogQ29sb3IpOiBDb2xvciB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLSBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gLSBjb2xvci5ncmVlbiwgdGhpcy5ibHVlIC0gY29sb3IuYmx1ZSlcbiAgICB9XG4gICAgcHVibGljIGhhZGFtYXJkUHJvZHVjdChjb2xvcjpDb2xvcilcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQqY29sb3IucmVkLHRoaXMuZ3JlZW4qY29sb3IuZ3JlZW4sdGhpcy5ibHVlKmNvbG9yLmJsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBlcXVhbHMoY29sb3I6IENvbG9yKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnJlZCAtIGNvbG9yLnJlZCkgPCBDb2xvci5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4pIDwgQ29sb3IuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ibHVlIC0gY29sb3IuYmx1ZSkgPCBDb2xvci5FUFNJTE9OO1xuICAgIH1cbiAgICBjbG9uZSgpXG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkLHRoaXMuZ3JlZW4sdGhpcy5ibHVlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgSW50ZXJzZWN0aW9uIH0gZnJvbSBcIi4vaW50ZXJzZWN0aW9uXCI7XG5pbXBvcnQgeyBSYXkgfSBmcm9tIFwiLi9yYXlcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcbmltcG9ydCB7IElXb3JsZE9iamVjdCB9IGZyb20gXCIuL3dvcmxkXCI7XG5cbmV4cG9ydCBjbGFzcyBDb21wdXRhdGlvbnNcbntcbiAgICB0OiBudW1iZXI7XG4gICAgb2JqZWN0OiBJV29ybGRPYmplY3Q7XG4gICAgcG9pbnQ6IFR1cGxlO1xuICAgIGV5ZXY6VHVwbGU7XG4gICAgbm9ybWFsdjogVHVwbGU7XG4gICAgaW5zaWRlOiBib29sZWFuO1xuICAgIHB1YmxpYyBzdGF0aWMgcHJlcGFyZShpbnRlcnNlY3Rpb246SW50ZXJzZWN0aW9uLHJheTpSYXkgKTpDb21wdXRhdGlvbnNcbiAgICB7XG4gICAgICB2YXIgY29tcHMgPSBuZXcgQ29tcHV0YXRpb25zKCk7XG4gICAgICBjb21wcy50PWludGVyc2VjdGlvbi50O1xuICAgICAgY29tcHMub2JqZWN0PWludGVyc2VjdGlvbi5vYmplY3Q7XG5cbiAgICAgIGNvbXBzLnBvaW50PXJheS5wb3NpdGlvbihjb21wcy50KTtcbiAgICAgIGNvbXBzLmV5ZXY9cmF5LmRpcmVjdGlvbi5uZWdhdGUoKTtcbiAgICAgIGNvbXBzLm5vcm1hbHY9IGNvbXBzLm9iamVjdC5ub3JtYWxBdChjb21wcy5wb2ludCk7XG4gICAgICBpZiAoY29tcHMubm9ybWFsdi5kb3QoY29tcHMuZXlldik8MClcbiAgICAgIHtcbiAgICAgICAgY29tcHMuaW5zaWRlPXRydWU7XG4gICAgICAgIGNvbXBzLm5vcm1hbHY9Y29tcHMubm9ybWFsdi5uZWdhdGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBzLmluc2lkZT1mYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBzO1xuICAgIH1cblxuICAgIFxuICAgIGNvbnN0cnVjdG9yKClcbiAgICB7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgeyBPYmplY3RQb29sIH0gZnJvbSBcIi4vY29sbGVjdGlvblwiXG5pbXBvcnQge21lcmdlU29ydElucGxhY2V9IGZyb20gXCIuL3NvcnRcIlxuaW1wb3J0IHsgSVdvcmxkT2JqZWN0IH0gZnJvbSBcIi4vd29ybGRcIjtcbmV4cG9ydCBjbGFzcyBJbnRlcnNlY3Rpb24ge1xuICAgIHQ6IG51bWJlcjtcbiAgICBvYmplY3Q6IElXb3JsZE9iamVjdDtcbiAgICBjb25zdHJ1Y3Rvcih0OiBudW1iZXIsIG9iamVjdDogYW55KSB7XG5cbiAgICAgICAgdGhpcy50ID0gdDtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb246IEludGVyc2VjdGlvbik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy50ID09IGludGVyc2VjdGlvbi50ICYmIHRoaXMub2JqZWN0ID09PSBpbnRlcnNlY3Rpb24ub2JqZWN0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludGVyc2VjdGlvbnMgZXh0ZW5kcyBPYmplY3RQb29sPEludGVyc2VjdGlvbj4ge1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgc29ydEludGVyc2VjdGlvbihhOkludGVyc2VjdGlvbiAsYjpJbnRlcnNlY3Rpb24pOm51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIGEudC1iLnQ7XG4gICAgfVxuXG5cbiAgICBwcm90ZWN0ZWQgY3JlYXRlKCk6IEludGVyc2VjdGlvbiB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uKDAsIG51bGwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaGl0LCByZWdhcmRsZXNzIG9mIHNvcnRcbiAgICAqL1xuICAgIGhpdCgpOiBJbnRlcnNlY3Rpb24ge1xuICAgICAgICB2YXIgaGl0OiBJbnRlcnNlY3Rpb24gPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoKGhpdCA9PSBudWxsIHx8IGl0ZW0udCA8IGhpdC50KSAmJiBpdGVtLnQgPiAwKSBoaXQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxuICAgIHNvcnQoKTogdm9pZCB7ICAgICAgIFxuICAgICAgICBtZXJnZVNvcnRJbnBsYWNlKHRoaXMuaXRlbXMsSW50ZXJzZWN0aW9ucy5zb3J0SW50ZXJzZWN0aW9uLDAsdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGhpcy5pdGVtc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbnM6IEludGVyc2VjdGlvbnMpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCAhPSBpbnRlcnNlY3Rpb25zLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXRlbXNbaV0uZXF1YWxzKGludGVyc2VjdGlvbnMuaXRlbXNbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IENvbG9yIH0gZnJvbSBcIi4vY29sb3JcIjtcbmltcG9ydCB7IFBvaW50TGlnaHQgfSBmcm9tIFwiLi9wb2ludExpZ2h0XCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBNYXRlcmlhbFxue1xuICAgIGNvbG9yOkNvbG9yPUNvbG9yLldISVRFLmNsb25lKCk7XG4gICAgYW1iaWVudDpudW1iZXI9MC4xO1xuICAgIGRpZmZ1c2U6bnVtYmVyPTAuOTtcbiAgICBzcGVjdWxhcjpudW1iZXI9MC45O1xuICAgIHNoaW5pbmVzczpudW1iZXI9MjAwO1xuXG4gICAgbGlnaHRpbmcobGlnaHQ6UG9pbnRMaWdodCxwb2ludDpUdXBsZSxleWV2OlR1cGxlLG5vcm1hbHY6VHVwbGUpOkNvbG9yXG4gICAge1xuICAgICAgIHZhciBlZmZlY3RpdmVDb2xvcj10aGlzLmNvbG9yLmhhZGFtYXJkUHJvZHVjdChsaWdodC5pbnRlbnNpdHkpO1xuICAgICAgIHZhciBsaWdodHY9bGlnaHQucG9zaXRvbi5zdWJzdHJhY3QocG9pbnQpLm5vcm1hbGl6ZSgpO1xuICAgICAgIHZhciBhbWJpZW50PWVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuYW1iaWVudCk7XG4gICAgICAgdmFyIGxpZ2h0RG90Tm9ybWFsPWxpZ2h0di5kb3Qobm9ybWFsdik7XG4gICAgICAgdmFyIGRpZmZ1c2U7XG4gICAgICAgdmFyIHNwZWN1bGFyO1xuICAgICAgIGlmIChsaWdodERvdE5vcm1hbDwwKVxuICAgICAgIHtcbiAgICAgICAgIGRpZmZ1c2U9Q29sb3IuQkxBQ0s7XG4gICAgICAgICBzcGVjdWxhcj1Db2xvci5CTEFDSztcbiAgICAgICB9IGVsc2VcbiAgICAgICB7XG4gICAgICAgICAgIGRpZmZ1c2U9ZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5kaWZmdXNlKmxpZ2h0RG90Tm9ybWFsKTtcbiAgICAgICAgICAgdmFyIHJlZmxlY3R2PWxpZ2h0di5uZWdhdGUoKS5yZWZsZWN0KG5vcm1hbHYpO1xuICAgICAgICAgICB2YXIgcmVmbGVjdERvdEV5ZT0gcmVmbGVjdHYuZG90KGV5ZXYpO1xuICAgICAgICAgICBpZiAocmVmbGVjdERvdEV5ZSA8PTApXG4gICAgICAgICAgIHtcbiAgICAgICAgICAgICAgIHNwZWN1bGFyPUNvbG9yLkJMQUNLO1xuICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAge1xuICAgICAgICAgICAgIHZhciBmYWN0b3I9TWF0aC5wb3cocmVmbGVjdERvdEV5ZSx0aGlzLnNoaW5pbmVzcyk7XG4gICAgICAgICAgICAgc3BlY3VsYXI9IGxpZ2h0LmludGVuc2l0eS5tdWx0aXBseSh0aGlzLnNwZWN1bGFyKmZhY3RvciApO1xuXG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgICAgcmV0dXJuIGFtYmllbnQuYWRkKGRpZmZ1c2UpLmFkZChzcGVjdWxhcik7XG4gICAgfVxufSIsImltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcblxuZXhwb3J0IGNsYXNzIE1hdHJpeCB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgRVBTSUxPTjogbnVtYmVyID0gMC4wMDAwMTtcbiAgICBwcm90ZWN0ZWQgZGF0YTogRmxvYXQ2NEFycmF5O1xuICAgIFxuICAgXG4gICAgcHVibGljIHJlYWRvbmx5IHdpZHRoOiBudW1iZXI7XG4gICAgcHVibGljIHJlYWRvbmx5IGhlaWdodDogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IobWF0cml4OiBBcnJheTxBcnJheTxudW1iZXI+PilcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcilcbiAgICBjb25zdHJ1Y3RvcihhOiBhbnksIGI/OiBhbnkpIHtcbiAgICAgICAgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGEgYXMgQXJyYXk8QXJyYXk8bnVtYmVyPj47XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aD09MCB8fCBtYXRyaXhbMF0ubGVuZ3RoPT0wKSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGg9bWF0cml4WzBdLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0PW1hdHJpeC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkoIHRoaXMud2lkdGgqdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IG1hdHJpeFt5XTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4PTA7eDwgdGhpcy53aWR0aDt4KyspXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZT0gcm93W3hdO1xuICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSE9PXVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgIGRhdGFbdGhpcy53aWR0aCp5K3hdPXZhbHVlO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IGEgYXMgbnVtYmVyO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBiIGFzIG51bWJlcjtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy53aWR0aCp0aGlzLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29mYWN0b3Iocm93Om51bWJlcixjb2x1bW46bnVtYmVyKTpudW1iZXJcbiAgICB7XG4gICAgICAgcmV0dXJuICgocm93K2NvbHVtbikgJSAyICoyIC0xKSogLXRoaXMubWlub3Iocm93LGNvbHVtbik7XG4gICAgfVxuICAgIG1pbm9yKHJvdzpudW1iZXIsY29sdW1uOm51bWJlcik6bnVtYmVyXG4gICAgeyAgIFxuICAgICAgICB2YXIgbT0gdGhpcy5zdWJtYXRyaXgocm93LGNvbHVtbik7ICAgICAgICBcbiAgICAgICAgcmV0dXJuIG0uZGV0ZXJtaW5hbnQoKTsgXG4gICAgfVxuICAgIGlzSW52ZXJ0aWJsZSgpOmJvb2xlYW5cbiAgICB7XG4gICAgIHJldHVybiB0aGlzLmRldGVybWluYW50KCkhPTA7XG4gICAgfVxuICAgXG4gICAgZGV0ZXJtaW5hbnQoKTpudW1iZXJcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoIT10aGlzLmhlaWdodCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIGlmICh0aGlzLndpZHRoPT0yKSByZXR1cm4gTWF0cml4MngyLnByb3RvdHlwZS5kZXRlcm1pbmFudC5jYWxsKHRoaXMpO1xuICAgICAgICB2YXIgZGV0PTA7XG4gICAgICAgIGZvciAodmFyIHg9MDt4PHRoaXMud2lkdGg7eCsrKVxuICAgICAgICB7XG4gICAgICAgICBkZXQrPSB0aGlzLmRhdGFbeF0qdGhpcy5jb2ZhY3RvcigwLHgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHsgXG4gICAgICAgICAgICBzdHJpbmcgKz0gXCJ8XCIgICBcbiAgICAgICAgICAgIGZvciAodmFyIHg9MDt4PCB0aGlzLndpZHRoO3grKylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gIHRoaXMuZGF0YVt0aGlzLndpZHRoKnkreF0udG9GaXhlZCgyKStcIlxcdHxcIjsgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0cmluZyArPSAgXCJcXG5cIjsgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG5cbiAgICBnZXQocm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMud2lkdGgqcm93K2NvbHVtbl0gO1xuICAgIH1cblxuICAgIHNldChyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXIsIHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHJvdyA+PSB0aGlzLmhlaWdodCB8fCBjb2x1bW4gPj0gdGhpcy53aWR0aCB8fCByb3cgPCAwIHx8IGNvbHVtbiA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHRoaXMuZGF0YVt0aGlzLndpZHRoKnJvdytjb2x1bW5dID0gdmFsdWU7XG4gICAgfVxuICAgIFxuXG4gICAgbXVsdGlwbHkobWF0cml4OiBNYXRyaXgpOiBNYXRyaXhcbiAgICB7ICAgICBcbiAgICAgICAgICAgXG4gICAgICAgIGlmIChtYXRyaXguaGVpZ2h0ICE9IHRoaXMuaGVpZ2h0KSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4KG1hdHJpeC53aWR0aCwgbWF0cml4LmhlaWdodCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBtYXRyaXguaGVpZ2h0OyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IG1hdHJpeC5kYXRhW3RoaXMud2lkdGgqcit4XSAqIHRoaXMuZGF0YVt0aGlzLndpZHRoKnkrcl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0uZGF0YVt0aGlzLndpZHRoKnkreF0gPSBzdW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuXG4gICAgdHJhbnNwb3NlKCkgOk1hdHJpeFxuICAgIHtcbiAgICAgICAgdmFyIG1hdHJpeD0gbmV3IE1hdHJpeCh0aGlzLmhlaWdodCx0aGlzLndpZHRoKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBtYXRyaXguaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSB5OyB4IDwgbWF0cml4LndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXg9dGhpcy53aWR0aCp5K3g7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4VHJhbnNwb3NlZD10aGlzLndpZHRoKngreTtcbiAgICAgICAgICAgICAgICB2YXIgc3dhcD0gIHRoaXMuZGF0YVtpbmRleF07ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4XSA9IHRoaXMuZGF0YVtpbmRleFRyYW5zcG9zZWRdO1xuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4VHJhbnNwb3NlZF0gPSBzd2FwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXg7XG4gICAgfVxuICAgIFxuXG4gICAgc3VibWF0cml4KHJvdzpudW1iZXIsY29sdW1uOm51bWJlcik6TWF0cml4XG4gICAge1xuICAgICAgICB2YXIgbT0gbmV3IE1hdHJpeCh0aGlzLndpZHRoLTEsdGhpcy5oZWlnaHQtMSk7ICAgICAgIFxuICAgICAgICB2YXIgeTI9MDsgICAgICAgIFxuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGlmICh5PT1yb3cpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgeDI9MDtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHg9PWNvbHVtbilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbbS53aWR0aCp5Mit4Ml09dGhpcy5kYXRhW3RoaXMud2lkdGgqeSt4XTtcbiAgICAgICAgICAgICAgICB4MisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeTIrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gXG5cbiAgICBlcXVhbHMobWF0cml4OiBNYXRyaXgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT0gbWF0cml4LndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IG1hdHJpeC5oZWlnaHQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBkaWZmPSBNYXRoLmFicyh0aGlzLmRhdGFbaV0gLSBtYXRyaXguZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPj0gTWF0cml4LkVQU0lMT04pIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeDR4NCBleHRlbmRzIE1hdHJpeFxue1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURFTlRJVFlfTUFUUklYID1uZXcgTWF0cml4NHg0KFxuICAgICAgICBbXG4gICAgICAgICAgICBbMSwwLDAsMF0sXG4gICAgICAgICAgICBbMCwxLDAsMF0sXG4gICAgICAgICAgICBbMCwwLDEsMF0sXG4gICAgICAgICAgICBbMCwwLDAsMV1cbiAgICAgICAgXVxuICAgICk7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdGVtcE1hdHJpeDR4ND0gbmV3IE1hdHJpeDR4NCgpO1xuXG4gICAgcHVibGljIHN0YXRpYyB2aWV3VHJhbnNmb3JtKGZyb206VHVwbGUsdG86VHVwbGUsdXA6VHVwbGUgLHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldD8/PW5ldyBNYXRyaXg0eDQoKTtcblxuICAgICAgICB2YXIgZm9yd2FyZD10by5zdWJzdHJhY3QoZnJvbSkubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciB1cG49IHVwLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgbGVmdCA9Zm9yd2FyZC5jcm9zcyh1cG4pO1xuICAgICAgICB2YXIgdHJ1ZVVwPWxlZnQuY3Jvc3MoZm9yd2FyZCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPWxlZnQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09bGVmdC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXT1sZWZ0Lno7XG5cblxuICAgICAgICB0YXJnZXQuZGF0YVs0XT10cnVlVXAueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09dHJ1ZVVwLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPXRydWVVcC56O1xuXG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09LWZvcndhcmQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09LWZvcndhcmQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPS1mb3J3YXJkLno7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIFxuICAgICAgICBNYXRyaXg0eDQudHJhbnNsYXRpb24oLWZyb20ueCwtZnJvbS55LC1mcm9tLnosIE1hdHJpeDR4NC50ZW1wTWF0cml4NHg0KTtcblxuICAgICAgICB0YXJnZXQubXVsdGlwbHkoTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQsdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGF0aWMgdHJhbnNsYXRpb24oeDpudW1iZXIseTpudW1iZXIsejpudW1iZXIsdGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0Pz89bmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsxXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uWChyYWRpYW5zOm51bWJlcix0YXJnZXQ/Ok1hdHJpeDR4NCk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB0YXJnZXQ/Pz0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB2YXIgY29zPU1hdGguY29zKHJhZGlhbnMpO1xuICAgICAgICB2YXIgc2luPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzJdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPS1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyByb3RhdGlvblkocmFkaWFuczpudW1iZXIsdGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0Pz89IG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgdmFyIGNvcz1NYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbj0gTWF0aC5zaW4ocmFkaWFucyk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdPWNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09LXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09c2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVszXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdPTE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgcm90YXRpb25aKHJhZGlhbnM6bnVtYmVyLHRhcmdldD86TWF0cml4NHg0KTpNYXRyaXg0eDRcbiAgICB7XG4gICAgICAgIHRhcmdldD8/PSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIHZhciBjb3M9TWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW49IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT1jb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09LXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09Y29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM109MDtcblxuICAgICAgICB0YXJnZXQuZGF0YVsyXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIHNjYWxpbmcoeDpudW1iZXIseTpudW1iZXIsejpudW1iZXIsdGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0Pz89IG5ldyBNYXRyaXg0eDQoKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdPXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzNdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0wO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09MTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBzaGVhcmluZyh4eTpudW1iZXIseHo6bnVtYmVyLHl4Om51bWJlcix5ejpudW1iZXIseng6bnVtYmVyLHp5Om51bWJlcix0YXJnZXQ/Ok1hdHJpeDR4NCk6TWF0cml4NHg0XG4gICAge1xuICAgICAgICB0YXJnZXQ/Pz0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT15eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF09eng7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT0wO1xuXG4gICAgICAgIHRhcmdldC5kYXRhWzFdPXh5O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XT0xO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XT16eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMl09eHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPXl6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF09MTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPTA7XG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbM109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109MDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdPTA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0xO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuXG4gICAgY29uc3RydWN0b3IobWF0cml4PzogQXJyYXk8QXJyYXk8bnVtYmVyPj4pIFxuICAgIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFxuICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGghPTQgfHwgbWF0cml4WzBdLmxlbmd0aCE9NCB8fCBtYXRyaXhbMV0ubGVuZ3RoIT00IHx8IG1hdHJpeFsyXS5sZW5ndGghPTQgfHwgbWF0cml4WzNdLmxlbmd0aCE9NClcbiAgICAgICAgIHtcbiAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgIH1cbiAgICAgICAgICBzdXBlcihtYXRyaXgpOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdXBlcig0ICw0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0cmFuc3Bvc2UodGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdmFyIHN3YXA6bnVtYmVyO1xuICAgICAgICB0YXJnZXQ/Pz1uZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHRoaXMuZGF0YVs4XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzNdO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzZdO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSBzd2FwO1xuICAgICAgICBzd2FwPSAgdGhpcy5kYXRhWzddO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgIHN3YXA9ICB0aGlzLmRhdGFbMTFdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSB0aGlzLmRhdGFbMTRdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGludmVyc2UodGFyZ2V0PzpNYXRyaXg0eDQpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdGFyZ2V0ID8/PSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIHZhciBhMDA9dGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxPXRoaXMuZGF0YVsxXTtcbiAgICAgICAgdmFyIGEwMj10aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDM9dGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgdmFyIGExMT10aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTI9dGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgdmFyIGEyMD10aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjE9dGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyPXRoaXMuZGF0YVsxMF07XG4gICAgICAgIHZhciBhMjM9dGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMD10aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxPXRoaXMuZGF0YVsxM107XG4gICAgICAgIHZhciBhMzI9dGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMz10aGlzLmRhdGFbMTVdO1xuICAgICAgICB2YXIgZGV0ZXJtaW5hbnQ9IChhMDAqKGExMSooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjEqYTMzLWEyMyphMzEpK2ExMyooYTIxKmEzMi1hMjIqYTMxKSkrXG4gICAgICAgICAgICAgICAgICAgICAgICBhMDEqLShhMTAqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzItYTIyKmEzMCkpK1xuICAgICAgICAgICAgICAgICAgICAgICAgYTAyKihhMTAqKGEyMSphMzMtYTIzKmEzMSkrYTExKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzEtYTIxKmEzMCkpK1xuICAgICAgICAgICAgICAgICAgICAgICAgYTAzKi0oYTEwKihhMjEqYTMyLWEyMiphMzEpK2ExMSotKGEyMCphMzItYTIyKmEzMCkrYTEyKihhMjAqYTMxLWEyMSphMzApKSk7ICAgXG4gICAgICAgIGlmIChkZXRlcm1pbmFudD09MCkgcmV0dXJuIG51bGw7ICAgICAgICAgICAgICAgXG5cbiAgICAgICAgdGFyZ2V0LmRhdGFbMF09IChhMTEqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIxKmEzMy1hMjMqYTMxKSthMTMqKGEyMSphMzItYTIyKmEzMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXT0gLShhMDEqKGEyMiphMzMtYTIzKmEzMikrYTAyKi0oYTIxKmEzMy1hMjMqYTMxKSthMDMqKGEyMSphMzItYTIyKmEzMSkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXT0gKGEwMSooYTEyKmEzMy1hMTMqYTMyKSthMDIqLShhMTEqYTMzLWExMyphMzEpK2EwMyooYTExKmEzMi1hMTIqYTMxKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdPSAtKGEwMSooYTEyKmEyMy1hMTMqYTIyKSthMDIqLShhMTEqYTIzLWExMyphMjEpK2EwMyooYTExKmEyMi1hMTIqYTIxKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdPSAtKGExMCooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMi1hMjIqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdPSAoYTAwKihhMjIqYTMzLWEyMyphMzIpK2EwMiotKGEyMCphMzMtYTIzKmEzMCkrYTAzKihhMjAqYTMyLWEyMiphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl09IC0oYTAwKihhMTIqYTMzLWExMyphMzIpK2EwMiotKGExMCphMzMtYTEzKmEzMCkrYTAzKihhMTAqYTMyLWExMiphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109IChhMDAqKGExMiphMjMtYTEzKmEyMikrYTAyKi0oYTEwKmEyMy1hMTMqYTIwKSthMDMqKGExMCphMjItYTEyKmEyMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT0gKGExMCooYTIxKmEzMy1hMjMqYTMxKSthMTEqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzldPSAtKGEwMCooYTIxKmEzMy1hMjMqYTMxKSthMDEqLShhMjAqYTMzLWEyMyphMzApK2EwMyooYTIwKmEzMS1hMjEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT0gKGEwMCooYTExKmEzMy1hMTMqYTMxKSthMDEqLShhMTAqYTMzLWExMyphMzApK2EwMyooYTEwKmEzMS1hMTEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT0gLShhMDAqKGExMSphMjMtYTEzKmEyMSkrYTAxKi0oYTEwKmEyMy1hMTMqYTIwKSthMDMqKGExMCphMjEtYTExKmEyMCkpL2RldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl09IC0oYTEwKihhMjEqYTMyLWEyMiphMzEpK2ExMSotKGEyMCphMzItYTIyKmEzMCkrYTEyKihhMjAqYTMxLWEyMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPSAoYTAwKihhMjEqYTMyLWEyMiphMzEpK2EwMSotKGEyMCphMzItYTIyKmEzMCkrYTAyKihhMjAqYTMxLWEyMSphMzApKS9kZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdPSAtKGEwMCooYTExKmEzMi1hMTIqYTMxKSthMDEqLShhMTAqYTMyLWExMiphMzApK2EwMiooYTEwKmEzMS1hMTEqYTMwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XT0gKGEwMCooYTExKmEyMi1hMTIqYTIxKSthMDEqLShhMTAqYTIyLWExMiphMjApK2EwMiooYTEwKmEyMS1hMTEqYTIwKSkvZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIFxuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpXG4gICAgeyBcbiAgICAgICAgdmFyIGEwMD10aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDE9dGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyPXRoaXMuZGF0YVsyXTtcbiAgICAgICAgdmFyIGEwMz10aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTA9dGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExPXRoaXMuZGF0YVs1XTtcbiAgICAgICAgdmFyIGExMj10aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTM9dGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwPXRoaXMuZGF0YVs4XTtcbiAgICAgICAgdmFyIGEyMT10aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjI9dGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMz10aGlzLmRhdGFbMTFdO1xuICAgICAgICB2YXIgYTMwPXRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzE9dGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMj10aGlzLmRhdGFbMTRdO1xuICAgICAgICB2YXIgYTMzPXRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiAoYTAwKihhMTEqKGEyMiphMzMtYTIzKmEzMikrYTEyKi0oYTIxKmEzMy1hMjMqYTMxKSthMTMqKGEyMSphMzItYTIyKmEzMSkpK1xuICAgICAgICAgICAgICAgIGEwMSotKGExMCooYTIyKmEzMy1hMjMqYTMyKSthMTIqLShhMjAqYTMzLWEyMyphMzApK2ExMyooYTIwKmEzMi1hMjIqYTMwKSkrXG4gICAgICAgICAgICAgICAgYTAyKihhMTAqKGEyMSphMzMtYTIzKmEzMSkrYTExKi0oYTIwKmEzMy1hMjMqYTMwKSthMTMqKGEyMCphMzEtYTIxKmEzMCkpK1xuICAgICAgICAgICAgICAgIGEwMyotKGExMCooYTIxKmEzMi1hMjIqYTMxKSthMTEqLShhMjAqYTMyLWEyMiphMzApK2ExMiooYTIwKmEzMS1hMjEqYTMwKSkpOyAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGFzc2lnbihtYXRyaXg6TWF0cml4NHg0KVxuICAgIHtcbiAgICAgICAgdGhpcy5kYXRhWzBdPSBtYXRyaXguZGF0YVswXTtcbiAgICAgICAgdGhpcy5kYXRhWzFdPSBtYXRyaXguZGF0YVsxXTtcbiAgICAgICAgdGhpcy5kYXRhWzJdPSBtYXRyaXguZGF0YVsyXTtcbiAgICAgICAgdGhpcy5kYXRhWzNdPSBtYXRyaXguZGF0YVszXTtcbiAgICAgICAgdGhpcy5kYXRhWzRdPSBtYXRyaXguZGF0YVs0XTtcbiAgICAgICAgdGhpcy5kYXRhWzVdPSBtYXRyaXguZGF0YVs1XTtcbiAgICAgICAgdGhpcy5kYXRhWzZdPSBtYXRyaXguZGF0YVs2XTtcbiAgICAgICAgdGhpcy5kYXRhWzddPSBtYXRyaXguZGF0YVs3XTtcbiAgICAgICAgdGhpcy5kYXRhWzhdPSBtYXRyaXguZGF0YVs4XTtcbiAgICAgICAgdGhpcy5kYXRhWzldPSBtYXRyaXguZGF0YVs5XTtcbiAgICAgICAgdGhpcy5kYXRhWzEwXT0gbWF0cml4LmRhdGFbMTBdO1xuICAgICAgICB0aGlzLmRhdGFbMTFdPSBtYXRyaXguZGF0YVsxMV07XG4gICAgICAgIHRoaXMuZGF0YVsxMl09IG1hdHJpeC5kYXRhWzEyXTtcbiAgICAgICAgdGhpcy5kYXRhWzEzXT0gbWF0cml4LmRhdGFbMTNdO1xuICAgICAgICB0aGlzLmRhdGFbMTRdPSBtYXRyaXguZGF0YVsxNF07XG4gICAgICAgIHRoaXMuZGF0YVsxNV09IG1hdHJpeC5kYXRhWzE1XTtcbiAgICB9XG5cbiAgICBjbG9uZSgpOk1hdHJpeDR4NFxuICAgIHtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIG0uZGF0YVswXT10aGlzLmRhdGFbMF07XG4gICAgICAgIG0uZGF0YVsxXT10aGlzLmRhdGFbMV07XG4gICAgICAgIG0uZGF0YVsyXT10aGlzLmRhdGFbMl07XG4gICAgICAgIG0uZGF0YVszXT10aGlzLmRhdGFbM107XG4gICAgICAgIG0uZGF0YVs0XT10aGlzLmRhdGFbNF07XG4gICAgICAgIG0uZGF0YVs1XT10aGlzLmRhdGFbNV07XG4gICAgICAgIG0uZGF0YVs2XT10aGlzLmRhdGFbNl07XG4gICAgICAgIG0uZGF0YVs3XT10aGlzLmRhdGFbN107XG4gICAgICAgIG0uZGF0YVs4XT10aGlzLmRhdGFbOF07XG4gICAgICAgIG0uZGF0YVs5XT10aGlzLmRhdGFbOV07XG4gICAgICAgIG0uZGF0YVsxMF09dGhpcy5kYXRhWzEwXTtcbiAgICAgICAgbS5kYXRhWzExXT10aGlzLmRhdGFbMTFdO1xuICAgICAgICBtLmRhdGFbMTJdPXRoaXMuZGF0YVsxMl07XG4gICAgICAgIG0uZGF0YVsxM109dGhpcy5kYXRhWzEzXTtcbiAgICAgICAgbS5kYXRhWzE0XT10aGlzLmRhdGFbMTRdO1xuICAgICAgICBtLmRhdGFbMTVdPXRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cblxuXG4gICAgbXVsdGlwbHkodHVwbGU6IFR1cGxlKTogVHVwbGVcbiAgICBtdWx0aXBseShtYXRyaXg6IE1hdHJpeDR4NCx0YXJnZXQ/Ok1hdHJpeDR4NCk6IE1hdHJpeDR4NFxuICAgIG11bHRpcGx5KGE6YW55LGI/OmFueSk6YW55XG4gICAge1xuICAgICAgaWYgKGEgaW5zdGFuY2VvZiBNYXRyaXg0eDQpXG4gICAgICB7XG4gICAgICAgIHZhciB0YXJnZXQgPSAgYiA/PyAgbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBpZiAobWF0cml4PT09dGhpcykgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIHZhciBtYXRyaXg9IGEgYXMgTWF0cml4NHg0O1xuICAgICAgICB2YXIgYTAwPXRoaXMuZGF0YVswXTtcbiAgICAgICAgdmFyIGEwMT10aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDI9dGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzPXRoaXMuZGF0YVszXTtcbiAgICAgICAgdmFyIGExMD10aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTE9dGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyPXRoaXMuZGF0YVs2XTtcbiAgICAgICAgdmFyIGExMz10aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjA9dGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxPXRoaXMuZGF0YVs5XTtcbiAgICAgICAgdmFyIGEyMj10aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzPXRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzA9dGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdmFyIGEzMT10aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyPXRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzM9dGhpcy5kYXRhWzE1XTtcblxuICAgICAgICB0YXJnZXQuZGF0YVswXT1tYXRyaXguZGF0YVswXSogYTAwK21hdHJpeC5kYXRhWzRdKiBhMDErbWF0cml4LmRhdGFbOF0qIGEwMittYXRyaXguZGF0YVsxMl0qIGEwMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV09bWF0cml4LmRhdGFbMV0qIGEwMCttYXRyaXguZGF0YVs1XSogYTAxK21hdHJpeC5kYXRhWzldKiBhMDIrbWF0cml4LmRhdGFbMTNdKiBhMDM7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdPW1hdHJpeC5kYXRhWzJdKiBhMDArbWF0cml4LmRhdGFbNl0qIGEwMSttYXRyaXguZGF0YVsxMF0qIGEwMittYXRyaXguZGF0YVsxNF0qIGEwMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbM109bWF0cml4LmRhdGFbM10qIGEwMCttYXRyaXguZGF0YVs3XSogYTAxK21hdHJpeC5kYXRhWzExXSogYTAyK21hdHJpeC5kYXRhWzE1XSogYTAzO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XT1tYXRyaXguZGF0YVswXSogYTEwK21hdHJpeC5kYXRhWzRdKiBhMTErbWF0cml4LmRhdGFbOF0qIGExMittYXRyaXguZGF0YVsxMl0qIGExMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV09bWF0cml4LmRhdGFbMV0qIGExMCttYXRyaXguZGF0YVs1XSogYTExK21hdHJpeC5kYXRhWzldKiBhMTIrbWF0cml4LmRhdGFbMTNdKiBhMTM7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdPW1hdHJpeC5kYXRhWzJdKiBhMTArbWF0cml4LmRhdGFbNl0qIGExMSttYXRyaXguZGF0YVsxMF0qIGExMittYXRyaXguZGF0YVsxNF0qIGExMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbN109bWF0cml4LmRhdGFbM10qIGExMCttYXRyaXguZGF0YVs3XSogYTExK21hdHJpeC5kYXRhWzExXSogYTEyK21hdHJpeC5kYXRhWzE1XSogYTEzO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XT1tYXRyaXguZGF0YVswXSogYTIwK21hdHJpeC5kYXRhWzRdKiBhMjErbWF0cml4LmRhdGFbOF0qIGEyMittYXRyaXguZGF0YVsxMl0qIGEyMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV09bWF0cml4LmRhdGFbMV0qIGEyMCttYXRyaXguZGF0YVs1XSogYTIxK21hdHJpeC5kYXRhWzldKiBhMjIrbWF0cml4LmRhdGFbMTNdKiBhMjM7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXT1tYXRyaXguZGF0YVsyXSogYTIwK21hdHJpeC5kYXRhWzZdKiBhMjErbWF0cml4LmRhdGFbMTBdKiBhMjIrbWF0cml4LmRhdGFbMTRdKiBhMjM7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXT1tYXRyaXguZGF0YVszXSogYTIwK21hdHJpeC5kYXRhWzddKiBhMjErbWF0cml4LmRhdGFbMTFdKiBhMjIrbWF0cml4LmRhdGFbMTVdKiBhMjM7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXT1tYXRyaXguZGF0YVswXSogYTMwK21hdHJpeC5kYXRhWzRdKiBhMzErbWF0cml4LmRhdGFbOF0qIGEzMittYXRyaXguZGF0YVsxMl0qIGEzMztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdPW1hdHJpeC5kYXRhWzFdKiBhMzArbWF0cml4LmRhdGFbNV0qIGEzMSttYXRyaXguZGF0YVs5XSogYTMyK21hdHJpeC5kYXRhWzEzXSogYTMzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF09bWF0cml4LmRhdGFbMl0qIGEzMCttYXRyaXguZGF0YVs2XSogYTMxK21hdHJpeC5kYXRhWzEwXSogYTMyK21hdHJpeC5kYXRhWzE0XSogYTMzO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV09bWF0cml4LmRhdGFbM10qIGEzMCttYXRyaXguZGF0YVs3XSogYTMxK21hdHJpeC5kYXRhWzExXSogYTMyK21hdHJpeC5kYXRhWzE1XSogYTMzO1xuICAgICAgICBcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfSBlbHNlIGlmIChhIGluc3RhbmNlb2YgVHVwbGUpXG4gICAgICB7XG4gICAgICAgIHZhciB0PSBhIGFzIFR1cGxlO1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKCBcbiAgICAgICAgIHRoaXMuZGF0YVswXSp0LnggKyB0aGlzLmRhdGFbMV0qdC55K3RoaXMuZGF0YVsyXSp0LnordGhpcy5kYXRhWzNdKnQudyxcbiAgICAgICAgIHRoaXMuZGF0YVs0XSp0LnggKyB0aGlzLmRhdGFbNV0qdC55K3RoaXMuZGF0YVs2XSp0LnordGhpcy5kYXRhWzddKnQudywgXG4gICAgICAgICB0aGlzLmRhdGFbOF0qdC54ICsgdGhpcy5kYXRhWzldKnQueSt0aGlzLmRhdGFbMTBdKnQueit0aGlzLmRhdGFbMTFdKnQudyxcbiAgICAgICAgIHRoaXMuZGF0YVsxMl0qdC54ICsgdGhpcy5kYXRhWzEzXSp0LnkrdGhpcy5kYXRhWzE0XSp0LnordGhpcy5kYXRhWzE1XSp0LndcbiAgICAgICAgICAgKTtcbiAgICAgIH0gZWxzZVxuICAgICAge1xuICAgICAgICAgIC8vYSBpbnN0YW5jZW9mIE1hdHJpeCAobm90IHN1cHBvcnRlZClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIE1hdHJpeDJ4MiBleHRlbmRzIE1hdHJpeFxueyAgIFxuXG4gICAgY29uc3RydWN0b3IobWF0cml4PzogQXJyYXk8QXJyYXk8bnVtYmVyPj4pIFxuICAgIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFxuICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGghPTIgfHwgbWF0cml4WzBdLmxlbmd0aCE9MiB8fCBtYXRyaXhbMV0ubGVuZ3RoIT0yIClcbiAgICAgICAgIHtcbiAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgIH1cbiAgICAgICAgICBzdXBlcihtYXRyaXgpOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdXBlcigyICwyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpOm51bWJlclxuICAgIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFbMF0qdGhpcy5kYXRhWzNdLXRoaXMuZGF0YVsxXSp0aGlzLmRhdGFbMl07XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWF0cml4M3gzIGV4dGVuZHMgTWF0cml4XG57ICAgXG5cbiAgICBjb25zdHJ1Y3RvcihtYXRyaXg/OiBBcnJheTxBcnJheTxudW1iZXI+PikgXG4gICAge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgXG4gICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCE9MyB8fCBtYXRyaXhbMF0ubGVuZ3RoIT0zIHx8IG1hdHJpeFsxXS5sZW5ndGghPTMgfHwgbWF0cml4WzJdLmxlbmd0aCE9MylcbiAgICAgICAgIHtcbiAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgIH1cbiAgICAgICAgICBzdXBlcihtYXRyaXgpOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdXBlcigzICwzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgXG4gICAgZGV0ZXJtaW5hbnQoKTpudW1iZXJcbiAgICB7XG4gICAgICAgIHZhciBhMTA9dGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTExPXRoaXMuZGF0YVs0XTtcbiAgICAgICAgdmFyIGExMj10aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMjA9dGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTIxPXRoaXMuZGF0YVs3XTtcbiAgICAgICAgdmFyIGEyMj10aGlzLmRhdGFbOF07XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YVswXSooYTExKmEyMi1hMTIqYTIxKSt0aGlzLmRhdGFbMV0qLShhMTAqYTIyLWExMiphMjApK3RoaXMuZGF0YVsyXSooYTEwKmEyMS1hMTEqYTIwKSk7XG4gICAgfVxuXG59IiwiaW1wb3J0IHtUdXBsZX0gZnJvbSBcIi4vdHVwbGVcIlxuaW1wb3J0IHtDb2xvcn0gZnJvbSBcIi4vY29sb3JcIlxuZXhwb3J0IGNsYXNzIFBvaW50TGlnaHRcbntcbiAgICBwdWJsaWMgcG9zaXRvbjpUdXBsZTtcbiAgICBwdWJsaWMgaW50ZW5zaXR5OkNvbG9yO1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uPzpUdXBsZSxpbnRlbnNpdHk/OkNvbG9yKVxuICAgIHtcbiAgICAgIHRoaXMucG9zaXRvbj1wb3NpdGlvbj8/IFR1cGxlLnBvaW50KDAsMCwwKTtcbiAgICAgIHRoaXMuaW50ZW5zaXR5PWludGVuc2l0eT8/IG5ldyBDb2xvcigxLDEsMSk7XG4gICAgfVxufSIsImltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwiLi90dXBsZVwiO1xuXG5leHBvcnQgY2xhc3MgUmF5XG57XG4gICAgb3JpZ2luOiBUdXBsZTtcbiAgICBkaXJlY3Rpb246VHVwbGU7XG4gICAgY29uc3RydWN0b3Iob3JpZ2luOlR1cGxlLGRpcmVjdGlvbjpUdXBsZSlcbiAgICB7XG4gICAgICB0aGlzLm9yaWdpbj1vcmlnaW47XG4gICAgICB0aGlzLmRpcmVjdGlvbj1kaXJlY3Rpb247XG4gICAgfVxuICAgIHBvc2l0aW9uKHQ6bnVtYmVyKTpUdXBsZVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLmFkZCh0aGlzLmRpcmVjdGlvbi5tdWx0aXBseSh0KSk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKG1hdHJpeDpNYXRyaXg0eDQpOlJheVxuICAgIHtcbiAgICAgdmFyIGRpcmVjdGlvbj0gbWF0cml4Lm11bHRpcGx5KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgdmFyIG9yaWdpbj0gbWF0cml4Lm11bHRpcGx5KHRoaXMub3JpZ2luKTtcbiAgICAgXG4gICAgIHZhciByYXk9bmV3IFJheShvcmlnaW4sZGlyZWN0aW9uKTtcbiAgICAgcmV0dXJuIHJheTtcbiAgICB9XG59IiwiLyoqXG4gKiBNZXJnZXMgMiBzb3J0ZWQgcmVnaW9ucyBpbiBhbiBhcnJheSBpbnRvIDEgc29ydGVkIHJlZ2lvbiAoaW4tcGxhY2Ugd2l0aG91dCBleHRyYSBtZW1vcnksIHN0YWJsZSkgXG4gKiBAcGFyYW0gaXRlbXMgYXJyYXkgdG8gbWVyZ2VcbiAqIEBwYXJhbSBsZWZ0IGxlZnQgYXJyYXkgYm91bmRhcnkgaW5jbHVzaXZlXG4gKiBAcGFyYW0gbWlkZGxlIGJvdW5kYXJ5IGJldHdlZW4gcmVnaW9ucyAobGVmdCByZWdpb24gZXhjbHVzaXZlLCByaWdodCByZWdpb24gaW5jbHVzaXZlKVxuICogQHBhcmFtIHJpZ2h0IHJpZ2h0IGFycmF5IGJvdW5kYXJ5IGV4Y2x1c2l2ZVxuICovXG4gZnVuY3Rpb24gbWVyZ2VJbnBsYWNlPFQ+KGl0ZW1zOiBUW10sIGNvbXBhcmVGbjogKGE6IFQsYjogVCApPT4gbnVtYmVyLGxlZnQ6bnVtYmVyLG1pZGRsZTpudW1iZXIsIHJpZ2h0Om51bWJlcikge1xuICAgIGlmIChyaWdodD09bWlkZGxlKSByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IGxlZnQ7IGkgPCBtaWRkbGU7aSsrKSB7XG4gICAgICAgICBcbiAgICAgICAgdmFyIG1pblJpZ2h0PWl0ZW1zW21pZGRsZV07XG4gICAgICAgIGlmKGNvbXBhcmVGbihtaW5SaWdodCwgaXRlbXNbaV0pIDwwKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdG1wPWl0ZW1zW2ldO1xuICAgICAgICAgICAgaXRlbXNbaV0gPW1pblJpZ2h0O1xuICAgICAgICAgICAgdmFyIG5leHRJdGVtOlQ7XG4gICAgICAgICAgICB2YXIgbmV4dD1taWRkbGUrMTtcbiAgICAgICAgICAgIHdoaWxlKG5leHQ8cmlnaHQmJiBjb21wYXJlRm4oKG5leHRJdGVtPWl0ZW1zW25leHRdKSx0bXApPDApXG4gICAgICAgICAgICB7ICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaXRlbXNbbmV4dC0xXT1uZXh0SXRlbTtcbiAgICAgICAgICAgICAgbmV4dCsrO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIGl0ZW1zW25leHQtMV09dG1wOyAgICAgICAgICAgICAgICBcbiAgICAgICAgfSAgICBcbiAgICB9XG59XG5cbi8qKlxuICogSW4tcGxhY2UgYm90dG9tIHVwIG1lcmdlIHNvcnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlU29ydElucGxhY2U8VD4oaXRlbXM6IFRbXSwgY29tcGFyZUZuOiAoYTogVCxiOiBUICk9PiBudW1iZXIsZnJvbT86bnVtYmVyLHRvPzpudW1iZXIpIHtcbiAgICBmcm9tPz89MDtcbiAgICB0bz8/PWl0ZW1zLmxlbmd0aDtcbiAgICB2YXIgbWF4U3RlcCA9ICh0by1mcm9tKSAqIDI7ICAgXG4gICAgZm9yICh2YXIgc3RlcCA9IDI7IHN0ZXAgPCBtYXhTdGVwO3N0ZXAqPTIpIHtcbiAgICAgICAgdmFyIG9sZFN0ZXA9c3RlcC8yO1xuICAgICAgICBmb3IgKHZhciB4ID0gZnJvbTsgeCA8IHRvOyB4ICs9IHN0ZXApIHtcbiAgICAgICAgXG4gICAgICAgICBtZXJnZUlucGxhY2UoaXRlbXMsY29tcGFyZUZuLHgsIHgrb2xkU3RlcCxNYXRoLm1pbih4K3N0ZXAsdG8pICk7XG4gICAgICAgIH0gICAgICAgXG4gICAgfVxuXG5cbn1cblxuIiwiaW1wb3J0IHsgUmF5IH0gZnJvbSBcIi4vcmF5XCJcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcIi4vdHVwbGVcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbiwgSW50ZXJzZWN0aW9ucyB9IGZyb20gXCIuL2ludGVyc2VjdGlvblwiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcIi4vbWF0cml4XCI7XG5pbXBvcnQgeyBNYXRlcmlhbCB9IGZyb20gXCIuL21hdGVyaWFsXCI7XG5pbXBvcnQgeyBJV29ybGRPYmplY3QgfSBmcm9tIFwiLi93b3JsZFwiO1xuZXhwb3J0IGNsYXNzIFNwaGVyZSBpbXBsZW1lbnRzIElXb3JsZE9iamVjdCB7XG5cbiAgaWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBpbnZlcnNlVHJhbnNmb3JtOiBNYXRyaXg0eDQ7XG4gIHByaXZhdGUgX3RyYW5zZm9ybTogTWF0cml4NHg0O1xuICAvKipcbiAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHRyYW5zZm9ybSgpOiBNYXRyaXg0eDQge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gIH1cbiAgcHVibGljIHNldCB0cmFuc2Zvcm0odmFsdWU6IE1hdHJpeDR4NCkge1xuICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybT12YWx1ZS5pbnZlcnNlKCk7XG4gIH1cblxuICBtYXRlcmlhbDogTWF0ZXJpYWw7XG4gIHByaXZhdGUgc3RhdGljIHRlbXBNYXRyaXgxID0gbmV3IE1hdHJpeDR4NCgpO1xuXG5cbiAgY29uc3RydWN0b3IoaWQ6IG51bWJlciwgdHJhbnNmb3JtPzogTWF0cml4NHg0LCBtYXRlcmlhbD86IE1hdGVyaWFsKSB7XG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtID8/IE1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWwgPz8gbmV3IE1hdGVyaWFsKCk7XG4gIH1cbiAgXG4gIGludGVyc2VjdChyYXk6IFJheSwgaW50ZXJzZWN0aW9ucz86IEludGVyc2VjdGlvbnMpOiBJbnRlcnNlY3Rpb25zIHtcbiAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7XG4gICAgaW50ZXJzZWN0aW9ucyA/Pz0gbmV3IEludGVyc2VjdGlvbnMoKTtcbiAgICB2YXIgc3BoZXJlMnJheSA9IHJheS5vcmlnaW4uc3Vic3RyYWN0KFR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICB2YXIgYSA9IHJheS5kaXJlY3Rpb24uZG90KHJheS5kaXJlY3Rpb24pO1xuICAgIHZhciBiID0gMiAqIHJheS5kaXJlY3Rpb24uZG90KHNwaGVyZTJyYXkpO1xuICAgIHZhciBjID0gc3BoZXJlMnJheS5kb3Qoc3BoZXJlMnJheSkgLSAxO1xuICAgIHZhciBkaXNjcmltaW5hbnQgPSBiICogYiAtIDQgKiBhICogYztcbiAgICBpZiAoZGlzY3JpbWluYW50IDwgMCkgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgdmFyIHNxcnREaXNjcmltaW5hbnQgPSBNYXRoLnNxcnQoZGlzY3JpbWluYW50KTtcbiAgICB2YXIgaTEgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgIGkxLnQgPSAoLWIgLSBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgaTEub2JqZWN0ID0gdGhpcztcbiAgICB2YXIgaTIgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgIGkyLnQgPSAoLWIgKyBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgaTIub2JqZWN0ID0gdGhpcztcblxuICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICB9XG5cbiAgbm9ybWFsQXQocDogVHVwbGUpOiBUdXBsZSB7ICAgXG4gICAgdmFyIG9iamVjdE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShwKTtcbiAgICBvYmplY3ROb3JtYWwudyA9IDA7XG4gICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShTcGhlcmUudGVtcE1hdHJpeDEpLm11bHRpcGx5KG9iamVjdE5vcm1hbCk7XG4gICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgcmV0dXJuIHdvcmxkTm9ybWFsLm5vcm1hbGl6ZSgpO1xuICB9XG59IiwiZXhwb3J0IGNsYXNzIFR1cGxlIHtcbiAgICBwdWJsaWMgeDogbnVtYmVyO1xuICAgIHB1YmxpYyB5OiBudW1iZXI7XG4gICAgcHVibGljIHo6IG51bWJlcjtcbiAgICBwdWJsaWMgdzogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgRVBTSUxPTjogbnVtYmVyID0gMC4wMDAwMTtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcigpXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKVxuICAgIGNvbnN0cnVjdG9yKHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHo/OiBudW1iZXIsIHc/OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICAgICAgdGhpcy53ID0gdztcbiAgICB9XG4gICAgcHVibGljIGlzUG9pbnQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMTtcbiAgICB9XG4gICAgcHVibGljIGlzVmVjdG9yKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDA7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZCh0dXBsZTogVHVwbGUpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICsgdHVwbGUueCwgdGhpcy55ICsgdHVwbGUueSwgdGhpcy56ICsgdHVwbGUueiwgdGhpcy53ICsgdHVwbGUudylcbiAgICB9XG4gICAgcHVibGljIG11bHRpcGx5KHNjYWxhcjogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhcilcbiAgICB9XG4gICAgcHVibGljIGRpdmlkZShzY2FsYXI6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIpXG4gICAgfVxuICAgIHB1YmxpYyBzdWJzdHJhY3QodHVwbGU6IFR1cGxlKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAtIHR1cGxlLngsIHRoaXMueSAtIHR1cGxlLnksIHRoaXMueiAtIHR1cGxlLnosIHRoaXMudyAtIHR1cGxlLncpXG4gICAgfVxuICAgIHB1YmxpYyBuZWdhdGUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncpXG4gICAgfVxuICAgIHB1YmxpYyBub3JtYWxpemUoKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5tYWduaXR1ZGUoKSk7XG4gICAgfVxuICAgIHB1YmxpYyBtYWduaXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG4gICAgcHVibGljIGRvdCh0dXBsZTogVHVwbGUpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54ICogdHVwbGUueCArIHRoaXMueSAqIHR1cGxlLnkgKyB0aGlzLnogKiB0dXBsZS56ICsgdGhpcy53ICogdHVwbGUudztcbiAgICB9XG4gICAgcHVibGljIGNyb3NzKHR1cGxlOiBUdXBsZSk6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIFR1cGxlLnZlY3Rvcih0aGlzLnkgKiB0dXBsZS56IC0gdGhpcy56ICogdHVwbGUueSxcbiAgICAgICAgICAgIHRoaXMueiAqIHR1cGxlLnggLSB0aGlzLnggKiB0dXBsZS56LFxuICAgICAgICAgICAgdGhpcy54ICogdHVwbGUueSAtIHRoaXMueSAqIHR1cGxlLnhcbiAgICAgICAgKTtcbiAgICB9XG4gICAgXG4gICAgcmVmbGVjdChub3JtYWw6VHVwbGUgKTpUdXBsZVxuICAgIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnN0cmFjdChub3JtYWwubXVsdGlwbHkoMip0aGlzLmRvdChub3JtYWwpKSk7XG4gICAgfVxuICAgIHB1YmxpYyBlcXVhbHModHVwbGU6IFR1cGxlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnggLSB0dXBsZS54KSA8IFR1cGxlLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueSAtIHR1cGxlLnkpIDwgVHVwbGUuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy56IC0gdHVwbGUueikgPCBUdXBsZS5FUFNJTE9OO1xuICAgIH1cbiAgICBzdGF0aWMgcG9pbnQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IFR1cGxlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAxKTtcbiAgICB9XG4gICAgc3RhdGljIHZlY3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVHVwbGUge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDApO1xuICAgIH1cbiAgICBjbG9uZSgpOiBUdXBsZSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcbiAgICB9XG59IiwiXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuL2NvbG9yXCI7XG5pbXBvcnQgeyBDb21wdXRhdGlvbnMgfSBmcm9tIFwiLi9jb21wdXRhdGlvbnNcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbnMgfSBmcm9tIFwiLi9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcIi4vbWF0ZXJpYWxcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCIuL21hdHJpeFwiO1xuaW1wb3J0IHsgUG9pbnRMaWdodCB9IGZyb20gXCIuL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFJheSB9IGZyb20gXCIuL3JheVwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcIi4vc3BoZXJlXCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCIuL3R1cGxlXCI7XG5cbmV4cG9ydCBjbGFzcyBXb3JsZFxue1xuXG4gICAgbGlnaHQ6UG9pbnRMaWdodDtcbiAgICBvYmplY3RzOklXb3JsZE9iamVjdFtdO1xuICAgIFxuICAgIHByaXZhdGUgc3RhdGljIHRlbXBJbnRlcnNlY3Rpb25zPSBuZXcgSW50ZXJzZWN0aW9ucygxMDApO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgXG4gICAgICAgIFxuICAgIH1cbiAgICBzaGFkZUhpdChjb21wczogQ29tcHV0YXRpb25zKTpDb2xvciB7XG4gICAgICByZXR1cm4gY29tcHMub2JqZWN0Lm1hdGVyaWFsLmxpZ2h0aW5nKHRoaXMubGlnaHQsY29tcHMucG9pbnQsY29tcHMuZXlldixjb21wcy5ub3JtYWx2KTtcbiAgICB9ICBcbiAgICBjb2xvckF0KHJheTpSYXkpXG4gICAge1xuICAgICAgV29ybGQudGVtcEludGVyc2VjdGlvbnMuY2xlYXIoKTtcbiAgICAgIHRoaXMuaW50ZXJzZWN0KHJheSxXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucyk7XG4gICAgICB2YXIgaT1Xb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgIGlmIChpPT1udWxsKSByZXR1cm4gQ29sb3IuQkxBQ0suY2xvbmUoKTtcbiAgICAgIHZhciBjb21wPUNvbXB1dGF0aW9ucy5wcmVwYXJlKGkscmF5KTtcbiAgICAgIHJldHVybiB0aGlzLnNoYWRlSGl0KGNvbXApO1xuICAgIH0gXG5cbiAgICBpbnRlcnNlY3QocmF5OlJheSwgaW50ZXJzZWN0aW9ucz86IEludGVyc2VjdGlvbnMgKTpJbnRlcnNlY3Rpb25zXG4gICAgeyAgICAgXG4gICAgICBpbnRlcnNlY3Rpb25zPz89bmV3IEludGVyc2VjdGlvbnMoKTsgICAgIFxuICAgICAgZm9yICh2YXIgbyBvZiB0aGlzLm9iamVjdHMpXG4gICAgICB7XG4gICAgICAgIG8uaW50ZXJzZWN0KHJheSxpbnRlcnNlY3Rpb25zKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElXb3JsZE9iamVjdFxue1xuICBtYXRlcmlhbDpNYXRlcmlhbDtcbiAgaW50ZXJzZWN0KHJheTpSYXksaW50ZXJzZWN0aW9ucz86IEludGVyc2VjdGlvbnMgKTpJbnRlcnNlY3Rpb25zO1xuICBub3JtYWxBdChwOlR1cGxlKTpUdXBsZTtcbiAgICBcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgQ2FudmFzIH0gZnJvbSBcInJheXRyYWNlci9jYW52YXNcIjtcbmltcG9ydCB7IENvbG9yIH0gZnJvbSBcInJheXRyYWNlci9jb2xvclwiO1xuaW1wb3J0IHsgSW50ZXJzZWN0aW9uLCBJbnRlcnNlY3Rpb25zIH0gZnJvbSBcInJheXRyYWNlci9pbnRlcnNlY3Rpb25cIjtcbmltcG9ydCB7IE1hdGVyaWFsIH0gZnJvbSBcInJheXRyYWNlci9tYXRlcmlhbFwiO1xuaW1wb3J0IHsgTWF0cml4NHg0IH0gZnJvbSBcInJheXRyYWNlci9tYXRyaXhcIjtcbmltcG9ydCB7IFBvaW50TGlnaHQgfSBmcm9tIFwicmF5dHJhY2VyL3BvaW50TGlnaHRcIjtcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSBcInJheXRyYWNlci93b3JsZFwiO1xuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSBcInJheXRyYWNlci9zcGhlcmVcIjtcbmltcG9ydCB7IFR1cGxlIH0gZnJvbSBcInJheXRyYWNlci90dXBsZVwiO1xuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSBcInJheXRyYWNlci9jYW1lcmFcIjtcblxuXG5cbnZhciB3b3JsZD0gbmV3IFdvcmxkKCk7XG52YXIgZmxvb3IgPSBuZXcgU3BoZXJlKDApO1xuZmxvb3IudHJhbnNmb3JtPU1hdHJpeDR4NC5zY2FsaW5nKDEwLDAuMDEsMTApO1xuZmxvb3IubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xuZmxvb3IubWF0ZXJpYWwuY29sb3I9bmV3IENvbG9yKDEsMC45LDAuOSk7XG5mbG9vci5tYXRlcmlhbC5zcGVjdWxhcj0wO1xudmFyIGxlZnRXYWxsPSBuZXcgU3BoZXJlKDEpO1xubGVmdFdhbGwudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsNSlcbiAgICAubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWSgtTWF0aC5QSS80KSlcbiAgICAubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWChNYXRoLlBJLzIpKVxuICAgIC5tdWx0aXBseShNYXRyaXg0eDQuc2NhbGluZygxMCwwLjAxLDEwKSk7IFxubGVmdFdhbGwubWF0ZXJpYWw9Zmxvb3IubWF0ZXJpYWw7XG5cbnZhciByaWdodFdhbGw9IG5ldyBTcGhlcmUoMik7XG5yaWdodFdhbGwudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsNSlcbi5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25ZKE1hdGguUEkvNCkpXG4ubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWChNYXRoLlBJLzIpKVxuLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDEwLDAuMDEsMTApKTtcbnJpZ2h0V2FsbC5tYXRlcmlhbD1mbG9vci5tYXRlcmlhbDtcblxudmFyIG1pZGRsZT1uZXcgU3BoZXJlKDMpO1xubWlkZGxlLnRyYW5zZm9ybT1NYXRyaXg0eDQudHJhbnNsYXRpb24oLTAuNSwxLDAuNSlcbm1pZGRsZS5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKCk7XG5taWRkbGUubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLjEsMSwwLjUpO1xubWlkZGxlLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xubWlkZGxlLm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcblxudmFyIHJpZ2h0PW5ldyBTcGhlcmUoNCk7XG5yaWdodC50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDEuNSwwLjUsLTAuNSkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMC41LDAuNSwwLjUpKTtcbnJpZ2h0Lm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoKTtcbnJpZ2h0Lm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC41LDEsMC4xKTtcbnJpZ2h0Lm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xucmlnaHQubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xuXG52YXIgbGVmdD1uZXcgU3BoZXJlKDUpO1xubGVmdC50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKC0xLjUsMC4zMywtMC43NSkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMC4zMywwLjMzLDAuMzMpKTtcbmxlZnQubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgpO1xubGVmdC5tYXRlcmlhbC5jb2xvcj0gbmV3IENvbG9yKDEsMC44LDAuMSk7XG5sZWZ0Lm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xubGVmdC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5cblxud29ybGQub2JqZWN0cz0gW2xlZnQscmlnaHQsbWlkZGxlLHJpZ2h0V2FsbCxsZWZ0V2FsbCxmbG9vcl07XG53b3JsZC5saWdodD0gbmV3IFBvaW50TGlnaHQoVHVwbGUucG9pbnQoLTEwLDEwLC0xMCksQ29sb3IuV0hJVEUuY2xvbmUoKSk7XG5cbnZhciBjYW1lcmE9IG5ldyBDYW1lcmEoMTAyNCwxMDI0LE1hdGguUEkvMyxcbiAgICBNYXRyaXg0eDQudmlld1RyYW5zZm9ybShUdXBsZS5wb2ludCgwLDEuNSwtNSksVHVwbGUucG9pbnQoMCwxLDApLFR1cGxlLnZlY3RvcigwLDEsMCkpXG4gICAgKTtcblxuXG52YXIgcmF5dHJhY2VyQ2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF5dHJhY2VyQ2FudmFzXCIpO1xucmF5dHJhY2VyQ2FudmFzLndpZHRoPWNhbWVyYS5oc2l6ZTtcbnJheXRyYWNlckNhbnZhcy5oZWlnaHQ9Y2FtZXJhLnZzaXplO1xudmFyIHJlbmRlckRhdGEgPSBjYW1lcmEucmVuZGVyKHdvcmxkKS50b1VpbnQ4Q2xhbXBlZEFycmF5KCk7XG52YXIgaW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShyZW5kZXJEYXRhLCBjYW1lcmEuaHNpemUsIGNhbWVyYS52c2l6ZSk7XG52YXIgY3R4ID0gcmF5dHJhY2VyQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbmN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuXG5cblxuXG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=