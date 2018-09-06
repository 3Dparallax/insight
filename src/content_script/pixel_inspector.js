var glpPixelInspector = function (gl) {
  this.gl = gl;

  this.blendProp = null;
  this.blendFuncSFactor = null;
  this.blendFuncDFactor = null;
  this.depthTest = null;
  this.clearColor = null;
  this.vertexShaders = {};
  this.fragmentShaders = {};
  this.programs = [];
  this.programsMap = {};
  this.programUniformLocations = {};
  this.originalPrograms = {};
  this.locationMap = {};
  this.enabled = false;
}

/**
 * Applies uniform to WebGL context
 */
glpPixelInspector.prototype.applyUniform = function (uniform) {
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
glpPixelInspector.prototype.enable = function() {
    this.blendProp = this.gl.getParameter(this.gl.BLEND);
    this.gl.enable(this.gl.BLEND);

    this.blendFuncSFactor = this.gl.getParameter(this.gl.BLEND_SRC_RGB);
    this.blendFuncDFactor = this.gl.getParameter(this.gl.BLEND_DST_RGB);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.depthTest = this.gl.getParameter(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.DEPTH_TEST);

    this.clearColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
    this.gl.clearColor(0.0, 1.0, 0.0, 1.0);

    this.switchToProgram();

    this.enabled = true;
}

/**
 * Disable the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
glpPixelInspector.prototype.disable = function() {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;

    if (!this.blendProp) {
      this.gl.disable(this.gl.BLEND);
    } else {
      if (this.blendFuncSFactor && this.blendFuncDFactor) {
        this.gl.blendFunc(this.blendFuncSFactor, this.blendFuncDFactor);
      }
    }

    if (this.depthTest) {
      this.gl.enable(this.gl.DEPTH_TEST);
    }

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

/**
 * Copies uniforms from oldProgram to newProgram
 */
glpPixelInspector.prototype.copyUniforms = function(oldProgram, program) {
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
 * Copies attributes from oldProgram to newProgram
 */
glpPixelInspector.prototype.copyAttributes = function(oldProgram, program) {
  var activeAttributes = this.gl.getProgramParameter(oldProgram, this.gl.ACTIVE_ATTRIBUTES);

  for (var i=0; i < activeAttributes; i++) {
      var attribute = this.gl.getActiveAttrib(oldProgram, i);

      this.gl.bindAttribLocation(program, attribute.index, attribute.name);
      if (attribute.size > 1) {
        this.gl.vertexAttribPointer(
          attribute.index,
          attribute.size,
          attribute.type,
          attribute.normalized,
          attribute.stride,
          attribute.offset
        );
      }

      this.gl.enableVertexAttribArray(attribute.index);
  }
}

/**
 * Switches the current program to the pixel inspector program
 */
glpPixelInspector.prototype.switchToProgram = function() {
  var oldProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
  var program = this.getProgram(oldProgram);
  this.originalPrograms[program.__uuid] = oldProgram;
  this.switchProgram(oldProgram, program);
}

/**
 * Switches the current program and copies over location and attribute data
 */
glpPixelInspector.prototype.switchProgram = function(oldProgram, program) {
  if (!this.enabled) {
    return;
  }
  this.gl.useProgram(program);
  this.copyUniforms(oldProgram, program);
  this.copyAttributes(oldProgram, program);
}

glpPixelInspector.prototype.hasProgram = function(program) {
  return this.programs.indexOf(program.__uuid) >= 0;
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Fragment Shader
 */
glpPixelInspector.prototype.getFragShader = function() {
    var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    var shaderStr = 'precision mediump float;' +
        'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
        '}';

    this.gl.shaderSource(fragShader, shaderStr);
    this.gl.compileShader(fragShader);

    return fragShader;
}

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram.__uuid} Pixel Inspector Progam
 */
glpPixelInspector.prototype.getProgram = function(originalProgram) {
    if (originalProgram.__uuid in this.programsMap) {
        return this.programsMap[originalProgram.__uuid];
    }

    var program = this.gl.createProgram();

    const attachedShaders = this.gl.getAttachedShaders(originalProgram);
    attachedShaders.forEach(shader => {
      this.storeShaders(program, shader);
    });

    this.gl.attachShader(program, this.vertexShaders[originalProgram.__uuid]);
    this.gl.attachShader(program, this.getFragShader());
    this.gl.linkProgram(program);
    this.gl.validateProgram(program);

    this.programs.push(program.__uuid);
    this.programsMap[originalProgram.__uuid] = program;

    return program;
}

glpPixelInspector.prototype.storeShaders = function(program, shader) {
  var shaderType = this.gl.getShaderParameter(shader, this.gl.SHADER_TYPE);

  // TODO: verify valid input
  // store vertex shaders associated with program
  if (shaderType == this.gl.VERTEX_SHADER) {
    this.vertexShaders[program.__uuid] = shader;
  } else {
    this.fragmentShaders[program.__uuid] = shader;
  }
}

glpPixelInspector.prototype.saveStates = function(arg, truth) {
  if (this.enabled) {
    if (arg == this.gl.DEPTH_TEST) {
      this.depthTest = truth;
      return true;
    } else if (arg == this.gl.BLEND) {
      this.blendProp = truth;
      return true;
    }
  }
  return this.enabled;
}

glpPixelInspector.prototype.storeBlendStates = function(sFactor, dFactor) {
  if (this.enabled) {
    this.blendFuncSFactor = sFactor;
    this.blendFuncDFactor = dFactor;
  }
  return this.enabled;
}

glpPixelInspector.prototype.storeClearColorStates = function(args) {
  // TODO: verify valid input
  if (this.enabled) {
    this.clearColor = args;
  }
  return this.enabled;
}

glpPixelInspector.prototype.uniforms = function(args) {
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

glpPixelInspector.prototype.hasUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return (name in this.programUniformLocations[program.__uuid]);
}

glpPixelInspector.prototype.getUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return this.programUniformLocations[program.__uuid][name];
}

glpPixelInspector.prototype.setUniformLocation = function(program, name, location) {
  location.__uuid = glpHelpers.guid();
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  this.programUniformLocations[program.__uuid][name] = location;
  return location;
}

glpPixelInspector.prototype.remapLocations = function(args) {
  if (this.enabled) {
    if (args[0] &&
        this.programs.indexOf(this.gl.getParameter(this.gl.CURRENT_PROGRAM).__uuid) >= 0) {
      args[0] =
        this.locationMap[this.gl.getParameter(this.gl.CURRENT_PROGRAM).__uuid][args[0].__uuid];
    }
  }
  return args
}
