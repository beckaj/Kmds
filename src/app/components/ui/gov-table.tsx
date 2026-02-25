import * as React from "react";
import { Eye } from "lucide-react";

/**
 * GovTable — Figma-matched table design system for Jalanidhi.
 *
 * Usage:
 * <GovTable title="Applications">
 *   <GovTableHeader>
 *     <GovTableHeaderCell>APPLICATION NO</GovTableHeaderCell>
 *     <GovTableHeaderCell>NAME</GovTableHeaderCell>
 *   </GovTableHeader>
 *   <GovTableBody>
 *     <GovTableRow>
 *       <GovTableCell variant="id">TAP-001</GovTableCell>
 *       <GovTableCell>Rajesh Kumar</GovTableCell>
 *     </GovTableRow>
 *   </GovTableBody>
 * </GovTable>
 */

// ─── Status Badge ──────────────────────────────────────────────────────────

type BadgeVariant =
  | "pending"
  | "pendingApproval"
  | "approved"
  | "rejected"
  | "sentBack"
  | "inProgress"
  | "completed"
  | "payment"
  | "info"
  | "warning";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  pending:
    "bg-[#fef9c2] border-[#ffdf20] text-[#894b00]",
  pendingApproval:
    "bg-[#dbeafe] border-[#8ec5ff] text-[#193cb8]",
  approved:
    "bg-[#dcfce7] border-[#7bf1a8] text-[#016630]",
  rejected:
    "bg-[#fee2e2] border-[#fca5a5] text-[#991b1b]",
  sentBack:
    "bg-[#fff7ed] border-[#fdba74] text-[#9a3412]",
  inProgress:
    "bg-[#e0e7ff] border-[#a5b4fc] text-[#3730a3]",
  completed:
    "bg-[#dcfce7] border-[#7bf1a8] text-[#016630]",
  payment:
    "bg-[#fef3c7] border-[#fcd34d] text-[#92400e]",
  info:
    "bg-[#dbeafe] border-[#8ec5ff] text-[#193cb8]",
  warning:
    "bg-[#fef9c2] border-[#ffdf20] text-[#894b00]",
};

export function GovBadge({
  variant = "pending",
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] border whitespace-nowrap ${BADGE_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── View Button ───────────────────────────────────────────────────────────

export function GovViewButton({
  onClick,
  label = "View",
  disabled = false,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1f3a5f] text-white rounded-[8px] font-['Poppins',sans-serif] font-medium text-[14px] hover:bg-[#2d4a6f] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Eye className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ─── Table Components ──────────────────────────────────────────────────────

export function GovTable({
  title,
  children,
  minWidth = "1200px",
}: {
  title: string;
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Title Bar */}
      <div className="bg-[#1f3a5f] px-6 py-4 border-b border-[#e5e7eb]">
        <h2 className="font-['Poppins',sans-serif] font-semibold text-[18px] text-white leading-7">
          {title}
        </h2>
      </div>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function GovTableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
      <tr>{children}</tr>
    </thead>
  );
}

export function GovTableHeaderCell({
  children,
  className = "",
  align = "left",
  width,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  width?: string;
}) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";
  return (
    <th
      className={`px-6 py-5 font-['Poppins',sans-serif] font-semibold text-[14px] text-[#414141] uppercase tracking-wide ${alignClass} ${className}`}
      style={width ? { width } : undefined}
    >
      {children}
    </th>
  );
}

export function GovTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <tbody className="bg-white">{children}</tbody>;
}

export function GovTableRow({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#e5e7eb] hover:bg-[#f8f9fb] transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function GovTableCell({
  children,
  variant = "default",
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "id" | "muted" | "bold";
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const variantClass =
    variant === "id"
      ? "text-[#06c] font-medium"
      : variant === "muted"
      ? "text-[#6e7191]"
      : variant === "bold"
      ? "text-[#170f49] font-medium"
      : "text-[#414141]";

  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";

  return (
    <td
      className={`px-6 py-4 font-['Poppins',sans-serif] text-[14px] ${variantClass} ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────

export function GovTableEmpty({
  message = "No records found.",
  colSpan = 8,
}: {
  message?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <p className="text-gray-500 font-['Poppins',sans-serif] text-[15px]">
          {message}
        </p>
      </td>
    </tr>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────

export function GovTableLoading({
  colSpan = 8,
}: {
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1f3a5f]" />
        <p className="mt-3 text-gray-500 font-['Poppins',sans-serif] text-[14px]">
          Loading...
        </p>
      </td>
    </tr>
  );
}

// ─── Column-Based API ─────────────────────────────────────────────────────

export interface GovTableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

// Alias exports for backward compat
export const GovStatusBadge = GovBadge;
export const GovTableActionButton = GovViewButton;