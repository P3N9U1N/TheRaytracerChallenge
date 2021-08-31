
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
    objects:IWorldObject[];
    
    private static tempIntersections= new Intersections(100);

    constructor() {
       
        
    }
    shadeHit(comps: Computations):Color {
      return comps.object.material.lighting(this.light,comps.point,comps.eyev,comps.normalv);
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

    intersect(ray:Ray, intersections?: Intersections ):Intersections
    {     
      intersections??=new Intersections();     
      for (var o of this.objects)
      {
        o.intersect(ray,intersections)
      }
      return intersections;
    }
}

export interface IWorldObject
{
  material:Material;
  intersect(ray:Ray,intersections?: Intersections ):Intersections;
  normalAt(p:Tuple):Tuple;
    
}