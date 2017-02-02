configure({
  sources: [
    source('amd', 'tinymce.plugins.anchor', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/anchor\//, '');
		})
  ]
});
