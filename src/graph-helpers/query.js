import QueryRoot from 'graph/query-root';
import relationship from './relationship';

export default function query(/* resource, [requestArgs], [callback] */) {
  const args = [...arguments];

  args.unshift(QueryRoot);

  return `query { ${relationship(...args)} }`;
}
