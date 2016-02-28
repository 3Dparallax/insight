
// Overdraw Inspector variables
WebGLRenderingContext.prototype.glpPixelInspectorBlendProp = null;
WebGLRenderingContext.prototype.glpPixelInspectorBlendFuncSFactor = null;
WebGLRenderingContext.prototype.glpPixelInspectorBlendFuncDFactor = null;
WebGLRenderingContext.prototype.glpPixelInspectorDepthTest = null;
WebGLRenderingContext.prototype.glpPixelInspectorClearColor = null;
WebGLRenderingContext.prototype.glpVertexShaders = {};
WebGLRenderingContext.prototype.glpFragmentShaders = {};
WebGLRenderingContext.prototype.glpPixelInspectorPrograms = [];
WebGLRenderingContext.prototype.glpPixelInspectorProgramsMap = {};
WebGLRenderingContext.prototype.glpProgramUniformLocations = {};
WebGLRenderingContext.prototype.glpPixelInspectorOriginalPrograms = {};
WebGLRenderingContext.prototype.glpPixelInspectorLocationMap = {};
WebGLRenderingContext.prototype.glpPixelInspectorEnabled = false;

/**
 * Applies uniform to WebGL context
 */
WebGLRenderingContext.prototype.glpApplyUniform = function (uniform) {
  var loc = uniform.loc;
  var type = uniform.type;
  var value = uniform.value;
  if (type == this.FLOAT) {
    this.uniform1f(loc, value);
    return;
  }
  if (type == this.FLOAT_VEC2) {
    this.uniform2fv(loc, value);
    return;
  }
  if (type == this.FLOAT_VEC3) {
    this.uniform3fv(loc, value);
    return;
  }
  if (type == this.FLOAT_VEC4) {
    this.uniform4fv(loc, value);
    return;
  }
  if (type == this.INT) {
    this.uniform1i(loc, value);
    return;
  }
  if (type == this.INT_VEC2) {
    this.uniform2iv(loc, value);
    return;
  }
  if (type == this.INT_VEC3) {
    this.uniform3iv(loc, value);
    return;
  }
  if (type == this.INT_VEC4) {
    this.uniform4iv(loc, value);
    return;
  }
  if (type == this.BOOL) {
    this.uniform1i(loc, value);
    return;
  }
  if (type == this.BOOL_VEC2) {
    this.uniform2iv(loc, value);
    return;
  }
  if (type == this.BOOL_VEC3) {
    this.uniform3iv(loc, value);
    return;
  }
  if (type == this.BOOL_VEC4) {
    this.uniform4iv(loc, value);
    return;
  }
  if (type == this.FLOAT_MAT2) {
    this.uniformMatrix2fv(loc, false, value);
    return;
  }
  if (type == this.FLOAT_MAT3) {
    this.uniformMatrix3fv(loc, false, value);
    return;
  }
  if (type == this.FLOAT_MAT4) {
    this.uniformMatrix4fv(loc, false, value);
    return;
  }
  if (type == this.SAMPLER_2D || type == this.SAMPLER_CUBE) {
    this.uniform1i(loc, value);
    return;
  }
}

/**
 * Enables the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
WebGLRenderingContext.prototype.glpEnablePixelInspector = function() {
    this.glpPixelInspectorBlendProp = this.getParameter(this.BLEND);
    this.enable(this.BLEND);

    this.glpPixelInspectorBlendFuncSFactor = this.getParameter(this.BLEND_SRC_RGB);
    this.glpPixelInspectorBlendFuncDFactor = this.getParameter(this.BLEND_DST_RGB);
    this.blendFunc(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA);

    this.glpPixelInspectorDepthTest = this.getParameter(this.DEPTH_TEST);
    this.disable(this.DEPTH_TEST);

    this.glpPixelInspectorClearColor = this.getParameter(this.COLOR_CLEAR_VALUE);
    this.clearColor(0.0, 1.0, 0.0, 1.0);

    this.glpSwitchToPixelInspectorProgram();

    this.glpPixelInspectorEnabled = true;
}

/**
 * Disable the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
WebGLRenderingContext.prototype.glpDisablePixelInspector = function() {
    if (!this.glpPixelInspectorEnabled) {
      return;
    }
    this.glpPixelInspectorEnabled = false;

    if (!this.glpPixelInspectorBlendProp) {
      this.disable(this.BLEND);
    } else {
      if (this.glpPixelInspectorBlendFuncSFactor && this.glpPixelInspectorBlendFuncDFactor) {
        this.blendFunc(this.glpPixelInspectorBlendFuncSFactor, this.glpPixelInspectorBlendFuncDFactor);
      }
    }

    if (this.glpPixelInspectorDepthTest) {
      this.enable(this.DEPTH_TEST);
    }

    if (this.glpPixelInspectorClearColor) {
      this.clearColor.apply(this, this.glpPixelInspectorClearColor);
    }

    var currentProgram = this.getParameter(this.CURRENT_PROGRAM);
    if (currentProgram.__uuid in this.glpPixelInspectorOriginalPrograms) {
      var newProgram = this.glpPixelInspectorOriginalPrograms[currentProgram.__uuid];
      this.useProgram(newProgram);
      this.glpCopyUniforms(currentProgram, newProgram);
    }
}

/**
 * Copies uniforms from oldProgram to newProgram
 */
WebGLRenderingContext.prototype.glpCopyUniforms = function(oldProgram, program) {
  var activeUniforms = this.getProgramParameter(program, this.ACTIVE_UNIFORMS);
  this.glpPixelInspectorLocationMap[program.__uuid] = {};

  for (var i=0; i < activeUniforms; i++) {
      var uniform = this.getActiveUniform(program, i);
      var oldLocation = this.getUniformLocation(oldProgram, uniform.name);
      var newLocation = this.getUniformLocation(program, uniform.name);
      if (!oldLocation) {
        continue;
      }
      this.glpPixelInspectorLocationMap[program.__uuid][oldLocation.__uuid] = newLocation;

      uniform.loc = newLocation;
      uniform.value = this.getUniform(oldProgram, oldLocation);
      if (uniform.value != null) {
        this.glpApplyUniform(uniform);
      }
  }
}

/**
 * Copies attributes from oldProgram to newProgram
 */
WebGLRenderingContext.prototype.glpCopyAttributes = function(oldProgram, program) {
  var activeAttributes = this.getProgramParameter(oldProgram, this.ACTIVE_ATTRIBUTES);

  for (var i=0; i < activeAttributes; i++) {
      var attribute = this.getActiveAttrib(oldProgram, i);

      this.bindAttribLocation(program, attribute.index, attribute.name);
      if (attribute.size > 1) {
        this.vertexAttribPointer(attribute.index, attribute.size, attribute.type, attribute.normalized, attribute.stride, attribute.offset);
      }

      this.enableVertexAttribArray(attribute.index);
  }
}

/**
 * Switches the current program to the pixel inspector program
 */
WebGLRenderingContext.prototype.glpSwitchToPixelInspectorProgram = function() {
  var oldProgram = this.getParameter(this.CURRENT_PROGRAM);
  var program = this.glpGetPixelInspectorProgram(oldProgram);
  this.glpPixelInspectorOriginalPrograms[program.__uuid] = oldProgram;
  this.glpSwitchToProgram(oldProgram, program);
}

/**
 * Switches the current program and copies over location and attribute data
 */
WebGLRenderingContext.prototype.glpSwitchToProgram = function(oldProgram, program) {
  this.useProgram(program);
  this.glpCopyUniforms(oldProgram, program);
  this.glpCopyAttributes(oldProgram, program);
  // TODO: Swap attributes!
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Fragment Shader
 */
WebGLRenderingContext.prototype.glpGetPixelInspectFragShader = function() {
    var pixelInspectFragShader = this.createShader(this.FRAGMENT_SHADER);
    var shaderStr = 'precision mediump float;' +
        'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
        '}';

    this.shaderSource(pixelInspectFragShader, shaderStr);
    this.compileShader(pixelInspectFragShader);

    return pixelInspectFragShader;
}

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram.__uuid} Pixel Inspector Progam
 */
WebGLRenderingContext.prototype.glpGetPixelInspectorProgram = function(originalProgram) {
    if (originalProgram.__uuid in this.glpPixelInspectorProgramsMap) {
        return this.glpPixelInspectorProgramsMap[originalProgram.__uuid];
    }

    var program = this.createProgram();

    this.attachShader(program, this.glpVertexShaders[originalProgram.__uuid]);
    this.attachShader(program, this.glpGetPixelInspectFragShader());
    this.linkProgram(program);
    this.validateProgram(program);

    this.glpPixelInspectorPrograms.push(program.__uuid);
    this.glpPixelInspectorProgramsMap[originalProgram.__uuid] = program;

    return program;
}
