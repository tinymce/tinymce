import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';

const isArray = Tools.isArray;

const formulaFilter = function (formula) {
    return Tools.grep(formula, function (item) {
        return isArray(item) && item.length === 2;
    });
};

const getCharsFromSetting = function (settingValue) {
    if (isArray(settingValue)) {
      return [].concat(formulaFilter(settingValue));
    }

    if (typeof settingValue === 'function') {
      return settingValue();
    }

    return [];
};

const getFormula = function (editor) {
    const userFormula = Settings.getFormula(editor);
    return getCharsFromSetting(userFormula);
};

export default {
    getFormula
};