"use strict";
/*
* wgeMappingUtil.js for webgl
*
*  Created on: 2018-1-5
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.MappingBlendUtil = WGE.Class(WGE.MappingUtil, {

    _lerpUtil: null,
    _bgTexture: null,

    _maskCoordLoc: null,
    _maskUpDirLoc: null,
    _maskFaceStepLoc: null,
    _radiusLoc: null,
    _vsh: null,
    _fsh: null,

    initialize: function (gl, keyPointSize, vsh, fsh) {
        this._shouldReleaseMaskTexture = false;
        this._vsh = vsh ? vsh : WGE.MappingBlendUtil.VSH;
        this._fsh = fsh ? fsh : WGE.MappingBlendUtil.FSH;

        WGE.MappingUtil.initialize.call(this, gl, keyPointSize, vsh, fsh);

        var program = this._program;

        if (program) {
            program.bind();
            program.sendUniform1i("maskTexture", 1);
            program.sendUniform1i("blurredOriginTexture", 2);
            program.sendUniform1i("backgroundTexture", 3);
            this._maskCoordLoc = program.uniformLocation("uMaskCoord");
            this._maskUpDirLoc = program.uniformLocation("maskUpDir");
            this._maskFaceStepLoc = program.uniformLocation("maskFaceStep");
            this._radiusLoc = program.uniformLocation("radius");
            this._context.uniform1f(this._radiusLoc, 1.0);
        }

        this._vsh = this._fsh = null;
    },

    setBGTexture: function (bgTexture) {
        this._bgTexture = bgTexture;
    },

    release: function () {
        var gl = this._context;

        if (gl) {
            if (this._lerpUtil && this._lerpUtil.release) {
                this._lerpUtil.release();
                this._lerpUtil = null;
            }

            if (this._bgTexture) {
                if (this._bgTexture.release) {
                    this._bgTexture.release()
                } else {
                    gl.deleteTexture(this._bgTexture);
                }
            }
        }

        this._context = null;
    },

    getVSH: function () {
        return WGE.MappingBlendUtil.VSH;
    },

    getFSH: function () {
        return WGE.MappingBlendUtil.FSH;
    },

    calcBlurring: function (srcTexture, width, height) {
        if(!this._lerpUtil) {
            this._lerpUtil = WGE.createLerpBlurUtil(this._context);
            if(!this._lerpUtil) {
                return false;
            }
        }

        this._lerpUtil.calcWithTexture(srcTexture, width, height);
        return true;
    },

    setRadius: function (radius) {
        this._program.bind();
        this._context.uniform1f(this._radiusLoc, radius);
    },

    runMeshMappingBlend: function (srcTexture, srcData, dstData) {
        if(!this._lerpUtil) {
            return;
        }

        var gl = this._context;
        var srcBlurredTex = this._lerpUtil.getResult();
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, srcBlurredTex);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this._bgTexture ? this._bgTexture : srcBlurredTex);
        this.runMeshMapping(srcTexture, srcData, dstData);
    }

});

WGE.MappingBlendUtil.VSH = "attribute float vCoordPercent; uniform vec2 uPosition; uniform vec2 uTexCoord; uniform vec2 uMaskCoord; uniform vec2 srcUpDir; uniform vec2 dstUpDir; uniform vec2 maskUpDir; uniform vec2 srcFaceStep; uniform vec2 dstFaceStep; uniform vec2 maskFaceStep; varying vec2 dstFaceTexCoord; varying vec2 maskTexCoord; varying vec2 bgTexCoord; uniform float radius; mat2 mat2ZRotation(float rad){ float cosRad = cos(rad); float sinRad = sin(rad); return mat2(cosRad, sinRad, -sinRad, cosRad);} \n#ifndef PI\n#define PI 3.14159\n#endif\n void main(){ mat2 rot = mat2ZRotation(PI * 2.0 * vCoordPercent); vec2 srcPos = uTexCoord; vec2 dstPos = uPosition; vec2 maskPos = uMaskCoord; if(vCoordPercent >= 0.0) { srcPos += (srcUpDir * rot) * (srcFaceStep * radius); dstPos += (dstUpDir * rot) * (dstFaceStep * radius); maskPos += (maskUpDir * rot) * (maskFaceStep * radius); } dstFaceTexCoord = srcPos; maskTexCoord = maskPos; bgTexCoord = vec2(dstPos.x, 1.0 - dstPos.y); gl_Position = vec4(dstPos * 2.0 - 1.0, 0.0, 1.0);}";

WGE.MappingBlendUtil.FSH = "precision mediump float; varying vec2 dstFaceTexCoord; varying vec2 maskTexCoord; varying vec2 bgTexCoord; uniform sampler2D inputImageTexture; uniform sampler2D maskTexture; uniform sampler2D blurredOriginTexture; uniform sampler2D backgroundTexture; void main(){ vec4 color = vec4(texture2D(inputImageTexture, dstFaceTexCoord).rgb, 1.0); vec3 blurredColor = texture2D(blurredOriginTexture, dstFaceTexCoord).rgb; vec3 bgColor = texture2D(backgroundTexture, bgTexCoord).rgb; color.rgb += (bgColor - blurredColor) * 0.8; color *= texture2D(maskTexture, maskTexCoord).r; gl_FragColor = color;}";