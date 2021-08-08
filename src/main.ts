import {
    Plugin,
    TFile,
    parseYaml,
} from 'obsidian';

const TEMPLATE_TAG = '%';
const VARIABLE_TAG = '$';
const META = '---';
const PARAGRAPH_TAG = 'p';

const HIDDEN_CLASS = 'hidden';

export default class StoicDailyPlugin extends Plugin {
    async onload() {
        this.app.workspace.on('layout-change', async () => {
            setTimeout(async () => {
                await this.setTemplates();
            }, 50); // TODO
        })

        this.app.metadataCache.on('changed', async () => {
            setTimeout(async () => {
                await this.setTemplates();
            }, 50); // TODO
        })
    }

    isTemplate(paragraph: HTMLElement): boolean {
        if (paragraph === null) {
            return false;
        }

        return paragraph.innerHTML.slice(0, 1) === TEMPLATE_TAG;
    }

    async getTemplate(paragraph: HTMLParagraphElement) {
        const templateName = paragraph.innerHTML.split(TEMPLATE_TAG)[1];

        const tempalteFile = this.getNote(`${templateName}.md`);
        const template = await this.app.vault.read(tempalteFile);

        return template;
    }

    async getMetaData(): Promise<Map<string, string>> {
        const result = new Map();

        const currentFile = this.app.workspace.getActiveFile();
        const text = await this.app.vault.read(currentFile);
        if (text.slice(0, 3) === META) {
            const metaDataText = text.split(META)[1];

            const metaData = parseYaml(metaDataText);
            for (const key in metaData) {
                const value = metaData[key];

                result.set(key, value);
            }
        }

        return result;
    }

    async setTemplates() {
        let paragraphs = this.app.workspace.containerEl.querySelectorAll(PARAGRAPH_TAG);

        paragraphs.forEach(async paragraph => {
            if (this.isTemplate(paragraph)) {
                const template = await this.getTemplate(paragraph);
                const metaData = await this.getMetaData();

                let result = template;
                metaData.forEach((value, key) => {
                    result = result.replaceAll(`${VARIABLE_TAG}${key}${VARIABLE_TAG}`, value);
                })

                const parent = paragraph.parentElement;
                const element = document.createElement(PARAGRAPH_TAG);
                element.innerHTML = result;

                while (parent.childElementCount > 1) {
                    parent.removeChild(parent.firstElementChild);
                }
                parent.prepend(element);
                parent.lastElementChild.addClass(HIDDEN_CLASS);
            }
        });
    }

    getNote(fileName: string): TFile {
        let note;

        this.app.vault.getFiles().forEach(file => {
            if (file.name === fileName) {
                note = file;
            }
        });

        return note;
    }
}
