# 🇰🇷 韓國旅遊規劃網站

一個用來規劃韓國旅遊行程的網站，可以：

- **行程規劃**：新增 / 編輯 / 刪除多趟旅行，每趟按「天」安排景點
- **Naver 地圖導航**：每個景點都有按鈕，點擊直接開啟 Naver Map（네이버 지도）定位與導航，在韓國當地用最順
- **行前準備**：分類勾選清單（證件 / 金錢 / 通訊 / 行李），可一鍵載入韓國旅遊預設清單
- **跨裝置同步**：資料存在 Neon 雲端資料庫，電腦規劃、韓國手機開同一個網址看到同一份資料

技術：Next.js 15（App Router）+ Neon Postgres，部署於 Vercel。

---

## 一、本機開發

### 1. 安裝 Node.js

需要 Node.js 18.18 以上（建議 20+）。到 <https://nodejs.org> 下載安裝。

### 2. 安裝套件

在專案資料夾打開終端機（PowerShell）：

```powershell
npm install
```

### 3. 建立 Neon 資料庫並設定連線

1. 到 <https://neon.tech> 免費註冊，建立一個 Project。
2. 在 Dashboard 找到 **Connection string**，複製（選 *Pooled connection*，開頭像 `postgresql://...`）。
3. 把專案裡的 `.env.example` 複製成 `.env.local`，把 `DATABASE_URL` 換成你的連線字串：

```
DATABASE_URL="postgresql://使用者:密碼@主機/資料庫?sslmode=require"
```

> 資料表會在第一次開啟網站時**自動建立**，不需要手動執行任何 SQL。

### 4. 啟動

```powershell
npm run dev
```

打開瀏覽器到 <http://localhost:3000>。

---

## 二、上傳到 GitHub

```powershell
git init
git add .
git commit -m "初始化韓國旅遊規劃網站"
git branch -M main
git remote add origin https://github.com/你的帳號/你的儲存庫.git
git push -u origin main
```

> `.gitignore` 已排除 `.env.local`，**連線字串不會被上傳**，請放心。

---

## 三、部署到 Vercel（取得外部網址）

1. 到 <https://vercel.com> 用 GitHub 登入，點 **Add New → Project**，匯入剛剛的儲存庫。
2. **設定資料庫連線**，兩種方式擇一：
   - **方式 A（推薦）**：在 Vercel 專案的 *Storage* 分頁連接 Neon（Marketplace 整合），Vercel 會自動幫你帶入 `DATABASE_URL` 環境變數。
   - **方式 B**：在 *Settings → Environment Variables* 手動新增 `DATABASE_URL`，值貼上你的 Neon 連線字串。
3. 按 **Deploy**。完成後會得到一個外部網址（例如 `https://你的專案.vercel.app`），手機、平板、到韓國都能直接開。

之後每次 `git push`，Vercel 都會自動重新部署。

---

## 常見問題

**Q：出現「環境變數 DATABASE_URL 尚未設定」？**
代表還沒設定資料庫連線。本機請檢查 `.env.local`；Vercel 請檢查環境變數，設定後重新部署。

**Q：Naver 地圖按鈕點了沒反應 / 開錯地方？**
建議在景點的「韓文名稱」欄位填入韓文（例如 `경복궁`），Naver 用韓文搜尋最準。手機請先安裝 Naver Map App。

**Q：可以多人共用嗎？**
目前沒有登入機制，所有開啟網址的人看到同一份資料，適合自己或同行親友共用。若要區分權限再另外加。
