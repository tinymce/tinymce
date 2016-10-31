define('tinymce.media.core.Mime', [
], function () {
	var guess = function (url) {
			url = url.toLowerCase();

			if (url.indexOf('.mp3') != -1) {
				return 'audio/mpeg';
			}

			if (url.indexOf('.wav') != -1) {
				return 'audio/wav';
			}

			if (url.indexOf('.mp4') != -1) {
				return 'video/mp4';
			}

			if (url.indexOf('.webm') != -1) {
				return 'video/webm';
			}

			if (url.indexOf('.ogg') != -1) {
				return 'video/ogg';
			}

			if (url.indexOf('.swf') != -1) {
				return 'application/x-shockwave-flash';
			}

			return '';
		};

		return {
			guess: guess
		};
});