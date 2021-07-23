import { Tuple } from "../../raytracer/tuple";

export class Environment {
    gravity:Tuple;
    wind:Tuple;

    constructor(gravity:Tuple,wind:Tuple) {
      this.gravity=gravity;
      this.wind=wind;
        
    }
}