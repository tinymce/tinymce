configure({
  sources: [
    source('amd', 'tinymce.plugins.colorpicker', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/colorpicker\//, '');
		})
  ]
});
