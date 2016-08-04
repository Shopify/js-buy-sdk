import join from './join';

export default function fields(schema) {
  return join(...schema.fields);
}
