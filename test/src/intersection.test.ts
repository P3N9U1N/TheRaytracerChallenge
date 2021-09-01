import { Intersection, Intersections } from "raytracer/intersection";
import { Ray } from "raytracer/ray";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { Computations } from "raytracer/computations";
import { Matrix4x4 } from "raytracer/matrix";
import { EPSILON } from "raytracer/constants";
describe("Intersections",
()=>
{
    var checkConsistency=(l:Intersections)=>
    {
      var indexMap= l["indexMap"]  as Map<Intersection,number>;
      var items= l["items"] as Intersection[];
      expect(items.length).toBe(indexMap.size)
      for (var im of indexMap)
      {
          expect(im[0]).toBe(items[im[1]]);
      }
      for (var i =0;i<items.length;i++)
      {
          expect(i).toBe(indexMap.get(items[i]));
      }
    }
    
    test("Empty intersections"
    ,()=>{
     var l = new Intersections();
     expect(l.length).toBe(0);
     expect(l.get(0)).toBeUndefined();  
     checkConsistency(l);  
    }
    );
    test("Empty intersections with initial size"
    ,()=>{
     var l = new Intersections(100);
     expect(l.length).toBe(0);
     expect(l.get(0)).toBeUndefined();    
     checkConsistency(l);  
    }
    );
    test("Add items"
    ,()=>{
     var l = new Intersections(100);
     var i=l.add();
     var i2=l.add();
     expect(l.length).toBe(2);
     expect(l.get(0)).toBe(i); 
     expect(l.get(1)).toBe(i2);     
     expect(l.get(2)).toBeUndefined();    
     checkConsistency(l);  
    }
    );
    test("Check dynamic size increase"
    ,()=>{
     var l = new Intersections();
     var i=l.add();
     expect(l.length).toBe(1);
     expect(l.get(0)).toBe(i);
     expect(l.get(1)).toBeUndefined();       
     checkConsistency(l);  
    }
    );
    test("indexOf"
    ,()=>{
     var l = new Intersections();
     var i=l.add();
     var i2=l.add();
     var i3=l.add();     
     expect(l.indexOf(i)).toBe(0);
     expect(l.indexOf(i2)).toBe(1);
     expect(l.indexOf(i3)).toBe(2);
     expect(l.indexOf(new Intersection(0,{}))).toBe(-1);    
     l.remove(i3);
     expect(l.indexOf(i3)).toBe(-1);   
     checkConsistency(l);  
    }
    );

    test("Remove items"
    ,()=>{
     var l = new Intersections();
     var i=l.add();
     var i2=l.add();
     var i3=l.add();     
     expect(l.length).toBe(3);
     l.remove(i);
     expect(l.length).toBe(2);
     expect(l.indexOf(i)).toBe(-1);
     expect(l.indexOf(i2)).not.toBe(-1);
     expect(l.indexOf(i3)).not.toBe(-1);
       
     checkConsistency(l);  
    }
    );

    test("The hit when all intersections have positive t"
    ,()=>{
     var s = new Sphere(1);
     var xs = new Intersections(); 
     var i1= xs.add();
     i1.t=1;
     i1.object=s;
     var i2= xs.add();
     i2.t=2;
     i2.object=s;
     var i=xs.hit();
     expect(i).toBe(i1);
   
    }
    );

    test("The hit when some intersections have negative t"
    ,()=>{
     var s = new Sphere(1);
     var xs = new Intersections(); 
     var i1= xs.add();
     i1.t=-1;
     i1.object=s;
     var i2= xs.add();
     i2.t=1;
     i2.object=s;
     var i=xs.hit();
     expect(i).toBe(i2);
   
    }
    );
    test("The hit when all intersections have negative t"
    ,()=>{
     var s = new Sphere(1);
     var xs = new Intersections(); 
     var i1= xs.add();
     i1.t=-2;
     i1.object=s;
     var i2= xs.add();
     i2.t=-1;
     i2.object=s;
     var i=xs.hit();
     expect(i).toBeNull();
   
    }
    );
    test("The hit is always the lowest nonnegative intersection"
    ,()=>{
     var s = new Sphere(1);
     var xs = new Intersections(); 
     var i1= xs.add();
     i1.t=5;
     i1.object=s;
     var i2= xs.add();
     i2.t=7;
     i2.object=s;
     var i3= xs.add();
     i3.t=-3;
     i3.object=s;
     var i4= xs.add();
     i4.t=2;
     i4.object=s;
     var i=xs.hit();
     expect(i).toBe(i4);
   
    }
    );

    test("The hit, when an intersection occurs on the outside"
    ,()=>{
     var shape = new Sphere(1);
     var ray = new Ray(Tuple.point(0,0,-5),Tuple.vector(0,0,1));
     var i = new Intersection(4,shape); 
     var comps= Computations.prepare(i,ray);
     
     expect(comps.inside).toBeFalsy();
   
    }
    );
    test("The hit, when an intersection occurs on the inside"
    ,()=>{
     var shape = new Sphere(1);
     var ray = new Ray(Tuple.point(0,0,0),Tuple.vector(0,0,1));
     var i = new Intersection(1,shape); 
     var comps= Computations.prepare(i,ray);
     expect(comps.point.equals(Tuple.point(0,0,1))).toBeTruthy();
     expect(comps.eyev.equals(Tuple.vector(0,0,-1))).toBeTruthy();
     expect(comps.inside).toBeTruthy();
   
    }
    );
    test("The hit should offset the point"
    ,()=>{
     var shape = new Sphere(1);
     shape.transform=Matrix4x4.translation(0,0,1);

     var ray = new Ray(Tuple.point(0,0,-5),Tuple.vector(0,0,1));
     var i = new Intersection(5,shape); 
     var comps= Computations.prepare(i,ray);
     expect(comps.overPoint.z).toBeLessThan(-EPSILON/2);
     expect(comps.point.z).toBeGreaterThan(comps.overPoint.z);

   
    }
    );
})
