(function() {
	if (document.location.search.indexOf('min=true') > 0) {
		document.write('<script src="../jscripts/tiny_mce/tiny_mce.js"></script>');
	} else {
		document.write('<script src="../jscripts/tiny_mce/tiny_mce_dev.js' + document.location.search + '"></script>');		
	}
})();
