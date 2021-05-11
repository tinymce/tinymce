var addSvgDefToDocument = function () {
  var gradient = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"0\" height=\"0\">\n      <defs>\n        <linearGradient id=\"editor-icon-gradient\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n          <stop offset=\"0\" stop-color=\"#888\"/>\n          <stop offset=\"1\" stop-color=\"#bbb\"/>\n        </linearGradient>\n        <linearGradient id=\"editor-icon-gradient__hover\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n          <stop offset=\"0\" stop-color=\"#555\"/>\n          <stop offset=\"1\" stop-color=\"#888\"/>\n        </linearGradient>\n      <linearGradient id=\"editor-icon-gradient__disabled\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n        <stop offset=\"0\" stop-color=\"#ccc\"/>\n        <stop offset=\"1\" stop-color=\"#ccc\"/>\n      </linearGradient>\n        <linearGradient id=\"editor-icon-gradient__green\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n          <stop offset=\"0\" stop-color=\"#637d16\"/>\n          <stop offset=\"1\" stop-color=\"#a4d024\"/>\n        </linearGradient>\n        <linearGradient id=\"editor-icon-gradient__green-hover\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n          <stop offset=\"0\" stop-color=\"#5e7715\"/>\n          <stop offset=\"1\" stop-color=\"#90b620\"/>\n        </linearGradient>\n      </defs>\n    </svg>";
  var svgDefsWrapper = document.createElement('div');
  svgDefsWrapper.innerHTML = gradient;
  document.body.append(svgDefsWrapper);
};
var color_map = [
  '#D6336C',
  'Pink',
  '#F03E3E',
  'Red',
  '#F76707',
  'Orange',
  '#F59F00',
  'Yellow',
  '#AE3EC9',
  'Grape',
  '#7048E8',
  'Violet',
  '#4263EB',
  'Indigo',
  '#1C7CD6',
  'Blue',
  '#1098AD',
  'Cyan',
  '#0CA678',
  'Teal',
  '#37B24D',
  'Green',
  '#74B816',
  'Lime',
  '#333333',
  'Black',
  '#666666',
  'Gray',
  '#999999',
  'Light Gray',
  '#CCCCCC',
  'Silver',
];
var toolbarItems = [
  'actionButton',
  'reset',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  '|',
  'fontsizeselect',
  'forecolor',
  '|',
  'blockquote',
  '|',
  'bullist',
  '|',
  'align',
  '|',
  'image',
  'link',
  'emoticons',
  '|',
  'removeformat',
  '|',
  'code',
].join(' ');
var inlineFormattingItems = 'bold italic underline strikethrough | fontsizeselect forecolor | blockquote';
var blockFormattingItems = 'align bullist';
function initializeTinyMCE (options) {
  var _a;
  var settings = {
      selector: (_a = options === null || options === void 0 ? void 0 : options.selector) !== null && _a !== void 0 ? _a : 'textarea.tiny-area',
      plugins: 'link image code emoticons lists',
      toolbar_location: 'bottom',
      toolbar: toolbarItems,
      toolbar_mode: 'floating',
      fontsize_formats: [10, 12, 16, 18, 24, 32, 48]
          .map(function (size) { return size + "=" + size + "pt"; })
          .join(' '),
      skin_url: "/skins/ui/torn",
      icons: 'torn',
      toolbar_sticky: true,
      height: 400,
      menubar: false,
      statusbar: false,
      color_map: color_map,
      custom_colors: false,
      mobile: {
          toolbar_mode: 'floating',
          toolbar: 'reset inlineFormatting blockFormatting',
          toolbar_groups: {
              inlineFormatting: {
                  icon: 'format',
                  tooltip: 'Formatting',
                  items: inlineFormattingItems,
              },
              blockFormatting: {
                  icon: 'align-left',
                  tooltip: 'Block Formatting',
                  items: blockFormattingItems,
              },
          },
      },
      setup: function (editor) {
          if (options === null || options === void 0 ? void 0 : options.actionButton) {
              editor.ui.registry.addButton('actionButton', {
                  text: "<span class=\"torn-btn\">" + options.actionButton.title + "</span>",
                  onAction: options.actionButton.action,
              });
          }
          editor.ui.registry.addButton('reset', {
              icon: 'undo',
              onAction: function () {
                  editor.setContent('');
                  editor.focus();
              },
          });
      },
  };
  tinymce.init(settings);
};
document.addEventListener('DOMContentLoaded', addSvgDefToDocument, false);
//# sourceMappingURL=TornDemo.js.map