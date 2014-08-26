"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.PhotoFrame = WGE.Class(WGE.SlideshowInterface,
{
	audioFileName : "piano.mp3", //不包含路径

	initTimeline : function(config)
	{
		this.timeline = new WGE.TimeLine(5000);
		var sprite = new WGE.SlideshowAnimationSprite(0, 5000, this.srcImages[0], -1);
		sprite.moveTo(500, 300);
		sprite.setHotspotWithRatio(0.5, 0.5);

		var action = new WGE.Actions.UniformLinearMoveAction([0, 4000], [200, 200], [800, 500], 1);
		sprite.push(action);
		this.timeline.push(sprite);
		this.timeline.start(0);
	},

});

