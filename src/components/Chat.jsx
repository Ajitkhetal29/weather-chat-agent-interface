import React, { useEffect, useRef, useState } from "react";
// api_url of weather agent
const API_URL = import.meta.env.VITE_API_URL;

// audios for msg sent recd
const sendSound = new Audio("audio/send.mp3");
const recdSound = new Audio("audio/recd.mp3");

const Chat = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [search, setSearch] = useState("");

  // audio play function
  const playSendSound = () => {
    sendSound.currentTime = 0;
    sendSound.play();
  };

  const playRecdSound = () => {
    recdSound.currentTime = 0;
    recdSound.play();
  };

  // auto scroll to bottom
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // fun for msg sent
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sending",
    };

    // play notification on ms sent
    playSendSound();

    const agentId = Date.now() + 1;

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: agentId,
        role: "agent",
        content: "",
        status: "Sending",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        messages: [{ role: "user", content: userMsg.content }],
        runId: "weatherAgent",
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5,
        topP: 1,
        runtimeContext: {},
        resourceId: "weatherAgent",
      };

      // handling msg sent
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          "x-mastra-dev-playground": "true",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(`API error: ${res.status} ${res.statusText}`);

      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: "Sent" } : m))
      );

      const text = await res.text();
      console.log(text);

      const finalMessage = extractTextFromResponse(text) || "(no response)";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentId ? { ...m, content: finalMessage } : m
        )
      );
      playRecdSound();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, status: "Delivered" } : m
        )
      );
    } catch (err) {
      const msg = err?.message || "Unknown error";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === agentId ? { ...m, content: `⚠️ Error: ${msg}` } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // extractin text from respnse

  function extractTextFromResponse(text) {
    console.log(`extractTextFromResponse called`);

    try {
      const json = JSON.parse(text);

      if (typeof json === "string") return json;
      if (json?.content) return json.content;
      if (json?.message?.content) return json.message.content;
      console.log(`json.message.content`, json.message.content);
    } catch {
      console.log(`failed`);
    }

    // Handle tokenized format
    const tokenRegex = /(?:\d+):"([^"]*)"/g;
    const tokens = [];
    let m;
    while ((m = tokenRegex.exec(text)) !== null) {
      tokens.push(m[1]);
    }
    if (tokens.length) {
      text = tokens.join(" ");
    }

    return text
      .replace(/\\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/\s([.,!?;:])/g, "$1")
      .replace(/\\n/g, "<br/>") // 
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .trim();
  }

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  function highlightText(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  // export chat
  const exportChat = () => {
    if (messages.length === 0) return;

    // format messages for text export
    const text = messages
      .map(
        (m) =>
          `[${m.time}] ${m.role === "user" ? "You" : "Agent"}: ${m.content}`
      )
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col h-[100vh] transition-colors ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      <header
        className={`flex items-center justify-between p-4 border-b ${
          darkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <h1 className="font-semibold text-lg">Weather Chat</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter city name to searc message ..."
          className={`px-3 py-1 rounded-md text-sm border ${
            darkMode
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        />
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 rounded-md cursor-pointer ${
              darkMode
                ? "bg-slate-700 text-white"
                : "bg-slate-200 text-slate-900"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => setMessages([])}
            className="px-3 cursor-pointer py-1 bg-rose-100 text-rose-700 rounded-md text-sm"
          >
            Clear
          </button>
          <button
            onClick={exportChat}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm cursor-pointer"
          >
            Export
          </button>
        </div>
      </header>

      <main
        ref={containerRef}
        className={`flex-1 overflow-auto p-4 space-y-4 $ darkMode ? "bg-slate-800" : "bg-gray-50"} `}
      >
        {messages.map((m, idx) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[70%] ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : darkMode
                  ? "bg-slate-700 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <div>
                {highlightText(
                  m.content ||
                    (m.role === "agent" &&
                    isLoading &&
                    idx === messages.length - 1
                      ? "Typing..."
                      : ""),
                  search
                )}
              </div>
              <div className="flex justify-between gap-2 text-[10px] gap-2 text-wite mt-1 text-right">
                <span> {m.time}</span>
                {m.role === "user" && (
                  <span>
                    <>{m.status}</>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
      <footer className="p-4 border-t flex gap-2">
        {error && (
          <div className="absolute bottom-20 left-4 text-sm text-red-600">
            Error: {error}
          </div>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about the weather..."
          disabled={isLoading}
          className={`flex-1 border rounded-md px-3 py-2 ${
            darkMode
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-slate-300 text-black"
          }`}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </footer>
    </div>
  );
};
export default Chat;
