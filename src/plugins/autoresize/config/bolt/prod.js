configure({
  sources: [
    source('amd', 'tinymce.autoresize', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/autoresize\//, '');
		})
  ]
});
