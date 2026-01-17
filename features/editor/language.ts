
export function getLanguageFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "html":
      return "html";
    case "css":
      return "css";
    case "py":
      return "python";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return "plaintext";
  }
}
