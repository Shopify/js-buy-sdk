import join from './join';
import descriptorForField from './descriptor-for-field';
import schemaForType from './schema-for-type';

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

class Field {
  constructor(name, args, selectionSet) {
    this.name = name;
    this.args = args;
    this.selectionSet = selectionSet;
  }
  toQuery() {
    return `${this.name}${formatArgs(this.args)}${this.selectionSet.toQuery()}`;
  }
}

class InlineFragment {
  constructor(typeName, selectionSet) {
    this.typeName = typeName;
    this.selectionSet = selectionSet;
  }
  toQuery() {
    return `... on ${this.typeName}${this.selectionSet.toQuery()}`;
  }
}

export default class Graph {
  constructor(type = 'QueryRoot', parent) {
    if (typeof type === 'string') {
      this.typeSchema = schemaForType(type);
    } else {
      this.typeSchema = type;
    }

    this.parent = parent;
    this.fields = [];
  }

  get label() {
    if (this.typeSchema.name === 'QueryRoot') {
      return 'query';
    }

    return `fragment on ${this.typeSchema.name}`;
  }

  get body() {
    if (this.typeSchema.kind === 'SCALAR') {
      return '';
    }

    return ` { ${this.selections} }`;
  }

  get selections() {
    return join(this.fields.map(field => {
      return field.toQuery();
    }));
  }

  toQuery() {
    if (this.parent) {
      return this.body;
    }

    return `${this.label} ${this.body}`;
  }

  addField(name, args = {}, fieldTypeCb = function () {}) {
    const fieldDescriptor = descriptorForField(name, this.typeSchema.name);
    const selectionSet = new Graph(fieldDescriptor.schema, this);

    fieldTypeCb(selectionSet);

    this.fields.push(new Field(name, args, selectionSet));
  }

  addConnection(name, args = {}, fieldTypeCb = function () {}) {
    const fieldDescriptor = descriptorForField(name, this.typeSchema.name);
    const selectionSet = new Graph(fieldDescriptor.schema, this);

    selectionSet.addField('pageInfo', {}, pageInfo => {
      pageInfo.addField('hasNextPage');
      pageInfo.addField('hasPreviousPage');
    });

    selectionSet.addField('edges', {}, edges => {
      edges.addField('cursor');
      edges.addField('node', {}, fieldTypeCb);
    });

    this.fields.push(new Field(name, args, selectionSet));
  }

  addInlineFragmentOn(typeName, fieldTypeCb = function () {}) {
    const selectionSet = new Graph(schemaForType(typeName), this);

    fieldTypeCb(selectionSet);
    this.fields.push(new InlineFragment(typeName, selectionSet));
  }
}
