import { Color } from "raytracer/color";
import { Computations } from "raytracer/computations";
import { Intersection } from "raytracer/intersection";
import { Material } from "raytracer/material";
import { Matrix4x4 } from "raytracer/matrix";
import { PointLight } from "raytracer/pointLight";
import { Ray } from "raytracer/ray";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { World } from "raytracer/world";

function defaultWorld(): World
{
  var w = new World();
  w.light= new PointLight(Tuple.point(-10,10,-10),new Color(1,1,1));
  var m1= new Material();
  m1.color= new Color(0.8,1.0,0.6);
  m1.diffuse=0.7;
  m1.specular=0.2;
  var s1= new Sphere(0,Matrix4x4.IDENTITY_MATRIX.clone(),m1);
  var s2= new Sphere(1,Matrix4x4.scaling(0.5,0.5,0.5));
  w.objects=[s1,s2];
  return w;
}

test("Intersect a world with a ray",
    () => {

        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var w = defaultWorld();
        var xs=w.intersect(r);
        xs.sort();
        expect(xs.length).toBe(4);
        expect(xs.get(0).t).toBeCloseTo(4);
        expect(xs.get(1).t).toBeCloseTo(4.5);
        expect(xs.get(2).t).toBeCloseTo(5.5);
        expect(xs.get(3).t).toBeCloseTo(6);
    }
);


test("Shading an intersection",
    () => {

        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var w = defaultWorld();
        var shape=w.objects[0];
        var i = new Intersection(4,shape);

        var comps= Computations.prepare(i,r);
        var c= w.shadeHit(comps);
       
        expect(c.equals(new Color(0.38066,0.47583,0.2855)));
    }
);

test("Shading an intersection from the inside",
    () => {

        var r = new Ray(Tuple.point( 0, 0,0), Tuple.vector(0, 0, 1));
        var w = defaultWorld();
        w.light= new PointLight(Tuple.point(0,0.25,0),new Color(1,1,1));
        var shape=w.objects[1];
        var i = new Intersection(0.5,shape);

        var comps= Computations.prepare(i,r);
        var c= w.shadeHit(comps);
       
        expect(c.equals(new Color(0.90498,0.90498,0.90498)));
    }
);
test("The color when a ray misses",
    () => {

        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 1, 0));
        var w = defaultWorld();
        var c=w.colorAt(r);
       
        expect(c.equals(new Color(0,0,0)));
    }
);


test("The color when a ray hits",
    () => {

        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var w = defaultWorld();
        var c=w.colorAt(r);
       
        expect(c.equals(new Color(0.38066,0.47583,0.2855)));
    }
);

test("The color with an intersection behind the ray",
    () => {

        var r = new Ray(Tuple.point( 0, 0,0.75), Tuple.vector(0, 0, -1));
        var w = defaultWorld();
        var outer=w.objects[0];
        outer.material.ambient=1;
        var inner =w.objects[1];
        inner.material.ambient=1;
       
        var c=w.colorAt(r);
       
        expect(c.equals(inner.material.color));
    }
);

test("There is no shadow when nothing is collinear with point and light",
    () => {

     
        var w = defaultWorld();
        var p = Tuple.point(0,10,0);  
        expect( w.isShadowed(p) ).toBeFalsy();
    }
);


test("The shadow when an object is between the point and the light",
    () => {     
        var w = defaultWorld();
        var p = Tuple.point(10,-10,10);  
        expect( w.isShadowed(p) ).toBeTruthy();
    }
);

test("There is no shadow when an object is behind the light",
    () => {     
        var w = defaultWorld();
        var p = Tuple.point(-20,20,-20);  
        expect( w.isShadowed(p) ).toBeFalsy();
    }
);

test("There is no shadow when an object is behind the point",
    () => {     
        var w = defaultWorld();
        var p = Tuple.point(-2,2,-2);  
        expect( w.isShadowed(p) ).toBeFalsy();
    }
);
