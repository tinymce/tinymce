configure({
  sources: [
    source('amd', 'tinymce.template', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/template\//, '');
		})
  ]
});
