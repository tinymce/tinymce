configure({
  sources: [
    source('amd', 'tinymce.code', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/code\//, '');
		})
  ]
});
