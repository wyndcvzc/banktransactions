// 知乎余额面板：在盐粒 / 知乎币 / 直播盐币的数字后面直接标注折合人民币。
// 作为 content script 常驻注入；知乎是 SPA，靠 MutationObserver 在面板渲染/切换后补标注。
(() => {
  const RATES_KEY = 'zhihuRates';
  const MARKER = 'data-bt-yuan';

  // 1 单位虚拟币 = 多少人民币。账户余额本身就是 ¥，不标注。
  // 知乎币 1:1；盐粒 100:1（官方提现比例）；直播盐币按 20 盐币 = ¥1 估算（提现口径）。
  const DEFAULT_RATES = {
    zhihuCoin: 1,
    salt: 0.01,
    liveSalt: 0.05,
  };

  // 顺序有讲究：'直播盐币' 不命中 /盐粒/，'盐粒' 也不命中 /盐币/，互不干扰。
  const TYPES = [
    { key: 'zhihuCoin', label: /知乎币/, unit: '知乎币' },
    { key: 'liveSalt', label: /盐币/, unit: '盐币' },
    { key: 'salt', label: /盐粒/, unit: '盐粒' },
  ];

  const BADGE_STYLE = [
    'margin-left:6px',
    'font-size:12px',
    'font-weight:400',
    'line-height:1',
    'color:#8a8a8a',
    'white-space:nowrap',
    'cursor:pointer',
    'user-select:none',
  ].join(';');

  function loadRates() {
    try {
      const saved = JSON.parse(localStorage.getItem(RATES_KEY) || '{}');
      return Object.assign({}, DEFAULT_RATES, saved);
    } catch (error) {
      return Object.assign({}, DEFAULT_RATES);
    }
  }

  function saveRates(rates) {
    try {
      localStorage.setItem(RATES_KEY, JSON.stringify(rates));
    } catch (error) {
      // 隐私模式等场景写不进去，只影响持久化。
    }
  }

  function toNumber(text) {
    const cleaned = String(text === undefined || text === null ? '' : text)
      .replace(/,/g, '')
      .replace(/[^\d.\-]/g, '');
    const value = parseFloat(cleaned);
    return Number.isFinite(value) ? value : 0;
  }

  function currentRate(type) {
    const rates = loadRates();
    const rate = Number(rates[type.key]);
    return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_RATES[type.key];
  }

  function label(amount, rate) {
    return `≈ ¥${(amount * rate).toFixed(2)}`;
  }

  function createBadge(type, amount) {
    const badge = document.createElement('span');
    badge.setAttribute(MARKER, '1');
    badge.style.cssText = BADGE_STYLE;
    badge.textContent = label(amount, currentRate(type));
    badge.title = `1 ${type.unit} = ¥${currentRate(type)}，点击修改汇率`;

    // 点一下改汇率（结果存本地，下次打开仍是这个价）。
    badge.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rate = currentRate(type);
      const input = window.prompt(`1 ${type.unit} 折合多少人民币？`, String(rate));
      if (input === null) {
        return;
      }
      const next = parseFloat(input);
      if (!Number.isFinite(next) || next < 0) {
        return;
      }
      const rates = loadRates();
      rates[type.key] = next;
      saveRates(rates);
      refresh();
    });

    return badge;
  }

  function refresh() {
    const sections = document.querySelectorAll('.BalanceDashboard-Currency');
    sections.forEach((section) => {
      const labelElement = section.querySelector('.BalanceDashboard-Currency-Label');
      if (!labelElement) {
        return;
      }
      const type = TYPES.find((candidate) => candidate.label.test(labelElement.textContent));
      if (!type) {
        return;
      }
      const numberElement = section.querySelector('.BalanceDashboard-Currency-Number');
      if (!numberElement) {
        return;
      }

      // 数值要从「不含标注」的副本里读，否则标注文本会被当成数字再算一遍。
      const clone = numberElement.cloneNode(true);
      const badgeInClone = clone.querySelector(`[${MARKER}]`);
      if (badgeInClone) {
        badgeInClone.remove();
      }
      const amount = toNumber(clone.textContent);
      const rate = currentRate(type);
      let badge = numberElement.querySelector(`[${MARKER}]`);

      if (!badge) {
        numberElement.appendChild(createBadge(type, amount));
        badge = numberElement.querySelector(`[${MARKER}]`);
      }

      // 只在内容变化时写 DOM，避免自身改动再次触发 MutationObserver 形成死循环。
      const text = label(amount, rate);
      if (badge.textContent !== text) {
        badge.textContent = text;
      }
      const title = `1 ${type.unit} = ¥${rate}，点击修改汇率`;
      if (badge.title !== title) {
        badge.title = title;
      }
    });
  }

  let timer = null;
  function schedule() {
    if (timer) {
      return;
    }
    timer = window.setTimeout(() => {
      timer = null;
      refresh();
    }, 150);
  }

  refresh();

  if (document.body) {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  }
})();
