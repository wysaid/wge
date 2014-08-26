"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

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
	}

});

