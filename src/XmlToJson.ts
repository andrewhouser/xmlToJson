/**
 * Represents a parsed JSON node value — can be a primitive, an object, or an array of values.
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Converts XML documents or XML strings into structured JSON objects.
 *
 * Features:
 * - Repeated sibling nodes with the same name automatically become arrays
 * - Attributes and text content are flattened into the same object
 * - Values are auto-coerced: "true"/"false" → boolean, numeric strings → numbers
 */
export class XmlToJson {
  /**
   * Parse an XML string or XMLDocument into a JSON object.
   *
   * @param xml - An XML string or XMLDocument to parse
   * @returns The parsed JSON object, or null if input is invalid
   */
  parse(xml: string | Document | null): JsonObject | null {
    if (!xml) return null;

    let doc: Document;
    if (typeof xml === 'string') {
      const parsed = this.convertXmlStringToDoc(xml);
      if (!parsed) return null;
      doc = parsed;
    } else {
      doc = xml;
    }

    if (!this.isXml(doc)) return null;
    if (!doc.firstChild) return null;

    return this.parseNode({}, doc.firstChild as Element);
  }

  /**
   * Converts an XML string to an XMLDocument using DOMParser.
   */
  private convertXmlStringToDoc(str: string): Document | null {
    if (!str || typeof str !== 'string') return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'application/xml');

    // Check for parser errors
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) return null;

    return doc;
  }

  /**
   * Validates that the given data is an XML document (not HTML).
   */
  private isXml(data: Document): boolean {
    const documentElement = data.documentElement;
    return documentElement
      ? documentElement.nodeName.toLowerCase() !== 'html'
      : false;
  }

  /**
   * Reads a node's attributes and returns them as an object.
   */
  private parseAttributes(node: Element): JsonObject {
    const obj: JsonObject = {};

    if (node.hasAttributes()) {
      const attributes = node.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        obj[attr.name] = this.parseValue(attr.value);
      }
    }

    return obj;
  }

  /**
   * Iterates child nodes and parses element nodes.
   */
  private parseChildren(parent: JsonObject, childNodes: NodeListOf<ChildNode>): void {
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.parseNode(parent, child as Element);
      }
    }
  }

  /**
   * Converts an XML element into an object with properties and adds it to the parent.
   */
  private parseNode(parent: JsonObject, node: Element): JsonObject {
    const nodeName = node.nodeName;
    let obj: JsonValue = { ...this.parseAttributes(node) };

    // Single text child node — no need to recurse
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
      if (node.hasAttributes()) {
        (obj as JsonObject)['text'] = this.parseValue(node.childNodes[0].nodeValue ?? '');
      } else {
        obj = this.parseValue(node.childNodes[0].nodeValue ?? '');
      }
    } else {
      this.parseChildren(obj as JsonObject, node.childNodes);
    }

    this.addToParent(parent, nodeName, obj);
    return parent;
  }

  /**
   * Adds a value to a parent object. If the key already exists, converts to an array.
   */
  private addToParent(parent: JsonObject, nodeName: string, obj: JsonValue): void {
    if (parent[nodeName] === undefined) {
      parent[nodeName] = obj;
    } else {
      if (!Array.isArray(parent[nodeName])) {
        const tmp = parent[nodeName];
        parent[nodeName] = [tmp];
      }
      (parent[nodeName] as JsonValue[]).push(obj);
    }
  }

  /**
   * Interprets a string value and coerces it to Boolean, Number, or String.
   */
  private parseValue(val: string): string | number | boolean | null {
    const num = Number(val);

    if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
      return val.toLowerCase() === 'true';
    }

    if (!isNaN(num) && val.trim().length > 0) {
      return num;
    }

    if (val.length === 0) {
      return null;
    }

    return val.trim();
  }
}
