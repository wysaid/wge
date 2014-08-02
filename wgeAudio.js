"use strict";
/*
* wgeAudio.js
*
*  Created on: 2014-8-1
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
	简介： wgeAudio对audio类进行简单的封装，并提供易用的音乐播放。
*/

WGE.Audio = WGE.Class(
{
	media : undefined,
	isLoaded : false;

	//构造函数： audio 为audio标签名 或者 包含可用音源信息的url 或者audio对象
	//		endCallback 为音乐播放结束时的回调函数
	//		autoplay (boolean)设置是否自动开始播放
	//		loopAudio (boolean)设置是否循环播放
	initialize : function(audio, endCallback, autoplay, loopAudio)
	{
		if(typeof audio == 'string')
		{
			this.media = WGE.ID(audio);
			if(!this.media)
			{
				this.media = WGE.CE('audio');
				this.media.src = audio;
			}
		}
		else if(typeof this.media == 'object')
			this.media = audio;
		else
		{
			WGE.ERR("Can't initialize audio : ", audio);
			this.media = {}; //防止后续调用崩溃
			return;
		}

		this.media.onload = this.onload;

		if(!this.media.duration || this.media.buffered.length >= this.media.duration - 0.01)
		{
			this.onload();
		}			

		if(autoplay)
			this.media.autoplay = autoplay;
		if(loopAudio)
			this.media.loop = loopAudio;
		if(endCallback)
			this.media.onended = endCallback;
	},

	onload : function()
	{
		this.isLoaded = true;
		if(this.autoStart)
			this.play();
	},

	//如果fromTime不填则从最开始播放，否则将进度跳转至fromIndex处并开始播放
	play : function(fromTime)
	{
		if(fromTime)
			this.media.currentTime = fromTime;
		else this.media.currentTime = fromTime;
		this.media.play();
	},

	stop : function()
	{
		this.media.pause();
		this.media.currentTime = 0;
	},

	isEnded : function()
	{
		return this.media.ended;
	},

	pause : function()
	{
		this.media.pause();
	},

	resume : function()
	{
		if(this.media.paused)
			this.media.play();
	},

	isPaused : function()
	{
		return this.media.paused;
	},

	volume : function(newVolume)
	{
		if(newVolume)
			this.media.volume = newVolume;
		return this.media.volume;
	},

	currentTime : function()
	{
		return this.media.currentTime;
	},

	duration : function()
	{
		return this.media.duration;
	},

	muted : function(mute)
	{
		this.media.muted = !!mute;
	}

	//仅在音频缓冲并播放过程中与某个对象同步
	//如果音频缓冲完毕或者音频暂停播放则同步结束。
	sync : function(pauseFunc, resumeFunc)
	{
		if(this.isLoaded)
			return;

		this.lastPlayingTime = this.media.currentTime;

		var func = (function() {
			if(lastPlayingTime == this.media.currentTime)
			{
				pauseFunc();
			}
			else
			{
				resumeFunc();
				this.lastPlayingTime = this.media.currentTime;
			}

			if(!this.isLoaded || this.isPaused())
			{
				return ;
			}
			setTimeout(func, 100);
		}).bind(this);

		func();
	}

});