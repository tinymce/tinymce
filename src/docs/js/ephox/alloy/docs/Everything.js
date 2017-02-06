define(
  'ephox.alloy.docs.Everything',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.DragnDrop',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
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
    'ephox.alloy.docs.Documentation',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.Objects',
    'ephox.boulder.format.TypeTokens',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Composing, Coupling, Disabling, Docking, Dragging, DragnDrop, Focusing, Highlighting, Invalidating, Keying, Positioning, Receiving, Replacing, Representing, Sandboxing, Sliding, Streaming, Tabstopping, Toggling, Unselecting, Component, GuiFactory, Memento, GuiEvents, SystemEvents, FocusManagers, Channels, Gui, NoContextApi, SystemApi, Button, Container, Dropdown, ExpandableForm, Form, FormChooser, FormCoupledInputs, FormField, GuiTypes, HtmlSelect, InlineView, Input, ItemWidget, Menu, ModalDialog, SplitDropdown, SplitToolbar, Tabbar, TabButton, TabSection, Tabview, TieredMenu, Toolbar, ToolbarGroup, Typeahead, UiBuilder, Documentation, FieldPresence, Objects, TypeTokens, Arr, Fun, Attr, Class, Element, Html, Insert, InsertAll, SelectorFind) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();
    
      var getDescription = function (key) {
        if (Objects.hasKey(Documentation, key)) return Documentation[key].desc;
        else return '<span style="background-color: red;">' + key + '</span>';
      };
      

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

      //           { strict: [ ] },
      // { defaultedThunk: [ 'fallbackThunk' ] },
      // { asOption: [ ] },
      // { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
      // { mergeWithThunk: [ 'baseThunk' ] }
                var presenceClass = presence.fold(
                  function () { return 'strict'; },
                  function () { return 'defaulted'; },
                  function () { return 'optional'; },
                  function () { return 'defaulted'; },
                  function () { return 'merged'; }
                );
                Class.add(wrapper, presenceClass);

                Class.add(wrapper, 'docs-field');
                var span = Element.fromTag('span');
                Class.add(span, 'docs-field-name');
                Html.set(span, key + ': ');
                InsertAll.append(wrapper, [ span, t ]);
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

      var behaviours = Arr.map([
        // First while developing
        Toggling,
        Composing,
        Coupling,
        Disabling,
        Docking,
        Dragging,
        DragnDrop,
        Focusing,
        Highlighting,
        Invalidating,
        Keying,
        Positioning,
        Receiving,
        Replacing,
        Representing,
        Sandboxing,
        Sliding,
        Streaming,
        Tabstopping,
        // Toggling,
        Unselecting
      ], function (b) {
        var wrapper = Element.fromTag('div');
        var h3 = Element.fromTag('h3');
        Attr.set(h3, 'id', 'behaviour_' + b.name());
        Html.set(h3, b.name());
        Insert.append(wrapper, h3);

        var desc = Element.fromTag('p');
        Html.set(desc, getDescription(b.name()));
        Insert.after(h3, desc);

        var schema = b.schema();
        schema.fold(function (name, output, presence, value) {
          var dsl = value.toDsl();

          Insert.after(desc, build([ b.name() ], dsl));
        }, function () { });

        

        return wrapper;
      });

      InsertAll.append(ephoxUi, behaviours);

    };
  }
);