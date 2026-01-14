"use client";

import dynamic from "next/dynamic";

const RoomShell = dynamic(() => import("./RoomShell"), {
  ssr: false,
});

export default RoomShell;
