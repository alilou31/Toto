"use client";

import { useEffect } from "react";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { translateUiCopy } from "@/lib/ui-translations";

const translatableAttributes = ["aria-label", "aria-description", "placeholder", "title", "alt"] as const;

export default function LocaleCompatibilityTranslator() {
  useEffect(() => {
    const originalText = new WeakMap<Text, { source: string; translated: string }>();
    const originalAttributes = new WeakMap<Element, Map<string, { source: string; translated: string }>>();
    let queued = false;

    const locale = () => normalizeLocale(document.documentElement.lang);
    const translateTextNode = (node: Text, currentLocale: SupportedLocale) => {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript, textarea, [data-no-translate]")) return;
      let state = originalText.get(node);
      // React may reuse a text node for a new French state message. Detect that
      // change without mistaking our own translated output for new source copy.
      if (!state || node.data !== state.translated) state = { source: node.data, translated: node.data };
      const result = translateUiCopy(state.source, currentLocale);
      state.translated = result;
      originalText.set(node, state);
      if (node.data !== result) node.data = result;
    };

    const translateAttribute = (element: Element, attribute: string, currentLocale: SupportedLocale) => {
      if (!element.hasAttribute(attribute)) return;
      let values = originalAttributes.get(element);
      if (!values) {
        values = new Map<string, { source: string; translated: string }>();
        originalAttributes.set(element, values);
      }
      const current = element.getAttribute(attribute) ?? "";
      let state = values.get(attribute);
      if (!state || current !== state.translated) state = { source: current, translated: current };
      const result = translateUiCopy(state.source, currentLocale);
      state.translated = result;
      values.set(attribute, state);
      if (current !== result) element.setAttribute(attribute, result);
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
