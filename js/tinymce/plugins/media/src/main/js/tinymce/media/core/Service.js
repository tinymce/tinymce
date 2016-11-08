define('tinymce.media.core.Service', [
	'tinymce.media.core.Data',
	'global!tinymce.util.Promise'
], function (Data, Promise) {

	var embedPromise = function (data, dataToHtml, handler) {
		var cache = {};
		return new Promise(function (res, rej) {
			var wrappedResolve = function (response) {
				if (response.html) {
					cache[data.source1] = response;
				}
				return res({
					url: data.source1,
					html: response.html ? response.html : dataToHtml(data)
				});
			};
			return cache[data.source1] ? wrappedResolve(cache[data.source1]) : handler({url: data.source1}, wrappedResolve, rej);
		});
	};

	var defaultPromise = function (data, dataToHtml) {
		return new Promise(function (res) {
			res({html: dataToHtml(data), url: data.source1});
		});
	};

	var getEmbedHtml = function (editor, data) {
		var embedHandler = editor.settings.media_embed_handler;
		var loadedData = Data.dataToHtml.bind(null, editor);

		return embedHandler ? embedPromise(data, loadedData, embedHandler) : defaultPromise(data, loadedData);
	};

	return {
		getEmbedHtml: getEmbedHtml
	};
});