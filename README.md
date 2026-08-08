# macOS Tahoe Replica

![macOS Tahoe Web Replica](https://github.com/Hellomyfriend19/Macostahoe/blob/main/Screenshot%20(196).png?raw=true)

> A highly detailed, interactive recreation of the macOS Tahoe desktop built for the web with HTML, CSS, JavaScript, and WebGL2.

**Live Demo:** https://macostahoe.vercel.app/  
**GitHub Repository:** https://github.com/Hellomyfriend19/Macostahoe/

---

## Overview

This project is an interactive **macOS Tahoe replica in HTML/CSS/JavaScript** that recreates the desktop experience directly in the browser.

It goes beyond a static visual mockup by implementing interactive windows, a customizable Dock, functional menu bar controls, animated window management, configurable appearance settings, and a custom **WebGL2 Liquid Glass rendering system**.

The project is designed to closely reproduce the visual appearance, animations, and interaction patterns of macOS Tahoe while remaining entirely web-based.

> This is an independent web recreation and is not affiliated with or endorsed by Apple Inc.

---

## ✨ Features

### 🫧 WebGL2 Liquid Glass

A custom **WebGL2-powered Liquid Glass system** is used throughout the interface.

The glass system provides:

- Real-time GPU-accelerated rendering
- Glass distortion and refraction
- Dynamic transparency
- Smooth glass surfaces
- Reflections and highlights
- Adjustable glass parameters
- Liquid Glass pop-ups and menus
- Configurable rendering resolution

The result is a more dynamic glass effect than a conventional CSS `backdrop-filter` implementation.

---

### 🪄 Genie Minimize Effect

Windows use a recreated **Genie-style minimization animation** when being minimized to the Dock.

The window smoothly deforms toward its destination instead of simply scaling or fading away.

---

### 🧭 macOS Tahoe Dock

The Dock has been recreated to closely match the macOS Tahoe design and behavior.

Features include:

- App icons
- Icon magnification
- Smooth hover animations
- Customizable size
- Adjustable icon scaling
- Adjustable magnification
- Adjustable hover smoothness
- Adjustable corner radius
- Dock depth controls
- Liquid Glass appearance
- Window minimization
- Genie minimize animation

---

### 🎛️ Customizable Dock

The Dock is highly configurable.

Available controls include:

- Dock size
- Icon scale
- Magnification
- Hover smoothness
- Corner radius
- Depth
- Blur
- Glass strength
- Rim lighting
- Reflection resolution

---

### 🌑 Dark Mode

A complete dark mode is supported throughout the desktop environment.

Dark mode affects the interface, windows, menus, Dock, controls, and other system UI.

---

### 🔳 Transparent Icon Mode

The interface includes a configurable **icon transparency mode** for integrating application icons more naturally into the Liquid Glass environment.

Additional icon controls include:

- Icon brightness
- Transparency
- Dark-mode icons
- White/black value thresholds

---

### 🪟 Liquid Glass Pop-ups

Menus and floating interfaces use the project's Liquid Glass rendering system.

This includes:

- Menu bar menus
- Context menus
- System pop-ups
- Floating controls
- Application interfaces
- Glass panels

---

### 🍎 Functional Menu Bar

The menu bar is interactive rather than being a static image.

Menu bar items can be opened and interacted with, including system-style menus and controls.

The project includes functional interfaces for areas such as:

- Finder
- File
- Edit
- View
- Go
- Window
- Help
- System controls

---

## ⚙️ Advanced Settings

The project includes an extensive settings system for adjusting the appearance and rendering of the desktop.

### Appearance

- Dark Mode
- Dark Mode Icons
- Icon Transparency
- Icon Brightness

### Dock

- Dock Size
- Dock Icon Scale
- Dock Magnification
- Dock Hover Smoothness
- Dock Depth
- Dock Blur
- Dock Strength
- Dock Corner Radius
- Rim Light Angle
- Rim Light Opacity
- Reflection Resolution

### Liquid Glass

Adjustable parameters are available for individual Liquid Glass interfaces, including:

- Glass depth
- Glass blur
- Glass strength
- Rendering parameters

### Window Appearance

Individual window types have configurable roundedness, allowing different interfaces to reproduce their respective macOS-style shapes.

### Terminal

Terminal appearance can also be customized, including:

- Corner radius
- Ribbon height
- Background blur
- Window tint
- Window opacity
- Ribbon tint

---

## 🖥️ Included Desktop Experience

The replica includes a variety of interactive desktop interfaces, including:

- Finder
- Safari
- Terminal
- System Settings
- Calendar
- Music
- Microsoft Word-style interface
- Launchpad
- About This Mac
- Menu bar
- Dock
- Context menus
- System dialogs
- Desktop widgets and controls

---

## 🛠️ Technology

The project is built using modern web technologies:

- **HTML5**
- **CSS3**
- **JavaScript**
- **TypeScript**
- **WebGL2**
- Custom GPU shaders
- Vite
- Browser GPU acceleration

WebGL2 is primarily used for the advanced Liquid Glass and distortion effects.

---

## 🚀 Run Locally

Clone the repository:

```bash
git clone https://github.com/Hellomyfriend19/Macostahoe.git
cd Macostahoe
