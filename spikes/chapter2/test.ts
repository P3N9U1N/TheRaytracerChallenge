import { Tuple } from "raytracer/tuple";
import { Projectile } from "./projectile";
import { Environment } from "./environment";
import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import * as fs from "fs";

function tick(env:Environment,proj:Projectile ):Projectile
{
 var position= proj.position.add(proj.velocity);
 var velocity= proj.velocity.add(env.wind).add(env.gravity);
 return new Projectile(position,velocity);
}


var start = Tuple.point(0,1,0);
var velocity= Tuple.vector(1,1.8,0).normalize().multiply(11.25);
var p= new Projectile(start,velocity);
var gravity=Tuple.vector(0,-0.1,0);
var wind=Tuple.vector(-0.01,0,0);
var e= new Environment(gravity,wind);
var c = new Canvas(900,550);

var color= new Color(1,1,0);
for (var i=0;i<2000;i++)
{
    c.writePixel(p.position.x,c.height-p.position.y,color);
    p=tick(e,p);
    console.dir( p.position );
}
fs.writeFileSync("picture.ppm" ,c.toPpm());