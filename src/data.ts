import { Tutorial } from "./types";

export const TUTORIALS: Tutorial[] = [
  // Windows / 电脑基础
  {
    id: "win-mouse",
    title: "鼠标应该怎么拿和怎么按",
    category: "电脑基础",
    description: "学会握住鼠标，并理解左键、右键以及滚轮的用法。",
    duration: "1分钟",
    searchKeywords: ["鼠标", "按键", "左键", "右键", "滚轮", "怎么用"],
    isHot: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-working-with-a-computer-mouse-close-up-41719-large.mp4",
    practiceType: "mouse_click",
    steps: [
      {
        num: 1,
        text: "右手手掌轻轻盖在鼠标上，大拇指夹在左侧，无名指夹在右侧。",
        icon: "🤚",
      },
      {
        num: 2,
        text: "食指放在【左键】上，中指放在【右键】上。中间的轮子叫滚轮。",
        icon: "🖱️",
      },
      {
        num: 3,
        text: "【左键点一下】：用于‘选中’一个东西。像用手指头指着它一样。",
        icon: "👇",
      },
      {
        num: 4,
        text: "【双击左键】：用食指快速连续点两下左键。像敲门一样，能打开程序。",
        icon: "💥",
      },
      {
        num: 5,
        text: "【右键点一下】：用于‘呼出菜单’。如果不知道下一步怎么做，就点右键。",
        icon: "📋",
      },
    ],
  },
  {
    id: "win-doubleclick",
    title: "什么是“双击”？怎么打开软件",
    category: "电脑基础",
    description: "中老年人最常卡住的一步：快速敲击两次鼠标左键。",
    duration: "1分钟",
    searchKeywords: ["双击", "打不开", "打开软件", "快速点"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-using-a-computer-mouse-in-an-office-41724-large.mp4",
    practiceType: "mouse_double_click",
    steps: [
      {
        num: 1,
        text: "把鼠标的光标（那个小白箭头）移动到你想打开的软件图标正上方。",
        icon: "🎯",
      },
      {
        num: 2,
        text: "握紧鼠标不要晃动。如果鼠标晃来晃去，电脑会以为您在拖拽东西。",
        icon: "✊",
      },
      {
        num: 3,
        text: "用食指快速、干脆地敲击鼠标左键【两下】。口诀是：哒哒！",
        icon: "⚡",
      },
      {
        num: 4,
        text: "如果软件没有开，说明不够快。请深呼吸，再更快速地敲击两下。",
        icon: "🔄",
      },
    ],
  },
  {
    id: "win-desktop",
    title: "什么是“桌面”？怎么找到文件",
    category: "电脑基础",
    description: "理解电脑桌面，就像现实里的办公桌一样，是放常用文件的地方。",
    duration: "2分钟",
    searchKeywords: ["桌面", "找不到文件", "主屏幕", "回收站"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-using-a-computer-mouse-in-an-office-41724-large.mp4",
    practiceType: "desktop_drag",
    steps: [
      {
        num: 1,
        text: "当您开机或关闭所有窗口后，看到的整张大屏幕背景就叫“桌面”。",
        icon: "🖥️",
      },
      {
        num: 2,
        text: "左边排成一排的小方块叫“图标”。像抽屉的标签一样。",
        icon: "🗂️",
      },
      {
        num: 3,
        text: "通常【我的电脑】或【此电脑】里能找到所有的盘（C盘、D盘）。",
        icon: "💻",
      },
      {
        num: 4,
        text: "【回收站】是垃圾桶，不要的文件扔进去。如果点错了可以里面捡回来。",
        icon: "🗑️",
      },
    ],
  },

  // Word 教程
  {
    id: "word-open",
    title: "如何找到并打开 Word 写字软件",
    category: "Word",
    description: "教您怎么在电脑上启动写报告、填检验表的 Word 软件。",
    duration: "1.5分钟",
    searchKeywords: ["打开word", "新建word", "写字", "新建文档"],
    isHot: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41718-large.mp4",
    practiceType: "word_open",
    steps: [
      {
        num: 1,
        text: "在桌面上找一个蓝色图标，写着字母【W】或者写着【Word】。",
        icon: "🔵",
      },
      {
        num: 2,
        text: "用鼠标左键双击这个蓝色图标（快速点两下）。",
        icon: "🖱️",
      },
      {
        num: 3,
        text: "如果桌面上没有，点击屏幕最左下角的【开始】徽标（有4个彩色格子的按钮）。",
        icon: "🪟",
      },
      {
        num: 4,
        text: "在弹出来的软件列表里找到【Word】，用左键点一下即可。",
        icon: "👇",
      },
      {
        num: 5,
        text: "打开后，点击最上方的【空白文档】，就可以开始写字了。",
        icon: "📄",
      },
    ],
  },
  {
    id: "word-typing",
    title: "怎么在 Word 里输入文字和换行",
    category: "Word",
    description: "学习打字，并在写满一行或写完一小段后怎么切到下一行。",
    duration: "2分钟",
    searchKeywords: ["打字", "输入法", "换行", "回车", "空格"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-typing-on-keyboard-close-up-41720-large.mp4",
    practiceType: "word_type",
    steps: [
      {
        num: 1,
        text: "用鼠标在白色的纸张上任意地方点一下，看到一条黑色的竖线【|】在闪烁。",
        icon: "🖱️",
      },
      {
        num: 2,
        text: "闪烁的【|】代表您接下来打的字会出现在这里。如果不闪烁，请再点一下。",
        icon: "📍",
      },
      {
        num: 3,
        text: "按下键盘上的拼音字母。屏幕上会出现候选字，按下【空格键】（最长的那颗键）确认上屏。",
        icon: "⌨️",
      },
      {
        num: 4,
        text: "写完这一行，想换到下一行写：按下键盘上的【回车键】（印着 Enter 或弯曲箭头的最大键）。",
        icon: "↩️",
      },
    ],
  },
  {
    id: "word-save",
    title: "怎么保存写好的 Word 文件，防止丢失",
    category: "Word",
    description: "最重要的一课！写好的东西一定要存下来，不然电脑关机就没了。",
    duration: "1.5分钟",
    searchKeywords: ["保存", "另存为", "找不到保存", "文件丢失"],
    isHot: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41718-large.mp4",
    practiceType: "word_save",
    steps: [
      {
        num: 1,
        text: "写好文档后，点击最左上角，找写着【文件】两个字的按钮，用左键点一下。",
        icon: "📁",
      },
      {
        num: 2,
        text: "在左边弹出的竖条菜单里，找到【另存为】（有个软盘带笔的小图标），点击它。",
        icon: "💾",
      },
      {
        num: 3,
        text: "点击中间的【桌面】按钮。保存在桌面，待会儿一眼就能看见它。",
        icon: "🖥️",
      },
      {
        num: 4,
        text: "下方会有一个输入框，里面有默认字。用键盘退格键删掉，打入您喜欢的文件名（比如：7月检验报告）。",
        icon: "✏️",
      },
      {
        num: 5,
        text: "最后点击旁边的【保存】按钮。大功告成，顶部文件名变了就代表保存好了！",
        icon: "✅",
      },
    ],
  },

  // Excel 教程
  {
    id: "excel-input",
    title: "怎么在 Excel 表格格子里输数字",
    category: "Excel",
    description: "学会怎么往一个一个的格子里填入检验结果、数字和货品名称。",
    duration: "1分钟",
    searchKeywords: ["表格", "输入数字", "excel", "单元格", "敲数字"],
    isHot: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-computer-keyboard-41718-large.mp4",
    practiceType: "excel_input",
    steps: [
      {
        num: 1,
        text: "双击打开绿色的 Excel 软件（图标是绿色的，带有字母【X】）。",
        icon: "🟢",
      },
      {
        num: 2,
        text: "看到满屏幕都是小格子。用鼠标左键点一下你想写数字的那个格子。",
        icon: "🖱️",
      },
      {
        num: 3,
        text: "格子周围会出现粗绿色的线，代表选好了。直接在键盘上按数字键即可输入。",
        icon: "⌨️",
      },
      {
        num: 4,
        text: "写完这个格子，想往右边或下面格子写？按键盘上的【方向键】（有上下左右四个箭头）就能移动绿色框。",
        icon: "➡️",
      },
      {
        num: 5,
        text: "输入完所有数字后，记得也去左上角点【文件】→【保存】哦。",
        icon: "💾",
      },
    ],
  },
  {
    id: "excel-merge",
    title: "怎么把好几个格子合并成一个大格子",
    category: "Excel",
    description: "做表格标题最常用：把一横排小格子变成一个宽宽的合并大格子。",
    duration: "1.5分钟",
    searchKeywords: ["合并单元格", "大格子", "表格标题", "合并格子"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-scrolling-on-a-laptop-touchpad-41731-large.mp4",
    practiceType: "excel_merge",
    steps: [
      {
        num: 1,
        text: "用鼠标按住第一个格子不要松手，然后往右边拖拽，选中你想合并的所有格子。",
        icon: "🖱️",
      },
      {
        num: 2,
        text: "格子全部变成淡蓝色，说明它们都被框进进去。这时松开鼠标。",
        icon: "🔵",
      },
      {
        num: 3,
        text: "看向屏幕最上方，在一排按钮中寻找一个写着【合并后居中】的按钮（通常带有双向横向小箭头）。",
        icon: "↔️",
      },
      {
        num: 4,
        text: "用鼠标左键点一下这个【合并后居中】按钮，格子就瞬间连成一个啦！",
        icon: "👇",
      },
    ],
  },

  // 浏览器 / 上网
  {
    id: "browser-search",
    title: "怎么用浏览器上网查资料",
    category: "浏览器",
    description: "教您打开互联网窗口（浏览器），并在百度搜索您想看的内容。",
    duration: "2分钟",
    searchKeywords: ["上网", "查资料", "百度", "浏览器", "搜新闻"],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-using-a-computer-mouse-in-an-office-41724-large.mp4",
    practiceType: "browser_search",
    steps: [
      {
        num: 1,
        text: "在桌面上找一个圆形的彩色图标（通常是蓝色或红黄绿蓝相间的圈圈），双击打开它。这就是“浏览器”。",
        icon: "🌐",
      },
      {
        num: 2,
        text: "看屏幕的最顶端，有一条长长的白白的长条，叫“地址栏”。在里面点一下，输入百度网址：baidu.com 然后按回车。",
        icon: "📍",
      },
      {
        num: 3,
        text: "等屏幕加载出一个写着【百度】的大网页，中间有一个空白的输入大框。",
        icon: "🔍",
      },
      {
        num: 4,
        text: "点一下这个大白框，用拼音打进你想查的内容（比如：高血压吃什么好，或者：工厂办公软件教程）。",
        icon: "⌨️",
      },
      {
        num: 5,
        text: "点击白框旁边的【百度一下】蓝色按钮。下方就会出现很多解答，点一下蓝色的标题就能打开看啦。",
        icon: "🔵",
      },
    ],
  },

  // 打印机
  {
    id: "printer-print",
    title: "写好的表格和文档，怎么打印成纸张",
    category: "打印机",
    description: "让您写好在Word或Excel里的检验表变成真正拿在手里的纸张。",
    duration: "2分钟",
    searchKeywords: ["打印", "打纸", "打印机", "纸张"],
    isHot: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pressing-a-button-on-a-printer-42353-large.mp4",
    practiceType: "printer_print",
    steps: [
      {
        num: 1,
        text: "首先检查打印机有没有插电、电源灯亮不亮、里面有没有放好白纸。",
        icon: "🔌",
      },
      {
        num: 2,
        text: "在您的 Word 或 Excel 文档里，按一下键盘上的快捷键：按住【Ctrl】键不松，再按一下【P】键。",
        icon: "⌨️",
      },
      {
        num: 3,
        text: "如果记不住快捷键，可以点击左上角【文件】，然后菜单里点击【打印】。",
        icon: "📁",
      },
      {
        num: 4,
        text: "屏幕上会出现预览纸张。在【份数】处点上下三角形，选择需要打印几张纸。",
        icon: "🔢",
      },
      {
        num: 5,
        text: "最后，点击上方那个写着【打印】、画着一台小打印机机器的大按钮。打印机就会开始吐纸啦！",
        icon: "🖨️",
      },
    ],
  },
];
