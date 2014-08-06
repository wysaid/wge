"use strict";
/*
* wgeSprite.js for webgl
*
*  Created on: 2014-8-6
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.Sprite2d = WGE.Class(
{
	texture : null,      //WGE.Texture2D 对象
	pos : null,          //sprite2d 的位置, pos参数带z值! 不再需要 zIndex参数。
	rot : null,          //sprite2d 旋转弧度，包含三个参数，可绕x，y，z轴旋转。
	scaling : null,      //sprite2d 缩放大小（倍率），包含两个参数，分别横竖方向缩放

	//设置sprite的重心(相对于sprite本身坐标)，所有操作都以这个点为中心。
	hotSpot : null,

	alpha : 1.0,     //设置sprite的透明度, 默认1
	blendMode : null, //混合模式（待实现）

	//sprite绘制的目标canvas (主要用于在canvas长宽改变时获取canvas长宽)，
	//必须绑定，否则计算结果不精确。
	canvas : null,

	_program : null, //Sprite 所使用的 与webgl 相关信息
	_posAttribLocation : null,
	_context : null,
	_textureRelease : true;

	//必须填写绑定的canvas !
	initialize : function(canvas, ctx)
	{
		this.pos = new WGE.Vec3(0, 0, 0);
		this.rot = new WGE.Vec3(0, 0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		this.hotSpot = new WGE.Vec2(0, 0);

		this.canvas = canvas;
		if(!this.canvas)
		{
			WGE.ERR("Invalid Params while creating WGE.Sprite2d!");
		}
		this._context = ctx || WGE.webgl || this.canvas.getContext('experimental-webgl');
	},

	release : function()
	{
		if(this.texture && this.texture.release)
			this.texture.release();
		this._program.release();
		this.canvas = this.texture = this._program = this._context = null;
	},

	//若传递参数为 WGE.Texture2D，则第二个参数表示是否需要release，默认为需要。
	//当一个纹理同时绑定多个sprite时，建议设置其中一个为true，其他的为false。
	//若传递参数为 image对象，则第二个参数表示设定 WGE.Texture2D._conf 对象
	initSprite : function(tex, noRelease /*config*/)
	{
		if(!tex)
			return false;

		if(tex instanceof WGE.Texture2D)
		{
			this._textureRelease = !w;
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

	setZ : function(z)
	{
		pos.data[2] = z;
	},


});