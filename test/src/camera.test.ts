import {Camera} from "raytracer/camera"
import { Matrix4x4 } from "raytracer/matrix";
import { Tuple } from "raytracer/tuple";
test("The pixel size for a horizontal canvas",
()=>
{
    var c = new Camera(200,123,Math.PI/2);
    expect(c.pixelSize).toBeCloseTo(0.01);
}
);

test("The pixel size for a vertical canvas",
()=>
{
    var c = new Camera(125,200,Math.PI/2);
    expect(c.pixelSize).toBeCloseTo(0.01); 
}
);

test("Constructing a ray through the center of the canvas",
()=>
{
    var c = new Camera(201,101,Math.PI/2);
    var r = c.rayForPixel(100,50);

    expect(r.origin.equals(Tuple.point(0,0,0))).toBeTruthy(); 
    expect(r.direction.equals(Tuple.vector(0,0,-1))).toBeTruthy(); 
}
);

test("Constructing a ray through a corner of the canvas",
()=>
{
    var c = new Camera(201,101,Math.PI/2);
    var r = c.rayForPixel(0,0);

    expect(r.origin.equals(Tuple.point(0,0,0))).toBeTruthy(); 
    expect(r.direction.equals(Tuple.vector(0.66519,0.33259,-0.66851))).toBeTruthy(); 
}
);
test("Constructing a ray when the camera is transformed",
()=>
{
    var c = new Camera(201,101,Math.PI/2,Matrix4x4.rotationY(Math.PI/4).multiply(Matrix4x4.translation(0,-2,5)));  
    var r = c.rayForPixel(100,50);

    expect(r.origin.equals(Tuple.point(0,2,-5))).toBeTruthy(); 
    expect(r.direction.equals(Tuple.vector( Math.sqrt(2)/2 ,0, -Math.sqrt(2)/2))).toBeTruthy(); 
}
);