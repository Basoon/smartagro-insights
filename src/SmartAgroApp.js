import React, { useState } from "react";
import Papa from "papaparse";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SmartAgroApp() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
        generateSummary(result.data);
      }
    });
  };

  const generateSummary = (rows) => {
    const count = rows.length;
    const keys = Object.keys(rows[0] || {});
    setSummary(`Wczytano ${count} rekordów. Dostępne kolumny: ${keys.join(", ")}`);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>SmartAgro Insights – Demo</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <h2>📄 Podsumowanie</h2>
      <p>{summary}</p>
      <h2>📊 Wykres</h2>
      {data.length > 0 && (
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey={Object.keys(data[0])[0]} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={Object.keys(data[0])[1]} stroke="#8884d8" />
        </LineChart>
      )}
    </div>
  );
}