'use client';

import { useAdminListSupportTickets, useAdminSupportTicket, useCreateSupportTicketReply, useUpdateSupportTicketStatus } from '@/lib/api';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, User, CheckCircle2, Send, Search, RotateCcw, Clock, Inbox, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statuses = ['all', 'open', 'pending', 'resolved', 'closed'] as const;

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function SupportTicketsAdminPage() {
  const { toast } = useToast();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Tickets
  const { data: ticketsList, isLoading: loadingList } = useAdminListSupportTickets({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  });

  // Fetch Single Ticket Thread (skip query when no ticket selected)
  const { data: ticketThread, isLoading: loadingThread } = useAdminSupportTicket(
    selectedTicketId ?? 0,
    { query: { enabled: !!selectedTicketId } },
  );

  // Mutations
  const replyMutation = useCreateSupportTicketReply(selectedTicketId ?? 0);
  const statusMutation = useUpdateSupportTicketStatus(selectedTicketId ?? 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketThread?.messages, replyMutation.isPending]);

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

  const tickets = ticketsList?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-indigo-600" />
          Support Tickets
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View, reply, and manage student support tickets
        </p>
      </div>

      {/* Mobile: show list or detail */}
      <div className="lg:hidden">
        {selectedTicketId ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTicketId(null)}
              className="mb-3 rounded-lg gap-1 text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" /> Back to tickets
            </Button>
            <TicketDetailPanel
              ticketThread={ticketThread}
              loadingThread={loadingThread}
              selectedTicketId={selectedTicketId}
              handleStatusChange={handleStatusChange}
              replyText={replyText}
              setReplyText={setReplyText}
              handleSendReply={handleSendReply}
              replyMutation={replyMutation}
              messagesEndRef={messagesEndRef}
            />
          </div>
        ) : (
          <TicketListPanel
            tickets={tickets}
            loadingList={loadingList}
            selectedTicketId={selectedTicketId}
            setSelectedTicketId={setSelectedTicketId}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            ticketsList={ticketsList}
          />
        )}
      </div>

      {/* Desktop: grid layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5 h-[calc(100vh-12rem)]">
        <TicketListPanel
          tickets={tickets}
          loadingList={loadingList}
          selectedTicketId={selectedTicketId}
          setSelectedTicketId={setSelectedTicketId}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          ticketsList={ticketsList}
        />
        <TicketDetailPanel
          ticketThread={ticketThread}
          loadingThread={loadingThread}
          selectedTicketId={selectedTicketId}
          handleStatusChange={handleStatusChange}
          replyText={replyText}
          setReplyText={setReplyText}
          handleSendReply={handleSendReply}
          replyMutation={replyMutation}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}

// ── Ticket List Panel ─────────────────────────────────────────────────────────
function TicketListPanel({
  tickets, loadingList, selectedTicketId, setSelectedTicketId,
  filterStatus, setFilterStatus, searchQuery, setSearchQuery, ticketsList,
}: {
  tickets: any[]; loadingList: boolean; selectedTicketId: number | null;
  setSelectedTicketId: (id: number | null) => void;
  filterStatus: string; setFilterStatus: (s: string) => void;
  searchQuery: string; setSearchQuery: (s: string) => void;
  ticketsList: any;
}) {
  return (
    <div className="bg-white border border-border/50 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-3 border-b space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold rounded-full uppercase whitespace-nowrap transition border',
                filterStatus === st
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100',
              )}
            >
              {st} {st === filterStatus && ticketsList?.total ? `(${ticketsList.total})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Items */}
      <div className="flex-1 overflow-y-auto">
        {loadingList ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-12">
            <Inbox className="w-10 h-10 text-gray-300" />
            <div>
              <p className="font-semibold text-sm text-gray-500">No tickets</p>
              <p className="text-xs text-gray-400 mt-0.5">No tickets match the current filter.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  'w-full text-left p-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-l-2',
                  selectedTicketId === ticket.id ? 'bg-indigo-50/50 border-l-indigo-500' : 'border-l-transparent',
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    ticket.status === 'open' ? 'bg-red-100 text-red-600' :
                    ticket.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600',
                  )}>
                    {ticket.title?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        'text-sm truncate',
                        ticket.isReadByAdmin === false ? 'font-bold text-gray-900' : 'font-medium text-gray-700',
                      )}>
                        {ticket.title}
                      </p>
                      {ticket.isReadByAdmin === false && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-semibold border',
                        STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-500',
                      )}>
                        {ticket.status}
                      </span>
                      {ticket.lastMessageAt && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {ticket.messageCount || 0} msgs
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ticket Detail Panel ───────────────────────────────────────────────────────
function TicketDetailPanel({
  ticketThread, loadingThread, selectedTicketId,
  handleStatusChange, replyText, setReplyText,
  handleSendReply, replyMutation, messagesEndRef,
}: {
  ticketThread?: any; loadingThread?: boolean; selectedTicketId?: number | null;
  handleStatusChange: (status: string) => Promise<void>;
  replyText: string; setReplyText: (s: string) => void;
  handleSendReply: (e: React.FormEvent) => Promise<void>;
  replyMutation: any; messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!selectedTicketId) {
    return (
      <div className="bg-white border border-border/50 rounded-2xl flex flex-col shadow-sm">
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 px-6">
          <MessageSquare className="w-14 h-14 text-gray-200" />
          <div className="text-center">
            <p className="font-semibold text-gray-500">Select a ticket</p>
            <p className="text-xs text-gray-400 mt-0.5">Choose a ticket from the list to view the conversation.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingThread || !ticketThread) {
    return (
      <div className="bg-white border border-border/50 rounded-2xl flex flex-col shadow-sm">
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-6 w-1/3 rounded-lg" />
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
          <Skeleton className="h-20 w-2/3 rounded-2xl ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border/50 rounded-2xl flex flex-col shadow-sm overflow-hidden">
      {/* Thread Header */}
      <div className="px-5 py-3.5 border-b shrink-0 bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{ticketThread.ticket.title}</h3>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0',
                STATUS_COLORS[ticketThread.ticket.status],
              )}>
                {ticketThread.ticket.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              <User className="w-3 h-3 inline mr-0.5" />
              <span className="font-mono">{ticketThread.ticket.userId?.slice(0, 20)}...</span>
              {ticketThread.ticket.category && (
                <>
                  <span className="mx-1.5">·</span>
                  <span className="font-semibold text-indigo-600 uppercase text-[10px]">{ticketThread.ticket.category}</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {ticketThread.ticket.status !== 'resolved' && ticketThread.ticket.status !== 'closed' ? (
              <Button
                onClick={() => handleStatusChange('resolved')}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </Button>
            ) : (
              <Button
                onClick={() => handleStatusChange('open')}
                size="sm"
                variant="outline"
                className="text-xs h-8 rounded-lg gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reopen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
        {(!ticketThread.messages || ticketThread.messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 px-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Start the conversation by replying below.</p>
            </div>
          </div>
        )}
        {ticketThread.messages?.map((msg: any) => {
          const isSupport = msg.sender === 'support';
          return (
            <div key={msg.id} className={cn('flex gap-3', isSupport ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'p-3 rounded-2xl max-w-[80%] space-y-1 shadow-sm',
                isSupport
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100',
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                <div className={cn(
                  'flex items-center gap-2 text-[10px]',
                  isSupport ? 'text-indigo-200' : 'text-gray-400',
                )}>
                  <span className="flex items-center gap-1">
                    {isSupport ? 'Support' : 'Student'}
                  </span>
                  {msg.sender !== 'support' && (
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                  <span>·</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}
        {replyMutation.isPending && (
          <div className="flex justify-end">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl rounded-tr-sm flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Sending...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Form */}
      <div className="p-3 border-t bg-white shrink-0">
        <form onSubmit={handleSendReply} className="flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 h-10 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-indigo-500/30 text-sm"
            disabled={replyMutation.isPending}
          />
          <Button
            type="submit"
            disabled={replyMutation.isPending || !replyText.trim()}
            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 shrink-0"
          >
            {replyMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
