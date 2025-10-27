import { mkConfig, generateCsv, download } from "export-to-csv";
import { toast } from "sonner";

export interface CSVOptions {
  filename?: string;
  showTitle?: boolean;
  title?: string;
  useKeysAsHeaders?: boolean;
}

/**
 * Export data array to CSV file
 * @param data Array of objects to export
 * @param options CSV export options
 */
export function exportToCSV<T extends Record<string, any>>(data: T[], options?: CSVOptions) {
  if (!data || data.length === 0) {
    toast.warning("No data to export");
    return;
  }

  const config = mkConfig({
    filename: options?.filename || "export",
    showTitle: options?.showTitle ?? false,
    title: options?.title || "",
    useKeysAsHeaders: options?.useKeysAsHeaders ?? true,
  });

  const csv = generateCsv(config)(data);
  download(config)(csv);
}
