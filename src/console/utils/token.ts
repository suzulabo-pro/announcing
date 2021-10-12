export const generateImportToken = (len = 20) => {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  const random = crypto.getRandomValues(new Uint8Array(len));
  const l = [] as string[];
  random.forEach(v => {
    l.push(chars.charAt(v % 32));
  });
  return l.join('');
};
