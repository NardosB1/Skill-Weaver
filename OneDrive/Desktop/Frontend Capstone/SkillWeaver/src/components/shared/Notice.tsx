import { CheckCircle2, Info, XCircle } from "lucide-react";

type NoticeProps = { kind?: "success" | "error" | "info"; children: string };
export function Notice({ kind = "info", children }: NoticeProps) {
  const Icon = kind === "success" ? CheckCircle2 : kind === "error" ? XCircle : Info;
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}><Icon size={17} aria-hidden="true" />{children}</div>;
}
