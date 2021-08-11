//Find out formulas for matrix 
//,saving recursion calls, copying submatrix, index loops
export class Matrix {
    protected data: Array<Array<number>>;
    
   
    public readonly size: number;
    public readonly originalSize: number;

    constructor(size: number,originalSize?:number){      

            this.size = size;
            this.originalSize = originalSize ?? size;
            var c=0;
            this.data = new Array<Array<number>>(this.size);
            for (var y = 0; y < this.size; y++) {
                this.data[y] = new Array<number>(this.size);
                for (var x = 0; x < size; x++) {
                    this.data[y][x]=c;
                    c++;
                }
            }
        
    }
    cofactor(row:number,column:number):string
    {

        return (((row +column) % 2 ==0)? "":"-") + this.minor(row,column)
      
    }
    minor(row:number,column:number):string
    {   
        var m= this.submatrix(row,column);        
        return m.determinant(); 
    }
    getRow(id:number)
    {
        return  Math.floor(id/this.originalSize);
    }
    getColumn(id:number)
    {
        return  Math.floor(id % this.originalSize);
    }
    determinant():string
    {
       
        if (this.size==2)  
        {  
             return `(a${this.getRow(this.data[0][0])}${this.getColumn(this.data[0][0])}*a${this.getRow(this.data[1][1])}${this.getColumn(this.data[1][1])}-a${this.getRow(this.data[0][1])}${this.getColumn(this.data[0][1])}*a${this.getRow(this.data[1][0])}${this.getColumn(this.data[1][0])})`;
    
        }
        

        var det="(";
        for (var x=0;x<this.size;x++)
        {
         det+= ((x==0)?"":"+" )+ "a" + this.getRow(this.data[0][x]).toString() + this.getColumn(this.data[0][x]).toString()+ "*" +  this.cofactor(0,x) ;
        }
        return det+")";
    }
    
    public getHeader():string
    {
        var code=""
        for (var y =0;y<this.size;y++)
        {
            for (var x =0;x<this.size;x++)
            {
              code+="var a"+ y.toString()+x.toString()+"="+"this.data["+y+"]["+x+"];\n";

            }          
        }
        return code;
    }


    transpose() :string
    {
        var code="";
        for (var y = 0; y < this.size; y++) {
            for (var x = y; x < this.size; x++) {
               code+= "swap=  this.data["+y+"]["+x+"];\n";                
               code+= "matrix.data["+y+"]["+x+"] = this.data["+x+"]["+y+"];\n";
               code+= "matrix.data["+x+"]["+y+"] = swap;\n";
            }
        }
        return code;
    }

    inverse():string
    {
       var code="";
        for (var y =0;y<this.size;y++)
        {
            for (var x =0;x<this.size;x++)
            {
              code+="m["+y+"]["+x+"]= " +this.cofactor(x,y)  +"/determinant;\n";

            }          
        }
        


        return code;
    } 
    
    multiply():string
    {
        var code="";       
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                var sum = "";
                for (var r = 0; r < this.size; r++) {
                    sum += (r==0?"":"+")+ "matrix.data["+r+"]["+x+"]"+ "* this.data["+y+"]["+r+"]";
                }
                code+= "m.data["+y+"]["+x+"]=" +sum+";\n";
            }
        }
        return code;
    }
    submatrix(row:number,column:number):Matrix
    {
        var m= new Matrix(this.size-1,this.originalSize);       
        var y2=0;        
        for (var y = 0; y < this.size; y++) {
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
 

}
var m4= new Matrix(4)

var m2= new Matrix(2);

var m3= new Matrix(3);   
var m7= new Matrix(7);   
//console.log(m4.getHeader());
console.log(m4.transpose());