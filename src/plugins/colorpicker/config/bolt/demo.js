configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.colorpicker.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/colorpicker\//, '');
		})
  ]
});

