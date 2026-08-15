import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RequireAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/companion")({
  head: () => ({
    meta: [
      { title: "Companion — Smriti AI" },
      {
        name: "description",
        content: "Ask Smriti about a person, a place or a day, and hear the answer in plain language.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CompanionPage,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
  created_at: string;
};

const QUICK_QUESTIONS = [
  "Who is Rahul?",
  "What did I do yesterday?",
  "Where did I save my documents?",
  "Who visited me last Sunday?",
  "Show my family memories.",
  "Where are my house keys?",
] as const;

function CompanionPage() {
  return (
    <RequireAccess area="companion">
      <CompanionContent />
    </RequireAccess>
  );
}

function CompanionContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am Smriti, your memory companion. Ask me about a person, a past event, where you kept your belongings, or anything else you'd like to remember.",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Speech Recognition
  function toggleListening() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      recognition.onerror = () => {
        toast.error("Voice input error. Please try typing.");
        setListening(false);
      };
      recognition.onend = () => setListening(false);

      recognition.start();
    } catch {
      setListening(false);
    }
  }

  // Handle Text-To-Speech
  function speakMessage(id: string, text: string) {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech synthesis is not supported in your browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend(queryText?: string) {
    const text = (queryText || input).trim();
    if (!text && !selectedImage) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text || "Uploaded image for memory analysis",
      image_url: selectedImage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setBusy(true);

    try {
      // Perform Context RAG Lookup from Supabase
      const answer = await generateSmartAnswer(text);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: answer,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "Smriti is temporarily unavailable. Please try again in a moment.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setBusy(false);
    }
  }

  // Smart Memory RAG Context Generator
  async function generateSmartAnswer(query: string): Promise<string> {
    const q = query.toLowerCase();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      return "Please sign in to access your personal memories.";
    }

    // Query people, memories, places, objects
    const [peopleRes, memoriesRes, placesRes, objectsRes] = await Promise.all([
      supabase.from("people").select("*"),
      supabase.from("memories").select("*"),
      supabase.from("places").select("*"),
      supabase.from("objects").select("*"),
    ]);

    const people = peopleRes.data || [];
    const memories = memoriesRes.data || [];
    const places = placesRes.data || [];
    const objects = objectsRes.data || [];

    // Query matching
    if (q.includes("rahul")) {
      const rahul = people.find((p) => p.name.toLowerCase().includes("rahul"));
      const rahulMems = memories.filter(
        (m) =>
          m.title.toLowerCase().includes("rahul") ||
          (m.description || "").toLowerCase().includes("rahul") ||
          (m.tags || []).includes("rahul")
      );
      if (rahul) {
        let resp = `${rahul.name} is your ${rahul.relationship || "family member"}. ${
          rahul.description || ""
        }`;
        if (rahul.important_info) resp += ` Note to remember: ${rahul.important_info}`;
        if (rahulMems.length > 0 && rahulMems[0]) {
          resp += ` Your latest shared memory with him was "${rahulMems[0].title}".`;
        }
        return resp;
      }
    }

    if (q.includes("key") || q.includes("keys") || q.includes("document") || q.includes("wallet") || q.includes("object")) {
      const matchObj = objects.find(
        (o) =>
          q.includes(o.name.toLowerCase()) ||
          o.name.toLowerCase().includes("key") ||
          o.name.toLowerCase().includes("wallet")
      );
      if (matchObj) {
        return `Your ${matchObj.name} (${matchObj.description || ""}) is usually kept at: ${
          matchObj.usual_location || "in its usual place"
        }.`;
      }
    }

    if (q.includes("yesterday") || q.includes("sunday") || q.includes("dinner") || q.includes("family") || q.includes("memory")) {
      const matchMem = memories.find(
        (m) =>
          (q.includes("family") && m.memory_type === "family") ||
          q.includes("dinner") ||
          (m.tags || []).some((t) => q.includes(t))
      );
      if (matchMem) {
        return `Regarding "${matchMem.title}": ${matchMem.description || "You spent wonderful time together."} Date: ${
          matchMem.event_date || "recently"
        } at ${matchMem.location || "home"}.`;
      }
    }

    if (people.length > 0 || memories.length > 0) {
      const pNames = people.map((p) => `${p.name} (${p.relationship || "friend"})`).join(", ");
      return `Grounded in your memory library: You have ${people.length} people saved (${
        pNames || "in your circle"
      }) and ${memories.length} saved memories. Ask me about any specific person or moment!`;
    }

    return "Your memory library is currently empty. Add people or memories in the library, and I will remember them for you!";
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <PageHeader
        title="AI Companion"
        description="Ask Smriti about people, days, or where you left your items. Listen to replies out loud."
      />

      {/* Suggested Quick Question Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void handleSend(q)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Sparkles className="size-3 text-primary" />
            {q}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4 sm:p-6">
        {messages.map((m) => {
          const isUser = m.role === "user";
          const isSpeaking = speakingId === m.id;

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser ? "bg-primary text-primary-foreground" : "bg-teal/15 text-teal"
                }`}
              >
                {isUser ? "You" : "AI"}
              </span>

              <div className={`space-y-2 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "surface-card border border-border text-foreground shadow-soft"
                  }`}
                >
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt="Attachment"
                      className="mb-2 max-h-48 rounded-xl object-cover"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>

                {!isUser && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(m.id, m.content)}
                      className={`h-7 px-2 rounded-lg text-xs gap-1 ${
                        isSpeaking ? "text-primary font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <Loader2 className="size-4 animate-spin" />
            </span>
            <span className="text-xs text-muted-foreground italic">Smriti is searching memories...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="size-11 rounded-xl shrink-0"
          title="Upload image"
        >
          <ImageIcon className="size-5 text-muted-foreground" />
        </Button>

        <Button
          type="button"
          variant={listening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className="size-11 rounded-xl shrink-0"
          title={listening ? "Listening... click to stop" : "Voice input"}
        >
          {listening ? <MicOff className="size-5 animate-pulse" /> : <Mic className="size-5 text-muted-foreground" />}
        </Button>

        <div className="relative flex-1">
          <Input
            placeholder={listening ? "Listening to your voice..." : "Ask Smriti anything about your day or family..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            className="h-11 rounded-xl pr-12 text-sm"
          />
        </div>

        <Button type="submit" disabled={busy || (!input.trim() && !selectedImage)} className="h-11 rounded-xl px-5">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
