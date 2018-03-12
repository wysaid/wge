"use strict";
/*
* wgeSprite2dSpriteInterchange.js for webgl
*
*  Created on: 2017-12-24
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//对MxN 格式纹理进行支持
WGE.Sprite2dInterChange = WGE.Class(WGE.Sprite2d, {

    _paramViewAreaName: "viewArea",
    _viewAreaLoc: -1,

    initialize: function (canvas, ctx) {
        WGE.Sprite2d.initialize.apply(this, arguments);

        this._program.bind();
        this._viewAreaLoc = this._program.uniformLocation(this._paramViewAreaName);
        this._context.uniform4f(this._viewAreaLoc, 0.0, 0.0, 1.0, 1.0);

        WGE.checkGLErr("init sprite interchange...", this._context);
    },

    getVertexString: function () {
        return WGE.Sprite2dInterChange.VertexShader;
    },

    setViewArea: function (frame) {
        this._program.bind();
        this._context.uniform4f(this._viewAreaLoc, frame[0], frame[1], frame[2], frame[3]);
        // console.log(arguments);
    }
});

WGE.Sprite2dInterChange.VertexShader = "attribute vec2 aPosition;varying vec2 vTextureCoord;uniform mat4 m4Projection;uniform vec2 v2HalfTexSize;uniform float rotation;uniform vec2 v2Scaling;uniform vec2 v2Translation;uniform vec2 v2Hotspot;uniform vec2 canvasflip;uniform vec2 spriteflip;uniform float zIndex;uniform vec4 viewArea;mat2 mat2ZRotation(float rad){float cosRad = cos(rad);float sinRad = sin(rad);return mat2(cosRad, sinRad, -sinRad, cosRad);}void main(){vTextureCoord = ((aPosition.xy * spriteflip + 1.0) / 2.0) * viewArea.zw + viewArea.xy;vec2 texSize = v2HalfTexSize * viewArea.zw; vec2 hotspot = v2Hotspot * texSize;vec2 pos = mat2ZRotation(rotation) * ((aPosition * texSize - hotspot) * v2Scaling) + v2Translation;gl_Position = m4Projection * vec4(pos, zIndex, 1.0);gl_Position.xy *= canvasflip;}";

// WGE.Sprite2dInterChange.FragmentShader = WGE.Sprite2d.FragmentShader;

////////////////////////////////////////

WGE.FrameTexture = WGE.Class({
    texture: null,
    width: 0,
    height: 0,
    col: 0,
    row: 0,
    count: 0
});

WGE.SpriteFrame = WGE.Class({
    frame: null,
    texture: null,
    initialize: function () {
        this.frame = [0.0, 0.0, 1.0, 1.0];
    }
});

WGE.Sprite2dInterChangeMultiple = WGE.Class(WGE.Sprite2dInterChange, {

    _vecTextures: null,
    _vecFrames: null,

    _frameIndex : 0,
    _deltaTime : 0.0,
    _deltaAccum : 0.0,
    _lastTime : 0.0,

    _shouldLoop : true,

    shouldReleaseTexture : true,
    width : 0,
    height : 0,

    initialize : function (canvas, ctx, width, height) {
        WGE.Sprite2dInterChange.initialize.call(this, canvas, ctx);

        //预设为空数组， 避免后面写很多无谓的容错代码.
        this._vecTextures = [];
        this._vecFrames = [];
        this.width = width;
        this.height = height;
    },

    release : function () {
        this._clearTextures();

        WGE.Sprite2dInterChange.release.apply(this);
    },

    nextFrame : function (offset) {
        if(this._vecFrames.length === 0) {
            return;
        }

        if(!offset) {
            offset = 1;
        }

        this._frameIndex += offset;

        if(this._frameIndex >= this._vecFrames.length) {
            if(this._shouldLoop) {
                this._frameIndex = this._frameIndex % this._vecFrames.length;
            } else {
                this._frameIndex = this._vecFrames.length - 1;
            }
        }

        this._setToFrame(this._vecFrames[this._frameIndex]);
    },

    //根据时间间隔更新
    updateFrame : function (delta) {
        this._deltaAccum += delta;
        if(this._deltaAccum > this._deltaTime) {
            var cnt = parseInt(this._deltaAccum / this._deltaTime);
            this.nextFrame(cnt);
            this._deltaAccum -= this._deltaTime * cnt;
        }
    },

    //根据总时间更新
    updateByTime: function (t) {
        this.updateFrame(t - this._lastTime);
        this._lastTime = t;
    },

    setFrameDelayTime: function (dt) {
        this._deltaTime = dt;
    },

    //设置开始的总时间, 一般为当前时间
    setFrameTime : function (t) {
        this._lastTime = t;
    },

    _setToFrame : function (frame) {
        this.setViewArea(frame.frame);
        this.texture = frame.texture;
    },

    jumpToFrame : function (frameIndex) {
        if(this._vecFrames.length === 0) {
            return;
        }

        if(frameIndex >= this._vecFrames.length) {
            frameIndex = this._vecFrames.length - 1;
        }

        this._frameIndex = frameIndex;
        this._deltaAccum = 0.0;
        this._setToFrame(this._vecFrames[frameIndex]);
    },

    jumpToLastFrame : function () {
        if(this._vecFrames.length !== 0) {
            this._frameIndex = this._vecFrames.length - 1;
        }
    },

    isFirstFrame : function () {
        return this._frameIndex === 0;
    },

    isLastFrame : function () {
        return this._frameIndex === this._vecFrames.length;
    },

    setFrameTextures : function (frameTextures) {
        this._clearTextures();
        this._vecTextures = frameTextures;
        this._calcFrames();
    },

    enableLoop : function (shouldLoop) {
        this._shouldLoop = shouldLoop;
    },

    currentFrame : function () {
        return this._frameIndex;
    },

    totalFrames : function () {
        return this._vecFrames.length;
    },

    _clearTextures: function () {

        if (this._vecTextures) {
            for (var i in this._vecTextures) {
                var frame = this._vecTextures[i];
                if (frame.texture) {
                    if (frame.texture.release) {
                        frame.texture.release();
                    } else {
                        this._context.deleteTexture(frame.texture);
                    }
                }
            }

            this._vecTextures = null;
        }
    },

    _calcFrames : function () {

        this._vecFrames = [];

        for(var i in this._vecTextures) {
            var tex = this._vecTextures[i];
            var total = tex.col * tex.row;
            var frameWidth = 1.0 / tex.col;
            var frameHeight = 1.0 / tex.row;

            if(tex.count < total) {
                total = tex.count;
            }

            for(var j = 0; j !== total; ++j) {
                var frame = new WGE.SpriteFrame();
                frame.texture = tex.texture;
                frame.frame = [(j % tex.col) * frameWidth, Math.floor(j / tex.col) * frameHeight, frameWidth, frameHeight];
                this._vecFrames.push(frame);
                // console.log(frame.frame);
            }
        }

    }
});














