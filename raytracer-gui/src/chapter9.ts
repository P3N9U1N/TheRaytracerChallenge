import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import { Intersection, Intersections } from "raytracer/intersection";
import { Material } from "raytracer/material";
import { Matrix4x4 } from "raytracer/matrix";
import { PointLight } from "raytracer/pointLight";
import { World } from "raytracer/world";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { Camera } from "raytracer/camera";
import { Plane } from "raytracer/plane";


var world= new World();
var floor = new Plane(0);
floor.material= new Material();
floor.material.color=new Color(0.9,1.0,0.9);
floor.material.specular=0.5;


var middle=new Sphere(3);
middle.transform=Matrix4x4.translation(-0.5,1,0.5)
middle.material= new Material();
middle.material.color= new Color(0.1,1,0.5);
middle.material.diffuse=0.7;
middle.material.specular=0.3;

var right=new Sphere(4);
right.transform=Matrix4x4.translation(1.5,0.5,-0.5).multiply(Matrix4x4.scaling(0.5,0.5,0.5));
right.material= new Material();
right.material.color= new Color(0.5,1,0.1);
right.material.diffuse=0.7;
right.material.specular=0.3;

var left=new Sphere(5);
left.transform=Matrix4x4.translation(-1.5,0.33,-0.75).multiply(Matrix4x4.scaling(0.33,0.33,0.33));
left.material= new Material();
left.material.color= new Color(1,0.8,0.1);
left.material.diffuse=0.7;
left.material.specular=0.3;


world.objects= [left,right,middle,floor];
world.light= new PointLight(Tuple.point(-10,10,-10),Color.WHITE.clone());

var camera= new Camera(1024,1024,Math.PI/3,
    Matrix4x4.viewTransform(Tuple.point(0,1.5,-5),Tuple.point(0,1,0),Tuple.vector(0,1,0))
    );


var raytracerCanvas = <HTMLCanvasElement>document.getElementById("raytracerCanvas");
raytracerCanvas.width=camera.hsize;
raytracerCanvas.height=camera.vsize;
var renderData = camera.render(world).toUint8ClampedArray();
var imageData = new ImageData(renderData, camera.hsize, camera.vsize);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);








