import { Tuple } from "../../raytracer/tuple";
import { Ray } from "../../raytracer/ray";
import { Matrix4x4 } from "../../raytracer/matrix";
test("Constructor",
    () => {
        var origin = Tuple.point(1, 2, 3);
        var direction = Tuple.vector(4, 5, 6);
        var r = new Ray(origin, direction);
        expect(r.origin === origin).toBeTruthy();
        expect(r.direction === direction).toBeTruthy();
    }
);

test("Computing a point from a distance",
    () => {

        var r = new Ray(Tuple.point( 2, 3,4), Tuple.vector(1, 0, 0));
        expect(r.position(0).equals(Tuple.point(2,3,4) )  ).toBeTruthy();
        expect(r.position(1).equals(Tuple.point(3,3,4) )  ).toBeTruthy();
    }
);
test("Translating a ray",
    () => {

        var r = new Ray(Tuple.point( 1,2,3), Tuple.vector(0, 1, 0));
        var m= Matrix4x4.translation(3,4,5);
        var r2=r.transform(m);
        expect(r2.origin.equals(Tuple.point(4,6,8))).toBeTruthy();
        expect(r2.direction.equals(Tuple.vector(0,1,0))).toBeTruthy();
    }
);
test("Scaling a ray",
    () => {

        var r = new Ray(Tuple.point( 1,2,3), Tuple.vector(0, 1, 0));
        var m= Matrix4x4.scaling(2,3,4);
        var r2=r.transform(m);
        expect(r2.origin.equals(Tuple.point(2,6,12))).toBeTruthy();
        expect(r2.direction.equals(Tuple.vector(0,3,0))).toBeTruthy();
    }
);