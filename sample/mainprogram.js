var gl;

function initGL( canvas ) {
  try {
    gl = canvas.getContext( "experimental-webgl" );
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch ( e ) { }

  if( !gl ) {
    alert( "It looks like we could not initialize webgl, sorry :(");
  }
}

function getShader( gl, shaderId ) {
  var shaderScript = document.getElementById( shaderId );

  if( !shaderScript ){
    return null;
  }

  var shaderStr = "";
    var line = shaderScript.firstChild;
    while ( line ) {
        if ( line.nodeType == 3) {
            shaderStr += line.textContent;
        }
        line = line.nextSibling;
    }

  var shader;
  if( shaderScript.type == "x-shader/x-fragment" ) {
    shader = gl.createShader( gl.FRAGMENT_SHADER );
  } else if( shaderScript.type == "x-shader/x-vertex" ) {
    shader = gl.createShader( gl.VERTEX_SHADER );
  } else {
    return null;
  }

  gl.shaderSource( shader, shaderStr );
  gl.compileShader( shader );

  if( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
    alert( gl.getShaderInfoLog( shader ) );
    return null;
  }

  return shader;
}

var shaderProgram;

function initShaders() {
  var fragmentShader = getShader( gl, "shader-fs" );
  var vertexShader = getShader( gl, "shader-vs" );

  shaderProgram = gl.createProgram();

  gl.attachShader( shaderProgram, vertexShader );
  gl.attachShader( shaderProgram, fragmentShader );
  gl.linkProgram( shaderProgram );

  if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ){
    alert( "Could not initialize shaders" );
  }

  gl.useProgram( shaderProgram );

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation( shaderProgram, "aVertexPosition" );
  gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );

  shaderProgram.vertexColorAttribute = gl.getAttribLocation( shaderProgram, "aVertexColor" );
  gl.enableVertexAttribArray( shaderProgram.vertexColorAttribute );

  shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
  shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );
}

var mvMatrix = mat44.create();
var pMatrix = mat44.create();

function setMatrixUniforms() {
  gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
  gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix );
}


var gPyramidVertexPositionBuffer;
var gPyramidVertexColorBuffer;
var gPyramidIndexBuffer;

function initPyramidBuffer() {
  gPyramidVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, gPyramidVertexPositionBuffer );

  var vertices = [
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
     0.0,  1.0,  0.0
  ];

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );
  gPyramidVertexPositionBuffer.itemSize = 3;
  gPyramidVertexPositionBuffer.numItems = vertices.length / gPyramidVertexPositionBuffer.itemSize;

  gPyramidIndexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gPyramidIndexBuffer );
  var pyramidVertexIndices = [
    0, 1, 4,
    1, 2, 4,
    4, 2, 3,
    4, 3, 0,

    0, 3, 2,
    0, 2, 1
  ];
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( pyramidVertexIndices ), gl.STATIC_DRAW );
  gPyramidIndexBuffer.itemSize = 1;
  gPyramidIndexBuffer.numItems = pyramidVertexIndices.length;

  gPyramidVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, gPyramidVertexColorBuffer );
  var pyramidVertexColors = [
     1.0, 1.0, 0.0, 1.0,
     1.0, 1.0, 0.0, 1.0,
     0.0, 0.0, 1.0, 1.0,
     1.0, 1.0, 0.0, 1.0,
     1.0, 0.0, 0.0, 1.0
  ];

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( pyramidVertexColors ), gl.STATIC_DRAW );
  gPyramidVertexColorBuffer.itemSize = 4;
  gPyramidVertexColorBuffer.numItems = pyramidVertexColors.length / gPyramidVertexColorBuffer.itemSize;
}

var gCubeVertexPositionBuffer;
var gCubeVertexColorBuffer;
var gCubeIndexBuffer;

function initCubeBuffer() {
  // Createing Vertices
  gCubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexPositionBuffer );

  var cubeVertices = [
    -1.0,-1.0, 1.0,
     1.0,-1.0, 1.0,
     1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

     1.0,-1.0,-1.0,
    -1.0,-1.0,-1.0,
     1.0, 1.0,-1.0,
    -1.0, 1.0,-1.0
  ];

  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( cubeVertices ), gl.STATIC_DRAW );
  gCubeVertexPositionBuffer.itemSize = 3;
  gCubeVertexPositionBuffer.numItems = cubeVertices.length / gCubeVertexPositionBuffer.itemSize;

  // Creating Colors
  gCubeVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexColorBuffer );

  var cubeColors = [];
  for( var i = 0; i < 4; i++ ) {
    cubeColors = cubeColors.concat( [0.0, 1.0, 0.0, 1.0] );
  }
  for( var i = 0; i < 4; i++ ) {
    cubeColors = cubeColors.concat( [0.0, 0.0, 1.0, 1.0] );
  }
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( cubeColors ), gl.STATIC_DRAW );
  gCubeVertexColorBuffer.itemSize = 4;
  gCubeVertexColorBuffer.numItems = cubeColors.length / gCubeVertexColorBuffer.itemSize;

  // Creating the index buffer
  gCubeIndexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gCubeIndexBuffer );

  var cubeIndices = [
    0, 1, 2, // Front
    0, 2, 3,

    1, 4, 6, // Right
    1, 6, 2,

    3, 2, 6, // Top
    3, 6, 7,

    5, 3, 7, // Left
    5, 0, 3,

    6, 5, 7, // Back
    6, 4, 5,

    5, 4, 0, // Bottom
    0, 4, 1
  ];

  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( cubeIndices ), gl.STATIC_DRAW );
  gCubeIndexBuffer.itemSize = 1;
  gCubeIndexBuffer.numItems = cubeIndices.length;
}

function initBuffers() {
  initPyramidBuffer();
  initCubeBuffer();

  // Preparing pMatrix
  mat44.perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix );
}

var gPyramidRotAngle = 0;
var gCubeRotAngle = 0;
var mvMatrixStack = new matrixStack();
var tmp = 0;

function drawPyramid() {
  // drawing pyramid
  mat44.translate( mvMatrix, mvMatrix, [0.0, 0.0, -10.0] );

  mvMatrixStack.push( mvMatrix );
  mat44.rotateZ( mvMatrix, gPyramidRotAngle, mvMatrix );

  gl.bindBuffer( gl.ARRAY_BUFFER, gPyramidVertexPositionBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, gPyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, gPyramidVertexColorBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, gPyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0 );

  setMatrixUniforms();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gPyramidIndexBuffer );
  gl.drawElements( gl.TRIANGLES, gPyramidIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

  mvMatrix = mvMatrixStack.pop();
}

function drawCube() {
  mat44.translate( mvMatrix, mvMatrix, [1.0, 0.0, 5.0] );

  // Preserving state of mvMatrix
  mvMatrixStack.push( mvMatrix );
  mat44.rotateX( mvMatrix, gCubeRotAngle, mvMatrix );
  mat44.rotateZ( mvMatrix, gCubeRotAngle, mvMatrix );

  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexPositionBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, gCubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexColorBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, gCubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0 );
  setMatrixUniforms();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gCubeIndexBuffer );
  gl.drawElements( gl.TRIANGLES, gCubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

  mvMatrix = mvMatrixStack.pop();
}

function drawAnotherCube() {
  mat44.translate( mvMatrix, mvMatrix, [0.5, 0.0, 0.0] );

  // Preserving state of mvMatrix
  mvMatrixStack.push( mvMatrix );
  mat44.rotateX( mvMatrix, gCubeRotAngle, mvMatrix );
  mat44.rotateZ( mvMatrix, gCubeRotAngle, mvMatrix );

  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexPositionBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, gCubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, gCubeVertexColorBuffer );
  gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, gCubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0 );
  setMatrixUniforms();

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, gCubeIndexBuffer );
  gl.drawElements( gl.TRIANGLES, gCubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

  mvMatrix = mvMatrixStack.pop(); 
}

function drawScene() {
  gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  // Clearing mvMatrix
  mat44.identity( mvMatrix );

  drawPyramid()
  drawCube()
  drawAnotherCube()
  drawAnotherCube()
}

function animate() {
  gPyramidRotAngle += 0.01;
  gCubeRotAngle += 0.03;
}

function drawFrame() {
  window.requestAnimationFrame( drawFrame );

  animate();
  drawScene();
}

function webGLStart() {
  var canvas = document.getElementById( "lesson01-canvas" );
  initGL(canvas);
  initShaders();
  initBuffers();

  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
  // gl.enable( gl.DEPTH_TEST );
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  drawFrame();
}