import type { FunctionComponent } from 'react';

import { Button } from '../../../components/button/Button';

const TagCloseIcon: FunctionComponent = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* eslint-disable-next-line max-len */}
      <path fillRule="evenodd" clipRule="evenodd" d="M11.8153 5.08028L8.90396 8L11.8153 10.9197C12.0619 11.1672 12.0615 11.5675 11.8145 11.8145C11.5675 12.0615 11.1672 12.0619 10.9197 11.8153L8 8.90396L5.08028 11.8153C4.83285 12.0619 4.43248 12.0615 4.18548 11.8145C3.93847 11.5675 3.93813 11.1672 4.18471 10.9197L7.09604 8L4.18471 5.08028C3.93813 4.83285 3.93847 4.43248 4.18548 4.18548C4.43248 3.93847 4.83285 3.93813 5.08028 4.18471L8 7.09603L10.9197 4.18471C11.1672 3.93813 11.5675 3.93848 11.8145 4.18548C12.0615 4.43248 12.0619 4.83285 11.8153 5.08028Z" fill="#606973" />
    </svg>
  );
};

interface BaseTagProps {
  readonly label: string;
  readonly icon?: JSX.Element;
}

interface NonClosableTagProps extends BaseTagProps {
  readonly closeable: false;
}

interface ClosableTagProps extends BaseTagProps {
  readonly closeable: true;
  readonly onClose: () => void;
}

export type TagProps = NonClosableTagProps | ClosableTagProps;

// Tag is here in reference to a tagging/labeling context, not a HTML tag.
export const Tag: FunctionComponent<TagProps> = (props) => {
  const { label, icon, closeable } = props;
  return (
    <div className="tox-tag">
      {icon}
      <span className="tox-tag__label">{label}</span>
      {closeable && (
        <span className="tox-tag__close">
          {/* The svg is temporary until the oxide-icons include the icons with the correct size for this project */}
          {/* Once that is done, we will revert back to using the IconButton component */}
          <Button variant='naked' onClick={props.onClose} className={'tox-button--icon'} aria-label="Remove tag">
            <TagCloseIcon />
          </Button>
        </span>
      )}
    </div>
  );
};
