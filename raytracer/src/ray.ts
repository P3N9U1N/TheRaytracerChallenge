import { Matrix4x4 } from "./matrix";
import { Tuple } from "./tuple";

export class Ray
{
    origin: Tuple;
    direction:Tuple;
    constructor(origin:Tuple,direction:Tuple)
    {
      this.origin=origin;
      this.direction=direction;
    }
    position(t:number):Tuple
    {
        return this.origin.add(this.direction.multiply(t));
    }

    transform(matrix:Matrix4x4):Ray
    {
     var direction= matrix.multiply(this.direction);
     var origin= matrix.multiply(this.origin);
     
     var ray=new Ray(origin,direction);
     return ray;
    }
}