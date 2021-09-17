
import { Color } from "./color";
import { Computations } from "./computations";
import { Intersections } from "./intersection";
import { Material } from "./material";
import { Matrix4x4 } from "./matrix";
import { PointLight } from "./pointLight";
import { Ray } from "./ray";
import { Sphere } from "./sphere";
import { Tuple } from "./tuple";

export class World
{

    light:PointLight;
    objects:IShape[];
    
    private static tempIntersections= new Intersections(100);

    constructor() {
       
        
    }
    refractedColor(comps:Computations,remaining:number):Color
    {
      if (remaining==0 || comps.object.material.transparency==0) return Color.BLACK.clone();
      var nRatio= comps.n1/comps.n2;
      var cosI=comps.eyev.dot(comps.normalv);
      var sin2t=nRatio*nRatio*(1-cosI*cosI);
      if (sin2t>1) return  Color.BLACK.clone();
      var cosT=Math.sqrt(1-sin2t);
      var direction=comps.normalv.multiply(nRatio*cosI-cosT).substract(comps.eyev.multiply(nRatio));
      var refractRay=new Ray(comps.underPoint, direction);
      var color= this.colorAt(refractRay,remaining-1).multiply(comps.object.material.transparency);
      return color;      
    }
    shadeHit(comps: Computations,remaining:number=0):Color {
    
      var surface= comps.object.material.lighting(this.light,comps.object,
        comps.point,
        comps.eyev,
        comps.normalv,
        this.isShadowed(comps.overPoint)
        );
        var reflected=this.reflectedColor(comps,remaining);
        var refracted=this.refractedColor(comps,remaining);

        var material= comps.object.material;
        if (material.reflective > 0 && material.transparency >0)
        {          
          var reflectance= comps.schlick();
          return surface.add(reflected.multiply(reflectance)).add(refracted.multiply(1-reflectance));
        }
        return surface.add(reflected).add(refracted);
    }  
    colorAt(ray:Ray,remaining:number=4)
    {
      World.tempIntersections.clear();
      this.intersect(ray,World.tempIntersections);
      
      World.tempIntersections.sort();
      var i=World.tempIntersections.firstHit();
      if (i==null) return Color.BLACK.clone();
      var comp=Computations.prepare(i,ray,World.tempIntersections);
      return this.shadeHit(comp,remaining);
    } 

    intersect(ray:Ray, intersections: Intersections =new Intersections()):Intersections
    {    
      for (var o of this.objects)
      {
        o.intersect(ray,intersections)
      }
      return intersections;
    }
    isShadowed(point:Tuple):boolean
    {
     var v= this.light.position.substract(point);
     var distance= v.magnitude();
     var direction=v.normalize();
     var r= new Ray(point,direction);
     World.tempIntersections.clear();
     this.intersect(r,World.tempIntersections);
     var h= World.tempIntersections.hit();
     return (h!=null && h.t< distance);
    }
    
    reflectedColor(comps:Computations,remaining:number):Color
    {  
       if (remaining==0 || comps.object.material.reflective==0) return new Color(0,0,0);
       var reflectRay=new Ray(comps.overPoint,comps.reflectv);
       var color=this.colorAt(reflectRay,remaining-1);
       return color.multiply(comps.object.material.reflective );
    }

}

export interface IShape
{
  id:number;
  material:Material; 
  /**
   * Transformation matrix. Call setter after change for updating inverse.
   */
  transform:Matrix4x4;  
  /**
  * Inverse Transformation matrix. Keep in sync with transformation matrix.
  */   
  inverseTransform: Matrix4x4;
  intersect(ray:Ray,intersections?: Intersections ):Intersections;
  normalAt(p:Tuple):Tuple;    
 
}