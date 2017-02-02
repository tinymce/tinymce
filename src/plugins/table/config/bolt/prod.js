configure({
  sources: [
    source('amd', 'tinymce.plugins.table', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/table\//, '');
		})
  ]
});