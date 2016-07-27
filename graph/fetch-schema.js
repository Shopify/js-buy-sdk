import fetch from 'node-fetch';
import introspectionQuery from './introspection-query';

const baseGraphUrl = 'https://graphql.myshopify.com/api/graph';

export default function fetchSchema() {
  return fetch(baseGraphUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic MzUxYzEyMjAxN2QwZjJhOTU3ZDMyYWU3MjhhZDc0OWM=',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `query=${introspectionQuery}`
  }).then(response => {
    return response.json();
  });
}
