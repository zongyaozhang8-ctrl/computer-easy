import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Camera, FileText, Sparkles, Volume2, VolumeX, Eye, ArrowDown } from "lucide-react";

interface Step {
  num: number;
  text: string;
  icon?: string;
}

interface AnalysisResult {
  detectedApp: string;
  summary: string;
  steps: Step[];
  videoSuggestion?: string;
}

interface ScreenshotIdentifyProps {
  onBack: () => void;
  onRecordStudy: (title: string, category: string) => void;
}

// Simulated real-world PC screen photos that the elder can click to instantly test!
const SAMPLE_SCREENS = [
  {
    id: "word_save",
    name: "📝 Word 软件正在编写文档",
    desc: "模拟一张 Word 输入内容后想要保存的电脑屏幕",
    imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop",
    prompt: "我想保存这个Word文档，下一步点哪里？",
  },
  {
    id: "excel_input",
    name: "📊 Excel 表格有很多小格子",
    desc: "模拟一张 Excel 需要合并单元格的电脑屏幕",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    prompt: "我想把这几个格子合并起来，怎么做？",
  },
  {
    id: "win_desktop",
    name: "🖥️ 电脑开机后的 Windows 桌面",
    desc: "模拟一个空空的电脑大屏幕，需要找文件",
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=600&auto=format&fit=crop",
    prompt: "电脑刚开机，我的文件放哪了？",
  }
];

export default function ScreenshotIdentify({
  onBack,
  onRecordStudy,
}: ScreenshotIdentifyProps) {
  const [image, setImage] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setImage(null);
      setResult(null);
      
      // Delay slightly to let the video element render
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
      }, 300);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("无法启动摄像头。请确保您已授予网页相机使用权限，或者直接点击【上传电脑截图/照片】。");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggers mock screenshot study
  const handleSelectPreset = (preset: typeof SAMPLE_SCREENS[0]) => {
    setImage(preset.imageUrl);
    setGoal(preset.prompt);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenshot: image,
          targetGoal: goal.trim() || "我不知道该点哪里，请老师指导下一步。",
        }),
      });

      if (!response.ok) {
        throw new Error("AI 识别失败，请重试。");
      }

      const data = await response.json();
      setResult(data);

      // Register study metric
      onRecordStudy(
        `拍照识别: ${data.detectedApp || "电脑屏幕"}`,
        data.detectedApp || "截图识别"
      );

      // Speak result automatically
      speakResult(data);

    } catch (err: any) {
      console.error(err);
      alert("抱歉，识别过程出了点小错。请确保上传了正常的电脑软件图片，并再次尝试。");
    } finally {
      setAnalyzing(false);
    }
  };

  const speakResult = (res: AnalysisResult) => {
    window.speechSynthesis.cancel();
    let text = `${res.summary}. 老师帮您找到的步骤是：`;
    res.steps.forEach((s) => {
      text += `第${s.num}步：${s.text}。`;
    });

    const ssu = new SpeechSynthesisUtterance(text);
    ssu.rate = 0.8;
    ssu.onend = () => setIsSpeaking(false);
    ssu.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(ssu);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result) {
      speakResult(result);
    }
  };

  const resetAll = () => {
    setImage(null);
    setGoal("");
    setResult(null);
    stopCamera();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header Back Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-5 text-center sm:text-left">
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            onBack();
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg cursor-pointer transition-all shadow-xs w-full sm:w-auto"
          id="scan-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight flex items-center justify-center gap-2">
          📷 拍照识别电脑画面
        </h2>
      </div>

      {!image && !isCameraActive && (
        <div className="space-y-8">
          {/* Elegant Notice Banner */}
          <div className="bg-blue-50 border border-blue-200 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-slate-900">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 flex items-center gap-2">
              💡 怎么用“拍照识别”功能？
            </h3>
            <p className="mt-2 text-sm sm:text-base md:text-lg text-slate-600 font-semibold leading-relaxed">
              1. 拿出手机把电脑屏幕拍下来，或者用电脑自带的摄像头进行拍照。
              <br />
              2. 把拍好的照片上传，AI 老师会自动帮您分析画面，告诉您应该点击哪个图标、在哪里打字！
            </p>
          </div>

          {/* Action triggers - Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={startCamera}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 sm:gap-5 group cursor-pointer"
              id="scan-trigger-camera"
            >
              <div className="bg-emerald-50 text-emerald-600 p-4 sm:p-5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <span className="text-xl sm:text-2xl font-black text-slate-950 block">📸 启动摄像头拍电脑</span>
                <span className="text-sm sm:text-base text-slate-500 font-semibold block leading-relaxed">
                  直接对准眼前的电脑大屏幕拍照，一键获取解析
                </span>
              </div>
            </button>

            <div
              onDragOver={handleAnalyze ? handleDragOver : undefined}
              onDragLeave={handleAnalyze ? handleDragLeave : undefined}
              onDrop={handleAnalyze ? handleDrop : undefined}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white hover:bg-slate-50 border border-slate-200 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 sm:gap-5 cursor-pointer ${
                dragOver ? "border-blue-500 bg-blue-50/50 scale-102" : ""
              }`}
              id="scan-trigger-upload"
            >
              <div className="bg-blue-50 text-blue-600 p-4 sm:p-5 rounded-full">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <span className="text-xl sm:text-2xl font-black text-slate-950 block">📂 选择照片或电脑截图</span>
                <span className="text-sm sm:text-base text-slate-500 font-semibold block leading-relaxed">
                  支持点击选取、拖拽照片文件或手机上传截图
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Preset Test Case Screens for elder's easy testing */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-slate-500" />
              如果您没有准备好图片，可以点击下方模拟屏幕，体验识别效果：
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="preset-screens-grid">
              {SAMPLE_SCREENS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl overflow-hidden shadow-xs cursor-pointer transition-all flex flex-col hover:shadow-md"
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="h-32 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-4 space-y-1">
                    <span className="font-extrabold text-base text-slate-900 block">
                      {preset.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block">
                      {preset.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera streaming mode */}
      {isCameraActive && (
        <div className="bg-slate-950 rounded-3xl overflow-hidden relative border border-slate-800 max-w-xl mx-auto shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 object-cover"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
            <button
              onClick={capturePhoto}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg px-8 py-4 rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              id="camera-snap-btn"
            >
              <Camera className="w-5 h-5" />
              <span>📷 拍照识别</span>
            </button>
            <button
              onClick={stopCamera}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-base px-6 py-4 rounded-full shadow-md cursor-pointer transition-all"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Image Selected and Ready for Analysis */}
      {image && !analyzing && !result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="analyze-setup-view">
          {/* Left Preview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">📸 选好的电脑画面：</h3>
            <div className="relative border border-slate-200 rounded-3xl overflow-hidden bg-slate-100 shadow-xs">
              <img
                src={image}
                alt="电脑屏幕"
                className="w-full h-72 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={resetAll}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg py-3.5 rounded-2xl cursor-pointer transition-all"
            >
              重新选择一张照片
            </button>
          </div>

          {/* Right Input Goal */}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-950">
                ✏️ 您在这个画面卡在哪里了？
              </h3>
              <p className="text-base text-slate-500 font-semibold leading-relaxed">
                例如：我想保存这个文件、我想打印这个表格、这个窗口怎么关、我想上网...
              </p>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="可以直接不写，默认我们会帮您全面识别当前按钮！"
                rows={4}
                className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:outline-none rounded-2xl p-4 text-xl font-bold text-slate-800 shadow-inner"
                id="analyze-input-goal"
              />
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-5 rounded-2xl shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all"
              id="analyze-submit-btn"
            >
              <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              <span>让 AI 老师帮我分析！</span>
            </button>
          </div>
        </div>
      )}

      {/* Analyzing pulse banner */}
      {analyzing && (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-6 max-w-xl mx-auto shadow-sm">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-950">
              老师正在仔细看您的图...
            </h3>
            <p className="text-lg text-slate-500 font-bold">
              大约需要 10秒 钟，请不要着急，不要离开页面哦。
            </p>
          </div>
        </div>
      )}

      {/* Result display wizard layout */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="analysis-result-view">
          {/* Left Preview */}
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 px-4 py-3 rounded-xl text-lg font-bold">
              🖥️ 识别出的软件：<span className="font-extrabold text-xl">{result.detectedApp}</span>
            </div>
            <div className="relative border border-slate-200 rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
              <img
                src={image!}
                alt="电脑屏幕"
                className="w-full h-80 object-contain"
                referrerPolicy="no-referrer"
              />
              {/* Pulsing ring elegant pointer instead of raw bounce text */}
              <div className="absolute top-1/4 left-1/3 flex items-center gap-2 bg-red-600 text-white font-bold px-3 py-1.5 rounded-full shadow-lg text-sm">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                <span>目标点击位置</span>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg py-3.5 rounded-2xl cursor-pointer shadow-xs transition-all"
            >
              📸 再拍一张别的地方
            </button>
          </div>

          {/* Right Visual Steps */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="bg-slate-100 text-slate-800 font-extrabold text-sm px-3 py-1 rounded-lg">
                AI 老师手把手指导
              </span>
              <button
                onClick={toggleSpeak}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm cursor-pointer"
                id="result-speak-btn"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                <span>{isSpeaking ? "停止播放" : "🔊 听老师朗读步骤"}</span>
              </button>
            </div>

            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed">
              {result.summary}
            </p>

            <div className="space-y-4" id="screenshot-result-steps">
              {result.steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-start gap-3">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 w-10 h-10 flex items-center justify-center rounded-full text-lg font-black shrink-0">
                      {step.num}
                    </span>
                    <div className="space-y-1">
                      <span className="text-xl font-extrabold">{step.icon || "👉"}</span>
                      <p className="text-lg font-bold text-slate-900 leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>

                  {idx < result.steps.length - 1 && (
                    <div className="text-slate-400 my-1">
                      <ArrowDown className="w-5 h-5 stroke-[2]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.videoSuggestion && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-900 text-sm font-bold text-center">
                🎬 老师建议：配合视频大图里的 <span>“{result.videoSuggestion}”</span> 教程一起操作，学得更快！
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
