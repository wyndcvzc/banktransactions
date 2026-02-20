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
    notFound.innerHTML = `URL not recognized: ${url}. Must be one of {${options.join(', ')}}`;
  }
}

// results: {
//   headers: [string],
//   rows: [Row],
// }
// each Row should contain keys that match the list of headers
function setResults(results) {
  const resultsElement = document.getElementById('results');
  if (resultsElement) {
    resultsElement.style.display = 'block';

    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Copy as CSV'));
    button.addEventListener('click', () => {
      var csv = '';
      results.rows.forEach((row) => {
        csv += results.headers.map((header) => row[header]).join(',');
        csv += '\n';
      });
      navigator.clipboard.writeText(csv);
    });
    resultsElement.appendChild(button);

    const table = document.createElement('table');
    const tableHeaders = document.createElement('tr');
    results.headers.forEach((header) => {
      const headerElement = document.createElement('th');
      headerElement.appendChild(document.createTextNode(header));
      tableHeaders.appendChild(headerElement);
    });
    const headerElement = document.createElement('th');
    headerElement.appendChild(document.createTextNode('Delete Row'));
    tableHeaders.appendChild(headerElement);
    table.appendChild(tableHeaders);

    results.rows.forEach((row) => {
      const rowElement = document.createElement('tr');
      results.headers.forEach((header) => {
        const dataElement = document.createElement('td');
        dataElement.appendChild(document.createTextNode(row[header]));
        if (header === 'Description') dataElement.title = row[header];
        rowElement.appendChild(dataElement);
      });
      const dataElement = document.createElement('td');
      const deleteButton = document.createElement('button');
      const deleteButtonText = document.createElement('span');
      deleteButtonText.className = 'material-icons';
      deleteButtonText.appendChild(document.createTextNode('delete'));
      deleteButton.appendChild(deleteButtonText);
      deleteButton.addEventListener('click', () => {
        rowElement.remove();
        results.rows = results.rows.filter((originalRow) => row != originalRow);
      });
      dataElement.appendChild(deleteButton);
      rowElement.appendChild(dataElement);
      table.appendChild(rowElement);
    });
    resultsElement.appendChild(table);
  }
}

function executeScript(file, tab) {
  setLoading(true);
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [file],
  }).then((results) => {
    setLoading(false);
    setResults(results[0].result);
  });
}

setLoading(false);

chrome.tabs.query(
  { active: true },
  (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url);

    if (url.hostname.endsWith('chase.com')) {
      executeScript('chase.js', tab);
    } else if (url.hostname.endsWith('bankofamerica.com')) {
      executeScript('bofa.js', tab);
    } else if (url.hostname.endsWith('venmo.com')) {
      executeScript('venmo.js', tab);
    } else if (url.hostname.endsWith('citi.com')) {
      executeScript('citi.js', tab);
    } else {
      notFound(url.hostname, ['chase.com', 'bankofamerica.com', 'venmo.com', 'citi.com']);
    }
  },
);
