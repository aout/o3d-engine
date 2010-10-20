if (gIncludedFiles == undefined)
  alert("You must include this file");
  
gIncludedFiles.push("ColladaLoader/ColladaFile.js");

ColladaLoader_ColladaFile = function(task, xml, callback, debugDivId, verbose) {
  this.task = task;
  this.xml = xml;
  
  this.version = undefined;
  
  this.libraryAnimations = [];
  this.libraryAnimationClips = [];
  this.libraryControllers = [];
  this.libraryGeometries = [];
  this.libraryImages = [];
  this.libraryMaterials = [];
  
  this.upAxis = undefined;
  
  this.callback = callback;
  
  this.debug = undefined;

  if (debugDivId) {
      this.debug = document.evaluate('//div[@id="' + debugDivId + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  
  this.verbose = verbose ? true : false;
};

ColladaLoader_ColladaFile.upAxisEnum = {
  X_UP:     0,
  Y_UP:     1,
  Z_UP:     2,
};

ColladaLoader_ColladaFile.supportedVersions = ['1.4.0', '1.4.1'];

ColladaLoader_ColladaFile.prototype.parse = function() {
  
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Beginning parsing file</span><br />'; }
  
  if (!this.parseVersion())
    return false;
  this.parseUpAxis();
  this.loadImages();
  this.parseMaterials();
  this.parseGeometries();
  this.parseControllers();
  this.parseAnimations();
  this.parseAnimationClips();
  this.parseVisualScene();
  
  if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Parsing file done</span><br />'; }
};

ColladaLoader_ColladaFile.prototype.parseVersion = function() {
  
  var ColladaNode = ColladaLoader.getNode(this.xml, '/c:COLLADA');
  if (!ColladaNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;COLLADA&gt;</span><br />'; }
    return false;
  }
  
  this.version = ColladaNode.getAttribute('version');
  
  var supported = false;
  for (var index in ColladaLoader_ColladaFile.supportedVersions) {
    if (ColladaLoader_ColladaFile.supportedVersions[index] == this.version) {
      supported = true;
      break;
    }
  }
  
  if (!supported && this.debug) { this.debug.innerHTML += '<span class="error">This collada version:' + this.version + ' is not supported</span><br />'; }
  if (supported && this.debug && this.verbose) { this.debug.innerHTML += '<span class="success">Collada version:' + this.version + '</span><br />'; }
  return supported;
};

ColladaLoader_ColladaFile.prototype.parseUpAxis = function() {

  var upAxisNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:asset/c:up_axis');
  if (!upAxisNode) {
    if (this.debug) { this.debug.innerHTML += '<span class="error">Couldn\'t find &lt;up_axis&gt;</span><br />'; }
  }
  else {
    var upAxisValue = ColladaLoader.nodeText(upAxisNode);
    if (upAxisValue in ColladaLoader_ColladaFile.upAxisEnum) {
      this.upAxis = ColladaLoader_ColladaFile.upAxisEnum[upAxisValue]
    }
    else {
      if (this.debug) { this.debug.innerHTML += '<span class="error">&lt;up_axis&gt; has an unknow value</span><br />'; }
    }
  }
  
  if (!this.upAxis) {
    this.upAxis = ColladaLoader_ColladaFile.upAxisEnum.Y_UP;
    if (this.debug) { this.debug.innerHTML += '<span class="warning">Assume that &lt;up_axis&gt; is Y_UP</span><br />'; }
  }
  
  if (this.debug && this.verbose) {
    var upAxisString = (this.upAxis == 0) ? ('X_UP') : (this.upAxis == 1) ? ('Y_UP') : ('Z_UP');
    this.debug.innerHTML += '<span class="success">&lt;up_axis&gt; is ' + upAxisString + '</span><br />';
  }
};

ColladaLoader_ColladaFile.prototype.loadImages = function() {
  var libraryImagesNode = ColladaLoader.getNode(this.xml, '/c:COLLADA/c:library_images');
  if (!libraryImagesNode) {
    if (this.debug && this.verbose) { this.debug.innerHTML += '<span class="info">Couldn\'t find &lt;library_images&gt;</span><br />'; }
    return;
  }
  var imageNodes = ColladaLoader.getNodes(this.xml, 'c:image', libraryImagesNode);
  for (var i = 0; i < imageNodes.snapshotLength; i++) {
    var image = new ColladaLoader_Image(this);
    if (image.parse(imageNodes.snapshotItem(i))) {
      this.libraryImages.push(image);
    }
  }
};

ColladaLoader_ColladaFile.prototype.parseMaterials = function() {
  
};

ColladaLoader_ColladaFile.prototype.parseGeometries = function() {
  
};

ColladaLoader_ColladaFile.prototype.parseControllers = function() {
  
};

ColladaLoader_ColladaFile.prototype.parseAnimations = function() {
  
};

ColladaLoader_ColladaFile.prototype.parseAnimationClips = function() {
  
};

ColladaLoader_ColladaFile.prototype.parseVisualScene = function() {
  
};