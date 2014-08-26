"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

var photoFrameConfig = 
{
	"parserName" : "defaultParser", //设置解析器，默认defaultParser可不填写
	"loopTime" : 15000, // 完成单次循环所需总时间
	"loopImageNum" : 15,    // 一次循环所需图片数
	"audioFileName" : "piano.mp3",  // 音乐文件名
	"musicDuration" : 60000, //音乐文件总时长

	//场景, 由 AnimationSprite构成
	"sceneArr" : 
	[
		//第一个
		{
			//类名
			"name" : "PhotoFrameSprite", 
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
					"arg" : [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/10],
				}
			],

			"actions" :
			[
				{
					"name" : "UniformScaleAction",
					"arg" : [[0, 6000], [1.3, 1.3], [1, 1]],
				}
			]
		}
	],
};

WGE.PhotoFrameSprite = WGE.Class(WGE.SlideshowAnimationSprite,
{
	//这里的zone 应该由 WGE.AnimationActionManager 维护。
	zone : null, // WGE.ExtendFunc.Zone2d

	render : function(ctx)
	{
		ctx.save();

		if(this.alpha != undefined)
			ctx.globalAlpha = this.alpha;
		if(this.zone)
			this.zone.clipZone(ctx, true);//, '#fff', 10);

		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);		
		if(this.scaling)
			ctx.scale(this.scaling.data[0], this.scaling.data[1]);
		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;
		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);
		ctx.restore();
	}
});

WGE.PhotoFrame = WGE.Class(WGE.SlideshowInterface,
{
	audioFileName : "piano.mp3", //不包含路径
	config : photoFrameConfig,

	// initTimeline : function(config)
	// {
	// 	this.timeline = new WGE.TimeLine(5000);
	// 	var sprite = new WGE.SlideshowAnimationSprite(0, 5000, this.srcImages[0], -1);
	// 	sprite.moveTo(500, 300);
	// 	sprite.setHotspotWithRatio(0.5, 0.5);

	// 	var action = new WGE.Actions.UniformLinearMoveAction([0, 4000], [200, 200], [800, 500], 1);
	// 	sprite.push(action);
	// 	this.timeline.push(sprite);
	// 	this.timeline.start(0);
	// }

});

