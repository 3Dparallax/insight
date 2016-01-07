glMatrixArrayType = typeof Float32Array != "undefined" ? Float32Array : typeof WebGLFloatArray != "undefined" ? WebGLFloatArray : Array;

var mat44 = {};

mat44.create = function( value ) {
	var newMat = new glMatrixArrayType(16);
	if( value ) {
		newMat[0] = value[0];
		newMat[1] = value[1];
		newMat[2] = value[2];
		newMat[3] = value[3];
		newMat[4] = value[4];
		newMat[5] = value[5];
		newMat[6] = value[6];
		newMat[7] = value[7];
		newMat[8] = value[8];
		newMat[9] = value[9];
		newMat[10] = value[10];
		newMat[11] = value[11];
		newMat[12] = value[12];
		newMat[13] = value[13];
		newMat[14] = value[14];
		newMat[15] = value[15];
	}
	return newMat;
}

mat44.perspective = function( fovy, aspect, near, far, dest ) {
	var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    dest[0] = f / aspect;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = f;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = (far + near) * nf;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = (2 * far * near) * nf;
    dest[15] = 0;
    return dest;
}

mat44.identity = function( dest ) {
	dest || ( dest = mat44.create() );
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 1;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = 1;
	dest[11] = 0;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	return dest;
}

mat44.translate = function ( out, a, vec ) {
    var x = vec[0], y = vec[1], z = vec[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

// Note: WebGL uses column major arrays for matrices, so values are switched.
mat44.rotateX = function( matrix, rad, out ) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = matrix[4],
        a11 = matrix[5],
        a12 = matrix[6],
        a13 = matrix[7],
        a20 = matrix[8],
        a21 = matrix[9],
        a22 = matrix[10],
        a23 = matrix[11];

    // If the out matrix is not the same as the source matrix
    if ( matrix !== out ) {
        out[0]  = matrix[0];
        out[1]  = matrix[1];
        out[2]  = matrix[2];
        out[3]  = matrix[3];
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
    }

    // Perform axis-specific matrix multiplication
    out[4]  = a10 * c + a20 * s;
    out[5]  = a11 * c + a21 * s;
    out[6]  = a12 * c + a22 * s;
    out[7]  = a13 * c + a23 * s;
    out[8]  = a20 * c - a10 * s;
    out[9]  = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;

    return out;
};

mat44.rotateZ = function ( matrix, rad, out ) {
    var s = Math.sin( rad ),
        c = Math.cos( rad ),
        a00 = matrix[0],
        a01 = matrix[1],
        a02 = matrix[2],
        a03 = matrix[3],
        a10 = matrix[4],
        a11 = matrix[5],
        a12 = matrix[6],
        a13 = matrix[7];

    if ( matrix !== out ) { // If the source and destination differ, copy the unchanged last row
        out[8]  = matrix[8];
        out[9]  = matrix[9];
        out[10] = matrix[10];
        out[11] = matrix[11];
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

mat44.rotate = function ( matrix, rad, axis, out ) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = matrix[0]; a01 = matrix[1]; a02 = matrix[2]; a03 = matrix[3];
    a10 = matrix[4]; a11 = matrix[5]; a12 = matrix[6]; a13 = matrix[7];
    a20 = matrix[8]; a21 = matrix[9]; a22 = matrix[10]; a23 = matrix[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
    }
    return out;
};