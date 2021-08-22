import { Color } from "./color";
import { PointLight } from "./pointLight";
import { Tuple } from "./tuple";

export class Material
{
    color:Color=Color.WHITE.clone();
    ambient:number=0.1;
    diffuse:number=0.9;
    specular:number=0.9;
    shininess:number=200;

    lighting(light:PointLight,point:Tuple,eyev:Tuple,normalv:Tuple):Color
    {
       var effectiveColor=this.color.hadamardProduct(light.intensity);
       var lightv=light.positon.substract(point).normalize();
       var ambient=effectiveColor.multiply(this.ambient);
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