export function generateId(prefix: string): string {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${randomNum}`;
}

export function generateRefNo(): string {
  return generateId('REF');
}
