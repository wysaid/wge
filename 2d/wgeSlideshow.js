"use strict";
/*
* wgeSlideshow.js
*
*  Created on: 2014-8-14
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*




*/


//特别注意， SlideshowSettings 里面的width和height代表slideshow算法用到的实际宽高，精确到像素
//style里面的宽高是显示时的宽高，系统会自动进行缩放显示。
//请勿在slideshow里面添加任何无意义的动态设定宽高的代码，浪费性能。

WGE.SlideshowSettings = 
{
	width : 800,
	height : 600,
	style : "width:100%;height:100%"
};

WGE.fitSlideImages(imgs)
{

}

WGE.SlideshowInterface = WGE.Class(
{
	assetsDir : "",
	musicDuration : 60000, //音乐文件的总时长
	audio : null,
	timeline : null, //整个slideshow的时间轴.

	father : null, //绘制目标所在的DOM
	canvas : null, //绘制目标
	context : null, //绘制目标的context

	srcImages : null,

	//在initialize末尾把子类的构造函数传递进来，末尾执行是很愚蠢的行为
	//请直接在子类里面执行。
	//末尾的canvas和context参数可选， 如果填写则直接将绘制目标设置为末尾参数指定的canvas(主要用于测试)
	initialize : function(fatherDOM, imgURLs, finishCallback, canvas, context)
	{
		this.father = fatherDOM;
		this.canvas = canvas;
		if(!this.canvas)
		{
			this.canvas = WGE.CE('canvas');
		}
		this.canvas.width = WGE.SlideshowSettings.width;
		this.canvas.width = WGE.SlideshowSettings.height;
		this.canvas.setAttribute("style", WGE.SlideshowSettings.style);

		this.context = context || this.canvas.getContext('2d');

		this._loadImages(imgURLs, finishCallback);
	},

	_loadImages : function(imgURLs, finishCallback)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			this.srcImages = self.fitSlideImages(imgArr);
			if(finishCallback)
				finishCallback();
		});
	}

	//释放内存，在移动设备上效果比较明显。
	release : function()
	{
		WGE.release(this);
	},

	play : function()
	{

	},

	stop : function()
	{

	},

	pause : function()
	{

	},

	resume : function()
	{

	},

	setVolume : function()
	{

	},






});