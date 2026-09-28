const firebaseConfig = {
  apiKey: "AIzaSyB80ll5Z1_HLrN3mS6K1P2Hs9mW1t41FHE",
  authDomain: "ahmed-alaa-14ab6.firebaseapp.com",
  projectId: "ahmed-alaa-14ab6",
  storageBucket: "ahmed-alaa-14ab6.firebasestorage.app",
  messagingSenderId: "286755291785",
  appId: "1:286755291785:web:e4614171bd1a43711a7c58",
  measurementId: "G-2BKL816VMB"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const messagesElement = document.querySelector('#messages');
const statusElement = document.querySelector('#status');
const countElement = document.querySelector('#message-count');
const arabicDate = new Intl.DateTimeFormat('ar-EG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const arabicTime = new Intl.DateTimeFormat('ar-EG', {
  hour: 'numeric',
  minute: '2-digit'
});

function showStatus(message, isError = false) {
  statusElement.replaceChildren();
  statusElement.classList.toggle('status-error', isError);
  statusElement.textContent = message;
  statusElement.hidden = false;
}

function createMessageCard(messageDocument, index) {
  const data = messageDocument.data();
  const card = document.createElement('article');
  card.className = 'message-card';
  card.style.animationDelay = `${Math.min(index * 55, 440)}ms`;

  const meta = document.createElement('div');
  meta.className = 'message-meta';

  const name = document.createElement('div');
  name.className = 'message-name';
  const initial = document.createElement('span');
  initial.className = 'name-initial';
  const displayName = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : 'ضيف';
  initial.textContent = displayName.charAt(0);
  const nameText = document.createElement('span');
  nameText.textContent = displayName;
  name.append(initial, nameText);

  const date = document.createElement('time');
  date.className = 'message-date';
  const createdAt = data.createdAt?.toDate?.();
  if (createdAt) {
    date.dateTime = createdAt.toISOString();
    const dateText = document.createElement('span');
    dateText.textContent = arabicDate.format(createdAt);
    const timeText = document.createElement('span');
    timeText.textContent = arabicTime.format(createdAt);
    date.append(dateText, timeText);
  }

  meta.append(name, date);

  const note = document.createElement('p');
  note.className = 'message-note';
  note.textContent = typeof data.note === 'string' && data.note.trim() ? data.note : 'أرسل تهنئة جميلة';

  card.append(meta, note);
  return card;
}

async function loadMessages() {
  try {
    const snapshot = await db.collection('guestbook').orderBy('createdAt', 'desc').get();
    window.clearTimeout(window.guestbookLoadTimeout);
    const cards = snapshot.docs.map((document, index) => createMessageCard(document, index));

    countElement.textContent = new Intl.NumberFormat('ar-EG').format(cards.length);
    messagesElement.replaceChildren(...cards);
    statusElement.hidden = cards.length > 0;
    if (cards.length === 0) {
      showStatus('لسه مفيش رسائل. أول تهنئة هتظهر هنا.');
    }
  } catch (error) {
    window.clearTimeout(window.guestbookLoadTimeout);
    console.error('تعذر تحميل رسائل التهنئة:', error);
    countElement.textContent = '٠';
    showStatus('تعذر تحميل الرسائل. تأكد من اتصال الإنترنت وقواعد القراءة في Firestore.', true);
  }
}

loadMessages();
