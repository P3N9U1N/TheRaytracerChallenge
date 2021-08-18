import { Color } from "../../raytracer/color";
import { Material } from "../../raytracer/material";
import { Matrix4x4 } from "../../raytracer/matrix";
import { PointLight } from "../../raytracer/pointLight";
import { Sphere } from "../../raytracer/sphere";
import { Tuple } from "../../raytracer/tuple";

export class World
{  
    light:PointLight;
    objects:any[];
    static defaultWorld():World
    {
      var w = new World();
      w.light= new PointLight(Tuple.point(-10,10,-10),new Color(1,1,1));
      var m1= new Material();
      m1.color= new Color(0.8,1.0,0.6);
      m1.diffuse=0.7;
      m1.specular=0.2;
      var s1= new Sphere(0,Matrix4x4.IDENTITY_MATRIX.clone(),m1);
      var s2= new Sphere(1,Matrix4x4.scaling(0.5,0.5,0.5));
      w.objects=[s1,s2];
      return w;
    }
    
    constructor() {
       
        
    }
}