var glpContexts = (function () {

contexts = {};

/**
 * Returns the WebGL contexts available in the dom
 * @param {Array} WebGL Contexts
 */
contexts.getWebGLContexts = function() {
  var canvases = document.getElementsByTagName("canvas");
  var c = [];
  var counter = 0;
  for (var i = 0; i < canvases.length; i++) {
    var canvas = canvases[i];
    var webGLContext = canvas.getContext("webgl");
    if (webGLContext == null) {
      continue;
    }

    if (webGLContext.__uuid == null) {
      webGLContext.__uuid = glpHelpers.guid();
    }

    var name = null;
    if (canvas.id) {
      name = canvas.id;
    } else if (canvas.className) {
      name = canvas.className;
    } else {
      name = "canvas" + counter++;
    }
    webGLContext.__name = name;

    c.push(webGLContext);
  }

  return c;
}

contexts.sendContexts = function() {
  var c = glpContexts.getWebGLContexts();
  window.postMessage({
    "source": "content",
    "type": messageType.GET_CONTEXTS,
    "data": {"contexts": JSON.stringify(c)}
  }, "*");
}

contexts.getWebGLContext = function(uuid) {
  var c = this.getWebGLContexts();
  for (var i = 0; i < c.length; i++) {
    if (c[i].__uuid == uuid) {
      return c[i];
    }
  }
  return null;
}

return contexts;
}());
