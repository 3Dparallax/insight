// Matrix stack
function matrixStack() {
  this.matrixList = [];
}
// Pushes the matrix into the stack
matrixStack.prototype.push = function( matrix ) {
  this.matrixList.push( mat44.create( matrix ) );
}

// Pops and returns the last element of the stack
matrixStack.prototype.pop = function( matrix ) {
  if( this.matrixList.length === 0 ) {
    throw "Stack is empty, cannot pop";
  }
  return this.matrixList.pop();
}
