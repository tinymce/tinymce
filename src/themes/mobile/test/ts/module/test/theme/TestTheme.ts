import { Attachment, Behaviour, Gui, GuiFactory, Memento, Replacing } from '@ephox/alloy';
import { Arr, Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import ThemeManager from 'tinymce/core/api/ThemeManager';
import Features from 'tinymce/themes/mobile/features/Features';
import FormatChangers from 'tinymce/themes/mobile/util/FormatChangers';

const name = 'test';

const setup = function (info, onSuccess, onFailure) {

  /* This test is going to create a toolbar with both list items on it */
  const alloy = Gui.create();

  Attachment.attachSystem(info.container, alloy);

  const toolbar = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'test-toolbar' ]
    },
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  });

  const socket = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'test-socket' ]
    }
  });

  alloy.add(toolbar);
  alloy.add(socket);

  const realm = {
    system: Fun.constant(alloy),
    socket: Fun.constant(socket)
  };

  ThemeManager.add(name, function (editor) {
    return {
      renderUI (args) {
        editor.fire('SkinLoaded');
        return {
          iframeContainer: socket.element().dom(),
          editorContainer: alloy.element().dom()
        };
      }
    };
  });

  return {
    use (f) {
      TinyLoader.setup(function (editor, onS, onF) {
        const features = Features.setup(realm, editor);

        FormatChangers.init(realm, editor);

        const apis = TinyApis(editor);

        const buttons = { };
        Arr.each(info.items, function (item) {
          // For each item in the toolbar, make a lookup
          buttons[item] = Memento.record(features[item].sketch());
        });

        const toolbarItems = Arr.map(info.items, function (item) {
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

export default {
  setup,
  name: Fun.constant(name)
};