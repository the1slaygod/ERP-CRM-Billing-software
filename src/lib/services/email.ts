import nodemailer from 'nodemailer';
import { prisma } from "@/lib/prisma";

export type EmailTemplate = "INVOICE" | "QUOTATION" | "PAYMENT_RECEIPT" | "GENERAL";

export class EmailService {
  private static isConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
    );
  }

  private static getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Generates a mock PDF buffer (In a real app, use puppeteer or @react-pdf/renderer here)
   */
  private static async generateDocumentPDF(documentId: string, type: "INVOICE" | "QUOTATION"): Promise<Buffer> {
    // Mocking PDF generation
    return Buffer.from(`%PDF-1.4\n%Mock PDF for ${type} ${documentId}\n%%EOF`);
  }

  static async sendEmailWithDocument(
    customerId: string,
    toEmail: string,
    templateName: EmailTemplate,
    documentId: string,
    variables: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    
    const subject = this.getSubject(templateName, variables);
    const htmlBody = this.getHtmlBody(templateName, variables);

    // 1. Generate PDF Attachment
    let attachment: Buffer | null = null;
    let filename = 'document.pdf';
    
    if (templateName === "INVOICE") {
      attachment = await this.generateDocumentPDF(documentId, "INVOICE");
      filename = `Invoice_${variables.invoice_number}.pdf`;
    } else if (templateName === "QUOTATION") {
      attachment = await this.generateDocumentPDF(documentId, "QUOTATION");
      filename = `Quotation_${variables.quotation_number}.pdf`;
    }

    // 2. Send or Mock Email
    if (this.isConfigured()) {
      try {
        const transporter = this.getTransporter();
        
        const mailOptions = {
          from: process.env.SMTP_FROM,
          to: toEmail,
          subject,
          html: htmlBody,
          attachments: attachment ? [
            {
              filename,
              content: attachment,
              contentType: 'application/pdf'
            }
          ] : []
        };

        await transporter.sendMail(mailOptions);

        // Log to database
        await prisma.activity.create({
          data: {
            customerId,
            type: "EMAIL",
            title: `Email Sent: ${subject}`,
            description: `Sent to ${toEmail} with attachment ${filename}`,
            outcome: "SENT"
          }
        });

        return { success: true };
      } catch (error: any) {
        console.error("Email send failed:", error);
        return { success: false, error: error.message || "Failed to send email" };
      }
    } 
    // Fallback Mode (Console logging)
    else {
      console.log(`\n📧 [EMAIL FALLBACK MODE]`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Attachment generated: ${filename}`);
      console.log(`Body: ${htmlBody.substring(0, 100)}...\n`);

      await prisma.activity.create({
        data: {
          customerId,
          type: "EMAIL",
          title: `Email Prepared: ${subject}`,
          description: `Simulated sending to ${toEmail} with attachment ${filename} (SMTP Not Configured).`,
          outcome: "PREPARED"
        }
      });

      return { success: true }; // Pretend success in dev mode
    }
  }

  private static getSubject(template: EmailTemplate, vars: Record<string, string>): string {
    switch (template) {
      case "INVOICE": return `Invoice ${vars.invoice_number} from Your Company`;
      case "QUOTATION": return `Quotation ${vars.quotation_number} from Your Company`;
      case "PAYMENT_RECEIPT": return `Payment Receipt for Invoice ${vars.invoice_number}`;
      default: return `Message from Your Company`;
    }
  }

  private static getHtmlBody(template: EmailTemplate, vars: Record<string, string>): string {
    switch (template) {
      case "INVOICE":
        return `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${vars.customer_name},</h2>
            <p>Please find attached your invoice <strong>${vars.invoice_number}</strong> for the amount of <strong>₹${vars.amount}</strong>.</p>
            <p>The due date for this invoice is <strong>${vars.due_date}</strong>.</p>
            <br/>
            <p>Thank you for your business!</p>
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply directly to this address.</p>
          </div>
        `;
      default:
        return `<p>Hello ${vars.customer_name}, please find the requested documents attached.</p>`;
    }
  }
}
