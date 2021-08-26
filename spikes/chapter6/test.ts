import { Tuple } from "raytracer/tuple";
import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import { Sphere } from "raytracer/sphere";
import * as fs from "fs";
import { Ray } from "raytracer/ray";
import { Material } from "raytracer/material";
import { PointLight } from "raytracer/pointLight";




var c = new Canvas(640,640);


var rayOrigin = Tuple.point(0,0,-5);
var wallz=10;
var wallSize=7;
var pixelSize=wallSize/ c.height;
var half=wallSize/2;
var shape=new Sphere(1)
shape.material= new Material();
shape.material.color=new Color(1,0.2,1);


var light = new PointLight(Tuple.point(-10,10,-10),Color.WHITE.clone());

for (var y=0;y<c.height;y++)
{
    var worldY=half-pixelSize*y;
    for (var x=0;x<c.width;x++)
    {
      
        var worldX=-half+pixelSize*x;
        var position = Tuple.point(worldX,worldY,wallz);
        var r= new Ray(rayOrigin, position.substract(rayOrigin).normalize() );
        var xs=shape.intersect(r);


        if (xs.length>0)
        {
            var hit= xs.hit();
            var point=r.position(hit.t);
            var normal=shape.normalAt(point)
            var color=shape.material.lighting(light,point, r.direction.negate() ,normal);
            c.writePixel(x,y,color);
        }
    }
}






fs.writeFileSync("picture.ppm" ,c.toPpm());