global.ImageData = require('@canvas/image-data');//Mock browser ImageData
import { Canvas } from "../../raytracer/canvas"
import { Color } from "../../raytracer/color";


test("constructor", () => {
    var c = new Canvas(10, 20);
    expect(c.height).toBe(20);
    expect(c.width).toBe(10);
    var black = new Color(0, 0, 0);
    for (var x = 0; x < c.width; x++) {
        for (var y = 0; y < c.height; y++) {
            expect(c.readPixel(x, y).equals(black)).toBeTruthy();
        }
    }
});

test("Write pixels to canvas", () => {
    var c = new Canvas(10, 20);
    var red = new Color(1, 0, 0);
    c.writePixel(2, 3, red);
    expect(c.readPixel(2, 3).equals(red)).toBeTruthy();
});
test("PPM header", () => {
    var c = new Canvas(5, 3);
    var s = 
`P3
5 3
255`;
    expect(c.toPpm().startsWith(s)).toBeTruthy();
});

test("Constructing the PPM pixel data", () => {
    var c = new Canvas(5, 3);
    var c1= new Color(1.5,0,0);
    var c2= new Color(0,0.5,0);
    var c3= new Color(-0.5,0.0,1);
    c.writePixel(0,0,c1);
    c.writePixel(2,1,c2);
    c.writePixel(4,2,c3);
    var ppm=c.toPpm().split("\n").slice(3,6).join("\n");
    var solution= `255 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 128 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 255`;
  expect(ppm).toBe(solution);
});