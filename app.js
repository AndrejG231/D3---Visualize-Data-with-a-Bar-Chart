// Fetch data from server
const getData = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  const data = await response.json();

  return data;
};

const draw = (queryData) => {
  const { data, name } = queryData;

  // Dimension constants
  const width = window.innerWidth - 15;
  const height = window.innerHeight - 15;
  const paddingX = width / 15;
  const paddingY = height / 10;
  //

  // Scales
  const ySizeScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[1])])
    .range([height - paddingY, paddingY]);

  const xPositionScale = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => new Date(d[0])),
      d3.max(data, (d) => new Date(d[0])),
    ])
    .range([paddingX, width - paddingX]);

  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat((val) => new Date(val).getFullYear())
    .ticks(width / 60);

  const yAxis = d3.axisLeft(ySizeScale);
  //

  //   Create svg
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "graph");
  //

  // Draw axis
  svg
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${height - paddingY})`)
    .attr("id", "x-axis");

  svg
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(${paddingX}, 0)`)
    .attr("id", "y-axis");
  //

  // Draw bars
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width", width / data.length + 0.1)
    .attr("height", (d) => height - ySizeScale(d[1]) - paddingY)
    .attr("x", (d) => xPositionScale(new Date(d[0])))
    .attr("y", (d) => ySizeScale(d[1]))
    .attr("fill", "blue")
    .attr("class", "bar")
    .attr("data-gdp", (d) => d[1])
    .attr("data-date", (d) => d[0]);
  //

  // Title
  svg
    .append("text")
    .text(name.split(",")[0])
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("id", "title")
    .attr("text-anchor", "middle");
  // .attr("font-size", 30);

  // Draw tooltip
  const tooltip = document.createElement("div");
  tooltip.innerHTML = "<p id='val'>Value</p><p id='date'>Text</p>";
  tooltip.id = "tooltip";
  document.querySelector("body").appendChild(tooltip);
  //

  // Bar hover effects
  document.querySelectorAll(".bar").forEach((bar) => {
    bar.addEventListener("mouseover", () => {
      document.documentElement.style.cursor = "pointer";
      bar.setAttribute("fill", "red");
      tooltip.style.opacity = 100;
      tooltip.dataset.date = `${bar.dataset.date}`;
      document.getElementById("date").innerText = `${bar.dataset.date}`;
      document.getElementById("val").innerText = `$${bar.dataset.gdp} Billion`;
    });

    bar.addEventListener("mouseleave", () => {
      document.documentElement.style.cursor = "default";
      bar.setAttribute("fill", "blue");
      tooltip.style.opacity = 0;
    });
  });
  //
};

// To redraw on resize
const clearScreen = () => {
  document.querySelector("body").innerHTML = "";
};

// Hold tooltip position on mouse
const toolTipListener = () => {
  document.addEventListener("mousemove", (event) => {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
      tooltip.style.top = `${
        event.y - (event.y > window.innerHeight / 2 ? 50 : 0)
      }px`;
      tooltip.style.left = `${
        event.x - (event.x > window.innerWidth / 2 ? 170 : -20)
      }px`;
    }
  });
};

const main = async () => {
  const data = await getData();

  toolTipListener();
  draw(data);

  window.addEventListener("resize", () => {
    clearScreen();
    draw(data);
  });
};

main();
