var glpPixelInspector = (function () {

pixelInspector = {}

// Overdraw Inspector variables
pixelInspector.blendProp = null;
pixelInspector.blendFuncSFactor = null;
pixelInspector.blendFuncDFactor = null;
pixelInspector.depthTest = null;
pixelInspector.clearColor = null;
pixelInspector.vertexShaders = {};
pixelInspector.fragmentShaders = {};
pixelInspector.programs = [];
pixelInspector.programsMap = {};
pixelInspector.programUniformLocations = {};
pixelInspector.originalPrograms = {};
pixelInspector.locationMap = {};
pixelInspector.enabled = false;

/**
 * Applies uniform to WebGL context
 */
pixelInspector.applyUniform = function (gl, uniform) {
  var loc = uniform.loc;
  var type = uniform.type;
  var value = uniform.value;
  if (type == gl.FLOAT) {
    gl.uniform1f(loc, value);
    return;
  }
  if (type == gl.FLOAT_VEC2) {
    gl.uniform2fv(loc, value);
    return;
  }
  if (type == gl.FLOAT_VEC3) {
    gl.uniform3fv(loc, value);
    return;
  }
  if (type == gl.FLOAT_VEC4) {
    gl.uniform4fv(loc, value);
    return;
  }
  if (type == gl.INT) {
    gl.uniform1i(loc, value);
    return;
  }
  if (type == gl.INT_VEC2) {
    gl.uniform2iv(loc, value);
    return;
  }
  if (type == gl.INT_VEC3) {
    gl.uniform3iv(loc, value);
    return;
  }
  if (type == gl.INT_VEC4) {
    gl.uniform4iv(loc, value);
    return;
  }
  if (type == gl.BOOL) {
    gl.uniform1i(loc, value);
    return;
  }
  if (type == gl.BOOL_VEC2) {
    gl.uniform2iv(loc, value);
    return;
  }
  if (type == gl.BOOL_VEC3) {
    gl.uniform3iv(loc, value);
    return;
  }
  if (type == gl.BOOL_VEC4) {
    gl.uniform4iv(loc, value);
    return;
  }
  if (type == gl.FLOAT_MAT2) {
    gl.uniformMatrix2fv(loc, false, value);
    return;
  }
  if (type == gl.FLOAT_MAT3) {
    gl.uniformMatrix3fv(loc, false, value);
    return;
  }
  if (type == gl.FLOAT_MAT4) {
    gl.uniformMatrix4fv(loc, false, value);
    return;
  }
  if (type == gl.SAMPLER_2D || type == gl.SAMPLER_CUBE) {
    gl.uniform1i(loc, value);
    return;
  }
}

/**
 * Enables the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
pixelInspector.enable = function(gl) {
    this.blendProp = gl.getParameter(gl.BLEND);
    gl.enable(gl.BLEND);

    this.blendFuncSFactor = gl.getParameter(gl.BLEND_SRC_RGB);
    this.blendFuncDFactor = gl.getParameter(gl.BLEND_DST_RGB);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.depthTest = gl.getParameter(gl.DEPTH_TEST);
    gl.disable(gl.DEPTH_TEST);

    this.clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);

    this.switchToProgram(gl);

    this.enabled = true;
}

/**
 * Disable the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
pixelInspector.disable = function(gl) {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;

    if (!this.blendProp) {
      gl.disable(gl.BLEND);
    } else {
      if (this.blendFuncSFactor && this.blendFuncDFactor) {
        gl.blendFunc(this.blendFuncSFactor, this.blendFuncDFactor);
      }
    }

    if (this.depthTest) {
      gl.enable(gl.DEPTH_TEST);
    }

    if (this.clearColor) {
      gl.clearColor.apply(gl, this.clearColor);
    }

    var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    if (currentProgram.__uuid in this.originalPrograms) {
      var newProgram = this.originalPrograms[currentProgram.__uuid];
      gl.useProgram(newProgram);
      this.copyUniforms(gl, currentProgram, newProgram);
    }
}

/**
 * Copies uniforms from oldProgram to newProgram
 */
pixelInspector.copyUniforms = function(gl, oldProgram, program) {
  var activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  this.locationMap[program.__uuid] = {};

  for (var i=0; i < activeUniforms; i++) {
      var uniform = gl.getActiveUniform(program, i);
      var oldLocation = gl.getUniformLocation(oldProgram, uniform.name);
      var newLocation = gl.getUniformLocation(program, uniform.name);
      if (!oldLocation) {
        continue;
      }
      this.locationMap[program.__uuid][oldLocation.__uuid] = newLocation;

      uniform.loc = newLocation;
      uniform.value = gl.getUniform(oldProgram, oldLocation);
      if (uniform.value != null) {
        this.applyUniform(gl, uniform);
      }
  }
}

/**
 * Copies attributes from oldProgram to newProgram
 */
pixelInspector.copyAttributes = function(gl, oldProgram, program) {
  var activeAttributes = gl.getProgramParameter(oldProgram, gl.ACTIVE_ATTRIBUTES);

  for (var i=0; i < activeAttributes; i++) {
      var attribute = gl.getActiveAttrib(oldProgram, i);

      gl.bindAttribLocation(program, attribute.index, attribute.name);
      if (attribute.size > 1) {
        gl.vertexAttribPointer(attribute.index, attribute.size, attribute.type, attribute.normalized, attribute.stride, attribute.offset);
      }

      gl.enableVertexAttribArray(attribute.index);
  }
}

/**
 * Switches the current program to the pixel inspector program
 */
pixelInspector.switchToProgram = function(gl) {
  var oldProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  var program = this.getProgram(gl, oldProgram);
  this.originalPrograms[program.__uuid] = oldProgram;
  this.switchProgram(gl, oldProgram, program);
}

/**
 * Switches the current program and copies over location and attribute data
 */
pixelInspector.switchProgram = function(gl, oldProgram, program) {
  if (!this.enabled) {
    return;
  }
  gl.useProgram(program);
  this.copyUniforms(gl, oldProgram, program);
  this.copyAttributes(gl, oldProgram, program);
  // TODO: Swap attributes!
}

pixelInspector.hasProgram = function(program) {
  return this.programs.indexOf(program.__uuid) >= 0;
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Fragment Shader
 */
pixelInspector.getFragShader = function(gl) {
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    var shaderStr = 'precision mediump float;' +
        'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
        '}';

    gl.shaderSource(fragShader, shaderStr);
    gl.compileShader(fragShader);

    return fragShader;
}

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram.__uuid} Pixel Inspector Progam
 */
pixelInspector.getProgram = function(gl, originalProgram) {
    if (originalProgram.__uuid in this.programsMap) {
        return this.programsMap[originalProgram.__uuid];
    }

    var program = gl.createProgram();

    gl.attachShader(program, this.vertexShaders[originalProgram.__uuid]);
    gl.attachShader(program, this.getFragShader(gl));
    gl.linkProgram(program);
    gl.validateProgram(program);

    this.programs.push(program.__uuid);
    this.programsMap[originalProgram.__uuid] = program;

    return program;
}

pixelInspector.storeShaders = function(gl, program, shader) {
  var shaderType = gl.getShaderParameter(shader, gl.SHADER_TYPE);

  // TODO: verify valid input
  // store vertex shaders associated with program
  if (shaderType == gl.VERTEX_SHADER) {
    this.vertexShaders[program.__uuid] = shader;
  } else {
    this.fragmentShaders[program.__uuid] = shader;
  }
}

pixelInspector.saveStates = function(gl, arg, truth) {
  if (this.enabled) {
    if (arg == gl.DEPTH_TEST) {
      this.depthTest = truth;
      return true;
    } else if (arg == gl.BLEND) {
      this.blendProp = truth;
      return true;
    }
  }
  return this.enabled;
}

pixelInspector.storeBlendStates = function(sFactor, dFactor) {
  if (this.enabled) {
    this.blendFuncSFactor = sFactor;
    this.blendFuncDFactor = dFactor;
  }
  return this.enabled;
}

pixelInspector.storeClearColorStates = function(args) {
  // TODO: verify valid input
  if (this.enabled) {
    this.clearColor = args;
  }
  return this.enabled;
}

pixelInspector.uniforms = function(gl, args) {
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
      args[0] = gl.getParameter(gl.CURRENT_PROGRAM);
    }
  }
  return args;
}

pixelInspector.hasUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return (name in this.programUniformLocations[program.__uuid]);
}

pixelInspector.getUniformLocation = function(program, name) {
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  return this.programUniformLocations[program.__uuid][name];
}

pixelInspector.setUniformLocation = function(program, name, location) {
  location.__uuid = glpHelpers.guid();
  if (!(program.__uuid in this.programUniformLocations)) {
    this.programUniformLocations[program.__uuid] = {}
  }
  this.programUniformLocations[program.__uuid][name] = location;
  return location;
}

pixelInspector.remapLocations = function(gl, args) {
  if (this.enabled) {
    if (args[0] && this.programs.indexOf(gl.getParameter(gl.CURRENT_PROGRAM).__uuid) >= 0) {
      args[0] = this.locationMap[gl.getParameter(gl.CURRENT_PROGRAM).__uuid][args[0].__uuid];
    }
  }
  return args
}

return pixelInspector;
}());
