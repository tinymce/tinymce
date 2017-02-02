configure({
  sources: [
    source('amd', 'tinymce.insertdatetime', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/insertdatetime\//, '');
		})
  ]
});
