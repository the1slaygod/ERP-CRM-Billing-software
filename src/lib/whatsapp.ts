export function buildWhatsAppChatUrl(phone: string, text: string): string {
  // Strip all non-digit characters
  let cleanPhone = phone.replace(/\D/g, "");

  // If the number lacks a country code (length is exactly 10), prepend '91' (India)
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
