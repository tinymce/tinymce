import { Fun, Singleton, Struct } from '@ephox/katamari';
import { Class, Css, Element, Focus } from '@ephox/sugar';

import Styles from '../../style/Styles';
import Scrollable from '../../touch/scroll/Scrollable';
import MetaViewport from '../../touch/view/MetaViewport';
import Thor from '../../util/Thor';
import Scrollables from '../scroll/Scrollables';
import IosKeyboard from '../view/IosKeyboard';
import IosEvents from './IosEvents';
import IosSetup from './IosSetup';
import PlatformEditor from './PlatformEditor';

const create = function (platform, mask) {
  const meta = MetaViewport.tag();

  const priorState = Singleton.value();
  const scrollEvents = Singleton.value();

  const iosApi = Singleton.api();
  const iosEvents = Singleton.api();

  const enter = function () {
    mask.hide();
    const doc = Element.fromDom(document);
    PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
      // TODO: Orientation changes.
      // orientation = Orientation.onChange();

      priorState.set({
        socketHeight: Css.getRaw(platform.socket, 'height'),
        iframeHeight: Css.getRaw(editorApi.frame(), 'height'),
        outerScroll: document.body.scrollTop
      });

      scrollEvents.set({
        // Allow only things that have scrollable class to be scrollable. Without this,
        // the toolbar scrolling gets prevented
        exclusives: Scrollables.exclusive(doc, '.' + Scrollable.scrollable())
      });

      Class.add(platform.container, Styles.resolve('fullscreen-maximized'));
      Thor.clobberStyles(platform.container, editorApi.body());
      meta.maximize();

      /* NOTE: Making the toolbar scrollable is now done when the middle group is created */

      Css.set(platform.socket, 'overflow', 'scroll');
      Css.set(platform.socket, '-webkit-overflow-scrolling', 'touch');

      Focus.focus(editorApi.body());

      const setupBag = Struct.immutableBag([
        'cWin',
        'ceBody',
        'socket',
        'toolstrip',
        'toolbar',
        'dropup',
        'contentElement',
        'cursor',
        'keyboardType',
        'isScrolling',
        'outerWindow',
        'outerBody'
      ], []);

      iosApi.set(
        IosSetup.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: Fun.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: IosKeyboard.stubborn,
          isScrolling () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        }))
      );

      iosApi.run(function (api) {
        api.syncHeight();
      });

      iosEvents.set(
        IosEvents.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup)
      );
    });
  };

  const exit = function () {
    meta.restore();
    iosEvents.clear();
    iosApi.clear();

    mask.show();

    priorState.on(function (s) {
      s.socketHeight.each(function (h) {
        Css.set(platform.socket, 'height', h);
      });
      s.iframeHeight.each(function (h) {
        Css.set(platform.editor.getFrame(), 'height', h);
      });
      document.body.scrollTop = s.scrollTop;
    });
    priorState.clear();

    scrollEvents.on(function (s) {
      s.exclusives.unbind();
    });
    scrollEvents.clear();

    Class.remove(platform.container, Styles.resolve('fullscreen-maximized'));
    Thor.restoreStyles();
    Scrollable.deregister(platform.toolbar);

    Css.remove(platform.socket, 'overflow'/*, 'scroll'*/);
    Css.remove(platform.socket, '-webkit-overflow-scrolling'/*, 'touch'*/);

    // Hide the keyboard and remove the selection so there isn't a blue cursor in the content
    // still even once exited.
    Focus.blur(platform.editor.getFrame());

    PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
      editorApi.clearSelection();
    });
  };

  // dropup
  const refreshStructure = function () {
    iosApi.run(function (api) {
      api.refreshStructure();
    });
  };

  return {
    enter,
    refreshStructure,
    exit
  };
};

export default {
  create
};