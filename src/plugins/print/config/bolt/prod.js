configure({
  sources: [
    source('amd', 'tinymce.plugins.print', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/print\//, '');
		})
  ]
});
