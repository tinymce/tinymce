configure({
  sources: [
    source('amd', 'tinymce.plugins.fullscreen', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/fullscreen\//, '');
		})
  ]
});
