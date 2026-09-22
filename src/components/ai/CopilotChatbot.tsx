"use client";

import { useEffect, useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Sparkles, X, ArrowRight, FileText, AlertCircle, MessageSquare, Send, Users, Package, TrendingUp, DollarSign, CheckCircle2, History } from "lucide-react";
import Link from "next/link";

export function CopilotChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatState = useChat({
    api: "/api/chat",
  });
  
  const { messages, status } = chatState;
  const append = (chatState as any).append || (chatState as any).sendMessage;
  
  const isLoading = status === 'streaming' || status === 'submitted';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !append) return;
    append({ role: "user", content: input });
    setInput("");
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Toggle on Cmd+J or Ctrl+J
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle AI Copilot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-full max-w-[400px] sm:w-[400px] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white shrink-0">
            <div className="flex items-center gap-2 text-zinc-800">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <span className="font-semibold text-base tracking-wide block">AI Copilot</span>
                <span className="text-xs text-zinc-400 block">Cmd+J to toggle</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-full hover:bg-zinc-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-5 bg-zinc-50/50"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-zinc-600 text-center px-4">How can I help you today?</p>
                <div className="text-xs opacity-60 text-center space-y-1">
                  <p>"Draft an invoice for Acme Corp with 2 items at 2000"</p>
                  <p>"Show my financial summary"</p>
                  <p>"Find customer John Doe"</p>
                </div>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                {m.role === 'user' ? (
                  <div className="self-end max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm">
                    {m.content}
                  </div>
                ) : (
                  <div className="self-start w-full max-w-[95%] space-y-3">
                    {m.content && (
                      <div className="text-zinc-800 text-sm leading-relaxed bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        {m.content}
                      </div>
                    )}

                    {m.toolInvocations?.map((toolInvocation: any) => {
                      const toolCallId = toolInvocation.toolCallId;
                      
                      if (toolInvocation.state === 'result') {
                        const result = toolInvocation.result;

                        if (result?.error) {
                          return (
                            <div key={toolCallId} className="border border-red-200 rounded-xl p-3 bg-red-50 text-red-600 text-xs shadow-sm w-full flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{result.error}</span>
                            </div>
                          );
                        }

                        // Generic Action Success Card for mutations
                        if (['createLead', 'createTask', 'updateInventoryStock'].includes(toolInvocation.toolName) && result?.success) {
                          let title = "Action Completed";
                          if (toolInvocation.toolName === 'createLead') title = `Lead Created: ${result.name}`;
                          if (toolInvocation.toolName === 'createTask') title = `Task Created: ${result.title}`;
                          if (toolInvocation.toolName === 'updateInventoryStock') title = `Stock Updated: ${result.name} (${result.newStock} total)`;
                          
                          return (
                            <div key={toolCallId} className="border border-dashed border-green-200 rounded-xl p-4 bg-green-50/30 shadow-sm w-full">
                              <div className="flex items-center gap-2 text-green-700 mb-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-semibold text-sm">{title}</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 pl-6">ID: {result.id}</p>
                            </div>
                          );
                        }

                        if (toolInvocation.toolName === 'createInvoiceDraft') {
                          return (
                            <div key={toolCallId} className="border border-dashed border-blue-200 rounded-xl p-4 bg-blue-50/50 shadow-sm w-full">
                              <div className="flex items-center gap-2 text-blue-600 mb-3 border-b border-blue-100 pb-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-semibold text-sm">Draft Invoice Created</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                <div>
                                  <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Customer</p>
                                  <p className="font-semibold text-zinc-800 truncate" title={result.customerName}>{result.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-blue-400 text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Total</p>
                                  <p className="font-bold text-zinc-800">₹{result.grandTotal?.toLocaleString()}</p>
                                </div>
                              </div>
                              <Link href={`/invoices/${result.id}`} onClick={() => setIsOpen(false)}>
                                <button className="w-full flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-800 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors shadow-sm">
                                  View Invoice
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </Link>
                            </div>
                          );
                        }

                        if (toolInvocation.toolName === 'getUnpaidInvoices') {
                          return (
                            <div key={toolCallId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm w-full">
                              <div className="bg-amber-50 px-3 py-2.5 border-b border-amber-100 text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Pending Invoices
                              </div>
                              <div className="divide-y divide-zinc-100 bg-white">
                                {result.length === 0 ? (
                                  <div className="p-4 text-sm text-zinc-500 text-center">No pending invoices.</div>
                                ) : (
                                  result.map((inv: any) => (
                                    <Link href={`/invoices/${inv.id}`} key={inv.id} onClick={() => setIsOpen(false)}>
                                      <div className="flex justify-between items-center p-3 hover:bg-zinc-50 transition-colors cursor-pointer group">
                                        <div className="truncate pr-3">
                                          <p className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors truncate">{inv.customerName}</p>
                                          <p className="text-[11px] text-zinc-400 mt-0.5">{inv.number} • {inv.status}</p>
                                        </div>
                                        <div className="text-[13px] font-bold text-zinc-700 bg-zinc-100 px-2 py-1 rounded-md shrink-0">
                                          ₹{inv.grandTotal?.toLocaleString()}
                                        </div>
                                      </div>
                                    </Link>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        if (toolInvocation.toolName === 'getInventoryStatus') {
                           return (
                              <div key={toolCallId} className="border border-red-100 rounded-xl overflow-hidden shadow-sm w-full">
                                 <div className="bg-red-50 px-3 py-2.5 border-b border-red-100 text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5" />
                                    Low Stock Alerts
                                 </div>
                                 <div className="divide-y divide-zinc-100 bg-white">
                                    {result.length === 0 ? (
                                       <div className="p-4 text-sm text-zinc-500 text-center">No low stock items.</div>
                                    ) : (
                                       result.map((p: any) => (
                                          <div key={p.sku} className="flex justify-between items-center p-3">
                                             <div className="text-sm font-medium text-zinc-800 truncate pr-3">{p.name}</div>
                                             <div className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md shrink-0">
                                                {p.currentStock} left
                                             </div>
                                          </div>
                                       ))
                                    )}
                                 </div>
                              </div>
                           );
                        }

                        if (toolInvocation.toolName === 'searchCustomers') {
                          return (
                             <div key={toolCallId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm w-full">
                                <div className="bg-zinc-100 px-3 py-2.5 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                   <Users className="w-3.5 h-3.5" />
                                   Customer Search Results
                                </div>
                                <div className="divide-y divide-zinc-100 bg-white">
                                   {result.length === 0 ? (
                                      <div className="p-4 text-sm text-zinc-500 text-center">No customers found.</div>
                                   ) : (
                                      result.map((c: any) => (
                                         <Link href={`/settings/customers/${c.id}`} key={c.id} onClick={() => setIsOpen(false)}>
                                            <div className="p-3 hover:bg-zinc-50 transition-colors cursor-pointer group">
                                               <p className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors">{c.name}</p>
                                               <div className="flex justify-between items-center mt-1">
                                                  <p className="text-[11px] text-zinc-500 truncate">{c.email || 'No email'}</p>
                                                  <span className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">{c.type}</span>
                                               </div>
                                            </div>
                                         </Link>
                                      ))
                                   )}
                                </div>
                             </div>
                          );
                        }

                        if (toolInvocation.toolName === 'searchProducts') {
                          return (
                             <div key={toolCallId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm w-full">
                                <div className="bg-zinc-100 px-3 py-2.5 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                   <Package className="w-3.5 h-3.5" />
                                   Product Search Results
                                </div>
                                <div className="divide-y divide-zinc-100 bg-white">
                                   {result.length === 0 ? (
                                      <div className="p-4 text-sm text-zinc-500 text-center">No products found.</div>
                                   ) : (
                                      result.map((p: any) => (
                                         <div key={p.id} className="p-3">
                                            <div className="flex justify-between items-start">
                                               <p className="text-sm font-semibold text-zinc-800 truncate pr-2">{p.name}</p>
                                               <p className="text-sm font-bold text-zinc-700 shrink-0">₹{p.sellingPrice?.toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-1 text-[11px]">
                                               <p className="text-zinc-500">SKU: {p.sku}</p>
                                               <span className={`font-medium px-1.5 py-0.5 rounded ${p.currentStock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                  Stock: {p.currentStock}
                                               </span>
                                            </div>
                                         </div>
                                      ))
                                   )}
                                </div>
                             </div>
                          );
                        }

                        if (toolInvocation.toolName === 'getFinancialSummary') {
                          return (
                             <div key={toolCallId} className="border border-zinc-200 rounded-xl p-4 bg-white shadow-sm w-full">
                                <div className="flex items-center gap-2 text-zinc-600 mb-4 border-b border-zinc-100 pb-2">
                                   <DollarSign className="w-4 h-4" />
                                   <span className="font-semibold text-sm">Financial Summary</span>
                                </div>
                                <div className="space-y-3">
                                   <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex justify-between items-center">
                                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Revenue</span>
                                      <span className="text-sm font-bold text-green-700">₹{result.revenue?.toLocaleString()}</span>
                                   </div>
                                   <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex justify-between items-center">
                                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</span>
                                      <span className="text-sm font-bold text-amber-700">₹{result.pending?.toLocaleString()}</span>
                                   </div>
                                   <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex justify-between items-center">
                                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Expenses</span>
                                      <span className="text-sm font-bold text-red-700">₹{result.expenses?.toLocaleString()}</span>
                                   </div>
                                </div>
                             </div>
                          );
                        }

                        if (toolInvocation.toolName === 'getCustomerHistory') {
                          return (
                             <div key={toolCallId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm w-full">
                                <div className="bg-zinc-100 px-3 py-2.5 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                   <History className="w-3.5 h-3.5" />
                                   Customer History: {result.name}
                                </div>
                                <div className="p-3 bg-white">
                                  <p className="text-[11px] font-semibold text-zinc-500 uppercase mb-2">Recent Invoices</p>
                                  <div className="space-y-2 mb-4">
                                    {result.invoices?.length === 0 ? <p className="text-xs text-zinc-400">No recent invoices.</p> : null}
                                    {result.invoices?.map((inv: any) => (
                                      <div key={inv.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded">
                                        <span className="font-medium text-zinc-800">{inv.number}</span>
                                        <div className="flex gap-2 items-center">
                                          <span className="text-zinc-500">{inv.status}</span>
                                          <span className="font-bold text-zinc-700">₹{inv.grandTotal?.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[11px] font-semibold text-zinc-500 uppercase mb-2">Recent Payments</p>
                                  <div className="space-y-2">
                                    {result.payments?.length === 0 ? <p className="text-xs text-zinc-400">No recent payments.</p> : null}
                                    {result.payments?.map((pay: any) => (
                                      <div key={pay.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded">
                                        <span className="font-medium text-zinc-800">{new Date(pay.date).toLocaleDateString()}</span>
                                        <div className="flex gap-2 items-center">
                                          <span className="text-zinc-500">{pay.method}</span>
                                          <span className="font-bold text-green-600">₹{pay.amount?.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                             </div>
                          );
                        }

                        if (toolInvocation.toolName === 'getRecentLeads') {
                          return (
                             <div key={toolCallId} className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm w-full">
                                <div className="bg-zinc-100 px-3 py-2.5 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                   <TrendingUp className="w-3.5 h-3.5" />
                                   Recent Leads
                                </div>
                                <div className="divide-y divide-zinc-100 bg-white">
                                   {result.length === 0 ? (
                                      <div className="p-4 text-sm text-zinc-500 text-center">No recent leads.</div>
                                   ) : (
                                      result.map((l: any) => (
                                         <Link href={`/leads`} key={l.id} onClick={() => setIsOpen(false)}>
                                            <div className="p-3 hover:bg-zinc-50 transition-colors cursor-pointer group">
                                               <div className="flex justify-between items-center mb-1">
                                                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-blue-600 transition-colors truncate">{l.name}</p>
                                                  <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded shrink-0">{l.status}</span>
                                               </div>
                                               <div className="flex justify-between items-center text-[11px] text-zinc-500">
                                                  <p>Value: ₹{l.dealValue?.toLocaleString() || 0}</p>
                                                  <p>Prob: {l.probability || 0}%</p>
                                               </div>
                                            </div>
                                         </Link>
                                      ))
                                   )}
                                </div>
                             </div>
                          );
                        }

                      } else {
                        return (
                          <div key={toolCallId} className="flex items-center gap-2 text-zinc-500 text-xs font-medium mt-1 bg-white px-3 py-2 rounded-lg max-w-fit border border-zinc-200 shadow-sm">
                            <div className="w-3 h-3 border-2 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
                            Executing {toolInvocation.toolName}...
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.toolInvocations && (
               <div className="flex gap-1 items-center h-4 text-zinc-400 pt-1 pb-2 pl-2">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
               </div>
            )}
          </div>

          {/* Sticky Input */}
          <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
            <form 
              onSubmit={handleFormSubmit} 
              className="relative flex items-center"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Copilot..."
                className="w-full bg-zinc-100 border border-transparent rounded-full pl-5 pr-12 py-3.5 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-zinc-500"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-zinc-300 disabled:text-zinc-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
