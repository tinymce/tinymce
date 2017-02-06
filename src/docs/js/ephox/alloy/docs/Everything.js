define(
  'ephox.alloy.docs.Everything',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Component',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.GuiEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.focus.FocusManagers',
    'ephox.alloy.api.messages.Channels',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.system.NoContextApi',
    'ephox.alloy.api.system.SystemApi',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.ExpandableForm',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.FormChooser',
    'ephox.alloy.api.ui.FormCoupledInputs',
    'ephox.alloy.api.ui.FormField',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.ItemWidget',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.SplitToolbar',
    'ephox.alloy.api.ui.Tabbar',
    'ephox.alloy.api.ui.TabButton',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.api.ui.Tabview',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.alloy.api.ui.Typeahead',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.boulder.format.TypeTokens',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Composing, Disabling, Keying, Streaming, Toggling, Component, GuiFactory, Memento, GuiEvents, SystemEvents, FocusManagers, Channels, Gui, NoContextApi, SystemApi, Button, Container, Dropdown, ExpandableForm, Form, FormChooser, FormCoupledInputs, FormField, GuiTypes, HtmlSelect, InlineView, Input, ItemWidget, Menu, ModalDialog, SplitDropdown, SplitToolbar, Tabbar, TabButton, TabSection, Tabview, TieredMenu, Toolbar, ToolbarGroup, Typeahead, UiBuilder, TypeTokens, Arr, Fun, Class, Element, Html, Insert, InsertAll, SelectorFind) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
      
      var getDescription = Fun.identity;
      

      var build = function (path, dsl) {
        return TypeTokens.foldType(
          dsl,
          function (_sValidator, sType) {
            var parent = Element.fromTag('div');
            Class.add(parent, 'docs-set');
            var child = build(path, sType.toDsl());
            Insert.append(parent, child);
            return parent;
          },
          function (aType) {
            var parent = Element.fromTag('div');
            Class.add(parent, 'docs-array');
            var child = build(path, aType.toDsl());
            Insert.append(parent, child);
            return parent;
          },
          function (oFields) {
            var parent = Element.fromTag('div');
            Class.add(parent, 'docs-obj');
            var children = Arr.bind(oFields, function (child) {
              return TypeTokens.foldField(child, function (key, presence, type) {
                var t = build(path.concat(key), type.toDsl());
                var wrapper = Element.fromTag('div');
                Class.add(wrapper, 'docs-field');
                InsertAll.append(wrapper, [ Element.fromText(key + ' : '), t ]);
                return [ wrapper ];
              }, Fun.constant([ ]))
            });
            InsertAll.append(parent, children);
            return parent;
          },
          function (oValue) {
            return Element.fromHtml('<span class="docs-item">' + getDescription(path.join(' > ')) + '</span>');
          },

          function (cKey, cBranches) {
            return Element.fromText('branch on ' + cKey + ' > NOT IMPLEMENTED');
          }
        );
      };

      var prettyprint = function (level, dsl) {
        var d = build([], dsl);
        return d;
      };

      var behaviours = Arr.map([
        Toggling,
        Streaming,
        Keying,
        Composing,
        Disabling
      ], function (b) {
        var wrapper = Element.fromTag('div');
        var h3 = Element.fromTag('h3');
        Html.set(h3, b.name());
        Insert.append(wrapper, h3);

        var schema = b.schema();
        schema.fold(function (name, output, presence, value) {
          var dsl = value.toDsl();

          Insert.after(h3, prettyprint(0, dsl));
        }, function () { });

        

        return wrapper;
      });

      InsertAll.append(ephoxUi, behaviours);

    };
  }
);