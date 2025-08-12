const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generatePDFs: (names) => ipcRenderer.invoke('generate-pdf', { names })
});