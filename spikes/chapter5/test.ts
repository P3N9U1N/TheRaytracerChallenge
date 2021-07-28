import { Tuple } from "../../raytracer/tuple";
import { Canvas } from "../../raytracer/canvas";
import { Color } from "../../raytracer/color";
import { Sphere } from "../../raytracer/sphere";
import * as fs from "fs";
import { Matrix,Matrix4x4 } from "../../raytracer/matrix";
import { Ray } from "../../raytracer/ray";




var c = new Canvas(100,100);
var color= new Color(1,1,0);

var rayOrigin = Tuple.point(0,0,-5);
var wallz=10;
var wallSize=7;
var pixelSize=wallSize/ c.height;
var half=wallSize/2;
var shape=new Sphere(1)


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
            c.writePixel(x,y,color);
        }
    }
}
fs.writeFileSync("picture.ppm" ,c.toPpm());