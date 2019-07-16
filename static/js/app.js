function makeResponsive() {

  // if the SVG area isn't empty when the browser loads, remove it
  // and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width
  // and height of the browser window.
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;


//var svgWidth = 960;
//var svgHeight = 500;

var margin = {
  top: 20,
  right: 20,
  bottom: 90,
  left: 90
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .classed("chart", true)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";





// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales

  console.log("min and max values ", d3.extent(data, d=>d[chosenXAxis]));

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) *0.9,
      d3.max(data, d => d[chosenXAxis]) *1.05
    ])
    .range([0, width]);

    return xLinearScale;

}


// function used for updating xAxis var upon click on axis label
function renderAxes_x(newXScale, xAxis) {

   var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
     .duration(1000)
     .call(bottomAxis);

  return xAxis;
}


// function used for updating y-scale var upon click on axis label

function yScale(data, chosenYAxis) {
  // create scales
  console.log("min and max values ", chosenYAxis, d3.extent(data, d=>d[chosenYAxis]));

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis])
    ])
    .range([height, 0]);

  return yLinearScale;

}
   
// function used for updating yAxis var upon click on axis label
function renderAxes_y(newYScale, yAxis) {

   var leftAxis = d3.axisLeft(newYScale);

   yAxis.transition()
    .duration(1000)
    .call(leftAxis);

   return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles_x(circlesGroup, newXScale, chosenXAxis) {

  console.log("renderCircles_x:", newXScale, chosenXAxis);  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

      
  return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles_y(circlesGroup, newYScale, chosenYAxis) {

    console.log("renderCircles_y:", newYScale, chosenYAxis);  

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesText_x(circlesText, newXScale, chosenXAxis) {

  console.log("renderCirclesText_x:", newXScale, chosenXAxis);  

 circlesText.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesText;
}


function renderCirclesText_y(circlesText, newYScale, chosenYAxis) {

 console.log("renderCirclesText_y:", newYScale, chosenYAxis);  

  circlesText.transition()
     .duration(1000)
     .attr("y", d => newYScale(d[chosenYAxis]) + 4);
    
  return circlesText;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var p=''
  switch(chosenXAxis) {  
      case "poverty":
        var xlabel = "Poverty";
        p ='%';
        break;
      case "age":
        var xlabel = "Age(Median)";
        break;
      case "income":
        var xlabel = "Income(Median)";
        break;
  }     
  switch(chosenYAxis) {  
      case "obesity":
        var ylabel = "Obesity";
        break;
      case "smokes":
        var ylabel = "Smokes";
        break;
      case "healthcare":
        var ylabel = "Lack Healthcare";
        break;
  }
          
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${p}<br>${ylabel} ${d[chosenYAxis]}%`);
    });
    
  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}




// Retrieve data from the CSV file and execute everything below
d3.csv("static/data/data.csv").then(function(data) {

  // parse data
  data.forEach(function(d) {
    d.id = +d.id;  
    d.poverty    = +d.poverty;
    d.povertyMoe = +d.povertyMoe;
    d.age        = +d.age;
    d.ageMoe     = +d.ageMoe;
    d.income     = +d.income;
    d.incomeMoe  = +d.incomeMoe;
    d.healthcare = +d.healthcare;
    d.healthcareHigh = +d.healthcareHigh;
    d.healthcareLow  = +d.healthcareLow;
    d.obesity      = +d.obesity;
    d.obesityHigh  = +d.obesityHigh;
    d.obesityLow   = +d.obesityLow;
    d.smokes        = +d.smokes;
    d.smokesHigh    = +d.smokesHigh;
    d.smokesLow     = +d.smokesLow;
      
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);
    
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
    
    
  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("opacity", ".7");
 

  var circlesText = chartGroup.selectAll(".stateText")
     .data(data)
     .enter()
     .append("text")
     .classed("stateText aText", true) 
     .attr("x", d => xLinearScale(d[chosenXAxis]))
     .attr("y", d => yLinearScale(d[chosenYAxis])+5)
//     .attr("fontsize","8px")
     .text(d => d['abbr']);

   
     
    
  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append either of the 3 y-axis
    
    
  var obesityLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("active", true)
    .classed("y-axis", true)
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") 
    .text("Obese (%)");

  var smokesLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("inactive", true)
    .classed("y-axis", true)
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") 
    .text("Smokes (%)");
    
  var healthcareLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    .classed("y-axis", true)
    .classed("inactive", true)
    .attr("y", 0  - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") 
    .text("Lack Healthcare (%)");
    
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x-axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;


        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes_x(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles_x(circlesGroup, xLinearScale, chosenXAxis);

        circlesText = renderCirclesText_x(circlesText, xLinearScale, chosenXAxis);
        


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        switch(chosenXAxis) {  
          case "poverty":
            { povertyLabel
                .classed("active", true)
                .classed("inactive", false);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            break;
          case "age":
            { povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            break;
          case "income":
            { povertyLabel
                .classed("active", false)
                .classed("inactive", true);
              ageLabel
                .classed("active", false)
                .classed("inactive", true);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            break;
          }
          
      }
    });

  var y_axis_labels = d3.selectAll('.y-axis');  
  // y-axis labels event listener
  
  console.log('y_axis_labels:', y_axis_labels);

  y_axis_labels
    .on("click", function() {
      // get value of selection
      console.log("y_axis_labels is triggered");
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        console.log("chosenYAxis:", chosenYAxis)

        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
//        leftAxis = d3.axisLeft(yLinearScale);

        // updates y axis with transition
        yAxis = renderAxes_y(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles_y(circlesGroup, yLinearScale, chosenYAxis);
        circlesText = renderCirclesText_y(circlesText, yLinearScale, chosenYAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


      switch(chosenYAxis) {  
          case "obesity":
            { obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            break;
          case "smokes":
            { obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            break;
          case "healthcare":
            { obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            break;
          }
          
      }
    });



});


}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);
