
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
    shadeHit(comps: Computations):Color {
      return comps.object.material.lighting(this.light,comps.object,
        comps.point,
        comps.eyev,
        comps.normalv,
        this.isShadowed(comps.overPoint)
        );
    }  
    colorAt(ray:Ray)
    {
      World.tempIntersections.clear();
      this.intersect(ray,World.tempIntersections);
      var i=World.tempIntersections.hit();
      if (i==null) return Color.BLACK.clone();
      var comp=Computations.prepare(i,ray);
      return this.shadeHit(comp);
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