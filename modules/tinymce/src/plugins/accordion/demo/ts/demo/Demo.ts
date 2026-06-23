/* eslint-disable max-len */
import type { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

const makeFakeCommentsSidebar = (ed: Editor) => {
  ed.ui.registry.addSidebar('fakecomments', {
    icon: 'comment',
    tooltip: 'Tooltip for fakecomments',
    onSetup: (api) => {
      const container = document.createElement('div');
      container.classList.add('tox-sidebar-content');
      container.innerHTML = `
                <div class="tox-sidebar-content__header">
                  <div class="tox-sidebar-content__title">Fake Comments</div>
                </div>
                <div class="tox-comment__scroll">
                  <div class="tox-comment-thread">
                    <div tabindex="-1" class="tox-comment">
                      <div><div class="tox-comment__header">
                        <div class="tox-comment__meta">
                          <div class="tox-user">
                            <div class="tox-user__avatar"><img alt="" role="presentation" src="data:image/svg+xml,%3Csvg%20height%3D%2236%22%20width%3D%2236%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%2218%22%20fill%3D%22%236A00AB%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%23FFF%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%3EA%3C%2Ftext%3E%3C%2Fsvg%3E"></div>
                            <div><div class="tox-user__name">Another Tiny User</div><div class="tox-comment__date">4 years ago<span></span></div></div>
                          </div>
                        </div>
                      </div>
                      <div class="tox-comment__body"><div>Please revise this sentence, exclamation points are unprofessional!</div>
                    </div>
                  </div></div>    
                  <div tabindex="-1" class="tox-comment tox-comment--selected">
                    <div><div tabindex="-1" class="tox-comment__single">
                      <div class="tox-comment__header"><div class="tox-comment__meta">
                        <div class="tox-user">
                          <div class="tox-user__avatar"><img alt="" role="presentation" src="data:image/svg+xml,%3Csvg%20height%3D%2236%22%20width%3D%2236%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%2218%22%20r%3D%2218%22%20fill%3D%22%23452B24%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%20fill%3D%22%23FFF%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%3EJ%3C%2Ftext%3E%3C%2Fsvg%3E"></div>
                          <div><div class="tox-user__name">John Smith</div><div class="tox-comment__date">1 year ago<span></span></div></div></div></div><button type="button" tabindex="-1" data-state="closed" id="radix-P0-0" aria-haspopup="menu" aria-expanded="false" aria-label="Conversation Actions" data-mce-tooltip="Conversation Actions" class="tox-button--naked tox-button--kebab tox-button tox-button--icon"><div class="tox-icon"><svg width="24" height="24"><path d="M6 10a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2Zm12 0a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2Zm-6 0a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2 2 2 0 0 0-2-2Z" fill-rule="nonzero"></path></svg></div></button>
                      </div>
                      <div class="tox-comment__body"><div>then <span><span class="mymention" style="color: #1b1; background-color: #eee;" data-mention-id="johnsmith">@John Smith</span></span> should be hoverable</div></div></div></div><button type="button" tabindex="-1" class="tox-button tox-button--secondary" style="width: 100%;">Add commentâ€¦</button></div>
                    </div>
                  </div>`;
      api.element().appendChild(container);
      return () => {
        api.element().removeChild(container);
      };
    }
  });
};

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'table lists image accordion code',
  toolbar: 'table | numlist bullist | image | accordion | code | fakecomments',
  menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
  details_initial_state: 'inherited',
  details_serialize_state: 'inherited',
  resize: 'both',
  setup: (editor) => {
    makeFakeCommentsSidebar(editor);
    editor.on('init', () => {
      const minInput = document.getElementById('sidebar-min-width') as HTMLInputElement | null;
      const maxInput = document.getElementById('sidebar-max-width') as HTMLInputElement | null;
      minInput?.addEventListener('input', () => {
        editor.options.set('sidebar_min_width', Number(minInput.value));
      });
      maxInput?.addEventListener('input', () => {
        editor.options.set('sidebar_max_width', Number(maxInput.value));
      });
    });
  },
  sidebar_show: 'fakecomments'
});

export {};
