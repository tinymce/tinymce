configure({
  sources: [
    source('amd', 'tinymce.pagebreak', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/pagebreak\//, '');
		})
  ]
});
