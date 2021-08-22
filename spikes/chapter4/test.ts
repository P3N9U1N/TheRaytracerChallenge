import { Tuple } from "raytracer/tuple";
import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import * as fs from "fs";
import { Matrix,Matrix4x4 } from "raytracer/matrix";




var c = new Canvas(900,550);

var color= new Color(1,1,0);


var clock2screen= Matrix4x4.translation(c.width/2,c.height/2,0).multiply(Matrix4x4.scaling(250,-250,250));
for (var i=0;i<12;i++)
{
    var pos=Matrix4x4.rotationZ(2*Math.PI/12*i).multiply(Tuple.point(0,1,0));
    var screenCoordinates=clock2screen.multiply(pos);
    c.writePixel(screenCoordinates.x,screenCoordinates.y,color);   
    console.log(pos.x+" "+pos.y)
}
fs.writeFileSync("picture.ppm" ,c.toPpm());