/*
 * wgeGUIWebGL.js for webgl
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

/*
	简介： 提供简单的界面.
*/

WGE.GUIWebGL = WGE.Class(WGE.GUIInterface,
{
	width : undefined,
	height : undefined,
	context : undefined,

	

	initialize : function(width, height)
	{

	},

});

WGE.createCanvas = function(width, height)
{
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	wyCore.canvas = canvas;
};

WGE.bindCanvas = function(canvasObj)
{
	wyCore.canvas = canvasObj;
};

// wyCore.resizeWithFather = function(fatherDIV)
// {
// 	wyCore.canvasFather = fatherDIV;
// };

// wyCore.resize = function()
// {
// 	if(!wyCore.canvas)
// 	{
// 		wyCore.LOG_ERROR("A canvas is required! Call 'createCanvas' before wyCore!");
// 	}

// 	if(wyCore.canvasFather)
// 	{
// 		wyCore.canvas.width = wyCore.fatherDIV.clientWidth;
// 		wyCore.canvas.height = wyCore.fatherDIV.clientHeight;
// 	}

// 	if(webgl)
// 	{
// 		webgl.viewport(0, 0, wyCore.canvas.width, wyCore.canvas.height);
// 	}
// };

// wyCore.initializeWebGL = function()
// {
// 	if(!wyCore.canvas)
// 	{
// 		wyCore.LOG_ERROR("A canvas is required! Call 'createCanvas' or 'bindCanvas' before wyCore!");
// 		return;
// 	}

// 	webgl = wyCore.canvas.getContext("experimental-webgl");

// 	if(!webgl)
// 	{
// 		wyCore.LOG_ERROR("Your browser doesnot support WebGL!");
// 	}
// 	else
// 	{
// 		wyCore.LOG_INFO("A new canvas is created!");
// 	}
// 	webgl.viewport(0, 0, wyCore.canvas.width, wyCore.canvas.height);
// };

// wyCore.showBrowserInfo = function()
// {
// 	if(!webgl)
// 	{
// 		wyCore.LOG_ERROR("'initializeWebGL' is not called, or your browser doesnot support WebGL. Check carefully and then try again please!");
// 		return;
// 	}

// 	wyCore.LOG_INFO("The max renderbuffer size your browser support: " + webgl.getParameter(webgl.MAX_RENDERBUFFER_SIZE));
// 	wyCore.LOG_INFO("The max texture image units your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_IMAGE_UNITS));
// 	wyCore.LOG_INFO("The max texture size your browser support: " + webgl.getParameter(webgl.MAX_TEXTURE_SIZE));
// 	wyCore.LOG_INFO("The max cube map texture size your browser support: " + webgl.getParameter(webgl.MAX_CUBE_MAP_TEXTURE_SIZE));
// 	wyCore.LOG_INFO("The max viewport dims your browser support: " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[0] + " x " + webgl.getParameter(webgl.MAX_VIEWPORT_DIMS)[1]);
// };