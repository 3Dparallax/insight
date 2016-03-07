var glpHistogram = function (gl) {
    this.gl = gl;

    this.enabled = false;
    this.histogram = {};
}

/**
 * Adds a data point to the function histogram
 * @param {String} Name of function
 */
glpHistogram.prototype.add = function(name) {
  if (!this.enabled) {
    return;
  }
  if (!this.histogram[name]) {
    this.histogram[name] = 1;
  } else {
    this.histogram[name] += 1;
  }
}

glpHistogram.prototype.toggle = function(enabled) {
  this.enabled = enabled;
}
