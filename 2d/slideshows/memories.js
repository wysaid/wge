"use strict";
/*
* memories.js
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

	_bgImage : null,
	_bgImageURL : "memories.jpg",

	_loadImages : function(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY)
	{
		var self = this;

		WGE.loadImages([this._bgImageURL], function(imgArr) {
			self._bgImage = imgArr[0];

			WGE.loadImages(imgURLs, function(imgArr) {
				self.srcImages = WGE.imagesFitSlideshow(imgArr, imageRatioX, imageRatioY);

				if(self.config)
					self.initTimeline(self.config);
				if(finishCallback)
					finishCallback(self.srcImages, self);

				self.config = null;
			}, function(img, n) {
				if(eachCallback)
					eachCallback(img, n, self);
			});
		})
	},

	_genBlurredImages : function(imgArr)
	{
		var blurredImgs = [];

		var tmpArr = [0, 1, 2, 3];

		for(var i = 0; i < imgArr.length; ++i)
		{

			var tmpN = parseInt(Math.round(Math.random() * 3));
			var tmpM = parseInt(Math.round(Math.random() * 3));
			var n = tmpArr[tmpN];
			tmpArr[tmpN] = tmpArr[tmpM];
			tmpArr[tmpM] = n;			

			var img1 = imgArr[(tmpArr[0] + i) % imgArr.length];
			var img2 = imgArr[(tmpArr[1] + i) % imgArr.length];
			var img3 = imgArr[(tmpArr[2] + i) % imgArr.length];
			var img4 = imgArr[(tmpArr[3] + i) % imgArr.length];

			var dw = 1024 / 4, dh = 768 / 4;

			var cvs = WGE.CE('canvas');
			cvs.width = dw * 2 + 20;
			cvs.height = dh * 2 + 20;
			var ctx = cvs.getContext('2d');

			var ratio = Math.random() * 0.5 + 0.5;
			var w = ratio * cvs.width / 2;
			var h = ratio * cvs.height / 2;
			
			ctx.drawImage(this._bgImage, 0, 0, this._bgImage.width, this._bgImage.height, 0, 0, cvs.width, cvs.height);

			ctx.save();
			ctx.translate(Math.random() * 100, Math.random() * 100);
			ctx.rotate(Math.random() * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1));
			ctx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, w, h);
			ctx.restore();
			ctx.save();
			ctx.translate(cvs.width / 2 + Math.random() * 100, Math.random() * 100);
			ctx.rotate(Math.random() * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1));
			ctx.drawImage(img2, 0, 0, img2.width, img2.height, 0, 0, w, h);
			ctx.restore();
			ctx.save();
			ctx.translate(Math.random() * 100, cvs.height / 2 + Math.random() * 100);
			ctx.rotate(Math.random() * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1));
			ctx.drawImage(img3, 0, 0, img3.width, img3.height, 0, 0, w, h);
			ctx.restore();
			ctx.save();
			ctx.translate(cvs.width / 2 + Math.random() * 100, cvs.height / 2 + Math.random() * 100);
			ctx.rotate(Math.random() * Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1));
			ctx.drawImage(img4, 0, 0, img4.width, img4.height, 0, 0, w, h);
			ctx.restore();

			var dstData = WGE.Filter.StackBlur.stackBlurCanvasRGB(cvs, 0, 0, cvs.width, cvs.height, 1);

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

		var boundingBoxes = this._genBoundingBox(this.srcImages);
		var blurredImgs = this._genBlurredImages(boundingBoxes);

		for(var i in this.srcImages)
		{
			var rand = Math.random();
			var img = boundingBoxes[i];

			var fatherSprite = new WGE.SlideshowAnimationLogicSprite(t, t + 6000);

			fatherSprite.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			fatherSprite.zIndex = zIndex;

			var scaleAction = new WGE.Actions.UniformScaleAction([0, 6000], [0.7, 0.7], [0.95, 0.95])
			var alphaAction = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			var rot1 = (Math.random() / 10 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
			var rotateAction = new WGE.Actions.UniformRotateAction([0, 6000], 0, rot1);

			fatherSprite.pushArr([scaleAction, alphaAction, rotateAction]);

			var sprite = new WGE.SlideshowAnimationSprite(t, t + 6000, img, -1);
			sprite.setHotspot2Center();
			
			// sprite.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			// sprite.zIndex = zIndex;
			// var scaleAction = new WGE.Actions.UniformScaleAction([0, 6000], [0.7, 0.7], [0.95, 0.95])
			// var alphaAction = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			// var rot1 = (Math.random() / 10 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
			// var rotateAction = new WGE.Actions.UniformRotateAction([0, 6000], 0, rot1);
			// sprite.pushArr([scaleAction, alphaAction, rotateAction]);

			var img2 = blurredImgs[i];

			var sprite2 = new WGE.SlideshowAnimationSprite(t, t + 6000, img2, -1);
			sprite2.setHotspot2Center();
			var sx = WGE.SlideshowSettings.width / (img2.width - 40), sy = WGE.SlideshowSettings.height / (img2.height - 40)
			sprite2.scaleTo(sx / 0.7, sy / 0.7);

			
			// sprite2.moveTo(WGE.SlideshowSettings.width / 2, WGE.SlideshowSettings.height / 2);
			// var alphaAction2 = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);			
			// var scaleAction2 = new WGE.Actions.UniformScaleAction([0, 6000], [sx, sy], [sx / 0.7, sy / 0.7])
			// var rotateAction2 = new WGE.Actions.UniformRotateAction([0, 6000], 0, rot1);
			// sprite2.pushArr([alphaAction2, rotateAction2, scaleAction2]);

			fatherSprite.addChild(sprite2, sprite);
			this.timeline.push(fatherSprite);
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

