import React, { Component } from "react";
import "./App.css";
import * as d3 from "d3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { wordFrequency: [] };
  }

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  getWordFrequency = (text) => {
    const stopWords = new Set([
      "the", "and", "a", "an", "in", "on", "at", "for", "with", "about",
      "as", "by", "to", "of", "from", "that", "which", "who", "whom",
      "this", "these", "those", "it", "its", "they", "their", "them",
      "we", "our", "ours", "you", "your", "yours", "he", "him", "his",
      "she", "her", "hers", "it", "its", "we", "us", "our", "ours",
      "they", "them", "theirs", "I", "me", "my", "myself", "you",
      "your", "yourself", "yourselves", "was", "were", "is", "am",
      "are", "be", "been", "being", "have", "has", "had", "having",
      "do", "does", "did", "doing", "a", "an", "the", "as", "if",
      "each", "how", "which", "who", "whom", "what", "this", "these",
      "those", "that", "with", "without", "through", "over", "under",
      "above", "below", "between", "among", "during", "before", "after",
      "until", "while", "of", "for", "on", "off", "out", "in", "into",
      "by", "about", "against", "with", "amongst", "throughout", "despite",
      "towards", "upon", "isn't", "aren't", "wasn't", "weren't",
      "haven't", "hasn't", "hadn't", "doesn't", "didn't", "don't",
      "won't", "wouldn't", "can't", "couldn't", "shouldn't",
      "mustn't", "needn't", "daren't", "hasn't", "haven't", "hadn't"
    ]);

    const words = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=_`~()]/g, "")
      .replace(/\s{2,}/g, " ")
      .split(" ");
    const filteredWords = words.filter(word => !stopWords.has(word));
    return Object.entries(filteredWords.reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {}));
  };

  renderChart() {
    const data = this.state.wordFrequency.sort((a, b) => b[1] - a[1]).slice(0, 5);

    const fontSizeScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([80, 20]);

    const svgParent = d3.select(".svg_parent")
      .attr("width", 1000)
      .attr("height", 150)
      .style("background-color", "#e0e0e0");

    svgParent.selectAll("text").remove();
    let currentX = 10;

    const text = svgParent.selectAll("text")
      .data(data, d => d[0]);

    text.enter()
      .append("text")
      .text(d => d[0])
      .attr("x", function (d, i) {
        const fontSize = fontSizeScale(i);
        const wordLength = d[0].length * (fontSize / 2);
        const previousX = currentX;
        currentX += wordLength + 20;
        return previousX;
      })
      .attr("y", 100)
      .attr("fill", "black")
      .attr("font-size", 1)
      .transition()
      .duration(2000)
      .attr("font-size", (d, i) => fontSizeScale(i))
      .attr("opacity", 1);

    text.exit()
      .transition()
      .duration(1000)
      .attr("font-size", 1)
      .attr("opacity", 0)
      .remove();
  }

  render() {
    return (
      <div className="parent">
        <div className="child1" style={{ width: 1000 }}>
          <textarea
            type="text"
            id="input_field"
            style={{ height: 150, width: 1000 }}
          />
          <button
            type="submit"
            style={{
              marginTop: 10,
              height: 40,
              width: 1000,
              backgroundColor: "grey",
              color: "black",
              border: "none"
            }}
            onClick={() => {
              var input_data = document.getElementById("input_field").value;
              this.setState({ wordFrequency: this.getWordFrequency(input_data) });
            }}
          >
            Generate WordCloud
          </button>
        </div>
        <div className="child2">
          <svg className="svg_parent"></svg>
        </div>
      </div>
    );
  }
}

export default App;
