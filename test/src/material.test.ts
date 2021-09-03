import { Material } from "raytracer/material";
import { Tuple } from "raytracer/tuple";
import { PointLight } from "raytracer/pointLight";
import { Color } from "raytracer/color";
var m:Material;
var position:Tuple;

beforeEach(() => {
     m= new Material();
     position = Tuple.point(0,0,0);
  });

  test("Lighting with the eye between the light and the surface",
  ()=>
  {
    var eyev=Tuple.vector(0,0,-1);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,0,-10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv);
    expect(result.equals(new Color(1.9,1.9,1.9))).toBeTruthy();

  }
  );
  test("Lighting with the eye between the light and the surface, eye offset 45 degree",
  ()=>
  {
    var eyev=Tuple.vector(0,Math.sqrt(2)/2 ,-Math.sqrt(2)/2);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,0,-10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv);
    expect(result.equals(new Color(1,1,1))).toBeTruthy();
    
  }
  );
  test("Lighting with the eye opposite surface, light offset 45 degree",
  ()=>
  {
    var eyev=Tuple.vector(0,0,-1);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,10,-10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv);
    expect(result.equals(new Color(0.7364,0.7364,0.7364))).toBeTruthy();
    
  }
  );
  test("Lighting with the eye in the path of reflection vector",
  ()=>
  {
    var eyev=Tuple.vector(0,-Math.sqrt(2)/2 ,-Math.sqrt(2)/2);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,10,-10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv);
    expect(result.equals(new Color(1.6364,1.6364,1.6364))).toBeTruthy();
    
  }
  );

  test("Lighting with light behind the surface",
  ()=>
  {
    var eyev=Tuple.vector(0,0,-1);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,0,10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv);
    expect(result.equals(new Color(0.1,0.1,0.1))).toBeTruthy();
    
  }
  );

  test("Lighting with the surface in shadow",
  ()=>
  {
    var eyev=Tuple.vector(0,0,-1);
    var normalv=Tuple.vector(0,0,-1);
    var light= new PointLight(Tuple.point(0,0,-10),new Color(1,1,1));
    var result=m.lighting(light,null,position,eyev,normalv,true);
    expect(result.equals(new Color(0.1,0.1,0.1))).toBeTruthy();
    
  }
  );