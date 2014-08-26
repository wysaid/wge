"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

var mySprite = WGE.Class(WGE.Sprite, WGE.AnimationWithChildrenInterface2d,
{
	initialize : function(startTime, endTime, img, w, h)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
		if(img)
		{
			WGE.Sprite.initialize.call(this, img, w, h);
		}
	}
});

WGE.PhotoFrame = WGE.Class(WGE.SlideshowInterface,
{
	audioFileName : "piano.mp3", //不包含路径

	initTimeline : function(config)
	{
		this.timeline = new WGE.TimeLine(5000);
		var sprite = new mySprite(0, 5000, this.srcImages[0], -1);
		sprite.moveTo(500, 300);
		sprite.setHotspotWithRatio(0.5, 0.5);

		var action = new WGE.UniformLinearMoveAction([0, 4000], [200, 200], [800, 500], 1);
		sprite.push(action);
		this.timeline.push(sprite);
		this.timeline.start(0);
	},

});

