import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, 
  Plus, Minus, ArrowDown, HelpCircle, Sparkles, Star, Play, Pause 
} from "lucide-react";
import { ChatMessage } from "../types";

// Standard webkitSpeechRecognition types for TS compiler safety
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface AiAssistantProps {
  onBack: () => void;
  dialect: string;
  onRecordStudy: (title: string, category: string) => void;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export default function AiAssistant({
  onBack,
  dialect,
  onRecordStudy,
  initialQuestion,
  onClearInitialQuestion,
}: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "您好！我是您的电脑AI小老师。有什么电脑操作不会用，或者哪里卡住了，可以直接和我说！我可以给您一步一步列出大图和说明。点击【🎤 我要说话】可以直接用嘴提问哦！",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [textSize, setTextSize] = useState<"normal" | "large" | "huge">("large");
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);

  // Auto-read preference persistence for Chat Assistant
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("elder_chat_auto_speak_enabled");
    return saved !== null ? saved === "true" : true;
  });

  // Save speech preference
  useEffect(() => {
    localStorage.setItem("elder_chat_auto_speak_enabled", String(autoSpeakEnabled));
  }, [autoSpeakEnabled]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "zh-CN";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Handle pre-defined shortcut from dashboard or initial question
  useEffect(() => {
    if (initialQuestion) {
      setInputText(initialQuestion);
      // Wait a tiny bit and submit
      const timer = setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 500);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
      return () => clearTimeout(timer);
    }
  }, [initialQuestion]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("您的浏览器不支持语音输入，请点击键盘打字输入。推荐使用最新版谷歌浏览器。");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputText("");
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    // stop speaking previous audio
    window.speechSynthesis.cancel();
    setIsSpeaking(null);

    const userMsg: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Send chat message to local backend proxying Gemini
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("AI 响应失败，请稍后重试。");
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        role: "model",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(),
        steps: data.steps,
        detectedApp: data.detectedApp,
      };

      setMessages((prev) => {
        const next = [...prev, aiMsg];
        // Automatically speak out the summary and the first step to assist the elder
        if (autoSpeakEnabled) {
          setTimeout(() => {
            speakMessage(aiMsg, data.reply, next.length - 1);
          }, 100);
        }
        return next;
      });

      // If we got steps back, automatically register this as studied
      if (aiMsg.steps && aiMsg.steps.length > 0) {
        onRecordStudy(prompt, data.detectedApp || "电脑提问");
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "抱歉，刚才网络打了个盹，没听清。要不您再试着问一次？",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clean speech synthesis when navigating away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Speaks message out loud using SpeechSynthesis
  const speakMessage = (msg: ChatMessage, fallbackText: string, index: number) => {
    window.speechSynthesis.cancel();
    setIsSpeechPaused(false);

    let speakText = "";
    if (msg.steps && msg.steps.length > 0) {
      speakText += `${msg.content}。步骤如下：`;
      msg.steps.forEach((s) => {
        speakText += `第${s.num}步：${s.text}。`;
      });
    } else {
      speakText = fallbackText;
    }

    const ssu = new SpeechSynthesisUtterance(speakText);
    
    // Slower speed for elderly
    ssu.rate = 0.8;
    
    // Vary rate/pitch slightly based on dialect selected (simulation)
    if (dialect === "sichuan") {
      ssu.pitch = 0.9;
    } else if (dialect === "cantonese") {
      ssu.pitch = 1.1;
    } else if (dialect === "henan") {
      ssu.rate = 0.83;
    }

    ssu.onend = () => {
      setIsSpeaking(null);
      setIsSpeechPaused(false);
    };

    ssu.onerror = () => {
      setIsSpeaking(null);
      setIsSpeechPaused(false);
    };

    setIsSpeaking(index);
    window.speechSynthesis.speak(ssu);
  };

  const handlePauseSpeech = () => {
    window.speechSynthesis.pause();
    setIsSpeechPaused(true);
  };

  const handleResumeSpeech = () => {
    window.speechSynthesis.resume();
    setIsSpeechPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(null);
    setIsSpeechPaused(false);
  };

  // Font sizing CSS maps
  const getTextSizeClass = () => {
    switch (textSize) {
      case "normal":
        return "text-lg";
      case "huge":
        return "text-3xl leading-relaxed";
      case "large":
      default:
        return "text-2xl leading-normal";
    }
  };

  const getStepTextSizeClass = () => {
    switch (textSize) {
      case "normal":
        return "text-base";
      case "huge":
        return "text-2xl";
      case "large":
      default:
        return "text-xl";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs shrink-0">
        <button
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-lg cursor-pointer w-full sm:w-auto justify-center"
          id="chat-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <span className="font-bold text-base hidden sm:inline text-slate-400">字号大小：</span>
          <button
            onClick={() => setTextSize("normal")}
            className={`px-3.5 py-1.5 rounded-lg text-base font-extrabold transition-all ${
              textSize === "normal" ? "bg-white text-slate-950 shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            中
          </button>
          <button
            onClick={() => setTextSize("large")}
            className={`px-3.5 py-1.5 rounded-lg text-base font-extrabold transition-all ${
              textSize === "large" ? "bg-white text-slate-950 shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            大
          </button>
          <button
            onClick={() => setTextSize("huge")}
            className={`px-3.5 py-1.5 rounded-lg text-base font-extrabold transition-all ${
              textSize === "huge" ? "bg-white text-slate-950 shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            特大 (老花)
          </button>
        </div>
      </div>

      {/* Auto Speak Toggle bar */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs sm:text-base text-center sm:text-left">
          <span>📢 自动语音播报：</span>
          <span className={autoSpeakEnabled ? "text-emerald-600" : "text-slate-500"}>
            {autoSpeakEnabled ? "已开启" : "已关闭 (手动点击播放)"}
          </span>
        </div>
        <button
          onClick={() => {
            if (autoSpeakEnabled) {
              stopSpeaking();
            }
            setAutoSpeakEnabled(!autoSpeakEnabled);
          }}
          className={`w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-black transition-all cursor-pointer border shadow-xs ${
            autoSpeakEnabled
              ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {autoSpeakEnabled ? "点击关闭自动播报" : "点击开启自动播报"}
        </button>
      </div>

      {/* Chat messages stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" id="chat-messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-6 shadow-xs border ${
                msg.role === "user"
                  ? "bg-blue-600 text-white border-blue-700 rounded-tr-none"
                  : "bg-white text-slate-800 border-slate-200/80 rounded-tl-none"
              }`}
            >
              {/* Message origin header */}
              <div className={`flex items-center justify-between mb-2.5 text-xs font-bold border-b pb-2 ${msg.role === "user" ? "text-blue-100 border-white/20" : "text-slate-400 border-slate-100"}`}>
                <span className="flex items-center gap-2">
                  {msg.role === "user" ? "👴 我的提问" : "👩‍🏫 AI 电脑老师"}
                  {msg.detectedApp && (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${msg.role === "user" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                      {msg.detectedApp}
                    </span>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Chat reply content */}
              <div className={`${getTextSizeClass()} font-semibold whitespace-pre-wrap leading-relaxed`}>
                {msg.content}
              </div>

              {/* Step list wizard layout */}
              {msg.steps && msg.steps.length > 0 && (
                <div className="mt-6 space-y-4 border-t border-slate-200/80 pt-4">
                  <div className="bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl font-extrabold inline-flex items-center gap-1.5 text-lg">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span>为您生成的“手把手”步骤清单：</span>
                  </div>

                  <div className="space-y-4" id={`step-cards-list-${index}`}>
                    {msg.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex flex-col items-center">
                        <div className="w-full bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-start gap-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 w-11 h-11 flex items-center justify-center rounded-full text-xl font-black shrink-0">
                            {step.num}
                          </span>
                          <div className="space-y-1 flex-1">
                            <span className="text-2xl font-extrabold">{step.icon || "👇"}</span>
                            <p className={`${getStepTextSizeClass()} font-bold text-slate-900 leading-relaxed`}>
                              {step.text}
                            </p>
                          </div>
                        </div>

                        {/* Chevron connector between steps */}
                        {sIdx < (msg.steps?.length || 0) - 1 && (
                          <div className="my-1.5 text-slate-400">
                            <ArrowDown className="w-5 h-5 stroke-[2]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speak buttons */}
              {msg.role === "model" && (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  {isSpeaking === index ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {isSpeechPaused ? (
                        <button
                          onClick={handleResumeSpeech}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-all shadow-xs"
                        >
                          <Play className="w-4 h-4 fill-emerald-700 text-emerald-700" />
                          <span>▶️ 继续播放</span>
                        </button>
                      ) : (
                        <button
                          onClick={handlePauseSpeech}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-all shadow-xs"
                        >
                          <Pause className="w-4 h-4 text-amber-700" />
                          <span>⏸️ 暂停播放</span>
                        </button>
                      )}
                      
                      <button
                        onClick={stopSpeaking}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-all shadow-xs"
                      >
                        <VolumeX className="w-4 h-4" />
                        <span>⏹️ 停止播放</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => speakMessage(msg, msg.content, index)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer transition-all shadow-xs"
                    >
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span>🔊 听老师朗读步骤 (大音量)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <p className="text-lg font-bold text-slate-500">
                老师正在仔细思考，请稍候...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic overlay if speaking */}
      {isRecording && (
        <div className="bg-blue-600 text-white py-3 px-4 text-center text-lg font-bold shrink-0 flex items-center justify-center gap-2">
          <Mic className="w-5 h-5 animate-pulse" />
          <span>正在倾听您的说话，说完了请点击右边【说完了】确认。</span>
        </div>
      )}

      {/* Big footer input zone */}
      <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex flex-col gap-2.5 sm:gap-3.5 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex gap-2 flex-1 w-full min-w-0">
            {/* Large text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="也可以输入文字提问..."
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-base sm:text-xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors shadow-inner"
              id="chat-text-input"
            />

            {/* Huge Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 sm:px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-base sm:text-lg transition-all shadow-xs cursor-pointer shrink-0"
              id="chat-send-btn"
            >
              <Send className="w-4.5 h-4.5" />
              <span>发送</span>
            </button>
          </div>

          {/* Big Speak Microphone Button */}
          <button
            onClick={toggleRecording}
            className={`w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-base sm:text-lg shadow-xs border transition-all cursor-pointer shrink-0 ${
              isRecording
                ? "bg-red-600 border-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
            }`}
            id="mic-speak-trigger"
          >
            {isRecording ? <MicOff className="w-5 h-5 sm:w-6 h-6" /> : <Mic className="w-5 h-5 sm:w-6 h-6 stroke-[2]" />}
            <span>{isRecording ? "说完了 (点我)" : "🎤 我要说话"}</span>
          </button>
        </div>

        {/* Short helpers helper row */}
        <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500 font-bold justify-start">
          <span>猜您想学：</span>
          {[
            "怎么复制和粘贴",
            "文件重命名怎么做",
            "怎么上网浏览新闻",
            "怎么把字变大",
          ].map((topic, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(topic);
                handleSendMessage(topic);
              }}
              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
