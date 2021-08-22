import { Tuple } from "raytracer/tuple"


describe('tuple with w==0', () => {
    var tuple = new Tuple(1, 1, 1, 0);
    it('should be a vector', () => {
        expect(tuple.isVector()).toBeTruthy();
    })
    it('should not be a point', () => {
        expect(tuple.isPoint()).toBeFalsy();
    })
}
);
describe('tuple with w==1', () => {
    var tuple = new Tuple(1, 1, 1, 1);
    it('should not be a vector', () => {
        expect(tuple.isVector()).toBeFalsy();
    })
it('should be a point', () => {
        expect(tuple.isPoint()).toBeTruthy();
    })
}
);
test("Constructor", () => {
    expect(new Tuple(4.3, -4.2, 3.1, 0)).toEqual({ x: 4.3, y: -4.2, z: 3.1, w: 0 });
}
);
test("point() creates tuples with w==1", () => {
    expect(Tuple.point(1, 1, 1).w).toBe(1);
}
);
test("vector() creates tuples with w==0", () => {
    expect(Tuple.vector(1, 1, 1).w).toBe(0);
}
);
test("add 2 points", () => {
    expect((new Tuple(3, -2, 5, 1).add(new Tuple(-2, 3, 1, 0)))).toEqual(new Tuple(1, 1, 6, 1));
}
);
test("substract 2 points", () => {
    expect(Tuple.point(3, 2, 1).substract(Tuple.point(5, 6, 7))).toEqual(Tuple.vector(-2, -4, -6));
}
);
test("substract a vector from a point", () => {
    expect(Tuple.point(3, 2, 1).substract(Tuple.vector(5, 6, 7))).toEqual(Tuple.point(-2, -4, -6));
}
);
test("negate", () => {
    expect(new Tuple(1, -2, 3, -4).negate()).toEqual(new Tuple(-1, 2, -3, 4));
}
);
test("multiply", () => {
    expect(new Tuple(1, -2, 3, -4).multiply(3.5)).toEqual(new Tuple(3.5, -7, 10.5, -14));
}
);
test("divide", () => {
    expect(new Tuple(1, -2, 3, -4).divide(2)).toEqual(new Tuple(0.5, -1, 1.5, -2));
}
);
test("magnitude", () => {
    expect(Tuple.vector(1, 2, 3).magnitude()).toBeCloseTo(Math.sqrt(14));
}
);

test("normalize", () => {
    expect(Tuple.vector(1, 2, 3).normalize().equals(Tuple.vector(0.26726, 0.53452, 0.80178))).toBeTruthy();
}
);
test("dot product", () => {
    expect(Tuple.vector(1, 2, 3).dot(Tuple.vector(2, 3, 4))).toBe(20);
}
);
test("cross product", () => {
    var a = Tuple.vector(1, 2, 3);
    var b = Tuple.vector(2, 3, 4);
    expect(a.cross(b)).toEqual(Tuple.vector(-1, 2, -1));
    expect(b.cross(a)).toEqual(Tuple.vector(1, -2, 1));
}
);

test("Reflecting a vector approaching at 45 degree", () => {
    var v = Tuple.vector(1, -1, 0);
    var n = Tuple.vector(0, 1, 0);
    var r = v.reflect(n);
    expect(r.equals(Tuple.vector(1,1,0) ) ).toBeTruthy();
}
);

test("Reflecting a vector off a slanted surface", () => {
    var v = Tuple.vector(0, -1, 0);
    var n = Tuple.vector( Math.sqrt(2)/2 , Math.sqrt(2)/2, 0);
    var r = v.reflect(n);
    expect(r.equals(Tuple.vector(1,0,0) ) ).toBeTruthy();
}
);
