import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function TweetVisualization({ data }) {
  const svgRef = useRef();
  const [colorBy, setColorBy] = useState("Sentiment");
  const [selectedTweets, setSelectedTweets] = useState([]);

  useEffect(() => {
    if (!data) return;

    const width = 800;
    const height = 600;
    const margin = 50;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const sampledData = data.length > 300 ? data.slice(0, 300) : data;

    const months = ["March", "April", "May"];
    const monthScale = d3
      .scaleBand()
      .domain(months)
      .range([margin, height - margin])
      .padding(0.1);

    svg.selectAll(".month-label")
      .data(months)
      .enter()
      .append("text")
      .attr("class", "month-label")
      .attr("x", margin / 2)
      .attr("y", (d) => monthScale(d) + monthScale.bandwidth() / 2)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("alignment-baseline", "middle")
      .text((d) => d);

    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const getColorScale = () =>
      colorBy === "Sentiment" ? sentimentColorScale : subjectivityColorScale;

    const simulation = d3
      .forceSimulation(sampledData)
      .force(
        "x",
        d3.forceX(width / 2).strength(0.1)
      )
      .force(
        "y",
        d3.forceY((d) => {
          if (d.Month === "March") return monthScale("March") + monthScale.bandwidth() / 2;
          if (d.Month === "April") return monthScale("April") + monthScale.bandwidth() / 2;
          return monthScale("May") + monthScale.bandwidth() / 2;
        }).strength(1.5)
      )
      .force("collide", d3.forceCollide(6))
      .force("charge", d3.forceManyBody().strength(-10))
      .stop();

    for (let i = 0; i < 500; i++) simulation.tick();

    const circles = svg.selectAll(".tweet-circle")
      .data(sampledData)
      .enter()
      .append("circle")
      .attr("class", "tweet-circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);

    const updateColors = () => {
      const colorScale = getColorScale();
      circles.attr("fill", (d) =>
        colorScale(colorBy === "Sentiment" ? d.Sentiment : d.Subjectivity)
      );
    };

    updateColors();

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 90}, ${(height - 100) / 2})`);

    const gradient = legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    const legendScale = d3
      .scaleLinear()
      .domain(colorBy === "Sentiment" ? [-1, 1] : [0, 1])
      .range([100, 0]);

    const stops = colorBy === "Sentiment" ? [-1, -0.6, -0.2, 0.2, 0.6, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1];

    stops.forEach((stop) => {
      gradient
        .append("stop")
        .attr("offset", `${((stop - d3.min(stops)) / (d3.max(stops) - d3.min(stops))) * 100}%`)
        .attr("stop-color", colorBy === "Sentiment"
          ? sentimentColorScale(stop)
          : subjectivityColorScale(stop)
        );
    });

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 100)
      .style("fill", "url(#legend-gradient)");

    legend
      .append("g")
      .attr("transform", "translate(25, 0)")
      .call(d3.axisRight(legendScale).tickValues(stops).tickFormat(d3.format(".1f")));

    circles.on("click", (event, d) => {
      const isSelected = selectedTweets.some((t) => t === d);
      if (isSelected) {
        d3.select(event.currentTarget).attr("stroke-width", 0.5);
        setSelectedTweets((prev) => prev.filter((tweet) => tweet !== d));
      } else {
        d3.select(event.currentTarget).attr("stroke-width", 2);
        setSelectedTweets((prev) => [d, ...prev]);
      }
    });

  }, [data, colorBy]);

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        <label htmlFor="color-dropdown" style={{ marginRight: "10px" }}>
          Color By:
        </label>
        <select
          id="color-dropdown"
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value)}
        >
          <option value="Sentiment">Sentiment</option>
          <option value="Subjectivity">Subjectivity</option>
        </select>
      </div>
      <svg
        ref={svgRef}
        style={{
          border: "1px solid #ccc",
          display: "block",
          marginTop: "10px"
        }}
      ></svg>

      <div style={{ marginTop: "20px", width: "80%", maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        <h4>Selected Tweets (Most Recent First):</h4>
        {selectedTweets.map((tweet, index) => (
          <div key={index} style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
            <strong>Month:</strong> {tweet.Month}<br/>
            <strong>Sentiment:</strong> {tweet.Sentiment}<br/>
            <strong>Subjectivity:</strong> {tweet.Subjectivity}<br/>
            <strong>Text:</strong> {tweet.Text || JSON.stringify(tweet)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TweetVisualization;
