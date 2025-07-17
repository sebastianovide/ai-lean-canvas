import { useState, useRef, useEffect } from "react";
import { Save, Plus, Minus, Settings } from "lucide-react";
import { streamText } from "ai";
import { createOllama } from "ollama-ai-provider";

interface CanvasSection {
  id: string;
  order: number;
  title?: string;
  items?: string[];
  subsections?: { title: string; items: string[] }[];
}

const initialCanvas: CanvasSection[] = [
  {
    id: "problem",
    order: 2,
    subsections: [
      { title: "Problem", items: [] },
      { title: "Existing Alternatives", items: [] },
    ],
  },
  {
    id: "solution",
    order: 4,
    title: "Solution",
    items: [],
  },
  {
    id: "key-metrics",
    order: 8,
    title: "Key Metrics",
    items: [],
  },
  {
    id: "unique-value-proposition",
    order: 3,
    subsections: [
      { title: "Unique Value Proposition", items: [] },
      { title: "High Level Concept", items: [] },
    ],
  },
  {
    id: "unfair-advantage",
    order: 9,
    title: "Unfair Advantage",
    items: [],
  },
  {
    id: "channels",
    order: 5,
    title: "Channels",
    items: [],
  },
  {
    id: "customer-segments",
    order: 1,
    subsections: [
      { title: "Customer Segments", items: [] },
      { title: "Early Adopter", items: [] },
    ],
  },
  {
    id: "cost-structure",
    order: 7,
    title: "Cost Structure",
    items: [],
  },
  {
    id: "revenue-streams",
    order: 6,
    title: "Revenue Streams",
    items: [],
  },
];

// Add the constant for the default Ollama model
const DEFAULT_OLLAMA_MODEL = "qwen3:0.6b";

function App() {
  const [canvas, setCanvas] = useState<CanvasSection[]>(initialCanvas);
  // Chat state
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot" | "assistant" | "system"; content: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Track AI typing state
  const [aiThinking, setAIThinking] = useState(false);
  // Track which item is being edited
  const [editing, setEditing] = useState<{
    sectionId: string;
    subsectionTitle?: string;
    index: number;
  } | null>(null);
  // Track the index of the pending new item for each section/subsection
  const [pendingNewItem, setPendingNewItem] = useState<{
    sectionId: string;
    subsectionTitle?: string;
    index: number;
  } | null>(null);
  // Ref for input elements
  const inputRefs = useRef<Record<string, HTMLInputElement[]>>({});
  // Config state for AI service
  const [aiConfig, setAIConfig] = useState<{
    service: string;
    ollamaUrl: string;
    ollamaModel: string;
    apiKey: string; // Still keep for other services, though not used by Ollama
  }>({
    service: "Local Ollama", // Default to Local Ollama
    ollamaUrl: "http://localhost:11434/api",
    ollamaModel: DEFAULT_OLLAMA_MODEL, // Default model
    apiKey: "",
  });
  const [showConfig, setShowConfig] = useState(false);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Unified sendMessage: handles both form and programmatic messages, now uses AI SDK
  const sendMessage = async (eOrContent: React.FormEvent | string) => {
    let userMsgContent;
    if (typeof eOrContent === "string") {
      userMsgContent = eOrContent;
    } else {
      eOrContent.preventDefault();
      if (!chatInput.trim()) return;
      userMsgContent = chatInput;
      setChatInput("");
    }

    const newUserMessage = {
      role: "user" as const,
      content: userMsgContent,
    };
    setChatMessages((msgs) => [...msgs, newUserMessage]);
    setAIThinking(true);

    try {
      const ollama = createOllama({
        baseURL: aiConfig.ollamaUrl, // Should include /api
      });

      const SYSTEM_PROMPT =
        "## Lean Canvas Strategist: Relentless Success Driver\n" +
        "---" +
        "**Role:** Brutal, synthetic Lean Canvas advisor.\n" +
        "**Goal:** Build an unassailable Lean Canvas.\n" +
        "**Directives:**\n" +
        "  - **Challenge EVERY assumption.**\n" +
        "  - **Expose ALL weaknesses.**\n" +
        "  - **Demand concrete, data-backed rationale per section.**\n" +
        "  - **Systematically question ALL Lean Canvas sections.**\n" +
        "  - **REVISE all sections to find conflicts.**\n" + // NEW: Instruction to find conflicts
        "  - Identify critical gaps/inconsistencies.\n" +
        "  - Force concise, impactful refinement.\n" +
        "  - There are up to 3 short sentences per section.\n" +
        "  - **RESPOND with extreme brevity: single sentences or bullet points.**\n" +
        "  - Drive towards a bulletproof Lean Canvas plan.\n" +
        "  - **Always ask a direct, probing question for the NEXT relevant section.**";
      const result = await streamText({
        model: ollama(aiConfig.ollamaModel),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...[...chatMessages, newUserMessage].map((msg) => ({
            role: msg.role === "bot" ? "assistant" : msg.role, // Map 'bot' to 'assistant' for AI SDK
            content: msg.content,
          })),
        ],
      });

      let fullResponse = "";
      for await (const textDelta of result.textStream) {
        fullResponse += textDelta;
        setChatMessages((msgs) => {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.role === "bot") {
            // Update the last message if it's the bot's partial response
            return [
              ...msgs.slice(0, msgs.length - 1),
              { ...lastMsg, content: fullResponse },
            ];
          } else {
            // Otherwise, add a new bot message
            return [...msgs, { role: "bot", content: fullResponse }];
          }
        });
      }
    } catch (error) {
      console.error("Error communicating with Ollama:", error);
      setChatMessages((msgs) => [
        ...msgs,
        {
          role: "bot",
          content:
            "Sorry, I couldn't connect to the AI service. Please check your configuration and ensure Ollama is running.",
        },
      ]);
    } finally {
      setAIThinking(false);
    }
  };

  // Helper to get section/subsection title
  const getSectionAndSubTitle = (
    sectionId: string,
    subsectionTitle?: string
  ) => {
    const section = initialCanvas.find((s) => s.id === sectionId);
    if (!section) return { sectionTitle: sectionId, subsectionTitle };
    if (subsectionTitle)
      return { sectionTitle: section.title || section.id, subsectionTitle };
    return {
      sectionTitle: section.title || section.id,
      subsectionTitle: undefined,
    };
  };

  // Helper to get current items after change
  const getCurrentItems = (
    sectionId: string,
    subsectionTitle?: string,
    canvasState = canvas
  ) => {
    const section = canvasState.find((s) => s.id === sectionId);
    if (!section) return [];
    if (subsectionTitle && section.subsections) {
      const sub = section.subsections.find((s) => s.title === subsectionTitle);
      return sub ? sub.items : [];
    }
    return section.items || [];
  };

  const addItem = (sectionId: string, subsectionTitle?: string) => {
    // Get current items to determine new index
    const items = getCurrentItems(sectionId, subsectionTitle);
    const newIndex = items.length;
    
    setCanvas((prev) => {
      const next = prev.map((section) => {
        if (section.id === sectionId) {
          if (subsectionTitle && section.subsections) {
            return {
              ...section,
              subsections: section.subsections.map((sub) => {
                if (sub.title === subsectionTitle && sub.items.length < 3) {
                  return { ...sub, items: [...sub.items, ""] };
                }
                return sub;
              }),
            };
          } else if (
            !subsectionTitle &&
            section?.items &&
            section?.items?.length < 3
          ) {
            return { ...section, items: [...section.items, ""] };
          }
        }
        return section;
      });
      setPendingNewItem({ sectionId, subsectionTitle, index: newIndex });
      return next;
    });
    
    // After canvas update, focus the new input
    setTimeout(() => {
      const key = subsectionTitle ? `${sectionId}-${subsectionTitle}` : sectionId;
      if (inputRefs.current[key] && inputRefs.current[key][newIndex]) {
        inputRefs.current[key][newIndex].focus();
        inputRefs.current[key][newIndex].select();
      }
      setEditing({ sectionId, subsectionTitle, index: newIndex });
    }, 0);
  };

  const removeItem = (
    sectionId: string,
    index: number,
    subsectionTitle?: string
  ) => {
    // Get the item to be removed BEFORE updating state
    const items = getCurrentItems(sectionId, subsectionTitle);
    const removedItem = items[index] || "";

    // If the removed item is the pending new item or being edited, clear both before updating the canvas
    if (
      pendingNewItem &&
      pendingNewItem.sectionId === sectionId &&
      pendingNewItem.index === index &&
      pendingNewItem.subsectionTitle === subsectionTitle
    ) {
      setPendingNewItem(null);
    }
    if (
      editing &&
      editing.sectionId === sectionId &&
      editing.index === index &&
      editing.subsectionTitle === subsectionTitle
    ) {
      setEditing(null);
    }

    // Update canvas state
    setCanvas((prev) => {
      return prev.map((section) => {
        if (section.id === sectionId) {
          if (subsectionTitle && section.subsections) {
            return {
              ...section,
              subsections: section.subsections.map((sub) => {
                if (sub.title === subsectionTitle) {
                  return {
                    ...sub,
                    items: sub.items.filter((_, i) => i !== index),
                  };
                }
                return sub;
              }),
            };
          } else if (!subsectionTitle) {
            return {
              ...section,
              items: section?.items?.filter((_, i) => i !== index),
            };
          }
        }
        return section;
      });
    });

    // Only send chat message if removedItem is non-empty
    if (removedItem.trim() !== "") {
      // Send chat message AFTER state update, outside of setCanvas callback
      const updatedItems = getCurrentItems(sectionId, subsectionTitle).filter(
        (_, i) => i !== index
      );
      const { sectionTitle, subsectionTitle: subTitle } = getSectionAndSubTitle(
        sectionId,
        subsectionTitle
      );
      sendMessage(
        `Removed '${removedItem}' from${
          subTitle ? ` ${subTitle}` : sectionTitle ? ` ${sectionTitle}` : ""
        }. Now the list is: ${
          updatedItems.filter((i) => i).length
            ? updatedItems
                .filter((i) => i)
                .map((i) => `'${i}'`)
                .join(", ")
            : "(empty)"
        }`
      );
    }
  };

  // Modified updateItem: only update value, do not send bot message
  const updateItem = (
    sectionId: string,
    index: number,
    value: string,
    subsectionTitle?: string
  ) => {
    setCanvas((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          if (subsectionTitle && section.subsections) {
            return {
              ...section,
              subsections: section.subsections.map((sub) =>
                sub.title === subsectionTitle
                  ? {
                      ...sub,
                      items: sub.items.map((item, i) =>
                        i === index ? value : item
                      ),
                    }
                  : sub
              ),
            };
          } else if (!subsectionTitle) {
            return {
              ...section,
              items: section?.items?.map((item, i) =>
                i === index ? value : item
              ),
            };
          }
        }
        return section;
      })
    );
  };

  // New: handle when editing is finished (onBlur or Enter)
  const handleItemEditDone = (
    sectionId: string,
    value: string,
    subsectionTitle?: string,
    index?: number
  ) => {
    // Prevent message if item no longer exists (was just removed)
    const items = getCurrentItems(sectionId, subsectionTitle);
    if (typeof index === "number" && (index < 0 || index >= items.length)) {
      setEditing(null);
      return;
    }
    // Only send bot message if this is the pending new item and value is non-empty
    if (
      value.trim() !== "" &&
      editing &&
      editing.sectionId === sectionId &&
      editing.index === index &&
      editing.subsectionTitle === subsectionTitle
    ) {
      const { sectionTitle, subsectionTitle: subTitle } = getSectionAndSubTitle(
        sectionId,
        subsectionTitle
      );
      sendMessage(
        `Added '${value}' to${
          subTitle ? ` ${subTitle}` : sectionTitle ? ` ${sectionTitle}` : ""
        }. Now the list is: ${
          items.filter((i) => i).length
            ? items
                .filter((i) => i)
                .map((i) => `'${i}'`)
                .join(", ")
            : "(empty)"
        }`
      );
      setPendingNewItem(null);
    }
    setEditing(null);
  };

  const renderItems = (
    items: string[],
    sectionId: string,
    subsectionTitle?: string
  ) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 group min-w-0 overflow-x-hidden"
        >
          <input
            type="text"
            ref={(el) => {
              const key = subsectionTitle ? `${sectionId}-${subsectionTitle}` : sectionId;
              if (!inputRefs.current[key]) {
                inputRefs.current[key] = [];
              }
              if (el) {
                inputRefs.current[key][index] = el;
              }
            }}
            value={item}
            onFocus={(e) => {
              // If this is a new empty item, set editing state immediately
              if (item === "") {
                setEditing({ sectionId, subsectionTitle, index });
                // Select all text to make it easier to start typing
                (e.target as HTMLInputElement).select();
              }
            }}
            onBlur={(e) => {
              if (
                editing &&
                editing.sectionId === sectionId &&
                editing.index === index &&
                editing.subsectionTitle === subsectionTitle
              ) {
                handleItemEditDone(
                  sectionId,
                  e.target.value,
                  subsectionTitle,
                  index
                );
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            onChange={(e) =>
              updateItem(sectionId, index, e.target.value, subsectionTitle)
            }
            className="w-0 flex-1 min-w-0 max-w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter item..."
          />
          <button
            onClick={() => removeItem(sectionId, index, subsectionTitle)}
            className="p-1 text-red-500 hover:text-red-700 shrink-0"
          >
            <Minus size={12} />
          </button>
        </div>
      ))}
      {items.length < 3 && (
        <button
          onClick={() => addItem(sectionId, subsectionTitle)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
      )}
    </div>
  );

  const renderSection = (section: CanvasSection, className: string = "") => (
    <div
      className={`border-2 border-gray-300 p-3 h-full flex flex-col relative overflow-x-hidden ${
        className || "bg-white"
      }`}
    >
      {/* Order number in top-right corner */}
      <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs font-bold full w-5 h-5 flex items-center justify-center">
        {section.order}
      </div>

      {!section.subsections && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {`${section?.items?.length || 0}/3`}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {section.subsections ? (
          <div className="h-full flex flex-col">
            {section.subsections.map((subsection) => (
              <div
                key={subsection.title}
                className="flex-1 border-b border-gray-200 pb-2 last:border-b-0 last:pb-0 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
                    {subsection.title}
                  </h3>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {`${subsection.items.length}/3`}
                  </div>
                </div>
                <div className="flex-1">
                  {renderItems(subsection.items, section.id, subsection.title)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderItems(section?.items || [], section.id)
        )}
      </div>
    </div>
  );

  const getSectionById = (id: string) =>
    canvas.find((section) => section.id === id)!;

  const handleSaveCanvas = () => {
    const json = JSON.stringify(canvas, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lean-canvas.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <style>{`
        .dot-typing {
          display: inline-block;
        }
        .dot-typing .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 1px;
          background: #888;
          border-radius: 50%;
          animation: dot-typing 1s infinite linear alternate;
        }
        .dot-typing .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot-typing .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dot-typing {
          0% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 0.2; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 flex gap-6">
        {/* Main content (canvas) */}
        <div className="flex-1 min-w-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lean Canvas Editor
            </h1>
            <p className="text-gray-600">Build your business model canvas</p>
          </div>

          {/* Lean Canvas Grid Layout */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-10 grid-rows-3 gap-0 h-[600px]">
              {/* Row 1 */}
              <div className="col-span-2 row-span-2">
                {renderSection(getSectionById("problem"), "bg-orange-50")}
              </div>
              <div className="col-span-2">
                {renderSection(getSectionById("solution"), "bg-blue-50")}
              </div>
              <div className="col-span-2 row-span-2">
                {renderSection(
                  getSectionById("unique-value-proposition"),
                  "bg-yellow-50"
                )}
              </div>
              <div className="col-span-2">
                {renderSection(
                  getSectionById("unfair-advantage"),
                  "bg-purple-50"
                )}
              </div>
              <div className="col-span-2 row-span-2">
                {renderSection(
                  getSectionById("customer-segments"),
                  "bg-indigo-50"
                )}
              </div>

              {/* Row 2 */}
              <div className="col-span-2">
                {renderSection(getSectionById("key-metrics"), "bg-teal-50")}
              </div>
              <div className="col-span-2">
                {renderSection(getSectionById("channels"), "bg-cyan-50")}
              </div>

              {/* Row 3 */}
              <div className="col-span-5">
                {renderSection(getSectionById("cost-structure"), "bg-red-50")}
              </div>
              <div className="col-span-5">
                {renderSection(
                  getSectionById("revenue-streams"),
                  "bg-green-50"
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              onClick={handleSaveCanvas}
            >
              <Save size={20} />
              Save Canvas
            </button>
          </div>
        </div>
        {/* Chat sidebar */}
        <aside className="w-80 bg-white rounded-lg shadow-lg flex flex-col h-[800px]">
          <div className="p-4 border-b font-bold text-lg text-blue-700 flex items-center justify-between">
            <span>AI Brainstorm Chat</span>
            <button
              className="ml-2 p-1 rounded hover:bg-blue-100 text-blue-700"
              title="Configure AI Service"
              onClick={() => setShowConfig(true)}
            >
              <Settings size={20} />
            </button>
          </div>
          {/* Show current AI config */}
          <div className="px-4 py-2 text-xs text-gray-600 border-b bg-gray-50">
            <span className="font-semibold">AI: </span>
            {aiConfig.service}
            {aiConfig.service === "Local Ollama" ? (
              <span className="ml-2">
                ({aiConfig.ollamaUrl}, Model: {aiConfig.ollamaModel})
              </span>
            ) : null}
          </div>
          {/* Config Modal/Popover */}
          {showConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowConfig(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-lg font-bold mb-4 text-blue-700">
                  AI Service Configuration
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowConfig(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Service
                    </label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={aiConfig.service}
                      onChange={(e) =>
                        setAIConfig((cfg) => ({
                          ...cfg,
                          service: e.target.value,
                        }))
                      }
                    >
                      <option value="OpenAI">OpenAI</option>
                      <option value="Gemini">Gemini</option>
                      <option value="Anthropic">Anthropic</option>
                      <option value="Local Ollama">Local Ollama</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {aiConfig.service === "Local Ollama" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ollama URL
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={aiConfig.ollamaUrl}
                          onChange={(e) =>
                            setAIConfig((cfg) => ({
                              ...cfg,
                              ollamaUrl: e.target.value,
                            }))
                          }
                          placeholder="http://localhost:11434/api"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Ollama Model
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          value={aiConfig.ollamaModel}
                          onChange={(e) =>
                            setAIConfig((cfg) => ({
                              ...cfg,
                              ollamaModel: e.target.value,
                            }))
                          }
                          placeholder={DEFAULT_OLLAMA_MODEL}
                        />
                      </div>
                    </>
                  )}
                  {aiConfig.service !== "Local Ollama" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        API Key
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={aiConfig.apiKey}
                        onChange={(e) =>
                          setAIConfig((cfg) => ({
                            ...cfg,
                            apiKey: e.target.value,
                          }))
                        }
                        placeholder="Enter API key..."
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.length === 0 && (
              <div className="text-gray-400 text-sm text-center">
                Start brainstorming with the AI!
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[70%] text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* AI typing indicator */}
            {aiThinking && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg max-w-[70%] text-sm bg-gray-200 text-gray-800">
                  <span className="inline-block">
                    <span className="dot-typing">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ask the AI..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export default App;
