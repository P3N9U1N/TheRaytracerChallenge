import { Color } from "raytracer/color";
import { EPSILON } from "raytracer/constants";
import { Material } from "raytracer/material";
import { Matrix4x4 } from "raytracer/matrix";
import { GradientPattern, StripePattern, PerlinPattern, Checker3DPattern4Sphere, Checker3dPattern, CompositePattern } from "raytracer/patterns";
import { Plane } from "raytracer/plane";
import { PointLight } from "raytracer/pointLight";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";
import { World } from "raytracer/world";
import * as serializing from "raytracer/serializing";

function genericCompare(obj1:any,obj2:any)
{ 
  if(typeof obj1!="object" ||  typeof obj2!="object") return obj1===obj2;
  for (var prop in obj1)
  {
   var value1=obj1[prop];
   var value2=obj2[prop];   
   if (!genericCompare(value1,value2) ) return false;   
  }
  
  for (var prop in obj2)
  {
      var value1=obj1[prop];   
      if (value1===undefined) return false;
  }
  return true;
}
test("generic compare",
() => {
    expect(genericCompare({d:1},{d:2})).toBeFalsy();
    expect(genericCompare({d:1},{d:1})).toBeTruthy();
    expect(genericCompare([0],{d:2})).toBeFalsy();
    expect(genericCompare([0,1,2],[0,1,2])).toBeTruthy();
    expect(genericCompare([0,1,2],[0,1,2,3])).toBeFalsy();
    expect(genericCompare({d:[{a:1},1,2]},{d:[{a:1},1,2]})).toBeTruthy();
    expect(genericCompare({d:[{a:1},1,3]},{d:[{a:1},1,2]})).toBeFalsy();
    expect(genericCompare(1,1)).toBeTruthy();
    expect(genericCompare(1,2)).toBeFalsy();
    expect(genericCompare(1,[1])).toBeFalsy();
    expect(genericCompare([1],1)).toBeFalsy();
});

test("composite pattern",
() => {
var p=  new CompositePattern(
    new GradientPattern(new Color(0.2,0.4,0.5), new Color(0.1,0.9,0.7)),
    new GradientPattern(new Color(0.2,0.4,0.5), new Color(0.1,0.9,0.7),Matrix4x4.rotationY(Math.PI/2)),
    );
 var serialized= p.toObject();  
 var deserialized= serializing.deSerializePattern(serialized);
 expect(genericCompare(p,deserialized)).toBeTruthy();
 var x=p.patternAt(Tuple.point(0.5,0.5,0.5));
});
