import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side JSON storage
const DB_PATH = path.join(process.cwd(), "db.json");

interface DBStructure {
  favorites: string[];
  helpRequests: {
    id: string;
    timestamp: string;
    problem: string;
    screenshot: string; // base64
    status: "pending" | "resolved";
    response?: string;
    responseAt?: string;
  }[];
  streak: {
    count: number;
    lastStudyDate: string; // YYYY-MM-DD
  };
  learningHistory: {
    id: string;
    date: string;
    title: string;
    category: string;
  }[];
}

const DEFAULT_DB: DBStructure = {
  favorites: [],
  helpRequests: [],
  streak: {
    count: 0,
    lastStudyDate: "",
  },
  learningHistory: [],
};

function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  return DEFAULT_DB;
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Ensure database file exists
if (!fs.existsSync(DB_PATH)) {
  writeDB(DEFAULT_DB);
}

// Configure express middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiInitialized: !!ai });
});

// Get entire DB state
app.get("/api/db", (req, res) => {
  res.json(readDB());
});

// Toggle favorite
app.post("/api/db/favorite", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing tutorial id" });
  }

  const db = readDB();
  const index = db.favorites.indexOf(id);
  if (index === -1) {
    db.favorites.push(id);
  } else {
    db.favorites.splice(index, 1);
  }
  writeDB(db);
  res.json(db);
});

// Record learning activity & check/increment streak
app.post("/api/db/learn", (req, res) => {
  const { title, category } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  const db = readDB();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // 1. Record in history
  db.learningHistory.unshift({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    title,
    category: category || "电脑基础",
  });

  // Limit history length to 50
  if (db.learningHistory.length > 50) {
    db.learningHistory = db.learningHistory.slice(0, 50);
  }

  // 2. Update streak
  const lastDate = db.streak.lastStudyDate;
  if (lastDate === today) {
    // Already studied today, streak stays same
  } else if (lastDate === yesterday) {
    // Studied yesterday, consecutive streak continues
    db.streak.count += 1;
    db.streak.lastStudyDate = today;
  } else {
    // Break or first time
    db.streak.count = 1;
    db.streak.lastStudyDate = today;
  }

  writeDB(db);
  res.json(db);
});

// Submit a help request
app.post("/api/db/help", (req, res) => {
  const { problem, screenshot } = req.body;
  if (!problem) {
    return res.status(400).json({ error: "Missing problem description" });
  }

  const db = readDB();
  const newRequest = {
    id: "help_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    problem,
    screenshot: screenshot || "",
    status: "pending" as const,
  };

  db.helpRequests.unshift(newRequest);
  writeDB(db);
  res.json(newRequest);
});

// Family responder to reply
app.post("/api/db/help/:id/respond", (req, res) => {
  const { id } = req.params;
  const { responseText } = req.body;

  if (!responseText) {
    return res.status(400).json({ error: "Missing responseText" });
  }

  const db = readDB();
  const request = db.helpRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "Help request not found" });
  }

  request.status = "resolved";
  request.response = responseText;
  request.responseAt = new Date().toISOString();

  writeDB(db);
  res.json(request);
});

// AI Chat Q&A Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  if (!ai) {
    // Fallback if no Gemini Key configured yet
    return res.json({
      reply: "您好！我是您的电脑小助手。由于您还没有在【设置 > 机密 (Secrets)】面板配置您的 `GEMINI_API_KEY`，目前我处于离线模拟模式。请让我告诉您：\n\n1. 📁 **怎么保存Word文档**：点击左上角的【文件】，选择【另存为】，点击【桌面】，输入名字后点击【保存】即可。\n2. 🖱️ **双击是什么**：用食指快速点两下鼠标左键，就像敲门一样。\n\n请配置您的API密钥以获得完整的实时人工智能支持！",
      steps: [
        { num: 1, text: "点击左上角的【文件】", icon: "📁" },
        { num: 2, text: "点击【另存为】", icon: "💾" },
        { num: 3, text: "选择【桌面】位置", icon: "🖥️" },
        { num: 4, text: "输入文件的名字", icon: "✏️" },
        { num: 5, text: "点击【保存】按钮", icon: "✅" }
      ],
      detectedApp: "电脑通用"
    });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    // Craft a highly directive system instruction designed for elderly or beginners
    const systemInstruction = `你是一位温柔、有耐心的“手把手教你操作电脑”的AI老师。你的学生是40-60岁、完全零基础的用户。不要使用“老人家”、“长辈”、“老人”等特定老龄代称称呼对方，请平等友好地解答。
他们不懂鼠标双击、不懂文件夹、甚至连图标是什么都不知道。
因此，你回答他们的问题时，必须遵守以下铁律：
1. 字句要大白话：绝对不能用任何专业术语，比如“进程”、“路径”、“根目录”、“渲染”等。绝对不使用“老人家”等称呼，直接说“抱歉”或解答即可。
2. 给出极其精简的、像导航一样的【步骤路线】：
   第一步：点击哪里
   ↓
   第二步：点击哪里
   ↓
   第三步：点击哪里
3. 突出动作词：使用【点击】、【寻找】、【双击】等明显、大号的动作动词，并用特殊的图标或括号包围按钮名字，例如：点击左上角【文件】。
4. 每次只回答当前用户需要解决的问题，绝对不长篇大论。
5. 请在回答的末尾输出一个简化的 JSON 格式的步骤卡片，以便系统在界面上放大显示每个具体步骤。

重要：在你的回答正文之后，必须包含一个特殊的分隔符 “===STEPS_JSON===”，其后紧跟一个符合以下 TypeScript 格式的 JSON，不要放于 markdown 代码块中：
{
  "detectedApp": "例如: Word, Excel, 打印机, Windows系统",
  "summary": "一句非常亲切的总结解释",
  "steps": [
    { "num": 1, "text": "点击左上角【文件】", "icon": "📁" },
    { "num": 2, "text": "点击【另存为】", "icon": "💾" }
  ],
  "videoSuggestion": "推荐操作视频的关键字"
}
确保 JSON 是有效的。`;

    const contents = [...formattedHistory, { role: "user", parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const replyText = response.text || "";
    let cleanReply = replyText;
    let parsedSteps = null;
    let detectedApp = "电脑通用";

    if (cleanReply.includes("===STEPS_JSON===")) {
      const parts = cleanReply.split("===STEPS_JSON===");
      cleanReply = parts[0].trim();
      try {
        const jsonStr = parts[1].trim();
        // Remove code block wrappers if model added them
        const cleanedJsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleanedJsonStr);
        parsedSteps = parsed.steps || null;
        detectedApp = parsed.detectedApp || "电脑通用";
      } catch (err) {
        console.error("Failed to parse steps JSON:", err);
      }
    }

    res.json({
      reply: cleanReply,
      steps: parsedSteps,
      detectedApp
    });

  } catch (error: any) {
    console.error("Error in Gemini Chat:", error);
    res.status(500).json({ error: error.message || "AI 问答服务异常" });
  }
});

// Screenshot Analyzer Endpoint
app.post("/api/screenshot", async (req, res) => {
  const { screenshot, targetGoal } = req.body;

  if (!screenshot) {
    return res.status(400).json({ error: "Missing screenshot" });
  }

  // Base64 format cleanup: "data:image/png;base64,xxxxx..." -> "xxxxx..."
  let base64Data = screenshot;
  let mimeType = "image/png";

  if (screenshot.includes(";base64,")) {
    const parts = screenshot.split(";base64,");
    mimeType = parts[0].split(":")[1] || "image/png";
    base64Data = parts[1];
  }

  if (!ai) {
    // Mock response if Gemini not configured yet
    return res.json({
      detectedApp: "Microsoft Word (模拟识别)",
      summary: "我帮您看了一下，这是一张 Word 的软件截图。您想要：" + (targetGoal || "操作保存"),
      steps: [
        { num: 1, text: "请看向屏幕的最左上角，找到写着【文件】或者一个圆形徽标的地方，点一下它。", icon: "📁" },
        { num: 2, text: "在弹出来的白色菜单栏中，往下看，找到【另存为】三个字，点击它。", icon: "💾" },
        { num: 3, text: "此时会有一个选择框，请点击左边写着【桌面】的选项，这样等会儿最容易找到这个文件。", icon: "🖥️" },
        { num: 4, text: "在底部的空白输入框里敲字，给您的文档起个名字（比如：今天的重要文件）。", icon: "✏️" },
        { num: 5, text: "最后点击右下角那个蓝色的【保存】按钮。大功告成！", icon: "✅" }
      ],
      videoSuggestion: "保存Word"
    });
  }

  try {
    const prompt = `您是一位给零基础中老年人讲解电脑截图的AI老师。
用户刚刚对他们的电脑屏幕拍了张照，并上传了过来。
用户想完成的目标是：${targetGoal || "在当前界面中进行操作，不知道点哪里或者怎么做。"}

请您：
1. 识别截图中展示的是什么操作系统（Windows 10, Windows 11, Mac等）或什么软件界面（Microsoft Word, Excel, 浏览器, 打印机设置, 微信电脑版等）。
2. 分析用户在截图中应该“点击”或“寻找”哪里的按钮以实现他们的目标。
3. 提供极其亲切、极其小白的步骤指南（最多不超过 5 步），每一操作步骤要伴随着明确对应的图标。
4. 必须以 JSON 格式返回，保证中老年人能直接看到极简的步骤，千万不能写一大堆晦涩难懂的技术理论。

返回的 JSON Schema 格式必须如下：
{
  "detectedApp": "识别出的软件/系统名称（例如：Microsoft Word 软件）",
  "summary": "亲切易懂的一句大白话，分析当前截图里的状态并鼓励用户。",
  "steps": [
    {
      "num": 1,
      "text": "第一步的详细描述。例如：‘请看向屏幕最左上角，点击蓝色的【文件】两个字。’",
      "icon": "📁"
    },
    ...
  ],
  "videoSuggestion": "推荐教程词（例如：保存文件）"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedApp: { type: Type.STRING },
            summary: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  num: { type: Type.INTEGER },
                  text: { type: Type.STRING },
                  icon: { type: Type.STRING },
                },
                required: ["num", "text"],
              },
            },
            videoSuggestion: { type: Type.STRING },
          },
          required: ["detectedApp", "summary", "steps"],
        },
      },
    });

    const resultText = response.text || "";
    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);

  } catch (error: any) {
    console.error("Error in analyzing screenshot:", error);
    res.status(500).json({ error: error.message || "AI 识别截图失败，请确保格式正确。" });
  }
});

// Configure Vite or Static File serving

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
