import { EPSILON } from "./constants";
import { Tuple } from "./tuple";

export class Matrix {   
    protected data: Float64Array;
    
   
    public readonly width: number;
    public readonly height: number;

    constructor(matrix: Array<Array<number>>)
    constructor(width: number, height: number)
    constructor(a: any, b?: any) {
        if (b === undefined) {
            var matrix = a as Array<Array<number>>;
            if (matrix.length==0 || matrix[0].length==0) throw new Error();
            this.width=matrix[0].length;
            this.height=matrix.length;
            var data = new Float64Array( this.width*this.height);
            for (var y = 0; y < this.height; y++) {
                var row = matrix[y];
                for (var x=0;x< this.width;x++)
                {
                   var value= row[x];
                   if (value!==undefined)
                   {
                       data[this.width*y+x]=value;
                   }
                }
                
            }
            this.data = data;
        } else {
            this.width = a as number;
            this.height = b as number;
            this.data = new Float64Array(this.width*this.height);
        }
    }
    cofactor(row:number,column:number):number
    {
       return ((row+column) % 2 *2 -1)* -this.minor(row,column);
    }
    minor(row:number,column:number):number
    {   
        var m= this.submatrix(row,column);        
        return m.determinant(); 
    }
    isInvertible():boolean
    {
     return this.determinant()!=0;
    }
   
    determinant():number
    {
        if (this.width!=this.height) throw new Error();
        if (this.width==2) return Matrix2x2.prototype.determinant.call(this);
        var det=0;
        for (var x=0;x<this.width;x++)
        {
         det+= this.data[x]*this.cofactor(0,x);
        }
        return det;
    }
    toString(): string {
        var string = "";
        for (var y = 0; y < this.height; y++) { 
            string += "|"   
            for (var x=0;x< this.width;x++)
            {
                string +=  this.data[this.width*y+x].toFixed(2)+"\t|";   
            }
            string +=  "\n";   
            
        }

        return string;
    }

    get(row: number, column: number) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0) throw new RangeError();
        return this.data[this.width*row+column] ;
    }

    set(row: number, column: number, value: number) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0) throw new RangeError();
        this.data[this.width*row+column] = value;
    }
    

    multiply(matrix: Matrix): Matrix
    {     
           
        if (matrix.height != this.height) throw new Error();
        var m = new Matrix(matrix.width, matrix.height);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = 0; x < matrix.width; x++) {
                var sum = 0;
                for (var r = 0; r < matrix.height; r++) {
                    sum += matrix.data[this.width*r+x] * this.data[this.width*y+r];
                }
                m.data[this.width*y+x] = sum;
            }
        }
        return m;
    }

    transpose() :Matrix
    {
        var matrix= new Matrix(this.height,this.width);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = y; x < matrix.width; x++) {
                var index=this.width*y+x;
                var indexTransposed=this.width*x+y;                           
                matrix.data[index] = this.data[indexTransposed];
                matrix.data[indexTransposed] = this.data[index];
            }
        }
        return matrix;
    }
    

    submatrix(row:number,column:number):Matrix
    {
        var m= new Matrix(this.width-1,this.height-1);       
        var y2=0;        
        for (var y = 0; y < this.height; y++) {
            if (y==row)
            {
                continue;
            }
            var x2=0;
            for (var x = 0; x < this.width; x++) {
                if (x==column)
                {
                    continue;
                }
                m.data[m.width*y2+x2]=this.data[this.width*y+x];
                x2++;
            }
            y2++;
        }
        return m;
    }
 

    equals(matrix: Matrix): boolean {
        if (this.width != matrix.width || this.height != matrix.height) return false;
        for (var i = 0; i < this.data.length; i++) {
           {
                var diff= Math.abs(this.data[i] - matrix.data[i]);
                if (diff >= EPSILON) return false;
            }

        }
        return true;
    }
}

export class Matrix4x4 extends Matrix
{
    public static readonly IDENTITY_MATRIX =new Matrix4x4(
        [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1]
        ]
    );
    private static tempMatrix4x4= new Matrix4x4();

    public static viewTransform(from:Tuple,to:Tuple,up:Tuple ,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {
        var forward=to.substract(from).normalize();
        var upn= up.normalize();
        var left =forward.cross(upn);
        var trueUp=left.cross(forward);
        target.data[0]=left.x;
        target.data[1]=left.y;
        target.data[2]=left.z;


        target.data[4]=trueUp.x;
        target.data[5]=trueUp.y;
        target.data[6]=trueUp.z;


        target.data[8]=-forward.x;
        target.data[9]=-forward.y;
        target.data[10]=-forward.z;

        target.data[15]=1;
        
        Matrix4x4.translation(-from.x,-from.y,-from.z, Matrix4x4.tempMatrix4x4);

        target.multiply(Matrix4x4.tempMatrix4x4,target);
        return target;
    }


    public static translation(x:number,y:number,z:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {
        target.data[0]=1;
        target.data[4]=0;
        target.data[8]=0;
        target.data[12]=0;

        target.data[1]=0;
        target.data[5]=1;
        target.data[9]=0;
        target.data[13]=0;

        target.data[2]=0;
        target.data[6]=0;
        target.data[10]=1;
        target.data[14]=0;

        target.data[3]=x;
        target.data[7]=y;
        target.data[11]=z;
        target.data[15]=1;
        return target;
    }
    public static rotationX(radians:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {       
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        target.data[0]=1;
        target.data[4]=0;
        target.data[8]=0;
        target.data[12]=0;

        target.data[1]=0;
        target.data[5]=cos;
        target.data[9]=sin;
        target.data[13]=0;

        target.data[2]=0;
        target.data[6]=-sin;
        target.data[10]=cos;
        target.data[14]=0;

        target.data[3]=0;
        target.data[7]=0;
        target.data[11]=0;
        target.data[15]=1;
        return target;
    }
    public static rotationY(radians:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {       
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        target.data[0]=cos;
        target.data[4]=0;
        target.data[8]=-sin;
        target.data[12]=0;

        target.data[1]=0;
        target.data[5]=1;
        target.data[9]=0;
        target.data[13]=0;

        target.data[2]=sin;
        target.data[6]=0;
        target.data[10]=cos;
        target.data[14]=0;

        target.data[3]=0;
        target.data[7]=0;
        target.data[11]=0;
        target.data[15]=1;
        return target;
    }
    public static rotationZ(radians:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {        
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        target.data[0]=cos;
        target.data[4]=sin;
        target.data[8]=0;
        target.data[12]=0;

        target.data[1]=-sin;
        target.data[5]=cos;
        target.data[9]=0;
        target.data[13]=0;

        target.data[2]=0;
        target.data[6]=0;
        target.data[10]=1;
        target.data[14]=0;

        target.data[3]=0;
        target.data[7]=0;
        target.data[11]=0;
        target.data[15]=1;
        return target;
    }
    public static scaling(x:number,y:number,z:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {        
        target.data[0]=x;
        target.data[4]=0;
        target.data[8]=0;
        target.data[12]=0;

        target.data[1]=0;
        target.data[5]=y;
        target.data[9]=0;
        target.data[13]=0;

        target.data[2]=0;
        target.data[6]=0;
        target.data[10]=z;
        target.data[14]=0;

        target.data[3]=0;
        target.data[7]=0;
        target.data[11]=0;
        target.data[15]=1;
        return target;
    }
    public static shearing(xy:number,xz:number,yx:number,yz:number,zx:number,zy:number,target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {       
        target.data[0]=1;
        target.data[4]=yx;
        target.data[8]=zx;
        target.data[12]=0;

        target.data[1]=xy;
        target.data[5]=1;
        target.data[9]=zy;
        target.data[13]=0;

        target.data[2]=xz;
        target.data[6]=yz;
        target.data[10]=1;
        target.data[14]=0;

        target.data[3]=0;
        target.data[7]=0;
        target.data[11]=0;
        target.data[15]=1;
        return target;
    }


    constructor(matrix?: Array<Array<number>>) 
    {
        if (matrix !== undefined) {
        
         if (matrix.length!=4 || matrix[0].length!=4 || matrix[1].length!=4 || matrix[2].length!=4 || matrix[3].length!=4)
         {
             throw new Error();
         }
          super(matrix); 
        } else {
          super(4 ,4);
        }
    }
    transpose(target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {
        var swap:number;      
        target.data[0] = this.data[0];
        swap=  this.data[1];
        target.data[1] = this.data[4];
        target.data[4] = swap;
        swap=  this.data[2];
        target.data[2] = this.data[8];
        target.data[8] = swap;
        swap=  this.data[3];
        target.data[3] = this.data[12];
        target.data[12] = swap;
        target.data[5] = this.data[5];
        swap=  this.data[6];
        target.data[6] = this.data[9];
        target.data[9] = swap;
        swap=  this.data[7];
        target.data[7] = this.data[13];
        target.data[13] = swap;
        target.data[10] = this.data[10];
        swap=  this.data[11];
        target.data[11] = this.data[14];
        target.data[14] = swap;
        target.data[15] = this.data[15];
        return target;
    }

    inverse(target:Matrix4x4 =new Matrix4x4()):Matrix4x4
    {       
        var a00=this.data[0];
        var a01=this.data[1];
        var a02=this.data[2];
        var a03=this.data[3];
        var a10=this.data[4];
        var a11=this.data[5];
        var a12=this.data[6];
        var a13=this.data[7];
        var a20=this.data[8];
        var a21=this.data[9];
        var a22=this.data[10];
        var a23=this.data[11];
        var a30=this.data[12];
        var a31=this.data[13];
        var a32=this.data[14];
        var a33=this.data[15];
        var determinant= (a00*(a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))+
                        a01*-(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))+
                        a02*(a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))+
                        a03*-(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30)));   
        if (determinant==0) return null;               

        target.data[0]= (a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))/determinant;
        target.data[1]= -(a01*(a22*a33-a23*a32)+a02*-(a21*a33-a23*a31)+a03*(a21*a32-a22*a31))/determinant;
        target.data[2]= (a01*(a12*a33-a13*a32)+a02*-(a11*a33-a13*a31)+a03*(a11*a32-a12*a31))/determinant;
        target.data[3]= -(a01*(a12*a23-a13*a22)+a02*-(a11*a23-a13*a21)+a03*(a11*a22-a12*a21))/determinant;
        target.data[4]= -(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))/determinant;
        target.data[5]= (a00*(a22*a33-a23*a32)+a02*-(a20*a33-a23*a30)+a03*(a20*a32-a22*a30))/determinant;
        target.data[6]= -(a00*(a12*a33-a13*a32)+a02*-(a10*a33-a13*a30)+a03*(a10*a32-a12*a30))/determinant;
        target.data[7]= (a00*(a12*a23-a13*a22)+a02*-(a10*a23-a13*a20)+a03*(a10*a22-a12*a20))/determinant;
        target.data[8]= (a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))/determinant;
        target.data[9]= -(a00*(a21*a33-a23*a31)+a01*-(a20*a33-a23*a30)+a03*(a20*a31-a21*a30))/determinant;
        target.data[10]= (a00*(a11*a33-a13*a31)+a01*-(a10*a33-a13*a30)+a03*(a10*a31-a11*a30))/determinant;
        target.data[11]= -(a00*(a11*a23-a13*a21)+a01*-(a10*a23-a13*a20)+a03*(a10*a21-a11*a20))/determinant;
        target.data[12]= -(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30))/determinant;
        target.data[13]= (a00*(a21*a32-a22*a31)+a01*-(a20*a32-a22*a30)+a02*(a20*a31-a21*a30))/determinant;
        target.data[14]= -(a00*(a11*a32-a12*a31)+a01*-(a10*a32-a12*a30)+a02*(a10*a31-a11*a30))/determinant;
        target.data[15]= (a00*(a11*a22-a12*a21)+a01*-(a10*a22-a12*a20)+a02*(a10*a21-a11*a20))/determinant;
        return target;
        
    }
    determinant()
    { 
        var a00=this.data[0];
        var a01=this.data[1];
        var a02=this.data[2];
        var a03=this.data[3];
        var a10=this.data[4];
        var a11=this.data[5];
        var a12=this.data[6];
        var a13=this.data[7];
        var a20=this.data[8];
        var a21=this.data[9];
        var a22=this.data[10];
        var a23=this.data[11];
        var a30=this.data[12];
        var a31=this.data[13];
        var a32=this.data[14];
        var a33=this.data[15];
        return (a00*(a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))+
                a01*-(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))+
                a02*(a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))+
                a03*-(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30)));        
    }
    
    assign(matrix:Matrix4x4)
    {
        this.data[0]= matrix.data[0];
        this.data[1]= matrix.data[1];
        this.data[2]= matrix.data[2];
        this.data[3]= matrix.data[3];
        this.data[4]= matrix.data[4];
        this.data[5]= matrix.data[5];
        this.data[6]= matrix.data[6];
        this.data[7]= matrix.data[7];
        this.data[8]= matrix.data[8];
        this.data[9]= matrix.data[9];
        this.data[10]= matrix.data[10];
        this.data[11]= matrix.data[11];
        this.data[12]= matrix.data[12];
        this.data[13]= matrix.data[13];
        this.data[14]= matrix.data[14];
        this.data[15]= matrix.data[15];
    }

    clone():Matrix4x4
    {
        var m = new Matrix4x4();
        m.data[0]=this.data[0];
        m.data[1]=this.data[1];
        m.data[2]=this.data[2];
        m.data[3]=this.data[3];
        m.data[4]=this.data[4];
        m.data[5]=this.data[5];
        m.data[6]=this.data[6];
        m.data[7]=this.data[7];
        m.data[8]=this.data[8];
        m.data[9]=this.data[9];
        m.data[10]=this.data[10];
        m.data[11]=this.data[11];
        m.data[12]=this.data[12];
        m.data[13]=this.data[13];
        m.data[14]=this.data[14];
        m.data[15]=this.data[15];
        return m;
    }


    multiply(tuple: Tuple): Tuple
    multiply(matrix: Matrix4x4,target?:Matrix4x4): Matrix4x4
    multiply(a:any,b?:any):any
    {
      if (a instanceof Matrix4x4)
      {
        var target =  b ??  new Matrix4x4();
        if (matrix===this) throw new Error();
        var matrix= a as Matrix4x4;
        var a00=this.data[0];
        var a01=this.data[1];
        var a02=this.data[2];
        var a03=this.data[3];
        var a10=this.data[4];
        var a11=this.data[5];
        var a12=this.data[6];
        var a13=this.data[7];
        var a20=this.data[8];
        var a21=this.data[9];
        var a22=this.data[10];
        var a23=this.data[11];
        var a30=this.data[12];
        var a31=this.data[13];
        var a32=this.data[14];
        var a33=this.data[15];

        target.data[0]=matrix.data[0]* a00+matrix.data[4]* a01+matrix.data[8]* a02+matrix.data[12]* a03;
        target.data[1]=matrix.data[1]* a00+matrix.data[5]* a01+matrix.data[9]* a02+matrix.data[13]* a03;
        target.data[2]=matrix.data[2]* a00+matrix.data[6]* a01+matrix.data[10]* a02+matrix.data[14]* a03;
        target.data[3]=matrix.data[3]* a00+matrix.data[7]* a01+matrix.data[11]* a02+matrix.data[15]* a03;
        target.data[4]=matrix.data[0]* a10+matrix.data[4]* a11+matrix.data[8]* a12+matrix.data[12]* a13;
        target.data[5]=matrix.data[1]* a10+matrix.data[5]* a11+matrix.data[9]* a12+matrix.data[13]* a13;
        target.data[6]=matrix.data[2]* a10+matrix.data[6]* a11+matrix.data[10]* a12+matrix.data[14]* a13;
        target.data[7]=matrix.data[3]* a10+matrix.data[7]* a11+matrix.data[11]* a12+matrix.data[15]* a13;
        target.data[8]=matrix.data[0]* a20+matrix.data[4]* a21+matrix.data[8]* a22+matrix.data[12]* a23;
        target.data[9]=matrix.data[1]* a20+matrix.data[5]* a21+matrix.data[9]* a22+matrix.data[13]* a23;
        target.data[10]=matrix.data[2]* a20+matrix.data[6]* a21+matrix.data[10]* a22+matrix.data[14]* a23;
        target.data[11]=matrix.data[3]* a20+matrix.data[7]* a21+matrix.data[11]* a22+matrix.data[15]* a23;
        target.data[12]=matrix.data[0]* a30+matrix.data[4]* a31+matrix.data[8]* a32+matrix.data[12]* a33;
        target.data[13]=matrix.data[1]* a30+matrix.data[5]* a31+matrix.data[9]* a32+matrix.data[13]* a33;
        target.data[14]=matrix.data[2]* a30+matrix.data[6]* a31+matrix.data[10]* a32+matrix.data[14]* a33;
        target.data[15]=matrix.data[3]* a30+matrix.data[7]* a31+matrix.data[11]* a32+matrix.data[15]* a33;
        

        return target;
      } else if (a instanceof Tuple)
      {
        var t= a as Tuple;
        return new Tuple( 
         this.data[0]*t.x + this.data[1]*t.y+this.data[2]*t.z+this.data[3]*t.w,
         this.data[4]*t.x + this.data[5]*t.y+this.data[6]*t.z+this.data[7]*t.w, 
         this.data[8]*t.x + this.data[9]*t.y+this.data[10]*t.z+this.data[11]*t.w,
         this.data[12]*t.x + this.data[13]*t.y+this.data[14]*t.z+this.data[15]*t.w
           );
      } else
      {
          //a instanceof Matrix (not supported)
          throw new Error();
      }
    }

}

export class Matrix2x2 extends Matrix
{   

    constructor(matrix?: Array<Array<number>>) 
    {
        if (matrix !== undefined) {
        
         if (matrix.length!=2 || matrix[0].length!=2 || matrix[1].length!=2 )
         {
             throw new Error();
         }
          super(matrix); 
        } else {
          super(2 ,2);
        }
    }
    determinant():number
    {
      return this.data[0]*this.data[3]-this.data[1]*this.data[2];
    }
}

export class Matrix3x3 extends Matrix
{   

    constructor(matrix?: Array<Array<number>>) 
    {
        if (matrix !== undefined) {
        
         if (matrix.length!=3 || matrix[0].length!=3 || matrix[1].length!=3 || matrix[2].length!=3)
         {
             throw new Error();
         }
          super(matrix); 
        } else {
          super(3 ,3);
        }
    }

   
    determinant():number
    {
        var a10=this.data[3];
        var a11=this.data[4];
        var a12=this.data[5];
        var a20=this.data[6];
        var a21=this.data[7];
        var a22=this.data[8];
        
        return (this.data[0]*(a11*a22-a12*a21)+this.data[1]*-(a10*a22-a12*a20)+this.data[2]*(a10*a21-a11*a20));
    }

}