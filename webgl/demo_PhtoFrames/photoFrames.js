"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

window.FTPhotoFrame = {};

FTPhotoFrame.intersection = function(p0, p1, p2, p3)
{
	var D = (p0.data[1] - p1.data[1]) * (p3.data[0] - p2.data[0]) + (p0.data[0] - p1.data[0]) * (p2.data[1] - p3.data[1]);
    var Dx = (p1.data[0] * p0.data[1] - p0.data[0] * p1.data[1]) * (p3.data[0] - p2.data[0]) + (p0.data[0] - p1.data[0]) * (p3.data[0] * p2.data[1] - p2.data[0] * p3.data[1]);
    var Dy = (p0.data[1] - p1.data[1]) * (p3.data[0] * p2.data[1] - p2.data[0] * p3.data[1]) + (p3.data[1] - p2.data[1]) * (p1.data[0] * p0.data[1] - p0.data[0] * p1.data[1]);
    return new WGE.Vec2(Dx / D, Dy / D);
};

//clipZone和fillZone选择其中一个使用即可。
FTPhotoFrame.Zone = WGE.Class(
{
	clipArray : undefined,

	initialize : function(arr)
	{
		if(arr instanceof Array)
		{
			this.clipArray = arr;
		}
		else
		{
			this.clipArray = [];
			for(var i in arguments)
			{
				this.clipArray.push(arguments[i]);
			}
		}
	},

	//使用前请save ctx状态
	clipZone : function(ctx, stroke, style, lineWidth)
	{
		if(style)
			ctx.strokeStyle = style;
		if(lineWidth)
			ctx.lineWidth = lineWidth;

		ctx.beginPath();
		ctx.moveTo(this.clipArray[0].data[0], this.clipArray[0].data[1]);
		for(var i in this.clipArray)
		{
			ctx.lineTo(this.clipArray[i].data[0], this.clipArray[i].data[1]);
		}
		ctx.closePath();
		if(stroke)
			ctx.stroke();
		ctx.clip();
	},

	//同上
	fillZone : function(ctx, stroke, pattern, style, lineWidth)
	{
		if(pattern)
			ctx.fillStyle = pattern;
		if(style)
			ctx.strokeStyle = style;
		if(lineWidth)
			ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(clipArray[0].data[0], clipArray[0].data[1]);
		for(var i in clipArray)
		{
			ctx.lineTo(clipArray[i].data[0], clipArray[i].data[1]);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

});

FTPhotoFrame.ZoneSwitchAction = WGE.Class(WGE.TimeActionInterface,
{
	zone : undefined,

	initialize : function(time, zone, bindObj)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else if(time instanceof WGE.Vec2)
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];			
		}
		this.zone = zone;
		this.bindObj = bindObj;
	},

	act : function(percent)
	{
		this.bindObj.zone = this.zone;
	},

	actionStop : function()
	{
		this.bindObj.zone = this.zone;
	}
});

FTPhotoFrame.PointIntersectionAction = WGE.Class(WGE.TimeActionInterface,
{
	pnts : undefined,

	initialize : function(time, pnts, bindObj)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else if(time instanceof WGE.Vec2)
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];			
		}

		this.bindObj = bindObj;
		this.pnts = pnts;
	},

	act : function(percent)
	{
		var pnt = FTPhotoFrame.intersection(this.pnts[0], this.pnts[1], this.pnts[2], this.pnts[3]);
		this.bindObj.data[0] = pnt.data[0];
		this.bindObj.data[1] = pnt.data[1];
	},

	actionStop : function()
	{
		var pnt = FTPhotoFrame.intersection(this.pnts[0], this.pnts[1], this.pnts[2], this.pnts[3]);
		this.bindObj.data[0] = pnt.data[0];
		this.bindObj.data[1] = pnt.data[1];
	}

});

FTPhotoFrame.PointMoveAction = WGE.Class(WGE.TimeActionInterface,
{
	fromX : 0,
	fromY : 0,
	toX : 1,
	toY : 1,
	disX : 1,
	disY : 1,

	initialize : function(time, from, to, bindObj)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else if(time instanceof WGE.Vec2)
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];			
		}

		if(from instanceof Array)
		{
			this.fromX = from[0];
			this.fromY = from[1];						
		}
		else
		{
			this.fromX = from.data[0];
			this.fromY = from.data[1];
			
		}

		if(to instanceof Array)
		{
			this.toX = to[0];
			this.toY = to[1];
		}
		else
		{
			this.toX = to.data[0];
			this.toY = to.data[1];
		}

		this.disX = this.toX - this.fromX;
		this.disY = this.toY - this.fromY;
		this.bindObj = bindObj;
	},

	act : function(percent)
	{
		var t = percent;
		try
		{
			this.bindObj.data[0] = this.fromX + this.disX * t;
			this.bindObj.data[1] = this.fromY + this.disY * t;
		}catch(e)
		{
		    console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = percent;
			this.bindObj.data[0] = this.fromX + this.disX * t;
			this.bindObj.data[1] = this.fromY + this.disY * t;
		};
	},

	// 为Action开始做准备工作，比如对一些属性进行复位。
	actionStart : function()
	{
		// this.bindObj.data[0] = this.fromX;
		// this.bindObj.data[1] = this.fromY;
	},

	// Action结束之后的扫尾工作，比如将某物体设置运动结束之后的状态。
	actionStop : function()
	{
		this.bindObj.data[0] = this.toX;
		this.bindObj.data[1] = this.toY;
	}
});

FTPhotoFrame.PointMoveSlowDown2X = WGE.Class(FTPhotoFrame.PointMoveAction,
{
	act : function(percent)
	{
		var mp = 1.0 - percent;
		var t = 1.0 - mp * mp;
		this.bindObj.data[0] = this.fromX + this.disX * t;
		this.bindObj.data[1] = this.fromY + this.disY * t;
	}
});

FTPhotoFrame.PointMoveSlowDown3X = WGE.Class(FTPhotoFrame.PointMoveAction,
{
	act : function(percent)
	{
		var t = percent * percent * (3 - 2 * percent);
		this.bindObj.data[0] = this.fromX + this.disX * t;
		this.bindObj.data[1] = this.fromY + this.disY * t;
	}
});

FTPhotoFrame.PointMoveSlowDown4X = WGE.Class(FTPhotoFrame.PointMoveAction,
{
	act : function(percent)
	{
		var mp = 1.0 - percent;
		mp *= mp;
		var t = 1.0 - mp * mp;
		this.bindObj.data[0] = this.fromX + this.disX * t;
		this.bindObj.data[1] = this.fromY + this.disY * t;
	}
});

FTPhotoFrame.PointMoveSpeedupAndSlowdown = WGE.Class(FTPhotoFrame.PointMoveAction,
{
	act : function(percent)
	{
		//TODO
		var mp = 1.0 - percent;
		mp *= mp;
		var t = 1.0 - mp * mp;
		this.bindObj.data[0] = this.fromX + this.disX * t;
		this.bindObj.data[1] = this.fromY + this.disY * t;
	}
});


//设计思想核心： 每次界面上所有用到的点都由一个PointAnimationManager管理
//每个场景同时只存在一个 PointAnimationManager 实例。
//预先根据所有点划分好zone并分配给sprites，
//所有的点的更新均在 PointAnimationManager 中完成
FTPhotoFrame.PointAnimationManager = WGE.Class(WGE.AnimationInterface2d,
{
	zIndex : -10000,

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	pushArr : function(arr)
	{
		for(var i = 0; i != arr.length; ++i)
		{
			this.timeActions.push(arr[i]);
		}
	},

	// 特殊用法，PointAnimationManager 本身不可绘制。
	render : function(ctx)
	{

	}

});



FTPhotoFrame.PhotoFrameSprite = WGE.Class(WGE.Sprite2d, WGE.AnimationInterface2d,
{
	initialize : function(canvas, startTime, endTime, img, noRelease)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
		WGE.Sprite2d.initialize.call(this, canvas);

		if(img)
		{
			this.initSprite(img, noRelease);
		}

	},

	//这里的zone 由 FTPhotoFrame.PointAnimationManager 维护。
	zone : undefined,

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

//参数
//		imageArray : 存放所有图片的数组。
//		w : 画面宽度
//		h : 画面高度
//		globalZ : 整个画面的Z值，对于需要多个场景循环时必须填写，方便后入时覆盖当前画面
//				  场景之间z值差 < 10000, 填写10000可保证完整覆盖
//		timeStamp : 场景循环时必须填写，整个场景开始时间。
//		stillTime : 设置整个场景至少持续的时间。防止出现短暂黑屏 (目前整个画面为15秒)
FTPhotoFrame.initScene = function(imageArray, w, h, globalZ, timeStamp, stillTime)
{
	var P = function(x, y) {
		return new WGE.Vec2(x, y);
	};

	var M = function(startTime, endTime){
		return new FTPhotoFrame.PointAnimationManager(startTime, endTime);
	};

	var Z = function(arr){
		return new FTPhotoFrame.Zone(arr);
	};

	var S = function(startTime, endTime, img, w, h){
		return new FTPhotoFrame.PhotoFrameSprite(startTime, endTime, img, w, h);
	};

	var R = function(t) {
		return Math.random() * t;
	};

	//方便固定不动点使用。
	var P0 = P(0, 0), P1 = P(w, 0), P2 = P(0, h), P3 = P(w, h);

	var scene = [];

	var frames = {};

	if(globalZ == undefined)
		globalZ = 0;

//	var filterBW = new WGE.Filter.Monochrome();

	//时间按每秒30帧计算
	//0:5:25~0:8:20 [0, 2800]
	{
		var img = WGE.rotateArray(imageArray);
		var frame1 = S(0, 2800, img, -1);
		var frame2 = S(1000, 2800, img, -1);

		frame1.zIndex = globalZ + 1;
		frame2.zIndex = globalZ;

		frames.frame1 = frame1;
		frames.frame2 = frame2;

		frame1.setHotspot2Center();
		frame1.moveTo(w / 2, h / 2);
		frame2.setHotspot2Center();
		frame2.moveTo(w / 2, h / 2);

		var frame1Action = new WGE.Actions.UniformScaleAction([0, 6000], [1.3, 1.3], [1, 1]);
		var frame2Action = new WGE.Actions.UniformScaleAction([0, 6000], [1.0, 1.0], [1.3, 1.3]);

		frame1.push(frame1Action);
		frame2.push(frame2Action);

		///////////////////////////////
		var pnts = [P(0, h), P(w, h), P(w, h), P(0, h)];

		var zone1 = Z(pnts);
		var zone2 = Z([pnts[2], pnts[3], P(0, h), P(w, h)]);

		frame1.zone = zone1;
		frame2.zone = zone2;

		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1500 + R(130)], pnts[0], P0, pnts[0]);
		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1630], pnts[1], P1, pnts[1]);

		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 2000 + R(560)], pnts[2], [w, h / 2], pnts[2]);
		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(200), 2560], pnts[3], [0, h / 2], pnts[3]);

		var action7 = new FTPhotoFrame.PointMoveAction([2560, 2800], [0, h / 2], P0, pnts[3]);
		var action8 = new FTPhotoFrame.PointMoveAction([2560, 2800], [w, h / 2], P3, pnts[2]);

		var actionManager = M(0, 2900);
		actionManager.pushArr([action1, action2, action3, action4, action7, action8]);

		scene.push(frame1, frame2, actionManager);
	}

	//0:8:20 ~ 0:10:0
	{
		var frame1 = frames.frame1;
		var frame2 = frames.frame2;
		frame1.endTime += 1333;
		frame2.endTime += 1333;
		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1000 + R(333)], P0, [w / 2, 0], frame1.zone.clipArray[3]);
		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1333], P3, [w / 2, h], frame1.zone.clipArray[2]);

		frames.pUp = frame1.zone.clipArray[3];
		frames.pDown = frame1.zone.clipArray[2];

		var action3 = new FTPhotoFrame.PointMoveAction([0, 0], P1, P1, frame1.zone.clipArray[0]);
		var action4 = new FTPhotoFrame.PointMoveAction([0, 0], P3, P3, frame1.zone.clipArray[1]);


		var action5 = new FTPhotoFrame.PointMoveAction([0, 0], P2, P2, frame2.zone.clipArray[3]);
		var action6 = new FTPhotoFrame.PointMoveAction([0, 0], P0, P0, frame2.zone.clipArray[2]);

		var actionManager = M(2800, 4133);
		actionManager.pushArr([action1, action2, action3, action4, action5, action6]);

		scene.push(actionManager);
	}

	globalZ += 100;

	//0:9:0
	{
		var frame1 = frames.frame1;
		var frame2 = frames.frame2;
		frame1.endTime += 1500;
		frame2.endTime += 1500;

		////////////////////////////////////////////////
		var img1 = WGE.rotateArray(imageArray);
		var frame3 = S(3133, 6000, img1, -1);
		var frame4 = S(3133, 6000, img1, -1);
		frame3.zIndex = globalZ;
		frame4.zIndex = globalZ + 1;
		frame3.setHotspot2Center();
		frame4.setHotspot2Center();
		frame3.moveTo(w / 2, h / 2);
		frame4.moveTo(w / 2, h / 2);

		var frame3Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.0, 1.0], [1.3, 1.3]);
		var frame4Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.2, 1.2], [1.0, 1.0]);
		
		frame3.push(frame3Action);
		frame4.push(frame4Action);

		//////////////////////////////////////////////////

		var img2 = WGE.rotateArray(imageArray);
		var frame5 = S(4133, 6000, img2, -1);
		var frame6 = S(4133, 6000, img2, -1);
		frame5.zIndex = globalZ - 2;
		frame6.zIndex = globalZ - 1;
		frame5.setHotspot2Center();
		frame6.setHotspot2Center();
		frame5.moveTo(w / 2, h / 2 - 5);
		frame6.moveTo(w / 2, h / 2);

		var frame5Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.0, 1.0], [1.2, 1.2]);
		var frame6Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.2, 1.2], [1.0, 1.0]);

		frame5.push(frame5Action);
		frame6.push(frame6Action);

		frames.frame3 = frame3;
		frames.frame4 = frame4;
		frames.frame5 = frame5;
		frames.frame6 = frame6;

		//////////////////////////////////////////////////

		var pUp = frames.pUp;
		var pDown = frames.pDown;

		var pnts = [P(0, 0), P(w, 0), P(0, 0), P(w, 0)];

		var pCenter1 = P(w / 2, 0), pCenter2 = P(w / 2, 0);

		frames.pCenter = pCenter1;
		frames.pLeft = pnts[0];
		frames.pRight = pnts[1];
		frames.pDown = pCenter2;

		var zone1 = Z([P(0,0), pUp, pCenter1, pnts[0]]);
		var zone2 = Z([pUp, P(w, 0), pnts[1], pCenter1]);
		var zone3 = Z([pnts[0], pCenter1, pCenter2, pnts[2]]);
		var zone4 = Z([pCenter1, pnts[1], pnts[3], pCenter2]);
		var zone5 = Z([pnts[2], pCenter2, pDown, P(0, h)]);
		var zone6 = Z([pCenter2, pnts[3], P(w, h), pDown]);

		frame3.zone = zone1;
		frame4.zone = zone2;
		frame5.zone = zone3;
		frame6.zone = zone4;
		
		var action1 = new FTPhotoFrame.ZoneSwitchAction([1000, 1000], zone5, frame2);
		var action2 = new FTPhotoFrame.ZoneSwitchAction([1000, 1000], zone6, frame1);

		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([R(200), 800 + R(200)], P(0,0), P(0, h / 2), pnts[0]);
		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([R(200), 1000], P(w,0), P(w, h / 2), pnts[1]);
		var action5 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(100), 1400 + R(100)], P(0, h / 2), P(0, h), pnts[2]);
		var action6 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1500], P(w, h / 2), P(w, h), pnts[3]);

		var action7 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(200), 1500], P(0, h / 2), P(0, h * 0.75), pnts[0]);
		var action8 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1300 + R(200)], P(w, h / 2), P(w, h * 0.75), pnts[1]);

		var action9 = new FTPhotoFrame.PointIntersectionAction([0, 1500], [pnts[0], pnts[1], pUp, pDown], pCenter1);
		var action10 = new FTPhotoFrame.PointIntersectionAction([0, 1500], [pnts[2], pnts[3], pUp, pDown], pCenter2);

		var actionManager = M(3133, 4700);
		actionManager.pushArr([action1, action2, action3, action4, action5, action6, action7, action8, action9, action10]);
		scene.push(frame3, frame4, frame5, frame6, actionManager);
	}

	globalZ += 100;

	//0:11:12
	{
		var fs = [frames.frame3, frames.frame4, frames.frame5, frames.frame6];
		for(var i = 0; i != fs.length; ++i)
		{
			fs[i].endTime += 3500;
		}

		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1000 + R(667)], P(0, h * 0.75), P(0, h * 0.2), frames.pLeft);
		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1667], P(w, h * 0.75), P(w, h * 0.2), frames.pRight);
		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1667], P(w * 0.5, 0), P(w * 0.2, 0), frames.pUp);
		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([500, 1667], P(w * 0.5, h), P(w * 0.2, h), frames.pDown);

		var action5 = new FTPhotoFrame.PointIntersectionAction([0, 3500], [frames.pUp, frames.pDown, frames.pLeft, frames.pRight], frames.pCenter);

		var action6 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 3500], P(0, h * 0.2), P2, frames.pLeft);
		var action7 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 3500], P(w, h * 0.2), P3, frames.pRight);

		var action8 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 3500], P(w * 0.2, 0), P1, frames.pUp);
		var action9 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 3500],  P(w * 0.2, h), P3, frames.pDown);

		var actionManager = M(5300, 9000);
		actionManager.pushArr([action1, action2, action3, action4, action6, action7, action8, action9, action5]);

		var img3 = WGE.rotateArray(imageArray);

		var frame1 = S(6700, 15000, img3, -1);
		frame1.zIndex = fs[0].zIndex + 0.5;
		frame1.alpha = 0;

		frame1.setHotspot2Center();
		frame1.moveTo(w/2, h/2);
		frame1.zone = fs[0].zone;

		var frame1Action = new WGE.Actions.UniformAlphaAction([0, 1000], 0, 1);
		var frame1Action2 = new WGE.Actions.UniformScaleAction([0, 6000], [1.0, 1.0], [1.3, 1.3]);
		frame1.push(frame1Action);
		frame1.push(frame1Action2);


		scene.push(actionManager, frame1);

		frames = {};
		frames.frame1 = frame1;
	}

	globalZ += 100;

	//0:14:22 
	{
		var frame1 = frames.frame1;
		var frame2 = S(9100, 15000, frame1.img, -1);
		frame2.setHotspot2Center();
		frame2.moveTo(w / 2 - 10, h / 2);
		frame2.zIndex = globalZ;

		var frame2Action = new WGE.Actions.UniformScaleAction([0, 6000], [1.3, 1.3], [1.0, 1.0]);
		frame2.push(frame2Action);

		var pnts = [P(0, 0), P(0, h)];

		var zone1 = Z([P(0, 0), pnts[0], pnts[1], P(0, h)]);
		frame2.zone = zone1;

		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500 + R(500)], P0, P(w * 0.6, 0), pnts[0]);
		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1000 + R(1000)], P2, P(w * 0.6, h), pnts[1]);
		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([2600, 2900], P(w * 0.6, 0), P1, pnts[0]);
		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([2500, 3000], P(w * 0.6, h), P3, pnts[1]);
		var actionManager = M(9100, 12100);
		actionManager.pushArr([action1, action2, action3, action4]);


		scene.push(actionManager, frame2);

		var img4 = WGE.rotateArray(imageArray);

		var frame3 = S(11000, 15000, img4, -1);
		var frame4 = S(11000, 15000, img4, -1);
		frame3.setHotspot2Center();
		frame3.moveTo(w / 2, h / 2);
		frame3.zIndex = globalZ + 1;

		frame4.setHotspot2Center();
		frame4.moveTo(w / 2, h / 2);
		frame4.zIndex = globalZ + 2;

		var frame3Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.3, 1.3], [1.0, 1.0]);
		frame3.push(frame3Action);

		var frame4Action = new WGE.Actions.UniformScaleAction([0, 5000], [1.0, 1.0], [1.2, 1.2]);
		frame4.push(frame4Action);

		var pnts2 = [P(0, 0), P(0, h), P(w, 0), P(w, h)];

		var zone2 = Z([P(0, 0), pnts2[0], pnts2[1], P(0, h)]);
		frame3.zone = zone2;

		var zone3 = Z([pnts2[2], P(w, 0), P(w, h), pnts2[3]]);
		frame4.zone = zone3;

		var action5 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500], P0, P(w * 0.5, 0), pnts2[0]);
		var action6 = new FTPhotoFrame.PointMoveSlowDown3X([500, 2000], P2, P(w * 0.5, h), pnts2[1]);
		var action7 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 2000], P1, P(w * 0.5, 0), pnts2[2]);
		var action8 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1800], P3, P(w * 0.5, h), pnts2[3]);

		var action9 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500],  P(w * 0.5, 0), P0, pnts2[0]);
		var action10 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, h), P2, pnts2[1]);
		var action11 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, 0), P1, pnts2[2]);
		var action12 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.5, h), P3, pnts2[3]);

		var actionManager2 = M(12000, 15000);
		actionManager2.pushArr([action5, action6, action7, action8, action9, action10, action11, action12]);

		if(!stillTime)
			stillTime = 15000;
		else if(stillTime < 15000)
			stillTime = 15000;

		var frame5 = S(14000, stillTime, img4, -1);
		frame5.setHotspot2Center();
		frame5.moveTo(w / 2, h / 2);
		frame5.zIndex = frame3.zIndex - 0.5;

		var frame5Action = new WGE.Actions.UniformScaleAction([0, 2000], [1.3, 1.3], [1.0, 1.0]);
		frame5.push(frame5Action);

		scene.push(actionManager2, frame3, frame4, frame5);
	}

	if(timeStamp && timeStamp > 0)
	{
		for(var i = 0; i != scene.length; ++i)
		{
			scene[i].startTime += timeStamp;
			scene[i].endTime += timeStamp;
		}
	}

	return scene;
};

FTPhotoFrame.Scene = WGE.Class(WGE.TimeLine,
{

	startPhotoframe : function(startTime)
	{
		this.start(startTime);
		//初始化zones
	},

	endPhotoframe : function()
	{
		this.end();
		//结束zones
	},

	//cardArray 为包含所有可用图片的数组。
	updatePhotoframe : function(deltaTime, cardArray)
	{
		if(!this.isStarted)
			return false;

		//更新zones.

		return this.update(deltaTime);
	},

	renderPhotoframe : function(ctx)
	{
		this.render(ctx);
	}

});