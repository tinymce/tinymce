configure({
  sources: [
    source('amd', 'tinymce.visualchars', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/visualchars\//, '');
		})
  ]
});
