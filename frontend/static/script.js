let allAttributes;
let usedAttributes = [
  'Name',
  'Nationality',
  'National_Position',
  'Club',
  'Height',
  'Preffered_Foot',
  'Age',
  'Rating',
];
let data;
let sortAscending = true;

function sortTableByColumn(column) {
  if (sortAscending) {
    data.sort((a, b) => (a[column] > b[column] ? 1 : -1));
  } else {
    data.sort((a, b) => (a[column] < b[column] ? 1 : -1));
  }
  sortAscending = !sortAscending;
  createTable(usedAttributes);
}

d3.json('/players/').then((fetchedData) => {
  data = fetchedData;
  allAttributes = Object.keys(data[0]);
  createTable(usedAttributes);
  updateDropdown();
});

function createTable(columns) {
  // Clear existing table
  d3.select('#table-container').html('');

  let table = d3.select('#table-container').append('table');
  let thead = table.append('thead');
  let tbody = table.append('tbody');

  // Append header row
  let headers = thead
    .append('tr')
    .selectAll('th')
    .data(columns)
    .enter()
    .append('th');

  headers
    .append('span')
    .text((column) => column)
    .attr('class', 'sortable')
    .on('click', (event, column) => sortTableByColumn(column));

  headers.each(function (column, i) {
    if (column !== 'Name' && column !== 'Nationality') {
      d3.select(this)
        .append('button')
        .text('X')
        .on('click', (event) => {
          event.stopPropagation();
          removeColumn(column);
        });
    }
  });

  // Create a row for each object in the data
  let rows = tbody.selectAll('tr').data(data).enter().append('tr');

  // Create a cell in each row for each column
  rows
    .selectAll('td')
    .data((row) => columns.map((column) => row[column] || ''))
    .enter()
    .append('td')
    .text((d) => d);
}

function removeColumn(column) {
  usedAttributes = usedAttributes.filter((attr) => attr !== column);

  createTable(usedAttributes);
  updateDropdown();
}

function updateDropdown() {
  let remainingAttributes = allAttributes.filter(
    (attr) => !usedAttributes.includes(attr)
  );
  let dropdown = d3.select('#attribute-dropdown');
  dropdown.selectAll('option').remove();
  dropdown
    .selectAll('option')
    .data(remainingAttributes)
    .enter()
    .append('option')
    .text((d) => d);
}

d3.select('#attribute-dropdown').on('change', function () {
  let newAttribute = d3.select(this).property('value');
  if (!usedAttributes.includes(newAttribute)) {
    usedAttributes.push(newAttribute);
    updateTableWithNewColumn(newAttribute);
    updateDropdown();
  }
});

function updateTableWithNewColumn(newAttribute) {
  let table = d3.select('table');
  let newHeader = table.select('thead tr').append('th');

  newHeader
    .append('span')
    .text(newAttribute)
    .attr('class', 'sortable')
    .on('click', () => sortTableByColumn(newAttribute));

  newHeader
    .append('button')
    .text('X')
    .on('click', (event) => {
      event.stopPropagation();
      removeColumn(newAttribute);
    });

  table
    .selectAll('tbody tr')
    .data(data)
    .append('td')
    .text((d) => d[newAttribute] || '');
}
