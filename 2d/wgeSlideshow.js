"use strict";
/*
* wgeSlideshow.js
*
*  Created on: 2014-8-14
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
简介：主要提供与网站界面兼容的接口设计，
      以及提供对于json配置文件的解析接口。
*/


//特别注意， SlideshowSettings 里面的width和height代表slideshow算法用到的实际宽高，精确到像素
//style里面的宽高是显示时的宽高，系统会自动进行缩放显示。
//请勿在slideshow里面添加任何无意义的动态设定宽高的代码，浪费性能。

WGE.SlideshowSettings = 
{
	assetsDir : "",  //音乐等资源所在文件夹
	width : 1024,
	height : 768,
	style : "width:100%;height:100%"
};


//如果不添加后两个参数， 则默认统一规范，slideshow使用分辨率为 1024*768
//本函数将等比缩放图片，将使图片宽或者高满足这个分辨率并且另一边大于等于这个分辨率。
//如： 图片分辨率为 1024 * 1024， 则图片不变
//     图片分辨率为 768 * 768， 则将等比缩放为 1024 * 1024
//     图片分辨率为 1024 * 500， 则将等比缩放为 1573 * 768
// 后两个参数表示将分辨率缩小至这个尺寸， 可根据实际需求设定。
WGE.slideshowFitImages = function(imgs, w, h)
{
	if(!(w && h))
	{
		w = 1024;
		h = 768;
	}

	var fitImgs = [];

	for(var i = 0; i != imgs.length; ++i)
	{
		var img = imgs[i];
		var canvas = WGE.CE('canvas');
		var scale = Math.min(img.width / w, img.height / h);
		canvas.width = img.width / scale;
		canvas.height = img.height / scale;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
		fitImgs.push(canvas);
	}
	return fitImgs;
};

WGE.SlideshowInterface = WGE.Class(
{
	audioName : "", //音乐文件名
	musicDuration : 60000, //音乐文件的总时长
	audio : null,
	timeline : null, //整个slideshow的时间轴.

	father : null, //绘制目标所在的DOM
	canvas : null, //绘制目标
	context : null, //绘制目标的context

	srcImages : null,  //canvas类型的数组。

	//注意： 在initialize末尾把子类的构造函数传递进来，末尾执行是很不好的行为
	//请直接在子类里面执行。 避免不必要的逻辑绕弯，加大维护时的麻烦。
	//末尾的canvas和context参数可选， 如果填写则直接将绘制目标设置为末尾参数指定的canvas(主要用于demo)
	initialize : function(fatherDOM, imgURLs, finishCallback, eachCallback, canvas, context)
	{
		this.father = fatherDOM;
		this.canvas = canvas || WGE.CE('canvas');
		this.canvas.width = WGE.SlideshowSettings.width;
		this.canvas.height = WGE.SlideshowSettings.height;
		this.canvas.setAttribute("style", WGE.SlideshowSettings.style);

		this.context = context || this.canvas.getContext('2d');

		this._loadImages(imgURLs, finishCallback, eachCallback);
	},

	_loadImages : function(imgURLs, finishCallback, eachCallback)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			self.srcImages = WGE.slideshowFitImages(imgArr);
			if(finishCallback)
				finishCallback();
		}, eachCallback);
	},

	_initAudio : function()
	{

	},

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

	//进度跳转
	jump : function(time)
	{

	}

	
});