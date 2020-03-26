import { AlloyComponent, Attachment, Behaviour, Gui, GuiFactory, Memento, Replacing } from '@ephox/alloy';
import { Arr, Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import ThemeManager from 'tinymce/core/api/ThemeManager';
import * as Features from 'tinymce/themes/mobile/features/Features';
import * as FormatChangers from 'tinymce/themes/mobile/util/FormatChangers';
import { MobileRealm } from 'tinymce/themes/mobile/ui/IosRealm';

const strName = 'test';

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

  const realm: MobileRealm = {
    dropup: Fun.die('not implemented'),
    element: Fun.die('not implemented'),
    exit: Fun.die('not implemented'),
    focusToolbar: Fun.die('not implemented'),
    init: Fun.die('not implemented'),
    restoreToolbar: Fun.die('not implemented'),
    setContextToolbar: Fun.die('not implemented'),
    setToolbarGroups: Fun.die('not implemented'),
    updateMode: Fun.die('not implemented'),
    system: Fun.constant(alloy),
    socket: Fun.constant(socket)
  };

  ThemeManager.add(strName, function (editor) {
    return {
      renderUI() {
        editor.fire('SkinLoaded');
        return {
          iframeContainer: socket.element().dom(),
          editorContainer: alloy.element().dom()
        };
      }
    };
  });

  return {
    use(f: (realm: MobileRealm, apis: TinyApis, toolbar: AlloyComponent, socket: AlloyComponent, buttons, onSuccess: () => void, onFailure: (err?: any) => void) => void) {
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
        theme: strName,
        base_url: '/project/tinymce/js/tinymce'
      }, onSuccess, onFailure);
    }
  };
};

const name = Fun.constant(strName);

export {
  setup,
  name
};
