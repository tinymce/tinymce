configure({
  sources: [
    source('amd', 'tinymce.directionality', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/directionality\//, '');
		})
  ]
});
