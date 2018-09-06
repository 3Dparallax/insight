// Only supports gl.TEXTURE_2D at the moment

var glpMipmapViewer = function(gl) {
  this.gl = gl;

  this.textureUsage = {}
  this.activeTexture = null;

  this.mipmapPixels = null;
  this.currentLevel = 0;
  this.uuidToTexture = {};

  this.enabled = false;
  this.currentBoundTexture = null;
}

glpMipmapViewer.prototype.texImage2DFcnType = {
  TEX_IMAGE_2D_6 : 0,
  TEX_IMAGE_2D_9 : 1
}

glpMipmapViewer.prototype.getMipmapLevelColor = function(level, maxLevel) {

  var ratio = level / maxLevel;

  // Rainbow colors
  var i = level * 220 / maxLevel;
  var r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128);
  var g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128);
  var b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128);

  return [r * 255,
        g * 255,
        b * 255,
        255]

}

glpMipmapViewer.prototype.generateColorImage = function(width, height, level, maxLevel) {
  /* width and height are orders of 2

  internalFormat can be the following parameters:
  gl.ALPHA, gl.LUMINANCE, gl.LUMINANCE_ALPHAA, gl.RGB, gl.RGBA

  type can be the following parameters:
  gl.UNSIGNED_BYTE, gl.FLOAT, gl.UNSIGNED_SHORT_5_6_5,
  gl.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_5_5_5_1

  more information can be found at:
  https://msdn.microsoft.com/en-us/library/dn302435(v=vs.85).aspx */

  // Computing the number of components

  numComponentsPerPixel = 4
  var numPixels = width * height;
  var pixels = new Uint8Array(numPixels * numComponentsPerPixel);
  var color = this.getMipmapLevelColor(level, maxLevel);

  for (var i = 0; i < numPixels; i++) {
    for( var c = 0; c < numComponentsPerPixel; c++) {
      pixels[i*numComponentsPerPixel+c] = color[c];
    }
  }
  return pixels;

  return null;

}

glpMipmapViewer.prototype.getTextureList = function() {
  var textures = [];
  var i = 0;
  for (key in this.textureUsage) {
    var active = this.activeTexture ? (key == this.activeTexture.__uuid) : false
    textures.push({
      name: "Texture" + i,
      uuid: key,
      active: active,
    });
    i++;
  }
  if (!textures.length) {
    textures.push({
      name: "NO MIPMAPS FOUND",
      uuid: "",
      active: true
    });
  }
  return textures;
}

glpMipmapViewer.prototype.enable = function(textureKey) {
  if(!this.activeTexture) {
    return;
  }
  if (this.enabled) {
    this.disable();
  } else {
    this.currentBoundTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);
  }
  var texture = textureKey ? this.uuidToTexture[textureKey] : this.activeTexture;
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.enabled = true;
  this.enableMipmapView(texture);
}

glpMipmapViewer.prototype.disable = function() {
  if (!this.enabled) {
    return;
  }
  this.disableMipmapView(this.activeTexture);
  this.enabled = false;
}

glpMipmapViewer.prototype.enableMipmapView = function(textureKey) {
  var textureObj = this.textureUsage[textureKey.__uuid];
  if (!textureObj) return;
  if (!textureObj.imageLevels[0]) return;

  var imageLvl0 = textureObj.imageLevels[0];

  this.currentBoundTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);

  this.gl.bindTexture(this.gl.TEXTURE_2D, textureKey);
  var textureInfo = this.getTextureMipmapInfo(imageLvl0);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.activeTexture);
  var dim = textureObj.generateMipmap ?
            textureInfo.size.width : Math.pow(2, textureObj.imageLevels.length - 1)

  var maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
  var maxMipmapLevel = Math.log2(maxTextureSize);

  var mipmapPixels = this.generateColorImage(dim, dim, 0, maxMipmapLevel);
  var level = 0;
  var width = dim;
  var height = dim;
  while (width >= 1 && height >= 1) {
    this.mipmapPixels = this.generateColorImage(width, height, level, maxMipmapLevel);
    this.currentLevel = level;
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      level,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.mipmapPixels);
    width /= 2;
    height /= 2;
    level += 1;
  }

  this.gl.bindTexture(this.gl.TEXTURE_2D, this.currentBoundTexture);
}

glpMipmapViewer.prototype.getTextureSize = function(textureObjLevel) {
  var size = { width : 0, height : 0};
  if (textureObjLevel.functionType == this.texImage2DFcnType.TEX_IMAGE_2D_6){
    var img = textureObjLevel.arguments[5]
    size.width = img.width;
    size.height = img.height;
  } else {
    size.width = textureObjLevel.arguments[3];
    size.height = textureObjLevel.arguments[4];
  }

  return size;
}

glpMipmapViewer.prototype.getTextureMipmapInfo = function(textureObjLevel) {
  var info = { size : { width: 0, height : 0 },
         internalFormat : undefined,
         format : undefined,
         type : undefined };

  if (textureObjLevel.functionType == this.texImage2DFcnType.TEX_IMAGE_2D_6){
    var img = textureObjLevel.arguments[5]
    info.size.width = img.width;
    info.size.height = img.height;
    info.internalFormat = textureObjLevel.arguments[2];
    info.format = textureObjLevel.arguments[3];
    info.type = textureObjLevel.arguments[4];
  } else {
    info.size.width = textureObjLevel.arguments[3];
    info.size.height = textureObjLevel.arguments[4];
    info.internalFormat = textureObjLevel.arguments[2];
    info.format = textureObjLevel.arguments[6]
    info.type = textureObjLevel.arguments[7]
  }

  return info;
}

glpMipmapViewer.prototype.disableMipmapView = function(textureKey) {
  var textureObj = this.textureUsage[textureKey.__uuid];
  if (!textureObj) return;
  if (!textureObj.imageLevels[0]) return;

  var textureObj = this.textureUsage[textureKey.__uuid];

  var currentBoundTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);

  this.gl.bindTexture(this.gl.TEXTURE_2D, textureKey);

  for(var i = 0; i < textureObj.fcnUsages.length; i++) {
    var fcnUsage = textureObj.fcnUsages[i];
    fcnUsage.fcn.apply(this.gl, fcnUsage.args);
  }


  this.gl.bindTexture(this.gl.TEXTURE_2D, currentBoundTexture);

}

glpMipmapViewer.prototype.pushTextureKey = function(textureKey) {
  if (!textureKey.__uuid) {
    textureKey.__uuid = glpHelpers.guid();
  }
  if (this.textureUsage[textureKey.__uuid] != undefined) {
    return;
  }
  this.uuidToTexture[textureKey.__uuid] = textureKey;
  this.textureUsage[textureKey.__uuid] = { generateMipmap : false,
                    imageLevels : [],
                    fcnUsages : [] };
}

glpMipmapViewer.prototype.updateActiveTexture = function(activeTexture) {
  if (!this.enabled){
    this.activeTexture = activeTexture;
  }
}

glpMipmapViewer.prototype.textureExists = function(textureKey) {
  return (textureKey != null &&
      this.textureUsage[textureKey.__uuid] != undefined);
}

glpMipmapViewer.prototype.texImage2D = function(original, args) {
  if (!this.textureExists(this.activeTexture)) {
    return;
  }

  if(args.length == 9 && args[8] == this.mipmapPixels && args[1] == this.currentLevel) {
    return;
  }
  // figure out which function type it's using
  var textureObj = this.textureUsage[this.activeTexture.__uuid];
  var level = args[1];
  if (args.length == 6) {
    textureObj.imageLevels.splice(level, 0, {
      functionType : this.texImage2DFcnType.TEX_IMAGE_2D_6,
      arguments : args });
  } else if (args.length == 9) {
    textureObj.imageLevels.splice(level, 0, {
      functionType : this.texImage2DFcnType.TEX_IMAGE_2D_9,
      arguments : args });
  } else {
    console.error("texImage2D function args is not valid");
    return;
  }

  textureObj.fcnUsages.push( { fcn : original, args: args } );
}

glpMipmapViewer.prototype.texSubImage2D = function(original, args) {
  if (!this.textureExists(this.activeTexture)) {
    return;
  }

  // figure out which function type it's using
  var textureObj = this.textureUsage[this.activeTexture.__uuid];
  var level = args[1];
  if (args.length == 7) {
    textureObj.imageLevels.splice(level, 1, {
      functionType : this.texImage2DFcnType.TEX_IMAGE_2D_6,
      arguments : args });
  } else if (args.length == 9) {
    textureObj.imageLevels.splice(level, 1, {
      functionType : this.texImage2DFcnType.TEX_IMAGE_2D_9,
      arguments : args });
  } else {
    console.error("texSubImage2D function args is not valid");
    return;
  }

  textureObj.fcnUsages.push( { fcn : original, args: args } );
}

glpMipmapViewer.prototype.generateMipmap = function(original, args) {
  if (!this.textureExists(this.activeTexture)) {
    return;
  }

  var textureObj = this.textureUsage[this.activeTexture.__uuid];
  textureObj.generateMipmap = true;
  textureObj.fcnUsages.push( { fcn : original, args: args })
}

glpMipmapViewer.prototype.storeFunctions = function(original, args) {
  if (!this.textureExists(this.activeTexture)) {
    return;
  }

  var textureObj = this.textureUsage[this.activeTexture.__uuid];
  textureObj.fcnUsages.push( { fcn : original, args: args })
}

