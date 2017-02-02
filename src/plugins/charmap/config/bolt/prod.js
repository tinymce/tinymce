configure({
  sources: [
    source('amd', 'tinymce.charmap', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/charmap\//, '');
		})
  ]
});
