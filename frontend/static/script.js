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
  createAgeHistogram(data);
  createFootBarChart(data);
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

function createAgeHistogram(data) {
  // Define dimensions and margins
  const margin = { top: 10, right: 30, bottom: 30, left: 40 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG object to the ageHistogram div
  const svg = d3
    .select('#ageHistogram')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X axis: scale and draw
  const x = d3
    .scaleLinear()
    .domain([0, 100]) // Assuming age range 0-100
    .range([0, width]);
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Set the parameters for the histogram
  const histogram = d3
    .histogram()
    .value((d) => d.Age)
    .domain(x.domain())
    .thresholds(x.ticks(70)); // Number of bins

  // Apply this function to data to get the bins
  const bins = histogram(data);

  // Y axis: scale and draw
  const y = d3.scaleLinear().range([height, 0]);
  y.domain([0, d3.max(bins, (d) => d.length)]);
  svg.append('g').call(d3.axisLeft(y));

  // Append the bar rectangles to the svg element
  svg
    .selectAll('rect')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.x0) + 1)
    .attr('width', (d) => x(d.x1) - x(d.x0) - 1)
    .attr('y', (d) => y(d.length))
    .attr('height', (d) => height - y(d.length))
    .style('fill', '#69b3a2');
}

function createFootBarChart(data) {
  // Aggregate data by 'Preferred Foot'
  const footData = d3
    .rollups(
      data,
      (v) => v.length,
      (d) => d.Preffered_Foot
    )
    .map(([key, value]) => ({ foot: key, count: value }));

  // Define dimensions and margins
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 460 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append SVG object to the footBarChart div
  const svg = d3
    .select('#footBarChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // X axis
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(footData.map((d) => d.foot))
    .padding(0.2);
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(footData, (d) => d.count)])
    .range([height, 0]);
  svg.append('g').call(d3.axisLeft(y));

  // Bars
  svg
    .selectAll('mybar')
    .data(footData)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.foot))
    .attr('y', (d) => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', (d) => height - y(d.count))
    .attr('fill', '#69b3a2');
}
