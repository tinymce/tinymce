configure({
  sources: [
    source('amd', 'tinymce.advlist', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/advlist\//, '');
		})
  ]
});
