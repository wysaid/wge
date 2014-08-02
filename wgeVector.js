"use strict";
/*
* wgeTimeline.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.Vec2 = WGE.Class(
{
	x : 0,
	y : 0,
	
	initialize : function(x, y)
	{
		this.x = x == undefined ? 0 : x;
		this.y = y == undefined ? 0 : y;
	},

	plus : function(v2)
	{
		return new WGE.Vec2(this.x + v2.x, this.y + v2.y);
	},

	minus : function(v2)
	{
		return new WGE.Vec2(this.x - v2.x, this.y - v2.y);
	},

	times : function(v2)
	{
		return new WGE.Vec2(this.x * v2.x, this.y * v2.y);
	},

	divide : function(v2)
	{
		return new WGE.Vec2(this.x / v2.x, this.y / v2.y);
	}

});