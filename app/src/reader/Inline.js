import React from 'react';
import { Text } from 'react-native';

const BENGALI = /[ঀ-৿]/g;
const LATIN = /[A-Za-z]/g;

// True when a line is mostly Assamese, so it can be set as the secondary language.
export function isMostlyBengali(s) {
  return (s.match(BENGALI) || []).length > (s.match(LATIN) || []).length;
}

const TOKEN = /(\\\[[^\]]*?\\\]|\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*[^*\s][^*]*?\*)/g;

function clean(s) {
  return s.replace(/\*/g, '').replace(/\\(.)/g, '$1');
}

// Minimal inline Markdown: **bold**, *italic*, \[S1\] source refs and \ escapes.
export function Inline({ text, style, refStyle }) {
  const parts = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) parts.push(<Text key={i++}>{clean(text.slice(last, m.index))}</Text>);
    const t = m[0];
    if (t.startsWith('\\[')) {
      parts.push(
        <Text key={i++} style={refStyle}>
          {' '}
          {clean(t)}
        </Text>
      );
    } else if (t.startsWith('***')) {
      parts.push(
        <Text key={i++} style={{ fontWeight: '700', fontStyle: 'italic' }}>
          {clean(t)}
        </Text>
      );
    } else if (t.startsWith('**')) {
      parts.push(
        <Text key={i++} style={{ fontWeight: '700' }}>
          {clean(t)}
        </Text>
      );
    } else {
      parts.push(
        <Text key={i++} style={{ fontStyle: 'italic' }}>
          {clean(t)}
        </Text>
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) parts.push(<Text key={i++}>{clean(text.slice(last))}</Text>);
  return (
    <Text selectable={false} style={style}>
      {parts}
    </Text>
  );
}
