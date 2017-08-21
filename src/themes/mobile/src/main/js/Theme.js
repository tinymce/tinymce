define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Swapping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.debugging.Debugging',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Option',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'global!document',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.alien.TinyCodeDupe',
    'tinymce.themes.mobile.channels.Receivers',
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
    'tinymce.themes.mobile.ui.StylesMenu',
    'tinymce.themes.mobile.util.CssUrls',
    'tinymce.themes.mobile.util.FormatChangers',
    'tinymce.themes.mobile.util.SkinLoaded',
    'tinymce.themes.mobile.util.StyleFormats'
  ],


  function (
    Behaviour, Swapping, Toggling, Memento, AlloyTriggers, Attachment, Debugging, Objects,
    Arr, Cell, Fun, Id, Option, PlatformDetection, Focus, Insert, DomEvent, Element, Node,
    document, window, DOMUtils, ThemeManager, Api, TinyCodeDupe, Receivers, TinyChannels,
    Styles, Orientation, AndroidRealm, Buttons, ColorSlider, FontSizeSlider, HeadingSlider,
    ImagePicker, IosRealm, LinkButton, StylesMenu, CssUrls, FormatChangers, SkinLoaded,
    StyleFormats
  ) {
    /// not to be confused with editor mode
    var READING = Fun.constant('toReading'); /// 'hide the keyboard'
    var EDITING = Fun.constant('toEditing'); /// 'show the keyboard'

    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));

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
          if (ro === false) editor.selection.collapse();
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
                } else if (Node.name(target) === 'a')  {
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
            styleFormatsButton.getOpt(realm.system().root()).fold(function () {
              realm.dropup().disappear(Fun.noop, {});
            }, function (button) {
              realm.dropup().disappear(Toggling.off, button);
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
            items: [
              {
                dom: {
                  tag: 'span',
                  innerHtml: 'Mobile Theme: v' + '@@MOBILE_THEME_VERSION'
                }
              }
            ]
          };

          var styleFormats = StyleFormats.register(editor, editor.settings);

          var styleFormatsMenu = function () {
            return StyleFormats.ui(editor, styleFormats, function () {
              editor.fire('scrollIntoView');
            });
          };

          var styleFormatsButton = Memento.record(Buttons.forToolbar('font-size', function (button) {
              editor.fire('toReading');
              realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
            }, Behaviour.derive([
              Toggling.config({
                toggleClass: Styles.resolve('toolbar-button-selected'),
                toggleOnExecute: false,
                aria: {
                  mode: 'pressed'
                }
              }),
              Receivers.orientation(function (button) {
                Toggling.off(button);
              })
            ])
          ));

          var actionGroup = {
            label: 'the action group',
            scrollable: true,
            items: [
              Buttons.forToolbarCommand(editor, 'undo'),
              Buttons.forToolbarStateCommand(editor, 'bold'),
              Buttons.forToolbarStateCommand(editor, 'italic'),
              LinkButton.sketch(realm, editor),
              ImagePicker.sketch(editor),
              // NOTE: Requires "lists" plugin.
              Buttons.forToolbarStateAction(editor, 'unordered-list', 'ul', function () {
                editor.execCommand('InsertUnorderedList', null, false);
              }),
              // HeadingSlider.sketch(realm, editor),
              styleFormatsButton.asSpec()

              // FontSizeSlider.sketch(realm, editor),
              // ColorSlider.sketch(realm, editor)
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
