import React, { useState, useEffect, Fragment } from "react";

const Scatterplot = ({ data }) => {
  const width = 800;
  const height = 800;

  // stores point selected with left click
  const [selectedPointLeft, setSelectedPointLeft] = useState({
    x: null,
    y: null,
  });
  // stores point selected with right click
  const [selectedPointRight, setSelectedPointRight] = useState({
    x: null,
    y: null,
  });
  // stores highlighted neighbor points
  const [highlightedPoints, setHighlightedPoints] = useState([]);

  // stores dimensions of scatter plot
  const [dimensions, setDimensions] = useState({
    xMin: 0,
    xMax: width,
    yMin: 0,
    yMax: height,
  });

  //stores default dimensions
  const [defaultDimensions, setDefaultDimensions] = useState({
    xMin: 0,
    xMax: width,
    yMin: 0,
    yMax: height,
  });

  //update dimensions when we load in data
  useEffect(() => {
    if (data.length === 0) return;
    // find min and max for x and y
    const xMin = Math.min(...data.map((d) => d.x));
    const yMin = Math.min(...data.map((d) => d.y));
    const xMax = Math.max(...data.map((d) => d.x));
    const yMax = Math.max(...data.map((d) => d.y));
    // set updated dimensions
    setDimensions({ xMin, xMax, yMin, yMax });
    setDefaultDimensions({ xMin, xMax, yMin, yMax });
  }, [data]);

  //calculate center of scatter plot
  const xCenter = (dimensions.xMax + dimensions.xMin) / 2;
  const yCenter = (dimensions.yMax + dimensions.yMin) / 2;

  // get unique categories and define different shapes for categories
  const uniqueCategories = [...new Set(data.map((d) => d.label))];
  const shapeOptions = ["circle", "square", "triangle"];

  //generate tick positions for axes
  const getTickPositions = (center, range, step = 10) => {
    let ticks = [];
    for (let i = center; i <= center + range; i += step) {
      ticks.push(i);
    }
    for (let i = center - step; i >= center - range; i -= step) {
      ticks.push(i);
    }
    return ticks;
  };

  const xTicks = getTickPositions(
    xCenter,
    (dimensions.xMax - dimensions.xMin) / 2,
    10
  );
  const yTicks = getTickPositions(
    yCenter,
    (dimensions.yMax - dimensions.yMin) / 2,
    10
  );

  // define mapping of labels to shapes
  const categoryStyles = uniqueCategories.reduce((acc, category, index) => {
    acc[category] = {
      shape: shapeOptions[index % shapeOptions.length],
    };
    return acc;
  }, {});

  //check which quadrant we are in and return that color
  const getQuadrantColor = (x, y) => {
    if (x >= xCenter && y >= yCenter) return "red";
    if (x < xCenter && y >= yCenter) return "blue";
    if (x < xCenter && y < yCenter) return "green";
    if (x >= xCenter && y < yCenter) return "purple";
  };

  //x and y axis transformations which we use to transform points to our coordinate system
  const transformX = (x) =>
    ((x - dimensions.xMin) / (dimensions.xMax - dimensions.xMin)) *
      (width - 100) +
    50;
  const transformY = (y) =>
    height -
    50 -
    ((y - dimensions.yMin) / (dimensions.yMax - dimensions.yMin)) *
      (height - 100);

  const handleLeftClick = (point) => {
    if (selectedPointLeft.x !== point.x && selectedPointLeft.y !== point.y) {
      //defining new dimensions by offsetting old ones by the new center point
      const newDimensions = {
        xMin: point.x - (dimensions.xMax - dimensions.xMin) / 2,
        xMax: point.x + (dimensions.xMax - dimensions.xMin) / 2,
        yMin: point.y - (dimensions.yMax - dimensions.yMin) / 2,
        yMax: point.y + (dimensions.yMax - dimensions.yMin) / 2,
      };
      setDimensions(newDimensions);
      setSelectedPointLeft({ x: point.x, y: point.y });
    } else {
      setDimensions(defaultDimensions);
      setSelectedPointLeft({ x: null, y: null });
    }
  };

  const handleRightClick = (e, point) => {
    e.preventDefault();
    if (selectedPointRight.x !== point.x && selectedPointRight.y !== point.y) {
      setSelectedPointRight({ x: point.x, y: point.y });
      //KNN
      //check all distances
      const distances = data.map((d) => ({
        ...d,
        distance: Math.sqrt((d.x - point.x) ** 2 + (d.y - point.y) ** 2),
      }));
      //take 5 closest excluding self
      const nearestPoints = distances
        .filter((d) => d.x !== point.x || d.y !== point.y)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      //make use of find so I can use includes when picking color :)
      setHighlightedPoints(
        nearestPoints.map((p) => data.find((d) => d.x === p.x && d.y === p.y))
      );
    } else {
      setHighlightedPoints([]);
      setSelectedPointRight({ x: null, y: null });
    }
  };
  return (
    <div
      style={{
        backgroundColor: "black",
        width: `${width}`,
        height: `${height}`,
        display: "flex",
        position: "relative",
        top: "60px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: "lightgray" }}
        height={height}
        width={width}
        // viewBox="0 0 800 800"
      >
        {/* X-AXIS */}
        <line
          x1="0"
          y1={transformY(yCenter)}
          x2="100%"
          y2={transformY(yCenter)}
          stroke="black"
          strokeWidth={2}
        />
        {/* Y-AXIS */}
        <line
          x1={transformX(xCenter)}
          y1="0"
          x2={transformX(xCenter)}
          y2="100%"
          stroke="black"
          strokeWidth={2}
        />
        {/* HERE WE DRAW ALL DATA  */}
        {data.map((point, index) => {
          return (
            <g
              key={index}
              onClick={() => handleLeftClick(point)}
              transform={`translate(${transformX(point.x)}, ${transformY(
                point.y
              )})`}
              onContextMenu={(e) => handleRightClick(e, point)}
            >
              {/* Circle "a" */}
              {categoryStyles[point.label]?.shape === "circle" && (
                <circle
                  r="7"
                  fill={
                    highlightedPoints.includes(point)
                      ? "gold"
                      : selectedPointLeft.x === point.x &&
                        selectedPointLeft.y === point.y
                      ? "DarkTurquoise"
                      : getQuadrantColor(point.x, point.y)
                  }
                  stroke={
                    selectedPointRight.x === point.x &&
                    selectedPointRight.y === point.y
                      ? "gold"
                      : "black"
                  }
                />
              )}

              {/* Square "b" */}
              {categoryStyles[point.label]?.shape === "square" && (
                <rect
                  x="-6"
                  y="-6"
                  width="12"
                  height="12"
                  fill={
                    highlightedPoints.includes(point)
                      ? "gold"
                      : selectedPointLeft.x === point.x &&
                        selectedPointLeft.y === point.y
                      ? "DarkTurquoise"
                      : getQuadrantColor(point.x, point.y)
                  }
                  stroke={
                    selectedPointRight.x === point.x &&
                    selectedPointRight.y === point.y
                      ? "gold"
                      : "black"
                  }
                />
              )}

              {/* Triangle "c" */}
              {categoryStyles[point.label]?.shape === "triangle" && (
                <polygon
                  points="0,-7 7, 7 -7, 7"
                  fill={
                    highlightedPoints.includes(point)
                      ? "gold"
                      : selectedPointLeft.x === point.x &&
                        selectedPointLeft.y === point.y
                      ? "DarkTurquoise"
                      : getQuadrantColor(point.x, point.y)
                  }
                  stroke={
                    selectedPointRight.x === point.x &&
                    selectedPointRight.y === point.y
                      ? "gold"
                      : "black"
                  }
                />
              )}
            </g>
          );
        })}
        {/* X-AXIS ticks */}
        {xTicks.map((tick, index) => (
          <Fragment key={`x-${index}`}>
            <line
              x1={transformX(tick)}
              y1={transformY(yCenter) - 5}
              x2={transformX(tick)}
              y2={transformY(yCenter) + 5}
              stroke="black"
            />
            <text
              x={transformX(tick) - 10}
              y={transformY(yCenter) + 20}
              fontSize="14"
              fontWeight={"bold"}
              style={{ userSelect: "none" }}
            >
              {Math.round(tick)}
            </text>
          </Fragment>
        ))}
        {/* Y-AXIS ticks */}
        {yTicks.map((tick, index) => (
          <Fragment key={`y-${index}`}>
            <line
              x1={transformX(xCenter) - 5}
              y1={transformY(tick)}
              x2={transformX(xCenter) + 5}
              y2={transformY(tick)}
              stroke="black"
            />
            <text
              x={transformX(xCenter) - 30}
              y={transformY(tick) + 5}
              fontSize="14"
              fontWeight={"bold"}
              style={{ userSelect: "none" }}
            >
              {Math.round(tick)}
            </text>
          </Fragment>
        ))}
      </svg>
      {/* LEGEND  */}
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <div>
          <h3 style={{ padding: "0px", margin: "0" }}>Legend</h3>
        </div>
        {uniqueCategories.map((category, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "2px",
            }}
          >
            <svg width="20" height="20">
              {categoryStyles[category]?.shape === "circle" && (
                <circle cx="10" cy="10" r="5" fill={categoryStyles[category]} />
              )}
              {categoryStyles[category]?.shape === "square" && (
                <rect
                  x="5"
                  y="5"
                  width="10"
                  height="10"
                  fill={categoryStyles[category]}
                />
              )}
              {categoryStyles[category]?.shape === "triangle" && (
                <polygon
                  points="10,5 15,15 5,15"
                  fill={categoryStyles[category]}
                />
              )}
            </svg>
            <span style={{ marginLeft: "10px" }}>{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scatterplot;
