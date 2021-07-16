import { Tuple } from "../../../raytracer/src/tuple";

export class Environment {
    gravity:Tuple;
    wind:Tuple;

    constructor(gravity:Tuple,wind:Tuple) {
      this.gravity=gravity;
      this.wind=wind;
        
    }
}