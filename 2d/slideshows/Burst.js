//这里统一时间线，音乐等，继承公共类SlideshowInterface


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


WGE.Burst = WGE.Class(WGE.SlideshowInterface,
{
	initTimeline : function(config)
	{
		this.timeline = new WGE.TimeLine(50000);
		var sprite = new mySprite(0, 5000, this.srcImages[0], -1);
		sprite.moveTo(500, 300);
		sprite.setHotspotWithRatio(0.5, 0.5);

		var action = new WGE.Actions.UniformScaleAction([0, 5000], [1.8, 1.8], [1.0, 1.0], 1);
		sprite.push(action);

		this.timeline.push(sprite);
		this.timeline.start(0);
	},
	audioFileName : "Slide_maniac.mp3",

});