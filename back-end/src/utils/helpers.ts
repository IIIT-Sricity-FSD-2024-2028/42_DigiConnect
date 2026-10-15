export function generateId(prefix: string, scopeCode?: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000).toString();
  if (scopeCode) {
    const clean = scopeCode.replace('state_', '').toUpperCase();
    return `${prefix}-${clean}-${randomNum}`;
  }
  return `${prefix}-${randomNum}`;
}

export function generateRefNo(): string {
  return generateId('REF');
}
