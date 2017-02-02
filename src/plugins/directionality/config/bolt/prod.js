configure({
  sources: [
    source('amd', 'tinymce.plugins.directionality', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/directionality\//, '');
		})
  ]
});
