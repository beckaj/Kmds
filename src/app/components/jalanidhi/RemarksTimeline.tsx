import React from 'react';
import svgPaths from '../../../imports/svg-ojdi231zln';

export interface RemarkEntry {
  role: string;
  comment: string;
  timestamp?: string;
  variant?: 'default' | 'approved' | 'rejected' | 'sent_back';
}

interface RemarksTimelineProps {
  remarks: RemarkEntry[];
  title?: string;
  className?: string;
}

// Role badge pill colors
const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  'Citizen':            { bg: 'bg-blue-100',   text: 'text-blue-800' },
  'Applicant':          { bg: 'bg-blue-100',   text: 'text-blue-800' },
  'Creator':            { bg: 'bg-[#f3f4f6]',  text: 'text-[#364153]' },
  'Plumber':            { bg: 'bg-teal-100',    text: 'text-teal-800' },
  'Caseworker':         { bg: 'bg-sky-100',     text: 'text-sky-800' },
  'Case Worker':        { bg: 'bg-sky-100',     text: 'text-sky-800' },
  'Revenue Officer':    { bg: 'bg-amber-100',   text: 'text-amber-800' },
  'Field Engineer':     { bg: 'bg-indigo-100',  text: 'text-indigo-800' },
  'Commissioner':       { bg: 'bg-[#e8edf3]',   text: 'text-[#1f3a5f]' },
  'Bill Collector':     { bg: 'bg-orange-100',  text: 'text-orange-800' },
  'Project Director':   { bg: 'bg-purple-100',  text: 'text-purple-800' },
  'ULB Admin':          { bg: 'bg-rose-100',    text: 'text-rose-800' },
};

// Variant badge overrides
const VARIANT_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  'approved':  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Approved' },
  'rejected':  { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Rejected' },
  'sent_back': { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Sent Back' },
};

// Avatar circle colors per role
const AVATAR_BG: Record<string, string> = {
  'Citizen':            'bg-blue-100',
  'Applicant':          'bg-blue-100',
  'Plumber':            'bg-teal-100',
  'Caseworker':         'bg-sky-100',
  'Case Worker':        'bg-sky-100',
  'Revenue Officer':    'bg-amber-100',
  'Field Engineer':     'bg-indigo-100',
  'Commissioner':       'bg-[#d6dfe8]',
  'Bill Collector':     'bg-orange-100',
  'Project Director':   'bg-purple-100',
  'ULB Admin':          'bg-rose-100',
};

const AVATAR_STROKE: Record<string, string> = {
  'Citizen':            '#3b82f6',
  'Applicant':          '#3b82f6',
  'Plumber':            '#14b8a6',
  'Caseworker':         '#0284c7',
  'Case Worker':        '#0284c7',
  'Revenue Officer':    '#f59e0b',
  'Field Engineer':     '#6366f1',
  'Commissioner':       '#1f3a5f',
  'Bill Collector':     '#f97316',
  'Project Director':   '#7c3aed',
  'ULB Admin':          '#e11d48',
};

function formatRemarkTimestamp(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

function PersonIcon({ stroke }: { stroke: string }) {
  return (
    <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 20 20">
      <path
        d={svgPaths.p2026e800}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.66667"
      />
      <path
        d={svgPaths.p32ab0300}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.66667"
      />
    </svg>
  );
}

export function RemarksTimeline({ remarks, title, className }: RemarksTimelineProps) {
  const validRemarks = remarks.filter((r) => r && r.comment && r.comment.trim());

  if (validRemarks.length === 0) {
    return null;
  }

  return (
    <div
      className={
        'bg-white relative rounded-[10px] ' +
        (className || '')
      }
      style={{ boxShadow: '0px 4px 6px 0px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.1)' }}
    >
      {/* Border overlay */}
      <div
        aria-hidden="true"
        className="absolute border-[#e5e7eb] border border-solid inset-0 pointer-events-none rounded-[10px]"
      />

      {/* Content */}
      <div className="px-6 pt-6 pb-5 flex flex-col gap-5">
        {/* Header with orange bar */}
        <div className="flex gap-2 items-center h-7">
          <div className="bg-[#f54900] w-[4px] h-[24px] rounded-full shrink-0" />
          <h3 className="font-['Poppins',sans-serif] font-semibold text-[18px] leading-7 text-[#170f49] uppercase tracking-[0.01em]">
            {title || 'Comments & History'}
          </h3>
        </div>

        {/* Remarks list */}
        <div className="flex flex-col gap-5">
          {validRemarks.map((remark, index) => {
            const formattedTime = remark.timestamp ? formatRemarkTimestamp(remark.timestamp) : '';
            const roleBadge = ROLE_BADGE[remark.role] || { bg: 'bg-[#f3f4f6]', text: 'text-[#364153]' };
            const variantBadge = remark.variant && remark.variant !== 'default' && VARIANT_BADGE[remark.variant]
              ? VARIANT_BADGE[remark.variant]
              : null;
            const avatarBg = AVATAR_BG[remark.role] || 'bg-[#e5e7eb]';
            const avatarStroke = AVATAR_STROKE[remark.role] || '#4A5565';

            return (
              <div key={remark.role + '-' + index} className="flex gap-4 items-start">
                {/* Avatar circle */}
                <div
                  className={
                    'w-10 h-10 rounded-full shrink-0 flex items-center justify-center ' +
                    avatarBg
                  }
                >
                  <PersonIcon stroke={avatarStroke} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {/* Badge • Variant Badge • Timestamp */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Role badge pill */}
                    <span
                      className={
                        'inline-flex items-center px-2 py-[2px] rounded-full font-[\'Poppins\',sans-serif] text-[14px] leading-5 font-medium ' +
                        roleBadge.bg + ' ' + roleBadge.text
                      }
                    >
                      {remark.role}
                    </span>

                    {/* Variant badge if applicable */}
                    {variantBadge && (
                      <>
                        <span className="font-['Arimo',sans-serif] text-[12px] leading-4 text-[#6a7282]">
                          &bull;
                        </span>
                        <span
                          className={
                            'inline-flex items-center px-2 py-[2px] rounded-full font-[\'Poppins\',sans-serif] text-[12px] leading-5 font-medium ' +
                            variantBadge.bg + ' ' + variantBadge.text
                          }
                        >
                          {variantBadge.label}
                        </span>
                      </>
                    )}

                    {formattedTime && (
                      <>
                        <span className="font-['Arimo',sans-serif] text-[12px] leading-4 text-[#6a7282]">
                          &bull;
                        </span>
                        <span className="font-['Poppins',sans-serif] text-[14px] leading-5 text-[#6a7282]">
                          {formattedTime}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Comment text */}
                  <p className="font-['Poppins',sans-serif] text-[14px] leading-5 text-[#364153]">
                    {remark.comment}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}