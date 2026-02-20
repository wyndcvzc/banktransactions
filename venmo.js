function parse() {
  const rows = document.getElementsByTagName('article');

  const parsedTransactions = Array.from(rows).map((row) => {
    const data = {};
    const children = row.children;

    const amountDiv = children[2];
    const amount = amountDiv.textContent.replace(' ', '').replace('-', '').replace('+', '-');

    const details = children[1];
    const participant1 = details.children[0].children[0].children[0]?.textContent;
    const participant2 = details.children[0].children[0].children[1]?.textContent;
    const person = participant1.toLowerCase() === 'you' ? participant2 : participant1;

    const description = details.children[3].children[0]?.textContent;

    const dateElement = details.children[2].children[0].children[0];
    const dateString = dateElement.textContent;
    console.log(dateString);
    let date;
    if (dateString.match(/[0-9]+d/)) {
      date = new Date();
      date.setDate(date.getDate() - dateString.match(/\d+/)[0]);
    } else {
      date = new Date(Date.parse(dateString));
      if (!dateString.includes(',')) {
        date.setYear(new Date().getFullYear());
      }
    }
    console.log(date);

    return {
      'Date': date.toISOString().substring(0, 10),
      'Amount': amount,
      'Description': `Venmo - ${person} - ${description}`,
    };
  });

  return {
    headers: ['Date', 'Amount', 'Category', 'Description'],
    rows: parsedTransactions,
  };
}

parse();
