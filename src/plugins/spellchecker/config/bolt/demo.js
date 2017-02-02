configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.spellchecker.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/spellchecker\//, '');
		})
  ]
});

