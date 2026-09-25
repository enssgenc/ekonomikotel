import { parentPort, workerData } from "node:worker_threads";
import ExcelJS from "exceljs";
try {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(Buffer.from(workerData));
  const sheet = book.worksheets[0];
  if (!sheet || sheet.rowCount > 201 || sheet.columnCount > 20)
    throw new Error(
      "İlk sayfada en fazla 200 içerik satırı ve 20 sütun olabilir.",
    );
  const rows = [];
  sheet.eachRow((row, index) => {
    const values = row.values.slice(1).map((v) => {
      if (v === null || v === undefined) return "";
      if (typeof v === "object")
        throw new Error(
          "Formül, bağlantı veya biçimlendirilmiş hücre yerine düz metin kullanın.",
        );
      return String(v).trim();
    });
    rows.push({ index, values });
  });
  parentPort.postMessage({ rows });
} catch (error) {
  parentPort.postMessage({ error: error.message });
}
