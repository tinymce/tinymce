define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.alloy.api.behaviour.Swapping',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.debugging.Debugging',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'tinymce.core.ThemeManager',
    'tinymce.core.dom.DOMUtils',
    'tinymce.themes.mobile.alien.TinyCodeDupe',
    'tinymce.themes.mobile.api.Settings',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.features.Features',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.Orientation',
    'tinymce.themes.mobile.ui.AndroidRealm',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.util.CssUrls',
    'tinymce.themes.mobile.util.FormatChangers',
    'tinymce.themes.mobile.util.SkinLoaded'
  ],


  function (
    Swapping, AlloyTriggers, Attachment, Debugging, Cell, Fun, PlatformDetection, Focus, Insert, Element, Node, ThemeManager, DOMUtils, TinyCodeDupe, Settings,
    TinyChannels, Features, Styles, Orientation, AndroidRealm, Buttons, IosRealm, CssUrls, FormatChangers, SkinLoaded
  ) {
    /// not to be confused with editor mode
    var READING = Fun.constant('toReading'); /// 'hide the keyboard'
    var EDITING = Fun.constant('toEditing'); /// 'show the keyboard'

    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        if (Settings.isSkinDisabled(editor) === false) {
          editor.contentCSS.push(cssUrls.content);
          DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));
        } else {
          SkinLoaded.fireSkinLoaded(editor)();
        }

        var doScrollIntoView = function () {
          editor.fire('scrollIntoView');
        };

        var wrapper = Element.fromTag('div');
        var realm = PlatformDetection.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
        var original = Element.fromDom(args.targetNode);
        Insert.after(original, wrapper);
        Attachment.attachSystem(wrapper, realm.system());

        var findFocusIn = function (elem) {
          return Focus.search(elem).bind(function (focused) {
            return realm.system().getByDom(focused).toOption();
          });
        };
        var outerWindow = args.targetNode.ownerDocument.defaultView;
        var orientation = Orientation.onChange(outerWindow, {
          onChange: function () {
            var alloy = realm.system();
            alloy.broadcastOn([ TinyChannels.orientationChanged() ], { width: Orientation.getActualWidth(outerWindow) });
          },
          onReady: Fun.noop
        });

        var setReadOnly = function (readOnlyGroups, mainGroups, ro) {
          if (ro === false) {
            editor.selection.collapse();
          }
          realm.setToolbarGroups(ro ? readOnlyGroups.get() : mainGroups.get());
          editor.setMode(ro === true ? 'readonly' : 'design');
          editor.fire(ro === true ? READING() : EDITING());
          realm.updateMode(ro);
        };

        var bindHandler = function (label, handler) {
          editor.on(label, handler);
          return {
            unbind: function () {
              editor.off(label);
            }
          };
        };

        editor.on('init', function () {
          realm.init({
            editor: {
              getFrame: function () {
                return Element.fromDom(editor.contentAreaContainer.querySelector('iframe'));
              },

              onDomChanged: function () {
                return {
                  unbind: Fun.noop
                };
              },

              onToReading: function (handler) {
                return bindHandler(READING(), handler);
              },

              onToEditing: function (handler) {
                return bindHandler(EDITING(), handler);
              },

              onScrollToCursor: function (handler) {
                editor.on('scrollIntoView', function (tinyEvent) {
                  handler(tinyEvent);
                });

                var unbind = function () {
                  editor.off('scrollIntoView');
                  orientation.destroy();
                };

                return {
                  unbind: unbind
                };
              },

              onTouchToolstrip: function () {
                hideDropup();
              },

              onTouchContent: function () {
                var toolbar = Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')));
                // If something in the toolbar had focus, fire an execute on it (execute on tap away)
                // Perhaps it will be clearer later what is a better way of doing this.
                findFocusIn(toolbar).each(AlloyTriggers.emitExecute);
                realm.restoreToolbar();
                hideDropup();
              },

              onTapContent: function (evt) {
                var target = evt.target();
                // If the user has tapped (touchstart, touchend without movement) on an image, select it.
                if (Node.name(target) === 'img') {
                  editor.selection.select(target.dom());
                  // Prevent the default behaviour from firing so that the image stays selected
                  evt.kill();
                } else if (Node.name(target) === 'a') {
                  var component = realm.system().getByDom(Element.fromDom(editor.editorContainer));
                  component.each(function (container) {
                    /// view mode
                    if (Swapping.isAlpha(container)) {
                      TinyCodeDupe.openLink(target.dom());
                    }
                  });
                }
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar'))),
            dropup: realm.dropup(),
            alloy: realm.system(),
            translate: Fun.noop,

            setReadOnly: function (ro) {
              setReadOnly(readOnlyGroups, mainGroups, ro);
            }
          });

          var hideDropup = function () {
            realm.dropup().disappear(function () {
              realm.system().broadcastOn([ TinyChannels.dropupDismissed() ], { });
            });
          };

          Debugging.registerInspector('remove this', realm.system());

          var backToMaskGroup = {
            label: 'The first group',
            scrollable: false,
            items: [
              Buttons.forToolbar('back', function (/* btn */) {
                editor.selection.collapse();
                realm.exit();
              }, { })
            ]
          };

          var backToReadOnlyGroup = {
            label: 'Back to read only',
            scrollable: false,
            items: [
              Buttons.forToolbar('readonly-back', function (/* btn */) {
                setReadOnly(readOnlyGroups, mainGroups, true);
              }, {})
            ]
          };

          var readOnlyGroup = {
            label: 'The read only mode group',
            scrollable: true,
            items: []
          };

          var features = Features.setup(realm, editor);
          var items = Features.detect(editor.settings, features);

          var actionGroup = {
            label: 'the action group',
            scrollable: true,
            items: items
          };

          var extraGroup = {
            label: 'The extra group',
            scrollable: false,
            items: [
              // This is where the "add button" button goes.
            ]
          };

          var mainGroups = Cell([ backToReadOnlyGroup, actionGroup, extraGroup ]);
          var readOnlyGroups = Cell([ backToMaskGroup, readOnlyGroup, extraGroup ]);

          // Investigate ways to keep in sync with the ui
          FormatChangers.init(realm, editor);
        });

        return {
          iframeContainer: realm.socket().element().dom(),
          editorContainer: realm.element().dom()
        };
      };

      return {
        getNotificationManagerImpl: function () {
          return {
            open: Fun.identity,
            close: Fun.noop,
            reposition: Fun.noop,
            getArgs: Fun.identity
          };
        },
        renderUI: renderUI
      };
    });

    return function () { };

  }
);
