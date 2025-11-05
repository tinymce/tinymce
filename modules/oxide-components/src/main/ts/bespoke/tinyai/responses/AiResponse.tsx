import type { FunctionComponent } from 'react';

import { classes } from '../../../utils/Styles';

interface AiResponseProps {
  readonly response: string;
}

export const AiResponse: FunctionComponent<AiResponseProps> = ({ response }) => {
  return (
    <div className={classes([ 'tox-ai__response' ])}>
      <div>
        <div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="default-format-code-3">
              {/* eslint-disable-next-line max-len */}
              <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M9 5C7.61013 4.4857 6.5143 3.38987 6 2C5.4857 3.38987 4.38987 4.4857 3 5C4.38987 5.5143 5.4857 6.61013 6 8C6.5143 6.61013 7.61013 5.5143 9 5ZM17.5 4C17.5505 6.46405 19.5359 8.44948 22 8.5C19.5359 8.55052 17.5505 10.5359 17.5 13C17.4495 10.5359 15.4641 8.55052 13 8.5C15.4641 8.44948 17.4495 6.46405 17.5 4ZM9.5 9C9.99067 12.3658 12.6342 15.0093 16 15.5C12.6342 15.9907 9.99067 18.6342 9.5 22C9.00933 18.6342 6.36577 15.9907 3 15.5C6.36577 15.0093 9.00933 12.3658 9.5 9Z" fill="#006CE7" />
            </g>
          </svg>
        </div>
      </div>
      <div className={classes([ 'tox-ai__response-content' ])}>
        {response}
      </div>
    </div>
  );
};
