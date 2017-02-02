configure({
  sources: [
    source('amd', 'tinymce.plugins.template', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/template\//, '');
		})
  ]
});
