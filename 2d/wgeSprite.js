"use strict";
/*
* wgeSprite.js for context-2d
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//
// 下方提供渲染速度较快的 SpriteExt, 但是旋转操作需要进行矩阵运算，较慢。
// 请考虑场景综合选择。
//

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
			this.size.data[0] = img.width;
			this.size.data[1] = img.height;
			return;
		}

		this.img = WGE.CE('canvas');
		if(img)
		{
			if(w && h)
			{
				this.size.data[0] = w;
				this.size.data[1] = h;
				this.img.width = w;
				this.img.height = h;
			}
			else
			{
				this.size.data[0] = img.width;
				this.size.data[1] = img.height;
				this.img.width = img.width;
				this.img.height = img.height;
			}

			var ctx = this.img.getContext('2d');
			ctx.drawImage(img, 0, 0, this.img.width, this.img.height, 0, 0, img.width, img.height);
		}
	},

	setHotspot : function(hx, hy)
	{
		this.hotspot.data[0] = hx;
		this.hotspot.data[1] = hy;
	},

	setHotspot2Center : function()
	{
		this.hotspot.data[0] = this.size.data[0] / 2.0;
		this.hotspot.data[1] = this.size.data[1] / 2.0;
	},

	setHotspotWithRatio : function(rx, ry)
	{
		this.hotspot.data[0] = this.size.data[0] * rx;
		this.hotspot.data[1] = this.size.data[1] * ry;
	},

	move : function(dx, dy)
	{
		this.pos.data[0] += dx;
		this.pos.data[1] += dy;
	},

	moveTo : function(x, y)
	{
		this.pos.data[0] = x;
		this.pos.data[1] = y;
	},

	scale : function(sx, sy)
	{
		this.scaling.data[0] *= sx;
		this.scaling.data[1] *= sy;
	},

	scaleTo : function(sx, sy)
	{
		this.scaling.data[0] = sx;
		this.scaling.data[1] = sy;
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
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);
		if(this.alpha != undefined)
			ctx.globalAlpha = this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;
		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);

		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);

		ctx.scale(scaling.data[0], scaling.data[1]);
		if(this.alpha != undefined)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(this.img, pos.data[0] - this.hotspot.data[0], pos.data[1] - this.hotspot.data[1]);
		ctx.restore();
	}


});


//使用矩阵操作完成旋转平移缩放等。
//WGE.SpriteExt 具有较快的渲染速度，但是如果频繁旋转的话，效率不高。
//建议需要旋转，但并非每一帧都需要旋转的情况下使用。
WGE.SpriteExt = WGE.Class(WGE.Sprite,
{
	rotation : null, //2x2矩阵

	initialize : function(img, w, h)
	{
		this.initSprite(img, w, h);
		this.rotation = new WGE.mat2Identity();
	},

	//将旋转平移缩放和到一次 transform 操作，渲染速度较快。
	render : function(ctx)
	{
		ctx.save();
		var m = this.rotation.data;
		ctx.transform(m[0] * this.scaling.data[0], m[1], m[2] * this.scaling.data[1], m[3], this.pos.data[0], this.pos.data[1]);

		if(this.alpha != undefined)
			ctx.globalAlpha = this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);
		ctx.restore();
	},

	rotate : function(dRot)
	{
		this.rotation.rotate(dRot);
	},

	rotateTo : function(rot)
	{
		this.rotation = WGE.mat2Rotation(rot);
	}

});

WGE.SpriteExt3d = WGE.Class(WGE.Sprite,
{

});