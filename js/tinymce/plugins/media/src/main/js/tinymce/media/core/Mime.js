define('tinymce.media.core.Mime', [
], function () {
	var guess = function (url) {
		var mimes = {
			'mp3': 'audio/mpeg',
			'wav': 'audio/wav',
			'mp4': 'video/mp4',
			'webm': 'video/webm',
			'ogg': 'video/ogg',
			'swf': 'application/x-shockwave-flash'
		};
		var fileEnd = url.toLowerCase().split('.').pop();
		var mime = mimes[fileEnd];

		return mime ? mime : '';
	};

	return {
		guess: guess
	};
});