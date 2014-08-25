"use strict";
/*
* photoFrames.js
*
*  Created on: 2014-7-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

// window.FTPhotoFrame = {};

// FTPhotoFrame.PhotoFrameSprite = WGE.Class(WGE.Sprite, WGE.AnimationInterface2d,
// {
// 	initialize : function(startTime, endTime, img, w, h)
// 	{
// 		this.setAttrib(startTime, endTime);
// 		this.timeActions = [];
// 		if(img)
// 		{
// 			this.initSprite(img, w, h);
// 		}
// 	},
	
// 	//这里的zone 由 FTPhotoFrame.PointAnimationManager 维护。
// 	zone : undefined,

// 	render : function(ctx)
// 	{
// 		ctx.save();

// 		if(this.alpha != undefined)
// 			ctx.globalAlpha = this.alpha;
// 		if(this.zone)
// 			this.zone.clipZone(ctx, true);//, '#fff', 10);

// 		ctx.translate(this.pos.data[0], this.pos.data[1]);
// 		if(this.rotation)
// 			ctx.rotate(this.rotation);		
// 		if(this.scaling)
// 			ctx.scale(this.scaling.data[0], this.scaling.data[1]);
		
// 		if(this.blendMode)
// 			ctx.globalCompositeOperation = this.blendMode;
// 		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);
// 		ctx.restore();
// 	}
// });

// //参数
// //		imageArray : 存放所有图片的数组。
// //		w : 画面宽度
// //		h : 画面高度
// //		globalZ : 整个画面的Z值，对于需要多个场景循环时必须填写，方便后入时覆盖当前画面
// //				  场景之间z值差 < 10000, 填写10000可保证完整覆盖
// //		timeStamp : 场景循环时必须填写，整个场景开始时间。
// //		stillTime : 设置整个场景至少持续的时间。防止出现短暂黑屏 (目前整个画面为15秒)
// FTPhotoFrame.initScene = function(imageArray, w, h, globalZ, timeStamp, stillTime)
// {
// 	var P = function(x, y) {
// 		return new WGE.Vec2(x, y);
// 	};

// 	var M = function(startTime, endTime){
// 		return new FTPhotoFrame.PointAnimationManager(startTime, endTime);
// 	};

// 	var Z = function(arr){
// 		return new FTPhotoFrame.Zone(arr);
// 	};

// 	var S = function(startTime, endTime, img, w, h){
// 		return new FTPhotoFrame.PhotoFrameSprite(startTime, endTime, img, w, h);
// 	};

// 	var R = function(t) {
// 		return Math.random() * t;
// 	};

// 	//方便固定不动点使用。
// 	var P0 = P(0, 0), P1 = P(w, 0), P2 = P(0, h), P3 = P(w, h);

// 	var scene = [];

// 	var frames = {};

// 	if(globalZ == undefined)
// 		globalZ = 0;

// 	var filterBW = new WGE.FilterBW();

// 	//时间按每秒30帧计算
// 	//0:5:25~0:8:20 [0, 2800]
// 	{
// 		var img = WGE.rotateArray(imageArray);
// 		var imgBW = typeof img.PhotoFrameBW == 'object' ? img.PhotoFrameBW : (img.PhotoFrameBW = filterBW.bind(img).run());
		
// 		var frame1 = S(0, 2800, img, -1);
// 		var frame2 = S(1000, 2800, imgBW, -1);

// 		frame1.zIndex = globalZ + 1;
// 		frame2.zIndex = globalZ;

// 		frames.frame1 = frame1;
// 		frames.frame2 = frame2;

// 		frame1.setHotspotWithRatio(0.5, 0.1);
// 		frame1.moveTo(w / 2, h / 10);
// 		frame2.setHotspotWithRatio(0.5, 0.1);
// 		frame2.moveTo(w / 2, h / 10);

// 		var frame1Action = new WGE.UniformScaleAction([0, 6000], [1.3, 1.3], [1, 1]);
// 		var frame2Action = new WGE.UniformScaleAction([0, 6000], [1.0, 1.0], [1.3, 1.3]);

// 		frame1.push(frame1Action);
// 		frame2.push(frame2Action);

// 		///////////////////////////////
// 		var pnts = [P(0, h), P(w, h), P(w, h), P(0, h)];

// 		var zone1 = Z(pnts);
// 		var zone2 = Z([pnts[2], pnts[3], P(0, h), P(w, h)]);

// 		frame1.zone = zone1;
// 		frame2.zone = zone2;

// 		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1500 + R(130)], pnts[0], P0, pnts[0]);
// 		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1630], pnts[1], P1, pnts[1]);

// 		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 2000 + R(560)], pnts[2], [w, h / 2], pnts[2]);
// 		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(200), 2560], pnts[3], [0, h / 2], pnts[3]);

// 		var action7 = new FTPhotoFrame.PointMoveAction([2560, 2800], [0, h / 2], P0, pnts[3]);
// 		var action8 = new FTPhotoFrame.PointMoveAction([2560, 2800], [w, h / 2], P3, pnts[2]);

// 		var actionManager = M(0, 2900);
// 		actionManager.pushArr([action1, action2, action3, action4, action7, action8]);

// 		scene.push(frame1, frame2, actionManager);
// 	}

// 	//0:8:20 ~ 0:10:0
// 	{
// 		var frame1 = frames.frame1;
// 		var frame2 = frames.frame2;
// 		frame1.endTime += 1333;
// 		frame2.endTime += 1333;
// 		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1000 + R(333)], P0, [w / 2, 0], frame1.zone.clipArray[3]);
// 		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1333], P3, [w / 2, h], frame1.zone.clipArray[2]);

// 		frames.pUp = frame1.zone.clipArray[3];
// 		frames.pDown = frame1.zone.clipArray[2];

// 		var action3 = new FTPhotoFrame.PointMoveAction([0, 0], P1, P1, frame1.zone.clipArray[0]);
// 		var action4 = new FTPhotoFrame.PointMoveAction([0, 0], P3, P3, frame1.zone.clipArray[1]);


// 		var action5 = new FTPhotoFrame.PointMoveAction([0, 0], P2, P2, frame2.zone.clipArray[3]);
// 		var action6 = new FTPhotoFrame.PointMoveAction([0, 0], P0, P0, frame2.zone.clipArray[2]);

// 		var actionManager = M(2800, 4133);
// 		actionManager.pushArr([action1, action2, action3, action4, action5, action6]);

// 		scene.push(actionManager);
// 	}

// 	globalZ += 100;

// 	//0:9:0
// 	{
// 		var frame1 = frames.frame1;
// 		var frame2 = frames.frame2;
// 		frame1.endTime += 1500;
// 		frame2.endTime += 1500;

// 		////////////////////////////////////////////////
// 		var img1 = WGE.rotateArray(imageArray);
// 		var img1BW = typeof img1.PhotoFrameBW == 'object' ? img1.PhotoFrameBW : (img1.PhotoFrameBW = filterBW.bind(img1).run());

// 		var frame3 = S(3133, 6000, img1, -1);
// 		var frame4 = S(3133, 6000, img1BW, -1);
// 		frame3.zIndex = globalZ;
// 		frame4.zIndex = globalZ + 1;
// 		frame3.setHotspotWithRatio(0.5, 0.1);
// 		frame4.setHotspotWithRatio(0.5, 0.1);
// 		frame3.moveTo(w / 2, h / 10);
// 		frame4.moveTo(w / 2, h / 10);

// 		var frame3Action = new WGE.UniformScaleAction([0, 5000], [1.0, 1.0], [1.3, 1.3]);
// 		var frame4Action = new WGE.UniformScaleAction([0, 5000], [1.2, 1.2], [1.0, 1.0]);
		
// 		frame3.push(frame3Action);
// 		frame4.push(frame4Action);

// 		//////////////////////////////////////////////////

// 		var img2 = WGE.rotateArray(imageArray);
// 		var img2BW = typeof img2.PhotoFrameBW == 'object' ? img2.PhotoFrameBW : (img2.PhotoFrameBW = filterBW.bind(img2).run());

// 		var frame5 = S(4133, 6000, img2BW, -1);
// 		var frame6 = S(4133, 6000, img2, -1);
// 		frame5.zIndex = globalZ - 2;
// 		frame6.zIndex = globalZ - 1;
// 		frame5.setHotspotWithRatio(0.5, 0.1);
// 		frame6.setHotspotWithRatio(0.5, 0.1);
// 		frame5.moveTo(w / 2, h / 10);
// 		frame6.moveTo(w / 2, h / 10);

// 		var frame5Action = new WGE.UniformScaleAction([0, 5000], [1.0, 1.0], [1.2, 1.2]);
// 		var frame6Action = new WGE.UniformScaleAction([0, 5000], [1.1, 1.1], [1.0, 1.0]);

// 		frame5.push(frame5Action);
// 		frame6.push(frame6Action);

// 		frames.frame3 = frame3;
// 		frames.frame4 = frame4;
// 		frames.frame5 = frame5;
// 		frames.frame6 = frame6;

// 		//////////////////////////////////////////////////

// 		var pUp = frames.pUp;
// 		var pDown = frames.pDown;

// 		var pnts = [P(0, 0), P(w, 0), P(0, 0), P(w, 0)];

// 		var pCenter1 = P(w / 2, 0), pCenter2 = P(w / 2, 0);

// 		frames.pCenter = pCenter1;
// 		frames.pLeft = pnts[0];
// 		frames.pRight = pnts[1];
// 		frames.pDown = pCenter2;

// 		var zone1 = Z([P(0,0), pUp, pCenter1, pnts[0]]);
// 		var zone2 = Z([pUp, P(w, 0), pnts[1], pCenter1]);
// 		var zone3 = Z([pnts[0], pCenter1, pCenter2, pnts[2]]);
// 		var zone4 = Z([pCenter1, pnts[1], pnts[3], pCenter2]);
// 		var zone5 = Z([pnts[2], pCenter2, pDown, P(0, h)]);
// 		var zone6 = Z([pCenter2, pnts[3], P(w, h), pDown]);

// 		frame3.zone = zone1;
// 		frame4.zone = zone2;
// 		frame5.zone = zone3;
// 		frame6.zone = zone4;
		
// 		var action1 = new FTPhotoFrame.ZoneSwitchAction([1000, 1000], zone5, frame2);
// 		var action2 = new FTPhotoFrame.ZoneSwitchAction([1000, 1000], zone6, frame1);

// 		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([R(200), 800 + R(200)], P(0,0), P(0, h / 2), pnts[0]);
// 		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([R(200), 1000], P(w,0), P(w, h / 2), pnts[1]);
// 		var action5 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(100), 1400 + R(100)], P(0, h / 2), P(0, h), pnts[2]);
// 		var action6 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1500], P(w, h / 2), P(w, h), pnts[3]);

// 		var action7 = new FTPhotoFrame.PointMoveSlowDown3X([1000 + R(200), 1500], P(0, h / 2), P(0, h * 0.75), pnts[0]);
// 		var action8 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1300 + R(200)], P(w, h / 2), P(w, h * 0.75), pnts[1]);

// 		var action9 = new FTPhotoFrame.PointIntersectionAction([0, 1500], [pnts[0], pnts[1], pUp, pDown], pCenter1);
// 		var action10 = new FTPhotoFrame.PointIntersectionAction([0, 1500], [pnts[2], pnts[3], pUp, pDown], pCenter2);

// 		var actionManager = M(3133, 4700);
// 		actionManager.pushArr([action1, action2, action3, action4, action5, action6, action7, action8, action9, action10]);
// 		scene.push(frame3, frame4, frame5, frame6, actionManager);
// 	}

// 	globalZ += 100;

// 	//0:11:12
// 	{
// 		var fs = [frames.frame3, frames.frame4, frames.frame5, frames.frame6];
// 		for(var i = 0; i != fs.length; ++i)
// 		{
// 			fs[i].endTime += 3500;
// 		}

// 		var action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1000 + R(667)], P(0, h * 0.75), P(0, h * 0.2), frames.pLeft);
// 		var action2 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1667], P(w, h * 0.75), P(w, h * 0.2), frames.pRight);
// 		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1667], P(w * 0.5, 0), P(w * 0.2, 0), frames.pUp);
// 		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([500, 1667], P(w * 0.5, h), P(w * 0.2, h), frames.pDown);

// 		var actionInsert = new FTPhotoFrame.PointIntersectionAction([0, 3500], [frames.pUp, frames.pDown, frames.pLeft, frames.pRight], frames.pCenter);


// 		var action10 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(0, h * 0.2), P(0, h * 0.05), frames.pLeft);
// 		var action11 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w, h * 0.2), P(w, h * 0.05), frames.pRight);

// 		var action12 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.2, 0), P(w * 0.05, 0), frames.pUp);
// 		var action13 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.2, h), P(w * 0.05, h), frames.pDown);

// 		var action6 = new FTPhotoFrame.PointMoveSlowDown3X([2500, 3300 + R(200)], P(0, h * 0.05), P2, frames.pLeft);
// 		var action7 = new FTPhotoFrame.PointMoveSlowDown3X([2500 + R(200), 3500], P(w, h * 0.05), P3, frames.pRight);

// 		var action8 = new FTPhotoFrame.PointMoveSlowDown3X([2500 + R(200), 3500], P(w * 0.05, 0), P1, frames.pUp);
// 		var action9 = new FTPhotoFrame.PointMoveSlowDown3X([2500, 3300 + R(200)], P(w * 0.05, h), P3, frames.pDown);

// 		var actionManager = M(5300, 9000);
// 		actionManager.pushArr([action1, action2, action3, action4, action6, action7, action8, action9, action10, action11, action12, action13, actionInsert]);

// 		var img3 = WGE.rotateArray(imageArray);

// 		var frame1 = S(6700, 15000, img3, -1);
// 		frame1.zIndex = fs[0].zIndex + 0.5;
// 		frame1.alpha = 0;

// 		frame1.setHotspotWithRatio(0.5, 0.1);
// 		frame1.moveTo(w/2, h/10);
// 		frame1.zone = fs[0].zone;

// 		var frame1Action = new WGE.UniformAlphaAction([0, 1000], 0, 1);
// 		var frame1Action2 = new WGE.UniformScaleAction([0, 6000], [1.0, 1.0], [1.3, 1.3]);
// 		frame1.push(frame1Action);
// 		frame1.push(frame1Action2);


// 		scene.push(actionManager, frame1);

// 		frames = {};
// 		frames.frame1 = frame1;
// 	}

// 	globalZ += 100;

// 	//0:14:22 
// 	{
// 		var frame1 = frames.frame1;

// 		var frame1ImgBW = typeof frame1.img.PhotoFrameBW == 'object' ? frame1.img.PhotoFrameBW : (frame1.img.PhotoFrameBW = filterBW.bind(frame1.img).run());

// 		var frame2 = S(9100, 15000, frame1ImgBW, -1);
// 		frame2.setHotspotWithRatio(0.5, 0.1);
// 		frame2.moveTo(w / 2 - 10, h / 10);
// 		frame2.zIndex = globalZ;

// 		var frame2Action = new WGE.UniformScaleAction([0, 6000], [1.3, 1.3], [1.0, 1.0]);
// 		frame2.push(frame2Action);

// 		var pnts = [P(0, 0), P(0, h)];

// 		var zone1 = Z([P(0, 0), pnts[0], pnts[1], P(0, h)]);
// 		frame2.zone = zone1;

// 		var action1, action2;

// 		if (R(10) > 5)
// 		{
// 		    action1 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500 + R(500)], P0, P(w * 0.6, 0), pnts[0]);
// 		    action2 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1000 + R(1000)], P2, P(w * 0.6, h), pnts[1]);
// 		}
// 		else
// 		{
// 		    action1 = new FTPhotoFrame.PointMoveSlowDown3X([R(500), 1000 + R(1000)], P0, P(w * 0.6, 0), pnts[0]);
// 		    action2 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500 + R(500)], P2, P(w * 0.6, h), pnts[1]);
// 		}
// 		var action3 = new FTPhotoFrame.PointMoveSlowDown3X([2600, 2900], P(w * 0.6, 0), P1, pnts[0]);
// 		var action4 = new FTPhotoFrame.PointMoveSlowDown3X([2500, 3000], P(w * 0.6, h), P3, pnts[1]);
// 		var actionManager = M(9100, 12100);
// 		actionManager.pushArr([action1, action2, action3, action4]);


// 		scene.push(actionManager, frame2);

// 		var img4 = WGE.rotateArray(imageArray);

// 		var frame3 = S(11000, 15000, img4, -1);
// 		var frame4 = S(11000, 15000, img4, -1);
// 		frame3.setHotspotWithRatio(0.5, 0.1);
// 		frame3.moveTo(w / 2, h / 10);
// 		frame3.zIndex = globalZ + 1;

// 		frame4.setHotspotWithRatio(0.5, 0.1);
// 		frame4.moveTo(w / 2, h / 10);
// 		frame4.zIndex = globalZ + 2;

// 		var frame3Action = new WGE.UniformScaleAction([0, 5000], [1.3, 1.3], [1.0, 1.0]);
// 		frame3.push(frame3Action);

// 		var frame4Action = new WGE.UniformScaleAction([0, 5000], [1.0, 1.0], [1.2, 1.2]);
// 		frame4.push(frame4Action);

// 		var pnts2 = [P(0, 0), P(0, h), P(w, 0), P(w, h)];

// 		var zone2 = Z([P(0, 0), pnts2[0], pnts2[1], P(0, h)]);
// 		frame3.zone = zone2;

// 		var zone3 = Z([pnts2[2], P(w, 0), P(w, h), pnts2[3]]);
// 		frame4.zone = zone3;

// 		var action5, action6, action7, action8, action9, action10, action11, action12;

// 		if (R(10) > 5)
// 		{
// 		    action5 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500], P0, P(w * 0.5, 0), pnts2[0]);
// 		    action6 = new FTPhotoFrame.PointMoveSlowDown3X([500, 2000], P2, P(w * 0.5, h), pnts2[1]);
// 		    action9 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.5, 0), P0, pnts2[0]);
// 		    action7 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 2000], P1, P(w * 0.5, 0), pnts2[2]);
// 		    action8 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1800], P3, P(w * 0.5, h), pnts2[3]);
// 		    action10 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, h), P2, pnts2[1]);		    
// 		    action11 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, 0), P1, pnts2[2]);
// 		    action12 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.5, h), P3, pnts2[3]);
// 		}
// 		else
// 		{
// 		    action5 = new FTPhotoFrame.PointMoveSlowDown3X([0, 2000], P0, P(w * 0.5, 0), pnts2[0]);
// 		    action6 = new FTPhotoFrame.PointMoveSlowDown3X([0, 1500 + R(500)], P2, P(w * 0.5, h), pnts2[1]);
// 		    action7 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 1800], P1, P(w * 0.5, 0), pnts2[2]);
// 		    action8 = new FTPhotoFrame.PointMoveSlowDown3X([1000, 2000], P3, P(w * 0.5, h), pnts2[3]);
// 		    action9 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.5, 0), P0, pnts2[0]);
// 		    action10 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, h), P2, pnts2[1]);
// 		    action11 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2500], P(w * 0.5, 0), P1, pnts2[2]);
// 		    action12 = new FTPhotoFrame.PointMoveSlowDown3X([2000, 2900], P(w * 0.5, h), P3, pnts2[3]);
// 		}
		

// 		var actionManager2 = M(12000, 15000);
// 		actionManager2.pushArr([action5, action6, action7, action8, action9, action10, action11, action12]);

// 		if(!stillTime)
// 			stillTime = 15000;
// 		else if(stillTime < 15000)
// 			stillTime = 15000;


// 		var img4BW = typeof img4.PhotoFrameBW == 'object' ? img4.PhotoFrameBW : (img4.PhotoFrameBW = filterBW.bind(img4).run());

// 		var frame5 = S(14000, stillTime, img4BW, -1);
// 		frame5.setHotspotWithRatio(0.5, 0.1);
// 		frame5.moveTo(w / 2, h / 10);
// 		frame5.zIndex = frame3.zIndex - 0.5;

// 		var frame5Action = new WGE.UniformScaleAction([0, 2000], [1.2, 1.2], [1.0, 1.0]);
// 		frame5.push(frame5Action);

// 		scene.push(actionManager2, frame3, frame4, frame5);
// 	}

// 	if(timeStamp && timeStamp > 0)
// 	{
// 		for(var i = 0; i != scene.length; ++i)
// 		{
// 			scene[i].startTime += timeStamp;
// 			scene[i].endTime += timeStamp;
// 		}
// 	}

// 	return scene;
// };


WGE.PhotoFrame = WGE.Class(WGE.SlideshowInterface,
{
	audioFileName : "piano.mp3", //不包含路径

});