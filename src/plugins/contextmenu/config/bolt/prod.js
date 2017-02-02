configure({
  sources: [
    source('amd', 'tinymce.contextmenu', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/contextmenu\//, '');
		})
  ]
});
