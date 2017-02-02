/**
 * TinyMceDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define("tinymce.core.demo.TinyMceDemo", [
    'tinymce.core.EditorManager',
    'tinymce.core.ui.Button',
    'tinymce.core.ui.ButtonGroup',
    'tinymce.core.ui.ElementPath',
    'tinymce.core.ui.Factory',
		'tinymce.core.ui.FormatControls',
    'tinymce.core.ui.FlowLayout',
    'tinymce.core.ui.Layout',
    'tinymce.core.ui.Panel',
    'tinymce.core.ui.ResizeHandle',
    'tinymce.core.ui.StackLayout',
    'tinymce.core.ui.Toolbar',
    'tinymce.modern.Theme'
  ], function(
		EditorManager, Button, ButtonGroup, ElementPath, Factory, FormatControls,
		FlowLayout, Layout, Panel, ResizeHandle, StackLayout, Toolbar, Theme
	) {
	return function() {
		var textarea = document.createElement('textarea');
    textarea.innerHTML = '<p>Bolt</p>';

    textarea.classList.add('tinymce');
    document.querySelector('#ephox-ui').appendChild(textarea);

    Theme;
		FormatControls;

    Factory.add('button', Button);
    Factory.add('buttongroup', ButtonGroup);
    Factory.add('panel', Panel);
    Factory.add('stacklayout', StackLayout);
    Factory.add('toolbar', Toolbar);
    Factory.add('flowlayout', FlowLayout);
    Factory.add('layout', Layout);
    Factory.add('elementpath', ElementPath);
    Factory.add('resizehandle', ResizeHandle);

		EditorManager.init({
			//imagetools_cors_hosts: ["moxiecode.cachefly.net"],
			//imagetools_proxy: "proxy.php",
			//imagetools_api_key: '123',

			//images_upload_url: 'postAcceptor.php',
			//images_upload_base_path: 'base/path',
			//images_upload_credentials: true,
      skin_url: '../../../../skins/lightgray/dist/lightgray',
      setup: function (ed) {
        ed.addButton('demoButton', {
          type: 'button',
          text: 'Demo'
        });
      },

			selector: "textarea.tinymce",
			theme: "modern",
      toolbar1: 'demoButton bold italic',
      menubar: false
    });
	};
});
