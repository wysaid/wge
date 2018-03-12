"use strict";
/*
* wgeMappingUtil.js for webgl
*
*  Created on: 2017-12-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

WGE.MappingUtil = WGE.Class({
    _program: null,
    _coordPercentBuffer: null,
    _indexBuffer: null,
    _maskTexture: null,
    _keyPointSize: null,
    _meshSize: null,

    _srcUpDirLoc: null,
    _dstUpDirLoc: null,
    _srcPointLoc: null,
    _dstPointLoc: null,
    _context: null,
    _shouldReleaseMaskTexture: true,

    shouldReleaseMask: function (releaseMask) {
        this._shouldReleaseMaskTexture = releaseMask;
    },

    initialize: function (gl, keyPointSize) {

        keyPointSize = Math.floor(keyPointSize);

        this._context = gl;
        this._keyPointSize = keyPointSize;

        this._program = new WGE.Program(gl);
        var program = this._program;
        program.bindAttribLocation("vCoordPercent", 0);
        if (!program.initWithShaderCode(this.getVSH(), this.getFSH())) {
            console.log("MeshMapping Util init failed!");
            program.release();
            this._program = null;
            return;
        }

        program.bind();

        this._srcUpDirLoc = program.uniformLocation("srcUpDir");
        this._dstUpDirLoc = program.uniformLocation("dstUpDir");
        this._srcPointLoc = program.uniformLocation("uTexCoord");
        this._dstPointLoc = program.uniformLocation("uPosition");
        program.sendUniform1i("maskTexture", 1);

        this.setSrcUpDir(0.0, 1.0);
        this.setDstUpDir(0.0, 1.0);

        var percents = new Float32Array(keyPointSize);
        percents[0] = -1.0;

        for (var i = 1; i < keyPointSize; ++i) {
            percents[i] = (i - 1) / (keyPointSize - 2);
        }

        this._coordPercentBuffer = WGE.genBuffer(gl, gl.ARRAY_BUFFER, percents, gl.STATIC_DRAW);
    },

    release: function () {

        if (this._context) {

            var gl = this._context;

            if (this._program && this._program.release) {
                this._program.release();
                this._program = null;
            }

            if (this._coordPercentBuffer) {
                gl.deleteBuffer(this._coordPercentBuffer);
                this._coordPercentBuffer = null;
            }

            if (this._indexBuffer) {
                gl.deleteBuffer(this._indexBuffer);
                this._indexBuffer = null;
            }

            if (this._maskTexture) {
                if (this._shouldReleaseMaskTexture) {
                    if (this._maskTexture.release) {
                        this._maskTexture.release();
                    } else {
                        gl.deleteTexture(this._maskTexture);
                    }
                }
                this._maskTexture = null;
            }

            this._context = null;
        }
    },

    setSrcUpDir: function (x, y) {
        this._program.bind();
        this._context.uniform2f(this._srcUpDirLoc, x, y);
    },

    setDstUpDir: function (x, y) {
        this._program.bind();
        this._context.uniform2f(this._dstUpDirLoc, x, y);
    },

    setSrcFaceSize: function (w, h) {
        this._program.bind();
        this._program.sendUniform2f("srcFaceStep", 1.0 / w, 1.0 / h);
    },

    setDstCanvasSize: function (w, h) {
        this._program.bind();
        this._program.sendUniform2f("dstFaceStep", 1.0 / w, 1.0 / h);
    },

    setMaskTexture: function (texture, maskUpDirX, maskUpDirY, maskPosX, maskPosY, maskTextureWidth, maskTextureHeight) {
        var gl = this._context;
        if (this._shouldReleaseMaskTexture && this._maskTexture && this._maskTexture !== texture) {
            gl.deleteTexture(this._maskTexture);
        }

        this._maskTexture = texture;
        var program = this._program;
        program.bind();
        program.sendUniform2f("uMaskCoord", maskPosX, maskPosY);
        program.sendUniform2f("maskUpDir", maskUpDirX, maskUpDirY);
        program.sendUniform2f("maskFaceStep", 1.0 / maskTextureWidth, 1.0 / maskTextureHeight);
    },

    getVSH: function () {
        return WGE.MappingUtil.VSH;
    },

    getFSH: function () {
        return WGE.MappingUtil.FSH;
    },

    runMeshMapping: function (srcTexture, srcData, dstData) {

        if (!srcTexture) {
            console.log("invalid srcTexture");
            return;
        }

        var gl = this._context;

        if (!this._maskTexture) {
            var buffer = new Uint8Array([0xff]);
            this._maskTexture = WGE.genTextureWithData(gl, 1, 1, gl.LUMINANCE, gl.UNSIGNED_BYTE, buffer);
            this.setMaskTexture(this._maskTexture, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0);
        }

        this._program.bind();

        gl.uniform2f(this._srcPointLoc, srcData[0], srcData[1]);
        gl.uniform2f(this._dstPointLoc, dstData[0], dstData[1]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcTexture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._maskTexture);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._coordPercentBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, this._keyPointSize);
    }

});

WGE.MappingUtil.VSH = " attribute float vCoordPercent; uniform vec2 uPosition; uniform vec2 uTexCoord; uniform vec2 uMaskCoord; uniform vec2 srcUpDir; uniform vec2 dstUpDir; uniform vec2 maskUpDir; uniform vec2 srcFaceStep; uniform vec2 dstFaceStep; uniform vec2 maskFaceStep; varying vec2 dstFaceTexCoord; varying vec2 maskTexCoord; const float radius = 2.0; mat2 mat2ZRotation(float rad){ float cosRad = cos(rad); float sinRad = sin(rad); return mat2(cosRad, sinRad, -sinRad, cosRad);}  const float PI = 3.14159;  void main(){ mat2 rot = mat2ZRotation(PI * 2.0 * vCoordPercent); vec2 srcPos = uTexCoord; vec2 dstPos = uPosition; vec2 maskPos = uMaskCoord; if(vCoordPercent >= 0.0) { srcPos += (srcUpDir * rot) * (srcFaceStep * radius); dstPos += (dstUpDir * rot) * (dstFaceStep * radius); maskPos += (maskUpDir * rot) * (maskFaceStep * radius); } dstFaceTexCoord = srcPos; maskTexCoord = maskPos; gl_Position = vec4(dstPos * 2.0 - 1.0, 0.0, 1.0);}";

WGE.MappingUtil.FSH = "" +
    " precision mediump float; varying vec2 dstFaceTexCoord; varying vec2 maskTexCoord; uniform sampler2D inputImageTexture; uniform sampler2D maskTexture; void main() { vec4 color = vec4(texture2D(inputImageTexture, dstFaceTexCoord).rgb, 1.0); color *= texture2D(maskTexture, maskTexCoord).r; gl_FragColor = color;}";