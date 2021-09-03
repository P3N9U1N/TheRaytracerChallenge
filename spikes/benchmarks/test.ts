import { Canvas } from "raytracer/canvas";
import { Color } from "raytracer/color";
import { Intersection, Intersections } from "raytracer/intersection";
import { Material } from "raytracer/material";
import { Matrix4x4 } from "raytracer/matrix";
import { PointLight } from "raytracer/pointLight";
import { Ray } from "raytracer/ray";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { World } from "raytracer/world";
import { Camera } from "raytracer/camera";
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
                var color=shape.material.lighting(light,hit.object,point, r.direction.negate() ,normal);
                c.writePixel(x,y,color);
            }
            xs.clear();

        }
    }
}

function benchmarkChapter7()
{
    var world= new World();
    var floor = new Sphere(0);
    floor.transform=Matrix4x4.scaling(10,0.01,10);
    floor.material= new Material();
    floor.material.color=new Color(1,0.9,0.9);
    floor.material.specular=0;
    var leftWall= new Sphere(1);
    leftWall.transform=Matrix4x4.translation(0,0,5)
        .multiply(Matrix4x4.rotationY(-Math.PI/4))
        .multiply(Matrix4x4.rotationX(Math.PI/2))
        .multiply(Matrix4x4.scaling(10,0.01,10)); 
    leftWall.material=floor.material;
    
    var rightWall= new Sphere(2);
    rightWall.transform=Matrix4x4.translation(0,0,5)
    .multiply(Matrix4x4.rotationY(Math.PI/4))
    .multiply(Matrix4x4.rotationX(Math.PI/2))
    .multiply(Matrix4x4.scaling(10,0.01,10));
    rightWall.material=floor.material;
    
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
    
    
    world.objects= [left,right,middle,rightWall,leftWall,floor];
    world.light= new PointLight(Tuple.point(-10,10,-10),Color.WHITE.clone());
    
    var camera= new Camera(1024,1024,Math.PI/3,
        Matrix4x4.viewTransform(Tuple.point(0,1.5,-5),Tuple.point(0,1,0),Tuple.vector(0,1,0))
        );   
    var renderData = camera.render(world);
}



//benchmark(benchmarkIntersectionArray);
//benchmark(benchmarkIntersections);

//372.405029296875 ms
//400 nach color
benchmark(simpleRenderTest); 
benchmark(benchmarkChapter7); 