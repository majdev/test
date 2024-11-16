// Set up the SVG canvas dimensions for TikTok/Instagram/YouTube Shorts
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Adjust margins to provide spacing from the top, bottom, and sides
const margin = {
    top: height * 0.3, // 30% from the top
    right: 60,
    bottom: 200,       // Extra margin at the bottom for overlay text
    left: 80
};
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// Create an inner group element
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV file
d3.csv("data.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.x = new Date(d.x); // Convert x to Date object
        d.y = +d.y;          // Convert y to number
    });

    // Set up the x and y scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.x))
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .nice()
        .range([chartHeight, 0]);

    // Set up the line generator
    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

    // Create x and y axes
    const xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(y).ticks(10).tickFormat(d => `$${d}`);

    // Add x and y axes
    g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .call(g => g.selectAll("line").attr("stroke", "#555"))
        .call(g => g.selectAll("text").attr("fill", "#ccc"));

    g.append("g")
        .call(yAxis)
        .call(g => g.selectAll("line").attr("stroke", "#555"))
        .call(g => g.selectAll("text").attr("fill", "#ccc"));

    // Add horizontal grid lines
    g.selectAll(".y-grid")
        .data(y.ticks(10))
        .enter().append("line")
        .attr("class", "y-grid")
        .attr("x1", 0)
        .attr("x2", chartWidth)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#333")
        .attr("stroke-dasharray", "2,2");

    // Add vertical grid lines
    g.selectAll(".x-grid")
        .data(x.ticks(d3.timeYear.every(1)))
        .enter().append("line")
        .attr("class", "x-grid")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "#333")
        .attr("stroke-dasharray", "2,2");

    // Path element for the line
    const path = g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#76B900") // NVIDIA logo color
        .attr("stroke-width", 2)
        .attr("d", line);

    // Create an SVG text element for the tooltip
    const tooltip = g.append("text")
        .attr("fill", "#76B900") // NVIDIA logo color
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("visibility", "hidden");

    // Animate the line
    const totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(10000) // Duration of animation in milliseconds
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("start", function() {
            tooltip.attr("visibility", "visible");
        })
        .on("end", function() {
            tooltip.attr("visibility", "visible");
        })
        .tween("tooltip", function() {
            return function(t) {
                const pointAtLength = path.node().getPointAtLength(totalLength * t);
                tooltip
                    .attr("x", pointAtLength.x - 20)
                    .attr("y", pointAtLength.y - 10)
                    .text(`$${Math.round(y.invert(pointAtLength.y))}`);
            };
        });
});
