"use client"

import * as React from "react"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableKit } from "@tiptap/extension-table"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Code,
  Code2,
  Columns3,
  Combine,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Table2,
  TableCellsMerge,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { uploadImage } from "@/app/admin/blog-actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fa } from "@/lib/format"
import { cn } from "@/lib/utils"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function uploadFile(file: File): Promise<string> {
  const data = new FormData()
  data.append("file", file)
  const result = await uploadImage(data)
  if (!result.ok) throw new Error(result.errors.join("، "))
  return result.data.url
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "متن مقاله را اینجا بنویسید...",
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const [sourceMode, setSourceMode] = React.useState(false)
  const [source, setSource] = React.useState("")
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [imageOpen, setImageOpen] = React.useState(false)
  const [uploading, setUploading] = React.useState(0)
  const editorRef = React.useRef<Editor | null>(null)

  // Upload pasted or dropped image files and insert them at the cursor
  const insertFiles = React.useCallback((files: File[], pos?: number) => {
    const images = files.filter((f) => IMAGE_TYPES.includes(f.type))
    if (!images.length) return false
    for (const file of images) {
      setUploading((n) => n + 1)
      uploadFile(file)
        .then((src) => {
          const editor = editorRef.current
          if (!editor) return
          const chain = editor.chain().focus()
          if (pos !== undefined) chain.insertContentAt(pos, { type: "image", attrs: { src, alt: "" } }).run()
          else chain.setImage({ src, alt: "" }).run()
        })
        .catch((error: Error) => alert(error.message))
        .finally(() => setUploading((n) => n - 1))
    }
    return true
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          // Let each link carry its own target/rel instead of global defaults
          HTMLAttributes: { target: null, rel: null, class: null },
        },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: "right" }),
      Highlight,
      Subscript,
      Superscript,
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[28rem] px-5 py-4 leading-9 focus:outline-none prose-headings:font-extrabold prose-img:rounded-lg",
      },
      handlePaste: (_view, event) => insertFiles(Array.from(event.clipboardData?.files ?? [])),
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? [])
        if (!files.length) return false
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        event.preventDefault()
        return insertFiles(files, pos)
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })
  React.useEffect(() => {
    editorRef.current = editor
  }, [editor])

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        words: e.storage.characterCount.words() as number,
        characters: e.storage.characterCount.characters() as number,
        inTable: e.isActive("table"),
        hasLink: e.isActive("link"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        active: {
          paragraph: e.isActive("paragraph"),
          h2: e.isActive("heading", { level: 2 }),
          h3: e.isActive("heading", { level: 3 }),
          h4: e.isActive("heading", { level: 4 }),
          bold: e.isActive("bold"),
          italic: e.isActive("italic"),
          underline: e.isActive("underline"),
          strike: e.isActive("strike"),
          highlight: e.isActive("highlight"),
          code: e.isActive("code"),
          subscript: e.isActive("subscript"),
          superscript: e.isActive("superscript"),
          right: e.isActive({ textAlign: "right" }),
          center: e.isActive({ textAlign: "center" }),
          left: e.isActive({ textAlign: "left" }),
          justify: e.isActive({ textAlign: "justify" }),
          bulletList: e.isActive("bulletList"),
          orderedList: e.isActive("orderedList"),
          blockquote: e.isActive("blockquote"),
          codeBlock: e.isActive("codeBlock"),
        },
      },
  })

  if (!editor || !state) {
    return <div className="bg-muted/40 h-[32rem] animate-pulse rounded-xl border" />
  }

  const chain = () => editor.chain().focus()
  const a = state.active

  const toggleSource = () => {
    if (sourceMode) {
      editor.commands.setContent(source, { emitUpdate: true })
    } else {
      setSource(editor.getHTML())
    }
    setSourceMode(!sourceMode)
  }

  return (
    <div className="bg-background overflow-hidden rounded-xl border">
      <div
        role="toolbar"
        aria-label="ابزارهای ویرایشگر"
        className="bg-muted/40 sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b p-1.5 backdrop-blur"
      >
        <Group>
          <Tool icon={Undo2} label="واگرد (Ctrl+Z)" onClick={() => chain().undo().run()} disabled={sourceMode || !state.canUndo} />
          <Tool icon={Redo2} label="ازنو (Ctrl+Y)" onClick={() => chain().redo().run()} disabled={sourceMode || !state.canRedo} />
        </Group>
        <Group>
          <Tool icon={Pilcrow} label="پاراگراف" active={a.paragraph} onClick={() => chain().setParagraph().run()} disabled={sourceMode} />
          <Tool icon={Heading2} label="تیتر ۲" active={a.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} disabled={sourceMode} />
          <Tool icon={Heading3} label="تیتر ۳" active={a.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} disabled={sourceMode} />
          <Tool icon={Heading4} label="تیتر ۴" active={a.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()} disabled={sourceMode} />
        </Group>
        <Group>
          <Tool icon={Bold} label="پررنگ (Ctrl+B)" active={a.bold} onClick={() => chain().toggleBold().run()} disabled={sourceMode} />
          <Tool icon={Italic} label="مورب (Ctrl+I)" active={a.italic} onClick={() => chain().toggleItalic().run()} disabled={sourceMode} />
          <Tool icon={UnderlineIcon} label="زیرخط (Ctrl+U)" active={a.underline} onClick={() => chain().toggleUnderline().run()} disabled={sourceMode} />
          <Tool icon={Strikethrough} label="خط‌خورده" active={a.strike} onClick={() => chain().toggleStrike().run()} disabled={sourceMode} />
          <Tool icon={Highlighter} label="هایلایت" active={a.highlight} onClick={() => chain().toggleHighlight().run()} disabled={sourceMode} />
          <Tool icon={Code} label="کد درون‌خطی" active={a.code} onClick={() => chain().toggleCode().run()} disabled={sourceMode} />
          <Tool icon={SubIcon} label="زیرنویس" active={a.subscript} onClick={() => chain().toggleSubscript().run()} disabled={sourceMode} />
          <Tool icon={SupIcon} label="بالانویس" active={a.superscript} onClick={() => chain().toggleSuperscript().run()} disabled={sourceMode} />
        </Group>
        <Group>
          <Tool icon={AlignRight} label="راست‌چین" active={a.right} onClick={() => chain().setTextAlign("right").run()} disabled={sourceMode} />
          <Tool icon={AlignCenter} label="وسط‌چین" active={a.center} onClick={() => chain().setTextAlign("center").run()} disabled={sourceMode} />
          <Tool icon={AlignLeft} label="چپ‌چین" active={a.left} onClick={() => chain().setTextAlign("left").run()} disabled={sourceMode} />
          <Tool icon={AlignJustify} label="تراز دوطرفه" active={a.justify} onClick={() => chain().setTextAlign("justify").run()} disabled={sourceMode} />
        </Group>
        <Group>
          <Tool icon={List} label="فهرست نقطه‌ای" active={a.bulletList} onClick={() => chain().toggleBulletList().run()} disabled={sourceMode} />
          <Tool icon={ListOrdered} label="فهرست شماره‌دار" active={a.orderedList} onClick={() => chain().toggleOrderedList().run()} disabled={sourceMode} />
          <Tool icon={Quote} label="نقل‌قول" active={a.blockquote} onClick={() => chain().toggleBlockquote().run()} disabled={sourceMode} />
          <Tool icon={Code2} label="بلوک کد" active={a.codeBlock} onClick={() => chain().toggleCodeBlock().run()} disabled={sourceMode} />
          <Tool icon={Minus} label="خط جداکننده" onClick={() => chain().setHorizontalRule().run()} disabled={sourceMode} />
        </Group>
        <Group>
          <Tool icon={Link2} label="درج / ویرایش لینک (Ctrl+K)" active={state.hasLink} onClick={() => setLinkOpen(true)} disabled={sourceMode} />
          <Tool icon={Link2Off} label="حذف لینک" onClick={() => chain().extendMarkRange("link").unsetLink().run()} disabled={sourceMode || !state.hasLink} />
          <Tool icon={ImagePlus} label="درج تصویر" onClick={() => setImageOpen(true)} disabled={sourceMode} />
          <Tool
            icon={Table2}
            label="درج جدول"
            onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={sourceMode || state.inTable}
          />
        </Group>
        {state.inTable && !sourceMode && (
          <Group>
            <Tool icon={Rows3} label="افزودن سطر" onClick={() => chain().addRowAfter().run()} />
            <Tool icon={Columns3} label="افزودن ستون" onClick={() => chain().addColumnAfter().run()} />
            <Tool icon={TableCellsMerge} label="ادغام / تفکیک خانه‌ها" onClick={() => chain().mergeOrSplit().run()} />
            <Tool icon={Combine} label="سطر عنوان" onClick={() => chain().toggleHeaderRow().run()} />
            <Tool icon={Rows3} label="حذف سطر" destructive onClick={() => chain().deleteRow().run()} />
            <Tool icon={Columns3} label="حذف ستون" destructive onClick={() => chain().deleteColumn().run()} />
            <Tool icon={Trash2} label="حذف جدول" destructive onClick={() => chain().deleteTable().run()} />
          </Group>
        )}
        <Group>
          <Tool icon={RemoveFormatting} label="پاک کردن قالب‌بندی" onClick={() => chain().unsetAllMarks().clearNodes().run()} disabled={sourceMode} />
          <Tool icon={Braces} label={sourceMode ? "بازگشت به ویرایشگر" : "ویرایش HTML"} active={sourceMode} onClick={toggleSource} />
        </Group>
      </div>

      {sourceMode ? (
        <Textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            onChange(e.target.value)
          }}
          dir="ltr"
          aria-label="کد HTML مقاله"
          className="min-h-[28rem] rounded-none border-0 font-mono text-xs leading-6 focus-visible:ring-0"
        />
      ) : (
        <EditorContent
          editor={editor}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
              e.preventDefault()
              setLinkOpen(true)
            }
          }}
        />
      )}

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-xs">
        <span>
          {fa(state.words)} کلمه · {fa(state.characters)} نویسه · حدود {fa(Math.max(1, Math.round(state.words / 200)))} دقیقه مطالعه
        </span>
        {uploading > 0 && <span className="text-primary">در حال بارگذاری {fa(uploading)} تصویر...</span>}
        <span className="hidden sm:inline">تصویر را می‌توانید مستقیم در متن بکشید یا paste کنید</span>
      </div>

      <LinkDialog editor={editor} open={linkOpen} onOpenChange={setLinkOpen} />
      <ImageDialog editor={editor} open={imageOpen} onOpenChange={setImageOpen} />
    </div>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5 border-l pl-1 last:border-l-0">{children}</div>
}

function Tool({
  icon: Icon,
  label,
  active,
  destructive,
  ...props
}: { icon: LucideIcon; label: string; active?: boolean; destructive?: boolean } & React.ComponentProps<"button">) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "size-8",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        destructive && "text-destructive hover:text-destructive"
      )}
      {...props}
    >
      <Icon />
    </Button>
  )
}

// Radix unmounts closed dialog content, so each form starts fresh when opened
function LinkDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <LinkForm editor={editor} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function LinkForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  // Start from the link under the cursor, if any
  const [current] = React.useState(() => {
    const attrs = editor.getAttributes("link") as { href?: string; target?: string; rel?: string }
    const rel = new Set((attrs.rel ?? "").split(/\s+/))
    return {
      href: attrs.href ?? "",
      newTab: attrs.target === "_blank",
      rel: { nofollow: rel.has("nofollow"), sponsored: rel.has("sponsored"), ugc: rel.has("ugc") },
      hasSelection: !editor.state.selection.empty || editor.isActive("link"),
    }
  })
  const [href, setHref] = React.useState(current.href)
  const [text, setText] = React.useState("")
  const [newTab, setNewTab] = React.useState(current.newTab)
  const [rel, setRel] = React.useState(current.rel)

  const apply = (e: React.FormEvent) => {
    e.preventDefault()
    const url = href.trim()
    if (!url) return
    const relValue = [
      rel.nofollow && "nofollow",
      rel.sponsored && "sponsored",
      rel.ugc && "ugc",
      newTab && "noopener noreferrer",
    ]
      .filter(Boolean)
      .join(" ")
    const attrs = { href: url, target: newTab ? "_blank" : null, rel: relValue || null }

    if (current.hasSelection) {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run()
    } else {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: text.trim() || url, marks: [{ type: "link", attrs }] })
        .run()
    }
    onDone()
  }

  return (
    <form onSubmit={apply} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>لینک</DialogTitle>
        <DialogDescription>لینک داخلی را با / شروع کنید (مثلاً /blog/...).</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="link-href">آدرس</Label>
        <Input id="link-href" dir="ltr" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://" required autoFocus />
      </div>
      {!current.hasSelection && (
        <div className="grid gap-2">
          <Label htmlFor="link-text">متن لینک</Label>
          <Input id="link-text" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      )}
      <fieldset className="grid gap-3">
        <legend className="mb-2 text-sm font-medium">ویژگی‌ها</legend>
        <CheckRow id="link-newtab" checked={newTab} onChange={setNewTab} label="باز شدن در زبانه جدید" />
        <CheckRow id="link-nofollow" checked={rel.nofollow} onChange={(v) => setRel((r) => ({ ...r, nofollow: v }))} label="nofollow — اعتبار لینک به مقصد منتقل نشود" />
        <CheckRow id="link-sponsored" checked={rel.sponsored} onChange={(v) => setRel((r) => ({ ...r, sponsored: v }))} label="sponsored — لینک تبلیغاتی / رپورتاژ" />
        <CheckRow id="link-ugc" checked={rel.ugc} onChange={(v) => setRel((r) => ({ ...r, ugc: v }))} label="ugc — محتوای تولیدشده توسط کاربر" />
      </fieldset>
      <DialogFooter>
        <Button type="submit">اعمال</Button>
      </DialogFooter>
    </form>
  )
}

function ImageDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ImageForm editor={editor} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ImageForm({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [src, setSrc] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState("")

  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError("")
    try {
      setSrc(await uploadFile(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const insert = (e: React.FormEvent) => {
    e.preventDefault()
    if (!src) return
    editor.chain().focus().setImage({ src, alt: alt.trim(), title: title.trim() || undefined }).run()
    onDone()
  }

  return (
    <form onSubmit={insert} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>درج تصویر</DialogTitle>
        <DialogDescription>تصویر را بارگذاری کنید (حداکثر ۵ مگابایت) یا آدرس آن را وارد کنید.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="image-file">بارگذاری فایل</Label>
        <Input id="image-file" type="file" accept={IMAGE_TYPES.join(",")} disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image-src">یا آدرس تصویر</Label>
        <Input id="image-src" dir="ltr" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt="" className="max-h-48 rounded-lg border object-contain" />}
      <div className="grid gap-2">
        <Label htmlFor="image-alt">متن جایگزین (alt) — برای سئو مهم است</Label>
        <Input id="image-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="توضیح کوتاه تصویر" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image-title">عنوان (اختیاری)</Label>
        <Input id="image-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      {busy && <p className="text-primary text-sm">در حال بارگذاری...</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={!src || busy}>درج تصویر</Button>
      </DialogFooter>
    </form>
  )
}

function CheckRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor={id} className="font-normal">{label}</Label>
    </div>
  )
}
