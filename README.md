# xmlToJson

> Library-free TypeScript utility to convert XML to JSON. ~1 kB minified + gzipped.

## Overview

A simple, zero-dependency XML-to-JSON converter that runs in the browser. It uses the native `DOMParser` API to parse XML and produces clean, idiomatic JSON output.

**Features:**

- No external dependencies
- Repeated sibling nodes with the same name automatically become arrays
- Attributes and text content are flattened into the same object
- Values are auto-coerced: `"true"`/`"false"` → boolean, numeric strings → numbers
- Full TypeScript support with exported types

## Installation

```bash
pnpm add xml-to-json
```

Or clone and build locally:

```bash
git clone https://github.com/andrewhouser/xmlToJson.git
cd xmlToJson
pnpm install
pnpm build
```

## Usage

```typescript
import { XmlToJson } from './src/XmlToJson';

const converter = new XmlToJson();

const xml = `
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price>44.95</price>
  </book>
</catalog>
`;

const json = converter.parse(xml);
console.log(json);
```

Output:

```json
{
  "catalog": {
    "book": {
      "id": "bk101",
      "author": "Gambardella, Matthew",
      "title": "XML Developer's Guide",
      "price": 44.95
    }
  }
}
```

## Development

```bash
# Start dev server with hot reload
pnpm dev

# Type-check without emitting
pnpm typecheck

# Build library (ES module + UMD)
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
  XmlToJson.ts   — Core converter class
  index.ts       — Library entry point (exports)
  app.ts         — Demo app entry point
index.html       — Demo page
example.xml      — Sample XML for testing
style.css        — Demo page styles
```

## API

### `XmlToJson`

#### `parse(xml: string | Document | null): JsonObject | null`

Parses an XML string or `Document` into a JSON object. Returns `null` if the input is invalid or not XML.

### Types

```typescript
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}
```

## License

ISC
