function parse() {
  // these are the only columns we care about
  const COLUMNS = [
    'Date',
    'Amount',
    'Category',
    'Description',
  ];

  // transaction information is stored in an aria label
  // hopefully easier to extract than traversing through the HTML DOM
  const ARIA_LABEL_REGEX = /date (.*), Description (.*), amount ([0-9\.-]*)/;

  const rows = document.getElementsByClassName('transaction-row');

  const parsedTransactions = Array.from(rows).map((row) => {
    const label = row.attributes['aria-label'].value;
    const values = label.match(ARIA_LABEL_REGEX);
    console.log(values);
    return {
      'Date': new Date(values[1]).toISOString().substring(0,10),
      'Description': values[2],
      'Amount': values[3],
    };
  });
  return {
    headers: COLUMNS,
    rows: parsedTransactions,
  };
}

parse();
