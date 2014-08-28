"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-8-28
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/


WGE.Memories = WGE.Class(WGE.SlideshowInterface,
{
	config : 1,
	audioFileName : ["Live My Life.mp3", "Live My Life.ogg"],  // 音乐文件名

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

		// var filter = new WGE.Filter.StackBlur();

		for(var i = 0; i < imgArr.length; ++i)
		{
			var img1 = imgArr[i % imgArr.length];
			var img2 = imgArr[(i + 1) % imgArr.length];
			var img3 = imgArr[(i + 2) % imgArr.length];
			var img4 = imgArr[(i + 3) % imgArr.length];

			var dw = 1024 / 4, dh = 768 / 4;

			var cvs = WGE.CE('canvas');
			cvs.width = dw * 2 + 20;
			cvs.height = dh * 2 + 20;
			var ctx = cvs.getContext('2d');

			ctx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, cvs.width / 2, cvs.height / 2);
			ctx.drawImage(img2, 0, 0, img2.width, img2.height, cvs.width / 2, 0, cvs.width / 2, cvs.height / 2);
			ctx.drawImage(img3, 0, 0, img3.width, img3.height, 0, cvs.height / 2, cvs.width / 2, cvs.height / 2);
			ctx.drawImage(img4, 0, 0, img4.width, img4.height, cvs.width / 2, cvs.height / 2, cvs.width / 2, cvs.height / 2);

			var dstData = WGE.Filter.StackBlur.stackBlurCanvasRGB(cvs, 0, 0, cvs.width, cvs.height, 3);

			ctx.putImageData(dstData, 0, 0);
			blurredImgs.push(cvs);
		}
		return blurredImgs;
	},

	_genBoundingBox : function(imgArr)
	{
		var boundingBoxArr = [];

		for(var i in imgArr)
		{
			var img = imgArr[i];
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
			var scaleAction = new WGE.Actions.UniformScaleAction([0, 6000], [0.7, 0.7], [0.95, 0.95])
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

