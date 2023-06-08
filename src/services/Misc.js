export default function exclude(object, keys) {
  for (const key of keys) {
    delete object[key];
  }
  return object;
}
