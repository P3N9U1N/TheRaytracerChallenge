import { Intersection, Intersections } from "raytracer/intersection";
import { Ray } from "raytracer/ray";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { Computations } from "raytracer/computations";
import { Matrix4x4 } from "raytracer/matrix";
import { EPSILON } from "raytracer/constants";
import { Material } from "raytracer/material";
import { Plane } from "raytracer/plane";
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

    test("Precomputing the reflection vector"
    ,()=>{
     var shape = new Plane(1);
     var ray = new Ray(Tuple.point(0,1,-1),Tuple.vector(0,-Math.sqrt(2) / 2,Math.sqrt(2) / 2));
     var i = new Intersection(Math.sqrt(2),shape); 
     var comps= Computations.prepare(i,ray);   
     expect(comps.reflectv.equals(Tuple.vector(0,Math.sqrt(2) / 2,Math.sqrt(2) / 2))).toBeTruthy();
   
    }
    );


    function glassSphere()
    {
        var m= new Material();
        m.transparency=1;
        m.refractiveIndex=1.5;
        var s = new Sphere(1,undefined,m);
        return s;
    }


    test("Finding n1 and n2 at various intersections"
    ,()=>{
       var a= glassSphere();
       a.transform=Matrix4x4.scaling(2,2,2);
       a.material.refractiveIndex=1.5;
       var b= glassSphere();
       b.transform=Matrix4x4.translation(0,0,-0.25);
       b.material.refractiveIndex=2.0;
       var c= glassSphere();
       c.transform=Matrix4x4.translation(0,0,0.25);
       c.material.refractiveIndex=2.5;
       var r= new Ray(Tuple.point(0,0,-4),Tuple.vector(0,0,1));
       var xs= new Intersections();
       var i=xs.add();
       i.t=2;
       i.object=a;
       i=xs.add();
       i.t=2.75;
       i.object=b;
       i=xs.add();
       i.t=3.25;
       i.object=c;
       i=xs.add();
       i.t=4.75;
       i.object=b;
       i=xs.add();
       i.t=5.25;
       i.object=c;
       i=xs.add();
       i.t=6;
       i.object=a;
       
       var results=[
           [1,1.5 ],
           [1.5,2.0 ],
           [2,2.5 ],
           [2.5,2.5 ],
           [2.5,1.5 ],
           [1.5, 1.0],
       ]
       for (var x=0;x<xs.length;x++)
       {
         var result= Computations.prepare(xs.get(x),r,xs)
         expect(result.n1).toBeCloseTo(results[x][0]);
         expect(result.n2).toBeCloseTo(results[x][1]);
       }
    }
    );

    test("The under point is offset below the surface"
    ,()=>{
     var shape = glassSphere();
     shape.transform=Matrix4x4.translation(0,0,1);
     var r = new Ray(Tuple.point(0,0,-5),Tuple.vector(0,0,1));     
     var xs =new Intersections();
     var i=xs.add();
     i.t=5;
     i.object=shape;
     var comps= Computations.prepare(i,r,xs);
     expect(comps.underPoint.z).toBeGreaterThan(EPSILON/2);
     expect(comps.point.z).toBeLessThan(comps.underPoint.z);
    }
    );


    test("The Schlick approximation under total internal reflection "
    ,()=>{
     var shape = glassSphere();
     
     var r = new Ray(Tuple.point(0,0,Math.sqrt(2)/2),Tuple.vector(0,1,0));     
     var xs =new Intersections();
     var i=xs.add();
     i.t=-Math.sqrt(2)/2;
     i.object=shape;
     i=xs.add();
     i.t=Math.sqrt(2)/2;
     i.object=shape;

     var comps= Computations.prepare(xs.get(1),r,xs);
     var reflectance =comps.schlick();
     expect(reflectance).toBeCloseTo(1);
    }
    );

    test("The Schlick approximation with a perpendicular viewing angle"
    ,()=>{
     var shape = glassSphere();
     
     var r = new Ray(Tuple.point(0,0,0),Tuple.vector(0,1,0));     
     var xs =new Intersections();
     var i=xs.add();
     i.t=-1;
     i.object=shape;
     i=xs.add();
     i.t=1;
     i.object=shape;

     var comps= Computations.prepare(xs.get(1),r,xs);
     var reflectance =comps.schlick();
     expect(reflectance).toBeCloseTo(0.04);
    }
    );

    function sortTest(count:number)
    {
        var xs =new Intersections();
        var n:number[]=[];
        for (var co=0;co<100;co++)
        {
          var r=Math.random()*500;
          n.push(r);
          var o=xs.add();
          o.t = r;
          o.object=new Sphere(co);
        }        
        n.sort((a, b) => a - b);
        xs.sort();

        for (var co=0;co<n.length;co++)
        {
            var a= n[co];
            var b= xs.get(co).t
            expect(a).toBeCloseTo(b);
        }
    }
    test("sorting"
    ,()=>{
      sortTest(100);
      sortTest(64);
      sortTest(65);
      sortTest(63);
      sortTest(62);
      sortTest(66);
    }
    );


})
