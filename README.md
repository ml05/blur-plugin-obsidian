# Obsidian Spoiler Plugin

This Obsidian plugin allows you to blur text when a specified prefix is given. By default, the prefix is `!spoiler:` followed by the text to be blurred enclosed in `!` characters (`!spoiler:<text>!`).
## Features

- **Text Blurring:** Blur text that matches the specified prefix format.
- **Click Responses:**
    - **One Left Click:** Copies the text.
    - **Two Left Clicks:** Unblurs the text.
    - **One Right Click:** Reblurs the text if it's unblurred.

## Installation - GitHub

> ***NOTE:*** Desktop only and it's not available yet on the Community Plugins Store.

1. Clone the repo inside your ./obsidian/plugins folder
2. Restart Obsidian
3. Now you should see "Spoiler Plugin" in your Installed plugins section.

## Usage

### Blur Text

To blur text, use the following format:

```text
!spoiler:<text>!
```

Replace `<text>` with the text you want to blur. For example:

```text
!spoiler:This is a secret message!
```

### Click responses

- **One Left Click:** Click on the blurred text once to copy the text to the clipboard.
- **Two Left Clicks:** Double-click on the blurred text to unblur it and reveal the hidden text.
- **One Right Click:** Right-click on the blurred text to reblur it if it's currently unblurred.

## Settings

You can customize the plugin behavior in the Obsidian settings:

- Change the prefix/sufix format.

## Support

For any issues or feature requests, please [open an issue on GitHub](https://github.com/ml05/blur-plugin-obsidian/issues).
