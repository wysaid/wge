"use strict";
/*
* wgeFilters.js
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
		if(img.getImageData)
		{
			this.canvasObject = img;
			this.imageData = img.getImageData(0, 0, img.width, img.height);
		}
		else
		{
			this.canvasObject = WGE.CE('canvas');
			this.canvasObject.width = img.width;
			this.canvasObject.height = img.height;
			this.canvasObject.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
			this.imageData = this.canvasObject.getImageData(0, 0, img.width, img.height);
		}
	},

	//noCopy sets "the src and dst are the same canvas".
	run : function(noCopy)
	{
		var ret = null;
		var dst = null;
		if(canvasObject && imageData)
		{
			if(noCopy)
			{
				ret = this._run(imageData, imageData, dst.width, dst.height)
			}
			else
			{
				dst = WGE.CE('canvas');
				dst.width = canvasObject.width;
				dst.height = canvasObject.height;
				ret = this._run(dst.getImageData(0, 0, dst.width, dst.height), imageData, dst.width, dst.height);
			}
		}

		if(noCopy)
			return canvasObject;
		return dst;
	},

	_run : function(dst, src, w, h)
	{
		//Do nothing.
	}

});

WGE.FilterBW = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{
		var len = src.length;
		for(var i = 0; i < len; i += 4)
		{
			var gray = (src[i] * 4899 + src[i + 1] * 9617 + src[i + 2] * 1868 + 8192) >> 14;
			dst[i] = dst[i + 1] = dst[i + 2] = gray;
			dst[i + 3] = src[i + 3];
		}
	}
});

WGE.FilterEdge = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{
		var lw = w - 1, lh = h - 1;
		for(var i = 0; i < lh; ++i)
		{
			var line = i * w * 4;
			for(var j = 1; j < lw; ++j)
			{
				var index1 = line + j * 4;
				var index2 = index1 + w * 4 + 4;
				var gray1 = src[index1] * 4899 + src[index1 + 1] * 9617 + src[index1 + 2] * 1868;
				var gray2 = src[index2] * 4899 + src[index2 + 1] * 9617 + src[index2 + 2] * 1868;
				dst[index1] = dst[index1 + 1] = dst[index1 + 2] = (gray2 - gray1) >> 14 + 127;
				dst[index1 + 3] = src[index1 + 3];
			}
		}
	}
});