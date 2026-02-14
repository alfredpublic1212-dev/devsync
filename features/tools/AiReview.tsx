"use client";

import {
  BrainCircuit,
  AlertCircle,
  TriangleAlert,
  Info,
  Shield,
  Zap,
  Cpu,
  MessageSquare,
  Code2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useEditorContext } from "@/state/editorContext";
import wisdomLogo from "@/components/icons/wisdom.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReviewItem = {
  id: string;
  severity: "error" | "warning" | "info";
  category: "bug" | "security" | "performance" | "style";
  message: string;
  confidence: "low" | "medium" | "high";
};

type Filter = "all" | "error" | "warning" | "info";

const severityGlow: Record<string, string> = {
  error:
    "from-red-500/20 via-red-500/5 to-transparent border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  warning:
    "from-[#f4dc5b]/15 via-[#e9ba59]/5 to-transparent border-[#f4dc5b]/30 shadow-[0_0_15px_rgba(244,220,91,0.1)]",
  info:
    "from-cyan-400/20 via-cyan-400/5 to-transparent border-cyan-300/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
};

const severityBorder: Record<string, string> = {
  error: "bg-red-400",
  warning: "bg-[#f4dc5b]",
  info: "bg-cyan-300",
};

export default function AIReviewPanel() {
  const [view, setView] = useState<"home" | "review" | "chat">("home");

  const [filter, setFilter] = useState<Filter>("all");
  const [results, setResults] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showDeep, setShowDeep] = useState(false);

  //  ADD STATES (chat)
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  // 🔴 NEW STATE FOR TOOL DROPDOWN
  const [showTools, setShowTools] = useState(false);

  const { fileName, code, range } = useEditorContext();

  const detectedLine = (() => {
    if (range && typeof range === "object" && "start" in range) {
      const start = (range as any).start;
      return typeof start === "number" ? start : 11;
    }
    return 11;
  })();

  //  ADD SEND FUNCTION (below all states, before return)
  const sendChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;

    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          code: code || "",
          file: fileName || "editor.py",
          language: "python"
        })
      });

      const data = await res.json();

      setChatMessages(prev => [
        ...prev,
        { role: "assistant", text: data.reply || "No reply" }
      ]);

    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: "assistant", text: "Server error" }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filtered = results.filter(
    (i) => filter === "all" || i.severity === filter
  );

  const counts = results.reduce(
    (acc, item) => {
      acc[item.severity] += 1;
      return acc;
    },
    { error: 0, warning: 0, info: 0 }
  );

  const handleRunReview = async () => {
    if (!fileName || !code?.trim() || !range) return;

    setView("review");
    setLoading(true);
    setResults([]);
    setError(null);
    setSummary(null);
    setExplanation(null);
    setShowDeep(false);

    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "selection",
          file: fileName,
          language: "auto",
          code,
          range,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "AI review failed");
        return;
      }

      if (data.success) {
        setResults(data.results || []);
        setSummary(data.summary || null);
        setExplanation(data.explanation || null);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const canReview = Boolean(fileName && code?.trim() && range);
  const filterOptions: Filter[] = ["all", "error", "warning", "info"];

  return (
    <>
      <style>{`
        @property --angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes rotateGlow {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }

        /* 🔧 PERMANENT FIX for Radix ScrollArea viewport wrapper */
        [data-radix-scroll-area-viewport] > div {
          display: block !important;
          min-width: 0 !important;
        }
      `}</style>

      <div className="h-full w-full min-h-0 p-[14px] bg-transparent flex flex-col">
        <div className="relative flex flex-col flex-1 min-h-0 overflow-visible rounded-[22px] bg-[#030507] text-white shadow-2xl">

          {/* JARVIS CORE AMBIENT GLOW */}
          <div
            className="absolute inset-[-40px] rounded-[40px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(79,164,248,0.25), transparent 60%)",
              filter: "blur(40px)",
              opacity: 0.6,
              zIndex: 0,
            }}
          />

          {/* ROTATING STARK ENERGY BORDER */}
          <div
            className="absolute pointer-events-none rounded-[22px]"
            style={{
              inset: 0,
              padding: "1.8px",
              background:
                "conic-gradient(from var(--angle), transparent 0%, transparent 60%, #4fa4f8 72%, #7ab7ff 78%, #244c74 84%, transparent 92%)",
              animation: "rotateGlow 8s linear infinite",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              zIndex: 3,
              filter: "blur(0.6px) brightness(1.6)",
            }}
          />

          {/* INNER GLASS EDGE */}
          <div
            className="absolute inset-[1px] rounded-[22px] pointer-events-none"
            style={{
              border: "1px solid rgba(79,164,248,0.25)",
              boxShadow:
                "0 0 25px rgba(79,164,248,0.25), inset 0 0 18px rgba(79,164,248,0.12)",
              zIndex: 2,
            }}
          />

          {/* Dark base */}
          <div className="absolute inset-0 bg-[#030507] rounded-[22px] z-[1]" />

          {/* Glass layers */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl rounded-[22px] z-[2]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,164,248,0.08),transparent_70%)] rounded-[22px] z-[2]" />
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] rounded-[22px] z-[2]" />

          {/*  CONTENT  */}
          <div className="relative z-10 flex flex-col h-full min-h-0">

            {/* ----- HEADER ----- */}
            <div className="p-5 border-b border-white/5 relative bg-transparent backdrop-blur-[15px] rounded-t-xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4fa4f8]/60 to-transparent blur-md" />
              <div className="absolute right-6 top-2 opacity-20 pointer-events-none">
                <div className="w-72 h-24 bg-[radial-gradient(circle,rgba(79,164,248,0.45)_1px,transparent_1px)] bg-[length:20px_20px]" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {/* BACK BUTTON */}
                  {view !== "home" && (
                    <button
                      onClick={() => {
                        setView("home");
                        setSummary(null);
                        setResults([]);
                        setExplanation(null);
                      }}
                      className="mr-2 text-white/40 hover:text-white text-lg"
                    >
                      ←
                    </button>
                  )}

                  {/* WISDOM CORE ICON */}
                    <div className="relative group/icon">
                     {/* ===== IDLE BASE GLOW (SUBTLE) ===== */}
                    <div
                      className="absolute inset-[-14px] rounded-[26px] blur-[20px] opacity-60 transition duration-500 group-hover/icon:opacity-0"
                      style={{
                        background: `
                          linear-gradient(90deg,
                            rgba(8,31,64,0.55) 0%,
                            rgba(6,46,58,0.55) 100%
                          )
                        `
                      }}
                    />

                    {/* ===== HOVER POWER GLOW (STRONG) ===== */}
                    <div
                      className="absolute inset-[-26px] rounded-[34px] blur-[32px] opacity-0 group-hover/icon:opacity-100 transition duration-500"
                      style={{
                        background: `
                          linear-gradient(90deg,
                            rgba(8,31,64,0.95) 0%,
                            rgba(6,46,58,0.95) 100%
                          )
                        `
                      }}
                    />

                    {/* ===== TILE ===== */}
                    <div
                      className="
                        relative 
                        w-[60px] h-[58px]
                        rounded-[18px]
                        bg-[#0b0f14]
                        flex items-center justify-center
                        transition duration-500
                      "
                      style={{
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "inset 0 0 18px rgba(0,0,0,0.6)"
                      }}
                    >
                        <img
                            src={wisdomLogo.src}
                            alt="Wisdom AI"
                            draggable="false"
                            className="
                              w-full
                              h-full
                              object-contain
                              scale-[0.75]
                              pointer-events-none
                              select-none
                              transition duration-500
                              group-hover/icon:scale-[0.90]
                            "
                          />

                      </div>
                    </div>

                  {/* TITLE */}
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight text-white">
                      WISDOM AI
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Intelligence scan of selected code, bugs, security, architecture
                    </div>
                  </div>
                </div>

                {/* REVIEW BUTTON – only visible in review view */}
                {view === "review" && (
                  <Button
                    onClick={handleRunReview}
                    disabled={!canReview || loading}
                    className="bg-white text-black font-semibold rounded-lg px-4 h-9 shadow-lg border border-white/30 hover:bg-white/90 transition"
                  >
                    {loading ? "Reviewing..." : "Review"}
                  </Button>
                )}
              </div>

              {/* GLASSY SUMMARY BAR */}
              {view === "review" && summary && (
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 backdrop-blur-xl px-4 py-2.5 flex items-center gap-6 text-xs text-white/80 shadow-lg shadow-black/20">
                  <span className="text-white font-bold tracking-wide">
                    WISDOM ENGINE ACTIVE
                  </span>
                  <span className="text-[#f4dc5b] font-medium">
                    {summary.issue_count} issues detected
                  </span>
                  <span className="text-white/70">Security: 1 risk</span>
                  <span className="text-emerald-400 font-medium">Policy: Pass</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-[#4fa4f8]/20 border border-[#4fa4f8]/40 text-[#4fa4f8] text-[10px] font-bold uppercase tracking-wider">
                    [Detected]
                  </span>
                </div>
              )}
            </div>

            {/* ================= HOME PANEL ================= */}
            {view === "home" && (
              <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
                <div className="text-xl font-semibold text-white mb-2 tracking-tight">
                  Your coding partner is ready.
                </div>
                <div className="text-xs text-emerald-400 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </div>
                <p className="text-sm text-white/50 max-w-md leading-relaxed mb-10">
                  Analyze code, detect issues, refactor logic,
                  or ask anything about this project.
                </p>

                {/* FEATURE CARDS WITH ICONS */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-10">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <Shield className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
                    <div className="text-xs text-white font-semibold mb-1">Architecture aware</div>
                    <div className="text-[11px] text-white/40">Detects structural and scaling risks</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <Zap className="w-5 h-5 text-yellow-300 mx-auto mb-2" />
                    <div className="text-xs text-white font-semibold mb-1">Security scanning</div>
                    <div className="text-[11px] text-white/40">Finds vulnerabilities and unsafe patterns</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <Cpu className="w-5 h-5 text-purple-300 mx-auto mb-2" />
                    <div className="text-xs text-white font-semibold mb-1">Logic & performance</div>
                    <div className="text-[11px] text-white/40">Optimizes flow and complexity</div>
                  </div>
                </div>

                {/* BUTTONS WITH ICONS */}
                <div className="flex gap-3 w-full max-w-sm">
                  <Button
                    onClick={() => setView("chat")}
                    className="flex-1 bg-white text-black font-semibold hover:bg-white/90 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with Wisdom
                  </Button>
                  <Button
                    onClick={() => setView("review")}
                    className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    Review Code
                  </Button>
                </div>

                <div className="mt-10 text-[12px] text-white/30">
                  Powered by Wisdom Engine v1.5
                </div>
              </div>
            )}

            {/* ================= CHAT PANEL ================= */}
            {view === "chat" && (
              <div className="flex-1 min-h-0 flex flex-col px-6 pt-6 pb-4 bg-black/10 backdrop-blur-sm rounded-b-[19px]">

                {/* CHAT MESSAGES WITH SCROLLAREA — FIXED */}
                <ScrollArea className="flex-1 min-h-0 mb-4">
                  <div className="flex flex-col gap-4 p-1">
                    {chatMessages.map((m, i) => (
                      <div key={i} className="text-sm leading-relaxed">
                        <div className="text-[11px] text-white/40 mb-1">
                          {m.role === "user" ? "You" : "Wisdom"}
                        </div>

                        {m.role === "user" ? (
                          <div className="text-white">{m.text}</div>
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full max-w-full overflow-hidden">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              skipHtml={true}
                              components={{
                                // 🔧 FIX: render paragraphs as <div> to avoid <pre> inside <p>
                                p({ children }) {
                                  return (
                                    <div className="text-white leading-relaxed mb-3">
                                      {children}
                                    </div>
                                  );
                                },
                                // 🔧 FIX: prevent double <pre> wrapping
                                pre({ children }) {
                                  return <>{children}</>;
                                },
                                code({ inline, children }: any) {
                                  if (inline) {
                                    return (
                                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-cyan-300">
                                        {children}
                                      </code>
                                    );
                                  }
                                  return (
                                    <div className="bg-black/60 border border-white/10 rounded-xl mt-3 w-full max-w-full overflow-hidden">
                                      
                                      <div className="w-full max-w-full overflow-x-auto overflow-y-auto max-h-[420px]">
                                        
                                        <pre className="
                                          text-[13px]
                                          p-4
                                          text-white
                                          font-mono
                                          whitespace-pre
                                          w-full
                                          max-w-full
                                        ">
                                          <code className="whitespace-pre">
                                            {children}
                                          </code>
                                        </pre>

                                      </div>

                                    </div>
                                  );
                                }
                              }}
                            >
                              {m.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="text-xs text-white/40">Wisdom thinking...</div>
                    )}
                  </div>
                </ScrollArea>

                {/* CHAT INPUT WITH SEND ICON — FIXED WITH PLUS BUTTON */}
                <div className="relative border border-white/10 rounded-xl px-3 py-2 bg-white/5 flex items-center gap-2">
                  {/* PLUS BUTTON */}
                  <button
                    onClick={() => setShowTools(v => !v)}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white text-lg"
                  >
                    +
                  </button>

                  {/* TOOL PANEL */}
                  {showTools && (
                    <div className="absolute bottom-14 left-2 w-64 bg-[#05070a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {/* HEADER */}
                      <div className="px-4 py-2 text-[11px] text-white/40 border-b border-white/10">
                        Code tools
                      </div>
                      {[
                        "Explain this file",
                        "Find bugs in this code",
                        "Optimize this function",
                        "Improve architecture"
                      ].map((t) => (
                        <div
                          key={t}
                          onClick={() => {
                            setChatInput(t);
                            setShowTools(false);
                          }}
                          className="px-4 py-3 text-sm text-white/80 hover:bg-white/10 cursor-pointer"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* INPUT */}
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30"
                  />

                  {/* SEND BUTTON */}
                  <button
                    onClick={sendChat}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-cyan-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ================= REVIEW PANEL ================= */}
            {view === "review" && (
              <>
                <div className="flex gap-2 px-5 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm">
                  {filterOptions.map((option) => {
                    const count = option === "all" ? results.length : counts[option];
                    const active = filter === option;

                    return (
                      <button
                        key={option}
                        onClick={() => setFilter(option)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                          active
                            ? "bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {option.toUpperCase()} {count}
                      </button>
                    );
                  })}
                </div>

                <ScrollArea className="flex-1 min-h-0 bg-transparent backdrop-blur-[10px] rounded-b-[19px] overflow-visible">
                  <div className="p-5 pb-10 space-y-4">
                    {error && (
                      <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                        {error}
                      </div>
                    )}

                    {!loading &&
                      filtered.map((item) => (
                        <div
                          key={item.id}
                          className={`relative rounded-[22px] border bg-gradient-to-r p-4 backdrop-blur-xl ${severityGlow[item.severity]}`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[22px] ${severityBorder[item.severity]}`}
                          />

                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {item.severity === "error" && (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              )}
                              {item.severity === "warning" && (
                                <TriangleAlert className="h-4 w-4 text-[#f4dc5b]" />
                              )}
                              {item.severity === "info" && (
                                <Info className="h-4 w-4 text-cyan-300" />
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="text-sm text-white/90 font-mono leading-relaxed">
                                <span className="mr-2 text-white/40">–</span>
                                {item.message}
                              </div>

                              <div className="flex gap-2 mt-2.5">
                                <Badge
                                  variant="outline"
                                  className="border-white/20 bg-white/5 text-white/80 text-[10px] px-2 py-0"
                                >
                                  {item.severity}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="border-white/20 bg-white/5 text-white/80 text-[10px] px-2 py-0"
                                >
                                  {item.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="border-white/20 bg-white/5 text-white/80 text-[10px] px-2 py-0"
                                >
                                  {item.confidence} confidence
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {explanation && (
                      <div className="mt-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
                            <BrainCircuit className="h-4 w-4 text-[#4fa4f8]" />
                            Deep Analysis (Wisdom Engine)
                          </div>
                          <button
                            onClick={() => setShowDeep(!showDeep)}
                            className="text-xs text-white/50 hover:text-white/90 transition-colors"
                          >
                            {showDeep ? "Hide reasoning" : "View full reasoning"}
                          </button>
                        </div>

                        <div className="mt-4 space-y-1.5 text-xs text-white/70">
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#4fa4f8]" />
                            Architecture risks detected
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#f4dc5b]" />
                            Security concerns found
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            Suggested remediation available
                          </div>
                        </div>

                        {showDeep && (
                          <div className="mt-4 text-xs text-white/80 whitespace-pre-wrap border-t border-white/10 pt-4">
                            {explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {summary && (
                      <div className="mt-4 flex items-center gap-3 text-xs bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2.5 text-white/70">
                        <span className="font-semibold text-[#4fa4f8]">Review Code</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="text-[#f4dc5b]">Detected</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>Line: {detectedLine}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>Isolated</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}