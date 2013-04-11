(function() {
	var baseURL;

	// Get base where the tinymce script is located
	var scripts = document.getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].src;

		if (/tinymce_loader\.js/.test(src)) {
			baseURL = src.substring(0, src.lastIndexOf('/'));
			break;
		}
	}

	if (document.location.search.indexOf('min=true') > 0) {
		document.write('<script src="' + baseURL + '/../../js/tinymce/tinymce.min.js"></script>');
	} else {
		document.write('<script src="' + baseURL + '/../../js/tinymce/tinymce.dev.js"></script>');
	}
})();
