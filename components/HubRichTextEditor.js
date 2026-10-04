import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, IconButton, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const toolbarBtn = (active) => ({
  color: active ? '#C1440E' : '#5A5A5A',
  bgcolor: active ? '#FFF0EC' : 'transparent',
  borderRadius: 1,
  '&:hover': { bgcolor: active ? '#FFF0EC' : '#F5F0E8' },
});

export default function HubRichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write here…',
  disabled = false,
  minHeight = 140,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next && next !== '<p></p>') {
      editor.commands.setContent(next, false);
    }
    if (!next && current !== '<p></p>') {
      editor.commands.setContent('', false);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <Box
      sx={{
        border: '1px solid #E8E0D5',
        borderRadius: 2,
        bgcolor: disabled ? '#F9F9F9' : 'white',
        overflow: 'hidden',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 1, py: 0.5, bgcolor: '#FDF9F4', borderBottom: '1px solid #E8E0D5' }}>
        <IconButton size="small" disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()} sx={toolbarBtn(editor.isActive('bold'))} aria-label="Bold">
          <FormatBoldIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()} sx={toolbarBtn(editor.isActive('italic'))} aria-label="Italic">
          <FormatItalicIcon fontSize="small" />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <IconButton size="small" disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()} sx={toolbarBtn(editor.isActive('bulletList'))} aria-label="Bullet list">
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()} sx={toolbarBtn(editor.isActive('orderedList'))} aria-label="Numbered list">
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          minHeight,
          '& .ProseMirror': {
            outline: 'none',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            color: '#3D2B1F',
            minHeight: minHeight - 24,
            '& p': { margin: '0 0 0.5em' },
            '& ul, & ol': { pl: 2.5, my: 0.5 },
            '& p.is-editor-empty:first-of-type::before': {
              color: '#9A9A9A',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}

export function isRichTextEmpty(html) {
  if (!html) return true;
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !text;
}
