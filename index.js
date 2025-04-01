const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;
const BASE_DIR = path.join(__dirname, "iDream_content");

// Function to recursively get all files with a given extension
const getAllFilesByExtension = (dir, extension, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllFilesByExtension(filePath, extension, fileList);
    } else if (file.endsWith(extension)) {
      fileList.push(path.relative(BASE_DIR, filePath));
    }
  });
  return fileList;
};

// API to get a list of all .txt files recursively
app.get("/files", (req, res) => {
  try {
    const textFiles = getAllFilesByExtension(BASE_DIR, ".txt");
    res.json(textFiles);
  } catch (err) {
    res.status(500).json({ error: "Unable to read directory" });
  }
});

// API to get a list of all .png icons recursively
app.get("/icons", (req, res) => {
  try {
    const iconFiles = getAllFilesByExtension(BASE_DIR, ".png");
    res.json(iconFiles);
  } catch (err) {
    res.status(500).json({ error: "Unable to read directory" });
  }
});

// API to get the content of a specific text file
app.get("/files/*", (req, res) => {
  const relativePath = req.params[0];
  const filePath = path.join(BASE_DIR, relativePath);
  
  if (!filePath.endsWith(".txt")) {
    return res.status(400).json({ error: "Only .txt files are allowed" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }
    res.send(data);
  });
});

// API to serve a specific PNG icon
app.get("/icons/*", (req, res) => {
  const relativePath = req.params[0];
  const filePath = path.join(BASE_DIR, relativePath);
  
  if (!filePath.endsWith(".png")) {
    return res.status(400).json({ error: "Only .png files are allowed" });
  }

  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }
    res.sendFile(filePath);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
