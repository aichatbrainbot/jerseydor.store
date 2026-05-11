import type { MDXComponents } from 'mdx/types';
import React from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // ── Headings ────────────────────────────────────────────────
    h2: ({ children }) => (
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: 'var(--foreground)',
          marginTop: '3.5rem',
          marginBottom: '1rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid color-mix(in oklch, var(--border) 50%, transparent)',
        }}
      >
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          color: 'oklch(0.90 0.012 82)',
          marginTop: '2.5rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '0.2rem',
            height: '1.1em',
            borderRadius: '2px',
            background: 'var(--primary)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        {children}
      </h3>
    ),

    h4: ({ children }) => (
      <h4
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--primary)',
          marginTop: '2rem',
          marginBottom: '0.5rem',
        }}
      >
        {children}
      </h4>
    ),

    // ── Paragraph ───────────────────────────────────────────────
    p: ({ children }) => (
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.075rem',
          lineHeight: 1.875,
          color: 'oklch(0.80 0.012 82)',
          margin: '1.2rem 0',
        }}
      >
        {children}
      </p>
    ),

    // ── Lists ───────────────────────────────────────────────────
    ul: ({ children }) => (
      <ul
        style={{
          margin: '1.5rem 0',
          paddingLeft: '1.5rem',
          listStyleType: 'none',
        }}
      >
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol
        style={{
          margin: '1.5rem 0',
          paddingLeft: '1.5rem',
          counterReset: 'list-counter',
          listStyleType: 'none',
        }}
      >
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.05rem',
          lineHeight: 1.8,
          color: 'oklch(0.78 0.012 82)',
          margin: '0.4rem 0',
          paddingLeft: '1.5rem',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '0.6em',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
        {children}
      </li>
    ),

    // ── Strong / Em ─────────────────────────────────────────────
    strong: ({ children }) => (
      <strong style={{ color: 'oklch(0.96 0.012 82)', fontWeight: 700 }}>
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em style={{ color: 'oklch(0.84 0.012 82)', fontStyle: 'italic' }}>
        {children}
      </em>
    ),

    // ── Anchor ──────────────────────────────────────────────────
    a: ({ href, children }) => (
      <a
        href={href}
        style={{
          color: 'var(--primary)',
          textDecoration: 'none',
          fontWeight: 500,
          borderBottom: '1px solid color-mix(in oklch, var(--primary) 40%, transparent)',
          paddingBottom: '1px',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderBottomColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderBottomColor = 'color-mix(in oklch, var(--primary) 40%, transparent)';
        }}
      >
        {children}
      </a>
    ),

    // ── Horizontal Rule ─────────────────────────────────────────
    hr: () => (
      <hr
        style={{
          border: 'none',
          height: '1px',
          background: 'color-mix(in oklch, var(--border) 60%, transparent)',
          margin: '3rem 0',
        }}
      />
    ),

    // ── Blockquote ──────────────────────────────────────────────
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '3px solid var(--primary)',
          paddingLeft: '1.25rem',
          margin: '2rem 0',
          color: 'oklch(0.70 0.012 82)',
          fontStyle: 'normal',
          fontSize: '1.1rem',
          lineHeight: 1.75,
        }}
      >
        {children}
      </blockquote>
    ),

    // ── Code ────────────────────────────────────────────────────
    code: ({ children }) => (
      <code
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.875em',
          background: 'oklch(0.14 0.008 255)',
          color: 'var(--primary)',
          padding: '0.15em 0.4em',
          borderRadius: '4px',
          border: '1px solid oklch(0.22 0.01 255)',
        }}
      >
        {children}
      </code>
    ),

    ...components,
  };
}
