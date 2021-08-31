import { Canvas } from "./canvas";
import { Matrix4x4 } from "./matrix";
import { Ray } from "./ray";
import { Tuple } from "./tuple";
import { World } from "./world";

export class Camera
{
  vsize:number;
  hsize:number;
  fieldOfView:number;

  private _halfWidth: number;
  public get halfWidth(): number {
    return this._halfWidth;
  }

  private _halfHeight: number;
  public get halfheight(): number {
    return this._halfWidth;
  }

  private _pixelSize: number;
  public get pixelSize(): number {
    return this._pixelSize;
  }

  private inverseTransform: Matrix4x4; 
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

  constructor(hsize:number,vsize:number, fieldOfView:number,transform?:Matrix4x4)  
  {
      this.hsize=hsize;
      this.vsize=vsize;
      this.fieldOfView=fieldOfView;
      this.transform= transform ?? Matrix4x4.IDENTITY_MATRIX.clone();
      this.update();
      
  }
  
  /**
   * recalculate derived values
   */
  update()
  {
    var halfView=Math.tan(this.fieldOfView/2);
    var aspect=this.hsize/this.vsize;
    if (aspect >=1)
    {
      this._halfWidth=halfView;
      this._halfHeight=halfView/aspect;
    } else
    {
      this._halfWidth=halfView*aspect;
      this._halfHeight=halfView;
    }
    this._pixelSize=(this._halfWidth*2) /this.hsize;
    
  }
  
  rayForPixel(x:number,y:number):Ray
  {

    var xOffset=(x+0.5)*this._pixelSize;
    var yOffset=(y+0.5)*this._pixelSize;

    var worldX=this._halfWidth-xOffset;
    var worldY=this._halfHeight-yOffset;
    
    var pixel=this.inverseTransform.multiply(Tuple.point(worldX,worldY,-1));
    var origin= this.inverseTransform.multiply(Tuple.point(0,0,0));
    var direction=pixel.substract(origin).normalize();

    return new Ray(origin,direction);
  }

  render(world:World):Canvas
  {
    var image = new Canvas(this.hsize,this.vsize);
    for (var y= 0;y< this.vsize;y++)
    {
      for (var x= 0;x< this.hsize;x++)
      {
        var ray = this.rayForPixel(x,y);
        var color= world.colorAt(ray);
        image.writePixel(x,y,color);
      }
    }
    return image;
  }

}