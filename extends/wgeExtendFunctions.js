"use strict";
/*
* wgeCommonFunctions.js
*
*  Created on: 2014-8-25
*
*/

/*
	简介： 公用的扩展方法库， 列举一些可能被重用的方法。
	       如果你觉得全部写到一个文件里面不方便，也可以自己新添加一个文件。

	特别注意: 如果该方法涉及到某个特定环境下(比如必须要context-2d支持), 请务必标注出来。
*/

// 将本文件内所有方法添加至 WGE.ExtendFunc 类名下，防止命名冲突

WGE.ExtendFunc = {};

(function()
{

var F = WGE.ExtendFunc;


//注: clipZone和fillZone选择其中一个使用即可。
//    Zone2d 仅支持context-2d
//功能: 提供一系列点，围成一个区域，然后对传入的context进行裁剪/填充
//      具体效果参考 PhotoFrame(Piano)
F.Zone2d = WGE.Class(
{
	clipArray : undefined,

	initialize : function(arr)
	{
		if(arr instanceof Array)
		{
			this.clipArray = arr;
		}
		else
		{
			this.clipArray = [];
			this.clipArray.push.apply(this.clipArray, arguments);
		}
	},

	//使用前请save ctx状态
	clipZone : function(ctx, stroke, style, lineWidth)
	{
		if(style)
			ctx.strokeStyle = style;
		if(lineWidth)
			ctx.lineWidth = lineWidth;

		ctx.beginPath();
		ctx.moveTo(this.clipArray[0].data[0], this.clipArray[0].data[1]);
		for(var i in this.clipArray)
		{
			ctx.lineTo(this.clipArray[i].data[0], this.clipArray[i].data[1]);
		}
		ctx.closePath();
		if(stroke)
			ctx.stroke();
		ctx.clip();
	},

	//同上
	fillZone : function(ctx, pattern, style, lineWidth)
	{
		if(pattern)
			ctx.fillStyle = pattern;
		if(style)
			ctx.strokeStyle = style;
		if(lineWidth)
			ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(clipArray[0].data[0], clipArray[0].data[1]);
		for(var i in clipArray)
		{
			ctx.lineTo(clipArray[i].data[0], clipArray[i].data[1]);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

});


})();