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
import { GradientPattern, RingPattern, StripePattern, Checker3dPattern, Checker3DPattern4Sphere, PerlinPattern, Pattern, CompositePattern } from "raytracer/patterns";
import { EPSILON } from "raytracer/constants";
import { RenderJob, WebWorkerQueue } from "./renderjob";
import * as serialize from "raytracer/serializing"


var world= new World();
var floor = new Plane(0);
floor.material= new Material(0);
floor.material.pattern= new CompositePattern(
    new GradientPattern(new Color(0.2,0.4,0.5), new Color(0.1,0.9,0.7)),
    new GradientPattern(new Color(0.2,0.4,0.5), new Color(0.1,0.9,0.7),Matrix4x4.rotationY(Math.PI/2)),
);
floor.transform=Matrix4x4.translation(0,0,0);
floor.material.reflective=0.2;




var sphere1=new Sphere(4);
sphere1.transform=Matrix4x4.translation(2,1.5,-7.5).multiply(Matrix4x4.scaling(1.5,1.5,1.5));
sphere1.material= new Material(2);
sphere1.material.color= new Color(0.1,0.7,0.2);
sphere1.material.diffuse=0.7;
sphere1.material.specular=0.3;
sphere1.material.pattern= new PerlinPattern(new Color(0.1,0.7,0.2),new Color(1,1,1),0.15);
sphere1.material.transparency=0;
sphere1.material.reflective=0.5;


var sphere2=new Sphere(5);
sphere2.transform=Matrix4x4.translation(-5,4,-9).multiply(Matrix4x4.scaling(4,4,4));
sphere2.material= new Material(4);
sphere2.material.color= new Color(1,0.8,0.1);
sphere2.material.reflective=0.5;

var sphere3=new Sphere(3);
sphere3.transform=  Matrix4x4.translation(4,3,5).multiply(Matrix4x4.scaling(3,3,3));
sphere3.material= new Material(1);
sphere3.material.color= new Color(0,0,0.2);
sphere3.material.specular=0.9;
sphere3.material.diffuse=0.4;
sphere3.material.transparency=0.9;
sphere3.material.ambient=0;
sphere3.material.shininess=300;
//sphere3.material.refractiveIndex=0;
sphere3.material.reflective= 0.9;


var wall=new Plane(6);
wall.transform=Matrix4x4.translation(0,0,15).multiply(Matrix4x4.rotationX(Math.PI/2));
wall.material= new Material(5);
wall.material.color= new Color(1,1,1);
wall.material.diffuse=0.7;
wall.material.specular=0.3;
wall.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));


var wall2=new Plane(7);
wall2.transform=Matrix4x4.translation(0,0,-15).multiply(Matrix4x4.rotationX(Math.PI/2));
wall2.material= new Material(6);
wall2.material.color= new Color(0,0,0.8);
wall2.material.diffuse=0.7;
wall2.material.specular=0.3;
wall2.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));


var wall3=new Plane(6);
wall3.transform=Matrix4x4.translation(15,0,0).multiply(Matrix4x4.rotationZ(Math.PI/2));
wall3.material= new Material(8);
wall3.material.color= new Color(1,1,1);
wall3.material.diffuse=0.7;
wall3.material.specular=0.3;
wall3.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));


var wall4=new Plane(7);
wall4.transform=Matrix4x4.translation(-15,0,0).multiply(Matrix4x4.rotationZ(Math.PI/2));
wall4.material= new Material(9);
wall4.material.color= new Color(0,0,0.8);
wall4.material.diffuse=0.7;
wall4.material.specular=0.3;
wall4.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));


var ceiling=new Plane(7);
ceiling.transform=Matrix4x4.translation(0,15,0);
ceiling.material= new Material(10);
ceiling.material.color= new Color(0,0,0.8);
ceiling.material.diffuse=0.7;
ceiling.material.specular=0.3;
ceiling.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));



world.objects= [sphere2,sphere1,sphere3,floor,wall,wall2,wall3,wall4,ceiling];
world.light= new PointLight(Tuple.point(0,10,0),Color.WHITE.clone());

var camera= new Camera(1024,1024,Math.PI/3, 
    Matrix4x4.viewTransform(Tuple.point(10,5,7),Tuple.point(0,1,0),Tuple.vector(0,1,0))
    );

var raytracerCanvas = <HTMLCanvasElement>document.getElementById("raytracerCanvas")
raytracerCanvas.width=camera.hsize;
raytracerCanvas.height=camera.vsize;
console.time("render")

var r = new RenderJob(navigator.hardwareConcurrency,
    raytracerCanvas,
    "chapter11renderWorker-bundle.js"
    );

r.start(world,camera);

r.onRenderingFinished=
    ()=>
    {
        console.timeEnd("render")
    };

/*

var renderData = camera.renderPartial(world);
var imageData = new ImageData(renderData, camera.hsize, camera.vsize);
var ctx = raytracerCanvas.getContext("2d");
ctx.putImageData(imageData, 0, 0);
console.timeEnd("render")
*/





