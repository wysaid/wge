"use strict";
/*
* wgeFilters.js for context-2d
*
*  Created on: 2014-8-2
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
	简介： 提供在context-2d环境下的简单CPU滤镜
*/

WGE.FilterInterface = WGE.Class(
{
	canvasObject : undefined,
	imageData : undefined,

	//img 必须是image对象或者canvas对象
	initialize : function(img)
	{
		this.bind(img);
	},

	bind : function(img)
	{
		if(!img)
			return null;

		if(img.getContext)
		{
			this.canvasObject = img;
			this.imageData = img.getContext("2d").getImageData(0, 0, img.width, img.height);
		}
		else
		{
			this.canvasObject = WGE.CE('canvas');
			this.canvasObject.width = img.width;
			this.canvasObject.height = img.height;
			var ctx = this.canvasObject.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			this.imageData = ctx.getImageData(0, 0, img.width, img.height);
		}
		return this;
	},

	//noCopy sets "the src and dst are the same canvas".
	run : function(noCopy)
	{
		var dst = null;
		if(this.canvasObject && this.imageData)
		{
			if(noCopy)
			{
				this._run(this.imageData.data, this.imageData.data, this.canvasObject.width, this.canvasObject.height)
				this.canvasObject.getContext("2d").putImageData(this.imageData, 0, 0);
			}
			else
			{
				dst = WGE.CE('canvas');
				dst.width = this.canvasObject.width;
				dst.height = this.canvasObject.height;
				var ctx = dst.getContext('2d');
				var dstImageData = ctx.getImageData(0, 0, dst.width, dst.height);
				this._run(dstImageData.data, this.imageData.data, dst.width, dst.height);
				ctx.putImageData(dstImageData, 0, 0);
			}
		}

		if(noCopy)
			return this.canvasObject;
		return dst;
	},

	_run : function(dst, src, w, h)
	{
		//Do nothing.
	}

});

WGE.Filter = {};

WGE.Filter.Monochrome = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{
		var len = w * h * 4;
		for(var i = 0; i < len; i += 4)
		{
			var gray = (src[i] * 4899 + src[i + 1] * 9617 + src[i + 2] * 1868 + 8192) >> 14;
			dst[i] = dst[i + 1] = dst[i + 2] = gray;
			dst[i + 3] = src[i + 3];
		}
	}
});

WGE.Filter.Edge = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{

		var func = function(v)
		{
			return Math.max(Math.min(v * 2.0, 255), 0);
		}

		var lw = w - 2, lh = h - 2;
		for(var i = 0; i < lh; ++i)
		{
			var line = i * w * 4;
			for(var j = 0; j < lw; ++j)
			{
				var index1 = line + j * 4;
				var index2 = index1 + w * 8 + 8;
				dst[index1] = func(src[index1] - src[index2]);
				dst[index1 + 1] = func(src[index1 + 1] - src[index2 + 1]);
				dst[index1 + 2] = func(src[index1 + 2] - src[index2 + 2]);
				dst[index1 + 3] = src[index1 + 3];
			}
		}
	}
});