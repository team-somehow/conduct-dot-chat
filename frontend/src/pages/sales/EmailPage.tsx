import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Mock data for email threads
interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "contact";
}

interface Thread {
  id: string;
  contactName: string;
  contactEmail: string;
  contactAvatar?: string;
  subject: string;
  lastMessageTimestamp: Date;
  lastMessagePreview: string;
  unread: boolean;
  messages: Message[];
}

const mockThreads: Thread[] = [
  {
    id: "thread-1",
    contactName: "John Smith",
    contactEmail: "john@acmecorp.com",
    contactAvatar: "https://i.pravatar.cc/150?u=john",
    subject: "Re: Product Demo Request",
    lastMessageTimestamp: new Date(2023, 6, 15, 14, 32),
    lastMessagePreview:
      "Thanks for reaching out. I'd be interested in scheduling a demo...",
    unread: true,
    messages: [
      {
        id: "msg-1-1",
        content:
          "Hello John, I noticed that you've been looking for a solution like ours. Would you be interested in a quick demo?",
        timestamp: new Date(2023, 6, 15, 10, 0),
        sender: "user",
      },
      {
        id: "msg-1-2",
        content:
          "Thanks for reaching out. I'd be interested in scheduling a demo to see how your product could help our team. What times do you have available next week?",
        timestamp: new Date(2023, 6, 15, 14, 32),
        sender: "contact",
      },
    ],
  },
  {
    id: "thread-2",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@techstart.io",
    contactAvatar: "https://i.pravatar.cc/150?u=sarah",
    subject: "Partnership Opportunity",
    lastMessageTimestamp: new Date(2023, 6, 14, 9, 15),
    lastMessagePreview:
      "I've reviewed your proposal and I think there's potential...",
    unread: true,
    messages: [
      {
        id: "msg-2-1",
        content:
          "Hi Sarah, I wanted to discuss a potential partnership between our companies. We have some complementary offerings that could work well together.",
        timestamp: new Date(2023, 6, 13, 15, 47),
        sender: "user",
      },
      {
        id: "msg-2-2",
        content:
          "I've reviewed your proposal and I think there's potential for collaboration. Could we set up a call to discuss this further?",
        timestamp: new Date(2023, 6, 14, 9, 15),
        sender: "contact",
      },
    ],
  },
  {
    id: "thread-3",
    contactName: "Michael Lee",
    contactEmail: "michael@globalsystems.net",
    contactAvatar: "https://i.pravatar.cc/150?u=michael",
    subject: "Follow-up: Product Questions",
    lastMessageTimestamp: new Date(2023, 6, 10, 16, 22),
    lastMessagePreview:
      "I have a few more questions about the pricing structure...",
    unread: false,
    messages: [
      {
        id: "msg-3-1",
        content:
          "Hello Michael, thank you for your interest in our product. Let me know if you have any questions.",
        timestamp: new Date(2023, 6, 9, 11, 30),
        sender: "user",
      },
      {
        id: "msg-3-2",
        content:
          "Thanks for getting back to me. I'm interested in the enterprise plan, but I'd like to understand more about the pricing structure.",
        timestamp: new Date(2023, 6, 9, 15, 45),
        sender: "contact",
      },
      {
        id: "msg-3-3",
        content:
          "I'd be happy to explain our enterprise pricing. We offer custom pricing based on your needs, starting at $999/month with additional features like dedicated support and custom integrations.",
        timestamp: new Date(2023, 6, 10, 9, 15),
        sender: "user",
      },
      {
        id: "msg-3-4",
        content:
          "I have a few more questions about the pricing structure. Can we schedule a call to discuss this in more detail?",
        timestamp: new Date(2023, 6, 10, 16, 22),
        sender: "contact",
      },
    ],
  },
  {
    id: "thread-4",
    contactName: "Emily Chen",
    contactEmail: "emily@brightfuture.co",
    contactAvatar: "https://i.pravatar.cc/150?u=emily",
    subject: "Re: Product Feedback",
    lastMessageTimestamp: new Date(2023, 6, 8, 13, 10),
    lastMessagePreview:
      "Thank you for taking our feedback into consideration...",
    unread: false,
    messages: [
      {
        id: "msg-4-1",
        content:
          "Hi Emily, we've just released a new update based on your feedback. I'd love to hear your thoughts.",
        timestamp: new Date(2023, 6, 7, 10, 15),
        sender: "user",
      },
      {
        id: "msg-4-2",
        content:
          "Thank you for taking our feedback into consideration. The new update looks promising. I'll share it with the team and get back to you with our thoughts.",
        timestamp: new Date(2023, 6, 8, 13, 10),
        sender: "contact",
      },
    ],
  },
];

export function EmailPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Get the selected thread
  const selectedThread = threads.find(
    (thread) => thread.id === selectedThreadId
  );

  // Count unread threads
  const unreadCount = threads.filter((thread) => thread.unread).length;

  // Filter threads based on search term
  const filteredThreads = threads.filter(
    (thread) =>
      thread.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.lastMessagePreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom of messages when thread changes or new message is added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [selectedThreadId, selectedThread?.messages.length]);

  // Mark thread as read when opened
  useEffect(() => {
    if (selectedThreadId) {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === selectedThreadId && thread.unread
            ? { ...thread, unread: false }
            : thread
        )
      );
    }
  }, [selectedThreadId]);

  // Format relative time (e.g., "Today", "Yesterday", or date)
  const formatRelativeTime = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return format(date, "h:mm a");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThreadId) return;

    setSending(true);

    // Simulate network delay
    setTimeout(() => {
      // Add new message to the selected thread
      setThreads((prevThreads) =>
        prevThreads.map((thread) => {
          if (thread.id === selectedThreadId) {
            const newMsg: Message = {
              id: `msg-${thread.id}-${thread.messages.length + 1}`,
              content: newMessage,
              timestamp: new Date(),
              sender: "user",
            };

            return {
              ...thread,
              lastMessageTimestamp: new Date(),
              lastMessagePreview: newMessage,
              messages: [...thread.messages, newMsg],
            };
          }
          return thread;
        })
      );

      // Clear the input
      setNewMessage("");
      setSending(false);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Email Conversations
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Manage your sales communications in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Thread list (left pane) */}
        <Card className="p-4 overflow-hidden flex flex-col h-full">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter threads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {unreadCount} unread
              </Badge>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations matching your search.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className={cn(
                      "p-3 rounded-md cursor-pointer transition-colors",
                      selectedThreadId === thread.id
                        ? "bg-primary/10"
                        : "hover:bg-muted",
                      thread.unread && "bg-primary/5"
                    )}
                    onClick={() => setSelectedThreadId(thread.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={thread.contactAvatar} />
                        <AvatarFallback>
                          {thread.contactName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div
                            className={cn(
                              "font-medium truncate",
                              thread.unread && "font-semibold"
                            )}
                          >
                            {thread.contactName}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatRelativeTime(thread.lastMessageTimestamp)}
                          </div>
                        </div>
                        <div className="text-sm font-medium truncate">
                          {thread.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {thread.lastMessagePreview}
                        </div>
                        {thread.unread && (
                          <div className="mt-1">
                            <Badge
                              variant="default"
                              className="px-1.5 py-0 text-[0.65rem]"
                            >
                              New
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Email viewer and composer (right pane) */}
        <Card
          className={cn(
            "p-4 md:col-span-2 flex flex-col h-full overflow-hidden",
            !selectedThreadId && "items-center justify-center"
          )}
        >
          {!selectedThreadId ? (
            <div className="text-center p-8">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No conversation selected
              </h3>
              <p className="text-muted-foreground max-w-md">
                Select a conversation from the list to view messages or start a
                new conversation.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="pb-3 mb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedThread?.contactAvatar} />
                      <AvatarFallback>
                        {selectedThread?.contactName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedThread?.contactName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedThread?.contactEmail}
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-medium mt-2">
                  {selectedThread?.subject}
                </h3>
              </div>

              {/* Messages */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
              >
                {selectedThread?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      message.sender === "user"
                        ? "ml-auto items-end"
                        : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-4",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(message.timestamp, "MMM d, h:mm a")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="mt-auto border-t pt-4">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button
                    className="self-end"
                    disabled={!newMessage.trim() || sending}
                    onClick={handleSendMessage}
                  >
                    {sending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" />
                        <span>Sending</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Continue button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate("/sales/schedule")} className="gap-2">
          Continue to Schedule <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
