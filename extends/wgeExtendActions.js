"use strict";
/*
* wgeCommonActions.js
*
*  Created on: 2014-8-22
*
*/


/*
	简介: 扩展action 列表库，列举并提供所有的可能被公用的action 操作
	      需要与wgeAnimation结合使用。
	      在添加每个actions的前面请务必注释并写上添加者名字，以方便后续使用
	      如果你觉得全部写到一个文件里面不方便，也可以自己在extend目录里面添加一个文件，自己写自己的actions （这样可能重复利用率低，导致大家各写各的）

	特别注意: 如果该方法涉及到某个特定环境下(比如必须要context-2d支持), 请务必标注出来。
*/


// 将本文件内所有方法添加至 WGE.Actions 类名下，防止命名冲突。
WGE.Actions = {};

(function()
{

var A = WGE.Actions;


// 将绑定的 AnimationSprite的某个属性，在给定的时间点设置为给定的值。
// 适用于某些离散操作
A.SetAttribAction = WGE.Class(WGE.TimeActionInterface,
{
	originAttribValue : null,
	attribName : null,
	attribValue : null,

	initialize : function(time, attribName, attribValue, bindObj)
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
		this.attribName = attribName;
		this.attribValue = attribValue;
		this.originAttribValue = attribValue;
		this.bindObj = bindObj;
	},

	//当timeline重新开始时，对属性进行复位。
	actionStart : function()
	{
		this.bindObj[this.attribName] = this.originAttribValue;
	},

	act : function(percent)
	{
		this.bindObj[this.attribName] = this.attribValue;
	},

	actionStop : function()
	{
		this.bindObj[this.attribName] = this.attribValue
	}
});

A.PointIntersectionAction = WGE.Class(WGE.TimeActionInterface,
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

A.PointMoveAction = WGE.Class(WGE.TimeActionInterface,
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

A.PointMoveSlowDown3X = WGE.Class(A.PointMoveAction,
{
	act : function(percent)
	{
		var t = percent * percent * (3 - 2 * percent);
		this.bindObj.data[0] = this.fromX + this.disX * t;
		this.bindObj.data[1] = this.fromY + this.disY * t;
	}
});


})();