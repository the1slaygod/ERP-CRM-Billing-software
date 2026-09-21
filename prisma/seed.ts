import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.inventoryTransaction.deleteMany()
  await prisma.invoiceItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.ledgerEntry.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.quotationItem.deleteMany()
  await prisma.quotation.deleteMany()
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding User...')
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashed_password_placeholder', // Should be bcrypt hashed in real life
      role: 'ADMIN'
    }
  })

  console.log('Seeding Customers...')
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Rahul Enterprises',
      company: 'Rahul Enterprises Pvt Ltd',
      phone: '+919876543210',
      whatsapp: '+919876543210',
      whatsappOptIn: true,
      email: 'contact@rahulenterprises.com',
      gstin: '27AADCB2230M1Z2',
      billingAddress: 'Andheri West, Mumbai',
      type: 'B2B',
      creditLimit: 500000,
    }
  })

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Amit Sharma',
      phone: '+919988776655',
      whatsapp: '+919988776655',
      whatsappOptIn: false,
      email: 'amit@example.com',
      billingAddress: 'Bandra, Mumbai',
      type: 'B2C',
      creditLimit: 10000,
    }
  })

  console.log('Seeding Products...')
  const prod1 = await prisma.product.create({
    data: {
      name: 'Industrial Widget A',
      sku: 'WID-IND-A',
      category: 'Hardware',
      hsnSac: '8471',
      costPrice: 1200,
      sellingPrice: 1500,
      gstPercent: 18,
      unit: 'pcs',
      openingStock: 100,
      currentStock: 100,
      reorderLevel: 20
    }
  })

  const prod2 = await prisma.product.create({
    data: {
      name: 'Premium Service Package',
      sku: 'SRV-PREM-1',
      category: 'Services',
      hsnSac: '9983',
      costPrice: 0,
      sellingPrice: 5000,
      gstPercent: 18,
      unit: 'service',
      openingStock: 0,
      currentStock: 0,
      reorderLevel: 0
    }
  })

  console.log('Seeding Inventory Ledger...')
  await prisma.inventoryTransaction.create({
    data: {
      productId: prod1.id,
      type: 'STOCK_IN',
      quantity: 100,
      reference: 'Opening Stock'
    }
  })

  console.log('Seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
