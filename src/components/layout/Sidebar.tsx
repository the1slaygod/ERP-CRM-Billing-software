"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  CheckSquare,
  MessageSquare,
  Settings,
  PieChart,
  Boxes,
  Receipt
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Customers", href: "/customers", icon: Building2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Sales Orders", href: "/sales-orders", icon: ShoppingCart },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Communication", href: "/communication", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight">Business ERP</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
