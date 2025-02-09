import Papa from "papaparse";
import React, { useEffect, useState } from "react";

import "./App.css";
import Scatterplot from "./Scatterplot";

function App() {
  const [data, setData] = useState([]);

  const fileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // get information from CSV file
    Papa.parse(file, {
      complete: (result) => {
        const parsedData = result.data
          .map((row) => ({
            x: parseFloat(row[0]),
            y: parseFloat(row[1]),
            label: row[2],
          }))
          .filter((d) => !isNaN(d.x) && !isNaN(d.y));
        setData(parsedData);
      },
      dynamicTyping: true,
      skipEmptyLines: true,
    });
  };

  return (
    <div className="App">
      <div className="file-upload-container">
        <label className="custom-file-upload">
          <input type="file" accept=".csv" onChange={fileUpload} hidden />
          Choose CSV File
        </label>
      </div>
      <Scatterplot data={data} />
    </div>
  );
}

export default App;
