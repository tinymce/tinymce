configure({
  sources: [
    source('amd', 'tinymce.plugins.code', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/code\//, '');
		})
  ]
});
