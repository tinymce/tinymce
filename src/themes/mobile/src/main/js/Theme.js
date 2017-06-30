define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.system.Attachment',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.Orientation',
    'tinymce.themes.mobile.ui.AndroidRealm',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.HeadingSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton',
    'tinymce.themes.mobile.util.CssUrls',
    'tinymce.themes.mobile.util.FormatChangers',
    'tinymce.themes.mobile.util.SkinLoaded'
  ],


  function (
    Focusing, Keying, Sliding, AlloyTriggers, Attachment, Cell, Fun, PlatformDetection, Focus, Insert, Element, Node, window, DOMUtils, ThemeManager, Api, TinyChannels,
    Styles, Orientation, AndroidRealm, Buttons, ColorSlider, FontSizeSlider, HeadingSlider, ImagePicker, IosRealm, LinkButton, CssUrls, FormatChangers, SkinLoaded
  ) {
    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));

        var doScrollIntoView = function () {
          console.log('scrolling into view');
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
          realm.setToolbarGroups(ro ? readOnlyGroups.get() : mainGroups.get());
          editor.setMode(ro === true ? 'readonly' : 'design');
          if (ro) editor.fire('toReading');
          realm.updateMode(ro);
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
                console.log("handler", handler, new Error('blah').stack);
                editor.on('toReading', function () {
                  console.log('listening to toReading', handler);
                  handler();
                });

                var unbind = function () {
                  editor.off('toReading');
                };

                return {
                  unbind: unbind
                };
              },

              onScrollToCursor: function (handler) {
                console.log('onScrollToCursor binding');
                editor.on('scrollIntoView', function (tinyEvent) {
                  console.log("handing scroll into view");
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

              onTouchContent: function () {
                var toolbar = Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')));
                // If something in the toolbar had focus, fire an execute on it (execute on tap away)
                // Perhaps it will be clearer later what is a better way of doing this.
                findFocusIn(toolbar).each(AlloyTriggers.emitExecute);
                realm.restoreToolbar();
                realm.dropup().disappear();
              },

              onTapContent: function (evt) {
                // If the user has tapped (touchstart, touchend without movement) on an image, select it.
                if (Node.name(evt.target()) === 'img') {
                  editor.selection.select(evt.target().dom());
                  // Prevent the default behaviour from firing so that the image stays selected
                  evt.kill();
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

          var backToMaskGroup = {
            label: 'The first group',
            scrollable: false,
            items: [
              Buttons.forToolbar('back', function (/* btn */) {
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
            items: [ ]
          };

          var actionGroup = {
            label: 'the action group',
            scrollable: true,
            items: [
              Buttons.forToolbarCommand(editor, 'undo'),
              Buttons.forToolbarStateCommand(editor, 'bold'),
              Buttons.forToolbarStateCommand(editor, 'italic'),
              LinkButton.sketch(realm, editor),
              ImagePicker.sketch(editor),
              HeadingSlider.sketch(realm, editor),
              // NOTE: Requires "lists" plugin.
              Buttons.forToolbarStateAction(editor, 'unordered-list', 'ul', function () {
                editor.execCommand('InsertUnorderedList', null, false);
              }),

              Buttons.forToolbar('styles', function () {
                editor.fire('toReading');
                // Hack to make the keyboard disappear first ... there should be a way to detect it.
                setTimeout(function () {
                  window.requestAnimationFrame(function () {
                    
                    realm.dropup().appear();
                  });
                }, 1000);
              }, { }),

              FontSizeSlider.sketch(realm, editor),
              ColorSlider.sketch(realm, editor)
            ]
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
        renderUI: renderUI
      };
    });

    Api.appendTo(window.tinymce ? window.tinymce : {});

    return function () { };

  }
);
