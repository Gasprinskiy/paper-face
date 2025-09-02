const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

const { PDFDocument } = require('pdf-lib');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'vite-app/dist', './index.html'));

  mainWindow.setMenu(null);

  // if (Boolean(process.env)) {
  // return
  // }
  // mainWindow.webContents.openDevTools();
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
  const htmlTemplate = fs.readFileSync(path.join(__dirname, './template/index.html'), 'utf8');

  // Выбираем папку для сохранения
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Выберите папку',
    buttonLabel: 'Выбрать'
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

function fontToBase64(fontPath) {
  const fontBuffer = fs.readFileSync(fontPath);
  return fontBuffer.toString('base64');
}

ipcMain.handle('generate-pdf-2', async (event, {
  subjects,
  names,
  subjectTypes,
  translitMap,
  groupNumber,
  groupID,
  schoolNumber
}) => {
  // let htmlTemplate = fs.readFileSync(path.join(__dirname, './template/index.html'), 'utf8');

  // // Встраиваем шрифты прямо в HTML
  // const fontDir = path.dirname(path.join(__dirname, './template/index.html'), 'utf8');

  // const fonts = {
  //   'Monotype-Corsiva-Regular.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Regular.ttf')),
  //   'Monotype-Corsiva-Regular-Italic.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Regular-Italic.ttf')),
  //   'Monotype-Corsiva-Bold.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Bold.ttf')),
  //   'Monotype-Corsiva-Bold-Italic.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Bold-Italic.ttf'))
  // };

  // // Заменяем url(...) в HTML на data: ссылки
  // htmlTemplate = htmlTemplate.replace(
  //   /url\('Monotype-Corsiva-Regular\.ttf'\)/g,
  //   `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Regular.ttf']}')`
  // ).replace(
  //   /url\('Monotype-Corsiva-Regular-Italic\.ttf'\)/g,
  //   `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Regular-Italic.ttf']}')`
  // ).replace(
  //   /url\('Monotype-Corsiva-Bold\.ttf'\)/g,
  //   `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Bold.ttf']}')`
  // ).replace(
  //   /url\('Monotype-Corsiva-Bold-Italic\.ttf'\)/g,
  //   `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Bold-Italic.ttf']}')`
  // );
  // Выбираем папку для сохранения
  const { filePaths, canceled } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Выберите папку',
    buttonLabel: 'Выбрать'
  });

  console.log(groupNumber,
    groupID,
    schoolNumber)
  if (canceled || filePaths.length === 0) return;

  const saveDir = filePaths[0];
  const grouped = {};
  for (const person of names) {
    for (const subjectType of subjectTypes) {
      const key = `${person.name.replace(/\s+/g, '_')}|${subjectType.name}|${subjectType.type}`;
      grouped[key] = {
        source_name: person.name,
        name: person.declension,
        genderTitle: person.gender_title,
        personSubjects: subjects,
        type: subjectType.declension
      };
    }
  }


  try {
    mainWindow.webContents.send('start')

    let count = 0
    for (const [key, { source_name, name, genderTitle, personSubjects, type }] of Object.entries(grouped)) {
      count += 1
      const mergedPdf = await PDFDocument.create();
      const [formattedName, subjectType, subjectKey] = key.split('|')

      for (const subject of personSubjects) {
        console.log("subject.lang_code: ", subject.lang_code)
        const htmlTemplate = getHtmlBylangCode(subject.lang_code)
        const tName = translitMap[source_name][subject.lang_code]

        let html = htmlTemplate
          .replace('{{SUBJECTTYPE}}', type)
          .replace('{{NAME}}', tName)
          .replace('{{SUBJECT}}', subject.declension)
          .replace('{{GENDERPOSTFIX}}', genderTitle)
          .replace('{{GROUPNUMBER}}', groupNumber)
          .replace('{{GROUPID}}', groupID)
          .replace('{{SCHOOLNUMBER}}', schoolNumber);

        if (subjectKey.toLowerCase() === 'test') {
          html = html.replace('{{NEXTLINESET}}', '<br>')
        } else {
          html = html.replace('{{NEXTLINESET}}', '')
        }

        const pdfWindow = new BrowserWindow({
          show: false,
          webPreferences: {
            webSecurity: false
          }
        });
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

        tempPdf.setTitle('');
        tempPdf.setAuthor('');
        tempPdf.setSubject('');
        tempPdf.setKeywords([]);
        tempPdf.setProducer('');
        tempPdf.setCreator('');
        tempPdf.setCreationDate(new Date());
        tempPdf.setModificationDate(new Date());

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
      fs.writeFileSync(path.join(saveDir, `${formattedName}(${subjectType}).pdf`), finalPdfData);
    }

    mainWindow.webContents.send('done', count)
  } catch (e) {
    console.log('err: ', e)
    mainWindow.webContents.send('error')
  }
});

function getHtmlBylangCode(langCode = 'ru') {
  let htmlTemplate = fs.readFileSync(path.join(__dirname, `./template/index_${langCode}.html`), 'utf8');

  // Встраиваем шрифты прямо в HTML
  const fontDir = path.dirname(path.join(__dirname, `./template/index_${langCode}.html`), 'utf8');

  const fonts = {
    'Monotype-Corsiva-Regular.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Regular.ttf')),
    'Monotype-Corsiva-Regular-Italic.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Regular-Italic.ttf')),
    'Monotype-Corsiva-Bold.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Bold.ttf')),
    'Monotype-Corsiva-Bold-Italic.ttf': fontToBase64(path.join(fontDir, 'Monotype-Corsiva-Bold-Italic.ttf'))
  };

  // Заменяем url(...) в HTML на data: ссылки
  htmlTemplate = htmlTemplate.replace(
    /url\('Monotype-Corsiva-Regular\.ttf'\)/g,
    `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Regular.ttf']}')`
  ).replace(
    /url\('Monotype-Corsiva-Regular-Italic\.ttf'\)/g,
    `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Regular-Italic.ttf']}')`
  ).replace(
    /url\('Monotype-Corsiva-Bold\.ttf'\)/g,
    `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Bold.ttf']}')`
  ).replace(
    /url\('Monotype-Corsiva-Bold-Italic\.ttf'\)/g,
    `url('data:font/ttf;base64,${fonts['Monotype-Corsiva-Bold-Italic.ttf']}')`
  );

  return htmlTemplate
}