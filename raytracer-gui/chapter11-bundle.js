/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/fast-simplex-noise/lib/2d.js":
/*!****************************************************!*\
  !*** ../node_modules/fast-simplex-noise/lib/2d.js ***!
  \****************************************************/
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

/***/ "../node_modules/fast-simplex-noise/lib/3d.js":
/*!****************************************************!*\
  !*** ../node_modules/fast-simplex-noise/lib/3d.js ***!
  \****************************************************/
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

/***/ "../node_modules/fast-simplex-noise/lib/4d.js":
/*!****************************************************!*\
  !*** ../node_modules/fast-simplex-noise/lib/4d.js ***!
  \****************************************************/
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

/***/ "../node_modules/fast-simplex-noise/lib/mod.js":
/*!*****************************************************!*\
  !*** ../node_modules/fast-simplex-noise/lib/mod.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeNoise4D = exports.makeNoise3D = exports.makeNoise2D = void 0;
var _2d_1 = __webpack_require__(/*! ./2d */ "../node_modules/fast-simplex-noise/lib/2d.js");
Object.defineProperty(exports, "makeNoise2D", ({ enumerable: true, get: function () { return _2d_1.makeNoise2D; } }));
var _3d_1 = __webpack_require__(/*! ./3d */ "../node_modules/fast-simplex-noise/lib/3d.js");
Object.defineProperty(exports, "makeNoise3D", ({ enumerable: true, get: function () { return _3d_1.makeNoise3D; } }));
var _4d_1 = __webpack_require__(/*! ./4d */ "../node_modules/fast-simplex-noise/lib/4d.js");
Object.defineProperty(exports, "makeNoise4D", ({ enumerable: true, get: function () { return _4d_1.makeNoise4D; } }));


/***/ }),

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
    start(world, camera, workerScale = 1) {
        var serializedWorld = (0, serializing_1.serializeWorld)(world);
        var serializedCamera = (0, serializing_1.serializeCamera)(camera);
        var batchSize = Math.floor(camera.vsize / this.numberOfWorkers / workerScale);
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
    static prepare(hit, ray, intersections = null) {
        var comps = new Computations();
        comps.t = hit.t;
        comps.object = hit.object;
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
        var surfaceOffset = comps.normalv.multiply(constants_1.EPSILON);
        comps.overPoint = comps.point.add(surfaceOffset);
        comps.underPoint = comps.point.substract(surfaceOffset);
        comps.reflectv = ray.direction.reflect(comps.normalv);
        if (intersections == null) { //dont compute n1 and n2
            comps.n1 = 1;
            comps.n2 = 1;
        }
        else {
            Computations.tempSet.clear();
            for (var c = 0; c < intersections.length; c++) {
                var i = intersections.get(c);
                if (i == hit) {
                    if (Computations.tempSet.size == 0) {
                        comps.n1 = 1;
                        comps.n2 = i.object.material.refractiveIndex;
                    }
                    else {
                        var last = null;
                        var secondLast = null;
                        for (var o of Computations.tempSet) {
                            secondLast = last;
                            last = o;
                        }
                        comps.n1 = last.material.refractiveIndex;
                        if (!Computations.tempSet.has(i.object)) {
                            comps.n2 = i.object.material.refractiveIndex;
                        }
                        else {
                            if (last == i.object) {
                                comps.n2 = secondLast == null ? 1 : secondLast.material.refractiveIndex;
                            }
                            else {
                                comps.n2 = last.material.refractiveIndex;
                            }
                        }
                        break;
                    }
                }
                if (!Computations.tempSet.delete(i.object)) {
                    Computations.tempSet.add(i.object);
                }
            }
        }
        return comps;
    }
    schlick() {
        var cos = this.eyev.dot(this.normalv);
        if (this.n1 > this.n2) {
            var n = this.n1 / this.n2;
            var sin2t = n * n * (1 - cos * cos);
            if (sin2t > 1)
                return 1;
            var cosT = Math.sqrt(1 - sin2t);
            cos = cosT;
        }
        var temp = ((this.n1 - this.n2) / (this.n1 + this.n2));
        var r0 = temp * temp;
        return r0 + (1 - r0) * Math.pow((1 - cos), 5);
    }
}
exports.Computations = Computations;
Computations.tempSet = new Set();
//# sourceMappingURL=computations.js.map

/***/ }),

/***/ "../raytracer/dist/constants.js":
/*!**************************************!*\
  !*** ../raytracer/dist/constants.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EPSILON = void 0;
exports.EPSILON = 0.0001;
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
    /**
     * Get hit in a sorted intersections list
    */
    firstHit() {
        for (var i = 0; i < this._length; i++) {
            var item = this.items[i];
            if (item.t > 0)
                return item;
        }
        return null;
    }
    sort() {
        (0, sort_1.mergeSortInplace)(this.items, Intersections.sortIntersection, 0, this._length);
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
        this.reflective = 0;
        this.transparency = 0;
        this.refractiveIndex = 1;
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
    serialize() {
        var arr = new Array(this.height);
        for (var y = 0; y < this.height; y++) {
            var c = new Array(this.width);
            arr[y] = c;
            for (var x = 0; x < this.width; x++) {
                c[x] = this.get(y, x);
            }
        }
        return arr;
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
exports.CompositePattern = exports.PerlinPattern = exports.Checker3DPattern4Sphere = exports.Checker3dPattern = exports.RingPattern = exports.GradientPattern = exports.StripePattern = exports.Pattern = void 0;
const matrix_1 = __webpack_require__(/*! ./matrix */ "../raytracer/dist/matrix.js");
const fast_simplex_noise_1 = __webpack_require__(/*! fast-simplex-noise */ "../node_modules/fast-simplex-noise/lib/mod.js");
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
        this.noise3d = (0, fast_simplex_noise_1.makeNoise3D)(() => this.seed);
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
class CompositePattern extends Pattern {
    constructor(pattern1, pattern2) {
        super(matrix_1.Matrix4x4.IDENTITY_MATRIX.clone());
        this.pattern1 = pattern1;
        this.pattern2 = pattern2;
    }
    patternAtShape(object, worldPoint) {
        var objectPoint = object.inverseTransform.multiply(worldPoint);
        var patternPoint = this.inverseTransform.multiply(objectPoint);
        return this.pattern1.patternAtShape(object, worldPoint).add(this.pattern2.patternAtShape(object, worldPoint)).multiply(0.5);
    }
    patternAt(point) {
        return null;
    }
    toObject() {
        return { type: this.constructor.name, pattern1: this.pattern1.toObject(), pattern2: this.pattern2.toObject() };
    }
}
exports.CompositePattern = CompositePattern;
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
    m.reflective = deserializeNumber(obj.reflective);
    m.transparency = deserializeNumber(obj.transparency);
    m.refractiveIndex = deserializeNumber(obj.refractiveIndex);
    return m;
}
exports.deSerializeMaterial = deSerializeMaterial;
function deSerializePattern(obj) {
    if (obj == null)
        return null;
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
        case patterns_1.CompositePattern.name:
            var p7 = new patterns_1.CompositePattern(deSerializePattern(obj.pattern1), deSerializePattern(obj.pattern2));
            return p7;
    }
    throw new Error();
}
exports.deSerializePattern = deSerializePattern;
function deserializeMatrix4x4(obj) {
    if (obj == null)
        return matrix_1.Matrix4x4.IDENTITY_MATRIX.clone();
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
    return pattern == null ? null : pattern.toObject();
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
    if (right <= middle)
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
    refractedColor(comps, remaining) {
        if (remaining == 0 || comps.object.material.transparency == 0)
            return color_1.Color.BLACK.clone();
        var nRatio = comps.n1 / comps.n2;
        var cosI = comps.eyev.dot(comps.normalv);
        var sin2t = nRatio * nRatio * (1 - cosI * cosI);
        if (sin2t > 1)
            return color_1.Color.BLACK.clone();
        var cosT = Math.sqrt(1 - sin2t);
        var direction = comps.normalv.multiply(nRatio * cosI - cosT).substract(comps.eyev.multiply(nRatio));
        var refractRay = new ray_1.Ray(comps.underPoint, direction);
        var color = this.colorAt(refractRay, remaining - 1).multiply(comps.object.material.transparency);
        return color;
    }
    shadeHit(comps, remaining = 0) {
        var surface = comps.object.material.lighting(this.light, comps.object, comps.point, comps.eyev, comps.normalv, this.isShadowed(comps.overPoint));
        var reflected = this.reflectedColor(comps, remaining);
        var refracted = this.refractedColor(comps, remaining);
        var material = comps.object.material;
        if (material.reflective > 0 && material.transparency > 0) {
            var reflectance = comps.schlick();
            return surface.add(reflected.multiply(reflectance)).add(refracted.multiply(1 - reflectance));
        }
        return surface.add(reflected).add(refracted);
    }
    colorAt(ray, remaining = 4) {
        World.tempIntersections.clear();
        this.intersect(ray, World.tempIntersections);
        World.tempIntersections.sort();
        var i = World.tempIntersections.firstHit();
        if (i == null)
            return color_1.Color.BLACK.clone();
        var comp = computations_1.Computations.prepare(i, ray, World.tempIntersections);
        return this.shadeHit(comp, remaining);
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
    reflectedColor(comps, remaining) {
        if (remaining == 0 || comps.object.material.reflective == 0)
            return new color_1.Color(0, 0, 0);
        var reflectRay = new ray_1.Ray(comps.overPoint, comps.reflectv);
        var color = this.colorAt(reflectRay, remaining - 1);
        return color.multiply(comps.object.material.reflective);
    }
}
exports.World = World;
World.tempIntersections = new intersection_1.Intersections(100);
//# sourceMappingURL=world.js.map

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
  !*** ./src/chapter11.ts ***!
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
floor.material.pattern = new patterns_1.CompositePattern(new patterns_1.GradientPattern(new color_1.Color(0.2, 0.4, 0.5), new color_1.Color(0.1, 0.9, 0.7)), new patterns_1.GradientPattern(new color_1.Color(0.2, 0.4, 0.5), new color_1.Color(0.1, 0.9, 0.7), matrix_1.Matrix4x4.rotationY(Math.PI / 2)));
floor.transform = matrix_1.Matrix4x4.translation(0, 0, 0);
floor.material.reflective = 0.2;
var sphere1 = new sphere_1.Sphere(4);
sphere1.transform = matrix_1.Matrix4x4.translation(2, 1.5, -7.5).multiply(matrix_1.Matrix4x4.scaling(1.5, 1.5, 1.5));
sphere1.material = new material_1.Material(2);
sphere1.material.color = new color_1.Color(0.1, 0.7, 0.2);
sphere1.material.diffuse = 0.7;
sphere1.material.specular = 0.3;
sphere1.material.pattern = new patterns_1.PerlinPattern(new color_1.Color(0.1, 0.7, 0.2), new color_1.Color(1, 1, 1), 0.15);
sphere1.material.transparency = 0;
sphere1.material.reflective = 0.5;
var sphere2 = new sphere_1.Sphere(5);
sphere2.transform = matrix_1.Matrix4x4.translation(-5, 4, -9).multiply(matrix_1.Matrix4x4.scaling(4, 4, 4));
sphere2.material = new material_1.Material(4);
sphere2.material.color = new color_1.Color(1, 0.8, 0.1);
sphere2.material.reflective = 0.5;
var sphere3 = new sphere_1.Sphere(3);
sphere3.transform = matrix_1.Matrix4x4.translation(4, 3, 5).multiply(matrix_1.Matrix4x4.scaling(3, 3, 3));
sphere3.material = new material_1.Material(1);
sphere3.material.color = new color_1.Color(0, 0, 0.2);
sphere3.material.specular = 0.9;
sphere3.material.diffuse = 0.4;
sphere3.material.transparency = 0.9;
sphere3.material.ambient = 0;
sphere3.material.shininess = 300;
//sphere3.material.refractiveIndex=0;
sphere3.material.reflective = 0.9;
var wall = new plane_1.Plane(6);
wall.transform = matrix_1.Matrix4x4.translation(0, 0, 15).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2));
wall.material = new material_1.Material(5);
wall.material.color = new color_1.Color(1, 1, 1);
wall.material.diffuse = 0.7;
wall.material.specular = 0.3;
wall.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
var wall2 = new plane_1.Plane(7);
wall2.transform = matrix_1.Matrix4x4.translation(0, 0, -15).multiply(matrix_1.Matrix4x4.rotationX(Math.PI / 2));
wall2.material = new material_1.Material(6);
wall2.material.color = new color_1.Color(0, 0, 0.8);
wall2.material.diffuse = 0.7;
wall2.material.specular = 0.3;
wall2.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
var wall3 = new plane_1.Plane(6);
wall3.transform = matrix_1.Matrix4x4.translation(15, 0, 0).multiply(matrix_1.Matrix4x4.rotationZ(Math.PI / 2));
wall3.material = new material_1.Material(8);
wall3.material.color = new color_1.Color(1, 1, 1);
wall3.material.diffuse = 0.7;
wall3.material.specular = 0.3;
wall3.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
var wall4 = new plane_1.Plane(7);
wall4.transform = matrix_1.Matrix4x4.translation(-15, 0, 0).multiply(matrix_1.Matrix4x4.rotationZ(Math.PI / 2));
wall4.material = new material_1.Material(9);
wall4.material.color = new color_1.Color(0, 0, 0.8);
wall4.material.diffuse = 0.7;
wall4.material.specular = 0.3;
wall4.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
var ceiling = new plane_1.Plane(7);
ceiling.transform = matrix_1.Matrix4x4.translation(0, 15, 0);
ceiling.material = new material_1.Material(10);
ceiling.material.color = new color_1.Color(0, 0, 0.8);
ceiling.material.diffuse = 0.7;
ceiling.material.specular = 0.3;
ceiling.material.pattern = new patterns_1.Checker3dPattern(new color_1.Color(0, 0.1, 0.7), new color_1.Color(1, 1, 1), matrix_1.Matrix4x4.translation(0, constants_1.EPSILON, 0));
world.objects = [sphere2, sphere1, sphere3, floor, wall, wall2, wall3, wall4, ceiling];
world.light = new pointLight_1.PointLight(tuple_1.Tuple.point(0, 10, 0), color_1.Color.WHITE.clone());
var camera = new camera_1.Camera(1024, 1024, Math.PI / 3, matrix_1.Matrix4x4.viewTransform(tuple_1.Tuple.point(10, 5, 7), tuple_1.Tuple.point(0, 1, 0), tuple_1.Tuple.vector(0, 1, 0)));
var raytracerCanvas = document.getElementById("raytracerCanvas");
raytracerCanvas.width = camera.hsize;
raytracerCanvas.height = camera.vsize;
console.time("render");
var r = new renderjob_1.RenderJob(navigator.hardwareConcurrency, raytracerCanvas, "chapter11renderWorker-bundle.js");
r.start(world, camera);
r.onRenderingFinished =
    () => {
        console.timeEnd("render");
    };
/*

var renderData = camera.renderPartial(world);
var imageData = new ImageData(renderData, camera.hsize, camera.vsize);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);
console.timeEnd("render")
*/

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LENBQUMsQ0FBQztBQUMzQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBQyxHQUFHLENBQUM7QUFDOUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUMsR0FBRyxDQUFDO0FBQzdCLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFDLEdBQUcsQ0FBQztBQUNsQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxDQUFDLENBQUM7QUFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUMsR0FBRyxDQUFDO0FBQy9CLHFDQUFxQztBQUNyQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRSxHQUFHLENBQUM7QUFHakMsSUFBSSxJQUFJLEdBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBQyxrQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEYsSUFBSSxDQUFDLFFBQVEsR0FBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBQyxHQUFHLENBQUM7QUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUMsR0FBRyxDQUFDO0FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFFLElBQUksMkJBQWdCLENBQUMsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLGtCQUFTLENB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azovL3JheXRyYWNlci1ndWkvLi4vbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvMmQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8zZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL25vZGVfbW9kdWxlcy9mYXN0LXNpbXBsZXgtbm9pc2UvbGliLzRkLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvbW9kLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi9zcmMvcmVuZGVyam9iLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY2FtZXJhLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY2FudmFzLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29sbGVjdGlvbi5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L2NvbG9yLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29tcHV0YXRpb25zLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29uc3RhbnRzLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvaW50ZXJzZWN0aW9uLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvbWF0ZXJpYWwuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9tYXRyaXguanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3BsYW5lLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcG9pbnRMaWdodC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3JheS5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3NlcmlhbGl6aW5nLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc29ydC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3NwaGVyZS5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3R1cGxlLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvd29ybGQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4vc3JjL2NoYXB0ZXIxMS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTJEID0gdm9pZCAwO1xudmFyIEcyID0gKDMuMCAtIE1hdGguc3FydCgzLjApKSAvIDYuMDtcbnZhciBHcmFkID0gW1xuICAgIFsxLCAxXSxcbiAgICBbLTEsIDFdLFxuICAgIFsxLCAtMV0sXG4gICAgWy0xLCAtMV0sXG4gICAgWzEsIDBdLFxuICAgIFstMSwgMF0sXG4gICAgWzEsIDBdLFxuICAgIFstMSwgMF0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAtMV0sXG4gICAgWzAsIDFdLFxuICAgIFswLCAtMV0sXG5dO1xuZnVuY3Rpb24gbWFrZU5vaXNlMkQocmFuZG9tKSB7XG4gICAgaWYgKHJhbmRvbSA9PT0gdm9pZCAwKSB7IHJhbmRvbSA9IE1hdGgucmFuZG9tOyB9XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgIHBbaV0gPSBpO1xuICAgIHZhciBuO1xuICAgIHZhciBxO1xuICAgIGZvciAodmFyIGkgPSAyNTU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoKGkgKyAxKSAqIHJhbmRvbSgpKTtcbiAgICAgICAgcSA9IHBbaV07XG4gICAgICAgIHBbaV0gPSBwW25dO1xuICAgICAgICBwW25dID0gcTtcbiAgICB9XG4gICAgdmFyIHBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHZhciBwZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgICAgcGVybVtpXSA9IHBbaSAmIDI1NV07XG4gICAgICAgIHBlcm1Nb2QxMltpXSA9IHBlcm1baV0gJSAxMjtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW5cbiAgICAgICAgdmFyIHMgPSAoeCArIHkpICogMC41ICogKE1hdGguc3FydCgzLjApIC0gMS4wKTsgLy8gSGFpcnkgZmFjdG9yIGZvciAyRFxuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaikgKiBHMjtcbiAgICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBzaW1wbGV4IHdlIGFyZSBpbi5cbiAgICAgICAgdmFyIGkxID0geDAgPiB5MCA/IDEgOiAwO1xuICAgICAgICB2YXIgajEgPSB4MCA+IHkwID8gMCA6IDE7XG4gICAgICAgIC8vIE9mZnNldHMgZm9yIGNvcm5lcnNcbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEcyO1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzI7XG4gICAgICAgIHZhciB4MiA9IHgwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAgIHZhciB5MiA9IHkwIC0gMS4wICsgMi4wICogRzI7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgdGhyZWUgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAgIHZhciBnMCA9IEdyYWRbcGVybU1vZDEyW2lpICsgcGVybVtqal1dXTtcbiAgICAgICAgdmFyIGcxID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBpMSArIHBlcm1bamogKyBqMV1dXTtcbiAgICAgICAgdmFyIGcyID0gR3JhZFtwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDFdXV07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTA7XG4gICAgICAgIHZhciBuMCA9IHQwIDwgMCA/IDAuMCA6IE1hdGgucG93KHQwLCA0KSAqIChnMFswXSAqIHgwICsgZzBbMV0gKiB5MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxO1xuICAgICAgICB2YXIgbjEgPSB0MSA8IDAgPyAwLjAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MjtcbiAgICAgICAgdmFyIG4yID0gdDIgPCAwID8gMC4wIDogTWF0aC5wb3codDIsIDQpICogKGcyWzBdICogeDIgKyBnMlsxXSAqIHkyKTtcbiAgICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsIDFdXG4gICAgICAgIHJldHVybiA3MC4xNDgwNTc3MDY1Mzk1MiAqIChuMCArIG4xICsgbjIpO1xuICAgIH07XG59XG5leHBvcnRzLm1ha2VOb2lzZTJEID0gbWFrZU5vaXNlMkQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBCYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG4gKiBPcHRpbWlzYXRpb25zIGJ5IFBldGVyIEVhc3RtYW4gKHBlYXN0bWFuQGRyaXp6bGUuc3RhbmZvcmQuZWR1KS5cbiAqIEJldHRlciByYW5rIG9yZGVyaW5nIG1ldGhvZCBieSBTdGVmYW4gR3VzdGF2c29uIGluIDIwMTIuXG4gKlxuICogVGhpcyBjb2RlIHdhcyBwbGFjZWQgaW4gdGhlIHB1YmxpYyBkb21haW4gYnkgaXRzIG9yaWdpbmFsIGF1dGhvcixcbiAqIFN0ZWZhbiBHdXN0YXZzb24uIFlvdSBtYXkgdXNlIGl0IGFzIHlvdSBzZWUgZml0LCBidXRcbiAqIGF0dHJpYnV0aW9uIGlzIGFwcHJlY2lhdGVkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1ha2VOb2lzZTNEID0gdm9pZCAwO1xudmFyIEczID0gMS4wIC8gNi4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzEsIDEsIDBdLFxuICAgIFstMSwgMSwgMF0sXG4gICAgWzEsIC0xLCAwXSxcbiAgICBbLTEsIC0xLCAwXSxcbiAgICBbMSwgMCwgMV0sXG4gICAgWy0xLCAwLCAxXSxcbiAgICBbMSwgMCwgLTFdLFxuICAgIFstMSwgMCwgLTFdLFxuICAgIFswLCAxLCAxXSxcbiAgICBbMCwgLTEsIC0xXSxcbiAgICBbMCwgMSwgLTFdLFxuICAgIFswLCAtMSwgLTFdLFxuXTtcbmZ1bmN0aW9uIG1ha2VOb2lzZTNEKHJhbmRvbSkge1xuICAgIGlmIChyYW5kb20gPT09IHZvaWQgMCkgeyByYW5kb20gPSBNYXRoLnJhbmRvbTsgfVxuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBwW2ldID0gaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgcTtcbiAgICBmb3IgKHZhciBpID0gMjU1OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIG4gPSBNYXRoLmZsb29yKChpICsgMSkgKiByYW5kb20oKSk7XG4gICAgICAgIHEgPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtuXTtcbiAgICAgICAgcFtuXSA9IHE7XG4gICAgfVxuICAgIHZhciBwZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB2YXIgcGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICAgIHBlcm1baV0gPSBwW2kgJiAyNTVdO1xuICAgICAgICBwZXJtTW9kMTJbaV0gPSBwZXJtW2ldICUgMTI7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSwgeikge1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHggKyB5ICsgeikgLyAzLjA7IC8vIFZlcnkgbmljZSBhbmQgc2ltcGxlIHNrZXcgZmFjdG9yIGZvciAzRFxuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaiArIGspICogRzM7XG4gICAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSx6KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgICAgLy8gRGV0ZXJpbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW5cbiAgICAgICAgdmFyIGkxLCBqMSwgazEgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICAgIDtcbiAgICAgICAgdmFyIGkyLCBqMiwgazIgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHNcbiAgICAgICAgO1xuICAgICAgICBpZiAoeDAgPj0geTApIHtcbiAgICAgICAgICAgIGlmICh5MCA+PSB6MCkge1xuICAgICAgICAgICAgICAgIGkxID0gaTIgPSBqMiA9IDE7XG4gICAgICAgICAgICAgICAgajEgPSBrMSA9IGsyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHgwID49IHowKSB7XG4gICAgICAgICAgICAgICAgaTEgPSBpMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBqMSA9IGsxID0gajIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgazEgPSBpMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGoxID0gajIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHkwIDwgejApIHtcbiAgICAgICAgICAgICAgICBrMSA9IGoyID0gazIgPSAxO1xuICAgICAgICAgICAgICAgIGkxID0gajEgPSBpMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh4MCA8IHowKSB7XG4gICAgICAgICAgICAgICAgajEgPSBqMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGsxID0gaTIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgajEgPSBpMiA9IGoyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGsxID0gazIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICB2YXIgeTEgPSB5MCAtIGoxICsgRzM7XG4gICAgICAgIHZhciB6MSA9IHowIC0gazEgKyBHMztcbiAgICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEczO1xuICAgICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzM7XG4gICAgICAgIHZhciB4MyA9IHgwIC0gMS4wICsgMy4wICogRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIHZhciB5MyA9IHkwIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAgIHZhciB6MyA9IHowIC0gMS4wICsgMy4wICogRzM7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZm91ciBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBwZXJtW2pqICsgcGVybVtra11dXV07XG4gICAgICAgIHZhciBnMSA9IEdyYWRbcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazFdXV1dO1xuICAgICAgICB2YXIgZzIgPSBHcmFkW3Blcm1Nb2QxMltpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyXV1dXTtcbiAgICAgICAgdmFyIGczID0gR3JhZFtwZXJtTW9kMTJbaWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMV1dXV07XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgICB2YXIgdDAgPSAwLjUgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejA7XG4gICAgICAgIHZhciBuMCA9IHQwIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDAsIDQpICogKGcwWzBdICogeDAgKyBnMFsxXSAqIHkwICsgZzBbMl0gKiB6MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MTtcbiAgICAgICAgdmFyIG4xID0gdDEgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MSwgNCkgKiAoZzFbMF0gKiB4MSArIGcxWzFdICogeTEgKyBnMVsyXSAqIHoxKTtcbiAgICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQyLCA0KSAqIChnMlswXSAqIHgyICsgZzJbMV0gKiB5MiArIGcyWzJdICogejIpO1xuICAgICAgICB2YXIgdDMgPSAwLjUgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejM7XG4gICAgICAgIHZhciBuMyA9IHQzIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDMsIDQpICogKGczWzBdICogeDMgKyBnM1sxXSAqIHkzICsgZzNbMl0gKiB6Myk7XG4gICAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV1cbiAgICAgICAgcmV0dXJuIDk0LjY4NDkzMTUwNjgxOTcyICogKG4wICsgbjEgKyBuMiArIG4zKTtcbiAgICB9O1xufVxuZXhwb3J0cy5tYWtlTm9pc2UzRCA9IG1ha2VOb2lzZTNEO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuICogT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICpcbiAqIFRoaXMgY29kZSB3YXMgcGxhY2VkIGluIHRoZSBwdWJsaWMgZG9tYWluIGJ5IGl0cyBvcmlnaW5hbCBhdXRob3IsXG4gKiBTdGVmYW4gR3VzdGF2c29uLiBZb3UgbWF5IHVzZSBpdCBhcyB5b3Ugc2VlIGZpdCwgYnV0XG4gKiBhdHRyaWJ1dGlvbiBpcyBhcHByZWNpYXRlZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IHZvaWQgMDtcbnZhciBHNCA9ICg1LjAgLSBNYXRoLnNxcnQoNS4wKSkgLyAyMC4wO1xudmFyIEdyYWQgPSBbXG4gICAgWzAsIDEsIDEsIDFdLFxuICAgIFswLCAxLCAxLCAtMV0sXG4gICAgWzAsIDEsIC0xLCAxXSxcbiAgICBbMCwgMSwgLTEsIC0xXSxcbiAgICBbMCwgLTEsIDEsIDFdLFxuICAgIFswLCAtMSwgMSwgLTFdLFxuICAgIFswLCAtMSwgLTEsIDFdLFxuICAgIFswLCAtMSwgLTEsIC0xXSxcbiAgICBbMSwgMCwgMSwgMV0sXG4gICAgWzEsIDAsIDEsIC0xXSxcbiAgICBbMSwgMCwgLTEsIDFdLFxuICAgIFsxLCAwLCAtMSwgLTFdLFxuICAgIFstMSwgMCwgMSwgMV0sXG4gICAgWy0xLCAwLCAxLCAtMV0sXG4gICAgWy0xLCAwLCAtMSwgMV0sXG4gICAgWy0xLCAwLCAtMSwgLTFdLFxuICAgIFsxLCAxLCAwLCAxXSxcbiAgICBbMSwgMSwgMCwgLTFdLFxuICAgIFsxLCAtMSwgMCwgMV0sXG4gICAgWzEsIC0xLCAwLCAtMV0sXG4gICAgWy0xLCAxLCAwLCAxXSxcbiAgICBbLTEsIDEsIDAsIC0xXSxcbiAgICBbLTEsIC0xLCAwLCAxXSxcbiAgICBbLTEsIC0xLCAwLCAtMV0sXG4gICAgWzEsIDEsIDEsIDBdLFxuICAgIFsxLCAxLCAtMSwgMF0sXG4gICAgWzEsIC0xLCAxLCAwXSxcbiAgICBbMSwgLTEsIC0xLCAwXSxcbiAgICBbLTEsIDEsIDEsIDBdLFxuICAgIFstMSwgMSwgLTEsIDBdLFxuICAgIFstMSwgLTEsIDEsIDBdLFxuICAgIFstMSwgLTEsIC0xLCAwXSxcbl07XG5mdW5jdGlvbiBtYWtlTm9pc2U0RChyYW5kb20pIHtcbiAgICBpZiAocmFuZG9tID09PSB2b2lkIDApIHsgcmFuZG9tID0gTWF0aC5yYW5kb207IH1cbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcbiAgICAgICAgcFtpXSA9IGk7XG4gICAgdmFyIG47XG4gICAgdmFyIHE7XG4gICAgZm9yICh2YXIgaSA9IDI1NTsgaSA+IDA7IGktLSkge1xuICAgICAgICBuID0gTWF0aC5mbG9vcigoaSArIDEpICogcmFuZG9tKCkpO1xuICAgICAgICBxID0gcFtpXTtcbiAgICAgICAgcFtpXSA9IHBbbl07XG4gICAgICAgIHBbbl0gPSBxO1xuICAgIH1cbiAgICB2YXIgcGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdmFyIHBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgICBwZXJtW2ldID0gcFtpICYgMjU1XTtcbiAgICAgICAgcGVybU1vZDEyW2ldID0gcGVybVtpXSAlIDEyO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHosIHcpIHtcbiAgICAgICAgLy8gU2tldyB0aGUgKHgseSx6LHcpIHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBjZWxsIG9mIDI0IHNpbXBsaWNlcyB3ZSdyZSBpblxuICAgICAgICB2YXIgcyA9ICh4ICsgeSArIHogKyB3KSAqIChNYXRoLnNxcnQoNS4wKSAtIDEuMCkgLyA0LjA7IC8vIEZhY3RvciBmb3IgNEQgc2tld2luZ1xuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xuICAgICAgICB2YXIgaiA9IE1hdGguZmxvb3IoeSArIHMpO1xuICAgICAgICB2YXIgayA9IE1hdGguZmxvb3IoeiArIHMpO1xuICAgICAgICB2YXIgbCA9IE1hdGguZmxvb3IodyArIHMpO1xuICAgICAgICB2YXIgdCA9IChpICsgaiArIGsgKyBsKSAqIEc0OyAvLyBGYWN0b3IgZm9yIDREIHVuc2tld2luZ1xuICAgICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseix3KSBzcGFjZVxuICAgICAgICB2YXIgWTAgPSBqIC0gdDtcbiAgICAgICAgdmFyIFowID0gayAtIHQ7XG4gICAgICAgIHZhciBXMCA9IGwgLSB0O1xuICAgICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkseix3IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxuICAgICAgICB2YXIgeTAgPSB5IC0gWTA7XG4gICAgICAgIHZhciB6MCA9IHogLSBaMDtcbiAgICAgICAgdmFyIHcwID0gdyAtIFcwO1xuICAgICAgICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvIGRldGVybWluZSB0aGVcbiAgICAgICAgLy8gbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLiBTaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlblxuICAgICAgICAvLyBlYWNoIHBvc3NpYmxlIHBhaXIgb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byByYW5rIHRoZSBudW1iZXJzLlxuICAgICAgICB2YXIgcmFua3ggPSAwO1xuICAgICAgICB2YXIgcmFua3kgPSAwO1xuICAgICAgICB2YXIgcmFua3ogPSAwO1xuICAgICAgICB2YXIgcmFua3cgPSAwO1xuICAgICAgICBpZiAoeDAgPiB5MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGlmICh4MCA+IHowKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgaWYgKHgwID4gdzApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICBpZiAoeTAgPiB6MClcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGlmICh5MCA+IHcwKVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3crKztcbiAgICAgICAgaWYgKHowID4gdzApXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICAvLyBzaW1wbGV4W2NdIGlzIGEgNC12ZWN0b3Igd2l0aCB0aGUgbnVtYmVycyAwLCAxLCAyIGFuZCAzIGluIHNvbWUgb3JkZXIuXG4gICAgICAgIC8vIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzIHg8eiwgeTx3IGFuZCB4PHdcbiAgICAgICAgLy8gaW1wb3NzaWJsZS4gT25seSB0aGUgMjQgaW5kaWNlcyB3aGljaCBoYXZlIG5vbi16ZXJvIGVudHJpZXMgbWFrZSBhbnkgc2Vuc2UuXG4gICAgICAgIC8vIFdlIHVzZSBhIHRocmVzaG9sZGluZyB0byBzZXQgdGhlIGNvb3JkaW5hdGVzIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuXG4gICAgICAgIC8vIFJhbmsgMyBkZW5vdGVzIHRoZSBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMSA9IHJhbmt4ID49IDMgPyAxIDogMDtcbiAgICAgICAgdmFyIGoxID0gcmFua3kgPj0gMyA/IDEgOiAwO1xuICAgICAgICB2YXIgazEgPSByYW5reiA+PSAzID8gMSA6IDA7XG4gICAgICAgIHZhciBsMSA9IHJhbmt3ID49IDMgPyAxIDogMDtcbiAgICAgICAgLy8gUmFuayAyIGRlbm90ZXMgdGhlIHNlY29uZCBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIHZhciBpMiA9IHJhbmt4ID49IDIgPyAxIDogMDtcbiAgICAgICAgdmFyIGoyID0gcmFua3kgPj0gMiA/IDEgOiAwO1xuICAgICAgICB2YXIgazIgPSByYW5reiA+PSAyID8gMSA6IDA7XG4gICAgICAgIHZhciBsMiA9IHJhbmt3ID49IDIgPyAxIDogMDtcbiAgICAgICAgLy8gUmFuayAxIGRlbm90ZXMgdGhlIHNlY29uZCBzbWFsbGVzdCBjb29yZGluYXRlLlxuICAgICAgICB2YXIgaTMgPSByYW5reCA+PSAxID8gMSA6IDA7XG4gICAgICAgIHZhciBqMyA9IHJhbmt5ID49IDEgPyAxIDogMDtcbiAgICAgICAgdmFyIGszID0gcmFua3ogPj0gMSA/IDEgOiAwO1xuICAgICAgICB2YXIgbDMgPSByYW5rdyA+PSAxID8gMSA6IDA7XG4gICAgICAgIC8vIFRoZSBmaWZ0aCBjb3JuZXIgaGFzIGFsbCBjb29yZGluYXRlIG9mZnNldHMgPSAxLCBzbyBubyBuZWVkIHRvIGNvbXB1dGUgdGhhdC5cbiAgICAgICAgdmFyIHgxID0geDAgLSBpMSArIEc0OyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHkxID0geTAgLSBqMSArIEc0O1xuICAgICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzQ7XG4gICAgICAgIHZhciB3MSA9IHcwIC0gbDEgKyBHNDtcbiAgICAgICAgdmFyIHgyID0geDAgLSBpMiArIDIuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTIgPSB5MCAtIGoyICsgMi4wICogRzQ7XG4gICAgICAgIHZhciB6MiA9IHowIC0gazIgKyAyLjAgKiBHNDtcbiAgICAgICAgdmFyIHcyID0gdzAgLSBsMiArIDIuMCAqIEc0O1xuICAgICAgICB2YXIgeDMgPSB4MCAtIGkzICsgMy4wICogRzQ7IC8vIE9mZnNldHMgZm9yIGZvdXJ0aCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTMgPSB5MCAtIGozICsgMy4wICogRzQ7XG4gICAgICAgIHZhciB6MyA9IHowIC0gazMgKyAzLjAgKiBHNDtcbiAgICAgICAgdmFyIHczID0gdzAgLSBsMyArIDMuMCAqIEc0O1xuICAgICAgICB2YXIgeDQgPSB4MCAtIDEuMCArIDQuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5NCA9IHkwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIHZhciB6NCA9IHowIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIHZhciB3NCA9IHcwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIC8vIFdvcmsgb3V0IHRoZSBoYXNoZWQgZ3JhZGllbnQgaW5kaWNlcyBvZiB0aGUgZml2ZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgdmFyIGlpID0gaSAmIDI1NTtcbiAgICAgICAgdmFyIGpqID0gaiAmIDI1NTtcbiAgICAgICAgdmFyIGtrID0gayAmIDI1NTtcbiAgICAgICAgdmFyIGxsID0gbCAmIDI1NTtcbiAgICAgICAgdmFyIGcwID0gR3JhZFtwZXJtW2lpICsgcGVybVtqaiArIHBlcm1ba2sgKyBwZXJtW2xsXV1dXSAlXG4gICAgICAgICAgICAzMl07XG4gICAgICAgIHZhciBnMSA9IEdyYWRbcGVybVtpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxICsgcGVybVtsbCArIGwxXV1dXSAlIDMyXTtcbiAgICAgICAgdmFyIGcyID0gR3JhZFtwZXJtW2lpICsgaTIgKyBwZXJtW2pqICsgajIgKyBwZXJtW2trICsgazIgKyBwZXJtW2xsICsgbDJdXV1dICUgMzJdO1xuICAgICAgICB2YXIgZzMgPSBHcmFkW3Blcm1baWkgKyBpMyArIHBlcm1bamogKyBqMyArIHBlcm1ba2sgKyBrMyArIHBlcm1bbGwgKyBsM11dXV0gJSAzMl07XG4gICAgICAgIHZhciBnNCA9IEdyYWRbcGVybVtpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxICsgcGVybVtsbCArIDFdXV1dICUgMzJdO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmaXZlIGNvcm5lcnNcbiAgICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowIC0gdzAgKiB3MDtcbiAgICAgICAgdmFyIG4wID0gdDAgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MCwgNCkgKiAoZzBbMF0gKiB4MCArIGcwWzFdICogeTAgKyBnMFsyXSAqIHowICsgZzBbM10gKiB3MCk7XG4gICAgICAgIHZhciB0MSA9IDAuNSAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MSAtIHcxICogdzE7XG4gICAgICAgIHZhciBuMSA9IHQxIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDEsIDQpICogKGcxWzBdICogeDEgKyBnMVsxXSAqIHkxICsgZzFbMl0gKiB6MSArIGcxWzNdICogdzEpO1xuICAgICAgICB2YXIgdDIgPSAwLjUgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejIgLSB3MiAqIHcyO1xuICAgICAgICB2YXIgbjIgPSB0MiA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQyLCA0KSAqIChnMlswXSAqIHgyICsgZzJbMV0gKiB5MiArIGcyWzJdICogejIgKyBnMlszXSAqIHcyKTtcbiAgICAgICAgdmFyIHQzID0gMC41IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozIC0gdzMgKiB3MztcbiAgICAgICAgdmFyIG4zID0gdDMgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MywgNCkgKiAoZzNbMF0gKiB4MyArIGczWzFdICogeTMgKyBnM1syXSAqIHozICsgZzNbM10gKiB3Myk7XG4gICAgICAgIHZhciB0NCA9IDAuNSAtIHg0ICogeDQgLSB5NCAqIHk0IC0gejQgKiB6NCAtIHc0ICogdzQ7XG4gICAgICAgIHZhciBuNCA9IHQ0IDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDQsIDQpICogKGc0WzBdICogeDQgKyBnNFsxXSAqIHk0ICsgZzRbMl0gKiB6NCArIGc0WzNdICogdzQpO1xuICAgICAgICAvLyBTdW0gdXAgYW5kIHNjYWxlIHRoZSByZXN1bHQgdG8gY292ZXIgdGhlIHJhbmdlIFstMSwxXVxuICAgICAgICByZXR1cm4gNzIuMzc4NTU3NjUxNTM2NjUgKiAobjAgKyBuMSArIG4yICsgbjMgKyBuNCk7XG4gICAgfTtcbn1cbmV4cG9ydHMubWFrZU5vaXNlNEQgPSBtYWtlTm9pc2U0RDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2U0RCA9IGV4cG9ydHMubWFrZU5vaXNlM0QgPSBleHBvcnRzLm1ha2VOb2lzZTJEID0gdm9pZCAwO1xudmFyIF8yZF8xID0gcmVxdWlyZShcIi4vMmRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtYWtlTm9pc2UyRFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXzJkXzEubWFrZU5vaXNlMkQ7IH0gfSk7XG52YXIgXzNkXzEgPSByZXF1aXJlKFwiLi8zZFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1ha2VOb2lzZTNEXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfM2RfMS5tYWtlTm9pc2UzRDsgfSB9KTtcbnZhciBfNGRfMSA9IHJlcXVpcmUoXCIuLzRkXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFrZU5vaXNlNERcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF80ZF8xLm1ha2VOb2lzZTREOyB9IH0pO1xuIiwiaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSBcInJheXRyYWNlci9jYW1lcmFcIjtcbmltcG9ydCB7IHNlcmlhbGl6ZUNhbWVyYSwgc2VyaWFsaXplV29ybGQgfSBmcm9tIFwicmF5dHJhY2VyL3NlcmlhbGl6aW5nXCI7XG5pbXBvcnQgeyBXb3JsZCB9IGZyb20gXCJyYXl0cmFjZXIvd29ybGRcIjtcbmV4cG9ydCBjbGFzcyBSZW5kZXJKb2JcbntcbiAgICBwcml2YXRlICBxdWV1ZTogV2ViV29ya2VyUXVldWU8UmVuZGVyRGF0YT47XG4gICAgb25SZW5kZXJpbmdGaW5pc2hlZCA6KCk9PnZvaWQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIG51bWJlck9mV29ya2VyczpudW1iZXIsY2FudmFzOkhUTUxDYW52YXNFbGVtZW50LCBzdHJpbmdVcmw6c3RyaW5nKVxuICAgIHtcbiAgICAgIHRoaXMucXVldWU9IG5ldyBXZWJXb3JrZXJRdWV1ZTxhbnk+KHN0cmluZ1VybCxudW1iZXJPZldvcmtlcnMpO1xuICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICB0aGlzLnF1ZXVlLm9uVGFza0RvbmUgPSh0YXNrLHJlbmRlckRhdGEpPT57XG5cbiAgICAgICAgIHZhciBpbWFnZURhdGEgPSBuZXcgSW1hZ2VEYXRhKG5ldyBVaW50OENsYW1wZWRBcnJheShyZW5kZXJEYXRhKSwgdGFzay50by54LXRhc2suZnJvbS54LCB0YXNrLnRvLnktdGFzay5mcm9tLnkpOyAgICAgICAgXG4gICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgdGFzay5mcm9tLngsIHRhc2suZnJvbS55KTtcbiAgICAgICAgIGlmICh0aGlzLnF1ZXVlLmNvdW50PT0wICYmIHRoaXMub25SZW5kZXJpbmdGaW5pc2hlZClcbiAgICAgICAgIHtcbiAgICAgICAgICAgdGhpcy5vblJlbmRlcmluZ0ZpbmlzaGVkKCk7XG4gICAgICAgICB9XG4gICAgICB9O1xuICAgICBcbiAgICB9XG5cbiAgICBzdGFydCh3b3JsZDpXb3JsZCxjYW1lcmE6Q2FtZXJhLHdvcmtlclNjYWxlOm51bWJlciA9MSlcbiAgICB7ICBcbiAgICAgIHZhciBzZXJpYWxpemVkV29ybGQ9c2VyaWFsaXplV29ybGQod29ybGQpO1xuICAgICAgdmFyIHNlcmlhbGl6ZWRDYW1lcmE9c2VyaWFsaXplQ2FtZXJhKGNhbWVyYSk7XG4gICAgICB2YXIgYmF0Y2hTaXplPU1hdGguZmxvb3IoY2FtZXJhLnZzaXplL3RoaXMubnVtYmVyT2ZXb3JrZXJzL3dvcmtlclNjYWxlKTtcbiAgICAgIHZhciB5PTA7XG4gICAgICB2YXIgZG9uZT1mYWxzZTtcbiAgICAgIGRvXG4gICAgICB7ICAgICAgICAgICAgICBcbiAgICAgICAgIHZhciB5bmV4dD15K2JhdGNoU2l6ZTsgXG4gICAgICAgICBpZiAoeW5leHQ+PWNhbWVyYS52c2l6ZSlcbiAgICAgICAgIHtcbiAgICAgICAgICAgZG9uZSA9dHJ1ZTtcbiAgICAgICAgICAgeW5leHQ9Y2FtZXJhLnZzaXplO1xuICAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YT1cbiAgICAgICAgICB7d29ybGQ6c2VyaWFsaXplZFdvcmxkLFxuICAgICAgICAgY2FtZXJhOnNlcmlhbGl6ZWRDYW1lcmEsXG4gICAgICAgICBmcm9tOiB7eDowLHk6eX0sXG4gICAgICAgICB0bzoge3g6Y2FtZXJhLmhzaXplICx5OiB5bmV4dH1cbiAgICAgICAgIH07IFxuICAgICAgICAgdGhpcy5xdWV1ZS5hZGQoZGF0YSk7XG4gICAgICAgICB5PXluZXh0IDtcbiAgICAgIH13aGlsZSghZG9uZSlcbiAgIH1cblxuXG4gICBcbn1cblxuXG5cbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJRdWV1ZTxUPlxueyAgICBcbiAgcHJpdmF0ZSB3b3JrZXJzOldvcmtlcltdPVtdO1xuICBwcml2YXRlIHN0YXR1czpNYXA8V29ya2VyLFQ+PSBuZXcgTWFwPFdvcmtlcixUPigpXG4gIHByaXZhdGUgcXVldWU6VFtdPVtdO1xuICBcbiAgcHVibGljIG9uVGFza0RvbmU6KHRhc2s6VCxyZXN1bHQ6YW55KT0+dm9pZDtcbiAgcHVibGljIG9uVGFza0Vycm9yOih0YXNrOlQsZXY6RXJyb3JFdmVudCk9PnZvaWQ7XG5cbiAgY29uc3RydWN0b3Ioc3RyaW5nVXJsOnN0cmluZyxudW1iZXJPZldvcmtlcnM6bnVtYmVyID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgKVxuICB7ICAgXG4gICBmb3IgKHZhciBpPTA7aTxudW1iZXJPZldvcmtlcnM7aSsrKVxuICAge1xuICAgICAgbGV0IHdvcmtlciA9IG5ldyBXb3JrZXIoc3RyaW5nVXJsKTtcbiAgICAgIHRoaXMud29ya2Vycy5wdXNoKHdvcmtlcik7XG4gICAgICBcbiAgICAgIHdvcmtlci5vbm1lc3NhZ2U9KGV2Ok1lc3NhZ2VFdmVudDxhbnk+KT0+XG4gICAgICB7ICAgICAgICBcbiAgICAgICAgIHZhciB0YXNrPXRoaXMuc3RhdHVzLmdldCh3b3JrZXIpO1xuICAgICAgICAgdGhpcy5yZUFzc2lnbldvcmtlcih3b3JrZXIpOyAgICAgIFxuICAgICAgICAgdGhpcy50YXNrRG9uZSh0YXNrLGV2LmRhdGEpOyAgICAgICAgIFxuICAgICAgfVxuICAgICAgd29ya2VyLm9uZXJyb3I9KGV2OkVycm9yRXZlbnQpPT5cbiAgICAgIHsgICAgICAgIFxuICAgICAgICAgdmFyIHRhc2s9dGhpcy5zdGF0dXMuZ2V0KHdvcmtlcik7XG4gICAgICAgICB0aGlzLnJlQXNzaWduV29ya2VyKHdvcmtlcik7ICAgIFxuICAgICAgICAgdGhpcy50YXNrRXJyb3IodGFzayxldik7XG4gICAgICB9XG5cblxuICAgfSAgICAgXG4gIH1cbiBcbiAgcHJpdmF0ZSByZUFzc2lnbldvcmtlcih3b3JrZXI6V29ya2VyKTpib29sZWFuXG4gIHsgICAgICBcbiAgICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA+MClcbiAgICAgIHtcbiAgICAgICAgIHZhciBuZXh0VGFzaz0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgdGhpcy5zdGF0dXMuc2V0KHdvcmtlcixuZXh0VGFzayk7XG4gICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2UobmV4dFRhc2spO1xuICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2VcbiAgICAgIHtcbiAgICAgICAgIHRoaXMuc3RhdHVzLmRlbGV0ZSh3b3JrZXIpO1xuICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICB9XG4gIHByaXZhdGUgdGFza0RvbmUodGFzazpULHJlc3VsdDphbnkpXG4gIHtcbiAgICAgaWYgKHRoaXMub25UYXNrRG9uZSkgdGhpcy5vblRhc2tEb25lKHRhc2sscmVzdWx0KTtcbiAgfVxuICBwcml2YXRlIHRhc2tFcnJvcih0YXNrOlQsZXY6RXJyb3JFdmVudClcbiAge1xuICAgICBpZiAodGhpcy5vblRhc2tFcnJvcikgdGhpcy5vblRhc2tFcnJvcih0YXNrLGV2KTtcbiAgfVxuXG4gIGFkZCh0YXNrOlQpXG4gIHtcbiAgIHZhciB1bmJ1c3lXb3JrZXI9dGhpcy53b3JrZXJzLmZpbmQoKHcpPT4hdGhpcy5zdGF0dXMuaGFzKHcpKTtcbiAgIGlmICh1bmJ1c3lXb3JrZXIhPT11bmRlZmluZWQpXG4gICB7XG4gICAgICB1bmJ1c3lXb3JrZXIucG9zdE1lc3NhZ2UodGFzayk7XG4gICAgICB0aGlzLnN0YXR1cy5zZXQodW5idXN5V29ya2VyLHRhc2spO1xuICAgfSBlbHNlXG4gICB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2godGFzayk7XG4gICB9XG4gIH0gXG4gIHN0b3AoKVxuICB7XG4gICAgIGZvciAodmFyIHcgb2YgdGhpcy53b3JrZXJzKVxuICAgICB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIFxuICAgICB9XG4gICAgIHRoaXMucXVldWUubGVuZ3RoPTA7XG4gICAgIHRoaXMuc3RhdHVzLmNsZWFyKCk7XG4gIH1cbiAgZ2V0IGNvdW50KCk6bnVtYmVyXG4gIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGgrdGhpcy5zdGF0dXMuc2l6ZTtcbiAgfVxuXG59XG5cblxuXG5leHBvcnQgdHlwZSBSZW5kZXJEYXRhPVxue1xuICB3b3JsZDpXb3JsZCxcbiAgY2FtZXJhOkNhbWVyYSxcbiAgZnJvbTp7XG4gICAgIHg6bnVtYmVyLFxuICAgICB5Om51bWJlclxuICB9LFxuICB0bzp7XG4gICB4Om51bWJlcixcbiAgIHk6bnVtYmVyXG59XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DYW1lcmEgPSB2b2lkIDA7XG5jb25zdCBjYW52YXNfMSA9IHJlcXVpcmUoXCIuL2NhbnZhc1wiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgcmF5XzEgPSByZXF1aXJlKFwiLi9yYXlcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jbGFzcyBDYW1lcmEge1xuICAgIGNvbnN0cnVjdG9yKGhzaXplLCB2c2l6ZSwgZmllbGRPZlZpZXcsIHRyYW5zZm9ybSkge1xuICAgICAgICB0aGlzLmhzaXplID0gaHNpemU7XG4gICAgICAgIHRoaXMudnNpemUgPSB2c2l6ZTtcbiAgICAgICAgdGhpcy5maWVsZE9mVmlldyA9IGZpZWxkT2ZWaWV3O1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgZ2V0IGhhbGZXaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhbGZXaWR0aDtcbiAgICB9XG4gICAgZ2V0IGhhbGZoZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gICAgfVxuICAgIGdldCBwaXhlbFNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9waXhlbFNpemU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogcmVjYWxjdWxhdGUgZGVyaXZlZCB2YWx1ZXNcbiAgICAgKi9cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHZhciBoYWxmVmlldyA9IE1hdGgudGFuKHRoaXMuZmllbGRPZlZpZXcgLyAyKTtcbiAgICAgICAgdmFyIGFzcGVjdCA9IHRoaXMuaHNpemUgLyB0aGlzLnZzaXplO1xuICAgICAgICBpZiAoYXNwZWN0ID49IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbGZXaWR0aCA9IGhhbGZWaWV3O1xuICAgICAgICAgICAgdGhpcy5faGFsZkhlaWdodCA9IGhhbGZWaWV3IC8gYXNwZWN0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faGFsZldpZHRoID0gaGFsZlZpZXcgKiBhc3BlY3Q7XG4gICAgICAgICAgICB0aGlzLl9oYWxmSGVpZ2h0ID0gaGFsZlZpZXc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGl4ZWxTaXplID0gKHRoaXMuX2hhbGZXaWR0aCAqIDIpIC8gdGhpcy5oc2l6ZTtcbiAgICB9XG4gICAgcmF5Rm9yUGl4ZWwoeCwgeSkge1xuICAgICAgICB2YXIgeE9mZnNldCA9ICh4ICsgMC41KSAqIHRoaXMuX3BpeGVsU2l6ZTtcbiAgICAgICAgdmFyIHlPZmZzZXQgPSAoeSArIDAuNSkgKiB0aGlzLl9waXhlbFNpemU7XG4gICAgICAgIHZhciB3b3JsZFggPSB0aGlzLl9oYWxmV2lkdGggLSB4T2Zmc2V0O1xuICAgICAgICB2YXIgd29ybGRZID0gdGhpcy5faGFsZkhlaWdodCAtIHlPZmZzZXQ7XG4gICAgICAgIHZhciBwaXhlbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh0dXBsZV8xLlR1cGxlLnBvaW50KHdvcmxkWCwgd29ybGRZLCAtMSkpO1xuICAgICAgICB2YXIgb3JpZ2luID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCkpO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gcGl4ZWwuc3Vic3RyYWN0KG9yaWdpbikubm9ybWFsaXplKCk7XG4gICAgICAgIHJldHVybiBuZXcgcmF5XzEuUmF5KG9yaWdpbiwgZGlyZWN0aW9uKTtcbiAgICB9XG4gICAgcmVuZGVyUGFydGlhbCh3b3JsZCwgZnJvbSA9IHsgeDogMCwgeTogMCB9LCB0byA9IHsgeDogdGhpcy5oc2l6ZSwgeTogdGhpcy52c2l6ZSB9KSB7XG4gICAgICAgIHZhciB0b3AgPSBmcm9tLnk7XG4gICAgICAgIHZhciBsZWZ0ID0gZnJvbS54O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gdG8ueSAtIHRvcDtcbiAgICAgICAgdmFyIHdpZHRoID0gdG8ueCAtIGxlZnQ7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh3aWR0aCAqIGhlaWdodCAqIDQpO1xuICAgICAgICB2YXIgcGl4ZWxJbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciByYXkgPSB0aGlzLnJheUZvclBpeGVsKGxlZnQgKyB4LCB0b3AgKyB5KTtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSB3b3JsZC5jb2xvckF0KHJheSk7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLnJlZCAqIDI1NTtcbiAgICAgICAgICAgICAgICBpbWFnZVtwaXhlbEluZGV4KytdID0gY29sb3IuZ3JlZW4gKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLmJsdWUgKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IDI1NTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW1hZ2U7XG4gICAgfVxuICAgIHJlbmRlcih3b3JsZCkge1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgY2FudmFzXzEuQ2FudmFzKHRoaXMuaHNpemUsIHRoaXMudnNpemUpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMudnNpemU7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLmhzaXplOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmF5ID0gdGhpcy5yYXlGb3JQaXhlbCh4LCB5KTtcbiAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSB3b3JsZC5jb2xvckF0KHJheSk7XG4gICAgICAgICAgICAgICAgaW1hZ2Uud3JpdGVQaXhlbCh4LCB5LCBjb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgaHNpemU6IHRoaXMuaHNpemUsIHZzaXplOiB0aGlzLnZzaXplLCBmaWVsZE9mVmlldzogdGhpcy5maWVsZE9mVmlldywgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNhbWVyYSA9IENhbWVyYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbWVyYS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FudmFzID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgQ2FudmFzIHtcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkod2lkdGggKiBoZWlnaHQgKiAzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFBpeGVsKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5IDwgMCB8fCB5ID49IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdmFyIHBpeGVsSW5kZXggPSBNYXRoLmZsb29yKHkpICogdGhpcy53aWR0aCAqIDMgKyBNYXRoLmZsb29yKHgpICogMztcbiAgICAgICAgcmV0dXJuIG5ldyBjb2xvcl8xLkNvbG9yKHRoaXMuZGF0YVtwaXhlbEluZGV4XSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAxXSwgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSk7XG4gICAgfVxuICAgIHdyaXRlUGl4ZWwoeCwgeSwgYykge1xuICAgICAgICBpZiAoeCA8IDAgfHwgeCA+PSB0aGlzLndpZHRoIHx8IHkgPCAwIHx8IHkgPj0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHZhciBwaXhlbEluZGV4ID0gTWF0aC5mbG9vcih5KSAqIHRoaXMud2lkdGggKiAzICsgTWF0aC5mbG9vcih4KSAqIDM7XG4gICAgICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4XSA9IGMucmVkO1xuICAgICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleCArIDFdID0gYy5ncmVlbjtcbiAgICAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAyXSA9IGMuYmx1ZTtcbiAgICB9XG4gICAgdG9QcG0oKSB7XG4gICAgICAgIHZhciBwcG0gPSBcIlAzXFxuXCI7XG4gICAgICAgIHBwbSArPSB0aGlzLndpZHRoICsgXCIgXCIgKyB0aGlzLmhlaWdodCArIFwiXFxuXCI7XG4gICAgICAgIHBwbSArPSBcIjI1NVwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcHBtICs9IChpICUgMTUgPT0gMCkgPyBcIlxcblwiIDogXCIgXCI7XG4gICAgICAgICAgICBwcG0gKz0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaV0gKiAyNTUpLCAyNTUpLCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2kgKyAxXSAqIDI1NSksIDI1NSksIDApLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICArIFwiIFwiICsgTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5yb3VuZCh0aGlzLmRhdGFbaSArIDJdICogMjU1KSwgMjU1KSwgMCkudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBwcG0gKz0gXCJcXG5cIjtcbiAgICAgICAgcmV0dXJuIHBwbTtcbiAgICB9XG4gICAgdG9VaW50OENsYW1wZWRBcnJheSgpIHtcbiAgICAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiA0KTtcbiAgICAgICAgdmFyIGFyckluZGV4ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGFyclthcnJJbmRleF0gPSB0aGlzLmRhdGFbaV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAxXSA9IHRoaXMuZGF0YVtpICsgMV0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAyXSA9IHRoaXMuZGF0YVtpICsgMl0gKiAyNTU7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXggKyAzXSA9IDI1NTtcbiAgICAgICAgICAgIGFyckluZGV4ICs9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG59XG5leHBvcnRzLkNhbnZhcyA9IENhbnZhcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNhbnZhcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuT2JqZWN0UG9vbCA9IHZvaWQgMDtcbi8qKlxuICogT2JqZWN0IHBvb2wgdGhhdCB3aWxsIG1pbmltaXplIGdhcmJhZ2UgY29sbGVjdGlvbiB1c2FnZVxuICovXG5jbGFzcyBPYmplY3RQb29sIHtcbiAgICBjb25zdHJ1Y3RvcihhcnJheUxlbmd0aCA9IDApIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IG5ldyBBcnJheShhcnJheUxlbmd0aCk7XG4gICAgICAgIHRoaXMuaW5kZXhNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSB0aGlzLmNyZWF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobmV3SXRlbSwgaSk7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldID0gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpbmRleE9mKGl0ZW0pIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLmluZGV4TWFwLmdldChpdGVtKTtcbiAgICAgICAgcmV0dXJuIChpID09PSB1bmRlZmluZWQgfHwgaSA+PSB0aGlzLl9sZW5ndGgpID8gLTEgOiBpO1xuICAgIH1cbiAgICByZW1vdmUoYSkge1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuaW5kZXhNYXAuZ2V0KGEpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLl9sZW5ndGgtLTtcbiAgICAgICAgdmFyIHJlbW92ZUl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgdmFyIGxhc3RJdGVtID0gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdO1xuICAgICAgICB0aGlzLml0ZW1zW2luZGV4XSA9IGxhc3RJdGVtO1xuICAgICAgICB0aGlzLml0ZW1zW3RoaXMuX2xlbmd0aF0gPSByZW1vdmVJdGVtO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChyZW1vdmVJdGVtLCB0aGlzLl9sZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwLnNldChsYXN0SXRlbSwgaW5kZXgpO1xuICAgIH1cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiB1bnVzZWQgaXRlbSBvciBjcmVhdGVzIGEgbmV3IG9uZSwgaWYgbm8gdW51c2VkIGl0ZW0gYXZhaWxhYmxlXG4gICAgKi9cbiAgICBhZGQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PSB0aGlzLl9sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sIHRoaXMuX2xlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLl9sZW5ndGggPSB0aGlzLml0ZW1zLnB1c2gobmV3SXRlbSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGgrK107XG4gICAgfVxuICAgIGdldChpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPj0gdGhpcy5fbGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cbn1cbmV4cG9ydHMuT2JqZWN0UG9vbCA9IE9iamVjdFBvb2w7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb2xsZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db2xvciA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29sb3Ige1xuICAgIGNvbnN0cnVjdG9yKHJlZCwgZ3JlZW4sIGJsdWUpIHtcbiAgICAgICAgdGhpcy5yZWQgPSByZWQ7XG4gICAgICAgIHRoaXMuZ3JlZW4gPSBncmVlbjtcbiAgICAgICAgdGhpcy5ibHVlID0gYmx1ZTtcbiAgICB9XG4gICAgYWRkKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKyBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKyBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICsgY29sb3IuYmx1ZSk7XG4gICAgfVxuICAgIG11bHRpcGx5KHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICogc2NhbGFyLCB0aGlzLmdyZWVuICogc2NhbGFyLCB0aGlzLmJsdWUgKiBzY2FsYXIpO1xuICAgIH1cbiAgICBkaXZpZGUoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgLyBzY2FsYXIsIHRoaXMuZ3JlZW4gLyBzY2FsYXIsIHRoaXMuYmx1ZSAvIHNjYWxhcik7XG4gICAgfVxuICAgIHN1YnN0cmFjdChjb2xvcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkIC0gY29sb3IucmVkLCB0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4sIHRoaXMuYmx1ZSAtIGNvbG9yLmJsdWUpO1xuICAgIH1cbiAgICBoYWRhbWFyZFByb2R1Y3QoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAqIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAqIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgKiBjb2xvci5ibHVlKTtcbiAgICB9XG4gICAgZXF1YWxzKGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyh0aGlzLnJlZCAtIGNvbG9yLnJlZCkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLmdyZWVuIC0gY29sb3IuZ3JlZW4pIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ibHVlIC0gY29sb3IuYmx1ZSkgPCBjb25zdGFudHNfMS5FUFNJTE9OO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCwgdGhpcy5ncmVlbiwgdGhpcy5ibHVlKTtcbiAgICB9XG59XG5leHBvcnRzLkNvbG9yID0gQ29sb3I7XG5Db2xvci5CTEFDSyA9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDAsIDAsIDApKTtcbkNvbG9yLldISVRFID0gT2JqZWN0LmZyZWV6ZShuZXcgQ29sb3IoMSwgMSwgMSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sb3IuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbXB1dGF0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgQ29tcHV0YXRpb25zIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgc3RhdGljIHByZXBhcmUoaGl0LCByYXksIGludGVyc2VjdGlvbnMgPSBudWxsKSB7XG4gICAgICAgIHZhciBjb21wcyA9IG5ldyBDb21wdXRhdGlvbnMoKTtcbiAgICAgICAgY29tcHMudCA9IGhpdC50O1xuICAgICAgICBjb21wcy5vYmplY3QgPSBoaXQub2JqZWN0O1xuICAgICAgICBjb21wcy5wb2ludCA9IHJheS5wb3NpdGlvbihjb21wcy50KTtcbiAgICAgICAgY29tcHMuZXlldiA9IHJheS5kaXJlY3Rpb24ubmVnYXRlKCk7XG4gICAgICAgIGNvbXBzLm5vcm1hbHYgPSBjb21wcy5vYmplY3Qubm9ybWFsQXQoY29tcHMucG9pbnQpO1xuICAgICAgICBpZiAoY29tcHMubm9ybWFsdi5kb3QoY29tcHMuZXlldikgPCAwKSB7XG4gICAgICAgICAgICBjb21wcy5pbnNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgY29tcHMubm9ybWFsdiA9IGNvbXBzLm5vcm1hbHYubmVnYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb21wcy5pbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3VyZmFjZU9mZnNldCA9IGNvbXBzLm5vcm1hbHYubXVsdGlwbHkoY29uc3RhbnRzXzEuRVBTSUxPTik7XG4gICAgICAgIGNvbXBzLm92ZXJQb2ludCA9IGNvbXBzLnBvaW50LmFkZChzdXJmYWNlT2Zmc2V0KTtcbiAgICAgICAgY29tcHMudW5kZXJQb2ludCA9IGNvbXBzLnBvaW50LnN1YnN0cmFjdChzdXJmYWNlT2Zmc2V0KTtcbiAgICAgICAgY29tcHMucmVmbGVjdHYgPSByYXkuZGlyZWN0aW9uLnJlZmxlY3QoY29tcHMubm9ybWFsdik7XG4gICAgICAgIGlmIChpbnRlcnNlY3Rpb25zID09IG51bGwpIHsgLy9kb250IGNvbXB1dGUgbjEgYW5kIG4yXG4gICAgICAgICAgICBjb21wcy5uMSA9IDE7XG4gICAgICAgICAgICBjb21wcy5uMiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBDb21wdXRhdGlvbnMudGVtcFNldC5jbGVhcigpO1xuICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBpbnRlcnNlY3Rpb25zLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSBpbnRlcnNlY3Rpb25zLmdldChjKTtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PSBoaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKENvbXB1dGF0aW9ucy50ZW1wU2V0LnNpemUgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMubjEgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMubjIgPSBpLm9iamVjdC5tYXRlcmlhbC5yZWZyYWN0aXZlSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kTGFzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBvIG9mIENvbXB1dGF0aW9ucy50ZW1wU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kTGFzdCA9IGxhc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG87XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wcy5uMSA9IGxhc3QubWF0ZXJpYWwucmVmcmFjdGl2ZUluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFDb21wdXRhdGlvbnMudGVtcFNldC5oYXMoaS5vYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMubjIgPSBpLm9iamVjdC5tYXRlcmlhbC5yZWZyYWN0aXZlSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdCA9PSBpLm9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcy5uMiA9IHNlY29uZExhc3QgPT0gbnVsbCA/IDEgOiBzZWNvbmRMYXN0Lm1hdGVyaWFsLnJlZnJhY3RpdmVJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLm4yID0gbGFzdC5tYXRlcmlhbC5yZWZyYWN0aXZlSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFDb21wdXRhdGlvbnMudGVtcFNldC5kZWxldGUoaS5vYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIENvbXB1dGF0aW9ucy50ZW1wU2V0LmFkZChpLm9iamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wcztcbiAgICB9XG4gICAgc2NobGljaygpIHtcbiAgICAgICAgdmFyIGNvcyA9IHRoaXMuZXlldi5kb3QodGhpcy5ub3JtYWx2KTtcbiAgICAgICAgaWYgKHRoaXMubjEgPiB0aGlzLm4yKSB7XG4gICAgICAgICAgICB2YXIgbiA9IHRoaXMubjEgLyB0aGlzLm4yO1xuICAgICAgICAgICAgdmFyIHNpbjJ0ID0gbiAqIG4gKiAoMSAtIGNvcyAqIGNvcyk7XG4gICAgICAgICAgICBpZiAoc2luMnQgPiAxKVxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgdmFyIGNvc1QgPSBNYXRoLnNxcnQoMSAtIHNpbjJ0KTtcbiAgICAgICAgICAgIGNvcyA9IGNvc1Q7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRlbXAgPSAoKHRoaXMubjEgLSB0aGlzLm4yKSAvICh0aGlzLm4xICsgdGhpcy5uMikpO1xuICAgICAgICB2YXIgcjAgPSB0ZW1wICogdGVtcDtcbiAgICAgICAgcmV0dXJuIHIwICsgKDEgLSByMCkgKiBNYXRoLnBvdygoMSAtIGNvcyksIDUpO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29tcHV0YXRpb25zID0gQ29tcHV0YXRpb25zO1xuQ29tcHV0YXRpb25zLnRlbXBTZXQgPSBuZXcgU2V0KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21wdXRhdGlvbnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkVQU0lMT04gPSB2b2lkIDA7XG5leHBvcnRzLkVQU0lMT04gPSAwLjAwMDE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25zdGFudHMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkludGVyc2VjdGlvbnMgPSBleHBvcnRzLkludGVyc2VjdGlvbiA9IHZvaWQgMDtcbmNvbnN0IGNvbGxlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb25cIik7XG5jb25zdCBzb3J0XzEgPSByZXF1aXJlKFwiLi9zb3J0XCIpO1xuY2xhc3MgSW50ZXJzZWN0aW9uIHtcbiAgICBjb25zdHJ1Y3Rvcih0LCBvYmplY3QpIHtcbiAgICAgICAgdGhpcy50ID0gdDtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudCA9PSBpbnRlcnNlY3Rpb24udCAmJiB0aGlzLm9iamVjdCA9PT0gaW50ZXJzZWN0aW9uLm9iamVjdDtcbiAgICB9XG59XG5leHBvcnRzLkludGVyc2VjdGlvbiA9IEludGVyc2VjdGlvbjtcbmNsYXNzIEludGVyc2VjdGlvbnMgZXh0ZW5kcyBjb2xsZWN0aW9uXzEuT2JqZWN0UG9vbCB7XG4gICAgc3RhdGljIHNvcnRJbnRlcnNlY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYS50IC0gYi50O1xuICAgIH1cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJzZWN0aW9uKDAsIG51bGwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaGl0LCByZWdhcmRsZXNzIG9mIHNvcnRcbiAgICAqL1xuICAgIGhpdCgpIHtcbiAgICAgICAgdmFyIGhpdCA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmICgoaGl0ID09IG51bGwgfHwgaXRlbS50IDwgaGl0LnQpICYmIGl0ZW0udCA+IDApXG4gICAgICAgICAgICAgICAgaGl0ID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGl0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgaGl0IGluIGEgc29ydGVkIGludGVyc2VjdGlvbnMgbGlzdFxuICAgICovXG4gICAgZmlyc3RIaXQoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAgICAgICAgIGlmIChpdGVtLnQgPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzb3J0KCkge1xuICAgICAgICAoMCwgc29ydF8xLm1lcmdlU29ydElucGxhY2UpKHRoaXMuaXRlbXMsIEludGVyc2VjdGlvbnMuc29ydEludGVyc2VjdGlvbiwgMCwgdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGhpcy5pdGVtc1tpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXF1YWxzKGludGVyc2VjdGlvbnMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCAhPSBpbnRlcnNlY3Rpb25zLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1zW2ldLmVxdWFscyhpbnRlcnNlY3Rpb25zLml0ZW1zW2ldKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJzZWN0aW9ucyA9IEludGVyc2VjdGlvbnM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbnRlcnNlY3Rpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1hdGVyaWFsID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgTWF0ZXJpYWwge1xuICAgIGNvbnN0cnVjdG9yKGlkID0gLTEpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLmNvbG9yID0gY29sb3JfMS5Db2xvci5XSElURS5jbG9uZSgpO1xuICAgICAgICB0aGlzLmFtYmllbnQgPSAwLjE7XG4gICAgICAgIHRoaXMuZGlmZnVzZSA9IDAuOTtcbiAgICAgICAgdGhpcy5zcGVjdWxhciA9IDAuOTtcbiAgICAgICAgdGhpcy5zaGluaW5lc3MgPSAyMDA7XG4gICAgICAgIHRoaXMucGF0dGVybiA9IG51bGw7XG4gICAgICAgIHRoaXMucmVmbGVjdGl2ZSA9IDA7XG4gICAgICAgIHRoaXMudHJhbnNwYXJlbmN5ID0gMDtcbiAgICAgICAgdGhpcy5yZWZyYWN0aXZlSW5kZXggPSAxO1xuICAgIH1cbiAgICBsaWdodGluZyhsaWdodCwgb2JqZWN0LCBwb2ludCwgZXlldiwgbm9ybWFsdiwgaW5TaGFkb3cgPSBmYWxzZSkge1xuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLnBhdHRlcm4gIT0gbnVsbCA/IHRoaXMucGF0dGVybi5wYXR0ZXJuQXRTaGFwZShvYmplY3QsIHBvaW50KSA6IHRoaXMuY29sb3I7XG4gICAgICAgIHZhciBlZmZlY3RpdmVDb2xvciA9IGNvbG9yLmhhZGFtYXJkUHJvZHVjdChsaWdodC5pbnRlbnNpdHkpO1xuICAgICAgICB2YXIgYW1iaWVudCA9IGVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuYW1iaWVudCk7XG4gICAgICAgIGlmIChpblNoYWRvdylcbiAgICAgICAgICAgIHJldHVybiBhbWJpZW50O1xuICAgICAgICB2YXIgbGlnaHR2ID0gbGlnaHQucG9zaXRpb24uc3Vic3RyYWN0KHBvaW50KS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIGxpZ2h0RG90Tm9ybWFsID0gbGlnaHR2LmRvdChub3JtYWx2KTtcbiAgICAgICAgdmFyIGRpZmZ1c2U7XG4gICAgICAgIHZhciBzcGVjdWxhcjtcbiAgICAgICAgaWYgKGxpZ2h0RG90Tm9ybWFsIDwgMCkge1xuICAgICAgICAgICAgZGlmZnVzZSA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgICAgICBzcGVjdWxhciA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkaWZmdXNlID0gZWZmZWN0aXZlQ29sb3IubXVsdGlwbHkodGhpcy5kaWZmdXNlICogbGlnaHREb3ROb3JtYWwpO1xuICAgICAgICAgICAgdmFyIHJlZmxlY3R2ID0gbGlnaHR2Lm5lZ2F0ZSgpLnJlZmxlY3Qobm9ybWFsdik7XG4gICAgICAgICAgICB2YXIgcmVmbGVjdERvdEV5ZSA9IHJlZmxlY3R2LmRvdChleWV2KTtcbiAgICAgICAgICAgIGlmIChyZWZsZWN0RG90RXllIDw9IDApIHtcbiAgICAgICAgICAgICAgICBzcGVjdWxhciA9IGNvbG9yXzEuQ29sb3IuQkxBQ0s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZmFjdG9yID0gTWF0aC5wb3cocmVmbGVjdERvdEV5ZSwgdGhpcy5zaGluaW5lc3MpO1xuICAgICAgICAgICAgICAgIHNwZWN1bGFyID0gbGlnaHQuaW50ZW5zaXR5Lm11bHRpcGx5KHRoaXMuc3BlY3VsYXIgKiBmYWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbWJpZW50LmFkZChkaWZmdXNlKS5hZGQoc3BlY3VsYXIpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0ZXJpYWwgPSBNYXRlcmlhbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1hdGVyaWFsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NYXRyaXgzeDMgPSBleHBvcnRzLk1hdHJpeDJ4MiA9IGV4cG9ydHMuTWF0cml4NHg0ID0gZXhwb3J0cy5NYXRyaXggPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNsYXNzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IoYSwgYikge1xuICAgICAgICBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgbWF0cml4ID0gYTtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoID09IDAgfHwgbWF0cml4WzBdLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IG1hdHJpeFswXS5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IG1hdHJpeC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBGbG9hdDY0QXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBtYXRyaXhbeV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcm93W3hdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVt0aGlzLndpZHRoICogeSArIHhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IGE7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGI7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29mYWN0b3Iocm93LCBjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuICgocm93ICsgY29sdW1uKSAlIDIgKiAyIC0gMSkgKiAtdGhpcy5taW5vcihyb3csIGNvbHVtbik7XG4gICAgfVxuICAgIG1pbm9yKHJvdywgY29sdW1uKSB7XG4gICAgICAgIHZhciBtID0gdGhpcy5zdWJtYXRyaXgocm93LCBjb2x1bW4pO1xuICAgICAgICByZXR1cm4gbS5kZXRlcm1pbmFudCgpO1xuICAgIH1cbiAgICBpc0ludmVydGlibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRldGVybWluYW50KCkgIT0gMDtcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIGlmICh0aGlzLndpZHRoID09IDIpXG4gICAgICAgICAgICByZXR1cm4gTWF0cml4MngyLnByb3RvdHlwZS5kZXRlcm1pbmFudC5jYWxsKHRoaXMpO1xuICAgICAgICB2YXIgZGV0ID0gMDtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIGRldCArPSB0aGlzLmRhdGFbeF0gKiB0aGlzLmNvZmFjdG9yKDAsIHgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICB2YXIgc3RyaW5nID0gXCJcIjtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBzdHJpbmcgKz0gXCJ8XCI7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XS50b0ZpeGVkKDIpICsgXCJcXHR8XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHJpbmcgKz0gXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgIH1cbiAgICBnZXQocm93LCBjb2x1bW4pIHtcbiAgICAgICAgaWYgKHJvdyA+PSB0aGlzLmhlaWdodCB8fCBjb2x1bW4gPj0gdGhpcy53aWR0aCB8fCByb3cgPCAwIHx8IGNvbHVtbiA8IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigpO1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMud2lkdGggKiByb3cgKyBjb2x1bW5dO1xuICAgIH1cbiAgICBzZXQocm93LCBjb2x1bW4sIHZhbHVlKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgdGhpcy5kYXRhW3RoaXMud2lkdGggKiByb3cgKyBjb2x1bW5dID0gdmFsdWU7XG4gICAgfVxuICAgIG11bHRpcGx5KG1hdHJpeCkge1xuICAgICAgICBpZiAobWF0cml4LmhlaWdodCAhPSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgobWF0cml4LndpZHRoLCBtYXRyaXguaGVpZ2h0KTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBtYXRyaXguaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgbWF0cml4LndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IG1hdHJpeC5oZWlnaHQ7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gbWF0cml4LmRhdGFbdGhpcy53aWR0aCAqIHIgKyB4XSAqIHRoaXMuZGF0YVt0aGlzLndpZHRoICogeSArIHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XSA9IHN1bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgdHJhbnNwb3NlKCkge1xuICAgICAgICB2YXIgbWF0cml4ID0gbmV3IE1hdHJpeCh0aGlzLmhlaWdodCwgdGhpcy53aWR0aCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0geTsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy53aWR0aCAqIHkgKyB4O1xuICAgICAgICAgICAgICAgIHZhciBpbmRleFRyYW5zcG9zZWQgPSB0aGlzLndpZHRoICogeCArIHk7XG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhdID0gdGhpcy5kYXRhW2luZGV4VHJhbnNwb3NlZF07XG4gICAgICAgICAgICAgICAgbWF0cml4LmRhdGFbaW5kZXhUcmFuc3Bvc2VkXSA9IHRoaXMuZGF0YVtpbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdHJpeDtcbiAgICB9XG4gICAgc3VibWF0cml4KHJvdywgY29sdW1uKSB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeCh0aGlzLndpZHRoIC0gMSwgdGhpcy5oZWlnaHQgLSAxKTtcbiAgICAgICAgdmFyIHkyID0gMDtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBpZiAoeSA9PSByb3cpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB4MiA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIGlmICh4ID09IGNvbHVtbikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW20ud2lkdGggKiB5MiArIHgyXSA9IHRoaXMuZGF0YVt0aGlzLndpZHRoICogeSArIHhdO1xuICAgICAgICAgICAgICAgIHgyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5MisrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIHZhciBhcnIgPSBuZXcgQXJyYXkodGhpcy5oZWlnaHQpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIHZhciBjID0gbmV3IEFycmF5KHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgYXJyW3ldID0gYztcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY1t4XSA9IHRoaXMuZ2V0KHksIHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICAgIGVxdWFscyhtYXRyaXgpIHtcbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT0gbWF0cml4LndpZHRoIHx8IHRoaXMuaGVpZ2h0ICE9IG1hdHJpeC5oZWlnaHQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBNYXRoLmFicyh0aGlzLmRhdGFbaV0gLSBtYXRyaXguZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpZmYgPj0gY29uc3RhbnRzXzEuRVBTSUxPTilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4ID0gTWF0cml4O1xuY2xhc3MgTWF0cml4NHg0IGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSA0IHx8IG1hdHJpeFswXS5sZW5ndGggIT0gNCB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDQgfHwgbWF0cml4WzJdLmxlbmd0aCAhPSA0IHx8IG1hdHJpeFszXS5sZW5ndGggIT0gNCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDQsIDQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyB2aWV3VHJhbnNmb3JtKGZyb20sIHRvLCB1cCwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBmb3J3YXJkID0gdG8uc3Vic3RyYWN0KGZyb20pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgdXBuID0gdXAubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciBsZWZ0ID0gZm9yd2FyZC5jcm9zcyh1cG4pO1xuICAgICAgICB2YXIgdHJ1ZVVwID0gbGVmdC5jcm9zcyhmb3J3YXJkKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBsZWZ0Lng7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gbGVmdC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IGxlZnQuejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSB0cnVlVXAueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSB0cnVlVXAueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0cnVlVXAuejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAtZm9yd2FyZC54O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IC1mb3J3YXJkLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IC1mb3J3YXJkLno7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIE1hdHJpeDR4NC50cmFuc2xhdGlvbigtZnJvbS54LCAtZnJvbS55LCAtZnJvbS56LCBNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCk7XG4gICAgICAgIHRhcmdldC5tdWx0aXBseShNYXRyaXg0eDQudGVtcE1hdHJpeDR4NCwgdGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgc3RhdGljIHRyYW5zbGF0aW9uKHgsIHksIHosIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB4O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvblgocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gY29zO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IC1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvblkocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IC1zaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyByb3RhdGlvbloocmFkaWFucywgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKTtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHJhZGlhbnMpO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSBzaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyBzY2FsaW5nKHgsIHksIHosIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHg7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0geTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gejtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IDE7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyBzaGVhcmluZyh4eSwgeHosIHl4LCB5eiwgengsIHp5LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHl4O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IHp4O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IHh5O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0genk7XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0geHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0geXo7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICB0cmFuc3Bvc2UodGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHRoaXMuZGF0YVs1XTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gc3dhcDtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBzd2FwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBzd2FwID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgdG9BcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdLCB0aGlzLmRhdGFbM11dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVs0XSwgdGhpcy5kYXRhWzVdLCB0aGlzLmRhdGFbNl0sIHRoaXMuZGF0YVs3XV0sXG4gICAgICAgICAgICBbdGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0sIHRoaXMuZGF0YVsxMV1dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVsxMl0sIHRoaXMuZGF0YVsxM10sIHRoaXMuZGF0YVsxNF0sIHRoaXMuZGF0YVsxNV1dXG4gICAgICAgIF07XG4gICAgfVxuICAgIGludmVyc2UodGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHZhciBhMDAgPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDMgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMCA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMyA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHZhciBkZXRlcm1pbmFudCA9IChhMDAgKiAoYTExICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTMgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSkgK1xuICAgICAgICAgICAgYTAxICogLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSArXG4gICAgICAgICAgICBhMDIgKiAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgK1xuICAgICAgICAgICAgYTAzICogLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSArIGExMSAqIC0oYTIwICogYTMyIC0gYTIyICogYTMwKSArIGExMiAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSk7XG4gICAgICAgIGlmIChkZXRlcm1pbmFudCA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gLShhMDEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGEwMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGEwMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEwMiAqIC0oYTExICogYTMzIC0gYTEzICogYTMxKSArIGEwMyAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IC0oYTAxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgKyBhMDIgKiAtKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgKyBhMDMgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gKGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTAyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTAzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEwMiAqIC0oYTEwICogYTMzIC0gYTEzICogYTMwKSArIGEwMyAqIChhMTAgKiBhMzIgLSBhMTIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IChhMDAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSArIGEwMiAqIC0oYTEwICogYTIzIC0gYTEzICogYTIwKSArIGEwMyAqIChhMTAgKiBhMjIgLSBhMTIgKiBhMjApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMSAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IC0oYTAwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMDEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMDMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gKGEwMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTAxICogLShhMTAgKiBhMzMgLSBhMTMgKiBhMzApICsgYTAzICogKGExMCAqIGEzMSAtIGExMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgKyBhMDEgKiAtKGExMCAqIGEyMyAtIGExMyAqIGEyMCkgKyBhMDMgKiAoYTEwICogYTIxIC0gYTExICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSArIGExMSAqIC0oYTIwICogYTMyIC0gYTIyICogYTMwKSArIGExMiAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMDEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMDIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSArIGEwMSAqIC0oYTEwICogYTMyIC0gYTEyICogYTMwKSArIGEwMiAqIChhMTAgKiBhMzEgLSBhMTEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAoYTAwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgKyBhMDEgKiAtKGExMCAqIGEyMiAtIGExMiAqIGEyMCkgKyBhMDIgKiAoYTEwICogYTIxIC0gYTExICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHZhciBhMDAgPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHZhciBhMDMgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgdmFyIGEzMCA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgdmFyIGEzMyA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiAoYTAwICogKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpICtcbiAgICAgICAgICAgIGEwMSAqIC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMyIC0gYTIyICogYTMwKSkgK1xuICAgICAgICAgICAgYTAyICogKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMyAqIC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkpO1xuICAgIH1cbiAgICBhc3NpZ24obWF0cml4KSB7XG4gICAgICAgIHRoaXMuZGF0YVswXSA9IG1hdHJpeC5kYXRhWzBdO1xuICAgICAgICB0aGlzLmRhdGFbMV0gPSBtYXRyaXguZGF0YVsxXTtcbiAgICAgICAgdGhpcy5kYXRhWzJdID0gbWF0cml4LmRhdGFbMl07XG4gICAgICAgIHRoaXMuZGF0YVszXSA9IG1hdHJpeC5kYXRhWzNdO1xuICAgICAgICB0aGlzLmRhdGFbNF0gPSBtYXRyaXguZGF0YVs0XTtcbiAgICAgICAgdGhpcy5kYXRhWzVdID0gbWF0cml4LmRhdGFbNV07XG4gICAgICAgIHRoaXMuZGF0YVs2XSA9IG1hdHJpeC5kYXRhWzZdO1xuICAgICAgICB0aGlzLmRhdGFbN10gPSBtYXRyaXguZGF0YVs3XTtcbiAgICAgICAgdGhpcy5kYXRhWzhdID0gbWF0cml4LmRhdGFbOF07XG4gICAgICAgIHRoaXMuZGF0YVs5XSA9IG1hdHJpeC5kYXRhWzldO1xuICAgICAgICB0aGlzLmRhdGFbMTBdID0gbWF0cml4LmRhdGFbMTBdO1xuICAgICAgICB0aGlzLmRhdGFbMTFdID0gbWF0cml4LmRhdGFbMTFdO1xuICAgICAgICB0aGlzLmRhdGFbMTJdID0gbWF0cml4LmRhdGFbMTJdO1xuICAgICAgICB0aGlzLmRhdGFbMTNdID0gbWF0cml4LmRhdGFbMTNdO1xuICAgICAgICB0aGlzLmRhdGFbMTRdID0gbWF0cml4LmRhdGFbMTRdO1xuICAgICAgICB0aGlzLmRhdGFbMTVdID0gbWF0cml4LmRhdGFbMTVdO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgIG0uZGF0YVswXSA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgbS5kYXRhWzFdID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICBtLmRhdGFbMl0gPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIG0uZGF0YVszXSA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgbS5kYXRhWzRdID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICBtLmRhdGFbNV0gPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIG0uZGF0YVs2XSA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgbS5kYXRhWzddID0gdGhpcy5kYXRhWzddO1xuICAgICAgICBtLmRhdGFbOF0gPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIG0uZGF0YVs5XSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgbS5kYXRhWzEwXSA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgIG0uZGF0YVsxMV0gPSB0aGlzLmRhdGFbMTFdO1xuICAgICAgICBtLmRhdGFbMTJdID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgbS5kYXRhWzEzXSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgIG0uZGF0YVsxNF0gPSB0aGlzLmRhdGFbMTRdO1xuICAgICAgICBtLmRhdGFbMTVdID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIG11bHRpcGx5KGEsIGIpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBNYXRyaXg0eDQpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBiICE9PSBudWxsICYmIGIgIT09IHZvaWQgMCA/IGIgOiBuZXcgTWF0cml4NHg0KCk7XG4gICAgICAgICAgICBpZiAobWF0cml4ID09PSB0aGlzKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGE7XG4gICAgICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICAgICAgdmFyIGEwMSA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgICAgIHZhciBhMDIgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICAgICAgdmFyIGExMCA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICAgICAgdmFyIGExMyA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICAgICAgdmFyIGEyMiA9IHRoaXMuZGF0YVsxMF07XG4gICAgICAgICAgICB2YXIgYTIzID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICAgICAgdmFyIGEzMSA9IHRoaXMuZGF0YVsxM107XG4gICAgICAgICAgICB2YXIgYTMyID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBtYXRyaXguZGF0YVswXSAqIGEwMCArIG1hdHJpeC5kYXRhWzRdICogYTAxICsgbWF0cml4LmRhdGFbOF0gKiBhMDIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IG1hdHJpeC5kYXRhWzFdICogYTAwICsgbWF0cml4LmRhdGFbNV0gKiBhMDEgKyBtYXRyaXguZGF0YVs5XSAqIGEwMiArIG1hdHJpeC5kYXRhWzEzXSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzJdID0gbWF0cml4LmRhdGFbMl0gKiBhMDAgKyBtYXRyaXguZGF0YVs2XSAqIGEwMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEwMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzNdID0gbWF0cml4LmRhdGFbM10gKiBhMDAgKyBtYXRyaXguZGF0YVs3XSAqIGEwMSArIG1hdHJpeC5kYXRhWzExXSAqIGEwMiArIG1hdHJpeC5kYXRhWzE1XSAqIGEwMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzRdID0gbWF0cml4LmRhdGFbMF0gKiBhMTAgKyBtYXRyaXguZGF0YVs0XSAqIGExMSArIG1hdHJpeC5kYXRhWzhdICogYTEyICsgbWF0cml4LmRhdGFbMTJdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSBtYXRyaXguZGF0YVsxXSAqIGExMCArIG1hdHJpeC5kYXRhWzVdICogYTExICsgbWF0cml4LmRhdGFbOV0gKiBhMTIgKyBtYXRyaXguZGF0YVsxM10gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IG1hdHJpeC5kYXRhWzJdICogYTEwICsgbWF0cml4LmRhdGFbNl0gKiBhMTEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMTIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs3XSA9IG1hdHJpeC5kYXRhWzNdICogYTEwICsgbWF0cml4LmRhdGFbN10gKiBhMTEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMTIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMTM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IG1hdHJpeC5kYXRhWzBdICogYTIwICsgbWF0cml4LmRhdGFbNF0gKiBhMjEgKyBtYXRyaXguZGF0YVs4XSAqIGEyMiArIG1hdHJpeC5kYXRhWzEyXSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzldID0gbWF0cml4LmRhdGFbMV0gKiBhMjAgKyBtYXRyaXguZGF0YVs1XSAqIGEyMSArIG1hdHJpeC5kYXRhWzldICogYTIyICsgbWF0cml4LmRhdGFbMTNdICogYTIzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gbWF0cml4LmRhdGFbMl0gKiBhMjAgKyBtYXRyaXguZGF0YVs2XSAqIGEyMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEyMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzExXSA9IG1hdHJpeC5kYXRhWzNdICogYTIwICsgbWF0cml4LmRhdGFbN10gKiBhMjEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMjIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSBtYXRyaXguZGF0YVswXSAqIGEzMCArIG1hdHJpeC5kYXRhWzRdICogYTMxICsgbWF0cml4LmRhdGFbOF0gKiBhMzIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMzM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSBtYXRyaXguZGF0YVsxXSAqIGEzMCArIG1hdHJpeC5kYXRhWzVdICogYTMxICsgbWF0cml4LmRhdGFbOV0gKiBhMzIgKyBtYXRyaXguZGF0YVsxM10gKiBhMzM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSBtYXRyaXguZGF0YVsyXSAqIGEzMCArIG1hdHJpeC5kYXRhWzZdICogYTMxICsgbWF0cml4LmRhdGFbMTBdICogYTMyICsgbWF0cml4LmRhdGFbMTRdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gbWF0cml4LmRhdGFbM10gKiBhMzAgKyBtYXRyaXguZGF0YVs3XSAqIGEzMSArIG1hdHJpeC5kYXRhWzExXSAqIGEzMiArIG1hdHJpeC5kYXRhWzE1XSAqIGEzMztcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYSBpbnN0YW5jZW9mIHR1cGxlXzEuVHVwbGUpIHtcbiAgICAgICAgICAgIHZhciB0ID0gYTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgdHVwbGVfMS5UdXBsZSh0aGlzLmRhdGFbMF0gKiB0LnggKyB0aGlzLmRhdGFbMV0gKiB0LnkgKyB0aGlzLmRhdGFbMl0gKiB0LnogKyB0aGlzLmRhdGFbM10gKiB0LncsIHRoaXMuZGF0YVs0XSAqIHQueCArIHRoaXMuZGF0YVs1XSAqIHQueSArIHRoaXMuZGF0YVs2XSAqIHQueiArIHRoaXMuZGF0YVs3XSAqIHQudywgdGhpcy5kYXRhWzhdICogdC54ICsgdGhpcy5kYXRhWzldICogdC55ICsgdGhpcy5kYXRhWzEwXSAqIHQueiArIHRoaXMuZGF0YVsxMV0gKiB0LncsIHRoaXMuZGF0YVsxMl0gKiB0LnggKyB0aGlzLmRhdGFbMTNdICogdC55ICsgdGhpcy5kYXRhWzE0XSAqIHQueiArIHRoaXMuZGF0YVsxNV0gKiB0LncpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy9hIGluc3RhbmNlb2YgTWF0cml4IChub3Qgc3VwcG9ydGVkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeDR4NCA9IE1hdHJpeDR4NDtcbk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVggPSBuZXcgTWF0cml4NHg0KFtcbiAgICBbMSwgMCwgMCwgMF0sXG4gICAgWzAsIDEsIDAsIDBdLFxuICAgIFswLCAwLCAxLCAwXSxcbiAgICBbMCwgMCwgMCwgMV1cbl0pO1xuTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0KCk7XG5jbGFzcyBNYXRyaXgyeDIgZXh0ZW5kcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKG1hdHJpeCkge1xuICAgICAgICBpZiAobWF0cml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChtYXRyaXgubGVuZ3RoICE9IDIgfHwgbWF0cml4WzBdLmxlbmd0aCAhPSAyIHx8IG1hdHJpeFsxXS5sZW5ndGggIT0gMikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDIsIDIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdICogdGhpcy5kYXRhWzNdIC0gdGhpcy5kYXRhWzFdICogdGhpcy5kYXRhWzJdO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4MngyID0gTWF0cml4MngyO1xuY2xhc3MgTWF0cml4M3gzIGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSAzIHx8IG1hdHJpeFswXS5sZW5ndGggIT0gMyB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDMgfHwgbWF0cml4WzJdLmxlbmd0aCAhPSAzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlcihtYXRyaXgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoMywgMyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHZhciBhMTEgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgIHZhciBhMTIgPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHZhciBhMjAgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHZhciBhMjEgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbOF07XG4gICAgICAgIHJldHVybiAodGhpcy5kYXRhWzBdICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgKyB0aGlzLmRhdGFbMV0gKiAtKGExMCAqIGEyMiAtIGExMiAqIGEyMCkgKyB0aGlzLmRhdGFbMl0gKiAoYTEwICogYTIxIC0gYTExICogYTIwKSk7XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXgzeDMgPSBNYXRyaXgzeDM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRyaXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbXBvc2l0ZVBhdHRlcm4gPSBleHBvcnRzLlBlcmxpblBhdHRlcm4gPSBleHBvcnRzLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlID0gZXhwb3J0cy5DaGVja2VyM2RQYXR0ZXJuID0gZXhwb3J0cy5SaW5nUGF0dGVybiA9IGV4cG9ydHMuR3JhZGllbnRQYXR0ZXJuID0gZXhwb3J0cy5TdHJpcGVQYXR0ZXJuID0gZXhwb3J0cy5QYXR0ZXJuID0gdm9pZCAwO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBmYXN0X3NpbXBsZXhfbm9pc2VfMSA9IHJlcXVpcmUoXCJmYXN0LXNpbXBsZXgtbm9pc2VcIik7XG5jbGFzcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3Rvcih0cmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgcGF0dGVybkF0U2hhcGUob2JqZWN0LCB3b3JsZFBvaW50KSB7XG4gICAgICAgIHZhciBvYmplY3RQb2ludCA9IG9iamVjdC5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHdvcmxkUG9pbnQpO1xuICAgICAgICB2YXIgcGF0dGVyblBvaW50ID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KG9iamVjdFBvaW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybkF0KHBhdHRlcm5Qb2ludCk7XG4gICAgfVxufVxuZXhwb3J0cy5QYXR0ZXJuID0gUGF0dGVybjtcblBhdHRlcm4udGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG5jbGFzcyBTdHJpcGVQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuY29sb3JzID0gW2EsIGJdO1xuICAgIH1cbiAgICBnZXQgYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzWzBdO1xuICAgIH1cbiAgICBnZXQgYigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzWzFdO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzW01hdGguZmxvb3IoTWF0aC5hYnMocG9pbnQueCkpICUgMl07XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IFN0cmlwZVBhdHRlcm47XG5jbGFzcyBHcmFkaWVudFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuYi5zdWJzdHJhY3QodGhpcy5hKTtcbiAgICAgICAgdmFyIGZyYWN0aW9uID0gcG9pbnQueCAtIE1hdGguZmxvb3IocG9pbnQueCk7XG4gICAgICAgIHJldHVybiB0aGlzLmEuYWRkKGRpc3RhbmNlLm11bHRpcGx5KGZyYWN0aW9uKSk7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuR3JhZGllbnRQYXR0ZXJuID0gR3JhZGllbnRQYXR0ZXJuO1xuY2xhc3MgUmluZ1BhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiAoTWF0aC5mbG9vcihNYXRoLnNxcnQocG9pbnQueCAqIHBvaW50LnggKyBwb2ludC56ICogcG9pbnQueikpICUgMiA9PSAwKSA/IHRoaXMuYSA6IHRoaXMuYjtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRoaXMuY29uc3RydWN0b3IubmFtZSwgYTogdGhpcy5hLCBiOiB0aGlzLmIsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5SaW5nUGF0dGVybiA9IFJpbmdQYXR0ZXJuO1xuY2xhc3MgQ2hlY2tlcjNkUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmEgPSBhO1xuICAgICAgICB0aGlzLmIgPSBiO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuICgoTWF0aC5mbG9vcihwb2ludC54KSArIE1hdGguZmxvb3IocG9pbnQueSkgKyBNYXRoLmZsb29yKHBvaW50LnopKSAlIDIgPT0gMCkgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IENoZWNrZXIzZFBhdHRlcm47XG5jbGFzcyBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSwgdXZTY2FsZSA9IDEpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy51dlNjYWxlID0gdXZTY2FsZTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHZhciB0dSA9IE1hdGguYXRhbjIocG9pbnQueCwgcG9pbnQueikgLyBNYXRoLlBJIC8gMiAqIHRoaXMudXZTY2FsZTtcbiAgICAgICAgdmFyIHR2ID0gcG9pbnQueSAvIDIgKiB0aGlzLnV2U2NhbGU7XG4gICAgICAgIHJldHVybiAoKChNYXRoLmZsb29yKHR1KSArIE1hdGguZmxvb3IodHYpKSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdXZTY2FsZTogdGhpcy51dlNjYWxlLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUgPSBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZTtcbmNsYXNzIFBlcmxpblBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0aHJlc2hvbGQgPSAwLjUsIHNlZWQgPSBNYXRoLnJhbmRvbSgpLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy5ub2lzZTNkID0gKDAsIGZhc3Rfc2ltcGxleF9ub2lzZV8xLm1ha2VOb2lzZTNEKSgoKSA9PiB0aGlzLnNlZWQpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgdGhpcy5zZWVkID0gc2VlZDtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vaXNlM2QocG9pbnQueCwgcG9pbnQueSwgcG9pbnQueikgPiB0aGlzLnRocmVzaG9sZCA/IHRoaXMuYSA6IHRoaXMuYjtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRoaXMuY29uc3RydWN0b3IubmFtZSwgYTogdGhpcy5hLCBiOiB0aGlzLmIsIHRocmVzaG9sZDogdGhpcy50aHJlc2hvbGQsIHNlZWQ6IHRoaXMuc2VlZCwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLlBlcmxpblBhdHRlcm4gPSBQZXJsaW5QYXR0ZXJuO1xuY2xhc3MgQ29tcG9zaXRlUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKHBhdHRlcm4xLCBwYXR0ZXJuMikge1xuICAgICAgICBzdXBlcihtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpO1xuICAgICAgICB0aGlzLnBhdHRlcm4xID0gcGF0dGVybjE7XG4gICAgICAgIHRoaXMucGF0dGVybjIgPSBwYXR0ZXJuMjtcbiAgICB9XG4gICAgcGF0dGVybkF0U2hhcGUob2JqZWN0LCB3b3JsZFBvaW50KSB7XG4gICAgICAgIHZhciBvYmplY3RQb2ludCA9IG9iamVjdC5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHdvcmxkUG9pbnQpO1xuICAgICAgICB2YXIgcGF0dGVyblBvaW50ID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KG9iamVjdFBvaW50KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF0dGVybjEucGF0dGVybkF0U2hhcGUob2JqZWN0LCB3b3JsZFBvaW50KS5hZGQodGhpcy5wYXR0ZXJuMi5wYXR0ZXJuQXRTaGFwZShvYmplY3QsIHdvcmxkUG9pbnQpKS5tdWx0aXBseSgwLjUpO1xuICAgIH1cbiAgICBwYXR0ZXJuQXQocG9pbnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIHBhdHRlcm4xOiB0aGlzLnBhdHRlcm4xLnRvT2JqZWN0KCksIHBhdHRlcm4yOiB0aGlzLnBhdHRlcm4yLnRvT2JqZWN0KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNvbXBvc2l0ZVBhdHRlcm4gPSBDb21wb3NpdGVQYXR0ZXJuO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGF0dGVybnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlBsYW5lID0gdm9pZCAwO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY29uc3QgaW50ZXJzZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IG1hdGVyaWFsXzEgPSByZXF1aXJlKFwiLi9tYXRlcmlhbFwiKTtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgUGxhbmUge1xuICAgIGNvbnN0cnVjdG9yKGlkLCB0cmFuc2Zvcm0sIG1hdGVyaWFsKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IG51bGwgJiYgdHJhbnNmb3JtICE9PSB2b2lkIDAgPyB0cmFuc2Zvcm0gOiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICAgIHRoaXMubWF0ZXJpYWwgPSBtYXRlcmlhbCAhPT0gbnVsbCAmJiBtYXRlcmlhbCAhPT0gdm9pZCAwID8gbWF0ZXJpYWwgOiBuZXcgbWF0ZXJpYWxfMS5NYXRlcmlhbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIGludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIHJheSA9IHJheS50cmFuc2Zvcm0odGhpcy5pbnZlcnNlVHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5sb2NhbEludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMpO1xuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICB9XG4gICAgbm9ybWFsQXQocCkge1xuICAgICAgICB2YXIgb2JqZWN0Tm9ybWFsID0gdHVwbGVfMS5UdXBsZS52ZWN0b3IoMCwgMSwgMCk7XG4gICAgICAgIHZhciB3b3JsZE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS50cmFuc3Bvc2UoUGxhbmUudGVtcE1hdHJpeDEpLm11bHRpcGx5KG9iamVjdE5vcm1hbCk7XG4gICAgICAgIHdvcmxkTm9ybWFsLncgPSAwO1xuICAgICAgICByZXR1cm4gd29ybGROb3JtYWwubm9ybWFsaXplKCk7XG4gICAgfVxuICAgIGxvY2FsSW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKHJheS5kaXJlY3Rpb24ueSkgPCBjb25zdGFudHNfMS5FUFNJTE9OKVxuICAgICAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgICAgIHZhciBpID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICAgICAgaS5vYmplY3QgPSB0aGlzO1xuICAgICAgICBpLnQgPSAtcmF5Lm9yaWdpbi55IC8gcmF5LmRpcmVjdGlvbi55O1xuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICB9XG59XG5leHBvcnRzLlBsYW5lID0gUGxhbmU7XG5QbGFuZS50ZW1wTWF0cml4MSA9IG5ldyBtYXRyaXhfMS5NYXRyaXg0eDQoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBsYW5lLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Qb2ludExpZ2h0ID0gdm9pZCAwO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY2xhc3MgUG9pbnRMaWdodCB7XG4gICAgY29uc3RydWN0b3IocG9zaXRpb24sIGludGVuc2l0eSkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb24gIT09IG51bGwgJiYgcG9zaXRpb24gIT09IHZvaWQgMCA/IHBvc2l0aW9uIDogdHVwbGVfMS5UdXBsZS5wb2ludCgwLCAwLCAwKTtcbiAgICAgICAgdGhpcy5pbnRlbnNpdHkgPSBpbnRlbnNpdHkgIT09IG51bGwgJiYgaW50ZW5zaXR5ICE9PSB2b2lkIDAgPyBpbnRlbnNpdHkgOiBuZXcgY29sb3JfMS5Db2xvcigxLCAxLCAxKTtcbiAgICB9XG59XG5leHBvcnRzLlBvaW50TGlnaHQgPSBQb2ludExpZ2h0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG9pbnRMaWdodC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmF5ID0gdm9pZCAwO1xuY2xhc3MgUmF5IHtcbiAgICBjb25zdHJ1Y3RvcihvcmlnaW4sIGRpcmVjdGlvbikge1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbjtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuICAgIHBvc2l0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luLmFkZCh0aGlzLmRpcmVjdGlvbi5tdWx0aXBseSh0KSk7XG4gICAgfVxuICAgIHRyYW5zZm9ybShtYXRyaXgpIHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IG1hdHJpeC5tdWx0aXBseSh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIHZhciBvcmlnaW4gPSBtYXRyaXgubXVsdGlwbHkodGhpcy5vcmlnaW4pO1xuICAgICAgICB2YXIgcmF5ID0gbmV3IFJheShvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgICAgIHJldHVybiByYXk7XG4gICAgfVxufVxuZXhwb3J0cy5SYXkgPSBSYXk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYXkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnNlcmlhbGl6ZVdvcmxkID0gZXhwb3J0cy5zZXJpYWxpemVBcnJheSA9IGV4cG9ydHMuc2VyaWFsaXplU2hhcGUgPSBleHBvcnRzLnNlcmlhbGl6ZU1hdGVyaWFsID0gZXhwb3J0cy5zZXJpYWxpemVQYXR0ZXJuID0gZXhwb3J0cy5zZXJpYWxpemVDYW1lcmEgPSBleHBvcnRzLmRlU2VyaWFsaXplQ2FtZXJhID0gZXhwb3J0cy5kZXNlcmlhbGl6ZUNvbG9yID0gZXhwb3J0cy5kZXNlcmlhbGl6ZVN0cmluZyA9IGV4cG9ydHMuZGVzZXJpYWxpemVOdW1iZXIgPSBleHBvcnRzLmRlc2VyaWFsaXplVHVwbGUgPSBleHBvcnRzLmRlU2VyaWFsaXplTGlnaHQgPSBleHBvcnRzLmRlU2VyaWFsaXplQXJyYXkgPSBleHBvcnRzLmRlU2VyaWFsaXplV29ybGQgPSBleHBvcnRzLmRlc2VyaWFsaXplTWF0cml4NHg0ID0gZXhwb3J0cy5kZVNlcmlhbGl6ZVBhdHRlcm4gPSBleHBvcnRzLmRlU2VyaWFsaXplTWF0ZXJpYWwgPSBleHBvcnRzLmRlU2VyaWFsaXplU2hhcGVzID0gdm9pZCAwO1xuY29uc3QgY2FtZXJhXzEgPSByZXF1aXJlKFwiLi9jYW1lcmFcIik7XG5jb25zdCBjb2xvcl8xID0gcmVxdWlyZShcIi4vY29sb3JcIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IHBhdHRlcm5zXzEgPSByZXF1aXJlKFwiLi9wYXR0ZXJuc1wiKTtcbmNvbnN0IHBsYW5lXzEgPSByZXF1aXJlKFwiLi9wbGFuZVwiKTtcbmNvbnN0IHBvaW50TGlnaHRfMSA9IHJlcXVpcmUoXCIuL3BvaW50TGlnaHRcIik7XG5jb25zdCBzcGhlcmVfMSA9IHJlcXVpcmUoXCIuL3NwaGVyZVwiKTtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IHdvcmxkXzEgPSByZXF1aXJlKFwiLi93b3JsZFwiKTtcbmNvbnN0IG1hdGVyaWFsXzEgPSByZXF1aXJlKFwiLi9tYXRlcmlhbFwiKTtcbmZ1bmN0aW9uIGRlU2VyaWFsaXplU2hhcGVzKG9iaiwgbWF0ZXJpYWxzTWFwKSB7XG4gICAgdmFyIHR5cGUgPSBkZXNlcmlhbGl6ZVN0cmluZyhvYmoudHlwZSk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgcGxhbmVfMS5QbGFuZS5uYW1lOlxuICAgICAgICAgICAgdmFyIHAgPSBuZXcgcGxhbmVfMS5QbGFuZShkZXNlcmlhbGl6ZU51bWJlcihvYmouaWQpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSwgbWF0ZXJpYWxzTWFwLmdldChkZXNlcmlhbGl6ZU51bWJlcihvYmoubWF0ZXJpYWwpKSk7XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgY2FzZSBzcGhlcmVfMS5TcGhlcmUubmFtZTpcbiAgICAgICAgICAgIHZhciBzID0gbmV3IHNwaGVyZV8xLlNwaGVyZShkZXNlcmlhbGl6ZU51bWJlcihvYmouaWQpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSwgbWF0ZXJpYWxzTWFwLmdldChkZXNlcmlhbGl6ZU51bWJlcihvYmoubWF0ZXJpYWwpKSk7XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplU2hhcGVzID0gZGVTZXJpYWxpemVTaGFwZXM7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZU1hdGVyaWFsKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIG0gPSBuZXcgbWF0ZXJpYWxfMS5NYXRlcmlhbChkZXNlcmlhbGl6ZU51bWJlcihvYmouaWQpKTtcbiAgICBtLmFtYmllbnQgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmouYW1iaWVudCk7XG4gICAgbS5jb2xvciA9IGRlc2VyaWFsaXplQ29sb3Iob2JqLmNvbG9yKTtcbiAgICBtLmRpZmZ1c2UgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmouZGlmZnVzZSk7XG4gICAgbS5wYXR0ZXJuID0gZGVTZXJpYWxpemVQYXR0ZXJuKG9iai5wYXR0ZXJuKTtcbiAgICBtLnNoaW5pbmVzcyA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5zaGluaW5lc3MpO1xuICAgIG0uc3BlY3VsYXIgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmouc3BlY3VsYXIpO1xuICAgIG0ucmVmbGVjdGl2ZSA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5yZWZsZWN0aXZlKTtcbiAgICBtLnRyYW5zcGFyZW5jeSA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai50cmFuc3BhcmVuY3kpO1xuICAgIG0ucmVmcmFjdGl2ZUluZGV4ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnJlZnJhY3RpdmVJbmRleCk7XG4gICAgcmV0dXJuIG07XG59XG5leHBvcnRzLmRlU2VyaWFsaXplTWF0ZXJpYWwgPSBkZVNlcmlhbGl6ZU1hdGVyaWFsO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVQYXR0ZXJuKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgdmFyIHR5cGUgPSBkZXNlcmlhbGl6ZVN0cmluZyhvYmoudHlwZSk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5QZXJsaW5QYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcCA9IG5ldyBwYXR0ZXJuc18xLlBlcmxpblBhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudGhyZXNob2xkKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnNlZWQpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDIgPSBuZXcgcGF0dGVybnNfMS5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZShkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudXZTY2FsZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHAyO1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuQ2hlY2tlcjNkUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHAzID0gbmV3IHBhdHRlcm5zXzEuQ2hlY2tlcjNkUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwMztcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLlJpbmdQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDQgPSBuZXcgcGF0dGVybnNfMS5SaW5nUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwNDtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkdyYWRpZW50UGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHA1ID0gbmV3IHBhdHRlcm5zXzEuR3JhZGllbnRQYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA1O1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuU3RyaXBlUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHA2ID0gbmV3IHBhdHRlcm5zXzEuU3RyaXBlUGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwNjtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkNvbXBvc2l0ZVBhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwNyA9IG5ldyBwYXR0ZXJuc18xLkNvbXBvc2l0ZVBhdHRlcm4oZGVTZXJpYWxpemVQYXR0ZXJuKG9iai5wYXR0ZXJuMSksIGRlU2VyaWFsaXplUGF0dGVybihvYmoucGF0dGVybjIpKTtcbiAgICAgICAgICAgIHJldHVybiBwNztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCk7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplUGF0dGVybiA9IGRlU2VyaWFsaXplUGF0dGVybjtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICB2YXIgYXJyYXkgPSBkZVNlcmlhbGl6ZUFycmF5KG9iaiwgKHgpID0+IGRlU2VyaWFsaXplQXJyYXkoeCwgZGVzZXJpYWxpemVOdW1iZXIpKTtcbiAgICB2YXIgdyA9IG5ldyBtYXRyaXhfMS5NYXRyaXg0eDQoYXJyYXkpO1xuICAgIHJldHVybiB3O1xufVxuZXhwb3J0cy5kZXNlcmlhbGl6ZU1hdHJpeDR4NCA9IGRlc2VyaWFsaXplTWF0cml4NHg0O1xuZnVuY3Rpb24gZGVTZXJpYWxpemVXb3JsZChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBtYXRlcmlhbHMgPSBkZVNlcmlhbGl6ZUFycmF5KG9iai5tYXRlcmlhbHMsIGRlU2VyaWFsaXplTWF0ZXJpYWwpO1xuICAgIHZhciBtYXRlcmlhbHNNYXAgPSBuZXcgTWFwKG1hdGVyaWFscy5tYXAoKG0pID0+IFttLmlkLCBtXSkpO1xuICAgIHZhciB3ID0gbmV3IHdvcmxkXzEuV29ybGQoKTtcbiAgICB3LmxpZ2h0ID0gZGVTZXJpYWxpemVMaWdodChvYmoubGlnaHQpO1xuICAgIHcub2JqZWN0cyA9IGRlU2VyaWFsaXplQXJyYXkob2JqLm9iamVjdHMsIChzKSA9PiB7IHJldHVybiBkZVNlcmlhbGl6ZVNoYXBlcyhzLCBtYXRlcmlhbHNNYXApOyB9KTtcbiAgICByZXR1cm4gdztcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVXb3JsZCA9IGRlU2VyaWFsaXplV29ybGQ7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUFycmF5KG9iaiwgY2FsbGJhY2tmbikge1xuICAgIGlmIChvYmogPT0gbnVsbCB8fCAhQXJyYXkuaXNBcnJheShvYmopKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICByZXR1cm4gb2JqLm1hcChjYWxsYmFja2ZuKTtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVBcnJheSA9IGRlU2VyaWFsaXplQXJyYXk7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUxpZ2h0KG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIHBvaW50TGlnaHQgPSBuZXcgcG9pbnRMaWdodF8xLlBvaW50TGlnaHQoZGVzZXJpYWxpemVUdXBsZShvYmoucG9zaXRpb24pLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5pbnRlbnNpdHkpKTtcbiAgICByZXR1cm4gcG9pbnRMaWdodDtcbn1cbmV4cG9ydHMuZGVTZXJpYWxpemVMaWdodCA9IGRlU2VyaWFsaXplTGlnaHQ7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVR1cGxlKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIHQgPSBuZXcgdHVwbGVfMS5UdXBsZSgpO1xuICAgIHQueCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai54KTtcbiAgICB0LnkgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoueSk7XG4gICAgdC56ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnopO1xuICAgIHQudyA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai53KTtcbiAgICByZXR1cm4gdDtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVUdXBsZSA9IGRlc2VyaWFsaXplVHVwbGU7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZU51bWJlcihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgaXNOYU4ob2JqKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVOdW1iZXIgPSBkZXNlcmlhbGl6ZU51bWJlcjtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplU3RyaW5nKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCB8fCAhKCh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJyB8fCBvYmogaW5zdGFuY2VvZiBTdHJpbmcpKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVTdHJpbmcgPSBkZXNlcmlhbGl6ZVN0cmluZztcbmZ1bmN0aW9uIGRlc2VyaWFsaXplQ29sb3Iob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgY29sb3IgPSBuZXcgY29sb3JfMS5Db2xvcigpO1xuICAgIGNvbG9yLnJlZCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5yZWQpO1xuICAgIGNvbG9yLmdyZWVuID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmdyZWVuKTtcbiAgICBjb2xvci5ibHVlID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmJsdWUpO1xuICAgIHJldHVybiBjb2xvcjtcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVDb2xvciA9IGRlc2VyaWFsaXplQ29sb3I7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZUNhbWVyYShvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBjID0gbmV3IGNhbWVyYV8xLkNhbWVyYShkZXNlcmlhbGl6ZU51bWJlcihvYmouaHNpemUpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmoudnNpemUpLCBkZXNlcmlhbGl6ZU51bWJlcihvYmouZmllbGRPZlZpZXcpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgcmV0dXJuIGM7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplQ2FtZXJhID0gZGVTZXJpYWxpemVDYW1lcmE7XG5mdW5jdGlvbiBzZXJpYWxpemVDYW1lcmEoY2FtZXJhKSB7XG4gICAgcmV0dXJuIGNhbWVyYS50b09iamVjdCgpO1xufVxuZXhwb3J0cy5zZXJpYWxpemVDYW1lcmEgPSBzZXJpYWxpemVDYW1lcmE7XG5mdW5jdGlvbiBzZXJpYWxpemVQYXR0ZXJuKHBhdHRlcm4pIHtcbiAgICByZXR1cm4gcGF0dGVybiA9PSBudWxsID8gbnVsbCA6IHBhdHRlcm4udG9PYmplY3QoKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplUGF0dGVybiA9IHNlcmlhbGl6ZVBhdHRlcm47XG5mdW5jdGlvbiBzZXJpYWxpemVNYXRlcmlhbChtYXRlcmlhbCkge1xuICAgIHZhciBtID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBtYXRlcmlhbCksIHsgcGF0dGVybjogc2VyaWFsaXplUGF0dGVybihtYXRlcmlhbC5wYXR0ZXJuKSB9KTtcbiAgICByZXR1cm4gbTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplTWF0ZXJpYWwgPSBzZXJpYWxpemVNYXRlcmlhbDtcbmZ1bmN0aW9uIHNlcmlhbGl6ZVNoYXBlKHNoYXBlKSB7XG4gICAgaWYgKHNoYXBlIGluc3RhbmNlb2YgcGxhbmVfMS5QbGFuZSkge1xuICAgICAgICBsZXQgbyA9IHsgaWQ6IHNoYXBlLmlkLFxuICAgICAgICAgICAgdHlwZTogc2hhcGUuY29uc3RydWN0b3IubmFtZSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc2hhcGUudHJhbnNmb3JtLnRvQXJyYXkoKSxcbiAgICAgICAgICAgIG1hdGVyaWFsOiBzaGFwZS5tYXRlcmlhbC5pZCB9O1xuICAgICAgICByZXR1cm4gbztcbiAgICB9XG4gICAgZWxzZSBpZiAoc2hhcGUgaW5zdGFuY2VvZiBzcGhlcmVfMS5TcGhlcmUpIHtcbiAgICAgICAgbGV0IG8gPSB7IGlkOiBzaGFwZS5pZCxcbiAgICAgICAgICAgIHR5cGU6IHNoYXBlLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNoYXBlLnRyYW5zZm9ybS50b0FycmF5KCksXG4gICAgICAgICAgICBtYXRlcmlhbDogc2hhcGUubWF0ZXJpYWwuaWQgfTtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigpO1xufVxuZXhwb3J0cy5zZXJpYWxpemVTaGFwZSA9IHNlcmlhbGl6ZVNoYXBlO1xuZnVuY3Rpb24gc2VyaWFsaXplQXJyYXkoYXJyLCBjYWxsYmFja2ZuKSB7XG4gICAgcmV0dXJuIGFyci5tYXAoY2FsbGJhY2tmbik7XG59XG5leHBvcnRzLnNlcmlhbGl6ZUFycmF5ID0gc2VyaWFsaXplQXJyYXk7XG5mdW5jdGlvbiBzZXJpYWxpemVXb3JsZCh3b3JsZCkge1xuICAgIHZhciBzaGFyZWQgPSBuZXcgTWFwKCk7XG4gICAgdmFyIG1hdGVyaWFscyA9IHdvcmxkLm9iamVjdHMubWFwKChvKSA9PiBzZXJpYWxpemVNYXRlcmlhbChvLm1hdGVyaWFsKSk7XG4gICAgdmFyIG8gPSB7XG4gICAgICAgIGxpZ2h0OiB3b3JsZC5saWdodCxcbiAgICAgICAgbWF0ZXJpYWxzOiBtYXRlcmlhbHMsXG4gICAgICAgIG9iamVjdHM6IHNlcmlhbGl6ZUFycmF5KHdvcmxkLm9iamVjdHMsIHNlcmlhbGl6ZVNoYXBlKVxuICAgIH07XG4gICAgcmV0dXJuIG87XG59XG5leHBvcnRzLnNlcmlhbGl6ZVdvcmxkID0gc2VyaWFsaXplV29ybGQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXJpYWxpemluZy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWVyZ2VTb3J0SW5wbGFjZSA9IHZvaWQgMDtcbi8qKlxuICogTWVyZ2VzIDIgc29ydGVkIHJlZ2lvbnMgaW4gYW4gYXJyYXkgaW50byAxIHNvcnRlZCByZWdpb24gKGluLXBsYWNlIHdpdGhvdXQgZXh0cmEgbWVtb3J5LCBzdGFibGUpXG4gKiBAcGFyYW0gaXRlbXMgYXJyYXkgdG8gbWVyZ2VcbiAqIEBwYXJhbSBsZWZ0IGxlZnQgYXJyYXkgYm91bmRhcnkgaW5jbHVzaXZlXG4gKiBAcGFyYW0gbWlkZGxlIGJvdW5kYXJ5IGJldHdlZW4gcmVnaW9ucyAobGVmdCByZWdpb24gZXhjbHVzaXZlLCByaWdodCByZWdpb24gaW5jbHVzaXZlKVxuICogQHBhcmFtIHJpZ2h0IHJpZ2h0IGFycmF5IGJvdW5kYXJ5IGV4Y2x1c2l2ZVxuICovXG5mdW5jdGlvbiBtZXJnZUlucGxhY2UoaXRlbXMsIGNvbXBhcmVGbiwgbGVmdCwgbWlkZGxlLCByaWdodCkge1xuICAgIGlmIChyaWdodCA8PSBtaWRkbGUpXG4gICAgICAgIHJldHVybjtcbiAgICBmb3IgKHZhciBpID0gbGVmdDsgaSA8IG1pZGRsZTsgaSsrKSB7XG4gICAgICAgIHZhciBtaW5SaWdodCA9IGl0ZW1zW21pZGRsZV07XG4gICAgICAgIGlmIChjb21wYXJlRm4obWluUmlnaHQsIGl0ZW1zW2ldKSA8IDApIHtcbiAgICAgICAgICAgIHZhciB0bXAgPSBpdGVtc1tpXTtcbiAgICAgICAgICAgIGl0ZW1zW2ldID0gbWluUmlnaHQ7XG4gICAgICAgICAgICB2YXIgbmV4dEl0ZW07XG4gICAgICAgICAgICB2YXIgbmV4dCA9IG1pZGRsZSArIDE7XG4gICAgICAgICAgICB3aGlsZSAobmV4dCA8IHJpZ2h0ICYmIGNvbXBhcmVGbigobmV4dEl0ZW0gPSBpdGVtc1tuZXh0XSksIHRtcCkgPCAwKSB7XG4gICAgICAgICAgICAgICAgaXRlbXNbbmV4dCAtIDFdID0gbmV4dEl0ZW07XG4gICAgICAgICAgICAgICAgbmV4dCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbXNbbmV4dCAtIDFdID0gdG1wO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBJbi1wbGFjZSBib3R0b20gdXAgbWVyZ2Ugc29ydFxuICovXG5mdW5jdGlvbiBtZXJnZVNvcnRJbnBsYWNlKGl0ZW1zLCBjb21wYXJlRm4sIGZyb20sIHRvKSB7XG4gICAgZnJvbSAhPT0gbnVsbCAmJiBmcm9tICE9PSB2b2lkIDAgPyBmcm9tIDogKGZyb20gPSAwKTtcbiAgICB0byAhPT0gbnVsbCAmJiB0byAhPT0gdm9pZCAwID8gdG8gOiAodG8gPSBpdGVtcy5sZW5ndGgpO1xuICAgIHZhciBtYXhTdGVwID0gKHRvIC0gZnJvbSkgKiAyO1xuICAgIGZvciAodmFyIHN0ZXAgPSAyOyBzdGVwIDwgbWF4U3RlcDsgc3RlcCAqPSAyKSB7XG4gICAgICAgIHZhciBvbGRTdGVwID0gc3RlcCAvIDI7XG4gICAgICAgIGZvciAodmFyIHggPSBmcm9tOyB4IDwgdG87IHggKz0gc3RlcCkge1xuICAgICAgICAgICAgbWVyZ2VJbnBsYWNlKGl0ZW1zLCBjb21wYXJlRm4sIHgsIHggKyBvbGRTdGVwLCBNYXRoLm1pbih4ICsgc3RlcCwgdG8pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMubWVyZ2VTb3J0SW5wbGFjZSA9IG1lcmdlU29ydElucGxhY2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zb3J0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TcGhlcmUgPSB2b2lkIDA7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCBpbnRlcnNlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgbWF0ZXJpYWxfMSA9IHJlcXVpcmUoXCIuL21hdGVyaWFsXCIpO1xuY2xhc3MgU3BoZXJlIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdHJhbnNmb3JtLCBtYXRlcmlhbCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtICE9PSBudWxsICYmIHRyYW5zZm9ybSAhPT0gdm9pZCAwID8gdHJhbnNmb3JtIDogbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpO1xuICAgICAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWwgIT09IG51bGwgJiYgbWF0ZXJpYWwgIT09IHZvaWQgMCA/IG1hdGVyaWFsIDogbmV3IG1hdGVyaWFsXzEuTWF0ZXJpYWwoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAgICovXG4gICAgZ2V0IHRyYW5zZm9ybSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICB9XG4gICAgc2V0IHRyYW5zZm9ybSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtID0gdmFsdWUuaW52ZXJzZSgpO1xuICAgIH1cbiAgICBpbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7XG4gICAgICAgIHZhciBzcGhlcmUycmF5ID0gcmF5Lm9yaWdpbi5zdWJzdHJhY3QodHVwbGVfMS5UdXBsZS5wb2ludCgwLCAwLCAwKSk7XG4gICAgICAgIHZhciBhID0gcmF5LmRpcmVjdGlvbi5kb3QocmF5LmRpcmVjdGlvbik7XG4gICAgICAgIHZhciBiID0gMiAqIHJheS5kaXJlY3Rpb24uZG90KHNwaGVyZTJyYXkpO1xuICAgICAgICB2YXIgYyA9IHNwaGVyZTJyYXkuZG90KHNwaGVyZTJyYXkpIC0gMTtcbiAgICAgICAgdmFyIGRpc2NyaW1pbmFudCA9IGIgKiBiIC0gNCAqIGEgKiBjO1xuICAgICAgICBpZiAoZGlzY3JpbWluYW50IDwgMClcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgICAgICB2YXIgc3FydERpc2NyaW1pbmFudCA9IE1hdGguc3FydChkaXNjcmltaW5hbnQpO1xuICAgICAgICB2YXIgaTEgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgICAgICBpMS50ID0gKC1iIC0gc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgICAgICBpMS5vYmplY3QgPSB0aGlzO1xuICAgICAgICB2YXIgaTIgPSBpbnRlcnNlY3Rpb25zLmFkZCgpO1xuICAgICAgICBpMi50ID0gKC1iICsgc3FydERpc2NyaW1pbmFudCkgLyAoMiAqIGEpO1xuICAgICAgICBpMi5vYmplY3QgPSB0aGlzO1xuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICB9XG4gICAgbm9ybWFsQXQocCkge1xuICAgICAgICB2YXIgb2JqZWN0Tm9ybWFsID0gdGhpcy5pbnZlcnNlVHJhbnNmb3JtLm11bHRpcGx5KHApO1xuICAgICAgICBvYmplY3ROb3JtYWwudyA9IDA7XG4gICAgICAgIHZhciB3b3JsZE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS50cmFuc3Bvc2UoU3BoZXJlLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgICAgICB3b3JsZE5vcm1hbC53ID0gMDtcbiAgICAgICAgcmV0dXJuIHdvcmxkTm9ybWFsLm5vcm1hbGl6ZSgpO1xuICAgIH1cbn1cbmV4cG9ydHMuU3BoZXJlID0gU3BoZXJlO1xuU3BoZXJlLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3BoZXJlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5UdXBsZSA9IHZvaWQgMDtcbmNvbnN0IGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xuY2xhc3MgVHVwbGUge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHosIHcpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICAgICAgdGhpcy53ID0gdztcbiAgICB9XG4gICAgaXNQb2ludCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudyA9PSAxO1xuICAgIH1cbiAgICBpc1ZlY3RvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudyA9PSAwO1xuICAgIH1cbiAgICBhZGQodHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggKyB0dXBsZS54LCB0aGlzLnkgKyB0dXBsZS55LCB0aGlzLnogKyB0dXBsZS56LCB0aGlzLncgKyB0dXBsZS53KTtcbiAgICB9XG4gICAgbXVsdGlwbHkoc2NhbGFyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICogc2NhbGFyLCB0aGlzLnkgKiBzY2FsYXIsIHRoaXMueiAqIHNjYWxhciwgdGhpcy53ICogc2NhbGFyKTtcbiAgICB9XG4gICAgZGl2aWRlKHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyLCB0aGlzLnogLyBzY2FsYXIsIHRoaXMudyAvIHNjYWxhcik7XG4gICAgfVxuICAgIHN1YnN0cmFjdCh0dXBsZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAtIHR1cGxlLngsIHRoaXMueSAtIHR1cGxlLnksIHRoaXMueiAtIHR1cGxlLnosIHRoaXMudyAtIHR1cGxlLncpO1xuICAgIH1cbiAgICBuZWdhdGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiwgLXRoaXMudyk7XG4gICAgfVxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGl2aWRlKHRoaXMubWFnbml0dWRlKCkpO1xuICAgIH1cbiAgICBtYWduaXR1ZGUoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53KTtcbiAgICB9XG4gICAgZG90KHR1cGxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggKiB0dXBsZS54ICsgdGhpcy55ICogdHVwbGUueSArIHRoaXMueiAqIHR1cGxlLnogKyB0aGlzLncgKiB0dXBsZS53O1xuICAgIH1cbiAgICBjcm9zcyh0dXBsZSkge1xuICAgICAgICByZXR1cm4gVHVwbGUudmVjdG9yKHRoaXMueSAqIHR1cGxlLnogLSB0aGlzLnogKiB0dXBsZS55LCB0aGlzLnogKiB0dXBsZS54IC0gdGhpcy54ICogdHVwbGUueiwgdGhpcy54ICogdHVwbGUueSAtIHRoaXMueSAqIHR1cGxlLngpO1xuICAgIH1cbiAgICByZWZsZWN0KG5vcm1hbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdWJzdHJhY3Qobm9ybWFsLm11bHRpcGx5KDIgKiB0aGlzLmRvdChub3JtYWwpKSk7XG4gICAgfVxuICAgIGVxdWFscyh0dXBsZSkge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy54IC0gdHVwbGUueCkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLnkgLSB0dXBsZS55KSA8IGNvbnN0YW50c18xLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMueiAtIHR1cGxlLnopIDwgY29uc3RhbnRzXzEuRVBTSUxPTjtcbiAgICB9XG4gICAgc3RhdGljIHBvaW50KHgsIHksIHopIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh4LCB5LCB6LCAxKTtcbiAgICB9XG4gICAgc3RhdGljIHZlY3Rvcih4LCB5LCB6KSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoeCwgeSwgeiwgMCk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCwgdGhpcy55LCB0aGlzLnosIHRoaXMudyk7XG4gICAgfVxufVxuZXhwb3J0cy5UdXBsZSA9IFR1cGxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHVwbGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLldvcmxkID0gdm9pZCAwO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY29uc3QgY29tcHV0YXRpb25zXzEgPSByZXF1aXJlKFwiLi9jb21wdXRhdGlvbnNcIik7XG5jb25zdCBpbnRlcnNlY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdGlvblwiKTtcbmNvbnN0IHJheV8xID0gcmVxdWlyZShcIi4vcmF5XCIpO1xuY2xhc3MgV29ybGQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cbiAgICByZWZyYWN0ZWRDb2xvcihjb21wcywgcmVtYWluaW5nKSB7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPT0gMCB8fCBjb21wcy5vYmplY3QubWF0ZXJpYWwudHJhbnNwYXJlbmN5ID09IDApXG4gICAgICAgICAgICByZXR1cm4gY29sb3JfMS5Db2xvci5CTEFDSy5jbG9uZSgpO1xuICAgICAgICB2YXIgblJhdGlvID0gY29tcHMubjEgLyBjb21wcy5uMjtcbiAgICAgICAgdmFyIGNvc0kgPSBjb21wcy5leWV2LmRvdChjb21wcy5ub3JtYWx2KTtcbiAgICAgICAgdmFyIHNpbjJ0ID0gblJhdGlvICogblJhdGlvICogKDEgLSBjb3NJICogY29zSSk7XG4gICAgICAgIGlmIChzaW4ydCA+IDEpXG4gICAgICAgICAgICByZXR1cm4gY29sb3JfMS5Db2xvci5CTEFDSy5jbG9uZSgpO1xuICAgICAgICB2YXIgY29zVCA9IE1hdGguc3FydCgxIC0gc2luMnQpO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gY29tcHMubm9ybWFsdi5tdWx0aXBseShuUmF0aW8gKiBjb3NJIC0gY29zVCkuc3Vic3RyYWN0KGNvbXBzLmV5ZXYubXVsdGlwbHkoblJhdGlvKSk7XG4gICAgICAgIHZhciByZWZyYWN0UmF5ID0gbmV3IHJheV8xLlJheShjb21wcy51bmRlclBvaW50LCBkaXJlY3Rpb24pO1xuICAgICAgICB2YXIgY29sb3IgPSB0aGlzLmNvbG9yQXQocmVmcmFjdFJheSwgcmVtYWluaW5nIC0gMSkubXVsdGlwbHkoY29tcHMub2JqZWN0Lm1hdGVyaWFsLnRyYW5zcGFyZW5jeSk7XG4gICAgICAgIHJldHVybiBjb2xvcjtcbiAgICB9XG4gICAgc2hhZGVIaXQoY29tcHMsIHJlbWFpbmluZyA9IDApIHtcbiAgICAgICAgdmFyIHN1cmZhY2UgPSBjb21wcy5vYmplY3QubWF0ZXJpYWwubGlnaHRpbmcodGhpcy5saWdodCwgY29tcHMub2JqZWN0LCBjb21wcy5wb2ludCwgY29tcHMuZXlldiwgY29tcHMubm9ybWFsdiwgdGhpcy5pc1NoYWRvd2VkKGNvbXBzLm92ZXJQb2ludCkpO1xuICAgICAgICB2YXIgcmVmbGVjdGVkID0gdGhpcy5yZWZsZWN0ZWRDb2xvcihjb21wcywgcmVtYWluaW5nKTtcbiAgICAgICAgdmFyIHJlZnJhY3RlZCA9IHRoaXMucmVmcmFjdGVkQ29sb3IoY29tcHMsIHJlbWFpbmluZyk7XG4gICAgICAgIHZhciBtYXRlcmlhbCA9IGNvbXBzLm9iamVjdC5tYXRlcmlhbDtcbiAgICAgICAgaWYgKG1hdGVyaWFsLnJlZmxlY3RpdmUgPiAwICYmIG1hdGVyaWFsLnRyYW5zcGFyZW5jeSA+IDApIHtcbiAgICAgICAgICAgIHZhciByZWZsZWN0YW5jZSA9IGNvbXBzLnNjaGxpY2soKTtcbiAgICAgICAgICAgIHJldHVybiBzdXJmYWNlLmFkZChyZWZsZWN0ZWQubXVsdGlwbHkocmVmbGVjdGFuY2UpKS5hZGQocmVmcmFjdGVkLm11bHRpcGx5KDEgLSByZWZsZWN0YW5jZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXJmYWNlLmFkZChyZWZsZWN0ZWQpLmFkZChyZWZyYWN0ZWQpO1xuICAgIH1cbiAgICBjb2xvckF0KHJheSwgcmVtYWluaW5nID0gNCkge1xuICAgICAgICBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5jbGVhcigpO1xuICAgICAgICB0aGlzLmludGVyc2VjdChyYXksIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgV29ybGQudGVtcEludGVyc2VjdGlvbnMuc29ydCgpO1xuICAgICAgICB2YXIgaSA9IFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmZpcnN0SGl0KCk7XG4gICAgICAgIGlmIChpID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gY29sb3JfMS5Db2xvci5CTEFDSy5jbG9uZSgpO1xuICAgICAgICB2YXIgY29tcCA9IGNvbXB1dGF0aW9uc18xLkNvbXB1dGF0aW9ucy5wcmVwYXJlKGksIHJheSwgV29ybGQudGVtcEludGVyc2VjdGlvbnMpO1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkZUhpdChjb21wLCByZW1haW5pbmcpO1xuICAgIH1cbiAgICBpbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICBmb3IgKHZhciBvIG9mIHRoaXMub2JqZWN0cykge1xuICAgICAgICAgICAgby5pbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICB9XG4gICAgaXNTaGFkb3dlZChwb2ludCkge1xuICAgICAgICB2YXIgdiA9IHRoaXMubGlnaHQucG9zaXRpb24uc3Vic3RyYWN0KHBvaW50KTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdi5tYWduaXR1ZGUoKTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHYubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciByID0gbmV3IHJheV8xLlJheShwb2ludCwgZGlyZWN0aW9uKTtcbiAgICAgICAgV29ybGQudGVtcEludGVyc2VjdGlvbnMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5pbnRlcnNlY3QociwgV29ybGQudGVtcEludGVyc2VjdGlvbnMpO1xuICAgICAgICB2YXIgaCA9IFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmhpdCgpO1xuICAgICAgICByZXR1cm4gKGggIT0gbnVsbCAmJiBoLnQgPCBkaXN0YW5jZSk7XG4gICAgfVxuICAgIHJlZmxlY3RlZENvbG9yKGNvbXBzLCByZW1haW5pbmcpIHtcbiAgICAgICAgaWYgKHJlbWFpbmluZyA9PSAwIHx8IGNvbXBzLm9iamVjdC5tYXRlcmlhbC5yZWZsZWN0aXZlID09IDApXG4gICAgICAgICAgICByZXR1cm4gbmV3IGNvbG9yXzEuQ29sb3IoMCwgMCwgMCk7XG4gICAgICAgIHZhciByZWZsZWN0UmF5ID0gbmV3IHJheV8xLlJheShjb21wcy5vdmVyUG9pbnQsIGNvbXBzLnJlZmxlY3R2KTtcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5jb2xvckF0KHJlZmxlY3RSYXksIHJlbWFpbmluZyAtIDEpO1xuICAgICAgICByZXR1cm4gY29sb3IubXVsdGlwbHkoY29tcHMub2JqZWN0Lm1hdGVyaWFsLnJlZmxlY3RpdmUpO1xuICAgIH1cbn1cbmV4cG9ydHMuV29ybGQgPSBXb3JsZDtcbldvcmxkLnRlbXBJbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoMTAwKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdvcmxkLmpzLm1hcCIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBDYW52YXMgfSBmcm9tIFwicmF5dHJhY2VyL2NhbnZhc1wiO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tIFwicmF5dHJhY2VyL2NvbG9yXCI7XG5pbXBvcnQgeyBJbnRlcnNlY3Rpb24sIEludGVyc2VjdGlvbnMgfSBmcm9tIFwicmF5dHJhY2VyL2ludGVyc2VjdGlvblwiO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tIFwicmF5dHJhY2VyL21hdGVyaWFsXCI7XG5pbXBvcnQgeyBNYXRyaXg0eDQgfSBmcm9tIFwicmF5dHJhY2VyL21hdHJpeFwiO1xuaW1wb3J0IHsgUG9pbnRMaWdodCB9IGZyb20gXCJyYXl0cmFjZXIvcG9pbnRMaWdodFwiO1xuaW1wb3J0IHsgV29ybGQgfSBmcm9tIFwicmF5dHJhY2VyL3dvcmxkXCI7XG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tIFwicmF5dHJhY2VyL3NwaGVyZVwiO1xuaW1wb3J0IHsgVHVwbGUgfSBmcm9tIFwicmF5dHJhY2VyL3R1cGxlXCI7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tIFwicmF5dHJhY2VyL2NhbWVyYVwiO1xuaW1wb3J0IHsgUGxhbmUgfSBmcm9tIFwicmF5dHJhY2VyL3BsYW5lXCI7XG5pbXBvcnQgeyBHcmFkaWVudFBhdHRlcm4sIFJpbmdQYXR0ZXJuLCBTdHJpcGVQYXR0ZXJuLCBDaGVja2VyM2RQYXR0ZXJuLCBDaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSwgUGVybGluUGF0dGVybiwgUGF0dGVybiwgQ29tcG9zaXRlUGF0dGVybiB9IGZyb20gXCJyYXl0cmFjZXIvcGF0dGVybnNcIjtcbmltcG9ydCB7IEVQU0lMT04gfSBmcm9tIFwicmF5dHJhY2VyL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgUmVuZGVySm9iLCBXZWJXb3JrZXJRdWV1ZSB9IGZyb20gXCIuL3JlbmRlcmpvYlwiO1xuaW1wb3J0ICogYXMgc2VyaWFsaXplIGZyb20gXCJyYXl0cmFjZXIvc2VyaWFsaXppbmdcIlxuXG5cbnZhciB3b3JsZD0gbmV3IFdvcmxkKCk7XG52YXIgZmxvb3IgPSBuZXcgUGxhbmUoMCk7XG5mbG9vci5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKDApO1xuZmxvb3IubWF0ZXJpYWwucGF0dGVybj0gbmV3IENvbXBvc2l0ZVBhdHRlcm4oXG4gICAgbmV3IEdyYWRpZW50UGF0dGVybihuZXcgQ29sb3IoMC4yLDAuNCwwLjUpLCBuZXcgQ29sb3IoMC4xLDAuOSwwLjcpKSxcbiAgICBuZXcgR3JhZGllbnRQYXR0ZXJuKG5ldyBDb2xvcigwLjIsMC40LDAuNSksIG5ldyBDb2xvcigwLjEsMC45LDAuNyksTWF0cml4NHg0LnJvdGF0aW9uWShNYXRoLlBJLzIpKSxcbik7XG5mbG9vci50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMCwwKTtcbmZsb29yLm1hdGVyaWFsLnJlZmxlY3RpdmU9MC4yO1xuXG5cblxuXG52YXIgc3BoZXJlMT1uZXcgU3BoZXJlKDQpO1xuc3BoZXJlMS50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDIsMS41LC03LjUpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDEuNSwxLjUsMS41KSk7XG5zcGhlcmUxLm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoMik7XG5zcGhlcmUxLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMC4xLDAuNywwLjIpO1xuc3BoZXJlMS5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbnNwaGVyZTEubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xuc3BoZXJlMS5tYXRlcmlhbC5wYXR0ZXJuPSBuZXcgUGVybGluUGF0dGVybihuZXcgQ29sb3IoMC4xLDAuNywwLjIpLG5ldyBDb2xvcigxLDEsMSksMC4xNSk7XG5zcGhlcmUxLm1hdGVyaWFsLnRyYW5zcGFyZW5jeT0wO1xuc3BoZXJlMS5tYXRlcmlhbC5yZWZsZWN0aXZlPTAuNTtcblxuXG52YXIgc3BoZXJlMj1uZXcgU3BoZXJlKDUpO1xuc3BoZXJlMi50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKC01LDQsLTkpLm11bHRpcGx5KE1hdHJpeDR4NC5zY2FsaW5nKDQsNCw0KSk7XG5zcGhlcmUyLm1hdGVyaWFsPSBuZXcgTWF0ZXJpYWwoNCk7XG5zcGhlcmUyLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMSwwLjgsMC4xKTtcbnNwaGVyZTIubWF0ZXJpYWwucmVmbGVjdGl2ZT0wLjU7XG5cbnZhciBzcGhlcmUzPW5ldyBTcGhlcmUoMyk7XG5zcGhlcmUzLnRyYW5zZm9ybT0gIE1hdHJpeDR4NC50cmFuc2xhdGlvbig0LDMsNSkubXVsdGlwbHkoTWF0cml4NHg0LnNjYWxpbmcoMywzLDMpKTtcbnNwaGVyZTMubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCgxKTtcbnNwaGVyZTMubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLDAsMC4yKTtcbnNwaGVyZTMubWF0ZXJpYWwuc3BlY3VsYXI9MC45O1xuc3BoZXJlMy5tYXRlcmlhbC5kaWZmdXNlPTAuNDtcbnNwaGVyZTMubWF0ZXJpYWwudHJhbnNwYXJlbmN5PTAuOTtcbnNwaGVyZTMubWF0ZXJpYWwuYW1iaWVudD0wO1xuc3BoZXJlMy5tYXRlcmlhbC5zaGluaW5lc3M9MzAwO1xuLy9zcGhlcmUzLm1hdGVyaWFsLnJlZnJhY3RpdmVJbmRleD0wO1xuc3BoZXJlMy5tYXRlcmlhbC5yZWZsZWN0aXZlPSAwLjk7XG5cblxudmFyIHdhbGw9bmV3IFBsYW5lKDYpO1xud2FsbC50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMCwxNSkubXVsdGlwbHkoTWF0cml4NHg0LnJvdGF0aW9uWChNYXRoLlBJLzIpKTtcbndhbGwubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCg1KTtcbndhbGwubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigxLDEsMSk7XG53YWxsLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xud2FsbC5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG53YWxsLm1hdGVyaWFsLnBhdHRlcm49IG5ldyBDaGVja2VyM2RQYXR0ZXJuKG5ldyBDb2xvcigwLDAuMSwwLjcpLCBuZXcgQ29sb3IoMSwxLDEpLE1hdHJpeDR4NC50cmFuc2xhdGlvbigwLEVQU0lMT04sMCkpO1xuXG5cbnZhciB3YWxsMj1uZXcgUGxhbmUoNyk7XG53YWxsMi50cmFuc2Zvcm09TWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsMCwtMTUpLm11bHRpcGx5KE1hdHJpeDR4NC5yb3RhdGlvblgoTWF0aC5QSS8yKSk7XG53YWxsMi5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKDYpO1xud2FsbDIubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLDAsMC44KTtcbndhbGwyLm1hdGVyaWFsLmRpZmZ1c2U9MC43O1xud2FsbDIubWF0ZXJpYWwuc3BlY3VsYXI9MC4zO1xud2FsbDIubWF0ZXJpYWwucGF0dGVybj0gbmV3IENoZWNrZXIzZFBhdHRlcm4obmV3IENvbG9yKDAsMC4xLDAuNyksIG5ldyBDb2xvcigxLDEsMSksTWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsRVBTSUxPTiwwKSk7XG5cblxudmFyIHdhbGwzPW5ldyBQbGFuZSg2KTtcbndhbGwzLnRyYW5zZm9ybT1NYXRyaXg0eDQudHJhbnNsYXRpb24oMTUsMCwwKS5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25aKE1hdGguUEkvMikpO1xud2FsbDMubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCg4KTtcbndhbGwzLm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMSwxLDEpO1xud2FsbDMubWF0ZXJpYWwuZGlmZnVzZT0wLjc7XG53YWxsMy5tYXRlcmlhbC5zcGVjdWxhcj0wLjM7XG53YWxsMy5tYXRlcmlhbC5wYXR0ZXJuPSBuZXcgQ2hlY2tlcjNkUGF0dGVybihuZXcgQ29sb3IoMCwwLjEsMC43KSwgbmV3IENvbG9yKDEsMSwxKSxNYXRyaXg0eDQudHJhbnNsYXRpb24oMCxFUFNJTE9OLDApKTtcblxuXG52YXIgd2FsbDQ9bmV3IFBsYW5lKDcpO1xud2FsbDQudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigtMTUsMCwwKS5tdWx0aXBseShNYXRyaXg0eDQucm90YXRpb25aKE1hdGguUEkvMikpO1xud2FsbDQubWF0ZXJpYWw9IG5ldyBNYXRlcmlhbCg5KTtcbndhbGw0Lm1hdGVyaWFsLmNvbG9yPSBuZXcgQ29sb3IoMCwwLDAuOCk7XG53YWxsNC5tYXRlcmlhbC5kaWZmdXNlPTAuNztcbndhbGw0Lm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcbndhbGw0Lm1hdGVyaWFsLnBhdHRlcm49IG5ldyBDaGVja2VyM2RQYXR0ZXJuKG5ldyBDb2xvcigwLDAuMSwwLjcpLCBuZXcgQ29sb3IoMSwxLDEpLE1hdHJpeDR4NC50cmFuc2xhdGlvbigwLEVQU0lMT04sMCkpO1xuXG5cbnZhciBjZWlsaW5nPW5ldyBQbGFuZSg3KTtcbmNlaWxpbmcudHJhbnNmb3JtPU1hdHJpeDR4NC50cmFuc2xhdGlvbigwLDE1LDApO1xuY2VpbGluZy5tYXRlcmlhbD0gbmV3IE1hdGVyaWFsKDEwKTtcbmNlaWxpbmcubWF0ZXJpYWwuY29sb3I9IG5ldyBDb2xvcigwLDAsMC44KTtcbmNlaWxpbmcubWF0ZXJpYWwuZGlmZnVzZT0wLjc7XG5jZWlsaW5nLm1hdGVyaWFsLnNwZWN1bGFyPTAuMztcbmNlaWxpbmcubWF0ZXJpYWwucGF0dGVybj0gbmV3IENoZWNrZXIzZFBhdHRlcm4obmV3IENvbG9yKDAsMC4xLDAuNyksIG5ldyBDb2xvcigxLDEsMSksTWF0cml4NHg0LnRyYW5zbGF0aW9uKDAsRVBTSUxPTiwwKSk7XG5cblxuXG53b3JsZC5vYmplY3RzPSBbc3BoZXJlMixzcGhlcmUxLHNwaGVyZTMsZmxvb3Isd2FsbCx3YWxsMix3YWxsMyx3YWxsNCxjZWlsaW5nXTtcbndvcmxkLmxpZ2h0PSBuZXcgUG9pbnRMaWdodChUdXBsZS5wb2ludCgwLDEwLDApLENvbG9yLldISVRFLmNsb25lKCkpO1xuXG52YXIgY2FtZXJhPSBuZXcgQ2FtZXJhKDEwMjQsMTAyNCxNYXRoLlBJLzMsIFxuICAgIE1hdHJpeDR4NC52aWV3VHJhbnNmb3JtKFR1cGxlLnBvaW50KDEwLDUsNyksVHVwbGUucG9pbnQoMCwxLDApLFR1cGxlLnZlY3RvcigwLDEsMCkpXG4gICAgKTtcblxudmFyIHJheXRyYWNlckNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJheXRyYWNlckNhbnZhc1wiKVxucmF5dHJhY2VyQ2FudmFzLndpZHRoPWNhbWVyYS5oc2l6ZTtcbnJheXRyYWNlckNhbnZhcy5oZWlnaHQ9Y2FtZXJhLnZzaXplO1xuY29uc29sZS50aW1lKFwicmVuZGVyXCIpXG5cbnZhciByID0gbmV3IFJlbmRlckpvYihuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSxcbiAgICByYXl0cmFjZXJDYW52YXMsXG4gICAgXCJjaGFwdGVyMTFyZW5kZXJXb3JrZXItYnVuZGxlLmpzXCJcbiAgICApO1xuXG5yLnN0YXJ0KHdvcmxkLGNhbWVyYSk7XG5cbnIub25SZW5kZXJpbmdGaW5pc2hlZD1cbiAgICAoKT0+XG4gICAge1xuICAgICAgICBjb25zb2xlLnRpbWVFbmQoXCJyZW5kZXJcIilcbiAgICB9O1xuXG4vKlxuXG52YXIgcmVuZGVyRGF0YSA9IGNhbWVyYS5yZW5kZXJQYXJ0aWFsKHdvcmxkKTtcbnZhciBpbWFnZURhdGEgPSBuZXcgSW1hZ2VEYXRhKHJlbmRlckRhdGEsIGNhbWVyYS5oc2l6ZSwgY2FtZXJhLnZzaXplKTtcbnZhciBjdHggPSByYXl0cmFjZXJDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuY29uc29sZS50aW1lRW5kKFwicmVuZGVyXCIpXG4qL1xuXG5cblxuXG5cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==