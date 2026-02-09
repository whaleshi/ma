
/**
 * Copies text to clipboard with a fallback for environments where the Clipboard API
 * might be blocked (e.g. strict iframe policies).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try the modern Async Clipboard API first
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback to document.execCommand('copy')
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Ensure it's not visible but part of the DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      
      // Select the text
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices
      
      // Execute copy
      const successful = document.execCommand('copy');
      
      // Cleanup
      document.body.removeChild(textArea);
      
      return successful;
    } catch (fallbackErr) {
      console.error('Copy failed:', fallbackErr);
      return false;
    }
  }
}
