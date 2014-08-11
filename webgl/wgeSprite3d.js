"use strict";
/*
* wgeSprite3d.js for webgl
*
*  Created on: 2014-8-6
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
	本类只提供基础功能，需要更强大的功能需要自己继承定制。
*/


//注： 同名参数含义请参考Sprite2d，为了减少篇幅，这里不再赘述
//内部包含set方法的参数，请使用set方法，不要直接修改参数值。
WGE.Sprite3d = WGE.Class(
{
	canvas : null,
	texture : null,

	// 不直接提供 pos等参数，如果需要，则继承此类，并记录这些参数以使用。
	// pos : null,     //包含x, y, z轴信息。下方类似参数同理
	// rot : null,		//与Sprite2dExt类似。
	// scaling : null,

	//提示: zIndex 在Sprite3d中无意义，故不提供。开启OpenGL的深度测试即可。 
	//若要按远近先后混合，请在渲染前按远近顺序排序。

	_modelMatrix,  //模型矩阵，内含sprite3d所包含模型所进行的所有矩阵转换操作。

	_hotspot: null,

	_program : null,
	_context : null,
	_textureRelease : true,
	
	_meshVBO : null,
	_meshIndexVBO : null,
	_textureVBO : null,
	_meshIndexSize : null,

	//缓存一些可能用到的location
	_modelViewProjectionLoc : null,


	initialize : function(canvas, ctx)
	{
		// this.pos = new WGE.Vec3(0, 0, 0);
		// this.scaling = new WGE.Vec3(1, 1, 1);
		// this._hotspot = new WGE.Vec3(0, 0, 0);
		this._modelMatrix = WGE.mat4Identity();

		this.canvas = canvas;
		if(!canvas)
		{
		    console.error("Invalid Params while creating WGE.Sprite3d!");
		}
		var gl = ctx || WGE.webgl || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
		this._context = gl;

		if(!WGE.Sprite3d.VertexShader)
			WGE.Sprite3d.VertexShader = WGE.requestTextByURL(WGE.Sprite3d.ShaderDir + "wgeSprite3d.vsh.txt");
		if(!WGE.Sprite3d.FragmentShader)
			WGE.Sprite3d.FragmentShader = WGE.requestTextByURL(WGE.Sprite3d.ShaderDir + "wgeSprite3d.fsh.txt");
		this._initProgram(WGE.Sprite3d.VertexShader, WGE.Sprite3d.FragmentShader);

		this._meshVBO = gl.createBuffer();
		this._meshIndexVBO = gl.createBuffer();
		this._textureVBO = gl.createBuffer();

	},

	release : function()
	{
		var gl = this._context;
		if(this.texture && this.texture.release)
			this.texture.release();
		this._program.release();

		gl.deleteBuffer(this._meshVBO);
		gl.deleteBuffer(this._meshIndexVBO);
		gl.deleteBuffer(this._textureVBO);

		this.canvas = this.texture = this._program = this._context = null;
	},

	//仅简单渲染模型外形，如需要光照等请自行继承操作，重写shader。
	//前三个参数分别代表模型顶点数据，纹理坐标，面索引。
	initSprite : function(vertexArr, texArr, indexArr, tex, noRelease)
	{		
		var gl = this._context;
		var vertData = vertexArr instanceof Array ? new Float32Array(vertexArr) : vertexArr;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._meshVBO);
		gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

		var texData = texArr instanceof Array ? new Float32Array(texArr) : texArr;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._textureVBO);
		gl.bufferData(gl.ARRAY_BUFFER, texData, gl.STATIC_DRAW);

		var indexData = indexArr instanceof Array ? new Uint16Array(indexArr) : indexArr;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._meshIndexVBO);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

		this._meshIndexSize = indexArr.length;

		if(tex)
			initTexture(tex, noRelease);
		WGE.checkGLErr("WGE.Sprite3d.initSprite", gl);
	},

	initTexture : function(tex, noRelease)
	{
		if(!tex)
			return false;

		if(tex instanceof WGE.Texture2D)
		{
			this._textureRelease = !noRelease;
			this.texture = tex;
		}
		else
		{
			this._textureRelease = true;
			this.texture = new WGE.Texture2D(this._context, noRelease);
			this.texture.initWithImg(tex);
		}
		return true;
	},

	translate : function(tx, ty, tz)
	{
		this.translateX(tx);
		this.translateY(ty);
		this.translateZ(tz);
	},

	translateX : function(tx)
	{
		this._modelMatrix.translateX(tx);
	},

	translateY : function(ty)
	{
		this._modelMatrix.translateY(ty);
	},

	translateZ : function(tz)
	{
		this._modelMatrix.translateZ(tz);
	},

	scale : function(sx, sy, sz)
	{
		this.scaleX(sx);
		this.scaleY(sy);
		this.scaleZ(sz);
	},

	scaleX : function(sx)
	{
		this._modelMatrix.scaleX(sx);
	},

	scaleY : function(sy)
	{
		this._modelMatrix.scaleY(sy);
	},

	scaleZ : function(sz)
	{
		this._modelMatrix.scaleZ(sz);
	},

	rotate : function(rad, x, y, z)
	{
		this._modelMatrix.rotate(rad, x, y, z);
	},

	rotateX : function(rad)
	{
		this._modelMatrix.rotateX(rad);
	},

	rotateY : function(rad)
	{
		this._modelMatrix.rotateY(rad);
	},

	rotateZ : function(rad)
	{
		this._modelMatrix.rotateZ(rad);
	},

});

//WGE.Sprite3d.VertexShader = "";

//WGE.Sprite3d.FragmentShader = "";

