import React, { useState } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";

// Multi-select component with max selection logic
const MultiSelect = ({
  options,
  value,
  onChange,
  isDisabled,
  maxOptions,
  label,
}) => {
  const handleChange = (selected) => {
    if (selected.length <= maxOptions) {
      onChange(selected);
    }
  };

  return (
    <div>
      <label>{label}</label>
      <Select
        isMulti
        options={options.map((option) => ({ value: option, label: option }))}
        value={value}
        onChange={handleChange}
        isDisabled={isDisabled}
        closeMenuOnSelect={false}
      />
      {value.length >= maxOptions && (
        <div style={{ color: "red" }}>
          Max {maxOptions} options can be selected
        </div>
      )}
    </div>
  );
};

function DynamicDropdowns() {
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState(""); // State for text input (ID)
  const [selectedOptions, setSelectedOptions] = useState({
    L_1: [],
    L_2: [],
    L_3: [],
    L_4: [],
    L_5: [],
    L_6: [],
  });
  const [combinations, setCombinations] = useState([]); // Array to hold the added combinations
  const [counter, setCounter] = useState(0); // Counter for added combinations

  // Function to handle file upload and parse Excel file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  // Helper function to filter unique values based on the previous dropdown selection
  const getOptions = (level, filterKey) => {
    const uniqueOptions = new Set();
    data.forEach((row) => {
      if (
        filterKey === null ||
        selectedOptions[filterKey].some((value) => row[filterKey] === value)
      ) {
        uniqueOptions.add(row[level]);
      }
    });
    return [...uniqueOptions].filter((option) => option); // Return non-empty options
  };

  // Handle dropdown change
  const handleChange = (level, value) => {
    setSelectedOptions((prev) => {
      const updated = { ...prev, [level]: value };

      // Reset child dropdowns if a parent dropdown changes
      if (level === "L_1")
        updated.L_2 =
          updated.L_3 =
          updated.L_4 =
          updated.L_5 =
          updated.L_6 =
            [];
      if (level === "L_2")
        updated.L_3 = updated.L_4 = updated.L_5 = updated.L_6 = [];
      if (level === "L_3") updated.L_4 = updated.L_5 = updated.L_6 = [];
      if (level === "L_4") updated.L_5 = updated.L_6 = [];
      if (level === "L_5") updated.L_6 = [];
      return updated;
    });
  };

  // Add combination to the array
  const handleAdd = () => {
    const newCombination = {
      ID: inputText,
      L_1: selectedOptions.L_1.length > 0 ? selectedOptions.L_1 : [null],
      L_2: selectedOptions.L_2.length > 0 ? selectedOptions.L_2 : [null],
      L_3: selectedOptions.L_3.length > 0 ? selectedOptions.L_3 : [null],
      L_4: selectedOptions.L_4.length > 0 ? selectedOptions.L_4 : [null],
      L_5: selectedOptions.L_5.length > 0 ? selectedOptions.L_5 : [null],
      L_6: selectedOptions.L_6.length > 0 ? selectedOptions.L_6 : [null],
    };

    setCombinations((prev) => [...prev, newCombination]);
    setCounter((prev) => prev + 1); // Update counter
    setInputText(""); // Reset text input
    setSelectedOptions({
      L_1: [],
      L_2: [],
      L_3: [],
      L_4: [],
      L_5: [],
      L_6: [],
    }); // Reset dropdown selections
  };

  // Save combinations to a JSONL file and download it
  const handleSave = () => {
    const jsonlContent = combinations
      .map((combo) => JSON.stringify(combo))
      .join("\n");
    const blob = new Blob([jsonlContent], { type: "application/jsonl" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "combinations.jsonl";
    link.click();

    // Reset combinations and counter after saving
    setCombinations([]);
    setCounter(0);
  };

  return (
    <div>
      <h3>Upload Excel File</h3>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

      {/* Text Input Field */}
      <div>
        <label>Text Input (ID)</label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter some text here"
        />
      </div>

      {/* MultiSelect for L_1 with max 2 options */}
      <MultiSelect
        label="L_1"
        options={getOptions("L_1", null)}
        value={selectedOptions.L_1.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_1",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={false}
        maxOptions={2}
      />

      {/* MultiSelect for L_2 with max 2 options */}
      <MultiSelect
        label="L_2"
        options={getOptions("L_2", "L_1")}
        value={selectedOptions.L_2.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_2",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={!selectedOptions.L_1.length}
        maxOptions={2}
      />

      {/* MultiSelect for L_3 with max 3 options */}
      <MultiSelect
        label="L_3"
        options={getOptions("L_3", "L_2")}
        value={selectedOptions.L_3.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_3",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={!selectedOptions.L_2.length}
        maxOptions={3}
      />

      {/* MultiSelect for L_4 with max 3 options */}
      <MultiSelect
        label="L_4"
        options={getOptions("L_4", "L_3")}
        value={selectedOptions.L_4.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_4",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={!selectedOptions.L_3.length}
        maxOptions={3}
      />

      {/* MultiSelect for L_5 with max 3 options */}
      <MultiSelect
        label="L_5"
        options={getOptions("L_5", "L_4")}
        value={selectedOptions.L_5.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_5",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={!selectedOptions.L_4.length}
        maxOptions={3}
      />

      {/* MultiSelect for L_6 with max 3 options */}
      <MultiSelect
        label="L_6"
        options={getOptions("L_6", "L_5")}
        value={selectedOptions.L_6.map((val) => ({ value: val, label: val }))}
        onChange={(selected) =>
          handleChange(
            "L_6",
            selected.map((opt) => opt.value)
          )
        }
        isDisabled={!selectedOptions.L_5.length}
        maxOptions={3}
      />

      {/* Add Button */}
      <button onClick={handleAdd}>Add</button>

      {/* Save Button */}
      <button onClick={handleSave}>Save</button>

      {/* Counter */}
      <div>
        <p>Number of combinations: {counter}</p>
      </div>
    </div>
  );
}

export default DynamicDropdowns;