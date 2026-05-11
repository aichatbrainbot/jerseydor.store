import type { ReactNode } from 'react';

const colors = {
  background: '#f5f5f2',
  ink: '#0b0b0f',
  muted: '#5f6068',
  border: '#deded8',
  accent: '#6d7cff',
  panel: '#ffffff',
};

export function EmailShell({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: colors.background, color: colors.ink, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{preview}</div>
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: colors.background }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '28px 14px' }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ maxWidth: 640, borderCollapse: 'collapse', backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '28px 28px 18px' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0, color: colors.ink }}>JerseyDor</div>
                        <div style={{ marginTop: 8, height: 3, width: 96, backgroundColor: colors.accent }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 28px 30px' }}>{children}</td>
                    </tr>
                    <tr>
                      <td style={{ borderTop: `1px solid ${colors.border}`, padding: 28, color: colors.muted, fontSize: 12, lineHeight: '18px' }}>
                        JerseyDor transactional email. For support, reply to this message or contact the store support address.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return <h1 style={{ margin: '0 0 14px', fontSize: 28, lineHeight: '34px', color: colors.ink }}>{children}</h1>;
}

export function Text({ children }: { children: ReactNode }) {
  return <p style={{ margin: '0 0 16px', color: colors.muted, fontSize: 15, lineHeight: '24px' }}>{children}</p>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={{ margin: '24px 0 10px', color: colors.ink, fontSize: 16, lineHeight: '22px' }}>{children}</h2>;
}

export function DetailTable({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td style={{ borderTop: `1px solid ${colors.border}`, padding: '10px 0', color: colors.muted, fontSize: 13 }}>{row.label}</td>
            <td align="right" style={{ borderTop: `1px solid ${colors.border}`, padding: '10px 0', color: colors.ink, fontSize: 13, fontWeight: 700 }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        marginTop: 8,
        borderRadius: 999,
        backgroundColor: colors.ink,
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '20px',
        padding: '12px 18px',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}
