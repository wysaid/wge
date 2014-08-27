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

WGE.Filter.SnapshotBlur = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{
		var lw = w - 2, lh = h - 20;

		for(var i = 20; i < lh; ++i)
		{
			var line = i * w * 4;
			for(var j = 0; j < lw; ++j)
			{
				var index = line + j * 4;
				var r = 0.0, g = 0.0, b = 0.0;
				var total = 0;
				for(var k = -24; k <= 24; k += 4)
				{
					r += src[index + k];
					g += src[index + k + 1];
					b += src[index + k + 2];
					++total;
				}
				dst[index] = r / total;
				dst[index + 1] = g / total;
				dst[index + 2] = b / total;
				dst[index + 3] = 255;
			}
		}

		for(var i = 20; i < lh; ++i)
		{
			var line = i * w * 4;
			for(var j = 0; j < lw; ++j)
			{
				var index = line + j * 4;
				var r = 0.0, g = 0.0, b = 0.0;
				var total = 0;
				for(var k = -24; k <= 24; k += 4)
				{
					var tmp = k * w;
					r += src[index + tmp];
					g += src[index + tmp + 1];
					b += src[index + tmp + 2];
					++total;
				}
				dst[index] = (dst[index] + r / total) / 2;
				dst[index + 1] = (dst[index + 1] + g / total) / 2;
				dst[index + 2] = (dst[index + 2] + b / total) / 2;
				dst[index + 3] = 255;
			}
		}
	}
});

WGE.Snapshots = WGE.Class(WGE.SlideshowInterface,
{
	config : 1,
	audioFileName : ["happy.mp3", "happy.ogg"],  // 音乐文件名

	loopTime : 5000,
	loopImageNum : 1,

	_loadImages : function(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			self.srcImages = WGE.imagesFitSlideshow(imgArr, imageRatioX, imageRatioY);

			if(self.config)
				self.initTimeline(self.config);
			if(finishCallback)
				finishCallback();

			self.config = null;
		}, eachCallback);
	},

	_genBlurredImages : function(imgArr)
	{
		var blurredImgs = [];
		for(var i in imgArr)
		{
			var img = imgArr[i];
			var ctx = img.getContext('2d');
			var dw = 64, dh = 48;
			var data = ctx.getImageData(img.width / 2 - dw - 20, img.height / 2 - dh - 20, dw * 2 + 20, dh * 2 + 20);
			var cvs = WGE.CE('canvas');
			cvs.width = data.width;
			cvs.height = data.height;
			var ctx2 = cvs.getContext('2d');
			var dstData = ctx2.getImageData(0, 0, cvs.width, cvs.height);
			WGE.Filter.SnapshotBlur._run(dstData.data, data.data, cvs.width, cvs.height);
			ctx2.putImageData(dstData, 0, 0);
			blurredImgs.push(cvs);
		}
		return blurredImgs;
	},

	initTimeline : function(config)
	{
		var totalTime = Math.ceil(this.srcImages.length / this.loopImageNum) * this.loopTime;
		this.timeline = new WGE.TimeLine(totalTime);

		var t = 0;
		var zIndex = 0;

		var blurredImgs = this._genBlurredImages(this.srcImages);

		for(var i in this.srcImages)
		{
			var rand = Math.random();
			var img = this.srcImages[i];

			var sprite = new WGE.SlideshowAnimationSprite(t, t + 6000, img, -1);
			sprite.setHotspot2Center();
			sprite.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			sprite.zIndex = zIndex;
			var scaleAction = new WGE.Actions.UniformScaleAction([0, 6000], [0.95, 0.95], [0.75, 0.75])
			var alphaAction = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			var rot0 = (Math.random() - 0.5) / 3;
			var rot1 = rot0 + Math.random() / 5 + 0.05;
			var rotateAction = new WGE.Actions.UniformRotateAction([0, 6000], rot0, rot1);
			sprite.pushArr([scaleAction, alphaAction, rotateAction]);

			var img2 = blurredImgs[i];

			var sprite2 = new WGE.SlideshowAnimationSprite(t, t + 6000, img2, -1);
			sprite2.setHotspot2Center();
			sprite2.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			sprite2.push(alphaAction);
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
	},

	mainloop : function()
	{
		var timeNow = Date.now();
		var asyncTime = this._audioplayingTime - this.timeline.currentTime;

		//当音乐时间与时间轴时间差异超过300毫秒时，执行同步操作
		if(Math.abs(asyncTime) > 500)
		{
			console.log(asyncTime);
			//当时间轴慢于音乐时间时，执行时间轴跳跃。
			if(asyncTime > 500)
			{
				if(!this.timeline.update(asyncTime))
				{
					console.log("Slideshow Jump To End");
					this._animationRequest = null;
					this.endloop();
					return ;
				}
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.timeline.render(this.context);
			}

			this._lastFrameTime = timeNow;			
			this._animationRequest = requestAnimationFrame(this._loopFunc);
			return ;
		}

		var deltaTime = timeNow - this._lastFrameTime;
		this._lastFrameTime = timeNow;

		if(!this.timeline.update(deltaTime))
		{
			console.log("Slideshow End");
			this._animationRequest = null;
			this.endloop();
			return ;
		}
		this.context.shadowColor = "rgba(0, 0, 0, 0.8)";
		this.context.shadowOffsetX = -15;
		this.context.shadowOffsetY = -10;
		//this.context.shadowBlur = 20;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.timeline.render(this.context);
		this._animationRequest = requestAnimationFrame(this._loopFunc);
	}	

});

