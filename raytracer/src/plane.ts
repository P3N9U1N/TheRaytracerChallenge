import { Ray } from "./ray"
import { Tuple } from "./tuple";
import { Intersection, Intersections } from "./intersection";
import { Matrix4x4 } from "./matrix";
import { Material } from "./material";
import { IShape } from "./world";
import { EPSILON } from "./constants";
export class Plane implements IShape {

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
    this.localIntersect(ray,intersections);
    return intersections;
  }

  normalAt(p: Tuple): Tuple { 

    var objectNormal =Tuple.vector(0,1,0); 
    var worldNormal = this.inverseTransform.transpose(Plane.tempMatrix1).multiply(objectNormal);
    worldNormal.w = 0;  
    return worldNormal.normalize();
  }

  localIntersect(ray:Ray,intersections:Intersections = new Intersections()):Intersections
  {
    if (Math.abs(ray.direction.y) < EPSILON) return intersections;
    var i=intersections.add();
    i.object=this;
    i.t=-ray.origin.y/ray.direction.y;
    return intersections;
  }

}