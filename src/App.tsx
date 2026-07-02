import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AiAssistant from "./components/AiAssistant";
import ScreenshotIdentify from "./components/ScreenshotIdentify";
import TutorialLibrary from "./components/TutorialLibrary";
import MyLearning from "./components/MyLearning";
import FamilyHelp from "./components/FamilyHelp";
import FamilyPortal from "./components/FamilyPortal";
import { DBState } from "./types";

const INITIAL_DB: DBState = {
  favorites: [],
  helpRequests: [],
  streak: {
    count: 0,
    lastStudyDate: "",
  },
  learningHistory: [],
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [dbState, setDbState] = useState<DBState>(INITIAL_DB);
  const [dialect, setDialect] = useState<string>("mandarin");
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>(undefined);
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(null);

  // 1. Check URL parameters for children portal access & load database
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "family-portal" || params.get("family") === "true") {
      setCurrentView("family-portal");
    }

    fetchDatabase();
  }, []);

  const fetchDatabase = async () => {
    try {
      const response = await fetch("/api/db");
      if (response.ok) {
        const data = await response.json();
        setDbState(data);
      }
    } catch (err) {
      console.error("Failed to fetch database, using offline mock state", err);
    }
  };

  // 2. Register completed study, streaks, and learning history logs
  const handleRecordStudy = async (title: string, category: string) => {
    try {
      const response = await fetch("/api/db/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (response.ok) {
        const updatedDb = await response.json();
        setDbState(updatedDb);
      }
    } catch (err) {
      console.error("Failed to register study", err);
    }
  };

  // 3. Submit a family help request
  const handleSubmitHelp = async (problem: string, screenshot: string) => {
    try {
      const response = await fetch("/api/db/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, screenshot }),
      });
      if (response.ok) {
        await fetchDatabase();
        return true;
      }
      throw new Error("Failed to submit request");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 4. Family Portal - children responding to ticket
  const handleRespondHelp = async (id: string, responseText: string) => {
    try {
      const response = await fetch(`/api/db/help/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText }),
      });
      if (response.ok) {
        await fetchDatabase();
        return true;
      }
      throw new Error("Failed to submit response");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 5. Toggle favorite tutorial
  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await fetch("/api/db/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        const updatedDb = await response.json();
        setDbState(updatedDb);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Direct FAQ trigger
  const handleAskPredefinedQuestion = (question: string) => {
    setInitialQuestion(question);
    setCurrentView("ai-chat");
  };

  const handleSelectTutorial = (id: string) => {
    setSelectedTutorialId(id);
    setCurrentView("tutorials");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none" id="app-root-container">
      {currentView === "family-portal" ? (
        <FamilyPortal
          dbState={dbState}
          onRespondHelp={handleRespondHelp}
          onRefresh={fetchDatabase}
        />
      ) : (
        <>
          {currentView === "dashboard" && (
            <Header
              currentView={currentView}
              onNavigate={setCurrentView}
              dialect={dialect}
              onDialectChange={setDialect}
              streakCount={dbState.streak.count}
            />
          )}

          <main className="flex-1 pb-16">
            {currentView === "dashboard" && (
              <Dashboard
                onNavigate={setCurrentView}
                onSelectTutorial={handleSelectTutorial}
                onAskPredefinedQuestion={handleAskPredefinedQuestion}
                helpRequests={dbState.helpRequests}
              />
            )}

            {currentView === "ai-chat" && (
              <AiAssistant
                onBack={() => setCurrentView("dashboard")}
                dialect={dialect}
                onRecordStudy={handleRecordStudy}
                initialQuestion={initialQuestion}
                onClearInitialQuestion={() => setInitialQuestion(undefined)}
              />
            )}

            {currentView === "camera" && (
              <ScreenshotIdentify
                onBack={() => setCurrentView("dashboard")}
                onRecordStudy={handleRecordStudy}
              />
            )}

            {currentView === "tutorials" && (
              <TutorialLibrary
                onBack={() => setCurrentView("dashboard")}
                favorites={dbState.favorites}
                onToggleFavorite={handleToggleFavorite}
                onRecordStudy={handleRecordStudy}
                selectedTutorialId={selectedTutorialId}
                onClearSelectedTutorial={() => setSelectedTutorialId(null)}
              />
            )}

            {currentView === "mylearning" && (
              <MyLearning
                onBack={() => setCurrentView("dashboard")}
                dbState={dbState}
                onSelectTutorial={handleSelectTutorial}
              />
            )}

            {currentView === "familyhelp" && (
              <FamilyHelp
                onBack={() => setCurrentView("dashboard")}
                dbState={dbState}
                onSubmitHelp={handleSubmitHelp}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
