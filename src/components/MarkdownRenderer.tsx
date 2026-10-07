import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  // Función para procesar texto inline con negrita (**texto**), cursiva (*texto*) y código
  const renderFormattedLine = (line: string, lineIndex: number) => {
    // Si es un bullet list item (empieza por "• ", "- ", "* ")
    const bulletMatch = line.match(/^(\s*)([•\-\*])\s+(.*)$/);

    if (bulletMatch) {
      const itemText = bulletMatch[3];
      return (
        <div
          key={lineIndex}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            margin: '3px 0',
            paddingLeft: 4
          }}
        >
          <span
            style={{
              color: isUser ? '#ffffff' : 'var(--system-blue)',
              fontSize: 14,
              lineHeight: 1
            }}
          >
            •
          </span>
          <span style={{ flex: 1 }}>{parseInlineFormatting(itemText)}</span>
        </div>
      );
    }

    return (
      <div key={lineIndex} style={{ margin: line ? '2px 0' : '6px 0' }}>
        {line ? parseInlineFormatting(line) : <br />}
      </div>
    );
  };

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    // Regex para capturar **negrita**, *cursiva*, `código`
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Texto antes del match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];

      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        parts.push(
          <strong
            key={match.index}
            style={{
              fontWeight: 700,
              color: isUser ? '#ffffff' : 'var(--text-primary)'
            }}
          >
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        parts.push(
          <em key={match.index} style={{ fontStyle: 'italic', opacity: 0.9 }}>
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              background: isUser ? 'rgba(255,255,255,0.2)' : 'var(--bg-fill)',
              padding: '1px 5px',
              borderRadius: 4,
              fontSize: '0.9em',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {matchText.slice(1, -1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const lines = content.split('\n');

  return (
    <div style={{ lineHeight: 1.45, fontSize: 14 }}>
      {lines.map((line, idx) => renderFormattedLine(line, idx))}
    </div>
  );
};
