import {Ray} from "./ray"
import { Tuple } from "./tuple";
import { Intersection, Intersections } from "./intersection";
import { Matrix4x4 } from "./matrix";
export class Sphere
{
   id:number;
   transform:Matrix4x4
   constructor(id:number,transform?:Matrix4x4)
   {
     this.id=id;
     this.transform= transform ?? Matrix4x4.IDENTITY_MATRIX.clone();    
   }
   intersect(ray:Ray,intersections?: Intersections ):Intersections
   {
     ray=ray.transform(this.transform.inverse());
     intersections??=new Intersections();
     var sphere2ray=ray.origin.substract(Tuple.point(0,0,0));
     var a=ray.direction.dot(ray.direction);
     var b=2*ray.direction.dot(sphere2ray);
     var c=sphere2ray.dot(sphere2ray)-1;
     var discriminant = b*b-4*a*c;
     if (discriminant<0) return intersections;
     var sqrtDiscriminant=Math.sqrt(discriminant);
     var i1=intersections.add();
     i1.t=(-b-sqrtDiscriminant) /(2*a);
     i1.object=this;
     var i2=intersections.add();
     i2.t=(-b+sqrtDiscriminant) /(2*a);
     i2.object=this;
     
     return intersections;
   }

}