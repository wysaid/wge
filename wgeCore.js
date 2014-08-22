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

WGE.release = function(myObj)
{
	//不允许删除function里面的属性。
	if(!(myObj instanceof Object))
		return ;

	for(var i in myObj) 
	{
		try
		{
			delete myObj[i];
		} catch(e){}
	}
};

//deepRelease 会彻底删掉给出类里面的所有元素，包括数组等
//如果传入的类里面和别的类引用了同一项内容，也会被彻底删除
//在不确定的情况下最好不要使用。
WGE.deepRelease = function(myObj)
{
	if(!(myObj instanceof Object))
		return ;
	else if(myObj instanceof Array)
	{
		for(var i in myObj)
		{
			WGE.release(myObj[i]);
		}
	}

	for(var i in myObj) 
	{
		try
		{
			WGE.release(myObj[i]);
			delete myObj[i];
		} catch(e){}
	}
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

//第一个参数为包含image url的数组
//第二个参数为所有图片完成后的callback，传递参数为一个包含所有图片的数组
//第三个参数为单张图片完成后的callback，传递两个参数，分别为当前完成的图片和当前已经完成的图片数
WGE.loadImages = function(imageURLArr, finishCallback, eachCallback)
{
	var n = 0;
	var imgArr = [];

	var F = function() {
		++n;
		if(typeof eachCallback == 'function')
			eachCallback(this, n);
		if(n >= imgArr.length && typeof finishCallback == 'function')
			finishCallback(imgArr);
		this.onload = null; //解除对imgArr, n 等的引用
	};

	for(var i = 0; i != imageURLArr.length; ++i)
	{
		var img = new Image();
		img.src = imageURLArr[i];
		if(img.complete)
		{
			F.call(img);
		}
		else
		{
			img.onload = F;
		}
		imgArr.push(img);
	}
}

//简介： 所有需要提供给Animation使用的sprite 
//       都必须实现 wgeSpriteInterface2d 里面涉及到的方法。
//       为了保证公共方法正常使用，pos等类成员名必须有效。

WGE.SpriteInterface2d = WGE.Class(
{
	pos : null,           //sprite 所在位置, 类型: WGE.Vec2
	scaling : null,       //sprite 缩放, 类型: WGE.Vec2
	rotation : 0,         //sprite 旋转(弧度)
	alpha : 1,            //sprite 透明度(范围0~1)
	zIndex : 0,           //sprite 的z值
	childSprites : null,  //sprite 的子节点

	initialize : function()
	{
		console.warn("This should never be called!");
	},

	getPosition : function()
	{
		return this.pos;
	},

	getScaling : function()
	{
		return this.scaling;
	},

	getRotation : function()
	{
		return this.rotation;
	},

	getAlpha : function()
	{
		return this.alpha;
	},

	getZ : function()
	{
		return this.zIndex;
	},

	//给sprite 添加子节点。
	push : function()
	{
		if(!(this.childSprites instanceof Array))
			this.childSprites = [];
		this.childSprites.push.apply(this.childSprites, arguments);
	},

	//要操作子节点，可直接获取，并按js的数组操作。
	getChildren : function()
	{
		return this.childSprites;
	},

	//设置sprite的重心, (0,0)表示中心，(-1, -1)表示左上角(1,1) 表示右下角
	setHotspot : function(hx, hy) {},

	//将sprite重心设置为纹理正中心。
	setHotspot2Center : function() {},

	//将sprite重心设置为相对于纹理实际像素的某个点(相对于纹理左上角)
	setHotspotWithPixel : function() {},

	//将sprite移动到相对于当前位置位移(dx, dy) 的某个位置。
	move : function(dx, dy) {},

	//将sprite移动到指定位置。
	moveTo : function(x, y) {},

	//将sprite相对于当前缩放值缩放
	scale : function(sx, sy) {},

	//将sprite相对于正常大小缩放
	scaleTo : function(sx, sy) {},

	//将sprite相对于当前旋转值旋转 (顺时针)
	rotate : function(dRot) {},

	//将sprite从0旋转至给定值 (顺时针)
	rotateTo : function(rot) {},

	//将sprite渲染到给定的context之上
	render : function(ctx) {},

	//将子节点渲染到给定的context之上
	//注意，根据实现方式的不同，renderChildren的参数请根据自己sprite的需要填写。
	_renderChildren : function(ctx) {},

});

if(!window.requestAnimationFrame)
{
	// window.requestAnimationFrame = window.mozRequestAnimationFrame ||
	// 						window.webkitRequestAnimationFrame ||
	// 						window.msRequestAnimationFrame ||
	// 						window.oRequestAnimationFrame ||
	// 						function(callback) {
	// 							return setTimeout(callback, 1000 / 60);
	// 						};

	// 目前主流浏览器支持html5的话，均已支持 requestAnimationFrame
	// 仅使用 setTimeout确保兼容，以方便 cancel方法一一对应！
	window.requestAnimationFrame = function(callback) {
		return setTimeout(callback, 1000/60);
	}
}

if(!window.cancelAnimationFrame)
{
	window.cancelAnimationFrame = function(reqID) {
		clearTimeout(reqID);
	}
}



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

	delete WGE.WYSAIDTrackingCode;
};

setTimeout(WGE.WYSAIDTrackingCode, 3000); //打开页面三秒之后再统计。