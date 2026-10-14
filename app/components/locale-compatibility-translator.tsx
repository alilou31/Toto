"use client";

import { useEffect } from "react";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { translateUiCopy } from "@/lib/ui-translations";

const translatableAttributes = ["aria-label", "aria-description", "placeholder", "title", "alt"] as const;

export default function LocaleCompatibilityTranslator() {
  useEffect(() => {
    const originalText = new WeakMap<Text, string>();
    const originalAttributes = new WeakMap<Element, Map<string, string>>();
    let queued = false;

    const locale = () => normalizeLocale(document.documentElement.lang);
    const translateTextNode = (node: Text, currentLocale: SupportedLocale) => {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript, textarea, [data-no-translate]")) return;
      if (!originalText.has(node)) originalText.set(node, node.data);
      const source = originalText.get(node) ?? node.data;
      const result = translateUiCopy(source, currentLocale);
      if (node.data !== result) node.data = result;
    };

    const translateAttribute = (element: Element, attribute: string, currentLocale: SupportedLocale) => {
      if (!element.hasAttribute(attribute)) return;
      let values = originalAttributes.get(element);
      if (!values) {
        values = new Map<string, string>();
        originalAttributes.set(element, values);
      }
      if (!values.has(attribute)) values.set(attribute, element.getAttribute(attribute) ?? "");
      const source = values.get(attribute) ?? "";
      const result = translateUiCopy(source, currentLocale);
      if (element.getAttribute(attribute) !== result) element.setAttribute(attribute, result);
    };

    const apply = () => {
      queued = false;
      const currentLocale = locale();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) translateTextNode(node as Text, currentLocale);
      for (const element of Array.from(document.body.querySelectorAll("*"))) {
        for (const attribute of translatableAttributes) translateAttribute(element, attribute, currentLocale);
      }
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(apply);
    };

    apply();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...translatableAttributes, "lang"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
