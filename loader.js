
var e = document.getElementById("citySelection");
city = e.options[e.selectedIndex].value;



var json_data = d3.json(""+city+'.json').then(function(data){
    return data;
});
var dataset = json_data.then(function(value){
    return Promise.all(value.map(function(results){
        return [new Date(results.datetime), +results.humidity, +results.pressure, +results.temperature,results.weather_description, results.wind_speed];
    }))
});