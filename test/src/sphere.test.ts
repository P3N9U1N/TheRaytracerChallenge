import { Ray } from "../../raytracer/ray";
import { Tuple } from "../../raytracer/tuple";
import { Sphere } from "../../raytracer/sphere";
import { Matrix4x4 } from "../../raytracer/matrix";
test("A ray intersects a sphere at 2 points",
    () => {

        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var s = new Sphere(0);
        var xs= s.intersect(r);
        expect(xs.length==0);
        expect(xs.get(0).t).toBeCloseTo(4);
        expect(xs.get(1).t).toBeCloseTo(6);
    }
);
test("A ray intersects a sphere at a tangent",
    () => {
        var r = new Ray(Tuple.point( 0, 1,-5), Tuple.vector(0, 0, 1));
        var s = new Sphere(0);
        var xs= s.intersect(r);
        expect(xs.length).toBe(2);
        expect(xs.get(0).t).toBeCloseTo(5);
        expect(xs.get(1).t).toBeCloseTo(5);
    }
);
test("A ray misses a sphere",
    () => {
        var r = new Ray(Tuple.point( 0, 2,-5), Tuple.vector(0, 0, 1));
        var s = new Sphere(0);
        var xs= s.intersect(r);
        expect(xs.length).toBe(0);
    }
);
test("A ray originates inside a sphere",
    () => {
        var r = new Ray(Tuple.point( 0, 0,0), Tuple.vector(0, 0, 1));
        var s = new Sphere(0);
        var xs= s.intersect(r);
        expect(xs.length).toBe(2);
        expect(xs.get(0).t).toBeCloseTo(-1);
        expect(xs.get(1).t).toBeCloseTo(1);
    }
);
test("A sphere is behind a ray",
    () => {
        var r = new Ray(Tuple.point( 0, 0,5), Tuple.vector(0, 0, 1));
        var s = new Sphere(0);
        var xs= s.intersect(r);
        expect(xs.length).toBe(2);
        expect(xs.get(0).t).toBeCloseTo(-6);
        expect(xs.get(1).t).toBeCloseTo(-4);
    }
);
test("A spheres default transform transformation",
    () => {        
        var s = new Sphere(0);      
        expect(s.transform.equals(Matrix4x4.IDENTITY_MATRIX)).toBeTruthy();
       
    }
);
test("Intersecting a scaled sphere with a ray",
    () => {        
        var s = new Sphere(0,Matrix4x4.scaling(2,2,2));             
        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var xs= s.intersect(r);
        expect(xs.length).toBe(2);
        expect(xs.get(0).t).toBe(3);
        expect(xs.get(1).t).toBe(7);
    }
);
test("Intersecting a translated sphere with a ray",
    () => {        
        var s = new Sphere(0,Matrix4x4.translation(5,0,0));             
        var r = new Ray(Tuple.point( 0, 0,-5), Tuple.vector(0, 0, 1));
        var xs= s.intersect(r);
        expect(xs.length).toBe(0);
    }
);