import React from "react";
import { ArrowLeft, Star, Award, BookOpen, Calendar, HelpCircle, ArrowRight } from "lucide-react";
import { DBState } from "../types";
import { TUTORIALS } from "../data";

interface MyLearningProps {
  onBack: () => void;
  dbState: DBState;
  onSelectTutorial: (id: string) => void;
}

export default function MyLearning({
  onBack,
  dbState,
  onSelectTutorial,
}: MyLearningProps) {
  const { streak, favorites, learningHistory } = dbState;

  // Get favorited tutorial objects
  const favoritedList = TUTORIALS.filter((t) => favorites.includes(t.id));

  // Determine study reward badges based on streak days
  const getBadge = () => {
    if (streak.count >= 15) {
      return { title: "💻 电脑超级宗师", desc: "连续学习超过15天！太牛了，已经是社区的骄傲啦！", color: "from-purple-600 to-indigo-600" };
    } else if (streak.count >= 7) {
      return { title: "🏆 电脑本领达人", desc: "连续学习超过7天！获得黄金荣誉奖章，学得非常认真！", color: "from-yellow-500 to-amber-600" };
    } else if (streak.count >= 3) {
      return { title: "⭐ 电脑勤奋之星", desc: "连续学习超过3天！万事开头难，您已经成功迈出了大步！", color: "from-blue-500 to-teal-500" };
    } else if (streak.count >= 1) {
      return { title: "🌱 电脑好学先锋", desc: "今天已经开始学习啦！每天进步一小步，成功就在眼前！", color: "from-green-500 to-emerald-500" };
    } else {
      return { title: "🛌 还没有开始学习哦", desc: "点击首页的‘看教程’，学满1分钟，即可激活学习勋章！", color: "from-gray-400 to-slate-500" };
    }
  };

  const badge = getBadge();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-5 text-center sm:text-left">
        <button
          onClick={onBack}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg cursor-pointer transition-all shadow-xs w-full sm:w-auto"
          id="mylearning-back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          ⭐ 我的学习与收藏
        </h2>
      </div>

      {/* Streak Celebrator Card & Active Medal Badge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" id="learning-badge-panel">
        {/* Streak counter card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center flex flex-col justify-center items-center space-y-2 shadow-xs md:col-span-1">
          <span className="text-sm font-bold text-slate-400">🔥 连续学习天数</span>
          <span className="text-5xl sm:text-6xl font-black text-amber-400 tracking-tight">{streak.count}</span>
          <span className="text-base font-bold">天继续加油！</span>
          <p className="text-xs text-slate-400 font-medium pt-2 leading-relaxed">
            天天来学电脑，不光涨本领，还能解锁金牌勋章哦！
          </p>
        </div>

        {/* Medal Badge card */}
        <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:col-span-2 shadow-xs">
          <div className={`bg-gradient-to-br ${badge.color} text-white p-4 sm:p-5 rounded-2xl shadow-sm shrink-0 flex items-center justify-center`}>
            <Award className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2]" />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1 rounded-full uppercase">
              当前荣誉学习勋章等级
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{badge.title}</h3>
            <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
              {badge.desc}
            </p>
          </div>
        </div>
      </div>

      {/* TWO SECTIONS: Favorites list & History logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10" id="favorites-and-history-grid">
        {/* Left Section: My Collected Favorites */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            我收藏的教程 ({favoritedList.length})
          </h3>

          {favoritedList.length > 0 ? (
            <div className="space-y-4" id="collected-favorites-list">
              {favoritedList.map((tut) => (
                <div
                  key={tut.id}
                  onClick={() => onSelectTutorial(tut.id)}
                  className="bg-white hover:bg-slate-50/50 border border-slate-200 p-5 rounded-2xl shadow-xs cursor-pointer transition-all flex items-center justify-between gap-4 hover:shadow-md"
                >
                  <div className="space-y-1">
                    <span className="bg-slate-100 text-slate-700 border border-slate-200/55 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                      {tut.category}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{tut.title}</h4>
                    <p className="text-sm text-slate-500 font-semibold leading-relaxed">{tut.description.slice(0, 30)}...</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-8 rounded-2xl text-center space-y-2">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-500">还没有收藏过教程哦。</p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                在阅读视频和图片步骤时，点击下方【收藏这个教程】，以后就能在这里快速查阅。
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Learning History Logs */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            我的学习成果脚印 ({learningHistory.length})
          </h3>

          {learningHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2" id="learning-history-list">
              {learningHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-800">{item.title}</h4>
                  </div>
                  <span className="text-emerald-600 font-bold">✓ 已学会</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-8 rounded-2xl text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-500">今天还没有留下学习脚印哦。</p>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                跟着教程读完或在 AI 问答里获得解答，系统就会自动帮您记录。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
