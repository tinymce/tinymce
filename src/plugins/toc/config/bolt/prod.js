configure({
  sources: [
    source('amd', 'tinymce.toc', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/toc\//, '');
		})
  ]
});
