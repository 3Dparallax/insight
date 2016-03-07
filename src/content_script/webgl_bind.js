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

    WebGLRenderingContext.prototype.glp = function() {
        if (this.__uuid == null) {
            this.__uuid = glpHelpers.guid();
        }
        if (this.__uuid in _glpModuleInstances) {
            return _glpModuleInstances[this.__uuid];
        }

        var modules = {}
        modules.bufferViewer = new glpBufferViewer(this);
        modules.callStack = new glpCallStack(this);
        modules.duplicateProgramDetection = new glpDuplicateProgramDetection(this);
        modules.histogram = new glpHistogram(this);
        modules.messages = new glpMessages(this);
        modules.pixelInspector = new glpPixelInspector(this);
        modules.programUsageCounter = new glpProgramUsageCounter(this);
        modules.stateTracker = new glpStateTracker(this);
        modules.textureViewer = new glpTextureViewer(this);
        _glpModuleInstances[this.__uuid] = modules;
        return modules;
    }
}

bindWebGL();
