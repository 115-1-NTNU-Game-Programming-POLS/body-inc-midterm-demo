# 人體股份有限公司：期中提案展示版

國立臺灣師範大學「遊戲程式設計」（115-1）第七組期末專題《人體股份有限公司》的期中提案展示版。這是畫面流程原型，流程照腳本走，數值為示意；睡眠債、讀書效率與考試打折的計算沿用設計文件的公式。

線上試玩：https://115-1-ntnu-game-programming-pols.github.io/body-inc-midterm-demo/

專案本體（設計文件、數值模擬、提案簡報）在 [body-inc](https://github.com/115-1-NTNU-Game-Programming-POLS/body-inc)。

## 展示流程（約 90 秒）

1. 標題：從第 4 天（期中考前一天）開局。
2. 早上規劃：選早餐、下午與晚上的行程、幾點睡；加派給大腦的代幣越多，待命池越小。
3. 白天推進：時間自動往前走，員工會說出早期症狀；午餐時待命池自動補人，不暫停。
4. 調度危機（14:00）：室友狂咳，免疫部缺人且待命池不夠，時間暫停；把紅血球拖到免疫部，被挪走人手的部門怨氣 +10；也可以「向夜班借調」直接補兩枚（今晚睡眠效率 ×0.7），或「暫不處理」。
5. 事件卡（19:00）：室友揪鹹酥雞，三個選項各有代價。
6. 睡眠結算與期中考：依就寢時間與睡眠效率算出睡眠債，期中考分數依考試當天的睡眠係數打折。
7. 倒閉調查報告：快轉到第 7 天，報告依你的選擇追溯事故經過。
8. 員工手冊：解鎖〈睡眠與免疫力〉。

## 操作

| 操作 | 作用 |
| --- | --- |
| 滑鼠或觸控 | 點按鈕、拖曳紅血球代幣 |
| → 、Enter 或空白鍵 | 跳到下一步（現場展示的備援） |
| R | 從頭開始 |
| 1、2、3 | 白天的時間速度 |
| M 或右下角喇叭 | 開關音樂與音效（設定會記在瀏覽器） |

瀏覽器規定要有使用者操作後才能播放聲音，所以音樂會在第一次點擊或按鍵後開始。

## 本機執行

不需要建置。程式以瀏覽器原生的 ES 模組載入，直接雙擊開啟 `index.html`（`file://`）會被瀏覽器擋下，需在資料夾內啟動任一靜態伺服器，例如：

```
python -m http.server 8000
```

再開啟 `http://localhost:8000/`。使用 [p5.js](https://p5js.org/) 1.11.1（由 jsDelivr 載入），字型為霞鶩文楷 TC 與 Noto Sans TC（皆為 OFL 授權，由 Google Fonts 載入）。

## 檔案

程式依職責分層，下層不依賴上層；各層的分工與相依規則見 [docs/architecture.md](docs/architecture.md)。

| 路徑 | 內容 |
| --- | --- |
| `index.html` | 頁面、p5.js 與進入點載入 |
| `src/main.js` | 進入點：接上 p5 的生命週期與輸入，分派給目前場景 |
| `src/core/` | 遊戲狀態、場景切換、事件通知、提示與對話泡泡 |
| `src/data/` | 部門、早上行程選項、員工手冊內文等純資料 |
| `src/rules/` | 遊戲規則：行程與待命池、白天腳本、調度危機、事件卡、睡眠與考試計算、倒閉報告；只改狀態、不畫圖 |
| `src/scenes/` | 各畫面（標題、早上規劃、白天、睡眠結算、倒閉報告、員工手冊）的繪製與操作；白天畫面拆在 `scenes/day/` |
| `src/ui/` | 畫布縮放、配色字型、筆記本背景與共用繪圖、按鈕、提示便條、靜音按鈕 |
| `src/art/` | 人體與小晨的向量圖形資料、器官員工插圖的載入與狀態切換 |
| `src/audio/` | 音訊總線與靜音、背景音樂播放清單、即時合成音效、遊戲事件與音效的對應 |
| `assets/organs/` | 器官員工插圖（去背、256px），每個器官有一般、警告、罷工三種狀態 |
| `assets/music/` | 背景音樂（96 kbps，已正規化至 -18 LUFS） |

## 美術

器官員工插圖由組員江兆耘繪製，經去背與縮圖後使用；部門怨氣達 60 時切換為警告圖、達 85 時切換為罷工圖。肌肉目前沒有一般狀態的圖，暫以 `muscle-normal.png` 代替。人體圖與小晨為程式繪製的示意圖。

## 音樂與音效

背景音樂依序循環播放以下三首，皆經轉檔為 96 kbps 並正規化至相同響度（-18 LUFS），未更動樂曲內容：

- "Monkeys Spinning Monkeys" Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/
- "Carefree" Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/
- "Fluffing a Duck" Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/

音效（按鈕、拖曳代幣、危機警報、事件卡、蓋章、解鎖手冊等）以 Web Audio API 即時合成，沒有使用音檔。各音效的音量經離線量測後以 `src/audio/sfx.js` 的 `SFX_TRIM` 校正為一致響度，修改音效後需重新量測（量測方法見 [docs/architecture.md](docs/architecture.md)）。
