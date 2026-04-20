import { useState } from "react";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";

const SCOPES = [
  { 
    id: "device", 
    label: "Device Specific", 
    desc: "Train on individual device data (router or switch)" 
  },
  { 
    id: "topology", 
    label: "Topology Based", 
    desc: "Analyze patterns across the entire network topology" 
  },
  { 
    id: "group", 
    label: "Device Group Based", 
    desc: "Focus on specific clusters or functional groups of devices" 
  }
];

export default function AlgoConfigPage() {
  const [scope, setScope] = useState("device");

  return (
    <MainLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Training Scope Column */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#3DDAB4] uppercase tracking-[0.2em] px-1">
              TrainingScope
            </label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-full h-12 bg-[#121826] border-white/5 rounded-xl text-slate-200 px-4 focus:ring-1 focus:ring-[#3DDAB4]/50 hover:border-white/10 transition-all font-medium">
                <SelectValue placeholder="Select Scope" />
              </SelectTrigger>
              <SelectContent className="bg-[#121826] border-white/10 text-slate-300 rounded-xl">
                {SCOPES.map((s) => (
                  <SelectItem 
                    key={s.id} 
                    value={s.id} 
                    className="focus:bg-[#3DDAB4] focus:text-[#0B0F19] rounded-lg py-2.5"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-[#475569] font-medium leading-relaxed px-1">
              {SCOPES.find(s => s.id === scope)?.desc}
            </p>
          </div>

          {/* Device Selection Column (Placeholder as per UI in image 2) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#3DDAB4] uppercase tracking-[0.2em] px-1">
              SelectDevice
            </label>
            <Select disabled>
              <SelectTrigger className="w-full h-12 bg-[#121826]/50 border-white/5 rounded-xl text-slate-500 px-4 font-medium opacity-60">
                <SelectValue placeholder="Router Core..." />
              </SelectTrigger>
              <SelectContent className="bg-[#121826] border-white/10" />
            </Select>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
