import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: "You are an autonomous ERP AI. You have full access to manage the business. You can chain multiple tools together. If a user gives a compound request (e.g., 'Add a lead and create a task'), execute both tools sequentially before replying. Be concise. Never invent data.",
    messages,
    tools: {
      createLead: tool({
        description: 'Create a new lead in the CRM',
        parameters: z.object({
          name: z.string().describe("Name of the lead/person"),
          company: z.string().describe("Company name"),
          email: z.string().optional().describe("Email address")
        }),
        execute: async ({ name, company, email }) => {
          try {
            const lead = await prisma.lead.create({
              data: {
                name,
                company,
                email,
                status: 'NEW_LEAD'
              }
            });
            return { success: true, id: lead.id, name: lead.name, company: lead.company };
          } catch (error: any) {
            console.error("Tool createLead error:", error);
            return { error: error.message || "Failed to create lead" };
          }
        }
      }),

      createTask: tool({
        description: 'Create a new task or reminder',
        parameters: z.object({
          title: z.string().describe("Title or description of the task"),
          dueDate: z.string().optional().describe("Optional ISO date string for when the task is due")
        }),
        execute: async ({ title, dueDate }) => {
          try {
            const task = await prisma.task.create({
              data: {
                title,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'TODO'
              }
            });
            return { success: true, id: task.id, title: task.title, status: task.status };
          } catch (error: any) {
            console.error("Tool createTask error:", error);
            return { error: error.message || "Failed to create task" };
          }
        }
      }),

      updateInventoryStock: tool({
        description: 'Increment or decrement the stock quantity of a product',
        parameters: z.object({
          productName: z.string().describe("Name of the product to update"),
          quantityToAdd: z.number().describe("Quantity to add (use negative for deduction)")
        }),
        execute: async ({ productName, quantityToAdd }) => {
          try {
            const product = await prisma.product.findFirst({
              where: { name: { contains: productName, mode: 'insensitive' } }
            });
            if (!product) return { error: `Product matching '${productName}' not found` };

            const updatedProduct = await prisma.product.update({
              where: { id: product.id },
              data: {
                currentStock: {
                  increment: quantityToAdd
                }
              }
            });
            return { 
              success: true, 
              id: updatedProduct.id, 
              name: updatedProduct.name, 
              newStock: updatedProduct.currentStock 
            };
          } catch (error: any) {
            console.error("Tool updateInventoryStock error:", error);
            return { error: error.message || "Failed to update inventory" };
          }
        }
      }),

      getCustomerHistory: tool({
        description: 'Get recent invoices and payments for a customer',
        parameters: z.object({
          customerName: z.string().describe("Name of the customer")
        }),
        execute: async ({ customerName }) => {
          try {
            const customer = await prisma.customer.findFirst({
              where: { name: { contains: customerName, mode: 'insensitive' } },
              include: {
                invoices: {
                  take: 3,
                  orderBy: { date: 'desc' },
                  select: { id: true, number: true, grandTotal: true, status: true, date: true }
                },
                payments: {
                  take: 3,
                  orderBy: { date: 'desc' },
                  select: { id: true, amount: true, method: true, date: true }
                }
              }
            });
            
            if (!customer) return { error: `Customer '${customerName}' not found` };
            
            return {
              id: customer.id,
              name: customer.name,
              balance: customer.creditLimit, // Just proxying a field
              invoices: customer.invoices,
              payments: customer.payments
            };
          } catch (error: any) {
            console.error("Tool getCustomerHistory error:", error);
            return { error: error.message || "Failed to fetch customer history" };
          }
        }
      }),
      getUnpaidInvoices: tool({
        description: 'Get a list of unpaid or overdue invoices',
        parameters: z.object({}),
        execute: async () => {
          try {
            const invoices = await prisma.invoice.findMany({
              where: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } },
              include: { customer: true },
              take: 10
            });
            return invoices.map(inv => ({
              id: inv.id,
              customerName: inv.customer.name,
              grandTotal: inv.grandTotal,
              number: inv.number,
              status: inv.status
            }));
          } catch (error) {
            console.error("Tool getUnpaidInvoices error:", error);
            return { error: "Failed to fetch invoices" };
          }
        },
      }),
      
      getInventoryStatus: tool({
        description: 'Check inventory for low stock items',
        parameters: z.object({}),
        execute: async () => {
          try {
            const products = await prisma.product.findMany({
              where: { currentStock: { lt: 10 } },
              select: { name: true, currentStock: true, sku: true },
              take: 10
            });
            return products;
          } catch (error) {
            console.error("Tool getInventoryStatus error:", error);
            return { error: "Failed to fetch inventory" };
          }
        },
      }),

      searchCustomers: tool({
        description: 'Search for customers by name or email',
        parameters: z.object({ query: z.string().describe("Name or email to search") }),
        execute: async ({ query }) => {
          try {
            return await prisma.customer.findMany({
              where: {
                OR: [
                  { name: { contains: query.trim(), mode: 'insensitive' } },
                  { email: { contains: query.trim(), mode: 'insensitive' } }
                ]
              },
              take: 5,
              select: { id: true, name: true, email: true, creditLimit: true, type: true }
            });
          } catch (error) {
            console.error("Tool searchCustomers error:", error);
            return { error: "Failed to search customers" };
          }
        },
      }),

      searchProducts: tool({
        description: 'Search for products by name or SKU',
        parameters: z.object({ query: z.string().describe("Name or SKU to search") }),
        execute: async ({ query }) => {
          try {
            return await prisma.product.findMany({
              where: {
                OR: [
                  { name: { contains: query.trim(), mode: 'insensitive' } },
                  { sku: { contains: query.trim(), mode: 'insensitive' } }
                ]
              },
              take: 5,
              select: { id: true, name: true, sku: true, currentStock: true, sellingPrice: true, hsnSac: true }
            });
          } catch (error) {
            console.error("Tool searchProducts error:", error);
            return { error: "Failed to search products" };
          }
        },
      }),

      getFinancialSummary: tool({
        description: 'Get an aggregate summary of revenue, pending amounts, and expenses',
        parameters: z.object({}),
        execute: async () => {
          try {
            const [revenueAggr, pendingAggr, expenseAggr] = await Promise.all([
              prisma.invoice.aggregate({
                _sum: { grandTotal: true },
                where: { status: { in: ['PAID', 'FINALIZED'] } }
              }),
              prisma.invoice.aggregate({
                _sum: { grandTotal: true },
                where: { status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } }
              }),
              prisma.expense.aggregate({
                _sum: { amount: true }
              })
            ]);
            return {
              revenue: revenueAggr._sum.grandTotal || 0,
              pending: pendingAggr._sum.grandTotal || 0,
              expenses: expenseAggr._sum.amount || 0
            };
          } catch (error) {
            console.error("Tool getFinancialSummary error:", error);
            return { error: "Failed to generate financial summary" };
          }
        },
      }),

      getRecentLeads: tool({
        description: 'Get the most recent leads and their statuses',
        parameters: z.object({}),
        execute: async () => {
          try {
            return await prisma.lead.findMany({
              take: 5,
              orderBy: { createdAt: 'desc' },
              select: { id: true, name: true, status: true, dealValue: true, probability: true }
            });
          } catch (error) {
            console.error("Tool getRecentLeads error:", error);
            return { error: "Failed to fetch recent leads" };
          }
        },
      }),

      createInvoiceDraft: tool({
        description: 'Draft a new invoice for a customer',
        parameters: z.object({
          customerName: z.string().describe("The name of the customer"),
          items: z.array(z.object({
            name: z.string().describe("The name of the product/service"),
            qty: z.number().describe("Quantity"),
            rate: z.number().describe("Rate or unit price")
          })).describe("The line items for the invoice")
        }),
        execute: async ({ customerName, items }) => {
          try {
            if (!items || items.length === 0) throw new Error("At least one item is required");
            if (items.some(i => i.qty <= 0 || i.rate < 0)) throw new Error("Quantities must be > 0 and rates must be >= 0");
            
            const sanitizedCustomerName = customerName.trim();
            if (!sanitizedCustomerName) throw new Error("Customer name cannot be empty");

            // Find or create customer
            let customer = await prisma.customer.findFirst({
              where: { name: { equals: sanitizedCustomerName, mode: 'insensitive' } }
            });
            
            if (!customer) {
              customer = await prisma.customer.create({
                data: {
                  name: sanitizedCustomerName,
                  email: "",
                  phone: "",
                  billingAddress: ""
                }
              });
            }

            let subtotal = 0;
            let totalCgst = 0;
            let totalSgst = 0;

            const invoiceItemsData = [];

            for (const item of items) {
              let product = await prisma.product.findFirst({
                where: { name: { equals: item.name.trim(), mode: 'insensitive' } }
              });

              if (!product) {
                product = await prisma.product.create({
                  data: {
                    name: item.name.trim(),
                    sku: `SKU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`,
                    sellingPrice: item.rate,
                    unit: 'pcs'
                  }
                });
              }

              const taxPercent = item.rate <= 2500 ? 5 : 18;
              const taxableValue = item.qty * item.rate;
              const taxAmount = (taxableValue * taxPercent) / 100;
              const cgst = taxAmount / 2;
              const sgst = taxAmount / 2;
              const total = taxableValue + taxAmount;

              subtotal += taxableValue;
              totalCgst += cgst;
              totalSgst += sgst;

              invoiceItemsData.push({
                productId: product.id,
                quantity: item.qty,
                rate: item.rate,
                unit: product.unit || 'pcs',
                taxableValue,
                cgst,
                sgst,
                igst: 0,
                total,
                discount: 0
              });
            }

            const grandTotal = subtotal + totalCgst + totalSgst;
            const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

            const invoice = await prisma.invoice.create({
              data: {
                number: invoiceNumber,
                date: new Date(),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                status: "DRAFT",
                type: "GST",
                customerId: customer.id,
                subtotal,
                discount: 0,
                taxableValue: subtotal,
                cgst: totalCgst,
                sgst: totalSgst,
                igst: 0,
                grandTotal,
                items: {
                  create: invoiceItemsData
                }
              }
            });
            
            return {
              id: invoice.id,
              grandTotal: invoice.grandTotal,
              customerName: customer.name
            };
          } catch (error: any) {
            console.error("Tool createInvoiceDraft error:", error);
            return { error: error.message || "Failed to create invoice draft" };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
