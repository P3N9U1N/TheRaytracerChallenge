import { Matrix, Matrix2x2, Matrix3x3, Matrix4x4 } from "../../raytracer/matrix"
import { Tuple } from "../../raytracer/tuple";

test("Constructing a matrix",
()=>
{
    var m = new Matrix([  
        [1,2,3,4],
        [5.5,6.5,7.5,8.5],
        [9,10,11,12],
        [13.5,14.5,15.5,16.5]
    ]);
    expect(m.get(0,0)).toBe(1);
    expect(m.get(0,3)).toBe(4);
    expect(m.get(1,0)).toBe(5.5);
    expect(m.get(1,2)).toBe(7.5);
}
);
test("Matrix equality",
()=>
{
    var m1 = new Matrix([  
        [1,2,3,4],
        [5,6,7,8]
    ]);
    var m2 = new Matrix([  
        [1,2,3,4],
        [5,6,7,8]
    ]);
    expect(m1.equals(m2)).toBeTruthy();
}
);
test("Matrix inequality",
()=>
{
    var m1 = new Matrix([  
        [1,2,3,4],
        [5,6,7,8]
    ]);
    var m2 = new Matrix([  
        [2,3,4,5],
        [6,7,8,9]
    ]);
    expect(m1.equals(m2)).toBeFalsy();
}
);
test("Matrix multiplication",
()=>
{
    var m1 = new Matrix([  
        [1,2,3,4],
        [5,6,7,8],
        [9,8,7,6],
        [5,4,3,2]
    ]);
    var m2 = new Matrix([  
        [-2,1,2,3],
        [3,2,1,-1],
        [4,3,6,5],
        [1,2,7,8],
    ]);
    var m3= new Matrix([  
        [20,22,50,48],
        [44,54,114,108],
        [40,58,110,102],
        [16,26,46,42],
    ]);
    var m4= m1.multiply(m2);
    expect(m4.equals(m3)).toBeTruthy();
}
);

test("Matrix 4*4 multiplication with identity",
()=>
{
    var m = new Matrix4x4([  
        [0,1,2,4],
        [1,2,4,8],
        [2,4,8,16],
        [4,8,16,32]
    ]);   
    var m2= m.multiply(Matrix4x4.IDENTITY_MATRIX);    
    expect(m2.equals(m)).toBeTruthy();
}
);


test("Matrix 4*4 multiplication",
()=>
{
    var m1 = new Matrix4x4([  
        [1,2,3,4],
        [5,6,7,8],
        [9,8,7,6],
        [5,4,3,2]
    ]);
    var m2 = new Matrix4x4([  
        [-2,1,2,3],
        [3,2,1,-1],
        [4,3,6,5],
        [1,2,7,8],
    ]);
    var m3= new Matrix4x4([  
        [20,22,50,48],
        [44,54,114,108],
        [40,58,110,102],
        [16,26,46,42],
    ]);
    var m4= m1.multiply(m2);
    expect(m4.equals(m3)).toBeTruthy();
}
);
test("Matrix 4*4 multiplication with tuple",
()=>
{
    var m = new Matrix4x4([  
        [1,2,3,4],
        [2,4,4,2],
        [8,6,4,1],
        [0,0,0,1]
    ]);
    var t = new Tuple(1,2,3,1);
    var t2= m.multiply(t);
    var t3= new Tuple(18,24,33,1);
    expect(t2.equals(t3)).toBeTruthy();
}
);
test("Matrix 4*4 multiplication with identity",
()=>
{
    var m = new Matrix4x4([  
        [0,1,2,4],
        [1,2,4,8],
        [2,4,8,16],
        [4,8,16,32]
    ]);   
    var m2= m.multiply(Matrix4x4.IDENTITY_MATRIX);    
    expect(m2.equals(m)).toBeTruthy();
}
);

test("Matrix 4*4 transposing",
()=>
{
    var m = new Matrix4x4([  
        [0,9,3,0],
        [9,8,0,8],
        [1,8,5,3],
        [0,0,5,8]
    ]);   
    var m2 = new Matrix4x4([  
        [0,9,1,0],
        [9,8,8,0],
        [3,0,5,5],
        [0,8,3,8]
    ]);  
    var m3= m.transpose();    
    expect(m2.equals(m3)).toBeTruthy();
}
);
test("Transposing identity matrix",
()=>
{
    var m =  Matrix4x4.IDENTITY_MATRIX.transpose();   
    
    expect(m.equals(Matrix4x4.IDENTITY_MATRIX)).toBeTruthy();
}
);
test("Calculating the determinant of 2*2 matrix",
()=>
{
    var m =  new Matrix2x2(
        [
            [1,5],
            [-3,2]
        ]
    );
    
    expect(m.determinant()).toBe(17);
}
);

test("A submatrix of a 3*3 matrix is a 2*2 matrix",
()=>
{
    var m =  new Matrix(
        [
            [1,5,0],
            [-3,2,7],
            [0,6,-3]
        ]
    );
    var m2 =  new Matrix(
        [
            [-3,2],
            [0,6]
        ]
    );
    var m3= m.submatrix(0,2);
    expect(m3.equals(m2)).toBeTruthy();
}
);
test("A submatrix of a 4*4 matrix is a 3*3 matrix",
()=>
{
    var m =  new Matrix(
        [
            [-6,1,1,6],
            [-8,5,8,6],
            [-1,0,8,2],
            [-7,1,-1,1]
        ]
    );
    var m2 =  new Matrix(
        [
            [-6,1,6],
            [-8,8,6],
            [-7,-1,1]
        ]
    );
    var m3= m.submatrix(2,1);
    expect(m3.equals(m2)).toBeTruthy();
}
);
test("Calculating a minor of a 3*3 matrix",
()=>
{
    var m =  new Matrix3x3(
        [
            [3,5,0],
            [2,-1,-7],
            [6,-1,5]
        ]
    );
    expect(m.minor(1,0)).toBe(25);
}
);
test("Empty matrix comparision",
()=>
{
    var m =  new Matrix(
        [
            [3,5,0],
            [2,-1,-7],
            [6,-1,5]
        ]
    );
    var m2 =  new Matrix(3,3)
   
    expect(m.equals(m2)).toBeFalsy();
}
);
test("Calculating the cofactor a 3*3 matrix",
()=>
{
    var m =  new Matrix3x3(
        [
            [3,5,0],
            [2,-1,-7],
            [6,-1,5]
        ]
    );
   
    expect(m.cofactor(0,0)).toBe(-12);
    expect(m.cofactor(1,0)).toBe(-25);
}
);

test("Calculating the determinant a 3*3 matrix",
()=>
{
    var m =  new Matrix3x3(
        [
            [1,2,6],
            [-5,8,-4],
            [2,6,4]
        ]
    );   
    expect(m.determinant()).toBe(-196);

}
);

test("Calculating the determinant a 4*4 matrix",
()=>
{
    var m =  new Matrix4x4(
        [
            [-2,-8,3,5],
            [-3,1,7,3],
            [1,2,-9,6],
            [-6,7,7,-9],
        ]
    );   
    expect(m.determinant()).toBe(-4071);

}
);
test("Testing an invertible 4*4 matrix for invertibility",
()=>
{
    var m =  new Matrix4x4(
        [
            [6,4,4,4],
            [5,5,7,6],
            [4,-9,3,-7],
            [9,1,7,-6],
        ]
    );   
    expect(m.determinant()).toBe(-2120);
    expect(m.isInvertible()).toBeTruthy();
}
);
test("Testing a noninvertible 4*4 matrix for invertibility",
()=>
{
    var m =  new Matrix4x4(
        [
            [-4,2,-2,-3],
            [9,6,2,6],
            [0,-5,1,-5],
            [0,0,0,0],
        ]
    );   
    expect(m.determinant()).toBe(0);
    expect(m.isInvertible()).toBeFalsy();
}
);
test("Calculating the inverse of a 4*4 matrix",
()=>
{
    var a =  new Matrix4x4(
        [
            [-5,2,6,-8],
            [1,-5,1,8],
            [7,7,-6,-7],
            [1,-3,7,4],
        ]
    );   
    var i= new Matrix4x4(
        [
            [0.21805,0.45113,0.24060,-0.04511],
            [-0.80827,-1.45677,-0.44361,0.52068],
            [-0.07895,-0.22368,-0.05263,0.19737],
            [-0.52256,-0.81391,-0.30075,0.30639],
        ]
    ); 
    var m= a.inverse();
    expect(a.determinant()).toBe(532);
    expect(m.equals(i)).toBeTruthy();
}
);

test("Calculating the inverse of another 4*4 matrix",
()=>
{
    var a =  new Matrix4x4(
        [
            [8,-5,9,2],
            [7,5,6,1],
            [-6,0,9,6],
            [-3,0,-9,-4],
        ]
    );   
    var i= new Matrix4x4(
        [
            [-0.15385,-0.15385,-0.28205,-0.53846],
            [-0.07692,0.12308,0.02564,0.03077],
            [0.35897,0.35897,0.43590,0.92308],
            [-0.69231,-0.69231,-0.76923,-1.92308],
        ]
    ); 
    var m= a.inverse();   
    expect(m.equals(i)).toBeTruthy();
}
);
test("Calculating the inverse of a third 4*4 matrix",
()=>
{
    var a =  new Matrix4x4(
        [
            [9,3,0,9],
            [-5,-2,-6,-3],
            [-4,9,6,4],
            [-7,6,6,2],
        ]
    );   
    var i= new Matrix4x4(
        [
            [-0.04074,-0.07778,0.14444,-0.22222],
            [-0.07778,0.03333,0.36667,-0.33333],
            [-0.02901,-0.14630,-0.10926,0.12963],
            [0.17778,0.06667,-0.26667,0.33333],
        ]
    ); 
    var m= a.inverse();   
    expect(m.equals(i)).toBeTruthy();
}
);

test("Multiplying a product by its inverse",
()=>
{
    var a =  new Matrix4x4(
        [
            [3,-9,7,3],
            [3,-8,2,-9],
            [-4,4,4,1],
            [-6,5,-1,1],
        ]
    );   
    var b= new Matrix4x4(
        [
            [8,2,2,2],
            [3,-1,7,0],
            [7,0,5,4],
            [6,-2,0,5],
        ]
    ); 
 
    var c = a.multiply(b);   

    expect( c.multiply(b.inverse()).equals(a)).toBeTruthy();
}
);