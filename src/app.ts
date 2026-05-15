import { XmlToJson } from './XmlToJson';

const converter = new XmlToJson();

/**
 * Transforms the XML in the textarea to JSON and displays it.
 */
function transform(): void {
  const input = (document.getElementById('xmltext') as HTMLTextAreaElement).value;
  const json = converter.parse(input);
  const output = document.getElementById('jsontext');
  if (output) {
    output.innerHTML = '<pre>' + JSON.stringify(json, null, 4) + '</pre>';
  }
}

/**
 * Fetches the example XML file and populates the textarea.
 */
async function loadExample(): Promise<void> {
  try {
    const response = await fetch('example.xml');
    const text = await response.text();
    const textarea = document.getElementById('xmltext') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = text;
    }
  } catch (error) {
    console.error('Failed to load example XML:', error);
  }
}

// Expose transform globally for the button onclick
(window as unknown as Record<string, unknown>).transform = transform;

// Load example on page ready
document.addEventListener('DOMContentLoaded', loadExample);
