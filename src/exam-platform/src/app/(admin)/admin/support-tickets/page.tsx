'use client';

import { useAdminListSupportTickets, useAdminSupportTicket, useCreateSupportTicketReply, useUpdateSupportTicketStatus, useAssignSupportTicket } from '@/lib/api';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, User, Clock, CheckCircle2, ChevronRight, Send, HelpCircle } from 'lucide-react';

const statuses = ['all', 'open', 'pending', 'resolved', 'closed'];

export default function SupportTicketsAdminPage() {
  const { toast } = useToast();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyText, setReplyText] = useState('');

  // Fetch Tickets
  const { data: ticketsList, isLoading: loadingList } = useAdminListSupportTickets({
    status: filterStatus === 'all' ? undefined : filterStatus,
    page: 1,
    limit: 50,
  });

  // Fetch Single Ticket Thread
  const { data: ticketThread, isLoading: loadingThread } = useAdminSupportTicket(selectedTicketId ?? 0);

  // Mutations
  const replyMutation = useCreateSupportTicketReply(selectedTicketId ?? 0);
  const statusMutation = useUpdateSupportTicketStatus(selectedTicketId ?? 0);
  const assignMutation = useAssignSupportTicket(selectedTicketId ?? 0);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    try {
      await replyMutation.mutateAsync({ message: replyText });
      setReplyText('');
      toast({ title: 'Reply sent' });
    } catch {
      toast({ title: 'Failed to send reply', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicketId) return;
    try {
      await statusMutation.mutateAsync(status);
      toast({ title: `Ticket marked as ${status}` });
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleAssign = async (adminId: string) => {
    if (!selectedTicketId) return;
    try {
      await assignMutation.mutateAsync(adminId);
      toast({ title: 'Ticket assigned' });
    } catch {
      toast({ title: 'Failed to assign ticket', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-400" />
          Support Tickets
        </h1>
        <p className="text-slate-400 mt-2">View, assign, and reply to student learning doubts and tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 h-[600px] flex flex-col">
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingList ? (
              <div className="text-center text-slate-400 py-8">Loading tickets...</div>
            ) : !ticketsList?.data?.length ? (
              <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-slate-500" />
                <span>No tickets found</span>
              </div>
            ) : (
              ticketsList.data.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedTicketId === ticket.id
                      ? 'bg-indigo-600/10 border-indigo-500'
                      : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white truncate text-sm">{ticket.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                      ticket.status === 'open' ? 'bg-red-500/20 text-red-400' :
                      ticket.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{ticket.userId.slice(0, 15)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Thread Detail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6 h-[600px] flex flex-col justify-between">
          {!selectedTicketId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
              <MessageSquare className="w-12 h-12 opacity-40" />
              <p>Select a ticket to view thread and send replies</p>
            </div>
          ) : loadingThread || !ticketThread ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">Loading thread...</div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="border-b border-slate-800 pb-4 mb-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">{ticketThread.ticket.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Category: <span className="text-indigo-400 uppercase font-bold">{ticketThread.ticket.category}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Status update buttons */}
                  {ticketThread.ticket.status !== 'resolved' && ticketThread.ticket.status !== 'closed' ? (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('open')}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded"
                    >
                      Reopen Ticket
                    </button>
                  )}
                  {/* Assign to Me button */}
                  <button
                    onClick={() => handleAssign('current_admin')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded border border-slate-700"
                  >
                    Assign to Me
                  </button>
                </div>
              </div>

              {/* Message history thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
                {ticketThread.messages.map((msg) => {
                  const isSupport = msg.sender === 'support';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-3 rounded-lg text-sm max-w-[80%] space-y-1 ${
                        isSupport
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <p>{msg.message}</p>
                        <span className="block text-[10px] text-right opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 border-t border-slate-800 pt-4 shrink-0">
                <input
                  type="text"
                  placeholder="Type support reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-lg transition shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
