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

function bindWebGL() {
    WebGLRenderingContext.prototype.glp = {};
    WebGLRenderingContext.prototype.glp.bufferViewer = glpBufferViewer;
    WebGLRenderingContext.prototype.glp.callStack = glpCallStack;
    WebGLRenderingContext.prototype.glp.duplicateProgramDetection = glpDuplicateProgramDetection;
    WebGLRenderingContext.prototype.glp.histogram = glpHistogram;
    WebGLRenderingContext.prototype.glp.messages = glpMessages;
    WebGLRenderingContext.prototype.glp.pixelInspector = glpPixelInspector;
    WebGLRenderingContext.prototype.glp.programUsageCounter = glpProgramUsageCounter;
    WebGLRenderingContext.prototype.glp.stateTracker = glpStateTracker;
    WebGLRenderingContext.prototype.glp.textureViewer = glpTextureViewer;

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
}

bindWebGL();
