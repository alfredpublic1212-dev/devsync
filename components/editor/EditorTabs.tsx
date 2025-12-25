'use client';

import { X } from 'lucide-react';
import { useTabStore } from '@/state/tabState';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const EditorTabs = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-10 items-center bg-neutral-900 border-b border-neutral-700 px-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            name={tab.name}
            isActive={tab.id === activeTabId}
            onActivate={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </div>
    </TooltipProvider>
  );
};

type TabProps = {
  id: string;
  name: string;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
};

const Tab = ({ name, isActive, onActivate, onClose }: TabProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div
        onClick={onActivate}
        role="tab"
        aria-selected={isActive}
        title={name}
        className={`flex text-xs items-center px-3 py-1 mr-2 rounded cursor-pointer select-none transition-colors
          ${
            isActive
              ? 'bg-neutral-700 text-white border border-neutral-600'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-600'
          }`}
      >
        <span className="truncate max-w-[120px]">{name}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-2 h-4 w-4 text-neutral-400 hover:text-red-400"
          aria-label={`Close ${name}`}
        >
          <X size={12} />
        </Button>
        </div>  
      </TooltipTrigger>

    <TooltipContent side="bottom" className="max-w-xs truncate">
      {name}
    </TooltipContent>
  </Tooltip>
);

export default EditorTabs;
