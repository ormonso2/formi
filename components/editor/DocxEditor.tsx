'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './EditorToolbar';

interface DocxEditorProps {
  initialContent: string;
  onSave?: (html: string) => void;
}

export function DocxEditor({ initialContent, onSave }: DocxEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      ImageExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save debounce could go here
      if (onSave) {
        onSave(editor.getHTML());
      }
    },
  });

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor area */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{
          background: '#1A1F26',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
