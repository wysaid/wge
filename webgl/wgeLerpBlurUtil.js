"use strict";
/*
* wgeLerpBlurUtil.js for webgl
*
*  Created on: 2018-1-5
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.LerpBlurUtil = WGE.Class({

    _context: null,
    _program: null,
    _frameBuffer: null,
    _intensity: null,
    _isBaseChanged: false,
    _texCache: null,
    _vertBuffer: null,

    _cacheTargetWidth: 0,
    _cacheTargetHeight: 0,

    MAX_LERP_BLUR_INTENSITY: 8,

    initialize: function (context) {
        var gl = this._context = context;
        var texCache = this._texCache = new Array(this.MAX_LERP_BLUR_INTENSITY);
        for (var i = 0; i < this.MAX_LERP_BLUR_INTENSITY; ++i) {
            texCache[i] = new WGE.LerpBlurUtil.TextureCache();
        }

        this._program = new WGE.Program(gl);
        this._program.bindAttribLocation("vPosition", 0);
        if (this._program.initWithShaderCode(WGE.TextureDrawer.vsh, WGE.TextureDrawer.fsh)) {
            this._isBaseChanged = true;
            this._vertBuffer = WGE.genCommonQuadArrayBuffer(gl);
            this._frameBuffer = new WGE.Framebuffer(gl);
        }
    },

    release: function () {
        if (this._context) {
            this._clearMipmaps();
            if (this._vertBuffer) {
                this._context.deleteBuffer(this._vertBuffer);
            }

            if (this._program && this._program.release) {
                this._program.release();
                this._program = null;
            }
        }
    },

    setBlurLevel: function (value) {
        this._intensity = value;
        if (this._intensity > this.MAX_LERP_BLUR_INTENSITY) {
            this._intensity = this.MAX_LERP_BLUR_INTENSITY;
        }
    },

    calcWithTexture: function (texture, width, height) {
        var gl = this._context;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        this._program.bind()

        gl.disable(gl.BLEND);

        if (this._isBaseChanged || !(this._texCache && this._texCache[0].texture && this._cacheTargetWidth === width && this._cacheTargetHeight === height)) {
            this._cacheTargetWidth = width;
            this._cacheTargetHeight = height;
            this._genMipmaps(width, height);
            this._isBaseChanged = false;
            console.log("Lerp blur calc mipmap...");
        }

        var cache = this._texCache;
        var fbo = this._frameBuffer;
        fbo.bindColorTexture(cache[0].texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.viewport(0, 0, cache[0].width, cache[0].height);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        var i;

        //down scale
        for (i = 1; i < this._intensity; ++i) {
            var c = cache[i];
            fbo.bindColorTexture(c.texture);
            gl.viewport(0, 0, c.width, c.height);
            gl.bindTexture(gl.TEXTURE_2D, cache[i - 1].texture);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }

        //up scale
        for (i = this._intensity - 1; i > 0; --i) {
            var c = cache[i - 1];
            fbo.bindColorTexture(c.texture);
            gl.viewport(0, 0, c.width, c.height);
            gl.bindTexture(gl.TEXTURE_2D, cache[i].texture);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    },

    getResult: function () {
        if (this._texCache) {
            return this._texCache[0].texture;
        }
        return null;
    },

    drawTexture: function (texture) {
        var gl = this._context;
        this._program.bind();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    },

    _genMipmaps: function (width, height) {
        var gl = this._context;
        this._clearMipmaps();
        for (var i = 0; i < this.MAX_LERP_BLUR_INTENSITY; ++i) {
            var cache = this._texCache[i];
            cache.width = this._calcLevel(width, i);
            cache.height = this._calcLevel(height, i);
            if (cache.width < 1) cache.width = 1;
            if (cache.height < 1) cache.height = 1;
            cache.texture = WGE.genBlankTexture(gl, cache.width, cache.height);
        }
    },

    _clearMipmaps: function () {
        var gl = this._context;
        if (gl) {
            if (this._texCache) {
                for (var i in this._texCache) {
                    var cache = this._texCache[i];
                    if (cache.texture) {
                        gl.deleteTexture(cache.texture);
                        cache.texture = null;
                        cache.width = 0;
                        cache.height = 0;
                    }
                }
            }
        }
    },

    _sLevelList: [2, 3, 5, 7, 10, 14, 19, 26, 35],

    _calcLevel: function (len, level) {
        var sLevelList = this._sLevelList;
        return Math.floor(len / sLevelList[level]);
    }
});

WGE.LerpBlurUtil.TextureCache = WGE.Class({
    texture: null,
    width: 0,
    height: 0
});

WGE.createLerpBlurUtil = function (context) {
    var util = new WGE.LerpBlurUtil(context);
    if (!(util._program && util._vertBuffer)) {
        util.release();
        util = null;
    }
    return util;
};