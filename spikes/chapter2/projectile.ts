import { Tuple } from "../../raytracer/tuple";

export class Projectile
{
    position:Tuple;
    velocity:Tuple;

    constructor(position:Tuple,velocity:Tuple) {
      this.position=position;
      this.velocity=velocity;
      
    }

}