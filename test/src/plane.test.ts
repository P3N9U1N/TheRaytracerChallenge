import { Plane } from "raytracer/plane";
import { Ray } from "raytracer/ray";
import { Tuple } from "raytracer/tuple";

test("Intersect a ray parallel to the plane",
() => {

    var p = new  Plane(0);
    var r = new Ray(Tuple.point(0,10,0),Tuple.vector(0,0,1));
    var xs= p.localIntersect(r);
    expect(xs.length).toBe(0);
}
);

test("Intersect with a coplanar ray",
() => {

    var p = new  Plane(0);
    var r = new Ray(Tuple.point(0,0,0),Tuple.vector(0,0,1));
    var xs= p.localIntersect(r);
    expect(xs.length).toBe(0);
}
);
test("A ray intersecting a plane from above",
() => {

    var p = new  Plane(0);
    var r = new Ray(Tuple.point(0,1,0),Tuple.vector(0,-1,0));
    var xs= p.localIntersect(r);
    expect(xs.length).toBe(1);
    expect(xs.get(0).t).toBe(1);
}
);
test("A ray intersecting a plane from below",
() => {

    var p = new  Plane(0);
    var r = new Ray(Tuple.point(0,-1,0),Tuple.vector(0,1,0));
    var xs= p.localIntersect(r);
    expect(xs.length).toBe(1);
    expect(xs.get(0).t).toBe(1);
}
);