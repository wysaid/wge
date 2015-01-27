"use strict";
/*
* snapshots.js
*
*  Created on: 2014-8-29
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

WGE.Classic = WGE.Class(WGE.SlideshowInterface,
{
	config : 1,
	audioFileName : ["Inspiration.mp3", "Inspiration.ogg"],  // 音乐文件名

	loopTime : 5000,
	loopImageNum : 1,
	_syncTime : undefined,
	// _imageRatioX : 1.2,
	// _imageRatioY : 1.2,

	initialize : function()
	{
		WGE.SlideshowInterface.initialize.apply(this, arguments);
	},

	initTimeline : function(config)
	{
		var totalTime = Math.ceil(this.srcImages.length / this.loopImageNum) * this.loopTime;
		this.timeline = new WGE.TimeLine(totalTime);

		var t = 0;
		var zIndex = 0;

		for(var i in this.srcImages)
		{
			var img = this.srcImages[i];

			var sprite = new WGE.SlideshowAnimationSprite(t, t + 6000, img, -1);
			var hotX = Math.random(), hotY = Math.random() * 0.5;

			sprite.moveTo(WGE.SlideshowSettings.width * hotX, WGE.SlideshowSettings.height * hotY);
			sprite.setHotspotWithRatio(hotX, hotY);
			sprite.zIndex = zIndex;
			var scaling = Math.random() * 0.5 + 1.2;
			var scaleAction;
			if(Math.random() < 0.5)
				scaleAction = new WGE.Actions.UniformScaleAction([0, 5500], [scaling, scaling], [1, 1])
			else
				scaleAction = new WGE.Actions.UniformScaleAction([0, 5500], [1, 1], [scaling, scaling]);
			var alphaAction = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
			sprite.pushArr([scaleAction, alphaAction]);
			this.timeline.push(sprite);
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

