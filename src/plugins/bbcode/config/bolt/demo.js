configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.bbcode.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/bbcode\//, '');
		})
  ]
});

