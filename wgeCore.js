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
简介： WGE (Web Graphics Engine) 是一个web平台下的图形引擎。
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
	var wge = function()
	{
    	//initialize 为所有类的初始化方法。
    	if(this.initialize && this.initialize.apply)
    		this.initialize.apply(this, arguments);
    };
    wge.ancestors = WGE.clone(arguments);
    wge.prototype = {};
    for (var i = 0; i < arguments.length; i++)
    {
    	var a = arguments[i]
    	if (a.prototype)
    	{
    		WGE.extend(wge.prototype, a.prototype);
    	}
    	else
    	{
    		WGE.extend(wge.prototype, a);
    	}
    }
    WGE.extend(wge, wge.prototype);
    return wge;
};

WGE.rotateArray = function(arr)
{
	arr.push(arr.shift());
	return arr[arr.length - 1];
};

WGE.getContentByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.textContent || content.text || content.innerText || content.innerHTML;
};

WGE.getHTMLByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.innerHTML;
};

WGE.requestTextByURL = function(url, callback)
{
	var async = callback ? true : false;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('get', url, async);
	if(async)
	{
		xmlHttp.onreadystatechange = function()	{
			if(xmlHttp.readyState == 4)
			{
				callback(xmlHttp.responseText, xmlHttp);
			}		
		};
	}
	xmlHttp.send();
	return xmlHttp.responseText;
};

WGE.CE = function(name)
{
	return document.createElement(name);
};

WGE.ID = function(id)
{
	return document.getElementById(id);
};

if(!window.requestAnimationFrame)
{
	window.requestAnimationFrame = window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame ||
							window.oRequestAnimationFrame ||
							function(callback) {
								setTimeout(callback, 1000 / 60);
							};
};


//这函数没别的用, 就追踪一下使用情况@_@ 无视吧。 你在使用时可以删掉。
WGE.WYSAIDTrackingCode = function()
{
	try
	{
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-41296769-1', 'wysaid.org');
		ga('send', 'pageview');

		var baidu = WGE.CE('script');
		baidu.setAttribute("type", "text/javascript");
		baidu.src = "http://hm.baidu.com/h.js%3Fb1b964c80dff2a1af1bb8b1ee3e9a7d1";

		var tencent = WGE.CE('script');
		tencent.setAttribute("type", "text/javascript");
		tencent.src = "http://tajs.qq.com/stats?sId=23413950";

		var div = WGE.CE('div');
		div.setAttribute('style', 'display:none');
		
		div.appendChild(baidu);
		div.appendChild(tencent);
		document.body.appendChild(div);
	}catch(e)
	{
		console.log(e);
	};

	WGE.WYSAIDTrackingCode = null;
};

setTimeout(WGE.WYSAIDTrackingCode, 3000); //打开页面三秒之后再统计。