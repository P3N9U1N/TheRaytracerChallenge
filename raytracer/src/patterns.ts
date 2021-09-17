import { Color } from "./color";
import { Matrix4x4 } from "./matrix";
import { Tuple } from "./tuple";
import { IShape } from "./world";
import {makeNoise3D} from "fast-simplex-noise"

export abstract class Pattern 
{
    private static tempMatrix1 = new Matrix4x4();

    protected inverseTransform: Matrix4x4;
    private _transform: Matrix4x4;
    /**
     * Transformation matrix. Call setter after change for updating inverse.
     */
    public get transform(): Matrix4x4 {
      return this._transform;
    }
    public set transform(value: Matrix4x4) {
      this._transform = value;
      this.inverseTransform=value.inverse();
    }
    constructor(transform:Matrix4x4)
    {
        this.transform=transform;
    }
     
    patternAtShape(object:IShape,worldPoint:Tuple):Color
    {
      var objectPoint=object.inverseTransform.multiply(worldPoint);
      var patternPoint= this.inverseTransform.multiply(objectPoint);
      return this.patternAt(patternPoint);
    }

    public abstract patternAt(point:Tuple):Color
    public abstract toObject():any
}


export class StripePattern extends Pattern
{

    private colors:Color[];
    
    get a(): Color
    {
        return this.colors[0];
    }
    get b(): Color
    {
        return this.colors[1];
    }

    constructor(a:Color,b:Color ,transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone()) 
    {
        super(transform);
        this.colors=[a,b];        
    }

    patternAt(point:Tuple):Color
    {
      return this.colors[Math.floor(Math.abs(point.x)) %2];
    }
    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,transform:this.transform.toArray() };
    }
}


export class GradientPattern extends Pattern
{

    a: Color;
    b: Color;
    constructor(a:Color,b:Color ,transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone()) 
    {
        super(transform);
        this.a=a;
        this.b=b;       
    }

    patternAt(point:Tuple):Color
    {
      var distance= this.b.substract(this.a);
      var fraction= point.x-Math.floor(point.x);
      return this.a.add(distance.multiply(fraction));
    }
    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,transform:this.transform.toArray()};
    }

}

export class RingPattern extends Pattern
{

    a: Color;
    b: Color;
    constructor(a:Color,b:Color ,transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone()) 
    {
        super(transform);
        this.a=a;
        this.b=b;       
    }

    patternAt(point:Tuple):Color
    {      
      return (Math.floor(Math.sqrt(point.x*point.x+point.z*point.z)) %2 ==0) ? this.a:this.b;
    }

    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,transform:this.transform.toArray()};
    }
}

export class Checker3dPattern extends Pattern
{

    a: Color;
    b: Color;
    constructor(a:Color,b:Color ,transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone()) 
    {
        super(transform);
        this.a=a;
        this.b=b;       
    }

    patternAt(point:Tuple):Color
    { 
      return ((Math.floor(point.x) +Math.floor(point.y) +Math.floor(point.z)) % 2 ==0) ? this.a:this.b;
    }
    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,transform:this.transform.toArray()};
    }
}

export class Checker3DPattern4Sphere extends Pattern
{

    a: Color;
    b: Color;
    uvScale: number;
   
    constructor(a:Color,b:Color,transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone(),uvScale:number=1) 
    {
        super(transform);
        this.a=a;
        this.b=b;     
        this.uvScale=uvScale;
    }

    patternAt(point:Tuple):Color
    {      

      var tu = Math.atan2(point.x,point.z)/Math.PI /2 *this.uvScale;  
      var tv = point.y /2 *this.uvScale;
      return (((Math.floor( tu) +Math.floor(tv)) ) %2 ==0) ? this.a:this.b;
    }
    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,uvScale:this.uvScale,transform:this.transform.toArray()};
    }
}


export class PerlinPattern extends Pattern
{
    a: Color;
    b: Color;
    private noise3d: (x: number, y: number, z: number) => number;
    threshold: number;
    private seed: number;
   
    constructor(a:Color,b:Color,threshold:number=0.5,seed=Math.random(), transform:Matrix4x4= Matrix4x4.IDENTITY_MATRIX.clone()) 
    {
        super(transform);
        this.a=a;
        this.b=b; 
        this.noise3d=makeNoise3D(()=>this.seed);
        this.threshold=threshold;
        this.seed=seed;
    }

    patternAt(point:Tuple):Color
    { 
      return this.noise3d(point.x,point.y,point.z)>this.threshold ? this.a:this.b;
    }

    toObject() {
      return { type:this.constructor.name, a:this.a,b:this.b,threshold:this.threshold,seed:this.seed,transform:this.transform.toArray()};
    }
}

export class CompositePattern extends Pattern
{

   
    constructor(public pattern1:Pattern, public pattern2:Pattern) 
    {
        super(Matrix4x4.IDENTITY_MATRIX.clone());
    }

    patternAtShape(object:IShape,worldPoint:Tuple):Color
    {
      var objectPoint=object.inverseTransform.multiply(worldPoint);
      var patternPoint= this.inverseTransform.multiply(objectPoint);

      return this.pattern1.patternAtShape(object,worldPoint).add(this.pattern2.patternAtShape(object,worldPoint)).multiply(0.5);
      
    }

    patternAt(point:Tuple):Color
    { 
      return null;
    }

    toObject() {
      return { type:this.constructor.name, pattern1:this.pattern1.toObject(),pattern2:this.pattern2.toObject()};
    }
}