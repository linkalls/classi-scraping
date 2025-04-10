import { BrowserWorker, launch } from "@cloudflare/playwright";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";

type Bindings = {
  MYBROWSER: BrowserWorker;
  USERNAME: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 設定ページを表示するエンドポイント
app.get("/settings", (c) => {
  const username = getCookie(c, "username") || "";
  const password = getCookie(c, "password") || "";
  const form = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>設定</title>
      <style>
        :root {
          --primary-color: #4a90e2;
          --secondary-color: #f5f5f5;
          --text-color: #333;
          --spacing: 1rem;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          padding: var(--spacing);
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
        }

        h2 {
          color: var(--primary-color);
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .form-container {
          background-color: var(--secondary-color);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .subject-input {
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .subject-input label {
          flex: 1;
          font-weight: 500;
        }

        input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          width: 100%;
        }

        input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        button {
          display: block;
          width: 100%;
          max-width: 200px;
          margin: 2rem auto 0;
          padding: 0.8rem 1.5rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        button:hover {
          background-color: #357abd;
        }

        a {
          color: var(--primary-color);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          body {
            padding: 0.5rem;
          }

          .form-container {
            padding: 1rem;
          }

          h2 {
            font-size: 1.5rem;
          }
          
          .subject-input {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          
          input {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>認証設定</h2>
        <form action="/settings" method="post">
          <div class="subject-input">
            <label for="username">ユーザー名</label>
            <input type="text" id="username" name="username" value="${username}" required>
          </div>
          <div class="subject-input">
            <label for="password">パスワード</label>
            <input type="password" id="password" name="password" value="${password}" required>
          </div>
          <button type="submit">保存</button>
        </form>
        <div style="margin-top: 1rem; text-align: center;">
          <a href="/">戻る</a>
        </div>
      </div>
    </body>
    </html>
  `;
  return c.html(form);
});

// 設定を保存するエンドポイント
app.post("/settings", async (c) => {
  const formData = await c.req.parseBody();
  const username = formData.username as string;
  const password = formData.password as string;

  setCookie(c, "username", username, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  });
  setCookie(c, "password", password, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return c.redirect("/");
});

// 入力フォームを表示するエンドポイント
app.get("/", async (c) => {
  const username = getCookie(c, "username");
  const password = getCookie(c, "password");

  if (!username || !password) {
    return c.redirect("/settings");
  }

  const subjects = ["国語", "数学", "英語", "公民", "地歴", "化学", "情報"];
  const form = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>学習時間入力</title>
      <style>
        :root {
          --primary-color: #4a90e2;
          --secondary-color: #f5f5f5;
          --text-color: #333;
          --spacing: 1rem;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          padding: var(--spacing);
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
        }

        h2 {
          color: var(--primary-color);
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .form-container {
          background-color: var(--secondary-color);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .subject-input {
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .subject-input label {
          flex: 1;
          font-weight: 500;
        }

        select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background-color: white;
          cursor: pointer;
          min-width: 100px;
        }

        select:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .comment-section {
          margin-top: 2rem;
        }

        textarea {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          resize: vertical;
          min-height: 100px;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        button {
          display: block;
          width: 100%;
          max-width: 200px;
          margin: 2rem auto 0;
          padding: 0.8rem 1.5rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        button:hover {
          background-color: #357abd;
        }

        @media (max-width: 480px) {
          body {
            padding: 0.5rem;
          }

          .form-container {
            padding: 1rem;
          }

          .subject-input {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          select {
            width: 100%;
          }

          h2 {
            font-size: 1.5rem;
          }
        }

        .loading {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
        }

        .loading-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
        }

        .loading.active {
          display: block;
        }

        .status {
          margin-top: 1rem;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 6px;
          max-height: 200px;
          overflow-y: auto;
        }

        .status-item {
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .status-item::before {
          content: "→";
          position: absolute;
          left: 0;
        }

        .status-item.success::before {
          content: "✓";
          color: #4caf50;
        }

        .status-item.error::before {
          content: "✗";
          color: #f44336;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 1rem;
        }
      </style>
      <script>
        let currentLogs = [];
        
        function showLoading() {
          document.getElementById('loading').classList.add('active');
        }

        function updateStatus(message, type = '') {
          const status = document.getElementById('status');
          const item = document.createElement('div');
          item.className = 'status-item ' + type;
          item.textContent = message;
          status.appendChild(item);
          status.scrollTop = status.scrollHeight;
          currentLogs.push(message);
        }

        async function submitForm(event) {
          event.preventDefault();
          showLoading();
          currentLogs = [];
          updateStatus('処理を開始しています...');
          
          try {
            const form = event.target;
            const formData = new FormData(form);
            
            // フォームデータのログ表示
            const subjects = {};
            for (const [key, value] of formData.entries()) {
              if (key !== 'comment') {
                subjects[key] = value;
              }
            }
            updateStatus('送信データ:');
            updateStatus(JSON.stringify(subjects, null, 2));
            
            const response = await fetch('/submit', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error(\`送信エラー: \${response.status} \${response.statusText}\`);
            }

            const result = await response.text();
            document.body.innerHTML = result;
          } catch (error) {
            console.error('Error:', error);
            updateStatus('エラーが発生しました: ' + error.message, 'error');
            // エラー詳細の表示
            if (error.stack) {
              updateStatus('エラー詳細:', 'error');
              updateStatus(error.stack, 'error');
            }
          }
        }
      </script>
    </head>
    <body>
      <div id="loading" class="loading">
        <div class="loading-content">
          <div style="text-align: center; margin-bottom: 1rem;">
            <div class="spinner"></div>
            <h3>処理中...</h3>
          </div>
          <div id="status" class="status"></div>
        </div>
      </div>
      <div class="form-container">
        <div style="text-align: right; margin-bottom: 1rem;">
          <a href="/settings">設定</a>
        </div>
        <h2>学習時間入力</h2>
        <form onsubmit="submitForm(event)" method="post">
          ${subjects
            .map(
              (subject) => `
            <div class="subject-input">
              <label for="${subject}">${subject}</label>
              <select name="${subject}" id="${subject}">
                ${Array.from(
                  { length: 8 },
                  (_, i) => `
                  <option value="${i}">${i}時間</option>
                `
                ).join("")}
              </select>
            </div>
          `
            )
            .join("")}
          <div class="comment-section">
            <label for="comment">今日はどんな一日でしたか？</label>
            <textarea id="comment" name="comment" rows="4" placeholder="今日の学習を振り返って..."></textarea>
          </div>
          <button type="submit">送信</button>
        </form>
      </div>
    </body>
    </html>
  `;
  return c.html(form);
});

// フォームデータを処理するエンドポイント
app.post("/submit", async (c) => {
  const logs: string[] = [];
  let browser;
  let page;
  try {
    const formData = await c.req.parseBody();
    const username = getCookie(c, "username");
    const password = getCookie(c, "password");

    if (!username || !password) {
      logs.push("認証情報が見つかりません");
      return c.redirect("/settings");
    }

    logs.push("フォームデータを受信しました");
    const subjectData: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (key !== "comment") {
        subjectData[key] = value as string;
      }
    }
    logs.push("学習時間データ:");
    logs.push(JSON.stringify(subjectData, null, 2));

    logs.push(
      "🌐 Cloudflare WorkersでPlaywrightを使用して自動入力を開始します..."
    );
    browser = await launch(c.env.MYBROWSER).catch((e) => {
      logs.push("ブラウザの起動に失敗しました: " + e.message);
      throw e;
    });
    page = await browser.newPage();

    logs.push("📝 ログインページへ移動中...");
    await page.goto("https://id.classi.jp/login/identifier");

    logs.push("ユーザー名を入力中...");
    await page.getByRole("textbox", { name: "入力してください" }).click();
    await page
      .getByRole("textbox", { name: "入力してください" })
      .fill(username);
    await page.getByRole("button", { name: "パスワード入力へ" }).click();

    await page.waitForLoadState("networkidle");
    logs.push("パスワードを入力中...");

    // パスワード入力フィールドが表示されるまで待機
    await page.waitForSelector('input[type="password"]', { state: "visible" });
    logs.push("パスワードフィールドを検出しました");

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();
    await passwordInput.fill(password);
    logs.push("パスワードを入力しました");

    // 目のアイコンをクリックする前に少し待機
    await page.waitForTimeout(500);
    await page.locator("i").click();

    logs.push("ログインボタンをクリック...");
    const loginButton = page.getByRole("button", { name: "ログインする" });
    await loginButton.waitFor({ state: "visible" });
    await loginButton.click();
    await page.waitForLoadState("networkidle");

    logs.push("📚 学習記録ページへ移動中...");
    await page.getByRole("link", { name: "学習記録" }).click();
    await page.getByRole("link", { name: "入力・編集" }).click();

    logs.push("⏱️ 学習時間を入力中...");
    const subjects = ["国語", "数学", "英語", "公民", "地歴", "化学", "情報"];

    for (const subject of subjects) {
      const hours = formData[subject] as string;
      logs.push(`  📖 ${subject}の学習時間を設定中...（${hours}時間）`);
      await page
        .locator("study-subject-learning-report")
        .filter({ hasText: `${subject} -- 00 01 02 03 04 05 06 07` })
        .getByRole("combobox")
        .first()
        .selectOption(`${Number(hours) + 1}: ${hours}`);
    }

    logs.push("💭 コメント入力中...");
    const comment = formData.comment as string;
    await page
      .getByRole("textbox", { name: "今日はどんな一日でしたか？" })
      .click();
    await page
      .getByRole("textbox", { name: "今日はどんな一日でしたか？" })
      .fill(comment);

    logs.push("✅ 内容を確定中...");
    await page.getByRole("button", { name: "内容を確定する" }).click();
    await page.waitForTimeout(1000);
    const img = await page.screenshot();

    logs.push("📸 スクリーンショットを取得しました");
    await browser.close();

    logs.push("✨ 処理が完了しました！");
    return c.html(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>完了</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1 {
            color: #4caf50;
            font-size: 1.8rem;
            margin-bottom: 1rem;
          }
          
          pre {
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 1rem 0;
          }
          
          @media (max-width: 480px) {
            body {
              padding: 0.5rem;
            }
            
            h1 {
              font-size: 1.5rem;
            }
            
            pre {
              font-size: 0.9rem;
            }
          }
        </style>
      </head>
      <body>
        <h1>学習記録の自動入力が完了しました！</h1>
        <div style="margin: 1rem 0;">
          <h3>処理ログ:</h3>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; margin-top: 0.5rem;">
${logs.join("\n")}
          </pre>
        </div>
        <img src="data:image/png;base64,${img.toString(
          "base64"
        )}" alt="screenshot" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
      </body>
      </html>
    `);
  } catch (e: unknown) {
    logs.push("⚠️ エラーが発生しました");
    console.error("エラーが発生しました:", e);

    let errorScreenshot = null;
    try {
      if (page) {
        logs.push("📸 エラー時の状態をキャプチャしています...");
        errorScreenshot = await page.screenshot();
      }
    } catch (screenshotError) {
      logs.push(
        "スクリーンショットの取得に失敗しました: " +
          (screenshotError instanceof Error
            ? screenshotError.message
            : String(screenshotError))
      );
    }

    try {
      if (browser) {
        await browser.close();
      }
    } catch (closeError) {
      logs.push(
        "ブラウザのクローズに失敗しました: " +
          (closeError instanceof Error
            ? closeError.message
            : String(closeError))
      );
    }

    const errorMessage =
      e instanceof Error ? e.message : "不明なエラーが発生しました";
    const errorStack = e instanceof Error ? e.stack : "";
    return c.html(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>エラー</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1 {
            color: #f44336;
            font-size: 1.8rem;
            margin-bottom: 1rem;
          }
          
          pre {
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 1rem 0;
          }
          
          @media (max-width: 480px) {
            body {
              padding: 0.5rem;
            }
            
            h1 {
              font-size: 1.5rem;
            }
            
            pre {
              font-size: 0.9rem;
            }
          }
        </style>
      </head>
      <body>
        <h1>エラーが発生しました</h1>
        <div style="color: red; margin: 1rem 0;">
          <p>${errorMessage}</p>
          <div style="margin: 1rem 0;">
            <h3>処理ログ:</h3>
            <pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; margin-top: 0.5rem;">
${logs.join("\n")}
            </pre>
          </div>
          <pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; margin-top: 0.5rem; white-space: pre-wrap;">
${errorStack}
          </pre>
          ${
            errorScreenshot
              ? `
            <div style="margin-top: 1rem;">
              <h3>エラー発生時のスクリーンショット:</h3>
              <img src="data:image/png;base64,${errorScreenshot.toString(
                "base64"
              )}" alt="error screenshot" style="max-width: 100%; border: 2px solid #f44336; border-radius: 4px;" />
            </div>
          `
              : ""
          }
        </div>
        <a href="/" style="color: #4a90e2; text-decoration: none;">戻る</a>
      </body>
      </html>
    `);
  }
});

// APIのインターフェース定義
type StudyRecord = {
  subjects: {
    [key: string]: number;
  };
  comment: string;
};

// APIエンドポイント
app.post("/api/submit", async (c) => {
  try {
    const username = getCookie(c, "username");
    const password = getCookie(c, "password");

    if (!username || !password) {
      return c.json({ error: "認証情報が設定されていません" }, 401);
    }

    const data = await c.req.json<StudyRecord>();
    const validSubjects = [
      "国語",
      "数学",
      "英語",
      "公民",
      "地歴",
      "化学",
      "情報",
    ];

    // バリデーション
    for (const subject of Object.keys(data.subjects)) {
      if (!validSubjects.includes(subject)) {
        return c.json({ error: `無効な教科名です: ${subject}` }, 400);
      }
      if (data.subjects[subject] < 0 || data.subjects[subject] > 7) {
        return c.json(
          { error: `無効な学習時間です: ${data.subjects[subject]}` },
          400
        );
      }
    }

    // Playwrightの処理
    const browser = await launch(c.env.MYBROWSER);
    const page = await browser.newPage();

    // ログイン処理
    await page.goto("https://id.classi.jp/login/identifier");
    await page
      .getByRole("textbox", { name: "入力してください" })
      .fill(username);
    await page.getByRole("button", { name: "パスワード入力へ" }).click();
    await page.waitForLoadState("networkidle");

    const passwordInput = page.getByRole("textbox", {
      name: "入力してください",
    });
    await passwordInput.waitFor({ state: "visible" });
    await passwordInput.fill(password);
    await page.locator("i").click();
    const loginButton = await page.getByRole("button", {
      name: "ログインする",
    });
    await loginButton.waitFor({ state: "visible" });
    await loginButton.click();

    // 学習記録入力
    await page.getByRole("link", { name: "学習記録" }).click();
    await page.getByRole("link", { name: "入力・編集" }).click();

    for (const [subject, hours] of Object.entries(data.subjects)) {
      await page
        .locator("study-subject-learning-report")
        .filter({ hasText: `${subject} -- 00 01 02 03 04 05 06 07` })
        .getByRole("combobox")
        .first()
        .selectOption(`${hours + 1}: ${hours}`);
    }

    if (data.comment) {
      await page
        .getByRole("textbox", { name: "今日はどんな一日でしたか？" })
        .fill(data.comment);
    }

    await page.getByRole("button", { name: "内容を確定する" }).click();
    await page.waitForTimeout(1000);
    const img = await page.screenshot();
    await browser.close();

    return c.json({
      success: true,
      message: "学習記録の登録が完了しました",
      screenshot: img.toString("base64"),
    });
  } catch (e: unknown) {
    return c.json(
      {
        error: "エラーが発生しました",
        message: (e as Error).message,
      },
      500
    );
  }
});

export default app;
