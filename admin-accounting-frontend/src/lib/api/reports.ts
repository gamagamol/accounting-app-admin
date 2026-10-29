import { apiRequest } from "./client";

export type ReportRow = Record<string, any>;

export interface ReportLockInfo {
  id: number;
  report_code: string;
  period: string;
  as_of_date: string;
  payload: ReportRow[];
  locked_by?: number | null;
  locked_at: string;
  notes?: string | null;
}

export interface LockReportPayload {
  period: string;
  as_of_date?: string;
  notes?: string;
  locked_by?: number;
}

export function getReport(slug: string, period?: string) {
  const params = new URLSearchParams();
  if (period) params.set("period", period);
  const query = params.toString();
  return apiRequest<ReportRow[]>(
    `/api/reports/${slug}${query ? `?${query}` : ""}`,
  );
}

export function getReportLock(slug: string, period: string) {
  const params = new URLSearchParams({ period });
  return apiRequest<ReportLockInfo | null>(
    `/api/reports/${slug}/lock?${params.toString()}`,
  );
}

export function lockReport(slug: string, payload: LockReportPayload) {
  return apiRequest<ReportLockInfo>(`/api/reports/${slug}/lock`, {
    method: "POST",
    body: payload,
  });
}

export function unlockReport(slug: string, period: string) {
  const params = new URLSearchParams({ period });
  return apiRequest<null>(`/api/reports/${slug}/lock?${params.toString()}`, {
    method: "DELETE",
  });
}

export function sumBy(rows: ReportRow[], key: string): number {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}
