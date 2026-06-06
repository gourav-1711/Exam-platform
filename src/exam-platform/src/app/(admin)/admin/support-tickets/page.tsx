'use client';

import { useAdminListSupportTickets, useAdminSupportTicket, useCreateSupportTicketReply, useUpdateSupportTicketStatus, useAssignSupportTicket } from '@/lib/api';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, User, CheckCircle2, Send, HelpCircle } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          Support Tickets
        </h1>
        <p className="text-gray-500 mt-2">View, assign, and reply to student learning doubts and tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white border border-border/50 rounded-2xl p-4 space-y-4 h-[600px] flex flex-col shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase transition ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingList ? (
              <div className="text-center text-gray-400 py-8">Loading tickets...</div>
            ) : !ticketsList?.data?.length ? (
              <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-2">
                <HelpCircle className="w-8 h-8 text-gray-300" />
                <span>No tickets found</span>
              </div>
            ) : (
              ticketsList.data.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTicketId === ticket.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100/50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 truncate text-sm">{ticket.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${
                      ticket.status === 'open' ? 'bg-red-100 text-red-700 border-red-200/50' :
                      ticket.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200/50' :
                      'bg-green-100 text-green-700 border-green-200/50'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{ticket.userId.slice(0, 15)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Thread Detail */}
        <div className="lg:col-span-2 bg-white border border-border/50 rounded-2xl p-6 h-[600px] flex flex-col justify-between shadow-sm">
          {!selectedTicketId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <MessageSquare className="w-12 h-12 opacity-30" />
              <p>Select a ticket to view thread and send replies</p>
            </div>
          ) : loadingThread || !ticketThread ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Loading thread...</div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{ticketThread.ticket.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Category: <span className="text-indigo-600 uppercase font-extrabold">{ticketThread.ticket.category}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Status update buttons */}
                  {ticketThread.ticket.status !== 'resolved' && ticketThread.ticket.status !== 'closed' ? (
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('open')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Reopen Ticket
                    </button>
                  )}
                  {/* Assign to Me button */}
                  <button
                    onClick={() => handleAssign('current_admin')}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200"
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
                      <div className={`p-3 rounded-2xl text-sm max-w-[80%] space-y-1 ${
                        isSupport
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/50 shadow-xs'
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
              <form onSubmit={handleSendReply} className="flex gap-2 border-t border-gray-100 pt-4 shrink-0">
                <input
                  type="text"
                  placeholder="Type support reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition shrink-0 cursor-pointer"
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