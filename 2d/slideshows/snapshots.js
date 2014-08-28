"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

var snapshotsConfig = 
{
	"parserName" : "defaultParser", //设置解析器，默认defaultParser可不填写
	"loopTime" : 15000, // 完成单次循环所需总时间
	"loopImageNum" : 15,    // 一次循环所需图片数
	"audioFileName" : ["happy.mp3", "happy.ogg"],  // 音乐文件名
	"musicDuration" : 60000, //音乐文件总时长

	//场景, 由 AnimationSprite构成
	"sceneArr" : 
	[
		//第一个
		{
			//类名
			"imageindex" : 0, //当前sprite绑定的图片
			//初始化参数，参数为数组，一般是两个数
			"initArgs" : 
			[
				0, 6800
			],

			"spriteConfig" :
			{
				//"name" : "initSprite", //默认为"initSprite"
				"filter" : null,
				"filterArgs" : [],
				//宽高不填写则按默认配置缩放。
				"width" : null,
				"height" : null,
			},

			//接下来要执行的操作
			"execFunc" :
			[
				{
					"name" : "setHotspotWithRatio",
					"arg" : [0.5, 0.1],
				},
				{
					"name" : "moveTo",
					"arg" : [0.5, 0.1],
					"relativeResolution" : true,
					"relativeWidth" : 0,
					"relativeHeight" : 1
				}
			],

			"actions" :
			[
				{
					"name" : "UniformScaleAction",
					"arg" : [[0, 6000], [1.3, 1.3], [1, 1]],
				}
			],

			"childNodes" : 
			[
				
			]
		}
	],
};

WGE.Snapshots = WGE.Class(WGE.SlideshowInterface,
{
	config : 1,
	audioFileName : ["happy.mp3", "happy.ogg"],  // 音乐文件名

	loopTime : 5000,
	loopImageNum : 1,
	blurredImgs : null,
	boundingBoxes : null,

	initialize : function()
	{
		WGE.SlideshowInterface.initialize.apply(this, arguments);
		this.blurredImgs = [];
		this.boundingBoxes = [];
	},

	_genBlurredImages : function(imgArr)
	{
		var blurredImgs = [];

		for(var i in imgArr)
		{
			// var img = imgArr[i];
			// var dw = 1024 / 8, dh = 768 / 8;
			
			// var dstData = WGE.Filter.StackBlur.stackBlurCanvasRGB(img, img.width / 2 - dw - 20, img.height / 2 - dh - 20, dw * 2 + 20, dh * 2 + 20, 10);


			// var cvs = WGE.CE('canvas');
			// cvs.width = dstData.width;
			// cvs.height = dstData.height;
			// var ctx2 = cvs.getContext('2d');

			// ctx2.putImageData(dstData, 0, 0);
			// blurredImgs.push(cvs);
			blurredImgs.push(this._genBlurredImage(imgArr[i]));
		}
		return blurredImgs;
	},

	_genBlurredImage : function(img)
	{
		var cvs;		
		var dw = 1024 / 8, dh = 768 / 8;
		var dstData;
		cvs = WGE.CE('canvas');
		cvs.width = dw * 2 + 20;
		cvs.height = dh * 2 + 20;

		var ctx = cvs.getContext('2d');

		if(img.getContext)
		{
			dstData = WGE.Filter.StackBlur.stackBlurCanvasRGB(img, img.width / 2 - dw - 20, img.height / 2 - dh - 20, cvs.width, cvs.height, 10);
		}
		else
		{
			ctx.drawImage(img, img.width / 2 - dw - 20, img.height / 2 - dh - 20, cvs.width, cvs.height, 0, 0, cvs.width, cvs.height);
			dstData = WGE.Filter.StackBlur.stackBlurCanvasRGB(cvs, img.width / 2 - dw - 20, img.height / 2 - dh - 20, cvs.width, cvs.height, 10);
		}
		
		ctx.putImageData(dstData, 0, 0);		
		return cvs;
	},

	_genBoundingBox : function(imgArr)
	{
		var boundingBoxArr = [];

		for(var i in imgArr)
		{
			var img = imgArr[i];
			//var ctx = img.getContext('2d');
			var cvs = WGE.CE('canvas');
			cvs.width = img.width + 40;
			cvs.height = img.height + 40;
			var ctx = cvs.getContext('2d');
			ctx.save();
			ctx.fillStyle = "#fff";
			ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
			ctx.shadowBlur = 10;
			ctx.fillRect(10, 10, cvs.width - 20, cvs.height - 20);
			ctx.restore();
			ctx.drawImage(img, 20, 20);			
			boundingBoxArr.push(cvs);
		}
		return boundingBoxArr;
	},

	_loadImages : function(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			self.srcImages = WGE.slideshowFitImages(imgArr, imageRatioX, imageRatioY);

			if(self.config)
				self.initTimeline(self.config);
			if(finishCallback)
				finishCallback(self.srcImages, self);

			self.config = null;
		}, function(img, n) {
			// var imgFit = WGE.slideshowFitImages(img, imageRatioX, imageRatioY);
			// this.blurredImgs.push(this._genBlurredImage(imgFit));
			// this.boundingBoxes.push
			if(eachCallback)
				eachCallback(img, n, self);
		});
	},

	initTimeline : function(config)
	{
		var totalTime = Math.ceil(this.srcImages.length / this.loopImageNum) * this.loopTime;
		this.timeline = new WGE.TimeLine(totalTime);

		var t = 0;
		var zIndex = 0;

		var blurredImgs = this._genBlurredImages(this.srcImages);
		var boundingBoxes = this._genBoundingBox(this.srcImages);

		for(var i in this.srcImages)
		{
			var rand = Math.random();
			var img = boundingBoxes[i];

			var sprite = new WGE.SlideshowAnimationSprite(t, t + 6000, img, -1);
			sprite.setHotspot2Center();
			sprite.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			sprite.zIndex = zIndex;
			var scaleAction = new WGE.Actions.UniformScaleAction([0, 6000], [0.95, 0.95], [0.7, 0.7])
			var alphaAction = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			var rot1 = (Math.random() / 10 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
			var rotateAction = new WGE.Actions.UniformRotateAction([0, 3000], 0, rot1);
			sprite.pushArr([scaleAction, alphaAction, rotateAction]);

			var img2 = blurredImgs[i];

			var sprite2 = new WGE.SlideshowAnimationSprite(t, t + 6000, img2, -1);
			sprite2.setHotspot2Center();
			sprite2.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			var alphaAction2 = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			sprite2.push(alphaAction2);
			sprite2.scaleTo(WGE.SlideshowSettings.width / (img2.width - 40), WGE.SlideshowSettings.height / (img2.height - 40));
			sprite2.zIndex = zIndex - 1;
			this.timeline.pushArr([sprite, sprite2]);
			zIndex += 100;
			t += 5000;
		}

		if(this.audio)
		{
			return ;
		}
		var audioFileNames;
		if(this.audioFileName instanceof Array)
		{
			audioFileNames = [];
			for(var i in this.audioFileName)
				audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
		}
		else audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;
		this._initAudio(audioFileNames);
	}
});

