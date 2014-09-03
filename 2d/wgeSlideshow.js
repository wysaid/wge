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
	style : "width:100%;height:100%;background-color:#000"
};

if(window.soundManager && window.soundManager.onready)
{
	soundManager.onready(function(){
		WGE.soundManagerReady = true;
		console.log("WGE SM2 Ready");
	});
}

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
		w = WGE.SlideshowSettings.width;
		h = WGE.SlideshowSettings.height;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
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

WGE.slideshowFitImage = function(img, w, h)
{
	if(!(w && h))
	{
		w = WGE.SlideshowSettings.width;
		h = WGE.SlideshowSettings.height;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}

	var canvas = WGE.CE('canvas');
	var scale = Math.min(img.width / w, img.height / h);
	canvas.width = img.width / scale;
	canvas.height = img.height / scale;
	canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
	return canvas;
};

WGE.imagesFitSlideshow = function(imgs, w, h)
{
	if(!(w && h))
	{
		w = WGE.SlideshowSettings.width;
		h = WGE.SlideshowSettings.height;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}

	var fitImgs = [];

	for(var i = 0; i != imgs.length; ++i)
	{
		var img = imgs[i];
		var canvas = WGE.CE('canvas');
		var scale = Math.max(img.width / w, img.height / h);
		canvas.width = img.width / scale;
		canvas.height = img.height / scale;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
		fitImgs.push(canvas);
	}
	return fitImgs;
};

WGE.imageFitSlideshow = function(img, w, h)
{
	if(!(w && h))
	{
		w = 1024;
		h = 768;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}
	var canvas = WGE.CE('canvas');
	var scale = Math.max(img.width / w, img.height / h);
	canvas.width = img.width / scale;
	canvas.height = img.height / scale;
	canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
	return canvas;
};

if(WGE.Sprite && WGE.AnimationWithChildrenInterface2d)
{
	//注： initialize 末尾两个参数，如果 w 为-1， 表示img 不拷贝，共享使用
	WGE.SlideshowAnimationSprite = WGE.Class(WGE.Sprite, WGE.AnimationWithChildrenInterface2d,
	{
		initialize : function(startTime, endTime, img, w, h)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.Sprite.initialize.call(this, img, w, h);
		}
	});

	WGE.SlideshowAnimationLogicSprite = WGE.Class(WGE.LogicSprite, WGE.AnimationWithChildrenInterface2d,
	{
		initialize : function(startTime, endTime)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.LogicSprite.initialize.call(this);
		}
	});

	WGE.SlideshowAnimationGifSprite = WGE.Class(WGE.GifSprite, WGE.AnimationWithChildrenInterface2d,
	{
		switchTime : 250,

		initialize : function(startTime, endTime, imgArr, w, h)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.GifSprite.initialize.call(this, imgArr, w, h);
		},

		run : function(totalTime)
		{
			this.playIndex = parseInt(totalTime / this.switchTime) % this._imgArr.length;
			WGE.AnimationWithChildrenInterface2d.run.call(this, totalTime);
		},
	});

	WGE.SlideshowAnimationVideoSprite = WGE.Class(WGE.VideoSprite, WGE.AnimationWithChildrenInterface2d,
	{		
		initialize : function(startTime, endTime, video, w, h)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.VideoSprite.initialize.call(this, video, w, h);
		},

		run : function(totalTime)
		{			
			WGE.AnimationWithChildrenInterface2d.run.call(this, totalTime);
		},

		timeStart : function()
		{
			if(this._video.paused)
				this._video.play();
			WGE.AnimationWithChildrenInterface2d.timeStart.call(this);
		},

		timeUp : function()
		{
			if(!this._video.loop)
				this._video.pause();
			WGE.AnimationWithChildrenInterface2d.timeUp.call(this);
		},
	});
}


WGE.SlideshowInterface = WGE.Class(
{
	audioFileName : "", //音乐文件名(可以为数组)
	musicDuration : 60000, //音乐文件的总时长
	audio : null,
	audioPlayedTimes : 0, //音乐被重复播放次数
	timeline : null, //整个slideshow的时间轴.

	father : null, //绘制目标所在的DOM
	canvas : null, //绘制目标
	context : null, //绘制目标的context

	srcImages : null,  //canvas类型的数组。
	config : null, //slideshow配置(json)

	_animationRequest : null,  //保存每一次的动画请求，当pause或者stop时可以及时停止。
	_lastFrameTime : null, //保存每一帧执行完之后的时间。
	_loopFunc : null, // mainloop.bind(this)
	_audioplayingTime : 0, //播放时间
	_endCanvas : null, //结束画面
	_endBlurCanvas : null, //结束模糊画面

	_imageRatioX : null,
	_imageRatioY : null, //图像缩放率
	_syncTime : 500, //音乐同步默认时间

	//loadingimage时，没完成一张，就对其进行处理。(函数)
	//参数有两个，第一个为一个Image对象， 第二个为它对应的下标。
	_dealLoadingImage : null, 

	//完成图像加载后执行，
	//参数有一个，为Image数组
	_dealFinishLoadingImage : null,

	_lastVolume : null, //音乐淡出辅助变量

	//注意： 在initialize末尾把子类的构造函数传递进来，末尾执行是很不好的行为
	//请直接在子类里面执行。 避免不必要的逻辑绕弯，加大维护时的麻烦。
	//config参数表示slideshow的配置文件。 默认将对config进行解析，如果默认方法无法解析，
	//请重写自己的实现
	//末尾的canvas和context参数可选， 如果填写则直接将绘制目标设置为末尾参数指定的canvas(主要用于demo)
	initialize : function(fatherDOM, imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY, config, canvas, context)
	{
		this.father = fatherDOM;
		this.canvas = canvas;
		if(!this.canvas)
		{
			this.canvas = WGE.CE('canvas');
			this.canvas.width = WGE.SlideshowSettings.width;
			this.canvas.height = WGE.SlideshowSettings.height;
			this.canvas.setAttribute("style", WGE.SlideshowSettings.style);
			this.father.appendChild(this.canvas);
		}		

		this.context = context || this.canvas.getContext('2d');
		
		if(config)
			this.config = config;

		if(imageRatioX && imageRatioY)
		{
			this._imageRatioX = imageRatioX;
			this._imageRatioY = imageRatioY;
		}

		this._loadImages(imgURLs, finishCallback, eachCallback);

		var audioFileNames;
		if(this.audioFileName instanceof Array)
		{
			audioFileNames = [];
			for(var i in this.audioFileName)
				audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
		}
		else if(this.audioFileName) 
			audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;

		if(audioFileNames)
			this.audioFileName = audioFileNames;

		if(this.audioFileName)
		{
			if(this.audioFileName instanceof Array)
			{
				audioFileNames = [];
				for(var i in this.audioFileName)
					audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
			}
			else audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;
			this._initAudio(audioFileNames);
		}
	},

	//config 为json配置文件
	initTimeline : function(config)
	{
		WGE.SlideshowParsingEngine.parse(config, this);

		if(!this.audio)
		{
			var audioFileNames;
			if(this.audioFileName instanceof Array)
			{
				audioFileNames = [];
				for(var i in this.audioFileName)
					audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
			}
			else audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;
			this._initAudio(audioFileNames);
			return ;
		}
	},

	_loadImages : function(imgURLs, finishCallback, eachCallback)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			if(typeof self._dealFinishLoadingImage == 'function')
				self._dealFinishLoadingImage(imgArr);
			else
				self.srcImages = WGE.slideshowFitImages(imgArr, self._imageRatioX, self._imageRatioY);

			if(self.config)
				self.initTimeline(self.config);
			if(finishCallback)
				finishCallback(self.srcImages || imgArr, self);

			self.config = null;
		}, function(img, n, imageIndex) {
			if(typeof self._dealLoadingImage == 'function')
				self._dealLoadingImage(img, imageIndex);
			if(eachCallback)
				eachCallback(img, n, self);
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
			}
			else
			{
				setTimeout(tryInitAudio.bind(this), 100);
			}
		};

		tryInitAudio();
	},

	_audioFinish : function()
	{
		//默认音乐循环播放
		++this.audioPlayedTimes;
		this.audio.play();
	},

	_audioplaying : function()
	{
		this._audioplayingTime = this.getAudioPlayingTime();
	},

	_audiosuspend : function()
	{
		
	},

	_audioTimeout : function()
	{
		console.error("Audio time out!");
	},

	_checkAudioFailed : function()
	{
		if(this.audio.readyState == 2)
		{
			console.error("Failed to play audio : ", this.audioFileName);
			this.stop();
			return true;
		}
		else if(this.audio.readyState == 3)
		{
			this._checkAudioFailed = null;
		}
		return false;
	},

	getAudioPlayingTime : function()
	{
		return this.audioPlayedTimes * this.audio.duration + this.audio.position;
	},

	//释放内存，在移动设备上效果比较明显。
	release : function()
	{
		this.audio.destruct();
		this.srcImages = undefined;
		WGE.release(this);
	},

	play : function()
	{
		if(this._animationRequest || !this.timeline)
		{
			if(this._animationRequest)
				console.warn("重复请求， slideshow 已经正在播放中!");
			if(!this.timeline)
				console.error("时间轴不存在！");
			return ;
		}

		if(this.audio)
		{
			this.audio.play();
		}
		
		this._lastFrameTime = Date.now();
		this._loopFunc = this.mainloop.bind(this);
		this.timeline.start(0);
		this._animationRequest = requestAnimationFrame(this._loopFunc);
		this.audioPlayedTimes = 0;
		this._audioplayingTime = 0;
	},

	isPlaying : function()
	{
		return !!this._animationRequest;
	},

	stop : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
		}

		if(this.audio)
		{
			this.audio.stop();
		}
	},

	pause : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
		}

		if(this.audio)
		{
			this.audio.pause();
		}
	},

	resume : function()
	{
		if(!this._animationRequest && this.timeline && this.timeline.isStarted)
		{
			requestAnimationFrame(this._loopFunc);
			this._lastFrameTime = Date.now();

			if(this.audio)
			{
				this.audio.resume();
			}
		}
	},

	setVolume : function(v)
	{
		if(this.audio)
			this.audio.setVolume(v);
	},

	//进度跳转, 暂不实现
	// jump : function(time)
	// {

	// },


	endloop : function()
	{
		if(this._animationRequest || !(this.context && this._endBlurCanvas && this._endCanvas))
			return;
		var time = Date.now();
		var dt = time - this._lastFrameTime;
		if(dt >  5000)
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

		if(dt < 1500)
		{
			this.context.drawImage(this._endCanvas, 0, 0);
			this.context.globalAlpha = dt / 1500;
			this.context.drawImage(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
		}
		else
		{
			this.context.drawImage(this._endBlurCanvas, 0, 0, this._endBlurCanvas.width, this._endBlurCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
			this.context.globalAlpha = (dt - 1500) / 7000;
			this.context.fillStyle = "#000";
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.context.restore();

		if(this._lastVolume)
			this.audio.setVolume(this._lastVolume * (1 - dt / 5000));

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
		this.endloop();
	},

	// slideshow主循环
	mainloop : function()
	{
		var timeNow = Date.now();
		var asyncTime = this._audioplayingTime - this.timeline.currentTime;

		//当音乐时间与时间轴时间差异超过300毫秒时，执行同步操作
		if(Math.abs(asyncTime) > this._syncTime)
		{
			//console.log("同步: 音乐时间", this._audioplayingTime, "时间轴时间",this.timeline.currentTime, "差值", asyncTime, "大于" + this._syncTime + ",进行同步");
			//当时间轴慢于音乐时间时，执行时间轴跳跃。
			if(asyncTime > this._syncTime)
			{
				if(!this.timeline.update(asyncTime))
				{
					this.timeline.currentTime = this.timeline.totalTime;
					this._end();
					return ;
				}
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.timeline.render(this.context);
			}
			else if(this.audio)
			{
				if(this._checkAudioFailed && this._checkAudioFailed())
					return ;
				this.audio.resume();
				this._audioplayingTime = this.getAudioPlayingTime();
			}

			this._lastFrameTime = timeNow;			
			this._animationRequest = requestAnimationFrame(this._loopFunc);
			return ;
		}

		var deltaTime = timeNow - this._lastFrameTime;
		this._lastFrameTime = timeNow;

		if(!this.timeline.update(deltaTime))
		{
			this.timeline.currentTime = this.timeline.totalTime;
			this._end();
			return ;
		}

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.timeline.render(this.context);
		this._animationRequest = requestAnimationFrame(this._loopFunc);
	}
	
});


WGE.SlideshowParsingEngine = 
{

	parse : function(config, slideshow)
	{
		if(!config)
			return null;
		if(config instanceof String)
		{
			config = JSON ? JSON.parse(config) : eval('(' + config + ')');
		}

		var parser;
		try
		{
			parser = this[config.parserName] || this.defaultParser;
		}catch(e) {
			parser = this.defaultParser;
		};
		return parser.call(this, config, slideshow);
	},

	_parseSceneDefault : function(scene, imgArr)
	{
		var spriteClass = WGE[scene.name] || WGE.SlideshowAnimationSprite;
		var sprite = new spriteClass(WGE.ClassInitWithArr, scene.initArgs);

		if(typeof scene.imageindex == "number")
		{
			var img = imgArr[scene.imageindex % imgArr.length];

			/////////////////////////////

			if(scene.spriteConfig.filter && img)
			{
				try
				{
					var filter = new WGE.Filter[scene.spriteConfig.filter](WGE.ClassInitWithArr, scene.spriteConfig.filterArgs);
					img = filter.bind(img).run();
				}catch(e) {
					console.error("when doing filter, defaultParser : ", e);
				}
			}

			var spriteInitFunc = sprite[scene.spriteConfig.name] || sprite.initSprite;
			spriteInitFunc.call(sprite, img, scene.spriteConfig.width, scene.spriteConfig.height);
		}

		/////////////////////////////

		var execFunc = scene.execFunc;
		for(var funcIndex in execFunc)
		{
			var funcConfig = execFunc[funcIndex];
			var func = sprite[funcConfig.name];
			if(func instanceof Function)
			{
				var arg = WGE.clone(funcConfig.arg);
				if(funcConfig.relativeResolution)
				{
					//相对分辨率参数是一个0~1之间的浮点数。
					if(arg[funcConfig.relativeWidth] && arg[funcConfig.relativeHeight])
					{
						arg[funcConfig.relativeWidth] *= WGE.SlideshowSettings.width;
						arg[funcConfig.relativeHeight] *= WGE.SlideshowSettings.height;
					}
				}
				func.apply(sprite, arg);
			}
		}

		/////////////////////////////

		var actions = scene.actions;
		for(var actionIndex in actions)
		{
			var actionConfig = actions[actionIndex];
			var actionClass = WGE.Actions[actionConfig.name];
			if(actionClass instanceof Function)
			{
				var action = new actionClass(WGE.ClassInitWithArr, actionConfig.arg);
				sprite.push(action);
			}				
		}

		////////////////////////////

		var childNodes = scene.childNodes;
		for(var childIndex in childNodes)
		{
			sprite.addChild(this._parseSceneDefault(childNodes[childIndex], imgArr));
		}
		return sprite;
	},

	// 默认解析器
	defaultParser : function(config, slideshow)
	{
		if(!slideshow)
		{
			console.error("Invalid Params in WGE.SlideshowParsingEngine");
			return;
		}
		
		if(config.audioFileName)
		{
			slideshow.audioFileName = config.audioFileName;
			slideshow.musicDuration = parseFloat(config.musicDuration);
		}

		var totalTime = Math.ceil(slideshow.srcImages.length / config.loopImageNum) * config.loopTime;
		slideshow.timeline = new WGE.TimeLine(totalTime);

		var timeline = slideshow.timeline;
		var sceneArr = config.sceneArr;
		for(var sceneIndex in sceneArr)
		{
			timeline.push(this._parseSceneDefault(sceneArr[sceneIndex], slideshow.srcImages));
		}
	}
};
