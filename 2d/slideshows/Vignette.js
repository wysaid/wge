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
    audioFileName : ["slideshow_love.OGG","slideshow_love.mp3"]
    ,
    blurImages : [],
    initTimeline : function(config)
    {
        this.handleImgs();
        this.timeline = new WGE.TimeLine(50000);
        this.CombineScence();

	},


    handleImgs : function()
    {
        // for (var i = 0; i < this.srcImages.length; i++) {
        //     var srcimage = this.srcImages[i];
        //     var blurCanvas = document.createElement('canvas');
        //     blurCanvas.width = srcimage.width;
        //     blurCanvas.height = srcimage.height;
        //     var c = blurCanvas.getContext('2d');
        //     c.clearRect(0, 0, c.width, c.height);
        //     c.globalAlpha = (1.0 / (10.0 / 2.0));
        //     for (var j = 0; j < 120.0; j += 2.0)
        //         c.drawImage(srcimage, 0, j);
        //     var dataSrc = c.getImageData(0, 0, blurCanvas.width, blurCanvas.height);
        //     var dstCanvas = Filters.toCanvas(dataSrc);
        //     this.blurImages.push(dstCanvas);
        // };
    },


	CombineScence : function()
	{
		var sprite = new mySprite(0, 5000, WGE.rotateArray(this.srcImages), -1);
        var sprite1 = new mySprite(4000, 10000, WGE.rotateArray(this.srcImages), -1);
        var sprite2 = new mySprite(9000, 18000, WGE.rotateArray(this.srcImages), -1); 
        var sprite3 = new mySprite(14000,18000, WGE.rotateArray(this.srcImages), -1); 
        var logicSprite = new MyLogicSprite(18000, 24000);
        logicSprite.setHotspot2Center();
        //logicSprite.moveTo(WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2);
        //sprite.moveTo(WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2);
        sprite.setHotspot2Center();
        sprite1.setHotspot2Center();
        sprite2.setHotspot2Center();
        sprite3.setHotspot2Center();
        //sprite3.moveTo(WGE.SlideshowSettings.width/2 + sprite3.width, WGE.SlideshowSettings.height/2);


        //[0-5000],动作两个
        {
            var action = new WGE.Actions.acceleratedMoveAction([0, 4000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        
            var action2 = new WGE.Actions.MoveRightAction([4000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2+sprite1.size.data[0], WGE.SlideshowSettings.height/2], 1);
            action2.setDistance((sprite1.size.data[0]+sprite1.size.data[0])/2);

             sprite.push(action);
             sprite.push(action2);

        }

        //[5000 - 10000]
         {
            var action3 = new WGE.Actions.MoveRightAction([0, 1000], [WGE.SlideshowSettings.width/2 - (sprite1.size.data[0]+sprite1.size.data[0])/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
            action3.setDistance((sprite1.size.data[0]+sprite1.size.data[0])/2);
           
            var action4 = new WGE.Actions.acceleratedMoveAction([1000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);

            var action5 = new WGE.Actions.MoveRightAction([5000, 6000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2+sprite2.size.data[0], WGE.SlideshowSettings.height/2], 1);
            action5.setDistance((sprite2.size.data[0]+sprite1.size.data[0])/2);

             sprite1.push(action3);
             sprite1.push(action4);
             sprite1.push(action5);

        }     

        //[10000 - 15000]
        {
             var action6 = new WGE.Actions.MoveRightAction([0, 1000], [WGE.SlideshowSettings.width/2 - (sprite2.size.data[0]+sprite1.size.data[0])/2 , WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
             action6.setDistance((sprite2.size.data[0]+sprite1.size.data[0])/2);
           
            var action7 = new WGE.Actions.acceleratedMoveAction([1000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);

             var action10 = new WGE.Actions.MoveDownAction([5000, 6000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
             action10.setDistance((sprite3.size.data[1]+sprite2.size.data[1])/2);

             sprite2.push(action6);
             sprite2.push(action7);
             sprite2.push(action10);
        }  

        //[10000 - 15000]
        {
             var action8 = new WGE.Actions.MoveDownAction([0, 1000], [WGE.SlideshowSettings.width/2  , WGE.SlideshowSettings.height/2- ((sprite3.size.data[1]+sprite3.size.data[1])/2)], [WGE.SlideshowSettings.width/2 , WGE.SlideshowSettings.height/2], 1);
             action8.setDistance((sprite3.size.data[1]+sprite2.size.data[1])/2);
           

             var action19 = new WGE.Actions.acceleratedMoveAction([1000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
            //var action9 = new WGE.Actions.acceleratedMoveAction([1000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            //[WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);

             sprite3.push(action8);
             sprite3.push(action19);

            // sprite2.push(action9);
        }  

        //
        var sprites = [];
        var h = 0;
        var spriteLength = 39;
        var descDis = 300;
        for (var i = 0; i < spriteLength; i++) {

            sprites[i] = new mySprite(18000, 24000, WGE.rotateArray(this.srcImages), -1); 
            //sprites[i].setHotspot2Center();
            sprites[i].moveTo(0, h);
            h += sprites[i].size.data[1];
            logicSprite.addChild(sprites[i]);
        }

        var action18 = new WGE.Actions.MoveSlideAction([0, 5000], [0  , 0], [0 , 0], 1);
        logicSprite.push(action18);
        action18.setDescDistance(descDis);

        action18.setDistance(h - sprites[spriteLength - 1].size.data[1]  - sprites[spriteLength - 2].size.data[1]+ descDis );


        //向上拖动
        //[15000 - 23000]

        //sprite3.moveTo(WGE.SlideshowSettings.width/2 + sprite3.width, WGE.SlideshowSettings.height/2);

        this.timeline.push(sprite, sprite1,sprite2, sprite3,logicSprite);
        
        this.timeline.start(0);
	},




});