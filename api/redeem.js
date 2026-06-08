import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const PROMO_CODES = ["AIN-WAJHZ","AIN-X6CPA","AIN-GSAGW","AIN-THU3A","AIN-3YLE8","AIN-LCD5V","AIN-3ZT9N","AIN-T4V5U","AIN-YBHKC","AIN-HDJWM","AIN-SWKF4","AIN-NV8ZQ","AIN-R2P7E","AIN-KM9XB","AIN-D4FGT","AIN-J6HWY","AIN-Q5NUC","AIN-8BVSA","AIN-L3ZPM","AIN-F7KDE","AIN-2XTQR","AIN-9CGVH","AIN-MJBWN","AIN-U5AZK","AIN-P8YLF","AIN-6THSE","AIN-WNRQC","AIN-4DKZB","AIN-HJGP3","AIN-V2MXU","AIN-BFYTW","AIN-E9KAQ","AIN-ZRNCL","AIN-7XVHD","AIN-CGPWM","AIN-STBF4","AIN-LKZQN","AIN-3MJHE","AIN-RYDXC","AIN-8WVUP","AIN-N5GBT","AIN-AQZKF","AIN-6CXPW","AIN-MDHVR","AIN-T3LYB","AIN-JFNQ9","AIN-2UXKS","AIN-WPZGA","AIN-B7CHE","AIN-YNRM4","AIN-D9KTQ","AIN-HVAXF","AIN-5LZPB","AIN-QCWMG","AIN-RJNU8","AIN-3BXHK","AIN-EVTYZ","AIN-G4DPS","AIN-XFWMN","AIN-7HKQC","AIN-UBLRE","AIN-2NZTP","AIN-FJVKW","AIN-9MXGD","AIN-CQBHA","AIN-4YRNZ","AIN-WDSLE","AIN-K8FPT","AIN-HNGVB","AIN-6ZYXM","AIN-3TCQR","AIN-APWKD","AIN-JUBHE","AIN-MVNZF","AIN-5DXTS","AIN-LRYHQ","AIN-8GKWB","AIN-CNPZA","AIN-TFXVD","AIN-2QHME","AIN-BKYNR","AIN-9WLCG","AIN-PZDXF","AIN-6HBTM","AIN-MARQK","AIN-4YVNU","AIN-XCFGW","AIN-DKHRZ","AIN-TNBQL","AIN-7PMSE","AIN-GVZYX","AIN-UWCKF","AIN-3BNDH","AIN-JLRQT","AIN-F8VPM","AIN-ZXKWB","AIN-5GHCE","AIN-NTQDA","AIN-RYMLF","AIN-2BVKX"];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Code required' });

  const c = code.trim().toUpperCase();

  if (!PROMO_CODES.includes(c)) {
    return res.status(200).json({ ok: false, msg: 'Неверный код' });
  }

  // Атомарная операция: SET если ключ не существует
  // Возвращает 1 если установили, 0 если уже был
  const set = await redis.setnx(`promo:${c}`, Date.now());

  if (set === 0) {
    return res.status(200).json({ ok: false, msg: 'Этот промокод уже использован' });
  }

  const expires = Date.now() + (30 * 24 * 60 * 60 * 1000);
  return res.status(200).json({ ok: true, expires });
}
