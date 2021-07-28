import { Intersection, Intersections } from "../../raytracer/intersection";
import { Sphere } from "../../raytracer/sphere";
import { Tuple } from "../../raytracer/tuple";

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


    
 //   test("Benchmark",()=>{
 //    var iterations=5000000;
 //    var iterations2=50;
/*
     var l = new Intersections(iterations);
     for (var i=0;i<iterations;i++)
     {
        var x=l.add();
     }
*/
/*
     var l2:Intersection[] =new Array(iterations);
     for (var i=0;i<iterations;i++)
     {
        var x=new Intersection(0,null);
        l2[i]=x;
     }
 */   
/*
     var l3 = new Intersections();
     for (var i=0;i<iterations;i++)
     {
        var x=l3.add();
     }
*/ 
  /*  
     var l3 = new Intersections();
     for (var i=0;i<iterations;i++)
     {
        for (var i2=0;i2<iterations2;i2++)
        {
            var x1=l3.add();
            x1.object=null;
            x1.t=1;
        }
        l3.clear();

     }
    */
   /*
     var l4:Intersection[] =[] ;
    
     for (var i=0;i<iterations;i++)
     {
        for (var i2=0;i2<iterations2;i2++)
        {
            l4.push(new Intersection(0,null) );

        }
        l4.length=0;

     }
*/
/*
var l4:Intersection[] =[] ;
    var x=new Intersection(0,null) ;
for (var i=0;i<iterations;i++)
{
   for (var i2=0;i2<iterations2;i2++)
   {
       x.t=1;
       x.object=this;
       l4.push(x) ;

   }
   l4.length=0;

}
*/
//});

})
