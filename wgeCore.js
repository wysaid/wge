"use strict";
/*
* wgeCore.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
简介： WGE (WYSAID's (Web) Graphics Engine) 是一个web平台下的图形引擎。
       主要使用webgl实现，同时编写context 2d兼容版本
	   context 2d版本主要用于兼容部分低版本的IE浏览器，但不保证支持WGE的所有功能
*/

window.WGE = 
{
	VERSION : '0.0.1'

};

WGE.clone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
		return myObj.slice(0);
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.clone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

//数组将被深拷贝
WGE.deepClone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
	{
		var arr = new Array(myObj.length);
		for(var i = 0; i != myObj.length; ++i)
		{
			try
			{
				arr[i] = WGE.deepClone(myObj[i]);
			}catch(e){}
		}
		return arr;
	}
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.deepClone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

WGE.extend = function(dst, src)
{
	for (var i in src)
	{
		try
		{
			dst[i] = src[i];
		} catch (e) {}
	}
	return dst;
};

WGE.Class = function()
{
	var c = function()
	{
    	//initialize 为所有类的初始化方法。
    	if(this.initialize && this.initialize.apply)
    		this.initialize.apply(this, arguments);
    };
    c.ancestors = WGE.clone(arguments);
    c.prototype = {};
    for (var i = 0; i < arguments.length; i++)
    {
    	var a = arguments[i]
    	if (a.prototype)
    	{
    		WGE.extend(c.prototype, a.prototype);
    	}
    	else
    	{
    		WGE.extend(c.prototype, a);
    	}
    }
    WGE.extend(c, c.prototype);
    return c;
};

WGE.rotateArray = function(arr)
{
	arr.push(arr.shift());
	return arr[arr.length - 1];
}

WGE.CE = function(name)
{
	return document.createElement(name);
}

WGE.ID = function(id)
{
	return document.getElementById(id);
}

WGE.LOG = function()
{
	console.log(arguments);
}

WGE.WARN = function()
{
	console.warn(arguments);
}

WGE.ERR = function()
{
	console.error(arguments);
}

if(!window.requestAnimationFrame)
{
	window.requestAnimationFrame = window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame ||
							window.oRequestAnimationFrame ||
							function(callback) {
								setTimeout(callback, 1000 / 60);
							};
}