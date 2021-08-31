import { Intersection } from "./intersection";
import { Ray } from "./ray";
import { Tuple } from "./tuple";
import { IWorldObject } from "./world";

export class Computations
{
    t: number;
    object: IWorldObject;
    point: Tuple;
    eyev:Tuple;
    normalv: Tuple;
    inside: boolean;
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

      return comps;
    }

    
    constructor()
    {

    }

}