if (gIncludedFiles == undefined)
	alert("You must include this file");
	
gIncludedFiles.push("Program.js");

var StatusEnum = 
{
	NONE 			: 0,
	SHADER_GETTING	: 1,
	SHADER_GET		: 2,
	SHADER_READY	: 3,
	SHADER_USING	: 4,
	SHADER_ERROR	: 5
}

Program = function() {
	this.webGL = null;
	
	this.vertexShaderString = null;
	this.fragmentShaderString = null;
	
	this.vertexShader = null;
	this.fragmentShader = null;
	this.program = null;
	
	this.compileInterval = null;
	this.useInterval = null;
	
	this.uniforms = null;
	this.attributes = null;
	
	this.status = StatusEnum.NONE;
	this.error = "No error";
}

Program.prototype.createAndUse = function(webGL, vertexShader, fragmentShader) {
	this.create(webGL, vertexShader, fragmentShader);
	this.useWhenReady();
}

Program.prototype.create = function(webGL, vertexShader, fragmentShader) {
	this.webGL = webGL;
	
	this.getShaders(vertexShader, fragmentShader);
	this.compileWhenGet();
}

Program.prototype.getShaders = function(vertexShader, fragmentShader) {
	var self = this;
	
	if (vertexShader == undefined || fragmentShader == undefined)	{
		this.status = StatusEnum.SHADER_ERROR;
		this.error = "At least one of the arguments is undefined";
		return this.status;
	}
	
	var xhr_object = null;
	
	if (window.XMLHttpRequest)
		xhr_object = new XMLHttpRequest()
	else if (window.ActiveXObject)
		xhr_object = new ActiveXObject("Microsoft.XMLHTTP");
	else {
		this.status = StatusEnum.SHADER_ERROR;
		this.error = "Could not create an XMLHttpRequest object";
		return this.status;
	}
	
	this.status = StatusEnum.SHADER_GETTING;
	
	xhr_object.open("GET", vertexShader, true);
	xhr_object.onreadystatechange = function () {
		if (xhr_object.readyState == 4) {
			self.vertexShaderString = xhr_object.responseText;
			if (self.vertexShaderString == undefined || self.vertexShaderString == null) {
				self.status = StatusEnum.SHADER_ERROR;
				self.error = "Could not get vertexShader";
				return;
			}

			xhr_object.open("GET", fragmentShader, true);
			xhr_object.onreadystatechange = function () {
				if (xhr_object.readyState == 4) {
					self.fragmentShaderString = xhr_object.responseText;
					if (self.fragmentShaderString == undefined || self.fragmentShaderString == null) {
						self.status = StatusEnum.SHADER_ERROR;
						self.error = "Could not get fragmentShader";
						return;
					}
					self.status = StatusEnum.SHADER_GET;
				}
			};
			try {xhr_object.send(null);}
			catch (e) {
				this.status = StatusEnum.SHADER_ERROR;
				this.error = "Could not get fragmentShader";
			}
		}
	};
	try {xhr_object.send(null);}
	catch (e) {
		this.status = StatusEnum.SHADER_ERROR;
		this.error = "Could not get vertexShader";
	}
}

Program.prototype.compileWhenGet = function() {
	var self = this;
	this.compileInterval = window.setInterval(function() {
		if (self.status == StatusEnum.SHADER_GET) {
			self.compile();
			window.clearInterval(self.compileInterval);
		} else if (self.status == StatusEnum.SHADER_ERROR) {
			window.clearInterval(self.compileInterval);
		}
	}, 100);
}

Program.prototype.compile = function() {
	this.vertexShader = this.webGL.createShader(this.webGL.VERTEX_SHADER);
	this.fragmentShader = this.webGL.createShader(this.webGL.FRAGMENT_SHADER);
	
	this.webGL.shaderSource(this.vertexShader, this.vertexShaderString);
	this.webGL.shaderSource(this.fragmentShader, this.fragmentShaderString);
	
    this.webGL.compileShader(this.vertexShader);
	this.webGL.compileShader(this.fragmentShader);
	
	if (!this.webGL.getShaderParameter(this.vertexShader, this.webGL.COMPILE_STATUS)) {
		this.status = StatusEnum.SHADER_ERROR;
		this.error = this.webGL.getShaderInfoLog(this.vertexShader);
	}

	if (!this.webGL.getShaderParameter(this.fragmentShader, this.webGL.COMPILE_STATUS)) {
		this.status = StatusEnum.SHADER_ERROR;
		this.error += this.webGL.getShaderInfoLog(this.fragmentShader);
	}

	if (this.status == StatusEnum.SHADER_ERROR)
		return this.status;

	this.program = this.webGL.createProgram();
	
	this.webGL.attachShader(this.program, this.vertexShader);
	this.webGL.attachShader(this.program, this.fragmentShader);

	this.webGL.linkProgram(this.program);
    
    if (!this.webGL.getProgramParameter(this.program, this.webGL.LINK_STATUS)) {
  		this.status = StatusEnum.SHADER_ERROR;
		this.error += this.webGL.getProgramInfoLog(this.program);
    }
	
	this.status = StatusEnum.SHADER_READY;
}

Program.prototype.useWhenReady = function() {
	var self = this;
	this.useInterval = window.setInterval(function() {
		if (self.status == StatusEnum.SHADER_READY) {
			self.use();
			window.clearInterval(self.useInterval);
		} else if (self.status == StatusEnum.SHADER_ERROR) {
			window.clearInterval(self.useInterval);
		}
	}, 100);
}

Program.prototype.use = function() {
	this.webGL.useProgram(this.program);
	this.status = StatusEnum.SHADER_USING;
	alert("Sahder OK");
}

Program.prototype.setUniforms = function(tab) {
	if (this.status != StatusEnum.SHADER_USING)
		return false;
	this.uniforms = tab;
	for (var i = 0; i < this.uniforms.length(); ++i) {
		this.uniforms[i].id = this.webGL.getUniformLocation(this.program, this.uniforms[i].name);
		if (this.uniforms[i].id == -1)
			continue;
		switch (this.uniforms[i].type) {
			case "Matrix4fv":
				this.webGL.uniformMatrix4fv(this.uniforms[i].id, false, new WebGLFloatArray(this.uniforms[i].value.flatten()));
			break;
		}
	}
	
	return true;
}

Program.prototype.setAttributes = function(tab) {
	if (this.status != StatusEnum.SHADER_USING)
		return false;
	this.attributes = tab;
	for (var i = 0; i < this.attributes.length(); ++i) {
		this.attributes[i].id = this.webGL.getAttribLocation(this.program, this.attributes[i].name);
		if (this.attributes[i].id == -1)
			continue;
		switch (this.attributes[i].type) {
			case "3f":
			  this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.attributes[i].buffer);
			  this.webGL.vertexAttribPointer(this.attributes[i].id, 3, gl.FLOAT, false, 0, 0);
			  this.webGL.enableVertexAttribArray(this.attributes[i].id);
			break;
		}
	}
	
	return true;
}