import { getDemoRegistry } from './../buttons/DemoRegistry';

const editor = {
  on: (s, f) => { },
  isDirty: () => true
};

export const registerSpellcheckerItems = () => {
  getDemoRegistry().addSplitButton('spellchecker', {
    type: 'splitbutton',
    // disabled: false,
    onSetup: (buttonApi: any) => {
      // update the active state based on whether spell check is running
      editor.on('SpellcheckStart SpellcheckEnd', (e) => {
        buttonApi.setActive(e);
      });
      return () => { };
    },
    fetch: (callback) => {
      // read all the langauges
      const languages = [ ];
      callback(languages);
      // Set the active state of a particular language (if it matches selected language).. handled by `select`
    },
    select: (itemValue) => {
      // return true if current language = item value
      return itemValue === 'en';
    },
    onAction: (buttonApi) => {
      // trigger search replace dialog
    },
    onItemAction: (buttonApi, itemValue) => {
      // Seth te current language
    }
  });
};