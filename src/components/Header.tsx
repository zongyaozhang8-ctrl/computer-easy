import React, { useState } from "react";
import { Laptop, Volume2, UserCheck, Calendar } from "lucide-react";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  dialect: string;
  onDialectChange: (lang: string) => void;
  streakCount: number;
}

export default function Header({
  currentView,
  onNavigate,
  dialect,
  onDialectChange,
  streakCount,
}: HeaderProps) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getDialectLabel = (lang: string) => {
    switch (lang) {
      case "mandarin":
        return "普通话 (标准口语)";
      case "sichuan":
        return "四川话 (亲切方言)";
      case "cantonese":
        return "粤语 (地道白话)";
      case "henan":
        return "河南话 (中原老乡音)";
      default:
        return "普通话";
    }
  };

  const formatDate = () => {
    const d = new Date();
    const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Title & Logo */}
        <div 
          className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none text-center lg:text-left flex-col sm:flex-row"
          onClick={() => onNavigate("dashboard")}
          id="header-logo"
        >
          <div className="bg-blue-600 text-white p-2.5 sm:p-3 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-300">
            <Laptop className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2]" />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5">
              <span>电脑小助手</span> 
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                手把手教学
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-semibold mt-0.5">
              不懂电脑别着急，AI 老师教您一步步轻松学会！
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center w-full lg:w-auto">
          {/* Dialect Voice Selector */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-300 transition-all font-bold text-base sm:text-lg cursor-pointer shadow-xs w-full sm:w-auto"
              id="header-dialect-btn"
            >
              <Volume2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600" />
              <span>方言：{getDialectLabel(dialect).split(" ")[0]}</span>
            </button>
            {showLangMenu && (
              <div 
                className="absolute right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1"
                id="dialect-menu-dropdown"
              >
                {[
                  { key: "mandarin", label: "普通话 (标准大白话)", hello: "您好，想学点什么？" },
                  { key: "sichuan", label: "四川话 (亲切四川音)", hello: "要学啥子电脑操作，我手把手教你！" },
                  { key: "cantonese", label: "粤语 (亲切广州音)", hello: "想学啲咩电脑嘢，我一步步教你！" },
                  { key: "henan", label: "河南话 (中原老乡音)", hello: "老乡，今儿想学个啥，包教包会！" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onDialectChange(item.key);
                      setShowLangMenu(false);
                      try {
                        const ssu = new SpeechSynthesisUtterance(item.hello);
                        ssu.rate = 0.85;
                        window.speechSynthesis.speak(ssu);
                      } catch (e) {
                        console.log("Speech error", e);
                      }
                    }}
                    className={`w-full text-left px-4 py-2 text-base sm:text-lg font-bold rounded-xl transition-all ${
                      dialect === item.key
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Streak Indicator badge */}
          <button
            onClick={() => onNavigate("mylearning")}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-300 font-bold text-base sm:text-lg transition-all shadow-xs w-full sm:w-auto"
            id="header-streak-badge"
          >
            <span>🔥 连续学习</span>
            <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-sm sm:text-base font-extrabold">
              {streakCount} 天
            </span>
          </button>

          {/* Family portal link */}
          <button
            onClick={() => onNavigate("familyhelp")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-base sm:text-lg transition-all shadow-sm cursor-pointer w-full sm:w-auto"
            id="header-help-btn"
          >
            <UserCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            <span>找家人帮忙</span>
          </button>
        </div>
      </div>

      {/* Date banner */}
      <div className="bg-slate-50 py-2.5 border-t border-slate-100 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left text-xs sm:text-sm md:text-base text-slate-600 font-bold">
          <span className="flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            今天是：{formatDate()}
          </span>
          <span className="text-blue-600">
            电脑有不懂？直接告诉我，轻松上手
          </span>
        </div>
      </div>
    </header>
  );
}
