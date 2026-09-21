"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getLeadDetails, logLeadCall, logLeadWhatsApp, convertLeadToCustomer } from "@/app/actions/lead";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp";
import { X, Phone, MessageCircle, Calendar, Trophy } from "lucide-react";

type LeadDrawerProps = {
  leadId: string | null;
  onClose: () => void;
};

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState("Connected");
  const [notes, setNotes] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [whatsappTemplate, setWhatsappTemplate] = useState("Hi, following up on your inquiry.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setLead(null);
      return;
    }
    
    let isMounted = true;
    setLoading(true);
    getLeadDetails(leadId).then((data) => {
      if (isMounted) {
        setLead(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [leadId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!leadId) return null;

  const handleLogCall = async () => {
    setIsSubmitting(true);
    const result = await logLeadCall({
      leadId,
      outcome,
      notes,
      nextFollowUpDate: nextFollowUpDate || undefined,
    });
    
    if (result.success) {
      toast.success("Call logged successfully");
      const updatedLead = await getLeadDetails(leadId);
      setLead(updatedLead);
      setNotes("");
      setNextFollowUpDate("");
    } else {
      toast.error("Failed to log call");
    }
    setIsSubmitting(false);
  };

  const handleConvert = async () => {
    setIsSubmitting(true);
    const result = await convertLeadToCustomer(leadId);
    if (result.success) {
      toast.success("Lead converted to customer!");
      router.push(`/customers/${result.customerId}`);
    } else {
      toast.error(result.error || "Failed to convert lead");
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = async () => {
    const phone = lead?.phone || lead?.customer?.phone;
    if (!phone) {
      alert("No phone number available for this lead.");
      return;
    }
    
    setIsSubmitting(true);
    const url = buildWhatsAppChatUrl(phone, whatsappTemplate);
    window.open(url, '_blank');
    
    const result = await logLeadWhatsApp({
      leadId,
      text: whatsappTemplate,
    });
    
    if (result.success) {
      toast.success("WhatsApp logged successfully");
      const updatedLead = await getLeadDetails(leadId);
      setLead(updatedLead);
    } else {
      toast.error("Failed to log WhatsApp");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate pr-4">{lead?.name || "Loading..."}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {lead?.status === 'WON' && !lead?.customerId && (
              <div className="p-4 bg-green-50 border-b border-green-100 flex flex-col items-center justify-center gap-3">
                <div className="text-sm text-green-800 text-center font-medium">This lead has been won!</div>
                <button
                  onClick={handleConvert}
                  disabled={isSubmitting}
                  className="w-full max-w-xs py-2 bg-green-600 text-white rounded-md text-sm font-bold shadow-sm hover:bg-green-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  {isSubmitting ? "Converting..." : "Convert to Customer"}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-b bg-slate-50 space-y-6">
              
              {/* Log Call Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <Phone className="w-4 h-4 text-indigo-500" /> Log Call
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {["Connected", "No Answer", "Interested", "Callback"].map((o) => (
                    <label key={o} className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition-colors ${outcome === o ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type="radio" className="hidden" name="outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} />
                      {o}
                    </label>
                  ))}
                </div>
                
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Call notes (optional)"
                  className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  rows={2}
                />
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="text-sm rounded border-slate-300 p-1 border"
                  />
                  <span className="text-xs text-slate-500">(Follow-up task)</span>
                </div>
                
                <button 
                  onClick={handleLogCall}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Log Call"}
                </button>
              </div>

              <hr className="border-slate-200" />

              {/* WhatsApp Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                </div>
                
                <select 
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full text-sm rounded-md border-slate-300 p-2 border"
                >
                  <option value="Hi, following up on your inquiry.">Follow-up Template</option>
                  <option value="Hi, checking if you received our quotation.">Quotation Template</option>
                  <option value="Hi, thanks for your interest!">Introduction Template</option>
                </select>
                
                <textarea 
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full text-sm rounded-md border-slate-300 shadow-sm p-2 border"
                  rows={2}
                />
                
                <button 
                  onClick={handleWhatsApp}
                  disabled={isSubmitting}
                  className="w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Chat on WhatsApp & Log
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-slate-700">Activity Timeline</h3>
              
              {lead?.activities && lead.activities.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                  {lead.activities.map((activity: any) => (
                    <div key={activity.id} className="relative pl-6">
                      <span className="absolute -left-2 top-1 bg-white border-2 border-slate-300 w-4 h-4 rounded-full" />
                      <div className="text-sm font-medium text-slate-900">{activity.title}</div>
                      <div className="text-xs text-slate-500">{new Date(activity.date).toLocaleString()}</div>
                      {activity.description && (
                        <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-2 rounded border">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">No activities yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
