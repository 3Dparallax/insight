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

_glpModuleInstances = {};

function bindWebGL() {
    /**
     * Bind WebGLRenderingContext functions to functions found in glpFcnBindings
     * If defined, functions are first bound the function found in glpFcnBindings
     * Afterwards, they are then bound to the default func
     */
    for (var name in WebGLRenderingContext.prototype) {
        try {
            if (typeof WebGLRenderingContext.prototype[name] != 'function') {
                continue;
            }

            if (glpFcnBindings[name] != null) {
                var newFunc = glpFcnBindings[name];
                WebGLRenderingContext.prototype[name] =
                    _glpBind(WebGLRenderingContext.prototype[name], newFunc, name);
            }

            var defaultFunc = glpFcnBindings["default"];
            WebGLRenderingContext.prototype[name] =
                _glpBind(WebGLRenderingContext.prototype[name], defaultFunc, name);
        } catch(err) {
            // TODO: Handle binding errors
        }
    }

    WebGLRenderingContext.prototype.__newGLP = function() {
        if (this.__uuid === undefined) {
            this.__uuid = glpHelpers.guid();
        }

        var modules = {}
        modules.bufferViewer = new glpBufferViewer(this);
        modules.callStack = new glpCallStack(this);
        modules.frameControl = new glpFrameControl(this, window);
        modules.duplicateProgramDetection = new glpDuplicateProgramDetection(this);
        modules.histogram = new glpHistogram(this);
        modules.messages = new glpMessages(this);
        modules.pixelInspector = new glpPixelInspector(this);
        modules.depthInspector = new glpDepthInspector(this);
        modules.programUsageCounter = new glpProgramUsageCounter(this);
        modules.stateTracker = new glpStateTracker(this);
        modules.textureViewer = new glpTextureViewer(this);
        modules.shaderViewer = new glpShaderViewer(this);
        modules.mipmapViewer = new glpMipmapViewer(this);
        _glpModuleInstances[this.__uuid] = modules;
        return modules;
    }

    WebGLRenderingContext.prototype.glp = function() {
        return _glpModuleInstances[this.__uuid] ? _glpModuleInstances[this.__uuid] : this.__newGLP();
    }
}

bindWebGL();
