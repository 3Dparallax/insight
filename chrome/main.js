var glpVerboseLogs = false;
var glpPixelInspectorEnabled = false;

/**
 * Instantiates messaging with the devtools panel
 */
function glpInit() {
    window.postMessage({ type: "init" }, "*");
}
glpInit();

/**
 * Sends messages to the devtools panel
 * @param {String} Message type
 * @param {Dictionary} Message data
 */
function glpSendMessage(type, data) {
    window.postMessage({ source:"content", data: data}, "*");
}

/**
 * Receive messages from the devtools panel
 */
window.addEventListener('message', function(event) {
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || message.source != "panel") {
    return;
  }

  if (message.type == "pixelInspector") {
    glpPixelInspectorToggle(message.data.enabled);
  } else {
    console.log(message.data);
  }
});

var glpFcnBindings = {
    default: function(original, args, name) {
        if (glpVerboseLogs) {
            console.log("Default Call: " + name)
        }
        return original.apply(this, args);
    },
    attachShader : function(original, args, name) {
        var program = args[0].__uuid;
        var shader = args[1];
        var shaderType = this.getShaderParameter(shader, this.SHADER_TYPE);

        // TODO: verify valid input
        // glpPixelInspector: store shaders associated with program
        if (shaderType == this.FRAGMENT_SHADER) {
          this.glpFragmentShaders[program] = shader;
        } else {
          this.glpVertexShaders[program] = shader;
        }

        return original.apply(this, args);
    },
    enable: function(original, args, name) {
        // glpPixelInspector: save BLEND and DEPTH_TEST state
        if (this.pixelInspectorEnabled) {
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
        if (this.pixelInspectorEnabled) {
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
        if (this.pixelInspectorEnabled) {
            this.glpPixelInspectorBlendFuncSFactor = args[0];
            this.glpPixelInspectorBlendFuncDFactor = args[1];
            return;
        }

        return original.apply(this, args);
    },
    clearColor: function(original, args, name) {
        // glpPixelInspector: save clear color state
        // TODO: verify valid input
        if (this.pixelInspectorEnabled) {
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
        this.glpCurrentProgram = program;

        if (this.pixelInspectorEnabled) {
          args[0] = this.glpGetPixelInspectorProgram(program);
        }

        return original.apply(this, args);
    }
}

/**
 * Toggles the status of the pixel inspector being enabled/disabled
 * @param {Bool} Enabled
 */
function glpPixelInspectorToggle(enabled) {
  var canvases = document.getElementsByTagName("canvas");
  for(var i = 0; i < canvases.length; i++){
    var canvas = canvases[i];
    var webGLContext = canvas.getContext("webgl");
    if (webGLContext == null) {
      return;
    }

    if (enabled) {
      webGLContext.glpEnablePixelInspector();
    } else {
      webGLContext.glpDisablePixelInspector();
    }
  }
}

WebGLRenderingContext.prototype.glpPixelInspectorBlendProp = null;
WebGLRenderingContext.prototype.glpPixelInspectorBlendFuncSFactor = null;
WebGLRenderingContext.prototype.glpPixelInspectorBlendFuncDFactor = null;
WebGLRenderingContext.prototype.glpPixelInspectorDepthTest = null;
WebGLRenderingContext.prototype.glpPixelInspectorClearColor = null;
WebGLRenderingContext.prototype.glpFragmentShaders = {};
WebGLRenderingContext.prototype.glpVertexShaders = {};
WebGLRenderingContext.prototype.glpCurrentProgram = null;

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram} Pixel Inspector Progam
 */
WebGLRenderingContext.prototype.glpGetPixelInspectorProgram = function(originalProgram) {
  var program = this.createProgram();

  this.attachShader(program, this.glpVertexShaders[originalProgram.__uuid]);
  this.attachShader(program, this.glpFragmentShaders[originalProgram.__uuid]);
  this.linkProgram(program);

  // TODO: FIX ORIGINAL -> INSPECTOR PROGRAM TRANSITION
  // TODO: FIX INSPECTOR PROGRAM -> ORIGINAL PROGRAM TRANSITION

  return program;
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

    this.pixelInspectorEnabled = true;
    this.useProgram(this.glpCurrentProgram);
}

/**
 * Disable the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
WebGLRenderingContext.prototype.glpDisablePixelInspector = function() {
    this.pixelInspectorEnabled = false;

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

    if (this.glpCurrentProgram) {
      this.useProgram(this.glpCurrentProgram);
    }
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
WebGLRenderingContext.prototype.glpGetPixelInspectFragShader = function() {
    if (this.glpPixelInspectFragShader) {
        return this.glpPixelInspectFragShader;
    }

    var pixelInspectFragShader = this.createShader(this.FRAGMENT_SHADER);
    var shaderStr = 'precision mediump float;' +
        'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
        '}';

    this.shaderSource(pixelInspectFragShader, shaderStr);
    this.compileShader(pixelInspectFragShader);
    this.glpPixelInspectFragShader = pixelInspectFragShader;

    return pixelInspectFragShader;
}

/**
 * Returns a function that calls newFunc with origFunc and all arguments
 * @param {Function} origFunc
 * @param {Function} newFunc
 * @param {String} name of origFunc
 * @return {Function} boundFunc
 */
function _glpBind(origFunc, newFunc, name) {
    return function() {
        return newFunc.apply(this, [origFunc, arguments, name]);
    }
}

/**
 * Bind WebGLRenderingContext functions to functions found in glpFcnBindings
 * Functions without a binding are bound to the "default function"
 */
for (var name in WebGLRenderingContext.prototype) {
    try {

        if (typeof WebGLRenderingContext.prototype[name] != 'function') {
            continue;
        }

        var newFunc = glpFcnBindings["default"];
        if (glpFcnBindings[name] != null) {
            newFunc = glpFcnBindings[name];
        }

        WebGLRenderingContext.prototype[name] =
            _glpBind(WebGLRenderingContext.prototype[name], newFunc, name);

    } catch(err) {
        if (glpVerboseLogs) {
            console.log("Binding Error: " + name)
        }
    }
}
