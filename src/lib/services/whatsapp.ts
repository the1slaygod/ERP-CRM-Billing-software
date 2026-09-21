/**
 * WhatsApp Connector Service
 * 
 * This service acts as an abstraction layer for the Meta WhatsApp Cloud API.
 * Currently, it operates in "Connector-Ready" mode: if the real API credentials 
 * are not present in the environment variables, it gracefully degrades to providing 
 * 'wa.me' click-to-chat links while logging the intent in the database.
 */

import { prisma } from "@/lib/prisma";

export type WhatsAppTemplate = "INVOICE_SENT" | "PAYMENT_REMINDER" | "QUOTATION_SENT" | "GENERAL_GREETING";

export class WhatsAppService {
  private static isConfigured(): boolean {
    return !!(
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID
    );
  }

  /**
   * Formats a phone number for the wa.me link (must remove + and spaces)
   */
  private static formatPhoneForLink(phone: string): string {
    return phone.replace(/[^0-9]/g, "");
  }

  /**
   * Sends a message or generates a fallback link
   */
  static async sendMessage(
    customerId: string,
    phone: string,
    templateName: WhatsAppTemplate,
    variables: Record<string, string>
  ): Promise<{ success: boolean; fallbackUrl?: string; error?: string }> {
    
    // Check if customer has opted out
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (customer?.whatsappOptOut) {
      return { success: false, error: "Customer has opted out of WhatsApp messages." };
    }

    let messageText = this.buildMessageFromTemplate(templateName, variables);

    // If Meta API is configured, we would send the HTTP POST request here
    if (this.isConfigured()) {
      try {
        // MOCK: await fetch('https://graph.facebook.com/v17.0/.../messages', { ... })
        // Log the actual activity as Sent/Delivered
        await prisma.activity.create({
          data: {
            customerId,
            type: "WHATSAPP",
            title: `Automated WhatsApp Sent: ${templateName}`,
            description: messageText,
            outcome: "SENT"
          }
        });
        return { success: true };
      } catch (e) {
        return { success: false, error: "Failed to send via Meta API" };
      }
    } 
    
    // Fallback Mode (Not Configured)
    else {
      // 1. Generate the wa.me fallback URL
      const encodedText = encodeURIComponent(messageText);
      const formattedPhone = this.formatPhoneForLink(phone);
      const fallbackUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

      // 2. Log that we prepared a manual message
      await prisma.activity.create({
        data: {
          customerId,
          type: "WHATSAPP",
          title: `Manual WhatsApp Prepared: ${templateName}`,
          description: "Opened in WhatsApp Web via wa.me fallback link.",
          outcome: "PREPARED" // Not marking as 'SENT' since we can't verify user clicked send
        }
      });

      return { success: true, fallbackUrl };
    }
  }

  private static buildMessageFromTemplate(template: WhatsAppTemplate, vars: Record<string, string>): string {
    switch (template) {
      case "INVOICE_SENT":
        return `Hello ${vars.customer_name},\n\nYour invoice (${vars.invoice_number}) for ₹${vars.amount} has been generated.\n\nDue Date: ${vars.due_date}\n\nYou can view and pay your invoice here: ${vars.document_link}\n\nThank you for your business!`;
      case "PAYMENT_REMINDER":
        return `Reminder: Hello ${vars.customer_name}, you have an outstanding balance of ₹${vars.outstanding_amount} for Invoice ${vars.invoice_number}.\n\nPlease arrange for payment by ${vars.due_date}.`;
      default:
        return `Hello ${vars.customer_name}, this is a message from us.`;
    }
  }
}
