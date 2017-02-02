configure({
  sources: [
    source('amd', 'tinymce.save', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/save\//, '');
		})
  ]
});
