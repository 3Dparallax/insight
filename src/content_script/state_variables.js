var glpStateTracker = function (gl) {
  this.gl = gl;
  this.enabled = false;

  this.BLEND = null;
  this.CULL_FACE = null;
  this.DEPTH_TEST = null;
  this.DEPTH_WRITEMASK = null;
  this.DITHER = null;
  this.POLYGON_OFFSET_FILL = null;
  this.SAMPLE_COVERAGE_INVERT = null;
  this.SCISSOR_TEST = null;
  this.STENCIL_TEST = null;
  this.UNPACK_FLIP_Y_WEBGL = null;
  this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = null;

  this.programRequestedStates = {
    BLEND: null,
    CULL_FACE: null,
    DEPTH_TEST: null,
    DEPTH_WRITEMASK: null,
    DITHER: null,
    POLYGON_OFFSET_FILL: null,
    SAMPLE_COVERAGE_INVERT: null,
    SCISSOR_TEST: null,
    STENCIL_TEST: null,
    UNPACK_FLIP_Y_WEBGL: null,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: null,
  };
}


glpStateTracker.prototype.toggle = function(enabled) {
  var gl = this.gl
  if (enabled) {
    this.enabled = true;
    for (var key in this.programRequestedStates) {
      this.programRequestedStates[key] = gl.getParameter(gl[key]);
    }
  } else {
    for (var key in this.programRequestedStates) {
      this.toggleBoolState({
        variable: key,
        enable: this.programRequestedStates[key]
      })
    }
    this.enabled = false;
  }
}

glpStateTracker.prototype.freezeStates = function(stateEnum, enable) {
  if (!this.enabled) {
    return false;
  }
  stateName = glpHelpers.getGLEnumName(this.gl, stateEnum)
  if (this[stateName] != enable) {
    this.programRequestedStates[stateName] = enable;
    return true;
  }
  return false;
}

glpStateTracker.prototype.toggleBoolState = function(request) {
  if (!this.enabled) {
    return false;
  }
  var gl = this.gl;
  stateName = request.variable
  this[stateName] = request.enable;
  if (stateName == "UNPACK_FLIP_Y_WEBGL" || stateName == "UNPACK_PREMULTIPLY_ALPHA_WEBGL") {
    gl.pixelStorei(gl[stateName], request.enable);
  } else if (stateName == "DEPTH_WRITEMASK") {
    gl.depthMask(request.enable);
  } else if (request.enable) {
    gl.enable(gl[stateName]);
  } else {
    gl.disable(gl[stateName]);
  }
}

glpStateTracker.prototype.getStates = function() {
  return {
    boolStates: this.getBooleanStates(),
    numberStates: this.getNumberStates(),
    enumStates: this.getEnumStates(),
  }
}

// BLEND *                             GLboolean
// CULL_FACE *                         GLboolean
// DEPTH_TEST *                        GLboolean
// DEPTH_WRITEMASK                     GLboolean
// DITHER *                            GLboolean
// POLYGON_OFFSET_FILL *               GLboolean
// SAMPLE_COVERAGE_INVERT *            GLboolean
// SCISSOR_TEST *                      GLboolean
// STENCIL_TEST *                      GLboolean
// UNPACK_FLIP_Y_WEBGL                 GLboolean
// UNPACK_PREMULTIPLY_ALPHA_WEBGL      GLboolean
glpStateTracker.prototype.getBooleanStates = function() {
  var gl = this.gl;

  this.BLEND = gl.getParameter(gl.BLEND);
  this.CULL_FACE = gl.getParameter(gl.CULL_FACE);
  this.DEPTH_TEST = gl.getParameter(gl.DEPTH_TEST);
  this.DEPTH_WRITEMASK = gl.getParameter(gl.DEPTH_WRITEMASK);
  this.DITHER = gl.getParameter(gl.DITHER);
  this.POLYGON_OFFSET_FILL = gl.getParameter(gl.POLYGON_OFFSET_FILL);
  this.SCISSOR_TEST = gl.getParameter(gl.SCISSOR_TEST);
  this.STENCIL_TEST = gl.getParameter(gl.STENCIL_TEST);
  this.UNPACK_FLIP_Y_WEBGL = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
  this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
  return {
    BLEND: this.BLEND,
    CULL_FACE: this.CULL_FACE,
    DEPTH_TEST: this.DEPTH_TEST,
    DEPTH_WRITEMASK: this.DEPTH_WRITEMASK, //gl.depthMask(false);
    DITHER: this.DITHER,
    POLYGON_OFFSET_FILL: this.POLYGON_OFFSET_FILL,
    SCISSOR_TEST: this.SCISSOR_TEST,
    STENCIL_TEST: this.STENCIL_TEST,
    UNPACK_FLIP_Y_WEBGL: this.UNPACK_FLIP_Y_WEBGL, //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  }
}

// ALPHA_BITS                          GLint
// BLUE_BITS                           GLint
// DEPTH_BITS                          GLint
// DEPTH_CLEAR_VALUE                   GLfloat
// GREEN_BITS                          GLint
// LINE_WIDTH                          GLfloat
// MAX_COMBINED_TEXTURE_IMAGE_UNITS    GLint
// MAX_CUBE_MAP_TEXTURE_SIZE           GLint
// MAX_FRAGMENT_UNIFORM_VECTORS        GLint
// MAX_RENDERBUFFER_SIZE               GLint
// MAX_TEXTURE_IMAGE_UNITS             GLint
// MAX_TEXTURE_SIZE                    GLint
// MAX_VARYING_VECTORS                 GLint
// MAX_VERTEX_ATTRIBS                  GLint
// MAX_VERTEX_TEXTURE_IMAGE_UNITS      GLint
// MAX_VERTEX_UNIFORM_VECTORS          GLint
// PACK_ALIGNMENT                      GLint
// POLYGON_OFFSET_FACTOR               GLfloat
// POLYGON_OFFSET_UNITS                GLfloat
// RED_BITS                            GLint
// SAMPLE_BUFFERS                      GLint
// SAMPLE_COVERAGE_VALUE               GLfloat
// SAMPLES                             GLint
// STENCIL_BACK_REF                    GLint
// STENCIL_BITS                        GLint
// STENCIL_CLEAR_VALUE                 GLint
// STENCIL_REF                         GLint
// SUBPIXEL_BITS                       GLint
// UNPACK_ALIGNMENT                    GLint
glpStateTracker.prototype.getNumberStates = function() {
  var gl = this.gl;
  return {
    ALPHA_BITS: gl.getParameter(gl.ALPHA_BITS),
    BLUE_BITS: gl.getParameter(gl.BLUE_BITS),
    DEPTH_BITS: gl.getParameter(gl.DEPTH_BITS),
    DEPTH_CLEAR_VALUE: gl.getParameter(gl.DEPTH_CLEAR_VALUE),
    GREEN_BITS: gl.getParameter(gl.GREEN_BITS),
    LINE_WIDTH: gl.getParameter(gl.LINE_WIDTH),
    MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    MAX_CUBE_MAP_TEXTURE_SIZE: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
    MAX_FRAGMENT_UNIFORM_VECTORS: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    MAX_RENDERBUFFER_SIZE: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    MAX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
    MAX_TEXTURE_SIZE: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    MAX_VARYING_VECTORS: gl.getParameter(gl.MAX_VARYING_VECTORS),
    MAX_VERTEX_ATTRIBS: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    MAX_VERTEX_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    MAX_VERTEX_UNIFORM_VECTORS: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
    PACK_ALIGNMENT: gl.getParameter(gl.PACK_ALIGNMENT),
    POLYGON_OFFSET_FACTOR: gl.getParameter(gl.POLYGON_OFFSET_FACTOR),
    POLYGON_OFFSET_UNITS: gl.getParameter(gl.POLYGON_OFFSET_UNITS),
    RED_BITS: gl.getParameter(gl.RED_BITS),
    SAMPLE_BUFFERS: gl.getParameter(gl.SAMPLE_BUFFERS),
    SAMPLE_COVERAGE_VALUE: gl.getParameter(gl.SAMPLE_COVERAGE_VALUE),
    SAMPLES: gl.getParameter(gl.SAMPLES),
    STENCIL_BACK_REF: gl.getParameter(gl.STENCIL_BACK_REF),
    STENCIL_BITS: gl.getParameter(gl.STENCIL_BITS),
    STENCIL_CLEAR_VALUE: gl.getParameter(gl.STENCIL_CLEAR_VALUE),
    STENCIL_REF: gl.getParameter(gl.STENCIL_REF),
    SUBPIXEL_BITS: gl.getParameter(gl.SUBPIXEL_BITS),
    UNPACK_ALIGNMENT: gl.getParameter(gl.UNPACK_ALIGNMENT),
  }
}

// ACTIVE_TEXTURE                      GLenum
// BLEND_DST_ALPHA                     GLenum
// BLEND_DST_RGB                       GLenum
// BLEND_EQUATION_ALPHA                GLenum
// BLEND_EQUATION_RGB                  GLenum
// BLEND_SRC_ALPHA                     GLenum
// BLEND_SRC_RGB                       GLenum
// CULL_FACE_MODE                      GLenum
// DEPTH_FUNC                          GLenum
// FRONT_FACE                          GLenum
// GENERATE_MIPMAP_HINT                GLenum
// IMPLEMENTATION_COLOR_READ_FORMAT    GLenum
// IMPLEMENTATION_COLOR_READ_TYPE      GLenum
// STENCIL_BACK_FAIL                   GLenum
// STENCIL_BACK_FUNC                   GLenum
// STENCIL_BACK_PASS_DEPTH_FAIL        GLenum
// STENCIL_BACK_PASS_DEPTH_PASS        GLenum
// STENCIL_FAIL                        GLenum
// STENCIL_FUNC                        GLenum
// STENCIL_PASS_DEPTH_FAIL             GLenum
// STENCIL_PASS_DEPTH_PASS             GLenum
// UNPACK_COLORSPACE_CONVERSION_WEBGL  GLenum
glpStateTracker.prototype.getEnumStates = function() {
  var gl = this.gl;
  return {
    ACTIVE_TEXTURE: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.ACTIVE_TEXTURE)),
    BLEND_DST_ALPHA: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_DST_ALPHA)),
    BLEND_DST_RGB: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_DST_RGB)),
    BLEND_EQUATION_ALPHA: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_EQUATION_ALPHA)),
    BLEND_EQUATION_RGB: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_EQUATION_RGB)),
    BLEND_SRC_ALPHA: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_SRC_ALPHA)),
    BLEND_SRC_RGB: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.BLEND_SRC_RGB)),
    CULL_FACE_MODE: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.CULL_FACE_MODE)),
    DEPTH_FUNC: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.DEPTH_FUNC)),
    FRONT_FACE: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.FRONT_FACE)),
    GENERATE_MIPMAP_HINT: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.GENERATE_MIPMAP_HINT)),
    IMPLEMENTATION_COLOR_READ_FORMAT: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT)),
    IMPLEMENTATION_COLOR_READ_TYPE: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE)),
    STENCIL_BACK_FAIL: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_BACK_FAIL)),
    STENCIL_BACK_FUNC: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_BACK_FUNC)),
    STENCIL_BACK_PASS_DEPTH_FAIL: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_FAIL)),
    STENCIL_BACK_PASS_DEPTH_PASS: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_BACK_PASS_DEPTH_PASS)),
    STENCIL_FAIL: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_FAIL)),
    STENCIL_FUNC: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_FUNC)),
    STENCIL_PASS_DEPTH_FAIL: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL)),
    STENCIL_PASS_DEPTH_PASS: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS)),
    UNPACK_COLORSPACE_CONVERSION_WEBGL: glpHelpers.getGLEnumName(gl, gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL)),
  }
}

/*
Other states that work with getParameter()
pname                               returned type
COLOR_WRITEMASK                     sequence<GLboolean> (with 4 values)
RENDERER                            DOMString
SHADING_LANGUAGE_VERSION            DOMString
VENDOR                              DOMString
VERSION                             DOMString
ALIASED_LINE_WIDTH_RANGE            Float32Array (with 2 elements)
ALIASED_POINT_SIZE_RANGE            Float32Array (with 2 elements)
DEPTH_RANGE                         Float32Array (with 2 elements)
BLEND_COLOR                         Float32Array (with 4 values)
COLOR_CLEAR_VALUE                   Float32Array (with 4 values)
STENCIL_BACK_VALUE_MASK             GLuint
STENCIL_BACK_WRITEMASK              GLuint
STENCIL_VALUE_MASK                  GLuint
STENCIL_WRITEMASK                   GLuint
MAX_VIEWPORT_DIMS                   Int32Array (with 2 elements)
SCISSOR_BOX                         Int32Array (with 4 elements)
VIEWPORT                            Int32Array (with 4 elements)
COMPRESSED_TEXTURE_FORMATS          Uint32Array
ARRAY_BUFFER_BINDING                WebGLBuffer
ELEMENT_ARRAY_BUFFER_BINDING        WebGLBuffer
CURRENT_PROGRAM                     WebGLProgram
FRAMEBUFFER_BINDING                 WebGLFramebuffer
RENDERBUFFER_BINDING                WebGLRenderbuffer
TEXTURE_BINDING_2D                  WebGLTexture
TEXTURE_BINDING_CUBE_MAP            WebGLTexture
*/
