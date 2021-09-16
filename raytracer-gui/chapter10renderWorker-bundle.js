/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/render-worker.ts":
/*!******************************!*\
  !*** ./src/render-worker.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const serializing = __importStar(__webpack_require__(/*! raytracer/serializing */ "../raytracer/dist/serializing.js"));
onmessage = function (e) {
    var renderdata = e.data;
    var world = serializing.deSerializeWorld(renderdata.world);
    var camera = serializing.deSerializeCamera(renderdata.camera);
    var start = Date.now();
    var renderData = camera.renderPartial(world, renderdata.from, renderdata.to);
    console.log(renderdata.from.y + " done  " + (Date.now() - start));
    postMessage(renderData.buffer, [renderData.buffer]);
};


/***/ }),

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
    renderPartial(world, from = { x: 0, y: 0 }, to = { x: this.hsize, y: this.vsize }) {
        var top = from.y;
        var left = from.x;
        var height = to.y - top;
        var width = to.x - left;
        var image = new Uint8ClampedArray(width * height * 4);
        var pixelIndex = 0;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var ray = this.rayForPixel(left + x, top + y);
                var color = world.colorAt(ray);
                image[pixelIndex++] = color.red * 255;
                image[pixelIndex++] = color.green * 255;
                image[pixelIndex++] = color.blue * 255;
                image[pixelIndex++] = 255;
            }
        }
        return image;
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
    toObject() {
        return { hsize: this.hsize, vsize: this.vsize, fieldOfView: this.fieldOfView, transform: this.transform.toArray() };
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
    constructor(id = -1) {
        this.id = id;
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
        var lightv = light.position.substract(point).normalize();
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
    toArray() {
        return [
            [this.data[0], this.data[1], this.data[2], this.data[3]],
            [this.data[4], this.data[5], this.data[6], this.data[7]],
            [this.data[8], this.data[9], this.data[10], this.data[11]],
            [this.data[12], this.data[13], this.data[14], this.data[15]]
        ];
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
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, transform: this.transform.toArray() };
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
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, transform: this.transform.toArray() };
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
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, transform: this.transform.toArray() };
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
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, transform: this.transform.toArray() };
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
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, uvScale: this.uvScale, transform: this.transform.toArray() };
    }
}
exports.Checker3DPattern4Sphere = Checker3DPattern4Sphere;
class PerlinPattern extends Pattern {
    constructor(a, b, threshold = 0.5, seed = Math.random(), transform = matrix_1.Matrix4x4.IDENTITY_MATRIX.clone()) {
        super(transform);
        this.a = a;
        this.b = b;
        this.noise3d = fast_simplex_noise_1.makeNoise3D(() => this.seed);
        this.threshold = threshold;
        this.seed = seed;
    }
    patternAt(point) {
        return this.noise3d(point.x, point.y, point.z) > this.threshold ? this.a : this.b;
    }
    toObject() {
        return { type: this.constructor.name, a: this.a, b: this.b, threshold: this.threshold, seed: this.seed, transform: this.transform.toArray() };
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
        this.position = position !== null && position !== void 0 ? position : tuple_1.Tuple.point(0, 0, 0);
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

/***/ "../raytracer/dist/serializing.js":
/*!****************************************!*\
  !*** ../raytracer/dist/serializing.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.serializeWorld = exports.serializeArray = exports.serializeShape = exports.serializeMaterial = exports.serializePattern = exports.serializeCamera = exports.deSerializeCamera = exports.deserializeColor = exports.deserializeString = exports.deserializeNumber = exports.deserializeTuple = exports.deSerializeLight = exports.deSerializeArray = exports.deSerializeWorld = exports.deserializeMatrix4x4 = exports.deSerializePattern = exports.deSerializeMaterial = exports.deSerializeShapes = void 0;
const camera_1 = __webpack_require__(/*! ./camera */ "../raytracer/dist/camera.js");
const color_1 = __webpack_require__(/*! ./color */ "../raytracer/dist/color.js");
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const patterns_1 = __webpack_require__(/*! ./patterns */ "../raytracer/dist/patterns.js");
const plane_1 = __webpack_require__(/*! ./plane */ "../raytracer/dist/plane.js");
const pointLight_1 = __webpack_require__(/*! ./pointLight */ "../raytracer/dist/pointLight.js");
const sphere_1 = __webpack_require__(/*! ./sphere */ "../raytracer/dist/sphere.js");
const tuple_1 = __webpack_require__(/*! ./tuple */ "../raytracer/dist/tuple.js");
const world_1 = __webpack_require__(/*! ./world */ "../raytracer/dist/world.js");
const material_1 = __webpack_require__(/*! ./material */ "../raytracer/dist/material.js");
function deSerializeShapes(obj, materialsMap) {
    var type = deserializeString(obj.type);
    switch (type) {
        case plane_1.Plane.name:
            var p = new plane_1.Plane(deserializeNumber(obj.id), deserializeMatrix4x4(obj.transform), materialsMap.get(deserializeNumber(obj.material)));
            return p;
        case sphere_1.Sphere.name:
            var s = new sphere_1.Sphere(deserializeNumber(obj.id), deserializeMatrix4x4(obj.transform), materialsMap.get(deserializeNumber(obj.material)));
            return s;
    }
    throw new Error();
}
exports.deSerializeShapes = deSerializeShapes;
function deSerializeMaterial(obj) {
    if (obj == null)
        throw new Error();
    var m = new material_1.Material(deserializeNumber(obj.id));
    m.ambient = deserializeNumber(obj.ambient);
    m.color = deserializeColor(obj.color);
    m.diffuse = deserializeNumber(obj.diffuse);
    m.pattern = deSerializePattern(obj.pattern);
    m.shininess = deserializeNumber(obj.shininess);
    m.specular = deserializeNumber(obj.specular);
    return m;
}
exports.deSerializeMaterial = deSerializeMaterial;
function deSerializePattern(obj) {
    if (obj == null)
        throw new Error();
    var type = deserializeString(obj.type);
    switch (type) {
        case patterns_1.PerlinPattern.name:
            var p = new patterns_1.PerlinPattern(deserializeColor(obj.a), deserializeColor(obj.b), deserializeNumber(obj.threshold), deserializeNumber(obj.seed), deserializeMatrix4x4(obj.transform));
            return p;
        case patterns_1.Checker3DPattern4Sphere.name:
            var p2 = new patterns_1.Checker3DPattern4Sphere(deserializeColor(obj.a), deserializeColor(obj.b), deserializeMatrix4x4(obj.transform), deserializeNumber(obj.uvScale));
            return p2;
        case patterns_1.Checker3dPattern.name:
            var p3 = new patterns_1.Checker3dPattern(deserializeColor(obj.a), deserializeColor(obj.b), deserializeMatrix4x4(obj.transform));
            return p3;
        case patterns_1.RingPattern.name:
            var p4 = new patterns_1.RingPattern(deserializeColor(obj.a), deserializeColor(obj.b), deserializeMatrix4x4(obj.transform));
            return p4;
        case patterns_1.GradientPattern.name:
            var p5 = new patterns_1.GradientPattern(deserializeColor(obj.a), deserializeColor(obj.b), deserializeMatrix4x4(obj.transform));
            return p5;
        case patterns_1.StripePattern.name:
            var p6 = new patterns_1.StripePattern(deserializeColor(obj.a), deserializeColor(obj.b), deserializeMatrix4x4(obj.transform));
            return p6;
    }
    throw new Error();
}
exports.deSerializePattern = deSerializePattern;
function deserializeMatrix4x4(obj) {
    if (obj == null)
        throw new Error();
    var array = deSerializeArray(obj, (x) => deSerializeArray(x, deserializeNumber));
    var w = new matrix_1.Matrix4x4(array);
    return w;
}
exports.deserializeMatrix4x4 = deserializeMatrix4x4;
function deSerializeWorld(obj) {
    if (obj == null)
        throw new Error();
    var materials = deSerializeArray(obj.materials, deSerializeMaterial);
    var materialsMap = new Map(materials.map((m) => [m.id, m]));
    var w = new world_1.World();
    w.light = deSerializeLight(obj.light);
    w.objects = deSerializeArray(obj.objects, (s) => { return deSerializeShapes(s, materialsMap); });
    return w;
}
exports.deSerializeWorld = deSerializeWorld;
function deSerializeArray(obj, callbackfn) {
    if (obj == null || !Array.isArray(obj))
        throw new Error();
    return obj.map(callbackfn);
}
exports.deSerializeArray = deSerializeArray;
function deSerializeLight(obj) {
    if (obj == null)
        throw new Error();
    var pointLight = new pointLight_1.PointLight(deserializeTuple(obj.position), deserializeColor(obj.intensity));
    return pointLight;
}
exports.deSerializeLight = deSerializeLight;
function deserializeTuple(obj) {
    if (obj == null)
        throw new Error();
    var t = new tuple_1.Tuple();
    t.x = deserializeNumber(obj.x);
    t.y = deserializeNumber(obj.y);
    t.z = deserializeNumber(obj.z);
    t.w = deserializeNumber(obj.w);
    return t;
}
exports.deserializeTuple = deserializeTuple;
function deserializeNumber(obj) {
    if (obj == null || isNaN(obj))
        throw new Error();
    return obj;
}
exports.deserializeNumber = deserializeNumber;
function deserializeString(obj) {
    if (obj == null || !((typeof obj === 'string' || obj instanceof String)))
        throw new Error();
    return obj;
}
exports.deserializeString = deserializeString;
function deserializeColor(obj) {
    if (obj == null)
        throw new Error();
    var color = new color_1.Color();
    color.red = deserializeNumber(obj.red);
    color.green = deserializeNumber(obj.green);
    color.blue = deserializeNumber(obj.blue);
    return color;
}
exports.deserializeColor = deserializeColor;
function deSerializeCamera(obj) {
    if (obj == null)
        throw new Error();
    var c = new camera_1.Camera(deserializeNumber(obj.hsize), deserializeNumber(obj.vsize), deserializeNumber(obj.fieldOfView), deserializeMatrix4x4(obj.transform));
    return c;
}
exports.deSerializeCamera = deSerializeCamera;
function serializeCamera(camera) {
    return camera.toObject();
}
exports.serializeCamera = serializeCamera;
function serializePattern(pattern) {
    return pattern["toObject"]();
}
exports.serializePattern = serializePattern;
function serializeMaterial(material) {
    var m = Object.assign(Object.assign({}, material), { pattern: serializePattern(material.pattern) });
    return m;
}
exports.serializeMaterial = serializeMaterial;
function serializeShape(shape) {
    if (shape instanceof plane_1.Plane) {
        let o = { id: shape.id,
            type: shape.constructor.name,
            transform: shape.transform.toArray(),
            material: shape.material.id };
        return o;
    }
    else if (shape instanceof sphere_1.Sphere) {
        let o = { id: shape.id,
            type: shape.constructor.name,
            transform: shape.transform.toArray(),
            material: shape.material.id };
        return o;
    }
    throw new Error();
}
exports.serializeShape = serializeShape;
function serializeArray(arr, callbackfn) {
    return arr.map(callbackfn);
}
exports.serializeArray = serializeArray;
function serializeWorld(world) {
    var shared = new Map();
    var materials = world.objects.map((o) => serializeMaterial(o.material));
    var o = {
        light: world.light,
        materials: materials,
        objects: serializeArray(world.objects, serializeShape)
    };
    return o;
}
exports.serializeWorld = serializeWorld;
//# sourceMappingURL=serializing.js.map

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
        var v = this.light.position.substract(point);
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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/render-worker.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QW1CLEdBQUcsbUJBQW1CO0FBQy9ELFlBQVksbUJBQU8sQ0FBQyxvRUFBTTtBQUMxQiwrQ0FBOEMsRUFBRSxxQ0FBcUMsNkJBQTZCLEVBQUM7QUFDbkgsWUFBWSxtQkFBTyxDQUFDLG9FQUFNO0FBQzFCLCtDQUE4QyxFQUFFLHFDQUFxQyw2QkFBNkIsRUFBQztBQUNuSCxZQUFZLG1CQUFPLENBQUMsb0VBQU07QUFDMUIsK0NBQThDLEVBQUUscUNBQXFDLDZCQUE2QixFQUFDOzs7Ozs7O1VDUm5IO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4vc3JjL3JlbmRlci13b3JrZXIudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW1lcmEuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW52YXMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb2xsZWN0aW9uLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29sb3IuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb21wdXRhdGlvbnMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9pbnRlcnNlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9tYXRlcmlhbC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L21hdHJpeC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3BhdHRlcm5zLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcGxhbmUuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9wb2ludExpZ2h0LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcmF5LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc2VyaWFsaXppbmcuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9zb3J0LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc3BoZXJlLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvdHVwbGUuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC93b3JsZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8yZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8zZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi80ZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi9tb2QuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyBzZXJpYWxpemluZyBmcm9tIFwicmF5dHJhY2VyL3NlcmlhbGl6aW5nXCI7XG5pbXBvcnQgeyBSZW5kZXJEYXRhIH0gZnJvbSBcIi4vcmVuZGVyam9iXCI7XG5kZWNsYXJlIGZ1bmN0aW9uIHBvc3RNZXNzYWdlKG1lc3NhZ2U6YW55LHRyYW5zZmVyPzpUcmFuc2ZlcmFibGVbXSk6dm9pZDtcblxub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciByZW5kZXJkYXRhPSBlLmRhdGEgYXMgUmVuZGVyRGF0YTtcblxuICAgIHZhciB3b3JsZD1zZXJpYWxpemluZy5kZVNlcmlhbGl6ZVdvcmxkKHJlbmRlcmRhdGEud29ybGQpO1xuICAgIHZhciBjYW1lcmE9c2VyaWFsaXppbmcuZGVTZXJpYWxpemVDYW1lcmEocmVuZGVyZGF0YS5jYW1lcmEpO1xuICAgIHZhciBzdGFydD1EYXRlLm5vdygpO1xuICAgIHZhciByZW5kZXJEYXRhID0gY2FtZXJhLnJlbmRlclBhcnRpYWwod29ybGQsIHJlbmRlcmRhdGEuZnJvbSxyZW5kZXJkYXRhLnRvKTtcbiAgICBjb25zb2xlLmxvZyhyZW5kZXJkYXRhLmZyb20ueStcIiBkb25lICBcIisgKERhdGUubm93KCktc3RhcnQpKVxuICAgIHBvc3RNZXNzYWdlKHJlbmRlckRhdGEuYnVmZmVyLFtyZW5kZXJEYXRhLmJ1ZmZlcl0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DYW1lcmEgPSB2b2lkIDA7XG5jb25zdCBjYW52YXNfMSA9IHJlcXVpcmUoXCIuL2NhbnZhc1wiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgcmF5XzEgPSByZXF1aXJlKFwiLi9yYXlcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jbGFzcyBDYW1lcmEge1xuICAgIGNvbnN0cnVjdG9yKGhzaXplLCB2c2l6ZSwgZmllbGRPZlZpZXcsIHRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLmhzaXplID0gaHNpemU7XG4gICAgICAgIHRoaXMudnNpemUgPSB2c2l6ZTtcbiAgICAgICAgdGhpcy5maWVsZE9mVmlldyA9IGZpZWxkT2ZWaWV3O1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgZ2V0IGhhbGZXaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbGZXaWR0aDtcbiAgICB9XG4gICAgZ2V0IGhhbGZoZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gICAgfVxuICAgIGdldCBwaXhlbFNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9waXhlbFNpemU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogcmVjYWxjdWxhdGUgZGVyaXZlZCB2YWx1ZXNcbiAgICAgKi9cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHZhciBoYWxmVmlldyA9IE1hdGgudGFuKHRoaXMuZmllbGRPZlZpZXcgLyAyKTtcbiAgICAgICAgdmFyIGFzcGVjdCA9IHRoaXMuaHNpemUgLyB0aGlzLnZzaXplO1xuICAgICAgICBpZiAoYXNwZWN0ID49IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbGZXaWR0aCA9IGhhbGZWaWV3O1xuICAgICAgICAgICAgdGhpcy5faGFsZkhlaWdodCA9IGhhbGZWaWV3IC8gYXNwZWN0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faGFsZldpZHRoID0gaGFsZlZpZXcgKiBhc3BlY3Q7XG4gICAgICAgICAgICB0aGlzLl9oYWxmSGVpZ2h0ID0gaGFsZlZpZXc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGl4ZWxTaXplID0gKHRoaXMuX2hhbGZXaWR0aCAqIDIpIC8gdGhpcy5oc2l6ZTtcbiAgICB9XG4gICAgcmF5Rm9yUGl4ZWwoeCwgeSkge1xuICAgICAgICB2YXIgeE9mZnNldCA9ICh4ICsgMC41KSAqIHRoaXMuX3BpeGVsU2l6ZTtcbiAgICAgICAgdmFyIHlPZmZzZXQgPSAoeSArIDAuNSkgKiB0aGlzLl9waXhlbFNpemU7XG4gICAgICAgIHZhciB3b3JsZFggPSB0aGlzLl9oYWxmV2lkdGggLSB4T2Zmc2V0O1xuICAgICAgICB2YXIgd29ybGRZID0gdGhpcy5faGFsZkhlaWdodCAtIHlPZmZzZXQ7XG4gICAgICAgIHZhciBwaXhlbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh0dXBsZV8xLlR1cGxlLnBvaW50KHdvcmxkWCwgd29ybGRZLCAtMSkpO1xuICAgICAgICB2YXIgb3JpZ2luID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCkpO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gcGl4ZWwuc3Vic3RyYWN0KG9yaWdpbikubm9ybWFsaXplKCk7XG4gICAgICAgIHJldHVybiBuZXcgcmF5XzEuUmF5KG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICB9XG4gICAgcmVuZGVyUGFydGlhbCh3b3JsZCwgZnJvbSA9IHsgeDogMCwgeTogMCB9LCB0byA9IHsgeDogdGhpcy5oc2l6ZSwgeTogdGhpcy52c2l6ZSB9KSB7XG4gICAgICAgIHZhciB0b3AgPSBmcm9tLnk7XG4gICAgICAgIHZhciBsZWZ0ID0gZnJvbS54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gdG8ueSAtIHRvcDtcbiAgICAgICAgdmFyIHdpZHRoID0gdG8ueCAtIGxlZnQ7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgICAgICB2YXIgcGl4ZWxJbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciByYXkgPSB0aGlzLnJheUZvclBpeGVsKGxlZnQgKyB4LCB0b3AgKyB5KTtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSB3b3JsZC5jb2xvckF0KHJheSk7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLnJlZCAqIDI1NTtcbiAgICAgICAgICAgICAgICBpbWFnZVtwaXhlbEluZGV4KytdID0gY29sb3IuZ3JlZW4gKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLmJsdWUgKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IDI1NTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW1hZ2U7XG4gICAgfVxuICAgIHJlbmRlcih3b3JsZCkge1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgY2FudmFzXzEuQ2FudmFzKHRoaXMuaHNpemUsIHRoaXMudnNpemUpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMudnNpemU7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmhzaXplOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmF5ID0gdGhpcy5yYXlGb3JQaXhlbCh4LCB5KTtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSB3b3JsZC5jb2xvckF0KHJheSk7XG4gICAgICAgICAgICAgICAgaW1hZ2Uud3JpdGVQaXhlbCh4LCB5LCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgaHNpemU6IHRoaXMuaHNpemUsIHZzaXplOiB0aGlzLnZzaXplLCBmaWVsZE9mVmlldzogdGhpcy5maWVsZE9mVmlldywgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNhbWVyYSA9IENhbWVyYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbWVyYS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FudmFzID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgQ2FudmFzIHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFBpeGVsKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5IDwgMCB8fCB5ID49IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdmFyIHBpeGVsSW5kZXggPSBNYXRoLmZsb29yKHkpICogdGhpcy53aWR0aCAqIDMgKyBNYXRoLmZsb29yKHgpICogMztcbiAgICAgICAgcmV0dXJuIG5ldyBjb2xvcl8xLkNvbG9yKHRoaXMuZGF0YVtwaXhlbEluZGV4XSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAxXSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSk7XG4gICAgfVxuICAgIHdyaXRlUGl4ZWwoeCwgeSwgYykge1xuICAgICAgICBpZiAoeCA8IDAgfHwgeCA+PSB0aGlzLndpZHRoIHx8IHkgPCAwIHx8IHkgPj0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciBwaXhlbEluZGV4ID0gTWF0aC5mbG9vcih5KSAqIHRoaXMud2lkdGggKiAzICsgTWF0aC5mbG9vcih4KSAqIDM7XG4gICAgICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4XSA9IGMucmVkO1xuICAgICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleCArIDFdID0gYy5ncmVlbjtcbiAgICAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSA9IGMuYmx1ZTtcbiAgICB9XG4gICAgdG9QcG0oKSB7XG4gICAgICAgIHZhciBwcG0gPSBcIlAzXFxuXCI7XG4gICAgICAgIHBwbSArPSB0aGlzLndpZHRoICsgXCIgXCIgKyB0aGlzLmhlaWdodCArIFwiXFxuXCI7XG4gICAgICAgIHBwbSArPSBcIjI1NVwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcHBtICs9IChpICUgMTUgPT0gMCkgPyBcIlxcblwiIDogXCIgXCI7XG4gICAgICAgICAgICBwcG0gKz0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaV0gKiAyNTUpLCAyNTUpLCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2kgKyAxXSAqIDI1NSksIDI1NSksIDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICArIFwiIFwiICsgTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSArIDJdICogMjU1KSwgMjU1KSwgMCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBwcG0gKz0gXCJcXG5cIjtcbiAgICAgICAgcmV0dXJuIHBwbTtcbiAgICB9XG4gICAgdG9VaW50OENsYW1wZWRBcnJheSgpIHtcbiAgICAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiA0KTtcbiAgICAgICAgdmFyIGFyckluZGV4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGFyclthcnJJbmRleF0gPSB0aGlzLmRhdGFbaV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAxXSA9IHRoaXMuZGF0YVtpICsgMV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAyXSA9IHRoaXMuZGF0YVtpICsgMl0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAzXSA9IDI1NTtcbiAgICAgICAgICAgIGFyckluZGV4ICs9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG59XG5leHBvcnRzLkNhbnZhcyA9IENhbnZhcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbnZhcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2JqZWN0UG9vbCA9IHZvaWQgMDtcbi8qKlxuICogT2JqZWN0IHBvb2wgdGhhdCB3aWxsIG1pbmltaXplIGdhcmJhZ2UgY29sbGVjdGlvbiB1c2FnZVxuICovXG5jbGFzcyBPYmplY3RQb29sIHtcbiAgICBjb25zdHJ1Y3RvcihhcnJheUxlbmd0aCA9IDApIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IG5ldyBBcnJheShhcnJheUxlbmd0aCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSB0aGlzLmNyZWF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobmV3SXRlbSwgaSk7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbmRleE9mKGl0ZW0pIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLmluZGV4TWFwLmdldChpdGVtKTtcbiAgICAgICAgcmV0dXJuIChpID09PSB1bmRlZmluZWQgfHwgaSA+PSB0aGlzLl9sZW5ndGgpID8gLTEgOiBpO1xuICAgIH1cbiAgICByZW1vdmUoYSkge1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW5kZXhNYXAuZ2V0KGEpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sZW5ndGgtLTtcbiAgICAgICAgdmFyIHJlbW92ZUl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgdmFyIGxhc3RJdGVtID0gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdO1xuICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IGxhc3RJdGVtO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF0gPSByZW1vdmVJdGVtO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChyZW1vdmVJdGVtLCB0aGlzLl9sZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChsYXN0SXRlbSwgaW5kZXgpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiB1bnVzZWQgaXRlbSBvciBjcmVhdGVzIGEgbmV3IG9uZSwgaWYgbm8gdW51c2VkIGl0ZW0gYXZhaWxhYmxlXG4gICAgKi9cbiAgICBhZGQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PSB0aGlzLl9sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sIHRoaXMuX2xlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9sZW5ndGggPSB0aGlzLml0ZW1zLnB1c2gobmV3SXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGgrK107XG4gICAgfVxuICAgIGdldChpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cbn1cbmV4cG9ydHMuT2JqZWN0UG9vbCA9IE9iamVjdFBvb2w7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb2xsZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db2xvciA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29sb3Ige1xuICAgIGNvbnN0cnVjdG9yKHJlZCwgZ3JlZW4sIGJsdWUpIHtcbiAgICAgICAgdGhpcy5yZWQgPSByZWQ7XG4gICAgICAgIHRoaXMuZ3JlZW4gPSBncmVlbjtcbiAgICAgICAgdGhpcy5ibHVlID0gYmx1ZTtcbiAgICB9XG4gICAgYWRkKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKyBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKyBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICsgY29sb3IuYmx1ZSk7XG4gICAgfVxuICAgIG11bHRpcGx5KHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICogc2NhbGFyLCB0aGlzLmdyZWVuICogc2NhbGFyLCB0aGlzLmJsdWUgKiBzY2FsYXIpO1xuICAgIH1cbiAgICBkaXZpZGUoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLyBzY2FsYXIsIHRoaXMuZ3JlZW4gLyBzY2FsYXIsIHRoaXMuYmx1ZSAvIHNjYWxhcik7XG4gICAgfVxuICAgIHN1YnN0cmFjdChjb2xvcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkIC0gY29sb3IucmVkLCB0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4sIHRoaXMuYmx1ZSAtIGNvbG9yLmJsdWUpO1xuICAgIH1cbiAgICBoYWRhbWFyZFByb2R1Y3QoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAqIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAqIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgKiBjb2xvci5ibHVlKTtcbiAgICB9XG4gICAgZXF1YWxzKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnJlZCAtIGNvbG9yLnJlZCkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4pIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ibHVlIC0gY29sb3IuYmx1ZSkgPCBjb25zdGFudHNfMS5FUFNJTE9OO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCwgdGhpcy5ncmVlbiwgdGhpcy5ibHVlKTtcbiAgICB9XG59XG5leHBvcnRzLkNvbG9yID0gQ29sb3I7XG5Db2xvci5CTEFDSyA9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDAsIDAsIDApKTtcbkNvbG9yLldISVRFID0gT2JqZWN0LmZyZWV6ZShuZXcgQ29sb3IoMSwgMSwgMSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sb3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbXB1dGF0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29tcHV0YXRpb25zIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgc3RhdGljIHByZXBhcmUoaW50ZXJzZWN0aW9uLCByYXkpIHtcbiAgICAgICAgdmFyIGNvbXBzID0gbmV3IENvbXB1dGF0aW9ucygpO1xuICAgICAgICBjb21wcy50ID0gaW50ZXJzZWN0aW9uLnQ7XG4gICAgICAgIGNvbXBzLm9iamVjdCA9IGludGVyc2VjdGlvbi5vYmplY3Q7XG4gICAgICAgIGNvbXBzLnBvaW50ID0gcmF5LnBvc2l0aW9uKGNvbXBzLnQpO1xuICAgICAgICBjb21wcy5leWV2ID0gcmF5LmRpcmVjdGlvbi5uZWdhdGUoKTtcbiAgICAgICAgY29tcHMubm9ybWFsdiA9IGNvbXBzLm9iamVjdC5ub3JtYWxBdChjb21wcy5wb2ludCk7XG4gICAgICAgIGlmIChjb21wcy5ub3JtYWx2LmRvdChjb21wcy5leWV2KSA8IDApIHtcbiAgICAgICAgICAgIGNvbXBzLmluc2lkZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wcy5ub3JtYWx2ID0gY29tcHMubm9ybWFsdi5uZWdhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBzLmluc2lkZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBzLm92ZXJQb2ludCA9IGNvbXBzLnBvaW50LmFkZChjb21wcy5ub3JtYWx2Lm11bHRpcGx5KGNvbnN0YW50c18xLkVQU0lMT04pKTtcbiAgICAgICAgcmV0dXJuIGNvbXBzO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29tcHV0YXRpb25zID0gQ29tcHV0YXRpb25zO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcHV0YXRpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FUFNJTE9OID0gdm9pZCAwO1xuZXhwb3J0cy5FUFNJTE9OID0gMC4wMDAwMTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSW50ZXJzZWN0aW9ucyA9IGV4cG9ydHMuSW50ZXJzZWN0aW9uID0gdm9pZCAwO1xuY29uc3QgY29sbGVjdGlvbl8xID0gcmVxdWlyZShcIi4vY29sbGVjdGlvblwiKTtcbmNvbnN0IHNvcnRfMSA9IHJlcXVpcmUoXCIuL3NvcnRcIik7XG5jbGFzcyBJbnRlcnNlY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKHQsIG9iamVjdCkge1xuICAgICAgICB0aGlzLnQgPSB0O1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50ID09IGludGVyc2VjdGlvbi50ICYmIHRoaXMub2JqZWN0ID09PSBpbnRlcnNlY3Rpb24ub2JqZWN0O1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJzZWN0aW9uID0gSW50ZXJzZWN0aW9uO1xuY2xhc3MgSW50ZXJzZWN0aW9ucyBleHRlbmRzIGNvbGxlY3Rpb25fMS5PYmplY3RQb29sIHtcbiAgICBzdGF0aWMgc29ydEludGVyc2VjdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLnQgLSBiLnQ7XG4gICAgfVxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcnNlY3Rpb24oMCwgbnVsbCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBoaXQsIHJlZ2FyZGxlc3Mgb2Ygc29ydFxuICAgICovXG4gICAgaGl0KCkge1xuICAgICAgICB2YXIgaGl0ID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKChoaXQgPT0gbnVsbCB8fCBpdGVtLnQgPCBoaXQudCkgJiYgaXRlbS50ID4gMClcbiAgICAgICAgICAgICAgICBoaXQgPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaXQ7XG4gICAgfVxuICAgIHNvcnQoKSB7XG4gICAgICAgIHNvcnRfMS5tZXJnZVNvcnRJbnBsYWNlKHRoaXMuaXRlbXMsIEludGVyc2VjdGlvbnMuc29ydEludGVyc2VjdGlvbiwgMCwgdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGhpcy5pdGVtc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbnMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCAhPSBpbnRlcnNlY3Rpb25zLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1zW2ldLmVxdWFscyhpbnRlcnNlY3Rpb25zLml0ZW1zW2ldKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJzZWN0aW9ucyA9IEludGVyc2VjdGlvbnM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcnNlY3Rpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1hdGVyaWFsID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgTWF0ZXJpYWwge1xuICAgIGNvbnN0cnVjdG9yKGlkID0gLTEpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3JfMS5Db2xvci5XSElURS5jbG9uZSgpO1xuICAgICAgICB0aGlzLmFtYmllbnQgPSAwLjE7XG4gICAgICAgIHRoaXMuZGlmZnVzZSA9IDAuOTtcbiAgICAgICAgdGhpcy5zcGVjdWxhciA9IDAuOTtcbiAgICAgICAgdGhpcy5zaGluaW5lc3MgPSAyMDA7XG4gICAgICAgIHRoaXMucGF0dGVybiA9IG51bGw7XG4gICAgfVxuICAgIGxpZ2h0aW5nKGxpZ2h0LCBvYmplY3QsIHBvaW50LCBleWV2LCBub3JtYWx2LCBpblNoYWRvdyA9IGZhbHNlKSB7XG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMucGF0dGVybiAhPSBudWxsID8gdGhpcy5wYXR0ZXJuLnBhdHRlcm5BdFNoYXBlKG9iamVjdCwgcG9pbnQpIDogdGhpcy5jb2xvcjtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZUNvbG9yID0gY29sb3IuaGFkYW1hcmRQcm9kdWN0KGxpZ2h0LmludGVuc2l0eSk7XG4gICAgICAgIHZhciBhbWJpZW50ID0gZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5hbWJpZW50KTtcbiAgICAgICAgaWYgKGluU2hhZG93KVxuICAgICAgICAgICAgcmV0dXJuIGFtYmllbnQ7XG4gICAgICAgIHZhciBsaWdodHYgPSBsaWdodC5wb3NpdGlvbi5zdWJzdHJhY3QocG9pbnQpLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgbGlnaHREb3ROb3JtYWwgPSBsaWdodHYuZG90KG5vcm1hbHYpO1xuICAgICAgICB2YXIgZGlmZnVzZTtcbiAgICAgICAgdmFyIHNwZWN1bGFyO1xuICAgICAgICBpZiAobGlnaHREb3ROb3JtYWwgPCAwKSB7XG4gICAgICAgICAgICBkaWZmdXNlID0gY29sb3JfMS5Db2xvci5CTEFDSztcbiAgICAgICAgICAgIHNwZWN1bGFyID0gY29sb3JfMS5Db2xvci5CTEFDSztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRpZmZ1c2UgPSBlZmZlY3RpdmVDb2xvci5tdWx0aXBseSh0aGlzLmRpZmZ1c2UgKiBsaWdodERvdE5vcm1hbCk7XG4gICAgICAgICAgICB2YXIgcmVmbGVjdHYgPSBsaWdodHYubmVnYXRlKCkucmVmbGVjdChub3JtYWx2KTtcbiAgICAgICAgICAgIHZhciByZWZsZWN0RG90RXllID0gcmVmbGVjdHYuZG90KGV5ZXYpO1xuICAgICAgICAgICAgaWYgKHJlZmxlY3REb3RFeWUgPD0gMCkge1xuICAgICAgICAgICAgICAgIHNwZWN1bGFyID0gY29sb3JfMS5Db2xvci5CTEFDSztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBmYWN0b3IgPSBNYXRoLnBvdyhyZWZsZWN0RG90RXllLCB0aGlzLnNoaW5pbmVzcyk7XG4gICAgICAgICAgICAgICAgc3BlY3VsYXIgPSBsaWdodC5pbnRlbnNpdHkubXVsdGlwbHkodGhpcy5zcGVjdWxhciAqIGZhY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFtYmllbnQuYWRkKGRpZmZ1c2UpLmFkZChzcGVjdWxhcik7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRlcmlhbCA9IE1hdGVyaWFsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0ZXJpYWwuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1hdHJpeDN4MyA9IGV4cG9ydHMuTWF0cml4MngyID0gZXhwb3J0cy5NYXRyaXg0eDQgPSBleHBvcnRzLk1hdHJpeCA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY2xhc3MgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiKSB7XG4gICAgICAgIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhO1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggPT0gMCB8fCBtYXRyaXhbMF0ubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gbWF0cml4WzBdLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gbWF0cml4Lmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IG1hdHJpeFt5XTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByb3dbeF07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3RoaXMud2lkdGggKiB5ICsgeF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gYTtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gYjtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb2ZhY3Rvcihyb3csIGNvbHVtbikge1xuICAgICAgICByZXR1cm4gKChyb3cgKyBjb2x1bW4pICUgMiAqIDIgLSAxKSAqIC10aGlzLm1pbm9yKHJvdywgY29sdW1uKTtcbiAgICB9XG4gICAgbWlub3Iocm93LCBjb2x1bW4pIHtcbiAgICAgICAgdmFyIG0gPSB0aGlzLnN1Ym1hdHJpeChyb3csIGNvbHVtbik7XG4gICAgICAgIHJldHVybiBtLmRldGVybWluYW50KCk7XG4gICAgfVxuICAgIGlzSW52ZXJ0aWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGV0ZXJtaW5hbnQoKSAhPSAwO1xuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggPT0gMilcbiAgICAgICAgICAgIHJldHVybiBNYXRyaXgyeDIucHJvdG90eXBlLmRldGVybWluYW50LmNhbGwodGhpcyk7XG4gICAgICAgIHZhciBkZXQgPSAwO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgZGV0ICs9IHRoaXMuZGF0YVt4XSAqIHRoaXMuY29mYWN0b3IoMCwgeCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHZhciBzdHJpbmcgPSBcIlwiO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIHN0cmluZyArPSBcInxcIjtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgc3RyaW5nICs9IHRoaXMuZGF0YVt0aGlzLndpZHRoICogeSArIHhdLnRvRml4ZWQoMikgKyBcIlxcdHxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0cmluZyArPSBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuICAgIGdldChyb3csIGNvbHVtbikge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMClcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHJvdyArIGNvbHVtbl07XG4gICAgfVxuICAgIHNldChyb3csIGNvbHVtbiwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHJvdyA+PSB0aGlzLmhlaWdodCB8fCBjb2x1bW4gPj0gdGhpcy53aWR0aCB8fCByb3cgPCAwIHx8IGNvbHVtbiA8IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHJvdyArIGNvbHVtbl0gPSB2YWx1ZTtcbiAgICB9XG4gICAgbXVsdGlwbHkobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXguaGVpZ2h0ICE9IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeChtYXRyaXgud2lkdGgsIG1hdHJpeC5oZWlnaHQpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgbWF0cml4LmhlaWdodDsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSBtYXRyaXguZGF0YVt0aGlzLndpZHRoICogciArIHhdICogdGhpcy5kYXRhW3RoaXMud2lkdGggKiB5ICsgcl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0uZGF0YVt0aGlzLndpZHRoICogeSArIHhdID0gc3VtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICB0cmFuc3Bvc2UoKSB7XG4gICAgICAgIHZhciBtYXRyaXggPSBuZXcgTWF0cml4KHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBtYXRyaXguaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSB5OyB4IDwgbWF0cml4LndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLndpZHRoICogeSArIHg7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4VHJhbnNwb3NlZCA9IHRoaXMud2lkdGggKiB4ICsgeTtcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleF0gPSB0aGlzLmRhdGFbaW5kZXhUcmFuc3Bvc2VkXTtcbiAgICAgICAgICAgICAgICBtYXRyaXguZGF0YVtpbmRleFRyYW5zcG9zZWRdID0gdGhpcy5kYXRhW2luZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0cml4O1xuICAgIH1cbiAgICBzdWJtYXRyaXgocm93LCBjb2x1bW4pIHtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4KHRoaXMud2lkdGggLSAxLCB0aGlzLmhlaWdodCAtIDEpO1xuICAgICAgICB2YXIgeTIgPSAwO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGlmICh5ID09IHJvdykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHgyID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHggPT0gY29sdW1uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbbS53aWR0aCAqIHkyICsgeDJdID0gdGhpcy5kYXRhW3RoaXMud2lkdGggKiB5ICsgeF07XG4gICAgICAgICAgICAgICAgeDIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHkyKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIGVxdWFscyhtYXRyaXgpIHtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT0gbWF0cml4LndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IG1hdHJpeC5oZWlnaHQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBNYXRoLmFicyh0aGlzLmRhdGFbaV0gLSBtYXRyaXguZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPj0gY29uc3RhbnRzXzEuRVBTSUxPTilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4ID0gTWF0cml4O1xuY2xhc3MgTWF0cml4NHg0IGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSA0IHx8IG1hdHJpeFswXS5sZW5ndGggIT0gNCB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDQgfHwgbWF0cml4WzJdLmxlbmd0aCAhPSA0IHx8IG1hdHJpeFszXS5sZW5ndGggIT0gNCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDQsIDQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyB2aWV3VHJhbnNmb3JtKGZyb20sIHRvLCB1cCwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBmb3J3YXJkID0gdG8uc3Vic3RyYWN0KGZyb20pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgdXBuID0gdXAubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciBsZWZ0ID0gZm9yd2FyZC5jcm9zcyh1cG4pO1xuICAgICAgICB2YXIgdHJ1ZVVwID0gbGVmdC5jcm9zcyhmb3J3YXJkKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBsZWZ0Lng7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gbGVmdC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IGxlZnQuejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSB0cnVlVXAueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSB0cnVlVXAueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0cnVlVXAuejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAtZm9yd2FyZC54O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IC1mb3J3YXJkLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IC1mb3J3YXJkLno7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIE1hdHJpeDR4NC50cmFuc2xhdGlvbigtZnJvbS54LCAtZnJvbS55LCAtZnJvbS56LCBNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCk7XG4gICAgICAgIHRhcmdldC5tdWx0aXBseShNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCwgdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHRyYW5zbGF0aW9uKHgsIHksIHosIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB4O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvblgocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IC1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvblkocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IC1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvbloocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSBzaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyBzY2FsaW5nKHgsIHksIHosIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHg7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0geTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyBzaGVhcmluZyh4eSwgeHosIHl4LCB5eiwgengsIHp5LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHl4O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IHp4O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IHh5O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0genk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0geHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0geXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICB0cmFuc3Bvc2UodGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHRoaXMuZGF0YVs1XTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdLCB0aGlzLmRhdGFbM11dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVs0XSwgdGhpcy5kYXRhWzVdLCB0aGlzLmRhdGFbNl0sIHRoaXMuZGF0YVs3XV0sXG4gICAgICAgICAgICBbdGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0sIHRoaXMuZGF0YVsxMV1dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVsxMl0sIHRoaXMuZGF0YVsxM10sIHRoaXMuZGF0YVsxNF0sIHRoaXMuZGF0YVsxNV1dXG4gICAgICAgIF07XG4gICAgfVxuICAgIGludmVyc2UodGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBhMDAgPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDMgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMCA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMyA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHZhciBkZXRlcm1pbmFudCA9IChhMDAgKiAoYTExICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTMgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSkgK1xuICAgICAgICAgICAgYTAxICogLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSArXG4gICAgICAgICAgICBhMDIgKiAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgK1xuICAgICAgICAgICAgYTAzICogLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSArIGExMSAqIC0oYTIwICogYTMyIC0gYTIyICogYTMwKSArIGExMiAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSk7XG4gICAgICAgIGlmIChkZXRlcm1pbmFudCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gLShhMDEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGEwMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGEwMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEwMiAqIC0oYTExICogYTMzIC0gYTEzICogYTMxKSArIGEwMyAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IC0oYTAxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgKyBhMDIgKiAtKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgKyBhMDMgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gKGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTAyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTAzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEwMiAqIC0oYTEwICogYTMzIC0gYTEzICogYTMwKSArIGEwMyAqIChhMTAgKiBhMzIgLSBhMTIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IChhMDAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSArIGEwMiAqIC0oYTEwICogYTIzIC0gYTEzICogYTIwKSArIGEwMyAqIChhMTAgKiBhMjIgLSBhMTIgKiBhMjApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMSAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IC0oYTAwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMDEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMDMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTAxICogLShhMTAgKiBhMzMgLSBhMTMgKiBhMzApICsgYTAzICogKGExMCAqIGEzMSAtIGExMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgKyBhMDEgKiAtKGExMCAqIGEyMyAtIGExMyAqIGEyMCkgKyBhMDMgKiAoYTEwICogYTIxIC0gYTExICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSArIGExMSAqIC0oYTIwICogYTMyIC0gYTIyICogYTMwKSArIGExMiAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMDEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMDIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSArIGEwMSAqIC0oYTEwICogYTMyIC0gYTEyICogYTMwKSArIGEwMiAqIChhMTAgKiBhMzEgLSBhMTEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAoYTAwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgKyBhMDEgKiAtKGExMCAqIGEyMiAtIGExMiAqIGEyMCkgKyBhMDIgKiAoYTEwICogYTIxIC0gYTExICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHZhciBhMDAgPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDMgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMCA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMyA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiAoYTAwICogKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpICtcbiAgICAgICAgICAgIGEwMSAqIC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMyIC0gYTIyICogYTMwKSkgK1xuICAgICAgICAgICAgYTAyICogKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMyAqIC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkpO1xuICAgIH1cbiAgICBhc3NpZ24obWF0cml4KSB7XG4gICAgICAgIHRoaXMuZGF0YVswXSA9IG1hdHJpeC5kYXRhWzBdO1xuICAgICAgICB0aGlzLmRhdGFbMV0gPSBtYXRyaXguZGF0YVsxXTtcbiAgICAgICAgdGhpcy5kYXRhWzJdID0gbWF0cml4LmRhdGFbMl07XG4gICAgICAgIHRoaXMuZGF0YVszXSA9IG1hdHJpeC5kYXRhWzNdO1xuICAgICAgICB0aGlzLmRhdGFbNF0gPSBtYXRyaXguZGF0YVs0XTtcbiAgICAgICAgdGhpcy5kYXRhWzVdID0gbWF0cml4LmRhdGFbNV07XG4gICAgICAgIHRoaXMuZGF0YVs2XSA9IG1hdHJpeC5kYXRhWzZdO1xuICAgICAgICB0aGlzLmRhdGFbN10gPSBtYXRyaXguZGF0YVs3XTtcbiAgICAgICAgdGhpcy5kYXRhWzhdID0gbWF0cml4LmRhdGFbOF07XG4gICAgICAgIHRoaXMuZGF0YVs5XSA9IG1hdHJpeC5kYXRhWzldO1xuICAgICAgICB0aGlzLmRhdGFbMTBdID0gbWF0cml4LmRhdGFbMTBdO1xuICAgICAgICB0aGlzLmRhdGFbMTFdID0gbWF0cml4LmRhdGFbMTFdO1xuICAgICAgICB0aGlzLmRhdGFbMTJdID0gbWF0cml4LmRhdGFbMTJdO1xuICAgICAgICB0aGlzLmRhdGFbMTNdID0gbWF0cml4LmRhdGFbMTNdO1xuICAgICAgICB0aGlzLmRhdGFbMTRdID0gbWF0cml4LmRhdGFbMTRdO1xuICAgICAgICB0aGlzLmRhdGFbMTVdID0gbWF0cml4LmRhdGFbMTVdO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIG0uZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgbS5kYXRhWzFdID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICBtLmRhdGFbMl0gPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIG0uZGF0YVszXSA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgbS5kYXRhWzRdID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICBtLmRhdGFbNV0gPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIG0uZGF0YVs2XSA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgbS5kYXRhWzddID0gdGhpcy5kYXRhWzddO1xuICAgICAgICBtLmRhdGFbOF0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIG0uZGF0YVs5XSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgbS5kYXRhWzEwXSA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgIG0uZGF0YVsxMV0gPSB0aGlzLmRhdGFbMTFdO1xuICAgICAgICBtLmRhdGFbMTJdID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgbS5kYXRhWzEzXSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgIG0uZGF0YVsxNF0gPSB0aGlzLmRhdGFbMTRdO1xuICAgICAgICBtLmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIG11bHRpcGx5KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBNYXRyaXg0eDQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBiICE9PSBudWxsICYmIGIgIT09IHZvaWQgMCA/IGIgOiBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgICAgICBpZiAobWF0cml4ID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGE7XG4gICAgICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICAgICAgdmFyIGEwMSA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICAgICAgdmFyIGExMCA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICAgICAgdmFyIGExMyA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICAgICAgdmFyIGEyMiA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICAgICAgdmFyIGEzMSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBtYXRyaXguZGF0YVswXSAqIGEwMCArIG1hdHJpeC5kYXRhWzRdICogYTAxICsgbWF0cml4LmRhdGFbOF0gKiBhMDIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IG1hdHJpeC5kYXRhWzFdICogYTAwICsgbWF0cml4LmRhdGFbNV0gKiBhMDEgKyBtYXRyaXguZGF0YVs5XSAqIGEwMiArIG1hdHJpeC5kYXRhWzEzXSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzJdID0gbWF0cml4LmRhdGFbMl0gKiBhMDAgKyBtYXRyaXguZGF0YVs2XSAqIGEwMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEwMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzNdID0gbWF0cml4LmRhdGFbM10gKiBhMDAgKyBtYXRyaXguZGF0YVs3XSAqIGEwMSArIG1hdHJpeC5kYXRhWzExXSAqIGEwMiArIG1hdHJpeC5kYXRhWzE1XSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzRdID0gbWF0cml4LmRhdGFbMF0gKiBhMTAgKyBtYXRyaXguZGF0YVs0XSAqIGExMSArIG1hdHJpeC5kYXRhWzhdICogYTEyICsgbWF0cml4LmRhdGFbMTJdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSBtYXRyaXguZGF0YVsxXSAqIGExMCArIG1hdHJpeC5kYXRhWzVdICogYTExICsgbWF0cml4LmRhdGFbOV0gKiBhMTIgKyBtYXRyaXguZGF0YVsxM10gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IG1hdHJpeC5kYXRhWzJdICogYTEwICsgbWF0cml4LmRhdGFbNl0gKiBhMTEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMTIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IG1hdHJpeC5kYXRhWzNdICogYTEwICsgbWF0cml4LmRhdGFbN10gKiBhMTEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMTIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IG1hdHJpeC5kYXRhWzBdICogYTIwICsgbWF0cml4LmRhdGFbNF0gKiBhMjEgKyBtYXRyaXguZGF0YVs4XSAqIGEyMiArIG1hdHJpeC5kYXRhWzEyXSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzldID0gbWF0cml4LmRhdGFbMV0gKiBhMjAgKyBtYXRyaXguZGF0YVs1XSAqIGEyMSArIG1hdHJpeC5kYXRhWzldICogYTIyICsgbWF0cml4LmRhdGFbMTNdICogYTIzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gbWF0cml4LmRhdGFbMl0gKiBhMjAgKyBtYXRyaXguZGF0YVs2XSAqIGEyMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEyMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzExXSA9IG1hdHJpeC5kYXRhWzNdICogYTIwICsgbWF0cml4LmRhdGFbN10gKiBhMjEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMjIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBtYXRyaXguZGF0YVswXSAqIGEzMCArIG1hdHJpeC5kYXRhWzRdICogYTMxICsgbWF0cml4LmRhdGFbOF0gKiBhMzIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMzM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBtYXRyaXguZGF0YVsxXSAqIGEzMCArIG1hdHJpeC5kYXRhWzVdICogYTMxICsgbWF0cml4LmRhdGFbOV0gKiBhMzIgKyBtYXRyaXguZGF0YVsxM10gKiBhMzM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSBtYXRyaXguZGF0YVsyXSAqIGEzMCArIG1hdHJpeC5kYXRhWzZdICogYTMxICsgbWF0cml4LmRhdGFbMTBdICogYTMyICsgbWF0cml4LmRhdGFbMTRdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gbWF0cml4LmRhdGFbM10gKiBhMzAgKyBtYXRyaXguZGF0YVs3XSAqIGEzMSArIG1hdHJpeC5kYXRhWzExXSAqIGEzMiArIG1hdHJpeC5kYXRhWzE1XSAqIGEzMztcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYSBpbnN0YW5jZW9mIHR1cGxlXzEuVHVwbGUpIHtcbiAgICAgICAgICAgIHZhciB0ID0gYTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdHVwbGVfMS5UdXBsZSh0aGlzLmRhdGFbMF0gKiB0LnggKyB0aGlzLmRhdGFbMV0gKiB0LnkgKyB0aGlzLmRhdGFbMl0gKiB0LnogKyB0aGlzLmRhdGFbM10gKiB0LncsIHRoaXMuZGF0YVs0XSAqIHQueCArIHRoaXMuZGF0YVs1XSAqIHQueSArIHRoaXMuZGF0YVs2XSAqIHQueiArIHRoaXMuZGF0YVs3XSAqIHQudywgdGhpcy5kYXRhWzhdICogdC54ICsgdGhpcy5kYXRhWzldICogdC55ICsgdGhpcy5kYXRhWzEwXSAqIHQueiArIHRoaXMuZGF0YVsxMV0gKiB0LncsIHRoaXMuZGF0YVsxMl0gKiB0LnggKyB0aGlzLmRhdGFbMTNdICogdC55ICsgdGhpcy5kYXRhWzE0XSAqIHQueiArIHRoaXMuZGF0YVsxNV0gKiB0LncpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy9hIGluc3RhbmNlb2YgTWF0cml4IChub3Qgc3VwcG9ydGVkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeDR4NCA9IE1hdHJpeDR4NDtcbk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVggPSBuZXcgTWF0cml4NHg0KFtcbiAgICBbMSwgMCwgMCwgMF0sXG4gICAgWzAsIDEsIDAsIDBdLFxuICAgIFswLCAwLCAxLCAwXSxcbiAgICBbMCwgMCwgMCwgMV1cbl0pO1xuTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0KCk7XG5jbGFzcyBNYXRyaXgyeDIgZXh0ZW5kcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKG1hdHJpeCkge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoICE9IDIgfHwgbWF0cml4WzBdLmxlbmd0aCAhPSAyIHx8IG1hdHJpeFsxXS5sZW5ndGggIT0gMikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDIsIDIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdICogdGhpcy5kYXRhWzNdIC0gdGhpcy5kYXRhWzFdICogdGhpcy5kYXRhWzJdO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4MngyID0gTWF0cml4MngyO1xuY2xhc3MgTWF0cml4M3gzIGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSAzIHx8IG1hdHJpeFswXS5sZW5ndGggIT0gMyB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDMgfHwgbWF0cml4WzJdLmxlbmd0aCAhPSAzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlcihtYXRyaXgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoMywgMyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHJldHVybiAodGhpcy5kYXRhWzBdICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgKyB0aGlzLmRhdGFbMV0gKiAtKGExMCAqIGEyMiAtIGExMiAqIGEyMCkgKyB0aGlzLmRhdGFbMl0gKiAoYTEwICogYTIxIC0gYTExICogYTIwKSk7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXgzeDMgPSBNYXRyaXgzeDM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRyaXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBlcmxpblBhdHRlcm4gPSBleHBvcnRzLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlID0gZXhwb3J0cy5DaGVja2VyM2RQYXR0ZXJuID0gZXhwb3J0cy5SaW5nUGF0dGVybiA9IGV4cG9ydHMuR3JhZGllbnRQYXR0ZXJuID0gZXhwb3J0cy5TdHJpcGVQYXR0ZXJuID0gZXhwb3J0cy5QYXR0ZXJuID0gdm9pZCAwO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBmYXN0X3NpbXBsZXhfbm9pc2VfMSA9IHJlcXVpcmUoXCJmYXN0LXNpbXBsZXgtbm9pc2VcIik7XG5jbGFzcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3Rvcih0cmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgcGF0dGVybkF0U2hhcGUob2JqZWN0LCB3b3JsZFBvaW50KSB7XG4gICAgICAgIHZhciBvYmplY3RQb2ludCA9IG9iamVjdC5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHdvcmxkUG9pbnQpO1xuICAgICAgICB2YXIgcGF0dGVyblBvaW50ID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KG9iamVjdFBvaW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybkF0KHBhdHRlcm5Qb2ludCk7XG4gICAgfVxufVxuZXhwb3J0cy5QYXR0ZXJuID0gUGF0dGVybjtcblBhdHRlcm4udGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG5jbGFzcyBTdHJpcGVQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuY29sb3JzID0gW2EsIGJdO1xuICAgIH1cbiAgICBnZXQgYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzWzBdO1xuICAgIH1cbiAgICBnZXQgYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzWzFdO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzW01hdGguZmxvb3IoTWF0aC5hYnMocG9pbnQueCkpICUgMl07XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IFN0cmlwZVBhdHRlcm47XG5jbGFzcyBHcmFkaWVudFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuYi5zdWJzdHJhY3QodGhpcy5hKTtcbiAgICAgICAgdmFyIGZyYWN0aW9uID0gcG9pbnQueCAtIE1hdGguZmxvb3IocG9pbnQueCk7XG4gICAgICAgIHJldHVybiB0aGlzLmEuYWRkKGRpc3RhbmNlLm11bHRpcGx5KGZyYWN0aW9uKSk7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuR3JhZGllbnRQYXR0ZXJuID0gR3JhZGllbnRQYXR0ZXJuO1xuY2xhc3MgUmluZ1BhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiAoTWF0aC5mbG9vcihNYXRoLnNxcnQocG9pbnQueCAqIHBvaW50LnggKyBwb2ludC56ICogcG9pbnQueikpICUgMiA9PSAwKSA/IHRoaXMuYSA6IHRoaXMuYjtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRoaXMuY29uc3RydWN0b3IubmFtZSwgYTogdGhpcy5hLCBiOiB0aGlzLmIsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5SaW5nUGF0dGVybiA9IFJpbmdQYXR0ZXJuO1xuY2xhc3MgQ2hlY2tlcjNkUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmEgPSBhO1xuICAgICAgICB0aGlzLmIgPSBiO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuICgoTWF0aC5mbG9vcihwb2ludC54KSArIE1hdGguZmxvb3IocG9pbnQueSkgKyBNYXRoLmZsb29yKHBvaW50LnopKSAlIDIgPT0gMCkgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IENoZWNrZXIzZFBhdHRlcm47XG5jbGFzcyBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSwgdXZTY2FsZSA9IDEpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy51dlNjYWxlID0gdXZTY2FsZTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciB0dSA9IE1hdGguYXRhbjIocG9pbnQueCwgcG9pbnQueikgLyBNYXRoLlBJIC8gMiAqIHRoaXMudXZTY2FsZTtcbiAgICAgICAgdmFyIHR2ID0gcG9pbnQueSAvIDIgKiB0aGlzLnV2U2NhbGU7XG4gICAgICAgIHJldHVybiAoKChNYXRoLmZsb29yKHR1KSArIE1hdGguZmxvb3IodHYpKSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdXZTY2FsZTogdGhpcy51dlNjYWxlLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUgPSBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZTtcbmNsYXNzIFBlcmxpblBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0aHJlc2hvbGQgPSAwLjUsIHNlZWQgPSBNYXRoLnJhbmRvbSgpLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy5ub2lzZTNkID0gZmFzdF9zaW1wbGV4X25vaXNlXzEubWFrZU5vaXNlM0QoKCkgPT4gdGhpcy5zZWVkKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB0aHJlc2hvbGQ7XG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2lzZTNkKHBvaW50LngsIHBvaW50LnksIHBvaW50LnopID4gdGhpcy50aHJlc2hvbGQgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0aHJlc2hvbGQ6IHRoaXMudGhyZXNob2xkLCBzZWVkOiB0aGlzLnNlZWQsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5QZXJsaW5QYXR0ZXJuID0gUGVybGluUGF0dGVybjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhdHRlcm5zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QbGFuZSA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIFBsYW5lIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdHJhbnNmb3JtLCBtYXRlcmlhbCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtICE9PSBudWxsICYmIHRyYW5zZm9ybSAhPT0gdm9pZCAwID8gdHJhbnNmb3JtIDogbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpO1xuICAgICAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWwgIT09IG51bGwgJiYgbWF0ZXJpYWwgIT09IHZvaWQgMCA/IG1hdGVyaWFsIDogbmV3IG1hdGVyaWFsXzEuTWF0ZXJpYWwoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAgICovXG4gICAgZ2V0IHRyYW5zZm9ybSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICB9XG4gICAgc2V0IHRyYW5zZm9ybSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtID0gdmFsdWUuaW52ZXJzZSgpO1xuICAgIH1cbiAgICBpbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMubG9jYWxJbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIG5vcm1hbEF0KHApIHtcbiAgICAgICAgdmFyIG9iamVjdE5vcm1hbCA9IHR1cGxlXzEuVHVwbGUudmVjdG9yKDAsIDEsIDApO1xuICAgICAgICB2YXIgd29ybGROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0udHJhbnNwb3NlKFBsYW5lLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgICAgICB3b3JsZE5vcm1hbC53ID0gMDtcbiAgICAgICAgcmV0dXJuIHdvcmxkTm9ybWFsLm5vcm1hbGl6ZSgpO1xuICAgIH1cbiAgICBsb2NhbEludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhyYXkuZGlyZWN0aW9uLnkpIDwgY29uc3RhbnRzXzEuRVBTSUxPTilcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgICAgICB2YXIgaSA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkub2JqZWN0ID0gdGhpcztcbiAgICAgICAgaS50ID0gLXJheS5vcmlnaW4ueSAvIHJheS5kaXJlY3Rpb24ueTtcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxufVxuZXhwb3J0cy5QbGFuZSA9IFBsYW5lO1xuUGxhbmUudGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wbGFuZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUG9pbnRMaWdodCA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIFBvaW50TGlnaHQge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCBpbnRlbnNpdHkpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uICE9PSBudWxsICYmIHBvc2l0aW9uICE9PSB2b2lkIDAgPyBwb3NpdGlvbiA6IHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gaW50ZW5zaXR5ICE9PSBudWxsICYmIGludGVuc2l0eSAhPT0gdm9pZCAwID8gaW50ZW5zaXR5IDogbmV3IGNvbG9yXzEuQ29sb3IoMSwgMSwgMSk7XG4gICAgfVxufVxuZXhwb3J0cy5Qb2ludExpZ2h0ID0gUG9pbnRMaWdodDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvaW50TGlnaHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJheSA9IHZvaWQgMDtcbmNsYXNzIFJheSB7XG4gICAgY29uc3RydWN0b3Iob3JpZ2luLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cbiAgICBwb3NpdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5hZGQodGhpcy5kaXJlY3Rpb24ubXVsdGlwbHkodCkpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0obWF0cml4KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBtYXRyaXgubXVsdGlwbHkodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICB2YXIgb3JpZ2luID0gbWF0cml4Lm11bHRpcGx5KHRoaXMub3JpZ2luKTtcbiAgICAgICAgdmFyIHJheSA9IG5ldyBSYXkob3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgICAgICByZXR1cm4gcmF5O1xuICAgIH1cbn1cbmV4cG9ydHMuUmF5ID0gUmF5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmF5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXJpYWxpemVXb3JsZCA9IGV4cG9ydHMuc2VyaWFsaXplQXJyYXkgPSBleHBvcnRzLnNlcmlhbGl6ZVNoYXBlID0gZXhwb3J0cy5zZXJpYWxpemVNYXRlcmlhbCA9IGV4cG9ydHMuc2VyaWFsaXplUGF0dGVybiA9IGV4cG9ydHMuc2VyaWFsaXplQ2FtZXJhID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUNhbWVyYSA9IGV4cG9ydHMuZGVzZXJpYWxpemVDb2xvciA9IGV4cG9ydHMuZGVzZXJpYWxpemVTdHJpbmcgPSBleHBvcnRzLmRlc2VyaWFsaXplTnVtYmVyID0gZXhwb3J0cy5kZXNlcmlhbGl6ZVR1cGxlID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUxpZ2h0ID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUFycmF5ID0gZXhwb3J0cy5kZVNlcmlhbGl6ZVdvcmxkID0gZXhwb3J0cy5kZXNlcmlhbGl6ZU1hdHJpeDR4NCA9IGV4cG9ydHMuZGVTZXJpYWxpemVQYXR0ZXJuID0gZXhwb3J0cy5kZVNlcmlhbGl6ZU1hdGVyaWFsID0gZXhwb3J0cy5kZVNlcmlhbGl6ZVNoYXBlcyA9IHZvaWQgMDtcbmNvbnN0IGNhbWVyYV8xID0gcmVxdWlyZShcIi4vY2FtZXJhXCIpO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBwYXR0ZXJuc18xID0gcmVxdWlyZShcIi4vcGF0dGVybnNcIik7XG5jb25zdCBwbGFuZV8xID0gcmVxdWlyZShcIi4vcGxhbmVcIik7XG5jb25zdCBwb2ludExpZ2h0XzEgPSByZXF1aXJlKFwiLi9wb2ludExpZ2h0XCIpO1xuY29uc3Qgc3BoZXJlXzEgPSByZXF1aXJlKFwiLi9zcGhlcmVcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCB3b3JsZF8xID0gcmVxdWlyZShcIi4vd29ybGRcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZVNoYXBlcyhvYmosIG1hdGVyaWFsc01hcCkge1xuICAgIHZhciB0eXBlID0gZGVzZXJpYWxpemVTdHJpbmcob2JqLnR5cGUpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIHBsYW5lXzEuUGxhbmUubmFtZTpcbiAgICAgICAgICAgIHZhciBwID0gbmV3IHBsYW5lXzEuUGxhbmUoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSksIG1hdGVyaWFsc01hcC5nZXQoZGVzZXJpYWxpemVOdW1iZXIob2JqLm1hdGVyaWFsKSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIGNhc2Ugc3BoZXJlXzEuU3BoZXJlLm5hbWU6XG4gICAgICAgICAgICB2YXIgcyA9IG5ldyBzcGhlcmVfMS5TcGhlcmUoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSksIG1hdGVyaWFsc01hcC5nZXQoZGVzZXJpYWxpemVOdW1iZXIob2JqLm1hdGVyaWFsKSkpO1xuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigpO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZVNoYXBlcyA9IGRlU2VyaWFsaXplU2hhcGVzO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVNYXRlcmlhbChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBtID0gbmV3IG1hdGVyaWFsXzEuTWF0ZXJpYWwoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSk7XG4gICAgbS5hbWJpZW50ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmFtYmllbnQpO1xuICAgIG0uY29sb3IgPSBkZXNlcmlhbGl6ZUNvbG9yKG9iai5jb2xvcik7XG4gICAgbS5kaWZmdXNlID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmRpZmZ1c2UpO1xuICAgIG0ucGF0dGVybiA9IGRlU2VyaWFsaXplUGF0dGVybihvYmoucGF0dGVybik7XG4gICAgbS5zaGluaW5lc3MgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmouc2hpbmluZXNzKTtcbiAgICBtLnNwZWN1bGFyID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnNwZWN1bGFyKTtcbiAgICByZXR1cm4gbTtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVNYXRlcmlhbCA9IGRlU2VyaWFsaXplTWF0ZXJpYWw7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZVBhdHRlcm4ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgdHlwZSA9IGRlc2VyaWFsaXplU3RyaW5nKG9iai50eXBlKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLlBlcmxpblBhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwID0gbmV3IHBhdHRlcm5zXzEuUGVybGluUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTnVtYmVyKG9iai50aHJlc2hvbGQpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmouc2VlZCksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUubmFtZTpcbiAgICAgICAgICAgIHZhciBwMiA9IG5ldyBwYXR0ZXJuc18xLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSksIGRlc2VyaWFsaXplTnVtYmVyKG9iai51dlNjYWxlKSk7XG4gICAgICAgICAgICByZXR1cm4gcDI7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5DaGVja2VyM2RQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDMgPSBuZXcgcGF0dGVybnNfMS5DaGVja2VyM2RQYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHAzO1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuUmluZ1BhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwNCA9IG5ldyBwYXR0ZXJuc18xLlJpbmdQYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA0O1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuR3JhZGllbnRQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDUgPSBuZXcgcGF0dGVybnNfMS5HcmFkaWVudFBhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDU7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5TdHJpcGVQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDYgPSBuZXcgcGF0dGVybnNfMS5TdHJpcGVQYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA2O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVQYXR0ZXJuID0gZGVTZXJpYWxpemVQYXR0ZXJuO1xuZnVuY3Rpb24gZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgYXJyYXkgPSBkZVNlcmlhbGl6ZUFycmF5KG9iaiwgKHgpID0+IGRlU2VyaWFsaXplQXJyYXkoeCwgZGVzZXJpYWxpemVOdW1iZXIpKTtcbiAgICB2YXIgdyA9IG5ldyBtYXRyaXhfMS5NYXRyaXg0eDQoYXJyYXkpO1xuICAgIHJldHVybiB3O1xufVxuZXhwb3J0cy5kZXNlcmlhbGl6ZU1hdHJpeDR4NCA9IGRlc2VyaWFsaXplTWF0cml4NHg0O1xuZnVuY3Rpb24gZGVTZXJpYWxpemVXb3JsZChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBtYXRlcmlhbHMgPSBkZVNlcmlhbGl6ZUFycmF5KG9iai5tYXRlcmlhbHMsIGRlU2VyaWFsaXplTWF0ZXJpYWwpO1xuICAgIHZhciBtYXRlcmlhbHNNYXAgPSBuZXcgTWFwKG1hdGVyaWFscy5tYXAoKG0pID0+IFttLmlkLCBtXSkpO1xuICAgIHZhciB3ID0gbmV3IHdvcmxkXzEuV29ybGQoKTtcbiAgICB3LmxpZ2h0ID0gZGVTZXJpYWxpemVMaWdodChvYmoubGlnaHQpO1xuICAgIHcub2JqZWN0cyA9IGRlU2VyaWFsaXplQXJyYXkob2JqLm9iamVjdHMsIChzKSA9PiB7IHJldHVybiBkZVNlcmlhbGl6ZVNoYXBlcyhzLCBtYXRlcmlhbHNNYXApOyB9KTtcbiAgICByZXR1cm4gdztcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVXb3JsZCA9IGRlU2VyaWFsaXplV29ybGQ7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUFycmF5KG9iaiwgY2FsbGJhY2tmbikge1xuICAgIGlmIChvYmogPT0gbnVsbCB8fCAhQXJyYXkuaXNBcnJheShvYmopKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICByZXR1cm4gb2JqLm1hcChjYWxsYmFja2ZuKTtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVBcnJheSA9IGRlU2VyaWFsaXplQXJyYXk7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUxpZ2h0KG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIHBvaW50TGlnaHQgPSBuZXcgcG9pbnRMaWdodF8xLlBvaW50TGlnaHQoZGVzZXJpYWxpemVUdXBsZShvYmoucG9zaXRpb24pLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5pbnRlbnNpdHkpKTtcbiAgICByZXR1cm4gcG9pbnRMaWdodDtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVMaWdodCA9IGRlU2VyaWFsaXplTGlnaHQ7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVR1cGxlKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIHQgPSBuZXcgdHVwbGVfMS5UdXBsZSgpO1xuICAgIHQueCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai54KTtcbiAgICB0LnkgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoueSk7XG4gICAgdC56ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnopO1xuICAgIHQudyA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai53KTtcbiAgICByZXR1cm4gdDtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVUdXBsZSA9IGRlc2VyaWFsaXplVHVwbGU7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZU51bWJlcihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgaXNOYU4ob2JqKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVOdW1iZXIgPSBkZXNlcmlhbGl6ZU51bWJlcjtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplU3RyaW5nKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCB8fCAhKCh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCBvYmogaW5zdGFuY2VvZiBTdHJpbmcpKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVTdHJpbmcgPSBkZXNlcmlhbGl6ZVN0cmluZztcbmZ1bmN0aW9uIGRlc2VyaWFsaXplQ29sb3Iob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgY29sb3IgPSBuZXcgY29sb3JfMS5Db2xvcigpO1xuICAgIGNvbG9yLnJlZCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5yZWQpO1xuICAgIGNvbG9yLmdyZWVuID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmdyZWVuKTtcbiAgICBjb2xvci5ibHVlID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmJsdWUpO1xuICAgIHJldHVybiBjb2xvcjtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVDb2xvciA9IGRlc2VyaWFsaXplQ29sb3I7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUNhbWVyYShvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBjID0gbmV3IGNhbWVyYV8xLkNhbWVyYShkZXNlcmlhbGl6ZU51bWJlcihvYmouaHNpemUpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudnNpemUpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmouZmllbGRPZlZpZXcpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgcmV0dXJuIGM7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplQ2FtZXJhID0gZGVTZXJpYWxpemVDYW1lcmE7XG5mdW5jdGlvbiBzZXJpYWxpemVDYW1lcmEoY2FtZXJhKSB7XG4gICAgcmV0dXJuIGNhbWVyYS50b09iamVjdCgpO1xufVxuZXhwb3J0cy5zZXJpYWxpemVDYW1lcmEgPSBzZXJpYWxpemVDYW1lcmE7XG5mdW5jdGlvbiBzZXJpYWxpemVQYXR0ZXJuKHBhdHRlcm4pIHtcbiAgICByZXR1cm4gcGF0dGVybltcInRvT2JqZWN0XCJdKCk7XG59XG5leHBvcnRzLnNlcmlhbGl6ZVBhdHRlcm4gPSBzZXJpYWxpemVQYXR0ZXJuO1xuZnVuY3Rpb24gc2VyaWFsaXplTWF0ZXJpYWwobWF0ZXJpYWwpIHtcbiAgICB2YXIgbSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbWF0ZXJpYWwpLCB7IHBhdHRlcm46IHNlcmlhbGl6ZVBhdHRlcm4obWF0ZXJpYWwucGF0dGVybikgfSk7XG4gICAgcmV0dXJuIG07XG59XG5leHBvcnRzLnNlcmlhbGl6ZU1hdGVyaWFsID0gc2VyaWFsaXplTWF0ZXJpYWw7XG5mdW5jdGlvbiBzZXJpYWxpemVTaGFwZShzaGFwZSkge1xuICAgIGlmIChzaGFwZSBpbnN0YW5jZW9mIHBsYW5lXzEuUGxhbmUpIHtcbiAgICAgICAgbGV0IG8gPSB7IGlkOiBzaGFwZS5pZCxcbiAgICAgICAgICAgIHR5cGU6IHNoYXBlLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNoYXBlLnRyYW5zZm9ybS50b0FycmF5KCksXG4gICAgICAgICAgICBtYXRlcmlhbDogc2hhcGUubWF0ZXJpYWwuaWQgfTtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgfVxuICAgIGVsc2UgaWYgKHNoYXBlIGluc3RhbmNlb2Ygc3BoZXJlXzEuU3BoZXJlKSB7XG4gICAgICAgIGxldCBvID0geyBpZDogc2hhcGUuaWQsXG4gICAgICAgICAgICB0eXBlOiBzaGFwZS5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBzaGFwZS50cmFuc2Zvcm0udG9BcnJheSgpLFxuICAgICAgICAgICAgbWF0ZXJpYWw6IHNoYXBlLm1hdGVyaWFsLmlkIH07XG4gICAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplU2hhcGUgPSBzZXJpYWxpemVTaGFwZTtcbmZ1bmN0aW9uIHNlcmlhbGl6ZUFycmF5KGFyciwgY2FsbGJhY2tmbikge1xuICAgIHJldHVybiBhcnIubWFwKGNhbGxiYWNrZm4pO1xufVxuZXhwb3J0cy5zZXJpYWxpemVBcnJheSA9IHNlcmlhbGl6ZUFycmF5O1xuZnVuY3Rpb24gc2VyaWFsaXplV29ybGQod29ybGQpIHtcbiAgICB2YXIgc2hhcmVkID0gbmV3IE1hcCgpO1xuICAgIHZhciBtYXRlcmlhbHMgPSB3b3JsZC5vYmplY3RzLm1hcCgobykgPT4gc2VyaWFsaXplTWF0ZXJpYWwoby5tYXRlcmlhbCkpO1xuICAgIHZhciBvID0ge1xuICAgICAgICBsaWdodDogd29ybGQubGlnaHQsXG4gICAgICAgIG1hdGVyaWFsczogbWF0ZXJpYWxzLFxuICAgICAgICBvYmplY3RzOiBzZXJpYWxpemVBcnJheSh3b3JsZC5vYmplY3RzLCBzZXJpYWxpemVTaGFwZSlcbiAgICB9O1xuICAgIHJldHVybiBvO1xufVxuZXhwb3J0cy5zZXJpYWxpemVXb3JsZCA9IHNlcmlhbGl6ZVdvcmxkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2VyaWFsaXppbmcuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1lcmdlU29ydElucGxhY2UgPSB2b2lkIDA7XG4vKipcbiAqIE1lcmdlcyAyIHNvcnRlZCByZWdpb25zIGluIGFuIGFycmF5IGludG8gMSBzb3J0ZWQgcmVnaW9uIChpbi1wbGFjZSB3aXRob3V0IGV4dHJhIG1lbW9yeSwgc3RhYmxlKVxuICogQHBhcmFtIGl0ZW1zIGFycmF5IHRvIG1lcmdlXG4gKiBAcGFyYW0gbGVmdCBsZWZ0IGFycmF5IGJvdW5kYXJ5IGluY2x1c2l2ZVxuICogQHBhcmFtIG1pZGRsZSBib3VuZGFyeSBiZXR3ZWVuIHJlZ2lvbnMgKGxlZnQgcmVnaW9uIGV4Y2x1c2l2ZSwgcmlnaHQgcmVnaW9uIGluY2x1c2l2ZSlcbiAqIEBwYXJhbSByaWdodCByaWdodCBhcnJheSBib3VuZGFyeSBleGNsdXNpdmVcbiAqL1xuZnVuY3Rpb24gbWVyZ2VJbnBsYWNlKGl0ZW1zLCBjb21wYXJlRm4sIGxlZnQsIG1pZGRsZSwgcmlnaHQpIHtcbiAgICBpZiAocmlnaHQgPT0gbWlkZGxlKVxuICAgICAgICByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IGxlZnQ7IGkgPCBtaWRkbGU7IGkrKykge1xuICAgICAgICB2YXIgbWluUmlnaHQgPSBpdGVtc1ttaWRkbGVdO1xuICAgICAgICBpZiAoY29tcGFyZUZuKG1pblJpZ2h0LCBpdGVtc1tpXSkgPCAwKSB7XG4gICAgICAgICAgICB2YXIgdG1wID0gaXRlbXNbaV07XG4gICAgICAgICAgICBpdGVtc1tpXSA9IG1pblJpZ2h0O1xuICAgICAgICAgICAgdmFyIG5leHRJdGVtO1xuICAgICAgICAgICAgdmFyIG5leHQgPSBtaWRkbGUgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPCByaWdodCAmJiBjb21wYXJlRm4oKG5leHRJdGVtID0gaXRlbXNbbmV4dF0pLCB0bXApIDwgMCkge1xuICAgICAgICAgICAgICAgIGl0ZW1zW25leHQgLSAxXSA9IG5leHRJdGVtO1xuICAgICAgICAgICAgICAgIG5leHQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1zW25leHQgLSAxXSA9IHRtcDtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogSW4tcGxhY2UgYm90dG9tIHVwIG1lcmdlIHNvcnRcbiAqL1xuZnVuY3Rpb24gbWVyZ2VTb3J0SW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCBmcm9tLCB0bykge1xuICAgIGZyb20gIT09IG51bGwgJiYgZnJvbSAhPT0gdm9pZCAwID8gZnJvbSA6IChmcm9tID0gMCk7XG4gICAgdG8gIT09IG51bGwgJiYgdG8gIT09IHZvaWQgMCA/IHRvIDogKHRvID0gaXRlbXMubGVuZ3RoKTtcbiAgICB2YXIgbWF4U3RlcCA9ICh0byAtIGZyb20pICogMjtcbiAgICBmb3IgKHZhciBzdGVwID0gMjsgc3RlcCA8IG1heFN0ZXA7IHN0ZXAgKj0gMikge1xuICAgICAgICB2YXIgb2xkU3RlcCA9IHN0ZXAgLyAyO1xuICAgICAgICBmb3IgKHZhciB4ID0gZnJvbTsgeCA8IHRvOyB4ICs9IHN0ZXApIHtcbiAgICAgICAgICAgIG1lcmdlSW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCB4LCB4ICsgb2xkU3RlcCwgTWF0aC5taW4oeCArIHN0ZXAsIHRvKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLm1lcmdlU29ydElucGxhY2UgPSBtZXJnZVNvcnRJbnBsYWNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c29ydC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU3BoZXJlID0gdm9pZCAwO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY29uc3QgaW50ZXJzZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IG1hdGVyaWFsXzEgPSByZXF1aXJlKFwiLi9tYXRlcmlhbFwiKTtcbmNsYXNzIFNwaGVyZSB7XG4gICAgY29uc3RydWN0b3IoaWQsIHRyYW5zZm9ybSwgbWF0ZXJpYWwpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsICE9PSBudWxsICYmIG1hdGVyaWFsICE9PSB2b2lkIDAgPyBtYXRlcmlhbCA6IG5ldyBtYXRlcmlhbF8xLk1hdGVyaWFsKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgcmF5ID0gcmF5LnRyYW5zZm9ybSh0aGlzLmludmVyc2VUcmFuc2Zvcm0pO1xuICAgICAgICB2YXIgc3BoZXJlMnJheSA9IHJheS5vcmlnaW4uc3Vic3RyYWN0KHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCkpO1xuICAgICAgICB2YXIgYSA9IHJheS5kaXJlY3Rpb24uZG90KHJheS5kaXJlY3Rpb24pO1xuICAgICAgICB2YXIgYiA9IDIgKiByYXkuZGlyZWN0aW9uLmRvdChzcGhlcmUycmF5KTtcbiAgICAgICAgdmFyIGMgPSBzcGhlcmUycmF5LmRvdChzcGhlcmUycmF5KSAtIDE7XG4gICAgICAgIHZhciBkaXNjcmltaW5hbnQgPSBiICogYiAtIDQgKiBhICogYztcbiAgICAgICAgaWYgKGRpc2NyaW1pbmFudCA8IDApXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICAgICAgdmFyIHNxcnREaXNjcmltaW5hbnQgPSBNYXRoLnNxcnQoZGlzY3JpbWluYW50KTtcbiAgICAgICAgdmFyIGkxID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICAgICAgaTEudCA9ICgtYiAtIHNxcnREaXNjcmltaW5hbnQpIC8gKDIgKiBhKTtcbiAgICAgICAgaTEub2JqZWN0ID0gdGhpcztcbiAgICAgICAgdmFyIGkyID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICAgICAgaTIudCA9ICgtYiArIHNxcnREaXNjcmltaW5hbnQpIC8gKDIgKiBhKTtcbiAgICAgICAgaTIub2JqZWN0ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIG5vcm1hbEF0KHApIHtcbiAgICAgICAgdmFyIG9iamVjdE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShwKTtcbiAgICAgICAgb2JqZWN0Tm9ybWFsLncgPSAwO1xuICAgICAgICB2YXIgd29ybGROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0udHJhbnNwb3NlKFNwaGVyZS50ZW1wTWF0cml4MSkubXVsdGlwbHkob2JqZWN0Tm9ybWFsKTtcbiAgICAgICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgICB9XG59XG5leHBvcnRzLlNwaGVyZSA9IFNwaGVyZTtcblNwaGVyZS50ZW1wTWF0cml4MSA9IG5ldyBtYXRyaXhfMS5NYXRyaXg0eDQoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNwaGVyZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVHVwbGUgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIFR1cGxlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB6LCB3KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgIHRoaXMudyA9IHc7XG4gICAgfVxuICAgIGlzUG9pbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMTtcbiAgICB9XG4gICAgaXNWZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMDtcbiAgICB9XG4gICAgYWRkKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICsgdHVwbGUueCwgdGhpcy55ICsgdHVwbGUueSwgdGhpcy56ICsgdHVwbGUueiwgdGhpcy53ICsgdHVwbGUudyk7XG4gICAgfVxuICAgIG11bHRpcGx5KHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhcik7XG4gICAgfVxuICAgIGRpdmlkZShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIpO1xuICAgIH1cbiAgICBzdWJzdHJhY3QodHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLSB0dXBsZS54LCB0aGlzLnkgLSB0dXBsZS55LCB0aGlzLnogLSB0dXBsZS56LCB0aGlzLncgLSB0dXBsZS53KTtcbiAgICB9XG4gICAgbmVnYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncpO1xuICAgIH1cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLm1hZ25pdHVkZSgpKTtcbiAgICB9XG4gICAgbWFnbml0dWRlKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudyk7XG4gICAgfVxuICAgIGRvdCh0dXBsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy54ICogdHVwbGUueCArIHRoaXMueSAqIHR1cGxlLnkgKyB0aGlzLnogKiB0dXBsZS56ICsgdGhpcy53ICogdHVwbGUudztcbiAgICB9XG4gICAgY3Jvc3ModHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIFR1cGxlLnZlY3Rvcih0aGlzLnkgKiB0dXBsZS56IC0gdGhpcy56ICogdHVwbGUueSwgdGhpcy56ICogdHVwbGUueCAtIHRoaXMueCAqIHR1cGxlLnosIHRoaXMueCAqIHR1cGxlLnkgLSB0aGlzLnkgKiB0dXBsZS54KTtcbiAgICB9XG4gICAgcmVmbGVjdChub3JtYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3Vic3RyYWN0KG5vcm1hbC5tdWx0aXBseSgyICogdGhpcy5kb3Qobm9ybWFsKSkpO1xuICAgIH1cbiAgICBlcXVhbHModHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMueCAtIHR1cGxlLngpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy55IC0gdHVwbGUueSkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLnogLSB0dXBsZS56KSA8IGNvbnN0YW50c18xLkVQU0lMT047XG4gICAgfVxuICAgIHN0YXRpYyBwb2ludCh4LCB5LCB6KSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoeCwgeSwgeiwgMSk7XG4gICAgfVxuICAgIHN0YXRpYyB2ZWN0b3IoeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDApO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLncpO1xuICAgIH1cbn1cbmV4cG9ydHMuVHVwbGUgPSBUdXBsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR1cGxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JsZCA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNvbnN0IGNvbXB1dGF0aW9uc18xID0gcmVxdWlyZShcIi4vY29tcHV0YXRpb25zXCIpO1xuY29uc3QgaW50ZXJzZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XG5jb25zdCByYXlfMSA9IHJlcXVpcmUoXCIuL3JheVwiKTtcbmNsYXNzIFdvcmxkIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgc2hhZGVIaXQoY29tcHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBzLm9iamVjdC5tYXRlcmlhbC5saWdodGluZyh0aGlzLmxpZ2h0LCBjb21wcy5vYmplY3QsIGNvbXBzLnBvaW50LCBjb21wcy5leWV2LCBjb21wcy5ub3JtYWx2LCB0aGlzLmlzU2hhZG93ZWQoY29tcHMub3ZlclBvaW50KSk7XG4gICAgfVxuICAgIGNvbG9yQXQocmF5KSB7XG4gICAgICAgIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0KHJheSwgV29ybGQudGVtcEludGVyc2VjdGlvbnMpO1xuICAgICAgICB2YXIgaSA9IFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICAgICBpZiAoaSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yXzEuQ29sb3IuQkxBQ0suY2xvbmUoKTtcbiAgICAgICAgdmFyIGNvbXAgPSBjb21wdXRhdGlvbnNfMS5Db21wdXRhdGlvbnMucHJlcGFyZShpLCByYXkpO1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkZUhpdChjb21wKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgZm9yICh2YXIgbyBvZiB0aGlzLm9iamVjdHMpIHtcbiAgICAgICAgICAgIG8uaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIGlzU2hhZG93ZWQocG9pbnQpIHtcbiAgICAgICAgdmFyIHYgPSB0aGlzLmxpZ2h0LnBvc2l0aW9uLnN1YnN0cmFjdChwb2ludCk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHYubWFnbml0dWRlKCk7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB2Lm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgciA9IG5ldyByYXlfMS5SYXkocG9pbnQsIGRpcmVjdGlvbik7XG4gICAgICAgIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0KHIsIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdmFyIGggPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgICAgcmV0dXJuIChoICE9IG51bGwgJiYgaC50IDwgZGlzdGFuY2UpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ybGQgPSBXb3JsZDtcbldvcmxkLnRlbXBJbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoMTAwKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmxkLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHBsYWNlZCBpbiB0aGUgcHVibGljIGRvbWFpbiBieSBpdHMgb3JpZ2luYWwgYXV0aG9yLFxuICogU3RlZmFuIEd1c3RhdnNvbi4gWW91IG1heSB1c2UgaXQgYXMgeW91IHNlZSBmaXQsIGJ1dFxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlMkQgPSB2b2lkIDA7XG52YXIgRzIgPSAoMy4wIC0gTWF0aC5zcXJ0KDMuMCkpIC8gNi4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzEsIDFdLFxuICAgIFstMSwgMV0sXG4gICAgWzEsIC0xXSxcbiAgICBbLTEsIC0xXSxcbiAgICBbMSwgMF0sXG4gICAgWy0xLCAwXSxcbiAgICBbMSwgMF0sXG4gICAgWy0xLCAwXSxcbiAgICBbMCwgMV0sXG4gICAgWzAsIC0xXSxcbiAgICBbMCwgMV0sXG4gICAgWzAsIC0xXSxcbl07XG5mdW5jdGlvbiBtYWtlTm9pc2UyRChyYW5kb20pIHtcbiAgICBpZiAocmFuZG9tID09PSB2b2lkIDApIHsgcmFuZG9tID0gTWF0aC5yYW5kb207IH1cbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcbiAgICAgICAgcFtpXSA9IGk7XG4gICAgdmFyIG47XG4gICAgdmFyIHE7XG4gICAgZm9yICh2YXIgaSA9IDI1NTsgaSA+IDA7IGktLSkge1xuICAgICAgICBuID0gTWF0aC5mbG9vcigoaSArIDEpICogcmFuZG9tKCkpO1xuICAgICAgICBxID0gcFtpXTtcbiAgICAgICAgcFtpXSA9IHBbbl07XG4gICAgICAgIHBbbl0gPSBxO1xuICAgIH1cbiAgICB2YXIgcGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdmFyIHBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgICBwZXJtW2ldID0gcFtpICYgMjU1XTtcbiAgICAgICAgcGVybU1vZDEyW2ldID0gcGVybVtpXSAlIDEyO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgICB2YXIgcyA9ICh4ICsgeSkgKiAwLjUgKiAoTWF0aC5zcXJ0KDMuMCkgLSAxLjApOyAvLyBIYWlyeSBmYWN0b3IgZm9yIDJEXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqKSAqIEcyO1xuICAgICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkpIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgICB2YXIgaTEgPSB4MCA+IHkwID8gMSA6IDA7XG4gICAgICAgIHZhciBqMSA9IHgwID4geTAgPyAwIDogMTtcbiAgICAgICAgLy8gT2Zmc2V0cyBmb3IgY29ybmVyc1xuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzI7XG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMjtcbiAgICAgICAgdmFyIHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgICAgdmFyIHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBwZXJtW2pqXV1dO1xuICAgICAgICB2YXIgZzEgPSBHcmFkW3Blcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxXV1dO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMV1dXTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwID8gMC4wIDogTWF0aC5wb3codDAsIDQpICogKGcwWzBdICogeDAgKyBnMFsxXSAqIHkwKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTE7XG4gICAgICAgIHZhciBuMSA9IHQxIDwgMCA/IDAuMCA6IE1hdGgucG93KHQxLCA0KSAqIChnMVswXSAqIHgxICsgZzFbMV0gKiB5MSk7XG4gICAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDAgPyAwLjAgOiBNYXRoLnBvdyh0MiwgNCkgKiAoZzJbMF0gKiB4MiArIGcyWzFdICogeTIpO1xuICAgICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHJldHVybiB2YWx1ZXMgaW4gdGhlIGludGVydmFsIFstMSwgMV1cbiAgICAgICAgcmV0dXJuIDcwLjE0ODA1NzcwNjUzOTUyICogKG4wICsgbjEgKyBuMik7XG4gICAgfTtcbn1cbmV4cG9ydHMubWFrZU5vaXNlMkQgPSBtYWtlTm9pc2UyRDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHBsYWNlZCBpbiB0aGUgcHVibGljIGRvbWFpbiBieSBpdHMgb3JpZ2luYWwgYXV0aG9yLFxuICogU3RlZmFuIEd1c3RhdnNvbi4gWW91IG1heSB1c2UgaXQgYXMgeW91IHNlZSBmaXQsIGJ1dFxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlM0QgPSB2b2lkIDA7XG52YXIgRzMgPSAxLjAgLyA2LjA7XG52YXIgR3JhZCA9IFtcbiAgICBbMSwgMSwgMF0sXG4gICAgWy0xLCAxLCAwXSxcbiAgICBbMSwgLTEsIDBdLFxuICAgIFstMSwgLTEsIDBdLFxuICAgIFsxLCAwLCAxXSxcbiAgICBbLTEsIDAsIDFdLFxuICAgIFsxLCAwLCAtMV0sXG4gICAgWy0xLCAwLCAtMV0sXG4gICAgWzAsIDEsIDFdLFxuICAgIFswLCAtMSwgLTFdLFxuICAgIFswLCAxLCAtMV0sXG4gICAgWzAsIC0xLCAtMV0sXG5dO1xuZnVuY3Rpb24gbWFrZU5vaXNlM0QocmFuZG9tKSB7XG4gICAgaWYgKHJhbmRvbSA9PT0gdm9pZCAwKSB7IHJhbmRvbSA9IE1hdGgucmFuZG9tOyB9XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgIHBbaV0gPSBpO1xuICAgIHZhciBuO1xuICAgIHZhciBxO1xuICAgIGZvciAodmFyIGkgPSAyNTU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoKGkgKyAxKSAqIHJhbmRvbSgpKTtcbiAgICAgICAgcSA9IHBbaV07XG4gICAgICAgIHBbaV0gPSBwW25dO1xuICAgICAgICBwW25dID0gcTtcbiAgICB9XG4gICAgdmFyIHBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHZhciBwZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgICAgcGVybVtpXSA9IHBbaSAmIDI1NV07XG4gICAgICAgIHBlcm1Nb2QxMltpXSA9IHBlcm1baV0gJSAxMjtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gICAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgICAgdmFyIHMgPSAoeCArIHkgKyB6KSAvIDMuMDsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqICsgaykgKiBHMztcbiAgICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgICAvLyBEZXRlcmluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpblxuICAgICAgICB2YXIgaTEsIGoxLCBrMSAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgICAgO1xuICAgICAgICB2YXIgaTIsIGoyLCBrMiAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgICA7XG4gICAgICAgIGlmICh4MCA+PSB5MCkge1xuICAgICAgICAgICAgaWYgKHkwID49IHowKSB7XG4gICAgICAgICAgICAgICAgaTEgPSBpMiA9IGoyID0gMTtcbiAgICAgICAgICAgICAgICBqMSA9IGsxID0gazIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeDAgPj0gejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IGkyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGoxID0gazEgPSBqMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrMSA9IGkyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gajEgPSBqMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoeTAgPCB6MCkge1xuICAgICAgICAgICAgICAgIGsxID0gajIgPSBrMiA9IDE7XG4gICAgICAgICAgICAgICAgaTEgPSBqMSA9IGkyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHgwIDwgejApIHtcbiAgICAgICAgICAgICAgICBqMSA9IGoyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gazEgPSBpMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBqMSA9IGkyID0gajIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gazEgPSBrMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHMztcbiAgICAgICAgdmFyIHoxID0gejAgLSBrMSArIEczO1xuICAgICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzM7XG4gICAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHMztcbiAgICAgICAgdmFyIHgzID0geDAgLSAxLjAgKyAzLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgdmFyIHkzID0geTAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgICAgdmFyIHozID0gejAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVyc1xuICAgICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgICB2YXIgZzAgPSBHcmFkW3Blcm1Nb2QxMltpaSArIHBlcm1bamogKyBwZXJtW2trXV1dXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMV1dXV07XG4gICAgICAgIHZhciBnMiA9IEdyYWRbcGVybU1vZDEyW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazJdXV1dO1xuICAgICAgICB2YXIgZzMgPSBHcmFkW3Blcm1Nb2QxMltpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxXV1dXTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzXG4gICAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MCwgNCkgKiAoZzBbMF0gKiB4MCArIGcwWzFdICogeTAgKyBnMFsyXSAqIHowKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxO1xuICAgICAgICB2YXIgbjEgPSB0MSA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQxLCA0KSAqIChnMVswXSAqIHgxICsgZzFbMV0gKiB5MSArIGcxWzJdICogejEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejI7XG4gICAgICAgIHZhciBuMiA9IHQyIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyICsgZzJbMl0gKiB6Mik7XG4gICAgICAgIHZhciB0MyA9IDAuNSAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MztcbiAgICAgICAgdmFyIG4zID0gdDMgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MywgNCkgKiAoZzNbMF0gKiB4MyArIGczWzFdICogeTMgKyBnM1syXSAqIHozKTtcbiAgICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byBzdGF5IGp1c3QgaW5zaWRlIFstMSwxXVxuICAgICAgICByZXR1cm4gOTQuNjg0OTMxNTA2ODE5NzIgKiAobjAgKyBuMSArIG4yICsgbjMpO1xuICAgIH07XG59XG5leHBvcnRzLm1ha2VOb2lzZTNEID0gbWFrZU5vaXNlM0Q7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTREID0gdm9pZCAwO1xudmFyIEc0ID0gKDUuMCAtIE1hdGguc3FydCg1LjApKSAvIDIwLjA7XG52YXIgR3JhZCA9IFtcbiAgICBbMCwgMSwgMSwgMV0sXG4gICAgWzAsIDEsIDEsIC0xXSxcbiAgICBbMCwgMSwgLTEsIDFdLFxuICAgIFswLCAxLCAtMSwgLTFdLFxuICAgIFswLCAtMSwgMSwgMV0sXG4gICAgWzAsIC0xLCAxLCAtMV0sXG4gICAgWzAsIC0xLCAtMSwgMV0sXG4gICAgWzAsIC0xLCAtMSwgLTFdLFxuICAgIFsxLCAwLCAxLCAxXSxcbiAgICBbMSwgMCwgMSwgLTFdLFxuICAgIFsxLCAwLCAtMSwgMV0sXG4gICAgWzEsIDAsIC0xLCAtMV0sXG4gICAgWy0xLCAwLCAxLCAxXSxcbiAgICBbLTEsIDAsIDEsIC0xXSxcbiAgICBbLTEsIDAsIC0xLCAxXSxcbiAgICBbLTEsIDAsIC0xLCAtMV0sXG4gICAgWzEsIDEsIDAsIDFdLFxuICAgIFsxLCAxLCAwLCAtMV0sXG4gICAgWzEsIC0xLCAwLCAxXSxcbiAgICBbMSwgLTEsIDAsIC0xXSxcbiAgICBbLTEsIDEsIDAsIDFdLFxuICAgIFstMSwgMSwgMCwgLTFdLFxuICAgIFstMSwgLTEsIDAsIDFdLFxuICAgIFstMSwgLTEsIDAsIC0xXSxcbiAgICBbMSwgMSwgMSwgMF0sXG4gICAgWzEsIDEsIC0xLCAwXSxcbiAgICBbMSwgLTEsIDEsIDBdLFxuICAgIFsxLCAtMSwgLTEsIDBdLFxuICAgIFstMSwgMSwgMSwgMF0sXG4gICAgWy0xLCAxLCAtMSwgMF0sXG4gICAgWy0xLCAtMSwgMSwgMF0sXG4gICAgWy0xLCAtMSwgLTEsIDBdLFxuXTtcbmZ1bmN0aW9uIG1ha2VOb2lzZTREKHJhbmRvbSkge1xuICAgIGlmIChyYW5kb20gPT09IHZvaWQgMCkgeyByYW5kb20gPSBNYXRoLnJhbmRvbTsgfVxuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBwW2ldID0gaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgcTtcbiAgICBmb3IgKHZhciBpID0gMjU1OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIG4gPSBNYXRoLmZsb29yKChpICsgMSkgKiByYW5kb20oKSk7XG4gICAgICAgIHEgPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtuXTtcbiAgICAgICAgcFtuXSA9IHE7XG4gICAgfVxuICAgIHZhciBwZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB2YXIgcGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICAgIHBlcm1baV0gPSBwW2kgJiAyNTVdO1xuICAgICAgICBwZXJtTW9kMTJbaV0gPSBwZXJtW2ldICUgMTI7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgeiwgdykge1xuICAgICAgICAvLyBTa2V3IHRoZSAoeCx5LHosdykgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIGNlbGwgb2YgMjQgc2ltcGxpY2VzIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHggKyB5ICsgeiArIHcpICogKE1hdGguc3FydCg1LjApIC0gMS4wKSAvIDQuMDsgLy8gRmFjdG9yIGZvciA0RCBza2V3aW5nXG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih4ICsgcyk7XG4gICAgICAgIHZhciBqID0gTWF0aC5mbG9vcih5ICsgcyk7XG4gICAgICAgIHZhciBrID0gTWF0aC5mbG9vcih6ICsgcyk7XG4gICAgICAgIHZhciBsID0gTWF0aC5mbG9vcih3ICsgcyk7XG4gICAgICAgIHZhciB0ID0gKGkgKyBqICsgayArIGwpICogRzQ7IC8vIEZhY3RvciBmb3IgNEQgdW5za2V3aW5nXG4gICAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6LHcpIHNwYWNlXG4gICAgICAgIHZhciBZMCA9IGogLSB0O1xuICAgICAgICB2YXIgWjAgPSBrIC0gdDtcbiAgICAgICAgdmFyIFcwID0gbCAtIHQ7XG4gICAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6LHcgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIHZhciB5MCA9IHkgLSBZMDtcbiAgICAgICAgdmFyIHowID0geiAtIFowO1xuICAgICAgICB2YXIgdzAgPSB3IC0gVzA7XG4gICAgICAgIC8vIFRvIGZpbmQgb3V0IHdoaWNoIG9mIHRoZSAyNCBwb3NzaWJsZSBzaW1wbGljZXMgd2UncmUgaW4sIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHRoZVxuICAgICAgICAvLyBtYWduaXR1ZGUgb3JkZXJpbmcgb2YgeDAsIHkwLCB6MCBhbmQgdzAuIFNpeCBwYWlyLXdpc2UgY29tcGFyaXNvbnMgYXJlIHBlcmZvcm1lZCBiZXR3ZWVuXG4gICAgICAgIC8vIGVhY2ggcG9zc2libGUgcGFpciBvZiB0aGUgZm91ciBjb29yZGluYXRlcywgYW5kIHRoZSByZXN1bHRzIGFyZSB1c2VkIHRvIHJhbmsgdGhlIG51bWJlcnMuXG4gICAgICAgIHZhciByYW5reCA9IDA7XG4gICAgICAgIHZhciByYW5reSA9IDA7XG4gICAgICAgIHZhciByYW5reiA9IDA7XG4gICAgICAgIHZhciByYW5rdyA9IDA7XG4gICAgICAgIGlmICh4MCA+IHkwKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgaWYgKHgwID4gejApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBpZiAoeDAgPiB3MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt3Kys7XG4gICAgICAgIGlmICh5MCA+IHowKVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgaWYgKHkwID4gdzApXG4gICAgICAgICAgICByYW5reSsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICBpZiAoejAgPiB3MClcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt3Kys7XG4gICAgICAgIC8vIHNpbXBsZXhbY10gaXMgYSA0LXZlY3RvciB3aXRoIHRoZSBudW1iZXJzIDAsIDEsIDIgYW5kIDMgaW4gc29tZSBvcmRlci5cbiAgICAgICAgLy8gTWFueSB2YWx1ZXMgb2YgYyB3aWxsIG5ldmVyIG9jY3VyLCBzaW5jZSBlLmcuIHg+eT56PncgbWFrZXMgeDx6LCB5PHcgYW5kIHg8d1xuICAgICAgICAvLyBpbXBvc3NpYmxlLiBPbmx5IHRoZSAyNCBpbmRpY2VzIHdoaWNoIGhhdmUgbm9uLXplcm8gZW50cmllcyBtYWtlIGFueSBzZW5zZS5cbiAgICAgICAgLy8gV2UgdXNlIGEgdGhyZXNob2xkaW5nIHRvIHNldCB0aGUgY29vcmRpbmF0ZXMgaW4gdHVybiBmcm9tIHRoZSBsYXJnZXN0IG1hZ25pdHVkZS5cbiAgICAgICAgLy8gUmFuayAzIGRlbm90ZXMgdGhlIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgICAgdmFyIGkxID0gcmFua3ggPj0gMyA/IDEgOiAwO1xuICAgICAgICB2YXIgajEgPSByYW5reSA+PSAzID8gMSA6IDA7XG4gICAgICAgIHZhciBrMSA9IHJhbmt6ID49IDMgPyAxIDogMDtcbiAgICAgICAgdmFyIGwxID0gcmFua3cgPj0gMyA/IDEgOiAwO1xuICAgICAgICAvLyBSYW5rIDIgZGVub3RlcyB0aGUgc2Vjb25kIGxhcmdlc3QgY29vcmRpbmF0ZS5cbiAgICAgICAgdmFyIGkyID0gcmFua3ggPj0gMiA/IDEgOiAwO1xuICAgICAgICB2YXIgajIgPSByYW5reSA+PSAyID8gMSA6IDA7XG4gICAgICAgIHZhciBrMiA9IHJhbmt6ID49IDIgPyAxIDogMDtcbiAgICAgICAgdmFyIGwyID0gcmFua3cgPj0gMiA/IDEgOiAwO1xuICAgICAgICAvLyBSYW5rIDEgZGVub3RlcyB0aGUgc2Vjb25kIHNtYWxsZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMyA9IHJhbmt4ID49IDEgPyAxIDogMDtcbiAgICAgICAgdmFyIGozID0gcmFua3kgPj0gMSA/IDEgOiAwO1xuICAgICAgICB2YXIgazMgPSByYW5reiA+PSAxID8gMSA6IDA7XG4gICAgICAgIHZhciBsMyA9IHJhbmt3ID49IDEgPyAxIDogMDtcbiAgICAgICAgLy8gVGhlIGZpZnRoIGNvcm5lciBoYXMgYWxsIGNvb3JkaW5hdGUgb2Zmc2V0cyA9IDEsIHNvIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGF0LlxuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzQ7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzQ7XG4gICAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHNDtcbiAgICAgICAgdmFyIHcxID0gdzAgLSBsMSArIEc0O1xuICAgICAgICB2YXIgeDIgPSB4MCAtIGkyICsgMi4wICogRzQ7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHNDtcbiAgICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEc0O1xuICAgICAgICB2YXIgdzIgPSB3MCAtIGwyICsgMi4wICogRzQ7XG4gICAgICAgIHZhciB4MyA9IHgwIC0gaTMgKyAzLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgZm91cnRoIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5MyA9IHkwIC0gajMgKyAzLjAgKiBHNDtcbiAgICAgICAgdmFyIHozID0gejAgLSBrMyArIDMuMCAqIEc0O1xuICAgICAgICB2YXIgdzMgPSB3MCAtIGwzICsgMy4wICogRzQ7XG4gICAgICAgIHZhciB4NCA9IHgwIC0gMS4wICsgNC4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHk0ID0geTAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgdmFyIHo0ID0gejAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgdmFyIHc0ID0gdzAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmaXZlIHNpbXBsZXggY29ybmVyc1xuICAgICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgICB2YXIga2sgPSBrICYgMjU1O1xuICAgICAgICB2YXIgbGwgPSBsICYgMjU1O1xuICAgICAgICB2YXIgZzAgPSBHcmFkW3Blcm1baWkgKyBwZXJtW2pqICsgcGVybVtrayArIHBlcm1bbGxdXV1dICVcbiAgICAgICAgICAgIDMyXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazEgKyBwZXJtW2xsICsgbDFdXV1dICUgMzJdO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1baWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMiArIHBlcm1bbGwgKyBsMl1dXV0gJSAzMl07XG4gICAgICAgIHZhciBnMyA9IEdyYWRbcGVybVtpaSArIGkzICsgcGVybVtqaiArIGozICsgcGVybVtrayArIGszICsgcGVybVtsbCArIGwzXV1dXSAlIDMyXTtcbiAgICAgICAgdmFyIGc0ID0gR3JhZFtwZXJtW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDEgKyBwZXJtW2xsICsgMV1dXV0gJSAzMl07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZpdmUgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejAgLSB3MCAqIHcwO1xuICAgICAgICB2YXIgbjAgPSB0MCA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQwLCA0KSAqIChnMFswXSAqIHgwICsgZzBbMV0gKiB5MCArIGcwWzJdICogejAgKyBnMFszXSAqIHcwKTtcbiAgICAgICAgdmFyIHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTEgLSB6MSAqIHoxIC0gdzEgKiB3MTtcbiAgICAgICAgdmFyIG4xID0gdDEgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEgKyBnMVsyXSAqIHoxICsgZzFbM10gKiB3MSk7XG4gICAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MiAtIHcyICogdzI7XG4gICAgICAgIHZhciBuMiA9IHQyIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyICsgZzJbMl0gKiB6MiArIGcyWzNdICogdzIpO1xuICAgICAgICB2YXIgdDMgPSAwLjUgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejMgLSB3MyAqIHczO1xuICAgICAgICB2YXIgbjMgPSB0MyA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQzLCA0KSAqIChnM1swXSAqIHgzICsgZzNbMV0gKiB5MyArIGczWzJdICogejMgKyBnM1szXSAqIHczKTtcbiAgICAgICAgdmFyIHQ0ID0gMC41IC0geDQgKiB4NCAtIHk0ICogeTQgLSB6NCAqIHo0IC0gdzQgKiB3NDtcbiAgICAgICAgdmFyIG40ID0gdDQgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0NCwgNCkgKiAoZzRbMF0gKiB4NCArIGc0WzFdICogeTQgKyBnNFsyXSAqIHo0ICsgZzRbM10gKiB3NCk7XG4gICAgICAgIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXG4gICAgICAgIHJldHVybiA3Mi4zNzg1NTc2NTE1MzY2NSAqIChuMCArIG4xICsgbjIgKyBuMyArIG40KTtcbiAgICB9O1xufVxuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IG1ha2VOb2lzZTREO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTREID0gZXhwb3J0cy5tYWtlTm9pc2UzRCA9IGV4cG9ydHMubWFrZU5vaXNlMkQgPSB2b2lkIDA7XG52YXIgXzJkXzEgPSByZXF1aXJlKFwiLi8yZFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1ha2VOb2lzZTJEXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfMmRfMS5tYWtlTm9pc2UyRDsgfSB9KTtcbnZhciBfM2RfMSA9IHJlcXVpcmUoXCIuLzNkXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFrZU5vaXNlM0RcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF8zZF8xLm1ha2VOb2lzZTNEOyB9IH0pO1xudmFyIF80ZF8xID0gcmVxdWlyZShcIi4vNGRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtYWtlTm9pc2U0RFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXzRkXzEubWFrZU5vaXNlNEQ7IH0gfSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcmVuZGVyLXdvcmtlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==