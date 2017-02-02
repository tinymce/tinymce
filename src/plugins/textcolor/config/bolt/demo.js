configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.textcolor.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/textcolor\//, '');
		})
  ]
});

