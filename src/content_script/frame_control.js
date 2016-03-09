var glpFrameControl = function (gl, window) {
    this.gl = gl;

    var paused = false;

    var requestFrameCall = {};
    requestFrameCall.context = null;
    requestFrameCall.arguments = null;
    requestFrameCall.timerId = null;

    var intervalCall = {};
    intervalCall.context = null;
    intervalCall.timerId = null;
    intervalCall.arguments = null;

    var timeoutCall = {};
    timeoutCall.context = null;
    timeoutCall.timerId = null;
    timeoutCall.arguments = null;

    var setCall = function(call, original, context, arguments) {
        call.context = context;
        call.arguments = arguments;
        call.timerId = original.apply(context, arguments);
        return call.timerId;
    }

    var setFrameCall = function(original, context, arguments) {
        if (paused) {
            return -1;
        }

        requestFrameCall.context = context;
        requestFrameCall.arguments = arguments;

        requestFrameCall.timerId = original.apply(context, arguments);
        return requestFrameCall.timerId;
    }

    var cancelFrameCall = function(original, context, arguments) {
        if (arguments[0] == -1) {
            return;
        }
        return original.apply(context, arguments);
    }

    var nextCall = function(call, originalSet, originalClear) {
        call.timerId = originalSet.call(call.context, function() {
            call.arguments[0]();
            originalClear.call(call.context, call.timerId);
        }, call.arguments[1]);
    }

    var requestAnimationFrameCall = window.requestAnimationFrame;
    var cancelAnimationFrameCall = window.cancelAnimationFrame;
    var setIntervalCall = window.setInterval;
    var clearIntervalCall = window.clearInterval;
    var setTimeoutCall = window.setTimeout;
    var clearTimeoutCall = window.clearTimeout;

    window.setInterval = function() {
        return setCall(intervalCall, setIntervalCall, this, arguments);
    }

    window.setTimeout = function() {
        return setCall(timeoutCall, setTimeoutCall, this, arguments);
    }

    window.requestAnimationFrame = function() {
        return setFrameCall(requestAnimationFrameCall, this, arguments);
    }

    window.cancelAnimationFrame = function() {
        return cancelFrameCall(cancelAnimationFrameCall, this, arguments);
    }

    this.play = function() {
        if (paused) {
            paused = false;

            if (requestFrameCall.arguments) {
                setFrameCall(requestAnimationFrameCall, requestFrameCall.context, requestFrameCall.arguments);
            }

            if (intervalCall.arguments) {
                setCall(intervalCall, setIntervalCall, intervalCall.context, intervalCall.arguments);
            }

            if (timeoutCall.arguments) {
                setCall(timeoutCall, setTimeoutCall, timeoutCall.context, timeoutCall.arguments);
            }
        }
    }

    this.pause = function() {
        if (!paused) {
            paused = true;

            if (requestFrameCall.timerId) {
                cancelAnimationFrameCall.call(requestFrameCall.context, requestFrameCall.timerId);
            }

            if (intervalCall.timerId) {
                clearIntervalCall.call(intervalCall.context, intervalCall.timerId);
            }

            if (timeoutCall.timerId) {
                clearTimeoutCall.call(timeoutCall.context, timeoutCall.timerId);
            }
        }
    };

    this.nextFrame = function() {
        if (paused) {
            if (requestFrameCall.arguments) {
                requestAnimationFrameCall.apply(requestFrameCall.context, requestFrameCall.arguments);
            }

            if (intervalCall.arguments) {
                nextCall(intervalCall, setIntervalCall, clearIntervalCall);
            }

            if (timeoutCall.arguments) {
                nextCall(timeoutCall, setTimeoutCall, clearTimeoutCall);
            }
        }
    }
}
