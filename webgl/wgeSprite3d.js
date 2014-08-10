"use strict";
/*
* wgeSprite3d.js for webgl
*
*  Created on: 2014-8-6
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//注： 同名参数含义请参考Sprite2d，为了减少篇幅，这里不再赘述
//内部包含set方法的参数，请使用set方法，不要直接修改参数值。
WGE.Sprite3d = WGE.Class(
{
	canvas : null,
	texture : null,
	pos : null,     //包含x, y, z轴信息。下方类似参数同理
	rot : null,		//与Sprite2dExt类似。
	scaling : null,
	//提示: zIndex 在Sprite3d中无意义，故不提供。开启OpenGL的深度测试即可。 
	//若要按远近先后混合，请在渲染前按远近顺序排序。

	_hotspot: null,

	_alpha : 1.0,

	_program : null,
	_context : null,
	_textureRelease : true,
	



});