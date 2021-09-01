export class Tuple {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    public static EPSILON: number = 0.00001;
    
    constructor()
    constructor(x: number, y: number, z: number, w: number)
    constructor(x?: number, y?: number, z?: number, w?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    public isPoint(): boolean {
        return this.w == 1;
    }
    public isVector(): boolean {
        return this.w == 0;
    }

    public add(tuple: Tuple): Tuple {
        return new Tuple(this.x + tuple.x, this.y + tuple.y, this.z + tuple.z, this.w + tuple.w)
    }
    public multiply(scalar: number): Tuple {
        return new Tuple(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar)
    }
    public divide(scalar: number): Tuple {
        return new Tuple(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar)
    }
    public substract(tuple: Tuple): Tuple {
        return new Tuple(this.x - tuple.x, this.y - tuple.y, this.z - tuple.z, this.w - tuple.w)
    }
    public negate(): Tuple {
        return new Tuple(-this.x, -this.y, -this.z, -this.w)
    }
    public normalize(): Tuple {
        return this.divide(this.magnitude());
    }
    public magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    public dot(tuple: Tuple): number {
        return this.x * tuple.x + this.y * tuple.y + this.z * tuple.z + this.w * tuple.w;
    }
    public cross(tuple: Tuple): Tuple {
        return Tuple.vector(this.y * tuple.z - this.z * tuple.y,
            this.z * tuple.x - this.x * tuple.z,
            this.x * tuple.y - this.y * tuple.x
        );
    }
    
    reflect(normal:Tuple ):Tuple
    {
      return this.substract(normal.multiply(2*this.dot(normal)));
    }
    public equals(tuple: Tuple) {
        return Math.abs(this.x - tuple.x) < Tuple.EPSILON
            && Math.abs(this.y - tuple.y) < Tuple.EPSILON
            && Math.abs(this.z - tuple.z) < Tuple.EPSILON;
    }
    static point(x: number, y: number, z: number): Tuple {
        return new Tuple(x, y, z, 1);
    }
    static vector(x: number, y: number, z: number): Tuple {
        return new Tuple(x, y, z, 0);
    }
    clone(): Tuple {
        return new Tuple(this.x, this.y, this.z, this.w);
    }
}