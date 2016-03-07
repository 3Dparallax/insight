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
      return original.apply(this, args);
    },
    enable: function(original, args, name) {
        if (this.glp().pixelInspector.saveStates(args[0], true)) {
          return;
        }

        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        if (this.glp().pixelInspector.saveStates(args[0], false)) {
          return;
        }

        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        // TODO: verify valid input
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
        return original.apply(this, args);
    },
    useProgram: function(original, args, name) {
        // glpPixelInspector: replace the program with pixel inspector program
        // TODO: Handle case where program provided is the pixel inspector program
        // TODO: verify valid input
        var program = args[0];

        this.glp().duplicateProgramDetection.useProgramCalled(program);

        var retVal = original.apply(this, args);
        if (!this.glp().pixelInspector.hasProgram(program)) {
          this.glp().pixelInspector.switchToProgram();
        }

        this.glp().programUsageCounter.addUsage(program);

        return retVal;
    },
    getUniform: function(original, args, name) {
      args = this.glp().pixelInspector.uniforms(args);
      return original.apply(this, args);
    },
    createProgram: function(original, args, name) {
      var program = original.apply(this, args);
      program.__uuid = glpHelpers.guid();
      return program;
    },
    getUniformLocation: function(original, args, name) {
      var program = args[0];
      var n = args[1];
      if (!(this.glp().pixelInspector.hasUniformLocation(program, n))) {
        var location = original.apply(this, args);
        if (!location) {
          return;
        }
        return this.glp().pixelInspector.setUniformLocation(program, n, location);
      }
      return this.glp().pixelInspector.getUniformLocation(program, n);
    },
    createTexture : function(original, args, name) {
      var texture = original.apply(this, args);
      return this.glp().textureViewer.pushTexture(texture);
    },
    bindTexture : function(original, args, name) {
      this.glp().textureViewer.bindTexture(args[1]);
      return original.apply(this, args);
    },
    unbindTexture : function(original, args, name) {
      this.glp().textureViewer.unbindTexture();
      return original.apply(this, args);
    },
    texImage2D : function(original, args, name) {
      this.glp().textureViewer.texImage2D(args);
      return original.apply(this, args);
    },
    texParameteri : function(original, args, name) {
      this.glp().textureViewer.texParameteri(args);
      return original.apply(this, args);
    },
    createBuffer: function(original, args, name) {
      var buffer = original.apply(this, args);
      return this.glp().bufferViewer.pushBuffer(buffer);
    },
    createFrameBuffer: function(original, args, name) {
      var buffer = original.apply(this, args);
      return this.glp().bufferViewer.pushFrameBuffer(buffer);
    },
    createRenderBuffer: function(original, args, name) {
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
}

var glpUniformFcn = function(original, args, name) {
  args = this.glp().pixelInspector.remapLocations(args);
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
