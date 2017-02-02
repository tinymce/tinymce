configure({
  sources: [
    source('amd', 'tinymce.anchor', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/anchor\//, '');
		})
  ]
});
