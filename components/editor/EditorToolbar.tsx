'use client';

import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Image, Undo, Redo,
  Heading1, Heading2, Heading3, Quote, Minus,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const groups = [
    {
      items: [
        { icon: Undo, action: () => editor.chain().focus().undo().run(), isActive: false, title: 'Deshacer' },
        { icon: Redo, action: () => editor.chain().focus().redo().run(), isActive: false, title: 'Rehacer' },
      ]
    },
    {
      items: [
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), title: 'Título 1' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'Título 2' },
        { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), title: 'Título 3' },
      ]
    },
    {
      items: [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Negrita' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Cursiva' },
        { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), title: 'Subrayado' },
        { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), title: 'Tachado' },
      ]
    },
    {
      items: [
        { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }), title: 'Izquierda' },
        { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }), title: 'Centrar' },
        { icon: AlignRight, action: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }), title: 'Derecha' },
        { icon: AlignJustify, action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: editor.isActive({ textAlign: 'justify' }), title: 'Justificar' },
      ]
    },
    {
      items: [
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Lista' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), title: 'Lista numerada' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), title: 'Cita' },
        { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), isActive: false, title: 'Línea horizontal' },
      ]
    },
    {
      items: [
        {
          icon: Link,
          action: () => {
            const url = window.prompt('URL del enlace:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          },
          isActive: editor.isActive('link'),
          title: 'Enlace'
        },
        {
          icon: Image,
          action: () => {
            const url = window.prompt('URL de la imagen:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          },
          isActive: false,
          title: 'Imagen'
        },
      ]
    },
  ];

  return (
    <div className="glass-sm rounded-xl p-2 flex flex-wrap gap-1">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {group.items.map((item, ii) => (
            <button
              key={ii}
              onClick={item.action}
              title={item.title}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)]
                ${item.isActive
                  ? 'bg-[rgba(25,211,230,0.15)] text-[#19D3E6]'
                  : 'text-[#C9D1D9] hover:text-white'
                }
              `}
            >
              <item.icon className="w-4 h-4" />
            </button>
          ))}
          {gi < groups.length - 1 && (
            <div className="w-px h-5 mx-1 bg-[rgba(255,255,255,0.08)]" />
          )}
        </div>
      ))}
    </div>
  );
}
