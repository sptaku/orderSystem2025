// ====== Firebase 初期化 ======
let db;
let ordersRef;
let isFirebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebaseConfig === 'undefined' || firebaseConfig.apiKey === 'YOUR_API_KEY') {
      console.warn('Firebase未設定: ローカルストレージモードで動作します');
      isFirebaseReady = false;
      return;
    }
    
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    ordersRef = db.ref('orders');
    isFirebaseReady = true;
    console.log('Firebase 接続成功');
    
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
    isFirebaseReady = false;
  }
}

// ====== データ操作 ======
const STORAGE_KEY = 'bonenkai_orders';

function getOrdersLocal() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveOrdersLocal(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

async function addOrder(order) {
  order.timestamp = new Date().toLocaleString('ja-JP');
  order.timestampMs = Date.now();
  
  if (isFirebaseReady) {
    try {
      const newRef = ordersRef.push();
      order.id = newRef.key;
      await newRef.set(order);
      return order;
    } catch (error) {
      console.error('Firebase書き込みエラー:', error);
      showErrorModal();
      return null;
    }
  } else {
    const orders = getOrdersLocal();
    order.id = Date.now().toString();
    orders.push(order);
    saveOrdersLocal(orders);
    return order;
  }
}

// ====== DOM Elements ======
const orderForm = document.getElementById('order-form');
const orderTypeInputs = document.querySelectorAll('input[name="order-type"]');
const setTypeInputs = document.querySelectorAll('input[name="set-type"]');
const modal = document.getElementById('success-modal');
const modalClose = document.getElementById('modal-close');
const modalSummary = document.getElementById('modal-summary');
const errorModal = document.getElementById('error-modal');
const errorClose = document.getElementById('error-close');
const submitBtn = document.getElementById('submit-btn');

// 確認画面
const confirmScreen = document.getElementById('confirm-screen');
const confirmDetails = document.getElementById('confirm-details');
const confirmSubmit = document.getElementById('confirm-submit');
const confirmBack = document.getElementById('confirm-back');

// Conditional sections
const setOptions = document.getElementById('set-options');
const alacarteOptions = document.getElementById('alacarte-options');
const kidsOptions = document.getElementById('kids-options');
const drinkOnlyOptions = document.getElementById('drink-only-options');

const naanRiceChoice = document.getElementById('naan-rice-choice');
const curry1Choice = document.getElementById('curry-1-choice');
const curry2Choice = document.getElementById('curry-2-choice');
const biryaniChoice = document.getElementById('biryani-choice');
const tandooriBeerChoice = document.getElementById('tandoori-beer-choice');
const setDrinkChoice = document.getElementById('set-drink-choice');
const naanUpgradeChoice = document.getElementById('naan-upgrade-choice');

// 一時保存用
let pendingOrder = null;

// ====== Order Type Selection ======
orderTypeInputs.forEach(input => {
  input.addEventListener('change', () => {
    hideAllOptions();
    
    switch (input.value) {
      case 'set':
        setOptions.classList.remove('hidden');
        break;
      case 'alacarte':
        alacarteOptions.classList.remove('hidden');
        break;
      case 'kids':
        kidsOptions.classList.remove('hidden');
        break;
      case 'drink-only':
        drinkOnlyOptions.classList.remove('hidden');
        break;
    }
  });
});

function hideAllOptions() {
  setOptions.classList.add('hidden');
  alacarteOptions.classList.add('hidden');
  kidsOptions.classList.add('hidden');
  drinkOnlyOptions.classList.add('hidden');
  
  naanRiceChoice.classList.add('hidden');
  curry1Choice.classList.add('hidden');
  curry2Choice.classList.add('hidden');
  biryaniChoice.classList.add('hidden');
  tandooriBeerChoice.classList.add('hidden');
  setDrinkChoice.classList.add('hidden');
  naanUpgradeChoice.classList.add('hidden');
}

// ====== Set Type Selection ======
setTypeInputs.forEach(input => {
  input.addEventListener('change', () => {
    naanRiceChoice.classList.add('hidden');
    curry1Choice.classList.add('hidden');
    curry2Choice.classList.add('hidden');
    biryaniChoice.classList.add('hidden');
    tandooriBeerChoice.classList.add('hidden');
    setDrinkChoice.classList.add('hidden');
    naanUpgradeChoice.classList.add('hidden');
    
    switch (input.value) {
      case 'shanti':
        naanRiceChoice.classList.remove('hidden');
        curry1Choice.classList.remove('hidden');
        setDrinkChoice.classList.remove('hidden');
        naanUpgradeChoice.classList.remove('hidden');
        break;
      case 'ladies':
        curry2Choice.classList.remove('hidden');
        setDrinkChoice.classList.remove('hidden');
        naanUpgradeChoice.classList.remove('hidden');
        break;
      case 'tandoori':
        naanRiceChoice.classList.remove('hidden');
        curry1Choice.classList.remove('hidden');
        tandooriBeerChoice.classList.remove('hidden');
        naanUpgradeChoice.classList.remove('hidden');
        break;
      case 'biryani':
        biryaniChoice.classList.remove('hidden');
        setDrinkChoice.classList.remove('hidden');
        break;
    }
  });
});

// ====== Form Submission - 確認画面へ ======
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(orderForm);
  const name = document.getElementById('name').value.trim();
  const orderType = formData.get('order-type');
  
  if (!name) {
    alert('お名前を入力してください');
    return;
  }
  
  if (!orderType) {
    alert('オーダータイプを選択してください');
    return;
  }
  
  let order = {
    name: name,
    orderType: orderType,
    notes: document.getElementById('notes').value.trim()
  };
  
  switch (orderType) {
    case 'set':
      order = collectSetOrder(order, formData);
      break;
    case 'alacarte':
      order = collectAlacarteOrder(order, formData);
      break;
    case 'kids':
      order = collectKidsOrder(order, formData);
      break;
    case 'drink-only':
      order = collectDrinkOnlyOrder(order, formData);
      break;
  }
  
  if (!order) return;
  
  // 確認画面を表示
  pendingOrder = order;
  showConfirmScreen(order);
});

// ====== 確認画面 ======
function showConfirmScreen(order) {
  let html = '';
  
  html += createDetailRow('お名前', order.name);
  html += createDetailRow('オーダータイプ', getOrderTypeName(order.orderType));
  
  if (order.setType) {
    html += createDetailRow('セット', order.setType);
  }
  
  if (order.naanRice) {
    html += createDetailRow('ナン/ライス', order.naanRice);
  }
  
  if (order.curry) {
    html += createDetailRow('カレー', order.curry);
  }
  
  if (order.biryani) {
    html += createDetailRow('ビリヤニ', order.biryani);
  }
  
  if (order.items && order.items.length > 0) {
    html += createDetailRow('アラカルト', order.items.join('<br>'));
  }
  
  if (order.drink) {
    html += createDetailRow('ドリンク', order.drink);
  }
  
  if (order.naanUpgrade && order.naanUpgrade !== '変更なし' && order.naanUpgrade !== '') {
    html += createDetailRow('ナン変更', order.naanUpgrade);
  }
  
  if (order.notes) {
    html += createDetailRow('備考', order.notes);
  }
  
  confirmDetails.innerHTML = html;
  confirmScreen.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function createDetailRow(label, value) {
  return `
    <div class="detail-row">
      <div class="detail-label">${escapeHTML(label)}</div>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

function hideConfirmScreen() {
  confirmScreen.classList.add('hidden');
  document.body.style.overflow = '';
}

// 確認画面から注文を確定
confirmSubmit.addEventListener('click', async () => {
  if (!pendingOrder) return;
  
  confirmSubmit.disabled = true;
  confirmSubmit.textContent = '送信中...';
  
  const savedOrder = await addOrder(pendingOrder);
  
  confirmSubmit.disabled = false;
  confirmSubmit.textContent = 'この内容で注文する';
  
  if (savedOrder) {
    hideConfirmScreen();
    showSuccessModal(savedOrder);
    orderForm.reset();
    hideAllOptions();
    pendingOrder = null;
  }
});

// 確認画面から戻る
confirmBack.addEventListener('click', () => {
  hideConfirmScreen();
  pendingOrder = null;
});

// ====== Order Collection Functions ======
function collectSetOrder(order, formData) {
  const setType = formData.get('set-type');
  if (!setType) {
    alert('セットを選択してください');
    return null;
  }
  
  order.setType = getSetTypeName(setType);
  order.setTypeCode = setType;
  
  switch (setType) {
    case 'shanti':
      const naanRice = formData.get('naan-rice');
      if (!naanRice) { alert('ナン/ライスを選択してください'); return null; }
      order.naanRice = naanRice === 'naan' ? 'ナン' : 'ライス';
      
      const curry1 = document.getElementById('curry-1').value;
      if (!curry1) { alert('カレーを選択してください'); return null; }
      order.curry = curry1;
      
      const setDrink = document.getElementById('set-drink').value;
      if (!setDrink) { alert('ドリンクを選択してください'); return null; }
      order.drink = setDrink;
      
      order.naanUpgrade = document.getElementById('naan-upgrade').value || '変更なし';
      break;
      
    case 'ladies':
      const curry2a = document.getElementById('curry-2a').value;
      const curry2b = document.getElementById('curry-2b').value;
      if (!curry2a || !curry2b) { alert('カレーを2種類選択してください'); return null; }
      order.curry = `${curry2a}、${curry2b}`;
      
      const ladiesDrink = document.getElementById('set-drink').value;
      if (!ladiesDrink) { alert('ドリンクを選択してください'); return null; }
      order.drink = ladiesDrink;
      
      order.naanUpgrade = document.getElementById('naan-upgrade').value || '変更なし';
      break;
      
    case 'tandoori':
      const tandooriNaanRice = formData.get('naan-rice');
      if (!tandooriNaanRice) { alert('ナン/ライスを選択してください'); return null; }
      order.naanRice = tandooriNaanRice === 'naan' ? 'ナン' : 'ライス';
      
      const tandooriCurry = document.getElementById('curry-1').value;
      if (!tandooriCurry) { alert('カレーを選択してください'); return null; }
      order.curry = tandooriCurry;
      
      const tandooriBeer = formData.get('tandoori-beer');
      if (!tandooriBeer) { alert('ドリンクの種類を選択してください'); return null; }
      order.drink = tandooriBeer;
      
      order.naanUpgrade = document.getElementById('naan-upgrade').value || '変更なし';
      break;
      
    case 'biryani':
      const biryaniType = formData.get('biryani-type');
      if (!biryaniType) { alert('ビリヤニの種類を選択してください'); return null; }
      order.biryani = biryaniType;
      
      const biryaniDrink = document.getElementById('set-drink').value;
      if (!biryaniDrink) { alert('ドリンクを選択してください'); return null; }
      order.drink = biryaniDrink;
      break;
  }
  
  return order;
}

function collectAlacarteOrder(order, formData) {
  const alacarteItems = formData.getAll('alacarte');
  if (alacarteItems.length === 0) {
    alert('アラカルトメニューを選択してください');
    return null;
  }
  order.items = alacarteItems;
  
  const drink = document.getElementById('alacarte-drink').value;
  if (!drink) {
    alert('ドリンクを選択してください');
    return null;
  }
  order.drink = drink;
  
  return order;
}

function collectKidsOrder(order, formData) {
  const kidsCurry = formData.get('kids-curry');
  if (!kidsCurry) {
    alert('カレーを選択してください');
    return null;
  }
  order.curry = kidsCurry;
  
  const kidsDrink = formData.get('kids-drink');
  if (!kidsDrink) {
    alert('ドリンクを選択してください');
    return null;
  }
  order.drink = kidsDrink;
  
  return order;
}

function collectDrinkOnlyOrder(order, formData) {
  const drink = document.getElementById('drink-only').value;
  if (!drink) {
    alert('ドリンクを選択してください');
    return null;
  }
  order.drink = drink;
  
  return order;
}

function getSetTypeName(setType) {
  const names = {
    'shanti': 'サンティセット（1,485円）',
    'ladies': 'レディースセット（1,850円）',
    'tandoori': 'タンドリー焼き肉とカレーのセット',
    'biryani': 'ビリヤニセット（1,650円）'
  };
  return names[setType] || setType;
}

function getOrderTypeName(orderType) {
  const names = {
    'set': 'セットメニュー',
    'alacarte': 'アラカルト',
    'kids': '子どもセット',
    'drink-only': 'ドリンクのみ'
  };
  return names[orderType] || orderType;
}

// ====== Modals ======
function showSuccessModal(order) {
  let summary = `<strong>${escapeHTML(order.name)}</strong> さん<br>`;
  summary += `${getOrderTypeName(order.orderType)}`;
  
  if (order.setType) {
    summary += `<br>${order.setType}`;
  }
  
  modalSummary.innerHTML = summary;
  modal.classList.remove('hidden');
}

function showErrorModal() {
  errorModal.classList.remove('hidden');
}

modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

errorClose.addEventListener('click', () => {
  errorModal.classList.add('hidden');
});

errorModal.addEventListener('click', (e) => {
  if (e.target === errorModal) {
    errorModal.classList.add('hidden');
  }
});

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ====== Initialize ======
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});

// Form reset handler
orderForm.addEventListener('reset', () => {
  setTimeout(() => {
    hideAllOptions();
  }, 0);
});
