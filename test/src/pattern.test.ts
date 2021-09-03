import { Color } from "raytracer/color";
import { Matrix4x4 } from "raytracer/matrix";
import { Pattern } from "raytracer/patterns";
import { Sphere } from "raytracer/sphere";
import { Tuple } from "raytracer/tuple";

class TestPattern extends Pattern
{
    protected patternAt(point: Tuple): Color {
       return new Color(point.x,point.y,point.z);
    }

}

test("A pattern with an object transformation",
() => {

    var shape = new Sphere(1,Matrix4x4.scaling(2,2,2));

    var pattern = new TestPattern(Matrix4x4.IDENTITY_MATRIX.clone());
    var c= pattern.patternAtShape(shape,Tuple.point(2,3,4));
   
    expect(c.equals(new Color(1,1.5,2))).toBeTruthy();
}
);

test("A pattern with a pattern transformation",
() => {

    var shape = new Sphere(1);

    var pattern = new TestPattern(Matrix4x4.scaling(2,2,2));
    var c= pattern.patternAtShape(shape,Tuple.point(2,3,4));
   
    expect(c.equals(new Color(1,1.5,2))).toBeTruthy();
}
);

test("A pattern with both an object and a pattern transformation",
() => {

    var shape = new Sphere(1,Matrix4x4.scaling(2,2,2));

    var pattern = new TestPattern(Matrix4x4.translation(0.5,1,1.5));
    var c= pattern.patternAtShape(shape,Tuple.point(2.5,3,3.5));
   
    expect(c.equals(new Color(0.75,0.5,0.25))).toBeTruthy();
}
);
