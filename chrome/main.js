var glpVerboseLogs = false;
var glpPixelInspectorEnabled = false;

// Instantiate messaging
function init() {
    window.postMessage({ type: "init" }, "*");
}
init();

function sendMessage(data) {
    window.postMessage({ source:"content", data: data}, "*");
}

window.addEventListener('message', function(event) {
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || message.source != "panel") {
    return;
  }

  console.log(message);
});

var glpFcnBindings = {
    default: function(original, args, name) {
        if (glpVerboseLogs) {
            console.log("Default Call: " + name)
        }
        return original.apply(this, args);
    },
    attachShader : function(original, args, name) {
        // glpPixelInspector: overwrite all fragment shaders with the pixel inspector fragment shader
        if (glpPixelInspectorEnabled) {
            var shader = args[1];
            var shaderType = this.getShaderParameter(shader, this.SHADER_TYPE);
            if (shaderType == this.FRAGMENT_SHADER) {
                args[1] = this.glpEnablePixelInspector();
            }
        }

        return original.apply(this, args);
    },
    enable: function(original, args, name) {
        // glpPixelInspector: prevent DEPTH_TEST from being enabled
        if (glpPixelInspectorEnabled) {
            if (this.pixelInspectorEnabled && args[0] == this.DEPTH_TEST) {
                return;
            }
        }

        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        // glpPixelInspector: prevent BLEND from being disabled
        if (glpPixelInspectorEnabled) {
            if (this.pixelInspectorEnabled && args[0] == this.BLEND) {
                return;
            }
        }

        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        // glpPixelInspector: prevent blenFunc settings from changing
        if (glpPixelInspectorEnabled) {
            if (this.pixelInspectorEnabled) {
                return;
            }
        }

        return original.apply(this, args);
    }
}

/**
 * Enables the pixel inspector and returns the appropriate fragment shader
 * @return {WebGLShader} Pixel Inspector Shader
 */
WebGLRenderingContext.prototype.glpEnablePixelInspector = function() {
    this.enable(this.BLEND);
    this.blendFunc(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA);
    this.disable(this.DEPTH_TEST);
    this.pixelInspectorEnabled = true;
    this.clearColor( 0.0, 1.0, 0.0, 1.0 );
    return this.glpGetPixelInspectFragShader();
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
