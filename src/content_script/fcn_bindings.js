/*
 * Define all glp functions to be bound
*/
var glpFcnBindings = {
    // The default function is called first before all other method calls
    default: function(original, args, name) {
      this.glp().callStack.push(name, args);
      this.glp().histogram.add(name);
      var ret = original.apply(this, args);
      this.glp().callStack.update(name);
      return ret;
    },
    attachShader : function(original, args, name) {
      this.glp().pixelInspector.storeShaders(args[0], args[1]);
      this.glp().depthInspector.storeShaders(args[0], args[1]);
      return original.apply(this, args);
    },
    enable: function(original, args, name) {
        if (this.glp().stateTracker.freezeStates(args[0], true)) {
          return;
        }
        if (this.glp().pixelInspector.saveStates(args[0], true)) {
          return;
        }

        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        if (this.glp().stateTracker.freezeStates(args[0], false)) {
          return;
        }
        if (this.glp().pixelInspector.saveStates(args[0], false)) {
          return;
        }

        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        // TODO: verify valid input
        if (this.glp().stateTracker.freezeStates(this.BLEND_SRC_RGB, args[0])) {
          return;
        }
        if (this.glp().stateTracker.freezeStates(this.BLEND_DST_RGB, args[1])) {
          return;
        }
        if (this.glp().pixelInspector.storeBlendStates(args[0], args[1])) {
          return;
        }
        return original.apply(this, args);
    },
    blendFuncSeparate: function(original, args, name) {
        // TODO: verify valid input
        if (this.glp().stateTracker.freezeStates(this.BLEND_SRC_RGB, args[0])) {
          return;
        }
        if (this.glp().stateTracker.freezeStates(this.BLEND_DST_RGB, args[1])) {
          return;
        }
        if (this.glp().stateTracker.freezeStates(this.BLEND_SRC_ALPHA, args[2])) {
          return;
        }
        if (this.glp().stateTracker.freezeStates(this.BLEND_DST_ALPHA, args[3])) {
          return;
        }
        if (this.glp().pixelInspector.storeBlendStates(args[0], args[1])) {
          return;
        }
        return original.apply(this, args);
    },
    clearColor: function(original, args, name) {
        // TODO: verify valid input
        if (this.glp().pixelInspector.storeClearColorStates(args)) {
          return;
        }
        if (this.glp().depthInspector.storeClearColorStates(args)) {
          return;
        }
        return original.apply(this, args);
    },
    useProgram: function(original, args, name) {
        // glpPixelInspector: replace the program with pixel inspector program
        // TODO: Handle case where program provided is the pixel inspector program
        // TODO: verify valid input
        var program = args[0];

        this.glp().duplicateProgramDetection.useProgramCalled(program);

        var retVal = original.apply(this, args);
        if (program && this.glp().pixelInspector.enabled && !this.glp().pixelInspector.hasProgram(program)) {
          this.glp().pixelInspector.switchToProgram();
        }
        if (program && this.glp().depthInspector.enabled && !this.glp().depthInspector.hasProgram(program)) {
          this.glp().depthInspector.switchToProgram();
        }

        this.glp().programUsageCounter.addUsage(program);

        return retVal;
    },
    getUniform: function(original, args, name) {
      args = this.glp().depthInspector.uniforms(args);
      args = this.glp().pixelInspector.uniforms(args);
      return original.apply(this, args);
    },
    createProgram: function(original, args, name) {
      var program = original.apply(this, args);
      program.__uuid = glpHelpers.guid();
      this.glp().shaderViewer.addProgram(program);
      return program;
    },
    getUniformLocation: function(original, args, name) {
      var program = args[0];
      var n = args[1];
      if (!(this.glp().pixelInspector.hasUniformLocation(program, n))) {
        var location = original.apply(this, args);
        if (!location) {
          return location;
        }
        return this.glp().pixelInspector.setUniformLocation(program, n, location);
      }
      if (!(this.glp().depthInspector.hasUniformLocation(program, n))) {
        var location = original.apply(this, args);
        if (!location) {
          return location;
        }
        return this.glp().depthInspector.setUniformLocation(program, n, location);
      }
      return this.glp().pixelInspector.getUniformLocation(program, n);
    },
    createTexture : function(original, args, name) {
      var texture = original.apply(this, args);
      this.glp().textureViewer.pushTexture(texture);
      this.glp().mipmapViewer.pushTextureKey(texture);
      return texture;
    },
    bindTexture : function(original, args, name) {
      this.glp().textureViewer.bindTexture(args[0], args[1]);
      this.glp().mipmapViewer.updateActiveTexture(args[1]);
      return original.apply(this, args);
    },
    unbindTexture : function(original, args, name) {
      this.glp().textureViewer.unbindTexture();
      return original.apply(this, args);
    },
    texImage2D : function(original, args, name) {
      this.glp().textureViewer.texImage2D(args);
      this.glp().mipmapViewer.texImage2D(original, args);
      return original.apply(this, args);
    },
    texSubImage2D : function(original, args, name) {
      this.glp().textureViewer.texSubImage2D(args);
      this.glp().mipmapViewer.texSubImage2D(original, args);
      return original.apply(this, args);
    },
    texParameteri : function(original, args, name) {
      this.glp().textureViewer.texParameteri(args);
      this.glp().mipmapViewer.storeFunctions(original, args);
      return original.apply(this, args);
    },
    texParameterf : function(original, args, name) {
      this.glp().textureViewer.texParameterf(args);
      this.glp().mipmapViewer.storeFunctions(original, args);
      return original.apply(this, args);
    },
    createBuffer: function(original, args, name) {
      var buffer = original.apply(this, args);
      return this.glp().bufferViewer.pushBuffer(buffer);
    },
    createFramebuffer: function(original, args, name) {
      var buffer = original.apply(this, args);
      return this.glp().bufferViewer.pushFrameBuffer(buffer);
    },
    createRenderbuffer: function(original, args, name) {
      var buffer = original.apply(this, args);
      return this.glp().bufferViewer.pushRenderBuffer(buffer);
    },
    bindBuffer: function(original, args, name) {
      this.glp().bufferViewer.bindBuffer(args[1]);
      return original.apply(this, args);
    },
    unbindBuffer: function(original, args, name) {
      this.glp().bufferViewer.unbindBuffer();
      return original.apply(this, args);
    },
    bufferData: function(original, args, name) {
      this.glp().bufferViewer.bufferData(args);
      return original.apply(this, args);
    },
    bufferSubData: function(original, args, name) {
      this.glp().bufferViewer.bufferSubData(args);
      return original.apply(this, args);
    },
    deleteBuffer: function(original, args, name) {
      this.glp().bufferViewer.deleteBuffer(args[0]);
      return original.apply(this, args);
    },
    bindFramebuffer: function(original, args, name) {
      this.glp().bufferViewer.bindFramebuffer(args[1]);
      return original.apply(this, args);
    },
    unbindFramebuffer: function(original, args, name) {
      this.glp().bufferViewer.unbindFramebuffer();
      return original.apply(this, args);
    },
    deleteFramebuffer: function(original, args, name) {
      this.glp().bufferViewer.deleteFramebuffer(args[0]);
      return original.apply(this, args);
    },
    framebufferRenderbuffer: function(original, args, name) {
      this.glp().bufferViewer.framebufferRenderbuffer(args);
      return original.apply(this, args);
    },
    framebufferTexture2D: function(original, args, name) {
      this.glp().bufferViewer.framebufferTexture2D(args);
      return original.apply(this, args);
    },
    bindRenderbuffer: function(original, args, name) {
      this.glp().bufferViewer.bindRenderbuffer(args[1]);
      return original.apply(this, args);
    },
    unbindRenderbuffer: function(original, args, name) {
      this.glp().bufferViewer.unbindRenderbuffer();
      return original.apply(this, args);
    },
    deleteRenderbuffer: function(original, args, name) {
      this.glp().bufferViewer.deleteRenderbuffer(args[0]);
      return original.apply(this, args);
    },
    pixelStorei: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(args[0], args[1])) {
        return;
      }
      return original.apply(this, args);
    },
    depthMask: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.DEPTH_WRITEMASK, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    clearDepth: function(original, args, name) {
      // range = [0,1]
      if (this.glp().stateTracker.freezeStates(this.DEPTH_CLEAR_VALUE, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    lineWidth: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.LINE_WIDTH, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    polygonOffset: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.POLYGON_OFFSET_FACTOR, args[0])) {
        return;
      }
      if (this.glp().stateTracker.freezeStates(this.POLYGON_OFFSET_UNITS, args[1])) {
        return;
      }
      return original.apply(this, args);
    },
    stencilFunc: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.STENCIL_REF, args[1])) {
        return;
      }
      return original.apply(this, args);
    },
    stencilFuncSeparate: function(original, args, name) {
      if (this.glp().stateTracker.freezeStencilStates(args[0], args[2])) {
        return;
      }
      return original.apply(this, args);
    },
    blendEquationSeparate: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.BLEND_EQUATION_RGB, args[0])) {
        return;
      }
      if (this.glp().stateTracker.freezeStates(this.BLEND_EQUATION_ALPHA, args[1])) {
        return;
      }
      return original.apply(this, args);
    },
    cullFace: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.CULL_FACE_MODE, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    depthFunc: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.DEPTH_FUNC, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    frontFace: function(original, args, name) {
      if (this.glp().stateTracker.freezeStates(this.FRONT_FACE, args[0])) {
        return;
      }
      return original.apply(this, args);
    },
    generateMipmap: function(original, args, name) {
      this.glp().mipmapViewer.generateMipmap(original, args);
      return original.apply(this, args);
    },
}

var glpUniformFcn = function(original, args, name) {
  args = this.glp().pixelInspector.remapLocations(args);
  args = this.glp().depthInspector.remapLocations(args);
  return original.apply(this, args);
}
var uniformMethods = [
    'uniform1f', 'uniform1fv', 'uniform1i', 'uniform1iv',
    'uniform2f', 'uniform2fv', 'uniform2i', 'uniform2iv',
    'uniform3f', 'uniform3fv', 'uniform3i', 'uniform3iv',
    'uniform4f', 'uniform4fv', 'uniform4i', 'uniform4iv',
    'uniformMatrix2fv', 'uniformMatrix3fv', 'uniformMatrix4fv'
];
for (var i=0; i<uniformMethods.length; i++) {
    glpFcnBindings[uniformMethods[i]] = glpUniformFcn;
}
