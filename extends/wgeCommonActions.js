"use strict";
/*
* wgeCommonActions.js
*
*  Created on: 2014-8-22
*
*/


/*
	简介: 公用action 列表库，列举并提供所有的可能被公用的action 操作
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

	initialize : function(time, attribName, attribValue)
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
		this[attribName] = attribValue;
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


})();