import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface BlurPluginSettings {
    blurSyntax: string;
    blurEndpoint: string;
}

const DEFAULT_SETTINGS: BlurPluginSettings = {
    blurSyntax: '!spoiler:',
    blurEndpoint: '!'
}

export default class BlurPlugin extends Plugin {
    settings: BlurPluginSettings;

    async onload() {
        console.log('Loading BlurPlugin');
        await this.loadSettings();
        this.loadStyles();

        this.addCommand({
            id: 'blur-selected-text',
            name: 'Blur selected text',
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "q" }],
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const selection = editor.getSelection();
                const blurredText = `${this.settings.blurSyntax}${selection}${this.settings.blurEndpoint}`;
                editor.replaceSelection(blurredText);
                editor.setCursor(editor.getCursor().line, editor.getCursor().ch - this.settings.blurEndpoint.length);
                console.log('Blurred text added:', blurredText);
            }
        });

        this.addSettingTab(new BlurSettingTab(this.app, this));

        this.registerMarkdownPostProcessor((element, context) => {
            console.log('Markdown post-processor called');
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
            let node;
            const nodesToReplace = [];

            while (node = walker.nextNode()) {
                const text = node.nodeValue || "";
                console.log('Processing text node:', text);
                const regex = new RegExp(`${this.settings.blurSyntax}(.*?)${this.settings.blurEndpoint}`, 'g');
                let match;
                let lastIndex = 0;
                const fragments = [];

                while ((match = regex.exec(text)) !== null) {
                    console.log('Found match:', match[0]);
                    if (match.index > lastIndex) {
                        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
                    }
                    const span = document.createElement('span');
                    span.textContent = match[1];
                    span.addClass('blur-plugin-text');
                    span.addEventListener('click', this.handleLeftClick.bind(this));
                    span.addEventListener('contextmenu', this.handleRightClick.bind(this));
                    fragments.push(span);
                    lastIndex = regex.lastIndex;
                }

                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.slice(lastIndex)));
                }

                if (fragments.length > 0) {
                    nodesToReplace.push({ node, fragments });
                }
            }

            console.log('Nodes to replace:', nodesToReplace.length);
            nodesToReplace.forEach(({ node, fragments }) => {
                const parent = node.parentNode;
                if (parent) {
                    fragments.forEach(fragment => parent.insertBefore(fragment, node));
                    parent.removeChild(node);
                }
            });
        });

        console.log('BlurPlugin loaded');
    }

    loadStyles() {
        console.log('Loading styles');
        const styleEl = document.createElement('style');
        styleEl.id = 'blur-plugin-styles';
        styleEl.textContent = `
            .blur-plugin-text {
                filter: blur(5px);
                user-select: none;
            }
            .blur-plugin-text:hover {
                cursor: pointer;
            }
        `;
        document.head.appendChild(styleEl);
        console.log('Styles loaded');
    }

    handleLeftClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.hasClass('blur-plugin-text')) {
            console.log('Blur text left-clicked');
            if (event.detail === 1) {
                navigator.clipboard.writeText(target.textContent || '');
                new Notice('Text copied to clipboard');
                console.log('Text copied');
            } else if (event.detail === 2) {
                target.removeClass('blur-plugin-text');
                console.log('Text unblurred');
            }
        }
    }

    handleRightClick(event: MouseEvent) {
        event.preventDefault();
        const target = event.target as HTMLElement;
        if (!target.hasClass('blur-plugin-text')) {
            target.addClass('blur-plugin-text');
            console.log('Text reblurred');
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        console.log('Settings loaded:', this.settings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        console.log('Settings saved:', this.settings);
    }
}

class BlurSettingTab extends PluginSettingTab {
    plugin: BlurPlugin;

    constructor(app: App, plugin: BlurPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl)
            .setName('Blur syntax')
            .setDesc('The syntax used to indicate the start blurred text')
            .addText(text => text
            .setPlaceholder('!spoiler:')
            .setValue(this.plugin.settings.blurSyntax)
            .onChange(async (value) => {
				if(value != ""){
					this.plugin.settings.blurSyntax = value;
                await this.plugin.saveSettings();
                console.log('Blur syntax changed to:', value);
				} else {
					// default settings 
                    value = "!spoiler:"
					this.plugin.settings.blurSyntax = value;
					await this.plugin.saveSettings();
					console.log('Blur syntax changed to default:', value);
				}
            }));

        new Setting(containerEl)
            .setName('Blur endpoint')
            .setDesc('The syntax used to indicate the end of blurred text')
            .addText(text => text
            .setPlaceholder('!')
            .setValue(this.plugin.settings.blurEndpoint)
            .onChange(async (value) => {
				if(value != ""){
					this.plugin.settings.blurEndpoint = value;
					await this.plugin.saveSettings();
					console.log('Blur endpoint changed to:', value);
				} else {
					// default settings
					value = "!"
					this.plugin.settings.blurEndpoint = value;
					await this.plugin.saveSettings();
					console.log('Blur endpoint changed to default:', value);
				}
            }));
    }
}