import React, { useState } from "react";
import { Heart, Clock, CheckCircle2, Send, Laptop, Image as ImageIcon, Sparkles } from "lucide-react";
import { DBState, HelpRequest } from "../types";

interface FamilyPortalProps {
  dbState: DBState;
  onRespondHelp: (id: string, responseText: string) => Promise<any>;
  onRefresh: () => void;
}

export default function FamilyPortal({
  dbState,
  onRespondHelp,
  onRefresh,
}: FamilyPortalProps) {
  const { helpRequests } = dbState;
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(
    helpRequests.length > 0 ? helpRequests[0] : null
  );
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectRequest = (req: HelpRequest) => {
    setActiveRequest(req);
    setResponseText(req.response || "");
  };

  const handleSubmitResponse = async () => {
    if (!activeRequest) return;
    if (!responseText.trim()) {
      alert("请输入您的指导意见哦，以便长辈看到！");
      return;
    }

    setSubmitting(true);
    try {
      await onRespondHelp(activeRequest.id, responseText.trim());
      alert("解答成功！长辈在他们的电脑小助手 APP 首页将立即收到红色通知并阅读您的回复。");
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("回复失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans" id="family-portal-root">
      {/* Top Console Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-2 rounded-xl text-white">
              <Heart className="w-6 h-6 fill-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                电脑小助手 <span className="text-xs bg-purple-500 text-purple-100 px-2 py-0.5 rounded-full font-semibold">家人关怀控制台</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                远程同步：随时查看并解决父母长辈的电脑使用疑惑
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            🔄 刷新提问
          </button>
        </div>
      </nav>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Tickets Queue list */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[350px] md:h-[calc(100vh-140px)] shadow-xl">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              📥 父母的求救消息队列 ({helpRequests.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {helpRequests.length > 0 ? (
              helpRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => handleSelectRequest(req)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    activeRequest?.id === req.id
                      ? "bg-slate-700 border-indigo-500 text-white"
                      : "bg-slate-850 border-slate-700/60 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-semibold">
                      {new Date(req.timestamp).toLocaleDateString()}
                    </span>
                    {req.status === "resolved" ? (
                      <span className="bg-green-950 text-green-300 border border-green-800 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>已解答</span>
                      </span>
                    ) : (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5 animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>待处理</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold line-clamp-2">
                    {req.problem}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3 text-slate-500">
                <Heart className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm font-bold">暂无父母的求助信息</p>
                <p className="text-xs">等父母在小助手APP中一键求助后，将在此显现。</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 2): Active Ticket Details & Writing Response Form */}
        <div className="md:col-span-2 space-y-6 flex flex-col justify-between h-auto md:h-[calc(100vh-140px)]">
          {activeRequest ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 overflow-y-auto space-y-6 flex-1 shadow-xl">
              {/* Ticket Meta Details header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="space-y-1">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md font-semibold">
                    工单号: {activeRequest.id}
                  </span>
                  <h2 className="text-xl font-bold text-white">长辈发来的求助详情</h2>
                </div>
                <span className="text-sm text-slate-400">
                  提问时间：{new Date(activeRequest.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Parents descriptions */}
              <div className="bg-slate-750 p-4 rounded-xl border border-slate-700 space-y-1">
                <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
                  👵 父母的疑惑描述：
                </span>
                <p className="text-base font-bold text-white leading-relaxed">
                  “{activeRequest.problem}”
                </p>
              </div>

              {/* Screnshot Attachments if exists */}
              {activeRequest.screenshot && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    长辈附带的电脑屏幕照片（可分析界面、准确定位按钮）：
                  </span>
                  <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900 max-h-60 flex items-center justify-center p-2">
                    <img
                      src={activeRequest.screenshot}
                      alt="父母上传截图"
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Responder inputs */}
              <div className="space-y-4 border-t border-slate-700 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    给父母写写简单的大白话建议（可以用【第一步】【第二步】）：
                  </span>
                  {activeRequest.status === "resolved" && (
                    <span className="text-xs text-green-400 font-semibold">
                      （之前已解答，下方为已保存内容，可以二次修改）
                    </span>
                  )}
                </div>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="妈，您点那个绿色的软件就行。我建议您：&#10;1. 找到写着 Microsoft Word 的蓝色图标双击。&#10;2. 写好东西点最左上角【文件】。&#10;3. 选择【另存为】，点击【桌面】存下它！"
                  rows={6}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none rounded-xl p-4 text-sm font-semibold text-slate-200 placeholder-slate-500 shadow-inner resize-none"
                  id="portal-reply-text"
                />

                <button
                  onClick={handleSubmitResponse}
                  disabled={submitting || !responseText.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold text-base py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="portal-submit-btn"
                >
                  <Send className="w-5 h-5" />
                  <span>{submitting ? "正在递交解答..." : "📤 发送解答到父母电脑小助手"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 flex-1 flex flex-col justify-center items-center text-center space-y-4 shadow-xl">
              <Laptop className="w-16 h-16 text-slate-600" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">等待长辈上传求助</h2>
                <p className="text-sm text-slate-400 max-w-sm">
                  当父母写下疑惑或对屏幕拍照并发起求助时，您打开此网页即可无缝解答。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
