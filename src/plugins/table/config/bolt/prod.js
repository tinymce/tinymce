configure({
  sources: [
    source('amd', 'tinymce.table', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/table\//, '');
		})
  ]
});