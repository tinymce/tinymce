configure({
  sources: [
    source('amd', 'tinymce.plugins.media', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/media\//, '');
		})
  ]
});