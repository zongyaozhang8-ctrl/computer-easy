import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Search, Star, Play, CheckCircle2, 
  Volume2, VolumeX, ArrowDown, HelpCircle, Film, Pause, RotateCcw
} from "lucide-react";
import { TUTORIALS } from "../data";
import { Tutorial } from "../types";

interface TutorialLibraryProps {
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRecordStudy: (title: string, category: string) => void;
  selectedTutorialId: string | null;
  onClearSelectedTutorial: () => void;
}

export default function TutorialLibrary({
  onBack,
  favorites,
  onToggleFavorite,
  onRecordStudy,
  selectedTutorialId,
  onClearSelectedTutorial,
}: TutorialLibraryProps) {
  const [activeTab, setActiveTab] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [studyCompleted, setStudyCompleted] = useState(false);

  // Auto-read preference persistence
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("elder_auto_speak_enabled");
    return saved !== null ? saved === "true" : true;
  });

  // Save speech preference
  useEffect(() => {
    localStorage.setItem("elder_auto_speak_enabled", String(autoSpeakEnabled));
  }, [autoSpeakEnabled]);

  // Elder-friendly Video Player States
  const [videoSpeed, setVideoSpeed] = useState<number>(0.7); // 0.7x slow motion is recommended for elderly learners by default
  const [videoPlaying, setVideoPlaying] = useState<boolean>(true);
  const [videoMuted, setVideoMuted] = useState<boolean>(true); // default to muted to avoid browser autoplay blocks
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLine, setVideoLine] = useState<"primary" | "backup">("primary");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentVideoUrl = activeTutorial?.videoUrl && videoLine === "primary"
    ? activeTutorial.videoUrl
    : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

  // Sync state to video element when videoSpeed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed, videoLoading, showVideoModal, videoLine, videoError]);

  // Sync state to video element when playing state changes
  useEffect(() => {
    if (videoRef.current) {
      if (videoPlaying && !videoError) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [videoPlaying, showVideoModal, videoLine, videoError]);

  // Sync state to video element when muted state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = videoMuted;
    }
  }, [videoMuted, showVideoModal, videoLine, videoError]);

  // Reset video player states when opening a video
  useEffect(() => {
    if (showVideoModal) {
      setVideoPlaying(true);
      setVideoLoading(true);
      setVideoError(false);
      setVideoLine("primary");
      setVideoSpeed(0.7);
    } else {
      setVideoPlaying(false);
    }
  }, [showVideoModal]);

  // Auto load tutorial if passed from parent (e.g. dashboard selection)
  useEffect(() => {
    if (selectedTutorialId) {
      const tut = TUTORIALS.find((t) => t.id === selectedTutorialId);
      if (tut) {
        setActiveTutorial(tut);
        setStudyCompleted(false);
      }
      onClearSelectedTutorial();
    }
  }, [selectedTutorialId]);

  // Clean speech synthesis and handle auto speak when navigating to/away from active tutorial
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsSpeechPaused(false);

    if (activeTutorial && autoSpeakEnabled) {
      const timer = setTimeout(() => {
        speakTutorialSteps(activeTutorial);
      }, 500);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeTutorial]);

  // Filter tutorials by tab and search
  const categories = ["全部", "电脑基础", "Word", "Excel", "浏览器", "打印机"];

  const filteredTutorials = TUTORIALS.filter((t) => {
    const matchTab = activeTab === "全部" || t.category === activeTab;
    const matchSearch =
      searchQuery.trim() === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.searchKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTab && matchSearch;
  });

  const handleSelectTutorial = (tut: Tutorial) => {
    setActiveTutorial(tut);
    setStudyCompleted(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsSpeechPaused(false);
  };

  const speakTutorialSteps = (tut: Tutorial) => {
    window.speechSynthesis.cancel();
    let text = `${tut.title}。简介：${tut.description}。第一步：`;
    tut.steps.forEach((s, idx) => {
      text += `${s.text}。`;
      if (idx < tut.steps.length - 1) {
        text += ` 然后，第${tut.steps[idx + 1].num}步：`;
      }
    });

    const ssu = new SpeechSynthesisUtterance(text);
    ssu.rate = 0.8;
    ssu.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };
    ssu.onerror = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    };

    setIsSpeaking(true);
    setIsSpeechPaused(false);
    window.speechSynthesis.speak(ssu);
  };

  const handleCompleteStudy = (tut: Tutorial) => {
    setStudyCompleted(true);
    onRecordStudy(tut.title, tut.category);
    
    // Play celebratory ding
    try {
      const ssu = new SpeechSynthesisUtterance("恭喜您！又学会了一个电脑新本领！太棒了！");
      ssu.rate = 0.95;
      window.speechSynthesis.speak(ssu);
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Back to Home & Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-5 text-center sm:text-left">
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            if (activeTutorial) {
              setActiveTutorial(null);
            } else {
              onBack();
            }
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg cursor-pointer transition-all shadow-xs w-full sm:w-auto"
          id="tutorial-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{activeTutorial ? "返回教程列表" : "返回首页"}</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          {activeTutorial ? "📄 正在学习" : "📚 电脑步骤教程库"}
        </h2>
      </div>

      {/* VIEW 1: Individual Tutorial Details Stepper View */}
      {activeTutorial ? (
        <div className="space-y-6 sm:space-y-8" id="tutorial-stepper-view">
          {/* Tutorial Header Card */}
          <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {activeTutorial.category}
              </span>
              <span className="text-slate-400 font-bold text-base">⏱️ 预计学习：{activeTutorial.duration}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{activeTutorial.title}</h3>
            <p className="text-lg text-slate-300 font-semibold leading-relaxed">
              {activeTutorial.description}
            </p>
            {/* Highly Interactive voice teaching console */}
            <div className="pt-3 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    📢 语音慢速讲解小助手
                  </span>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    专为年长者调校的超大音量、平缓语速的步骤人声伴读
                  </p>
                </div>
                
                {/* Auto Speak Toggle Checkbox */}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900/80 hover:bg-slate-950 px-4 py-2 rounded-xl border border-slate-700 select-none transition-all">
                  <input
                    type="checkbox"
                    checked={autoSpeakEnabled}
                    onChange={(e) => setAutoSpeakEnabled(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-200">
                    自动播放语音 (建议开启)
                  </span>
                </label>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {!isSpeaking ? (
                  <button
                    onClick={() => speakTutorialSteps(activeTutorial)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.98]"
                    id="tut-speak-start-btn"
                  >
                    <Volume2 className="w-5 h-5 text-blue-200" />
                    <span>🔊 开启语音慢速讲解步骤</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                    {/* Pause/Resume Button */}
                    {isSpeechPaused ? (
                      <button
                        onClick={() => {
                          window.speechSynthesis.resume();
                          setIsSpeechPaused(false);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.98]"
                        id="tut-speak-resume-btn"
                      >
                        <Play className="w-5 h-5 fill-white text-white" />
                        <span>▶️ 继续播放语音讲解</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          window.speechSynthesis.pause();
                          setIsSpeechPaused(true);
                        }}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.98]"
                        id="tut-speak-pause-btn"
                      >
                        <Pause className="w-5 h-5 text-white" />
                        <span>⏸️ 暂停语音讲解</span>
                      </button>
                    )}

                    {/* Stop Button */}
                    <button
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                        setIsSpeechPaused(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.98]"
                      id="tut-speak-stop-btn"
                    >
                      <VolumeX className="w-5 h-5 text-white" />
                      <span>⏹️ 彻底停止播放</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tutorial Step Sequence Card Grid */}
          <div className="space-y-4" id="tutorial-steps-container">
            {activeTutorial.steps.map((step, sIdx) => (
              <div key={sIdx} className="flex flex-col items-center">
                <div className="w-full bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Step Num Icon bubble */}
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 w-14 h-14 flex items-center justify-center rounded-full text-2xl font-black shrink-0">
                    {step.num}
                  </span>

                  {/* Text Instruction details */}
                  <div className="space-y-2 flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start items-center gap-2">
                      <span className="text-3xl">{step.icon || "💻"}</span>
                      <span className="font-extrabold text-blue-600 text-lg">第 {step.num} 步操作</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>

                {/* Vertical Chevron Pointer connector */}
                {sIdx < activeTutorial.steps.length - 1 && (
                  <div className="my-1.5 text-slate-300">
                    <ArrowDown className="w-5 h-5 stroke-[2]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-6">
            {/* Play video shortcut */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              id="tut-play-video-btn"
            >
              <Play className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>▶ 看 30秒 演示视频</span>
            </button>

            {/* Favorite / Unfavorite toggle */}
            <button
              onClick={() => onToggleFavorite(activeTutorial.id)}
              className={`w-full sm:w-auto font-bold text-base px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                favorites.includes(activeTutorial.id)
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Star className={`w-5 h-5 ${favorites.includes(activeTutorial.id) ? "fill-amber-500 text-amber-600" : ""}`} />
              <span>{favorites.includes(activeTutorial.id) ? "已收藏此教程" : "收藏这个教程"}</span>
            </button>

            {/* Register studied streaks button */}
            <button
              onClick={() => handleCompleteStudy(activeTutorial)}
              disabled={studyCompleted}
              className={`w-full sm:w-auto font-black text-lg px-8 py-4.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                studyCompleted
                  ? "bg-slate-50 text-slate-400 border border-slate-200 shadow-none cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              id="tut-complete-btn"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{studyCompleted ? "🎉 恭喜学会啦！" : "我学会了"}</span>
            </button>
          </div>

          {/* Real Video Playback Modal */}
          {showVideoModal && (
            <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4" id="video-player-modal">
              <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
                
                {/* Modal Title */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      📺
                    </span>
                    观看实机演示 ({activeTutorial.title})
                  </h4>
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="text-slate-400 font-extrabold text-3xl hover:text-slate-600 cursor-pointer p-1"
                    aria-label="关闭视频"
                  >
                    ×
                  </button>
                </div>

                {/* Video Playback viewport container */}
                <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video border border-slate-800 relative flex flex-col justify-center items-center text-white">
                  {activeTutorial.videoUrl ? (
                    <>
                      {/* Real Video Element */}
                      {!videoError && (
                        <video
                          ref={videoRef}
                          src={currentVideoUrl}
                          className="w-full h-full object-cover"
                          loop
                          muted={videoMuted}
                          playsInline
                          onLoadStart={() => {
                            setVideoLoading(true);
                            setVideoError(false);
                          }}
                          onCanPlay={() => setVideoLoading(false)}
                          onError={(e) => {
                            console.error("Video element error: ", e);
                            setVideoError(true);
                            setVideoLoading(false);
                          }}
                          id="tutorial-video-player"
                        />
                      )}

                      {/* Loading/Buffering overlay state */}
                      {videoLoading && !videoError && (
                        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10">
                          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-slate-300 font-bold">正在为您调取实机教学录像，请稍候...</p>
                          <p className="text-xs text-slate-500 font-semibold">（通常需要 2~5 秒钟载入）</p>
                        </div>
                      )}

                      {/* Error state overlay - Elder friendly */}
                      {videoError && (
                        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-6 space-y-4 z-20">
                          <span className="text-4xl">⚠️</span>
                          <div className="space-y-1 max-w-sm">
                            <p className="text-base font-bold text-red-400">录像调取暂时遇到了小阻碍</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                              别担心！这通常是由于网络连接缓慢、或浏览器开启了安全策略限制了播放。
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs justify-center">
                            <button
                              onClick={() => {
                                setVideoError(false);
                                setVideoLoading(true);
                                if (videoRef.current) {
                                  videoRef.current.load();
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              🔄 重新加载重试
                            </button>
                            
                            {videoLine === "primary" ? (
                              <button
                                onClick={() => {
                                  setVideoLine("backup");
                                  setVideoError(false);
                                  setVideoLoading(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                ⚡ 切换极速备用线路
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setVideoLine("primary");
                                  setVideoError(false);
                                  setVideoLoading(true);
                                }}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                ⬅️ 返回主线路
                              </button>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800 w-full max-w-xs">
                            <a
                              href={activeTutorial.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              🌐 在新窗口里直接打开视频文件播放 ↗
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
                      <Film className="w-12 h-12 text-slate-500" />
                      <p className="text-base font-bold text-slate-300">暂无此教程的实机录像</p>
                    </div>
                  )}
                </div>

                {/* Elder-friendly Playback Controls */}
                <div className="space-y-4">
                  
                  {/* Speed Adjustment Controls - Vital for elders */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>🐢 播放速度调节（太快看不清？点这里放慢速度）</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-extrabold">当前: {videoSpeed}x 倍速</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setVideoSpeed(0.5)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          videoSpeed === 0.5
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        🐌 0.5x 极慢速
                      </button>
                      <button
                        onClick={() => setVideoSpeed(0.7)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          videoSpeed === 0.7
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        🐢 0.7x 慢速(推荐)
                      </button>
                      <button
                        onClick={() => setVideoSpeed(1.0)}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          videoSpeed === 1.0
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        🚶 1.0x 正常速
                      </button>
                    </div>
                  </div>

                  {/* Play, Pause, Rewind & Sound Controls */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      {videoPlaying ? (
                        <>
                          <Pause className="w-4.5 h-4.5" />
                          <span>暂停播放</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4.5 h-4.5 fill-white" />
                          <span>继续播放</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          setVideoPlaying(true);
                        }
                      }}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 px-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>重新播放</span>
                    </button>

                    <button
                      onClick={() => setVideoMuted(!videoMuted)}
                      className={`py-3 px-2 rounded-2xl font-bold text-sm flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                        videoMuted
                          ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {videoMuted ? (
                        <>
                          <VolumeX className="w-4 h-4 text-amber-600" />
                          <span>静音中(点开声音)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-indigo-600" />
                          <span>声音正常</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Steps Checklist overlaid for reference */}
                <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-indigo-950 block">💡 视频学习提示：对照着以下步骤看视频更清楚哦！</span>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 text-xs font-medium text-slate-700 pr-1">
                    {activeTutorial.steps.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="bg-indigo-100 text-indigo-800 font-extrabold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {s.num}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {s.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg py-4 rounded-2xl cursor-pointer transition-all"
                >
                  我看完了，返回学习步骤
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Browse all tutorials library */
        <div className="space-y-8" id="tutorial-browse-view">
          {/* Keyword Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="打字搜索你想学的本领，如“保存”、“鼠标”"
              className="w-full bg-white border border-slate-300 focus:outline-none focus:border-blue-500 rounded-2xl py-4.5 pl-12 pr-6 text-xl font-bold text-slate-800 placeholder-slate-400 shadow-inner"
              id="tutorial-search-input"
            />
            <Search className="w-6 h-6 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Giant category tabs selection bar */}
          <div className="flex flex-wrap gap-2.5 justify-center" id="tutorial-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-full text-base font-extrabold border transition-all cursor-pointer ${
                  activeTab === cat
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tutorial Grid list */}
          {filteredTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" id="tutorial-cards-grid">
              {filteredTutorials.map((tut) => (
                <div
                  key={tut.id}
                  onClick={() => handleSelectTutorial(tut)}
                  className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between gap-4 sm:gap-5 group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200/60 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                        {tut.category}
                      </span>
                      {favorites.includes(tut.id) && (
                        <span className="text-amber-500 font-bold text-xs flex items-center gap-1">⭐ 已收藏</span>
                      )}
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tut.title}
                    </h4>
                    <p className="text-base text-slate-500 font-semibold leading-relaxed">
                      {tut.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-400 font-bold">⏱️ 耗时：{tut.duration}</span>
                    <span className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-all">
                      <span>看步骤</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xl font-bold text-slate-700">
                抱歉，没找到跟“{searchQuery}”相关的教程。
              </p>
              <p className="text-base text-slate-400 font-semibold">
                您可以试着写个更简短词，或者点击最上面【全部】按钮。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
