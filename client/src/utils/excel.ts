import { utils, writeFile } from 'xlsx';

export const generateExcel = (data: Record<string, string>[], fileName = 'output.xlsx') => {
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  utils.book_append_sheet(wb, ws, 'Sheet1');
  writeFile(wb, fileName);
};
