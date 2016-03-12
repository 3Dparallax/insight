var glpDepthInspector = function (gl) {
  this.gl = gl;

  this.clearColor = null;
  this.vertexShaders = {};
  this.fragmentShaders = {};
  this.programs = [];
  this.programsMap = {};
  this.programUniformLocations = {};
  this.originalPrograms = {};
  this.locationMap = {};
  this.enabled = false;
  this.framebufferIsBound = false;
  this.renderbufferIsBound = false;
  this.farLocation = null;
  this.nearLocation = null;
}

/**
 * Applies uniform to WebGL context
 */
glpDepthInspector.prototype.applyUniform = function (uniform) {
  var loc = uniform.loc;
  var type = uniform.type;
  var value = uniform.value;
  if (type == this.gl.FLOAT) {
    this.gl.uniform1f(loc, value);
    return;
  }
  if (type == this.gl.FLOAT_VEC2) {
    this.gl.uniform2fv(loc, value);
    return;
  }
  if (type == this.gl.FLOAT_VEC3) {
    this.gl.uniform3fv(loc, value);
    return;
  }
  if (type == this.gl.FLOAT_VEC4) {
    this.gl.uniform4fv(loc, value);
    return;
  }
  if (type == this.gl.INT) {
    this.gl.uniform1i(loc, value);
    return;
  }
  if (type == this.gl.INT_VEC2) {
    this.gl.uniform2iv(loc, value);
    return;
  }
  if (type == this.gl.INT_VEC3) {
    this.gl.uniform3iv(loc, value);
    return;
  }
  if (type == this.gl.INT_VEC4) {
    this.gl.uniform4iv(loc, value);
    return;
  }
  if (type == this.gl.BOOL) {
    this.gl.uniform1i(loc, value);
    return;
  }
  if (type == this.gl.BOOL_VEC2) {
    this.gl.uniform2iv(loc, value);
    return;
  }
  if (type == this.gl.BOOL_VEC3) {
    this.gl.uniform3iv(loc, value);
    return;
  }
  if (type == this.gl.BOOL_VEC4) {
    this.gl.uniform4iv(loc, value);
    return;
  }
  if (type == this.gl.FLOAT_MAT2) {
    this.gl.uniformMatrix2fv(loc, false, value);
    return;
  }
  if (type == this.gl.FLOAT_MAT3) {
    this.gl.uniformMatrix3fv(loc, false, value);
    return;
  }
  if (type == this.gl.FLOAT_MAT4) {
    this.gl.uniformMatrix4fv(loc, false, value);
    return;
  }
  if (type == this.gl.SAMPLER_2D || type == this.gl.SAMPLER_CUBE) {
    this.gl.uniform1i(loc, value);
    return;
  }
}

/**
 * Enables the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
glpDepthInspector.prototype.enable = function(near, far) {
    if (this.framebufferIsBound || this.renderbufferIsBound) {
      return;
    }
    this.near = near;
    this.far = far;
    this.clearColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

    this.switchToProgram();

    this.enabled = true;
}

/**
 * Disable the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
glpDepthInspector.prototype.disable = function() {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;

    if (this.clearColor) {
      this.gl.clearColor.apply(this.gl, this.clearColor);
    }

    var currentProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
    if (currentProgram.__uuid in this.originalPrograms) {
      var newProgram = this.originalPrograms[currentProgram.__uuid];
      this.gl.useProgram(newProgram);
      this.copyUniforms(currentProgram, newProgram);
    }
}

glpDepthInspector.prototype.bindFrameBuffer = function(enable) {
  this.framebufferIsBound = !!enable;
  this.toggleByBuffer(!!enable);
}

glpDepthInspector.prototype.bindRenderBuffer = function(enable) {
  this.renderbufferIsBound = !!enable;
  this.toggleByBuffer(!!enable);
}

glpDepthInspector.prototype.toggleByBuffer = function(enable) {
  if (!this.enabled) {
    return;
  }

  if (!this.framebufferIsBound && !this.renderbufferIsBound) {
    this.enable();
  } else {
    this.disable();
  }
}

/**
 * Copies uniforms from oldProgram to newProgram
 */
glpDepthInspector.prototype.copyUniforms = function(oldProgram, program) {
  var activeUniforms = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
  this.locationMap[program.__uuid] = {};

  for (var i=0; i < activeUniforms; i++) {
      var uniform = this.gl.getActiveUniform(program, i);
      var oldLocation = this.gl.getUniformLocation(oldProgram, uniform.name);
      var newLocation = this.gl.getUniformLocation(program, uniform.name);
      if (!oldLocation) {
        continue;
      }
      this.locationMap[program.__uuid][oldLocation.__uuid] = newLocation;

      uniform.loc = newLocation;
      uniform.value = this.gl.getUniform(oldProgram, oldLocation);
      if (uniform.value != null) {
        this.applyUniform(uniform);
      }
  }
}

/**
 * Switches the current program to the pixel inspector program
 */
glpDepthInspector.prototype.switchToProgram = function() {
  var oldProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
  var program = this.getProgram(oldProgram);
  this.originalPrograms[program.__uuid] = oldProgram;
  this.switchProgram(oldProgram, program);
}

/**
 * Switches the current program and copies over location and attribute data
 */
glpDepthInspector.prototype.switchProgram = function(oldProgram, program) {
  if (!this.enabled) {
    return;
  }
  this.gl.useProgram(program);
  this.copyUniforms(oldProgram, program);
  this.nearLocation = this.gl.getUniformLocation(program, "near");
  this.farLocation = this.gl.getUniformLocation(program, "far");
  this.gl.uniform1f(this.nearLocation, this.near);
  this.gl.uniform1f(this.farLocation, this.far);
}

glpDepthInspector.prototype.hasProgram = function(program) {
  return this.programs.indexOf(program.__uuid) >= 0;
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Fragment Shader
 */
glpDepthInspector.prototype.getFragShader = function() {
    var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    var shaderStr = "precision mediump float;" +
                      "uniform float near;" +
                      "uniform float far;" +
                      "void main(void) {" +
                      " float depth = gl_FragCoord.z / gl_FragCoord.w;" +
                      " float color = smoothstep( near, far, depth );" +
                      " gl_FragColor = vec4( vec3(color), 1.0 );" +
                    "}";

    this.gl.shaderSource(fragShader, shaderStr);
    this.gl.compileShader(fragShader);

    return fragShader;
}

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram.__uuid} Pixel Inspector Progam
 */
glpDepthInspector.prototype.getProgram = function(originalProgram) {
    if (originalProgram.__uuid in this.programsMap) {
        return this.programsMap[originalProgram.__uuid];
    }

    var program = this.gl.createProgram();

    this.gl.attachShader(program, this.vertexShaders[originalProgram.__uuid]);
    this.gl.attachShader(program, this.getFragShader());
    this.gl.linkProgram(program);
    this.gl.validateProgram(program);

    this.programs.push(program.__uuid);
    this.programsMap[originalProgram.__uuid] = program;

    return program;
}

glpDepthInspector.prototype.storeShaders = function(program, shader) {
  var shaderType = this.gl.getShaderParameter(shader, this.gl.SHADER_TYPE);

  // TODO: verify valid input
  // store vertex shaders associated with program
  if (shaderType == this.gl.VERTEX_SHADER) {
    this.vertexShaders[program.__uuid] = shader;
  } else {
    this.fragmentShaders[program.__uuid] = shader;
  }
}

glpDepthInspector.prototype.storeClearColorStates = function(args) {
  // TODO: verify valid input
  if (this.enabled) {
    this.clearColor = args;
  }
  return this.enabled;
}

glpDepthInspector.prototype.uniforms = function(args) {
  if (this.enabled) {
    var program = args[0];
    var location = args[1];
    if (this.programs.indexOf(program.__uuid) >= 0) {
      if (location in this.locationMap[program.__uuid]) {
        // the program is the pixel inspector version and we're using the original location
        args[1] = this.locationMap[program.__uuid][location.__uuid];
      } else {
      }
    } else {
      // the program is not a pixel inspector
      // if they're using the wrong location, lets just swap programs
      args[0] = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
    }
  }
  return args;
}

glpDepthInspector.prototype.hasUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return (name in this.programUniformLocations[program.__uuid]);
}

glpDepthInspector.prototype.getUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return this.programUniformLocations[program.__uuid][name];
}

glpDepthInspector.prototype.setUniformLocation = function(program, name, location) {
  if (!location.__uuid) {
    location.__uuid = glpHelpers.guid();
  }
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  this.programUniformLocations[program.__uuid][name] = location;
  return location;
}

glpDepthInspector.prototype.remapLocations = function(args) {
  if (this.enabled) {
    if (args[0] == this.nearLocation || args[0] == this.farLocation) {
      return args;
    }
    if (args[0] &&
        this.programs.indexOf(this.gl.getParameter(this.gl.CURRENT_PROGRAM).__uuid) >= 0) {
      args[0] =
        this.locationMap[this.gl.getParameter(this.gl.CURRENT_PROGRAM).__uuid][args[0].__uuid];
    }
  }
  return args
}
