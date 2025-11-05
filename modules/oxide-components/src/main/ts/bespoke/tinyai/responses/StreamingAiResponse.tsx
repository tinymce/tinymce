import type { FunctionComponent } from 'react';

import { classes } from '../../../utils/Styles';
import { Spinner } from '../spinner/Spinner';

interface AiResponseProps {
  readonly response: string;
}

export const StreamingAiResponse: FunctionComponent<AiResponseProps> = ({ response }) => {
  return (
    <div className={classes([ 'tox-ai__response', 'tox-ai__response-streaming' ])}>
      <div className={classes([ 'tox-ai__response' ])}>
        <Spinner />
      </div>
      <div className={classes([ 'tox-ai__response' ])}>
        {response}
      </div>
    </div>
  );
};
