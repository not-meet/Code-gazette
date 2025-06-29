"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type CodeBlockProps = {
  language: string;
  filename: string;
  highlightLines?: number[];
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;

  // Custom theme for SyntaxHighlighter
  const customTheme = {
    ...atomDark,
    'code[class*="language-"]': {
      ...atomDark['code[class*="language-"]'],
      background: "#121415", // Slightly lighter than #0b0d0e/#090b0c
      color: "#e2e8f0", // Slate-200 for main text
    },
    'keyword': { color: "#d97706" }, // Amber-600 for keywords
    'string': { color: "#94a3b8" }, // Slate-400 for strings
    'comment': { color: "#64748b" }, // Slate-500 for comments
    'function': { color: "#f59e0b" }, // Amber-500 for functions
    'variable': { color: "#e2e8f0" }, // Slate-200 for variables
    'number': { color: "#d97706" }, // Amber-600 for numbers
    'boolean': { color: "#d97706" }, // Amber-600 for booleans
    'operator': { color: "#94a3b8" }, // Slate-400 for operators
    'tag': { color: "#f59e0b" }, // Amber-500 for tags
    'attr-name': { color: "#94a3b8" }, // Slate-400 for attribute names
    'attr-value': { color: "#e2e8f0" }, // Slate-200 for attribute values
  };

  return (
    <div
      className="relative w-full rounded-lg bg-[#121415] p-4 font-mono text-sm"
      style={{
        // Custom scrollbar for x-axis
        scrollbarWidth: "thin",
        scrollbarColor: "#000000 #121415",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 6px; /* Thinner scrollbar */
        }
        div::-webkit-scrollbar-track {
          background: #121415; /* Track matches background */
        }
        div::-webkit-scrollbar-thumb {
          background: #000000; /* Black thumb */
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #333333; /* Slightly lighter on hover */
        }
      `}</style>
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-3 py-2 text-xs transition-colors font-sans ${
                  activeTab === index
                    ? "text-amber-500" // Amber-500 for active tab
                    : "text-slate-400 hover:text-slate-200" // Slate-400 to Slate-200
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-slate-400">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors font-sans"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
          </div>
        )}
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={customTheme}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem", // text-sm equivalent
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(255, 255, 255, 0.15)" // Slightly lighter highlight
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div"
      >
        {String(activeCode)}
      </SyntaxHighlighter>
    </div>
  );
};