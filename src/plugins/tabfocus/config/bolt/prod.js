configure({
  sources: [
    source('amd', 'tinymce.plugins.tabfocus', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/tabfocus\//, '');
		})
  ]
});
