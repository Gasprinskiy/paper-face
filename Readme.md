
#  Working title "Paper Face"

## Overview

This application is a desktop tool built with **Electron** and **Vue** that generates PDF files with fully styled covers (for school notebooks).

It is designed to:

* Accept user input for fields such as **subject**, **school number**, **class/group ID**, **student name**, and more.
* Apply a pre-designed HTML/CSS template to generate visually consistent PDF documents.
* Ensure all fonts and styles are preserved in the final PDF.
* Notify the Vue renderer when the file generation process has finished.

## Features

* **Cross-platform** — runs on Windows, macOS, and Linux.
* **Live communication** between Electron’s main process and the Vue UI using IPC.
* **Custom templates** with your own styles and fonts.
* **Automatic event emission** when PDF generation completes.
* **Offline use** — no internet connection required.

## Tech Stack

* **Electron** (main process) — handles file generation and system-level operations.
* **Vue 3** (renderer process) — user interface.
* **Node.js** — utilities for file and path handling.
* **HTML/CSS** — for styling the PDF output.
* **\[pdf generation library you use — e.g., Puppeteer / Electron printToPDF / pdf-lib]**

## How It Works

1. **User fills out** the form in the Vue interface.
2. Vue sends the form data to Electron’s main process via IPC (`ipcRenderer.send`).
3. The main process loads an HTML template, replaces placeholders like `{{NAME}}` or `{{SUBJECT}}`, and generates a PDF.
4. Once PDF creation is complete, the main process sends an IPC event back to Vue notifying that the file is ready.
5. Vue updates the interface to show success or allow the user to open the file.

## Project Structure

```
project/
│
├── src/
│   ├── vite-app/        # Vue app code
│   ├── template         # HTML template with placeholders
|   ├── index.js         # External layer
|   ├── preload.js       # Bridge between vue app and external
│
├── package.json
└── README.md
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pdf-cover-generator.git

# Enter the project folder
cd pdf-cover-generator

# Install dependencies
npm install
```

## Build

```bash
# Build the Electron application
npm run build
```

