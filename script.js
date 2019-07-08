d3.select('#chartbox').html(null);
var radius =1;
var stDate=new Date(2012,11 ,00 ,00 ,00 ,00);
var enDate=new Date(2013,1 ,28 ,00 ,00 ,00);
d3.select('#dateRange').html(stDate +' - ' +enDate);


dataset.then(function(data){
//calllbackfunc is now here.....

});
/*
var csv_data=[];
d3.csv("./LosAngeles.csv").then(function(data){
  data.forEach(function(d){
  d.datetime  = Date.parse(d.datetime,"Y-m-d g:i a");
  d.humidity= +d.humidity;
  d.pressure= +d.pressure;
  d.temperature= +d.temperature;
  d.wind_speed = +d.wind_speed;
  csv_data.push(d);
  })
  }
  );
  console.log(csv_data[0]);
*/



function setNextDate(){
  stDate.setMonth(stDate.getMonth()+3);
  enDate.setMonth(enDate.getMonth()+3);
  d3.selectAll('.circles').remove();
  drawData();
  d3.select('#dateRange').html(stDate +' - ' +enDate);
}
function setPrevDate(){
  stDate.setMonth(stDate.getMonth()-3);
  enDate.setMonth(enDate.getMonth()-3);
  d3.selectAll('.circles').remove();
  drawData();
  d3.select('#dateRange').html(stDate +' - ' +enDate);
}
    function drawData(){
      var csv_data = [];
      d3.csv("./LosAngeles.csv")
      .then(function(data){
        data.forEach(function(d){
          d.datetime=new Date(d.datetime);
          if(d.datetime >= stDate && d.datetime<=enDate){
            d.humidity= +d.humidity;
            d.pressure= +d.pressure;
            d.temperature= +d.temperature;
            d.wind_speed = +d.wind_speed;
            csv_data.push(d);
            svg.append("circle")
              .attr('class', 'circles')
              .attr("cx",x(d.humidity))
              .attr("cy",y(d.pressure))
              .attr("r","1")
              .on('mouseover', handleMouseOver)
              .on('mouseout', handleMouseOut);
          }
        })
        console.log(csv_data);        
      });
    }

const height=400;
const width=400;

var svg = d3.select('#chartbox').append('svg');
svg.attr("viewBox", [0, 0, width, height]);;

var margin = {top: 20, right: 30, bottom: 30, left: 40};

var xMin=0;var xMax=100;
var yMax= 1050; var yMin= 880;

//x= humidity %
var x = d3.scaleLinear()
  .domain([xMin, xMax])
  .range([margin.left,width-margin.right]);
// y= pressure mbar
var y = d3.scaleLinear()
  .domain([yMin, yMax])
  .range([height-margin.top,margin.bottom]);
yAxis = d3.axisLeft(y);
xAxis =d3.axisBottom(x);
ytrans = (width+margin.left-margin.right)/2;
xtrans = (height+margin.top-margin.bottom)/2;
svg.append('g')
  .attr("transform", 'translate('+ ytrans +', 0)')
  .attr('color', 'silver').call(yAxis);
svg.append('g')
  .attr("transform", 'translate(0, '+ xtrans +')')
  .attr('color', 'silver').call(xAxis);
svg.append('text')
  .attr("y", margin.top)
  .attr("x",width/2)
  .attr('fill', 'silver')
  .style("text-anchor", "middle")
  .text("Pressure");      
svg.append('text')
  .attr("y", height/2-10)
  .attr("x",50)
  .attr('fill', 'silver')
  .style("text-anchor", "middle")
  .text("Humidity");      
/*svg.selectAll('circle').on('mouseover', handleMouseOver);
svg.selectAll('circle').on('mouseout', handleMouseOut);
*/
var x1 = d3.scaleLinear().domain([margin.left,width-margin.right]).range([xMin, xMax]);
var y1 = d3.scaleLinear().domain([height-margin.top,margin.bottom]).range([yMin, yMax]);

function handleMouseOver(d, i) {  // Add interactivity
  // Use D3 to select element, change color and size
  var circle = this;
  d3.select(this).attr('fill', "red").attr('r', radius*2);
 // console.log("t" + circle.cx.baseVal.valueAsString+ "-" + circle.cy.baseVal.valueAsString+ "-" + i);
  // Specify where to put label of text
  svg.append("text")
  .attr("id", "t" + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
  .attr("x",  circle.cx.baseVal.value + 5)
  .attr("y", circle.cy.baseVal.value+5)
  .attr('fill', 'red')
  .text(function() {
    return [x1(circle.cx.baseVal.value).toFixed(2), y1(circle.cy.baseVal.value).toFixed(2)];  // Value of the text
  });
}
function handleMouseOut(d, i) {
  // Use D3 to select element, change color back to normal
  d3.select(this).attr('fill',  "black").attr('r', radius);
  var circle=this;

  // Select text by id and then remove
  document.getElementById('t' + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
  .remove(); 

}
