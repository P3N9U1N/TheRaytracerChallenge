import { Color } from "./color";
import { Pattern } from "./patterns";
import { PointLight } from "./pointLight";
import { Tuple } from "./tuple";
import { IShape } from "./world";

export class Material
{
    color:Color=Color.WHITE.clone();
    ambient:number=0.1;
    diffuse:number=0.9;
    specular:number=0.9;
    shininess:number=200;
    pattern:Pattern=null;
    reflective:number=0;
    transparency:number=0;
    refractiveIndex:number=1;
    
    constructor(public id:number=-1)
    {

    }

    lighting(light:PointLight,object:IShape, point:Tuple,eyev:Tuple,normalv:Tuple,inShadow:boolean=false):Color
    {
       var color:Color =this.pattern!=null? this.pattern.patternAtShape(object,point):this.color;
  
       var effectiveColor=color.hadamardProduct(light.intensity);
       var ambient=effectiveColor.multiply(this.ambient);
       if (inShadow) return ambient;
       var lightv=light.position.substract(point).normalize();

       var lightDotNormal=lightv.dot(normalv);
       var diffuse;
       var specular;
       if (lightDotNormal<0)
       {
         diffuse=Color.BLACK;
         specular=Color.BLACK;
       } else
       {
           diffuse=effectiveColor.multiply(this.diffuse*lightDotNormal);
           var reflectv=lightv.negate().reflect(normalv);
           var reflectDotEye= reflectv.dot(eyev);
           if (reflectDotEye <=0)
           {
               specular=Color.BLACK;
           } else
           {
             var factor=Math.pow(reflectDotEye,this.shininess);
             specular= light.intensity.multiply(this.specular*factor );

           }
       }
       return ambient.add(diffuse).add(specular);
    }

}