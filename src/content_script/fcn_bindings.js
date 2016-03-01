/*
 * Define all glp functions to be bound
*/
var glpFcnBindings = {
    // The default function is called first before all other method calls
    default: function(original, args, name) {
        if (this.glpCallstackEnabled) {
          var d = new Date();
          var timeString = d.getHours() + ":"
              + ('00'+d.getMinutes()).substring(d.getMinutes().toString().length) + ":"
              + ('00'+d.getSeconds()).substring(d.getSeconds().toString().length) + "."
              + ('000'+d.getMilliseconds()).substring(d.getMilliseconds().toString().length);
            var callDetails = [name, JSON.stringify(args), window.performance.now(), timeString];

            if (this.glpMostRecentCalls.length > this.glpCallstackMaxSize) {
              this.glpMostRecentCalls.shift();
            }
            this.glpMostRecentCalls.push(callDetails);

            var lastFunction = this.glpCallsSinceDraw[this.glpCallsSinceDraw.length - 1];
            if (lastFunction &&
                (lastFunction[0] == "drawElements" || lastFunction[0] == "drawArrays")) {
              this.glpCallsSinceDraw = [];
            }
            this.glpCallsSinceDraw.push(callDetails);
        }
        if (this.glpFunctionHistogramEnabled) {
          if (!this.glpFunctionHistogram) {
            this.glpFunctionHistogram = {};
          }
          if (!this.glpFunctionHistogram[name]) {
            this.glpFunctionHistogram[name] = 1;
          } else {
            this.glpFunctionHistogram[name] += 1;
          }
        }
        var ret = original.apply(this, args);
        if (this.glpCallstackEnabled) {
          var endTime = window.performance.now();
          if (this.glpCallsSinceDraw.length > 0) {
            var i = this.glpCallsSinceDraw.length - 1
            // Most of the time we just need to update the last element on the stack,
            // but there are rare cases of nesting where we have to trace backwards
            while (i > 0 && this.glpCallsSinceDraw[i][0] != name) {
              i--;
            }
            // "| 0" truncates to an int.  "+ 0.5" is for rounding
            this.glpCallsSinceDraw[i][2] = (((endTime - this.glpCallsSinceDraw[i][2]) * 1000) + 0.5) | 0
          }
        }
        return ret;
    },
    attachShader : function(original, args, name) {
        var program = args[0];
        var shader = args[1];
        var shaderType = this.getShaderParameter(shader, this.SHADER_TYPE);

        // TODO: verify valid input
        // glpPixelInspector: store vertex shaders associated with program
        if (shaderType == this.VERTEX_SHADER) {
          this.glp.pixelInspector.vertexShaders[program.__uuid] = shader;
        } else {
          this.glp.pixelInspector.fragmentShaders[program.__uuid] = shader;
        }

        return original.apply(this, args);
    },
    enable: function(original, args, name) {
        // glpPixelInspector: save BLEND and DEPTH_TEST state
        if (this.glp.pixelInspector.enabled) {
          if (args[0] == this.DEPTH_TEST) {
            this.glp.pixelInspector.depthTest = true;
            return;
          } else if (args[0] == this.BLEND) {
            this.glp.pixelInspector.blendProp = true;
            return;
          }
        }

        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        // glpPixelInspector: save BLEND and DEPTH_TEST state
        if (this.glp.pixelInspector.enabled) {
          if (args[0] == this.DEPTH_TEST) {
            this.glp.pixelInspector.depthTest = false;
            return;
          } else if (args[0] == this.BLEND) {
            this.glp.pixelInspector.blendProp = false;
            return;
          }
        }

        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        // glpPixelInspector: save blendFunc state
        // TODO: verify valid input
        if (this.glp.pixelInspector.enabled) {
            this.glp.pixelInspector.blendFuncSFactor = args[0];
            this.glp.pixelInspector.blendFuncDFactor = args[1];
            return;
        }

        return original.apply(this, args);
    },
    clearColor: function(original, args, name) {
        // glpPixelInspector: save clear color state
        // TODO: verify valid input
        if (this.glp.pixelInspector.enabled) {
          this.glp.pixelInspector.clearColor = args;
          return;
        }

        return original.apply(this, args);
    },
    useProgram: function(original, args, name) {
        // glpPixelInspector: replace the program with pixel inspector program
        // TODO: Handle case where program provided is the pixel inspector program
        // TODO: verify valid input
        var program = args[0];

        if (this.glp.duplicateProgramDetection.enabled) {
          this.glp.duplicateProgramDetection.useProgramCalled(this, program);
        }

        var retVal = original.apply(this, args);

        if (this.glp.pixelInspector.enabled && this.glp.pixelInspector.programs.indexOf(program.__uuid) < 0) {
          this.glp.pixelInspector.switchToProgram(this);
        }

        if (this.glp.programUsageCounter.enabled) {
          if (this.glp.programUsageCounter.usages[program.__uuid] != undefined) {
            this.glp.programUsageCounter.usages[program.__uuid] += 1;
          } else {
            this.glp.programUsageCounter.usages[program.__uuid] = 1;
          }
        }

        return retVal;
    },
    getUniform: function(original, args, name) {
      if (this.glp.pixelInspector.enabled) {
        var program = args[0];
        var location = args[1];
        if (this.glp.pixelInspector.programs.indexOf(program.__uuid) >= 0) {
          if (location in this.glp.pixelInspector.locationMap[program.__uuid]) {
            // the program is the pixel inspector version and we're using the original location
            args[1] = this.glp.pixelInspector.locationMap[program.__uuid][location.__uuid];
          } else {
          }
        } else {
          // the program is not a pixel inspector
          // if they're using the wrong location, lets just swap programs
          args[0] = this.getParameter(this.CURRENT_PROGRAM);
        }
      }
      return original.apply(this, args);
    },
    createProgram: function(original, args, name) {
      var program = original.apply(this, args);
      program.__uuid = guid();
      return program;
    },
    getUniformLocation: function(original, args, name) {
      var program = args[0];
      var n = args[1];
      if (!(program.__uuid in this.glp.pixelInspector.programUniformLocations)) {
        this.glp.pixelInspector.programUniformLocations[program.__uuid] = {}
      }
      if (!(n in this.glp.pixelInspector.programUniformLocations[program.__uuid])) {
        var location = original.apply(this, args);
        if (!location) {
          return;
        }
        location.__uuid = guid();
        this.glp.pixelInspector.programUniformLocations[program.__uuid][n] = location;
        return location;
      }

      return this.glp.pixelInspector.programUniformLocations[program.__uuid][n];
    },
    createTexture : function(original, args, name) {
        var texture = original.apply(this, args);
        this.glp.textureViewer.textures.push(texture);
        return texture;
    },

}

var glpUniformFcn = function(original, args, name) {
  if (this.glp.pixelInspector.enabled) {
    if (args[0] && this.glp.pixelInspector.programs.indexOf(this.getParameter(this.CURRENT_PROGRAM).__uuid) >= 0) {
      args[0] = this.glp.pixelInspector.locationMap[this.getParameter(this.CURRENT_PROGRAM).__uuid][args[0].__uuid];
    }
  }
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
