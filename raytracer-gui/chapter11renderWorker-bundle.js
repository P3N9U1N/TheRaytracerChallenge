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

/***/ "./src/render-worker.ts":
/*!******************************!*\
  !*** ./src/render-worker.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0Esd0JBQXdCLG1CQUFtQjtBQUMzQyw0QkFBNEIsa0JBQWtCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsaUJBQWlCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLGdCQUFnQjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsaUJBQWlCO0FBQ3pDO0FBQ0E7QUFDQSw0QkFBNEIsZ0JBQWdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isc0JBQXNCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7Ozs7OztVQ3ZFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi8yZC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL25vZGVfbW9kdWxlcy9mYXN0LXNpbXBsZXgtbm9pc2UvbGliLzNkLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vbm9kZV9tb2R1bGVzL2Zhc3Qtc2ltcGxleC1ub2lzZS9saWIvNGQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9ub2RlX21vZHVsZXMvZmFzdC1zaW1wbGV4LW5vaXNlL2xpYi9tb2QuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uL3NyYy9yZW5kZXItd29ya2VyLnRzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY2FtZXJhLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY2FudmFzLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29sbGVjdGlvbi5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L2NvbG9yLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29tcHV0YXRpb25zLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvY29uc3RhbnRzLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvaW50ZXJzZWN0aW9uLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvbWF0ZXJpYWwuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9tYXRyaXguanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS8uLi9yYXl0cmFjZXIvZGlzdC9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3BsYW5lLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3QvcG9pbnRMaWdodC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3JheS5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3NlcmlhbGl6aW5nLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvc29ydC5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3NwaGVyZS5qcyIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpLy4uL3JheXRyYWNlci9kaXN0L3R1cGxlLmpzIiwid2VicGFjazovL3JheXRyYWNlci1ndWkvLi4vcmF5dHJhY2VyL2Rpc3Qvd29ybGQuanMiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9yYXl0cmFjZXItZ3VpL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vcmF5dHJhY2VyLWd1aS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuICogT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICpcbiAqIFRoaXMgY29kZSB3YXMgcGxhY2VkIGluIHRoZSBwdWJsaWMgZG9tYWluIGJ5IGl0cyBvcmlnaW5hbCBhdXRob3IsXG4gKiBTdGVmYW4gR3VzdGF2c29uLiBZb3UgbWF5IHVzZSBpdCBhcyB5b3Ugc2VlIGZpdCwgYnV0XG4gKiBhdHRyaWJ1dGlvbiBpcyBhcHByZWNpYXRlZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2UyRCA9IHZvaWQgMDtcbnZhciBHMiA9ICgzLjAgLSBNYXRoLnNxcnQoMy4wKSkgLyA2LjA7XG52YXIgR3JhZCA9IFtcbiAgICBbMSwgMV0sXG4gICAgWy0xLCAxXSxcbiAgICBbMSwgLTFdLFxuICAgIFstMSwgLTFdLFxuICAgIFsxLCAwXSxcbiAgICBbLTEsIDBdLFxuICAgIFsxLCAwXSxcbiAgICBbLTEsIDBdLFxuICAgIFswLCAxXSxcbiAgICBbMCwgLTFdLFxuICAgIFswLCAxXSxcbiAgICBbMCwgLTFdLFxuXTtcbmZ1bmN0aW9uIG1ha2VOb2lzZTJEKHJhbmRvbSkge1xuICAgIGlmIChyYW5kb20gPT09IHZvaWQgMCkgeyByYW5kb20gPSBNYXRoLnJhbmRvbTsgfVxuICAgIHZhciBwID0gbmV3IFVpbnQ4QXJyYXkoMjU2KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKVxuICAgICAgICBwW2ldID0gaTtcbiAgICB2YXIgbjtcbiAgICB2YXIgcTtcbiAgICBmb3IgKHZhciBpID0gMjU1OyBpID4gMDsgaS0tKSB7XG4gICAgICAgIG4gPSBNYXRoLmZsb29yKChpICsgMSkgKiByYW5kb20oKSk7XG4gICAgICAgIHEgPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtuXTtcbiAgICAgICAgcFtuXSA9IHE7XG4gICAgfVxuICAgIHZhciBwZXJtID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICB2YXIgcGVybU1vZDEyID0gbmV3IFVpbnQ4QXJyYXkoNTEyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUxMjsgaSsrKSB7XG4gICAgICAgIHBlcm1baV0gPSBwW2kgJiAyNTVdO1xuICAgICAgICBwZXJtTW9kMTJbaV0gPSBwZXJtW2ldICUgMTI7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIHZhciBzID0gKHggKyB5KSAqIDAuNSAqIChNYXRoLnNxcnQoMy4wKSAtIDEuMCk7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHggKyBzKTtcbiAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcbiAgICAgICAgdmFyIHQgPSAoaSArIGopICogRzI7XG4gICAgICAgIHZhciBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2VcbiAgICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICAgIHZhciB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgICAgdmFyIHkwID0geSAtIFkwO1xuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICAgIHZhciBpMSA9IHgwID4geTAgPyAxIDogMDtcbiAgICAgICAgdmFyIGoxID0geDAgPiB5MCA/IDAgOiAxO1xuICAgICAgICAvLyBPZmZzZXRzIGZvciBjb3JuZXJzXG4gICAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHMjtcbiAgICAgICAgdmFyIHkxID0geTAgLSBqMSArIEcyO1xuICAgICAgICB2YXIgeDIgPSB4MCAtIDEuMCArIDIuMCAqIEcyO1xuICAgICAgICB2YXIgeTIgPSB5MCAtIDEuMCArIDIuMCAqIEcyO1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIHRocmVlIHNpbXBsZXggY29ybmVyc1xuICAgICAgICB2YXIgaWkgPSBpICYgMjU1O1xuICAgICAgICB2YXIgamogPSBqICYgMjU1O1xuICAgICAgICB2YXIgZzAgPSBHcmFkW3Blcm1Nb2QxMltpaSArIHBlcm1bampdXV07XG4gICAgICAgIHZhciBnMSA9IEdyYWRbcGVybU1vZDEyW2lpICsgaTEgKyBwZXJtW2pqICsgajFdXV07XG4gICAgICAgIHZhciBnMiA9IEdyYWRbcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxXV1dO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSB0aHJlZSBjb3JuZXJzXG4gICAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwO1xuICAgICAgICB2YXIgbjAgPSB0MCA8IDAgPyAwLjAgOiBNYXRoLnBvdyh0MCwgNCkgKiAoZzBbMF0gKiB4MCArIGcwWzFdICogeTApO1xuICAgICAgICB2YXIgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MTtcbiAgICAgICAgdmFyIG4xID0gdDEgPCAwID8gMC4wIDogTWF0aC5wb3codDEsIDQpICogKGcxWzBdICogeDEgKyBnMVsxXSAqIHkxKTtcbiAgICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTI7XG4gICAgICAgIHZhciBuMiA9IHQyIDwgMCA/IDAuMCA6IE1hdGgucG93KHQyLCA0KSAqIChnMlswXSAqIHgyICsgZzJbMV0gKiB5Mik7XG4gICAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWy0xLCAxXVxuICAgICAgICByZXR1cm4gNzAuMTQ4MDU3NzA2NTM5NTIgKiAobjAgKyBuMSArIG4yKTtcbiAgICB9O1xufVxuZXhwb3J0cy5tYWtlTm9pc2UyRCA9IG1ha2VOb2lzZTJEO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICogQmFzZWQgb24gZXhhbXBsZSBjb2RlIGJ5IFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWd1QGl0bi5saXUuc2UpLlxuICogT3B0aW1pc2F0aW9ucyBieSBQZXRlciBFYXN0bWFuIChwZWFzdG1hbkBkcml6emxlLnN0YW5mb3JkLmVkdSkuXG4gKiBCZXR0ZXIgcmFuayBvcmRlcmluZyBtZXRob2QgYnkgU3RlZmFuIEd1c3RhdnNvbiBpbiAyMDEyLlxuICpcbiAqIFRoaXMgY29kZSB3YXMgcGxhY2VkIGluIHRoZSBwdWJsaWMgZG9tYWluIGJ5IGl0cyBvcmlnaW5hbCBhdXRob3IsXG4gKiBTdGVmYW4gR3VzdGF2c29uLiBZb3UgbWF5IHVzZSBpdCBhcyB5b3Ugc2VlIGZpdCwgYnV0XG4gKiBhdHRyaWJ1dGlvbiBpcyBhcHByZWNpYXRlZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5tYWtlTm9pc2UzRCA9IHZvaWQgMDtcbnZhciBHMyA9IDEuMCAvIDYuMDtcbnZhciBHcmFkID0gW1xuICAgIFsxLCAxLCAwXSxcbiAgICBbLTEsIDEsIDBdLFxuICAgIFsxLCAtMSwgMF0sXG4gICAgWy0xLCAtMSwgMF0sXG4gICAgWzEsIDAsIDFdLFxuICAgIFstMSwgMCwgMV0sXG4gICAgWzEsIDAsIC0xXSxcbiAgICBbLTEsIDAsIC0xXSxcbiAgICBbMCwgMSwgMV0sXG4gICAgWzAsIC0xLCAtMV0sXG4gICAgWzAsIDEsIC0xXSxcbiAgICBbMCwgLTEsIC0xXSxcbl07XG5mdW5jdGlvbiBtYWtlTm9pc2UzRChyYW5kb20pIHtcbiAgICBpZiAocmFuZG9tID09PSB2b2lkIDApIHsgcmFuZG9tID0gTWF0aC5yYW5kb207IH1cbiAgICB2YXIgcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcbiAgICAgICAgcFtpXSA9IGk7XG4gICAgdmFyIG47XG4gICAgdmFyIHE7XG4gICAgZm9yICh2YXIgaSA9IDI1NTsgaSA+IDA7IGktLSkge1xuICAgICAgICBuID0gTWF0aC5mbG9vcigoaSArIDEpICogcmFuZG9tKCkpO1xuICAgICAgICBxID0gcFtpXTtcbiAgICAgICAgcFtpXSA9IHBbbl07XG4gICAgICAgIHBbbl0gPSBxO1xuICAgIH1cbiAgICB2YXIgcGVybSA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgdmFyIHBlcm1Nb2QxMiA9IG5ldyBVaW50OEFycmF5KDUxMik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MTI7IGkrKykge1xuICAgICAgICBwZXJtW2ldID0gcFtpICYgMjU1XTtcbiAgICAgICAgcGVybU1vZDEyW2ldID0gcGVybVtpXSAlIDEyO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHopIHtcbiAgICAgICAgLy8gU2tldyB0aGUgaW5wdXQgc3BhY2UgdG8gZGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggY2VsbCB3ZSdyZSBpblxuICAgICAgICB2YXIgcyA9ICh4ICsgeSArIHopIC8gMy4wOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0RcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHggKyBzKTtcbiAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcbiAgICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHogKyBzKTtcbiAgICAgICAgdmFyIHQgPSAoaSArIGogKyBrKSAqIEczO1xuICAgICAgICB2YXIgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseikgc3BhY2VcbiAgICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgICB2YXIgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkseiBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgICAgdmFyIHkwID0geSAtIFkwO1xuICAgICAgICB2YXIgejAgPSB6IC0gWjA7XG4gICAgICAgIC8vIERldGVyaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluXG4gICAgICAgIHZhciBpMSwgajEsIGsxIC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgICA7XG4gICAgICAgIHZhciBpMiwgajIsIGsyIC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICAgIDtcbiAgICAgICAgaWYgKHgwID49IHkwKSB7XG4gICAgICAgICAgICBpZiAoeTAgPj0gejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IGkyID0gajIgPSAxO1xuICAgICAgICAgICAgICAgIGoxID0gazEgPSBrMiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh4MCA+PSB6MCkge1xuICAgICAgICAgICAgICAgIGkxID0gaTIgPSBrMiA9IDE7XG4gICAgICAgICAgICAgICAgajEgPSBrMSA9IGoyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGsxID0gaTIgPSBrMiA9IDE7XG4gICAgICAgICAgICAgICAgaTEgPSBqMSA9IGoyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh5MCA8IHowKSB7XG4gICAgICAgICAgICAgICAgazEgPSBqMiA9IGsyID0gMTtcbiAgICAgICAgICAgICAgICBpMSA9IGoxID0gaTIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoeDAgPCB6MCkge1xuICAgICAgICAgICAgICAgIGoxID0gajIgPSBrMiA9IDE7XG4gICAgICAgICAgICAgICAgaTEgPSBrMSA9IGkyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGoxID0gaTIgPSBqMiA9IDE7XG4gICAgICAgICAgICAgICAgaTEgPSBrMSA9IGsyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgeDEgPSB4MCAtIGkxICsgRzM7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgdmFyIHkxID0geTAgLSBqMSArIEczO1xuICAgICAgICB2YXIgejEgPSB6MCAtIGsxICsgRzM7XG4gICAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHMzsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIHZhciB5MiA9IHkwIC0gajIgKyAyLjAgKiBHMztcbiAgICAgICAgdmFyIHoyID0gejAgLSBrMiArIDIuMCAqIEczO1xuICAgICAgICB2YXIgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEczOyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICB2YXIgeTMgPSB5MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgICB2YXIgejMgPSB6MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICAgIHZhciBnMCA9IEdyYWRbcGVybU1vZDEyW2lpICsgcGVybVtqaiArIHBlcm1ba2tdXV1dO1xuICAgICAgICB2YXIgZzEgPSBHcmFkW3Blcm1Nb2QxMltpaSArIGkxICsgcGVybVtqaiArIGoxICsgcGVybVtrayArIGsxXV1dXTtcbiAgICAgICAgdmFyIGcyID0gR3JhZFtwZXJtTW9kMTJbaWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMl1dXV07XG4gICAgICAgIHZhciBnMyA9IEdyYWRbcGVybU1vZDEyW2lpICsgMSArIHBlcm1bamogKyAxICsgcGVybVtrayArIDFdXV1dO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNvbnRyaWJ1dGlvbiBmcm9tIHRoZSBmb3VyIGNvcm5lcnNcbiAgICAgICAgdmFyIHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTAgLSB6MCAqIHowO1xuICAgICAgICB2YXIgbjAgPSB0MCA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQwLCA0KSAqIChnMFswXSAqIHgwICsgZzBbMV0gKiB5MCArIGcwWzJdICogejApO1xuICAgICAgICB2YXIgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejE7XG4gICAgICAgIHZhciBuMSA9IHQxIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDEsIDQpICogKGcxWzBdICogeDEgKyBnMVsxXSAqIHkxICsgZzFbMl0gKiB6MSk7XG4gICAgICAgIHZhciB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyIC0gejIgKiB6MjtcbiAgICAgICAgdmFyIG4yID0gdDIgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MiwgNCkgKiAoZzJbMF0gKiB4MiArIGcyWzFdICogeTIgKyBnMlsyXSAqIHoyKTtcbiAgICAgICAgdmFyIHQzID0gMC41IC0geDMgKiB4MyAtIHkzICogeTMgLSB6MyAqIHozO1xuICAgICAgICB2YXIgbjMgPSB0MyA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQzLCA0KSAqIChnM1swXSAqIHgzICsgZzNbMV0gKiB5MyArIGczWzJdICogejMpO1xuICAgICAgICAvLyBBZGQgY29udHJpYnV0aW9ucyBmcm9tIGVhY2ggY29ybmVyIHRvIGdldCB0aGUgZmluYWwgbm9pc2UgdmFsdWUuXG4gICAgICAgIC8vIFRoZSByZXN1bHQgaXMgc2NhbGVkIHRvIHN0YXkganVzdCBpbnNpZGUgWy0xLDFdXG4gICAgICAgIHJldHVybiA5NC42ODQ5MzE1MDY4MTk3MiAqIChuMCArIG4xICsgbjIgKyBuMyk7XG4gICAgfTtcbn1cbmV4cG9ydHMubWFrZU5vaXNlM0QgPSBtYWtlTm9pc2UzRDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcbiAqIEJhc2VkIG9uIGV4YW1wbGUgY29kZSBieSBTdGVmYW4gR3VzdGF2c29uIChzdGVndUBpdG4ubGl1LnNlKS5cbiAqIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuICogQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cbiAqXG4gKiBUaGlzIGNvZGUgd2FzIHBsYWNlZCBpbiB0aGUgcHVibGljIGRvbWFpbiBieSBpdHMgb3JpZ2luYWwgYXV0aG9yLFxuICogU3RlZmFuIEd1c3RhdnNvbi4gWW91IG1heSB1c2UgaXQgYXMgeW91IHNlZSBmaXQsIGJ1dFxuICogYXR0cmlidXRpb24gaXMgYXBwcmVjaWF0ZWQuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlNEQgPSB2b2lkIDA7XG52YXIgRzQgPSAoNS4wIC0gTWF0aC5zcXJ0KDUuMCkpIC8gMjAuMDtcbnZhciBHcmFkID0gW1xuICAgIFswLCAxLCAxLCAxXSxcbiAgICBbMCwgMSwgMSwgLTFdLFxuICAgIFswLCAxLCAtMSwgMV0sXG4gICAgWzAsIDEsIC0xLCAtMV0sXG4gICAgWzAsIC0xLCAxLCAxXSxcbiAgICBbMCwgLTEsIDEsIC0xXSxcbiAgICBbMCwgLTEsIC0xLCAxXSxcbiAgICBbMCwgLTEsIC0xLCAtMV0sXG4gICAgWzEsIDAsIDEsIDFdLFxuICAgIFsxLCAwLCAxLCAtMV0sXG4gICAgWzEsIDAsIC0xLCAxXSxcbiAgICBbMSwgMCwgLTEsIC0xXSxcbiAgICBbLTEsIDAsIDEsIDFdLFxuICAgIFstMSwgMCwgMSwgLTFdLFxuICAgIFstMSwgMCwgLTEsIDFdLFxuICAgIFstMSwgMCwgLTEsIC0xXSxcbiAgICBbMSwgMSwgMCwgMV0sXG4gICAgWzEsIDEsIDAsIC0xXSxcbiAgICBbMSwgLTEsIDAsIDFdLFxuICAgIFsxLCAtMSwgMCwgLTFdLFxuICAgIFstMSwgMSwgMCwgMV0sXG4gICAgWy0xLCAxLCAwLCAtMV0sXG4gICAgWy0xLCAtMSwgMCwgMV0sXG4gICAgWy0xLCAtMSwgMCwgLTFdLFxuICAgIFsxLCAxLCAxLCAwXSxcbiAgICBbMSwgMSwgLTEsIDBdLFxuICAgIFsxLCAtMSwgMSwgMF0sXG4gICAgWzEsIC0xLCAtMSwgMF0sXG4gICAgWy0xLCAxLCAxLCAwXSxcbiAgICBbLTEsIDEsIC0xLCAwXSxcbiAgICBbLTEsIC0xLCAxLCAwXSxcbiAgICBbLTEsIC0xLCAtMSwgMF0sXG5dO1xuZnVuY3Rpb24gbWFrZU5vaXNlNEQocmFuZG9tKSB7XG4gICAgaWYgKHJhbmRvbSA9PT0gdm9pZCAwKSB7IHJhbmRvbSA9IE1hdGgucmFuZG9tOyB9XG4gICAgdmFyIHAgPSBuZXcgVWludDhBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspXG4gICAgICAgIHBbaV0gPSBpO1xuICAgIHZhciBuO1xuICAgIHZhciBxO1xuICAgIGZvciAodmFyIGkgPSAyNTU7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoKGkgKyAxKSAqIHJhbmRvbSgpKTtcbiAgICAgICAgcSA9IHBbaV07XG4gICAgICAgIHBbaV0gPSBwW25dO1xuICAgICAgICBwW25dID0gcTtcbiAgICB9XG4gICAgdmFyIHBlcm0gPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIHZhciBwZXJtTW9kMTIgPSBuZXcgVWludDhBcnJheSg1MTIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTEyOyBpKyspIHtcbiAgICAgICAgcGVybVtpXSA9IHBbaSAmIDI1NV07XG4gICAgICAgIHBlcm1Nb2QxMltpXSA9IHBlcm1baV0gJSAxMjtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh4LCB5LCB6LCB3KSB7XG4gICAgICAgIC8vIFNrZXcgdGhlICh4LHkseix3KSBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggY2VsbCBvZiAyNCBzaW1wbGljZXMgd2UncmUgaW5cbiAgICAgICAgdmFyIHMgPSAoeCArIHkgKyB6ICsgdykgKiAoTWF0aC5zcXJ0KDUuMCkgLSAxLjApIC8gNC4wOyAvLyBGYWN0b3IgZm9yIDREIHNrZXdpbmdcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHggKyBzKTtcbiAgICAgICAgdmFyIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcbiAgICAgICAgdmFyIGsgPSBNYXRoLmZsb29yKHogKyBzKTtcbiAgICAgICAgdmFyIGwgPSBNYXRoLmZsb29yKHcgKyBzKTtcbiAgICAgICAgdmFyIHQgPSAoaSArIGogKyBrICsgbCkgKiBHNDsgLy8gRmFjdG9yIGZvciA0RCB1bnNrZXdpbmdcbiAgICAgICAgdmFyIFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHosdykgc3BhY2VcbiAgICAgICAgdmFyIFkwID0gaiAtIHQ7XG4gICAgICAgIHZhciBaMCA9IGsgLSB0O1xuICAgICAgICB2YXIgVzAgPSBsIC0gdDtcbiAgICAgICAgdmFyIHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHosdyBkaXN0YW5jZXMgZnJvbSB0aGUgY2VsbCBvcmlnaW5cbiAgICAgICAgdmFyIHkwID0geSAtIFkwO1xuICAgICAgICB2YXIgejAgPSB6IC0gWjA7XG4gICAgICAgIHZhciB3MCA9IHcgLSBXMDtcbiAgICAgICAgLy8gVG8gZmluZCBvdXQgd2hpY2ggb2YgdGhlIDI0IHBvc3NpYmxlIHNpbXBsaWNlcyB3ZSdyZSBpbiwgd2UgbmVlZCB0byBkZXRlcm1pbmUgdGhlXG4gICAgICAgIC8vIG1hZ25pdHVkZSBvcmRlcmluZyBvZiB4MCwgeTAsIHowIGFuZCB3MC4gU2l4IHBhaXItd2lzZSBjb21wYXJpc29ucyBhcmUgcGVyZm9ybWVkIGJldHdlZW5cbiAgICAgICAgLy8gZWFjaCBwb3NzaWJsZSBwYWlyIG9mIHRoZSBmb3VyIGNvb3JkaW5hdGVzLCBhbmQgdGhlIHJlc3VsdHMgYXJlIHVzZWQgdG8gcmFuayB0aGUgbnVtYmVycy5cbiAgICAgICAgdmFyIHJhbmt4ID0gMDtcbiAgICAgICAgdmFyIHJhbmt5ID0gMDtcbiAgICAgICAgdmFyIHJhbmt6ID0gMDtcbiAgICAgICAgdmFyIHJhbmt3ID0gMDtcbiAgICAgICAgaWYgKHgwID4geTApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5reSsrO1xuICAgICAgICBpZiAoeDAgPiB6MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGlmICh4MCA+IHcwKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3crKztcbiAgICAgICAgaWYgKHkwID4gejApXG4gICAgICAgICAgICByYW5reSsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBpZiAoeTAgPiB3MClcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt3Kys7XG4gICAgICAgIGlmICh6MCA+IHcwKVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3crKztcbiAgICAgICAgLy8gc2ltcGxleFtjXSBpcyBhIDQtdmVjdG9yIHdpdGggdGhlIG51bWJlcnMgMCwgMSwgMiBhbmQgMyBpbiBzb21lIG9yZGVyLlxuICAgICAgICAvLyBNYW55IHZhbHVlcyBvZiBjIHdpbGwgbmV2ZXIgb2NjdXIsIHNpbmNlIGUuZy4geD55Pno+dyBtYWtlcyB4PHosIHk8dyBhbmQgeDx3XG4gICAgICAgIC8vIGltcG9zc2libGUuIE9ubHkgdGhlIDI0IGluZGljZXMgd2hpY2ggaGF2ZSBub24temVybyBlbnRyaWVzIG1ha2UgYW55IHNlbnNlLlxuICAgICAgICAvLyBXZSB1c2UgYSB0aHJlc2hvbGRpbmcgdG8gc2V0IHRoZSBjb29yZGluYXRlcyBpbiB0dXJuIGZyb20gdGhlIGxhcmdlc3QgbWFnbml0dWRlLlxuICAgICAgICAvLyBSYW5rIDMgZGVub3RlcyB0aGUgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgICB2YXIgaTEgPSByYW5reCA+PSAzID8gMSA6IDA7XG4gICAgICAgIHZhciBqMSA9IHJhbmt5ID49IDMgPyAxIDogMDtcbiAgICAgICAgdmFyIGsxID0gcmFua3ogPj0gMyA/IDEgOiAwO1xuICAgICAgICB2YXIgbDEgPSByYW5rdyA+PSAzID8gMSA6IDA7XG4gICAgICAgIC8vIFJhbmsgMiBkZW5vdGVzIHRoZSBzZWNvbmQgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgICB2YXIgaTIgPSByYW5reCA+PSAyID8gMSA6IDA7XG4gICAgICAgIHZhciBqMiA9IHJhbmt5ID49IDIgPyAxIDogMDtcbiAgICAgICAgdmFyIGsyID0gcmFua3ogPj0gMiA/IDEgOiAwO1xuICAgICAgICB2YXIgbDIgPSByYW5rdyA+PSAyID8gMSA6IDA7XG4gICAgICAgIC8vIFJhbmsgMSBkZW5vdGVzIHRoZSBzZWNvbmQgc21hbGxlc3QgY29vcmRpbmF0ZS5cbiAgICAgICAgdmFyIGkzID0gcmFua3ggPj0gMSA/IDEgOiAwO1xuICAgICAgICB2YXIgajMgPSByYW5reSA+PSAxID8gMSA6IDA7XG4gICAgICAgIHZhciBrMyA9IHJhbmt6ID49IDEgPyAxIDogMDtcbiAgICAgICAgdmFyIGwzID0gcmFua3cgPj0gMSA/IDEgOiAwO1xuICAgICAgICAvLyBUaGUgZmlmdGggY29ybmVyIGhhcyBhbGwgY29vcmRpbmF0ZSBvZmZzZXRzID0gMSwgc28gbm8gbmVlZCB0byBjb21wdXRlIHRoYXQuXG4gICAgICAgIHZhciB4MSA9IHgwIC0gaTEgKyBHNDsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIHZhciB5MSA9IHkwIC0gajEgKyBHNDtcbiAgICAgICAgdmFyIHoxID0gejAgLSBrMSArIEc0O1xuICAgICAgICB2YXIgdzEgPSB3MCAtIGwxICsgRzQ7XG4gICAgICAgIHZhciB4MiA9IHgwIC0gaTIgKyAyLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHkyID0geTAgLSBqMiArIDIuMCAqIEc0O1xuICAgICAgICB2YXIgejIgPSB6MCAtIGsyICsgMi4wICogRzQ7XG4gICAgICAgIHZhciB3MiA9IHcwIC0gbDIgKyAyLjAgKiBHNDtcbiAgICAgICAgdmFyIHgzID0geDAgLSBpMyArIDMuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciBmb3VydGggY29ybmVyIGluICh4LHkseix3KSBjb29yZHNcbiAgICAgICAgdmFyIHkzID0geTAgLSBqMyArIDMuMCAqIEc0O1xuICAgICAgICB2YXIgejMgPSB6MCAtIGszICsgMy4wICogRzQ7XG4gICAgICAgIHZhciB3MyA9IHcwIC0gbDMgKyAzLjAgKiBHNDtcbiAgICAgICAgdmFyIHg0ID0geDAgLSAxLjAgKyA0LjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICB2YXIgeTQgPSB5MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgICB2YXIgejQgPSB6MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgICB2YXIgdzQgPSB3MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZpdmUgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIHZhciBpaSA9IGkgJiAyNTU7XG4gICAgICAgIHZhciBqaiA9IGogJiAyNTU7XG4gICAgICAgIHZhciBrayA9IGsgJiAyNTU7XG4gICAgICAgIHZhciBsbCA9IGwgJiAyNTU7XG4gICAgICAgIHZhciBnMCA9IEdyYWRbcGVybVtpaSArIHBlcm1bamogKyBwZXJtW2trICsgcGVybVtsbF1dXV0gJVxuICAgICAgICAgICAgMzJdO1xuICAgICAgICB2YXIgZzEgPSBHcmFkW3Blcm1baWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMSArIHBlcm1bbGwgKyBsMV1dXV0gJSAzMl07XG4gICAgICAgIHZhciBnMiA9IEdyYWRbcGVybVtpaSArIGkyICsgcGVybVtqaiArIGoyICsgcGVybVtrayArIGsyICsgcGVybVtsbCArIGwyXV1dXSAlIDMyXTtcbiAgICAgICAgdmFyIGczID0gR3JhZFtwZXJtW2lpICsgaTMgKyBwZXJtW2pqICsgajMgKyBwZXJtW2trICsgazMgKyBwZXJtW2xsICsgbDNdXV1dICUgMzJdO1xuICAgICAgICB2YXIgZzQgPSBHcmFkW3Blcm1baWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMSArIHBlcm1bbGwgKyAxXV1dXSAlIDMyXTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICAgIHZhciB0MCA9IDAuNSAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MCAtIHcwICogdzA7XG4gICAgICAgIHZhciBuMCA9IHQwIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDAsIDQpICogKGcwWzBdICogeDAgKyBnMFsxXSAqIHkwICsgZzBbMl0gKiB6MCArIGcwWzNdICogdzApO1xuICAgICAgICB2YXIgdDEgPSAwLjUgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejEgLSB3MSAqIHcxO1xuICAgICAgICB2YXIgbjEgPSB0MSA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQxLCA0KSAqIChnMVswXSAqIHgxICsgZzFbMV0gKiB5MSArIGcxWzJdICogejEgKyBnMVszXSAqIHcxKTtcbiAgICAgICAgdmFyIHQyID0gMC41IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyIC0gdzIgKiB3MjtcbiAgICAgICAgdmFyIG4yID0gdDIgPCAwXG4gICAgICAgICAgICA/IDAuMFxuICAgICAgICAgICAgOiBNYXRoLnBvdyh0MiwgNCkgKiAoZzJbMF0gKiB4MiArIGcyWzFdICogeTIgKyBnMlsyXSAqIHoyICsgZzJbM10gKiB3Mik7XG4gICAgICAgIHZhciB0MyA9IDAuNSAtIHgzICogeDMgLSB5MyAqIHkzIC0gejMgKiB6MyAtIHczICogdzM7XG4gICAgICAgIHZhciBuMyA9IHQzIDwgMFxuICAgICAgICAgICAgPyAwLjBcbiAgICAgICAgICAgIDogTWF0aC5wb3codDMsIDQpICogKGczWzBdICogeDMgKyBnM1sxXSAqIHkzICsgZzNbMl0gKiB6MyArIGczWzNdICogdzMpO1xuICAgICAgICB2YXIgdDQgPSAwLjUgLSB4NCAqIHg0IC0geTQgKiB5NCAtIHo0ICogejQgLSB3NCAqIHc0O1xuICAgICAgICB2YXIgbjQgPSB0NCA8IDBcbiAgICAgICAgICAgID8gMC4wXG4gICAgICAgICAgICA6IE1hdGgucG93KHQ0LCA0KSAqIChnNFswXSAqIHg0ICsgZzRbMV0gKiB5NCArIGc0WzJdICogejQgKyBnNFszXSAqIHc0KTtcbiAgICAgICAgLy8gU3VtIHVwIGFuZCBzY2FsZSB0aGUgcmVzdWx0IHRvIGNvdmVyIHRoZSByYW5nZSBbLTEsMV1cbiAgICAgICAgcmV0dXJuIDcyLjM3ODU1NzY1MTUzNjY1ICogKG4wICsgbjEgKyBuMiArIG4zICsgbjQpO1xuICAgIH07XG59XG5leHBvcnRzLm1ha2VOb2lzZTREID0gbWFrZU5vaXNlNEQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWFrZU5vaXNlNEQgPSBleHBvcnRzLm1ha2VOb2lzZTNEID0gZXhwb3J0cy5tYWtlTm9pc2UyRCA9IHZvaWQgMDtcbnZhciBfMmRfMSA9IHJlcXVpcmUoXCIuLzJkXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWFrZU5vaXNlMkRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIF8yZF8xLm1ha2VOb2lzZTJEOyB9IH0pO1xudmFyIF8zZF8xID0gcmVxdWlyZShcIi4vM2RcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtYWtlTm9pc2UzRFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gXzNkXzEubWFrZU5vaXNlM0Q7IH0gfSk7XG52YXIgXzRkXzEgPSByZXF1aXJlKFwiLi80ZFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1ha2VOb2lzZTREXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfNGRfMS5tYWtlTm9pc2U0RDsgfSB9KTtcbiIsIlxuaW1wb3J0ICogYXMgc2VyaWFsaXppbmcgZnJvbSBcInJheXRyYWNlci9zZXJpYWxpemluZ1wiO1xuaW1wb3J0IHsgUmVuZGVyRGF0YSB9IGZyb20gXCIuL3JlbmRlcmpvYlwiO1xuZGVjbGFyZSBmdW5jdGlvbiBwb3N0TWVzc2FnZShtZXNzYWdlOmFueSx0cmFuc2Zlcj86VHJhbnNmZXJhYmxlW10pOnZvaWQ7XG5cbm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcmVuZGVyZGF0YT0gZS5kYXRhIGFzIFJlbmRlckRhdGE7XG5cbiAgICB2YXIgd29ybGQ9c2VyaWFsaXppbmcuZGVTZXJpYWxpemVXb3JsZChyZW5kZXJkYXRhLndvcmxkKTtcbiAgICB2YXIgY2FtZXJhPXNlcmlhbGl6aW5nLmRlU2VyaWFsaXplQ2FtZXJhKHJlbmRlcmRhdGEuY2FtZXJhKTtcbiAgICB2YXIgc3RhcnQ9RGF0ZS5ub3coKTtcbiAgICB2YXIgcmVuZGVyRGF0YSA9IGNhbWVyYS5yZW5kZXJQYXJ0aWFsKHdvcmxkLCByZW5kZXJkYXRhLmZyb20scmVuZGVyZGF0YS50byk7XG4gICAgY29uc29sZS5sb2cocmVuZGVyZGF0YS5mcm9tLnkrXCIgZG9uZSAgXCIrIChEYXRlLm5vdygpLXN0YXJ0KSlcbiAgICBwb3N0TWVzc2FnZShyZW5kZXJEYXRhLmJ1ZmZlcixbcmVuZGVyRGF0YS5idWZmZXJdKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2FtZXJhID0gdm9pZCAwO1xuY29uc3QgY2FudmFzXzEgPSByZXF1aXJlKFwiLi9jYW52YXNcIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IHJheV8xID0gcmVxdWlyZShcIi4vcmF5XCIpO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY2xhc3MgQ2FtZXJhIHtcbiAgICBjb25zdHJ1Y3Rvcihoc2l6ZSwgdnNpemUsIGZpZWxkT2ZWaWV3LCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgdGhpcy5oc2l6ZSA9IGhzaXplO1xuICAgICAgICB0aGlzLnZzaXplID0gdnNpemU7XG4gICAgICAgIHRoaXMuZmllbGRPZlZpZXcgPSBmaWVsZE9mVmlldztcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gIT09IG51bGwgJiYgdHJhbnNmb3JtICE9PSB2b2lkIDAgPyB0cmFuc2Zvcm0gOiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICAgIGdldCBoYWxmV2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oYWxmV2lkdGg7XG4gICAgfVxuICAgIGdldCBoYWxmaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFsZldpZHRoO1xuICAgIH1cbiAgICBnZXQgcGl4ZWxTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGl4ZWxTaXplO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHJlY2FsY3VsYXRlIGRlcml2ZWQgdmFsdWVzXG4gICAgICovXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB2YXIgaGFsZlZpZXcgPSBNYXRoLnRhbih0aGlzLmZpZWxkT2ZWaWV3IC8gMik7XG4gICAgICAgIHZhciBhc3BlY3QgPSB0aGlzLmhzaXplIC8gdGhpcy52c2l6ZTtcbiAgICAgICAgaWYgKGFzcGVjdCA+PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9oYWxmV2lkdGggPSBoYWxmVmlldztcbiAgICAgICAgICAgIHRoaXMuX2hhbGZIZWlnaHQgPSBoYWxmVmlldyAvIGFzcGVjdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbGZXaWR0aCA9IGhhbGZWaWV3ICogYXNwZWN0O1xuICAgICAgICAgICAgdGhpcy5faGFsZkhlaWdodCA9IGhhbGZWaWV3O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BpeGVsU2l6ZSA9ICh0aGlzLl9oYWxmV2lkdGggKiAyKSAvIHRoaXMuaHNpemU7XG4gICAgfVxuICAgIHJheUZvclBpeGVsKHgsIHkpIHtcbiAgICAgICAgdmFyIHhPZmZzZXQgPSAoeCArIDAuNSkgKiB0aGlzLl9waXhlbFNpemU7XG4gICAgICAgIHZhciB5T2Zmc2V0ID0gKHkgKyAwLjUpICogdGhpcy5fcGl4ZWxTaXplO1xuICAgICAgICB2YXIgd29ybGRYID0gdGhpcy5faGFsZldpZHRoIC0geE9mZnNldDtcbiAgICAgICAgdmFyIHdvcmxkWSA9IHRoaXMuX2hhbGZIZWlnaHQgLSB5T2Zmc2V0O1xuICAgICAgICB2YXIgcGl4ZWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0ubXVsdGlwbHkodHVwbGVfMS5UdXBsZS5wb2ludCh3b3JsZFgsIHdvcmxkWSwgLTEpKTtcbiAgICAgICAgdmFyIG9yaWdpbiA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh0dXBsZV8xLlR1cGxlLnBvaW50KDAsIDAsIDApKTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHBpeGVsLnN1YnN0cmFjdChvcmlnaW4pLm5vcm1hbGl6ZSgpO1xuICAgICAgICByZXR1cm4gbmV3IHJheV8xLlJheShvcmlnaW4sIGRpcmVjdGlvbik7XG4gICAgfVxuICAgIHJlbmRlclBhcnRpYWwod29ybGQsIGZyb20gPSB7IHg6IDAsIHk6IDAgfSwgdG8gPSB7IHg6IHRoaXMuaHNpemUsIHk6IHRoaXMudnNpemUgfSkge1xuICAgICAgICB2YXIgdG9wID0gZnJvbS55O1xuICAgICAgICB2YXIgbGVmdCA9IGZyb20ueDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRvLnkgLSB0b3A7XG4gICAgICAgIHZhciB3aWR0aCA9IHRvLnggLSBsZWZ0O1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICAgICAgdmFyIHBpeGVsSW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcmF5ID0gdGhpcy5yYXlGb3JQaXhlbChsZWZ0ICsgeCwgdG9wICsgeSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSBjb2xvci5yZWQgKiAyNTU7XG4gICAgICAgICAgICAgICAgaW1hZ2VbcGl4ZWxJbmRleCsrXSA9IGNvbG9yLmdyZWVuICogMjU1O1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSBjb2xvci5ibHVlICogMjU1O1xuICAgICAgICAgICAgICAgIGltYWdlW3BpeGVsSW5kZXgrK10gPSAyNTU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGltYWdlO1xuICAgIH1cbiAgICByZW5kZXIod29ybGQpIHtcbiAgICAgICAgdmFyIGltYWdlID0gbmV3IGNhbnZhc18xLkNhbnZhcyh0aGlzLmhzaXplLCB0aGlzLnZzaXplKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLnZzaXplOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5oc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJheSA9IHRoaXMucmF5Rm9yUGl4ZWwoeCwgeSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gd29ybGQuY29sb3JBdChyYXkpO1xuICAgICAgICAgICAgICAgIGltYWdlLndyaXRlUGl4ZWwoeCwgeSwgY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IGhzaXplOiB0aGlzLmhzaXplLCB2c2l6ZTogdGhpcy52c2l6ZSwgZmllbGRPZlZpZXc6IHRoaXMuZmllbGRPZlZpZXcsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5DYW1lcmEgPSBDYW1lcmE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYW1lcmEuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNhbnZhcyA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIENhbnZhcyB7XG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHdpZHRoICogaGVpZ2h0ICogMyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlYWRQaXhlbCh4LCB5KSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA8IDAgfHwgeSA+PSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHZhciBwaXhlbEluZGV4ID0gTWF0aC5mbG9vcih5KSAqIHRoaXMud2lkdGggKiAzICsgTWF0aC5mbG9vcih4KSAqIDM7XG4gICAgICAgIHJldHVybiBuZXcgY29sb3JfMS5Db2xvcih0aGlzLmRhdGFbcGl4ZWxJbmRleF0sIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMV0sIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMl0pO1xuICAgIH1cbiAgICB3cml0ZVBpeGVsKHgsIHksIGMpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5IDwgMCB8fCB5ID49IHRoaXMuaGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIgcGl4ZWxJbmRleCA9IE1hdGguZmxvb3IoeSkgKiB0aGlzLndpZHRoICogMyArIE1hdGguZmxvb3IoeCkgKiAzO1xuICAgICAgICB0aGlzLmRhdGFbcGl4ZWxJbmRleF0gPSBjLnJlZDtcbiAgICAgICAgdGhpcy5kYXRhW3BpeGVsSW5kZXggKyAxXSA9IGMuZ3JlZW47XG4gICAgICAgIHRoaXMuZGF0YVtwaXhlbEluZGV4ICsgMl0gPSBjLmJsdWU7XG4gICAgfVxuICAgIHRvUHBtKCkge1xuICAgICAgICB2YXIgcHBtID0gXCJQM1xcblwiO1xuICAgICAgICBwcG0gKz0gdGhpcy53aWR0aCArIFwiIFwiICsgdGhpcy5oZWlnaHQgKyBcIlxcblwiO1xuICAgICAgICBwcG0gKz0gXCIyNTVcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHBwbSArPSAoaSAlIDE1ID09IDApID8gXCJcXG5cIiA6IFwiIFwiO1xuICAgICAgICAgICAgcHBtICs9IE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2ldICogMjU1KSwgMjU1KSwgMCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgICsgXCIgXCIgKyBNYXRoLm1heChNYXRoLm1pbihNYXRoLnJvdW5kKHRoaXMuZGF0YVtpICsgMV0gKiAyNTUpLCAyNTUpLCAwKS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgKyBcIiBcIiArIE1hdGgubWF4KE1hdGgubWluKE1hdGgucm91bmQodGhpcy5kYXRhW2kgKyAyXSAqIDI1NSksIDI1NSksIDApLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHBtICs9IFwiXFxuXCI7XG4gICAgICAgIHJldHVybiBwcG07XG4gICAgfVxuICAgIHRvVWludDhDbGFtcGVkQXJyYXkoKSB7XG4gICAgICAgIHZhciBhcnIgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogNCk7XG4gICAgICAgIHZhciBhcnJJbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBhcnJbYXJySW5kZXhdID0gdGhpcy5kYXRhW2ldICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgMV0gPSB0aGlzLmRhdGFbaSArIDFdICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgMl0gPSB0aGlzLmRhdGFbaSArIDJdICogMjU1O1xuICAgICAgICAgICAgYXJyW2FyckluZGV4ICsgM10gPSAyNTU7XG4gICAgICAgICAgICBhcnJJbmRleCArPSA0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxufVxuZXhwb3J0cy5DYW52YXMgPSBDYW52YXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jYW52YXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk9iamVjdFBvb2wgPSB2b2lkIDA7XG4vKipcbiAqIE9iamVjdCBwb29sIHRoYXQgd2lsbCBtaW5pbWl6ZSBnYXJiYWdlIGNvbGxlY3Rpb24gdXNhZ2VcbiAqL1xuY2xhc3MgT2JqZWN0UG9vbCB7XG4gICAgY29uc3RydWN0b3IoYXJyYXlMZW5ndGggPSAwKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBuZXcgQXJyYXkoYXJyYXlMZW5ndGgpO1xuICAgICAgICB0aGlzLmluZGV4TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9sZW5ndGggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdJdGVtID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KG5ld0l0ZW0sIGkpO1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXSA9IG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5kZXhPZihpdGVtKSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5pbmRleE1hcC5nZXQoaXRlbSk7XG4gICAgICAgIHJldHVybiAoaSA9PT0gdW5kZWZpbmVkIHx8IGkgPj0gdGhpcy5fbGVuZ3RoKSA/IC0xIDogaTtcbiAgICB9XG4gICAgcmVtb3ZlKGEpIHtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLmluZGV4TWFwLmdldChhKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuX2xlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5fbGVuZ3RoLS07XG4gICAgICAgIHZhciByZW1vdmVJdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XG4gICAgICAgIHZhciBsYXN0SXRlbSA9IHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoXTtcbiAgICAgICAgdGhpcy5pdGVtc1tpbmRleF0gPSBsYXN0SXRlbTtcbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLl9sZW5ndGhdID0gcmVtb3ZlSXRlbTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQocmVtb3ZlSXRlbSwgdGhpcy5fbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQobGFzdEl0ZW0sIGluZGV4KTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gdW51c2VkIGl0ZW0gb3IgY3JlYXRlcyBhIG5ldyBvbmUsIGlmIG5vIHVudXNlZCBpdGVtIGF2YWlsYWJsZVxuICAgICovXG4gICAgYWRkKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVtcy5sZW5ndGggPT0gdGhpcy5fbGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbmV3SXRlbSA9IHRoaXMuY3JlYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmluZGV4TWFwLnNldChuZXdJdGVtLCB0aGlzLl9sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5fbGVuZ3RoID0gdGhpcy5pdGVtcy5wdXNoKG5ld0l0ZW0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXNbdGhpcy5fbGVuZ3RoKytdO1xuICAgIH1cbiAgICBnZXQoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID49IHRoaXMuX2xlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aDtcbiAgICB9XG59XG5leHBvcnRzLk9iamVjdFBvb2wgPSBPYmplY3RQb29sO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sbGVjdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ29sb3IgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIENvbG9yIHtcbiAgICBjb25zdHJ1Y3RvcihyZWQsIGdyZWVuLCBibHVlKSB7XG4gICAgICAgIHRoaXMucmVkID0gcmVkO1xuICAgICAgICB0aGlzLmdyZWVuID0gZ3JlZW47XG4gICAgICAgIHRoaXMuYmx1ZSA9IGJsdWU7XG4gICAgfVxuICAgIGFkZChjb2xvcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkICsgY29sb3IucmVkLCB0aGlzLmdyZWVuICsgY29sb3IuZ3JlZW4sIHRoaXMuYmx1ZSArIGNvbG9yLmJsdWUpO1xuICAgIH1cbiAgICBtdWx0aXBseShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAqIHNjYWxhciwgdGhpcy5ncmVlbiAqIHNjYWxhciwgdGhpcy5ibHVlICogc2NhbGFyKTtcbiAgICB9XG4gICAgZGl2aWRlKHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmVkIC8gc2NhbGFyLCB0aGlzLmdyZWVuIC8gc2NhbGFyLCB0aGlzLmJsdWUgLyBzY2FsYXIpO1xuICAgIH1cbiAgICBzdWJzdHJhY3QoY29sb3IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJlZCAtIGNvbG9yLnJlZCwgdGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuLCB0aGlzLmJsdWUgLSBjb2xvci5ibHVlKTtcbiAgICB9XG4gICAgaGFkYW1hcmRQcm9kdWN0KGNvbG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQgKiBjb2xvci5yZWQsIHRoaXMuZ3JlZW4gKiBjb2xvci5ncmVlbiwgdGhpcy5ibHVlICogY29sb3IuYmx1ZSk7XG4gICAgfVxuICAgIGVxdWFscyhjb2xvcikge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnModGhpcy5yZWQgLSBjb2xvci5yZWQpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy5ncmVlbiAtIGNvbG9yLmdyZWVuKSA8IGNvbnN0YW50c18xLkVQU0lMT05cbiAgICAgICAgICAgICYmIE1hdGguYWJzKHRoaXMuYmx1ZSAtIGNvbG9yLmJsdWUpIDwgY29uc3RhbnRzXzEuRVBTSUxPTjtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZWQsIHRoaXMuZ3JlZW4sIHRoaXMuYmx1ZSk7XG4gICAgfVxufVxuZXhwb3J0cy5Db2xvciA9IENvbG9yO1xuQ29sb3IuQkxBQ0sgPSBPYmplY3QuZnJlZXplKG5ldyBDb2xvcigwLCAwLCAwKSk7XG5Db2xvci5XSElURSA9IE9iamVjdC5mcmVlemUobmV3IENvbG9yKDEsIDEsIDEpKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbG9yLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db21wdXRhdGlvbnMgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIENvbXB1dGF0aW9ucyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuICAgIHN0YXRpYyBwcmVwYXJlKGhpdCwgcmF5LCBpbnRlcnNlY3Rpb25zID0gbnVsbCkge1xuICAgICAgICB2YXIgY29tcHMgPSBuZXcgQ29tcHV0YXRpb25zKCk7XG4gICAgICAgIGNvbXBzLnQgPSBoaXQudDtcbiAgICAgICAgY29tcHMub2JqZWN0ID0gaGl0Lm9iamVjdDtcbiAgICAgICAgY29tcHMucG9pbnQgPSByYXkucG9zaXRpb24oY29tcHMudCk7XG4gICAgICAgIGNvbXBzLmV5ZXYgPSByYXkuZGlyZWN0aW9uLm5lZ2F0ZSgpO1xuICAgICAgICBjb21wcy5ub3JtYWx2ID0gY29tcHMub2JqZWN0Lm5vcm1hbEF0KGNvbXBzLnBvaW50KTtcbiAgICAgICAgaWYgKGNvbXBzLm5vcm1hbHYuZG90KGNvbXBzLmV5ZXYpIDwgMCkge1xuICAgICAgICAgICAgY29tcHMuaW5zaWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbXBzLm5vcm1hbHYgPSBjb21wcy5ub3JtYWx2Lm5lZ2F0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29tcHMuaW5zaWRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN1cmZhY2VPZmZzZXQgPSBjb21wcy5ub3JtYWx2Lm11bHRpcGx5KGNvbnN0YW50c18xLkVQU0lMT04pO1xuICAgICAgICBjb21wcy5vdmVyUG9pbnQgPSBjb21wcy5wb2ludC5hZGQoc3VyZmFjZU9mZnNldCk7XG4gICAgICAgIGNvbXBzLnVuZGVyUG9pbnQgPSBjb21wcy5wb2ludC5zdWJzdHJhY3Qoc3VyZmFjZU9mZnNldCk7XG4gICAgICAgIGNvbXBzLnJlZmxlY3R2ID0gcmF5LmRpcmVjdGlvbi5yZWZsZWN0KGNvbXBzLm5vcm1hbHYpO1xuICAgICAgICBpZiAoaW50ZXJzZWN0aW9ucyA9PSBudWxsKSB7IC8vZG9udCBjb21wdXRlIG4xIGFuZCBuMlxuICAgICAgICAgICAgY29tcHMubjEgPSAxO1xuICAgICAgICAgICAgY29tcHMubjIgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgQ29tcHV0YXRpb25zLnRlbXBTZXQuY2xlYXIoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgaW50ZXJzZWN0aW9ucy5sZW5ndGg7IGMrKykge1xuICAgICAgICAgICAgICAgIHZhciBpID0gaW50ZXJzZWN0aW9ucy5nZXQoYyk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT0gaGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChDb21wdXRhdGlvbnMudGVtcFNldC5zaXplID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLm4xID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLm4yID0gaS5vYmplY3QubWF0ZXJpYWwucmVmcmFjdGl2ZUluZGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlY29uZExhc3QgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbyBvZiBDb21wdXRhdGlvbnMudGVtcFNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZExhc3QgPSBsYXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBvO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMubjEgPSBsYXN0Lm1hdGVyaWFsLnJlZnJhY3RpdmVJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghQ29tcHV0YXRpb25zLnRlbXBTZXQuaGFzKGkub2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLm4yID0gaS5vYmplY3QubWF0ZXJpYWwucmVmcmFjdGl2ZUluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3QgPT0gaS5vYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMubjIgPSBzZWNvbmRMYXN0ID09IG51bGwgPyAxIDogc2Vjb25kTGFzdC5tYXRlcmlhbC5yZWZyYWN0aXZlSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcy5uMiA9IGxhc3QubWF0ZXJpYWwucmVmcmFjdGl2ZUluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghQ29tcHV0YXRpb25zLnRlbXBTZXQuZGVsZXRlKGkub2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgICBDb21wdXRhdGlvbnMudGVtcFNldC5hZGQoaS5vYmplY3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcHM7XG4gICAgfVxuICAgIHNjaGxpY2soKSB7XG4gICAgICAgIHZhciBjb3MgPSB0aGlzLmV5ZXYuZG90KHRoaXMubm9ybWFsdik7XG4gICAgICAgIGlmICh0aGlzLm4xID4gdGhpcy5uMikge1xuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLm4xIC8gdGhpcy5uMjtcbiAgICAgICAgICAgIHZhciBzaW4ydCA9IG4gKiBuICogKDEgLSBjb3MgKiBjb3MpO1xuICAgICAgICAgICAgaWYgKHNpbjJ0ID4gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIHZhciBjb3NUID0gTWF0aC5zcXJ0KDEgLSBzaW4ydCk7XG4gICAgICAgICAgICBjb3MgPSBjb3NUO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wID0gKCh0aGlzLm4xIC0gdGhpcy5uMikgLyAodGhpcy5uMSArIHRoaXMubjIpKTtcbiAgICAgICAgdmFyIHIwID0gdGVtcCAqIHRlbXA7XG4gICAgICAgIHJldHVybiByMCArICgxIC0gcjApICogTWF0aC5wb3coKDEgLSBjb3MpLCA1KTtcbiAgICB9XG59XG5leHBvcnRzLkNvbXB1dGF0aW9ucyA9IENvbXB1dGF0aW9ucztcbkNvbXB1dGF0aW9ucy50ZW1wU2V0ID0gbmV3IFNldCgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcHV0YXRpb25zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FUFNJTE9OID0gdm9pZCAwO1xuZXhwb3J0cy5FUFNJTE9OID0gMC4wMDAxO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uc3RhbnRzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5JbnRlcnNlY3Rpb25zID0gZXhwb3J0cy5JbnRlcnNlY3Rpb24gPSB2b2lkIDA7XG5jb25zdCBjb2xsZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uXCIpO1xuY29uc3Qgc29ydF8xID0gcmVxdWlyZShcIi4vc29ydFwiKTtcbmNsYXNzIEludGVyc2VjdGlvbiB7XG4gICAgY29uc3RydWN0b3IodCwgb2JqZWN0KSB7XG4gICAgICAgIHRoaXMudCA9IHQ7XG4gICAgICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgIH1cbiAgICBlcXVhbHMoaW50ZXJzZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnQgPT0gaW50ZXJzZWN0aW9uLnQgJiYgdGhpcy5vYmplY3QgPT09IGludGVyc2VjdGlvbi5vYmplY3Q7XG4gICAgfVxufVxuZXhwb3J0cy5JbnRlcnNlY3Rpb24gPSBJbnRlcnNlY3Rpb247XG5jbGFzcyBJbnRlcnNlY3Rpb25zIGV4dGVuZHMgY29sbGVjdGlvbl8xLk9iamVjdFBvb2wge1xuICAgIHN0YXRpYyBzb3J0SW50ZXJzZWN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEudCAtIGIudDtcbiAgICB9XG4gICAgY3JlYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IEludGVyc2VjdGlvbigwLCBudWxsKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGhpdCwgcmVnYXJkbGVzcyBvZiBzb3J0XG4gICAgKi9cbiAgICBoaXQoKSB7XG4gICAgICAgIHZhciBoaXQgPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoKGhpdCA9PSBudWxsIHx8IGl0ZW0udCA8IGhpdC50KSAmJiBpdGVtLnQgPiAwKVxuICAgICAgICAgICAgICAgIGhpdCA9IGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGhpdCBpbiBhIHNvcnRlZCBpbnRlcnNlY3Rpb25zIGxpc3RcbiAgICAqL1xuICAgIGZpcnN0SGl0KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaXRlbS50ID4gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc29ydCgpIHtcbiAgICAgICAgKDAsIHNvcnRfMS5tZXJnZVNvcnRJbnBsYWNlKSh0aGlzLml0ZW1zLCBJbnRlcnNlY3Rpb25zLnNvcnRJbnRlcnNlY3Rpb24sIDAsIHRoaXMuX2xlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhNYXAuc2V0KHRoaXMuaXRlbXNbaV0sIGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVxdWFscyhpbnRlcnNlY3Rpb25zKSB7XG4gICAgICAgIGlmICh0aGlzLl9sZW5ndGggIT0gaW50ZXJzZWN0aW9ucy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pdGVtc1tpXS5lcXVhbHMoaW50ZXJzZWN0aW9ucy5pdGVtc1tpXSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLkludGVyc2VjdGlvbnMgPSBJbnRlcnNlY3Rpb25zO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW50ZXJzZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NYXRlcmlhbCA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIE1hdGVyaWFsIHtcbiAgICBjb25zdHJ1Y3RvcihpZCA9IC0xKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yXzEuQ29sb3IuV0hJVEUuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5hbWJpZW50ID0gMC4xO1xuICAgICAgICB0aGlzLmRpZmZ1c2UgPSAwLjk7XG4gICAgICAgIHRoaXMuc3BlY3VsYXIgPSAwLjk7XG4gICAgICAgIHRoaXMuc2hpbmluZXNzID0gMjAwO1xuICAgICAgICB0aGlzLnBhdHRlcm4gPSBudWxsO1xuICAgICAgICB0aGlzLnJlZmxlY3RpdmUgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zcGFyZW5jeSA9IDA7XG4gICAgICAgIHRoaXMucmVmcmFjdGl2ZUluZGV4ID0gMTtcbiAgICB9XG4gICAgbGlnaHRpbmcobGlnaHQsIG9iamVjdCwgcG9pbnQsIGV5ZXYsIG5vcm1hbHYsIGluU2hhZG93ID0gZmFsc2UpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5wYXR0ZXJuICE9IG51bGwgPyB0aGlzLnBhdHRlcm4ucGF0dGVybkF0U2hhcGUob2JqZWN0LCBwb2ludCkgOiB0aGlzLmNvbG9yO1xuICAgICAgICB2YXIgZWZmZWN0aXZlQ29sb3IgPSBjb2xvci5oYWRhbWFyZFByb2R1Y3QobGlnaHQuaW50ZW5zaXR5KTtcbiAgICAgICAgdmFyIGFtYmllbnQgPSBlZmZlY3RpdmVDb2xvci5tdWx0aXBseSh0aGlzLmFtYmllbnQpO1xuICAgICAgICBpZiAoaW5TaGFkb3cpXG4gICAgICAgICAgICByZXR1cm4gYW1iaWVudDtcbiAgICAgICAgdmFyIGxpZ2h0diA9IGxpZ2h0LnBvc2l0aW9uLnN1YnN0cmFjdChwb2ludCkubm9ybWFsaXplKCk7XG4gICAgICAgIHZhciBsaWdodERvdE5vcm1hbCA9IGxpZ2h0di5kb3Qobm9ybWFsdik7XG4gICAgICAgIHZhciBkaWZmdXNlO1xuICAgICAgICB2YXIgc3BlY3VsYXI7XG4gICAgICAgIGlmIChsaWdodERvdE5vcm1hbCA8IDApIHtcbiAgICAgICAgICAgIGRpZmZ1c2UgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICAgICAgc3BlY3VsYXIgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGlmZnVzZSA9IGVmZmVjdGl2ZUNvbG9yLm11bHRpcGx5KHRoaXMuZGlmZnVzZSAqIGxpZ2h0RG90Tm9ybWFsKTtcbiAgICAgICAgICAgIHZhciByZWZsZWN0diA9IGxpZ2h0di5uZWdhdGUoKS5yZWZsZWN0KG5vcm1hbHYpO1xuICAgICAgICAgICAgdmFyIHJlZmxlY3REb3RFeWUgPSByZWZsZWN0di5kb3QoZXlldik7XG4gICAgICAgICAgICBpZiAocmVmbGVjdERvdEV5ZSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgc3BlY3VsYXIgPSBjb2xvcl8xLkNvbG9yLkJMQUNLO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IE1hdGgucG93KHJlZmxlY3REb3RFeWUsIHRoaXMuc2hpbmluZXNzKTtcbiAgICAgICAgICAgICAgICBzcGVjdWxhciA9IGxpZ2h0LmludGVuc2l0eS5tdWx0aXBseSh0aGlzLnNwZWN1bGFyICogZmFjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYW1iaWVudC5hZGQoZGlmZnVzZSkuYWRkKHNwZWN1bGFyKTtcbiAgICB9XG59XG5leHBvcnRzLk1hdGVyaWFsID0gTWF0ZXJpYWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRlcmlhbC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTWF0cml4M3gzID0gZXhwb3J0cy5NYXRyaXgyeDIgPSBleHBvcnRzLk1hdHJpeDR4NCA9IGV4cG9ydHMuTWF0cml4ID0gdm9pZCAwO1xuY29uc3QgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jbGFzcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIpIHtcbiAgICAgICAgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IGE7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCA9PSAwIHx8IG1hdHJpeFswXS5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBtYXRyaXhbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBtYXRyaXgubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQ2NEFycmF5KHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gbWF0cml4W3ldO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJvd1t4XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBhO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBiO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0NjRBcnJheSh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvZmFjdG9yKHJvdywgY29sdW1uKSB7XG4gICAgICAgIHJldHVybiAoKHJvdyArIGNvbHVtbikgJSAyICogMiAtIDEpICogLXRoaXMubWlub3Iocm93LCBjb2x1bW4pO1xuICAgIH1cbiAgICBtaW5vcihyb3csIGNvbHVtbikge1xuICAgICAgICB2YXIgbSA9IHRoaXMuc3VibWF0cml4KHJvdywgY29sdW1uKTtcbiAgICAgICAgcmV0dXJuIG0uZGV0ZXJtaW5hbnQoKTtcbiAgICB9XG4gICAgaXNJbnZlcnRpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmFudCgpICE9IDA7XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICBpZiAodGhpcy53aWR0aCAhPSB0aGlzLmhlaWdodClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSAyKVxuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeDJ4Mi5wcm90b3R5cGUuZGV0ZXJtaW5hbnQuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIGRldCA9IDA7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICBkZXQgKz0gdGhpcy5kYXRhW3hdICogdGhpcy5jb2ZhY3RvcigwLCB4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IFwiXCI7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgc3RyaW5nICs9IFwifFwiO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBzdHJpbmcgKz0gdGhpcy5kYXRhW3RoaXMud2lkdGggKiB5ICsgeF0udG9GaXhlZCgyKSArIFwiXFx0fFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyaW5nICs9IFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG4gICAgZ2V0KHJvdywgY29sdW1uKSB7XG4gICAgICAgIGlmIChyb3cgPj0gdGhpcy5oZWlnaHQgfHwgY29sdW1uID49IHRoaXMud2lkdGggfHwgcm93IDwgMCB8fCBjb2x1bW4gPCAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLndpZHRoICogcm93ICsgY29sdW1uXTtcbiAgICB9XG4gICAgc2V0KHJvdywgY29sdW1uLCB2YWx1ZSkge1xuICAgICAgICBpZiAocm93ID49IHRoaXMuaGVpZ2h0IHx8IGNvbHVtbiA+PSB0aGlzLndpZHRoIHx8IHJvdyA8IDAgfHwgY29sdW1uIDwgMClcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCk7XG4gICAgICAgIHRoaXMuZGF0YVt0aGlzLndpZHRoICogcm93ICsgY29sdW1uXSA9IHZhbHVlO1xuICAgIH1cbiAgICBtdWx0aXBseShtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeC5oZWlnaHQgIT0gdGhpcy5oZWlnaHQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgdmFyIG0gPSBuZXcgTWF0cml4KG1hdHJpeC53aWR0aCwgbWF0cml4LmhlaWdodCk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgbWF0cml4LmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IG1hdHJpeC53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBtYXRyaXguaGVpZ2h0OyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IG1hdHJpeC5kYXRhW3RoaXMud2lkdGggKiByICsgeF0gKiB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyByXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbS5kYXRhW3RoaXMud2lkdGggKiB5ICsgeF0gPSBzdW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuICAgIHRyYW5zcG9zZSgpIHtcbiAgICAgICAgdmFyIG1hdHJpeCA9IG5ldyBNYXRyaXgodGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpO1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IG1hdHJpeC5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IHk7IHggPCBtYXRyaXgud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMud2lkdGggKiB5ICsgeDtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXhUcmFuc3Bvc2VkID0gdGhpcy53aWR0aCAqIHggKyB5O1xuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4XSA9IHRoaXMuZGF0YVtpbmRleFRyYW5zcG9zZWRdO1xuICAgICAgICAgICAgICAgIG1hdHJpeC5kYXRhW2luZGV4VHJhbnNwb3NlZF0gPSB0aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXg7XG4gICAgfVxuICAgIHN1Ym1hdHJpeChyb3csIGNvbHVtbikge1xuICAgICAgICB2YXIgbSA9IG5ldyBNYXRyaXgodGhpcy53aWR0aCAtIDEsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIHZhciB5MiA9IDA7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgaWYgKHkgPT0gcm93KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgeDIgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoeCA9PSBjb2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG0uZGF0YVttLndpZHRoICogeTIgKyB4Ml0gPSB0aGlzLmRhdGFbdGhpcy53aWR0aCAqIHkgKyB4XTtcbiAgICAgICAgICAgICAgICB4MisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeTIrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICB2YXIgYXJyID0gbmV3IEFycmF5KHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICB2YXIgYyA9IG5ldyBBcnJheSh0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIGFyclt5XSA9IGM7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgIGNbeF0gPSB0aGlzLmdldCh5LCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICBlcXVhbHMobWF0cml4KSB7XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9IG1hdHJpeC53aWR0aCB8fCB0aGlzLmhlaWdodCAhPSBtYXRyaXguaGVpZ2h0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBkaWZmID0gTWF0aC5hYnModGhpcy5kYXRhW2ldIC0gbWF0cml4LmRhdGFbaV0pO1xuICAgICAgICAgICAgICAgIGlmIChkaWZmID49IGNvbnN0YW50c18xLkVQU0lMT04pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeCA9IE1hdHJpeDtcbmNsYXNzIE1hdHJpeDR4NCBleHRlbmRzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggIT0gNCB8fCBtYXRyaXhbMF0ubGVuZ3RoICE9IDQgfHwgbWF0cml4WzFdLmxlbmd0aCAhPSA0IHx8IG1hdHJpeFsyXS5sZW5ndGggIT0gNCB8fCBtYXRyaXhbM10ubGVuZ3RoICE9IDQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyKG1hdHJpeCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlcig0LCA0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgdmlld1RyYW5zZm9ybShmcm9tLCB0bywgdXAsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgZm9yd2FyZCA9IHRvLnN1YnN0cmFjdChmcm9tKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdmFyIHVwbiA9IHVwLm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgbGVmdCA9IGZvcndhcmQuY3Jvc3ModXBuKTtcbiAgICAgICAgdmFyIHRydWVVcCA9IGxlZnQuY3Jvc3MoZm9yd2FyZCk7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gbGVmdC54O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IGxlZnQueTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSBsZWZ0Lno7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gdHJ1ZVVwLng7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gdHJ1ZVVwLnk7XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gdHJ1ZVVwLno7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gLWZvcndhcmQueDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAtZm9yd2FyZC55O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAtZm9yd2FyZC56O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICBNYXRyaXg0eDQudHJhbnNsYXRpb24oLWZyb20ueCwgLWZyb20ueSwgLWZyb20ueiwgTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQpO1xuICAgICAgICB0YXJnZXQubXVsdGlwbHkoTWF0cml4NHg0LnRlbXBNYXRyaXg0eDQsIHRhcmdldCk7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHN0YXRpYyB0cmFuc2xhdGlvbih4LCB5LCB6LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0geDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSB5O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSB6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25YKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IGNvcztcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSBzaW47XG4gICAgICAgIHRhcmdldC5kYXRhWzEzXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25ZKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAtc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzVdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgcm90YXRpb25aKHJhZGlhbnMsIHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MocmFkaWFucyk7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyYWRpYW5zKTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gc2luO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gLXNpbjtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSBjb3M7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IDE7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgc2NhbGluZyh4LCB5LCB6LCB0YXJnZXQgPSBuZXcgTWF0cml4NHg0KCkpIHtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSB4O1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzhdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IHk7XG4gICAgICAgIHRhcmdldC5kYXRhWzldID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IHo7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNV0gPSAxO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBzdGF0aWMgc2hlYXJpbmcoeHksIHh6LCB5eCwgeXosIHp4LCB6eSwgdGFyZ2V0ID0gbmV3IE1hdHJpeDR4NCgpKSB7XG4gICAgICAgIHRhcmdldC5kYXRhWzBdID0gMTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNF0gPSB5eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSB6eDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSB4eTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHp5O1xuICAgICAgICB0YXJnZXQuZGF0YVsxM10gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IHh6O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IHl6O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMF0gPSAxO1xuICAgICAgICB0YXJnZXQuZGF0YVsxNF0gPSAwO1xuICAgICAgICB0YXJnZXQuZGF0YVszXSA9IDA7XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTFdID0gMDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gMTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgdHJhbnNwb3NlKHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMF0gPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgIHRhcmdldC5kYXRhWzFdID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbMl07XG4gICAgICAgIHRhcmdldC5kYXRhWzJdID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB0YXJnZXQuZGF0YVs4XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbM107XG4gICAgICAgIHRhcmdldC5kYXRhWzNdID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbNV0gPSB0aGlzLmRhdGFbNV07XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIHRhcmdldC5kYXRhWzZdID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IHN3YXA7XG4gICAgICAgIHN3YXAgPSB0aGlzLmRhdGFbN107XG4gICAgICAgIHRhcmdldC5kYXRhWzddID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gc3dhcDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTBdID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgc3dhcCA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHRhcmdldC5kYXRhWzExXSA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IHN3YXA7XG4gICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHRvQXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbdGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSwgdGhpcy5kYXRhWzNdXSxcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdLCB0aGlzLmRhdGFbN11dLFxuICAgICAgICAgICAgW3RoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdLCB0aGlzLmRhdGFbMTFdXSxcbiAgICAgICAgICAgIFt0aGlzLmRhdGFbMTJdLCB0aGlzLmRhdGFbMTNdLCB0aGlzLmRhdGFbMTRdLCB0aGlzLmRhdGFbMTVdXVxuICAgICAgICBdO1xuICAgIH1cbiAgICBpbnZlcnNlKHRhcmdldCA9IG5ldyBNYXRyaXg0eDQoKSkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICB2YXIgZGV0ZXJtaW5hbnQgPSAoYTAwICogKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTEzICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkpICtcbiAgICAgICAgICAgIGEwMSAqIC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMTIgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMyIC0gYTIyICogYTMwKSkgK1xuICAgICAgICAgICAgYTAyICogKGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMyAqIC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkpO1xuICAgICAgICBpZiAoZGV0ZXJtaW5hbnQgPT0gMClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB0YXJnZXQuZGF0YVswXSA9IChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxXSA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgKyBhMDIgKiAtKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMDMgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMl0gPSAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMDMgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbM10gPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpICsgYTAyICogLShhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAzICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzRdID0gLShhMTAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs1XSA9IChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGEwMiAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGEwMyAqIChhMjAgKiBhMzIgLSBhMjIgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVs2XSA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMDIgKiAtKGExMCAqIGEzMyAtIGExMyAqIGEzMCkgKyBhMDMgKiAoYTEwICogYTMyIC0gYTEyICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgKyBhMDIgKiAtKGExMCAqIGEyMyAtIGExMyAqIGEyMCkgKyBhMDMgKiAoYTEwICogYTIyIC0gYTEyICogYTIwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMyAtIGEyMyAqIGEzMCkgKyBhMTMgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbOV0gPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTAzICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IChhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEwMSAqIC0oYTEwICogYTMzIC0gYTEzICogYTMwKSArIGEwMyAqIChhMTAgKiBhMzEgLSBhMTEgKiBhMzApKSAvIGRldGVybWluYW50O1xuICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjMgLSBhMTMgKiBhMjApICsgYTAzICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgKyBhMTEgKiAtKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkgKyBhMTIgKiAoYTIwICogYTMxIC0gYTIxICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gKGEwMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTAxICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTAyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHRhcmdldC5kYXRhWzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMDEgKiAtKGExMCAqIGEzMiAtIGExMiAqIGEzMCkgKyBhMDIgKiAoYTEwICogYTMxIC0gYTExICogYTMwKSkgLyBkZXRlcm1pbmFudDtcbiAgICAgICAgdGFyZ2V0LmRhdGFbMTVdID0gKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgYTAxICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgYTAyICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTAwID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICB2YXIgYTAxID0gdGhpcy5kYXRhWzFdO1xuICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICB2YXIgYTAzID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTEzID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzldO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzEwXTtcbiAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgIHZhciBhMzAgPSB0aGlzLmRhdGFbMTJdO1xuICAgICAgICB2YXIgYTMxID0gdGhpcy5kYXRhWzEzXTtcbiAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgIHZhciBhMzMgPSB0aGlzLmRhdGFbMTVdO1xuICAgICAgICByZXR1cm4gKGEwMCAqIChhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSArIGExMiAqIC0oYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMyAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpKSArXG4gICAgICAgICAgICBhMDEgKiAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpICsgYTEyICogLShhMjAgKiBhMzMgLSBhMjMgKiBhMzApICsgYTEzICogKGEyMCAqIGEzMiAtIGEyMiAqIGEzMCkpICtcbiAgICAgICAgICAgIGEwMiAqIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSArIGExMSAqIC0oYTIwICogYTMzIC0gYTIzICogYTMwKSArIGExMyAqIChhMjAgKiBhMzEgLSBhMjEgKiBhMzApKSArXG4gICAgICAgICAgICBhMDMgKiAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpICsgYTExICogLShhMjAgKiBhMzIgLSBhMjIgKiBhMzApICsgYTEyICogKGEyMCAqIGEzMSAtIGEyMSAqIGEzMCkpKTtcbiAgICB9XG4gICAgYXNzaWduKG1hdHJpeCkge1xuICAgICAgICB0aGlzLmRhdGFbMF0gPSBtYXRyaXguZGF0YVswXTtcbiAgICAgICAgdGhpcy5kYXRhWzFdID0gbWF0cml4LmRhdGFbMV07XG4gICAgICAgIHRoaXMuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdO1xuICAgICAgICB0aGlzLmRhdGFbM10gPSBtYXRyaXguZGF0YVszXTtcbiAgICAgICAgdGhpcy5kYXRhWzRdID0gbWF0cml4LmRhdGFbNF07XG4gICAgICAgIHRoaXMuZGF0YVs1XSA9IG1hdHJpeC5kYXRhWzVdO1xuICAgICAgICB0aGlzLmRhdGFbNl0gPSBtYXRyaXguZGF0YVs2XTtcbiAgICAgICAgdGhpcy5kYXRhWzddID0gbWF0cml4LmRhdGFbN107XG4gICAgICAgIHRoaXMuZGF0YVs4XSA9IG1hdHJpeC5kYXRhWzhdO1xuICAgICAgICB0aGlzLmRhdGFbOV0gPSBtYXRyaXguZGF0YVs5XTtcbiAgICAgICAgdGhpcy5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzEwXTtcbiAgICAgICAgdGhpcy5kYXRhWzExXSA9IG1hdHJpeC5kYXRhWzExXTtcbiAgICAgICAgdGhpcy5kYXRhWzEyXSA9IG1hdHJpeC5kYXRhWzEyXTtcbiAgICAgICAgdGhpcy5kYXRhWzEzXSA9IG1hdHJpeC5kYXRhWzEzXTtcbiAgICAgICAgdGhpcy5kYXRhWzE0XSA9IG1hdHJpeC5kYXRhWzE0XTtcbiAgICAgICAgdGhpcy5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzE1XTtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHZhciBtID0gbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICBtLmRhdGFbMF0gPSB0aGlzLmRhdGFbMF07XG4gICAgICAgIG0uZGF0YVsxXSA9IHRoaXMuZGF0YVsxXTtcbiAgICAgICAgbS5kYXRhWzJdID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICBtLmRhdGFbM10gPSB0aGlzLmRhdGFbM107XG4gICAgICAgIG0uZGF0YVs0XSA9IHRoaXMuZGF0YVs0XTtcbiAgICAgICAgbS5kYXRhWzVdID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICBtLmRhdGFbNl0gPSB0aGlzLmRhdGFbNl07XG4gICAgICAgIG0uZGF0YVs3XSA9IHRoaXMuZGF0YVs3XTtcbiAgICAgICAgbS5kYXRhWzhdID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICBtLmRhdGFbOV0gPSB0aGlzLmRhdGFbOV07XG4gICAgICAgIG0uZGF0YVsxMF0gPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICBtLmRhdGFbMTFdID0gdGhpcy5kYXRhWzExXTtcbiAgICAgICAgbS5kYXRhWzEyXSA9IHRoaXMuZGF0YVsxMl07XG4gICAgICAgIG0uZGF0YVsxM10gPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICBtLmRhdGFbMTRdID0gdGhpcy5kYXRhWzE0XTtcbiAgICAgICAgbS5kYXRhWzE1XSA9IHRoaXMuZGF0YVsxNV07XG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cbiAgICBtdWx0aXBseShhLCBiKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTWF0cml4NHg0KSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gYiAhPT0gbnVsbCAmJiBiICE9PSB2b2lkIDAgPyBiIDogbmV3IE1hdHJpeDR4NCgpO1xuICAgICAgICAgICAgaWYgKG1hdHJpeCA9PT0gdGhpcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBhO1xuICAgICAgICAgICAgdmFyIGEwMCA9IHRoaXMuZGF0YVswXTtcbiAgICAgICAgICAgIHZhciBhMDEgPSB0aGlzLmRhdGFbMV07XG4gICAgICAgICAgICB2YXIgYTAyID0gdGhpcy5kYXRhWzJdO1xuICAgICAgICAgICAgdmFyIGEwMyA9IHRoaXMuZGF0YVszXTtcbiAgICAgICAgICAgIHZhciBhMTAgPSB0aGlzLmRhdGFbNF07XG4gICAgICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICAgICAgdmFyIGExMiA9IHRoaXMuZGF0YVs2XTtcbiAgICAgICAgICAgIHZhciBhMTMgPSB0aGlzLmRhdGFbN107XG4gICAgICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICAgICAgdmFyIGEyMSA9IHRoaXMuZGF0YVs5XTtcbiAgICAgICAgICAgIHZhciBhMjIgPSB0aGlzLmRhdGFbMTBdO1xuICAgICAgICAgICAgdmFyIGEyMyA9IHRoaXMuZGF0YVsxMV07XG4gICAgICAgICAgICB2YXIgYTMwID0gdGhpcy5kYXRhWzEyXTtcbiAgICAgICAgICAgIHZhciBhMzEgPSB0aGlzLmRhdGFbMTNdO1xuICAgICAgICAgICAgdmFyIGEzMiA9IHRoaXMuZGF0YVsxNF07XG4gICAgICAgICAgICB2YXIgYTMzID0gdGhpcy5kYXRhWzE1XTtcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzBdID0gbWF0cml4LmRhdGFbMF0gKiBhMDAgKyBtYXRyaXguZGF0YVs0XSAqIGEwMSArIG1hdHJpeC5kYXRhWzhdICogYTAyICsgbWF0cml4LmRhdGFbMTJdICogYTAzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMV0gPSBtYXRyaXguZGF0YVsxXSAqIGEwMCArIG1hdHJpeC5kYXRhWzVdICogYTAxICsgbWF0cml4LmRhdGFbOV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxM10gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsyXSA9IG1hdHJpeC5kYXRhWzJdICogYTAwICsgbWF0cml4LmRhdGFbNl0gKiBhMDEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVszXSA9IG1hdHJpeC5kYXRhWzNdICogYTAwICsgbWF0cml4LmRhdGFbN10gKiBhMDEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMDIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMDM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs0XSA9IG1hdHJpeC5kYXRhWzBdICogYTEwICsgbWF0cml4LmRhdGFbNF0gKiBhMTEgKyBtYXRyaXguZGF0YVs4XSAqIGExMiArIG1hdHJpeC5kYXRhWzEyXSAqIGExMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzVdID0gbWF0cml4LmRhdGFbMV0gKiBhMTAgKyBtYXRyaXguZGF0YVs1XSAqIGExMSArIG1hdHJpeC5kYXRhWzldICogYTEyICsgbWF0cml4LmRhdGFbMTNdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbNl0gPSBtYXRyaXguZGF0YVsyXSAqIGExMCArIG1hdHJpeC5kYXRhWzZdICogYTExICsgbWF0cml4LmRhdGFbMTBdICogYTEyICsgbWF0cml4LmRhdGFbMTRdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbN10gPSBtYXRyaXguZGF0YVszXSAqIGExMCArIG1hdHJpeC5kYXRhWzddICogYTExICsgbWF0cml4LmRhdGFbMTFdICogYTEyICsgbWF0cml4LmRhdGFbMTVdICogYTEzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbOF0gPSBtYXRyaXguZGF0YVswXSAqIGEyMCArIG1hdHJpeC5kYXRhWzRdICogYTIxICsgbWF0cml4LmRhdGFbOF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxMl0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVs5XSA9IG1hdHJpeC5kYXRhWzFdICogYTIwICsgbWF0cml4LmRhdGFbNV0gKiBhMjEgKyBtYXRyaXguZGF0YVs5XSAqIGEyMiArIG1hdHJpeC5kYXRhWzEzXSAqIGEyMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzEwXSA9IG1hdHJpeC5kYXRhWzJdICogYTIwICsgbWF0cml4LmRhdGFbNl0gKiBhMjEgKyBtYXRyaXguZGF0YVsxMF0gKiBhMjIgKyBtYXRyaXguZGF0YVsxNF0gKiBhMjM7XG4gICAgICAgICAgICB0YXJnZXQuZGF0YVsxMV0gPSBtYXRyaXguZGF0YVszXSAqIGEyMCArIG1hdHJpeC5kYXRhWzddICogYTIxICsgbWF0cml4LmRhdGFbMTFdICogYTIyICsgbWF0cml4LmRhdGFbMTVdICogYTIzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTJdID0gbWF0cml4LmRhdGFbMF0gKiBhMzAgKyBtYXRyaXguZGF0YVs0XSAqIGEzMSArIG1hdHJpeC5kYXRhWzhdICogYTMyICsgbWF0cml4LmRhdGFbMTJdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTNdID0gbWF0cml4LmRhdGFbMV0gKiBhMzAgKyBtYXRyaXguZGF0YVs1XSAqIGEzMSArIG1hdHJpeC5kYXRhWzldICogYTMyICsgbWF0cml4LmRhdGFbMTNdICogYTMzO1xuICAgICAgICAgICAgdGFyZ2V0LmRhdGFbMTRdID0gbWF0cml4LmRhdGFbMl0gKiBhMzAgKyBtYXRyaXguZGF0YVs2XSAqIGEzMSArIG1hdHJpeC5kYXRhWzEwXSAqIGEzMiArIG1hdHJpeC5kYXRhWzE0XSAqIGEzMztcbiAgICAgICAgICAgIHRhcmdldC5kYXRhWzE1XSA9IG1hdHJpeC5kYXRhWzNdICogYTMwICsgbWF0cml4LmRhdGFbN10gKiBhMzEgKyBtYXRyaXguZGF0YVsxMV0gKiBhMzIgKyBtYXRyaXguZGF0YVsxNV0gKiBhMzM7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEgaW5zdGFuY2VvZiB0dXBsZV8xLlR1cGxlKSB7XG4gICAgICAgICAgICB2YXIgdCA9IGE7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHR1cGxlXzEuVHVwbGUodGhpcy5kYXRhWzBdICogdC54ICsgdGhpcy5kYXRhWzFdICogdC55ICsgdGhpcy5kYXRhWzJdICogdC56ICsgdGhpcy5kYXRhWzNdICogdC53LCB0aGlzLmRhdGFbNF0gKiB0LnggKyB0aGlzLmRhdGFbNV0gKiB0LnkgKyB0aGlzLmRhdGFbNl0gKiB0LnogKyB0aGlzLmRhdGFbN10gKiB0LncsIHRoaXMuZGF0YVs4XSAqIHQueCArIHRoaXMuZGF0YVs5XSAqIHQueSArIHRoaXMuZGF0YVsxMF0gKiB0LnogKyB0aGlzLmRhdGFbMTFdICogdC53LCB0aGlzLmRhdGFbMTJdICogdC54ICsgdGhpcy5kYXRhWzEzXSAqIHQueSArIHRoaXMuZGF0YVsxNF0gKiB0LnogKyB0aGlzLmRhdGFbMTVdICogdC53KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vYSBpbnN0YW5jZW9mIE1hdHJpeCAobm90IHN1cHBvcnRlZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5NYXRyaXg0eDQgPSBNYXRyaXg0eDQ7XG5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYID0gbmV3IE1hdHJpeDR4NChbXG4gICAgWzEsIDAsIDAsIDBdLFxuICAgIFswLCAxLCAwLCAwXSxcbiAgICBbMCwgMCwgMSwgMF0sXG4gICAgWzAsIDAsIDAsIDFdXG5dKTtcbk1hdHJpeDR4NC50ZW1wTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NCgpO1xuY2xhc3MgTWF0cml4MngyIGV4dGVuZHMgTWF0cml4IHtcbiAgICBjb25zdHJ1Y3RvcihtYXRyaXgpIHtcbiAgICAgICAgaWYgKG1hdHJpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobWF0cml4Lmxlbmd0aCAhPSAyIHx8IG1hdHJpeFswXS5sZW5ndGggIT0gMiB8fCBtYXRyaXhbMV0ubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1cGVyKG1hdHJpeCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlcigyLCAyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXSAqIHRoaXMuZGF0YVszXSAtIHRoaXMuZGF0YVsxXSAqIHRoaXMuZGF0YVsyXTtcbiAgICB9XG59XG5leHBvcnRzLk1hdHJpeDJ4MiA9IE1hdHJpeDJ4MjtcbmNsYXNzIE1hdHJpeDN4MyBleHRlbmRzIE1hdHJpeCB7XG4gICAgY29uc3RydWN0b3IobWF0cml4KSB7XG4gICAgICAgIGlmIChtYXRyaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKG1hdHJpeC5sZW5ndGggIT0gMyB8fCBtYXRyaXhbMF0ubGVuZ3RoICE9IDMgfHwgbWF0cml4WzFdLmxlbmd0aCAhPSAzIHx8IG1hdHJpeFsyXS5sZW5ndGggIT0gMykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIobWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyKDMsIDMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRldGVybWluYW50KCkge1xuICAgICAgICB2YXIgYTEwID0gdGhpcy5kYXRhWzNdO1xuICAgICAgICB2YXIgYTExID0gdGhpcy5kYXRhWzRdO1xuICAgICAgICB2YXIgYTEyID0gdGhpcy5kYXRhWzVdO1xuICAgICAgICB2YXIgYTIwID0gdGhpcy5kYXRhWzZdO1xuICAgICAgICB2YXIgYTIxID0gdGhpcy5kYXRhWzddO1xuICAgICAgICB2YXIgYTIyID0gdGhpcy5kYXRhWzhdO1xuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YVswXSAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpICsgdGhpcy5kYXRhWzFdICogLShhMTAgKiBhMjIgLSBhMTIgKiBhMjApICsgdGhpcy5kYXRhWzJdICogKGExMCAqIGEyMSAtIGExMSAqIGEyMCkpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWF0cml4M3gzID0gTWF0cml4M3gzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0cml4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Db21wb3NpdGVQYXR0ZXJuID0gZXhwb3J0cy5QZXJsaW5QYXR0ZXJuID0gZXhwb3J0cy5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZSA9IGV4cG9ydHMuQ2hlY2tlcjNkUGF0dGVybiA9IGV4cG9ydHMuUmluZ1BhdHRlcm4gPSBleHBvcnRzLkdyYWRpZW50UGF0dGVybiA9IGV4cG9ydHMuU3RyaXBlUGF0dGVybiA9IGV4cG9ydHMuUGF0dGVybiA9IHZvaWQgMDtcbmNvbnN0IG1hdHJpeF8xID0gcmVxdWlyZShcIi4vbWF0cml4XCIpO1xuY29uc3QgZmFzdF9zaW1wbGV4X25vaXNlXzEgPSByZXF1aXJlKFwiZmFzdC1zaW1wbGV4LW5vaXNlXCIpO1xuY2xhc3MgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IodHJhbnNmb3JtKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1hdGlvbiBtYXRyaXguIENhbGwgc2V0dGVyIGFmdGVyIGNoYW5nZSBmb3IgdXBkYXRpbmcgaW52ZXJzZS5cbiAgICAgKi9cbiAgICBnZXQgdHJhbnNmb3JtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtO1xuICAgIH1cbiAgICBzZXQgdHJhbnNmb3JtKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmludmVyc2VUcmFuc2Zvcm0gPSB2YWx1ZS5pbnZlcnNlKCk7XG4gICAgfVxuICAgIHBhdHRlcm5BdFNoYXBlKG9iamVjdCwgd29ybGRQb2ludCkge1xuICAgICAgICB2YXIgb2JqZWN0UG9pbnQgPSBvYmplY3QuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh3b3JsZFBvaW50KTtcbiAgICAgICAgdmFyIHBhdHRlcm5Qb2ludCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShvYmplY3RQb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdHRlcm5BdChwYXR0ZXJuUG9pbnQpO1xuICAgIH1cbn1cbmV4cG9ydHMuUGF0dGVybiA9IFBhdHRlcm47XG5QYXR0ZXJuLnRlbXBNYXRyaXgxID0gbmV3IG1hdHJpeF8xLk1hdHJpeDR4NCgpO1xuY2xhc3MgU3RyaXBlUGF0dGVybiBleHRlbmRzIFBhdHRlcm4ge1xuICAgIGNvbnN0cnVjdG9yKGEsIGIsIHRyYW5zZm9ybSA9IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKSkge1xuICAgICAgICBzdXBlcih0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmNvbG9ycyA9IFthLCBiXTtcbiAgICB9XG4gICAgZ2V0IGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1swXTtcbiAgICB9XG4gICAgZ2V0IGIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1sxXTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1tNYXRoLmZsb29yKE1hdGguYWJzKHBvaW50LngpKSAlIDJdO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLlN0cmlwZVBhdHRlcm4gPSBTdHJpcGVQYXR0ZXJuO1xuY2xhc3MgR3JhZGllbnRQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLmIuc3Vic3RyYWN0KHRoaXMuYSk7XG4gICAgICAgIHZhciBmcmFjdGlvbiA9IHBvaW50LnggLSBNYXRoLmZsb29yKHBvaW50LngpO1xuICAgICAgICByZXR1cm4gdGhpcy5hLmFkZChkaXN0YW5jZS5tdWx0aXBseShmcmFjdGlvbikpO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkdyYWRpZW50UGF0dGVybiA9IEdyYWRpZW50UGF0dGVybjtcbmNsYXNzIFJpbmdQYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICByZXR1cm4gKE1hdGguZmxvb3IoTWF0aC5zcXJ0KHBvaW50LnggKiBwb2ludC54ICsgcG9pbnQueiAqIHBvaW50LnopKSAlIDIgPT0gMCkgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0cmFuc2Zvcm06IHRoaXMudHJhbnNmb3JtLnRvQXJyYXkoKSB9O1xuICAgIH1cbn1cbmV4cG9ydHMuUmluZ1BhdHRlcm4gPSBSaW5nUGF0dGVybjtcbmNsYXNzIENoZWNrZXIzZFBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCkpIHtcbiAgICAgICAgc3VwZXIodHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiAoKE1hdGguZmxvb3IocG9pbnQueCkgKyBNYXRoLmZsb29yKHBvaW50LnkpICsgTWF0aC5mbG9vcihwb2ludC56KSkgJSAyID09IDApID8gdGhpcy5hIDogdGhpcy5iO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBhOiB0aGlzLmEsIGI6IHRoaXMuYiwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNoZWNrZXIzZFBhdHRlcm4gPSBDaGVja2VyM2RQYXR0ZXJuO1xuY2xhc3MgQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUgZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihhLCBiLCB0cmFuc2Zvcm0gPSBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCksIHV2U2NhbGUgPSAxKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgICAgIHRoaXMudXZTY2FsZSA9IHV2U2NhbGU7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICB2YXIgdHUgPSBNYXRoLmF0YW4yKHBvaW50LngsIHBvaW50LnopIC8gTWF0aC5QSSAvIDIgKiB0aGlzLnV2U2NhbGU7XG4gICAgICAgIHZhciB0diA9IHBvaW50LnkgLyAyICogdGhpcy51dlNjYWxlO1xuICAgICAgICByZXR1cm4gKCgoTWF0aC5mbG9vcih0dSkgKyBNYXRoLmZsb29yKHR2KSkpICUgMiA9PSAwKSA/IHRoaXMuYSA6IHRoaXMuYjtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHJldHVybiB7IHR5cGU6IHRoaXMuY29uc3RydWN0b3IubmFtZSwgYTogdGhpcy5hLCBiOiB0aGlzLmIsIHV2U2NhbGU6IHRoaXMudXZTY2FsZSwgdHJhbnNmb3JtOiB0aGlzLnRyYW5zZm9ybS50b0FycmF5KCkgfTtcbiAgICB9XG59XG5leHBvcnRzLkNoZWNrZXIzRFBhdHRlcm40U3BoZXJlID0gQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmU7XG5jbGFzcyBQZXJsaW5QYXR0ZXJuIGV4dGVuZHMgUGF0dGVybiB7XG4gICAgY29uc3RydWN0b3IoYSwgYiwgdGhyZXNob2xkID0gMC41LCBzZWVkID0gTWF0aC5yYW5kb20oKSwgdHJhbnNmb3JtID0gbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKSB7XG4gICAgICAgIHN1cGVyKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgICAgIHRoaXMubm9pc2UzZCA9ICgwLCBmYXN0X3NpbXBsZXhfbm9pc2VfMS5tYWtlTm9pc2UzRCkoKCkgPT4gdGhpcy5zZWVkKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSB0aHJlc2hvbGQ7XG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XG4gICAgfVxuICAgIHBhdHRlcm5BdChwb2ludCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2lzZTNkKHBvaW50LngsIHBvaW50LnksIHBvaW50LnopID4gdGhpcy50aHJlc2hvbGQgPyB0aGlzLmEgOiB0aGlzLmI7XG4gICAgfVxuICAgIHRvT2JqZWN0KCkge1xuICAgICAgICByZXR1cm4geyB0eXBlOiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIGE6IHRoaXMuYSwgYjogdGhpcy5iLCB0aHJlc2hvbGQ6IHRoaXMudGhyZXNob2xkLCBzZWVkOiB0aGlzLnNlZWQsIHRyYW5zZm9ybTogdGhpcy50cmFuc2Zvcm0udG9BcnJheSgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5QZXJsaW5QYXR0ZXJuID0gUGVybGluUGF0dGVybjtcbmNsYXNzIENvbXBvc2l0ZVBhdHRlcm4gZXh0ZW5kcyBQYXR0ZXJuIHtcbiAgICBjb25zdHJ1Y3RvcihwYXR0ZXJuMSwgcGF0dGVybjIpIHtcbiAgICAgICAgc3VwZXIobWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpKTtcbiAgICAgICAgdGhpcy5wYXR0ZXJuMSA9IHBhdHRlcm4xO1xuICAgICAgICB0aGlzLnBhdHRlcm4yID0gcGF0dGVybjI7XG4gICAgfVxuICAgIHBhdHRlcm5BdFNoYXBlKG9iamVjdCwgd29ybGRQb2ludCkge1xuICAgICAgICB2YXIgb2JqZWN0UG9pbnQgPSBvYmplY3QuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseSh3b3JsZFBvaW50KTtcbiAgICAgICAgdmFyIHBhdHRlcm5Qb2ludCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShvYmplY3RQb2ludCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdHRlcm4xLnBhdHRlcm5BdFNoYXBlKG9iamVjdCwgd29ybGRQb2ludCkuYWRkKHRoaXMucGF0dGVybjIucGF0dGVybkF0U2hhcGUob2JqZWN0LCB3b3JsZFBvaW50KSkubXVsdGlwbHkoMC41KTtcbiAgICB9XG4gICAgcGF0dGVybkF0KHBvaW50KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0b09iamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBwYXR0ZXJuMTogdGhpcy5wYXR0ZXJuMS50b09iamVjdCgpLCBwYXR0ZXJuMjogdGhpcy5wYXR0ZXJuMi50b09iamVjdCgpIH07XG4gICAgfVxufVxuZXhwb3J0cy5Db21wb3NpdGVQYXR0ZXJuID0gQ29tcG9zaXRlUGF0dGVybjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhdHRlcm5zLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QbGFuZSA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGludGVyc2VjdGlvbl8xID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0aW9uXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIFBsYW5lIHtcbiAgICBjb25zdHJ1Y3RvcihpZCwgdHJhbnNmb3JtLCBtYXRlcmlhbCkge1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtICE9PSBudWxsICYmIHRyYW5zZm9ybSAhPT0gdm9pZCAwID8gdHJhbnNmb3JtIDogbWF0cml4XzEuTWF0cml4NHg0LklERU5USVRZX01BVFJJWC5jbG9uZSgpO1xuICAgICAgICB0aGlzLm1hdGVyaWFsID0gbWF0ZXJpYWwgIT09IG51bGwgJiYgbWF0ZXJpYWwgIT09IHZvaWQgMCA/IG1hdGVyaWFsIDogbmV3IG1hdGVyaWFsXzEuTWF0ZXJpYWwoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtYXRpb24gbWF0cml4LiBDYWxsIHNldHRlciBhZnRlciBjaGFuZ2UgZm9yIHVwZGF0aW5nIGludmVyc2UuXG4gICAgICovXG4gICAgZ2V0IHRyYW5zZm9ybSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgICB9XG4gICAgc2V0IHRyYW5zZm9ybSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5pbnZlcnNlVHJhbnNmb3JtID0gdmFsdWUuaW52ZXJzZSgpO1xuICAgIH1cbiAgICBpbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zID0gbmV3IGludGVyc2VjdGlvbl8xLkludGVyc2VjdGlvbnMoKSkge1xuICAgICAgICByYXkgPSByYXkudHJhbnNmb3JtKHRoaXMuaW52ZXJzZVRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMubG9jYWxJbnRlcnNlY3QocmF5LCBpbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIG5vcm1hbEF0KHApIHtcbiAgICAgICAgdmFyIG9iamVjdE5vcm1hbCA9IHR1cGxlXzEuVHVwbGUudmVjdG9yKDAsIDEsIDApO1xuICAgICAgICB2YXIgd29ybGROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0udHJhbnNwb3NlKFBsYW5lLnRlbXBNYXRyaXgxKS5tdWx0aXBseShvYmplY3ROb3JtYWwpO1xuICAgICAgICB3b3JsZE5vcm1hbC53ID0gMDtcbiAgICAgICAgcmV0dXJuIHdvcmxkTm9ybWFsLm5vcm1hbGl6ZSgpO1xuICAgIH1cbiAgICBsb2NhbEludGVyc2VjdChyYXksIGludGVyc2VjdGlvbnMgPSBuZXcgaW50ZXJzZWN0aW9uXzEuSW50ZXJzZWN0aW9ucygpKSB7XG4gICAgICAgIGlmIChNYXRoLmFicyhyYXkuZGlyZWN0aW9uLnkpIDwgY29uc3RhbnRzXzEuRVBTSUxPTilcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xuICAgICAgICB2YXIgaSA9IGludGVyc2VjdGlvbnMuYWRkKCk7XG4gICAgICAgIGkub2JqZWN0ID0gdGhpcztcbiAgICAgICAgaS50ID0gLXJheS5vcmlnaW4ueSAvIHJheS5kaXJlY3Rpb24ueTtcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxufVxuZXhwb3J0cy5QbGFuZSA9IFBsYW5lO1xuUGxhbmUudGVtcE1hdHJpeDEgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wbGFuZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUG9pbnRMaWdodCA9IHZvaWQgMDtcbmNvbnN0IHR1cGxlXzEgPSByZXF1aXJlKFwiLi90dXBsZVwiKTtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNsYXNzIFBvaW50TGlnaHQge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCBpbnRlbnNpdHkpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uICE9PSBudWxsICYmIHBvc2l0aW9uICE9PSB2b2lkIDAgPyBwb3NpdGlvbiA6IHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCk7XG4gICAgICAgIHRoaXMuaW50ZW5zaXR5ID0gaW50ZW5zaXR5ICE9PSBudWxsICYmIGludGVuc2l0eSAhPT0gdm9pZCAwID8gaW50ZW5zaXR5IDogbmV3IGNvbG9yXzEuQ29sb3IoMSwgMSwgMSk7XG4gICAgfVxufVxuZXhwb3J0cy5Qb2ludExpZ2h0ID0gUG9pbnRMaWdodDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBvaW50TGlnaHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJheSA9IHZvaWQgMDtcbmNsYXNzIFJheSB7XG4gICAgY29uc3RydWN0b3Iob3JpZ2luLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIH1cbiAgICBwb3NpdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbi5hZGQodGhpcy5kaXJlY3Rpb24ubXVsdGlwbHkodCkpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0obWF0cml4KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBtYXRyaXgubXVsdGlwbHkodGhpcy5kaXJlY3Rpb24pO1xuICAgICAgICB2YXIgb3JpZ2luID0gbWF0cml4Lm11bHRpcGx5KHRoaXMub3JpZ2luKTtcbiAgICAgICAgdmFyIHJheSA9IG5ldyBSYXkob3JpZ2luLCBkaXJlY3Rpb24pO1xuICAgICAgICByZXR1cm4gcmF5O1xuICAgIH1cbn1cbmV4cG9ydHMuUmF5ID0gUmF5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmF5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXJpYWxpemVXb3JsZCA9IGV4cG9ydHMuc2VyaWFsaXplQXJyYXkgPSBleHBvcnRzLnNlcmlhbGl6ZVNoYXBlID0gZXhwb3J0cy5zZXJpYWxpemVNYXRlcmlhbCA9IGV4cG9ydHMuc2VyaWFsaXplUGF0dGVybiA9IGV4cG9ydHMuc2VyaWFsaXplQ2FtZXJhID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUNhbWVyYSA9IGV4cG9ydHMuZGVzZXJpYWxpemVDb2xvciA9IGV4cG9ydHMuZGVzZXJpYWxpemVTdHJpbmcgPSBleHBvcnRzLmRlc2VyaWFsaXplTnVtYmVyID0gZXhwb3J0cy5kZXNlcmlhbGl6ZVR1cGxlID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUxpZ2h0ID0gZXhwb3J0cy5kZVNlcmlhbGl6ZUFycmF5ID0gZXhwb3J0cy5kZVNlcmlhbGl6ZVdvcmxkID0gZXhwb3J0cy5kZXNlcmlhbGl6ZU1hdHJpeDR4NCA9IGV4cG9ydHMuZGVTZXJpYWxpemVQYXR0ZXJuID0gZXhwb3J0cy5kZVNlcmlhbGl6ZU1hdGVyaWFsID0gZXhwb3J0cy5kZVNlcmlhbGl6ZVNoYXBlcyA9IHZvaWQgMDtcbmNvbnN0IGNhbWVyYV8xID0gcmVxdWlyZShcIi4vY2FtZXJhXCIpO1xuY29uc3QgY29sb3JfMSA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuY29uc3QgbWF0cml4XzEgPSByZXF1aXJlKFwiLi9tYXRyaXhcIik7XG5jb25zdCBwYXR0ZXJuc18xID0gcmVxdWlyZShcIi4vcGF0dGVybnNcIik7XG5jb25zdCBwbGFuZV8xID0gcmVxdWlyZShcIi4vcGxhbmVcIik7XG5jb25zdCBwb2ludExpZ2h0XzEgPSByZXF1aXJlKFwiLi9wb2ludExpZ2h0XCIpO1xuY29uc3Qgc3BoZXJlXzEgPSByZXF1aXJlKFwiLi9zcGhlcmVcIik7XG5jb25zdCB0dXBsZV8xID0gcmVxdWlyZShcIi4vdHVwbGVcIik7XG5jb25zdCB3b3JsZF8xID0gcmVxdWlyZShcIi4vd29ybGRcIik7XG5jb25zdCBtYXRlcmlhbF8xID0gcmVxdWlyZShcIi4vbWF0ZXJpYWxcIik7XG5mdW5jdGlvbiBkZVNlcmlhbGl6ZVNoYXBlcyhvYmosIG1hdGVyaWFsc01hcCkge1xuICAgIHZhciB0eXBlID0gZGVzZXJpYWxpemVTdHJpbmcob2JqLnR5cGUpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIHBsYW5lXzEuUGxhbmUubmFtZTpcbiAgICAgICAgICAgIHZhciBwID0gbmV3IHBsYW5lXzEuUGxhbmUoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSksIG1hdGVyaWFsc01hcC5nZXQoZGVzZXJpYWxpemVOdW1iZXIob2JqLm1hdGVyaWFsKSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIGNhc2Ugc3BoZXJlXzEuU3BoZXJlLm5hbWU6XG4gICAgICAgICAgICB2YXIgcyA9IG5ldyBzcGhlcmVfMS5TcGhlcmUoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSksIG1hdGVyaWFsc01hcC5nZXQoZGVzZXJpYWxpemVOdW1iZXIob2JqLm1hdGVyaWFsKSkpO1xuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigpO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZVNoYXBlcyA9IGRlU2VyaWFsaXplU2hhcGVzO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVNYXRlcmlhbChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBtID0gbmV3IG1hdGVyaWFsXzEuTWF0ZXJpYWwoZGVzZXJpYWxpemVOdW1iZXIob2JqLmlkKSk7XG4gICAgbS5hbWJpZW50ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmFtYmllbnQpO1xuICAgIG0uY29sb3IgPSBkZXNlcmlhbGl6ZUNvbG9yKG9iai5jb2xvcik7XG4gICAgbS5kaWZmdXNlID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLmRpZmZ1c2UpO1xuICAgIG0ucGF0dGVybiA9IGRlU2VyaWFsaXplUGF0dGVybihvYmoucGF0dGVybik7XG4gICAgbS5zaGluaW5lc3MgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmouc2hpbmluZXNzKTtcbiAgICBtLnNwZWN1bGFyID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnNwZWN1bGFyKTtcbiAgICBtLnJlZmxlY3RpdmUgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoucmVmbGVjdGl2ZSk7XG4gICAgbS50cmFuc3BhcmVuY3kgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoudHJhbnNwYXJlbmN5KTtcbiAgICBtLnJlZnJhY3RpdmVJbmRleCA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5yZWZyYWN0aXZlSW5kZXgpO1xuICAgIHJldHVybiBtO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZU1hdGVyaWFsID0gZGVTZXJpYWxpemVNYXRlcmlhbDtcbmZ1bmN0aW9uIGRlU2VyaWFsaXplUGF0dGVybihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHZhciB0eXBlID0gZGVzZXJpYWxpemVTdHJpbmcob2JqLnR5cGUpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIHBhdHRlcm5zXzEuUGVybGluUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHAgPSBuZXcgcGF0dGVybnNfMS5QZXJsaW5QYXR0ZXJuKGRlc2VyaWFsaXplQ29sb3Iob2JqLmEpLCBkZXNlcmlhbGl6ZUNvbG9yKG9iai5iKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnRocmVzaG9sZCksIGRlc2VyaWFsaXplTnVtYmVyKG9iai5zZWVkKSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5DaGVja2VyM0RQYXR0ZXJuNFNwaGVyZS5uYW1lOlxuICAgICAgICAgICAgdmFyIHAyID0gbmV3IHBhdHRlcm5zXzEuQ2hlY2tlcjNEUGF0dGVybjRTcGhlcmUoZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnV2U2NhbGUpKTtcbiAgICAgICAgICAgIHJldHVybiBwMjtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLkNoZWNrZXIzZFBhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwMyA9IG5ldyBwYXR0ZXJuc18xLkNoZWNrZXIzZFBhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDM7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5SaW5nUGF0dGVybi5uYW1lOlxuICAgICAgICAgICAgdmFyIHA0ID0gbmV3IHBhdHRlcm5zXzEuUmluZ1BhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDQ7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5HcmFkaWVudFBhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwNSA9IG5ldyBwYXR0ZXJuc18xLkdyYWRpZW50UGF0dGVybihkZXNlcmlhbGl6ZUNvbG9yKG9iai5hKSwgZGVzZXJpYWxpemVDb2xvcihvYmouYiksIGRlc2VyaWFsaXplTWF0cml4NHg0KG9iai50cmFuc2Zvcm0pKTtcbiAgICAgICAgICAgIHJldHVybiBwNTtcbiAgICAgICAgY2FzZSBwYXR0ZXJuc18xLlN0cmlwZVBhdHRlcm4ubmFtZTpcbiAgICAgICAgICAgIHZhciBwNiA9IG5ldyBwYXR0ZXJuc18xLlN0cmlwZVBhdHRlcm4oZGVzZXJpYWxpemVDb2xvcihvYmouYSksIGRlc2VyaWFsaXplQ29sb3Iob2JqLmIpLCBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmoudHJhbnNmb3JtKSk7XG4gICAgICAgICAgICByZXR1cm4gcDY7XG4gICAgICAgIGNhc2UgcGF0dGVybnNfMS5Db21wb3NpdGVQYXR0ZXJuLm5hbWU6XG4gICAgICAgICAgICB2YXIgcDcgPSBuZXcgcGF0dGVybnNfMS5Db21wb3NpdGVQYXR0ZXJuKGRlU2VyaWFsaXplUGF0dGVybihvYmoucGF0dGVybjEpLCBkZVNlcmlhbGl6ZVBhdHRlcm4ob2JqLnBhdHRlcm4yKSk7XG4gICAgICAgICAgICByZXR1cm4gcDc7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcigpO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZVBhdHRlcm4gPSBkZVNlcmlhbGl6ZVBhdHRlcm47XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZU1hdHJpeDR4NChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHJldHVybiBtYXRyaXhfMS5NYXRyaXg0eDQuSURFTlRJVFlfTUFUUklYLmNsb25lKCk7XG4gICAgdmFyIGFycmF5ID0gZGVTZXJpYWxpemVBcnJheShvYmosICh4KSA9PiBkZVNlcmlhbGl6ZUFycmF5KHgsIGRlc2VyaWFsaXplTnVtYmVyKSk7XG4gICAgdmFyIHcgPSBuZXcgbWF0cml4XzEuTWF0cml4NHg0KGFycmF5KTtcbiAgICByZXR1cm4gdztcbn1cbmV4cG9ydHMuZGVzZXJpYWxpemVNYXRyaXg0eDQgPSBkZXNlcmlhbGl6ZU1hdHJpeDR4NDtcbmZ1bmN0aW9uIGRlU2VyaWFsaXplV29ybGQob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgbWF0ZXJpYWxzID0gZGVTZXJpYWxpemVBcnJheShvYmoubWF0ZXJpYWxzLCBkZVNlcmlhbGl6ZU1hdGVyaWFsKTtcbiAgICB2YXIgbWF0ZXJpYWxzTWFwID0gbmV3IE1hcChtYXRlcmlhbHMubWFwKChtKSA9PiBbbS5pZCwgbV0pKTtcbiAgICB2YXIgdyA9IG5ldyB3b3JsZF8xLldvcmxkKCk7XG4gICAgdy5saWdodCA9IGRlU2VyaWFsaXplTGlnaHQob2JqLmxpZ2h0KTtcbiAgICB3Lm9iamVjdHMgPSBkZVNlcmlhbGl6ZUFycmF5KG9iai5vYmplY3RzLCAocykgPT4geyByZXR1cm4gZGVTZXJpYWxpemVTaGFwZXMocywgbWF0ZXJpYWxzTWFwKTsgfSk7XG4gICAgcmV0dXJuIHc7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplV29ybGQgPSBkZVNlcmlhbGl6ZVdvcmxkO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVBcnJheShvYmosIGNhbGxiYWNrZm4pIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgIUFycmF5LmlzQXJyYXkob2JqKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgcmV0dXJuIG9iai5tYXAoY2FsbGJhY2tmbik7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplQXJyYXkgPSBkZVNlcmlhbGl6ZUFycmF5O1xuZnVuY3Rpb24gZGVTZXJpYWxpemVMaWdodChvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciBwb2ludExpZ2h0ID0gbmV3IHBvaW50TGlnaHRfMS5Qb2ludExpZ2h0KGRlc2VyaWFsaXplVHVwbGUob2JqLnBvc2l0aW9uKSwgZGVzZXJpYWxpemVDb2xvcihvYmouaW50ZW5zaXR5KSk7XG4gICAgcmV0dXJuIHBvaW50TGlnaHQ7XG59XG5leHBvcnRzLmRlU2VyaWFsaXplTGlnaHQgPSBkZVNlcmlhbGl6ZUxpZ2h0O1xuZnVuY3Rpb24gZGVzZXJpYWxpemVUdXBsZShvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHZhciB0ID0gbmV3IHR1cGxlXzEuVHVwbGUoKTtcbiAgICB0LnggPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoueCk7XG4gICAgdC55ID0gZGVzZXJpYWxpemVOdW1iZXIob2JqLnkpO1xuICAgIHQueiA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai56KTtcbiAgICB0LncgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoudyk7XG4gICAgcmV0dXJuIHQ7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplVHVwbGUgPSBkZXNlcmlhbGl6ZVR1cGxlO1xuZnVuY3Rpb24gZGVzZXJpYWxpemVOdW1iZXIob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsIHx8IGlzTmFOKG9iaikpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHJldHVybiBvYmo7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplTnVtYmVyID0gZGVzZXJpYWxpemVOdW1iZXI7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVN0cmluZyhvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwgfHwgISgodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycgfHwgb2JqIGluc3RhbmNlb2YgU3RyaW5nKSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIHJldHVybiBvYmo7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplU3RyaW5nID0gZGVzZXJpYWxpemVTdHJpbmc7XG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUNvbG9yKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgdmFyIGNvbG9yID0gbmV3IGNvbG9yXzEuQ29sb3IoKTtcbiAgICBjb2xvci5yZWQgPSBkZXNlcmlhbGl6ZU51bWJlcihvYmoucmVkKTtcbiAgICBjb2xvci5ncmVlbiA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5ncmVlbik7XG4gICAgY29sb3IuYmx1ZSA9IGRlc2VyaWFsaXplTnVtYmVyKG9iai5ibHVlKTtcbiAgICByZXR1cm4gY29sb3I7XG59XG5leHBvcnRzLmRlc2VyaWFsaXplQ29sb3IgPSBkZXNlcmlhbGl6ZUNvbG9yO1xuZnVuY3Rpb24gZGVTZXJpYWxpemVDYW1lcmEob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB2YXIgYyA9IG5ldyBjYW1lcmFfMS5DYW1lcmEoZGVzZXJpYWxpemVOdW1iZXIob2JqLmhzaXplKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLnZzaXplKSwgZGVzZXJpYWxpemVOdW1iZXIob2JqLmZpZWxkT2ZWaWV3KSwgZGVzZXJpYWxpemVNYXRyaXg0eDQob2JqLnRyYW5zZm9ybSkpO1xuICAgIHJldHVybiBjO1xufVxuZXhwb3J0cy5kZVNlcmlhbGl6ZUNhbWVyYSA9IGRlU2VyaWFsaXplQ2FtZXJhO1xuZnVuY3Rpb24gc2VyaWFsaXplQ2FtZXJhKGNhbWVyYSkge1xuICAgIHJldHVybiBjYW1lcmEudG9PYmplY3QoKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplQ2FtZXJhID0gc2VyaWFsaXplQ2FtZXJhO1xuZnVuY3Rpb24gc2VyaWFsaXplUGF0dGVybihwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4gPT0gbnVsbCA/IG51bGwgOiBwYXR0ZXJuLnRvT2JqZWN0KCk7XG59XG5leHBvcnRzLnNlcmlhbGl6ZVBhdHRlcm4gPSBzZXJpYWxpemVQYXR0ZXJuO1xuZnVuY3Rpb24gc2VyaWFsaXplTWF0ZXJpYWwobWF0ZXJpYWwpIHtcbiAgICB2YXIgbSA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbWF0ZXJpYWwpLCB7IHBhdHRlcm46IHNlcmlhbGl6ZVBhdHRlcm4obWF0ZXJpYWwucGF0dGVybikgfSk7XG4gICAgcmV0dXJuIG07XG59XG5leHBvcnRzLnNlcmlhbGl6ZU1hdGVyaWFsID0gc2VyaWFsaXplTWF0ZXJpYWw7XG5mdW5jdGlvbiBzZXJpYWxpemVTaGFwZShzaGFwZSkge1xuICAgIGlmIChzaGFwZSBpbnN0YW5jZW9mIHBsYW5lXzEuUGxhbmUpIHtcbiAgICAgICAgbGV0IG8gPSB7IGlkOiBzaGFwZS5pZCxcbiAgICAgICAgICAgIHR5cGU6IHNoYXBlLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNoYXBlLnRyYW5zZm9ybS50b0FycmF5KCksXG4gICAgICAgICAgICBtYXRlcmlhbDogc2hhcGUubWF0ZXJpYWwuaWQgfTtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgfVxuICAgIGVsc2UgaWYgKHNoYXBlIGluc3RhbmNlb2Ygc3BoZXJlXzEuU3BoZXJlKSB7XG4gICAgICAgIGxldCBvID0geyBpZDogc2hhcGUuaWQsXG4gICAgICAgICAgICB0eXBlOiBzaGFwZS5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBzaGFwZS50cmFuc2Zvcm0udG9BcnJheSgpLFxuICAgICAgICAgICAgbWF0ZXJpYWw6IHNoYXBlLm1hdGVyaWFsLmlkIH07XG4gICAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn1cbmV4cG9ydHMuc2VyaWFsaXplU2hhcGUgPSBzZXJpYWxpemVTaGFwZTtcbmZ1bmN0aW9uIHNlcmlhbGl6ZUFycmF5KGFyciwgY2FsbGJhY2tmbikge1xuICAgIHJldHVybiBhcnIubWFwKGNhbGxiYWNrZm4pO1xufVxuZXhwb3J0cy5zZXJpYWxpemVBcnJheSA9IHNlcmlhbGl6ZUFycmF5O1xuZnVuY3Rpb24gc2VyaWFsaXplV29ybGQod29ybGQpIHtcbiAgICB2YXIgc2hhcmVkID0gbmV3IE1hcCgpO1xuICAgIHZhciBtYXRlcmlhbHMgPSB3b3JsZC5vYmplY3RzLm1hcCgobykgPT4gc2VyaWFsaXplTWF0ZXJpYWwoby5tYXRlcmlhbCkpO1xuICAgIHZhciBvID0ge1xuICAgICAgICBsaWdodDogd29ybGQubGlnaHQsXG4gICAgICAgIG1hdGVyaWFsczogbWF0ZXJpYWxzLFxuICAgICAgICBvYmplY3RzOiBzZXJpYWxpemVBcnJheSh3b3JsZC5vYmplY3RzLCBzZXJpYWxpemVTaGFwZSlcbiAgICB9O1xuICAgIHJldHVybiBvO1xufVxuZXhwb3J0cy5zZXJpYWxpemVXb3JsZCA9IHNlcmlhbGl6ZVdvcmxkO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2VyaWFsaXppbmcuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1lcmdlU29ydElucGxhY2UgPSB2b2lkIDA7XG4vKipcbiAqIE1lcmdlcyAyIHNvcnRlZCByZWdpb25zIGluIGFuIGFycmF5IGludG8gMSBzb3J0ZWQgcmVnaW9uIChpbi1wbGFjZSB3aXRob3V0IGV4dHJhIG1lbW9yeSwgc3RhYmxlKVxuICogQHBhcmFtIGl0ZW1zIGFycmF5IHRvIG1lcmdlXG4gKiBAcGFyYW0gbGVmdCBsZWZ0IGFycmF5IGJvdW5kYXJ5IGluY2x1c2l2ZVxuICogQHBhcmFtIG1pZGRsZSBib3VuZGFyeSBiZXR3ZWVuIHJlZ2lvbnMgKGxlZnQgcmVnaW9uIGV4Y2x1c2l2ZSwgcmlnaHQgcmVnaW9uIGluY2x1c2l2ZSlcbiAqIEBwYXJhbSByaWdodCByaWdodCBhcnJheSBib3VuZGFyeSBleGNsdXNpdmVcbiAqL1xuZnVuY3Rpb24gbWVyZ2VJbnBsYWNlKGl0ZW1zLCBjb21wYXJlRm4sIGxlZnQsIG1pZGRsZSwgcmlnaHQpIHtcbiAgICBpZiAocmlnaHQgPD0gbWlkZGxlKVxuICAgICAgICByZXR1cm47XG4gICAgZm9yICh2YXIgaSA9IGxlZnQ7IGkgPCBtaWRkbGU7IGkrKykge1xuICAgICAgICB2YXIgbWluUmlnaHQgPSBpdGVtc1ttaWRkbGVdO1xuICAgICAgICBpZiAoY29tcGFyZUZuKG1pblJpZ2h0LCBpdGVtc1tpXSkgPCAwKSB7XG4gICAgICAgICAgICB2YXIgdG1wID0gaXRlbXNbaV07XG4gICAgICAgICAgICBpdGVtc1tpXSA9IG1pblJpZ2h0O1xuICAgICAgICAgICAgdmFyIG5leHRJdGVtO1xuICAgICAgICAgICAgdmFyIG5leHQgPSBtaWRkbGUgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKG5leHQgPCByaWdodCAmJiBjb21wYXJlRm4oKG5leHRJdGVtID0gaXRlbXNbbmV4dF0pLCB0bXApIDwgMCkge1xuICAgICAgICAgICAgICAgIGl0ZW1zW25leHQgLSAxXSA9IG5leHRJdGVtO1xuICAgICAgICAgICAgICAgIG5leHQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW1zW25leHQgLSAxXSA9IHRtcDtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogSW4tcGxhY2UgYm90dG9tIHVwIG1lcmdlIHNvcnRcbiAqL1xuZnVuY3Rpb24gbWVyZ2VTb3J0SW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCBmcm9tLCB0bykge1xuICAgIGZyb20gIT09IG51bGwgJiYgZnJvbSAhPT0gdm9pZCAwID8gZnJvbSA6IChmcm9tID0gMCk7XG4gICAgdG8gIT09IG51bGwgJiYgdG8gIT09IHZvaWQgMCA/IHRvIDogKHRvID0gaXRlbXMubGVuZ3RoKTtcbiAgICB2YXIgbWF4U3RlcCA9ICh0byAtIGZyb20pICogMjtcbiAgICBmb3IgKHZhciBzdGVwID0gMjsgc3RlcCA8IG1heFN0ZXA7IHN0ZXAgKj0gMikge1xuICAgICAgICB2YXIgb2xkU3RlcCA9IHN0ZXAgLyAyO1xuICAgICAgICBmb3IgKHZhciB4ID0gZnJvbTsgeCA8IHRvOyB4ICs9IHN0ZXApIHtcbiAgICAgICAgICAgIG1lcmdlSW5wbGFjZShpdGVtcywgY29tcGFyZUZuLCB4LCB4ICsgb2xkU3RlcCwgTWF0aC5taW4oeCArIHN0ZXAsIHRvKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLm1lcmdlU29ydElucGxhY2UgPSBtZXJnZVNvcnRJbnBsYWNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c29ydC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU3BoZXJlID0gdm9pZCAwO1xuY29uc3QgdHVwbGVfMSA9IHJlcXVpcmUoXCIuL3R1cGxlXCIpO1xuY29uc3QgaW50ZXJzZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XG5jb25zdCBtYXRyaXhfMSA9IHJlcXVpcmUoXCIuL21hdHJpeFwiKTtcbmNvbnN0IG1hdGVyaWFsXzEgPSByZXF1aXJlKFwiLi9tYXRlcmlhbFwiKTtcbmNsYXNzIFNwaGVyZSB7XG4gICAgY29uc3RydWN0b3IoaWQsIHRyYW5zZm9ybSwgbWF0ZXJpYWwpIHtcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybSAhPT0gbnVsbCAmJiB0cmFuc2Zvcm0gIT09IHZvaWQgMCA/IHRyYW5zZm9ybSA6IG1hdHJpeF8xLk1hdHJpeDR4NC5JREVOVElUWV9NQVRSSVguY2xvbmUoKTtcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsICE9PSBudWxsICYmIG1hdGVyaWFsICE9PSB2b2lkIDAgPyBtYXRlcmlhbCA6IG5ldyBtYXRlcmlhbF8xLk1hdGVyaWFsKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWF0aW9uIG1hdHJpeC4gQ2FsbCBzZXR0ZXIgYWZ0ZXIgY2hhbmdlIGZvciB1cGRhdGluZyBpbnZlcnNlLlxuICAgICAqL1xuICAgIGdldCB0cmFuc2Zvcm0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm07XG4gICAgfVxuICAgIHNldCB0cmFuc2Zvcm0odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNmb3JtID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaW52ZXJzZVRyYW5zZm9ybSA9IHZhbHVlLmludmVyc2UoKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgcmF5ID0gcmF5LnRyYW5zZm9ybSh0aGlzLmludmVyc2VUcmFuc2Zvcm0pO1xuICAgICAgICB2YXIgc3BoZXJlMnJheSA9IHJheS5vcmlnaW4uc3Vic3RyYWN0KHR1cGxlXzEuVHVwbGUucG9pbnQoMCwgMCwgMCkpO1xuICAgICAgICB2YXIgYSA9IHJheS5kaXJlY3Rpb24uZG90KHJheS5kaXJlY3Rpb24pO1xuICAgICAgICB2YXIgYiA9IDIgKiByYXkuZGlyZWN0aW9uLmRvdChzcGhlcmUycmF5KTtcbiAgICAgICAgdmFyIGMgPSBzcGhlcmUycmF5LmRvdChzcGhlcmUycmF5KSAtIDE7XG4gICAgICAgIHZhciBkaXNjcmltaW5hbnQgPSBiICogYiAtIDQgKiBhICogYztcbiAgICAgICAgaWYgKGRpc2NyaW1pbmFudCA8IDApXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9ucztcbiAgICAgICAgdmFyIHNxcnREaXNjcmltaW5hbnQgPSBNYXRoLnNxcnQoZGlzY3JpbWluYW50KTtcbiAgICAgICAgdmFyIGkxID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICAgICAgaTEudCA9ICgtYiAtIHNxcnREaXNjcmltaW5hbnQpIC8gKDIgKiBhKTtcbiAgICAgICAgaTEub2JqZWN0ID0gdGhpcztcbiAgICAgICAgdmFyIGkyID0gaW50ZXJzZWN0aW9ucy5hZGQoKTtcbiAgICAgICAgaTIudCA9ICgtYiArIHNxcnREaXNjcmltaW5hbnQpIC8gKDIgKiBhKTtcbiAgICAgICAgaTIub2JqZWN0ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIG5vcm1hbEF0KHApIHtcbiAgICAgICAgdmFyIG9iamVjdE5vcm1hbCA9IHRoaXMuaW52ZXJzZVRyYW5zZm9ybS5tdWx0aXBseShwKTtcbiAgICAgICAgb2JqZWN0Tm9ybWFsLncgPSAwO1xuICAgICAgICB2YXIgd29ybGROb3JtYWwgPSB0aGlzLmludmVyc2VUcmFuc2Zvcm0udHJhbnNwb3NlKFNwaGVyZS50ZW1wTWF0cml4MSkubXVsdGlwbHkob2JqZWN0Tm9ybWFsKTtcbiAgICAgICAgd29ybGROb3JtYWwudyA9IDA7XG4gICAgICAgIHJldHVybiB3b3JsZE5vcm1hbC5ub3JtYWxpemUoKTtcbiAgICB9XG59XG5leHBvcnRzLlNwaGVyZSA9IFNwaGVyZTtcblNwaGVyZS50ZW1wTWF0cml4MSA9IG5ldyBtYXRyaXhfMS5NYXRyaXg0eDQoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNwaGVyZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVHVwbGUgPSB2b2lkIDA7XG5jb25zdCBjb25zdGFudHNfMSA9IHJlcXVpcmUoXCIuL2NvbnN0YW50c1wiKTtcbmNsYXNzIFR1cGxlIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB6LCB3KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgIHRoaXMudyA9IHc7XG4gICAgfVxuICAgIGlzUG9pbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMTtcbiAgICB9XG4gICAgaXNWZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLncgPT0gMDtcbiAgICB9XG4gICAgYWRkKHR1cGxlKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUodGhpcy54ICsgdHVwbGUueCwgdGhpcy55ICsgdHVwbGUueSwgdGhpcy56ICsgdHVwbGUueiwgdGhpcy53ICsgdHVwbGUudyk7XG4gICAgfVxuICAgIG11bHRpcGx5KHNjYWxhcikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhcik7XG4gICAgfVxuICAgIGRpdmlkZShzY2FsYXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIpO1xuICAgIH1cbiAgICBzdWJzdHJhY3QodHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLnggLSB0dXBsZS54LCB0aGlzLnkgLSB0dXBsZS55LCB0aGlzLnogLSB0dXBsZS56LCB0aGlzLncgLSB0dXBsZS53KTtcbiAgICB9XG4gICAgbmVnYXRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncpO1xuICAgIH1cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLm1hZ25pdHVkZSgpKTtcbiAgICB9XG4gICAgbWFnbml0dWRlKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiArIHRoaXMudyAqIHRoaXMudyk7XG4gICAgfVxuICAgIGRvdCh0dXBsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy54ICogdHVwbGUueCArIHRoaXMueSAqIHR1cGxlLnkgKyB0aGlzLnogKiB0dXBsZS56ICsgdGhpcy53ICogdHVwbGUudztcbiAgICB9XG4gICAgY3Jvc3ModHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIFR1cGxlLnZlY3Rvcih0aGlzLnkgKiB0dXBsZS56IC0gdGhpcy56ICogdHVwbGUueSwgdGhpcy56ICogdHVwbGUueCAtIHRoaXMueCAqIHR1cGxlLnosIHRoaXMueCAqIHR1cGxlLnkgLSB0aGlzLnkgKiB0dXBsZS54KTtcbiAgICB9XG4gICAgcmVmbGVjdChub3JtYWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3Vic3RyYWN0KG5vcm1hbC5tdWx0aXBseSgyICogdGhpcy5kb3Qobm9ybWFsKSkpO1xuICAgIH1cbiAgICBlcXVhbHModHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMueCAtIHR1cGxlLngpIDwgY29uc3RhbnRzXzEuRVBTSUxPTlxuICAgICAgICAgICAgJiYgTWF0aC5hYnModGhpcy55IC0gdHVwbGUueSkgPCBjb25zdGFudHNfMS5FUFNJTE9OXG4gICAgICAgICAgICAmJiBNYXRoLmFicyh0aGlzLnogLSB0dXBsZS56KSA8IGNvbnN0YW50c18xLkVQU0lMT047XG4gICAgfVxuICAgIHN0YXRpYyBwb2ludCh4LCB5LCB6KSB7XG4gICAgICAgIHJldHVybiBuZXcgVHVwbGUoeCwgeSwgeiwgMSk7XG4gICAgfVxuICAgIHN0YXRpYyB2ZWN0b3IoeCwgeSwgeikge1xuICAgICAgICByZXR1cm4gbmV3IFR1cGxlKHgsIHksIHosIDApO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUdXBsZSh0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLncpO1xuICAgIH1cbn1cbmV4cG9ydHMuVHVwbGUgPSBUdXBsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR1cGxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Xb3JsZCA9IHZvaWQgMDtcbmNvbnN0IGNvbG9yXzEgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcbmNvbnN0IGNvbXB1dGF0aW9uc18xID0gcmVxdWlyZShcIi4vY29tcHV0YXRpb25zXCIpO1xuY29uc3QgaW50ZXJzZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3Rpb25cIik7XG5jb25zdCByYXlfMSA9IHJlcXVpcmUoXCIuL3JheVwiKTtcbmNsYXNzIFdvcmxkIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICB9XG4gICAgcmVmcmFjdGVkQ29sb3IoY29tcHMsIHJlbWFpbmluZykge1xuICAgICAgICBpZiAocmVtYWluaW5nID09IDAgfHwgY29tcHMub2JqZWN0Lm1hdGVyaWFsLnRyYW5zcGFyZW5jeSA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yXzEuQ29sb3IuQkxBQ0suY2xvbmUoKTtcbiAgICAgICAgdmFyIG5SYXRpbyA9IGNvbXBzLm4xIC8gY29tcHMubjI7XG4gICAgICAgIHZhciBjb3NJID0gY29tcHMuZXlldi5kb3QoY29tcHMubm9ybWFsdik7XG4gICAgICAgIHZhciBzaW4ydCA9IG5SYXRpbyAqIG5SYXRpbyAqICgxIC0gY29zSSAqIGNvc0kpO1xuICAgICAgICBpZiAoc2luMnQgPiAxKVxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yXzEuQ29sb3IuQkxBQ0suY2xvbmUoKTtcbiAgICAgICAgdmFyIGNvc1QgPSBNYXRoLnNxcnQoMSAtIHNpbjJ0KTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGNvbXBzLm5vcm1hbHYubXVsdGlwbHkoblJhdGlvICogY29zSSAtIGNvc1QpLnN1YnN0cmFjdChjb21wcy5leWV2Lm11bHRpcGx5KG5SYXRpbykpO1xuICAgICAgICB2YXIgcmVmcmFjdFJheSA9IG5ldyByYXlfMS5SYXkoY29tcHMudW5kZXJQb2ludCwgZGlyZWN0aW9uKTtcbiAgICAgICAgdmFyIGNvbG9yID0gdGhpcy5jb2xvckF0KHJlZnJhY3RSYXksIHJlbWFpbmluZyAtIDEpLm11bHRpcGx5KGNvbXBzLm9iamVjdC5tYXRlcmlhbC50cmFuc3BhcmVuY3kpO1xuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuICAgIHNoYWRlSGl0KGNvbXBzLCByZW1haW5pbmcgPSAwKSB7XG4gICAgICAgIHZhciBzdXJmYWNlID0gY29tcHMub2JqZWN0Lm1hdGVyaWFsLmxpZ2h0aW5nKHRoaXMubGlnaHQsIGNvbXBzLm9iamVjdCwgY29tcHMucG9pbnQsIGNvbXBzLmV5ZXYsIGNvbXBzLm5vcm1hbHYsIHRoaXMuaXNTaGFkb3dlZChjb21wcy5vdmVyUG9pbnQpKTtcbiAgICAgICAgdmFyIHJlZmxlY3RlZCA9IHRoaXMucmVmbGVjdGVkQ29sb3IoY29tcHMsIHJlbWFpbmluZyk7XG4gICAgICAgIHZhciByZWZyYWN0ZWQgPSB0aGlzLnJlZnJhY3RlZENvbG9yKGNvbXBzLCByZW1haW5pbmcpO1xuICAgICAgICB2YXIgbWF0ZXJpYWwgPSBjb21wcy5vYmplY3QubWF0ZXJpYWw7XG4gICAgICAgIGlmIChtYXRlcmlhbC5yZWZsZWN0aXZlID4gMCAmJiBtYXRlcmlhbC50cmFuc3BhcmVuY3kgPiAwKSB7XG4gICAgICAgICAgICB2YXIgcmVmbGVjdGFuY2UgPSBjb21wcy5zY2hsaWNrKCk7XG4gICAgICAgICAgICByZXR1cm4gc3VyZmFjZS5hZGQocmVmbGVjdGVkLm11bHRpcGx5KHJlZmxlY3RhbmNlKSkuYWRkKHJlZnJhY3RlZC5tdWx0aXBseSgxIC0gcmVmbGVjdGFuY2UpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VyZmFjZS5hZGQocmVmbGVjdGVkKS5hZGQocmVmcmFjdGVkKTtcbiAgICB9XG4gICAgY29sb3JBdChyYXksIHJlbWFpbmluZyA9IDQpIHtcbiAgICAgICAgV29ybGQudGVtcEludGVyc2VjdGlvbnMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5pbnRlcnNlY3QocmF5LCBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLnNvcnQoKTtcbiAgICAgICAgdmFyIGkgPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5maXJzdEhpdCgpO1xuICAgICAgICBpZiAoaSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yXzEuQ29sb3IuQkxBQ0suY2xvbmUoKTtcbiAgICAgICAgdmFyIGNvbXAgPSBjb21wdXRhdGlvbnNfMS5Db21wdXRhdGlvbnMucHJlcGFyZShpLCByYXksIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGVIaXQoY29tcCwgcmVtYWluaW5nKTtcbiAgICB9XG4gICAgaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKCkpIHtcbiAgICAgICAgZm9yICh2YXIgbyBvZiB0aGlzLm9iamVjdHMpIHtcbiAgICAgICAgICAgIG8uaW50ZXJzZWN0KHJheSwgaW50ZXJzZWN0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbnM7XG4gICAgfVxuICAgIGlzU2hhZG93ZWQocG9pbnQpIHtcbiAgICAgICAgdmFyIHYgPSB0aGlzLmxpZ2h0LnBvc2l0aW9uLnN1YnN0cmFjdChwb2ludCk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHYubWFnbml0dWRlKCk7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB2Lm5vcm1hbGl6ZSgpO1xuICAgICAgICB2YXIgciA9IG5ldyByYXlfMS5SYXkocG9pbnQsIGRpcmVjdGlvbik7XG4gICAgICAgIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0KHIsIFdvcmxkLnRlbXBJbnRlcnNlY3Rpb25zKTtcbiAgICAgICAgdmFyIGggPSBXb3JsZC50ZW1wSW50ZXJzZWN0aW9ucy5oaXQoKTtcbiAgICAgICAgcmV0dXJuIChoICE9IG51bGwgJiYgaC50IDwgZGlzdGFuY2UpO1xuICAgIH1cbiAgICByZWZsZWN0ZWRDb2xvcihjb21wcywgcmVtYWluaW5nKSB7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPT0gMCB8fCBjb21wcy5vYmplY3QubWF0ZXJpYWwucmVmbGVjdGl2ZSA9PSAwKVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjb2xvcl8xLkNvbG9yKDAsIDAsIDApO1xuICAgICAgICB2YXIgcmVmbGVjdFJheSA9IG5ldyByYXlfMS5SYXkoY29tcHMub3ZlclBvaW50LCBjb21wcy5yZWZsZWN0dik7XG4gICAgICAgIHZhciBjb2xvciA9IHRoaXMuY29sb3JBdChyZWZsZWN0UmF5LCByZW1haW5pbmcgLSAxKTtcbiAgICAgICAgcmV0dXJuIGNvbG9yLm11bHRpcGx5KGNvbXBzLm9iamVjdC5tYXRlcmlhbC5yZWZsZWN0aXZlKTtcbiAgICB9XG59XG5leHBvcnRzLldvcmxkID0gV29ybGQ7XG5Xb3JsZC50ZW1wSW50ZXJzZWN0aW9ucyA9IG5ldyBpbnRlcnNlY3Rpb25fMS5JbnRlcnNlY3Rpb25zKDEwMCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD13b3JsZC5qcy5tYXAiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcmVuZGVyLXdvcmtlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==