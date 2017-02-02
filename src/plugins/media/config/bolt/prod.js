configure({
  sources: [
    source('amd', 'tinymce.media', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/media\//, '');
		})
  ]
});