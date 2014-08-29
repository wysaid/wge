"use strict";
/*
* wgeFotorSlideshowInterface.js
*
*  Created on: 2014-8-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
	简介: 为fotor slideshow 提供一致对外接口
	需要网站部分js代码支持， 不可单独使用。

*/


WGE.FotorSlideshowInterface = WGE.Class(FT.KAnimator, WGE.SlideshowInterface,
{

	//options、lastPhotoCallback 都是无意义参数，建议剔除
	initialize : function(element, options, template, callback, scope, lastPhotoCallback)
	{
		FT.KAnimator.initialize.call(this, template);
		var self = this;
		var imageURLs = template.config.imageUrls || template.config.previewImageUrls;
		var len = imageURLs.length;

		if(!(len > 0))
		{
			console.error("未传入图片");
			return ;
		}

		FT.EventManager.sendEvent(new FT.KTemplateLoadingEvent(0, FT.TLP_ANIMATION_IMAGELOADING, this.template));

		WGE.SlideshowInterface.initialize.call(this, element, imageURLs, function (imgArr, slideshowThis){
			if(callback)
				callback.call(scope);
			self.play();
		}, function(img, n, slideshowThis){
			FT.EventManager.sendEvent(new FT.KTemplateLoadingEvent(n / len, FT.TLP_ANIMATION_IMAGELOADING, self.template));
		});

		//兼容接口
		this.setMusicVolume = this.setVolume;
		this.clear = this.release;
	},

	release : function()
	{
		this.audio.destruct();
		this.srcImages = undefined;
		WGE.release(this);
	},

	_audioplaying : function()
	{
		this._audioplayingTime = this.getAudioPlayingTime();
		FT.EventManager.sendEvent({
			type: "FM_PLAY_PROGRESS",
			position: this._audioplayingTime,
			duration: this.timeline.totalTime
		});
	},

	onEvent: function(e)
	{
		try
		{
			if (this.template.config.autoPauseAsHide)
			{
				if (e.type == "FM_WINDOW_HIDE")
				{
					this.pause();
				}
				else if (e.type == "FM_WINDOW_SHOW")
				{
					this.resume();
				}
			}
		}catch(e)
		{
			console.warn("多余Event, 需要网站解决");
		}
	},

	endloop : function()
	{
		if(this._animationRequest || !(this.context && this._endBlurCanvas && this._endCanvas))
			return;
		var time = Date.now();
		var dt = time - this._lastFrameTime;
		if(dt >  3000)
		{
			this.context.save();
			this.context.drawImage(this._endBlurCanvas, 0, 0);
			this.context.fillStyle = "#000";
			this.context.globalAlpha = 0.5;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.restore();
			console.log("Slideshow endloop finished.");
			FT.EventManager.sendEvent({
				type: "FM_MUSIC_END"
			});
			FT.EventManager.sendEvent({
				type: "FM_PLAY_PROGRESS",
				position: this.timeline.totalTime,
				duration: this.timeline.totalTime
			});
			return ;
		}

		this.context.save();

		if(dt < 1500)
		{
			this.context.drawImage(this._endCanvas, 0, 0);
			this.context.globalAlpha = dt / 1500;
			this.context.drawImage(this._endBlurCanvas, 0, 0);
		}
		else
		{
			this.context.drawImage(this._endBlurCanvas, 0, 0);
			this.context.globalAlpha = (dt - 1500) / 3000;
			this.context.fillStyle = "#000";
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.context.restore();
		//保证淡出执行间隔。(淡出不需要太高的帧率，和大量运算)
		setTimeout(this.endloop.bind(this), 20);
	},

	setParam : function() {}

});