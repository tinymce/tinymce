import type { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

const createHeader = (title: string): HTMLElement => {
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '8px 10px';
  header.style.background = '#ccc';
  header.style.fontWeight = 'bold';
  header.setAttribute('data-mce-floating-sidebar-handle', 'true');

  const label = document.createElement('span');
  label.textContent = title;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.style.border = 'none';
  closeButton.style.background = 'transparent';
  closeButton.style.fontSize = '16px';
  closeButton.style.lineHeight = '1';
  closeButton.addEventListener('click', () => {
    window.alert(`Close button clicked in "${title}"`);
  });

  header.appendChild(label);
  header.appendChild(closeButton);
  return header;
};

const createPanel = (title: string, content: HTMLElement): HTMLElement => {
  const panel = document.createElement('div');
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.flex = '1';

  panel.appendChild(createHeader(title));
  panel.appendChild(content);
  return panel;
};

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'table lists image accordion code',
  toolbar: 'table | numlist bullist | image | accordion | code | mysidebar1 mysidebar2 blanksidebar',
  menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
  details_initial_state: 'inherited',
  details_serialize_state: 'inherited',
  sidebar_type: 'floating',
  setup: (editor) => {
    editor.ui.registry.addSidebar('mysidebar1', {
      tooltip: 'My sidebar 1',
      icon: 'comment',
      onSetup: (api) => {
        const box = document.createElement('div');
        box.style.padding = '10px';
        // box.style.width = '400px';
        box.style.flex = '1';
        box.style.background = 'lightgreen';
        box.textContent = 'Sidebar 1 content';

        const panel = createPanel('Sidebar 1', box);
        api.element().appendChild(panel);
        return () => api.element().removeChild(panel);
      }
    });

    editor.ui.registry.addSidebar('mysidebar2', {
      tooltip: 'My sidebar 2',
      icon: 'image',
      onSetup: (api) => {
        const box = document.createElement('div');
        box.style.padding = '10px';
        // box.style.width = '500px';
        box.style.flex = '1';
        box.style.background = 'lightblue';
        box.textContent = 'Sidebar 2 content';

        const panel = createPanel('Sidebar 2', box);
        api.element().appendChild(panel);
        return () => api.element().removeChild(panel);
      }
    });

    editor.ui.registry.addSidebar('blanksidebar', {
      tooltip: 'Blank sidebar',
      icon: 'help',
      onSetup: (api) => {
        const text = document.createTextNode('blank sidebar');
        api.element().appendChild(text);
        return () => api.element().removeChild(text);
      }
    });

    // Follow-the-focus behaviour, implemented purely from the integration layer (no editor
    // source changes). When the user interacts with an editor, move the currently-open floating
    // sidebar to it - but only if this editor actually has that sidebar registered. Otherwise do
    // nothing and leave the sidebar where it is.
    editor.on('focus', () => {
      // The theme guarantees at most one floating sidebar is open across all editors, so scan the
      // others to find whichever one (if any) currently has a sidebar open. Because only one can be
      // open globally, a non-blank result also means THIS editor has nothing open.
      const openName = tinymce.get()
        .filter((other) => other.id !== editor.id)
        .reduce<string>((found, other) => found || other.queryCommandValue('ToggleSidebar'), '');

      if (openName === '') {
        return; // Nothing open elsewhere - nothing to switch.
      }

      // getAll() is an internal registry method; an integrator could instead track their own
      // set of registered sidebar names per editor.
      const hasSidebar = Object.prototype.hasOwnProperty.call(editor.ui.registry.getAll().sidebars, openName);

      if (hasSidebar) {
        // Opening here makes the theme close the other editor's sidebar - the panel "moves".
        editor.execCommand('ToggleSidebar', false, openName);
      }
    });
  }
});

export {};
