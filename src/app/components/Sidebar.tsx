import { useState, useEffect } from "react";
import { 
  Droplets, 
  FileText, 
  Settings, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Home,
  HelpCircle
} from "lucide-react";
import { cn } from "./ui/utils";

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-5 h-5" />,
    path: "/"
  },
  {
    id: "jalanidhi",
    label: "Jalanidhi",
    icon: <Droplets className="w-5 h-5" />,
    children: [
      {
        id: "tap-connection",
        label: "Tap Connection",
        icon: <Droplets className="w-4 h-4" />,
        subItems: [
          { id: "new-connection", label: "New Connection", path: "/jalanidhi/tap/new" },
          { id: "reconnection", label: "Reconnection", path: "/jalanidhi/tap/reconnect" },
          { id: "disconnection", label: "Disconnection", path: "/jalanidhi/tap/disconnect" },
        ]
      },
      {
        id: "borewell",
        label: "Borewell",
        icon: <Droplets className="w-4 h-4" />,
        path: "/jalanidhi/borewell"
      },
      {
        id: "ugd",
        label: "UGD",
        icon: <Droplets className="w-4 h-4" />,
        path: "/jalanidhi/ugd"
      },
    ]
  },
  {
    id: "trade-license",
    label: "Trade License",
    icon: <FileText className="w-5 h-5" />,
    path: "/trade-license"
  },
  {
    id: "utility-management",
    label: "Utility Management",
    icon: <Settings className="w-5 h-5" />,
    path: "/utility"
  },
  {
    id: "esweerkruthi",
    label: "Esweerkruthi",
    icon: <Sparkles className="w-5 h-5" />,
    path: "/esweerkruthi"
  },
];

interface SidebarProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export default function Sidebar({ activePath = "/", onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('mainSidebar_isCollapsed');
    return saved === 'true';
  });
  
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('mainSidebar_expandedItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('mainSidebar_expandedSubItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('mainSidebar_isCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('mainSidebar_expandedItems', JSON.stringify(expandedItems));
  }, [expandedItems]);

  useEffect(() => {
    localStorage.setItem('mainSidebar_expandedSubItems', JSON.stringify(expandedSubItems));
  }, [expandedSubItems]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSubExpanded = (id: string) => {
    setExpandedSubItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleNavigation = (path?: string) => {
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  if (isCollapsed) {
    return (
      <div className="h-full bg-white border-r border-gray-200 w-[70px] flex flex-col shadow-sm">
        {/* Collapsed Toggle Button */}
        <div className="h-[60px] border-b border-gray-200 flex items-center justify-center px-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Collapsed Menu Icons */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.children) {
                    handleNavigation(item.path);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                  activePath === item.path 
                    ? "bg-[#1f3a5f] text-white" 
                    : "text-[#1f3a5f] hover:bg-[#f0f4f8]"
                )}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </nav>

        {/* Collapsed Bottom Icons */}
        <div className="border-t border-gray-200 py-4 px-2 space-y-2">
          <button
            className="w-full flex items-center justify-center p-3 rounded-lg text-[#1f3a5f] hover:bg-[#f0f4f8] transition-all"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 w-[246px] flex flex-col shadow-sm">
      {/* City Name Header with Collapse Toggle */}
      <div className="h-[60px] border-b border-gray-200 flex items-center justify-between px-5">
        <h2 className="text-[18px] font-bold text-[#1b212d] font-['Poppins',sans-serif]">
          DMA Karnataka
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {/* Main Menu Item */}
              <button
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.id);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  activePath === item.path 
                    ? "bg-[#1f3a5f] text-white font-semibold" 
                    : "text-[#1b212d] hover:bg-[#f0f4f8]"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center",
                  activePath === item.path ? "text-white" : "text-[#1f3a5f] group-hover:text-[#009fbc]"
                )}>
                  {item.icon}
                </div>
                
                <span className="flex-1 text-left text-[14px] font-['Poppins',sans-serif] font-semibold">
                  {item.label}
                </span>
                
                {item.children && (
                  expandedItems.includes(item.id) 
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Sub Menu Items */}
              {item.children && expandedItems.includes(item.id) && (
                <div className="ml-6 mt-1 space-y-1 pl-3">
                  {item.children.map((child) => (
                    <div key={child.id}>
                      {/* Child Menu Item */}
                      <button
                        onClick={() => {
                          if (child.subItems) {
                            toggleSubExpanded(child.id);
                          } else {
                            handleNavigation(child.path);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-all duration-200 text-[13px] font-['Poppins',sans-serif]",
                          activePath === child.path
                            ? "bg-[#1f3a5f] text-white font-semibold"
                            : "text-[#1b212d] hover:bg-[#f0f4f8] font-medium"
                        )}
                      >
                        <div className={cn(
                          activePath === child.path ? "text-white" : "text-[#1f3a5f]"
                        )}>
                          {child.icon}
                        </div>
                        <span className="flex-1 text-left">{child.label}</span>
                        {child.subItems && (
                          expandedSubItems.includes(child.id)
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Sub-Sub Menu Items */}
                      {child.subItems && expandedSubItems.includes(child.id) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {child.subItems.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleNavigation(subItem.path)}
                              className={cn(
                                "w-full text-left px-4 py-2 rounded-md transition-all duration-200 text-[13px] font-['Poppins',sans-serif]",
                                activePath === subItem.path
                                  ? "bg-[#1f3a5f] text-white font-semibold"
                                  : "text-[#1b212d] hover:bg-[#f0f4f8] font-medium"
                              )}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Menu Items */}
      <div className="border-t border-gray-200 py-2 px-3">
        <div className="space-y-1">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#344054] hover:bg-gray-50 transition-all duration-200"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[14px] font-['Poppins',sans-serif] font-medium">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
}