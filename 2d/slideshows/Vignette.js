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
    totalTime : 0,
    musicTime : 217000,
    recycleTimes : 0,
    initTimeline : function(config)
    {
        this.handleImgs();
        this.calculateTime();
        this.timeline = new WGE.TimeLine(this.totalTime);   
        this.recycleAnimation();

	},


    calculateTime : function()
    {
        var recycleTime = Math.floor(this.srcImages.length / 5);
        var animationTime = recycleTime*29000 - (recycleTime + 1)*1000;
        var leftNum = this.srcImages.length % 5;
        if(leftNum <= 3)
            animationTime += leftNum*6000;
        else 
            animationTime += 3*6000 + 4000;

        this.totalTime = animationTime > this.musicTime ? animationTime : this.musicTime;
        this.recycleTimes = Math.floor(this.totalTime/29000) + 1;
        console.log(this.totalTime);
        console.log(this.recycleTimes);

    },

    recycleAnimation: function ()
    {
        var currentTime = 0;
        //var rctimes = Math.floor(this.srcImages.length / 5) + 1;
        for (var i = 0; i < this.recycleTimes; i++) {
            this.CombineScence(i*29000 - i*1000);
        };
    },


    handleImgs : function()
    {
        for (var i = 0; i < this.srcImages.length; i++) {
            var width = this.srcImages[i].width;
            var height = this.srcImages[i].height;
            var srcimage = this.srcImages[i];
            var blurCanvas = document.createElement('canvas');
            blurCanvas.width = srcimage.width;
            blurCanvas.height = srcimage.height;
            var c = blurCanvas.getContext('2d');
            c.clearRect(0, 0, c.width, c.height);
            c.globalAlpha = (1.0 / (10.0 / 2.0));
            //for (var j = 0; j < 120.0; j += 2.0)
             //   c.drawImage(srcimage, 0, j);
            this.blurImages.push(srcimage);
         }
    },


	CombineScence : function(start)
	{
		var sprite = new mySprite(start, start+6000, WGE.rotateArray(this.srcImages), -1);
        var sprite1 = new mySprite(start+5000, start+11000, WGE.rotateArray(this.srcImages), -1);
        var sprite2 = new mySprite(start+10000, start+16000, WGE.rotateArray(this.srcImages), -1); 
        var sprite3 = new mySprite(start+15000,start+19000, WGE.rotateArray(this.srcImages), -1); 
        var logicSprite = new MyLogicSprite(start+19000, start+29000);
        logicSprite.setHotspot2Center();

        sprite.setHotspot2Center();
        sprite1.setHotspot2Center();
        sprite2.setHotspot2Center();
        sprite3.setHotspot2Center();

        //[0-5000],动作两个
        {
            // var action0 = new WGE.Actions.MoveRightAction([0, 1000], [WGE.SlideshowSettings.width/2 - sprite.size.data[0], WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
            // action0.setDistance(sprite.size.data[0]);

            var action0 = new WGE.Actions.UniformAlphaAction([0, 2000], 0, 1, 1);

            var action = new WGE.Actions.acceleratedMoveAction([0000, 5000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 
            [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
        
            var action2 = new WGE.Actions.MoveRightAction([5000, 6000], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2+sprite1.size.data[0], WGE.SlideshowSettings.height/2], 1);
            action2.setDistance((sprite.size.data[0]+sprite1.size.data[0])/2);

            sprite.push(action0);
            sprite.push(action);
            sprite.push(action2);

        }

        //[5000 - 10000]
         {
            var action3 = new WGE.Actions.MoveRightAction([0, 1000], [WGE.SlideshowSettings.width/2 - (sprite.size.data[0]+sprite1.size.data[0])/2, WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
            action3.setDistance((sprite.size.data[0]+sprite1.size.data[0])/2);
           
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

             sprite3.push(action8);
             sprite3.push(action19);

        }  

        //拖尾效果
        {
            var sprites = [];
            var h = WGE.SlideshowSettings.height/2;
            var spriteLength = 39;
            var descDis = 300;
            var img1 = WGE.rotateArray(this.blurImages);
            img1 = WGE.rotateArray(this.blurImages);
            img1 = WGE.rotateArray(this.blurImages);
            img1 = WGE.rotateArray(this.blurImages);
            img1 = WGE.rotateArray(this.blurImages);
            for (var i = 0; i < spriteLength; i++) {

                sprites[i] = new mySprite(18000, 24000, img1, -1); 
                sprites[i].setHotspot2Center();
                sprites[i].moveTo(WGE.SlideshowSettings.width/2, h);
                h += sprites[i].size.data[1];
                logicSprite.addChild(sprites[i]);
            }
            var img =  WGE.rotateArray(this.srcImages);
            for (var i = 0; i < 2; i++) {
                sprites[spriteLength + i] = new mySprite(18000, 24000, img, -1); 
                sprites[spriteLength + i].setHotspot2Center();
                sprites[spriteLength + i].moveTo(WGE.SlideshowSettings.width/2, h);
                h += sprites[spriteLength + i].size.data[1];
                logicSprite.addChild(sprites[spriteLength + i]);
            };

            spriteLength += 2;

            var action18 = new WGE.Actions.MoveSlideAction([0, 5000], [0  , 0], [0 , 0], 1);
            logicSprite.push(action18);
            action18.setDescDistance(descDis);

            action18.setDistance(h - sprites[spriteLength - 1].size.data[1]  - sprites[spriteLength - 2].size.data[1]+ descDis -WGE.SlideshowSettings.height/2 );


            var action20 = new WGE.Actions.acceleratedSlideMoveAction([4500, 10000], [0, 0], 
            [0, 0], 1);

             var action21 = new WGE.Actions.MoveSlideRightAction([9000, 10000], [WGE.SlideshowSettings.width/2 - (sprite2.size.data[0]+sprite1.size.data[0])/2 , WGE.SlideshowSettings.height/2], [WGE.SlideshowSettings.width/2, WGE.SlideshowSettings.height/2], 1);
             action21.setDistance(1024);

            logicSprite.push(action20);
        }

        this.timeline.push(sprite, sprite1,sprite2, sprite3,logicSprite);
        
        this.timeline.start(0);
	},




});