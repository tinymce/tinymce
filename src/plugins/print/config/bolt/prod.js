configure({
  sources: [
    source('amd', 'tinymce.print', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/print\//, '');
		})
  ]
});
