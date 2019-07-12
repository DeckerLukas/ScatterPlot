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
  var lsvg=d3.select('#lchart').append('svg');
  //global var Declarations
  var xMin;var xMax;var yMin;var yMax;var x;var y;var x1;var y1;
  const height=400;  const width=400;
  var prSpan=[];  var hmSpan=[];  var prDay=[];
  var hmDay=[];  var sumprD,sumhmD;  var avgPr=[]; var avgHm=[];
  var hisData=[]; var tempData=[]; var maxTmp=[];
  var winData=[];var wd=[]; var keys;
  var scaleY;var scaleX ; var scaleCol;
  var wspd=0; var line = d3.line(); var tempScaleX; var tempScaleY; var txAxis; var tyAxis;
  var winArr=[]; var z = d3.scaleOrdinal();


  function getlineData(){
    updateline();
    lsvg.attr("width", width*2 + margin.left + margin.right)
      .attr("height", height+60 +margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    lsvg.append("path")
      .data([tempData])
      .attr("class", "line")
      .attr("d", line);
    lsvg.append("g")
    .attr("id", "x-axis")
    .call(txAxis)
    .attr("transform", "translate(0," + (height-margin.bottom) + ")")
    .selectAll("text")	
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    lsvg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + margin.left+ ", 0)")
    .call(tyAxis);
  }
  getlineData();
  function updateline(){
    while(tempData.length){
      tempData.pop();
    }
    for(i=0;i<json_data.length;i++){
      if(json_data[i][3]!=0 && json_data[i][0]>=stDate && json_data[i][0]<=enDate){
        var tmp=[json_data[i][0],json_data[i][3]];
        tempData.push(tmp);
      }
    }
    while(maxTmp.length){
      maxTmp.pop();
    }
    for(i=0;i<tempData.length;i++){
        var tmp=tempData[i][1];
        maxTmp.push(tmp);
    }
    let maxTemp=d3.max(maxTmp);
    let minTemp=d3.min(maxTmp);
    tempScaleY= d3.scaleLinear()
      .domain([minTemp,maxTemp])
      .range([height-margin.bottom, margin.top]);
    tempScaleX=d3.scaleTime()
      .domain([tempData[0][0], tempData[tempData.length-1][0]])
      .range([margin.left, width*2-margin.right]);
    line.x(function(d, i) { return tempScaleX(tempData[i][0]); }) // set the x values for the line generator
      .y(function(d,i) { return tempScaleY(tempData[i][1]); }) // set the y values for the line generator 
      .curve(d3.curveMonotoneX); // apply smoothing to the line
    d3.select('.line').attr('d', line);
    txAxis = d3.axisBottom(tempScaleX).tickFormat(d3.timeFormat("%Y-%m-%d"));
    tyAxis = d3.axisLeft(tempScaleY);
    d3.select('#x-axis').call(txAxis).selectAll("text")	
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");;
    d3.select('#y-axis').call(tyAxis);
    }

    ///HISTOGRAM
  function getHistData(){
    while(hisData.length){
      hisData.pop();
    }
    for(i=0;i<json_data.length;i++){
      if(json_data[i][0]>=stDate && json_data[i][0]<=enDate){
        
        var tmp=[json_data[i][4],json_data[i][5]];
        hisData.push(tmp);
      }
    }
    while(winData.length){
      winData.pop();
    }
    for(j=0;j<6;j++){
      var tmp = [];
      for(i=0;i<hisData.length;i++){
        if(j<3){
          if(hisData[i][1]==j){
            tmp.push(hisData[i][0]);
          }
        }else if(j==3){
          if(hisData[i][1]>=3&&hisData[i][1]<=5){
            tmp.push(hisData[i][0]);
          }
        }else if(j==4){
          if(hisData[i][1]>=6&&hisData[i][1]<=10){
            tmp.push(hisData[i][0]);
          }
        }else if(j==5){
          if(hisData[i][1]>=11&&hisData[i][1]<=17){
            tmp.push(hisData[i][0]);
          }
        }
      }
      winData.push(tmp);
    }
   
  }
  getHistData();
  function recMouseHover(d, i) {
    var rec=this;
    console.log(rec)
    d3.select(this).attr('stroke', "black");
    hisvg.append("rect")
    .attr("id", "rec_" +  i)
    .attr("x",  rec.x.baseVal.value+15 )
    .attr("y", rec.y.baseVal.value-8)
    .attr('width', '20')
    .attr('height', '14')
    .attr('fill', 'white');
  
  hisvg.append("text")
    .attr("id", "tex_" +  i)
    .attr("x",  rec.x.baseVal.value + 15)
    .attr("y", rec.y.baseVal.value+5)
    .attr('fill', 'black')
    .attr('font-size', '12')
    .text(function() {
      return d[1]-d[0];  // Value of the text
    });
      console.log(d[1]-d[0]);
  }
  function recMouseOut(d, i) {
    var rec=this;
    d3.select(this).transition()
      .duration(800).attr('stroke', '');
      d3.select('#rec_'+i).remove();
      d3.select('#tex_' +  i).remove();
  }
  function drawHist(){
    updateHist();

    hisvg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", d => z(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr('class', 'rects')
      .attr("x", (d, i) => scaleX(d.data.name))
      .attr("y", d => scaleY(d[1]+1))
      .attr("height", d => scaleY(d[0]+1) - scaleY(d[1]+1))
      .attr("width", scaleX.bandwidth());   
      var legend = hisvg.append("g").append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - margin.right-40)
      .attr("width", 50)
      .attr("height", 18)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
      //  hisvg.append('rect')
      //   .attr('class', 'rects')
      //   .attr("id", "r-" +j+'-' +i)
      //   .attr("x",  margin.left+(i*(width-margin.left-margin.right)/winArr[j].length))
      //   .attr('y', height-margin.bottom)
      //   .attr('height', 0)
        
      //   .attr("y",scaleY(winArr[j][i].count+1))
      //   .attr('w, idth', ((width-margin.left-margin.right)/winArr[j].length)-1)
      //   .attr('height', (height-margin.bottom)-scaleY(winArr[j][i].count+1))
      //   .attr('fill', z(j))
      //   .attr("rx", "3")
      //   .attr('ry', "3");
    
      // hisvg.append('text')
      //   .attr('class', 'histext')
      //   .attr('id', "t-" + i)
      //   .attr("y", scaleY(wd[i].count+1)-10)
      //   .attr("x",margin.left+6.7+(i*(width-margin.left-margin.right)/wd.length))
      //   .attr('fill', 'silver')
      //   .attr('font-size', '10')
      //   .style("text-anchor", "middle")
      //   .text(wd[i].count);             
    
    
    d3.selectAll('.rects').on('mouseover', recMouseHover)
    .on('mouseout', recMouseOut); 
  };

  function updateHist(){
    d3.select('#actWindSpd').attr('value', wspd+' m/s')
    while(winArr.length){
      winArr.pop();
    }
   
      wd=[];
      var count = (search, arr) => arr.filter(x => x == search).length;
      wd.push({'name': 'sky is clear', "0m/s": count('sky is clear', winData[0]), '1m/s':count('sky is clear', winData[1]), '2m/s' : count('sky is clear', winData[2]), '3-5m/s': count('sky is clear', winData[3]), '6-10m/s': count('sky is clear', winData[4]), '11-17m/s':count('sky is clear', winData[5])});
      wd.push({'name': 'mist','0m/s': count('mist', winData[0]), '1m/s':count('mist', winData[1]), '2m/s' : count('mist', winData[2]), '3-5m/s': count('mist', winData[3]), '6-10m/s': count('mist', winData[4]), '11-17m/s':count('mist', winData[5])}); 
      wd.push({'name': 'fog', '0m/s': count('fog', winData[0]), '1m/s':count('fog', winData[1]), '2m/s' : count('fog', winData[2]), '3-5m/s': count('fog', winData[3]), '6-10m/s': count('fog', winData[4]), '11-17m/s':count('fog', winData[5])}); 
      wd.push({'name': 'haze', '0m/s': count('haze', winData[0]), '1m/s':count('haze', winData[1]), '2m/s' : count('haze', winData[2]), '3-5m/s': count('haze', winData[3]), '6-10m/s': count('haze', winData[4]), '11-17m/s':count('haze', winData[5])}); 
      wd.push({'name': 'few clouds', '0m/s': count('few clouds', winData[0]), '1m/s':count('few clouds', winData[1]), '2m/s' : count('few clouds', winData[2]), '3-5m/s': count('few clouds', winData[3]), '6-10m/s': count('few clouds', winData[4]), '11-17m/s':count('few clouds', winData[5])});
      wd.push({'name': 'overcast clouds', '0m/s': count('overcast clouds', winData[0]), '1m/s':count('overcast clouds', winData[1]), '2m/s' : count('overcast clouds', winData[2]), '3-5m/s': count('overcast clouds', winData[3]), '6-10m/s': count('overcast clouds', winData[4]), '11-17m/s':count('overcast clouds', winData[5])});
      wd.push({'name': 'scattered clouds','0m/s': count('scattered clouds', winData[0]), '1m/s':count('scattered clouds', winData[1]), '2m/s' : count('scattered clouds', winData[2]), '3-5m/s': count('scattered clouds', winData[3]), '6-10m/s': count('scattered clouds', winData[4]), '11-17m/s':count('scattered clouds', winData[5])});
      wd.push({'name': 'broken clouds', '0m/s': count('broken clouds', winData[0]), '1m/s':count('broken clouds', winData[1]), '2m/s' : count('broken clouds', winData[2]), '3-5m/s': count('broken clouds', winData[3]), '6-10m/s': count('broken clouds', winData[4]), '11-17m/s':count('broken clouds', winData[5])});
      wd.push({'name': 'light rain', '0m/s': count('light rain', winData[0]), '1m/s':count('light rain', winData[1]), '2m/s' : count('light rain', winData[2]), '3-5m/s': count('light rain', winData[3]), '6-10m/s': count('light rain', winData[4]), '11-17m/s':count('light rain', winData[5])});
      wd.push({'name': 'thunderstorm with rain',  '0m/s': count('thunderstorm with rain', winData[0]), '1m/s':count('thunderstorm with rain', winData[1]), '2m/s' : count('thunderstorm with rain', winData[2]), '3-5m/s': count('thunderstorm with rain', winData[3]), '6-10m/s': count('thunderstorm with rain', winData[4]), '11-17m/s':count('thunderstorm with rain', winData[5])});
      wd.push({'name': 'moderate rain','0m/s': count('moderate rain', winData[0]), '1m/s':count('moderate rain', winData[1]), '2m/s' : count('moderate rain', winData[2]), '3-5m/s': count('moderate rain', winData[3]), '6-10m/s': count('moderate rain', winData[4]), '11-17m/s':count('moderate rain', winData[5])});
      wd.push({'name': 'thunderstorm', '0m/s': count('thunderstorm', winData[0]), '1m/s':count('thunderstorm', winData[1]), '2m/s' : count('thunderstorm', winData[2]), '3-5m/s': count('thunderstorm', winData[3]), '6-10m/s': count('thunderstorm', winData[4]), '11-17m/s':count('thunderstorm', winData[5])});
      wd.push({'name': 'shower rain','0m/s': count('shower rain', winData[0]), '1m/s':count('shower rain', winData[1]), '2m/s' : count('shower rain', winData[2]), '3-5m/s': count('shower rain', winData[3]), '6-10m/s': count('shower rain', winData[4]), '11-17m/s':count('shower rain', winData[5])});
      wd.push({'name': 'smoke','0m/s': count('smoke', winData[0]), '1m/s':count('smoke', winData[1]), '2m/s' : count('smoke', winData[2]), '3-5m/s': count('smoke', winData[3]), '6-10m/s': count('smoke', winData[4]), '11-17m/s':count('smoke', winData[5])}); 
      wd.push({'name': 'drizzle', '0m/s': count('drizzle', winData[0]), '1m/s':count('drizzle', winData[1]), '2m/s' : count('drizzle', winData[2]), '3-5m/s': count('drizzle', winData[3]), '6-10m/s': count('drizzle', winData[4]), '11-17m/s':count('drizzle', winData[5])}); 
      wd.push({'name': 'light intensity shower rain',  '0m/s': count('light intensity shower rain', winData[0]), '1m/s':count('light intensity shower rain', winData[1]), '2m/s' : count('light intensity shower rain', winData[2]), '3-5m/s': count('light intensity shower rain', winData[3]), '6-10m/s': count('light intensity shower rain', winData[4]), '11-17m/s':count('light intensity shower rain', winData[5])}); 
      wd.push({'name': 'very heavy rain', '0m/s': count('very heavy rain', winData[0]), '1m/s':count('very heavy rain', winData[1]), '2m/s' : count('very heavy rain', winData[2]), '3-5m/s': count('very heavy rain', winData[3]), '6-10m/s': count('very heavy rain', winData[4]), '11-17m/s':count('very heavy rain', winData[5])}); 
      wd.push({'name': 'thunderstorm with light rain', '0m/s': count('thunderstorm with light rain', winData[0]), '1m/s':count('thunderstorm with light rain', winData[1]), '2m/s' : count('thunderstorm with light rain', winData[2]), '3-5m/s': count('thunderstorm with light rain', winData[3]), '6-10m/s': count('thunderstorm with light rain', winData[4]), '11-17m/s':count('thunderstorm with light rain', winData[5])}); 
      wd.push({'name': 'proximity thunderstorm',  '0m/s': count('proximity thunderstorm', winData[0]), '1m/s':count('proximity thunderstorm', winData[1]), '2m/s' : count('proximity thunderstorm', winData[2]), '3-5m/s': count('proximity thunderstorm', winData[3]), '6-10m/s': count('proximity thunderstorm', winData[4]), '11-17m/s':count('proximity thunderstorm', winData[5])}); 
      wd.push({'name': 'thunderstorm with heavy rain','0m/s': count('thunderstorm with heavy rain', winData[0]), '1m/s':count('thunderstorm with heavy rain', winData[1]), '2m/s' : count('thunderstorm with heavy rain', winData[2]), '3-5m/s': count('thunderstorm with heavy rain', winData[3]), '6-10m/s': count('thunderstorm with heavy rain', winData[4]), '11-17m/s':count('thunderstorm with heavy rain', winData[5])}); 
      wd.push({'name': 'squalls', '0m/s': count('squalls', winData[0]), '1m/s':count('squalls', winData[1]), '2m/s' : count('squalls', winData[2]), '3-5m/s': count('squalls', winData[3]), '6-10m/s': count('squalls', winData[4]), '11-17m/s':count('squalls', winData[5])}); 
      wd.push({'name': 'dust', '0m/s': count('dust', winData[0]), '1m/s':count('dust', winData[1]), '2m/s' : count('dust', winData[2]), '3-5m/s': count('dust', winData[3]), '6-10m/s': count('dust', winData[4]), '11-17m/s':count('dust', winData[5])}); 
      wd.push({'name': 'proximity shower rain', '0m/s': count('proximity shower rain', winData[0]), '1m/s':count('proximity shower rain', winData[1]), '2m/s' : count('proximity shower rain', winData[2]), '3-5m/s': count('proximity shower rain', winData[3]), '6-10m/s': count('proximity shower rain', winData[4]), '11-17m/s':count('proximity shower rain', winData[5])}); 
      wd.push({'name': 'light intensity drizzle', '0m/s': count('light intensity drizzle', winData[0]), '1m/s':count('light intensity drizzle', winData[1]), '2m/s' : count('light intensity drizzle', winData[2]), '3-5m/s': count('light intensity drizzle', winData[3]), '6-10m/s': count('light intensity drizzle', winData[4]), '11-17m/s':count('light intensity drizzle', winData[5])}); 
      wd.push({'name': 'heavy intensity rain', '0m/s': count('heavy intensity rain', winData[0]), '1m/s':count('heavy intensity rain', winData[1]), '2m/s' : count('heavy intensity rain', winData[2]), '3-5m/s': count('dust', winData[3]), '6-10m/s': count('heavy intensity rain', winData[4]), '11-17m/s':count('heavy intensity rain', winData[5])}); 
      
    var tmp=[];
    console.log(wd);
    var maxCnt=0;
      for(i=0;i<wd.length;i++){
            tmp.push(wd[i]['0m/s']+wd[i]['1m/s']+wd[i]['2m/s']+wd[i]['3-5m/s']+wd[i]['6-10m/s']+wd[i]['11-17m/s']);
      }
      let cnt = d3.max(tmp);
     maxCnt = maxCnt + cnt;
  
    var minCnt= d3.min(tmp);
    console.log(maxCnt, minCnt);
    var ticks=[];
    for(i=0;i<wd.length;i++){
      ticks.push(wd[i].name);
    }
    scaleY = d3.scaleLinear()
      .domain([1, maxCnt])
      .range([height-margin.bottom, margin.top+20]);
    z.range(["#3288bd", "#99d594", "#e6f598", "#fee08b", "#fc8d59", "#d53e4f"]);
    // scaleCol=d3.scaleLog()
    //   .domain([minCnt+1, maxCnt+1])
    //   .range([d3.color('lightblue'), d3.color('steelblue')]);
    keys =['0m/s','1m/s', '2m/s', '3-5m/s', '6-10m/s', '11-17m/s'];
    z.domain(keys);
    series = d3.stack().keys(keys)(wd)
    scaleX= d3.scaleBand()
      .domain(ticks)     
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
    
          // hisvg.selectAll('.rects')
          // .data(series)
          // .join("g")
          // .attr("fill", d => z(d.key))
          // .selectAll("rect")
          // .data(d => d)
          // .join("rect")
          // .transition().duration(800)        
          // .attr("y", d => scaleY(d[1]))
          // .attr("height", d => scaleY(d[0]) - scaleY(d[1]))
          // .attr("width", scaleX.bandwidth()); 
          
     }
  
  function setNextSpd(){
  //  d3.selectAll('.rects').remove();
  //  d3.selectAll('.histext').remove();
    if(wspd<6){
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
    hisvg.selectAll('.rects').remove();
    getHistData();
    drawHist();
    updateline();
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
    hisvg.selectAll('.rects').remove();
    getHistData();
    drawHist();
    updateline();
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