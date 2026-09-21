import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  console.log("=== STARTING TRANSACTION ROLLBACK TEST ===");
  
  // 1. Get initial state
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst({ where: { name: 'Industrial Widget A' } });
  
  if (!customer || !product) {
    console.error("Missing seed data.");
    process.exit(1);
  }

  const initialStock = product.currentStock;
  const initialInvoices = await prisma.invoice.count();
  const initialLedger = await prisma.ledgerEntry.count();

  console.log(`Initial State:`);
  console.log(`- Invoices: ${initialInvoices}`);
  console.log(`- Ledger Entries: ${initialLedger}`);
  console.log(`- Product Stock: ${initialStock}`);
  console.log("\nAttempting malicious transaction that will fail halfway through...");

  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          number: 'INV-FAIL-TEST-1',
          customerId: customer.id,
          subtotal: 1500,
          grandTotal: 1770,
          taxableValue: 1500,
          cgst: 135,
          sgst: 135,
          type: 'GST',
          status: 'UNPAID',
        }
      });
      console.log("✓ Created Invoice inside transaction");

      // Step 2: Create Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          customerId: customer.id,
          type: 'DEBIT',
          amount: 1770,
          referenceId: invoice.id,
        }
      });
      console.log("✓ Created Ledger Entry inside transaction");

      // Step 3: Deduct Stock
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: { decrement: 10 } }
      });
      console.log("✓ Deducted 10 stock inside transaction");

      // Step 4: INTENTIONAL FAILURE
      console.log("! Throwing intentional error to trigger rollback...");
      throw new Error("INTENTIONAL_SIMULATED_FAILURE");
      
    });
  } catch (error: any) {
    console.log(`\nTransaction caught error: ${error.message}`);
    console.log("Verifying Postgres Rollback...");
  }

  // 2. Verify Final State
  const finalStock = (await prisma.product.findUnique({ where: { id: product.id } }))?.currentStock;
  const finalInvoices = await prisma.invoice.count();
  const finalLedger = await prisma.ledgerEntry.count();

  console.log(`\nFinal State:`);
  console.log(`- Invoices: ${finalInvoices}`);
  console.log(`- Ledger Entries: ${finalLedger}`);
  console.log(`- Product Stock: ${finalStock}`);

  if (finalStock === initialStock && finalInvoices === initialInvoices && finalLedger === initialLedger) {
    console.log("\n✅ SUCCESS: Postgres successfully rolled back all related operations. No partial financial data was saved.");
  } else {
    console.error("\n❌ FAILED: Data was partially saved. Transaction isolation failed.");
  }
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
