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
  thead
    .append('tr')
    .selectAll('th')
    .data(columns)
    .enter()
    .append('th')
    .text((column) => column)
    .on('click', (event, column) => sortTableByColumn(column, table));

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
  table.select('thead tr').append('th').text(newAttribute);

  table
    .selectAll('tbody tr')
    .data(data)
    .append('td')
    .text((d) => d[newAttribute] || '');
}
