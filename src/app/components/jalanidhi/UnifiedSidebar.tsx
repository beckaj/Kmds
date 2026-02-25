import { useState, useEffect, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path?: string;            // for leaf items — passed to onNavigate
  children?: SidebarMenuItem[];
  /** Additional paths that should mark this item as active */
  matchPaths?: string[];
  /** If true the item always appears active (parent highlighting override) */
  forceActive?: boolean;
}

export interface SidebarFooterAction {
  label: string;
  subtitle?: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'gradient' | 'outline';
}

export interface UnifiedSidebarProps {
  /** Title shown in the sidebar header */
  title: string;
  /** Menu tree items */
  items: SidebarMenuItem[];
  /** Currently active path / view key */
  activePath: string;
  /** Called when a leaf item is clicked */
  onNavigate: (path: string) => void;
  /** Optional footer action button */
  footerAction?: SidebarFooterAction;
  /** Persist expand/collapse under this localStorage key prefix */
  storageKey?: string;
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Whether the sidebar can collapse at all (default: true) */
  collapsible?: boolean;
  /** Footer content (rendered below nav, above footer action) */
  footerContent?: ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className || 'w-[18px] h-[18px]'} fill="none" viewBox="0 0 20 20">
    <path d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d="M10 5C11.1046 5 12 5.89543 12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    <path d="M10 11C11.1046 11 12 11.8954 12 13C12 14.1046 11.1046 15 10 15C8.89543 15 8 14.1046 8 13C8 11.8954 8.89543 11 10 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

// ── Check whether a path or any of its children is active ────────────────────

function isItemActive(item: SidebarMenuItem, activePath: string): boolean {
  if (item.forceActive) return true;
  if (item.path && item.path === activePath) return true;
  if (item.matchPaths) {
    for (const mp of item.matchPaths) {
      if (activePath === mp) return true;
      if (activePath.startsWith(mp + '/')) return true;
      if (mp.endsWith('*') && activePath.startsWith(mp.slice(0, -1))) return true;
    }
  }
  if (item.children) {
    for (const child of item.children) {
      if (isItemActive(child, activePath)) return true;
    }
  }
  return false;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function UnifiedSidebar({
  title,
  items,
  activePath,
  onNavigate,
  footerAction,
  storageKey = 'unifiedSidebar',
  defaultCollapsed = false,
  collapsible = true,
  footerContent,
}: UnifiedSidebarProps) {
  // ── Collapse state ──
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (!collapsible) return false;
    const saved = localStorage.getItem(storageKey + '_collapsed');
    return saved !== null ? saved === 'true' : defaultCollapsed;
  });

  useEffect(() => {
    if (collapsible) {
      localStorage.setItem(storageKey + '_collapsed', isCollapsed.toString());
    }
  }, [isCollapsed, storageKey, collapsible]);

  // ── Expand state ──
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey + '_expanded');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey + '_expanded', JSON.stringify(expandedIds));
  }, [expandedIds, storageKey]);

  // Auto-expand parent groups whose child is active
  useEffect(() => {
    const shouldExpand: string[] = [];
    const walk = (list: SidebarMenuItem[]) => {
      for (const item of list) {
        if (item.children && item.children.length > 0) {
          if (isItemActive(item, activePath) && !expandedIds.includes(item.id)) {
            shouldExpand.push(item.id);
          }
          walk(item.children);
        }
      }
    };
    walk(items);
    if (shouldExpand.length > 0) {
      setExpandedIds((prev) => [...new Set([...prev, ...shouldExpand])]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Style helpers (matches citizen sidebar design) ──

  /** Top-level parent button */
  const parentBtnClass = (item: SidebarMenuItem) => {
    const active = isItemActive(item, activePath);
    const expanded = expandedIds.includes(item.id);
    if (active) return 'text-[#1f3a5f] font-semibold';
    if (expanded) return 'text-[#1f3a5f] font-semibold';
    return 'text-[#4b5563] font-medium hover:bg-[#f1f5f9] hover:text-[#1b212d]';
  };

  /** Top-level leaf */
  const leafBtnClass = (item: SidebarMenuItem) => {
    const active = isItemActive(item, activePath);
    if (active) return 'text-[#1f3a5f] font-semibold bg-[#eef2ff]';
    return 'text-[#4b5563] font-medium hover:bg-[#f1f5f9] hover:text-[#1b212d]';
  };

  /** Level-1 child */
  const childBtnClass = (item: SidebarMenuItem) => {
    const active = isItemActive(item, activePath);
    if (active) return 'text-[#1f3a5f] font-semibold bg-[#eef2ff] border-l-[3px] border-[#1f3a5f]';
    return 'text-[#4b5563] font-medium border-l-[3px] border-transparent hover:bg-[#f1f5f9] hover:text-[#1b212d]';
  };

  /** Level-2 deep child */
  const deepChildBtnClass = (item: SidebarMenuItem) => {
    const active = isItemActive(item, activePath);
    if (active) return 'text-[#1f3a5f] font-semibold bg-[#eef2ff] border-l-[3px] border-[#1f3a5f]';
    return 'text-[#4b5563] font-medium border-l-[3px] border-transparent hover:bg-[#f1f5f9] hover:text-[#1b212d]';
  };

  // ── Renderers ──

  /** Render a deep-level-2 child (leaf only) */
  const renderDeepChild = (item: SidebarMenuItem) => (
    <button
      key={item.id}
      onClick={() => item.path && onNavigate(item.path)}
      className={
        "h-[32px] w-full rounded-r-lg flex items-center pl-3 pr-2 text-[12.5px] font-['Poppins',sans-serif] transition-colors whitespace-nowrap " +
        deepChildBtnClass(item)
      }
    >
      {item.label}
    </button>
  );

  /** Render a level-1 child — could be leaf or a sub-group with deep children */
  const renderChild = (item: SidebarMenuItem) => {
    const hasKids = item.children && item.children.length > 0;

    if (!hasKids) {
      return (
        <button
          key={item.id}
          onClick={() => item.path && onNavigate(item.path)}
          className={
            "h-[34px] w-full rounded-r-lg flex items-center pl-3 pr-2 text-[13px] font-['Poppins',sans-serif] transition-colors whitespace-nowrap " +
            childBtnClass(item)
          }
        >
          {item.label}
        </button>
      );
    }

    // Sub-group with deep children
    const isExp = expandedIds.includes(item.id);
    return (
      <div key={item.id}>
        <button
          onClick={() => toggleExpand(item.id)}
          className={
            "h-[34px] w-full rounded-r-lg flex items-center justify-between pl-3 pr-2 text-[13px] font-['Poppins',sans-serif] transition-colors whitespace-nowrap border-l-[3px] " +
            (isItemActive(item, activePath)
              ? 'border-[#1f3a5f] text-[#1f3a5f] font-semibold'
              : isExp
                ? 'border-transparent text-[#1f3a5f] font-medium'
                : "border-transparent text-[#4b5563] font-medium hover:bg-[#f1f5f9] hover:text-[#1b212d]")
          }
        >
          <span className="flex items-center gap-2">
            {item.label}
          </span>
          <ChevronRight
            className={
              'w-3.5 h-3.5 shrink-0 transition-transform duration-200 ' +
              (isExp ? 'rotate-90' : '')
            }
          />
        </button>
        {isExp && (
          <div className="ml-3 mt-0.5 flex flex-col gap-1">
            {item.children && item.children.map(renderDeepChild)}
          </div>
        )}
      </div>
    );
  };

  /** Render a top-level item — could be a leaf or a parent with children */
  const renderTopItem = (item: SidebarMenuItem) => {
    const hasKids = item.children && item.children.length > 0;

    if (!hasKids) {
      // Leaf
      return (
        <button
          key={item.id}
          onClick={() => item.path && onNavigate(item.path)}
          className={
            'h-[38px] w-full rounded-lg flex items-center transition-colors whitespace-nowrap ' +
            (isCollapsed ? 'justify-center px-0' : 'gap-3 px-3') +
            ' ' +
            leafBtnClass(item)
          }
          title={isCollapsed ? item.label : ''}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          {!isCollapsed && (
            <span className="text-[13.5px] font-['Poppins',sans-serif]">{item.label}</span>
          )}
        </button>
      );
    }

    // Parent with children
    const isExp = expandedIds.includes(item.id);
    return (
      <div key={item.id}>
        <button
          onClick={() => toggleExpand(item.id)}
          className={
            'h-[38px] w-full rounded-lg flex items-center transition-colors whitespace-nowrap ' +
            (isCollapsed ? 'justify-center px-0' : 'justify-between px-3') +
            ' ' +
            parentBtnClass(item)
          }
          title={isCollapsed ? item.label : ''}
        >
          {isCollapsed ? (
            item.icon && <span className="shrink-0">{item.icon}</span>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="text-[13.5px] font-['Poppins',sans-serif]">{item.label}</span>
              </div>
              <ChevronDown
                className={
                  'w-4 h-4 shrink-0 transition-transform duration-200 ' +
                  (isExp ? 'rotate-180' : '')
                }
              />
            </>
          )}
        </button>

        {isExp && !isCollapsed && (
          <div className="ml-[30px] mt-1 flex flex-col gap-1">
            {item.children && item.children.map(renderChild)}
          </div>
        )}
      </div>
    );
  };

  // ── Render ──

  return (
    <div
      className={
        'bg-white border-r border-[#e5e7eb] h-full flex flex-col ' +
        (isCollapsed ? 'w-[68px]' : 'w-[272px]')
      }
      style={{ transition: 'width 300ms ease-in-out' }}
    >
      {/* Header */}
      <div className="h-[56px] border-b border-[#e5e7eb] flex items-center justify-between px-4 shrink-0">
        {!isCollapsed && (
          <h2 className="text-[15px] font-bold text-[#1f3a5f] font-['Poppins',sans-serif] whitespace-nowrap">
            {title}
          </h2>
        )}
        {collapsible && (
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#f1f5f9] transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#1f3a5f]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#1f3a5f]" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="flex flex-col gap-1.5">
          {items.map(renderTopItem)}
        </div>
      </nav>

      {/* Footer content (optional) */}
      {footerContent && (
        <div className="border-t border-[#e5e7eb] px-3 py-2 shrink-0">
          {footerContent}
        </div>
      )}

      {/* Footer action button */}
      {footerAction && (
        <div className="border-t border-[#e5e7eb] py-2 px-3 shrink-0">
          {footerAction.variant === 'gradient' ? (
            <div>
              <button
                onClick={footerAction.onClick}
                className={
                  'w-full h-[48px] bg-gradient-to-r from-[#27548a] to-[#00859f] hover:from-[#1f3a5f] hover:to-[#0078a0] text-white rounded-[12px] flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer ' +
                  (isCollapsed ? 'px-0' : '')
                }
                title={isCollapsed ? footerAction.label : ''}
              >
                {footerAction.icon}
                {!isCollapsed && (
                  <span className="text-sm font-semibold font-['Poppins',sans-serif]">
                    {footerAction.label}
                  </span>
                )}
              </button>
              {!isCollapsed && footerAction.subtitle && (
                <p className="text-xs text-gray-500 text-center mt-2 font-['Poppins',sans-serif]">
                  {footerAction.subtitle}
                </p>
              )}
            </div>
          ) : footerAction.variant === 'outline' ? (
            <button
              onClick={footerAction.onClick}
              className="w-full h-[38px] bg-white hover:bg-gray-50 text-[#1f3a5f] border border-[#1f3a5f] rounded-lg flex items-center justify-center gap-2 transition-all font-['Poppins',sans-serif] font-semibold text-sm"
              title={isCollapsed ? footerAction.label : ''}
            >
              {footerAction.icon}
              {!isCollapsed && footerAction.label}
            </button>
          ) : (
            <button
              onClick={footerAction.onClick}
              className={
                'h-[38px] w-full rounded-lg flex items-center text-[#4b5563] hover:bg-[#f1f5f9] hover:text-[#1b212d] transition-colors whitespace-nowrap ' +
                (isCollapsed ? 'justify-center px-0' : 'gap-3 px-3')
              }
            >
              {footerAction.icon || <HelpCircleIcon className="w-[18px] h-[18px] shrink-0" />}
              {!isCollapsed && (
                <span className="text-[13.5px] font-medium font-['Poppins',sans-serif]">
                  {footerAction.label}
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}