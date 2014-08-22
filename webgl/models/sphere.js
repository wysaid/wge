/*
 * sphere.js
 *
 *  Created on: 2014-8-13
 *    Author: Wang Yang
 *      blog: http://blog.wysaid.org
 */

//@_@吃水不忘挖井人， 参考自 apple inc. 文档

WGE.Sphere = {};

WGE.makeSphere = function(rad, lats, height)
{
	var sphere = {};
	sphere.positions = [];
	sphere.normals = [];
	sphere.texCoords = [];
	sphere.indices = [];

	var pos = sphere.positions, norm = sphere.normals,
	    tex = sphere.texCoords, indices = sphere.indices;

	for (var i = 0; i <= lats; ++i) {
        for (var j = 0; j <= height; ++j) {
            var theta = i * Math.PI / lats;
            var phi = j * 2 * Math.PI / height;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1-(j/height);
            var v = i/lats;

            norm.push(x);
            norm.push(y);
            norm.push(z);
            tex.push(u);
            tex.push(v);
            pos.push(rad * x);
            pos.push(rad * y);
            pos.push(rad * z);
        }
    }

    for (var i = 0; i < lats; ++i) {
        for (var j = 0; j < height; ++j) {
            var first = (i * (height+1)) + j;
            var second = first + height + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first+1);

            indices.push(second);
            indices.push(second+1);
            indices.push(first+1);
        }
    }
    return sphere;
};