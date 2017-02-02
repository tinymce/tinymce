configure({
  configs: [
    './prod.js',
		'../../../themes/modern/config/bolt/prod.js'
  ],
  sources: [
    source('amd', 'tinymce.core.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/core\//, '');
		})
  ]
});

