import * as XLSX from 'xlsx';

export function readExcelFile<T>(file: File): Promise<Array<T>> {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  return new Promise((resolve, reject) => {
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) {
        reject(new Error('could not read file'));
        return;
      }

      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      resolve(XLSX.utils.sheet_to_json<T>(worksheet));
    };

    reader.onerror = (e: ProgressEvent<FileReader>) => {
      reject(e.target?.error?.message || new Error('could not read file'));
    };
  });
}
