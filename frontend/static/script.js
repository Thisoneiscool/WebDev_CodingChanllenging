d3.json('/players/').then((data) => {
  createTable(data, [
    'Name',
    'Nationality',
    'National_Position',
    'Club',
    'Height',
    'Preffered_Foot',
    'Rating',
    'Age',
  ]);

  let attributes = Object.keys(data[0]);
  let usedAttributes = [
    'Name',
    'Nationality',
    'National_Position',
    'Club',
    'Height',
    'Preffered_Foot',
    'Rating',
    'Age',
  ];
  let dropdown = d3.select('#attribute-dropdown');
  dropdown
    .selectAll('option')
    .data(attributes.filter((attr) => !usedAttributes.includes(attr)))
    .enter()
    .append('option')
    .text((d) => d);

  dropdown.on('change', function () {
    let selectedAttribute = d3.select(this).property('value');
    if (!usedAttributes.includes(selectedAttribute)) {
      usedAttributes.push(selectedAttribute);
      createTable(data, usedAttributes);
    }
  });
});

function createTable(data, columns) {
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
    .on('click', (event, column) => sortTableByColumn(column));

  // Create a row for each object in the data
  let rows = tbody.selectAll('tr').data(data).enter().append('tr');

  // Create a cell in each row for each column
  rows
    .selectAll('td')
    .data((row) => columns.map((column) => row[column]))
    .enter()
    .append('td')
    .text((d) => d);

  function sortTableByColumn(column) {
    // Sorting logic here
  }
}
