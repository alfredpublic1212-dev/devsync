// "use client";

// import { useParams } from "next/navigation";
// import { useState } from "react";

// import {
//   ResizablePanelGroup,
//   ResizablePanel,
//   ResizableHandle,
// } from "@/components/ui/resizable";


// import ActivityBar from "@/components/layout/ActivityBar";
// import Sidebar from "@/components/layout/Sidebar";
// import BottomPanel from "@/components/layout/BottomPanel";
// import ToolsPanel from "@/components/layout/Toolspanel";
// import Header from "@/components/layout/Header";
// import EditorTabs from "@/components/editor/EditorTabs";
// import CodeEditor from "@/components/editor/CodeEditor";

// import { Loader2 } from "lucide-react";

// export default function RoomPage() {
//   const params = useParams();
//   const roomId = params?.id as string;

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [bottomOpen, setBottomOpen] = useState(true);
//   const [toolsOpen, setToolsOpen] = useState(true);

//   if (!roomId) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-neutral-900">
//         <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col bg-[#1e1e1e]">
//       <Header
//         roomId={roomId}
//         title="DevSync"
//         onToggleSidebar={() => setSidebarOpen((v) => !v)}
//         onToggleBottomPanel={() => setBottomOpen((v) => !v)}
//       />

//       <div className="flex flex-1 overflow-hidden">

//         {/* MAIN HORIZONTAL LAYOUT */}
//         <ResizablePanelGroup
//           direction="horizontal"
//           className="flex-1 min-h-0 overflow-hidden"
//           autoSaveId={`room-${roomId}-horizontal`}
//         >
//         <ActivityBar active="explorer" onSelect={() => {}} />
//           {/* Sidebar */}
//           {sidebarOpen && (
//             <>
//               <ResizablePanel
//                 defaultSize={18}
//                 maxSize={20}
//               >
//                 <Sidebar />
//               </ResizablePanel>
//               <ResizableHandle />
//             </>
//           )}

//           {/* CENTER COLUMN */}
//           <ResizablePanel minSize={30}>
//             <ResizablePanelGroup
//               direction="vertical"
//               className="h-full min-h-0"
//               autoSaveId={`room-${roomId}-vertical`}
//             >
//               {/* Editor */}
//               <ResizablePanel minSize={40}>
//                 <div className="flex flex-col h-full min-h-0">
//                   <EditorTabs />
//                   <div className="flex-1 min-h-0">
//                     <CodeEditor
//                       fileName="main.py"
//                       roomId={roomId}
//                       code="Hello"
//                       onChange={() => {}}
//                       socket={null}
//                     />
//                   </div>
//                 </div>
//               </ResizablePanel>

//               {/* Bottom Panel */}
//               {bottomOpen && (
//                 <>
//                   <ResizableHandle />
//                   <ResizablePanel
//                     defaultSize={22}
//                     maxSize={50}
//                   >
//                     <BottomPanel logs={[]} />
//                   </ResizablePanel>
//                 </>
//               )}
//             </ResizablePanelGroup>
//           </ResizablePanel>

//           {/* Tools / Preview */}
//           {toolsOpen && (
//             <>
//               <ResizableHandle />
//               <ResizablePanel
//                 defaultSize={20}
//                 maxSize={28}
//               >
//                 <ToolsPanel />
//               </ResizablePanel>
//             </>
//           )}
//         </ResizablePanelGroup>
//       </div>
//     </div>
//   );
// }