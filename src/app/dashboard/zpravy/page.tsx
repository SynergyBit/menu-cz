"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import {
  Mail,
  MailOpen,
  CalendarCheck,
  HelpCircle,
  MessageSquare,
  Inbox,
} from "lucide-react";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const subjectLabels: Record<string, { label: string; icon: typeof Mail }> = {
  reservation: { label: "Rezervace", icon: CalendarCheck },
  question: { label: "Dotaz", icon: HelpCircle },
  feedback: { label: "Zpětná vazba", icon: MessageSquare },
};

export default function ZpravyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  async function loadMessages() {
    const [msgRes, meRes] = await Promise.all([
      fetch("/api/restaurants/me/messages").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setMessages(msgRes.messages || []);
    setUnread(msgRes.unreadCount || 0);
    setPlan(meRes.restaurant?.plan || "free");
    setLoading(false);
  }

  useEffect(() => { loadMessages(); }, []);

  async function markRead(msg: Message) {
    setSelected(msg);
    if (!msg.isRead) {
      await fetch("/api/restaurants/me/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, isRead: true }),
      });
      loadMessages();
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zprávy</h1>
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} nepřečtených` : "Žádné nové zprávy"}
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Kontaktní formulář a zprávy" requiredPlan="standard" currentPlan={plan}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          {/* Message list */}
          <Card className="max-h-[600px] overflow-auto">
            <CardContent className="p-0">
              {messages.length === 0 ? (
                <div className="py-12 text-center">
                  <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Žádné zprávy</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const sub = subjectLabels[msg.subject] || subjectLabels.question;
                  const Icon = sub.icon;
                  return (
                    <div key={msg.id}>
                      {idx > 0 && <Separator />}
                      <button
                        onClick={() => markRead(msg)}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
                          selected?.id === msg.id ? "bg-muted/50" : ""
                        } ${!msg.isRead ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!msg.isRead ? "font-semibold" : ""}`}>
                                {msg.senderName}
                              </span>
                              {!msg.isRead && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {msg.message}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleDateString("cs-CZ")}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Message detail */}
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {(subjectLabels[selected.subject] || subjectLabels.question).label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selected.createdAt).toLocaleString("cs-CZ")}
                  </span>
                </div>
                <CardTitle className="text-lg">{selected.senderName}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {selected.senderEmail && <span>{selected.senderEmail}</span>}
                  {selected.senderPhone && <span>{selected.senderPhone}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.message}
                </p>
                {selected.senderEmail && (
                  <a href={`mailto:${selected.senderEmail}`}>
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Odpovědět emailem
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <MailOpen className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">Vyberte zprávu</p>
              </div>
            </Card>
          )}
        </div>
      </PremiumGate>
    </div>
  );
}
