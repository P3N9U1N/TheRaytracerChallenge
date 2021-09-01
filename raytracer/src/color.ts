import { EPSILON } from "./constants";

export class Color {
    public red: number;
    public green: number;
    public blue: number;  

    public static readonly BLACK= Object.freeze(new Color(0,0,0));
    public static readonly WHITE= Object.freeze(new Color(1,1,1));
    constructor()
    constructor(red: number, green: number, blue: number)
    constructor(red?: number, green?: number, blue?: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;        
    }


    public add(color: Color): Color {
        return new Color(this.red + color.red, this.green + color.green, this.blue + color.blue)
    }
    public multiply(scalar: number): Color {
        return new Color(this.red * scalar, this.green * scalar, this.blue * scalar)
    }
    public divide(scalar: number): Color {
        return new Color(this.red / scalar, this.green / scalar, this.blue / scalar)
    }
    public substract(color: Color): Color {
        return new Color(this.red - color.red, this.green - color.green, this.blue - color.blue)
    }
    public hadamardProduct(color:Color)
    {
        return new Color(this.red*color.red,this.green*color.green,this.blue*color.blue);
    }

    public equals(color: Color) {
        return Math.abs(this.red - color.red) < EPSILON
            && Math.abs(this.green - color.green) < EPSILON
            && Math.abs(this.blue - color.blue) < EPSILON;
    }
    clone()
    {
        return new Color(this.red,this.green,this.blue);
    }
}