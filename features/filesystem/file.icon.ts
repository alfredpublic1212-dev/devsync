
import type { ElementType } from "react";
import {
  FileCode,
  FileText,
  FileJson,
  FileType,
  FileImage,
} from "lucide-react";

export function getFileIcon(name: string): ElementType {
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return FileCode;
    case "json":
      return FileJson;
    case "md":
      return FileText;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return FileImage;
    default:
      return FileType;
  }
}
