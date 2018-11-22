/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import AbsoluteLayout from './AbsoluteLayout';
import BrowseButton from './BrowseButton';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import Checkbox from './Checkbox';
import Collection from './Collection';
import ColorBox from './ColorBox';
import ColorButton from './ColorButton';
import ColorPicker from './ColorPicker';
import ComboBox from './ComboBox';
import Container from './Container';
import Control from './Control';
import DragHelper from './DragHelper';
import DropZone from './DropZone';
import ElementPath from './ElementPath';
import FieldSet from './FieldSet';
import FilePicker from './FilePicker';
import FitLayout from './FitLayout';
import FlexLayout from './FlexLayout';
import FloatPanel from './FloatPanel';
import FlowLayout from './FlowLayout';
import Form from './Form';
import FormatControls from './FormatControls';
import FormItem from './FormItem';
import GridLayout from './GridLayout';
import Iframe from './Iframe';
import InfoBox from './InfoBox';
import KeyboardNavigation from './KeyboardNavigation';
import Label from './Label';
import Layout from './Layout';
import ListBox from './ListBox';
import Menu from './Menu';
import MenuBar from './MenuBar';
import MenuButton from './MenuButton';
import MenuItem from './MenuItem';
import MessageBox from './MessageBox';
import Movable from './Movable';
import Notification from './Notification';
import Panel from './Panel';
import PanelButton from './PanelButton';
import Path from './Path';
import Progress from './Progress';
import Radio from './Radio';
import ReflowQueue from './ReflowQueue';
import Resizable from './Resizable';
import ResizeHandle from './ResizeHandle';
import Scrollable from './Scrollable';
import SelectBox from './SelectBox';
import Selector from './Selector';
import Slider from './Slider';
import Spacer from './Spacer';
import SplitButton from './SplitButton';
import StackLayout from './StackLayout';
import TabPanel from './TabPanel';
import TextBox from './TextBox';
import Throbber from './Throbber';
import Toolbar from './Toolbar';
import Tooltip from './Tooltip';
import Widget from './Widget';
import Window from './Window';

const getApi = function () {
  return {
    Selector,
    Collection,
    ReflowQueue,
    Control,
    Factory,
    KeyboardNavigation,
    Container,
    DragHelper,
    Scrollable,
    Panel,
    Movable,
    Resizable,
    FloatPanel,
    Window,
    MessageBox,
    Tooltip,
    Widget,
    Progress,
    Notification,
    Layout,
    AbsoluteLayout,
    Button,
    ButtonGroup,
    Checkbox,
    ComboBox,
    ColorBox,
    PanelButton,
    ColorButton,
    ColorPicker,
    Path,
    ElementPath,
    FormItem,
    Form,
    FieldSet,
    FilePicker,
    FitLayout,
    FlexLayout,
    FlowLayout,
    FormatControls,
    GridLayout,
    Iframe,
    InfoBox,
    Label,
    Toolbar,
    MenuBar,
    MenuButton,
    MenuItem,
    Throbber,
    Menu,
    ListBox,
    Radio,
    ResizeHandle,
    SelectBox,
    Slider,
    Spacer,
    SplitButton,
    StackLayout,
    TabPanel,
    TextBox,
    DropZone,
    BrowseButton
  };
};

const appendTo = function (target) {
  if (target.ui) {
    Tools.each(getApi(), function (ref, key) {
      target.ui[key] = ref;
    });
  } else {
    target.ui = getApi();
  }
};

const registerToFactory = function () {
  Tools.each(getApi(), function (ref, key) {
    Factory.add(key, ref);
  });
};

const Api = {
  appendTo,
  registerToFactory
};

export default Api;