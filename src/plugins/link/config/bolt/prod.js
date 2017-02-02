configure({
  sources: [
    source('amd', 'tinymce.link', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/link\//, '');
		})
  ]
});
