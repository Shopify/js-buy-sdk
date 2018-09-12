export default function handleCustomerMutation(mutationRootKey/* , client*/) {
    return function({data/* , model*/}) {
      const rootData = data[mutationRootKey]; /* const rootModel = model[mutationRootKey];*/
      const userErrors = rootData ? rootData.userErrors : [];
  
      if (userErrors.length) {
        return Promise.reject(new Error(JSON.stringify(userErrors)));
      }
      delete rootData.userErrors;
  
      return Promise.resolve(rootData);
    };
}