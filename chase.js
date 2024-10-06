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

  const rows = document.getElementsByTagName('tr');

  const transactionRows = Array.from(rows).filter((row) => row.id.match(TRANSACTION_ID_REGEX));
  const parsedTransactions = transactionRows.map((row) => {
    const dataValues = row.attributes['data-values'].value.split(',');
    return {
      'Date': new Date(dataValues[0]).toISOString().substring(0,10),
      'Description': dataValues[1],
      'Amount': dataValues[3],
    };
  });
  return {
    headers: COLUMNS,
    rows: parsedTransactions,
  };
}

parse();
