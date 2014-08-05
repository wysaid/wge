"use strict";
/*
 * wgeWebGL.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

WGE.webgl = null;

//绑定WGE当前的webgl 上下文。
//绑定以后对于后面的大部分方法，如省略末尾的context参数则自动使用当前绑定这个。
WGE.bindContext = function(ctx)
{
	WGE.webgl = ctx;
}

//检查WebGL 是否发生错误，如有，则输出错误信息。
WGE.checkGLErr = function(tag, context)
{
	var ctx = context || WGE.webgl;
	for (var error = ctx.getError(); error; error = ctx.getError())
	{		
		var msg;
		switch (error) 
		{
			case ctx.INVALID_ENUM: msg = "invalid enum"; break;
			case ctx.INVALID_FRAMEBUFFER_OPERATION: msg = "invalid framebuffer operation"; break;
			case ctx.INVALID_OPERATION: msg = "invalid operation"; break;
			case ctx.INVALID_VALUE: msg = "invalid value"; break;
			case ctx.OUT_OF_MEMORY: msg = "out of memory"; break;
			default: msg = "unknown error";
		}
		WGE.ERR(tag, msg, error);
	}
};

WGE.Texture = WGE.Class(
{
	//当image不为null时表示正在加载图片。
	image : null,
	texture : null,
	width : 0,
	height : 0,
	_context : null,

	initialize : function(ctx)
	{
		this._context = ctx || WGE.webgl;
	},

	bindContext : function(ctx)
	{
		this._context = ctx || WGE.webgl;
	},

	initWithTag : function(tagID)
	{
		var img = WGE.ID(tagID);
		if(!img)
			return false;
		if(img.complete)
		{
			this.initWithObj(img);
		}
		else
		{
			this.image = img;
			img.onload = this.imageOnload.bind(this);
		}
	},

	initWithObj : function(imgObj)
	{
		if(!imageObj)
 			return;
 		var webgl = this._context;
		this.width = this.image.width;
 		this.height = this.image.height;
 		this.texture = webgl.createTexture();
 		webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
 		webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, imageObj);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
 		webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
	},

	initWithURL : function(imgURL)
	{
		this.image = new Image();
		this.image.onload = this.imageOnload.bind(this);
		this.image.src = imgURL;
	},

	imageOnload : function()
	{
		this.initWithObj(this.image);
		this.image = null;
	},

	//textureIndex 从0开始， 对应 webgl.TEXTURE0 及其以后
 	//如 textureIndex 填写 N， 则 对应 webgl.TEXTURE(N)
 	//之后使用时，可以与传递的uniform值直接对应。
	bindToIndex : function(textureIndex)
	{
		this._context.activeTexture(webgl.TEXTURE0 + textureIndex);
		this._context.bindTexture(webgl.TEXTURE_2D, this.texture);
	},

	release : function()
	{
		var webgl = this._context || WGE.webgl;

		if(this.texture && webgl)
 		{
 			webgl.deleteTexture(this.texture);
 		}

 		this.texture = null;
 		this._context = null;

 		if(this.image)
 		{
 			this.image.onload = null;
 			this.image = null;
 		}
	}

});