"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Activity, CreditCard, ArrowRight } from "lucide-react";

export function CustomerTabs({ customer }: { customer: any }) {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "invoices"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <FileText className="h-4 w-4" /> Invoices
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ledger"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Ledger
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "activity"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Activity className="h-4 w-4" /> Activity
        </button>
      </div>

      <div className="min-h-[300px]">
        {activeTab === "invoices" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice Number</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.invoices.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No invoices found.</td></tr>
                  ) : customer.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-indigo-600">{inv.number}</td>
                      <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold">₹{inv.grandTotal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "ledger" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Debit</th>
                    <th className="px-4 py-3 font-medium text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.ledgerEntries?.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No ledger entries found.</td></tr>
                  ) : customer.ledgerEntries?.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{new Date(entry.date).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.description}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {entry.type === 'DEBIT' ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {entry.type === 'CREDIT' ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="p-6">
            {customer.activities.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">No activity recorded.</div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {customer.activities.map((activity: any, index: number) => (
                  <div key={activity.id} className="relative pb-8">
                    {index !== customer.activities.length - 1 && (
                      <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white ${
                          activity.type === 'WHATSAPP' ? 'bg-green-500' :
                          activity.type === 'EMAIL' ? 'bg-blue-500' :
                          activity.type === 'SYSTEM' ? 'bg-slate-400' : 'bg-indigo-500'
                        }`}>
                          {activity.type === 'WHATSAPP' ? (
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          ) : activity.type === 'EMAIL' ? (
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          ) : (
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-slate-500">
                          <span className="font-medium text-slate-900 mr-2">{activity.title}</span>
                          <span className="whitespace-nowrap">{new Date(activity.date).toLocaleString()}</span>
                        </div>
                        {activity.description && (
                          <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 shadow-sm">
                            <p className="whitespace-pre-wrap">{activity.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
