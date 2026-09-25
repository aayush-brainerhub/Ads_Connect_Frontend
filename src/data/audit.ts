import { createServerFn } from "@tanstack/react-start";
import { apiGet } from "./api-client";

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail: string;
  userRole: string;
  entityName: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "LOGIN" | "PAYMENT";
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  createdDate: string;
}

export const getAuditLogs = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuditLogItem[]> => {
    try {
      const res = await apiGet<AuditLogItem[]>("/api/Audit/GetAuditLogs");
      if (res) return res;
    } catch {
      // Return empty if offline or no logs yet
    }
    return [];
  },
);
