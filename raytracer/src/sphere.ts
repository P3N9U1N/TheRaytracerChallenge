import { Ray } from "./ray"
import { Tuple } from "./tuple";
import { Intersection, Intersections } from "./intersection";
import { Matrix4x4 } from "./matrix";
import { Material } from "./material";
import { IShape } from "./world";
export class Sphere implements IShape {

  id: number;
  public inverseTransform: Matrix4x4;

  private _transform: Matrix4x4;
  /**
   * Transformation matrix. Call setter after change for updating inverse.
   */
  public get transform(): Matrix4x4 {
    return this._transform;
  }
  public set transform(value: Matrix4x4) {
    this._transform = value;
    this.inverseTransform=value.inverse();
  }

  material: Material;
  private static tempMatrix1 = new Matrix4x4();


  constructor(id: number, transform?: Matrix4x4, material?: Material) {
    this.id = id;
    this.transform = transform ?? Matrix4x4.IDENTITY_MATRIX.clone();
    this.material = material ?? new Material();
  }
  
  intersect(ray: Ray, intersections: Intersections= new Intersections()): Intersections {
    ray = ray.transform(this.inverseTransform);
    var sphere2ray = ray.origin.substract(Tuple.point(0, 0, 0));
    var a = ray.direction.dot(ray.direction);
    var b = 2 * ray.direction.dot(sphere2ray);
    var c = sphere2ray.dot(sphere2ray) - 1;
    var discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return intersections;
    var sqrtDiscriminant = Math.sqrt(discriminant);
    var i1 = intersections.add();
    i1.t = (-b - sqrtDiscriminant) / (2 * a);
    i1.object = this;
    var i2 = intersections.add();
    i2.t = (-b + sqrtDiscriminant) / (2 * a);
    i2.object = this;

    return intersections;
  }

  normalAt(p: Tuple): Tuple {   
    var objectNormal = this.inverseTransform.multiply(p);
    objectNormal.w = 0;
    var worldNormal = this.inverseTransform.transpose(Sphere.tempMatrix1).multiply(objectNormal);
    worldNormal.w = 0;
    return worldNormal.normalize();
  }

}