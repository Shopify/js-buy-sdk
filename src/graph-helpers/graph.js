import join from './join';
import graphSchema from 'graph/schema';
import rawDescriptorForField from './raw-descriptor-for-field';

function schemaForType(typeName) {
  const type = graphSchema[typeName];

  if (type) {
    return type;
  }

  throw new Error(`No type of ${typeName} found in schema`);
}

function formatArgPair(key, hash) {
  return `${key}: ${JSON.stringify(hash[key])}`;
}

function formatArgs(argumentHash) {
  const keys = Object.keys(argumentHash);

  if (!keys.length) {
    return '';
  }

  const formattedArgs = Object.keys(argumentHash).map(key => {
    return formatArgPair(key, argumentHash);
  });

  return ` (${join(formattedArgs)})`;
}

export default class Graph {
  constructor(typeName = 'QueryRoot', parent) {
    if (typeName === 'Scalar') {
      this.type = {
        name: 'Scalar'
      };
    } else {
      this.type = schemaForType(typeName);
    }

    this.parent = parent;
    this.fields = [];
  }

  get label() {
    if (this.type.name === 'QueryRoot') {
      return 'query';
    }

    return `fragment on ${this.type.name}`;
  }

  get body() {
    if (this.type.name === 'Scalar') {
      return '';
    }

    return ` { ${this.selections} }`;
  }

  get selections() {
    return join(this.fields.map(field => {
      return `${field.name}${formatArgs(field.args)}${field.node.toQuery()}`;
    }));
  }

  toQuery() {
    if (this.parent) {
      return this.body;
    }

    return `${this.label} ${this.body}`;
  }

  addField(name, args = {}, fieldTypeCb = function () {}) {
    const fieldDescriptor = rawDescriptorForField(name, this.type.name);
    const node = new Graph(fieldDescriptor.typeName, this);

    fieldTypeCb(node);

    this.fields.push({ name, args, node, fieldTypeCb });
  }

  addConnection(name, args = {}, fieldTypeCb = function () {}) {
    const fieldDescriptor = rawDescriptorForField(name, this.type.name);
    const node = new Graph(fieldDescriptor.typeName, this);

    node.addField('pageInfo', {}, pageInfo => {
      pageInfo.addField('hasNextPage');
      pageInfo.addField('hasPreviousPage');
    });

    node.addField('edges', {}, edges => {
      edges.addField('cursor');
      edges.addField('node', {}, fieldTypeCb);
    });

    this.fields.push({ name, args, node, fieldTypeCb });
  }
}
