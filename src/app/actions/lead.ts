"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(leadId: string, newStatus: string) {
  try {
    // Determine status from string
    // Prisma enum: NEW_LEAD, CONTACTED, QUALIFIED, QUOTATION_SENT, NEGOTIATION, WON, LOST
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus as any },
    });
    
    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

export async function createLead(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const dealValue = parseFloat(formData.get("dealValue") as string) || 0;
  
  try {
    await prisma.lead.create({
      data: {
        name,
        company,
        dealValue,
        status: "NEW_LEAD",
      }
    });
    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function logLeadCall({ leadId, outcome, notes, nextFollowUpDate }: { leadId: string, outcome: string, notes?: string, nextFollowUpDate?: string }) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { success: false, error: "Lead not found" };

    if (lead.status === "NEW_LEAD") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "CONTACTED" },
      });
    }

    await prisma.activity.create({
      data: {
        leadId,
        type: "CALL",
        title: `Call: ${outcome}`,
        description: notes,
        outcome,
      },
    });

    if (nextFollowUpDate) {
      await prisma.task.create({
        data: {
          title: `Follow up call`,
          leadId,
          dueDate: new Date(nextFollowUpDate),
          status: "TODO",
          priority: "MEDIUM"
        }
      });
    }

    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    console.error("Error logging call:", error);
    return { success: false, error: "Failed to log call" };
  }
}

export async function logLeadWhatsApp({ leadId, text }: { leadId: string, text: string }) {
  try {
    await prisma.activity.create({
      data: {
        leadId,
        type: "WHATSAPP",
        title: "WhatsApp Message Sent",
        description: text,
      }
    });
    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    console.error("Error logging WhatsApp:", error);
    return { success: false, error: "Failed to log WhatsApp message" };
  }
}

export async function getLeadDetails(id: string) {
  try {
    return await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { date: 'desc' }
        },
        customer: true
      }
    });
  } catch (error) {
    console.error("Error fetching lead details:", error);
    return null;
  }
}

export async function convertLeadToCustomer(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { success: false, error: "Lead not found" };
    if (lead.customerId) return { success: false, error: "Lead already converted" };

    const customer = await prisma.$transaction(async (tx) => {
      // Create new customer
      const newCustomer = await tx.customer.create({
        data: {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
        }
      });

      // Link lead to customer
      await tx.lead.update({
        where: { id: leadId },
        data: { customerId: newCustomer.id, status: "WON" }
      });

      // Record system activity
      await tx.activity.create({
        data: {
          customerId: newCustomer.id,
          type: "SYSTEM",
          title: "Converted from Lead",
          description: `Automatically created customer from lead record.`
        }
      });

      return newCustomer;
    });

    revalidatePath("/leads");
    revalidatePath("/customers");
    
    return { success: true, customerId: customer.id };
  } catch (error: any) {
    console.error("Error converting lead:", error);
    return { success: false, error: error.message || "Failed to convert lead" };
  }
}
