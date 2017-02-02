configure({
  sources: [
    source('amd', 'tinymce.image', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/image\//, '');
		})
  ]
});
