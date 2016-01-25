function _bind(origFunc, newFunc, name) {
    return function() {
        console.log(name);
        return newFunc.apply(this, [origFunc, arguments, name]);
    }
}

var fcnBindings = {
    attachShader : function(original, args, name) {
        var shader = args[1];
        var shaderType = this.getShaderParameter(shader, this.SHADER_TYPE);
        if (shaderType == this.FRAGMENT_SHADER) {
            args[1] = this.enablePixelInspector();
        }
        return original.apply(this, args);
    },
    enable: function(original, args, name) {
        if (this.pixelInspectorEnabled &&
            args[0] == this.DEPTH_TEST) {
            return;
        }
        return original.apply(this, args);
    },
    disable: function(original, args, name) {
        if (this.pixelInspectorEnabled && 
            args[0] == this.BLEND) {
            return;
        }
        return original.apply(this, args);
    },
    blendFunc: function(original, args, name) {
        if (this.pixelInspectorEnabled) {
            return;
        }
        return original.apply(this, args);
    },
    default: function(original, args, name) {
        console.log(name);
        return original.apply(this, args);
    }
}

for (var name in WebGLRenderingContext.prototype) {
    try {
        if (typeof WebGLRenderingContext.prototype[name] == 'function') {
            if (fcnBindings[name] != null) {
                WebGLRenderingContext.prototype[name] = _bind(
                    WebGLRenderingContext.prototype[name],
                    fcnBindings[name],
                    name);
            } else {
                WebGLRenderingContext.prototype[name] = _bind(
                    WebGLRenderingContext.prototype[name],
                    fcnBindings["default"],
                    name);
            }
        }
    } catch(err) {
        console.log("ERROR: " + name)
    }
}

WebGLRenderingContext.prototype.enablePixelInspector = function() {
    if (this.pixelInspectFragShader == null) {
        var pixelInspectFragShader = this.createShader(this.FRAGMENT_SHADER);    
        var shaderStr = 'precision mediump float;' +
            'varying vec4 vColor;' +
            'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
            '}';

        this.shaderSource(pixelInspectFragShader, shaderStr);
        this.compileShader(pixelInspectFragShader);

        this.enable(this.BLEND);
        this.blendFunc(this.SRC_ALPHA, this.ONE);
        this.disable(this.DEPTH_TEST);

        this.pixelInspectFragShader = pixelInspectFragShader;
        this.pixelInspectorEnabled = true;
    }
    return this.pixelInspectFragShader;
}
