import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Send, Camera, UserCheck, Heart, 
  Clock, CheckCircle, ExternalLink, MessageSquareText 
} from "lucide-react";
import { DBState, HelpRequest } from "../types";

interface FamilyHelpProps {
  onBack: () => void;
  dbState: DBState;
  onSubmitHelp: (problem: string, screenshot: string) => Promise<any>;
}

export default function FamilyHelp({
  onBack,
  dbState,
  onSubmitHelp,
}: FamilyHelpProps) {
  const { helpRequests } = dbState;
  const [problem, setProblem] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeCamera, setActiveCamera] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpRequest | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate the absolute URL of the children portal
  const getFamilyPortalUrl = () => {
    const origin = window.location.origin;
    return `${origin}/?view=family-portal`;
  };

  const handleCopyLink = () => {
    const url = getFamilyPortalUrl();
    navigator.clipboard.writeText(url);
    alert("求助网址复制成功！您可以把它发给微信里的儿女、儿媳，他们打开后就能看到您的屏幕照片并给您解答。");
  };

  const startCamera = async () => {
    try {
      setActiveCamera(true);
      setScreenshot(null);
      setTimeout(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      }, 200);
    } catch (err) {
      console.error(err);
      alert("启动摄像头失败，建议您直接打字描述问题！");
      setActiveCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setScreenshot(canvas.toDataURL("image/png"));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const probDesc = problem.trim();
    if (!probDesc) {
      alert("请先写一下遇到什么不会了哦！");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitHelp(probDesc, screenshot || "");
      setProblem("");
      setScreenshot(null);
      alert("求助发送成功！我们已经通知了您的子女。您可以点击右方‘复制求助链接’，将网址发在微信里，催一催孩子快点帮您看看！");
    } catch (err) {
      console.error(err);
      alert("发送求助失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8" id="family-help-view">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-5 text-center sm:text-left">
        <button
          onClick={onBack}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg cursor-pointer transition-all shadow-xs w-full sm:w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          🙋 一键呼叫家人协助
        </h2>
      </div>

      {/* Synchronized Children Portal Informational banner */}
      <div className="bg-indigo-50 border border-indigo-150 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div className="space-y-1.5 sm:space-y-2 flex-1 text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center justify-center md:justify-start gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            电脑不会用，儿女来相助！
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
            把电脑屏幕拍照、写下疑惑，一键发给孩子。孩子可以在手机上、公司电脑上随时打开【求助网页】看到您的提问，并写下大字解答！
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-base px-6 py-4 rounded-2xl shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-all w-full md:w-auto"
          id="copy-portal-link-btn"
        >
          <ExternalLink className="w-4.5 h-4.5" />
          <span>复制求助网址发微信</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Form: Submit New Ticket */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            ✍️ 填写我的求助请求
          </h3>

          {/* Question Descripts */}
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-700 block">
              第一步：写下遇到什么小麻烦了？
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="例如：我刚才在Word写检验单，不知道该怎么把写好的报告保存下来。你快帮帮妈妈！"
              rows={4}
              className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none rounded-2xl p-4 text-lg font-bold text-slate-800 shadow-inner"
              id="help-problem-desc"
            />
          </div>

          {/* Picture Attachments */}
          <div className="space-y-3">
            <label className="text-base font-bold text-slate-700 block">
              第二步：拍一张电脑屏幕照片 (可选)：
            </label>

            {activeCamera ? (
              <div className="bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <button
                    onClick={capturePhoto}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-bold text-sm cursor-pointer transition-all"
                  >
                    📸 拍照
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full font-bold text-sm cursor-pointer transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : screenshot ? (
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 h-48 flex items-center justify-center shadow-xs">
                <img
                  src={screenshot}
                  alt="求助屏幕"
                  className="h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setScreenshot(null)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 flex items-center justify-center rounded-full font-black text-sm cursor-pointer transition-all"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-800 font-bold text-base transition-all"
                >
                  <Camera className="w-8 h-8 text-slate-500" />
                  <span>手机拍照上传</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-800 font-bold text-base transition-all"
                >
                  <Camera className="w-8 h-8 text-slate-500" />
                  <span>选取相册照片</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white font-black text-xl py-4.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            id="help-submit-btn"
          >
            <Send className="w-5 h-5" />
            <span>{submitting ? "正在呼救中..." : "发送并呼唤子女解答"}</span>
          </button>
        </div>

        {/* Right Section: View tickets history and children replies */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            📋 我的求助记录列表
          </h3>

          {helpRequests.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" id="tickets-history-list">
              {helpRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedTicket(req)}
                  className={`border p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md flex items-start gap-4 ${
                    req.status === "resolved"
                      ? "bg-indigo-50/40 border-indigo-100"
                      : "bg-amber-50/40 border-amber-100"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold">
                        ⏱️ {new Date(req.timestamp).toLocaleDateString()}
                      </span>
                      {req.status === "resolved" ? (
                        <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>儿女已回复</span>
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>等待解答中</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-relaxed">
                      “{req.problem}”
                    </h4>

                    {req.response && (
                      <div className="bg-indigo-50 text-indigo-950 p-3 rounded-xl text-sm font-bold border border-indigo-100 mt-2">
                        <span className="text-indigo-600">❤️ 孩子解答：</span>
                        <p className="line-clamp-2 mt-0.5 font-semibold text-slate-800 leading-relaxed">{req.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-12 rounded-3xl text-center space-y-3">
              <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-500">暂时没有求助记录。</p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                如果遇到 AI 老师解答得不够懂的问题，随时用左边表单给孩子发起呼救！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Response Ticket Dialog Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-lg font-bold text-slate-900">
                📄 求助单详情
              </h4>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 font-extrabold text-2xl hover:text-slate-600 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold block">我的提问时间：</span>
                <span className="text-sm text-slate-700 font-bold block">
                  {new Date(selectedTicket.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-extrabold block">❓ 我的提问内容：</span>
                <p className="text-lg font-bold text-slate-900 leading-relaxed">
                  {selectedTicket.problem}
                </p>
              </div>

              {selectedTicket.screenshot && (
                <div className="space-y-1">
                  <span className="text-sm text-slate-400 font-bold block">附带的屏幕截图：</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <img
                      src={selectedTicket.screenshot}
                      alt="提问屏幕"
                      className="w-full h-40 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                {selectedTicket.response ? (
                  <div className="bg-indigo-50 text-indigo-950 p-5 rounded-2xl border border-indigo-150 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-base text-indigo-900">
                      <MessageSquareText className="w-5 h-5 text-indigo-600" />
                      <span>❤️ 儿女给您的贴心回复：</span>
                    </div>
                    <p className="text-lg font-extrabold text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.response}
                    </p>
                    {selectedTicket.responseAt && (
                      <span className="text-xs text-indigo-500 font-semibold block text-right mt-1">
                        解答时间：{new Date(selectedTicket.responseAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/50 text-amber-900 p-5 rounded-2xl text-center space-y-2 border border-amber-100">
                    <p className="text-sm font-bold">⌛ 子女正在快马加鞭解答中...</p>
                    <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                      点击最上方的“复制求助网址”，把它发到微信里告诉孩子，他们就能立刻作答。
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg py-4 rounded-2xl cursor-pointer transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
