const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

const { PDFDocument } = require('pdf-lib');
const AppEventBus = require('./event-bus/index.js').default;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'vite-app/dist', './index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('generate-pdf', async (event, { names }) => {
  const htmlTemplate = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

  // Выбираем папку для сохранения
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Выберите папку для PDF'
  });

  if (canceled || filePaths.length === 0) return;

  const saveDir = filePaths[0];

  for (const item of names) {
    const { subject, genderTitle, groupName, name } = item
    const html = htmlTemplate
      .replace('{{NAME}}', name)
      .replace('{{SUBJECT}}', subject)
      .replace('{{GENDERPOSTFIX}}', genderTitle)
      .replace('{{GROUPNAME}}', groupName);

    const pdfWindow = new BrowserWindow({ show: false });
    await pdfWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    let pdfData = await pdfWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      landscape: true,
      pageRanges: '1',
      marginsType: 1,
      preferCSSPageSize: true
    });

    // ✅ Чистим PDF через pdf-lib
    const pdfDoc = await PDFDocument.load(pdfData);
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    pdfData = await pdfDoc.save()

    const fileName = `${name}.pdf`; // Можно добавить дату/время
    const filePath = path.join(saveDir, fileName);

    fs.writeFileSync(filePath, pdfData);
    pdfWindow.close();
  }
});

ipcMain.handle('generate-pdf-2', async (event, {
  subjects,
  names,
  subjectTypes,
  groupName,
}) => {
  const htmlTemplate = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  // Выбираем папку для сохранения
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Выберите папку для PDF'
  });

  if (canceled || filePaths.length === 0) return;

  const saveDir = filePaths[0];

  const grouped = {};
  for (const person of names) {
    for (const type of subjectTypes) {
      const key = `${person.name.replace(/\s+/g, '_')}|${type}`;
      grouped[key] = {
        name: person.declension,
        genderTitle: person.gender_title,
        personSubjects: subjects
      };
    }
  }


  try {
    AppEventBus.dispatch({
      key: 'on_start'
    })

    let count = 0
    for (const [key, { name, genderTitle, personSubjects }] of Object.entries(grouped)) {
      count += 1
      const mergedPdf = await PDFDocument.create();
      const subjectType = key.split('|')[1]

      for (const subject of personSubjects) {
        const html = htmlTemplate
          .replace('{{SUBJECTTYPE}}', subjectType)
          .replace('{{NAME}}', name)
          .replace('{{SUBJECT}}', subject)
          .replace('{{GENDERPOSTFIX}}', genderTitle)
          .replace('{{GROUPNAME}}', groupName);

        const pdfWindow = new BrowserWindow({ show: false });
        await pdfWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

        const pdfData = await pdfWindow.webContents.printToPDF({
          pageSize: 'A4',
          printBackground: true,
          landscape: true,
          pageRanges: '1',
          marginsType: 1,
          preferCSSPageSize: true
        });

        const tempPdf = await PDFDocument.load(pdfData);
        const copiedPages = await mergedPdf.copyPages(tempPdf, tempPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));

        pdfWindow.close();
      }

      // Очищаем метаданные у итогового файла
      mergedPdf.setTitle('');
      mergedPdf.setAuthor('');
      mergedPdf.setSubject('');
      mergedPdf.setKeywords([]);
      mergedPdf.setProducer('');
      mergedPdf.setCreator('');
      mergedPdf.setCreationDate(new Date());
      mergedPdf.setModificationDate(new Date());

      const finalPdfData = await mergedPdf.save();
      fs.writeFileSync(path.join(saveDir, `${key}.pdf`), finalPdfData);
    }

    AppEventBus.dispatch({
      key: 'on_done',
      arg: count
    })
  } catch (e) {
    console.log('err: ', e)
    AppEventBus.dispatch({
      key: 'on_start'
    })
  }
});
