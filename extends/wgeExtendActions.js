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

//动态改变透明度
A.UniformAlphaAction = WGE.Class(WGE.TimeActionInterface,
{
	fromAlpha : 1,
	toAlpha : 1,
	dis : 0,

	initialize : function(time, from, to, repeatTimes)
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
		this.fromAlpha = from;
		this.toAlpha = to;
		this.dis = to - from;
		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		};
	},

	actionStart : function()
	{
		this.bindObj.alpha = this.fromAlpha;
	},

	actionStop : function()
	{
		this.bindObj.alpha = this.toAlpha;
	}
});

A.BlinkAlphaAction = WGE.Class(A.UniformAlphaAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t = (t - Math.floor(t)) * 2.0;
		if(t > 1.0)
			t = 2.0 - t;
		t = t * t * (3.0 - 2.0 * t);
		try
		{
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t = (t - Math.floor(t)) * 2.0;
			if(t > 1.0)
				t = 2.0 - t;
			t = t * t * (3.0 - 2.0 * t);
			this.bindObj.alpha = this.fromAlpha + this.dis * t;
		};
	},

	actionStop : function()
	{
		this.bindObj.alpha = this.fromAlpha;
	}
});

//匀速直线运动
A.UniformLinearMoveAction = WGE.Class(WGE.TimeActionInterface,
{
	//为了效率，此类计算不使用前面封装的对象
	fromX : 0,
	fromY : 0,
	toX : 1,
	toY : 1,
	disX : 1,
	disY : 1,

	initialize : function(time, from, to, repeatTimes)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else
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

		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		};
	},

	actionStart : function()
	{
		this.bindObj.moveTo(this.fromX, this.fromY);
	},

	actionStop : function()
	{
		this.bindObj.moveTo(this.toX, this.toY);
	}
});

A.NatureMoveAction = WGE.Class(A.UniformLinearMoveAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		this.bindObj.moveTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
	}
});

A.UniformScaleAction = WGE.Class(A.UniformLinearMoveAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		try
		{
			this.bindObj.scaleTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		}catch(e)
		{
			console.error("Invalid Binding Object!");
		}

		this.act = function(percent)
		{
			var t = this.repeatTimes * percent;
			t -= Math.floor(t);
			this.bindObj.scaleTo(this.fromX + this.disX * t, this.fromY + this.disY * t);
		};
	},

	actionStart : function()
	{
		this.bindObj.scaleTo(this.fromX, this.fromY);
	},

	actionStop : function()
	{
		this.bindObj.scaleTo(this.toX, this.toY);
	}
});

//简单适用实现，兼容2d版sprite和webgl版sprite2d
A.UniformRotateAction = WGE.Class(A.UniformLinearMoveAction,
{
	fromRot : 0,
	toRot : 0,
	disRot : 0,

	initialize : function(time, from, to, repeatTimes)
	{
		if(time instanceof Array)
		{
			this.tStart = time[0];
			this.tEnd = time[1];
		}
		else
		{
			this.tStart = time.data[0];
			this.tEnd = time.data[1];
		}

		this.fromRot = from;
		this.toRot = to;
		this.disRot = to - from;

		this.repeatTimes = repeatTimes ? repeatTimes : 1;
	},

	actionStart : function()
	{
		this.bindObj.rotateTo(this.fromRot);
	},

	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		this.bindObj.rotateTo(this.fromRot + t * this.disRot);
	},

	actionStop : function()
	{
		this.bindObj.rotateTo(this.toRot);
	}

});

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
		var pnt = WGE.lineIntersectionV(this.pnts[0], this.pnts[1], this.pnts[2], this.pnts[3]);
		this.bindObj.data[0] = pnt.data[0];
		this.bindObj.data[1] = pnt.data[1];
	},

	actionStop : function()
	{
		var pnt = WGE.lineIntersectionV(this.pnts[0], this.pnts[1], this.pnts[2], this.pnts[3]);
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

//一个非连续的跳跃移动动作，参数移动的时间和移动的和相对于当前位置移动的距离
A.jumpMoveAction = WGE.Class(WGE.TimeActionInterface,
{
	endX: 0,
	endY: 0,

	initialize : function(time, jumpPos)
	{	
		this.tStart = time;
		this.tEnd = time;
		
		if(jumpPos instanceof Array)
		{
			this.endX = jumpPos[0];
			this.endY = jumpPos[1];
		}
		else if(jumpPos instanceof WGE.Vec2)
		{
			this.endX = jumpPos.data[0];
			this.endY = jumpPos.data[1];
		}
	},

	act : function(percent)
	{
		this.bindObj.moveTo(this.bindObj.pos.data[0] + this.endX, this.bindObj.pos.data[1]+this.endY);
	},

	actionStop : function()
	{
		this.bindObj.moveTo(this.bindObj.pos.data[0] + this.endX, this.bindObj.pos.data[1]+this.endY);
	}
});

//非连续的瞬间缩放动作
A.jumpScaleAction = WGE.Class(WGE.TimeActionInterface,
{
	scaleX: 0,
	scaleY: 0,

	initialize : function(time, endScale)
	{	
		this.tStart = time;
		this.tEnd = time;
		
		if(endScale instanceof Array)
		{
			this.scaleX = endScale[0];
			this.scaleY = endScale[1];
		}
		else if(endScale instanceof WGE.Vec2)
		{
			this.scaleX = endScale.data[0];
			this.scaleY = endScale.data[1];
		}
	},

	act : function(percent)
	{
		this.bindObj.scaleTo(this.scaleX, this.scaleY);
	},

	actionStop : function()
	{
		this.bindObj.scaleTo(this.scaleX, this.scaleY);
	}
});

A.acceleratedMoveAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var y = Math.sin(Math.PI * 2 * t) * 50;
		this.bindObj.moveTo(this.fromX, this.fromY + y);
	},

	actionStart : function()
	{
		
	},

	actionStop : function()
	{

	}
});

A.MoveRightAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{


	distance : 0,
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var x = Math.sin(Math.PI/2* t) * this.distance;
		this.bindObj.moveTo(this.fromX+x, this.fromY);

	},

	setDistance : function(distance)
	{
		this.distance = distance;
	}
});

A.MoveDownAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{
	distance : 0,
	act : function(percent)
	{
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var y = Math.sin(Math.PI/2* t) * this.distance;
		this.bindObj.moveTo(this.fromX, this.fromY + y);

	},

	setDistance : function(distance)
	{
		this.distance = distance;
	}
});

A.MoveSlideAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{
	distance : 0,
	descDistance : 0,
	y : 0,
	y1 : 0,
	act : function(percent)
	{
		var proporty = 0.5;
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var t1 = t/proporty;
		var t2 = (t - proporty) / (1-proporty);
		
		
		if(t < 0.5){
			this.y  = Math.sin(Math.PI/2* t1) * this.distance;
			this.bindObj.moveTo(this.fromX, this.fromY - this.y);
		}
		else{
			this.y1 = Math.sin(Math.PI/2* t2) * this.descDistance;
			this.bindObj.moveTo(this.fromX, this.fromY + this.y1 - this.y);
		}
	},

	actionStop : function()
	{

	},

	setDistance : function(distance)
	{
		this.distance = distance;
	},

	setDescDistance : function(descDistance)
	{
		this.descDistance = descDistance;
	}
});

//和slideup接轨的动作
A.acceleratedSlideMoveAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{
	firstNode : true,
	posx : 0,
	posy : 0,

	act : function(percent)
	{
		if(this.firstNode)
		{
			this.firstNode = false;
			this.posx = this.bindObj.pos.data[0];
			this.posy = this.bindObj.pos.data[1];
		}
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var y = Math.sin(Math.PI * 2 * t) * 50;
		this.bindObj.moveTo(this.posx, this.posy + y);
	},

	actionStart : function()
	{
		
	},

	actionStop : function()
	{

	}
});


A.MoveSlideRightAction = WGE.Class(WGE.Actions.UniformLinearMoveAction,
{


	distance : 0,
	firstNode : true,
	posx : 0,
	posy : 0,

	act : function(percent)
	{
		if(this.firstNode)
		{
			this.firstNode = false;
			this.posx = this.bindObj.pos.data[0];
			this.posy = this.bindObj.pos.data[1];
		}
		var t = this.repeatTimes * percent;
		t -= Math.floor(t);
		t = t * t * (3 - 2 * t);
		var x = Math.sin(Math.PI/2* t) * this.distance;
		this.bindObj.moveTo(this.posx+x, this.posy);

	},

	setDistance : function(distance)
	{
		this.distance = distance;
	},

	actionStop : function()
	{

	}

});


})();