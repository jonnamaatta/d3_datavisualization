//variables containing reference to data
var data2013;
var data2015;
var data2017;
var data2019;
var data2021;

//D3.js canvases
var barChartArea;
var heatMap;

//D3.js svg elements
var yearAreaText;

//color scale
var myColorScale;

//variables for precomputed values
var topValue; //top value in all the data
var bottomValue; //bottom value in all the data

//variables to keep track of the chosen year and region
var chosenYear;
var chosenRegion;
var previousChosenRegion;

/*Loading data from CSV files and editing the properties to province codes. Unary operator plus is used to save the data as numbers (originally imported as string)*/
d3.csv('./public/2013.csv')
    .row(function(d) { return {
      Region : d['Geographic region'],
      Index: +d['Gender Equality Index'],
      Work : +d['Work'],
      Money : +d['Money'],
      Knowledge : +d['Knowledge'],
      Time : +d['Time'],
      Power : +d['Power'],
      Health : +d['Health'],
    }; 
  }).get(function(error, rows) { 
      //saving reference to data
      data2013 = rows;
  });
  d3.csv('./public/2015.csv')
    .row(function(d) { return {
      Region : d['Geographic region'],
      Index: +d['Gender Equality Index'],
      Work : +d['Work'],
      Money : +d['Money'],
      Knowledge : +d['Knowledge'],
      Time : +d['Time'],
      Power : +d['Power'],
      Health : +d['Health'],
    }; 
  }).get(function(error, rows) { 
      //saving reference to data
      data2015 = rows;
  })
  d3.csv('./public/2017.csv')
  .row(function(d) { return {
    Region : d['Geographic region'],
    Index: +d['Gender Equality Index'],
    Work : +d['Work'],
    Money : +d['Money'],
    Knowledge : +d['Knowledge'],
    Time : +d['Time'],
    Power : +d['Power'],
    Health : +d['Health'],
  }; 
  }).get(function(error, rows) { 
    //saving reference to data
    data2017 = rows;
  });
  d3.csv('./public/2019.csv')
  .row(function(d) { return {
    Region : d['Geographic region'],
    Index: +d['Gender Equality Index'],
    Work : +d['Work'],
    Money : +d['Money'],
    Knowledge : +d['Knowledge'],
    Time : +d['Time'],
    Power : +d['Power'],
    Health : +d['Health'],
  }; 
  }).get(function(error, rows) { 
    //saving reference to data
    data2019 = rows;
  });
  d3.csv("./public/2021.csv")
  .row(function(d) { return {
    Region : d['Geographic region'],
    Index: +d['Gender Equality Index'],
    Work : +d['Work'],
    Money : +d['Money'],
    Knowledge : +d['Knowledge'],
    Time : +d['Time'],
    Power : +d['Power'],
    Health : +d['Health'],
  }; 
  }).get(function(error, rows) { 
    //saving reference to data
    data2021 = rows;
    
    //load map and initialise the views
    init();

    // data visualization
    visualization();
  });


/*----------------------
INITIALIZE VISUALIZATION
----------------------*/
function init() {

  let width = screen.width;
  let height = screen.height;

  //retrieve an SVG file via d3.request, 
  //the xhr.responseXML property is a document instance
  function responseCallback(xhr) {
    d3.select('#map_div').append(function () {
      return xhr.responseXML.querySelector('svg');
    }).attr('id', 'map')
      .attr('width', width)
      .attr('height', height)
      .attr('x', 0)
      .attr('y', 0);
  };

  //select the root <svg> and append it directly
  d3.request('public/map.svg')
    .mimeType('image/svg+xml')
    .response(responseCallback)
    .get(function (n) {
      let map = d3.select('body').select('#map');
      map.selectAll('path')
        .style('fill', 'rgb(234, 234, 234)')
        .style('stroke','white')
        .style('stroke-width', 2)
        .on('click', function () {
          mapClick(this.id);
        })
        .on('mouseover', function (d) {

          d3.select(this).style('cursor', 'pointer'); 
        }).on("mouseout", function (d) {
          d3.select(this).style('cursor', 'default'); 
       });
    });

  //d3 canvases for svg elements
  textArea = d3.select('#text_div').append('svg')
    .attr('width', d3.select('#text_div').node().clientWidth)
    .attr('height', d3.select('#text_div').node().clientHeight);

  heatMap = d3.select('#heatmap_div').append('svg')
    .attr('width', d3.select('#heatmap_div').node().clientWidth)
    .attr('height', d3.select('#heatmap_div').node().clientHeight);
  
  barChartArea = d3.select('#barchart_div').append('svg')
  .attr('width', d3.select('#barchart_div').node().clientWidth)
  .attr('height', d3.select('#barchart_div').node().clientHeight);


  //initialize chosen year and region
  chosenYear = 0;
  previousChosenRegion = 'European Union';
  chosenRegion = 'European Union';

  //computation of top value in all the data
  topValue = 0;
  topCountry = '';
  for (let index = 0; index < data2013.length; index++) {
    for (var key in data2013[index]) {
      if ((key == 'Index') && (data2013[index].Region != 'European Union')) {
        if (topValue < data2013[index][key]) {
          topValue = data2013[index][key]
          topCountry = data2013[index].Region
        }
      }
    }
  } 

  //computation of bottom value in all the data
  bottomValue = 100;  
  for (let index = 0; index < data2013.length; index++) {
    for (var key in data2013[index]) {
      if ((key == 'Index') && (data2013[index].Region != 'European Union')) {
        if (bottomValue > data2013[index][key]) {
          bottomValue = data2013[index][key]
        }
      }
    }
  } 

  //initialize color scale
  myColorScale = d3.scaleSequential().domain([bottomValue, topValue]).interpolator(d3.interpolatePlasma);

  //add label texts for the barchart
  let yOffset = 30;
  const labels = ['Work', 'Money', 'Knowledge', 'Time', 'Power', 'Health'];

  for(let i = 1; i < labels.length+1; i++)
  {
    barChartArea.append('text')
    .attrs({
      x: 60, 
      y: 20+i*yOffset, 
      class: 'barchart_label'
    })
    .attr('text-anchor', 'end') 
    .style('fill', 'rgb(100, 26, 68)')
    .style('font-size', 30)
    .text(labels[i-1]);
  }

  //add user instructions 
  document.getElementById('region_p').innerHTML = '2. Click a country on the map';
}
   
  
/*----------------------
BEGINNING OF VISUALIZATION
----------------------*/
function visualization() {
  drawTextInfo();
  drawHeatMap();
}


/*----------------------
TEXT INFORMATION
----------------------*/
function drawTextInfo() {

  //get area width/height
  let thisCanvasHeight = textArea.node().clientHeight   
  let thisCanvasWidth = textArea.node().clientWidth    

  //draw headline
  textArea.append('text')
    .attrs({ dx: 20, dy: '3em', class: 'headline' })
    .text('Gender Equality in EU Countries');

  //draw description and source
  textArea.append('text')
    .attrs({ dx: 100, dy: '7.5em', class: 'subline' })
    .text('This data visualization shows the state of gender equality in EU countries.')
  textArea.append('text')
    .attrs({ dx: 100, dy: '8.5em', class: 'subline' })
    .text('Data Source: European Institute for Gender Equality (EIGE).') 
    .on('click', function () { window.open('https://eige.europa.eu/gender-statistics/dgs/indicator/index_data__index_scores'); });;

  //add user instructions
  textArea.append('text')
    .attrs({ dx: 20, dy: '11em', id: 'year_chooser'})
    .text('1. Choose a year:')
  
  //get area width/heigh//set up a gradient variable for linear gradient
  var gradient = textArea.append('linearGradient')
  .attr('id', 'svgGradient')
  .attr('x1', '0%')
  .attr('x2', '100%')

  //append gradient "stops" - control points at varius gardient offsets with specific colors
  gradient.append('stop')
  .attr('offset', '0%') //starting color
  .attr('stop-color', myColorScale(bottomValue));

  gradient.append('stop')
  .attr('offset', '50%') //middle color
  .attr('stop-color',  myColorScale((topValue+bottomValue)/2));

  gradient.append('stop')
  .attr('offset', '100%') //end color
  .attr('stop-color',  myColorScale(topValue));

  //append rectangle with gradient fill  
  textArea.append('rect').attrs({ x: 400, 
          y: thisCanvasHeight -56, 
          width: thisCanvasWidth/3, 
          height: 18, 
          stroke: 'white',
          fill: 'url(#svgGradient)'}) //gradient color fill is set as url to svg gradient element
        .style('stroke-width', 3)

  //add min and max labels         
  textArea.append('text')
        .attrs({x: 400, y: thisCanvasHeight -63, class: 'subline'})
        .text('min');
  textArea.append('text')
        .attrs({x: 675, y: thisCanvasHeight -63, class: 'subline'})
        .attr('text-anchor', 'end')
        .text('max');  
}


/*----------------------
HEAT MAP
----------------------*/
function drawHeatMap(){

  //calculate heatmap row height
  var rowHeight = 200 / 27 //divide by count of EU countries
  
  //define color scale
  var myColorScale = d3.scaleSequential().domain([bottomValue, topValue]).interpolator(d3.interpolatePlasma);
  
  //add year numbers to heatmap
  let xOffset = 50;
  let i = 0;

  for(let year = 2013; year <= 2021; year+=2)
  {
    heatMap.append('text')
    .attrs({
      x: 140 + xOffset*i, 
      y: 10, 
      class: 'subline'
    })
    .attr('id', year.toString())
    .attr('text-anchor', 'end') 
    .style('fill', 'rgb(100, 26, 68)')
    .style('font-size', rowHeight)
    .text(year.toString())
    .on('click', function (event) {
      //remove past selection indicator
      heatMap.selectAll('rect.year_indicator').remove();
      document.getElementById('year_chooser').innerHTML = ''; 
      showMapColours(year);
      //calc where to draw the indicator and create it
      let mouseX = d3.event.pageX;
      let indicatorX = getTheClosest(mouseX, xOffset, 140, i); //i always has the last round's value
      heatMap.append('rect').attrs({
        x: indicatorX - 15, 
        y: 13, 
        width: 7, 
        height: 7, 
        stroke: 'white',
        fill: 'rgb(100, 26, 68)',
        class: 'year_indicator'
      }) 
    })
    .on('mouseover', function (d) {
      d3.select(this).style('font-weight', 'bold');
      d3.select(this).style('cursor', 'pointer'); 
    }).on('mouseout', function (d) {
      d3.select(this).style('font-weight', 'normal');
      d3.select(this).style('cursor', 'default'); 
    });
    i++;
  }

  //add country names to heatmap
  let yOffset = 20;

  for (let index = 0; index < data2013.length; index++) {
    for (var key in data2013[index]) {
      if (data2013[index].Region == 'European Union')
      {
        continue;
      }
      if (key == 'Index') {
        heatMap.append('text')
          .attrs({
            x: 100, 
            y: yOffset + rowHeight + 7.5, 
            class: 'subline'
          })
          .attr('text-anchor', 'end') 
          .style('fill', 'rgb(100, 26, 68)')
          .style('font-size', rowHeight)
          .text(data2013[index].Region);
        }
        yOffset += rowHeight/3
      }
    } 

  //add heatmap color rectangles
  const allData = [data2013, data2015, data2017, data2019, data2021];
  xOffset = 49;
 
  for(let i = 0; i < allData.length; i++)
  {
    yOffset = 20;
    for(let j = 0; j < allData[i].length; j++)
    {
      for (var key in allData[i][j]) {
      if (allData[i][j].Region == 'European Union')
      {
        continue;
      }
      if (key == 'Index') {
        heatMap.append('rect')
          .attrs({
            x: 100 + xOffset*i,
            y: yOffset,
            width: 50,
            height: rowHeight+13,
            fill: myColorScale(allData[i][j][key]) 
          })
        }
        yOffset += rowHeight/3
      }
    }
  }
}
 
     
/*----------------------
COLOR THE MAP BASED ON YEAR SELECTION
----------------------*/
function showMapColours(year)
{
  chosenYear = year;
  document.getElementById('year_p').innerHTML = year.toString(); 

  //choose what data to show depending on the year
  let data = selectData(chosenYear);

  //color the map regions
  for (let index = 0; index < data.length; index++) {
    for (var key in data[index]) {
      if ((key == 'Index') && (data[index].Region != 'European Union')) {
        var color = myColorScale(data[index][key])
        if (data[index][key] == 0) {
          color = 'rgb(234, 234, 234)'
        }
        let region = data[index].Region;
        d3.select('#' + region).style('fill', color)
      }
    }
  } 

  if (chosenRegion != '')
  {
    mapClick(chosenRegion);
  }
}


/*----------------------
MAP CLICK SHOWS FURTHER DATA
----------------------*/
function mapClick(region) {

  if (chosenYear == 0) return;

  //store previous and new selection
  previousChosenRegion = chosenRegion;
  chosenRegion = region;
 
  //remove highlighted outline from previous region
  d3.select('#map').select('#' + previousChosenRegion).style('stroke-width', 2);
  d3.select('#map').select('#' + previousChosenRegion).style('stroke', 'white');
 
  //add highlighted outline to new selected region  
  d3.select('#map').select('#' + chosenRegion).style('stroke-width', 3.7);
  d3.select('#map').select('#' + chosenRegion).style('stroke', 'rgb(154, 210, 165)' );
 
   //move selected region to the top layer of the svg graphics (to avoid problems with overlapping contours)
  d3.select('#map').select('#' + chosenRegion).raise();
  
  document.getElementById('region_p').style.color = 'rgb(109, 34, 76)';

  //clear canvas
  barChartArea.selectAll('rect').remove();
  barChartArea.selectAll('text.indicator').remove();
  barChartArea.selectAll('text.barchart_value').remove();

  //choose what data to show depending on the year
  let data = selectData(chosenYear);

  //find index value from data
  let indexValue;
  for (let index = 0; index < data.length; index++) {
    for (var key in data[index]) {
      if (data[index].Region == 'European Union')
      {
        continue;
      }
      if (key == 'Index' && data[index].Region == region)
      {
        indexValue = data[index][key];
      }
    }
  } 
  
  //show chosen region and gender equality index
  if (region != 'European Union')
  {
    document.getElementById('region_p').innerHTML = region + ': ' + indexValue; 
  }
  
  //max width for individual bar
  let maxWidth = 350;
  let value;
  
  //append rectangle
  barChartArea.append('rect').attrs({ x: 400+20, 
    y: 30, 
    width: 2, 
    height: 170, 
    stroke: 'white',
    fill: 'white'
  }) 

  barChartArea.append('text')
    .attrs({
      x: 428, 
      y: 210, 
      class: 'indicator'
    })
    .attr('text-anchor', 'end') 
    .style('fill', 'rgb(100, 26, 68)')
    .text('100');
    
  //add barchart bars
  let yOffset = 30;
  let fillColor;
  for (let index = 0; index < data.length; index++) {
    for (var key in data[index]) {
      if (data[index].Region == 'European Union')
      {
        continue;
      }
      if(!(key == 'Region' || key == 'Index') && data[index].Region == region)
      {
        value = data[index][key];
        if (value > 72) {
          fillColor = 'rgb(100, 26, 68)';
        }
        else fillColor = 'white';
        barChartArea.append('rect')
          .attrs({
            x: 70,
            y: 11 + yOffset,
            width: value/100 * maxWidth,
            height: 10,
            fill: myColorScale(value), 
          })
          barChartArea.append('text')
          .attrs({
            x: 75, 
            y: 20 + yOffset, 
            class: 'barchart_value'
          })
          .attr('text-anchor', 'start') 
          .style('fill', fillColor)
          .style('font-size', 26)
          .text(value.toString());
          yOffset += 30;
        }
    }
  } 
}


function selectData(year)
{
  let data;
  switch(year) {
    case 2013:
      data = data2013;
      break;
    case 2015:
      data = data2015;
      break;
    case 2017:
      data = data2017;
      break;
    case 2019:
      data = data2019;
      break;
    case 2021:
      data = data2021;
  }
  return data;
}


function getTheClosest(mouseXValue, xOffset, baseValue, count)
{
    let smallestDiff = 1000;
    let closestValue;
    for(let i = 0; i < count; i++)
    {
      let value = baseValue + xOffset * i;
      let diff = Math.abs(value - mouseXValue);
      if (diff < smallestDiff)
      {
        smallestDiff = diff;
        closestValue = value;
      }
    }
    console.log(closestValue);
    return closestValue;
}

