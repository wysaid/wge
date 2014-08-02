"use strict";
/*
* wgeTimeline.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.Sprite = WGE.Class(
{
	pos : undefined,
	hotspot : undefined,
	size : undefined,
	scaling : undefined, // 缩放
	rotation : 0, // 旋转(弧度)
	alpha : undefined, //透明度
	blendMode : undefined, //混合模式
	img : null,  // Sprite自身图像。
	zIndex : 0, // 由于canvas本身并不支持z值，所以这里的zIndex仅用作排序依据。

	initialize : function(img, w, h)
	{
		this.initSprite(img, w, h);
	},

	// 当 img直接使用image或者canvas对象时，
	// 将w设置为负值 可使Sprite仅引用此对象，减少内存占用。
	initSprite : function(img, w, h)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);

		if(typeof img == 'string')
		{
			img = WGE.ID(img);
		}
		else if(w < 0 && typeof img == 'object')
		{
			this.img = img;
			this.size.x = img.width;
			this.size.y = img.height;
			return;
		}

		this.img = WGE.CE('canvas');
		if(img)
		{
			if(w && h)
			{
				this.size.x = w;
				this.size.y = h;
				this.img.width = w;
				this.img.height = h;
			}
			else
			{
				this.size.x = img.width;
				this.size.y = img.height;
				this.img.width = img.width;
				this.img.height = img.height;
			}

			var ctx = this.img.getContext('2d');
			ctx.drawImage(img, 0, 0, this.img.width, this.img.height, 0, 0, img.width, img.height);
		}
	},

	setHotspot : function(hx, hy)
	{
		this.hotspot.x = hx;
		this.hotspot.y = hy;
	},

	setHotspot2Center : function()
	{
		this.hotspot.x = this.size.x / 2.0;
		this.hotspot.y = this.size.y / 2.0;
	},

	setHotspotWithRatio : function(rx, ry)
	{
		this.hotspot.x = this.size.x * rx;
		this.hotspot.y = this.size.y * ry;
	},

	move : function(dx, dy)
	{
		this.pos.x += dx;
		this.pos.y += dy;
	},

	moveTo : function(x, y)
	{
		this.pos.x = x;
		this.pos.y = y;
	},

	scale : function(ds, dy)
	{
		this.scaling.x *= ds;
		this.scaling.y *= dy;
	},

	scaleTo : function(sx, sy)
	{
		this.scaling.x = sx;
		this.scaling.y = sy;
	},

	rotate : function(dRot)
	{
		this.rotation += dRot;
	},

	rotateTo : function(rot)
	{
		this.rotation = dRot;
	},

	//将sprite渲染到指定的context
	render : function(ctx)
	{
		//以后实现
		// var cosRot = Math.cos(rotation), sinRot = Math.sin(rotation);

		// ctx.setTransform(this.scaling.x * cosRot, sinRot, 0, -sinRot, scaling.y * cosRot, 0, realPos.x, realPos.y)

		//ctx.setTransform(1, 0, -this.hotspot.x, 1, 0, -this.hotspot.y);
//		ctx.translate(this.hotspot.x, this.hotspot.y);

		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		if(this.rotation)
			ctx.rotate(this.rotation);		
		if(this.scaling)
			ctx.scale(this.scaling.x, this.scaling.y);
		if(this.alpha != undefined)
			ctx.globalAlpha = this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;
		ctx.drawImage(this.img, -this.hotspot.x, -this.hotspot.y);

		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.x, pos.y);
		if(rot)
			ctx.rotate(rot);		
		if(scaling)
			ctx.scale(scaling.x, scaling.y);
		if(this.alpha != undefined)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(this.img, pos.x - this.hotspot.x, pos.y - this.hotspot.y);
		ctx.restore();
	}


});