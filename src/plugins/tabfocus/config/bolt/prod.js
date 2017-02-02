configure({
  sources: [
    source('amd', 'tinymce.tabfocus', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/tabfocus\//, '');
		})
  ]
});
