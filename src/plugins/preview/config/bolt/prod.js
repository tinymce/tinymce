configure({
  sources: [
    source('amd', 'tinymce.preview', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/preview\//, '');
		})
  ]
});
