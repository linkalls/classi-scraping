import { BrowserWorker, launch } from "@cloudflare/playwright";
import { Hono } from "hono";

type Bindings = {
  MYBROWSER: BrowserWorker;
  USERNAME: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (c) => {
  try {
    console.log(c.env.MYBROWSER, c.env.USERNAME, c.env.PASSWORD);
    console.log(
      "🌐 Cloudflare WorkersでPlaywrightを使用して自動入力を開始します..."
    );
    console.log("🎮 自動入力を開始します...");
    // ブラウザを起動
    console.log("🚀 ブラウザを起動中...");
    const browser = await launch(c.env.MYBROWSER);
    const page = await browser.newPage();

    console.log("📝 ログインページへ移動中...");
    await page.goto("https://id.classi.jp/login/identifier");

    console.log("👤 ユーザーID入力中...");
    await page.getByRole("textbox", { name: "入力してください" }).click();
    await page
      .getByRole("textbox", { name: "入力してください" })
      .fill(c.env.USERNAME);
    await page.getByRole("button", { name: "パスワード入力へ" }).click();

    console.log("🔑 パスワード入力中...");
    // パスワード入力画面の読み込みを待機
    await page.waitForLoadState("networkidle");

    // パスワード入力欄が表示されるまで待機
    const passwordInput = page.getByRole("textbox", {
      name: "入力してください",
    });
    await passwordInput.waitFor({ state: "visible" });

    // パスワードを入力
    await passwordInput.click();
    await passwordInput.fill(c.env.PASSWORD);

    await page.locator("i").click();

    // ログインボタンをクリック
    await page.getByRole("button", { name: "ログインする" }).click();

    console.log("📚 学習記録ページへ移動中...");
    await page.getByRole("link", { name: "学習記録" }).click();
    await page.getByRole("link", { name: "入力・編集" }).click();

    console.log("⏱️ 学習時間を入力中...");
    const subjects = ["国語", "数学", "英語", "公民", "地歴", "化学", "情報"];

    for (const subject of subjects) {
      console.log(`  📖 ${subject}の学習時間を設定中...`);
      await page
        .locator("study-subject-learning-report")
        .filter({ hasText: `${subject} -- 00 01 02 03 04 05 06 07` })
        .getByRole("combobox")
        .first()
        .selectOption("2: 1");
    }

    console.log("💭 コメント入力中...");
    await page
      .getByRole("textbox", { name: "今日はどんな一日でしたか？" })
      .click();
    await page
      .getByRole("textbox", { name: "今日はどんな一日でしたか？" })
      .fill("some text");

    console.log("✅ 内容を確定中...");
    await page.getByRole("button", { name: "内容を確定する" }).click();
    //* ここで1秒スリープ
    await page.waitForTimeout(1000);
    const img = await page.screenshot();

    console.log("📸 スクリーンショットを取得しました:", img);
    console.log("🔚 ブラウザを終了中...");
    // ブラウザを終了
    await browser.close();

    console.log("✨ 処理が完了しました！");
    return c.html(
      `<h1>学習記録の自動入力が完了しました！</h1><img src="data:image/png;base64,${img.toString(
        "base64"
      )}" alt="screenshot" />`
    );
  } catch (e: unknown) {
    console.error("エラーが発生しました:", e);
    return c.text("エラーが発生しました: " + (e as Error).message, 500);
  }
});

export default app;
