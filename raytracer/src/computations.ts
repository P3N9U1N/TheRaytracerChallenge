import { EPSILON } from "./constants";
import { Intersection, Intersections } from "./intersection";
import { Ray } from "./ray";
import { Tuple } from "./tuple";
import { IShape } from "./world";

export class Computations {
  t: number;
  object: IShape;
  point: Tuple;
  eyev: Tuple;
  normalv: Tuple;
  inside: boolean;
  overPoint: Tuple;
  underPoint: Tuple;
  reflectv: Tuple;
  n1: number;
  n2: number;  

  private static tempSet = new Set<IShape>();
  public static prepare(hit: Intersection, ray: Ray, intersections: Intersections = null): Computations {
    var comps = new Computations();
    comps.t = hit.t;
    comps.object = hit.object;

    comps.point = ray.position(comps.t);
    comps.eyev = ray.direction.negate();
    comps.normalv = comps.object.normalAt(comps.point);
    if (comps.normalv.dot(comps.eyev) < 0) {
      comps.inside = true;
      comps.normalv = comps.normalv.negate();
    } else {
      comps.inside = false;
    }
    var surfaceOffset=comps.normalv.multiply(EPSILON);
    comps.overPoint = comps.point.add(surfaceOffset);
    comps.underPoint = comps.point.substract(surfaceOffset);
    comps.reflectv = ray.direction.reflect(comps.normalv);
    if (intersections == null) {//dont compute n1 and n2
      comps.n1 = 1;
      comps.n2 = 1;
    } else {
      Computations.tempSet.clear();
      for (var c = 0; c < intersections.length; c++) {
        var i = intersections.get(c);
        if (i == hit) {       
          if (Computations.tempSet.size == 0) {
            comps.n1 = 1;
            comps.n2 = i.object.material.refractiveIndex;
          } else {
            var last: IShape = null;
            var secondLast:IShape=null;
            for (var o of Computations.tempSet) {
              secondLast=last;
              last = o;
            }
            comps.n1 = last.material.refractiveIndex;
            if (!Computations.tempSet.has(i.object) )
            {
              comps.n2=i.object.material.refractiveIndex;
              
            } else
            {
              if (last==i.object)
              {
                comps.n2=secondLast==null? 1 :secondLast.material.refractiveIndex;
              } else
              {
                comps.n2=last.material.refractiveIndex;
              }
            }
            break;
          }
        }
        if (!Computations.tempSet.delete(i.object)) {
          Computations.tempSet.add(i.object)
        }
      }
    }
    return comps;
  }
  
  public schlick():number
  {
    var cos=this.eyev.dot(this.normalv);
    if (this.n1>this.n2)
    {
      var n= this.n1/this.n2;
      var sin2t= n*n*(1-cos*cos);
      if (sin2t>1) return 1;
      var cosT=Math.sqrt(1-sin2t);
      cos=cosT;
    }
    var temp= ((this.n1-this.n2)/(this.n1+this.n2));
    var r0= temp*temp;    
    return r0+(1-r0)*Math.pow((1-cos),5);
  }
  constructor() {

  }

}