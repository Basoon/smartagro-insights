import React, { useState } from "react";
import Papa from "papaparse";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SmartAgroApp() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [keys, setKeys] = useState([]);
  const [report, setReport] = useState("");

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

  const generateRecommendations = () => {
    if (data.length === 0) return;

    const highMoisture = data.filter(row => parseFloat(row["Wilgotność (%)"]) > 75).length;
    const lowEfficiency = data.filter(row => parseFloat(row["Wydajność (kg/h)"]) < 1200).length;
    const claySoil = data.filter(row => row["Typ gleby"] === "gliniasta").length;

    let msg = "📊 Raport AI dla rolnika:\n\n";
    msg += `Dane wskazują na ${highMoisture} przypadków wysokiej wilgotności (>75%).\n`;
    msg += `Zidentyfikowano ${lowEfficiency} dni z niską wydajnością (<1200 kg/h).\n`;
    if (claySoil > 10) msg += `Dominuje gleba gliniasta – zalecana zmiana płodozmianu lub dodatek wapna.\n`;
    msg += `\n✅ Zalecenia:\n- Monitoruj wilgotność gleby i unikaj nadmiernego nawadniania.\n- Sprawdź jakość nawożenia przy niskiej wydajności.\n- Rozważ rzepak ozimy w regionach o wyższej wilgotności.\n`;

    setReport(msg);
  };

  const exportTXT = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "raport_smartagro.txt";
    link.click();
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6">1. Wgraj plik CSV</Typography>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <Typography mt={2}>{summary}</Typography>
      </Box>

      {data.length > 0 && (
        <>
          <Box mb={4}>
            <Typography variant="h6">2. Wybierz dane do wykresu</Typography>
            <FormControl sx={{ mr: 2, minWidth: 160 }}>
              <InputLabel>Oś X</InputLabel>
              <Select value={xKey} onChange={(e) => setXKey(e.target.value)} label="Oś X">
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Oś Y</InputLabel>
              <Select value={yKey} onChange={(e) => setYKey(e.target.value)} label="Oś Y">
                {keys.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {xKey && yKey && (
            <Box mb={5}>
              <Typography variant="h6">3. Wykres danych</Typography>
              <LineChart width={800} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={yKey} stroke="#2e7d32" />
              </LineChart>
            </Box>
          )}

          <Box mb={5}>
            <Typography variant="h6">4. Rekomendacje AI</Typography>
            <Button variant="contained" onClick={generateRecommendations} sx={{ mt: 1 }}>
              Generuj raport
            </Button>
            {report && (
              <>
                <TextField fullWidth multiline minRows={6} value={report} margin="normal" />
                <Button onClick={exportTXT} variant="outlined" color="secondary">
                  Eksportuj do TXT
                </Button>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
