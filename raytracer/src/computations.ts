import { EPSILON } from "./constants";
import { Intersection } from "./intersection";
import { Ray } from "./ray";
import { Tuple } from "./tuple";
import { IShape } from "./world";

export class Computations
{
    t: number;
    object: IShape;
    point: Tuple;
    eyev:Tuple;
    normalv: Tuple;
    inside: boolean;
    overPoint: Tuple;
    public static prepare(intersection:Intersection,ray:Ray ):Computations
    {
      var comps = new Computations();
      comps.t=intersection.t;
      comps.object=intersection.object;

      comps.point=ray.position(comps.t);
      comps.eyev=ray.direction.negate();
      comps.normalv= comps.object.normalAt(comps.point);
      if (comps.normalv.dot(comps.eyev)<0)
      {
        comps.inside=true;
        comps.normalv=comps.normalv.negate();
      } else {
        comps.inside=false;
      }
      comps.overPoint=comps.point.add(comps.normalv.multiply(EPSILON));

      return comps;
    }

    
    constructor()
    {

    }

}