import React, { useState, useEffect, Fragment } from "react";

const Scatterplot = ({ data }) => {
  const width = 600;
  const height = 400;

  const [selectedPoint, setSelectedPoint] = useState({ x: null, y: null });
  const [highlightedPoints, setHighlightedPoints] = useState([]);

  const [dimensions, setDimensions] = useState({
    xMin: 0,
    xMax: 600,
    yMin: 0,
    yMax: 400,
  });
  useEffect(() => {
    if (data.length === 0) return;
    const xMin = Math.min(...data.map((d) => d.x));
    const yMin = Math.min(...data.map((d) => d.y));
    const xMax = Math.max(...data.map((d) => d.x));
    const yMax = Math.max(...data.map((d) => d.y));

    setDimensions({ xMin, xMax, yMin, yMax });
  }, [data]);

  const scaleX = (x) =>
    ((x - dimensions.xMin) / (dimensions.xMax - dimensions.xMin)) *
      (width - 50) +
    25;
  const scaleY = (y) =>
    ((y - dimensions.yMin) / (dimensions.yMax - dimensions.yMin)) *
      (height - 50) +
    25;

  const handleLeftClick = (point) => {};

  const handleRightClick = (e, point) => {
    e.preventDefault();
    if (selectedPoint.x !== point.x && selectedPoint.y !== point.y) {
      setSelectedPoint({ x: point.x, y: point.y });
      //KNN
    }
    setHighlightedPoints([]);
    setSelectedPoint({ x: null, y: null });
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      style={{ backgroundColor: "lightgray" }}
    >
      {/* x-axis */}
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="black" strokeWidth={3} />
      {/* y-axis */}
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="black" strokeWidth={3} />
      {data.map((point, index) => (
        <circle
          key={index}
          cx={scaleX(point.x)}
          cy={scaleY(point.y)}
          r="6"
          fill={highlightedPoints.includes(point) ? "green" : "red"}
          onClick={() => handleLeftClick(point)}
          onContextMenu={(e) => handleRightClick(e, point)}
          stroke="black"
          strokeWidth={1}
        />
      ))}
      {[...Array(40)].map((x, i) => (
        <line
          key={i}
          x1={i * 40}
          y1="49%"
          x2={i * 40}
          y2="51%"
          stroke="black"
          strokeWidth={2}
        />
      ))}
      {[...Array(40)].map((x, i) => (
        <Fragment key={i}>
          <line
            x1="49%"
            y1={i * 40}
            x2="51%"
            y2={i * 40}
            stroke="black"
            strokeWidth={2}
          />
          <text style={{ padding: 10 }}>10</text>
        </Fragment>
      ))}
    </svg>
  );
};

export default Scatterplot;
