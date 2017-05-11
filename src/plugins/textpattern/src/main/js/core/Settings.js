define(
  'tinymce.plugins.textpattern.core.Settings',
  [
  ],
  function () {
    var defaultPatterns = [
      { start: '*', end: '*', format: 'italic' },
      { start: '**', end: '**', format: 'bold' },
      { start: '#', format: 'h1' },
      { start: '##', format: 'h2' },
      { start: '###', format: 'h3' },
      { start: '####', format: 'h4' },
      { start: '#####', format: 'h5' },
      { start: '######', format: 'h6' },
      { start: '1. ', cmd: 'InsertOrderedList' },
      { start: '* ', cmd: 'InsertUnorderedList' },
      { start: '- ', cmd: 'InsertUnorderedList' }
    ];

    var defaultForcedRootBlock = 'p';

    var getPatterns = function (editorSettings) {
      return editorSettings.textpattern_patterns !== undefined ?
        editorSettings.textpattern_patterns :
        defaultPatterns;
    };

    var getForcedRootBlock = function (editorSettings) {
      if (editorSettings.forced_root_block === 'div') {
        return editorSettings.forced_root_block;
      } else {
        return defaultForcedRootBlock;
      }
    };

    return {
      getPatterns: getPatterns,
      getForcedRootBlock: getForcedRootBlock
    };
  }
);
