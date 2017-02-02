configure({
  sources: [
    source('amd', 'tinymce.fullscreen', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/fullscreen\//, '');
		})
  ]
});
