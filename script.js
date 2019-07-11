//console.log(_dataset[0].datetime);


dataset.then(function(data){
  //callbackfunc is now here.....
  var json_data=data;
  d3.select('#chartbox').html(null);
  var svg = d3.select('#chartbox').append('svg');
  var radius =1.6;
  var stDate= new Date('2012-12-01 00:00:00');
  var enDate=new Date('2013-02-21 00:00:00');
  var margin = {top: 20, right: 30, bottom: 30, left: 40};
  d3.select('#dateRange').html(stDate.toDateString() +' - ' +enDate.toDateString());
  var hisvg = d3.select('#chart').append('svg');
  //global var Declarations
  var xMin;var xMax;var yMin;var yMax;var x;var y;var x1;var y1;
  const height=400;  const width=400;
  var prSpan=[];  var hmSpan=[];  var prDay=[];
  var hmDay=[];  var sumprD,sumhmD;  var avgPr=[]; var avgHm=[];
  var hisData=[]; var tempData=[]; var maxTmp=[];
  var winData=[];var wd=[];
  var scaleY;var scaleX ; var scaleCol;
  var wspd=0;


  function getlineData(){
    for(i=0;i<json_data.length;i++){
      if(json_data[i][3]!=0){
        var tmp=[json_data[i][0],json_data[i][3]];
        tempData.push(tmp);
      }
    }
    for(i=0;i<tempData.length;i++){
        var tmp=tempData[i][1];
        maxTmp.push(tmp);
    }
    let maxTemp=d3.max(maxTmp);
    let minTemp=d3.min(maxTmp);
    var tempScaleY= d3.scaleLinear()
      .domain([minTemp,maxTemp])
      .range([height-margin.bottom, margin.top]);
      console.log(tempData)
    var tempScaleX=d3.scaleTime()
      .domain([tempData[0][0], tempData[tempData.length-1][0]])
      .range([margin.left, width*2-margin.right]);
      console.log(tempScaleY(tempData[15][1]));
      var line = d3.line()
      .x(function(d, i) { return tempScaleX(tempData[i][0]); }) // set the x values for the line generator
      .y(function(d,i) { return tempScaleY(tempData[i][1]); }) // set the y values for the line generator 
      .curve(d3.curveMonotoneX); // apply smoothing to the line
    var lsvg = d3.select('#lchart')
      .append('svg')
      .attr("width", width*2 + margin.left + margin.right)
      .attr("height", height +margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    lsvg.append("path")
      .data([tempData])
      .attr("class", "line")
      .attr("d", line);
    lsvg.append("g")
    .attr("class", "x axis")
    .call(d3.axisBottom(tempScaleX).tickFormat(d3.timeFormat("%Y-%m-%d")))
    .attr("transform", "translate(0," + (height-margin.bottom) + ")")
    .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    console.log(maxTemp);
    console.log(minTemp);
    lsvg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + margin.left+ ", 0)")
    .call(d3.axisLeft(tempScaleY));
  }
  getlineData();

  function getHistData(){
    for(i=0;i<json_data.length;i++){
      var tmp=[json_data[i][4],json_data[i][5]];
      hisData.push(tmp);
    }
    for(j=0;j<18;j++){
      var tmp = [];
      for(i=0;i<hisData.length;i++){
        if(hisData[i][1]==j){
          //console.log(j, hisData[i][1])
          tmp.push(hisData[i][0]);
        }
      }
      winData.push(tmp);
    }
  }
  getHistData();
  function recMouseHover(d, i) {
    var rec=this;
    d3.select(this).transition()
      .duration(800).attr('stroke', "black");
      d3.select('#t-'+i).attr('fill', "black");
  }
  function recMouseOut(d, i) {
    var rec=this;
    d3.select(this).transition()
      .duration(800).attr('stroke', '');
      d3.select('#t-'+i).attr('fill', "silver");
  }
  function drawHist(){
    updateHist();
    for(i=0;i<wd.length;i++){
      hisvg.append('rect')
        .attr('class', 'rects')
        .attr("id", "r-" + i)
        .attr("x",  margin.left+(i*(width-margin.left-margin.right)/wd.length))
        .attr('y', height-margin.bottom)
        .attr('height', 0)
        .transition()
        .duration(1000)
        .attr("y",scaleY(wd[i].count+1))
        .attr('width', ((width-margin.left-margin.right)/wd.length)-1)
        .attr('height', (height-margin.bottom)-scaleY(wd[i].count+1))
        .attr('fill', scaleCol(wd[i].count+1))
        .attr("rx", "3")
        .attr('ry', "3")
      hisvg.append('text')
        .attr('class', 'histext')
        .attr('id', "t-" + i)
        .attr("y", scaleY(wd[i].count+1)-10)
        .attr("x",margin.left+6.7+(i*(width-margin.left-margin.right)/wd.length))
        .attr('fill', 'silver')
        .attr('font-size', '10')
        .style("text-anchor", "middle")
        .text(wd[i].count);             
    }
    d3.selectAll('.rects').on('mouseover', recMouseHover)
    .on('mouseout', recMouseOut); 
  };
  function updateHist(){
    d3.select('#actWindSpd').attr('value', wspd+' m/s')
    while(wd.length){
      wd.pop();
    }
    var count = (search, arr) => arr.filter(x => x == search).length;
    wd.push({'name': 'mist','count': count('mist', winData[wspd])});
    wd.push({'name': 'sky is clear', "count" : count('sky is clear', winData[wspd])});
    wd.push({'name': 'fog', 'count': count('fog', winData[wspd])});
    wd.push({'name': 'haze', 'count':  count('haze', winData[wspd])});
    wd.push({'name': 'few clouds', 'count' : count('few clouds', winData[wspd])});
    wd.push({'name': 'overcast clouds', 'count':  count('overcast clouds', winData[wspd])});
    wd.push({'name': 'scattered clouds', 'count': count('scattered clouds', winData[wspd])});
    wd.push({'name': 'broken clouds', 'count':count('broken clouds', winData[wspd])});
    wd.push({'name': 'light rain', 'count': count('light rain', winData[wspd])});
    wd.push({'name': 'thunderstorm with rain', 'count' : count('thunderstorm with rain', winData[wspd])});
    wd.push({'name': 'moderate rain', 'count':count('moderate rain', winData[wspd])});
    wd.push({'name': 'thunderstorm', 'count': count('thunderstorm', winData[wspd])});
    wd.push({'name': 'shower rain', 'count': count('shower rain', winData[wspd])});
    wd.push({'name': 'smoke', 'count': count('smoke', winData[wspd])});
    wd.push({'name': 'drizzle', 'count': count('drizzle', winData[wspd])});
    wd.push({'name': 'light intensity shower rain', 'count':count('light intensity shower rain', winData[wspd])});
    wd.push({'name': 'very heavy rain', 'count': count('very heavy rain', winData[wspd])});
    wd.push({'name': 'thunderstorm with light rain', 'count' : count('thunderstorm with light rain', winData[wspd])});
    wd.push({'name': 'proximity thunderstorm', 'count': count('proximit thunderstorm', winData[wspd])});
    wd.push({'name': 'thunderstorm with heavy rain', 'count':count('thunderstorm with heavy rain', winData[wspd])});
    wd.push({'name': 'squalls', 'count': count('squalls', winData[wspd])});
    wd.push({'name': 'dust', 'count': count('dust', winData[wspd])});
    wd.push({'name': 'proximity shower rain', 'count': count('proximity shower rain', winData[wspd])});
    wd.push({'name': 'light intensity drizzle', 'count': count('light intensity drizzle', winData[wspd])});
    wd.push({'name': 'heavy intensity rain', 'count': count('heavy intensity rain', winData[wspd])});
    var tmp=[];

    for(i=0;i<wd.length;i++){
      console.log(wd[i].count);
      tmp.push(+wd[i].count);
    }
    console.log(tmp);
    var maxCnt= d3.max(tmp);
    var minCnt= d3.min(tmp);
    console.log(maxCnt, minCnt);
    var ticks=[];
    for(i=0;i<wd.length;i++){
      ticks.push(wd[i].name);
    }
    scaleY = d3.scaleLog()
      .base(2)
      .domain([1, maxCnt+1])
      .range([height-margin.bottom, margin.top+20]);
    scaleCol=d3.scaleLog()
      .domain([minCnt+1, maxCnt+1])
      .range([d3.color('lightblue'), d3.color('steelblue')]);
    scaleX= d3.scaleBand()
      .domain(ticks)     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([margin.left, width-margin.right]);
    hisvg.append("g")
      .attr("transform", "translate(0," + (height-margin.bottom) + ")")
      .call(d3.axisBottom(scaleX))
      .selectAll("text")	
      .style("text-anchor", "end")
      .attr('font-size', '10')
      .attr("dx", "-.8em")
      .attr("dy", ".12em")
      .attr("transform", function(d) {
          return "rotate(-60)" 
          });
    hisvg.attr("viewBox", [0, 0, width, height+95]);

for(i=0;i<wd.length;i++){


      d3.select('#r-'+i)
      //.attr('y', height-margin.bottom)
      //.attr('height', 0)
        .transition()
        .duration(1000)
        .attr("y",scaleY(wd[i].count+1))
        .attr('width', ((width-margin.left-margin.right)/wd.length)-1)
        .attr('height', (height-margin.bottom)-scaleY(wd[i].count+1))
        .attr('fill', scaleCol(wd[i].count+1));
        d3.select('#t-'+i)
        .transition()
        .duration(1000)
        .attr("y", scaleY(wd[i].count+1)-10)
        .attr("x",margin.left+6.7+(i*(width-margin.left-margin.right)/wd.length))
        .text(wd[i].count);

      }
      }
  
  function setNextSpd(){
  //  d3.selectAll('.rects').remove();
  //  d3.selectAll('.histext').remove();
    if(wspd<17){
      wspd=wspd+1;
      console.log(wspd);
      updateHist();
    }else{
      alert("dont't exeed 17 m/s");
    }
  } 
  function setPrevSpd(){
  //  d3.selectAll('.rects').remove();
  //  d3.selectAll('.histext').remove();
    if(wspd>0){
      wspd=wspd-1;
      updateHist();
    }else{
      alert('no negative input');
    }
  }
  function getScatData(){
    //console.log('getData');
    let a = json_data.findIndex(function(el) { return el[0].toString()==(stDate.toString())});
    let b= json_data.findIndex( function(el) { return el[0].toString()==(enDate.toString())});
    // console.log('from: ' + a+' to '  + b)
    prSpan=[];
    hmSpan=[];
    if(a>0 && a<json_data.length && b>0 &&b<json_data.length){
      for(i = a; i <= b; i++){
        if(json_data[i][2]!=0){
          prSpan.push(json_data[i][2]);
          hmSpan.push(json_data[i][1]);
        }
        
      }
      avgPr=[];
      avgHm=[];
      for (i = 0;i<=b-a ;i+=24) {
        prDay=prSpan.slice(i,i+24);   
        hmDay=hmSpan.slice(i,i+24);
        sumprD=0;
        sumhmD=0;
        for(j=0;j<prDay.length;j++){
          sumprD= sumprD + prDay[j];
          sumhmD= sumhmD + hmDay[j];
        }
        if(sumprD>0){
          avgPr.push(sumprD/prDay.length);
          avgHm.push(sumhmD/prDay.length);
        }
      }
      xMin=0; xMax=100;
      yMax= Math.max(...avgPr);yMin= Math.min(...avgPr);
    }else{
      alert("DateRange "+stDate.toDateString() +' - ' +enDate.toDateString()+" is invalid");
    }
    scale();
    drawData();
  }

  function scale(){
    console.log("scale");
    svg.attr("viewBox", [0, 0, width, height]);
    //x= humidity %
    x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left,width-margin.right]);
    // y= pressure mbar
    y = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height-margin.top,margin.bottom]);
    x1=d3.scaleLinear()
      .domain([margin.left,width-margin.right])
      .range([xMin, xMax]);
    y1 = d3.scaleLinear()
      .domain([height-margin.top,margin.bottom])
      .range([yMin, yMax]);

    yAxis = d3.axisLeft(y);
    xAxis = d3.axisBottom(x);
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
  } 
  function handleMouseOver(d, i) {  // Add interactivity
    // Use D3 to select element, change color and size
    var circle = this;
    d3.selectAll('.circles').transition().duration(800).attr('fill-opacity', 0.3);
    d3.select(this).transition()
      .duration(800).attr('fill', "red").attr('fill-opacity', 1).attr('r', radius*2);
    // console.log("t" + circle.cx.baseVal.valueAsString+ "-" + circle.cy.baseVal.valueAsString+ "-" + i);
    // Specify where to put label of text
    svg.append("rect")
      .attr("id", "r" + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .attr("x",  circle.cx.baseVal.value+4 )
      .attr("y", circle.cy.baseVal.value-6)
      .attr('width', '120')
      .attr('height', '14')
      .attr('fill', 'white')
    
    svg.append("text")
      .attr("id", "t" + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .attr("x",  circle.cx.baseVal.value + 5)
      .attr("y", circle.cy.baseVal.value+5)
      .attr('fill', 'black')
      .attr('font-size', '12')
      .text(function() {
        return x1(circle.cx.baseVal.value).toFixed(2) +'%, ' + y1(circle.cy.baseVal.value).toFixed(2)+ 'mbar';  // Value of the text
      });
  }
  function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    
    d3.selectAll('.circles').transition()
    .duration(200).attr('r', radius).attr('fill-opacity', 1);
      var circle=this;
      // Select text & rect by id and then remove
    document.getElementById('t' + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .remove();   
    document.getElementById('r' + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .remove();  
  }
  function setNextDate(){
    console.log('setNext');
    stDate.setMonth(stDate.getMonth()+3);
    enDate.setMonth(enDate.getMonth()+3);
    d3.selectAll('.circles').remove();
    d3.select('svg').selectAll('g').remove();
    getScatData();
    scale();
    drawData();
    d3.select('#dateRange').html(stDate.toDateString() +' - ' +enDate.toDateString());
  }
  function setPrevDate(){
    console.log('setPrev');
    stDate.setMonth(stDate.getMonth()-3);
    enDate.setMonth(enDate.getMonth()-3);
    d3.selectAll('.circles').remove();
    d3.select('svg').selectAll('g').remove();
    getScatData();
    scale();
    drawData();
    d3.select('#dateRange').html(stDate.toDateString() +' - '+enDate.toDateString());
  }
  d3.select('#drawData').on('click', getScatData);
  d3.select('#prevData').on('click', setPrevDate);
  d3.select('#nextData').on('click', setNextDate);
  d3.select('#prevWindSpd').on('click', setPrevSpd);
  d3.select('#nextWindSpd').on('click', setNextSpd);
  function drawData(){
    var myColor = d3.scaleLinear().domain([yMin,yMax])
      .range(["blue", "red"])
    for(i=0;i<=avgHm.length-1;i++){
    svg.append("circle")
      .attr('class', 'circles')
      .attr('id', 'c-'+i)
      .attr("cx",x(avgHm[i]))
      .attr("cy",y(avgPr[i]))
      .attr("r",radius)
      .style("fill", myColor(avgPr[i]));
     
    }
    d3.selectAll('.circles').on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);
  }
  drawData();
  drawHist();
});