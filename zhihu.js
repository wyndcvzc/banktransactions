// 知乎「盐粒明细」解析。
// 余额面板的折合人民币直接在页面上标注，见 zhihu-inline.js。

const COLUMNS = [
  '日期',
  '金额',
  '分类',
  '说明',
];

const items = document.querySelectorAll('.BalanceTransactionList-Item');

const rows = Array.from(items).map((item) => {
  const description = item.children[0]?.children[0]?.textContent?.trim() ?? '';

  const amountDiv = item.querySelector('.BalanceTransactionList-Item-Amount');
  const timeElement = item.querySelector('time');

  // Income entries carry the --income modifier class; everything else is a withdrawal.
  const isIncome = amountDiv?.classList.contains('BalanceTransactionList-Item-Amount--income') ?? false;

  // Amounts are shown in 盐粒 (100 盐粒 = ¥1). Convert to yuan and normalize to
  // the extension convention: positive = charge/payment (支出), negative = income (收入).
  const raw = parseFloat((amountDiv?.textContent ?? '').replace(/[^\d.]/g, '')) || 0;
  const yuan = raw / 100;
  const amount = isIncome ? -yuan : yuan;
  const amountString = String(Number(amount.toFixed(2)));

  const date = timeElement?.getAttribute('datetime')?.substring(0, 10) ?? '';

  return {
    '日期': date,
    '金额': amountString,
    '分类': isIncome ? '收入' : '提现',
    '说明': description,
  };
});

// 注入脚本不能用顶层 return，用最后一条表达式作为 executeScript 的 result。
({
  headers: COLUMNS,
  rows,
  currency: '¥',
});
