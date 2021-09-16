/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/renderjob.ts":
/*!**************************!*\
  !*** ./src/renderjob.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebWorkerQueue = exports.RenderJob = void 0;
const serializing_1 = __webpack_require__(/*! raytracer/serializing */ "../raytracer/dist/serializing.js");
class RenderJob {
    constructor(numberOfWorkers, canvas, stringUrl) {
        this.numberOfWorkers = numberOfWorkers;
        this.queue = new WebWorkerQueue(stringUrl, numberOfWorkers);
        var ctx = canvas.getContext("2d");
        this.queue.onTaskDone = (task, renderData) => {
            var imageData = new ImageData(new Uint8ClampedArray(renderData), task.to.x - task.from.x, task.to.y - task.from.y);
            ctx.putImageData(imageData, task.from.x, task.from.y);
            if (this.queue.count == 0 && this.onRenderingFinished) {
                this.onRenderingFinished();
            }
        };
    }
    start(world, camera) {
        var serializedWorld = serializing_1.serializeWorld(world);
        var serializedCamera = serializing_1.serializeCamera(camera);
        var batchSize = Math.floor(camera.vsize / this.numberOfWorkers);
        var y = 0;
        var done = false;
        do {
            var ynext = y + batchSize;
            if (ynext >= camera.vsize) {
                done = true;
                ynext = camera.vsize;
            }
            var data = { world: serializedWorld,
                camera: serializedCamera,
                from: { x: 0, y: y },
                to: { x: camera.hsize, y: ynext }
            };
            this.queue.add(data);
            y = ynext;
        } while (!done);
    }
}
exports.RenderJob = RenderJob;
class WebWorkerQueue {
    constructor(stringUrl, numberOfWorkers = navigator.hardwareConcurrency) {
        this.workers = [];
        this.status = new Map();
        this.queue = [];
        for (var i = 0; i < numberOfWorkers; i++) {
            let worker = new Worker(stringUrl);
            this.workers.push(worker);
            worker.onmessage = (ev) => {
                var task = this.status.get(worker);
                this.reAssignWorker(worker);
                this.taskDone(task, ev.data);
            };
            worker.onerror = (ev) => {
                var task = this.status.get(worker);
                this.reAssignWorker(worker);
                this.taskError(task, ev);
            };
        }
    }
    reAssignWorker(worker) {
        if (this.queue.length > 0) {
            var nextTask = this.queue.shift();
            this.status.set(worker, nextTask);
            worker.postMessage(nextTask);
            return true;
        }
        else {
            this.status.delete(worker);
            return false;
        }
    }
    taskDone(task, result) {
        if (this.onTaskDone)
            this.onTaskDone(task, result);
    }
    taskError(task, ev) {
        if (this.onTaskError)
            this.onTaskError(task, ev);
    }
    add(task) {
        var unbusyWorker = this.workers.find((w) => !this.status.has(w));
        if (unbusyWorker !== undefined) {
            unbusyWorker.postMessage(task);
            this.status.set(unbusyWorker, task);
        }
        else {
            this.queue.push(task);
        }
    }
    stop() {
        for (var w of this.workers) {
            w.terminate();
        }
        this.queue.length = 0;
        this.status.clear();
    }
    get count() {
        return this.queue.length + this.status.size;
    }
}
exports.WebWorkerQueue = WebWorkerQueue;


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
const renderjob_1 = __webpack_require__(/*! ./renderjob */ "./src/renderjob.ts");
var world = new world_1.World();
var floor = new plane_1.Plane(0);
floor.material = new material_1.Material(0);
floor.material.pattern = new patterns_1.GradientPattern(new color_1.Color(0.2, 0.4, 0.5), new color_1.Color(0.1, 0.9, 0.7));
floor.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1));
var middle = new sphere_1.Sphere(3);
middle.transform = matrix_1.Matrix4x4.translation(0, 1, 0).multiply(matrix_1.Matrix4x4.rotationY(0.1).multiply(matrix_1.Matrix4x4.rotationZ(0.2)));
middle.material = new material_1.Material(1);
middle.material.color = new color_1.Color(0.1, 1, 0.5);
middle.material.diffuse = 0.7;
middle.material.specular = 0.3;
middle.material.pattern = new patterns_1.StripePattern(new color_1.Color(0.1, 0.1, 0.6), new color_1.Color(0.1, 0.7, 0.2), matrix_1.Matrix4x4.translation(1, 0, 0).multiply(matrix_1.Matrix4x4.scaling(0.2, 0.2, 0.2)));
var right = new sphere_1.Sphere(4);
right.transform = matrix_1.Matrix4x4.translation(2, 0.5, -0.5).multiply(matrix_1.Matrix4x4.scaling(0.5, 0.5, 0.5));
right.material = new material_1.Material(2);
right.material.color = new color_1.Color(0.1, 0.7, 0.2);
right.material.diffuse = 0.7;
right.material.specular = 0.3;
right.material.pattern = new patterns_1.PerlinPattern(new color_1.Color(0.1, 0.7, 0.2), new color_1.Color(1, 1, 1), 0.15);
var left = new sphere_1.Sphere(5);
left.transform = matrix_1.Matrix4x4.translation(-5, 2, 9).multiply(matrix_1.Matrix4x4.scaling(2, 2, 2));
left.material = new material_1.Material(4);
left.material.color = new color_1.Color(1, 0.8, 0.1);
left.material.diffuse = 0.7;
left.material.specular = 0.3;
left.material.pattern = new patterns_1.Checker3DPattern4Sphere(new color_1.Color(0.9, 0.9, 0.9), new color_1.Color(0.1, 0.1, 0.1), matrix_1.Matrix4x4.IDENTITY_MATRIX.clone(), 20);
var wall = new plane_1.Plane(6);
wall.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2)));
wall.material = new material_1.Material(5);
wall.material.color = new color_1.Color(1, 1, 1);
wall.material.diffuse = 0.7;
wall.material.specular = 0.3;
wall.material.pattern = new patterns_1.RingPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.scaling(1, 1, 1));
var wall2 = new plane_1.Plane(7);
wall2.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationY(1 - Math.PI / 2).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2)));
wall2.material = new material_1.Material(6);
wall2.material.color = new color_1.Color(0, 0, 0.8);
wall2.material.diffuse = 0.7;
wall2.material.specular = 0.3;
wall2.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
world.objects = [left, right, middle, floor, wall, wall2];
world.light = new pointLight_1.PointLight(tuple_1.Tuple.point(-10, 10, -10), color_1.Color.WHITE.clone());
var camera = new camera_1.Camera(1024, 1024, Math.PI / 3, matrix_1.Matrix4x4.viewTransform(tuple_1.Tuple.point(0, 1.5, -5), tuple_1.Tuple.point(0, 1, 0), tuple_1.Tuple.vector(0, 1, 0)));
console.time("render");
var r = new renderjob_1.RenderJob(4, document.getElementById("raytracerCanvas"), "chapter10renderWorker-bundle.js");
r.start(world, camera);
r.onRenderingFinished =
    () => {
        console.timeEnd("render");
    };
/*
var raytracerCanvas = <HTMLCanvasElement>document.getElementById("raytracerCanvas");
raytracerCanvas.width=camera.hsize;
raytracerCanvas.height=camera.vsize;
var renderData = camera.renderPartial(world);
var imageData = new ImageData(renderData, camera.hsize, camera.vsize);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);


console.timeEnd("render")
*/

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixzQkFBc0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlC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LENBQUMsQ0FBQztBQUdOOzs7Ozs7Ozs7OztFQVdFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uL3NyYy9yZW5kZXJqb2IudHMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW1lcmEuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jYW52YXMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb2xsZWN0aW9uLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29sb3IuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb21wdXRhdGlvbnMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9jb25zdGFudHMuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9pbnRlcnNlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9tYXRlcmlhbC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L21hdHJpeC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3BhdHRlcm5zLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcGxhbmUuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9wb2ludExpZ2h0LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcmF5LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc2VyaWFsaXppbmcuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9zb3J0LmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc3BoZXJlLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvdHVwbGUuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC93b3JsZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8yZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8zZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi80ZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi9tb2QuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4vc3JjL2NoYXB0ZXIxMC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYW1lcmEgfSBmcm9tIFwicmF5dHJhY2VyL2NhbWVyYVwiO1xuaW1wb3J0IHsgc2VyaWFsaXplQ2FtZXJhLCBzZXJpYWxpemVXb3JsZCB9IGZyb20gXCJyYXl0cmFjZXIvc2VyaWFsaXppbmdcIjtcbmltcG9ydCB7IFdvcmxkIH0gZnJvbSBcInJheXRyYWNlci93b3JsZFwiO1xuZXhwb3J0IGNsYXNzIFJlbmRlckpvYlxue1xuICAgIHByaXZhdGUgIHF1ZXVlOiBXZWJXb3JrZXJRdWV1ZTxSZW5kZXJEYXRhPjtcbiAgICBvblJlbmRlcmluZ0ZpbmlzaGVkIDooKT0+dm9pZDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbnVtYmVyT2ZXb3JrZXJzOm51bWJlcixjYW52YXM6SFRNTENhbnZhc0VsZW1lbnQsIHN0cmluZ1VybDpzdHJpbmcpXG4gICAge1xuICAgICAgdGhpcy5xdWV1ZT0gbmV3IFdlYldvcmtlclF1ZXVlPGFueT4oc3RyaW5nVXJsLG51bWJlck9mV29ya2Vycyk7XG4gICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgIHRoaXMucXVldWUub25UYXNrRG9uZSA9KHRhc2sscmVuZGVyRGF0YSk9PntcblxuICAgICAgICAgdmFyIGltYWdlRGF0YSA9IG5ldyBJbWFnZURhdGEobmV3IFVpbnQ4Q2xhbXBlZEFycmF5KHJlbmRlckRhdGEpLCB0YXNrLnRvLngtdGFzay5mcm9tLngsIHRhc2sudG8ueS10YXNrLmZyb20ueSk7ICAgICAgICBcbiAgICAgICAgIGN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCB0YXNrLmZyb20ueCwgdGFzay5mcm9tLnkpO1xuICAgICAgICAgaWYgKHRoaXMucXVldWUuY291bnQ9PTAgJiYgdGhpcy5vblJlbmRlcmluZ0ZpbmlzaGVkKVxuICAgICAgICAge1xuICAgICAgICAgICB0aGlzLm9uUmVuZGVyaW5nRmluaXNoZWQoKTtcbiAgICAgICAgIH1cbiAgICAgIH07XG4gICAgIFxuICAgIH1cblxuICAgIHN0YXJ0KHdvcmxkOldvcmxkLGNhbWVyYTpDYW1lcmEpXG4gICAgeyAgXG4gICAgICB2YXIgc2VyaWFsaXplZFdvcmxkPXNlcmlhbGl6ZVdvcmxkKHdvcmxkKTtcbiAgICAgIHZhciBzZXJpYWxpemVkQ2FtZXJhPXNlcmlhbGl6ZUNhbWVyYShjYW1lcmEpO1xuICAgICAgdmFyIGJhdGNoU2l6ZT1NYXRoLmZsb29yKGNhbWVyYS52c2l6ZS90aGlzLm51bWJlck9mV29ya2Vycyk7XG4gICAgICB2YXIgeT0wO1xuICAgICAgdmFyIGRvbmU9ZmFsc2U7XG4gICAgICBkb1xuICAgICAgeyAgICAgICAgICAgICAgXG4gICAgICAgICB2YXIgeW5leHQ9eStiYXRjaFNpemU7IFxuICAgICAgICAgaWYgKHluZXh0Pj1jYW1lcmEudnNpemUpXG4gICAgICAgICB7XG4gICAgICAgICAgIGRvbmUgPXRydWU7XG4gICAgICAgICAgIHluZXh0PWNhbWVyYS52c2l6ZTtcbiAgICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGE9XG4gICAgICAgICAge3dvcmxkOnNlcmlhbGl6ZWRXb3JsZCxcbiAgICAgICAgIGNhbWVyYTpzZXJpYWxpemVkQ2FtZXJhLFxuICAgICAgICAgZnJvbToge3g6MCx5Onl9LFxuICAgICAgICAgdG86IHt4OmNhbWVyYS5oc2l6ZSAseTogeW5leHR9XG4gICAgICAgICB9OyBcbiAgICAgICAgIHRoaXMucXVldWUuYWRkKGRhdGEpO1xuICAgICAgICAgeT15bmV4dCA7XG4gICAgICB9d2hpbGUoIWRvbmUpXG4gICB9XG5cblxuICAgXG59XG5cblxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUXVldWU8VD5cbnsgICAgXG4gIHByaXZhdGUgd29ya2VyczpXb3JrZXJbXT1bXTtcbiAgcHJpdmF0ZSBzdGF0dXM6TWFwPFdvcmtlcixUPj0gbmV3IE1hcDxXb3JrZXIsVD4oKVxuICBwcml2YXRlIHF1ZXVlOlRbXT1bXTtcbiAgXG4gIHB1YmxpYyBvblRhc2tEb25lOih0YXNrOlQscmVzdWx0OmFueSk9PnZvaWQ7XG4gIHB1YmxpYyBvblRhc2tFcnJvcjoodGFzazpULGV2OkVycm9yRXZlbnQpPT52b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHN0cmluZ1VybDpzdHJpbmcsbnVtYmVyT2ZXb3JrZXJzOm51bWJlciA9IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IClcbiAgeyAgIFxuICAgZm9yICh2YXIgaT0wO2k8bnVtYmVyT2ZXb3JrZXJzO2krKylcbiAgIHtcbiAgICAgIGxldCB3b3JrZXIgPSBuZXcgV29ya2VyKHN0cmluZ1VybCk7XG4gICAgICB0aGlzLndvcmtlcnMucHVzaCh3b3JrZXIpO1xuICAgICAgXG4gICAgICB3b3JrZXIub25tZXNzYWdlPShldjpNZXNzYWdlRXZlbnQ8YW55Pik9PlxuICAgICAgeyAgICAgICAgXG4gICAgICAgICB2YXIgdGFzaz10aGlzLnN0YXR1cy5nZXQod29ya2VyKTtcbiAgICAgICAgIHRoaXMucmVBc3NpZ25Xb3JrZXIod29ya2VyKTsgICAgICBcbiAgICAgICAgIHRoaXMudGFza0RvbmUodGFzayxldi5kYXRhKTsgICAgICAgICBcbiAgICAgIH1cbiAgICAgIHdvcmtlci5vbmVycm9yPShldjpFcnJvckV2ZW50KT0+XG4gICAgICB7ICAgICAgICBcbiAgICAgICAgIHZhciB0YXNrPXRoaXMuc3RhdHVzLmdldCh3b3JrZXIpO1xuICAgICAgICAgdGhpcy5yZUFzc2lnbldvcmtlcih3b3JrZXIpOyAgICBcbiAgICAgICAgIHRoaXMudGFza0Vycm9yKHRhc2ssZXYpO1xuICAgICAgfVxuXG5cbiAgIH0gICAgIFxuICB9XG4gXG4gIHByaXZhdGUgcmVBc3NpZ25Xb3JrZXIod29ya2VyOldvcmtlcik6Ym9vbGVhblxuICB7ICAgICAgXG4gICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPjApXG4gICAgICB7XG4gICAgICAgICB2YXIgbmV4dFRhc2s9IHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgIHRoaXMuc3RhdHVzLnNldCh3b3JrZXIsbmV4dFRhc2spO1xuICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKG5leHRUYXNrKTtcbiAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlXG4gICAgICB7XG4gICAgICAgICB0aGlzLnN0YXR1cy5kZWxldGUod29ya2VyKTtcbiAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgfVxuICBwcml2YXRlIHRhc2tEb25lKHRhc2s6VCxyZXN1bHQ6YW55KVxuICB7XG4gICAgIGlmICh0aGlzLm9uVGFza0RvbmUpIHRoaXMub25UYXNrRG9uZSh0YXNrLHJlc3VsdCk7XG4gIH1cbiAgcHJpdmF0ZSB0YXNrRXJyb3IodGFzazpULGV2OkVycm9yRXZlbnQpXG4gIHtcbiAgICAgaWYgKHRoaXMub25UYXNrRXJyb3IpIHRoaXMub25UYXNrRXJyb3IodGFzayxldik7XG4gIH1cblxuICBhZGQodGFzazpUKVxuICB7XG4gICB2YXIgdW5idXN5V29ya2VyPXRoaXMud29ya2Vycy5maW5kKCh3KT0+IXRoaXMuc3RhdHVzLmhhcyh3KSk7XG4gICBpZiAodW5idXN5V29ya2VyIT09dW5kZWZpbmVkKVxuICAge1xuICAgICAgdW5idXN5V29ya2VyLnBvc3RNZXNzYWdlKHRhc2spO1xuICAgICAgdGhpcy5zdGF0dXMuc2V0KHVuYnVzeVdvcmtlcix0YXNrKTtcbiAgIH0gZWxzZVxuICAge1xuICAgICAgdGhpcy5xdWV1ZS5wdXNoKHRhc2spO1xuICAgfVxuICB9IFxuICBzdG9wKClcbiAge1xuICAgICBmb3IgKHZhciB3IG9mIHRoaXMud29ya2VycylcbiAgICAge1xuICAgICAgICB3LnRlcm1pbmF0ZSgpO1xuICAgICAgICBcbiAgICAgfVxuICAgICB0aGlzLnF1ZXVlLmxlbmd0aD0wO1xuICAgICB0aGlzLnN0YXR1cy5jbGVhcigpO1xuICB9XG4gIGdldCBjb3VudCgpOm51bWJlclxuICB7XG4gICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoK3RoaXMuc3RhdHVzLnNpemU7XG4gIH1cblxufVxuXG5cblxuZXhwb3J0IHR5cGUgUmVuZGVyRGF0YT1cbntcbiAgd29ybGQ6V29ybGQsXG4gIGNhbWVyYTpDYW1lcmEsXG4gIGZyb206e1xuICAgICB4Om51bWJlcixcbiAgICAgeTpudW1iZXJcbiAgfSxcbiAgdG86e1xuICAgeDpudW1iZXIsXG4gICB5Om51bWJlclxufVxufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FtZXJhID0gdm9pZCAwO1xuY29uc3QgY2FudmFzXzEgPSByZXF1aXJlKFwiLi9jYW52YXNcIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IHJheV8xID0gcmVxdWlyZShcIi4vcmF5XCIpO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY2xhc3MgQ2FtZXJhIHtcbiAgICBjb25zdHJ1Y3Rvcihoc2l6ZSwgdnNpemUsIGZpZWxkT2ZWaWV3LCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy5oc2l6ZSA9IGhzaXplO1xuICAgICAgICB0aGlzLnZzaXplID0gdnNpemU7XG4gICAgICAgIHRoaXMuZmllbGRPZlZpZXcgPSBmaWVsZE9mVmlldztcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IG51bGwgJiYgdHJhbnNmb3JtICE9PSB2b2lkIDAgPyB0cmFuc2Zvcm0gOiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICAgIGdldCBoYWxmV2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gICAgfVxuICAgIGdldCBoYWxmaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICAgIH1cbiAgICBnZXQgcGl4ZWxTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGl4ZWxTaXplO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHJlY2FsY3VsYXRlIGRlcml2ZWQgdmFsdWVzXG4gICAgICovXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB2YXIgaGFsZlZpZXcgPSBNYXRoLnRhbih0aGlzLmZpZWxkT2ZWaWV3IC8gMik7XG4gICAgICAgIHZhciBhc3BlY3QgPSB0aGlzLmhzaXplIC8gdGhpcy52c2l6ZTtcbiAgICAgICAgaWYgKGFzcGVjdCA+PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9oYWxmV2lkdGggPSBoYWxmVmlldztcbiAgICAgICAgICAgIHRoaXMuX2hhbGZIZWlnaHQgPSBoYWxmVmlldyAvIGFzcGVjdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbGZXaWR0aCA9IGhhbGZWaWV3ICogYXNwZWN0O1xuICAgICAgICAgICAgdGhpcy5faGFsZkhlaWdodCA9IGhhbGZWaWV3O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BpeGVsU2l6ZSA9ICh0aGlzLl9oYWxmV2lkdGggKiAyKSAvIHRoaXMuaHNpemU7XG4gICAgfVxuICAgIHJheUZvclBpeGVsKHgsIHkpIHtcbiAgICAgICAgdmFyIHhPZmZzZXQgPSAoeCArIDAuNSkgKiB0aGlzLl9waXhlbFNpemU7XG4gICAgICAgIHZhciB5T2Zmc2V0ID0gKHkgKyAwLjUpICogdGhpcy5fcGl4ZWxTaXplO1xuICAgICAgICB2YXIgd29ybGRYID0gdGhpcy5faGFsZldpZHRoIC0geE9mZnNldDtcbiAgICAgICAgdmFyIHdvcmxkWSA9IHRoaXMuX2hhbGZIZWlnaHQgLSB5T2Zmc2V0O1xuICAgICAgICB2YXIgcGl4ZWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkodHVwbGVfMS5UdXBsZS5wb2ludCh3b3JsZFgsIHdvcmxkWSwgLTEpKTtcbiAgICAgICAgdmFyIG9yaWdpbiA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh0dXBsZV8xLlR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHBpeGVsLnN1YnN0cmFjdChvcmlnaW4pLm5vcm1hbGl6ZSgpO1xuICAgICAgICByZXR1cm4gbmV3IHJheV8xLlJheShvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgfVxuICAgIHJlbmRlclBhcnRpYWwod29ybGQsIGZyb20gPSB7IHg6IDAsIHk6IDAgfSwgdG8gPSB7IHg6IHRoaXMuaHNpemUsIHk6IHRoaXMudnNpemUgfSkge1xuICAgICAgICB2YXIgdG9wID0gZnJvbS55O1xuICAgICAgICB2YXIgbGVmdCA9IGZyb20ueDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRvLnkgLSB0b3A7XG4gICAgICAgIHZhciB3aWR0aCA9IHRvLnggLSBsZWZ0O1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICAgICAgdmFyIHBpeGVsSW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmF5ID0gdGhpcy5yYXlGb3JQaXhlbChsZWZ0ICsgeCwgdG9wICsgeSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSBjb2xvci5yZWQgKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLmdyZWVuICogMjU1O1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSBjb2xvci5ibHVlICogMjU1O1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSAyNTU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgIH1cbiAgICByZW5kZXIod29ybGQpIHtcbiAgICAgICAgdmFyIGltYWdlID0gbmV3IGNhbnZhc18xLkNhbnZhcyh0aGlzLmhzaXplLCB0aGlzLnZzaXplKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLnZzaXplOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5oc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJheSA9IHRoaXMucmF5Rm9yUGl4ZWwoeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICAgICAgICAgIGltYWdlLndyaXRlUGl4ZWwoeCwgeSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IGhzaXplOiB0aGlzLmhzaXplLCB2c2l6ZTogdGhpcy52c2l6ZSwgZmllbGRPZlZpZXc6IHRoaXMuZmllbGRPZlZpZXcsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5DYW1lcmEgPSBDYW1lcmE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYW1lcmEuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhbnZhcyA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIENhbnZhcyB7XG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlYWRQaXhlbCh4LCB5KSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA8IDAgfHwgeSA+PSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHZhciBwaXhlbEluZGV4ID0gTWF0aC5mbG9vcih5KSAqIHRoaXMud2lkdGggKiAzICsgTWF0aC5mbG9vcih4KSAqIDM7XG4gICAgICAgIHJldHVybiBuZXcgY29sb3JfMS5Db2xvcih0aGlzLmRhdGFbcGl4ZWxJbmRleF0sIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMV0sIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMl0pO1xuICAgIH1cbiAgICB3cml0ZVBpeGVsKHgsIHksIGMpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5IDwgMCB8fCB5ID49IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIgcGl4ZWxJbmRleCA9IE1hdGguZmxvb3IoeSkgKiB0aGlzLndpZHRoICogMyArIE1hdGguZmxvb3IoeCkgKiAzO1xuICAgICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleF0gPSBjLnJlZDtcbiAgICAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAxXSA9IGMuZ3JlZW47XG4gICAgICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMl0gPSBjLmJsdWU7XG4gICAgfVxuICAgIHRvUHBtKCkge1xuICAgICAgICB2YXIgcHBtID0gXCJQM1xcblwiO1xuICAgICAgICBwcG0gKz0gdGhpcy53aWR0aCArIFwiIFwiICsgdGhpcy5oZWlnaHQgKyBcIlxcblwiO1xuICAgICAgICBwcG0gKz0gXCIyNTVcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHBwbSArPSAoaSAlIDE1ID09IDApID8gXCJcXG5cIiA6IFwiIFwiO1xuICAgICAgICAgICAgcHBtICs9IE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2ldICogMjU1KSwgMjU1KSwgMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICsgXCIgXCIgKyBNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpICsgMV0gKiAyNTUpLCAyNTUpLCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2kgKyAyXSAqIDI1NSksIDI1NSksIDApLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHBtICs9IFwiXFxuXCI7XG4gICAgICAgIHJldHVybiBwcG07XG4gICAgfVxuICAgIHRvVWludDhDbGFtcGVkQXJyYXkoKSB7XG4gICAgICAgIHZhciBhcnIgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogNCk7XG4gICAgICAgIHZhciBhcnJJbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXhdID0gdGhpcy5kYXRhW2ldICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgMV0gPSB0aGlzLmRhdGFbaSArIDFdICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgMl0gPSB0aGlzLmRhdGFbaSArIDJdICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgM10gPSAyNTU7XG4gICAgICAgICAgICBhcnJJbmRleCArPSA0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxufVxuZXhwb3J0cy5DYW52YXMgPSBDYW52YXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYW52YXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk9iamVjdFBvb2wgPSB2b2lkIDA7XG4vKipcbiAqIE9iamVjdCBwb29sIHRoYXQgd2lsbCBtaW5pbWl6ZSBnYXJiYWdlIGNvbGxlY3Rpb24gdXNhZ2VcbiAqL1xuY2xhc3MgT2JqZWN0UG9vbCB7XG4gICAgY29uc3RydWN0b3IoYXJyYXlMZW5ndGggPSAwKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBuZXcgQXJyYXkoYXJyYXlMZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sIGkpO1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXSA9IG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5kZXhPZihpdGVtKSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5pbmRleE1hcC5nZXQoaXRlbSk7XG4gICAgICAgIHJldHVybiAoaSA9PT0gdW5kZWZpbmVkIHx8IGkgPj0gdGhpcy5fbGVuZ3RoKSA/IC0xIDogaTtcbiAgICB9XG4gICAgcmVtb3ZlKGEpIHtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmluZGV4TWFwLmdldChhKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuX2xlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5fbGVuZ3RoLS07XG4gICAgICAgIHZhciByZW1vdmVJdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XG4gICAgICAgIHZhciBsYXN0SXRlbSA9IHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoXTtcbiAgICAgICAgdGhpcy5pdGVtc1tpbmRleF0gPSBsYXN0SXRlbTtcbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdID0gcmVtb3ZlSXRlbTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQocmVtb3ZlSXRlbSwgdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobGFzdEl0ZW0sIGluZGV4KTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gdW51c2VkIGl0ZW0gb3IgY3JlYXRlcyBhIG5ldyBvbmUsIGlmIG5vIHVudXNlZCBpdGVtIGF2YWlsYWJsZVxuICAgICovXG4gICAgYWRkKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVtcy5sZW5ndGggPT0gdGhpcy5fbGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbSA9IHRoaXMuY3JlYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwLnNldChuZXdJdGVtLCB0aGlzLl9sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoID0gdGhpcy5pdGVtcy5wdXNoKG5ld0l0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoKytdO1xuICAgIH1cbiAgICBnZXQoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID49IHRoaXMuX2xlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG59XG5leHBvcnRzLk9iamVjdFBvb2wgPSBPYmplY3RQb29sO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sbGVjdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29sb3IgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIENvbG9yIHtcbiAgICBjb25zdHJ1Y3RvcihyZWQsIGdyZWVuLCBibHVlKSB7XG4gICAgICAgIHRoaXMucmVkID0gcmVkO1xuICAgICAgICB0aGlzLmdyZWVuID0gZ3JlZW47XG4gICAgICAgIHRoaXMuYmx1ZSA9IGJsdWU7XG4gICAgfVxuICAgIGFkZChjb2xvcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICsgY29sb3IucmVkLCB0aGlzLmdyZWVuICsgY29sb3IuZ3JlZW4sIHRoaXMuYmx1ZSArIGNvbG9yLmJsdWUpO1xuICAgIH1cbiAgICBtdWx0aXBseShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAqIHNjYWxhciwgdGhpcy5ncmVlbiAqIHNjYWxhciwgdGhpcy5ibHVlICogc2NhbGFyKTtcbiAgICB9XG4gICAgZGl2aWRlKHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkIC8gc2NhbGFyLCB0aGlzLmdyZWVuIC8gc2NhbGFyLCB0aGlzLmJsdWUgLyBzY2FsYXIpO1xuICAgIH1cbiAgICBzdWJzdHJhY3QoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAtIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgLSBjb2xvci5ibHVlKTtcbiAgICB9XG4gICAgaGFkYW1hcmRQcm9kdWN0KGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKiBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKiBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICogY29sb3IuYmx1ZSk7XG4gICAgfVxuICAgIGVxdWFscyhjb2xvcikge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy5yZWQgLSBjb2xvci5yZWQpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuKSA8IGNvbnN0YW50c18xLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMuYmx1ZSAtIGNvbG9yLmJsdWUpIDwgY29uc3RhbnRzXzEuRVBTSUxPTjtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQsIHRoaXMuZ3JlZW4sIHRoaXMuYmx1ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5Db2xvciA9IENvbG9yO1xuQ29sb3IuQkxBQ0sgPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigwLCAwLCAwKSk7XG5Db2xvci5XSElURSA9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDEsIDEsIDEpKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbG9yLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db21wdXRhdGlvbnMgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIENvbXB1dGF0aW9ucyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuICAgIHN0YXRpYyBwcmVwYXJlKGludGVyc2VjdGlvbiwgcmF5KSB7XG4gICAgICAgIHZhciBjb21wcyA9IG5ldyBDb21wdXRhdGlvbnMoKTtcbiAgICAgICAgY29tcHMudCA9IGludGVyc2VjdGlvbi50O1xuICAgICAgICBjb21wcy5vYmplY3QgPSBpbnRlcnNlY3Rpb24ub2JqZWN0O1xuICAgICAgICBjb21wcy5wb2ludCA9IHJheS5wb3NpdGlvbihjb21wcy50KTtcbiAgICAgICAgY29tcHMuZXlldiA9IHJheS5kaXJlY3Rpb24ubmVnYXRlKCk7XG4gICAgICAgIGNvbXBzLm5vcm1hbHYgPSBjb21wcy5vYmplY3Qubm9ybWFsQXQoY29tcHMucG9pbnQpO1xuICAgICAgICBpZiAoY29tcHMubm9ybWFsdi5kb3QoY29tcHMuZXlldikgPCAwKSB7XG4gICAgICAgICAgICBjb21wcy5pbnNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgY29tcHMubm9ybWFsdiA9IGNvbXBzLm5vcm1hbHYubmVnYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb21wcy5pbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb21wcy5vdmVyUG9pbnQgPSBjb21wcy5wb2ludC5hZGQoY29tcHMubm9ybWFsdi5tdWx0aXBseShjb25zdGFudHNfMS5FUFNJTE9OKSk7XG4gICAgICAgIHJldHVybiBjb21wcztcbiAgICB9XG59XG5leHBvcnRzLkNvbXB1dGF0aW9ucyA9IENvbXB1dGF0aW9ucztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXB1dGF0aW9ucy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRVBTSUxPTiA9IHZvaWQgMDtcbmV4cG9ydHMuRVBTSUxPTiA9IDAuMDAwMDE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25zdGFudHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkludGVyc2VjdGlvbnMgPSBleHBvcnRzLkludGVyc2VjdGlvbiA9IHZvaWQgMDtcbmNvbnN0IGNvbGxlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb25cIik7XG5jb25zdCBzb3J0XzEgPSByZXF1aXJlKFwiLi9zb3J0XCIpO1xuY2xhc3MgSW50ZXJzZWN0aW9uIHtcbiAgICBjb25zdHJ1Y3Rvcih0LCBvYmplY3QpIHtcbiAgICAgICAgdGhpcy50ID0gdDtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudCA9PSBpbnRlcnNlY3Rpb24udCAmJiB0aGlzLm9iamVjdCA9PT0gaW50ZXJzZWN0aW9uLm9iamVjdDtcbiAgICB9XG59XG5leHBvcnRzLkludGVyc2VjdGlvbiA9IEludGVyc2VjdGlvbjtcbmNsYXNzIEludGVyc2VjdGlvbnMgZXh0ZW5kcyBjb2xsZWN0aW9uXzEuT2JqZWN0UG9vbCB7XG4gICAgc3RhdGljIHNvcnRJbnRlcnNlY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYS50IC0gYi50O1xuICAgIH1cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uKDAsIG51bGwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaGl0LCByZWdhcmRsZXNzIG9mIHNvcnRcbiAgICAqL1xuICAgIGhpdCgpIHtcbiAgICAgICAgdmFyIGhpdCA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmICgoaGl0ID09IG51bGwgfHwgaXRlbS50IDwgaGl0LnQpICYmIGl0ZW0udCA+IDApXG4gICAgICAgICAgICAgICAgaGl0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGl0O1xuICAgIH1cbiAgICBzb3J0KCkge1xuICAgICAgICBzb3J0XzEubWVyZ2VTb3J0SW5wbGFjZSh0aGlzLml0ZW1zLCBJbnRlcnNlY3Rpb25zLnNvcnRJbnRlcnNlY3Rpb24sIDAsIHRoaXMuX2xlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KHRoaXMuaXRlbXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb25zKSB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggIT0gaW50ZXJzZWN0aW9ucy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pdGVtc1tpXS5lcXVhbHMoaW50ZXJzZWN0aW9ucy5pdGVtc1tpXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLkludGVyc2VjdGlvbnMgPSBJbnRlcnNlY3Rpb25zO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW50ZXJzZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NYXRlcmlhbCA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIE1hdGVyaWFsIHtcbiAgICBjb25zdHJ1Y3RvcihpZCA9IC0xKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yXzEuQ29sb3IuV0hJVEUuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5hbWJpZW50ID0gMC4xO1xuICAgICAgICB0aGlzLmRpZmZ1c2UgPSAwLjk7XG4gICAgICAgIHRoaXMuc3BlY3VsYXIgPSAwLjk7XG4gICAgICAgIHRoaXMuc2hpbmluZXNzID0gMjAwO1xuICAgICAgICB0aGlzLnBhdHRlcm4gPSBudWxsO1xuICAgIH1cbiAgICBsaWdodGluZyhsaWdodCwgb2JqZWN0LCBwb2ludCwgZXlldiwgbm9ybWFsdiwgaW5TaGFkb3cgPSBmYWxzZSkge1xuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLnBhdHRlcm4gIT0gbnVsbCA/IHRoaXMucGF0dGVybi5wYXR0ZXJuQXRTaGFwZShvYmplY3QsIHBvaW50KSA6IHRoaXMuY29sb3I7XG4gICAgICAgIHZhciBlZmZlY3RpdmVDb2xvciA9IGNvbG9yLmhhZGFtYXJkUHJvZHVjdChsaWdodC5pbnRlbnNpdHkpO1xuICAgICAgICB2YXIgYW1iaWVudCA9IGVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuYW1iaWVudCk7XG4gICAgICAgIGlmIChpblNoYWRvdylcbiAgICAgICAgICAgIHJldHVybiBhbWJpZW50O1xuICAgICAgICB2YXIgbGlnaHR2ID0gbGlnaHQucG9zaXRpb24uc3Vic3RyYWN0KHBvaW50KS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIGxpZ2h0RG90Tm9ybWFsID0gbGlnaHR2LmRvdChub3JtYWx2KTtcbiAgICAgICAgdmFyIGRpZmZ1c2U7XG4gICAgICAgIHZhciBzcGVjdWxhcjtcbiAgICAgICAgaWYgKGxpZ2h0RG90Tm9ybWFsIDwgMCkge1xuICAgICAgICAgICAgZGlmZnVzZSA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgICAgICBzcGVjdWxhciA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkaWZmdXNlID0gZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5kaWZmdXNlICogbGlnaHREb3ROb3JtYWwpO1xuICAgICAgICAgICAgdmFyIHJlZmxlY3R2ID0gbGlnaHR2Lm5lZ2F0ZSgpLnJlZmxlY3Qobm9ybWFsdik7XG4gICAgICAgICAgICB2YXIgcmVmbGVjdERvdEV5ZSA9IHJlZmxlY3R2LmRvdChleWV2KTtcbiAgICAgICAgICAgIGlmIChyZWZsZWN0RG90RXllIDw9IDApIHtcbiAgICAgICAgICAgICAgICBzcGVjdWxhciA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZmFjdG9yID0gTWF0aC5wb3cocmVmbGVjdERvdEV5ZSwgdGhpcy5zaGluaW5lc3MpO1xuICAgICAgICAgICAgICAgIHNwZWN1bGFyID0gbGlnaHQuaW50ZW5zaXR5Lm11bHRpcGx5KHRoaXMuc3BlY3VsYXIgKiBmYWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbWJpZW50LmFkZChkaWZmdXNlKS5hZGQoc3BlY3VsYXIpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0ZXJpYWwgPSBNYXRlcmlhbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGVyaWFsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NYXRyaXgzeDMgPSBleHBvcnRzLk1hdHJpeDJ4MiA9IGV4cG9ydHMuTWF0cml4NHg0ID0gZXhwb3J0cy5NYXRyaXggPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNsYXNzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IoYSwgYikge1xuICAgICAgICBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgbWF0cml4ID0gYTtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoID09IDAgfHwgbWF0cml4WzBdLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IG1hdHJpeFswXS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IG1hdHJpeC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcm93W3hdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVt0aGlzLndpZHRoICogeSArIHhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IGE7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGI7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29mYWN0b3Iocm93LCBjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuICgocm93ICsgY29sdW1uKSAlIDIgKiAyIC0gMSkgKiAtdGhpcy5taW5vcihyb3csIGNvbHVtbik7XG4gICAgfVxuICAgIG1pbm9yKHJvdywgY29sdW1uKSB7XG4gICAgICAgIHZhciBtID0gdGhpcy5zdWJtYXRyaXgocm93LCBjb2x1bW4pO1xuICAgICAgICByZXR1cm4gbS5kZXRlcm1pbmFudCgpO1xuICAgIH1cbiAgICBpc0ludmVydGlibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRldGVybWluYW50KCkgIT0gMDtcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIGlmICh0aGlzLndpZHRoID09IDIpXG4gICAgICAgICAgICByZXR1cm4gTWF0cml4MngyLnByb3RvdHlwZS5kZXRlcm1pbmFudC5jYWxsKHRoaXMpO1xuICAgICAgICB2YXIgZGV0ID0gMDtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIGRldCArPSB0aGlzLmRhdGFbeF0gKiB0aGlzLmNvZmFjdG9yKDAsIHgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICB2YXIgc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBzdHJpbmcgKz0gXCJ8XCI7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XS50b0ZpeGVkKDIpICsgXCJcXHR8XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHJpbmcgKz0gXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cbiAgICBnZXQocm93LCBjb2x1bW4pIHtcbiAgICAgICAgaWYgKHJvdyA+PSB0aGlzLmhlaWdodCB8fCBjb2x1bW4gPj0gdGhpcy53aWR0aCB8fCByb3cgPCAwIHx8IGNvbHVtbiA8IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMud2lkdGggKiByb3cgKyBjb2x1bW5dO1xuICAgIH1cbiAgICBzZXQocm93LCBjb2x1bW4sIHZhbHVlKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdGhpcy5kYXRhW3RoaXMud2lkdGggKiByb3cgKyBjb2x1bW5dID0gdmFsdWU7XG4gICAgfVxuICAgIG11bHRpcGx5KG1hdHJpeCkge1xuICAgICAgICBpZiAobWF0cml4LmhlaWdodCAhPSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgobWF0cml4LndpZHRoLCBtYXRyaXguaGVpZ2h0KTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBtYXRyaXguaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbWF0cml4LndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IG1hdHJpeC5oZWlnaHQ7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gbWF0cml4LmRhdGFbdGhpcy53aWR0aCAqIHIgKyB4XSAqIHRoaXMuZGF0YVt0aGlzLndpZHRoICogeSArIHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XSA9IHN1bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgdHJhbnNwb3NlKCkge1xuICAgICAgICB2YXIgbWF0cml4ID0gbmV3IE1hdHJpeCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0geTsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy53aWR0aCAqIHkgKyB4O1xuICAgICAgICAgICAgICAgIHZhciBpbmRleFRyYW5zcG9zZWQgPSB0aGlzLndpZHRoICogeCArIHk7XG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhdID0gdGhpcy5kYXRhW2luZGV4VHJhbnNwb3NlZF07XG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhUcmFuc3Bvc2VkXSA9IHRoaXMuZGF0YVtpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdHJpeDtcbiAgICB9XG4gICAgc3VibWF0cml4KHJvdywgY29sdW1uKSB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeCh0aGlzLndpZHRoIC0gMSwgdGhpcy5oZWlnaHQgLSAxKTtcbiAgICAgICAgdmFyIHkyID0gMDtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBpZiAoeSA9PSByb3cpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB4MiA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIGlmICh4ID09IGNvbHVtbikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW20ud2lkdGggKiB5MiArIHgyXSA9IHRoaXMuZGF0YVt0aGlzLndpZHRoICogeSArIHhdO1xuICAgICAgICAgICAgICAgIHgyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5MisrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBlcXVhbHMobWF0cml4KSB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IG1hdHJpeC53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBtYXRyaXguaGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBkaWZmID0gTWF0aC5hYnModGhpcy5kYXRhW2ldIC0gbWF0cml4LmRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaWZmID49IGNvbnN0YW50c18xLkVQU0lMT04pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeCA9IE1hdHJpeDtcbmNsYXNzIE1hdHJpeDR4NCBleHRlbmRzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggIT0gNCB8fCBtYXRyaXhbMF0ubGVuZ3RoICE9IDQgfHwgbWF0cml4WzFdLmxlbmd0aCAhPSA0IHx8IG1hdHJpeFsyXS5sZW5ndGggIT0gNCB8fCBtYXRyaXhbM10ubGVuZ3RoICE9IDQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyKG1hdHJpeCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlcig0LCA0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdmlld1RyYW5zZm9ybShmcm9tLCB0bywgdXAsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgZm9yd2FyZCA9IHRvLnN1YnN0cmFjdChmcm9tKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIHVwbiA9IHVwLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgbGVmdCA9IGZvcndhcmQuY3Jvc3ModXBuKTtcbiAgICAgICAgdmFyIHRydWVVcCA9IGxlZnQuY3Jvc3MoZm9yd2FyZCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gbGVmdC54O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IGxlZnQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSBsZWZ0Lno7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gdHJ1ZVVwLng7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gdHJ1ZVVwLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gdHJ1ZVVwLno7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gLWZvcndhcmQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAtZm9yd2FyZC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAtZm9yd2FyZC56O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICBNYXRyaXg0eDQudHJhbnNsYXRpb24oLWZyb20ueCwgLWZyb20ueSwgLWZyb20ueiwgTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQpO1xuICAgICAgICB0YXJnZXQubXVsdGlwbHkoTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQsIHRhcmdldCk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyB0cmFuc2xhdGlvbih4LCB5LCB6LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0geDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB5O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSB6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25YKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSBzaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25ZKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25aKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gLXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgc2NhbGluZyh4LCB5LCB6LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSB4O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgc2hlYXJpbmcoeHksIHh6LCB5eCwgeXosIHp4LCB6eSwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSB5eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSB6eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB4eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHp5O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHh6O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHl6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgdHJhbnNwb3NlKHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSwgdGhpcy5kYXRhWzNdXSxcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdLCB0aGlzLmRhdGFbN11dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdLCB0aGlzLmRhdGFbMTFdXSxcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbMTJdLCB0aGlzLmRhdGFbMTNdLCB0aGlzLmRhdGFbMTRdLCB0aGlzLmRhdGFbMTVdXVxuICAgICAgICBdO1xuICAgIH1cbiAgICBpbnZlcnNlKHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICB2YXIgZGV0ZXJtaW5hbnQgPSAoYTAwICogKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpICtcbiAgICAgICAgICAgIGEwMSAqIC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMyIC0gYTIyICogYTMwKSkgK1xuICAgICAgICAgICAgYTAyICogKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMyAqIC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkpO1xuICAgICAgICBpZiAoZGV0ZXJtaW5hbnQgPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMDIgKiAtKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMDMgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMDMgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpICsgYTAyICogLShhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAzICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGEwMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGEwMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMCAqIGEzMyAtIGExMyAqIGEzMCkgKyBhMDMgKiAoYTEwICogYTMyIC0gYTEyICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgKyBhMDIgKiAtKGExMCAqIGEyMyAtIGExMyAqIGEyMCkgKyBhMDMgKiAoYTEwICogYTIyIC0gYTEyICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTAzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IChhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEwMSAqIC0oYTEwICogYTMzIC0gYTEzICogYTMwKSArIGEwMyAqIChhMTAgKiBhMzEgLSBhMTEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjMgLSBhMTMgKiBhMjApICsgYTAzICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTAyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMDEgKiAtKGExMCAqIGEzMiAtIGExMiAqIGEzMCkgKyBhMDIgKiAoYTEwICogYTMxIC0gYTExICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgYTAyICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gKGEwMCAqIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSArXG4gICAgICAgICAgICBhMDEgKiAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMiAqIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMSAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSArXG4gICAgICAgICAgICBhMDMgKiAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTEyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpKTtcbiAgICB9XG4gICAgYXNzaWduKG1hdHJpeCkge1xuICAgICAgICB0aGlzLmRhdGFbMF0gPSBtYXRyaXguZGF0YVswXTtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gbWF0cml4LmRhdGFbMV07XG4gICAgICAgIHRoaXMuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdO1xuICAgICAgICB0aGlzLmRhdGFbM10gPSBtYXRyaXguZGF0YVszXTtcbiAgICAgICAgdGhpcy5kYXRhWzRdID0gbWF0cml4LmRhdGFbNF07XG4gICAgICAgIHRoaXMuZGF0YVs1XSA9IG1hdHJpeC5kYXRhWzVdO1xuICAgICAgICB0aGlzLmRhdGFbNl0gPSBtYXRyaXguZGF0YVs2XTtcbiAgICAgICAgdGhpcy5kYXRhWzddID0gbWF0cml4LmRhdGFbN107XG4gICAgICAgIHRoaXMuZGF0YVs4XSA9IG1hdHJpeC5kYXRhWzhdO1xuICAgICAgICB0aGlzLmRhdGFbOV0gPSBtYXRyaXguZGF0YVs5XTtcbiAgICAgICAgdGhpcy5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzEwXTtcbiAgICAgICAgdGhpcy5kYXRhWzExXSA9IG1hdHJpeC5kYXRhWzExXTtcbiAgICAgICAgdGhpcy5kYXRhWzEyXSA9IG1hdHJpeC5kYXRhWzEyXTtcbiAgICAgICAgdGhpcy5kYXRhWzEzXSA9IG1hdHJpeC5kYXRhWzEzXTtcbiAgICAgICAgdGhpcy5kYXRhWzE0XSA9IG1hdHJpeC5kYXRhWzE0XTtcbiAgICAgICAgdGhpcy5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzE1XTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBtLmRhdGFbMF0gPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIG0uZGF0YVsxXSA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgbS5kYXRhWzJdID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICBtLmRhdGFbM10gPSB0aGlzLmRhdGFbM107XG4gICAgICAgIG0uZGF0YVs0XSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgbS5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBtLmRhdGFbNl0gPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIG0uZGF0YVs3XSA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgbS5kYXRhWzhdID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICBtLmRhdGFbOV0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIG0uZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBtLmRhdGFbMTFdID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgbS5kYXRhWzEyXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIG0uZGF0YVsxM10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICBtLmRhdGFbMTRdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgbS5kYXRhWzE1XSA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBtdWx0aXBseShhLCBiKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTWF0cml4NHg0KSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYiAhPT0gbnVsbCAmJiBiICE9PSB2b2lkIDAgPyBiIDogbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICAgICAgaWYgKG1hdHJpeCA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhO1xuICAgICAgICAgICAgdmFyIGEwMCA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICAgICAgdmFyIGEwMyA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICAgICAgdmFyIGExMiA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIGEyMSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgICAgICB2YXIgYTMwID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgICAgICB2YXIgYTMzID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzBdID0gbWF0cml4LmRhdGFbMF0gKiBhMDAgKyBtYXRyaXguZGF0YVs0XSAqIGEwMSArIG1hdHJpeC5kYXRhWzhdICogYTAyICsgbWF0cml4LmRhdGFbMTJdICogYTAzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSBtYXRyaXguZGF0YVsxXSAqIGEwMCArIG1hdHJpeC5kYXRhWzVdICogYTAxICsgbWF0cml4LmRhdGFbOV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxM10gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdICogYTAwICsgbWF0cml4LmRhdGFbNl0gKiBhMDEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVszXSA9IG1hdHJpeC5kYXRhWzNdICogYTAwICsgbWF0cml4LmRhdGFbN10gKiBhMDEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IG1hdHJpeC5kYXRhWzBdICogYTEwICsgbWF0cml4LmRhdGFbNF0gKiBhMTEgKyBtYXRyaXguZGF0YVs4XSAqIGExMiArIG1hdHJpeC5kYXRhWzEyXSAqIGExMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzVdID0gbWF0cml4LmRhdGFbMV0gKiBhMTAgKyBtYXRyaXguZGF0YVs1XSAqIGExMSArIG1hdHJpeC5kYXRhWzldICogYTEyICsgbWF0cml4LmRhdGFbMTNdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSBtYXRyaXguZGF0YVsyXSAqIGExMCArIG1hdHJpeC5kYXRhWzZdICogYTExICsgbWF0cml4LmRhdGFbMTBdICogYTEyICsgbWF0cml4LmRhdGFbMTRdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSBtYXRyaXguZGF0YVszXSAqIGExMCArIG1hdHJpeC5kYXRhWzddICogYTExICsgbWF0cml4LmRhdGFbMTFdICogYTEyICsgbWF0cml4LmRhdGFbMTVdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBtYXRyaXguZGF0YVswXSAqIGEyMCArIG1hdHJpeC5kYXRhWzRdICogYTIxICsgbWF0cml4LmRhdGFbOF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IG1hdHJpeC5kYXRhWzFdICogYTIwICsgbWF0cml4LmRhdGFbNV0gKiBhMjEgKyBtYXRyaXguZGF0YVs5XSAqIGEyMiArIG1hdHJpeC5kYXRhWzEzXSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzJdICogYTIwICsgbWF0cml4LmRhdGFbNl0gKiBhMjEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSBtYXRyaXguZGF0YVszXSAqIGEyMCArIG1hdHJpeC5kYXRhWzddICogYTIxICsgbWF0cml4LmRhdGFbMTFdICogYTIyICsgbWF0cml4LmRhdGFbMTVdICogYTIzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gbWF0cml4LmRhdGFbMF0gKiBhMzAgKyBtYXRyaXguZGF0YVs0XSAqIGEzMSArIG1hdHJpeC5kYXRhWzhdICogYTMyICsgbWF0cml4LmRhdGFbMTJdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gbWF0cml4LmRhdGFbMV0gKiBhMzAgKyBtYXRyaXguZGF0YVs1XSAqIGEzMSArIG1hdHJpeC5kYXRhWzldICogYTMyICsgbWF0cml4LmRhdGFbMTNdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gbWF0cml4LmRhdGFbMl0gKiBhMzAgKyBtYXRyaXguZGF0YVs2XSAqIGEzMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEzMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEzMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzNdICogYTMwICsgbWF0cml4LmRhdGFbN10gKiBhMzEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMzIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMzM7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEgaW5zdGFuY2VvZiB0dXBsZV8xLlR1cGxlKSB7XG4gICAgICAgICAgICB2YXIgdCA9IGE7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHR1cGxlXzEuVHVwbGUodGhpcy5kYXRhWzBdICogdC54ICsgdGhpcy5kYXRhWzFdICogdC55ICsgdGhpcy5kYXRhWzJdICogdC56ICsgdGhpcy5kYXRhWzNdICogdC53LCB0aGlzLmRhdGFbNF0gKiB0LnggKyB0aGlzLmRhdGFbNV0gKiB0LnkgKyB0aGlzLmRhdGFbNl0gKiB0LnogKyB0aGlzLmRhdGFbN10gKiB0LncsIHRoaXMuZGF0YVs4XSAqIHQueCArIHRoaXMuZGF0YVs5XSAqIHQueSArIHRoaXMuZGF0YVsxMF0gKiB0LnogKyB0aGlzLmRhdGFbMTFdICogdC53LCB0aGlzLmRhdGFbMTJdICogdC54ICsgdGhpcy5kYXRhWzEzXSAqIHQueSArIHRoaXMuZGF0YVsxNF0gKiB0LnogKyB0aGlzLmRhdGFbMTVdICogdC53KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vYSBpbnN0YW5jZW9mIE1hdHJpeCAobm90IHN1cHBvcnRlZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXg0eDQgPSBNYXRyaXg0eDQ7XG5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYID0gbmV3IE1hdHJpeDR4NChbXG4gICAgWzEsIDAsIDAsIDBdLFxuICAgIFswLCAxLCAwLCAwXSxcbiAgICBbMCwgMCwgMSwgMF0sXG4gICAgWzAsIDAsIDAsIDFdXG5dKTtcbk1hdHJpeDR4NC50ZW1wTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NCgpO1xuY2xhc3MgTWF0cml4MngyIGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSAyIHx8IG1hdHJpeFswXS5sZW5ndGggIT0gMiB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyKG1hdHJpeCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlcigyLCAyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSAqIHRoaXMuZGF0YVszXSAtIHRoaXMuZGF0YVsxXSAqIHRoaXMuZGF0YVsyXTtcbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeDJ4MiA9IE1hdHJpeDJ4MjtcbmNsYXNzIE1hdHJpeDN4MyBleHRlbmRzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggIT0gMyB8fCBtYXRyaXhbMF0ubGVuZ3RoICE9IDMgfHwgbWF0cml4WzFdLmxlbmd0aCAhPSAzIHx8IG1hdHJpeFsyXS5sZW5ndGggIT0gMykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDMsIDMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YVswXSAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgdGhpcy5kYXRhWzFdICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgdGhpcy5kYXRhWzJdICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4M3gzID0gTWF0cml4M3gzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0cml4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QZXJsaW5QYXR0ZXJuID0gZXhwb3J0cy5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSA9IGV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IGV4cG9ydHMuUmluZ1BhdHRlcm4gPSBleHBvcnRzLkdyYWRpZW50UGF0dGVybiA9IGV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IGV4cG9ydHMuUGF0dGVybiA9IHZvaWQgMDtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgZmFzdF9zaW1wbGV4X25vaXNlXzEgPSByZXF1aXJlKFwiZmFzdC1zaW1wbGV4LW5vaXNlXCIpO1xuY2xhc3MgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IodHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIHBhdHRlcm5BdFNoYXBlKG9iamVjdCwgd29ybGRQb2ludCkge1xuICAgICAgICB2YXIgb2JqZWN0UG9pbnQgPSBvYmplY3QuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh3b3JsZFBvaW50KTtcbiAgICAgICAgdmFyIHBhdHRlcm5Qb2ludCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShvYmplY3RQb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdHRlcm5BdChwYXR0ZXJuUG9pbnQpO1xuICAgIH1cbn1cbmV4cG9ydHMuUGF0dGVybiA9IFBhdHRlcm47XG5QYXR0ZXJuLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuY2xhc3MgU3RyaXBlUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmNvbG9ycyA9IFthLCBiXTtcbiAgICB9XG4gICAgZ2V0IGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1swXTtcbiAgICB9XG4gICAgZ2V0IGIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1sxXTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1tNYXRoLmZsb29yKE1hdGguYWJzKHBvaW50LngpKSAlIDJdO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLlN0cmlwZVBhdHRlcm4gPSBTdHJpcGVQYXR0ZXJuO1xuY2xhc3MgR3JhZGllbnRQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLmIuc3Vic3RyYWN0KHRoaXMuYSk7XG4gICAgICAgIHZhciBmcmFjdGlvbiA9IHBvaW50LnggLSBNYXRoLmZsb29yKHBvaW50LngpO1xuICAgICAgICByZXR1cm4gdGhpcy5hLmFkZChkaXN0YW5jZS5tdWx0aXBseShmcmFjdGlvbikpO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkdyYWRpZW50UGF0dGVybiA9IEdyYWRpZW50UGF0dGVybjtcbmNsYXNzIFJpbmdQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICByZXR1cm4gKE1hdGguZmxvb3IoTWF0aC5zcXJ0KHBvaW50LnggKiBwb2ludC54ICsgcG9pbnQueiAqIHBvaW50LnopKSAlIDIgPT0gMCkgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuUmluZ1BhdHRlcm4gPSBSaW5nUGF0dGVybjtcbmNsYXNzIENoZWNrZXIzZFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiAoKE1hdGguZmxvb3IocG9pbnQueCkgKyBNYXRoLmZsb29yKHBvaW50LnkpICsgTWF0aC5mbG9vcihwb2ludC56KSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNoZWNrZXIzZFBhdHRlcm4gPSBDaGVja2VyM2RQYXR0ZXJuO1xuY2xhc3MgQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUgZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCksIHV2U2NhbGUgPSAxKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgICAgIHRoaXMudXZTY2FsZSA9IHV2U2NhbGU7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICB2YXIgdHUgPSBNYXRoLmF0YW4yKHBvaW50LngsIHBvaW50LnopIC8gTWF0aC5QSSAvIDIgKiB0aGlzLnV2U2NhbGU7XG4gICAgICAgIHZhciB0diA9IHBvaW50LnkgLyAyICogdGhpcy51dlNjYWxlO1xuICAgICAgICByZXR1cm4gKCgoTWF0aC5mbG9vcih0dSkgKyBNYXRoLmZsb29yKHR2KSkpICUgMiA9PSAwKSA/IHRoaXMuYSA6IHRoaXMuYjtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRoaXMuY29uc3RydWN0b3IubmFtZSwgYTogdGhpcy5hLCBiOiB0aGlzLmIsIHV2U2NhbGU6IHRoaXMudXZTY2FsZSwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlID0gQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmU7XG5jbGFzcyBQZXJsaW5QYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdGhyZXNob2xkID0gMC41LCBzZWVkID0gTWF0aC5yYW5kb20oKSwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgICAgIHRoaXMubm9pc2UzZCA9IGZhc3Rfc2ltcGxleF9ub2lzZV8xLm1ha2VOb2lzZTNEKCgpID0+IHRoaXMuc2VlZCk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICB0aGlzLnNlZWQgPSBzZWVkO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9pc2UzZChwb2ludC54LCBwb2ludC55LCBwb2ludC56KSA+IHRoaXMudGhyZXNob2xkID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdGhyZXNob2xkOiB0aGlzLnRocmVzaG9sZCwgc2VlZDogdGhpcy5zZWVkLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuUGVybGluUGF0dGVybiA9IFBlcmxpblBhdHRlcm47XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXR0ZXJucy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUGxhbmUgPSB2b2lkIDA7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCBpbnRlcnNlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgbWF0ZXJpYWxfMSA9IHJlcXVpcmUoXCIuL21hdGVyaWFsXCIpO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jbGFzcyBQbGFuZSB7XG4gICAgY29uc3RydWN0b3IoaWQsIHRyYW5zZm9ybSwgbWF0ZXJpYWwpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsICE9PSBudWxsICYmIG1hdGVyaWFsICE9PSB2b2lkIDAgPyBtYXRlcmlhbCA6IG5ldyBtYXRlcmlhbF8xLk1hdGVyaWFsKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgcmF5ID0gcmF5LnRyYW5zZm9ybSh0aGlzLmludmVyc2VUcmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmxvY2FsSW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBub3JtYWxBdChwKSB7XG4gICAgICAgIHZhciBvYmplY3ROb3JtYWwgPSB0dXBsZV8xLlR1cGxlLnZlY3RvcigwLCAxLCAwKTtcbiAgICAgICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShQbGFuZS50ZW1wTWF0cml4MSkubXVsdGlwbHkob2JqZWN0Tm9ybWFsKTtcbiAgICAgICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgICB9XG4gICAgbG9jYWxJbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICBpZiAoTWF0aC5hYnMocmF5LmRpcmVjdGlvbi55KSA8IGNvbnN0YW50c18xLkVQU0lMT04pXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICAgICAgdmFyIGkgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgICAgICBpLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIGkudCA9IC1yYXkub3JpZ2luLnkgLyByYXkuZGlyZWN0aW9uLnk7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbn1cbmV4cG9ydHMuUGxhbmUgPSBQbGFuZTtcblBsYW5lLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGxhbmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBvaW50TGlnaHQgPSB2b2lkIDA7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCBjb2xvcl8xID0gcmVxdWlyZShcIi4vY29sb3JcIik7XG5jbGFzcyBQb2ludExpZ2h0IHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbiwgaW50ZW5zaXR5KSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbiAhPT0gbnVsbCAmJiBwb3NpdGlvbiAhPT0gdm9pZCAwID8gcG9zaXRpb24gOiB0dXBsZV8xLlR1cGxlLnBvaW50KDAsIDAsIDApO1xuICAgICAgICB0aGlzLmludGVuc2l0eSA9IGludGVuc2l0eSAhPT0gbnVsbCAmJiBpbnRlbnNpdHkgIT09IHZvaWQgMCA/IGludGVuc2l0eSA6IG5ldyBjb2xvcl8xLkNvbG9yKDEsIDEsIDEpO1xuICAgIH1cbn1cbmV4cG9ydHMuUG9pbnRMaWdodCA9IFBvaW50TGlnaHQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wb2ludExpZ2h0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5SYXkgPSB2b2lkIDA7XG5jbGFzcyBSYXkge1xuICAgIGNvbnN0cnVjdG9yKG9yaWdpbiwgZGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMub3JpZ2luID0gb3JpZ2luO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB9XG4gICAgcG9zaXRpb24odCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW4uYWRkKHRoaXMuZGlyZWN0aW9uLm11bHRpcGx5KHQpKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKG1hdHJpeCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gbWF0cml4Lm11bHRpcGx5KHRoaXMuZGlyZWN0aW9uKTtcbiAgICAgICAgdmFyIG9yaWdpbiA9IG1hdHJpeC5tdWx0aXBseSh0aGlzLm9yaWdpbik7XG4gICAgICAgIHZhciByYXkgPSBuZXcgUmF5KG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHJheTtcbiAgICB9XG59XG5leHBvcnRzLlJheSA9IFJheTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJheS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2VyaWFsaXplV29ybGQgPSBleHBvcnRzLnNlcmlhbGl6ZUFycmF5ID0gZXhwb3J0cy5zZXJpYWxpemVTaGFwZSA9IGV4cG9ydHMuc2VyaWFsaXplTWF0ZXJpYWwgPSBleHBvcnRzLnNlcmlhbGl6ZVBhdHRlcm4gPSBleHBvcnRzLnNlcmlhbGl6ZUNhbWVyYSA9IGV4cG9ydHMuZGVTZXJpYWxpemVDYW1lcmEgPSBleHBvcnRzLmRlc2VyaWFsaXplQ29sb3IgPSBleHBvcnRzLmRlc2VyaWFsaXplU3RyaW5nID0gZXhwb3J0cy5kZXNlcmlhbGl6ZU51bWJlciA9IGV4cG9ydHMuZGVzZXJpYWxpemVUdXBsZSA9IGV4cG9ydHMuZGVTZXJpYWxpemVMaWdodCA9IGV4cG9ydHMuZGVTZXJpYWxpemVBcnJheSA9IGV4cG9ydHMuZGVTZXJpYWxpemVXb3JsZCA9IGV4cG9ydHMuZGVzZXJpYWxpemVNYXRyaXg0eDQgPSBleHBvcnRzLmRlU2VyaWFsaXplUGF0dGVybiA9IGV4cG9ydHMuZGVTZXJpYWxpemVNYXRlcmlhbCA9IGV4cG9ydHMuZGVTZXJpYWxpemVTaGFwZXMgPSB2b2lkIDA7XG5jb25zdCBjYW1lcmFfMSA9IHJlcXVpcmUoXCIuL2NhbWVyYVwiKTtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgcGF0dGVybnNfMSA9IHJlcXVpcmUoXCIuL3BhdHRlcm5zXCIpO1xuY29uc3QgcGxhbmVfMSA9IHJlcXVpcmUoXCIuL3BsYW5lXCIpO1xuY29uc3QgcG9pbnRMaWdodF8xID0gcmVxdWlyZShcIi4vcG9pbnRMaWdodFwiKTtcbmNvbnN0IHNwaGVyZV8xID0gcmVxdWlyZShcIi4vc3BoZXJlXCIpO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY29uc3Qgd29ybGRfMSA9IHJlcXVpcmUoXCIuL3dvcmxkXCIpO1xuY29uc3QgbWF0ZXJpYWxfMSA9IHJlcXVpcmUoXCIuL21hdGVyaWFsXCIpO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVTaGFwZXMob2JqLCBtYXRlcmlhbHNNYXApIHtcbiAgICB2YXIgdHlwZSA9IGRlc2VyaWFsaXplU3RyaW5nKG9iai50eXBlKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBwbGFuZV8xLlBsYW5lLm5hbWU6XG4gICAgICAgICAgICB2YXIgcCA9IG5ldyBwbGFuZV8xLlBsYW5lKGRlc2VyaWFsaXplTnVtYmVyKG9iai5pZCksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pLCBtYXRlcmlhbHNNYXAuZ2V0KGRlc2VyaWFsaXplTnVtYmVyKG9iai5tYXRlcmlhbCkpKTtcbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICBjYXNlIHNwaGVyZV8xLlNwaGVyZS5uYW1lOlxuICAgICAgICAgICAgdmFyIHMgPSBuZXcgc3BoZXJlXzEuU3BoZXJlKGRlc2VyaWFsaXplTnVtYmVyKG9iai5pZCksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pLCBtYXRlcmlhbHNNYXAuZ2V0KGRlc2VyaWFsaXplTnVtYmVyKG9iai5tYXRlcmlhbCkpKTtcbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVTaGFwZXMgPSBkZVNlcmlhbGl6ZVNoYXBlcztcbmZ1bmN0aW9uIGRlU2VyaWFsaXplTWF0ZXJpYWwob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgbSA9IG5ldyBtYXRlcmlhbF8xLk1hdGVyaWFsKGRlc2VyaWFsaXplTnVtYmVyKG9iai5pZCkpO1xuICAgIG0uYW1iaWVudCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5hbWJpZW50KTtcbiAgICBtLmNvbG9yID0gZGVzZXJpYWxpemVDb2xvcihvYmouY29sb3IpO1xuICAgIG0uZGlmZnVzZSA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5kaWZmdXNlKTtcbiAgICBtLnBhdHRlcm4gPSBkZVNlcmlhbGl6ZVBhdHRlcm4ob2JqLnBhdHRlcm4pO1xuICAgIG0uc2hpbmluZXNzID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnNoaW5pbmVzcyk7XG4gICAgbS5zcGVjdWxhciA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5zcGVjdWxhcik7XG4gICAgcmV0dXJuIG07XG59XG5leHBvcnRzLmRlU2VyaWFsaXplTWF0ZXJpYWwgPSBkZVNlcmlhbGl6ZU1hdGVyaWFsO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVQYXR0ZXJuKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIHR5cGUgPSBkZXNlcmlhbGl6ZVN0cmluZyhvYmoudHlwZSk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5QZXJsaW5QYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcCA9IG5ldyBwYXR0ZXJuc18xLlBlcmxpblBhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudGhyZXNob2xkKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnNlZWQpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDIgPSBuZXcgcGF0dGVybnNfMS5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZShkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudXZTY2FsZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHAyO1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuQ2hlY2tlcjNkUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHAzID0gbmV3IHBhdHRlcm5zXzEuQ2hlY2tlcjNkUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwMztcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLlJpbmdQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDQgPSBuZXcgcGF0dGVybnNfMS5SaW5nUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwNDtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkdyYWRpZW50UGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHA1ID0gbmV3IHBhdHRlcm5zXzEuR3JhZGllbnRQYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA1O1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuU3RyaXBlUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHA2ID0gbmV3IHBhdHRlcm5zXzEuU3RyaXBlUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwNjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplUGF0dGVybiA9IGRlU2VyaWFsaXplUGF0dGVybjtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIGFycmF5ID0gZGVTZXJpYWxpemVBcnJheShvYmosICh4KSA9PiBkZVNlcmlhbGl6ZUFycmF5KHgsIGRlc2VyaWFsaXplTnVtYmVyKSk7XG4gICAgdmFyIHcgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KGFycmF5KTtcbiAgICByZXR1cm4gdztcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVNYXRyaXg0eDQgPSBkZXNlcmlhbGl6ZU1hdHJpeDR4NDtcbmZ1bmN0aW9uIGRlU2VyaWFsaXplV29ybGQob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgbWF0ZXJpYWxzID0gZGVTZXJpYWxpemVBcnJheShvYmoubWF0ZXJpYWxzLCBkZVNlcmlhbGl6ZU1hdGVyaWFsKTtcbiAgICB2YXIgbWF0ZXJpYWxzTWFwID0gbmV3IE1hcChtYXRlcmlhbHMubWFwKChtKSA9PiBbbS5pZCwgbV0pKTtcbiAgICB2YXIgdyA9IG5ldyB3b3JsZF8xLldvcmxkKCk7XG4gICAgdy5saWdodCA9IGRlU2VyaWFsaXplTGlnaHQob2JqLmxpZ2h0KTtcbiAgICB3Lm9iamVjdHMgPSBkZVNlcmlhbGl6ZUFycmF5KG9iai5vYmplY3RzLCAocykgPT4geyByZXR1cm4gZGVTZXJpYWxpemVTaGFwZXMocywgbWF0ZXJpYWxzTWFwKTsgfSk7XG4gICAgcmV0dXJuIHc7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplV29ybGQgPSBkZVNlcmlhbGl6ZVdvcmxkO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVBcnJheShvYmosIGNhbGxiYWNrZm4pIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgIUFycmF5LmlzQXJyYXkob2JqKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iai5tYXAoY2FsbGJhY2tmbik7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplQXJyYXkgPSBkZVNlcmlhbGl6ZUFycmF5O1xuZnVuY3Rpb24gZGVTZXJpYWxpemVMaWdodChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBwb2ludExpZ2h0ID0gbmV3IHBvaW50TGlnaHRfMS5Qb2ludExpZ2h0KGRlc2VyaWFsaXplVHVwbGUob2JqLnBvc2l0aW9uKSwgZGVzZXJpYWxpemVDb2xvcihvYmouaW50ZW5zaXR5KSk7XG4gICAgcmV0dXJuIHBvaW50TGlnaHQ7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplTGlnaHQgPSBkZVNlcmlhbGl6ZUxpZ2h0O1xuZnVuY3Rpb24gZGVzZXJpYWxpemVUdXBsZShvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciB0ID0gbmV3IHR1cGxlXzEuVHVwbGUoKTtcbiAgICB0LnggPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoueCk7XG4gICAgdC55ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnkpO1xuICAgIHQueiA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai56KTtcbiAgICB0LncgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoudyk7XG4gICAgcmV0dXJuIHQ7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplVHVwbGUgPSBkZXNlcmlhbGl6ZVR1cGxlO1xuZnVuY3Rpb24gZGVzZXJpYWxpemVOdW1iZXIob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsIHx8IGlzTmFOKG9iaikpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHJldHVybiBvYmo7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplTnVtYmVyID0gZGVzZXJpYWxpemVOdW1iZXI7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVN0cmluZyhvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgISgodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgb2JqIGluc3RhbmNlb2YgU3RyaW5nKSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHJldHVybiBvYmo7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplU3RyaW5nID0gZGVzZXJpYWxpemVTdHJpbmc7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUNvbG9yKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIGNvbG9yID0gbmV3IGNvbG9yXzEuQ29sb3IoKTtcbiAgICBjb2xvci5yZWQgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoucmVkKTtcbiAgICBjb2xvci5ncmVlbiA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5ncmVlbik7XG4gICAgY29sb3IuYmx1ZSA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5ibHVlKTtcbiAgICByZXR1cm4gY29sb3I7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplQ29sb3IgPSBkZXNlcmlhbGl6ZUNvbG9yO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVDYW1lcmEob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgYyA9IG5ldyBjYW1lcmFfMS5DYW1lcmEoZGVzZXJpYWxpemVOdW1iZXIob2JqLmhzaXplKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnZzaXplKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLmZpZWxkT2ZWaWV3KSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgIHJldHVybiBjO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZUNhbWVyYSA9IGRlU2VyaWFsaXplQ2FtZXJhO1xuZnVuY3Rpb24gc2VyaWFsaXplQ2FtZXJhKGNhbWVyYSkge1xuICAgIHJldHVybiBjYW1lcmEudG9PYmplY3QoKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplQ2FtZXJhID0gc2VyaWFsaXplQ2FtZXJhO1xuZnVuY3Rpb24gc2VyaWFsaXplUGF0dGVybihwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm5bXCJ0b09iamVjdFwiXSgpO1xufVxuZXhwb3J0cy5zZXJpYWxpemVQYXR0ZXJuID0gc2VyaWFsaXplUGF0dGVybjtcbmZ1bmN0aW9uIHNlcmlhbGl6ZU1hdGVyaWFsKG1hdGVyaWFsKSB7XG4gICAgdmFyIG0gPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIG1hdGVyaWFsKSwgeyBwYXR0ZXJuOiBzZXJpYWxpemVQYXR0ZXJuKG1hdGVyaWFsLnBhdHRlcm4pIH0pO1xuICAgIHJldHVybiBtO1xufVxuZXhwb3J0cy5zZXJpYWxpemVNYXRlcmlhbCA9IHNlcmlhbGl6ZU1hdGVyaWFsO1xuZnVuY3Rpb24gc2VyaWFsaXplU2hhcGUoc2hhcGUpIHtcbiAgICBpZiAoc2hhcGUgaW5zdGFuY2VvZiBwbGFuZV8xLlBsYW5lKSB7XG4gICAgICAgIGxldCBvID0geyBpZDogc2hhcGUuaWQsXG4gICAgICAgICAgICB0eXBlOiBzaGFwZS5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBzaGFwZS50cmFuc2Zvcm0udG9BcnJheSgpLFxuICAgICAgICAgICAgbWF0ZXJpYWw6IHNoYXBlLm1hdGVyaWFsLmlkIH07XG4gICAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgICBlbHNlIGlmIChzaGFwZSBpbnN0YW5jZW9mIHNwaGVyZV8xLlNwaGVyZSkge1xuICAgICAgICBsZXQgbyA9IHsgaWQ6IHNoYXBlLmlkLFxuICAgICAgICAgICAgdHlwZTogc2hhcGUuY29uc3RydWN0b3IubmFtZSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2hhcGUudHJhbnNmb3JtLnRvQXJyYXkoKSxcbiAgICAgICAgICAgIG1hdGVyaWFsOiBzaGFwZS5tYXRlcmlhbC5pZCB9O1xuICAgICAgICByZXR1cm4gbztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59XG5leHBvcnRzLnNlcmlhbGl6ZVNoYXBlID0gc2VyaWFsaXplU2hhcGU7XG5mdW5jdGlvbiBzZXJpYWxpemVBcnJheShhcnIsIGNhbGxiYWNrZm4pIHtcbiAgICByZXR1cm4gYXJyLm1hcChjYWxsYmFja2ZuKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplQXJyYXkgPSBzZXJpYWxpemVBcnJheTtcbmZ1bmN0aW9uIHNlcmlhbGl6ZVdvcmxkKHdvcmxkKSB7XG4gICAgdmFyIHNoYXJlZCA9IG5ldyBNYXAoKTtcbiAgICB2YXIgbWF0ZXJpYWxzID0gd29ybGQub2JqZWN0cy5tYXAoKG8pID0+IHNlcmlhbGl6ZU1hdGVyaWFsKG8ubWF0ZXJpYWwpKTtcbiAgICB2YXIgbyA9IHtcbiAgICAgICAgbGlnaHQ6IHdvcmxkLmxpZ2h0LFxuICAgICAgICBtYXRlcmlhbHM6IG1hdGVyaWFscyxcbiAgICAgICAgb2JqZWN0czogc2VyaWFsaXplQXJyYXkod29ybGQub2JqZWN0cywgc2VyaWFsaXplU2hhcGUpXG4gICAgfTtcbiAgICByZXR1cm4gbztcbn1cbmV4cG9ydHMuc2VyaWFsaXplV29ybGQgPSBzZXJpYWxpemVXb3JsZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlcmlhbGl6aW5nLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tZXJnZVNvcnRJbnBsYWNlID0gdm9pZCAwO1xuLyoqXG4gKiBNZXJnZXMgMiBzb3J0ZWQgcmVnaW9ucyBpbiBhbiBhcnJheSBpbnRvIDEgc29ydGVkIHJlZ2lvbiAoaW4tcGxhY2Ugd2l0aG91dCBleHRyYSBtZW1vcnksIHN0YWJsZSlcbiAqIEBwYXJhbSBpdGVtcyBhcnJheSB0byBtZXJnZVxuICogQHBhcmFtIGxlZnQgbGVmdCBhcnJheSBib3VuZGFyeSBpbmNsdXNpdmVcbiAqIEBwYXJhbSBtaWRkbGUgYm91bmRhcnkgYmV0d2VlbiByZWdpb25zIChsZWZ0IHJlZ2lvbiBleGNsdXNpdmUsIHJpZ2h0IHJlZ2lvbiBpbmNsdXNpdmUpXG4gKiBAcGFyYW0gcmlnaHQgcmlnaHQgYXJyYXkgYm91bmRhcnkgZXhjbHVzaXZlXG4gKi9cbmZ1bmN0aW9uIG1lcmdlSW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCBsZWZ0LCBtaWRkbGUsIHJpZ2h0KSB7XG4gICAgaWYgKHJpZ2h0ID09IG1pZGRsZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSBsZWZ0OyBpIDwgbWlkZGxlOyBpKyspIHtcbiAgICAgICAgdmFyIG1pblJpZ2h0ID0gaXRlbXNbbWlkZGxlXTtcbiAgICAgICAgaWYgKGNvbXBhcmVGbihtaW5SaWdodCwgaXRlbXNbaV0pIDwgMCkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IGl0ZW1zW2ldO1xuICAgICAgICAgICAgaXRlbXNbaV0gPSBtaW5SaWdodDtcbiAgICAgICAgICAgIHZhciBuZXh0SXRlbTtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbWlkZGxlICsgMTtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0IDwgcmlnaHQgJiYgY29tcGFyZUZuKChuZXh0SXRlbSA9IGl0ZW1zW25leHRdKSwgdG1wKSA8IDApIHtcbiAgICAgICAgICAgICAgICBpdGVtc1tuZXh0IC0gMV0gPSBuZXh0SXRlbTtcbiAgICAgICAgICAgICAgICBuZXh0Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtc1tuZXh0IC0gMV0gPSB0bXA7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEluLXBsYWNlIGJvdHRvbSB1cCBtZXJnZSBzb3J0XG4gKi9cbmZ1bmN0aW9uIG1lcmdlU29ydElucGxhY2UoaXRlbXMsIGNvbXBhcmVGbiwgZnJvbSwgdG8pIHtcbiAgICBmcm9tICE9PSBudWxsICYmIGZyb20gIT09IHZvaWQgMCA/IGZyb20gOiAoZnJvbSA9IDApO1xuICAgIHRvICE9PSBudWxsICYmIHRvICE9PSB2b2lkIDAgPyB0byA6ICh0byA9IGl0ZW1zLmxlbmd0aCk7XG4gICAgdmFyIG1heFN0ZXAgPSAodG8gLSBmcm9tKSAqIDI7XG4gICAgZm9yICh2YXIgc3RlcCA9IDI7IHN0ZXAgPCBtYXhTdGVwOyBzdGVwICo9IDIpIHtcbiAgICAgICAgdmFyIG9sZFN0ZXAgPSBzdGVwIC8gMjtcbiAgICAgICAgZm9yICh2YXIgeCA9IGZyb207IHggPCB0bzsgeCArPSBzdGVwKSB7XG4gICAgICAgICAgICBtZXJnZUlucGxhY2UoaXRlbXMsIGNvbXBhcmVGbiwgeCwgeCArIG9sZFN0ZXAsIE1hdGgubWluKHggKyBzdGVwLCB0bykpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5tZXJnZVNvcnRJbnBsYWNlID0gbWVyZ2VTb3J0SW5wbGFjZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNvcnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNwaGVyZSA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5jbGFzcyBTcGhlcmUge1xuICAgIGNvbnN0cnVjdG9yKGlkLCB0cmFuc2Zvcm0sIG1hdGVyaWFsKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IG51bGwgJiYgdHJhbnNmb3JtICE9PSB2b2lkIDAgPyB0cmFuc2Zvcm0gOiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBtYXRlcmlhbCAhPT0gbnVsbCAmJiBtYXRlcmlhbCAhPT0gdm9pZCAwID8gbWF0ZXJpYWwgOiBuZXcgbWF0ZXJpYWxfMS5NYXRlcmlhbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIGludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIHJheSA9IHJheS50cmFuc2Zvcm0odGhpcy5pbnZlcnNlVHJhbnNmb3JtKTtcbiAgICAgICAgdmFyIHNwaGVyZTJyYXkgPSByYXkub3JpZ2luLnN1YnN0cmFjdCh0dXBsZV8xLlR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICAgICAgdmFyIGEgPSByYXkuZGlyZWN0aW9uLmRvdChyYXkuZGlyZWN0aW9uKTtcbiAgICAgICAgdmFyIGIgPSAyICogcmF5LmRpcmVjdGlvbi5kb3Qoc3BoZXJlMnJheSk7XG4gICAgICAgIHZhciBjID0gc3BoZXJlMnJheS5kb3Qoc3BoZXJlMnJheSkgLSAxO1xuICAgICAgICB2YXIgZGlzY3JpbWluYW50ID0gYiAqIGIgLSA0ICogYSAqIGM7XG4gICAgICAgIGlmIChkaXNjcmltaW5hbnQgPCAwKVxuICAgICAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgICAgIHZhciBzcXJ0RGlzY3JpbWluYW50ID0gTWF0aC5zcXJ0KGRpc2NyaW1pbmFudCk7XG4gICAgICAgIHZhciBpMSA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkxLnQgPSAoLWIgLSBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgICAgIGkxLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIHZhciBpMiA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkyLnQgPSAoLWIgKyBzcXJ0RGlzY3JpbWluYW50KSAvICgyICogYSk7XG4gICAgICAgIGkyLm9iamVjdCA9IHRoaXM7XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBub3JtYWxBdChwKSB7XG4gICAgICAgIHZhciBvYmplY3ROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkocCk7XG4gICAgICAgIG9iamVjdE5vcm1hbC53ID0gMDtcbiAgICAgICAgdmFyIHdvcmxkTm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLnRyYW5zcG9zZShTcGhlcmUudGVtcE1hdHJpeDEpLm11bHRpcGx5KG9iamVjdE5vcm1hbCk7XG4gICAgICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgICAgICByZXR1cm4gd29ybGROb3JtYWwubm9ybWFsaXplKCk7XG4gICAgfVxufVxuZXhwb3J0cy5TcGhlcmUgPSBTcGhlcmU7XG5TcGhlcmUudGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zcGhlcmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlR1cGxlID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jbGFzcyBUdXBsZSB7XG4gICAgY29uc3RydWN0b3IoeCwgeSwgeiwgdykge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICB0aGlzLncgPSB3O1xuICAgIH1cbiAgICBpc1BvaW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDE7XG4gICAgfVxuICAgIGlzVmVjdG9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ID09IDA7XG4gICAgfVxuICAgIGFkZCh0dXBsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCArIHR1cGxlLngsIHRoaXMueSArIHR1cGxlLnksIHRoaXMueiArIHR1cGxlLnosIHRoaXMudyArIHR1cGxlLncpO1xuICAgIH1cbiAgICBtdWx0aXBseShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyLCB0aGlzLncgKiBzY2FsYXIpO1xuICAgIH1cbiAgICBkaXZpZGUoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54IC8gc2NhbGFyLCB0aGlzLnkgLyBzY2FsYXIsIHRoaXMueiAvIHNjYWxhciwgdGhpcy53IC8gc2NhbGFyKTtcbiAgICB9XG4gICAgc3Vic3RyYWN0KHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54IC0gdHVwbGUueCwgdGhpcy55IC0gdHVwbGUueSwgdGhpcy56IC0gdHVwbGUueiwgdGhpcy53IC0gdHVwbGUudyk7XG4gICAgfVxuICAgIG5lZ2F0ZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSgtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56LCAtdGhpcy53KTtcbiAgICB9XG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXZpZGUodGhpcy5tYWduaXR1ZGUoKSk7XG4gICAgfVxuICAgIG1hZ25pdHVkZSgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLnogKyB0aGlzLncgKiB0aGlzLncpO1xuICAgIH1cbiAgICBkb3QodHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCAqIHR1cGxlLnggKyB0aGlzLnkgKiB0dXBsZS55ICsgdGhpcy56ICogdHVwbGUueiArIHRoaXMudyAqIHR1cGxlLnc7XG4gICAgfVxuICAgIGNyb3NzKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBUdXBsZS52ZWN0b3IodGhpcy55ICogdHVwbGUueiAtIHRoaXMueiAqIHR1cGxlLnksIHRoaXMueiAqIHR1cGxlLnggLSB0aGlzLnggKiB0dXBsZS56LCB0aGlzLnggKiB0dXBsZS55IC0gdGhpcy55ICogdHVwbGUueCk7XG4gICAgfVxuICAgIHJlZmxlY3Qobm9ybWFsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1YnN0cmFjdChub3JtYWwubXVsdGlwbHkoMiAqIHRoaXMuZG90KG5vcm1hbCkpKTtcbiAgICB9XG4gICAgZXF1YWxzKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnggLSB0dXBsZS54KSA8IGNvbnN0YW50c18xLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueSAtIHR1cGxlLnkpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy56IC0gdHVwbGUueikgPCBjb25zdGFudHNfMS5FUFNJTE9OO1xuICAgIH1cbiAgICBzdGF0aWMgcG9pbnQoeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDEpO1xuICAgIH1cbiAgICBzdGF0aWMgdmVjdG9yKHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAwKTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54LCB0aGlzLnksIHRoaXMueiwgdGhpcy53KTtcbiAgICB9XG59XG5leHBvcnRzLlR1cGxlID0gVHVwbGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10dXBsZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV29ybGQgPSB2b2lkIDA7XG5jb25zdCBjb2xvcl8xID0gcmVxdWlyZShcIi4vY29sb3JcIik7XG5jb25zdCBjb21wdXRhdGlvbnNfMSA9IHJlcXVpcmUoXCIuL2NvbXB1dGF0aW9uc1wiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgcmF5XzEgPSByZXF1aXJlKFwiLi9yYXlcIik7XG5jbGFzcyBXb3JsZCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuICAgIHNoYWRlSGl0KGNvbXBzKSB7XG4gICAgICAgIHJldHVybiBjb21wcy5vYmplY3QubWF0ZXJpYWwubGlnaHRpbmcodGhpcy5saWdodCwgY29tcHMub2JqZWN0LCBjb21wcy5wb2ludCwgY29tcHMuZXlldiwgY29tcHMubm9ybWFsdiwgdGhpcy5pc1NoYWRvd2VkKGNvbXBzLm92ZXJQb2ludCkpO1xuICAgIH1cbiAgICBjb2xvckF0KHJheSkge1xuICAgICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgICB0aGlzLmludGVyc2VjdChyYXksIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdmFyIGkgPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgICAgaWYgKGkgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjb2xvcl8xLkNvbG9yLkJMQUNLLmNsb25lKCk7XG4gICAgICAgIHZhciBjb21wID0gY29tcHV0YXRpb25zXzEuQ29tcHV0YXRpb25zLnByZXBhcmUoaSwgcmF5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGVIaXQoY29tcCk7XG4gICAgfVxuICAgIGludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIGZvciAodmFyIG8gb2YgdGhpcy5vYmplY3RzKSB7XG4gICAgICAgICAgICBvLmludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgIH1cbiAgICBpc1NoYWRvd2VkKHBvaW50KSB7XG4gICAgICAgIHZhciB2ID0gdGhpcy5saWdodC5wb3NpdGlvbi5zdWJzdHJhY3QocG9pbnQpO1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB2Lm1hZ25pdHVkZSgpO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gdi5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIHIgPSBuZXcgcmF5XzEuUmF5KHBvaW50LCBkaXJlY3Rpb24pO1xuICAgICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgICB0aGlzLmludGVyc2VjdChyLCBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIHZhciBoID0gV29ybGQudGVtcEludGVyc2VjdGlvbnMuaGl0KCk7XG4gICAgICAgIHJldHVybiAoaCAhPSBudWxsICYmIGgudCA8IGRpc3RhbmNlKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmxkID0gV29ybGQ7XG5Xb3JsZC50ZW1wSW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKDEwMCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD13b3JsZC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTJEID0gdm9pZCAwO1xudmFyIEcyID0gKDMuMCAtIE1hdGguc3FydCgzLjApKSAvIDYuMDtcbnZhciBHcmFkID0gW1xuICAgIFsxLCAxXSxcbiAgICBbLTEsIDFdLFxuICAgIFsxLCAtMV0sXG4gICAgWy0xLCAtMV0sXG4gICAgWzEsIDBdLFxuICAgIFstMSwgMF0sXG4gICAgWzEsIDBdLFxuICAgIFstMSwgMF0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAtMV0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAtMV0sXG5dO1xuZnVuY3Rpb24gbWFrZU5vaXNlMkQocmFuZG9tKSB7XG4gICAgaWYgKHJhbmRvbSA9PT0gdm9pZCAwKSB7IHJhbmRvbSA9IE1hdGgucmFuZG9tOyB9XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgIHBbaV0gPSBpO1xuICAgIHZhciBuO1xuICAgIHZhciBxO1xuICAgIGZvciAodmFyIGkgPSAyNTU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoKGkgKyAxKSAqIHJhbmRvbSgpKTtcbiAgICAgICAgcSA9IHBbaV07XG4gICAgICAgIHBbaV0gPSBwW25dO1xuICAgICAgICBwW25dID0gcTtcbiAgICB9XG4gICAgdmFyIHBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHZhciBwZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgICAgcGVybVtpXSA9IHBbaSAmIDI1NV07XG4gICAgICAgIHBlcm1Nb2QxMltpXSA9IHBlcm1baV0gJSAxMjtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgICAgdmFyIHMgPSAoeCArIHkpICogMC41ICogKE1hdGguc3FydCgzLjApIC0gMS4wKTsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRFxuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaikgKiBHMjtcbiAgICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgICAgdmFyIGkxID0geDAgPiB5MCA/IDEgOiAwO1xuICAgICAgICB2YXIgajEgPSB4MCA+IHkwID8gMCA6IDE7XG4gICAgICAgIC8vIE9mZnNldHMgZm9yIGNvcm5lcnNcbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEcyO1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzI7XG4gICAgICAgIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAgIHZhciB5MiA9IHkwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAgIHZhciBnMCA9IEdyYWRbcGVybU1vZDEyW2lpICsgcGVybVtqal1dXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMV1dXTtcbiAgICAgICAgdmFyIGcyID0gR3JhZFtwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDFdXV07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTA7XG4gICAgICAgIHZhciBuMCA9IHQwIDwgMCA/IDAuMCA6IE1hdGgucG93KHQwLCA0KSAqIChnMFswXSAqIHgwICsgZzBbMV0gKiB5MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxO1xuICAgICAgICB2YXIgbjEgPSB0MSA8IDAgPyAwLjAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MjtcbiAgICAgICAgdmFyIG4yID0gdDIgPCAwID8gMC4wIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyKTtcbiAgICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsIDFdXG4gICAgICAgIHJldHVybiA3MC4xNDgwNTc3MDY1Mzk1MiAqIChuMCArIG4xICsgbjIpO1xuICAgIH07XG59XG5leHBvcnRzLm1ha2VOb2lzZTJEID0gbWFrZU5vaXNlMkQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTNEID0gdm9pZCAwO1xudmFyIEczID0gMS4wIC8gNi4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzEsIDEsIDBdLFxuICAgIFstMSwgMSwgMF0sXG4gICAgWzEsIC0xLCAwXSxcbiAgICBbLTEsIC0xLCAwXSxcbiAgICBbMSwgMCwgMV0sXG4gICAgWy0xLCAwLCAxXSxcbiAgICBbMSwgMCwgLTFdLFxuICAgIFstMSwgMCwgLTFdLFxuICAgIFswLCAxLCAxXSxcbiAgICBbMCwgLTEsIC0xXSxcbiAgICBbMCwgMSwgLTFdLFxuICAgIFswLCAtMSwgLTFdLFxuXTtcbmZ1bmN0aW9uIG1ha2VOb2lzZTNEKHJhbmRvbSkge1xuICAgIGlmIChyYW5kb20gPT09IHZvaWQgMCkgeyByYW5kb20gPSBNYXRoLnJhbmRvbTsgfVxuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBwW2ldID0gaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgcTtcbiAgICBmb3IgKHZhciBpID0gMjU1OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIG4gPSBNYXRoLmZsb29yKChpICsgMSkgKiByYW5kb20oKSk7XG4gICAgICAgIHEgPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtuXTtcbiAgICAgICAgcFtuXSA9IHE7XG4gICAgfVxuICAgIHZhciBwZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB2YXIgcGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICAgIHBlcm1baV0gPSBwW2kgJiAyNTVdO1xuICAgICAgICBwZXJtTW9kMTJbaV0gPSBwZXJtW2ldICUgMTI7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgeikge1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHggKyB5ICsgeikgLyAzLjA7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHNrZXcgZmFjdG9yIGZvciAzRFxuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaiArIGspICogRzM7XG4gICAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgICAgLy8gRGV0ZXJpbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW5cbiAgICAgICAgdmFyIGkxLCBqMSwgazEgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICAgIDtcbiAgICAgICAgdmFyIGkyLCBqMiwgazIgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgICAgO1xuICAgICAgICBpZiAoeDAgPj0geTApIHtcbiAgICAgICAgICAgIGlmICh5MCA+PSB6MCkge1xuICAgICAgICAgICAgICAgIGkxID0gaTIgPSBqMiA9IDE7XG4gICAgICAgICAgICAgICAgajEgPSBrMSA9IGsyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHgwID49IHowKSB7XG4gICAgICAgICAgICAgICAgaTEgPSBpMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBqMSA9IGsxID0gajIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgazEgPSBpMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGoxID0gajIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHkwIDwgejApIHtcbiAgICAgICAgICAgICAgICBrMSA9IGoyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gajEgPSBpMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh4MCA8IHowKSB7XG4gICAgICAgICAgICAgICAgajEgPSBqMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGsxID0gaTIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgajEgPSBpMiA9IGoyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGsxID0gazIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzM7XG4gICAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHMztcbiAgICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEczO1xuICAgICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzM7XG4gICAgICAgIHZhciB4MyA9IHgwIC0gMS4wICsgMy4wICogRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAgIHZhciB6MyA9IHowIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZm91ciBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBwZXJtW2pqICsgcGVybVtra11dXV07XG4gICAgICAgIHZhciBnMSA9IEdyYWRbcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazFdXV1dO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1Nb2QxMltpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyXV1dXTtcbiAgICAgICAgdmFyIGczID0gR3JhZFtwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMV1dXV07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejA7XG4gICAgICAgIHZhciBuMCA9IHQwIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDAsIDQpICogKGcwWzBdICogeDAgKyBnMFsxXSAqIHkwICsgZzBbMl0gKiB6MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MTtcbiAgICAgICAgdmFyIG4xID0gdDEgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEgKyBnMVsyXSAqIHoxKTtcbiAgICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQyLCA0KSAqIChnMlswXSAqIHgyICsgZzJbMV0gKiB5MiArIGcyWzJdICogejIpO1xuICAgICAgICB2YXIgdDMgPSAwLjUgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejM7XG4gICAgICAgIHZhciBuMyA9IHQzIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDMsIDQpICogKGczWzBdICogeDMgKyBnM1sxXSAqIHkzICsgZzNbMl0gKiB6Myk7XG4gICAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV1cbiAgICAgICAgcmV0dXJuIDk0LjY4NDkzMTUwNjgxOTcyICogKG4wICsgbjEgKyBuMiArIG4zKTtcbiAgICB9O1xufVxuZXhwb3J0cy5tYWtlTm9pc2UzRCA9IG1ha2VOb2lzZTNEO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuICogT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICpcbiAqIFRoaXMgY29kZSB3YXMgcGxhY2VkIGluIHRoZSBwdWJsaWMgZG9tYWluIGJ5IGl0cyBvcmlnaW5hbCBhdXRob3IsXG4gKiBTdGVmYW4gR3VzdGF2c29uLiBZb3UgbWF5IHVzZSBpdCBhcyB5b3Ugc2VlIGZpdCwgYnV0XG4gKiBhdHRyaWJ1dGlvbiBpcyBhcHByZWNpYXRlZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IHZvaWQgMDtcbnZhciBHNCA9ICg1LjAgLSBNYXRoLnNxcnQoNS4wKSkgLyAyMC4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzAsIDEsIDEsIDFdLFxuICAgIFswLCAxLCAxLCAtMV0sXG4gICAgWzAsIDEsIC0xLCAxXSxcbiAgICBbMCwgMSwgLTEsIC0xXSxcbiAgICBbMCwgLTEsIDEsIDFdLFxuICAgIFswLCAtMSwgMSwgLTFdLFxuICAgIFswLCAtMSwgLTEsIDFdLFxuICAgIFswLCAtMSwgLTEsIC0xXSxcbiAgICBbMSwgMCwgMSwgMV0sXG4gICAgWzEsIDAsIDEsIC0xXSxcbiAgICBbMSwgMCwgLTEsIDFdLFxuICAgIFsxLCAwLCAtMSwgLTFdLFxuICAgIFstMSwgMCwgMSwgMV0sXG4gICAgWy0xLCAwLCAxLCAtMV0sXG4gICAgWy0xLCAwLCAtMSwgMV0sXG4gICAgWy0xLCAwLCAtMSwgLTFdLFxuICAgIFsxLCAxLCAwLCAxXSxcbiAgICBbMSwgMSwgMCwgLTFdLFxuICAgIFsxLCAtMSwgMCwgMV0sXG4gICAgWzEsIC0xLCAwLCAtMV0sXG4gICAgWy0xLCAxLCAwLCAxXSxcbiAgICBbLTEsIDEsIDAsIC0xXSxcbiAgICBbLTEsIC0xLCAwLCAxXSxcbiAgICBbLTEsIC0xLCAwLCAtMV0sXG4gICAgWzEsIDEsIDEsIDBdLFxuICAgIFsxLCAxLCAtMSwgMF0sXG4gICAgWzEsIC0xLCAxLCAwXSxcbiAgICBbMSwgLTEsIC0xLCAwXSxcbiAgICBbLTEsIDEsIDEsIDBdLFxuICAgIFstMSwgMSwgLTEsIDBdLFxuICAgIFstMSwgLTEsIDEsIDBdLFxuICAgIFstMSwgLTEsIC0xLCAwXSxcbl07XG5mdW5jdGlvbiBtYWtlTm9pc2U0RChyYW5kb20pIHtcbiAgICBpZiAocmFuZG9tID09PSB2b2lkIDApIHsgcmFuZG9tID0gTWF0aC5yYW5kb207IH1cbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcbiAgICAgICAgcFtpXSA9IGk7XG4gICAgdmFyIG47XG4gICAgdmFyIHE7XG4gICAgZm9yICh2YXIgaSA9IDI1NTsgaSA+IDA7IGktLSkge1xuICAgICAgICBuID0gTWF0aC5mbG9vcigoaSArIDEpICogcmFuZG9tKCkpO1xuICAgICAgICBxID0gcFtpXTtcbiAgICAgICAgcFtpXSA9IHBbbl07XG4gICAgICAgIHBbbl0gPSBxO1xuICAgIH1cbiAgICB2YXIgcGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdmFyIHBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgICBwZXJtW2ldID0gcFtpICYgMjU1XTtcbiAgICAgICAgcGVybU1vZDEyW2ldID0gcGVybVtpXSAlIDEyO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHosIHcpIHtcbiAgICAgICAgLy8gU2tldyB0aGUgKHgseSx6LHcpIHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBjZWxsIG9mIDI0IHNpbXBsaWNlcyB3ZSdyZSBpblxuICAgICAgICB2YXIgcyA9ICh4ICsgeSArIHogKyB3KSAqIChNYXRoLnNxcnQoNS4wKSAtIDEuMCkgLyA0LjA7IC8vIEZhY3RvciBmb3IgNEQgc2tld2luZ1xuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgICB2YXIgbCA9IE1hdGguZmxvb3IodyArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaiArIGsgKyBsKSAqIEc0OyAvLyBGYWN0b3IgZm9yIDREIHVuc2tld2luZ1xuICAgICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseix3KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICAgIHZhciBXMCA9IGwgLSB0O1xuICAgICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkseix3IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgICAgdmFyIHcwID0gdyAtIFcwO1xuICAgICAgICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvIGRldGVybWluZSB0aGVcbiAgICAgICAgLy8gbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLiBTaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlblxuICAgICAgICAvLyBlYWNoIHBvc3NpYmxlIHBhaXIgb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byByYW5rIHRoZSBudW1iZXJzLlxuICAgICAgICB2YXIgcmFua3ggPSAwO1xuICAgICAgICB2YXIgcmFua3kgPSAwO1xuICAgICAgICB2YXIgcmFua3ogPSAwO1xuICAgICAgICB2YXIgcmFua3cgPSAwO1xuICAgICAgICBpZiAoeDAgPiB5MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGlmICh4MCA+IHowKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgaWYgKHgwID4gdzApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICBpZiAoeTAgPiB6MClcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGlmICh5MCA+IHcwKVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3crKztcbiAgICAgICAgaWYgKHowID4gdzApXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICAvLyBzaW1wbGV4W2NdIGlzIGEgNC12ZWN0b3Igd2l0aCB0aGUgbnVtYmVycyAwLCAxLCAyIGFuZCAzIGluIHNvbWUgb3JkZXIuXG4gICAgICAgIC8vIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzIHg8eiwgeTx3IGFuZCB4PHdcbiAgICAgICAgLy8gaW1wb3NzaWJsZS4gT25seSB0aGUgMjQgaW5kaWNlcyB3aGljaCBoYXZlIG5vbi16ZXJvIGVudHJpZXMgbWFrZSBhbnkgc2Vuc2UuXG4gICAgICAgIC8vIFdlIHVzZSBhIHRocmVzaG9sZGluZyB0byBzZXQgdGhlIGNvb3JkaW5hdGVzIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuXG4gICAgICAgIC8vIFJhbmsgMyBkZW5vdGVzIHRoZSBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMSA9IHJhbmt4ID49IDMgPyAxIDogMDtcbiAgICAgICAgdmFyIGoxID0gcmFua3kgPj0gMyA/IDEgOiAwO1xuICAgICAgICB2YXIgazEgPSByYW5reiA+PSAzID8gMSA6IDA7XG4gICAgICAgIHZhciBsMSA9IHJhbmt3ID49IDMgPyAxIDogMDtcbiAgICAgICAgLy8gUmFuayAyIGRlbm90ZXMgdGhlIHNlY29uZCBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMiA9IHJhbmt4ID49IDIgPyAxIDogMDtcbiAgICAgICAgdmFyIGoyID0gcmFua3kgPj0gMiA/IDEgOiAwO1xuICAgICAgICB2YXIgazIgPSByYW5reiA+PSAyID8gMSA6IDA7XG4gICAgICAgIHZhciBsMiA9IHJhbmt3ID49IDIgPyAxIDogMDtcbiAgICAgICAgLy8gUmFuayAxIGRlbm90ZXMgdGhlIHNlY29uZCBzbWFsbGVzdCBjb29yZGluYXRlLlxuICAgICAgICB2YXIgaTMgPSByYW5reCA+PSAxID8gMSA6IDA7XG4gICAgICAgIHZhciBqMyA9IHJhbmt5ID49IDEgPyAxIDogMDtcbiAgICAgICAgdmFyIGszID0gcmFua3ogPj0gMSA/IDEgOiAwO1xuICAgICAgICB2YXIgbDMgPSByYW5rdyA+PSAxID8gMSA6IDA7XG4gICAgICAgIC8vIFRoZSBmaWZ0aCBjb3JuZXIgaGFzIGFsbCBjb29yZGluYXRlIG9mZnNldHMgPSAxLCBzbyBubyBuZWVkIHRvIGNvbXB1dGUgdGhhdC5cbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEc0OyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHkxID0geTAgLSBqMSArIEc0O1xuICAgICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzQ7XG4gICAgICAgIHZhciB3MSA9IHcwIC0gbDEgKyBHNDtcbiAgICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzQ7XG4gICAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHNDtcbiAgICAgICAgdmFyIHcyID0gdzAgLSBsMiArIDIuMCAqIEc0O1xuICAgICAgICB2YXIgeDMgPSB4MCAtIGkzICsgMy4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGZvdXJ0aCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTMgPSB5MCAtIGozICsgMy4wICogRzQ7XG4gICAgICAgIHZhciB6MyA9IHowIC0gazMgKyAzLjAgKiBHNDtcbiAgICAgICAgdmFyIHczID0gdzAgLSBsMyArIDMuMCAqIEc0O1xuICAgICAgICB2YXIgeDQgPSB4MCAtIDEuMCArIDQuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5NCA9IHkwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIHZhciB6NCA9IHowIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIHZhciB3NCA9IHcwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZml2ZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgICAgdmFyIGxsID0gbCAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtW2lpICsgcGVybVtqaiArIHBlcm1ba2sgKyBwZXJtW2xsXV1dXSAlXG4gICAgICAgICAgICAzMl07XG4gICAgICAgIHZhciBnMSA9IEdyYWRbcGVybVtpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxICsgcGVybVtsbCArIGwxXV1dXSAlIDMyXTtcbiAgICAgICAgdmFyIGcyID0gR3JhZFtwZXJtW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazIgKyBwZXJtW2xsICsgbDJdXV1dICUgMzJdO1xuICAgICAgICB2YXIgZzMgPSBHcmFkW3Blcm1baWkgKyBpMyArIHBlcm1bamogKyBqMyArIHBlcm1ba2sgKyBrMyArIHBlcm1bbGwgKyBsM11dXV0gJSAzMl07XG4gICAgICAgIHZhciBnNCA9IEdyYWRbcGVybVtpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxICsgcGVybVtsbCArIDFdXV1dICUgMzJdO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowIC0gdzAgKiB3MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MCwgNCkgKiAoZzBbMF0gKiB4MCArIGcwWzFdICogeTAgKyBnMFsyXSAqIHowICsgZzBbM10gKiB3MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MSAtIHcxICogdzE7XG4gICAgICAgIHZhciBuMSA9IHQxIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDEsIDQpICogKGcxWzBdICogeDEgKyBnMVsxXSAqIHkxICsgZzFbMl0gKiB6MSArIGcxWzNdICogdzEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejIgLSB3MiAqIHcyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQyLCA0KSAqIChnMlswXSAqIHgyICsgZzJbMV0gKiB5MiArIGcyWzJdICogejIgKyBnMlszXSAqIHcyKTtcbiAgICAgICAgdmFyIHQzID0gMC41IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozIC0gdzMgKiB3MztcbiAgICAgICAgdmFyIG4zID0gdDMgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MywgNCkgKiAoZzNbMF0gKiB4MyArIGczWzFdICogeTMgKyBnM1syXSAqIHozICsgZzNbM10gKiB3Myk7XG4gICAgICAgIHZhciB0NCA9IDAuNSAtIHg0ICogeDQgLSB5NCAqIHk0IC0gejQgKiB6NCAtIHc0ICogdzQ7XG4gICAgICAgIHZhciBuNCA9IHQ0IDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDQsIDQpICogKGc0WzBdICogeDQgKyBnNFsxXSAqIHk0ICsgZzRbMl0gKiB6NCArIGc0WzNdICogdzQpO1xuICAgICAgICAvLyBTdW0gdXAgYW5kIHNjYWxlIHRoZSByZXN1bHQgdG8gY292ZXIgdGhlIHJhbmdlIFstMSwxXVxuICAgICAgICByZXR1cm4gNzIuMzc4NTU3NjUxNTM2NjUgKiAobjAgKyBuMSArIG4yICsgbjMgKyBuNCk7XG4gICAgfTtcbn1cbmV4cG9ydHMubWFrZU5vaXNlNEQgPSBtYWtlTm9pc2U0RDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IGV4cG9ydHMubWFrZU5vaXNlM0QgPSBleHBvcnRzLm1ha2VOb2lzZTJEID0gdm9pZCAwO1xudmFyIF8yZF8xID0gcmVxdWlyZShcIi4vMmRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtYWtlTm9pc2UyRFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXzJkXzEubWFrZU5vaXNlMkQ7IH0gfSk7XG52YXIgXzNkXzEgPSByZXF1aXJlKFwiLi8zZFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1ha2VOb2lzZTNEXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfM2RfMS5tYWtlTm9pc2UzRDsgfSB9KTtcbnZhciBfNGRfMSA9IHJlcXVpcmUoXCIuLzRkXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFrZU5vaXNlNERcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF80ZF8xLm1ha2VOb2lzZTREOyB9IH0pO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IENhbnZhcyB9IGZyb20gXCJyYXl0cmFjZXIvY2FudmFzXCI7XG5pbXBvcnQgeyBDb2xvciB9IGZyb20gXCJyYXl0cmFjZXIvY29sb3JcIjtcbmltcG9ydCB7IEludGVyc2VjdGlvbiwgSW50ZXJzZWN0aW9ucyB9IGZyb20gXCJyYXl0cmFjZXIvaW50ZXJzZWN0aW9uXCI7XG5pbXBvcnQgeyBNYXRlcmlhbCB9IGZyb20gXCJyYXl0cmFjZXIvbWF0ZXJpYWxcIjtcbmltcG9ydCB7IE1hdHJpeDR4NCB9IGZyb20gXCJyYXl0cmFjZXIvbWF0cml4XCI7XG5pbXBvcnQgeyBQb2ludExpZ2h0IH0gZnJvbSBcInJheXRyYWNlci9wb2ludExpZ2h0XCI7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gXCJyYXl0cmFjZXIvd29ybGRcIjtcbmltcG9ydCB7IFNwaGVyZSB9IGZyb20gXCJyYXl0cmFjZXIvc3BoZXJlXCI7XG5pbXBvcnQgeyBUdXBsZSB9IGZyb20gXCJyYXl0cmFjZXIvdHVwbGVcIjtcbmltcG9ydCB7IENhbWVyYSB9IGZyb20gXCJyYXl0cmFjZXIvY2FtZXJhXCI7XG5pbXBvcnQgeyBQbGFuZSB9IGZyb20gXCJyYXl0cmFjZXIvcGxhbmVcIjtcbmltcG9ydCB7IEdyYWRpZW50UGF0dGVybiwgUmluZ1BhdHRlcm4sIFN0cmlwZVBhdHRlcm4sIENoZWNrZXIzZFBhdHRlcm4sIENoZWNrZXIzRFBhdHRlcm40U3BoZXJlLCBQZXJsaW5QYXR0ZXJuLCBQYXR0ZXJuIH0gZnJvbSBcInJheXRyYWNlci9wYXR0ZXJuc1wiO1xuaW1wb3J0IHsgRVBTSUxPTiB9IGZyb20gXCJyYXl0cmFjZXIvY29uc3RhbnRzXCI7XG5pbXBvcnQgeyBSZW5kZXJKb2IsIFdlYldvcmtlclF1ZXVlIH0gZnJvbSBcIi4vcmVuZGVyam9iXCI7XG5pbXBvcnQgKiBhcyBzZXJpYWxpemUgZnJvbSBcInJheXRyYWNlci9zZXJpYWxpemluZ1wiXG5cblxudmFyIHdvcmxkPSBuZXcgV29ybGQoKTtcbnZhciBmbG9vciA9IG5ldyBQbGFuZSgwKTtcbmZsb29yLm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoMCk7XG5mbG9vci5tYXRlcmlhbC5wYXR0ZXJuPW5ldyBHcmFkaWVudFBhdHRlcm4obmV3IENvbG9yKDAuMiwwLjQsMC41KSwgbmV3IENvbG9yKDAuMSwwLjksMC43KSk7XG5mbG9vci50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMCwxNSkubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWSgxKSk7XG5cbnZhciBtaWRkbGU9bmV3IFNwaGVyZSgzKTtcbm1pZGRsZS50cmFuc2Zvcm09ICBNYXRyaXg0eDQudHJhbnNsYXRpb24oMCwxLDApLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoMC4xKS5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25aKDAuMikpKTtcbm1pZGRsZS5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKDEpO1xubWlkZGxlLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDEsMC41KTtcbm1pZGRsZS5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbm1pZGRsZS5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5taWRkbGUubWF0ZXJpYWwucGF0dGVybj1uZXcgU3RyaXBlUGF0dGVybihuZXcgQ29sb3IoMC4xLDAuMSwwLjYpLCBuZXcgQ29sb3IoMC4xLDAuNywwLjIpLE1hdHJpeDR4NC50cmFuc2xhdGlvbigxLDAsMCkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMC4yLDAuMiwwLjIpKSk7XG5cbnZhciByaWdodD1uZXcgU3BoZXJlKDQpO1xucmlnaHQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigyLDAuNSwtMC41KS5tdWx0aXBseShNYXRyaXg0eDQuc2NhbGluZygwLjUsMC41LDAuNSkpO1xucmlnaHQubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgyKTtcbnJpZ2h0Lm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDAuNywwLjIpO1xucmlnaHQubWF0ZXJpYWwuZGlmZnVzZT0wLjc7XG5yaWdodC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG5yaWdodC5tYXRlcmlhbC5wYXR0ZXJuPSBuZXcgUGVybGluUGF0dGVybihuZXcgQ29sb3IoMC4xLDAuNywwLjIpLG5ldyBDb2xvcigxLDEsMSksMC4xNSk7XG5cblxudmFyIGxlZnQ9bmV3IFNwaGVyZSg1KTtcbmxlZnQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigtNSwyLDkpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDIsMiwyKSk7XG5sZWZ0Lm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoNCk7XG5sZWZ0Lm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMSwwLjgsMC4xKTtcbmxlZnQubWF0ZXJpYWwuZGlmZnVzZT0wLjc7XG5sZWZ0Lm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcbmxlZnQubWF0ZXJpYWwucGF0dGVybj0gbmV3IENoZWNrZXIzRFBhdHRlcm40U3BoZXJlKCBuZXcgQ29sb3IoMC45LDAuOSwwLjkpLG5ldyBDb2xvcigwLjEsMC4xLDAuMSksIE1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSwyMCk7XG5cblxudmFyIHdhbGw9bmV3IFBsYW5lKDYpO1xud2FsbC50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMCwxNSkubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWSgxKS5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25YKE1hdGguUEkvMikpKTtcbndhbGwubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCg1KTtcbndhbGwubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigxLDEsMSk7XG53YWxsLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xud2FsbC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG53YWxsLm1hdGVyaWFsLnBhdHRlcm49IG5ldyBSaW5nUGF0dGVybihuZXcgQ29sb3IoMCwwLjEsMC43KSwgbmV3IENvbG9yKDEsMSwxKSxNYXRyaXg0eDQuc2NhbGluZygxLDEsMSkpO1xuXG52YXIgd2FsbDI9bmV3IFBsYW5lKDcpO1xud2FsbDIudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDAsMTUpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblkoMS1NYXRoLlBJLzIpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblgoTWF0aC5QSS8yKSkpO1xud2FsbDIubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCg2KTtcbndhbGwyLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMCwwLDAuOCk7XG53YWxsMi5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbndhbGwyLm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcbndhbGwyLm1hdGVyaWFsLnBhdHRlcm49IG5ldyBDaGVja2VyM2RQYXR0ZXJuKG5ldyBDb2xvcigwLDAuMSwwLjcpLCBuZXcgQ29sb3IoMSwxLDEpLE1hdHJpeDR4NC50cmFuc2xhdGlvbigwLEVQU0lMT04sMCkpO1xuXG53b3JsZC5vYmplY3RzPSBbbGVmdCxyaWdodCxtaWRkbGUsZmxvb3Isd2FsbCx3YWxsMl07XG53b3JsZC5saWdodD0gbmV3IFBvaW50TGlnaHQoVHVwbGUucG9pbnQoLTEwLDEwLC0xMCksQ29sb3IuV0hJVEUuY2xvbmUoKSk7XG5cbnZhciBjYW1lcmE9IG5ldyBDYW1lcmEoMTAyNCwxMDI0LE1hdGguUEkvMyxcbiAgICBNYXRyaXg0eDQudmlld1RyYW5zZm9ybShUdXBsZS5wb2ludCgwLDEuNSwtNSksVHVwbGUucG9pbnQoMCwxLDApLFR1cGxlLnZlY3RvcigwLDEsMCkpXG4gICAgKTtcblxuXG5cbmNvbnNvbGUudGltZShcInJlbmRlclwiKVxuXG52YXIgciA9IG5ldyBSZW5kZXJKb2IoNCxcbiAgICA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYXl0cmFjZXJDYW52YXNcIiksXG4gICAgXCJjaGFwdGVyMTByZW5kZXJXb3JrZXItYnVuZGxlLmpzXCJcbiAgICApO1xuXG5yLnN0YXJ0KHdvcmxkLGNhbWVyYSk7XG5cbnIub25SZW5kZXJpbmdGaW5pc2hlZD1cbiAgICAoKT0+XG4gICAge1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoXCJyZW5kZXJcIilcbiAgICB9O1xuXG5cbi8qXG52YXIgcmF5dHJhY2VyQ2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmF5dHJhY2VyQ2FudmFzXCIpO1xucmF5dHJhY2VyQ2FudmFzLndpZHRoPWNhbWVyYS5oc2l6ZTtcbnJheXRyYWNlckNhbnZhcy5oZWlnaHQ9Y2FtZXJhLnZzaXplO1xudmFyIHJlbmRlckRhdGEgPSBjYW1lcmEucmVuZGVyUGFydGlhbCh3b3JsZCk7XG52YXIgaW1hZ2VEYXRhID0gbmV3IEltYWdlRGF0YShyZW5kZXJEYXRhLCBjYW1lcmEuaHNpemUsIGNhbWVyYS52c2l6ZSk7XG52YXIgY3R4ID0gcmF5dHJhY2VyQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbmN0eC5wdXRJbWFnZURhdGEoaW1hZ2VEYXRhLCAwLCAwKTtcblxuXG5jb25zb2xlLnRpbWVFbmQoXCJyZW5kZXJcIilcbiovXG5cblxuXG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=