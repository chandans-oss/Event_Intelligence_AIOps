import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Workflow,
  BarChart3,
  FolderArchive,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { path: "/", label: "AIOps Dashboard", icon: LayoutDashboard },
      { path: "/dashboard/prediction", label: "Topology Dashboard", icon: Activity },
      { path: "/dashboard/kpi", label: "ROI/KPI Dashboard", icon: BarChart3 },
    ]
  },
  {
    path: "/events",
    label: "Events",
    icon: Activity,
  },

  {
    path: "/admin",
    label: "Admin",
    icon: Settings,
    children: [
      { path: "/admin", label: "Configuration", icon: Settings },
    ]
  },

  {
    path: "/playground",
    label: "Playground",
    icon: Settings,
    children: [
      { path: "/playground/rca", label: "RCA Playground", icon: Workflow },
      { path: "/event-processing/deduplication", label: "Event Deduplication", icon: FolderArchive },
      { path: "/event-processing/suppression", label: "Event Suppression", icon: ShieldCheck },
      { path: "/event-processing/bulk-processing", label: "Event - Bulk Processing", icon: FolderArchive },
    ]
  },

];

export function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();

  // Auto-expand menus based on current path
  useEffect(() => {
    const activeParents = navItems
      .filter(item => item.children?.some(child => location.pathname === child.path))
      .map(item => item.path);

    if (activeParents.length > 0) {
      setOpenMenus(prev => {
        const newMenus = [...prev];
        activeParents.forEach(p => {
          if (!newMenus.includes(p)) newMenus.push(p);
        });
        return newMenus;
      });
    }
  }, [location.pathname]);

  const toggleMenu = (path: string) => {
    setOpenMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = location.pathname === item.path || (location.pathname + location.search) === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.path);
    const isChildActive = hasChildren && item.children?.some(child =>
      location.pathname === child.path || (location.pathname + location.search) === child.path
    );
    const Icon = item.icon;

    const content = (
      <>
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn(level === 0 ? "h-5 w-5" : "h-4 w-4", "flex-shrink-0")} />
          <span className={cn(level === 0 ? "text-sm" : "text-[13px]", "font-medium truncate")}>
            {item.label}
          </span>
        </div>
        {hasChildren && !collapsed && (
          <ChevronDown className={cn("h-4 w-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
        )}
      </>
    );

    if (collapsed && level === 0) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to={hasChildren ? item.children![0].path : item.path}
              className={cn(
                "flex items-center justify-center h-10 w-full rounded-lg transition-colors",
                (isActive || isChildActive)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (hasChildren && !collapsed) {
      return (
        <Collapsible key={item.path} open={isOpen} onOpenChange={() => toggleMenu(item.path)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-between w-full min-h-[2.5rem] py-2 px-3 rounded-lg transition-colors",
                isChildActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                level > 0 && "py-1.5"
              )}
              style={{ paddingLeft: `${(level + 1) * 12}px` }}
            >
              {content}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent key={child.path} item={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 h-10 px-3 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          level > 0 && "h-8"
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
      >
        {content}
      </NavLink>
    );
  };

  return (
    <div className={cn("h-full bg-card/50 border-r border-border flex flex-col transition-all duration-300 relative", collapsed ? "w-16" : "w-56")}>
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background shadow-md z-50 hover:bg-secondary"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      <nav className="flex-1 p-2 pt-6 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavItemComponent key={item.path} item={item} />)}
      </nav>
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
        </div>
      )}
    </div>
  );
}
