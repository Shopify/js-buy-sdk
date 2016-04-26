export default function isNodeLikeEnvironment() {
  const windowAbsent = typeof window === 'undefined';
  const requirePresent = typeof require === 'function';

  return windowAbsent && requirePresent;
}
