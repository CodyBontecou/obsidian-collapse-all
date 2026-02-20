import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface CollapseAllSettings {
	autoCollapseOnOpen: boolean;
}

const DEFAULT_SETTINGS: CollapseAllSettings = {
	autoCollapseOnOpen: false,
};

export default class CollapseAllPlugin extends Plugin {
	settings: CollapseAllSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "collapse-all-folders",
			name: "Collapse all folders",
			callback: () => this.setAllFoldersCollapsed(true),
		});

		this.addCommand({
			id: "expand-all-folders",
			name: "Expand all folders",
			callback: () => this.setAllFoldersCollapsed(false),
		});

		this.addRibbonIcon("folder-minus", "Collapse all folders", () => {
			this.setAllFoldersCollapsed(true);
		});

		this.addSettingTab(new CollapseAllSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			if (this.settings.autoCollapseOnOpen) {
				this.setAllFoldersCollapsed(true);
			}
		});
	}

	setAllFoldersCollapsed(collapsed: boolean) {
		const leaf = this.app.workspace.getLeavesOfType("file-explorer")[0];
		if (!leaf) return;

		const fileItems: Record<string, { setCollapsed: (c: boolean) => void }> =
			(leaf.view as any).fileItems;
		if (!fileItems) return;

		for (const key of Object.keys(fileItems)) {
			const item = fileItems[key];
			if (item.setCollapsed) {
				item.setCollapsed(collapsed);
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CollapseAllSettingTab extends PluginSettingTab {
	plugin: CollapseAllPlugin;

	constructor(app: App, plugin: CollapseAllPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto-collapse on vault open")
			.setDesc("Automatically collapse all folders when the vault is opened.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoCollapseOnOpen)
					.onChange(async (value) => {
						this.plugin.settings.autoCollapseOnOpen = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
