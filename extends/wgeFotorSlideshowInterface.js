"use strict";
/*
* wgeFotorSlideshowInterface.js
*
*  Created on: 2014-8-29
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
	简介: 为fotor slideshow 提供一致对外接口
	需要网站部分js代码支持， 不可单独使用。

*/


WGE.FotorSlideshowInterface = WGE.Class(FT.kAnimator, WGE.SlideshowInterface,
{

	//options、lastPhotoCallback 都是无意义参数，建议剔除
	initialize : function(element, options, template, callback, scope, lastPhotoCallback)
	{
		FT.kAnimator.initialize.call(this, template);
		var self = this;
		var imageURLs = template.config.imageUrls || template.config.previewImageUrls;
		var len = imageURLs.length;

		if(!(len > 0))
		{
			console.error("未传入图片");
			return ;
		}

		FT.EventManager.sendEvent(new FT.KTemplateLoadingEvent(0, FT.TLP_ANIMATION_IMAGELOADING, this.template));

		WGE.SlideshowInterface.initialize.call(this, element, imageURLs, function (imgArr, slideshowThis){
			if(callback)
				callback.call(scope);

		}, function(img, n, slideshowThis){
			FT.EventManager.sendEvent(new FT.KTemplateLoadingEvent(n / len, FT.TLP_ANIMATION_IMAGELOADING, self.template));
		});

		//兼容接口
		this.setMusicVolume = this.setVolume;
		this.destroy = this.clear = this.release;
	},

	release : function()
	{
		slideshow.release();
		WGE.release(this);
	},

	onEvent: function(e)
	{
		if (this.template.config.autoPauseAsHide)
		{
			if (e.type == "FM_WINDOW_HIDE")
			{
				this.pause();
			}
			else if (e.type == "FM_WINDOW_SHOW")
			{
				this.resume();
			}
		}
	}

});