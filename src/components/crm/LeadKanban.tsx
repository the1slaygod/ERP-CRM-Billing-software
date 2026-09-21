"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { updateLeadStatus } from "@/app/actions/lead";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Phone, Mail } from "lucide-react";
import { LeadDrawer } from "./LeadDrawer";

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  dealValue: number | null;
  status: string;
};

const STAGES = [
  { id: "NEW_LEAD", title: "New Lead", color: "bg-blue-100 border-blue-200" },
  { id: "CONTACTED", title: "Contacted", color: "bg-yellow-100 border-yellow-200" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-indigo-100 border-indigo-200" },
  { id: "QUOTATION_SENT", title: "Quotation Sent", color: "bg-purple-100 border-purple-200" },
  { id: "NEGOTIATION", title: "Negotiation", color: "bg-orange-100 border-orange-200" },
  { id: "WON", title: "Won", color: "bg-green-100 border-green-200" },
  { id: "LOST", title: "Lost", color: "bg-red-100 border-red-200" },
];

export function LeadKanban({ initialLeads }: { initialLeads: Lead[] }) {
  const [isBrowser, setIsBrowser] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [columns, setColumns] = useState<Record<string, Lead[]>>(() => {
    const cols: Record<string, Lead[]> = {};
    STAGES.forEach((stage) => {
      cols[stage.id] = initialLeads.filter((l) => l.status === stage.id);
    });
    return cols;
  });

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const sourceCol = [...columns[source.droppableId]];
      const destCol = [...columns[destination.droppableId]];
      
      const [removed] = sourceCol.splice(source.index, 1);
      removed.status = destination.droppableId;
      destCol.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });

      // Update DB
      await updateLeadStatus(draggableId, destination.droppableId);
    } else {
      const col = [...columns[source.droppableId]];
      const [removed] = col.splice(source.index, 1);
      col.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: col,
      });
    }
  };

  if (!isBrowser) return <div className="p-8 text-center text-slate-500">Loading Kanban...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-[calc(100vh-12rem)] overflow-x-auto pb-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-72 flex flex-col bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <div className={`px-4 py-3 font-semibold text-sm border-b ${stage.color}`}>
              {stage.title}
              <span className="ml-2 text-xs font-normal text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">
                {columns[stage.id]?.length || 0}
              </span>
            </div>
            
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={`flex-1 p-3 overflow-y-auto space-y-3 ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}
                >
                  {columns[stage.id]?.map((lead, index) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`bg-white p-4 rounded-md shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : ''}`}
                        >
                          <div className="font-medium text-sm text-slate-900">{lead.name}</div>
                          {lead.company && <div className="text-xs text-slate-500 mt-1">{lead.company}</div>}
                          
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            {lead.dealValue ? (
                              <span className="font-semibold text-green-600 flex items-center">
                                <DollarSign className="w-3 h-3 mr-0.5" />
                                {lead.dealValue.toLocaleString()}
                              </span>
                            ) : <span>TBD</span>}
                            
                            <span className="bg-slate-100 px-2 py-1 rounded text-[10px]">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
      
      <LeadDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </DragDropContext>
  );
}
