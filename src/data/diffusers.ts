/** Price formatting shared by catalogue views. (Diffuser data now comes from the synced catalogue: src/lib/catalog.) */
export const formatAED = (n: number) =>
  'AED ' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
