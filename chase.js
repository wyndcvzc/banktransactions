function parse() {
  // these are the only columns we care about
  const COLUMNS = [
    'Date',
    'Amount',
    'Category',
    'Description',
  ];

  // these are the rows in the transaction table
  const TRANSACTION_ID_REGEX = /ACTIVITY-dataTableId-row-.*/;

  const DATA_VALUES_REGEX = /([^,]*),([^,]*),([^,]*),([0-9\.,\$-]*),$/;

  const rows = document.getElementsByTagName('tr');

  const transactionRows = Array.from(rows).filter((row) => row.id.match(TRANSACTION_ID_REGEX));
  const parsedTransactions = transactionRows.map((row) => {
    const values = row.attributes['data-values'].value.match(DATA_VALUES_REGEX);
    console.log(values);
    return {
      'Date': new Date(values[1]).toISOString().substring(0,10),
      'Description': values[2],
      'Amount': values[4].replace(',', ''),
    };
  });
  return {
    headers: COLUMNS,
    rows: parsedTransactions,
  };
}

parse();
