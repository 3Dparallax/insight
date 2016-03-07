var glpHistogram = (function (gl) {

histogram = {};
histogram.enabled = false;
histogram.histogram = {};

/**
 * Adds a data point to the function histogram
 * @param {String} Name of function
 */
histogram.add = function(name) {
  if (!this.enabled) {
    return;
  }
  if (!this.histogram[name]) {
    this.histogram[name] = 1;
  } else {
    this.histogram[name] += 1;
  }
}

histogram.toggle = function(enabled) {
  this.enabled = enabled;
}

return histogram;
});
