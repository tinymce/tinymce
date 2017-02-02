configure({
  sources: [
    source('amd', 'tinymce.colorpicker', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/colorpicker\//, '');
		})
  ]
});
