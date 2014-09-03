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

	boundingBoxes : null,
	bgImages : null,

	_bgImage : null,
	_bgImageURL : "memories.jpg",

	_bwImages : null,
	_filter : null,

	_queue : null,

	_timerID : null,
	_finishCallback : null,
	_eachCallback : null,
	_loadingFinish : false,

	_syncTime : 2000,

	initialize : function()
	{
		this.bgImages = [];
		this.boundingBoxes = [];
		this._bwImages = [];
		this._filter = new WGE.Filter.Monochrome();

		WGE.SlideshowInterface.initialize.apply(this, arguments);
	},

	_loadImages : function(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY)
	{
		var self = this;
		this._finishCallback = finishCallback;
		this._eachCallback = eachCallback;
		WGE.loadImages([this._bgImageURL], function(imgArr) {
			self._bgImage = imgArr[0];

			WGE.loadImages(imgURLs, function(imgArr) {
				if(typeof self._dealFinishLoadingImage == 'function')
					self._dealFinishLoadingImage(imgArr);
				else
					self.srcImages = WGE.slideshowFitImages(imgArr, self._imageRatioX, self._imageRatioY);

			}, function(img, n, imageIndex) {
				if(typeof self._dealLoadingImage == 'function')
					self._dealLoadingImage(img, imageIndex, n);
			});
		})
	},	

	_genBlurredImages : function(imgArr)
	{
		var blurredImgs = [];

		var totalImg = 10;
		var w = WGE.SlideshowSettings.width / 1.4, h = WGE.SlideshowSettings.height / 1.4;
		var dw = WGE.SlideshowSettings.width / 0.7, dh = WGE.SlideshowSettings.height / 0.7;

		for(var i = 0; i < imgArr.length; ++i)
		{
			var tmpArr = [];
			for(var j = i; j < totalImg + i; ++j)
				tmpArr.push(imgArr[j % imgArr.length]);			

			var cvs = WGE.CE('canvas');
			cvs.width = dw;
			cvs.height = dh;
			var ctx = cvs.getContext('2d');			

			ctx.drawImage(this._bgImage, 0, 0, this._bgImage.width, this._bgImage.height, 0, 0, cvs.width, cvs.height);

			ctx.save();
			ctx.shadowBlur = 50;
			ctx.shadowColor = "#000";
			var img, scaling;

			img = tmpArr[0];
			ctx.save();
			ctx.translate(-50, -50);
			ctx.rotate((Math.random() - 0.5) * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[1];
			ctx.save();
			ctx.translate(dw * 0.3, -50);
			ctx.rotate(-Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[8];
			ctx.save();
			ctx.translate(dw * 0.5, -50);
			ctx.rotate(Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[2];
			ctx.save();
			ctx.translate(dw * 0.8, -50);
			ctx.rotate( -Math.random() * Math.PI / 6);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			//3
			img = tmpArr[3];
			ctx.save();
			ctx.translate(-50, dh * (1.0 / 3.0));
			ctx.rotate(-Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[4];
			ctx.save();
			ctx.translate(-50, dh * (2.0 / 3.0));
			ctx.rotate(-Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[5];
			ctx.save();
			ctx.translate(dw * 0.4, dh * 0.6);
			ctx.rotate(Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[6];
			ctx.save();
			ctx.translate(dw * 0.7, dh * 0.6);
			ctx.rotate(Math.random() * Math.PI / 6 * (Math.random() > 0.5 ? 1 : -1));
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			img = tmpArr[7];
			ctx.save();
			ctx.translate(dw * 0.7, dh * 0.3);
			ctx.rotate(Math.random() * Math.PI / 9);
			scaling = 1.0 / Math.max(img.width / w, img.height / h);
			ctx.scale(scaling, scaling);
			ctx.drawImage(img, 0, 0);
			ctx.restore();

			ctx.restore();

			blurredImgs.push(cvs);
		}
		return blurredImgs;
	},

	_genBoundingBoxes : function(imgArr)
	{
		var boundingBoxArr = [];

		for(var i in imgArr)
		{
			boundingBoxArr.push(this._genBoundingBox(imgArr[i]));
		}
		return boundingBoxArr;
	},

	_genBoundingBox : function(img)
	{
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
		return cvs;
	},

	initTimeline : function(config)
	{
		var totalTime = Math.ceil(this.boundingBoxes.length / this.loopImageNum) * this.loopTime;
		this.timeline = new WGE.TimeLine(totalTime);

		var t = 0;
		var zIndex = 0;

		var blurredImgs = this._genBlurredImages(this._bwImages);

		for(var i in this.boundingBoxes)
		{
			var rand = Math.random();
			var img = this.boundingBoxes[i];

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

			var img2 = blurredImgs[i];

			var sprite2 = new WGE.SlideshowAnimationSprite(t, t + 6000, img2, -1);
			sprite2.setHotspot2Center();

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
	},

	//////////////////////////////////////////////////////////////////////

	_dealLoadingImage : function(img, index, n)
	{
		if(!this._queue)
			this._queue = [];
		this._queue.push({IMAGE : img, INDEX : index, TOTAL : n});

		if(!this._timerID)
			this._timerID = setTimeout(this._processingQueue.bind(this), 20);		
	},

	_processingQueue : function()
	{
		if(!(this._queue instanceof Array && this._queue.length > 0))
		{
			this._queue = null;
			this._timerID = null;
			if(this._loadingFinish)
			{
				if(this.config)
					this.initTimeline(this.config);
				if(this._finishCallback)
					this._finishCallback(this.boundingBoxes, this);
				this.config = null;
			}
			return ;
		}
		var obj = this._queue.shift();
		this._processingImage(obj);
		this._timerID = setTimeout(this._processingQueue.bind(this), 20);
	},

	_dealFinishLoadingImage : function(imgArr)
	{
		this._loadingFinish = true;
		if(!this._timerID)
		{
			if(this.config)
				this.initTimeline(this.config);
			if(this.finishCallback)
				this.finishCallback(this.boundingBoxes || imgArr, this);
			this.config = null;
		}
	},

	_processingImage : function(obj)
	{
		var index = obj.INDEX;
		var img = obj.IMAGE;
		var fitImg = WGE.imageFitSlideshow(img);
		this.boundingBoxes[index] = this._genBoundingBox(fitImg);
		this._bwImages[index] = this._filter.bind(this.boundingBoxes[index]).run();
		this._eachCallback(img, obj.TOTAL, this);
	}
});

