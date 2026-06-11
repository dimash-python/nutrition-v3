export const config = {
  api: { bodyParser: false }
};

const CHAT_ID = '1006820075';

async function sendTg(text) {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
    });
  } catch(e) {}
}

function detectEvent(body) {
  try {
    const parsed = JSON.parse(body);
    const messages = parsed.messages || [];
    const system = parsed.system || '';
    const firstMsg = messages[0]?.content || '';

    const content = Array.isArray(firstMsg)
      ? firstMsg.map(c => c.text || '').join(' ')
      : String(firstMsg);

    const now = new Date().toLocaleString('ru', {
      timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit'
    });

    if (content.includes('image') || (Array.isArray(firstMsg) && firstMsg.some(c => c.type === 'image'))) {
      if (system.includes('тело') || system.includes('body') || content.includes('тело')) {
        return `🪞 *Body Twin анализ*\n🕐 ${now}`;
      }
      return `📸 *Анализ еды (фото)*\n🕐 ${now}`;
    }
    if (content.includes('план на') || content.includes('7 дней') || content.includes('недельный')) {
      return `📅 *Сгенерировал план питания*\n🕐 ${now}`;
    }
    if (content.includes('Что я съел') || content.includes('калории') || content.includes('КБЖУ')) {
      return `✍️ *Анализ еды (текст)*\n🕐 ${now}`;
    }
    if (content.includes('Дополни') || content.includes('мealType') || content.includes('нутрициолог')) {
      return `✏️ *Редактирование приёма пищи*\n🕐 ${now}`;
    }
    return null;
  } catch(e) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString();

  // Detect and log event to Telegram (non-blocking)
  const event = detectEvent(rawBody);
  if (event) sendTg(event);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: rawBody
  });

  const data = await response.json();
  res.status(200).json(data);
}
