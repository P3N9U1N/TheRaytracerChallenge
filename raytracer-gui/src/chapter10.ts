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
import { GradientPattern, RingPattern, StripePattern, Checker3dPattern, Checker3DPattern4Sphere, PerlinPattern, Pattern } from "raytracer/patterns";
import { EPSILON } from "raytracer/constants";
import { RenderJob, WebWorkerQueue } from "./renderjob";
import * as serialize from "raytracer/serializing"


var world= new World();
var floor = new Plane(0);
floor.material= new Material(0);
floor.material.pattern=new GradientPattern(new Color(0.2,0.4,0.5), new Color(0.1,0.9,0.7));
floor.transform=Matrix4x4.translation(0,0,15).multiply(Matrix4x4.rotationY(1));

var middle=new Sphere(3);
middle.transform=  Matrix4x4.translation(0,1,0).multiply(Matrix4x4.rotationY(0.1).multiply(Matrix4x4.rotationZ(0.2)));
middle.material= new Material(1);
middle.material.color= new Color(0.1,1,0.5);
middle.material.diffuse=0.7;
middle.material.specular=0.3;
middle.material.pattern=new StripePattern(new Color(0.1,0.1,0.6), new Color(0.1,0.7,0.2),Matrix4x4.translation(1,0,0).multiply(Matrix4x4.scaling(0.2,0.2,0.2)));

var right=new Sphere(4);
right.transform=Matrix4x4.translation(2,0.5,-0.5).multiply(Matrix4x4.scaling(0.5,0.5,0.5));
right.material= new Material(2);
right.material.color= new Color(0.1,0.7,0.2);
right.material.diffuse=0.7;
right.material.specular=0.3;
right.material.pattern= new PerlinPattern(new Color(0.1,0.7,0.2),new Color(1,1,1),0.15);


var left=new Sphere(5);
left.transform=Matrix4x4.translation(-5,2,9).multiply(Matrix4x4.scaling(2,2,2));
left.material= new Material(4);
left.material.color= new Color(1,0.8,0.1);
left.material.diffuse=0.7;
left.material.specular=0.3;
left.material.pattern= new Checker3DPattern4Sphere( new Color(0.9,0.9,0.9),new Color(0.1,0.1,0.1), Matrix4x4.IDENTITY_MATRIX.clone(),20);


var wall=new Plane(6);
wall.transform=Matrix4x4.translation(0,0,15).multiply(Matrix4x4.rotationY(1).multiply(Matrix4x4.rotationX(Math.PI/2)));
wall.material= new Material(5);
wall.material.color= new Color(1,1,1);
wall.material.diffuse=0.7;
wall.material.specular=0.3;
wall.material.pattern= new RingPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.scaling(1,1,1));

var wall2=new Plane(7);
wall2.transform=Matrix4x4.translation(0,0,15).multiply(Matrix4x4.rotationY(1-Math.PI/2).multiply(Matrix4x4.rotationX(Math.PI/2)));
wall2.material= new Material(6);
wall2.material.color= new Color(0,0,0.8);
wall2.material.diffuse=0.7;
wall2.material.specular=0.3;
wall2.material.pattern= new Checker3dPattern(new Color(0,0.1,0.7), new Color(1,1,1),Matrix4x4.translation(0,EPSILON,0));

world.objects= [left,right,middle,floor,wall,wall2];
world.light= new PointLight(Tuple.point(-10,10,-10),Color.WHITE.clone());

var camera= new Camera(1024,1024,Math.PI/3,
    Matrix4x4.viewTransform(Tuple.point(0,1.5,-5),Tuple.point(0,1,0),Tuple.vector(0,1,0))
    );



console.time("render")

var r = new RenderJob(4,
    <HTMLCanvasElement>document.getElementById("raytracerCanvas"),
    "chapter10renderWorker-bundle.js"
    );

r.start(world,camera);

r.onRenderingFinished=
    ()=>
    {
        console.timeEnd("render")
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






