/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';

// TODO: When we translate this, we should pull the HTML out into a HTML file, the way TBIO does it.
// That requires webpack and rollup changes though, so inlining it for now.
/* eslint-disable max-len */
const description = `<h1>Editor UI keyboard navigation</h1>

<h2>Activating keyboard navigation</h2>

<p>The sections of the outer UI of the editor - the menubar, toolbar, sidebar and footer - are all keyboard navigable. As such, there are multiple ways to activate keyboard navigation:</p>
<ul>
  <li>Focus the menubar: Alt + F9 (Windows) or &#x2325;F9 (MacOS)</li>
  <li>Focus the toolbar: Alt + F10 (Windows) or &#x2325;F10 (MacOS)</li>
  <li>Focus the footer: Alt + F11 (Windows) or &#x2325;F11 (MacOS)</li>
</ul>

<p>Focusing the menubar or toolbar will start keyboard navigation at the first item in the menubar or toolbar, which will be highlighted with a gray background. Focusing the footer will start keyboard navigation at the first item in the element path, which will be highlighted with an underline. </p>

<h2>Moving between UI sections</h2>

<p>When keyboard navigation is active, pressing tab will move the focus to the next major section of the UI, where applicable. These sections are:</p>
<ul>
  <li>the menubar</li>
  <li>each group of the toolbar </li>
  <li>the sidebar</li>
  <li>the element path in the footer </li>
  <li>the wordcount toggle button in the footer </li>
  <li>the branding link in the footer </li>
</ul>

<p>Pressing shift + tab will move backwards through the same sections, except when moving from the footer to the toolbar. Focusing the element path then pressing shift + tab will move focus to the first toolbar group, not the last.</p>

<h2>Moving within UI sections</h2>

<p>Keyboard navigation within UI sections can usually be achieved using the left and right arrow keys. This includes:</p>
<ul>
  <li>moving between menus in the menubar</li>
  <li>moving between buttons in a toolbar group</li>
  <li>moving between items in the element path</li>
</ul>

<p>In all these UI sections, keyboard navigation will cycle within the section. For example, focusing the last button in a toolbar group then pressing right arrow will move focus to the first item in the same toolbar group. </p>

<h1>Executing buttons</h1>

<p>To execute a button, navigate the selection to the desired button and hit space or enter.</p>

<h1>Opening, navigating and closing menus</h1>

<p>When focusing a menubar button or a toolbar button with a menu, pressing space, enter or down arrow will open the menu. When the menu opens the first item will be selected. To move up or down the menu, press the up or down arrow key respectively. This is the same for submenus, which can also be opened and closed using the left and right arrow keys.</p>

<p>To close any active menu, hit the escape key. When a menu is closed the selection will be restored to its previous selection. This also works for closing submenus.</p>

<h1>Context toolbars and menus</h1>

<p>To focus an open context toolbar such as the table context toolbar, press Ctrl + F9 (Windows) or &#x2303;F9 (MacOS).</p>

<p>Context toolbar navigation is the same as toolbar navigation, and context menu navigation is the same as standard menu navigation.</p>

<h1>Dialog navigation</h1>

<p>There are two types of dialog UIs in TinyMCE: tabbed dialogs and non-tabbed dialogs.</p>

<p>When a non-tabbed dialog is opened, the first interactive component in the dialog will be focused. Users can navigate between interactive components by pressing tab. This includes any footer buttons. Navigation will cycle back to the first dialog component if tab is pressed while focusing the last component in the dialog. Pressing shift + tab will navigate backwards.</p>

<p>When a tabbed dialog is opened, the first button in the tab menu is focused. Pressing tab will navigate to the first interactive component in that tab, and will cycle through the tab’s components, the footer buttons, then back to the tab button. To switch to another tab, focus the tab button for the current tab, then use the arrow keys to cycle through the tab buttons.</p>`;
/* eslint-enable max-len */

const tab = (): Types.Dialog.TabApi => {
  const body: Types.Dialog.BodyComponentApi = {
    type: 'htmlpanel',
    presets: 'document',
    html: description
  };

  return {
    name: 'keyboardnav',
    title: 'Keyboard Navigation',
    items: [ body ]
  };
};

export {
  tab
};
