You can't copy text out of the editor's terminal pane with Ctrl+C

Environment: codeyam-editor 0.1.16 (commit bdf0a5d, production channel), Claude Code 2.1.311, GitHub Codespaces, Chrome. The left-hand terminal is the editor's own browser terminal (xterm.js over /ws/terminal), backed by `codeyam-editor-pty-broker`. It is not the VS Code terminal. TERM=xterm-256color, TERM_PROGRAM unset.

Symptom: the user tried to copy a GitHub branch URL printed by Claude in the terminal pane, and couldn't. Ctrl+C didn't copy the text. They had to ask Claude to put the link on a page in the Live Preview pane, where an ordinary text box and Ctrl+C worked straight away. While trying to get the link, they also ended up running `/clear` without meaning to, which wiped the conversation they were trying to copy from.

WHAT THE EDITOR ALREADY DOES

The terminal does have copy support. The editor bundle attaches a custom key handler (attachCustomKeyEventHandler). It copies and swallows the key when xterm has a selection and either of these is pressed:
  - Ctrl+C
  - Ctrl+Shift+C
With no selection, Ctrl+C goes through to the PTY as an interrupt. A right-click opens a context menu with Copy (⌘C / Ctrl+Shift+C), Paste and Select All. Copy uses navigator.clipboard.writeText.

So copying only works when xterm itself has a selection. Everything below follows from that.

FINDINGS

1. UNCONFIRMED likely cause: the full-screen TUI captures the mouse, so dragging never creates a selection.
   Claude Code runs as a full-screen TUI and can turn on terminal mouse reporting. While mouse tracking is on, xterm.js sends drag events to the app instead of selecting text. hasSelection() stays false, so Ctrl+C falls through to Claude Code as an interrupt. The user sees nothing get copied, and possibly an interrupt. I couldn't read the live xterm mode flags from inside the session, so this is inferred rather than measured.
   xterm.js has escape hatches for this: Shift+drag forces a selection, and Option+drag does on macOS when macOptionClickForcesSelection is on (the option is in the bundle). Nothing in the pane tells the user about them.

2. Nothing on screen explains how to copy.
   The right-click menu exists, but you'd only find it by accident. A user who presses Ctrl+C, out of habit from every other app, gets no feedback that it failed or why.

3. Long URLs wrap, so even a working selection breaks them.
   A URL that wraps across rows can be copied with a line break in it, depending on the selection mode. Claude Code's markdown links aren't made clickable in this pane unless a link provider recognises them. (Not tested separately; noted because it compounds #1.)

4. Losing the conversation made it worse.
   Once `/clear` ran, the text the user wanted was gone from the pane, and they had to ask a fresh session to look it up again. (User-reported. I don't know what led to `/clear` being run.)

PROPOSED FIX

1. Make Ctrl+C / Cmd+C copy reliably. If the TUI has mouse tracking on, show a one-time hint ("Hold Shift while dragging to select text"), or turn on xterm's force-selection modifier by default and document it.
2. Add a visible Copy affordance: a hover "copy" button on URLs found by a link provider, or a "Copy last link" action in the pane toolbar.
3. Register a URL link provider (xterm addon-web-links) so printed URLs can be clicked, including ones that wrap.
4. When Ctrl+C reaches the PTY because nothing is selected, briefly show "Nothing selected. Drag to select (Shift+drag inside apps), or right-click → Copy".

HOW TO CONFIRM THE FIX

In a Codespace, with Claude Code running in the editor's terminal pane, have Claude print a long URL. Then:
  - Drag over it and press Ctrl+C (or Cmd+C on a Mac). The clipboard should hold the exact URL with no line breaks.
  - Right-click → Copy should do the same.
  - Pressing Ctrl+C with nothing selected should still interrupt Claude, and show the hint.

## Raw evidence (collected 2026-10-27, read-only)

```
$ env | grep -E '^(TERM|COLORTERM|TERM_PROGRAM|CODESPACES|CODEYAM_EDITOR_PORT)'
COLORTERM=truecolor
TERM=xterm-256color
TERM_PROGRAM=
CODESPACES=true
CODEYAM_EDITOR_PORT=14199

$ ps (process chain of the terminal pane)
3989  codeyam-editor start ...
4273  codeyam-editor-pty-broker editor pty-broker daemon   (parent 3989)
7380  /bin/bash -l                                          (parent 4273)
7580  claude --permission-mode auto --session-id ...        (parent 7380)

$ claude --version
2.1.311 (Claude Code)

$ editor bundle — terminal key handler (minified excerpt)
(b.ctrlKey&&b.shiftKey&&!b.metaKey&&!b.altKey&&b.key.toLowerCase()==="c"
 ||b.ctrlKey&&!b.shiftKey&&!b.metaKey&&!b.altKey&&b.key.toLowerCase()==="c")
 &&e.hasSelection()?(d(),!1):!0}
e.attachCustomKeyEventHandler(g);
... data-terminal-clipboard-menu ... "Copy" (r?"⌘C":"Ctrl+Shift+C"), "Paste", "Select All"

$ string counts in the editor binary
attachCustomKeyEventHandler: 5   navigator.clipboard.writeText: 10
macOptionClickForcesSelection: 3   copyOnSelect: 0
```
