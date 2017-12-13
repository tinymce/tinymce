import { Behaviour } from '@ephox/alloy';
import { Replacing } from '@ephox/alloy';
import { GuiFactory } from '@ephox/alloy';
import { Memento } from '@ephox/alloy';
import { Attachment } from '@ephox/alloy';
import { Gui } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import ThemeManager from 'tinymce/core/ThemeManager';
import Features from 'tinymce/themes/mobile/features/Features';
import FormatChangers from 'tinymce/themes/mobile/util/FormatChangers';

var name = 'test';


var setup = function (info, onSuccess, onFailure) {

  /* This test is going to create a toolbar with both list items on it */
  var alloy = Gui.create();

  Attachment.attachSystem(info.container, alloy);

  var toolbar = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'test-toolbar' ]
    },
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  });

  var socket = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'test-socket' ]
    }
  });

  alloy.add(toolbar);
  alloy.add(socket);

  var realm = {
    system: Fun.constant(alloy),
    socket: Fun.constant(socket)
  };


  ThemeManager.add(name, function (editor) {
    return {
      renderUI: function (args) {
        editor.fire('SkinLoaded');
        return {
          iframeContainer: socket.element().dom(),
          editorContainer: alloy.element().dom()
        };
      }
    };
  });

  return {
    use: function (f) {
      TinyLoader.setup(function (editor, onS, onF) {
        var features = Features.setup(realm, editor);

        FormatChangers.init(realm, editor);

        var apis = TinyApis(editor);

        var buttons = { };
        Arr.each(info.items, function (item) {
          // For each item in the toolbar, make a lookup
          buttons[item] = Memento.record(features[item].sketch());
        });

        var toolbarItems = Arr.map(info.items, function (item) {
          return buttons[item].asSpec();
        });

        Replacing.set(toolbar, toolbarItems);
        f(realm, apis, toolbar, socket, buttons, onS, onF);
      }, {
        theme: name
      }, onSuccess, onFailure);
    }
  };
};

export default <any> {
  setup: setup,
  name: Fun.constant(name)
};