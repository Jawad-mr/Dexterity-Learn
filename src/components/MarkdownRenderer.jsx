import React, { useEffect } from 'react';
import { parseMarkdown, parseInlineMarkdown } from '../utils/markdown';
import CodePlayground from './CodePlayground';

export default function MarkdownRenderer({ markdown }) {
  const blocks = parseMarkdown(markdown);

  // Trigger syntax highlighting whenever markdown changes
  useEffect(() => {
    if (window.hljs) {
      window.hljs.highlightAll();
    }
  }, [markdown]);

  return (
    <div className="lesson-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${block.level}`;
            return (
              <Tag 
                key={index} 
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} 
              />
            );
          }
          
          case 'paragraph':
            return (
              <p 
                key={index} 
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(block.text) }} 
              />
            );

          case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag key={index}>
                {block.items.map((item, itemIdx) => (
                  <li 
                    key={itemIdx} 
                    dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }} 
                  />
                ))}
              </ListTag>
            );
          }

          case 'image':
            return (
              <img 
                key={index} 
                src={block.src} 
                alt={block.alt} 
                loading="lazy" 
              />
            );

          case 'code':
            return (
              <pre key={index}>
                <code className={`language-${block.lang}`}>
                  {block.code}
                </code>
              </pre>
            );

          case 'callout': {
            const { calloutType, text, codeBlock } = block;
            const titleMap = {
              tip: 'Tip',
              example: 'Example',
              try: 'Try it yourself'
            };

            return (
              <div key={index} className={`callout callout-${calloutType}`}>
                <div className="callout-title">
                  {titleMap[calloutType] || 'Note'}
                </div>
                
                {text && (
                  <p 
                    style={{ 
                      color: calloutType === 'try' ? '#cbd5e1' : 'inherit',
                      margin: '0 0 12px 0' 
                    }}
                    dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(text) }}
                  />
                )}

                {codeBlock && (
                  <>
                    {calloutType === 'try' ? (
                      <CodePlayground 
                        initialCode={codeBlock.code} 
                        lang={codeBlock.lang} 
                      />
                    ) : (
                      <pre style={{ margin: 0 }}>
                        <code className={`language-${codeBlock.lang}`}>
                          {codeBlock.code}
                        </code>
                      </pre>
                    )}
                  </>
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
