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
	_lastVolume : null, //音乐淡出辅助变量

	_blurFadeoutTime : 1500, //界面模糊淡出时间
	_logoShowTime : 1500, //logo出现时间点
	_totalEndingTime : 5000, //总共结束时间

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

		if(template.config.assetsDir) {
			WGE.SlideshowSettings.assetsDir = template.config.assetsDir;			
		}

		FT.EventManager.sendEvent(new FT.KTemplateLoadingEvent(0, FT.TLP_ANIMATION_IMAGELOADING, this.template));

		WGE.SlideshowInterface.initialize.call(this, element, imageURLs, function (imgArr, slideshowThis){
			if(callback)
				callback.call(scope);

			// self.play();
			// self.pause();

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
		this.timeline = undefined;
		WGE.release(this);
	},

	_audioplaying : function()
	{
		this._audioplayingTime = this.getAudioPlayingTime();
		FT.EventManager.sendEvent({
			type: "FM_PLAY_PROGRESS",
			position: this.timeline.currentTime,
			duration: this.timeline.totalTime
		});
	},

	//需要第三方 soundManager
	_initAudio : function(url)
	{
		var self = this;
		var arg = {url : url};

		if(typeof this._audioFinish == "function")
			arg.onfinish = this._audioFinish.bind(this);

		if(typeof this._audioplaying == "function")
			arg.whileplaying = this._audioplaying.bind(this);

		if(typeof this._audiosuspend == "function")
			arg.onsuspend = this._audiosuspend.bind(this);
		if(typeof this._audioTimeout == "function")
			arg.ontimeout = this._audioTimeout.bind(this);

		var tryInitAudio = function() {
			if(WGE.soundManagerReady)
			{
				if(self.audio)
					return;
				self.audio = soundManager.createSound(arg);
				if(!self.audio)
					self._checkAudioFailed();
				self.audio.play();
				//初始时将音乐标记为暂停状态，而不是未播放状态。
				if(!self._animationRequest)
					self.audio.pause();
				try
				{
					var v = self.template.config.music.defaultVolume;
					if(!isNaN(v))
						self.audio.setVolume(v);
				}catch(e) {}
			}
			else
			{
				setTimeout(tryInitAudio.bind(this), 100);
			}
		};

		tryInitAudio();
	},

	_checkAudioFailed : function()
	{
		if(this.audio.readyState == 2)
		{
			console.error("Failed to play audio : ", this.audioFileName);
			FT.EventManager.sendEvent({type: "FM_TEMPLATE_LOADMUSIC_FAILED"});
			this.stop();
			return true;
		}
		else if(this.audio.readyState == 3)
		{
			this._checkAudioFailed = null;
		}
		return false;
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
		if(dt >  this._totalEndingTime)
		{
			this.context.save();
			this.context.drawImage(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
			this.context.fillStyle = "#000";
			this.context.globalAlpha = 0.5;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.restore();
			console.log("Slideshow endloop finished.");
			if(this.audio)
			{
				this.audio.stop();
				this.audio.setVolume(this._lastVolume);
				this._lastVolume = null;
			}
			return ;
		}

		this.context.save();

		if(dt < this._blurFadeoutTime)
		{
			this.context.drawImage(this._endCanvas, 0, 0);
			this.context.globalAlpha = dt / this._blurFadeoutTime;
			this.context.drawImage(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
		}
		else
		{
			this.context.drawImage(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
			this.context.globalAlpha = (dt - this._blurFadeoutTime) / (2.0 * (this._totalEndingTime - this._blurFadeoutTime));
			this.context.fillStyle = "#000";
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.context.restore();

		if(this._lastVolume)
			this.audio.setVolume(this._lastVolume * (1 - dt / this._totalEndingTime));

		//保证淡出执行间隔。(淡出不需要太高的帧率，和大量运算)
		setTimeout(this.endloop.bind(this), 20);
	},

	_end : function()
	{
		console.log("Slideshow End");
		this._animationRequest = null;
		this._endBlurCanvas = WGE.CE("canvas");
		this._endBlurCanvas.width = this.canvas.width / 2;
		this._endBlurCanvas.height = this.canvas.height / 2;
		var ctx = this._endBlurCanvas.getContext('2d');
		ctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height);
		var blurredData = WGE.Filter.StackBlur.stackBlurCanvasRGB(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 25);
		ctx.putImageData(blurredData, 0, 0);
		this._endCanvas = WGE.CE("canvas");
		this._endCanvas.width = this.canvas.width;
		this._endCanvas.height = this.canvas.height;
		this._endCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
		this.timeline.end();
		this._lastVolume = this.audio.volume;

		this._lastFrameTime = Date.now();

		FT.EventManager.sendEvent({
			type: "FM_PLAY_PROGRESS",
			position: this.timeline.totalTime,
			duration: this.timeline.totalTime
		});
		setTimeout(this.endloop.bind(this), 1);
		setTimeout(this._showLogo.bind(this), this._logoShowTime);
	},

	_showLogo : function()
	{
		if(this._animationRequest || !(this.context && this._endBlurCanvas && this._endCanvas))
			return;
		FT.EventManager.sendEvent({
			type: "FM_MUSIC_END"
		});
	},

	setParam : function(param)
	{
		if(typeof param.musicVolume == "number")
		{
			//this._lastVolume = null;
			this.setVolume(param.musicVolume);
		}
	}

});