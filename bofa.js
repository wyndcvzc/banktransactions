function parse() {
  // these are the only columns we care about
  const COLUMNS = [
    'Date',
    'Amount',
    'Type',
    'Description',
  ];

  // these are the rows in the transaction table
  const TRANSACTION_CLASS = 'activity-row';

  const rows = document.getElementsByTagName('tr');

  const transactionRows = Array.from(rows).filter((row) => row.classList.contains(TRANSACTION_CLASS));
  const parsedTransactions = transactionRows.map((row) => {
    const columns = Array.from(row.getElementsByTagName('td'));
    const data = {};
    columns.forEach((column) => {
      const header = ['date-cell', 'amount-cell', 'desc-cell', 'type-cell'].find((c) => column.classList.contains(c));
      if (header) {
        var text = column.innerText;
        var headerLabel = header;
        if (header === 'date-cell') {
          headerLabel = 'Date';
          try {
            text = new Date(text).toISOString().substring(0,10);
          } catch (e) {
          }
        } else if (header === 'desc-cell') {
          headerLabel = 'Description';
          text = text.replace('View/Edit', '');
          text = text.trim();
        } else if (header === 'amount-cell') {
          headerLabel = 'Amount';
          if (text.startsWith('-')) {
            text = text.substring(1);
          } else {
            text = '-' + text;
          }
          text = text.replace(',', '');
        } else if (header === 'type-cell') {
          headerLabel = 'Type';
        }
        data[headerLabel] = text;
      }
    });
    return data;
  });
  return {
    headers: COLUMNS,
    rows: parsedTransactions,
  };
}

parse();
