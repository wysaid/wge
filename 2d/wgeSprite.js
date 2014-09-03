"use strict";
/*
* wgeSprite.js for context-2d
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//LogicSprite 本身不包含绘制方法，但是可为其child结点提供相对位置
WGE.LogicSprite = WGE.Class(WGE.SpriteInterface2d,
{
	pos : undefined,
	hotspot : undefined,
	size : undefined,
	scaling : undefined, // 缩放
	rotation : 0, // 旋转(弧度)
	alpha : 1, //透明度
	blendMode : undefined, //混合模式
	zIndex : 0, // 由于canvas本身并不支持z值，所以这里的zIndex仅用作排序依据。

	initialize : function()
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
	},

	setHotspot : function(hx, hy)
	{
		this.hotspot.data[0] = this.size.data[0] * (0.5 - hx/2);
		this.hotspot.data[1] = this.size.data[1] * (0.5 - hy/2);
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

	//相对于本sprite纹理坐标
	setHotspotWithPixel : function(px, py)
	{
		this.hotspot.data[0] = hx;
		this.hotspot.data[1] = hy;
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

	moveWithRatio : function(rdx, rdy)
	{
		this.pos.data[0] += rdx * this.size.data[0];
		this.pos.data[1] += rdy * this.size.data[1];
	},

	moveToWithRatio : function(rx, ry)
	{
		this.pos.data[0] = rx * this.size.data[0];
		this.pos.data[1] = ry * this.size.data[1];
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
		this.rotation = rot;
	},

	//将sprite渲染到指定的context
	render : function(ctx)
	{
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);
		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}


});

//
// 下方提供渲染速度较快的 SpriteExt, 但是旋转操作需要进行矩阵运算，较慢。
// 请考虑场景综合选择。
//
WGE.Sprite = WGE.Class(WGE.LogicSprite,
{
	img : null,  // Sprite自身图像。

	initialize : function(img, w, h)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		this.initSprite(img, w, h);
	},

	// 当 img直接使用image或者canvas对象时，
	// 将w设置为负值 可使Sprite仅引用此对象，减少内存占用。
	initSprite : function(img, w, h)
	{
		if(!img)
			return false;

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

	//将sprite渲染到指定的context
	render : function(ctx)
	{
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);

		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(this.img, -this.hotspot.data[0], pos.data[1] -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}
});


//使用矩阵操作完成旋转平移缩放等。
//WGE.SpriteExt 具有较快的渲染速度，但是如果频繁旋转的话，效率不高。
//建议需要旋转，但并非每一帧都需要旋转的情况下使用。
WGE.SpriteExt = WGE.Class(WGE.Sprite,
{
	rot : null, //2x2矩阵
	rotation : 0, //特别注意, rotation 仅对旋转作一个记录，本身不影响旋转值！

	initialize : function(img, w, h)
	{
		WGE.Sprite.apply(this, arguments);
		this.rot = new WGE.mat2Identity();
	},

	//将旋转平移缩放和到一次 transform 操作，渲染速度较快。
	render : function(ctx)
	{
		ctx.save();
		var m = this.rot.data;
		ctx.transform(m[0] * this.scaling.data[0], m[1], m[2] * this.scaling.data[1], m[3], this.pos.data[0], this.pos.data[1]);
		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	rotate : function(dRot)
	{
		this.rot.rotate(dRot);
		this.rotation += dRot;
	},

	rotateTo : function(rot)
	{
		this.rot = WGE.mat2Rotation(rot);
		this.rotation = rot;
	}

});


//延后实现，使用2d canvas模拟3d
//主要运用矩阵运算计算出渲染点坐标，配合canvas自带的 transform 转换
WGE.SpriteExt3d = WGE.Class(WGE.Sprite,
{

});


//////////////////////////////////////////
//
// 简介 :  video sprite 实现类似于gif或者video标签的播放方式。
//
//////////////////////////////////////////

WGE.VideoSpriteInterface = WGE.Class(WGE.LogicSprite,
{
	// _resource : null,  // Sprite自身图像。

	// initialize : function(img, w, h)
	// {
	// 	this.pos = new WGE.Vec2(0, 0);
	// 	this.hotspot = new WGE.Vec2(0, 0);
	// 	this.size = new WGE.Vec2(0, 0);
	// 	this.scaling = new WGE.Vec2(1, 1);
	// }


});

WGE.GifSprite = WGE.Class(WGE.VideoSpriteInterface,
{
	_imgArr : null,
	playIndex : 0,

	//w和h 必须指定！
	initialize : function(imgArr, w, h, noShare)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		if(imgArr)
			this.initSprite(imgArr, w, h, noShare);
	},

	initSprite : function(imgArr, w, h, noShare)
	{
		this.size = new WGE.Vec2(parseInt(w), parseInt(h));
		if(noShare)
		{
			this._imgArr = [];
			for(var i in imgArr)
			{
				var img = imgArr[i];
				var cvs = WGE.CE('canvas');
				cvs.width = img.width;
				cvs.height = img.height;
				cvs.getContext('2d').drawImage(img, 0, 0);
				this._imgArr.push(cvs);
			}
		}
		else
		{
			this._imgArr = imgArr;
		}
	},

	switchImage : function()
	{
		++this.playIndex;
		this.playIndex %= this._imgArr.length;
	},

	//将sprite渲染到指定的context
	render : function(ctx)
	{
		var img = this._imgArr[this.playIndex];
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{
		var img = this._imgArr[this.playIndex];
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);

		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}

});

WGE.VideoSprite = WGE.Class(WGE.VideoSpriteInterface,
{
	_video : null,

	initialize : function(video, w, h)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		if(video)
			this.initSprite(video, w, h);
	},

	initSprite : function(video, w, h)
	{
		this.size = new WGE.Vec2(parseInt(w), parseInt(h));
		if(typeof video == "string")
		{
			var v = WGE.CE('video');
			var self = this;
			v.onload = function() {
				self._video = this;
			};
			v.onerror = function() {
				console.log("load video faild : ", video);
			}
			v.src = video;
		}
		else
		{
			this._video = video;
		}
	},

	playVideo : function()
	{
		this._video.play();
	},

	pauseVideo : function()
	{
		this._video.pause();
	},

	loopVideo : function(shouldLoop)
	{
		this._video.loop = shouldLoop;
	},

	//将sprite渲染到指定的context
	render : function(ctx)
	{
		if(!this._video)
			return ;
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this._video, -this.hotspot.data[0], -this.hotspot.data[1], this.size.data[0], this.size.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{
		if(!this._video)
			return;
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);

		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(this._video, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}

});