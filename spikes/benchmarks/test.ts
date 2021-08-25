import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import { Intersection, Intersections } from "raytracer/intersection";
import { Material } from "raytracer/material";
import { PointLight } from "raytracer/pointLight";
import { Ray } from "raytracer/ray";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";

function benchmark(f:()=>any)
{
    console.time("benchmark "+f.name);
    f();
    console.timeEnd("benchmark "+f.name);
}

function benchmarkIntersections()
{
    var l = new Intersections();
    for (var i=0;i<640*480;i++)
    {
       for (var i2=0;i2<50;i2++)
       {
           var x=l.add();
           x.object=null;
           x.t=1;
       }
       l.clear();

    }
}
function benchmarkIntersectionArray()
{
    var l:Intersection[] =[];    
    for (var i=0;i<640*480;i++)
    {
       for (var i2=0;i2<500;i2++)
       {
           var n=new Intersection(0,null);
       }
      
    }
}



function simpleRenderTest()
{
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
    var xs= new Intersections(10);
    for (var y=0;y<c.height;y++)
    {
        var worldY=half-pixelSize*y;
        for (var x=0;x<c.width;x++)
        {
        
            var worldX=-half+pixelSize*x;
            var position = Tuple.point(worldX,worldY,wallz);
            var r= new Ray(rayOrigin, position.substract(rayOrigin).normalize() );
            shape.intersect(r,xs);
            if (xs.length>0)
            {
                var hit= xs.hit();
                var point=r.position(hit.t);
                var normal=shape.normalAt(point)
                var color=shape.material.lighting(light,point, r.direction.negate() ,normal);
                c.writePixel(x,y,color);
            }
            xs.clear();

        }
    }
}

//benchmark(benchmarkIntersectionArray);
//benchmark(benchmarkIntersections);

//372.405029296875 ms
//400 nach color
benchmark(simpleRenderTest); 
