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

var MyLogicSprite  = WGE.Class(WGE.LogicSprite, WGE.AnimationWithChildrenInterface2d,
{
	initialize : function(startTime, endTime)
	{
		WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
		WGE.LogicSprite.initialize.call(this);
	}
});



WGE.Vignette = WGE.Class(WGE.SlideshowInterface,
{
    config: 1,
    audioFileName : "slideshow_love.mp3",
    initTimeline : function(config)
    {
        this.timeline = new WGE.TimeLine(50000);
        var sprite = new mySprite(0, 5000, this.srcImages[0], -1);
        sprite.moveTo(WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2);
        sprite.setHotspot2Center();

        var sprite1 = new mySprite(0, 8000, this.srcImages[1], -1);
        sprite1.moveTo(-sprite1.size.data[0]/2, WGE.SlideshowSettings.height/2);
        sprite1.setHotspot2Center();

        var action = new WGE.Actions.acceleratedMoveAction([0, 4000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        
        sprite.push(action);

        this.timeline.pushArr([sprite, sprite1]);
        this.timeline.start(0);

	},


});