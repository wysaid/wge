//这里统一时间线，音乐等，继承公共类SlideshowInterface



WGE.Burst = WGE.Class(WGE.SlideshowInterface,
{
	timeline : new WGE.TimeLine(60000),
	audioFileName : "Slide_maniac.mp3",
});