import { Camera } from "./camera";
import { Color } from "./color";
import { Matrix4x4 } from "./matrix";
import { Pattern, Checker3DPattern4Sphere, StripePattern, GradientPattern, RingPattern, Checker3dPattern, PerlinPattern, CompositePattern } from "./patterns";
import { Plane } from "./plane";
import { PointLight } from "./pointLight";
import { Sphere } from "./sphere";
import { Tuple } from "./tuple";
import { IShape, World } from "./world";
import { Material } from "./material";


export function deSerializeShapes(obj:any,materialsMap:Map<number,Material>):IShape
{
  var type = deserializeString(obj.type);
  switch(type)
  { 
    case Plane.name:
      var p= new Plane(deserializeNumber(obj.id),
      deserializeMatrix4x4(obj.transform),
       materialsMap.get(deserializeNumber(obj.material))
      );
    return p;
    case Sphere.name:
        var s= new Sphere(deserializeNumber(obj.id), 
        deserializeMatrix4x4(obj.transform),
        materialsMap.get(deserializeNumber(obj.material))
        )
     return s;
  }
  throw new Error();
}

export function deSerializeMaterial(obj:any):Material
{
  if (obj==null) throw new Error();
  var m = new Material(deserializeNumber(obj.id));
  m.ambient=deserializeNumber(obj.ambient);
  m.color=deserializeColor(obj.color);
  m.diffuse= deserializeNumber(obj.diffuse);
  m.pattern= deSerializePattern(obj.pattern);
  m.shininess= deserializeNumber(obj.shininess);
  m.specular= deserializeNumber(obj.specular);
  m.reflective= deserializeNumber(obj.reflective);
  m.transparency= deserializeNumber(obj.transparency);
  m.refractiveIndex= deserializeNumber(obj.refractiveIndex);

 return m;
}

export function deSerializePattern(obj:any):Pattern
{
  if (obj==null) return null;
  var type = deserializeString(obj.type);
  switch(type)
  { 
    case PerlinPattern.name:
      var p= new PerlinPattern(deserializeColor(obj.a),deserializeColor(obj.b),
      deserializeNumber(obj.threshold),deserializeNumber(obj.seed),deserializeMatrix4x4(obj.transform)
      )
      return p;
    case Checker3DPattern4Sphere.name:
      var p2= new Checker3DPattern4Sphere(deserializeColor(obj.a),deserializeColor(obj.b),deserializeMatrix4x4(obj.transform),
      deserializeNumber(obj.uvScale))
      return p2;
    case Checker3dPattern.name:
      var p3= new Checker3dPattern(deserializeColor(obj.a),deserializeColor(obj.b),deserializeMatrix4x4(obj.transform))
      return p3;
    case RingPattern.name:
      var p4= new RingPattern(deserializeColor(obj.a),deserializeColor(obj.b),deserializeMatrix4x4(obj.transform))
      return p4;
    case GradientPattern.name:
      var p5= new GradientPattern(deserializeColor(obj.a),deserializeColor(obj.b),deserializeMatrix4x4(obj.transform))
      return p5;
    case StripePattern.name:
      var p6= new StripePattern(deserializeColor(obj.a),deserializeColor(obj.b),deserializeMatrix4x4(obj.transform))
      return p6;
    case CompositePattern.name:
      var p7= new CompositePattern(deSerializePattern(obj.pattern1), deSerializePattern(obj.pattern2))
      return p7;
  }
  throw new Error();
 
}



export function deserializeMatrix4x4(obj:any):Matrix4x4
{
  if (obj==null) return Matrix4x4.IDENTITY_MATRIX.clone();
  var array=deSerializeArray(obj,(x)=>deSerializeArray(x,deserializeNumber));
  var w= new Matrix4x4(array); 
 return w;
}


export function deSerializeWorld(obj:any):World
{
  if (obj==null) throw new Error();
  var materials=deSerializeArray(obj.materials,deSerializeMaterial);
  var materialsMap= new Map<number,Material>(materials.map((m)=>[m.id,m]));
  var w= new World();
  w.light=deSerializeLight(obj.light);  
  w.objects  =deSerializeArray(obj.objects, (s)=>{ return deSerializeShapes(s,materialsMap) });  
 return w;
}
export function deSerializeArray<T>(obj:any,callbackfn:(p:any)=>T):T[]
{
  if (obj==null || !Array.isArray(obj)) throw new Error(); 
  return obj.map(callbackfn);
}
export function deSerializeLight(obj:any):PointLight
{
  if (obj==null) throw new Error();
  var pointLight= new PointLight(deserializeTuple(obj.position),
  deserializeColor(obj.intensity) );  
  return pointLight;
}

export function deserializeTuple(obj:any):Tuple
{
  if (obj==null) throw new Error();
 var t= new Tuple();
 t.x = deserializeNumber(obj.x);
 t.y = deserializeNumber(obj.y);
 t.z = deserializeNumber(obj.z);
 t.w = deserializeNumber(obj.w);
 return t;
}

export function deserializeNumber(obj:any):number
{
  if (obj == null || isNaN(obj)) throw new Error();
  return obj;
}
export function deserializeString(obj:any):string
{
  if (obj == null || !( (typeof obj === 'string' || obj instanceof String) )) throw new Error();
  return obj as string;
}
export function deserializeColor(obj:any):Color
{
  if (obj==null) throw new Error();
 var color = new Color();
 color.red=deserializeNumber(obj.red);
 color.green=deserializeNumber(obj.green);
 color.blue=deserializeNumber(obj.blue);
 return color; 
}

export function deSerializeCamera(obj:any):Camera
{
  if (obj==null) throw new Error();
  var c= new Camera(
    deserializeNumber(obj.hsize),
    deserializeNumber(obj.vsize),
    deserializeNumber(obj.fieldOfView),
    deserializeMatrix4x4(obj.transform)
  );
  return c;
}







export function serializeCamera(camera:Camera):any
{
 return camera.toObject();
}


export function serializePattern(pattern:Pattern)
{
  return pattern==null?null: pattern.toObject();  
}

export function serializeMaterial(material:Material)
{
  var m={
    ...material,
    pattern: serializePattern(material.pattern)
  };
  return m;
}

export function serializeShape(shape:IShape)
{
  if (shape instanceof Plane)
  {
    let o={id:shape.id, 
      type:shape.constructor.name,
      transform: shape.transform.toArray(),
      material: shape.material.id   };
    return o;
  } else if (shape instanceof Sphere)
  {
    let o={id:shape.id, 
      type:shape.constructor.name,
      transform:shape.transform.toArray(),
      material:shape.material.id };
    return o
  }
  throw new Error();
}
export function serializeArray<T>(arr:T[],callbackfn:(p:T)=>any):any
{
  return arr.map(callbackfn);
}


export function serializeWorld(world:World):any
{
  var shared=new Map<any,any>();
  var materials:any[]=world.objects.map((o)=>serializeMaterial(o.material));


  var o:any={
    light:world.light,
    materials:materials,
    objects: serializeArray(world.objects,serializeShape)
  };  

  return o;
}