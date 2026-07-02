import React from "react";
import { MessageSquare, Camera, BookOpen, Star, HelpCircle, ArrowRight, Bell } from "lucide-react";
import { HelpRequest } from "../types";

interface DashboardProps {
  onNavigate: (view: string) => void;
  onSelectTutorial: (id: string) => void;
  onAskPredefinedQuestion: (question: string) => void;
  helpRequests: HelpRequest[];
}

export default function Dashboard({
  onNavigate,
  onSelectTutorial,
  onAskPredefinedQuestion,
  helpRequests,
}: DashboardProps) {
  const resolvedRequests = helpRequests.filter(
    (req) => req.status === "resolved" && req.response
  );

  return (
    <div className="space-y-6 sm:space-y-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Alert for Children Reply - Elegant, clean banner */}
      {resolvedRequests.length > 0 && (
        <div 
          onClick={() => onNavigate("familyhelp")}
          className="bg-indigo-50 border border-indigo-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-indigo-100/70 transition-all duration-300"
          id="child-response-alert"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
            <div className="bg-indigo-600 text-white p-2.5 sm:p-3 rounded-2xl">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 fill-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">🎉 孩子给您回复了解答！</h3>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-1 font-semibold">
                针对您问的“{resolvedRequests[0].problem}”，请点击这里看孩子给您的贴心指南。
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 shrink-0" />
        </div>
      )}

      {/* Greeting Title */}
      <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
          您好！今天想掌握什么电脑本领？
        </h2>
        <p className="text-sm sm:text-base md:text-xl text-slate-500 font-semibold">
          我们为您准备了简单好用、大字清晰的电脑指导，请在下方选择
        </p>
      </div>

      {/* Core Grid Menu - Dignified & High-End Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" id="dashboard-main-menu">
        {/* Button 1: AI Chat */}
        <button
          onClick={() => onNavigate("ai-chat")}
          className="bg-white hover:bg-slate-50/50 border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left gap-4 sm:gap-5 group cursor-pointer w-full"
          id="btn-ask-ai"
        >
          <div className="bg-blue-50 text-blue-600 p-3.5 sm:p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">🎤 说话或打字 问老师</h3>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-semibold leading-relaxed">
              像微信聊天一样，直接说出或打出您遇到的困难。AI 老师教您一步步操作。
            </p>
          </div>
        </button>

        {/* Button 2: Screen Scan */}
        <button
          onClick={() => onNavigate("camera")}
          className="bg-white hover:bg-slate-50/50 border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left gap-4 sm:gap-5 group cursor-pointer w-full"
          id="btn-scan-screen"
        >
          <div className="bg-emerald-50 text-emerald-600 p-3.5 sm:p-4 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">📷 对着屏幕 拍照提问</h3>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-semibold leading-relaxed">
              觉得打字说不清楚？直接用手机拍下电脑屏幕，我们帮您认上面的按钮。
            </p>
          </div>
        </button>

        {/* Button 3: Tutorials Library */}
        <button
          onClick={() => onNavigate("tutorials")}
          className="bg-white hover:bg-slate-50/50 border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left gap-4 sm:gap-5 group cursor-pointer w-full"
          id="btn-browse-tutorials"
        >
          <div className="bg-amber-50 text-amber-600 p-3.5 sm:p-4 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">📚 查阅系统大图教程</h3>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-semibold leading-relaxed">
              包含鼠标使用、写字存文件、做表格、连接打印机等全套日常操作图解。
            </p>
          </div>
        </button>

        {/* Button 4: Favorites & History */}
        <button
          onClick={() => onNavigate("mylearning")}
          className="bg-white hover:bg-slate-50/50 border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left gap-4 sm:gap-5 group cursor-pointer w-full"
          id="btn-mylearning"
        >
          <div className="bg-indigo-50 text-indigo-600 p-3.5 sm:p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">⭐ 我学过和收藏的</h3>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-semibold leading-relaxed">
              学了容易忘？以前收藏的好办法、学过的知识足迹，都为您妥善存放在这里。
            </p>
          </div>
        </button>
      </div>

      {/* Today's Recommended Study Banner - Sleek and Elegant */}
      <div 
        onClick={() => onSelectTutorial("word-save")}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        id="daily-recommend-card"
      >
        <div className="space-y-2 sm:space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              今日特别推荐
            </span>
            <span className="text-yellow-300 font-bold text-sm sm:text-base">💡 每日一分钟</span>
          </div>
          <h3 className="text-lg sm:text-2xl md:text-3xl font-black">
            如何保存 Word 文档，防止文件丢失
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-blue-100 font-medium leading-relaxed">
            辛苦写的报告不见了最让人着急！点这里看 1 分钟大字图文，学会终生受用。
          </p>
        </div>
        <div className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-base sm:text-xl px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center transition-transform group-hover:scale-105">
          <span>立刻看</span>
          <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Frequently Asked High-Frequency Questions */}
      <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-5 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          大家常遇到的小烦恼（直接点击看答案）：
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" id="faq-shortcuts-grid">
          {[
            { q: "电脑屏幕字体太小了，怎么调大？", act: "怎么把电脑屏幕上的字调大" },
            { q: "写好的文件不见了，去哪里找？", act: "我刚才保存的文件不见了去哪找" },
            { q: "打印机连接上了，但是打不出来纸？", act: "打印机连上了可是打印不了" },
            { q: "电脑没有声音了，怎么调大音量？", act: "电脑没有声音怎么办" },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => onAskPredefinedQuestion(item.act)}
              className="w-full text-left bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-200/80 p-4 sm:p-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-slate-700 flex items-start gap-2.5 transition-all cursor-pointer"
            >
              <span className="text-blue-500 shrink-0 mt-0.5">❓</span>
              <span className="leading-relaxed">{item.q}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
