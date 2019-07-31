//console.log(_dataset[0].datetime);
function drawAllGraphs(){
dataset.then(function(data){
  //callbackfunc is now here.....
  //global Variable declaration
  var weatherdescriptions = d3.map(data, function(d){return d[4];}).keys();
  for(i=0;i<weatherdescriptions.length;i++){
    if ( weatherdescriptions[i] === '') {
      weatherdescriptions.splice(i, 1); 
    }
  }
  console.log(weatherdescriptions);
  var wspd =d3.map(data, function(d){
return d[5];
  }).keys();
  console.log(wspd);
  for(i=0;i<wspd.length;i++){
    if ( wspd[i] === '') {
      wspd.splice(i, 1); 
    }else{
      wspd[i]= +wspd[i];
    }
  }
  wspd.sort((a, b) => a - b); // numerical sort use b - a for descending
  console.log(wspd);
  var json_data=data;
  d3.select('#chartbox').html(null);
  var svg = d3.select('#chartbox').append('svg'); // for scatterplot
  var radius =2; var lr=0;
  var filtered=[]; var weatherdc=[];
  var stDate= new Date('December 31, 2012 00:00:00');  //dateRange

  var e = document.getElementById("timeSelection");
  var steps = +e.options[e.selectedIndex].value;
  var enDate=new Date(stDate);
  enDate.setMonth(enDate.getMonth()+steps);
  enDate.setHours(0,0,0);
  var f = document.getElementById("movingSpanSelection");
  var movingSpan = +f.options[e.selectedIndex].value; // moving average hours
  console.log(movingSpan);
  // var enDate=new Date('2013-06-30 00:00:00');
  var margin = {top: 20, right: 30, bottom: 30, left: 40};
  d3.select('#dateRange').html(stDate.toDateString() +' - ' +enDate.toDateString());
  var hisvg = d3.select('#chart').append('svg'); // histogram svg
  var lsvg=d3.select('#lchart').append('svg');    // linechart svg
  
  var xMin;var xMax;var yMin;var yMax;var x;var y;var x1;var y1;
  const height=320;  const width=400;
  const bheight=230; // bar chart height
  //legend
  var toggle=[];
  toggle.push(false);
  toggle.push(false);
  toggle.push(false);
  toggle.push(false);
  toggle.push(false);
  toggle.push(false);
  var margin1 ={top: 20, right: 120, bottom: 120, left: 40};// focus
  var margin2= {top: 300, right: 120, bottom: 40, left: 40};// context
  var height1; var width1;
  var height2; var x2;var y2; var brush; var zoom;
  var line2 = d3.line(), movAvgpast=d3.line(), dailyAvg=d3.line(); 
  var selectCircle;  var context; var focus; var lineChart;

  var prSpan=[];  var hmSpan=[];  var prDay=[]; var clip;
  var hmDay=[];  var sumprD,sumhmD;  var avgPr=[]; var avgHm=[];var avgWD=[];
  var hisData=[]; var tempData=[]; var maxTmp=[];
  var winData=[];var wd=[]; var keys=[];
  var scaleY;var scaleX ;
  var line = d3.line(); var tempScaleX; var tempScaleY; var txAxis; var tyAxis;
  var winArr=[]; var z = d3.scaleOrdinal();
  var actDay; var normalizedHist=true; var scdata=[];


  function updateline(){  // main function for line chart
    while(tempData.length){
      tempData.pop();
    }
    // getting the data of the time span
    //i-7 for timezone offset -273.15 to convetrt kelvin to celsius
    for(i=0;i<json_data.length;i++){
      if(json_data[i][3]!=0 && json_data[i][0]>=stDate && json_data[i][0]<=enDate){
        var tmp=[json_data[i-7][0],json_data[i][3]-273.15, json_data[i][4],json_data[i][5]];
        tempData.push(tmp);
      }
    }
    maxTmp=[];
    for(i=0;i<tempData.length;i++){
      var tmp=tempData[i][1];
      maxTmp.push(tmp);
    }
    //Scaling the line chart
    let maxTemp=d3.max(maxTmp);
    let minTemp=d3.min(maxTmp);
    lsvg.attr("width",850)
      .attr("height", 400)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    width1 = +lsvg.attr('width')-margin1.left-margin1.right;
    height1 = +lsvg.attr('height')-margin1.top- margin1.bottom;
    height2 = +lsvg.attr('height')-margin2.top - margin2.bottom;
    tempScaleY= d3.scaleLinear()
      .domain([minTemp,maxTemp])
      .range([height1, 0]);
    tempScaleX=d3.scaleTime()
      .domain([tempData[0][0], tempData[tempData.length-1][0]])
      .range([0, width1]);
    x2=d3.scaleTime()
      .domain([tempData[0][0], tempData[tempData.length-1][0]])
      .range([0, width1]);
    y2=d3.scaleLinear()
      .domain([minTemp,maxTemp])
      .range([height2,0]);
    txAxis = d3.axisBottom(tempScaleX);
    tyAxis = d3.axisLeft(tempScaleY);
    txAxis2 = d3.axisBottom(x2);
    //brush and zoom
    brush = d3.brushX()
      .extent([[0,0], [width1, height2]])
      .on('brush end', brushed);
    zoom = d3.zoom()
      .scaleExtent([1,Infinity])
      .translateExtent([0,0],[width1,height1])
      .extent([0,0],[width1,height1])
      .on('zoom', zoomed);
      // declaring line scales
      line.x(function(d, i) { return tempScaleX(tempData[i][0]); }) // set the x values for the line generator
        .y(function(d,i) { return tempScaleY(tempData[i][1]); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX); // apply smoothing to the line
      line2.x(function(d, i) { return x2(tempData[i][0]); })
        .y(function(d,i) { return y2(tempData[i][1]); });

      let a = json_data.findIndex(function(el) { return el[0].toString()==(stDate.toString())});
      let b= json_data.findIndex( function(el) { return el[0].toString()==(enDate.toString())});
      console.log(a)
      movAvgpast.defined(function(d, i) { 
          return i>=0; 
        })//defined can describe where the line is drawn (when statement is true)
        .x(function(d, i) {
          return tempScaleX(tempData[i][0]); })
        .y(function(d,i){
          sum=0;
          i=i+a;
          for(j=i-movingSpan;j<i;j++){
            sum = sum + (json_data[j][3]-273.15);
          }
          
        return tempScaleY(sum/movingSpan);
      });

      let avg=24;
      dailyAvg.defined(function(d, i) { 
        return i>avg && i<tempData.length; 
      }).x(function(d, i) { return tempScaleX(tempData[i][0]); })
        .y(function(d,i){
         let sum=0;
         for(j=i-(avg);j<i;j++){
           sum+=tempData[j][1]
         }
      // tmp=((tempData[i][1]-tempData[i-1][1])*(2/avg+1))+tempData[i-1][1]
        return tempScaleY(sum/avg);
      });
      
      //applying scales to the graph
      clip = lsvg.append('defs').append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', width1)
        .attr('height', height1)
        .attr('x', 0)
        .attr('y', 0);

      lineChart=lsvg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate('+margin1.left+','+margin1.top+')')
        .attr('clip-path', 'url(#clip)');
      focus = lsvg.append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate('+margin1.left+','+margin1.top+')');
      context = lsvg.append('g')
        .attr('class', 'context')
        .attr('transform', 'translate('+margin2.left+','+margin2.top+')')
    
      focus.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,'+height1+')')
        .call(txAxis);
      focus.append('g')
        .attr('class', 'axis axis--y')
        .call(tyAxis);
      lsvg.append('text')
        .attr('x',15)
        .attr('y',15)
        .text('°C')
      lineChart.append('path')
        .datum(tempData)
        .attr('class', 'line')
        .attr('d', line);
      lineChart.append('path')
        .datum(tempData)
        .attr('class', 'pastAvgline')
        .attr('d', movAvgpast)
      lineChart.append('path')
        .datum(tempData)
        .attr('class', 'futAvgline')
        .attr('d', dailyAvg)
      context.append('path')
        .datum(tempData)
        .attr('class', 'line')
        .attr('d', line2);
      context.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,'+height2+')')
        .call(txAxis2);
      context.append('g')
        .attr('class', "brush")
        .call(brush)
        .call(brush.move, tempScaleX.range());
      selectCircle = lineChart.selectAll(".circle")
        .data(tempData)
      lsvg.append('rect')
        .attr('x', width1+margin.left)
        .attr('y',96)
        .attr('width', 7)
        .attr('height', 2)
        .attr('rx', 2)
        .attr('fill', 'red')
      lsvg.append('rect')
        .attr('x', width1+margin.left)
        .attr('y',116)
        .attr('width', 7)
        .attr('height', 2)
        .attr('rx', 2)
        .attr('fill', 'black')
      lsvg.append('text')
        .attr('class', 'ltext')
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .attr('x', width1+margin.left+8)
        .attr('y',100)
        .attr('fill', 'red')
        .text('daily Average');
      lsvg.append('text')
        .attr('class', 'ltext')
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .attr('x', width1+margin.left+8)
        .attr('y',120)
        .attr('fill', 'black')
        .text('moving Average ' +movingSpan/24+ 'd');
      lsvg.append('rect')
        .attr('class', 'zoom')
        .attr('width', width1)
        .attr('height', height1)
        .attr('transform', 'translate('+margin1.left+','+margin1.top+')')
        .call(zoom);

      actDay = new Date(stDate);

      selectCircle.enter().append('circle') // circles display datapoints
        .attr('class', function(d,i){
          str=d[2];
          replaced = str.split(' ').join('_');
          if(d[3]<3){
            tmp=d[3];
          }
          if(d[3]>=3 &&d[3]<=5){
            tmp=3;
          }else if(d[3]>=6 && d[3]<=10){
            tmp= 4;
          }else if(d[3]>=11 &&d[3]<=17){
            tmp=5;
          }
          return 'circle c-'+tmp+'-'+replaced;
        })
        .attr('id', function(d,i){
            return 'c-'+d[0].toISOString().substring(0,11);
        })
        .attr('r', lr)
        .attr('cx',  function(d, i) { return tempScaleX(tempData[i][0]); }) // set the x values for the line generator
        .attr('cy', function(d,i) { return tempScaleY(tempData[i][1]); })
        .attr('transform', 'translate(0,0)')
        .attr('fill', function(d,i){
          if(d[3]==0){
            return '#fdd0a2';
          }else if(d[3]==1){
            return '#fdae6b';
          }else if(d[3]==2){
            return '#fd8d3c';
          } else if(d[3]>=3 &&d[3]<=5){
            return '#f16913';
          }else if(d[3]>=6 && d[3]<=10){
            return '#d94801';
          }else if(d[3]>=11 &&d[3]<=17){
            return '#8c2d04';
          }
        })
        .on('mouseover', mover).on('mouseout', mout)
  }
  updateline();
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    tempScaleX.domain(s.map(x2.invert, x2));
    lineChart.selectAll(".line")
      .attr("d", line);
    lineChart.selectAll('.pastAvgline')
      .attr('d', movAvgpast);
    lineChart.selectAll('.futAvgline')
      .attr('d', dailyAvg);
    lsvg.selectAll(".circle")
        .attr('cx',  function(d, i) { return tempScaleX(tempData[i][0]); });

    focus.selectAll(".axis--x").call(txAxis);
    lsvg.selectAll(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale( width1/ (s[1] - s[0]))
        .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    tempScaleX.domain(t.rescaleX(x2).domain());
    lineChart.selectAll(".line")
      .attr("d", line);
    lineChart.selectAll('.pastAvgline')
      .attr('d', movAvgpast);
    lineChart.selectAll('.futAvgline')
      .attr('d', dailyAvg);

    focus.selectAll(".axis--x").call(txAxis);
    lsvg.selectAll(".circle")
        .attr('cx',  function(d, i) { return tempScaleX(tempData[i][0]); });
    context.selectAll(".brush").call(brush.move, tempScaleX.range().map(t.invertX, t));
  }
  //unused mouseover/out, would work if the linechart circles are displayed
  function mover(d,i){
    str=d[0].toISOString();
    svg.selectAll('.c-'+str.substring(0,11))
      .attr('stroke', 'black')
      .attr('r', radius*2);
  }
  function mout(d,i){
    str=d[0].toISOString();
    svg.selectAll('.c-'+str.substring(0,11))
      .attr('r', radius*1.5);
      d3.select(this).attr('r', lr);
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
        if(j<2){
          if(hisData[i][1]==j){
            tmp.push(hisData[i][0]);
          }
        }else if(j==2){
          if(hisData[i][1]>=2&&hisData[i][1]<=Math.floor(d3.max(wspd)/6)){
            tmp.push(hisData[i][0]);
          }
        }else if(j==3){
          if(hisData[i][1]>=Math.ceil(d3.max(wspd)/6)&&hisData[i][1]<=Math.floor(d3.max(wspd)/3)){
            tmp.push(hisData[i][0]);
          }
        }else if(j==4){
          if(hisData[i][1]>=Math.ceil(d3.max(wspd)/3)&&hisData[i][1]<=Math.floor(d3.max(wspd)/2)){
            tmp.push(hisData[i][0]);
          }
        }else if(j==5){
          if(hisData[i][1]>=Math.ceil(d3.max(wspd)/2)&&hisData[i][1]<=d3.max(wspd)){
            tmp.push(hisData[i][0]);
          }
        }
      }
      winData.push(tmp);
    }
   
  }
  getHistData();

  function drawHist(){
    hisvg.selectAll('.textid').remove()
    hisvg.append('text')
      .attr('class', 'textid')
     .attr('x', 30)
      .attr('y', 170)
      .attr("transform", "rotate(-90,30,170)")
      .text('Amount of occurences')
    hisvg.append('text')
      .attr('class', 'textid')
      .attr("x", 180)
      .attr("y", 25)
      .text(function(){
        if(normalizedHist){
          return 'denormalize!'
        }else{
          return 'normalize!'
        }
      })
      .on('click', togglenorm);

    if(!normalizedHist){
    //scaleY.range([bheight-margin.bottom, margin.top+10])
      hisvg.append("g")
        .selectAll("rect")
        .data(series)
        .join("g")
        .attr("fill", d => z(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
          .attr('class', 'rects')
          .attr('id', function(d,i){
          var  str=d.data.name;
          var replaced = str.split(' ').join('_');
            return 're-'+replaced;
          })
          .attr("x", (d, i) => scaleX(d.data.name))
          .attr("y", d => scaleY(d[1]+1))
          .attr("height", d => scaleY(d[0]+1) - scaleY(d[1]+1))
          .attr("width", scaleX.bandwidth());  
      }else{
        scaleYnorm=d3.scaleLinear()
          .domain([0,1])
          .range([bheight-margin.bottom, margin.top+100])
          hisvg.append("g")
          .selectAll("rect")
          .data(series)
          .join("g")
          .attr("fill", d => z(d.key))
            .selectAll("rect")
          .data(d => d)
          .join("rect")
            .attr('class', 'rects')
            .attr('id', function(d,i){
              var  str=d.data.name;
              var replaced = str.split(' ').join('_')
              return 're-'+replaced;})
            .attr("x", (d, i) => scaleX(d.data.name))
            .attr("y", function(d,i){              
              var sum=d.data[keys[0]]+d.data[keys[1]]+d.data[keys[2]]+d.data[keys[3]]+d.data[keys[4]]+d.data[keys[5]];
              if(toggle[0]){
                sum=sum-d.data[keys[0]];
              }
              if(toggle[1]){
                sum=sum-d.data[keys[1]];
              }
              if(toggle[2]){
                sum=sum-d.data[keys[2]];
              }
              if(toggle[3]){
                sum=sum-d.data[keys[3]];
              }
              if(toggle[4]){
                sum=sum-d.data[keys[4]];
              }
              if(toggle[5]){
                sum=sum-d.data[keys[5]];
              }
            return scaleYnorm(((d[1])/sum));
            } )
            .attr("height", function(d){
              var sum=d.data[keys[0]]+d.data[keys[1]]+d.data[keys[2]]+d.data[keys[3]]+d.data[keys[4]]+d.data[keys[5]];
              if(toggle[0]){
                sum=sum-d.data[keys[0]];
              }
              if(toggle[1]){
                sum=sum-d.data[keys[1]];
              }
              if(toggle[2]){
                sum=sum-d.data[keys[2]];
              }
              if(toggle[3]){
                sum=sum-d.data[keys[3]];
              }
              if(toggle[4]){
                sum=sum-d.data[keys[4]];
              }
              if(toggle[5]){
                sum=sum-d.data[keys[5]];
              }
              if(sum>0){
              return scaleYnorm(d[0]/sum)-scaleYnorm(d[1]/sum);
              }else{
                return 0;
              }
            })
            .attr("width", scaleX.bandwidth());  
      }
    
     
      var legend = hisvg.append("g").append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys)
        .enter().append("g")
          .attr("transform", function(d, i) {
             return "translate(0," +  ((5-i) * 21 )+ ")"; 
          });

      legend.append("rect")
        .attr('id', function(d,i){
          return "le-"+i;
        })
        .attr("x", width-18)
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", function(d,i){
          if(toggle[i]){
            return 'white';
          }else if(!toggle[i]){
            return(z(d))
          }
        })
        .attr("stroke", z)
        .attr('stroke-width', 2)
        .on('click', toggleShow);

      legend.append("text")
        .attr('class', 'textid')
        .attr("x", width - 25)
        .attr("y", 9)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
 
      hisvg.selectAll('.rects').on('mouseover', recMouseHover)
        .on('mouseout', recMouseOut); 
   
  };
  //mouseover/out function and toggle functions for legend 
  function recMouseHover(d, i) {
    var rec=this;
    console.log(d,i);
    if(toggle[0]){
      i=i+weatherdescriptions.length;
    }
    if(toggle[1]&&i>=weatherdescriptions.length){
      i=i+weatherdescriptions.length;
    }
    if(toggle[2]&&i>=weatherdescriptions.length*2){
      i=i+weatherdescriptions.length;
    }
    if(toggle[3]&&i>=weatherdescriptions.length*3){
      i=i+weatherdescriptions.length;
    }
    if(toggle[4]&&i>=weatherdescriptions.length*4){
      i=i+weatherdescriptions.length;
    }
    if(toggle[5]&&i>=weatherdescriptions.length*5){
      i=i+weatherdescriptions.length;
    }
    d3.select(this).attr('stroke', 'black');
    hisvg.append("rect")
      .attr("id", "rec_" +  i)
      .attr("x",  rec.x.baseVal.value+15 )
      .attr("y", rec.y.baseVal.value-8)
      .attr('width', '32')
      .attr('height', '14')
      .attr('fill', 'white')
      .attr('fill-opacity', 0.5);
  
    hisvg.append("text")
      .attr("id", "tex_" +  i)
      .attr("x",  rec.x.baseVal.value + 18)
      .attr("y", rec.y.baseVal.value+5)
      .attr('fill', 'black')
      .attr('font-size', '12')
      .text(function() {
        return d[1]-d[0];  // Value of the text
      });
    
      str=d.data['name'];
      replaced = str.split(' ').join('_');
      if(i<weatherdescriptions.length){
        tmp=0;
      }else if(i<weatherdescriptions.length*2){
        tmp=1;
      }else if(i<weatherdescriptions.length*3){
        tmp=2;
      }else if(i<weatherdescriptions.length*4){
        tmp=3;
      }else if(i<weatherdescriptions.length*5){
        tmp=4;
      }else if(i<weatherdescriptions.length*6){
        tmp=5;
      }
      lsvg.selectAll('.c-'+tmp+'-'+replaced)
        .attr('r', radius)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.2);
  }
  function toggleShow(d,i){

    if(toggle[i]==false){
      d3.select(this).attr('fill', "white");
      toggle[i]=true;
    }else {
      d3.select(this).attr('fill', z);
      toggle[i]=false;
    }
    if(toggle[0]==true &&toggle[1]==true &&toggle[2]==true &&toggle[3]==true &&toggle[4]==true &&toggle[5]==true){
      for(i=0;i<toggle.length;i++){
        d3.select('#le-'+i).attr('fill', z);
        toggle[i]=false;
      }
    }
    console.log(toggle);
    update(d);
  }
  function recMouseOut(d, i) {
    var rec=this;
    if(toggle[0]){
      i=i+weatherdescriptions.length;
    }
    if(toggle[1]&&i>=weatherdescriptions.length){
      i=i+weatherdescriptions.length;
    }
    if(toggle[2]&&i>=weatherdescriptions.length*2){
      i=i+weatherdescriptions.length;
    }
    if(toggle[3]&&i>=weatherdescriptions.length*3){
      i=i+weatherdescriptions.length;
    }
    if(toggle[4]&&i>=weatherdescriptions.length*4){
      i=i+weatherdescriptions.length;
    }
    if(toggle[5]&&i>=weatherdescriptions.length*5){
      i=i+weatherdescriptions.length;
    }
    d3.select(this).attr('stroke', '');
    d3.select('#rec_'+i).remove();
    d3.select('#tex_' +  i).remove();
    //console.log(d,i);
    d.data['name'];
    replaced = str.split(' ').join('_');
    if(i<weatherdescriptions.length){
      tmp=0;
    }else if(i<weatherdescriptions.length*2){
      tmp=1;
    }else if(i<weatherdescriptions.length*3){
      tmp=2;
    }else if(i<weatherdescriptions.length*4){
      tmp=3;
    }else if(i<weatherdescriptions.length*5){
      tmp=4;
    }else if(i<weatherdescriptions.length*6){
      tmp=5;
    }
    lsvg.selectAll('.c-'+tmp+'-'+replaced)
      .attr('r', lr).attr('stroke', '');
  }
  function togglenorm(){
    if(!normalizedHist){
      normalizedHist=true;
      hisvg.selectAll('.rects').remove();
      d3.select(this).remove();
      drawHist();
    }else{
      normalizedHist=false;
      hisvg.selectAll('.rects').remove();
      d3.select(this).remove();
      drawHist();
    }
  }
  function update(d){
    if(filtered.indexOf(d)==-1){
      filtered.push(d);
      if(filtered.length==keys.length){filtered=[];}
    }else{
      filtered.splice(filtered.indexOf(d),1);
    }

    var newKeys=[];
    keys.forEach(function(d){
      if(filtered.indexOf(d)==-1){
        newKeys.push(d);
      }
    })

    series = d3.stack().keys(newKeys)(wd)
    console.log(series)
    var tmp=[];
    var tmp1=[];
    var cnt=0;
    for(i=0;i<weatherdescriptions.length;i++){
      cnt=0;
      tmp=[];
      for(j=0;j<series.length;j++){
        tmp.push(series[j][i][1]-series[j][i][0])
      }
      cnt=d3.max(tmp);
      tmp1.push(cnt);
    }
    
    //scaleY.domain([1,d3.max(tmp1)]);
    hisvg.selectAll('.rects').remove();

    d3.selectAll('.textid').remove();
    drawHist();
  }
  function updateHist(){ //scaling and calc the occured weather descriptions
    keys=[];
    for(i=0;i<6;i++){ // categorizing windspeeds in 6 categorys
      if(i<2){
        keys.push(wspd[i]+'m/s')
      }
      if(i==2){
        keys.push('2-'+Math.floor(d3.max(wspd)/6)+'m/s')
      }
      if(i==3){
        keys.push(Math.ceil(d3.max(wspd)/6)+'-'+Math.floor(d3.max(wspd)/3)+'m/s')
      }
      if(i==4){
        keys.push(Math.ceil(d3.max(wspd)/3)+'-'+Math.floor(d3.max(wspd)/2)+'m/s');
        //Math.floor(d3.max(wspd)/2)
      }
      if(i==5){
        keys.push(Math.ceil(d3.max(wspd)/2)+'-'+d3.max(wspd)+'m/s');
      }
    }
    //keys=[];
    console.log(keys);
   
    while(winArr.length){
      winArr.pop();
    }
   
    wd=[];
    var count = (search, arr) => arr.filter(x => x == search).length;
    for(i=0;i<weatherdescriptions.length;i++){
      wd.push({'name': weatherdescriptions[i]});
        wd[i][keys[0]]=count(weatherdescriptions[i], winData[0]);
        wd[i][keys[1]]=count(weatherdescriptions[i], winData[1]); 
        wd[i][keys[2]]=count(weatherdescriptions[i], winData[2]);
        wd[i][keys[3]]=count(weatherdescriptions[i], winData[3]);
        wd[i][keys[4]]=count(weatherdescriptions[i], winData[4]);
        wd[i][keys[5]]=count(weatherdescriptions[i], winData[5]);
    }

    var tmp=[];
    console.log(wd);
    var maxCnt=0;
    for(i=0;i<wd.length;i++){
      tmp.push(wd[i][keys[0]]+wd[i][keys[1]]+wd[i][keys[2]]+wd[i][keys[3]]+wd[i][keys[4]]+wd[i][keys[5]]);
    }
    let cnt = d3.max(tmp);
    maxCnt = maxCnt + cnt;
  
    var minCnt= d3.min(tmp);
    console.log(maxCnt, minCnt);
    var ticks=[];
    for(i=0;i<wd.length;i++){
      ticks.push(wd[i].name);
    }
    scaleY = d3.scaleLog()
      .domain([1, maxCnt])
      .range([bheight-margin.bottom, margin.top+20]);
    z.range(["#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"]);
    
    z.domain(keys);
    series = d3.stack().keys(keys)(wd)
    scaleX= d3.scaleBand()
      .domain(ticks)     
      .range([margin.left, width-margin.right])
      .paddingInner(0.1);
    hisvg.append("g")
      .attr("transform", "translate(0," + (bheight-margin.bottom) + ")")
      .call(d3.axisBottom(scaleX))
      .selectAll("text")	
      .style("text-anchor", "end")
      .attr('font-size', '10')
      .attr("dx", "-.55em")
      .attr("dy", "-.05em")
      .attr("transform", function(d) {
          return "rotate(-60)" 
          });
    hisvg.attr("viewBox", [0, 0, width, bheight+100]); // 92 for text 
  }
  updateHist();
  drawHist();
  //ScatterPlot

  function getScatData(){
  
    console.log(stDate+' - '+enDate);
    stDate.setHours(stDate.getHours()+24)
    stDate.setHours(0,0,0);
    enDate.setHours(enDate.getHours()+24)
    enDate.setHours(0,0,0);//dates willstart at 00:00:00
    //a & b are indizes where the date is stDate & enDate
    let a = json_data.findIndex(function(el) { return el[0].toString()==(stDate.toString())});
    let b= json_data.findIndex( function(el) { return el[0].toString()==(enDate.toString())});

    console.log('from: ' + a + ' to '  + b + ' = '+ ((b-a)/24))
    prSpan=[];
    hmSpan=[];
    weatherdc=[];
    scdata=[];
    
    if(a>0 && a<json_data.length && b>0 &&b<json_data.length){
      for(i = a; i <= b; i++){
        prSpan.push(json_data[i][2]);
        hmSpan.push(json_data[i][1]);
        weatherdc.push(json_data[i][4]);
        //for calculating 
      }        
      function mode(arr){   //calculating the mode of an given Array!! changes Array!!
        return arr.sort((a,b) =>
              arr.filter(v => v===a).length
            - arr.filter(v => v===b).length
        ).pop();
      }
      cnt=0;
      avgPr=[];
      avgHm=[];
      predomWDC=[];
        //calculating daily averages
      for (i = 0;i<=b-a ;i+=24) {
        predomWDC=[];
        prDay = prSpan.slice(i,i+24);   
        hmDay = hmSpan.slice(i,i+24);
        predomWDC = weatherdc.slice(i,i+24);
        sumprD = 0;
        sumhmD = 0;
        helpArr=[];
        prcnt=0;
        hmcnt=0;
        for(j=0;j<=prDay.length-1;j++){
          
          if(prDay[j]==0){
            
            prcnt=prcnt+1;
          }
          if(hmDay[j]==0){
           // console.log('0hm')
            hmcnt=hmcnt+1;
          }
          sumprD= sumprD + prDay[j];
          sumhmD= sumhmD + hmDay[j]; 
        }
        //console.log('prcnt: '+prcnt +' hmcnt: '+ hmcnt);
        helpArr=predomWDC.slice(0,predomWDC.length);
        mostFreq = mode(helpArr);
        scdata.push({'date':json_data[a+24+i][0], 'pressure': (sumprD/(prDay.length-prcnt)), 'humidity' : (sumhmD/(hmDay.length-hmcnt)), 'description' : mostFreq})
        avgPr.push(sumprD/(prDay.length-prcnt));          
      }
        
      xMin=0; xMax=100;
      //yMax=d3.max(avgPr); yMin=d3.min(avgPr);
      //fixed max and min for better visualizing relations 
      yMax= 1045; yMin=995;
    }else{
      alert("DateRange "+stDate.toDateString() +' - ' +enDate.toDateString()+" is invalid");
    }
    scale();
    drawData();
  }
  getScatData();
  function scale(){
   
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
      .attr('color', 'black').call(yAxis);
    svg.append('g')
      .attr("transform", 'translate(0, '+ xtrans +')')
      .attr('color', 'black').call(xAxis);
    svg.append('text')
      .attr("y", margin.top)
      .attr("x",width/2)
      .attr('fill', 'black')
      .style("text-anchor", "middle")
      .text("Pressure");      
    svg.append('text')
      .attr("y", height/2-10)
      .attr("x",50)
      .attr('fill', 'black')
      .style("text-anchor", "middle")
      .text("Humidity");         
  } 
  function handleMouseOver(d,i) {  //mouseover of the scatterplot points
    var circle = this;
    //console.log(d,i, this);
    //console.log(avgWD);
    str=d.description;
    replaced = str.split(' ').join('_');
    hisvg.selectAll('#re-'+replaced).attr('stroke', 'black');//adding stroke to the rect of histogram
    svg.selectAll('.circles')
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)
      .transition()
      .duration(800)
      .attr('fill-opacity', 0.3)
      .attr('stroke-opacity', 0.3); // let unhovered points be transparent
    d3.select(this).transition() // make hovered point bigger
      .duration(800)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)
      .attr('r', radius*2);
    svg.append("rect") // background for textlabel
      .attr("id", "r" + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .attr("x",  circle.cx.baseVal.value+4 )
      .attr("y", circle.cy.baseVal.value-6)
      .attr('width', '120')
      .attr('height', '14')
      .attr('fill', 'white')
    svg.append("text")// Label text
      .attr("id", "t" + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .attr("x",  circle.cx.baseVal.value + 5)
      .attr("y", circle.cy.baseVal.value+5)
      .attr('fill', 'black')
      .attr('font-size', '12')
      .text(function() {
        return x1(circle.cx.baseVal.value).toFixed(2) +'%, ' + y1(circle.cy.baseVal.value).toFixed(2)+ 'mbar';  // Value of the text
      });
    str = this.className.baseVal;
    str= str.substring(8,21);
    //showing linkeddatapoints on the line chart
    lsvg.selectAll('#'+str).attr('stroke', 'black')
      .attr('stroke-width', 0.2)
      .attr('r', radius);
    str = this.className.baseVal;
    str= str.substring(10,20);
  }

 
  function handleMouseOut(d, i) { // changing the hover effects back to normal 
    str=d.description;
    replaced = str.split(' ').join('_');
    hisvg.selectAll('#re-'+replaced).attr('stroke', 'none')
   
    str = this.className.baseVal;
    str= str.substring(8,21);
    lsvg.selectAll('#'+str).attr('stroke', 'none')
      .attr('r', lr);
    svg.selectAll('.circles').transition()
      .duration(200).attr('r', radius*1.5).attr('fill-opacity', 1).attr('stroke-opacity', 1);
    var circle=this;
      // Select text & rect by id and then remove
    document.getElementById('t' + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .remove();   
    document.getElementById('r' + circle.cx.baseVal.valueAsString + "-" + circle.cy.baseVal.valueAsString + "-" + i)
      .remove();  
  }
  function oncirClick(d,i){ // scatter plot onclick zooms on the exact day in linechart
    var d0 = new Date(str),
    d1 = new Date(str);
    d0.setHours(d0.getHours()-2);
    d1.setHours(d1.getHours()+26);
    console.log(d0,d1)
    focus.call(zoom.transform, d3.zoomIdentity
      .scale(1)
      .translate(0, 0));
  
    focus.call(zoom.transform, d3.zoomIdentity
      .scale(width1 / (tempScaleX(d1) - tempScaleX(d0)))
      .translate(-tempScaleX(d0), 0));   
  }

  function drawData(){
    
    var myColor = d3.scaleOrdinal()
      .range(['#ffd92f', "#969696", '#4292c6', '#6e016b'])
      .domain(['good_weather', 'cloudy_weather', 'rainy_weather', 'stormy_weather']);
      //console.log(scdata)
    
    var scLegend = svg.selectAll('g').select('g')
    scLegend.data(['a','good_weather', 'cloudy_weather', 'rainy_weather', 'stormy_weather'])
      .enter().append('rect')
      .attr('x', width-40)
      .attr('y',function(d,i){
       
       return (i*20)+13;
      })
      .attr('width', 50)
      .attr('height', 2)
      .attr('fill', function(d,i){
        
          return myColor(d);
      });
    scLegend.data(['a','good_weather', 'cloudy_weather', 'rainy_weather', 'stormy_weather'])
      .enter().append('text')
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y",function(d,i){
   
        return 10+(i*20);
      })
      .text(function(d) { return d; });
    svg.selectAll("circle")
      .data(scdata).enter().append('circle')
      .attr('class', function(d,i){
      
      return 'circles c-'+d['date'].toISOString().substring(0,11)
      })
      .attr("cx", function(d){
        return x(d.humidity)
      })
      .attr("cy", function(d){return y(d.pressure)})
      .attr("r", radius*1.5)
      .attr('stroke', 'black')
      .style("fill", function(d){
        if(d.description=='sky is clear' ||d.description=='few clouds'){
          return myColor('good_weather');
        }else if(d.description=='overcast clouds' || d.description=='mist'||d.description=='fog'||d.description=='haze'||d.description=='broken clouds' ||d.description=='scattered clouds' ||d.description=='dust' ||d.description=='smoke'||d.description=='light snow'||d.description=='heavy snow'){
          return myColor('cloudy_weather');
        }else if(d.description=='light rain' ||d.description=='moderate rain' ||d.description=='shower rain' ||d.description=='drizzle' ||d.description=='light intensity shower rain' ||d.description=='squalls' ||d.description=='proximity shower rain' ||d.description=='light intensity drizzle'||d.description=="heavy intensity drizzle"){
          return myColor('rainy_weather');
        }else if(d.description=='thunderstorm with rain' ||d.description=='thunderstorm' ||d.description=='thunderstorm with light rain' ||d.description=='proximity thunderstorm' ||d.description=='thunderstorm with heavy rain' ||d.description=='very large rain' ||d.description=='heavy intensity rain' ||d.description=='proximity thunderstorm with rain' ){
          return myColor('stormy_weather');
        }
      }).on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click',oncirClick);  
  }
  drawData();

  function setNextDate(){ // function for setting new DateRange for all Charts
    stDate.setMonth(stDate.getMonth()+steps);
    enDate.setMonth(enDate.getMonth()+steps);
    stDate.setHours(stDate.getHours()-24);
    enDate.setHours(enDate.getHours()-24);
    svg.selectAll('.circles').remove();
    svg.selectAll('g').remove();
    svg.selectAll('text').remove();
    getScatData();
    svg.selectAll('text').remove();
    scale();
    drawData();
    hisvg.selectAll('.rects').remove();
    hisvg.selectAll('.textid').remove();
    
    getHistData();
    updateHist();
    update();
    hisvg.selectAll('.textid').remove()
    drawHist();
    togglenorm();
    togglenorm();
    lsvg.selectAll('circle').remove();
    lsvg.selectAll('g').remove();
    lsvg.selectAll('text').remove();
    updateline();
    
    d3.select('#dateRange').html(stDate.toDateString() +' - ' +enDate.toDateString());
  }
  function setPrevDate(){ // function for setting new DateRange for all Charts
    stDate.setMonth(stDate.getMonth()-steps);
    enDate.setMonth(enDate.getMonth()-steps);
    stDate.setHours(stDate.getHours()-24);
    enDate.setHours(enDate.getHours()-24);
    svg.selectAll('.circles').remove();
    svg.selectAll('g').remove();
    svg.selectAll('text').remove();
    getScatData();
    svg.selectAll('text').remove();
    scale();
    drawData();
    hisvg.selectAll('.textid').remove()
    hisvg.selectAll('.rects').remove();
    update();
    getHistData();
    updateHist();
    hisvg.selectAll('.textid').remove()
    drawHist();
    togglenorm();
    togglenorm();
    lsvg.selectAll('circle').remove();
    lsvg.selectAll('g').remove();
    lsvg.selectAll('text').remove();
    updateline();
    d3.select('#dateRange').html(stDate.toDateString() +' - '+enDate.toDateString());
  }

  function timeSelect(){
    var e = document.getElementById("timeSelection");
    steps = +e.options[e.selectedIndex].value;
    enDate =new Date(stDate);
    enDate.setMonth(enDate.getMonth()+steps);
    console.log(steps)
    stDate.setHours(stDate.getHours()-24);
    enDate.setHours(enDate.getHours()-24);
    svg.selectAll('.circles').remove();
    svg.selectAll('g').remove();
    svg.selectAll('text').remove();
    getScatData();
    svg.selectAll('text').remove();
    scale();
    drawData();
    hisvg.selectAll('.textid').remove()
    hisvg.selectAll('.rects').remove();
    update();
    getHistData();
    updateHist();
    hisvg.selectAll('.textid').remove()
    drawHist();
    togglenorm();
    togglenorm();
    lsvg.selectAll('circle').remove();
    lsvg.selectAll('g').remove();
    lsvg.selectAll('text').remove();
    updateline();
    d3.select('#dateRange').html(stDate.toDateString() +' - '+enDate.toDateString());

  }
  function movSpanSelect(){
    var e = document.getElementById("movingSpanSelection");
    movingSpan = +e.options[e.selectedIndex].value;
    lsvg.selectAll('circle').remove();
      lsvg.selectAll('g').remove();
      lsvg.selectAll('text').remove();
      updateline();
  }
  function citySelect(){
    var e = document.getElementById("citySelection");
    city = e.options[e.selectedIndex].value;
    var json_data = d3.json(''+city+'.json').then(function(data){
      return data;
    });
    dataset = json_data.then(function(value){
      return Promise.all(value.map(function(results){
          return [new Date(results.datetime), +results.humidity, +results.pressure, +results.temperature,results.weather_description, results.wind_speed];
      }))
    });
    svg.remove();
    hisvg.remove();
    lsvg.remove();
    drawAllGraphs();
  }
  function citySelect2(){
    var e = document.getElementById("citySelection2");
    city = e.options[e.selectedIndex].value;
    // var json_data = d3.json(''+city+'.json').then(function(data){
    //   return data;
    // });
    // dataset = json_data.then(function(value){
    //   return Promise.all(value.map(function(results){
    //       return [new Date(results.datetime), +results.humidity, +results.pressure, +results.temperature,results.weather_description, results.wind_speed];
    //   }))
    // });
    // dataset.then(function(data){
    
    // });
  }
  d3.select('#drawData').on('click', getScatData);
  d3.select('#prevData').on('click', setPrevDate);
  d3.select('#nextData').on('click', setNextDate); // adding functions to buttons 
  d3.select('#timeSelection').on('change', timeSelect);
  d3.select('#movingSpanSelection').on('change', movSpanSelect)
  d3.select('#citySelection').on('change', citySelect);
  //d3.select('#citySelection2').on('change', citySelect2);
});
}
drawAllGraphs();