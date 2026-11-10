async function operator(proxies, targetPlatform, context) {
  const $ = (typeof $substore !== 'undefined') ? $substore : null;
  function log(msg) {
    try { if ($ && $.info) $.info(msg); } catch (e) {}
  }

  // 通用地区表: ISO -> 旗帜 + 可识别的文本
  const REGIONS = [
    { iso: 'HK', flag: '🇭🇰', keys: ['香港', 'hong kong', 'hongkong'] },
    { iso: 'MO', flag: '🇲🇴', keys: ['澳门', 'macau', 'macao'] },
    { iso: 'TW', flag: '🇹🇼', keys: ['台湾', 'taiwan'] },
    { iso: 'JP', flag: '🇯🇵', keys: ['日本', 'japan'] },
    { iso: 'KR', flag: '🇰🇷', keys: ['韩国', 'korea', 'south korea'] },
    { iso: 'SG', flag: '🇸🇬', keys: ['新加坡', 'singapore'] },
    { iso: 'US', flag: '🇺🇸', keys: ['美国', 'united states', 'usa'] },
    { iso: 'CN', flag: '🇨🇳', keys: ['中国', 'china'] },
    { iso: 'UK', flag: '🇬🇧', keys: ['英国', 'united kingdom', 'uk'] },
    { iso: 'DE', flag: '🇩🇪', keys: ['德国', 'germany'] },
    { iso: 'FR', flag: '🇫🇷', keys: ['法国', 'france'] },
    { iso: 'NL', flag: '🇳🇱', keys: ['荷兰', 'netherlands'] },
    { iso: 'CA', flag: '🇨🇦', keys: ['加拿大', 'canada'] },
    { iso: 'AU', flag: '🇦🇺', keys: ['澳大利亚', 'australia'] },
    { iso: 'IN', flag: '🇮🇳', keys: ['印度', 'india'] },
    { iso: 'TR', flag: '🇹🇷', keys: ['土耳其', 'turkey'] },
    { iso: 'RU', flag: '🇷🇺', keys: ['俄罗斯', 'russia'] },
    { iso: 'BR', flag: '🇧🇷', keys: ['巴西', 'brazil'] },
  ];
  const ISO_SET = new Set(REGIONS.map(r => r.iso));

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 从任意文本里提取一段可用于识别地区的特征文本, 返回原文本片段或 null
  function extractGeoText(text) {
    if (!text) return null;
    // 1) emoji 旗帜本身
    const emoji = text.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
    if (emoji) return emoji[0];
    // 2) 括号/方括号里的 ISO, 如 [HK] (TW) -HK-
    const bracket = text.match(/[\[\(（\-_](HK|MO|TW|JP|KR|SG|US|CN|UK|DE|FR|NL|CA|AU|IN|TR|RU|BR)[\]\)）\-_]/i);
    if (bracket) return bracket[1];
    // 3) 中文 / 英文地区名; 英文 key 要求前后不是字母, 避免 "Yuki" 误判英国、"usagi" 误判美国; 长词优先
    const keys = [];
    for (const r of REGIONS) for (const k of r.keys) keys.push(k);
    keys.sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (/[\u4e00-\u9fa5]/.test(k)) {
        if (text.includes(k)) return k;
      } else {
        const re = new RegExp(`(?<![A-Za-z])${escapeRegExp(k)}(?![A-Za-z])`, 'i');
        if (re.test(text)) return k;
      }
    }
    // 4) 独立的 ISO 代码, 如 HK01 / US-1 / JP_2, 要求前后不是字母
    const iso = text.match(/(?<![A-Za-z])(HK|MO|TW|JP|KR|SG|US|CN|UK|DE|FR|NL|CA|AU|IN|TR|RU|BR)(?![A-Za-z])/i);
    if (iso) return iso[1];
    return null;
  }

  // 本地兜底识别: ProxyUtils 不可用或识别失败时用
  function detectLocal(geoStr) {
    if (!geoStr) return null;
    if (/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(geoStr)) {
      for (const r of REGIONS) if (r.flag === geoStr) return r;
      return null;
    }
    const lower = geoStr.toLowerCase();
    const upper = geoStr.toUpperCase();
    if (ISO_SET.has(upper)) return REGIONS.find(r => r.iso === upper);
    for (const r of REGIONS) {
      if (r.keys.some(k => k.toLowerCase() === lower)) return r;
    }
    return null;
  }

  function getFlagIso(geoStr) {
    if (!geoStr) return null;
    // 优先用 Sub-Store 自带的识别, 支持的文本比上表更广
    if (typeof ProxyUtils !== 'undefined') {
      try {
        const flag = ProxyUtils.getFlag(geoStr);
        const iso = ProxyUtils.getISO(geoStr);
        if (flag && iso) return { flag, iso: String(iso).toUpperCase() };
      } catch (e) { /* 落到本地识别 */ }
    }
    return detectLocal(geoStr);
  }

  // 由 ISO 代码直接生成旗帜 emoji, 表里没有的国家也能用
  function flagFromIso(iso) {
    return String.fromCodePoint(...[...iso].map(c => 127397 + c.charCodeAt(0)));
  }

  // 联网取文本: 优先用 AI 脚本验证过的 $substore.http 写法(对象参数, 返回 {statusCode, body})
  async function httpGetText(url) {
    if ($ && $.http && typeof $.http.get === 'function') {
      const { statusCode, body } = await $.http.get({ url, timeout: 10000 });
      if (statusCode !== 200) throw new Error('http ' + statusCode);
      return body;
    }
    if (typeof fetch !== 'undefined') {
      const r = await fetch(url);
      if (!r.ok) throw new Error('http ' + r.status);
      return await r.text();
    }
    if (typeof ProxyUtils !== 'undefined' && typeof ProxyUtils.download === 'function') {
      return await ProxyUtils.download(url);
    }
    throw new Error('no http method available');
  }

  // 按服务器查 IP 属地, 返回 ISO 代码或 null; 同一服务器只查一次, 结果跨次缓存 7 天
  const geoCache = new Map();
  async function geoLookup(host) {
    if (!host) return null;
    if (geoCache.has(host)) return geoCache.get(host);
    const cacheKey = 'geo:' + host;
    try {
      if (typeof scriptResourceCache !== 'undefined') {
        const hit = scriptResourceCache.get(cacheKey);
        if (hit) { geoCache.set(host, hit); return hit; }
      }
    } catch (e) {}
    let iso = null;
    const apis = [
      `https://ipwho.is/${host}?fields=country_code`,
      `http://ip-api.com/json/${host}?fields=status,countryCode`,
    ];
    for (const url of apis) {
      try {
        const data = JSON.parse(await httpGetText(url));
        const code = data.country_code || (data.status === 'success' ? data.countryCode : null);
        if (code) { iso = String(code).toUpperCase(); break; }
      } catch (e) { log(`GeoIP 失败 ${host} 经 ${url}: ${e && e.message}`); }
    }
    log(`GeoIP ${host} -> ${iso || '失败, 保持 UN'}`);
    if (iso) {
      geoCache.set(host, iso);
      try {
        if (typeof scriptResourceCache !== 'undefined') {
          scriptResourceCache.set(cacheKey, iso, 7 * 24 * 3600 * 1000);
        }
      } catch (e) {}
    }
    return iso;
  }

  const counts = new Map();
  // 加了异步查询后必须用顺序 for 循环, 否则编号分配顺序会乱
  for (const proxy of proxies) {
    const subName = proxy._subDisplayName || proxy._subName || '订阅';
    // 识别来源按优先级: 节点名 -> 订阅名 -> 服务器地址 -> 服务器 IP 属地
    const geoStr = extractGeoText(proxy.name)
      || extractGeoText(subName)
      || extractGeoText(proxy.server);
    let detected = getFlagIso(geoStr);
    // 名字里实在没有地区信息时, 用服务器 IP 属地兜底, UN 就是在这里被替换掉的
    if (!detected) {
      const iso = await geoLookup(proxy.server);
      if (iso) {
        const r = REGIONS.find(x => x.iso === iso);
        detected = r || { flag: flagFromIso(iso), iso };
      }
    }
    // 参考原脚本: 某些平台显示不了 🇹🇼, 替换为 🇼🇸; 不需要时删掉这一行即可
    const flag = (detected?.flag || '🌐').replace(/🇹🇼/g, '🇼🇸');
    const iso = detected?.iso || 'UN';
    const type = String(proxy.type || 'unknown').toLowerCase();

    // 防重名: 同 [订阅|旗帜|ISO|协议] 的节点按出现顺序编号, 01、02……
    const key = `${subName}|${flag}|${iso}|${type}`;
    const n = (counts.get(key) || 0) + 1;
    counts.set(key, n);
    const seq = String(n).padStart(2, '0');

    proxy.name = `[${subName}] ${flag} ${iso} [${type}] ${seq}`;
  }
  return proxies;
}
