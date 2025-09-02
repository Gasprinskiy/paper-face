const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // generatePDFs: (names) => ipcRenderer.invoke('generate-pdf', { names }),
  generatePDFs: ({
    subjects,
    names,
    subjectTypes,
    translitMap,
    groupNumber,
    groupID,
    schoolNumber
  }) => ipcRenderer.invoke('generate-pdf-2', {
    subjects,
    names,
    subjectTypes,
    translitMap,
    groupNumber,
    groupID,
    schoolNumber
  }),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, (event, args) => callback(args)),
});