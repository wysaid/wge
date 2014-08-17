/*
 * mesh2d.js
 *
 *  Created on: 2014-8-17
 *    Author: Wang Yang
 *      blog: http://blog.wysaid.org
 */

//这个模型是我(wy)手动创建的。 转载注明出处哦~ 好吧，请随意，其实无所谓的。

//参数含义： nx,ny 分别代表网格横竖方向的格子数量， w,h 代表网格最终实际宽高（默认为1)
WGE.makeMesh2dModel = function(nx, ny, w, h)
{
	if(!(w && h))
	{
		w = 1;
		h = 1;
	}

	var mesh = {sizeX : nx, sizeY : ny, width : w, height : h};

	var position = [];
	mesh.position = position;

	var widthStep = w / nx;
	var heightStep = h / ny;

	for(var i = 0; i < ny; ++i)
	{
		var heightI = i * heightStep;
		var index = ny * i;

		for(var j = 0; j < nx; ++j)
		{
			
		}
	}

}