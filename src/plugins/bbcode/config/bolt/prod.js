configure({
  sources: [
    source('amd', 'tinymce.bbcode', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/bbcode\//, '');
		})
  ]
});
