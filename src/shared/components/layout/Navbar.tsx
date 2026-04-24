import React from 'react';
import { HelpCircle, Bell, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/lib/utils';
import { mockNotifications } from '@/shared/data/notificationData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  // Determine page title based on path - Standardized to Pascal Case
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'RCA Intelligence Dashboard';
    if (path.startsWith('/events')) return 'Event Analysis';
    if (path.startsWith('/admin')) return 'Admin Management';
    if (path.startsWith('/analytics')) return 'Performance Analytics';
    if (path.startsWith('/docs')) return 'Platform Documentation';
    if (path.startsWith('/rca/detail')) return 'Root Cause Investigation';
    return 'RCA Intelligence';
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src="/infraon_logo.jpg" 
            alt="Infraon Logo" 
            className="h-8 w-8 object-contain rounded-md"
          />
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Infraon
          </h1>
        </div>
        <div className="h-6 w-[1px] bg-border mx-2" />
        <h2 className="text-sm font-medium text-muted-foreground">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/docs')}
          className="text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Documentation</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px] text-white border-none">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4 mt-2 bg-card border-border shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-bold">Notifications</h3>
                <Badge variant="outline" className="text-[10px] font-bold">{unreadCount} New</Badge>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-border">
                  {mockNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                        !notif.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          notif.severity === 'Critical' ? "bg-red-500" : 
                          notif.severity === 'Major' ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1 space-y-1">
                          <p className="text-[13px] font-bold leading-none">{notif.title}</p>
                          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 font-medium">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t border-border bg-muted/30 text-center">
                <Button variant="ghost" size="sm" className="w-full text-[11px] font-bold text-primary hover:bg-primary/10">
                  View All Notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-foreground">Chandan S</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Infraon Admin</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            C
          </div>
        </div>
      </div>
    </header>
  );
}

