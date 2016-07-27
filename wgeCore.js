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
	VERSION : '1.0.1'

};

WGE.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

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

//特殊用法，将 WGE.ClassInitWithArr 作为第一个参数传递给一个 WGE.Class 构造时，
//initialize 将使用第二个参数(数组) 作为整个initialize 的参数。灵活性较强。
WGE.ClassInitWithArr = {};

WGE.Class = function()
{
	var wge = function(bInitWithArr, argArray)
	{
    	//initialize 为所有类的初始化方法。
    	if(this.initialize && this.initialize.apply)
    	{
    		if(bInitWithArr === WGE.ClassInitWithArr)
    			this.initialize.apply(this, argArray);	
    		else
    			this.initialize.apply(this, arguments);
    	}
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
	var content = document.getElementById(tagID);
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
//第三个参数为单张图片完成后的callback，传递三个参数，分别为当前完成的图片、当前已经完成的图片数、当前完成的图片在整个相对于image url数组的下标
WGE.loadImages = function(imageURLArr, finishCallback, eachCallback)
{
	var n = 0;
	var imgArr = [];

	var J = function(img) {
		++n;
		if(typeof eachCallback == 'function')
			eachCallback(img, n, img.wgeImageID);
		if(n >= imageURLArr.length && typeof finishCallback == 'function')
			finishCallback(imgArr);
		this.onload = null; //解除对imgArr, n 等的引用
	};

	var F = function() {
		var url = URL.createObjectURL(this.response);
		var img = new Image();
		imgArr[this.wgeImageID] = img;
		img.wgeImageID = this.wgeImageID;
		img.onload = function() {
			J.call(this, this, this.wgeImageID);
			URL.revokeObjectURL(url);
		};
		img.onerror = function() {
			this.src = WGE.Image404Data;
		};

		img.src = url;
		img.url = this.url;
		
	};

	//当加载失败时，确保引擎正常工作，并返回默认404图片.
	// var E = function() {
	// 	var img = new Image();
	// 	imgArr[this.wgeImageID] = img;
	// 	img.wgeImageID = this.wgeImageID;
	// 	img.onload = function() {			
	// 		J.call(this, this, this.wgeImageID);
	// 	};

	// 	img.onerror = function() {
	// 		this.src = WGE.Image404Data;
	// 	};

	// 	img.src = this.url;
	// };

	var E2 = function() {
		var img = new Image();
		imgArr[this.wgeImageID] = img;
		img.wgeImageID = this.wgeImageID;
		img.src = WGE.Image404Data;
		J.call(img, img, this.wgeImageID);
	};

	for (var i = 0; i < imageURLArr.length; i++)
	{
		var xhr = new XMLHttpRequest();
		xhr.wgeImageID = i;
		xhr.onload = F;
		xhr.onerror = E2;
		xhr.url = imageURLArr[i];
		xhr.open('GET', xhr.url, true);
		xhr.responseType = 'blob';
 	    xhr.send();
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
	addChild : function()
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

setTimeout(WGE.WYSAIDTrackingCode, 5000); //打开页面5秒之后再统计。

WGE.Image404Data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAABQCAYAAADFqguYAAAgAElEQVR4Xu2di5EkS1JFa0UAEUAEVgQQAUQAEUAEVgQQAUQAEUAEEAFEYO1An8d9sfHNyqru6fEyG+vprvje8Ai/6e7h+ZtHfQqBQqAQKAQKgUKgECgEbkXgN7e2Vo0VAoVAIVAIFAKFQCFQCDyKYJUQFAKFQCFQCBQChUAhcDMCRbBuBrSaKwQKgUKgECgECoFCoAhWyUAhUAgUAoVAIVAIFAI3I1AE69eA/tHj8fjzx+PxzzfjXM0VAoVAIVAIFAKFwE+EQBGs/1/sv3w8Hv/weDz+pgjWT7QDaqqFQCFQCBQChcALECiC9Xj82ePx+PsPy9XfPR6P370A52qyECgECoFCoBAoBH4iBH5mgvUnj8fjbx+Px19/rPc/fliv+BVrFsQLwlWfQqAQKAQKgUKgECgEjhD4GQkWxAlSJbECsH9/PB6//UCO7//p8Xj81cffjwCtwoVAIVAIFAKFQCFQCPxMBIvgdUgV1qn8/PcHufrPx+NBkPu/fViuKtC99kchUAgUAoVAIVAIXELgZyBYugFxCfY+BLXjHuRDkDuEq1yDl8SpKhUChUAhUAgUAoUACHxXgoWlSlfgbKX/9fF4/MVHASxbkDFdhSUhhUAhUAgUAoVAIVAIXELgOxIsLFXEUEGwVp8/fTwe6RqEbPF7fQqBQqAQKAQKgUKgELiMwHckWILxLx+pF0bgZEoGXIMQq0rRcFmUqmIhUAgUAoVAIVAIiMB3JlgErP/HR+B6u+LEWWG94ifB7xAsfq9PIVAIFAKFQCFQCBQCTyPwnQkW4BBTRRLR9pPWKyxdWK6Ix6pPIVAIFAKFQCFQCBQCTyPw3QkWcVikXWg/fxzWK0iYge5PA1oNFAKFQCFQCBQChUAhMCNYWH4gH1c/V147Q3C6eapw30GE+PxXuPROxkPAO27C/GTG9q9ovYIU4rbExTnDP1NJkLPrqwfns66s71f5IF8Qa5LM1qcQKAQKgUKgELgVgZUF66pSzNxSJwOGSEEs/JAyAQUI2YNAmK9qt80ewUKp4g6ExHwV6xVzJrVEz525O1fKJUbMsSUP9EFf4AjBePfHLPmjnGTvHA+Z+iGmxN/hIv7qBPWd2FRfhUAhUAgUAk8isCJYNH+qFCUw1D0hRj13nlYwiB7/UIonn7ZNlKjB7FhTICGnpO2k/52yz1oKd/rIMlcsi6d9zMpD8LAc7qTRuLPfbAtCBQ4QbMZxKlevGle1WwgUAoVAIfBNENghWEx1J7cUFhEUlcHiKFH/tgNXLyDdRKDeCNRluNMeZVoLnOSC+RCbddrebr875bCgQfLSYtfW0w3YSx+hNerE6pW3J1kf1uszLFnMM93BPbxOrKBiAVlqX4XUti3JRgbAACvpZ2GwIydVphAoBAqBQuAHRGCXYDk14plWr5zRQgE5OnnlDISnZ9UwIJ3vUbonMTMtadPlaGzTZ+W9mlmtUPaMi3+6DiFj/MsPljew4OfotmSPsNHuV3GPzkjWCcHKeSKfuP1avCyjhdV3Ttbt0R/w4KohFwKFQCHw1RE4JVgzYqDb5Yq1iTrEX/U+xspcIUWpwCEjvgYHovhZWdtR/lhceh+UvVYlsYZA9ZKgggckAkIBGeEzs4il9eqrkIsZFhIssKLc7JOxZ5LmXqJZLziAXeL21fdpja8QKAQKgULgB0PglGDNgt6TwJxam2btStywbqFoT94VmEHzugc/03qzIleQPi2AECJIxir4GlwgYwRsswa9tBSIpfOHsIDBV4g72iVYYLKyNnr7EvLEXMEDLNLianJZ/l6uwR/ssKrhFgKFQCHwIyFwSrBm2dGZt+48FL6urh08ZpaxJG4n6RraAPe8kXgytp3x75SZufGco+SK37VK7bRNGYgT84JQtHFZGdz/mda7di53Eqxsm/mDJSQLSxYfrVcnFy92sa9yhUAhUAgUAoXArxA4JVhUnsXNpJUIhb9rJZnFdtGn5Ii+UZr8W32S0Fwlaas+dr+fWeggRcwPEqQr7JRcOQ7IFe20eKa7DeJ5tf3d+e6WexXBon/mCR5a7Lw9CuGq1yLtrlCVKwQKgUKgELiEwBWCNbPEQHwkVbvWplG29ZxQurdQmjvB80kEdTN+hnsQS0rrqurNzXci3uG6yjX6qtYrMHglwRLjXHP682LApQ1TlQqBQqAQKAQKgR0ErhCsGSHK7Ou71qadG3ASN8nKjgUi468+0z04m1/ihWUFN9aOdW61tnlp4Ktar95FsOgHUg7WpmVY4VffFwKFQCFQCBQCTyFwhWDRYZtxPQeRqRBQ9Ctr0yofEm0nEdkJoE8SmHVxnd1hIdoFfRWzli5VrCs7xHG3b3Cif9qUmH7WzcnRmN9hwbJvg+BXwfK7+Fa5QqAQKAQKgUJgiMBVgjULSs9knpCn1a2/JGuQoVHiTfMX7QTQp9VI69eVW4jPis7KOgf5wYW3M6fTsWQw91dNS/BOgnWKX5UvBAqBQqAQKAQuI3CVYJ2kayAma5RqINuhDGRo9IJj46h2XpuTVrFn8mhdBvaj4ix4vw28v/vFw8QekVfrq1qvgOhugoUrEPlAVvh5h7v1WRmo+oVAIVAIFAI/IQJXCdYsMSgw7qZrSEsYShHSATnqfdpEoTN3WlrFnskE/4xIrIL3M78XsUG+tidfS5SJR6+OBaJBm1/RNXY3wcItCqlirpDbO12uV/GveoVAIVAIFAI/IQJXCRZQjV5tw3dajVbWpmzDOrP4LsnSLIA+iU3ml0LhvvPdgyv3oPMljQA4YcHi01q9JGLfUTzvJFjirYu6CNZ3lJiaUyFQCBQCPwgCzxCsGYHI1+ZAonqWhNYKJnnqveJEONPdNwqgb61iKFwIDC6zd+Z/WgXvZ/wV83OcrQXPF17/ICJ1NMy7CFaS6iJYR0tQhQuBQqAQKARegcAzBOskXQPpB9qX6uY75tp4pFGg+07AelrFMj0DfbwzJmeVPFXsIVSMDVLaI61XX3r8Cnm5u807CFabZ6wI1t2rVO0VAoVAIVAIHCPwDMGis2fSNfQSgULa+Hu+Py4n1aZrwK3G3/ykVSzL7iY9PQZwUGEVo5bJP7HYQfwgoUmwJAp3jekrtnMHwWothUWwvuJK15gKgUKgEPjJEHiWYO28NmeUHqGXCBSCATnBnUe93ietUhAViImfvJW4Y+161XKvAtzbgH1fTsy8fXfeq8aW7b7bOuYtP9f5FXMsgvUKVKvNQqAQKAQKgSMEniVYu6/NaRN8jhKBms2c70fpGlSgvQD6JHyWU5mvEp4eAbcovCJKGVcFNhAdXair2K27xmleMfChb0jfKz+z1B539lsE6040q61CoBAoBAqBSwg8S7BWrrBM15DWpl4iUNuiDgRllK5BcmKW9LwZ2LOK0U4vBuwSYJuVniFYdOHNQtq5+4PrlMsC4Mg6eIMxXa139/kucsW4vxvB2rFo+gJv37Xo+vF3iDRtjAg0Zbhw4auErq49+zGTCu+Mu9cXcsl+vUMeGRN7yY+xnaYt4afhCPxs31N5OgcTJd8xB9aStREHxj7LKZhYno6buvTj/Fvsd9pjfIy3jbVt15hytO+t6Z22aSPltCc3rHMbu0sdzgPW1gfJ3jr3xqjctMmvmR+6jPWhv3Y+s/2zO9deG1f2F3NlT/IQP9r/q/G/aw+dnkOnc7sT++0z8lmCRUdX0jVknbRIsQk8pHfSNQAa9RGeXnoGxvcZ1/UzgH+kRDItQ1qwfKWLiVe3F/Oj4P9MKniwgde7yFW+LohAfg4oD+GdGKzV/L97DBYyrqyMsKAMcoNbPG/KIgusdSq0tg3K+NCy09doDLSTcYNX2vIwZ/8gK+n+X8lB+70Kt0fWOJy5bezlEur6UJcJf6/Mgbbo2zlcvVjDuZWvtjrZr1fHDQaMmzHnuHfa86FypVMsp6zstA2myJdhH7nWejt6D9HIk2+0oA4y1VvnbI/vTVbcS5Ct54R9xr5q57MiWKu9fOf+Yu7IOjiM+nX8vXCRd+6hXN8dmTidW6ZCOj1L2rNtu/5qM+w0NHttTqZrMA9Va/UavYh55irrZWdPq9hJ1vedOZ6WeYZg+bSG4N8dq2RqiJPD+nTubXn60sLSPhnfQbC++y1CD5veg4wKAFx9WucnhwkHpulJfADJtaEOSo414MP/kTnfpjC6aNKTB84Rib372YcfLTErOdJNjaJkTb38cSW1itYH5sL/M6bTfsQEHBhjWvq8PHM6B9ryAYK+tRyezsHLPqyJlnza0ELZXu5psT0dN3LEuBkzP+1HgrtqL5NEUwe8e/IjoXVOzIPzYSZzxqsqX579npPIuClulHfkx3VWBhgXe4iykusWR5My9+RGjLVgMUdwY+7gw9oj+6O3llBfmfbVZas94fej/TXDjXEyV+bs2rrXaZfxSkodv5ZsHxL4ecceOl1fSf4IpytzM4vAHdjvrtvjDoK1+9ocN6mZyhlk3qZrX+K8k2crA+h7SUtf8Y6/HXBXLsI2yD0tWDvtz8rMLFisN2Njo73rpdftK2skjaMYO+fmE9WKrHoDUxPwd3QRZoyc83TvpKU3SRUHP4coe8APB6qHl0opv9eyaMqQdFEjs/SJ8vIna8snFYCyjYzpivNhwXFQJmMiKce4vNjCPOjDM+PkLQSSKeaCIme81KcP2qddyrTuJAmWSgVFPpvDap86xytzcI+kewZMWCv+RtszkvXMuOmHPcV5qhXRdUaeDF/IfQqu6YoFOy09ltPT4Jp4/rNOyknbNu3wHeulLDIG8yoyT8ZLm3xPH4xFGWUM7TpLsHKd+T/laI/xuCcki7pqkR2tVtShrATL32cWKvfu3furxU3MwYk+lRk9F77tQnly32khfNUe2l1fxjGSiatzu/NsW+39X76/g2ClC6jXcVpNFGSVa8/CZRuzm3ht3iz9zNb9rNfj2P+KYLVpGnSdbS/cpOAOwQL/q6bqq2PU0smh5ZPfjgVLM/VKydr+dyNY7hkVtYeUbr0kWEkSjAPKWEaVC/vFgzfXE4XGR/cWZSRT7LkkXKyjyi8JFvW9QKHSYu1Q2Klsk9gpD/l0qXWDPm1vR/YYM0qXn4wvSeeof8esAuR3z8bRHJhT3nRG8fIvlbrxP+CpZW9nDr6pQjcIdbTsSXb4fWYZG427jZEy9iqt5eCt6y1dpsYxuZZa7ByTc0NWGFuWo52UAcuCcztWsUwLXuJGW7rxwErrbRIxyieZGq2968zcMraKvZD459wgAHzXEqyUm946M0/dsBKzV+wv48bahyyttsgi4+/F+ILHq/fQzvoyVvRDe3Y8MzfW9K6zbWcf32LBoqOTdA0ImebjdPWxSTzgHfxOni3Nnj5B5etxRlnkt8B5ohDzwyU6+iAkBueDncrwiS5/qfoVCZZuq/Ym550ECwC+87sItQhwuJucVqLkQYlMsWc8SHm4STmUgLHPepdIJDIcvqyV8Vlg2zuMVWAjgkU9FBeHJG1pAcgzIGU+3TeUZR4qsp0HAskNP6nPmdBiQH+6xNLqkuS0VZS9ORjb0u5Z9rLuI75j7lpGduZAHdaQNULR0Z5WGBU7ZfIMGZ0b7bgt13Pfad1Md6H9O+5sT6KmxagdgzJhubQMZdkkOMrJqg7kTWuk1k/2QkvgkB/aSmt5S7rsnzVi7qP2tEjSr2uvdbRHzGdn+av2lw8lBt8bGN/qona/5liRO+q9cg+t1tdzKOXtjrkx7zuxX+rrOyxYHqL5RJodZ2BiS5jy3YIZcGr9WXxXBse3T+lsVATEJ5slEC8oMCOHdLf7QuzToX1FgjWaw90Eyzxb3/Flz1qKIQzIFgqRPQBJcO9JEvi7VspM3Ks1Z6TsegebsVl3EKy0evVkgrPCmBrGL8mg7I4VC3miD5/AmXtLnMCPtn1Cdhy7BIsxaonozUGCJWHJdnesWIY9SKaor4u1Jcar9lJB7WKvWwycPEt6crHCYYdgpSU/x6p1cCSnWsgyPrFdP2RdV2HPiuvaqQMlScYcIfdJnPTEUA85M64oXYQtMd8hvnfuL+RB+VFW+GkcbM55pCdY/1fvodX69uTtjrmx1ilnz2K/1M13EayZOy+ftFKhtm6+NEU78Fl8l8RtFDQ/eyH0EpgbCsxuV6bC0DTfWneuDuFnJliJ2WfcHr26Zrv1mJMHp+Z/6ubrlvh/ypLWQ4PatThkXI1Byj5ZeghB5NiXrTuB9iVDfLdrwdJEn2TN9C3sY2/Qao1IpWk4wQyrtEIYZN4jThJxyKnWnF2Cla7LGcFyndJisjMHzwNTSBjPBGatMvchc0eR97DPehJDx51rqjuyZ1HItfRMlvhwFolXS5ZYd/oyfUC2rQurrSN+nu3Uoaz9JCHiAVZLTK7zyIJl3XwISTd66kotpYzdCxktYZvJ6av2F1jrbnW9GYeW4BHBAmfKe+FDS96r9tBqfR1nK2/Pzo1278R+eW7fRbDoaMedN3o9jkHX7YBb8pTfS9yyTJK5d78epx37zPpG2bTAsWFb9+hy8QYFimD9HzAc/G28yVVMv0o9iRTKV+sVhyDEi7mqkCRAxpXoZjNlg9bdlMOco4cQ/Rns3brTdL3ohkm5S2tTtpUByfaXt8K0thlTqXuNssaczdZCl5YpTnqKN11CKmDa3CFYjK83B/eyCsCcPjxkQU4MY9iZg3n7nEummZCASmp6aQtG67gaN+vEP/Dx4cQ19Vx1LZlX656mX9eytSwZBpFejlz3VHzKnLKedVqPB/W0Vht31xId46h8oJi5CFk/z2Hq6Y53v2Uc6Ejf7ejUV+wvZd15Mnb2JmvFnNJ92j4QZYqGd+whSXxL/FzfEcF6dm49OWu9KGk9W51tS72wIwzLRj4K7KRrmL0eZ2TBmVmCAINDx03ogZO3C3fHf3e5mfWNvtICh1BnksZnxlIE6xn0vnZdTf260yE9KGD2lTfldIvoJqQs8qVZvrWCpOujPdhsv73JKaEYKZkewRq1peXaywxep25jKxnb6rzSCuHTuNfyezEy3jBu3autgs5D2TmwDqn4nQN/N4A3iVWS09UcwFQypJL0oG/HvMJERe5N3tm4DbaW1EpcxAM5MbB8tpaQSAlWlkMuE7MWB8e6U0cSQF9gk6S0XT/jr+x7ZsGiPdMXaLWV4HrzlDXhnzomLzqs1uOV+0uC5UOAOsbUE1qyHePogehde8j9viMTd82tt5efOduW2mK12ZcNRIFVuob0aaelyevACG3vsyJumvup68F/t9vtBIcsO7PqtRhwSLd5oq70WwTrCmo/Rh1TbBhfwuGg5UUXj5YtFSVkQ6XNXsq4plGgtMrOZJcGaYuS+bJ8Qm7R6xEsDm6tYe3VedrxCrkuSd0T2fbqvFI5qCgzv9VK8e5YsIztAkddWzk+SArf6Rbz9905+LBI26ytfbCWtKX7NwnjLDbNdVyNW0sN/WSAfksiGZ8E3bXs4cB8e+V2lKkyJ8a9OrnOppRIuU6io9t4RbAkYmJmHJIpGujHCwcSVv5G+3mLciWjqeTv3F9prXVtOAu8GZnW4JlL/9V7aGd9WyJ619zuxn6pNXaEYdnIR4GZO48iBn3KrL2twOHfmgazz1nKAzZ33uZJE7JxJbvjf0W5lZtQM7mHyYhknoytCNYJWj9eWdYXawIyw8GO5ZM9IkHRLeptKAkL+68lWCOXVRscTT+pSHVF2ncqQRDtESzG7eWTNkO7D0mOnb7SjUmbGRA9WjWVA2eR+YpGxElrU5K9EQFIPJhDkh/HYgyZOXyMUUsLx2oOKnlJDv2Y94nvJNRtyot0XSU2O+OmvGMEf9YCzOgjbxvqLfCm32gts3/wHAU0jyxYyIkB+W0MVgakGyfETy8z9SyVYOBaMDbjjFrCzVwNXpeUuZZJoEwpYooSY7bEEJxWn1ftL2Xd/aXF0X3PvJDTHYL1yj20Wt8ZwXpmbkmwlLNnzrbVOi9N7ssGmgKrwG6LZ/yRgYqzvlY38qhr0Ly3rfIdhafzuKv8Kl2DCo4DlYU+zfjcG2cRrP7q+dR519p+VjsoEQ5+XTrIkIeEeZh88KAM/9hjuuDz1uEo6DrdNczTA9E+bYP+ONRbMkRfbfCybjJvn6WCZJ/QFv3q9mGeSU52AsS1kplUVFdOT/HOLuYw5yQAPTxUQPTlXFTe7GNjmlJOVrmrsFD5YJgPlpxlPkjqgjMOKy8LtTLZjtsHOMaZ45akKDco4vbWaN7AMhGlbmnq82mxcE19uN6xYNGG8pqymmuiC9JcXTyotg/imf6hfQBInHKdKce6Ir9ixM9MzaC1lTYYH2PtXdCanQ+v2F9eigAbSXniz3gkvKzXzEUInq/aQzvr2xKsu+aWBMvz6JmzbakD7rRgOfiZMDugfD0Of1vdoJvl2bJND2DzBd0VNL4EcVFgloqAqj7tQ07vcBMWwfrDBZHoauFUOT67tp9RXyUgcWIvMT+tPxkInxYun/xSHke30DKYmTka0Ox8PfD4fabg80DT6tK2RRnGnkrYbOK4E7QwrVIS0I6KV3ImNkmwvAwwWjuTVbYES5eRe7bnzlfOJFKMP61AvXi3HEfefG0xTmXOGPOcHXkAWMedcTsG+8gx5xqny5Eyq7dBGPPVs3SOLFjK56xOBtFDfrQa9Yg04589+Oc4kDXKeuO2vSTj2PIGpJa+1Wtycp1fsb9oP0lmXjhgXmCka5+yM4KlJQxs79xDuimRsxOZuGtuO+fRydm2PP/vJlirp0IG1MYecZiO/PjJZFfELd1t9DEymy9BubkAC8YmbONO7EYFZdDfs+MugvWHCyhBV0Z0xTyL9c2istUcpEm3B3sCkpQ3zVAyWhSQqd73WidG8TsqZgmOCUxHA5ydI9kW9c3j1bbFPmCsrBXj5wBWQa8sP7bVKl7aaK/Rr27y2WferFIhaknv4SEplNwxT2PmGF+218MxrTG97w3G7ZGJ9kZenpvIOOMW+16CWd2bo/XNfWPwO+daL4mrbSATEhItIjsWLEmpcYajGCzdmODGevBzRLCUgTYgnbG2sms71EEmzQvlvCRryqTrspKrlmBR/6795TmWBMtLVIapsAbGJu4QLOd59x7aWd9WfluCdXVuEqy7sF8e2HcTLDpcufO0NCnIO668HeL22a/HmYHtoT0qoyXBYFQV5HIBOwWKYP0alLx8kTc3vWp+x8WCK+t0tY5WEnNFtYqb9ZesIE+tlSrlY2b5YJ+qjDmcZ3KlW69niZac7LSlawbFzNnkvl9ZflqCpVKhjdZ1tFKEuVfF1jkYwzLCQ1eR+cqQLS0iPkR6w7Fdf/rwBttINszwzhxyPVau3tW4Z7KY5FYcvGFnDqpe/cRe9+IOwdK1imy252bGYIE189LKMnIROra8bZ7jpR0fbv07+No2f/OBXSuwJJrxZBjI7MJBS7Du3l8tCeF3dSvySH/5QLmyYL1qD+2s74pgXZ2bBOsu7Jdn+CsI1sqdl09DCP2uK681t+fkVJwIO/3fkfLA7MkZ68DCXA1E38HFvCC7mPQW+FUE6248GPvdmdx7eLRyI6n4ka1Y3go0VkVXRl40YZ6+QL33/egGYR5CiVFPrpK88X3PSqNSXrVFv5If2vJsMjh+FUZAfXMoQapREFqRei5CSaEyg5L1SrsuMsezOwfPoXauidMoFMAbgj5ctTFQng3eZmNOlhkFz++Oe6QoWuJme8bcMa/RedOSoRFZapWp54w3MWcWLNdM99coyD3n59pmvKuWT8rxf9aduUsG9D4Yc0g5X8OW8Uy7ltbddTnZXz2C5X4EJ+ade2hEsF69h3bWd4dgXZnb3WfbpxCsNq9EO4jV63FGg57dyPMgQHANUlxOflJgNgcXNpOe7fa1ugSgu5R5XCVZryBYr8Lj1QSr134eWl4ZfsZiuLv2d5bTjcaBb46k9oBV6WTMUT7lzyw5KgAVeGsx8UndcvSN3KmA0uW/25YWBm89qgyU5x0rlspBRTlSvCgbb1a5Lj3Le0uwRnhoMWSuKm5vcDH+VlFSvo231KLKeHoWe8tzvjGulrDM8pmNxt2TSeUJstDuC9eS8dGmNwqzHcam265VaDsWrJ06rjNY8P8ZwdKN7hjdA0mGkmAZWA+eyDN98DdJiiQ610sZXd0S7ZFJHyx6hOdkf/UIViai5SxMUrkiWK/aQzvru0Owrswt+77jbFue6a+wYK3SNUiwfA3HKv7KSazybGG18hUKV61M9OUtxFHMFGU8zEzqtutmmsUCOE/Gzua/eqvwboL1SjxeSbBGFsO8YWOw8B0Wz+Vmu7EAB6/yocKl+STCKHWUXX6fSnkU4J6HEIrS+jsKgLpt0HsSLG81jg53laHJJiVu/NyxDlBfYmC/7XmUt8tGLhOXqiVYBsC2hDPLUdcUBuby0iIymo+B9XnT00SrjiVvXns7MtM1zKyHo3HT9okOSIXPmFscbC8Ji+V2LVg7ChhswBh5UlbaG9vOqyVYvT2Q46V/HrzAuLWael7Rdra743bP7Z9E9a791SNYrI8u6Vy7lEP+n67NV++hnfXdIVhX5nb32bY80k8217KxKDCz1LDgbAzKnPS/Q9y8QbXjThjNpz0IeuUyoakH6gk+ad4f1fMAaXMGrfqZESyIoddkd/K1KJCrCwZX8ZjhkCZg1n43IN0g8F5Aq9ilsnZuz8jMak3u/t6ncONcdAGm7Kr0VXCMIa3As6DrlSLVmoIs+TAzIk1JsBxnryzjZJ1pzzGnxW3m0hTfvCjC+vvwlufRMwSLfmw355AESwu65Zh/WhmznmNBcSOTmdqi3XPusVzPdH/3CGiuY2/czxCsWXtJWBKHXQvWipTlOueN4MQDbPmOPtNy0z54cSaakFY50oLY2yPe9OzJaEtWZjomA9N7FmLTROzurx7Bct6mIqCMVsnRfn3HHlqt7w7BujK3JFji9Qz2y3P9hOAsG/soAHgI8ezWXGYB3lVsq1fPIES05fu/dhVyO8Ziuc0AAAfhSURBVK8dguVhtrr5M8Ns5vLMeuni2ZnTjGCxuXwNx+614lfgoWm/jTPJee8QLF0V1EPZm9tkR1bz5pW5pU7J7E4/ryrDOrdBtak8eoQkCe0sIDfdCSqwVF7sM2M6tN7uuBzEIgmPljbWrs0Dt+MGS3y1ELfutzw7DKRvSXuOv7Xute4V+sw5JJllzKOHl14gNjJM+2lF7bnkexbHxKe33ukyFac2JvFEB+y218OrnVPbb6/tUR1vZuvGS4WcD0w+AEjsWyuXBLO1YKl8zUvmLV3w5pPncGuF3wl0f9X+ao0QeIvoqxduMtqvr9pDJ+vremadO+ZGu3divzzbTzbXsrEPt0XvGnBb1zwiPrmtFNsJGeGQ9gWXbqydsfc26aieh13GjZz0YVkOXDBo885caWu3Dtibc2iVx4Y2dwjWCR7MlQPtnXMeYWNuJQ8Vlf0ulp9ZDhnn6TYP+9Yi2MbltE/47fh1PbbtUg5ZZ2+zblha2vQq7YFNeZO7tg8GBifbf7rQ/Btr0ssmvtrT7Cezbef8MmmlD2P5/cgFOpoDf/d2XiY59iXzvbi+di/pSkQBZqhEG0rQi21LJWQ8aN56HI175arryfRMLtr2DMJvz/T2oSotiaOxjuowRmQRXFpSjq5grdubf9bJrOyuW49gUZ7+Deg311zKco+wzfK1vWN/5XqA8SiMZUSwJCHv2EOnMvHM3O7EfnUG/bKH7iRYuyTIztOaMsuEu7p91x4ImU/nNMOumyoTHPYOHBVX73bGFaXL4tvWlfqndcAeIeGAWLkKT2KwVnisrJun83i2PDgwfzNxexjtxgU+2/8z9SXmuX55aJosMRXdKhh3pGh2xtke2DNLzk57vfi8HeuA1g3I8urBbUWwdvFg7lpEIYXsrdYy3yOMqyStnqmzV4kxBy10xhca+L3COcc9K3uCw84a0a9E5KTttDr3gtVnc+jJk5ej2jGk23HUZi+eduXG3p1rr8+T/SU2yKBnW/uQMyNYn72HZjhdndud2L+VYO24e0ZCqhLgIGldVqZcmMXSjNo9tdK07ezcmqMORIwnqG3AFydeurxQUCM36+rg3PkejDjge0+Br8Bjdbt0Z8yvKNOSLA5iDqavTrLE04ek1oTugaqi37lBeOchdJVgecMvLQ2u++4DoU+6ECxjGVvZAQ/2mzj1FM4uHtSV3NC3sU+6972ani5x997sAcd5rOada7vTrljkuGcXdU5w2CVYV8ggdVJPSEC1gPbOYb0MvXAEH5RzfklWteS21kgvx7S6aXURYxfHuwgW7YAXOLVyNiNY1PusPcR425i4xCNl/WRud2K/re9XG/cVCq3XpoHJd9/m0ix4pd32UOTgyjxYLJjWsnfh9Ip+vBiwiu/6GfDQyrDjOn3FWpy0aSCum52xe+CbgZqDVaKY349uEGYeoZOxUDYVmDmMTtvIMbZ181r2TrtpsZB0WC9fhyF+7fj5+y4e1vXmGQ9eq483AWcpQvL236y9FrddBZDjnqWFOcGhxbo3bvvdHWfKl/FutpuxcKYt6a1zO47M8ZXz8+Zslvf2K39L2WnbXKUS2cVxhhnfrfZXykN6K1qi4u8jUvwZe2glE1fndif2qzH+gvNXIVgy5pPEo6sDzO8zi/FuHcfDz7wBxO/mRDGO7KTNVVmtVhwUvtB3VeeO73eCvA3wfCced8ztpI1R/M5JG+8sO0pz4RVm1rVnAR7dIFxdJNmdGwe2lu3dOqtyO+8ibNuYpQGZ9afCuYJHL2t5ry9jh9p0DCscdr6HLO3EwmZbM3yv4LAzTspcGWsSgp6rbtV3m4eMPcJeecZjMEt74njuwvF0f0H8Zq9rW114Obk81JK2K3M+kYnduV0ZR0+Odiy0LyFYO8HQK8Hn+1ZQT2O7Rn3sbIC2Lk9aLEwKGMoLU/AzubZmOPCEpEXvmQ2/g3VbZqXE7sBD//6757aDx26iwJ223lFmpFzy0kFPcbziQM352v5VgpNt9WLJTrDVZXcib4nP6RwyeHuU3iRjr3bbN+nlztwZw267rUIctX/a3s44KQPW7Rm7qtuT3109wbkNuW1doj0FnOk3ZiEbJ7rlDhxP99eK9K9Iw7v30IlMnMztTuxXMvq/338lC9bWgKtQIVAI/AqB3tN3Hvi92LfZvr9iEWiXxAP7mbYguybdfTbTPuMAB+OuJFvGSJnYV2vSMxaSxJb+7Jc+nRPuKRX8Lkas6W5cpjmgRhbMK0/mu+OkbeYn5qvt6kWkO8ZqqhbX2b5ZZ0gt8jSLrWz3Slp6TclD266lsV8n8nmC4wi70/2lTI7yU64IFuN45x46kYmTud2J/Uqui2BtIVSFCoFCoBAoBAqBQqAQOESgLFiHgFXxQqAQKAQKgUKgECgEVggUwVohVN8XAoVAIVAIFAKFQCFwiEARrEPAqnghUAgUAoVAIVAIFAIrBIpgrRCq7wuBQqAQKAQKgUKgEDhEoAjWIWBVvBAoBAqBQqAQKAQKgRUCRbBWCNX3hUAhUAgUAoVAIVAIHCJQBOsQsCpeCBQChUAhUAgUAoXACoEiWCuE6vtCoBAoBAqBQqAQKAQOESiCdQhYFS8ECoFCoBAoBAqBQmCFQBGsFUL1fSFQCBQChUAhUAgUAocIFME6BKyKFwKFQCFQCBQChUAhsEKgCNYKofq+ECgECoFCoBAoBAqBQwR+D5O5nSOScT9jAAAAAElFTkSuQmCC"

WGE.Image404 = null;

WGE.gen404Image = function()
{
	var img = new Image;
	img.src = WGE.Image404Data;

	WGE.Image404 = img;

	var lam = function () {
	    var c2 = WGE.CE('canvas');
	    c2.width = 1024;
	    c2.height = 768;
	    var ctx = c2.getContext('2d');
	    ctx.fillStyle = "#72BCAB";
	    ctx.fillRect(0, 0, c2.width, c2.height);
	    ctx.drawImage(img, 0, 0, img.width, img.height, 512 - img.width / 2, 384 - img.height / 2, img.width, img.height);
	    WGE.Image404Data = c2.toDataURL();

	};

	if(img.complete)
	{
	    lam();
	}
	else
	{
	    img.onload = lam;
	}
}

WGE.gen404Image();