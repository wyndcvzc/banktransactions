// status: boolean
function setLoading(status) {
  const loading = document.getElementById('loading');
  if (loading) {
    if (status) {
      loading.style.display = 'block';
    } else {
      loading.style.display = 'none';
    }
  }
}

// url: string
// options: string[]
function notFound(url, options) {
  const notFound = document.getElementById('notfound');
  if (notFound) {
    notFound.style.display = 'block';
    notFound.innerHTML = `未识别的页面地址：${url}。请打开知乎盐粒明细页再试。`;
  }
}

// message: string
function showError(message) {
  const notFound = document.getElementById('notfound');
  if (notFound) {
    notFound.style.display = 'block';
    notFound.innerHTML = `Error: ${message}`;
  }
}

// results: {
//   headers: [string],
//   rows: [Row],
//   currency?: string,
//   balance?: { items: [BalanceItem] },
//   transactions?: { headers, rows, currency },
// }
// each Row should contain keys that match the list of headers
function setResults(results) {
  const resultsElement = document.getElementById('results');
  if (!resultsElement) {
    return;
  }
  resultsElement.style.display = 'block';
  resultsElement.innerHTML = '';

  if (!results || !results.rows) {
    showError('没有抓到数据，请确认已登录并停留在交易明细页面。');
    return;
  }

  if (results.rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.appendChild(document.createTextNode('没有找到交易记录。余额页的折合金额已直接标注在余额旁边。'));
    resultsElement.appendChild(empty);
    return;
  }

  renderTransactions(resultsElement, results);
}

// 把交易按金额正负分组渲染：收入为正、支出为负。
function renderTransactions(container, results) {
  const income = [];
  const expense = [];
  results.rows.forEach((row) => {
    const amount = parseAmount(row['金额']);
    if (Number.isNaN(amount)) {
      return;
    }
    if (amount >= 0) {
      income.push(row);
    } else {
      expense.push(row);
    }
  });

  container.appendChild(createCopyButton(results));
  container.appendChild(createGroup('支出', expense, results, 'expense'));
  container.appendChild(createGroup('收入', income, results, 'income'));
}

// Parse an Amount cell into a number, tolerating $, commas and signs.
function parseAmount(value) {
  if (value === undefined || value === null) {
    return NaN;
  }
  return parseFloat(String(value).replace(/[$,]/g, '').trim());
}

function createCopyButton(results) {
  const button = document.createElement('button');
  button.appendChild(document.createTextNode('复制 CSV'));
  button.addEventListener('click', () => {
    // Escape a cell for CSV: wrap in quotes if it contains comma/quote/newline.
    const escapeCell = (value) => {
      const text = value === undefined || value === null ? '' : String(value);
      if (/[",\n\r]/.test(text)) {
        return '"' + text.replace(/"/g, '""') + '"';
      }
      return text;
    };
    let csv = results.headers.map(escapeCell).join(',') + '\n';
    results.rows.forEach((row) => {
      csv += results.headers.map((header) => escapeCell(row[header])).join(',');
      csv += '\n';
    });
    // Prepend a UTF-8 BOM so Excel opens Chinese characters correctly.
    navigator.clipboard.writeText('\uFEFF' + csv);
  });
  return button;
}

// title: string
// rows: [Row]
// results: { headers: [string], rows: [Row] }
// className: 'expense' | 'income'
function createGroup(title, rows, results, className) {
  const section = document.createElement('div');
  section.className = `group ${className}`;

  const heading = document.createElement('h3');
  heading.appendChild(document.createTextNode(`${title}（${rows.length} 笔）`));
  section.appendChild(heading);

    const total = rows.reduce((sum, row) => {
    const amount = parseAmount(row['金额']);
    return sum + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

  const currency = results.currency || '$';
  const totalElement = document.createElement('div');
  totalElement.className = 'total';
  totalElement.appendChild(document.createTextNode(`合计：${formatAmount(total, currency)}`));
  section.appendChild(totalElement);

  if (rows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.appendChild(document.createTextNode('暂无记录'));
    section.appendChild(empty);
  } else {
    section.appendChild(createTable(rows, results));
  }

  return section;
}

function formatAmount(value, currency = '$') {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  // 整数不带小数位（盐粒金额是整数），小数最多保留两位。
  const text = Number.isInteger(abs) ? String(abs) : String(Number(abs.toFixed(2)));
  return `${sign}${currency}${text}`;
}

// rows: [Row]
// results: { headers: [string], rows: [Row] }
function createTable(rows, results) {
  const table = document.createElement('table');
  const tableHeaders = document.createElement('tr');
  results.headers.forEach((header) => {
    const headerElement = document.createElement('th');
    headerElement.appendChild(document.createTextNode(header));
    tableHeaders.appendChild(headerElement);
  });
  const deleteHeader = document.createElement('th');
  deleteHeader.appendChild(document.createTextNode('删除'));
  tableHeaders.appendChild(deleteHeader);
  table.appendChild(tableHeaders);

  rows.forEach((row) => {
    const rowElement = document.createElement('tr');
    results.headers.forEach((header) => {
      const dataElement = document.createElement('td');
      dataElement.appendChild(document.createTextNode(row[header]));
      if (header === '说明') {
        dataElement.title = row[header];
      }
      rowElement.appendChild(dataElement);
    });

    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    const deleteButtonText = document.createElement('span');
    deleteButtonText.className = 'material-icons';
    deleteButtonText.appendChild(document.createTextNode('delete'));
    deleteButton.appendChild(deleteButtonText);
    deleteButton.addEventListener('click', () => {
      results.rows = results.rows.filter((originalRow) => row !== originalRow);
      setResults(results);
    });
    deleteCell.appendChild(deleteButton);
    rowElement.appendChild(deleteCell);

    table.appendChild(rowElement);
  });

  return table;
}

function executeScript(file, tab) {
  setLoading(true);
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [file],
  }).then((results) => {
    setLoading(false);
    setResults(results[0].result);
  }).catch((error) => {
    setLoading(false);
    showError(error.message);
  });
}

function init() {
  setLoading(false);

  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        showError('没有找到活动标签页。');
        return;
      }
      let url;
      try {
        url = new URL(tab.url);
      } catch (error) {
        showError('无法识别的页面地址。');
        return;
      }

      if (url.hostname.endsWith('zhihu.com')) {
        executeScript('zhihu.js', tab);
      } else {
        notFound(url.hostname, ['zhihu.com']);
      }
    },
  );
}

// popup.js 在 <head> 里加载，等 DOM 就绪再操作元素。
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
