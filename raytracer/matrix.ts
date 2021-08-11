import { Tuple } from "./tuple";

export class Matrix {
    private static EPSILON: number = 0.00001;
    protected data: Array<Array<number>>;
    
   
    public readonly width: number;
    public readonly height: number;

    constructor(matrix: Array<Array<number>>)
    constructor(width: number, height: number)
    constructor(a: any, b?: any) {
        if (b === undefined) {
            var matrix = a as Array<Array<number>>;
            var data = new Array<Array<number>>(matrix.length);
            for (var y = 0; y < matrix.length; y++) {
                var row = matrix[y];
                if (row.length != matrix[0].length) throw new Error();
                data[y] = row.slice();
            }
            this.data = data;
            this.width = matrix[0].length;
            this.height = matrix.length;
        } else {
            this.width = a as number;
            this.height = b as number;
            this.data = new Array<Array<number>>(this.width);
            for (var y = 0; y < this.height; y++) {
                this.data[y] = new Array<number>(this.width);
            }
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
         det+= this.data[0][x]*this.cofactor(0,x);
        }
        return det;
    }
    toString(): string {
        var string = "";
        for (var y = 0; y < this.data.length; y++) {
            string += "|" + this.data[y].join("\t|") + "\t|\n";

        }
        return string;
    }

    get(row: number, column: number) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0) throw new RangeError();
        return this.data[row][column] ?? NaN;
    }

    set(row: number, column: number, value: number) {
        if (row >= this.height || column >= this.width || row < 0 || column < 0) throw new RangeError();
        this.data[row][column] = value;
    }
    

    multiply(matrix: Matrix): Matrix
    {     
           
        if (matrix.height != this.height) throw new Error();
        var m = new Matrix(matrix.width, matrix.height);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = 0; x < matrix.width; x++) {
                var sum = 0;
                for (var r = 0; r < matrix.height; r++) {
                    sum += matrix.data[r][x] * this.data[y][r];
                }
                m.data[y][x] = sum;
            }
        }
        return m;
    }

    transpose() :Matrix
    {
        var matrix= new Matrix(this.height,this.width);
        for (var y = 0; y < matrix.height; y++) {
            for (var x = y; x < matrix.width; x++) {
                var swap=  this.data[y][x];                
                matrix.data[y][x] = this.data[x][y];
                matrix.data[x][y] = swap;
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
            var r = this.data[y];
            var r2= m.data[y2];  
            var x2=0;
            for (var x = 0; x < r.length; x++) {
                if (x==column)
                {
                    continue;
                }
                r2[x2]=r[x];
                x2++;
            }
            y2++;
        }
        return m;
    }
 

    equals(matrix: Matrix): boolean {
        if (this.width != matrix.width || this.height != matrix.height) return false;
        for (var y = 0; y < this.height; y++) {
            var row = this.data[y];
            var row2 = matrix.data[y];
            for (var x = 0; x < row.length; x++) {
                var diff= Math.abs(row[x] - row2[x]);
                if (Number.isNaN(diff) || diff >= Matrix.EPSILON) return false;
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

    public static translation(x:number,y:number,z:number):Matrix4x4
    {
        var m = new Matrix4x4();
        m.data[0][0]=1;
        m.data[1][0]=0;
        m.data[2][0]=0;
        m.data[3][0]=0;

        m.data[0][1]=0;
        m.data[1][1]=1;
        m.data[2][1]=0;
        m.data[3][1]=0;

        m.data[0][2]=0;
        m.data[1][2]=0;
        m.data[2][2]=1;
        m.data[3][2]=0;

        m.data[0][3]=x;
        m.data[1][3]=y;
        m.data[2][3]=z;
        m.data[3][3]=1;
        return m;
    }
    public static rotationX(radians:number):Matrix4x4
    {
        var m = new Matrix4x4();
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        m.data[0][0]=1;
        m.data[1][0]=0;
        m.data[2][0]=0;
        m.data[3][0]=0;

        m.data[0][1]=0;
        m.data[1][1]=cos;
        m.data[2][1]=sin;
        m.data[3][1]=0;

        m.data[0][2]=0;
        m.data[1][2]=-sin;
        m.data[2][2]=cos;
        m.data[3][2]=0;

        m.data[0][3]=0;
        m.data[1][3]=0;
        m.data[2][3]=0;
        m.data[3][3]=1;
        return m;
    }
    public static rotationY(radians:number):Matrix4x4
    {
        var m = new Matrix4x4();
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        m.data[0][0]=cos;
        m.data[1][0]=0;
        m.data[2][0]=-sin;
        m.data[3][0]=0;

        m.data[0][1]=0;
        m.data[1][1]=1;
        m.data[2][1]=0;
        m.data[3][1]=0;

        m.data[0][2]=sin;
        m.data[1][2]=0;
        m.data[2][2]=cos;
        m.data[3][2]=0;

        m.data[0][3]=0;
        m.data[1][3]=0;
        m.data[2][3]=0;
        m.data[3][3]=1;
        return m;
    }
    public static rotationZ(radians:number):Matrix4x4
    {
        var m = new Matrix4x4();
        var cos=Math.cos(radians);
        var sin= Math.sin(radians);
        m.data[0][0]=cos;
        m.data[1][0]=sin;
        m.data[2][0]=0;
        m.data[3][0]=0;

        m.data[0][1]=-sin;
        m.data[1][1]=cos;
        m.data[2][1]=0;
        m.data[3][1]=0;

        m.data[0][2]=0;
        m.data[1][2]=0;
        m.data[2][2]=1;
        m.data[3][2]=0;

        m.data[0][3]=0;
        m.data[1][3]=0;
        m.data[2][3]=0;
        m.data[3][3]=1;
        return m;
    }
    public static scaling(x:number,y:number,z:number):Matrix4x4
    {
        var m = new Matrix4x4();
        m.data[0][0]=x;
        m.data[1][0]=0;
        m.data[2][0]=0;
        m.data[3][0]=0;

        m.data[0][1]=0;
        m.data[1][1]=y;
        m.data[2][1]=0;
        m.data[3][1]=0;

        m.data[0][2]=0;
        m.data[1][2]=0;
        m.data[2][2]=z;
        m.data[3][2]=0;

        m.data[0][3]=0;
        m.data[1][3]=0;
        m.data[2][3]=0;
        m.data[3][3]=1;
        return m;
    }
    public static shearing(xy:number,xz:number,yx:number,yz:number,zx:number,zy:number):Matrix4x4
    {
        var m = new Matrix4x4();
        m.data[0][0]=1;
        m.data[1][0]=yx;
        m.data[2][0]=zx;
        m.data[3][0]=0;

        m.data[0][1]=xy;
        m.data[1][1]=1;
        m.data[2][1]=zy;
        m.data[3][1]=0;

        m.data[0][2]=xz;
        m.data[1][2]=yz;
        m.data[2][2]=1;
        m.data[3][2]=0;

        m.data[0][3]=0;
        m.data[1][3]=0;
        m.data[2][3]=0;
        m.data[3][3]=1;
        return m;
    }
    constructor(matrix: Array<Array<number>>)
    constructor()
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
    transpose():Matrix4x4
    {
        var swap:number;
        var matrix=new Matrix4x4();
        swap=  this.data[0][0];
        matrix.data[0][0] = this.data[0][0];
        matrix.data[0][0] = swap;
        swap=  this.data[0][1];
        matrix.data[0][1] = this.data[1][0];
        matrix.data[1][0] = swap;
        swap=  this.data[0][2];
        matrix.data[0][2] = this.data[2][0];
        matrix.data[2][0] = swap;
        swap=  this.data[0][3];
        matrix.data[0][3] = this.data[3][0];
        matrix.data[3][0] = swap;
        swap=  this.data[1][1];
        matrix.data[1][1] = this.data[1][1];
        matrix.data[1][1] = swap;
        swap=  this.data[1][2];
        matrix.data[1][2] = this.data[2][1];
        matrix.data[2][1] = swap;
        swap=  this.data[1][3];
        matrix.data[1][3] = this.data[3][1];
        matrix.data[3][1] = swap;
        swap=  this.data[2][2];
        matrix.data[2][2] = this.data[2][2];
        matrix.data[2][2] = swap;
        swap=  this.data[2][3];
        matrix.data[2][3] = this.data[3][2];
        matrix.data[3][2] = swap;
        swap=  this.data[3][3];
        matrix.data[3][3] = this.data[3][3];
        matrix.data[3][3] = swap;
        return matrix;
    }

    inverse():Matrix4x4
    {
        var m = new Matrix4x4();
        var a00=this.data[0][0];
        var a01=this.data[0][1];
        var a02=this.data[0][2];
        var a03=this.data[0][3];
        var a10=this.data[1][0];
        var a11=this.data[1][1];
        var a12=this.data[1][2];
        var a13=this.data[1][3];
        var a20=this.data[2][0];
        var a21=this.data[2][1];
        var a22=this.data[2][2];
        var a23=this.data[2][3];
        var a30=this.data[3][0];
        var a31=this.data[3][1];
        var a32=this.data[3][2];
        var a33=this.data[3][3];
        var determinant= (a00*(a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))+
                        a01*-(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))+
                        a02*(a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))+
                        a03*-(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30)));   
        if (determinant==0) return null;               

        m.data[0][0]= (a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))/determinant;
        m.data[0][1]= -(a01*(a22*a33-a23*a32)+a02*-(a21*a33-a23*a31)+a03*(a21*a32-a22*a31))/determinant;
        m.data[0][2]= (a01*(a12*a33-a13*a32)+a02*-(a11*a33-a13*a31)+a03*(a11*a32-a12*a31))/determinant;
        m.data[0][3]= -(a01*(a12*a23-a13*a22)+a02*-(a11*a23-a13*a21)+a03*(a11*a22-a12*a21))/determinant;
        m.data[1][0]= -(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))/determinant;
        m.data[1][1]= (a00*(a22*a33-a23*a32)+a02*-(a20*a33-a23*a30)+a03*(a20*a32-a22*a30))/determinant;
        m.data[1][2]= -(a00*(a12*a33-a13*a32)+a02*-(a10*a33-a13*a30)+a03*(a10*a32-a12*a30))/determinant;
        m.data[1][3]= (a00*(a12*a23-a13*a22)+a02*-(a10*a23-a13*a20)+a03*(a10*a22-a12*a20))/determinant;
        m.data[2][0]= (a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))/determinant;
        m.data[2][1]= -(a00*(a21*a33-a23*a31)+a01*-(a20*a33-a23*a30)+a03*(a20*a31-a21*a30))/determinant;
        m.data[2][2]= (a00*(a11*a33-a13*a31)+a01*-(a10*a33-a13*a30)+a03*(a10*a31-a11*a30))/determinant;
        m.data[2][3]= -(a00*(a11*a23-a13*a21)+a01*-(a10*a23-a13*a20)+a03*(a10*a21-a11*a20))/determinant;
        m.data[3][0]= -(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30))/determinant;
        m.data[3][1]= (a00*(a21*a32-a22*a31)+a01*-(a20*a32-a22*a30)+a02*(a20*a31-a21*a30))/determinant;
        m.data[3][2]= -(a00*(a11*a32-a12*a31)+a01*-(a10*a32-a12*a30)+a02*(a10*a31-a11*a30))/determinant;
        m.data[3][3]= (a00*(a11*a22-a12*a21)+a01*-(a10*a22-a12*a20)+a02*(a10*a21-a11*a20))/determinant;
        return m;
        
    }
    determinant()
    { 
        var a00=this.data[0][0];
        var a01=this.data[0][1];
        var a02=this.data[0][2];
        var a03=this.data[0][3];
        var a10=this.data[1][0];
        var a11=this.data[1][1];
        var a12=this.data[1][2];
        var a13=this.data[1][3];
        var a20=this.data[2][0];
        var a21=this.data[2][1];
        var a22=this.data[2][2];
        var a23=this.data[2][3];
        var a30=this.data[3][0];
        var a31=this.data[3][1];
        var a32=this.data[3][2];
        var a33=this.data[3][3];
        return (a00*(a11*(a22*a33-a23*a32)+a12*-(a21*a33-a23*a31)+a13*(a21*a32-a22*a31))+
                a01*-(a10*(a22*a33-a23*a32)+a12*-(a20*a33-a23*a30)+a13*(a20*a32-a22*a30))+
                a02*(a10*(a21*a33-a23*a31)+a11*-(a20*a33-a23*a30)+a13*(a20*a31-a21*a30))+
                a03*-(a10*(a21*a32-a22*a31)+a11*-(a20*a32-a22*a30)+a12*(a20*a31-a21*a30)));        
    }
    
    clone():Matrix4x4
    {
        var m = new Matrix4x4();
        m.data[0][0]=this.data[0][0];
        m.data[0][1]=this.data[0][1];
        m.data[0][2]=this.data[0][2];
        m.data[0][3]=this.data[0][3];
        m.data[1][0]=this.data[1][0];
        m.data[1][1]=this.data[1][1];
        m.data[1][2]=this.data[1][2];
        m.data[1][3]=this.data[1][3];
        m.data[2][0]=this.data[2][0];
        m.data[2][1]=this.data[2][1];
        m.data[2][2]=this.data[2][2];
        m.data[2][3]=this.data[2][3];
        m.data[3][0]=this.data[3][0];
        m.data[3][1]=this.data[3][1];
        m.data[3][2]=this.data[3][2];
        m.data[3][3]=this.data[3][3];
        return m;
    }

    multiply(matrix: Matrix4x4): Matrix4x4;
    multiply(tuple: Tuple): Tuple;
    multiply(a:any):any
    {
      if (a instanceof Matrix4x4)
      {
        var m = new Matrix4x4();
        var matrix= a as Matrix4x4;
        m.data[0][0]=matrix.data[0][0]* this.data[0][0]+matrix.data[1][0]* this.data[0][1]+matrix.data[2][0]* this.data[0][2]+matrix.data[3][0]* this.data[0][3];
        m.data[0][1]=matrix.data[0][1]* this.data[0][0]+matrix.data[1][1]* this.data[0][1]+matrix.data[2][1]* this.data[0][2]+matrix.data[3][1]* this.data[0][3];
        m.data[0][2]=matrix.data[0][2]* this.data[0][0]+matrix.data[1][2]* this.data[0][1]+matrix.data[2][2]* this.data[0][2]+matrix.data[3][2]* this.data[0][3];
        m.data[0][3]=matrix.data[0][3]* this.data[0][0]+matrix.data[1][3]* this.data[0][1]+matrix.data[2][3]* this.data[0][2]+matrix.data[3][3]* this.data[0][3];
        m.data[1][0]=matrix.data[0][0]* this.data[1][0]+matrix.data[1][0]* this.data[1][1]+matrix.data[2][0]* this.data[1][2]+matrix.data[3][0]* this.data[1][3];
        m.data[1][1]=matrix.data[0][1]* this.data[1][0]+matrix.data[1][1]* this.data[1][1]+matrix.data[2][1]* this.data[1][2]+matrix.data[3][1]* this.data[1][3];
        m.data[1][2]=matrix.data[0][2]* this.data[1][0]+matrix.data[1][2]* this.data[1][1]+matrix.data[2][2]* this.data[1][2]+matrix.data[3][2]* this.data[1][3];
        m.data[1][3]=matrix.data[0][3]* this.data[1][0]+matrix.data[1][3]* this.data[1][1]+matrix.data[2][3]* this.data[1][2]+matrix.data[3][3]* this.data[1][3];
        m.data[2][0]=matrix.data[0][0]* this.data[2][0]+matrix.data[1][0]* this.data[2][1]+matrix.data[2][0]* this.data[2][2]+matrix.data[3][0]* this.data[2][3];
        m.data[2][1]=matrix.data[0][1]* this.data[2][0]+matrix.data[1][1]* this.data[2][1]+matrix.data[2][1]* this.data[2][2]+matrix.data[3][1]* this.data[2][3];
        m.data[2][2]=matrix.data[0][2]* this.data[2][0]+matrix.data[1][2]* this.data[2][1]+matrix.data[2][2]* this.data[2][2]+matrix.data[3][2]* this.data[2][3];
        m.data[2][3]=matrix.data[0][3]* this.data[2][0]+matrix.data[1][3]* this.data[2][1]+matrix.data[2][3]* this.data[2][2]+matrix.data[3][3]* this.data[2][3];
        m.data[3][0]=matrix.data[0][0]* this.data[3][0]+matrix.data[1][0]* this.data[3][1]+matrix.data[2][0]* this.data[3][2]+matrix.data[3][0]* this.data[3][3];
        m.data[3][1]=matrix.data[0][1]* this.data[3][0]+matrix.data[1][1]* this.data[3][1]+matrix.data[2][1]* this.data[3][2]+matrix.data[3][1]* this.data[3][3];
        m.data[3][2]=matrix.data[0][2]* this.data[3][0]+matrix.data[1][2]* this.data[3][1]+matrix.data[2][2]* this.data[3][2]+matrix.data[3][2]* this.data[3][3];
        m.data[3][3]=matrix.data[0][3]* this.data[3][0]+matrix.data[1][3]* this.data[3][1]+matrix.data[2][3]* this.data[3][2]+matrix.data[3][3]* this.data[3][3];
        return m;
      } else
      {
          var t= a as Tuple;
          return new Tuple( 
           this.data[0][0]*t.x + this.data[0][1]*t.y+this.data[0][2]*t.z+this.data[0][3]*t.w,
           this.data[1][0]*t.x + this.data[1][1]*t.y+this.data[1][2]*t.z+this.data[1][3]*t.w, 
           this.data[2][0]*t.x + this.data[2][1]*t.y+this.data[2][2]*t.z+this.data[2][3]*t.w,
           this.data[3][0]*t.x + this.data[3][1]*t.y+this.data[3][2]*t.z+this.data[3][3]*t.w
             );
      }
    }

}

export class Matrix2x2 extends Matrix
{   
    constructor(matrix: Array<Array<number>>)
    constructor()
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
      return this.data[0][0]*this.data[1][1]-this.data[0][1]*this.data[1][0];
    }
}

export class Matrix3x3 extends Matrix
{   
    constructor(matrix: Array<Array<number>>)
    constructor()
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

    minor(row:number,column:number):number
    { 
        var firstRow = (row == 0 ) ? 1:0;
        var secondRow = (row <= 1 ) ? 2:1; 
        var firstColumn = (column == 0 ) ? 1:0;
        var secondColumn = (column <= 1 ) ? 2:1; 
        return this.data[firstRow][firstColumn]*this.data[secondRow][secondColumn]-
        this.data[firstRow][secondColumn]*this.data[secondRow][firstColumn];

    }
    determinant():number
    {
        var a10=this.data[1][0];
        var a11=this.data[1][1];
        var a12=this.data[1][2];
        var a20=this.data[2][0];
        var a21=this.data[2][1];
        var a22=this.data[2][2];
        
        return (this.data[0][0]*(a11*a22-a12*a21)+this.data[0][1]*-(a10*a22-a12*a20)+this.data[0][2]*(a10*a21-a11*a20));
    }

}