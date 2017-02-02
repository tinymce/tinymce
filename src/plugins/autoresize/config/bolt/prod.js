configure({
  sources: [
    source('amd', 'tinymce.plugins.autoresize', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/autoresize\//, '');
		})
  ]
});
