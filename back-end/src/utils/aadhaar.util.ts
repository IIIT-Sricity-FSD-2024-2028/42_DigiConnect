export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(8)}`;
}
