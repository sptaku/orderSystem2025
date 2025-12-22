/**
 * Firebase 設定ファイル
 * 
 * 【設定方法】
 * 1. Firebase Console (https://console.firebase.google.com/) にアクセス
 * 2. 「プロジェクトを追加」をクリック
 * 3. プロジェクト名を入力（例: bonenkai-order）
 * 4. Google Analytics は無効でOK → 「プロジェクトを作成」
 * 5. 左メニュー「構築」→「Realtime Database」→「データベースを作成」
 * 6. ロケーション: asia-southeast1（シンガポール）を選択
 * 7. 「テストモードで開始」を選択 → 「有効にする」
 * 8. 左メニュー「プロジェクトの概要」横の歯車 →「プロジェクトの設定」
 * 9. 下にスクロール →「マイアプリ」→ </> (ウェブ) をクリック
 * 10. アプリのニックネーム入力 → 「アプリを登録」
 * 11. 表示される firebaseConfig の値を下にコピー
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ↑ 上記の YOUR_XXX を Firebase Console で取得した値に置き換えてください
// 例:
// const firebaseConfig = {
//   apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//   authDomain: "bonenkai-order.firebaseapp.com",
//   databaseURL: "https://bonenkai-order-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "bonenkai-order",
//   storageBucket: "bonenkai-order.appspot.com",
//   messagingSenderId: "123456789012",
//   appId: "1:123456789012:web:abcdef123456"
// };

