import React from 'react';
import { Activity, Settings, HelpCircle, User, Bell, Clock, ShieldAlert, Cpu, FileWarning, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/common/ThemeToggle';
import { cn } from '@/shared/lib/utils';

export function Navbar() {

  const [notifications, setNotifications] = React.useState<any[]>([
    { id: 1, title: 'ACL Integrity Risk', desc: 'Frequent configuration changes or physical config issue events identified. Review ACL list consistency.', time: 'Just Now', icon: ShieldAlert, color: 'text-orange-400', read: false },
    { id: 2, title: 'Metric-Silent Anomaly', desc: 'Multiple alarms raised across 8 devices without corresponding metric spikes. Investigate correlation source.', time: '5m ago', icon: Activity, color: 'text-red-400', read: false },
    { id: 3, title: 'Predictive Flap Warning', desc: 'Topology Analysis: 12 identified devices are in danger of imminent interface flapping.', time: '15m ago', icon: Zap, color: 'text-blue-400', read: false },
    { id: 4, title: 'Global Config Drift', desc: 'Infrastructure Baseline: 24 devices reported with critical configuration drift from template.', time: '1h ago', icon: Clock, color: 'text-purple-400', read: false },
    { id: 5, title: 'High CPU Utilization', desc: 'Cross-layer alert: 5 devices are seen frequent high cpu util.', time: '2h ago', icon: Cpu, color: 'text-emerald-400', read: false }
  ]);
  const [isNotiOpen, setIsNotiOpen] = React.useState(false);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">

          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 p-1">
              <img src="/infraon_logo.jpg" alt="Infraon Logo" className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-screen" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Event Analytics</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button
              onClick={() => setIsNotiOpen(true)}
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-severity-critical">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/docs">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground hidden md:inline">Operator</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* NOTIFICATION SIDEBAR */}
      {isNotiOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/90 z-[100]"
            onClick={() => setIsNotiOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-full w-[420px] bg-[#090e1a] border-l border-white/20 z-[101] shadow-2xl flex flex-col"
            style={{ backgroundColor: '#090e1a', opacity: 1, visibility: 'visible' }}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-black tracking-tight text-white">Notifications</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotiOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar bg-[#090e1a]" style={{ backgroundColor: '#090e1a' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 tracking-wider">Unread Strategic Alerts</h3>
                  <span className="text-[9px] font-bold text-blue-400">{notifications.filter(n => !n.read).length} Alerts</span>
                </div>
                {notifications.filter(n => !n.read).map(n => (
                  <div key={n.id} className="p-5 rounded-xl bg-[#131c31] border border-white/15 hover:border-blue-500/50 transition-all shadow-xl" style={{ backgroundColor: '#131c31' }}>
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2.5 rounded-lg bg-[#090e1a] border border-white/5", n.color)}>
                        <n.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] font-bold text-white tracking-normal">{n.title}</span>
                          <span className="text-[9px] font-bold text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-xs text-white/80 font-medium leading-relaxed">{n.desc}</p>
                        <div className="mt-5">
                          <Button
                            onClick={() => markAsRead(n.id)}
                            className="h-8 px-5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold tracking-widest rounded-lg shadow-lg active:scale-95 transition-all"
                          >
                            Mark as read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.filter(n => !n.read).length === 0 && (
                  <div className="py-20 text-center text-slate-600">
                    <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-50" />
                    <p className="text-[10px] font-bold tracking-widest">All caught up</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <h3 className="text-[10px] font-black text-slate-600 tracking-wider px-2">Processed History</h3>
                {notifications.filter(n => n.read).map(n => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-white/10 opacity-50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-600">
                        <n.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-500 tracking-normal">{n.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
