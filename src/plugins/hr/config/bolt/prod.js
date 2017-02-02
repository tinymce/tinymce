configure({
  sources: [
    source('amd', 'tinymce.hr', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/hr\//, '');
		})
  ]
});
