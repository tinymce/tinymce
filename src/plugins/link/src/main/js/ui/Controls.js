/**
 * Controls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.ui.Controls',
  [
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.core.Utils'
  ],
  function (Actions, Utils) {
    var toggleViewLinkState = function (editor) {
      return function () {
        var self = this;

        var toggleVisibility = function (e) {
          if (Utils.hasLinks(e.parents)) {
            self.show();
          } else {
            self.hide();
          }
        };

        if (!Utils.hasLinks(editor.dom.getParents(editor.selection.getStart()))) {
          self.hide();
        }

        editor.on('nodechange', toggleVisibility);

        self.on('remove', function () {
          editor.off('nodechange', toggleVisibility);
        });
      };
    };

    var setupButtons = function (editor) {
      editor.addButton('link', {
        icon: 'link',
        tooltip: 'Insert/edit link',
        shortcut: 'Meta+K',
        onclick: Actions.openDialog(editor),
        stateSelector: 'a[href]'
      });

      editor.addButton('unlink', {
        icon: 'unlink',
        tooltip: 'Remove link',
        cmd: 'unlink',
        stateSelector: 'a[href]'
      });

      if (editor.addContextToolbar) {
        editor.addButton('openlink', {
          icon: 'newtab',
          tooltip: 'Open link',
          onclick: Actions.gotoSelectedLink(editor)
        });
      }
    };

    var setupMenuItems = function (editor) {
      editor.addMenuItem('openlink', {
        text: 'Open link',
        icon: 'newtab',
        onclick: Actions.gotoSelectedLink(editor),
        onPostRender: toggleViewLinkState(editor),
        prependToContext: true
      });

      editor.addMenuItem('link', {
        icon: 'link',
        text: 'Link',
        shortcut: 'Meta+K',
        onclick: Actions.openDialog(editor),
        stateSelector: 'a[href]',
        context: 'insert',
        prependToContext: true
      });
    };

    var setupContextToolbars = function (editor) {
      if (editor.addContextToolbar) {
        editor.addContextToolbar(
          Actions.leftClickedOnAHref(editor),
          'openlink | link unlink'
        );
      }
    };

    return {
      setupButtons: setupButtons,
      setupMenuItems: setupMenuItems,
      setupContextToolbars: setupContextToolbars
    };
  }
);