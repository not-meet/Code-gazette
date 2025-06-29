import { CodeBlock } from "./ui/code-block";

interface BlogContent {
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
}

interface PreviewProps {
  title: string;
  contents: BlogContent[];
  authorName: string;
}

export function Preview({ title, contents, authorName }: PreviewProps) {
  return (
    <div className="bg-gradient-to-b from-[#191919] to-[#0d0d0d] rounded-xl p-6 h-full overflow-auto">
      <article className="max-w-3xl mx-auto text-gray-200">
        <h1 className="text-4xl font-bold text-center mb-8">{title || 'Untitled'}</h1>
        <div className="prose prose-invert prose-lg mx-auto">
          {contents.length > 0 ? (
            contents
              .sort((a, b) => a.order - b.order)
              .map((content, index) => (
                <div key={index} className="mb-6">
                  {content.type === 'HEADING' && (
                    <h2 className="text-3xl font-sans font-semibold">{content.content}</h2>
                  )}
                  {content.type === 'SUBHEADING' && (
                    <h3 className="text-2xl font-sans font-medium">{content.content}</h3>
                  )}
                  {content.type === 'PARAGRAPH' && (
                    <p className="text-lg leading-relaxed">{content.content}</p>
                  )}
                  {content.type === 'CODE_SNIPPET' && (
                    <>
                      <CodeBlock
                        code={content.content}
                        language={content.metadata?.language || 'javascript'}
                        filename={content.metadata?.caption || 'code'}
                      />
                      <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2 fading-line" />
                    </>
                  )}
                  {content.type === 'IMAGE' && (
                    <>
                      <figure className="text-center">
                        <img
                          src={content.content}
                          alt={content.metadata?.caption || ''}
                          className="rounded-xl mx-auto max-w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.src = '/fallback-image.jpg'; // Optional fallback
                            console.error('Image failed to load:', content.content);
                          }}
                        />
                        {content.metadata?.caption && (
                          <figcaption className="text-sm text-gray-400 mt-2">
                            {content.metadata.caption}
                          </figcaption>
                        )}
                      </figure>
                      <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2 fading-line" />
                    </>
                  )}
                </div>
              ))
          ) : (
            <p className="text-center text-gray-400">No content added yet.</p>
          )}
        </div>
        <footer className="mt-12 text-left">
          <p className="text-lg font-dancing text-gray-300">
            - {authorName || 'Author'}
          </p>
        </footer>
      </article>
    </div>
  );
}