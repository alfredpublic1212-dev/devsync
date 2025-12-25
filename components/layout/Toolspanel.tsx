'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIReviewPanel from '../tools/AiReview';

export default function ToolsPanel({ width }: { width: number }) {
  return (
    <aside
      style={{ width }}
      className="bg-neutral-900 border-l border-neutral-800 text-neutral-200 flex flex-col shrink-0"
    >
      <Tabs defaultValue="review" className="flex flex-col h-full">
        {/* Top Tool Switch */}
        <TabsList className="h-10 rounded-none bg-neutral-900 border-b border-neutral-800">
          <TabsTrigger value="review">AI Review</TabsTrigger>
          <TabsTrigger value="suggest">Suggestions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Tool Content */}
        <TabsContent value="review" className="flex-1 m-0">
          <AIReviewPanel />
        </TabsContent>

        <TabsContent value="suggest" className="flex-1 m-0 p-3 text-sm text-neutral-400">
          AI suggestions coming here.
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 m-0 p-3 text-sm text-neutral-400">
          Version history & diffs.
        </TabsContent>
      </Tabs>
    </aside>
  );
}
