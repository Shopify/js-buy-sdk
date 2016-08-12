import join from './join';

export default function fields(schema) {
  return join(...Object.keys(schema.fields));
}
