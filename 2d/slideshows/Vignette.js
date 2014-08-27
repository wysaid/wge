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
        this.ControlActions();
	},


	ControlActions : function()
	{
		var sprite = new mySprite(0, 5000, this.srcImages[0], -1);
        //sprite.moveTo(WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2);
        sprite.setHotspot2Center();

        //加入要循环播放的数组中
        var sprites = [];
        for (var i = 0; i < 1; i++) {
        	sprites[i] = new mySprite(4000, 10000, WGE.rotateArray(this.srcImages), -1);
        	sprites[i].setHotspot2Center();

        var action5 = new WGE.Actions.UniformLinearMoveAction([0, 1000], [WGE.SlideshowSettings.width/2 - sprites[i].size.data[0], WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
       
 		var action6 = new WGE.Actions.acceleratedMoveAction([1000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
	    [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        sprites[i].push(action5);
        sprites[i].push(action6);

        var action7 = new WGE.Actions.UniformLinearMoveAction([0, 1000], [WGE.SlideshowSettings.width/2 - sprites[i].size.data[0], WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);

        };


        var sprite1 = new mySprite(4000, 9000, this.srcImages[1], -1);
        //sprite1.moveTo(WGE.SlideshowSettings.width/2 - sprite1.size.data[0], WGE.SlideshowSettings.height/2);
        sprite1.setHotspot2Center();
        var action = new WGE.Actions.acceleratedMoveAction([0, 4000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        
        var action1 = new  WGE.Actions.acceleratedMoveAction([0, 4000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        
        var action2 = new WGE.Actions.UniformLinearMoveAction([4000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2+sprites[0].size.data[0], WGE.SlideshowSettings.height/2], 1);

        
        sprite.push(action);
        sprite.push(action2);

        this.timeline.push(sprite);
        this.timeline.pushArr(sprites);
        this.timeline.start(0);
	},




});