import { Matrix, Matrix2x2, Matrix3x3, Matrix4x4 } from "raytracer/matrix"
import { Tuple } from "raytracer/tuple";

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

test("Multiplying by the translation matrix",
()=>
{
    var transform= Matrix4x4.translation(5,-3,2);
    var p= Tuple.point(-3,4,5);
 
    var p2 = transform.multiply(p);   

    expect( p2.equals(Tuple.point(2,1,7) )).toBeTruthy();
}
);
test("Multiplying by the inverse of a translation matrix",
()=>
{
    var transform= Matrix4x4.translation(5,-3,2);
    var inv= transform.inverse();
 
    var p = Tuple.point(-3,4,5);   
    var c =inv.multiply(p);
    expect( c.equals(Tuple.point(-8,7,3) )).toBeTruthy();
}
);
test("Translation does not affect vectors",
()=>
{
    var transform= Matrix4x4.translation(5,-3,2);

    var v = Tuple.vector(-3,4,5);   
    var c =transform.multiply(v);
    expect( c.equals(c )).toBeTruthy();
}
);
test("A scaling matrix applied to a point",
()=>
{
    var transform= Matrix4x4.scaling(2,3,4);

    var p = Tuple.point(-4,6,8);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(-8,18,32) )).toBeTruthy();
}
);
test("A scaling matrix applied to a vector",
()=>
{
    var transform= Matrix4x4.scaling(2,3,4);

    var p = Tuple.vector(-4,6,8);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.vector(-8,18,32) )).toBeTruthy();
}
);

test("Multiplying by the inverse of a scaling matrix",
()=>
{
    var transform= Matrix4x4.scaling(2,3,4);

    var p = Tuple.vector(-4,6,8);   
    var c =transform.inverse().multiply(p);
    expect( c.equals(Tuple.vector(-2,2,2) )).toBeTruthy();
}
);

test("Reflection is scaling ba a negative value",
()=>
{
    var transform= Matrix4x4.scaling(-1,1,1);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(-2,3,4) )).toBeTruthy();
}
);

test("Rotation a point around the x-axis",
()=>
{
    var p = Tuple.point(0,1,0);   
    var halfQuarter= Matrix4x4.rotationX(Math.PI/4);
    var fullQuarter= Matrix4x4.rotationX(Math.PI/2);   
    expect( halfQuarter.multiply(p).equals(Tuple.point(0,Math.sqrt(2)/2, Math.sqrt(2)/2))).toBeTruthy();
    expect( fullQuarter.multiply(p).equals(Tuple.point(0,0,1))).toBeTruthy();
}
);
test("The inverse of an x-rotation totates in the opposite direction",
()=>
{
    var p = Tuple.point(0,1,0);   
    var halfQuarter= Matrix4x4.rotationX(Math.PI/4);
    var inv=halfQuarter.inverse();
    expect( inv.multiply(p).equals(Tuple.point(0,Math.sqrt(2)/2, -Math.sqrt(2)/2))).toBeTruthy();
   
}
);
test("Rotation a point around the y-axis",
()=>
{
    var p = Tuple.point(0,0,1);   
    var halfQuarter= Matrix4x4.rotationY(Math.PI/4);
    var fullQuarter= Matrix4x4.rotationY(Math.PI/2);   
    expect( halfQuarter.multiply(p).equals(Tuple.point(Math.sqrt(2)/2,0, Math.sqrt(2)/2))).toBeTruthy();
    expect( fullQuarter.multiply(p).equals(Tuple.point(1,0,0))).toBeTruthy();
}
);
test("Rotation a point around the z-axis",
()=>
{
    var p = Tuple.point(0,1,0);   
    var halfQuarter= Matrix4x4.rotationZ(Math.PI/4);
    var fullQuarter= Matrix4x4.rotationZ(Math.PI/2);   
    expect( halfQuarter.multiply(p).equals(Tuple.point(-Math.sqrt(2)/2, Math.sqrt(2)/2,0))).toBeTruthy();
    expect( fullQuarter.multiply(p).equals(Tuple.point(-1,0,0))).toBeTruthy();
}
);
test("A shearing transformation moves x in proportion to y",
()=>
{
    var transform= Matrix4x4.shearing(1,0,0,0,0,0);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(5,3,4) )).toBeTruthy();
}
);
test("A shearing transformation moves x in proportion to z",
()=>
{
    var transform= Matrix4x4.shearing(0,1,0,0,0,0);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(6,3,4) )).toBeTruthy();
}
);
test("A shearing transformation moves y in proportion to x",
()=>
{
    var transform= Matrix4x4.shearing(0,0,1,0,0,0);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(2,5,4) )).toBeTruthy();
}
);
test("A shearing transformation moves y in proportion to z",
()=>
{
    var transform= Matrix4x4.shearing(0,0,0,1,0,0);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(2,7,4) )).toBeTruthy();
}
);

test("A shearing transformation moves z in proportion to x",
()=>
{
    var transform= Matrix4x4.shearing(0,0,0,0,1,0);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(2,3,6) )).toBeTruthy();
}
);
test("A shearing transformation moves z in proportion to y",
()=>
{
    var transform= Matrix4x4.shearing(0,0,0,0,0,1);

    var p = Tuple.point(2,3,4);   
    var c =transform.multiply(p);
    expect( c.equals(Tuple.point(2,3,7) )).toBeTruthy();
}
);
test("Individual transformations are applied in sequence",
()=>
{
   

    var p = Tuple.point(1,0,1);   
    var a=Matrix4x4.rotationX(Math.PI/2);
    var b=Matrix4x4.scaling(5,5,5);
    var c =Matrix4x4.translation(10,5,7);
    var p2=a.multiply(p);
    expect( p2.equals(Tuple.point(1,-1,0) )).toBeTruthy();
    var p3=b.multiply(p2);
    expect( p3.equals(Tuple.point(5,-5,0) )).toBeTruthy();
    var p4= c.multiply(p3);
    expect( p4.equals(Tuple.point(15,0,7) )).toBeTruthy();
}
);
test("Chained transformations must be applied in reverse order",
()=>
{
    var p = Tuple.point(1,0,1);   
    var a=Matrix4x4.rotationX(Math.PI/2);
    var b=Matrix4x4.scaling(5,5,5);
    var c =Matrix4x4.translation(10,5,7);
    var t=c.multiply(b).multiply(a);
    expect(t.multiply(p).equals(Tuple.point(15,0,7))).toBeTruthy();
}
);


test("The transformation matrix for the default orientation",
()=>
{
    var from=Tuple.point(0,0,0);
    var to=Tuple.point(0,0,-1);
    var up= Tuple.vector(0,1,0);
    var t= Matrix4x4.viewTransform(from,to,up);
    expect(t.equals(Matrix4x4.IDENTITY_MATRIX)).toBeTruthy();
}
);
test("A view transformation matrix looking in positive z direction",
()=>
{
    var from=Tuple.point(0,0,0);
    var to=Tuple.point(0,0,1);
    var up= Tuple.vector(0,1,0);
    var t= Matrix4x4.viewTransform(from,to,up);
    expect(t.equals(Matrix4x4.scaling(-1,1,-1) )).toBeTruthy();
}
);

test("The view transformation moves the world",
()=>
{
    var from=Tuple.point(0,0,8);
    var to=Tuple.point(0,0,0);
    var up= Tuple.vector(0,1,0);
    var t= Matrix4x4.viewTransform(from,to,up);
    expect(t.equals(Matrix4x4.translation(0,0,-8) )).toBeTruthy();
}
);
test("An arbitrary view transformation",
()=>
{
    var from=Tuple.point(1,3,2);
    var to=Tuple.point(4,-2,8);
    var up= Tuple.vector(1,1,0);
    var t= Matrix4x4.viewTransform(from,to,up);
    var m= new Matrix4x4(
        [
            [-0.50709,0.50709,0.67612,-2.36643],
            [0.76772,0.60609,0.12122,-2.82843],
            [-0.35857,0.59761,-0.71714,0],
            [0,0,0,1],
        ]
    ); 
 
    expect(t.equals(m )).toBeTruthy();
}
);

test("Serialize",
()=>
{
    var m= new Matrix4x4(
        [
            [-0.50709,0.50709,0.67612,-2.36643],
            [0.76772,0.60609,0.12122,-2.82843],
            [-0.35857,0.59761,-0.71714,6],
            [3,4,5,1],
        ]
    ); 
    var m2= new Matrix4x4(m.serialize());
    expect(m.equals(m2)).toBeTruthy();
}
);