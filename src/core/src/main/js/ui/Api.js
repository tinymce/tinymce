/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.ui.Api',
  [
    'tinymce.core.ui.Selector',
    'tinymce.core.ui.Collection',
    'tinymce.core.ui.ReflowQueue',
    'tinymce.core.ui.Control',
    'tinymce.core.ui.Factory',
    'tinymce.core.ui.KeyboardNavigation',
    'tinymce.core.ui.Container',
    'tinymce.core.ui.DragHelper',
    'tinymce.core.ui.Scrollable',
    'tinymce.core.ui.Panel',
    'tinymce.core.ui.Movable',
    'tinymce.core.ui.Resizable',
    'tinymce.core.ui.FloatPanel',
    'tinymce.core.ui.Window',
    'tinymce.core.ui.MessageBox',
    'tinymce.core.ui.Tooltip',
    'tinymce.core.ui.Widget',
    'tinymce.core.ui.Progress',
    'tinymce.core.ui.Notification',
    'tinymce.core.ui.Layout',
    'tinymce.core.ui.AbsoluteLayout',
    'tinymce.core.ui.Button',
    'tinymce.core.ui.ButtonGroup',
    'tinymce.core.ui.Checkbox',
    'tinymce.core.ui.ComboBox',
    'tinymce.core.ui.ColorBox',
    'tinymce.core.ui.PanelButton',
    'tinymce.core.ui.ColorButton',
    'tinymce.core.ui.ColorPicker',
    'tinymce.core.ui.Path',
    'tinymce.core.ui.ElementPath',
    'tinymce.core.ui.FormItem',
    'tinymce.core.ui.Form',
    'tinymce.core.ui.FieldSet',
    'tinymce.core.ui.FilePicker',
    'tinymce.core.ui.FitLayout',
    'tinymce.core.ui.FlexLayout',
    'tinymce.core.ui.FlowLayout',
    'tinymce.core.ui.FormatControls',
    'tinymce.core.ui.GridLayout',
    'tinymce.core.ui.Iframe',
    'tinymce.core.ui.InfoBox',
    'tinymce.core.ui.Label',
    'tinymce.core.ui.Toolbar',
    'tinymce.core.ui.MenuBar',
    'tinymce.core.ui.MenuButton',
    'tinymce.core.ui.MenuItem',
    'tinymce.core.ui.Throbber',
    'tinymce.core.ui.Menu',
    'tinymce.core.ui.ListBox',
    'tinymce.core.ui.Radio',
    'tinymce.core.ui.ResizeHandle',
    'tinymce.core.ui.SelectBox',
    'tinymce.core.ui.Slider',
    'tinymce.core.ui.Spacer',
    'tinymce.core.ui.SplitButton',
    'tinymce.core.ui.StackLayout',
    'tinymce.core.ui.TabPanel',
    'tinymce.core.ui.TextBox'
  ],
  function (
    Selector, Collection, ReflowQueue, Control, Factory, KeyboardNavigation, Container, DragHelper, Scrollable, Panel, Movable,
    Resizable, FloatPanel, Window, MessageBox, Tooltip, Widget, Progress, Notification, Layout, AbsoluteLayout, Button,
    ButtonGroup, Checkbox, ComboBox, ColorBox, PanelButton, ColorButton, ColorPicker, Path, ElementPath, FormItem, Form,
    FieldSet, FilePicker, FitLayout, FlexLayout, FlowLayout, FormatControls, GridLayout, Iframe, InfoBox, Label, Toolbar,
    MenuBar, MenuButton, MenuItem, Throbber, Menu, ListBox, Radio, ResizeHandle, SelectBox, Slider, Spacer, SplitButton,
    StackLayout, TabPanel, TextBox
  ) {
    "use strict";

    var registerToFactory = function (id, ref) {
      Factory.add(id.split('.').pop(), ref);
    };

    var expose = function (target, id, ref) {
      var i, fragments;

      fragments = id.split(/[.\/]/);
      for (i = 0; i < fragments.length - 1; ++i) {
        if (target[fragments[i]] === undefined) {
          target[fragments[i]] = {};
        }

        target = target[fragments[i]];
      }

      target[fragments[fragments.length - 1]] = ref;

      registerToFactory(id, ref);
    };

    var appendTo = function (target) {
      expose(target, 'ui.Selector', Selector);
      expose(target, 'ui.Collection', Collection);
      expose(target, 'ui.ReflowQueue', ReflowQueue);
      expose(target, 'ui.Control', Control);
      expose(target, 'ui.Factory', Factory);
      expose(target, 'ui.KeyboardNavigation', KeyboardNavigation);
      expose(target, 'ui.Container', Container);
      expose(target, 'ui.DragHelper', DragHelper);
      expose(target, 'ui.Scrollable', Scrollable);
      expose(target, 'ui.Panel', Panel);
      expose(target, 'ui.Movable', Movable);
      expose(target, 'ui.Resizable', Resizable);
      expose(target, 'ui.FloatPanel', FloatPanel);
      expose(target, 'ui.Window', Window);
      expose(target, 'ui.MessageBox', MessageBox);
      expose(target, 'ui.Tooltip', Tooltip);
      expose(target, 'ui.Widget', Widget);
      expose(target, 'ui.Progress', Progress);
      expose(target, 'ui.Notification', Notification);
      expose(target, 'ui.Layout', Layout);
      expose(target, 'ui.AbsoluteLayout', AbsoluteLayout);
      expose(target, 'ui.Button', Button);
      expose(target, 'ui.ButtonGroup', ButtonGroup);
      expose(target, 'ui.Checkbox', Checkbox);
      expose(target, 'ui.ComboBox', ComboBox);
      expose(target, 'ui.ColorBox', ColorBox);
      expose(target, 'ui.PanelButton', PanelButton);
      expose(target, 'ui.ColorButton', ColorButton);
      expose(target, 'ui.ColorPicker', ColorPicker);
      expose(target, 'ui.Path', Path);
      expose(target, 'ui.ElementPath', ElementPath);
      expose(target, 'ui.FormItem', FormItem);
      expose(target, 'ui.Form', Form);
      expose(target, 'ui.FieldSet', FieldSet);
      expose(target, 'ui.FilePicker', FilePicker);
      expose(target, 'ui.FitLayout', FitLayout);
      expose(target, 'ui.FlexLayout', FlexLayout);
      expose(target, 'ui.FlowLayout', FlowLayout);
      expose(target, 'ui.FormatControls', FormatControls);
      expose(target, 'ui.GridLayout', GridLayout);
      expose(target, 'ui.Iframe', Iframe);
      expose(target, 'ui.InfoBox', InfoBox);
      expose(target, 'ui.Label', Label);
      expose(target, 'ui.Toolbar', Toolbar);
      expose(target, 'ui.MenuBar', MenuBar);
      expose(target, 'ui.MenuButton', MenuButton);
      expose(target, 'ui.MenuItem', MenuItem);
      expose(target, 'ui.Throbber', Throbber);
      expose(target, 'ui.Menu', Menu);
      expose(target, 'ui.ListBox', ListBox);
      expose(target, 'ui.Radio', Radio);
      expose(target, 'ui.ResizeHandle', ResizeHandle);
      expose(target, 'ui.SelectBox', SelectBox);
      expose(target, 'ui.Slider', Slider);
      expose(target, 'ui.Spacer', Spacer);
      expose(target, 'ui.SplitButton', SplitButton);
      expose(target, 'ui.StackLayout', StackLayout);
      expose(target, 'ui.TabPanel', TabPanel);
      expose(target, 'ui.TextBox', TextBox);
      expose(target, 'ui.Api', Api);
    };

    var Api = {
      appendTo: appendTo
    };

    return Api;
  }
);