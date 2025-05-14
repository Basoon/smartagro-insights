import React, { useState } from "react";
import Papa from "papaparse";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function SmartAgroApp() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [keys, setKeys] = useState([]);
  const [aiSummary, setAiSummary] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data;
        setData(parsed);
        const detectedKeys = Object.keys(parsed[0] || {});
        setKeys(detectedKeys);
        setSummary(`Wczytano ${parsed.length} rekordów. Kolumny: ${detectedKeys.join(", ")}`);
      },
    });
  };

  const handleAISummary = async () => {
    const sample = JSON.stringify(data.slice(0, 10));
    try {
      const res = await fetch("https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        },
        body: JSON.stringify({ inputs: `Podsumuj dane rolnicze: ${sample}` }),
      });
      const result = await res.json();
      setAiSummary(result[0]?.summary_text || "Brak podsumowania.");
    } catch (error) {
      setAiSummary("Błąd podczas generowania podsumowania AI.");
    }
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h6">1. Wgraj plik CSV</Typography>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <Typography mt={2}>{summary}</Typography>
      </Box>

      {data.length > 0 && (
        <>
          <Box mb={4}>
            <Typography variant="h6">2. Wybierz kolumny do wykresu</Typography>
            <FormControl sx={{ mr: 2, minWidth: 150 }}>
              <InputLabel id="x-select-label">Oś X</InputLabel>
              <Select
                labelId="x-select-label"
                value={xKey}
                label="Oś X"
                onChange={(e) => setXKey(e.target.value)}
              >
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="y-select-label">Oś Y</InputLabel>
              <Select
                labelId="y-select-label"
                value={yKey}
                label="Oś Y"
                onChange={(e) => setYKey(e.target.value)}
              >
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {xKey && yKey && (
            <Box mb={4}>
              <Typography variant="h6">3. Wykres</Typography>
              <LineChart width={700} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yKey} stroke="#2e7d32" />
              </LineChart>
            </Box>
          )}

          <Box mb={4}>
            <Typography variant="h6">4. Podsumowanie AI</Typography>
            <Button variant="contained" color="primary" onClick={handleAISummary}>
              Wygeneruj podsumowanie
            </Button>
            <TextField
              fullWidth
              multiline
              minRows={4}
              margin="normal"
              value={aiSummary}
              placeholder="Tu pojawi się podsumowanie danych..."
            />
          </Box>
        </>
      )}
    </Box>
  );
}
