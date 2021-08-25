import { Color } from "./color";

export class Canvas 
{  
   data:Float64Array;
   width:number;
   height:number;

   constructor(width:number,height:number)
   {
     this.width=width;
     this.height=height;
     this.data = new Float64Array(width*height*3);
     for (var i=0;i<this.data.length;i++)
     {
         this.data[i]=0;
     }
   }

   readPixel(x:number,y:number):Color
   {
     if (x<0|| x>=this.width || y<0 || y>= this.height) throw new RangeError();
     var pixelIndex= Math.floor(y)* this.width*3+Math.floor(x)*3;
     return new Color(this.data[pixelIndex],this.data[pixelIndex +1],this.data[pixelIndex +2]);
   }
   writePixel (x:number,y:number,c:Color):void
   {
     if (x<0|| x>=this.width || y<0 || y>= this.height) return;
     var pixelIndex= Math.floor(y)* this.width*3+Math.floor(x)*3;
     this.data[pixelIndex]=c.red;
     this.data[pixelIndex+1]=c.green;
     this.data[pixelIndex+2]=c.blue;
   }
   toPpm():string
   {
    var ppm="P3\n";
    ppm+=this.width+" "+this.height+"\n";
    ppm+="255";
    for (var i=0;i<this.data.length;i+=3)
    {
        ppm+=(i%15==0) ?  "\n" :" ";
        ppm+= Math.max(Math.min(Math.round(this.data[i]*255),255),0).toString()
            + " "+Math.max(Math.min(Math.round(this.data[i+1]*255),255),0).toString()
            +" "+Math.max(Math.min(Math.round(this.data[i+2]*255),255),0).toString(); 

    }
    ppm+="\n";
    return ppm;
   }
   toUint8ClampedArray():Uint8ClampedArray
   {
     var arr = new Uint8ClampedArray(this.width*this.height*4);
     var arrIndex=0;
     for (var i=0;i<this.data.length;i+=3)
     {        
         arr[arrIndex]= this.data[i]*255;
         arr[arrIndex+1]=  this.data[i+1]*255;
         arr[arrIndex+2]= this.data[i+2]*255;
         arr[arrIndex+3]= 255;
         arrIndex+=4; 
     }
     
     return arr;
   }
}