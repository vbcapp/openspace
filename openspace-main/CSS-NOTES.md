# 1-BIT DOOMSDAY ENGINE - Visual Effects & CSS Analysis

## 1. COLOR PALETTE

### Core Colors
- **Background (Black)**: `#000000` — Pure black, set as `--bg-color` CSS variable
- **Foreground (Nuclear Red)**: `#FF3F00` — Set as `--fg-color` CSS variable
  - RGB breakdown: R=255 (100%), G=63 (24.7%), B=0 (0%)
  - This is a bright, warm nuclear orange-red with maximum saturation
- **Grid Size**: `--grid-size: 4px` — Controls dither pattern scale

### Color Usage Strategy
- Black on red inverts form interactive elements (buttons, highlights)
- Red (#FF3F00) is used for:
  - All borders (2px, 4px widths)
  - Text color on black backgrounds
  - Hover state backgrounds
  - Header bar background (inverted)
  - Grid dither pattern (15% opacity)
  - Box shadows with 30% opacity
  - Scrollbar styling
  - Loader bar fills

---

## 2. TYPOGRAPHY

### Font Stack
```css
font-family: 'VT323', 'Noto Sans TC', monospace;
```
- **VT323**: Monospaced retro bitmap font (from Google Fonts) — Primary choice
- **Noto Sans TC**: Chinese sans-serif fallback (500, 900 weights imported)
- **monospace**: System fallback

### Font Smoothing (Anti-Aliasing Disabled for Pixel Aesthetic)
```css
* {
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
}
```
- Forces pixel-perfect rendering without anti-aliasing smoothing
- Maintains harsh, pixelated edges for 1-bit aesthetic
- Applied globally via `*` selector

### Font Sizes (Responsive with clamp)
- **Title (.pixel-title)**: `clamp(2.5rem, 5vw, 4rem)`
  - Minimum: 2.5rem (40px)
  - Viewport-relative: 5vw
  - Maximum: 4rem (64px)
- **Output text (.output-text)**: `clamp(1.1rem, 2.8vw, 1.5rem)`
  - Minimum: 1.1rem (17.6px)
  - Viewport-relative: 2.8vw
  - Maximum: 1.5rem (24px)
- **Zone label (.zone-label)**: 1.05rem
- **Zone sub (.zone-sub)**: 0.75rem (75% opacity)
- **Pain box (.pain-box)**: 0.9rem

### Line Heights
- Title: `0.9` (tight, compressed leading)
- Output text: `1.6` (generous spacing for readability)
- Invert-hl (highlight): `1.8` (extra spacing for inverted boxes)

### Font Weights
- Title: `bold`
- Buttons: `bold` to `900`
- Zone labels: `bold`

---

## 3. BACKGROUND EFFECTS

### Dither Grid (1-Bit Pattern)

#### HTML Element
```html
<div class="dither-bg"></div>
```

#### CSS Construction
```css
.dither-bg {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image:
        linear-gradient(var(--fg-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--fg-color) 1px, transparent 1px);
    background-size: var(--grid-size) var(--grid-size);  /* 4px × 4px */
    background-position: center;
    opacity: 0.15;  /* Subtle, 15% visible */
    pointer-events: none;  /* Non-interactive */
    z-index: 0;  /* Behind everything */
}
```

#### How It Works
1. **First gradient** (`linear-gradient`): Creates horizontal lines
   - 1px solid line in red (#FF3F00), then transparent
   - Repeats vertically
2. **Second gradient** (`linear-gradient(90deg)`): Creates vertical lines
   - Same pattern, rotated 90° for columns
3. **Layering**: Both gradients combine to form a 4×4px grid
4. **Opacity**: 0.15 (15%) makes it barely visible, subtle texture
5. **Fixed position**: Stays in viewport, not affected by scrolling

#### Visual Effect
- Creates a newspaper halftone/dither pattern
- Reminiscent of old CRT monitors and 1-bit graphics
- Background stays consistent across all three views

---

## 4. ANIMATIONS

### A. CRT Scanline Animation

#### HTML
```html
<div class="terminal-content scan-line-anim">...</div>
```

#### CSS
```css
.scan-line-anim::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0; left: 0; width: 100%; height: 2px;
    background: var(--fg-color);  /* Red scanline */
    opacity: 0.5;  /* 50% transparency */
    animation: scan 4s linear infinite;
    pointer-events: none;
}

@keyframes scan {
    0% { top: 0%; }
    100% { top: 100%; }
}
```

#### Behavior
- **Pseudo-element (::before)** creates a horizontal 2px bar
- **Animation duration**: 4 seconds per complete cycle
- **Linear timing**: Constant velocity (no easing)
- **Infinite loop**: Repeats continuously
- **Motion**: Travels from top (0%) to bottom (100%)
- **Visual**: Simulates old CRT monitor scan beams sweeping downward

---

### B. Glitch Skew Animation

#### HTML
```html
<h1 class="pixel-title">DOOMSDAY<br>ENGINE</h1>
```

#### CSS
```css
.pixel-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 0.9;
    text-align: center;
    margin-bottom: 1.2rem;
    position: relative;
    animation: glitch-skew 3s infinite linear alternate-reverse;
}

@keyframes glitch-skew {
    0% { transform: skew(0deg); }
    20% { transform: skew(-10deg); }
    22% { transform: skew(10deg); }
    24% { transform: skew(0deg); }
    100% { transform: skew(0deg); }
}
```

#### Behavior
- **Trigger**: Every 3 seconds, title experiences rapid skew effect
- **Keyframes**:
  - 0%: Normal (0°)
  - 20%: Left skew (-10° = leftward lean)
  - 22%: Right skew (+10° = rightward lean) — sharp flip for glitch effect
  - 24%: Back to normal (0°)
  - 100%: Normal (0°)
- **Timing**: `infinite linear` — repeats smoothly without easing
- **Direction**: `alternate-reverse` — plays forward then backward continuously
- **Duration**: 3 seconds per cycle
- **Visual Effect**: Sharp 2-frame jitter effect, simulating digital corruption/glitch

---

### C. Blink Animation

#### CSS
```css
.blink { animation: blink 1s step-end infinite; }

@keyframes blink {
    50% { opacity: 0; }
}
```

#### Behavior
- **Duration**: 1 second per cycle
- **Timing**: `step-end` — discrete steps (no smooth transition)
  - 0%-50%: Visible (opacity: 1 by default)
  - 50%-100%: Invisible (opacity: 0)
- **Used for**: 
  - "/// SELECT PROTOCOL ///" text
  - "/// CHOOSE YOUR SIN ///" text
  - Cursor indicator (`<span class="blink">_</span>`)
- **Visual**: Classic retro blinking cursor effect

---

### D. Text Scrambler - JavaScript Animation

#### Implementation (lines 1116-1146)
```javascript
class Scrambler {
    constructor(el) {
        this.el = el;
        this.chars = '█▓▒░▀▄▌▐';  // Block characters for 1-bit effect
    }
    
    run(raw, html) {
        const len = Math.max(this.el.innerText.length, raw.length);
        return new Promise(resolve => {
            let frame = 0;
            const interval = setInterval(() => {
                let out = '';
                // Scrambler logic
                for(let i=0; i<len; i++) {
                    if (frame > 20 + Math.random()*20) {
                        out += raw[i] || '';  // Show real character
                    } else {
                        // Show random block character
                        out += this.chars[Math.floor(Math.random()*this.chars.length)];
                    }
                }
                this.el.innerText = out;  // Display scrambled text
                
                frame++;
                if (frame > 50) {
                    clearInterval(interval);
                    this.el.innerHTML = html;  // Final render with HTML
                    resolve();
                }
            }, 30);  // Update every 30ms
        });
    }
}
```

#### Character Set
```
█ ▓ ▒ ░ ▀ ▄ ▌ ▐
```
- Full block, dark shade, medium shade, light shade, horizontal shapes
- Creates "data corruption" visual while text reveals

#### Behavior
- **Trigger**: Called when `generate()` completes
- **Duration**: ~1.5 seconds (50 frames × 30ms)
- **Progression**:
  - Frames 0-20: Mostly show block characters
  - Frames 20-40: Gradually reveal real letters mixed with blocks
  - Frames 40-50: Mostly real letters with occasional blocks
  - Frame 50+: Complete clear text, swap to HTML with styling
- **Random threshold**: `20 + Math.random()*20` — each frame has slightly different reveal timing per character
- **30ms interval**: Gives ~33 FPS animation feel
- **Final step**: Replaces plain text with HTML version containing `<span class="invert-hl">` highlights

---

### E. Loader Bar Animation

#### HTML
```html
<div class="loader-box" id="loader-box">
    <div class="loader-bar" id="loader-bar"></div>
</div>
```

#### CSS
```css
.loader-box {
    width: 100%; height: 16px;
    border: 2px solid var(--fg-color);  /* Red border */
    padding: 2px;
    margin-bottom: 12px;
    display: none;  /* Hidden initially */
    flex-shrink: 0;
}
.loader-bar {
    height: 100%;
    background: var(--fg-color);  /* Red fill */
    width: 0%;  /* Starts empty */
}
```

#### JavaScript Control (lines 1183-1197)
```javascript
let w = 0;
const t = setInterval(() => {
    w += 10;  // Increment by 10% each frame
    els.loader.style.width = w + '%';
    if (w >= 100) {
        clearInterval(t);
        els.loaderBox.style.display = 'none';
        // Proceed to scrambler animation
    }
}, 30);  // Update every 30ms (~10 frames per second)
```

#### Animation Details
- **Duration**: ~300ms (10 increments × 30ms)
- **Linear progression**: 0% → 10% → 20% ... → 100%
- **Visual**: Red bar fills horizontally inside bordered box
- **Timing**: Completes before text scrambler begins
- **Direction**: Always left-to-right

---

## 5. COMPONENT STYLES

### A. Terminal Wrapper (Main Container)

#### HTML
```html
<div class="terminal-wrapper">
    <div class="terminal-header">...</div>
    <div class="terminal-content">...</div>
</div>
```

#### CSS
```css
.terminal-wrapper {
    position: relative;
    z-index: 10;
    width: 95%;
    max-width: 800px;
    height: 90vh;
    max-height: 800px;
    border: 4px solid var(--fg-color);  /* Thick red border */
    background-color: var(--bg-color);  /* Black fill */
    display: flex;
    flex-direction: column;
    box-shadow: 10px 10px 0px rgba(255, 63, 0, 0.3);  /* Hard shadow offset */
}
```

#### Details
- **Layout**: Flexbox column (stacks header + content vertically)
- **Sizing**: 
  - Width: 95% of viewport (mobile-friendly)
  - Max-width: 800px (doesn't grow larger)
  - Height: 90vh (90% of viewport height)
  - Max-height: 800px
- **Border**: 4px solid red (#FF3F00) — thick, prominent
- **Shadow**: Offset 10px right, 10px down, 30% opacity red
  - Creates hard-edge 1980s computer aesthetic
  - Not blurred, sharp edges
- **Z-index**: 10 (above dither background at 0)
- **Position**: `relative` for z-index context

---

### B. Terminal Header (Top Bar)

#### HTML
```html
<div class="terminal-header">
    <span>VIBE_OS v2.0</span>
    <span id="clock">00:00:00</span>
</div>
```

#### CSS
```css
.terminal-header {
    background: var(--fg-color);  /* Red background */
    color: var(--bg-color);  /* Black text (inverted) */
    padding: 8px 16px;
    font-size: 1.2rem;
    font-weight: bold;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;  /* Prevents compression */
}
```

#### Details
- **Inversion**: Red background + black text (opposite of normal scheme)
- **Layout**: `flex` with `space-between` — title left, clock right
- **Padding**: 8px top/bottom, 16px left/right
- **Text**: UPPERCASE, bold, 1.2rem size
- **Flex-shrink: 0**: Maintains fixed height, won't be squeezed by content
- **Content**: "VIBE_OS v2.0" (left), live clock (right, updated every second in JS)

---

### C. Terminal Content (Scrollable Area)

#### HTML
```html
<div class="terminal-content scan-line-anim">
    <!-- Views (home, zones, gen) nested here -->
</div>
```

#### CSS
```css
.terminal-content {
    flex-grow: 1;  /* Takes remaining space */
    padding: 1.2rem 1.5rem;  /* Inner spacing */
    overflow-y: auto;  /* Vertical scrolling when needed */
    display: flex;
    flex-direction: column;
    position: relative;  /* For scan-line pseudo-element */
    min-height: 0;  /* Allows proper flex shrinking */
}

/* Custom Scrollbar (1-bit style) */
.terminal-content::-webkit-scrollbar { 
    width: 12px;  /* Thick scrollbar */
}
.terminal-content::-webkit-scrollbar-track { 
    background: var(--bg-color);  /* Black track */
    border-left: 2px solid var(--fg-color);  /* Red left border */
}
.terminal-content::-webkit-scrollbar-thumb { 
    background: var(--fg-color);  /* Red handle */
}
.terminal-content::-webkit-scrollbar-thumb:hover { 
    background: #fff;  /* White on hover (invert) */
}
```

#### Details
- **Flex-grow: 1**: Expands to fill wrapper space
- **Overflow-y: auto**: Scrollbar appears when content exceeds height
- **Padding**: 1.2rem vertical, 1.5rem horizontal (internal spacing)
- **Position: relative**: Allows scan-line pseudo-element positioning
- **Min-height: 0**: Critical for flex layout to shrink properly
- **Scrollbar**: 
  - Width: 12px (thick, visible)
  - Track: Black background with red left border
  - Thumb: Red, changes to white on hover (inverted)

---

### D. Mode Buttons (Home Screen Selection)

#### HTML
```html
<div class="mode-btn" onclick="startApp('classic')">
    <div class="flex items-center text-2xl font-bold mb-2">
        <span class="pixel-decor"></span>
        CLASSIC MODE
    </div>
    <div class="text-sm opacity-80 pl-6">
        > LOAD CURATED DATABASE<br>
        > HUMAN VERIFIED DILEMMAS<br>
        > 7 ZONES / 85+ BILLS
    </div>
</div>
```

#### CSS
```css
.mode-btn {
    border: 2px solid var(--fg-color);  /* Red border */
    padding: 16px 20px;  /* Generous padding */
    margin-bottom: 12px;  /* Space between buttons */
    cursor: pointer;
    transition: 0s;  /* Instant state change, no animation */
    position: relative;
}

/* Hover: Full Invert */
.mode-btn:hover {
    background-color: var(--fg-color);  /* Red background */
    color: var(--bg-color);  /* Black text */
}

/* Pixel Decor (small square icon) */
.pixel-decor {
    display: inline-block;
    width: 10px; height: 10px;
    background-color: var(--fg-color);  /* Red square */
    margin-right: 8px;
}
.mode-btn:hover .pixel-decor { 
    background-color: var(--bg-color);  /* Becomes black on hover */
}
```

#### Details
- **Border**: 2px red, all four sides
- **Padding**: 16px vertical, 20px horizontal (boxy, retro)
- **Transition: 0s**: Critical for 1-bit aesthetic — NO fade, instant flip
- **Hover state**: 
  - Background becomes red (#FF3F00)
  - Text becomes black
  - Pixel decor square inverts to black
- **Pixel decor**: 10×10px square, acts as visual marker

---

### E. Action Button (EXECUTE)

#### HTML
```html
<button class="action-btn" onclick="generate()">
    >>> EXECUTE
</button>
```

#### CSS
```css
.action-btn {
    width: 100%;  /* Full width of container */
    padding: 14px;  /* Inner padding */
    font-size: 1.3rem;
    font-weight: bold;
    text-transform: uppercase;
    background: var(--bg-color);  /* Black background */
    color: var(--fg-color);  /* Red text */
    border: 4px solid var(--fg-color);  /* Thick red border */
    cursor: pointer;
    margin-top: 12px;
    transition: 0s;  /* Instant toggle */
    flex-shrink: 0;  /* Maintains height */
}

/* Hover: Invert */
.action-btn:hover {
    background: var(--fg-color);  /* Red background */
    color: var(--bg-color);  /* Black text */
}

/* Active: Press Effect */
.action-btn:active {
    transform: translateY(4px);  /* Move down 4px */
    box-shadow: inset 0 0 0 2px var(--bg-color);  /* Inner shadow */
}
```

#### Details
- **Full width**: `width: 100%` spans container
- **Thick border**: 4px solid red (thicker than mode-btn's 2px)
- **Transition: 0s**: Instant state change
- **Hover**: Complete color inversion
- **Active state**: 
  - `translateY(4px)`: Press effect (moves down)
  - `inset` shadow: Creates depressed appearance

---

### F. Output Text Area (Question Display)

#### HTML
```html
<div class="output-text" id="q-out">
    [ SYSTEM READY ]<br>
    WAITING FOR INPUT...
</div>
```

#### CSS
```css
.output-text {
    font-size: clamp(1.1rem, 2.8vw, 1.5rem);  /* Responsive size */
    line-height: 1.6;  /* Generous vertical spacing */
    text-align: center;
    font-weight: 700;  /* Bold */
    border-bottom: 2px dashed var(--fg-color);  /* Red dashed underline */
    margin-bottom: 16px;
    padding: 1rem 0 1rem;  /* Vertical padding */
    word-break: break-word;  /* Wrap long words */
    overflow-wrap: break-word;  /* Alternative for word wrapping */
    flex-shrink: 0;  /* Maintains height */
}
```

#### Details
- **Font size**: Responsive via `clamp()`
  - Min: 1.1rem, Max: 1.5rem, Viewport: 2.8vw
- **Line height**: 1.6 (spacious, easy to read)
- **Border**: 2px dashed red (bottom only)
- **Text wrapping**: Both `word-break` and `overflow-wrap` ensure long text wraps
- **Flex-shrink: 0**: Prevents squishing
- **Content**: Contains question HTML with `<span class="invert-hl">` highlights injected by scrambler

---

### G. Invert Highlight (Text Styling)

#### HTML (injected by JavaScript)
```html
<span class="invert-hl">數位永生</span>
```

#### CSS
```css
.invert-hl {
    background-color: var(--fg-color);  /* Red background */
    color: var(--bg-color);  /* Black text */
    padding: 1px 5px;  /* Tight padding around text */
    margin: 0 2px;  /* Space between highlighted words */
    display: inline;  /* Flows with text */
    line-height: 1.8;  /* Extra vertical space */
}
```

#### Details
- **Background**: Red (#FF3F00)
- **Text**: Black (#000000)
- **Padding**: 1px top/bottom, 5px left/right (tight box)
- **Margin**: 2px on sides (separation from adjacent text)
- **Display: inline**: Wraps individual words, doesn't break lines
- **Line height**: 1.8 (extra space for visual clarity within invert)
- **Usage**: Highlights key terms like "數位永生" (digital immortality), "支持" (support)

---

### H. Pain Box (Opportunity Display)

#### HTML
```html
<div class="pain-box" id="p-out">
    <!-- >> ZONE: PRIDE // OPPORTUNITY: 數位生死權 / 算力正義平台 -->
</div>
```

#### CSS
```css
.pain-box {
    font-size: 0.9rem;  /* Smaller text */
    text-transform: uppercase;  /* ALL CAPS */
    margin-bottom: 8px;  /* Space before button */
    flex-shrink: 0;  /* Maintains height */
    word-break: break-word;  /* Wraps long content */
    overflow-wrap: break-word;
}
```

#### Details
- **Size**: 0.9rem (smaller than question)
- **Case**: UPPERCASE (all caps)
- **Margin**: 8px below (small separation)
- **Content format**: ">> ZONE: [ZONE] // OPPORTUNITY: [PAIN POINT]"
- **No special styling**: Plain red text on black, no inversion/border

---

### I. Zone Display (Selected Zone Info)

#### HTML
```html
<div class="zone-display hidden" id="zone-display">
    <img id="zone-logo" src="" alt="" class="zone-logo">
    <div class="zone-cross-icon hidden" id="zone-cross-icon">X</div>
    <div class="zone-info">
        <div class="zone-label" id="zone-label">ZONE: NULL</div>
        <div class="zone-sub" id="zone-sub">---</div>
    </div>
</div>
```

#### CSS
```css
.zone-display {
    display: flex;  /* Horizontal layout */
    align-items: center;
    gap: 10px;  /* Space between icon and text */
    border: 2px solid var(--fg-color);  /* Red border */
    padding: 6px 10px;  /* Compact padding */
    margin-bottom: 12px;
    flex-shrink: 0;
    min-height: 52px;  /* Ensures height for icon */
}

.zone-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    flex-shrink: 0;
    /* Filter: Converts white PNG to nuclear red (#FF3F00) */
    filter: brightness(0) invert(31%) sepia(98%) saturate(6630%) 
            hue-rotate(10deg) brightness(103%) contrast(107%);
}

.zone-info {
    flex: 1;  /* Takes remaining space */
    min-width: 0;
}

.zone-label {
    font-size: 1.05rem;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;  /* Prevents line wrap */
    overflow: hidden;  /* Clips overflow */
    text-overflow: ellipsis;  /* Shows "..." */
}

.zone-sub {
    font-size: 0.75rem;
    opacity: 0.6;  /* Dimmed */
}

/* Cross Zone Variant */
.zone-display.is-cross .zone-cross-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: 2px solid var(--fg-color);  /* Red border */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: bold;
}
```

#### Details
- **Layout**: Flexbox row (icon + text side-by-side)
- **Icon**: 40×40px with advanced SVG filter
  - `brightness(0)`: Makes image black
  - `invert(31%)`: Inverts to white
  - `sepia(98%)`: Adds red tint
  - `saturate(6630%)`: Hyper-saturates red channel
  - `hue-rotate(10deg)`: Fine-tunes hue to nuclear red
  - `brightness(103%), contrast(107%)`: Final brightness boost
- **Text**: Label (bold, large) + subtitle (small, dimmed)
- **Cross variant**: Shows "X" in bordered box instead of logo image

---

### J. Zone Selection Grid

#### HTML
```html
<div class="zone-grid">
    <div class="zone-btn" onclick="selectZone('pride')">
        <img src="..." class="zone-btn-logo" alt="Pride">
        <div class="zone-btn-info">
            <div class="zone-btn-en">PRIDE</div>
            <div class="zone-btn-zh">驕傲之塔</div>
        </div>
    </div>
    <!-- 8 total buttons including CROSS-ZONE -->
</div>
```

#### CSS
```css
.zone-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;  /* 2 columns */
    gap: 8px;  /* Space between items */
}

.zone-btn {
    border: 2px solid var(--fg-color);  /* Red border */
    padding: 10px;
    cursor: pointer;
    transition: 0s;  /* Instant toggle */
    display: flex;  /* Layout icon + text */
    align-items: center;
    gap: 10px;
}

.zone-btn:hover {
    background-color: var(--fg-color);  /* Red background */
    color: var(--bg-color);  /* Black text */
}

.zone-btn:hover .zone-btn-logo {
    filter: brightness(0);  /* Darkens logo on hover */
}

.zone-btn:hover .zone-btn-cross-icon {
    border-color: var(--bg-color);  /* Black border on hover */
    color: var(--bg-color);  /* Black "X" */
}

.zone-btn-logo {
    width: 36px;
    height: 36px;
    object-fit: contain;
    flex-shrink: 0;
    /* Same color filter as zone-display logo */
    filter: brightness(0) invert(31%) sepia(98%) saturate(6630%) 
            hue-rotate(10deg) brightness(103%) contrast(107%);
}

.zone-btn-info {
    min-width: 0;  /* Allows text truncation */
}

.zone-btn-en {
    font-size: 1rem;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.zone-btn-zh {
    font-size: 0.7rem;
    opacity: 0.7;  /* Slightly dimmed */
}

/* CROSS-ZONE spans full width */
.zone-btn-cross {
    grid-column: 1 / -1;  /* Spans both columns */
}

.zone-btn-cross-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 2px solid var(--fg-color);  /* Red border */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
}
```

#### Details
- **Grid**: 2 columns, 8px gap
- **Buttons**: 7 sins + 1 cross-zone = 8 buttons
- **Cross-zone**: Spans both columns (full width)
- **Button layout**: Icon (36×36) + text (English + Chinese)
- **Hover**: Inverts to red background, darkens logo
- **Logo filter**: Same color transformation as zone display
- **Text truncation**: `overflow: hidden + text-overflow: ellipsis`

---

### K. Counter Display (Bottom Info)

#### HTML
```html
<div class="counter-display">
    <span id="seed-ui">ID: 000000</span>
    <span id="gen-count">GEN: 0</span>
</div>
```

#### CSS
```css
.counter-display {
    font-size: 0.85rem;  /* Small text */
    opacity: 0.7;  /* Dimmed */
    border-top: 1px dashed var(--fg-color);  /* Red dashed line */
    padding-top: 6px;  /* Space above text */
    margin-top: 6px;  /* Space below previous element */
    display: flex;
    justify-content: space-between;  /* Spreads items left/right */
    flex-shrink: 0;  /* Maintains height */
}
```

#### Details
- **Size**: 0.85rem (small, secondary info)
- **Opacity**: 0.7 (dimmed, not prominent)
- **Border**: 1px dashed red (top only)
- **Layout**: Flex with `space-between` (ID left, GEN count right)
- **Content**: 
  - Left: `ID: [seed number]` (changes per generation)
  - Right: `GEN: [counter]` (counts button clicks)

---

## 6. KEY CSS PATTERNS

### A. Instant Transition (0s) - Core 1-Bit Principle

```css
transition: 0s;
```

Applied to:
- `.mode-btn`
- `.action-btn`
- `.zone-btn`
- All hover states

**Why**: No fade, no easing. 1-bit aesthetic demands instant state changes.
- Hover: Immediate color flip (red ↔ black)
- No animation between states
- Feels "digital" and "hard-edged"

---

### B. Border-Radius: 0 Everywhere

**Default**: `border-radius: 0` (implicit in global `box-sizing: border-box`)

**Effect**: All elements have sharp, 90-degree corners
- No rounded buttons
- No soft edges
- Maintains pixelated aesthetic
- Consistent with retro computer UI

**Note**: Not explicitly set (CSS defaults to 0), but worth noting it's never overridden.

---

### C. Invert-HL Highlight Style

```css
.invert-hl {
    background-color: var(--fg-color);  /* #FF3F00 */
    color: var(--bg-color);  /* #000000 */
    padding: 1px 5px;
    display: inline;
}
```

**Pattern**: Used extensively in question text
- Highlights key decisions (e.g., "支持" = support)
- Creates visual emphasis
- Complements overall red/black scheme
- Example: "允許意識上傳至量子雲端獲得<span class='invert-hl'>數位永生</span>"

---

### D. Overflow Handling

Three-layer approach:

1. **Terminal wrapper**: `overflow: hidden` on body
   - Prevents page scroll
   - Keeps content within viewport

2. **Terminal content**: `overflow-y: auto`
   - Allows scrolling within content area
   - Shows scrollbar when needed

3. **Text wrapping**: 
   ```css
   word-break: break-word;
   overflow-wrap: break-word;
   ```
   - Ensures long words don't overflow
   - Forces line breaks at word boundaries

---

### E. Flex Shrinking Control

```css
flex-shrink: 0;
```

Applied to:
- `.terminal-header` — prevents header compression
- `.terminal-content` — via `min-height: 0`
- `.output-text`, `.pain-box`, `.action-btn`, `.counter-display`
- `.zone-display`, `.loader-box`

**Purpose**: Maintains fixed heights of UI elements, prevents squishing when content is less than viewport height.

---

### F. Responsive Sizing with clamp()

```css
font-size: clamp(MIN, VIEWPORT, MAX);
```

Example: `.pixel-title`
```css
font-size: clamp(2.5rem, 5vw, 4rem);
```

**Breakdown**:
- Minimum: 2.5rem (40px) on small screens
- Scales: 5% of viewport width (fluid)
- Maximum: 4rem (64px) on large screens

**Benefits**:
- Single responsive rule (no media queries)
- Always readable
- Scales naturally with viewport

---

### G. Pseudo-Element Animations

**Scan-line effect** uses `::before`:
```css
.scan-line-anim::before {
    content: " ";
    position: absolute;
    /* ... positioned absolutely */
    animation: scan 4s linear infinite;
}
```

**Advantages**:
- No extra HTML markup
- Easy to toggle with class
- Overlays without affecting layout

---

### H. Grid-based Layout for Zones

```css
.zone-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.zone-btn-cross {
    grid-column: 1 / -1;  /* Spans all columns */
}
```

**Pattern**: 2-column layout with full-width special item
- Modern, responsive
- Simple gap management
- Clear hierarchy (7 sins in 2x4, cross-zone below)

---

### I. Filter for Color Transformation

Logo color conversion from white to nuclear red:
```css
filter: brightness(0) invert(31%) sepia(98%) saturate(6630%) 
        hue-rotate(10deg) brightness(103%) contrast(107%);
```

**Process**:
1. `brightness(0)` — turn image pure black
2. `invert(31%)` — begin inversion to white
3. `sepia(98%)` — add red/brown tint
4. `saturate(6630%)` — maximize color saturation
5. `hue-rotate(10deg)` — fine-tune red tone
6. `brightness(103%), contrast(107%)` — final tweaks

**Result**: White PNG converted to #FF3F00 red without image editing

---

## 7. RESPONSIVE/LAYOUT APPROACH

### Container Sizing
```css
.terminal-wrapper {
    width: 95%;  /* Mobile-friendly */
    max-width: 800px;  /* Desktop cap */
    height: 90vh;
    max-height: 800px;
}
```

### Fluid Typography
```css
font-size: clamp(MIN, VIEWPORT%, MAX);
```

### Flexible Grid
```css
.zone-grid {
    grid-template-columns: 1fr 1fr;  /* Always 2 columns */
    gap: 8px;  /* Fixed gap */
}
```

### Viewport Centering
```css
body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
}
```

### No Media Queries
- Uses `clamp()` instead of breakpoints
- Uses viewport percentages
- Uses flexible units (rem, %)
- Adapts smoothly across all screen sizes

---

## 8. TAILWIND CSS INTEGRATION

The HTML uses Tailwind utility classes alongside custom CSS:

```html
<h1 class="pixel-title">DOOMSDAY<br>ENGINE</h1>
<div class="text-center mb-4 blink text-lg">/// SELECT PROTOCOL ///</div>
<div class="flex items-center text-2xl font-bold mb-2">
    <span class="pixel-decor"></span>
    CLASSIC MODE
</div>
```

**Tailwind utilities used**:
- `text-center`, `text-lg`, `text-2xl` — text sizing
- `mb-4`, `mb-2`, `pl-6` — margins/padding
- `flex`, `items-center` — layout
- `font-bold` — text weight
- `w-full`, `gap-2` — sizing/spacing
- `hidden` — display toggle
- `hover:bg-[#FF3F00]`, `hover:text-black` — hover states

**Custom Tailwind config** (implied):
```javascript
theme: {
    colors: {
        'custom-red': '#FF3F00',
        'custom-black': '#000000'
    }
}
```

**Philosophy**: Tailwind for layout/utility, custom CSS for visual effects and animations.

---

## 9. JAVASCRIPT VISUAL EFFECTS

### Clock Update (Line 524-527)
```javascript
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').innerText = 
        now.toLocaleTimeString('en-US', {hour12: false});
}, 1000);
```

Updates header clock every second with HH:MM:SS format (24-hour).

---

### Scrambler Animation Details

**Character reveal sequence**:
- Frame 0-20: ~50% block characters (█▓▒░▀▄▌▐), 50% real letters
- Frame 20-40: Transition zone (increasingly real letters)
- Frame 40-50: ~50% real letters, 50% blocks
- Frame 50+: 100% real letters with HTML styling

**30ms refresh** = ~33 FPS, smooth visual effect.

---

### Loader Bar Animation Details

```javascript
let w = 0;
const t = setInterval(() => {
    w += 10;  // Increment width percentage
    els.loader.style.width = w + '%';
    if (w >= 100) clearInterval(t);
}, 30);  // Update every 30ms
```

Creates 10-step progress bar (0% → 10% → 20% ... → 100%) over ~300ms.

---

## 10. ANIMATION TIMING SUMMARY

| Effect | Duration | Timing | Loop |
|--------|----------|--------|------|
| Scanline | 4s | Linear | Infinite |
| Glitch Skew | 3s | Linear | Alternate-reverse |
| Blink | 1s | Step-end | Infinite |
| Scrambler | ~1.5s | Custom (30ms frames) | Once |
| Loader | ~300ms | Stepped | Once |

---

## 11. COLOR USAGE BREAKDOWN

### #FF3F00 (Nuclear Red) Used For:
- All borders (2px, 4px)
- Text on black backgrounds
- Buttons on hover (background)
- Header background
- Dither grid (15% opacity)
- Icon colors (via filter)
- Shadows (30% opacity)
- Scrollbar styling
- Loader bar

### #000000 (Black) Used For:
- Page background
- Header text (inverted)
- Button text on hover
- Text on red highlights
- Border of scrollbar track

### Opacity Variations:
- Header: 100%
- Text: 100%
- Borders: 100%
- Dither grid: 15%
- Scanline: 50%
- Zone sub-text: 60%
- Zone-zh text: 70%
- Counter display: 70%

---

## 12. FONT RENDERING

### Anti-Aliasing Disabled
```css
* {
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
}
```

**Effect**: Text renders with sharp, pixelated edges instead of smooth anti-aliased curves.

**VT323 font**: Monospaced, retro bitmap style — enhances pixelated appearance.

---

## CONCLUSION

This 1-BIT DOOMSDAY ENGINE UI demonstrates advanced CSS technique combined with JavaScript animation to create a cohesive retro-futuristic aesthetic. Key principles:

1. **Color discipline**: Binary red/black palette throughout
2. **Animation timing**: Instant transitions (0s), no easing
3. **Typography**: Pixel-perfect rendering with monospace fonts
4. **Layout**: Flexbox + Grid for responsive structure
5. **Visual effects**: Scanlines, glitch, scrambler, loader as narrative elements
6. **User interaction**: Instant feedback via color inversion
7. **Responsive**: clamp() and viewport units instead of breakpoints

The entire design reinforces a "digital" aesthetic: hard edges, harsh colors, instant reactions, and corrupt-data animations. Every detail serves the 1-bit retro-futuristic theme.
