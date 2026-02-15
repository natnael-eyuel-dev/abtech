"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate heading IDs for TOC functionality
  const generateHeadingId = (text: string, level: number, index: number) => {
    return `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  const components = {
    h1: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 1, Math.random());
      return (
        <h1 
          id={id}
          className="text-3xl md:text-4xl font-bold mt-8 mb-4 leading-tight text-foreground border-b border-border pb-2 scroll-mt-24"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 2, Math.random());
      return (
        <h2 
          id={id}
          className="text-2xl md:text-3xl font-semibold mt-6 mb-3 leading-tight text-foreground scroll-mt-24"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 3, Math.random());
      return (
        <h3 
          id={id}
          className="text-xl md:text-2xl font-semibold mt-5 mb-2 leading-tight text-foreground scroll-mt-24"
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 4, Math.random());
      return (
        <h4 
          id={id}
          className="text-lg md:text-xl font-semibold mt-4 mb-2 leading-tight text-foreground scroll-mt-24"
          {...props}
        >
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 5, Math.random());
      return (
        <h5 
          id={id}
          className="text-base md:text-lg font-semibold mt-3 mb-1 leading-tight text-foreground scroll-mt-24"
          {...props}
        >
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }: any) => {
      const id = generateHeadingId(children?.toString() || '', 6, Math.random());
      return (
        <h6 
          id={id}
          className="text-sm md:text-base font-semibold mt-2 mb-1 leading-tight text-foreground scroll-mt-24"
          {...props}
        >
          {children}
        </h6>
      );
    },
    p: ({ children, ...props }: any) => (
      <p 
        className="text-base leading-relaxed mb-4 text-foreground"
        {...props}
      >
        {children}
      </p>
    ),
    a: ({ children, href, ...props }: any) => (
      <a 
        href={href}
        className="text-primary hover:text-primary/80 underline decoration-1 underline-offset-2 transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className="border-l-4 border-primary/30 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/50 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children, ...props }: any) => (
      <ul 
        className="mb-4 space-y-2 text-foreground list-disc list-inside"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol 
        className="mb-4 space-y-2 text-foreground list-decimal list-inside"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li 
        className="leading-relaxed"
        {...props}
      >
        {children}
      </li>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-border">
        <table 
          className="w-full text-sm"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead 
        className="bg-muted/50 border-b border-border"
        {...props}
      >
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody 
        className="divide-y divide-border"
        {...props}
      >
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr 
        className="hover:bg-muted/30 transition-colors"
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th 
        className="px-4 py-3 text-left font-semibold text-foreground"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td 
        className="px-4 py-3 text-foreground"
        {...props}
      >
        {children}
      </td>
    ),
    code: ({ children, className, inline, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      return !inline && language ? (
        <SyntaxHighlighter
          style={isDark ? oneDark : oneLight}
          language={language}
          PreTag="div"
          className="rounded-lg !mt-4 !mb-4 text-sm"
          customStyle={{
            margin: '1rem 0',
            backgroundColor: isDark ? 'hsl(var(--muted))' : 'hsl(var(--muted))',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground/90 border border-border"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre 
        className="overflow-x-auto rounded-lg bg-muted p-4 my-4 border border-border"
        {...props}
      >
        {children}
      </pre>
    ),
    strong: ({ children, ...props }: any) => (
      <strong 
        className="font-semibold text-foreground"
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em 
        className="italic text-foreground"
        {...props}
      >
        {children}
      </em>
    ),
    del: ({ children, ...props }: any) => (
      <del 
        className="line-through text-muted-foreground"
        {...props}
      >
        {children}
      </del>
    ),
    hr: ({ ...props }: any) => (
      <hr 
        className="my-8 border-border"
        {...props}
      />
    ),
    img: ({ src, alt, ...props }: any) => (
      <div className="my-6">
        <img
          src={src}
          alt={alt}
          className="rounded-lg w-full h-auto object-cover border border-border shadow-sm"
          {...props}
        />
        {alt && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {alt}
          </p>
        )}
      </div>
    ),
  };

  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[]}
        remarkPlugins={[]}
        remarkRehypeOptions={{
          allowDangerousHtml: true,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}