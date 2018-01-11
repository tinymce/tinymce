/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const assumeExternalTargets = function (editorSettings) {
  return typeof editorSettings.link_assume_external_targets === 'boolean' ? editorSettings.link_assume_external_targets : false;
};

const hasContextToolbar = function (editorSettings) {
  return typeof editorSettings.link_context_toolbar === 'boolean' ? editorSettings.link_context_toolbar : false;
};

const getLinkList = function (editorSettings) {
  return editorSettings.link_list;
};

const hasDefaultLinkTarget = function (editorSettings) {
  return typeof editorSettings.default_link_target === 'string';
};

const getDefaultLinkTarget = function (editorSettings) {
  return editorSettings.default_link_target;
};

const getTargetList = function (editorSettings) {
  return editorSettings.target_list;
};

const setTargetList = function (editor, list) {
  editor.settings.target_list = list;
};

const shouldShowTargetList = function (editorSettings) {
  return getTargetList(editorSettings) !== false;
};

const getRelList = function (editorSettings) {
  return editorSettings.rel_list;
};

const hasRelList = function (editorSettings) {
  return getRelList(editorSettings) !== undefined;
};

const getLinkClassList = function (editorSettings) {
  return editorSettings.link_class_list;
};

const hasLinkClassList = function (editorSettings) {
  return getLinkClassList(editorSettings) !== undefined;
};

const shouldShowLinkTitle = function (editorSettings) {
  return editorSettings.link_title !== false;
};

const allowUnsafeLinkTarget = function (editorSettings) {
  return typeof editorSettings.allow_unsafe_link_target === 'boolean' ? editorSettings.allow_unsafe_link_target : false;
};

export default {
  assumeExternalTargets,
  hasContextToolbar,
  getLinkList,
  hasDefaultLinkTarget,
  getDefaultLinkTarget,
  getTargetList,
  setTargetList,
  shouldShowTargetList,
  getRelList,
  hasRelList,
  getLinkClassList,
  hasLinkClassList,
  shouldShowLinkTitle,
  allowUnsafeLinkTarget
};