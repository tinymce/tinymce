import Behaviour from './Behaviour';
import HighlightApis from '../../behaviour/highlighting/HighlightApis';
import HighlightSchema from '../../behaviour/highlighting/HighlightSchema';



export default <any> Behaviour.create({
  fields: HighlightSchema,
  name: 'highlighting',
  apis: HighlightApis
});