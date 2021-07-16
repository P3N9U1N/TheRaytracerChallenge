import { Color } from "../../raytracer/src/color";

test("Constructor", () => {
    expect(new Color(-0.5, 0.4, 1.7)).toEqual({ red: -0.5, green: 0.4, blue: 1.7 });
}
);

test("add 2 colors", () => {
    expect((new Color(0.9, 0.6, 0.75 ).add(new Color(0.7, 0.1, 0.25)).equals(new Color(1.6, 0.7, 1.0)))).toBeTruthy();
}
);
test("substract 2 colors", () => {
    expect((new Color(0.9, 0.6, 0.75).substract(new Color(0.7, 0.1, 0.25)).equals(new Color(0.2, 0.5, 0.5)))).toBeTruthy();
}
);

test("multiply", () => {
    expect(new Color(0.2, 0.3, 0.4).multiply(2).equals(new Color(0.4, 0.6, 0.8))).toBeTruthy();
});

test("multiply 2 colors", () => {
    expect(new Color(1, 0.2, 0.4).hadamardProduct(new Color(0.9,1,0.1)).equals(new Color(0.9, 0.2, 0.04))).toBeTruthy();
});