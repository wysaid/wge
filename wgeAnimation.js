"use strict";
/*
* wgeAnimation.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/


// TimeActionInterface 定义了Time line可能会用到的公共函数，
// 这些函数在子类中如果需要用到的话则必须实现它！
// TimeActionInterface 不计算动作是否开始或者结束
WGE.TimeActionInterface = WGE.Class(
{
	// 为了方便统一计算， percent 值域范围必须为[0, 1]， 内部计算时请自行转换。
	act : function(percent) {},

	// 为Action开始做准备工作，比如对一些属性进行复位。(非必须)
	actionStart : function() {},

	// Action结束之后的扫尾工作，比如将某物体设置运动结束之后的状态。
	actionStop : function() {},

	bind : function(obj) { this.bindObj = obj; }, // 将动作绑定到某个实际的对象。

	// 在一次TimeAttrib中重复的次数, 对某些操作比较有用，如旋转
	repeatTimes : 1,
	bindObj : undefined,

	// 注意：这里的时间是相对于某个 SpriteAnimation自身的时间，而不是整个时间轴的时间！
	tStart : 0, //起始时间
	tEnd : 0 //结束时间
});

WGE.AnimationInterface2d = WGE.Class(
{
	startTime : undefined,
	endTime : undefined,
	timeActions : undefined, //action数组，将在规定时间内完成指定的动作
	actions2Run : undefined, //时间轴启动后，未完成的action。

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	setAttrib : function(tStart, tEnd)
	{
		this.startTime = parseFloat(tStart);
		this.endTime = parseFloat(tEnd);
	},

	push : function(action)
	{
		if(action.bind)
			action.bind(this);
		this.timeActions.push(action);
	},

	pushArr : function(actions)
	{
		for(var i in actions)
		{
			if(actions[i].bind)
				actions[i].bind(this);
			this.timeActions.push(actions[i]);
		}
	},

	clear : function()
	{
		this.timeActions = [];
	},

	run : function(totalTime)
	{
		var time = totalTime - this.startTime;
		var running = false;

		var len = this.actions2Run.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var action = this.actions2Run[i];
			if(!action) continue;

			if(time >= action.tEnd)
			{
				action.actionStop();
				delete this.actions2Run[i];
				hasDelete = true;
			}
			else if(time > action.tStart)
			{
				var t = (time - action.tStart) / (action.tEnd - action.tStart);
				action.act(t);
			}

			running = true;
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.actions2Run;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.actions2Run = newArr;
		}

		return running;
	},

	//进度跳转
	runTo : function(time)
	{

	},

	//启动时将action复位。
	timeStart : function()
	{
		for(var i = 0; i != this.timeActions.length; ++i)
		{
			this.timeActions[i].actionStart();
		}
		this.actions2Run = WGE.clone(this.timeActions);
	},

	//结束时将action设置为结束状态
	timeUp : function()
	{
		for(var i = 0; i != this.actions2Run.length; ++i)
		{
			this.actions2Run[i].actionStop();
		}
		this.actions2Run = undefined;
	}
});

WGE.AnimationWithChildrenInterface2d = WGE.Class(WGE.AnimationInterface2d,
{
	childSprites : null, //js特殊用法，扩展了对action的更新。

	run : function(totalTime)
	{
		WGE.AnimationInterface2d.run.call(this, totalTime);

		for(var i in this.childSprites)
		{
			this.childSprites[i].run(totalTime);
		}
	},

	//进度跳转
	runTo : function(time)
	{
		WGE.AnimationInterface2d.runTo.call(this, time);
		for(var i in childSprites)
		{
			this.childSprites[i].runTo(time);
		}
	},

	//启动时将action复位。
	timeStart : function()
	{
		WGE.AnimationInterface2d.timeStart.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeStart();
		}
	},

	//结束时将action设置为结束状态
	timeUp : function()
	{
		WGE.AnimationInterface2d.timeUp.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeUp();
		}
	}

});


//特殊用法, 不包含sprite的任何功能，仅仅作为管理那些特殊单独存在的action的容器。

WGE.AnimationActionManager = WGE.Class(WGE.AnimationInterface2d,
{
	zIndex : -10000,

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	push : function()
	{
		this.timeActions.push.apply(this, arguments);
	},

	pushArr : function(arr)
	{
		this.timeActions.push.call(this.timeActions, arr);
	}

});


/*
// AnimationSprite 定义了某个时间段的动作。
// AnimationSprite 与 TimeActionInterface 为包含关系，
// 一个 AnimationSprite 包含一个或多个 TimeActionInterface或者其子类.
// AnimationSprite 及其子类 根据action起始时间，计算动作开始或者结束

//以下为AnimationSprite 实现原型，本身是一个完整的sprite
WGE.AnimationSprite = WGE.Class(WGE.Sprite*, WGE.AnimationInterface2d,
{
	initialize : function(startTime, endTime, img, w, h)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
		if(img)
		{
			this.initSprite(img, w, h);
		}
	}
});
*/

//时间轴
WGE.TimeLine = WGE.Class(
{
	currentTime : 0.0,
	totalTime : 0.0,
	timeObjects : undefined,
	isStarted : false,
	//动画开始后等待绘制的所有timeObjects(已经结束绘制的将被剔除队列)
	ObjectsWait2Render : undefined,
	//每一帧要绘制的timeObjects，将按z值排序，并筛选掉不需要绘制的节点。
	Objects2Render : undefined, 

	initialize : function(totalTime)
	{
		this.totalTime = parseFloat(totalTime);
		this.timeObjects = [];
	},

	push : function()
	{
		this.timeObjects.push.apply(this.timeObjects, arguments);
		
		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	pushArr : function(attribArr)
	{
		this.timeObjects.push.apply(this.timeObjects, attribArr);

		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	clear : function()
	{
		this.timeObjects = [];
	},

	//startTime可不填，默认为0
	start : function(startTime)
	{
		this.isStarted = true;
		this.currentTime = parseFloat(startTime ? startTime : 0);

		this.timeObjects.sort(function(a, b){
			return a.startTime - b.startTime;
		});

		this.ObjectsWait2Render = WGE.clone(this.timeObjects);

		for(var i = 0; i != this.ObjectsWait2Render.length; ++i)
		{
			this.ObjectsWait2Render[i].timeStart();
		}
		this.Objects2Render = this.ObjectsWait2Render;
	},

	//将整个画面设置为结束状态
	end : function()
	{
		this.isStarted = false;
	},

	//根据时间变化更新，请保证 time > 0。
	//update之前请先调用start函数确保画面初始化。
	update : function(deltaTime)
	{
		if(!this.isStarted)
			return false;
		this.Objects2Render = [];
		this.currentTime += deltaTime;
		if(this.currentTime > this.totalTime)
			return false;
		
		var time = this.currentTime;
		var running = false;
		var len = this.ObjectsWait2Render.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var anim = this.ObjectsWait2Render[i];
			if(!anim) continue;

			running = true;
						
			if(time >= anim.endTime)
			{
				anim.timeUp();
				//并不是所有的动作都需要渲染
				if(anim.render)
					this.Objects2Render.push(anim);
				delete this.ObjectsWait2Render[i];
				hasDelete = true;
			}
			else if(time > anim.startTime)
			{
				anim.run(time);
				this.Objects2Render.push(anim);
			}
			else break; //所有事件已经通过起始时间排序，若中间某一个事件起始时间未达到，则后面的均未达到。
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.ObjectsWait2Render;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.ObjectsWait2Render = newArr;
		}

		return running;
	},

	//进度跳转， 要对整个时间轴进行插值计算，可能速度较慢
	updateTo : function(currentTime)
	{

	},

	render : function(ctx)
	{
		this.Objects2Render.sort(function(a, b){return a.zIndex - b.zIndex;});
		for(var i = 0; i != this.Objects2Render.length; ++i)
		{
			var anim = this.Objects2Render[i];
			anim.render(ctx);
		}
	},

	getProgressRate : function()
	{
		return this.currentTime / this.totalTime;
	},

	getCurrentTime : function()
	{
		return this.currentTime;
	}

});