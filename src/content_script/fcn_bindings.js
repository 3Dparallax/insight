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
          this.glpVertexShaders[program.__uuid] = shader;
        } else {
          this.glpFragmentShaders[program.__uuid] = shader;
        }

        return original.apply(this, args);
    },
    enable: function(original, args, name) {
        // glpPixelInspector: save BLEND and DEPTH_TEST state
        if (this.glpPixelInspectorEnabled) {
          if (args[0] == this.DEPTH_TEST) {
            this.glpPixelInspectorDepthTest = true;
            return;
          } else if (args[0] == this.BLEND) {
            this.glpPixelInspectorBlendProp = true;
            return;
          }
        }

        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        // glpPixelInspector: save BLEND and DEPTH_TEST state
        if (this.glpPixelInspectorEnabled) {
          if (args[0] == this.DEPTH_TEST) {
            this.glpPixelInspectorDepthTest = false;
            return;
          } else if (args[0] == this.BLEND) {
            this.glpPixelInspectorBlendProp = false;
            return;
          }
        }

        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        // glpPixelInspector: save blendFunc state
        // TODO: verify valid input
        if (this.glpPixelInspectorEnabled) {
            this.glpPixelInspectorBlendFuncSFactor = args[0];
            this.glpPixelInspectorBlendFuncDFactor = args[1];
            return;
        }

        return original.apply(this, args);
    },
    clearColor: function(original, args, name) {
        // glpPixelInspector: save clear color state
        // TODO: verify valid input
        if (this.glpPixelInspectorEnabled) {
          this.glpPixelInspectorClearColor = args;
          return;
        }

        return original.apply(this, args);
    },
    useProgram: function(original, args, name) {
        // glpPixelInspector: replace the program with pixel inspector program
        // TODO: Handle case where program provided is the pixel inspector program
        // TODO: verify valid input
        var program = args[0];

        if (this.glpProgramDuplicateDetectionEnabled) {
          var currentProgram = this.getParameter(this.CURRENT_PROGRAM);
          if( currentProgram != undefined &&
              currentProgram.__uuid != undefined &&
              currentProgram.__uuid == program.__uuid ) {
            /*
             * callStack gets the current call stack information up to this point
             */
            var callStack = glpGetStack();
            var userStack = glpGetFirstUserStack(callStack);
            var lineNumber = ""
            var functionName = "";
            if (userStack != null) {
              lineNumber = userStack.getLineNumber();
              // Sometimes the function name can be undefined if
              // it's called from a global scope or from an object
              if (userStack.getFunctionName() != undefined) {
                functionName = userStack.getFunctionName()
              }

              fileName = userStack.getFileName();
            }
            this.glpProgramDuplicatesList.push({"programId" : program.__uuid,
                                                "lineNumber" : lineNumber,
                                                "functionName" : functionName,
                                                "fileName" : fileName})
          }
        }

        var retVal = original.apply(this, args);

        if (this.glpPixelInspectorEnabled && this.glpPixelInspectorPrograms.indexOf(program.__uuid) < 0) {
          this.glpSwitchToPixelInspectorProgram()
        }

        if (this.glpProgramUsageCounterEnabled) {
          if (this.glpProgramUsageCountProgramUsages[program.__uuid] != undefined) {
            this.glpProgramUsageCountProgramUsages[program.__uuid]++;
          } // else happens when they didn't call create program, which shouldn't happen
        }

        return retVal;
    },
    getUniform: function(original, args, name) {
      if (this.glpPixelInspectorEnabled) {
        var program = args[0];
        var location = args[1];
        if (this.glpPixelInspectorPrograms.indexOf(program.__uuid) >= 0) {
          if (location in this.glpPixelInspectorLocationMap[program.__uuid]) {
            // the program is the pixel inspector version and we're using the original location
            args[1] = this.glpPixelInspectorLocationMap[program.__uuid][location.__uuid];
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

      // If the user creates the program but never uses it, we want to return a 0
      this.glpProgramUsageCountProgramUsages[program.__uuid] = 0;

      return program;
    },
    getUniformLocation: function(original, args, name) {
      var program = args[0];
      var n = args[1];
      if (!(program.__uuid in this.glpProgramUniformLocations)) {
        this.glpProgramUniformLocations[program.__uuid] = {}
      }
      if (!(n in this.glpProgramUniformLocations[program.__uuid])) {
        var location = original.apply(this, args);
        if (!location) {
          return;
        }
        location.__uuid = guid();
        this.glpProgramUniformLocations[program.__uuid][n] = location;
        return location;
      }

      return this.glpProgramUniformLocations[program.__uuid][n];
    },
}

var glpUniformFcn = function(original, args, name) {
  if (this.glpPixelInspectorEnabled) {
    if (args[0] && this.glpPixelInspectorPrograms.indexOf(this.getParameter(this.CURRENT_PROGRAM).__uuid) >= 0) {
      args[0] = this.glpPixelInspectorLocationMap[this.getParameter(this.CURRENT_PROGRAM).__uuid][args[0].__uuid];
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
