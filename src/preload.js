const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // generatePDFs: (names) => ipcRenderer.invoke('generate-pdf', { names }),
  generatePDFs: ({
    subjects,
    names,
    subjectTypes,
    groupName,
  }) => ipcRenderer.invoke('generate-pdf-2', {
    subjects,
    names,
    subjectTypes,
    groupName,
  })
});