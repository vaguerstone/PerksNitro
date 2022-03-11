/**
 * @name PerksNitroPRO
 * @author VaguerStone
 * @version 1.0.0
 * @description Discord Nitro Perks Sin tener que pagar
 * @source https://github.com/vaguerstone/PerksNitro/blob/main/PerksNitro.plugin.js
 * @updateUrl https://raw.githubusercontent.com/vaguerstone/PerksNitro/Releases/PerksNitro.plugin.js
 */

 module.exports = (() => {
     const config = {
         "info": {
             "name": "PerksNitroPRO",
             "authors": [{
                 "name": "VaguerStone",
             },
 			{
                 "name": "Nueva Version al español y fixeada",
             }],
             "version": "1.0.0",
             "description": "¡Coloca un banner de perfil animado o fijo, comparte tu pantalla a 60 fps 1080P y usa emojis animados entre servidores en todas partes! , Aun no se pueden subir archivos de mas de 100MB :c ",
         },
 		"changelog": [
 			{
 				"title": "Nuevo Añadido",
 				"type": "added",
 				"items": [
 					"Nueva Version Actualizada & Traducida al español!"
 				]
 			},
 			{
 				"title": "Solucionando",
 				"type": "fixed",
 				"items": [
 					"Fixeando el banner de perfil y avatar!"
 				]
 			}
 		],
         "main": "PerksNitroPRO.plugin.js"
     };

	return !global.ZeresPluginLibrary ? class {
			constructor() {
					this._config = config;
			}
			getName() {
					return config.info.name;
			}
			getAuthor() {
					return config.info.authors.map(a => a.name).join(", ");
			}
			getDescription() {
					return config.info.description;
			}
			getVersion() {
					return config.info.version;
			}
	getChangelog() {
		return config.changelog;
	}
			load() {
					BdApi.showConfirmationModal("Falta la biblioteca", `El complemento de biblioteca necesario para ${config.info.name} Está perdido. Haga clic en Descargar para instalarlo.`, {
							confirmText: "Descargar",
							cancelText: "Cancelar",
							onConfirm: () => {
									require("request").get("https://github.com/vaguerstone/0PluginLibrary.plugin.js/archive/refs/heads/main.zip", async (error, response, body) => {
											if (error) return require("electron").shell.openExternal("https://github.com/vaguerstone/0PluginLibrary.plugin.js/archive/refs/heads/main.zip");
											await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
									});
							}
					});
			}
			start() {this.load();}
			stop() {}
	} : (([Plugin, Api]) => {
			const plugin = (Plugin, Api) => {
					const {
							Patcher,
							DiscordModules,
							DiscordAPI,
							Settings,
							Toasts,
							PluginUtilities
					} = Api;
					return class PerksNitro extends Plugin {
							defaultSettings = {
									"emojiSize": "40",
									"screenSharing": false,
									"emojiBypass": false,
									"clientsidePfp": false,
									"pfpUrl": "",
							};
							settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
							originalNitroStatus = 0;
							clientsidePfp;
							screenShareFix;
							getSettingsPanel() {
									return Settings.SettingPanel.build(_ => this.saveAndUpdate(), ...[
											new Settings.SettingGroup("Compartir Pantalla").append(...[
													new Settings.Switch("Uso compartido de pantalla de alta calidad", "Habilite o deshabilite el uso compartido de pantalla de 1080p/fuente a 60 fps. Esto se adapta a su estado actual de nitro.", this.settings.screenSharing, value => this.settings.screenSharing = value)
											]),
											new Settings.SettingGroup("Emojis").append(
													new Settings.Switch("Nitro Emojis Bypass", "Habilita o deshabilita el uso de la omisión de Nitro Emoji.", this.settings.emojiBypass, value => this.settings.emojiBypass = value),
													new Settings.Slider("Tamano", "El tamano del emoji en pixeles. Se recomienda 40.", 16, 64, this.settings.emojiSize, size=>this.settings.emojiSize = size, {markers:[16,20,32,40,64], stickToMarkers:true})
											),
					new Settings.SettingGroup("Avatar de perfil / SOLUCIONANDO").append(...[
						new Settings.Switch("Avatar de perfil del lado del cliente", "Habilita o deshabilita el avatar del perfil del lado del cliente.", this.settings.clientsidePfp, value => this.settings.clientsidePfp = value),
						new Settings.Textbox("URL", "La URL directa al avatar de perfil que desea (PNG, JPG o GIF; se recomienda una imagen cuadrada).", this.settings.pfpUrl,
							image => {
								try {
									new URL(image)
								} catch {
									return Toasts.error('Esta es una URL Inválida!')
								}
								this.settings.pfpUrl = image
							}
						)
					]),
					new Settings.SettingGroup("Banner del perfil / SOLUCIONANDO").append(...[
															new Settings.Switch("Banner de perfil del lado del cliente", "Habilita o deshabilita el banner de perfil del lado del cliente.", this.settings.clientsideBanner, value => this.settings.clientsideBanner = value),
															new Settings.Textbox("URL", "La URL directa al banner de perfil que desea (PNG, JPG o GIF; se recomienda un tamaño de 600x240).", this.settings.bannerUrl,
																	image => {
																			try {
																					new URL(image)
																			} catch {
																					return Toasts.error('Esta es una URL Inválida!')
																			}
																			this.settings.bannerUrl = image
																	}
															)
													])
									])
							}

							saveAndUpdate() {
									PluginUtilities.saveSettings(this.getName(), this.settings)
									if (!this.settings.screenSharing) {
											switch (this.originalNitroStatus) {
													case 1:
															BdApi.injectCSS("screenShare", `#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(1) > div > button:nth-child(4) {
																	display: none;
																}`)
															this.screenShareFix = setInterval(()=>{
																	document.querySelector("#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(1) > div > button:nth-child(3)").click()
																	clearInterval(this.screenShareFix)
															}, 100)
															break;
													default: //if user doesn't have nitro?
															BdApi.injectCSS("screenShare", `#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(1) > div > button:nth-child(4) {
																	display: none;
																}
																#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(1) > div > button:nth-child(3) {
																	display: none;
																}
																#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(2) > div > button:nth-child(3) {
																	display: none;
																}`)
															this.screenShareFix = setInterval(()=>{
																	document.querySelector("#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(1) > div > button:nth-child(2)").click()
																	document.querySelector("#app-mount > div.layerContainer-yqaFcK > div.layer-2KE1M9 > div > div > form > div:nth-child(2) > div > div > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6.modalContent-BM7Qeh > div:nth-child(2) > div > button:nth-child(2)").click()
																	clearInterval(this.screenShareFix)
															}, 100)
													break;
											}
									}

									if (this.settings.screenSharing) BdApi.clearCSS("screenShare")

									if (this.settings.emojiBypass) {
											//fix emotes with bad method
											Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, msg]) => {
													msg.validNonShortcutEmojis.forEach(emoji => {
															if (emoji.url.startsWith("/assets/")) return;
															msg.content = msg.content.replace(`<${emoji.animated ? "a" : ""}${emoji.allNamesString.replace(/~\d/g, "")}${emoji.id}>`, emoji.url + `&size=${this.settings.emojiSize} `)
													})
											});
											//for editing message also
											Patcher.before(DiscordModules.MessageActions, "editMessage", (_,obj) => {
													let msg = obj[2].content
													if (msg.search(/\d{18}/g) == -1) return;
													msg.match(/<a:.+?:\d{18}>|<:.+?:\d{18}>/g).forEach(idfkAnymore=>{
															obj[2].content = obj[2].content.replace(idfkAnymore, `https://cdn.discordapp.com/emojis/${idfkAnymore.match(/\d{18}/g)[0]}?size=${this.settings.emojiSize}`)
													})
											});
									}

									if(!this.settings.emojiBypass) Patcher.unpatchAll(DiscordModules.MessageActions)

									if (this.settings.clientsidePfp && this.settings.pfpUrl) {
											this.clientsidePfp = setInterval(()=>{
													document.querySelectorAll(`[src="https://cdn.discordapp.com/avatars/${DiscordAPI.currentUser.discordObject.id}/${DiscordAPI.currentUser.discordObject.avatar}.webp?size=128"]`).forEach(avatar=>{
															avatar.src = this.settings.pfpUrl
													})
													document.querySelectorAll(`[src="https://cdn.discordapp.com/avatars/${DiscordAPI.currentUser.discordObject.id}/${DiscordAPI.currentUser.discordObject.avatar}.png?size=128"]`).forEach(avatar=>{
															avatar.src = this.settings.pfpUrl
													})
													document.querySelectorAll(`.avatarContainer-28iYmV.avatar-3tNQiO.avatarSmall-1PJoGO`).forEach(avatar=>{
															if (!avatar.style.backgroundImage.includes("https://cdn.discordapp.com/avatars/" + DiscordAPI.currentUser.discordObject.id + "/" + DiscordAPI.currentUser.discordObject.avatar + ".png?size=128")) return;
															avatar.style = `background-image: url("${this.settings.pfpUrl}");`
													})
											}, 100)
									}
									if (!this.settings.clientsidePfp) this.removeClientsidePfp()

				if (this.settings.clientsideBanner && this.settings.bannerUrl) {
											this.clientsideBanner = setInterval(()=>{
													document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] div [class*="popoutBanner-"]`).forEach(banner=>{
															banner.style = `background-image: url("${this.settings.bannerUrl}") !important; background-repeat: no-repeat; background-position: 50%; background-size: cover; width: 300px; height: 120px;`
													})
						document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] div [class*="profileBanner-"]`).forEach(banner=>{
															banner.style = `background-image: url("${this.settings.bannerUrl}") !important; background-repeat: no-repeat; background-position: 50%; background-size: cover; width: 600px; height: 240px;`
													})
						document.querySelectorAll(`[class*="settingsBanner-"]`).forEach(banner=>{
															banner.style = `background-image: url("${this.settings.bannerUrl}") !important; background-repeat: no-repeat; background-position: 50%; background-size: cover;`
													})
						document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] .avatarWrapperNormal-26WQIb`).forEach(avatar=>{
															avatar.style = `top: 76px;`
													})
											}, 100)
									}
									if (!this.settings.clientsideBanner) this.removeClientsideBanner()
							}
							removeClientsidePfp() {
									clearInterval(this.clientsidePfp)
									document.querySelectorAll(`[src="${this.settings.pfpUrl}"]`).forEach(avatar=>{
											avatar.src = "https://cdn.discordapp.com/avatars/" + DiscordAPI.currentUser.discordObject.id + "/" + DiscordAPI.currentUser.discordObject.avatar + ".webp?size=128"
									})
									document.querySelectorAll(`.avatarContainer-28iYmV.avatar-3tNQiO.avatarSmall-1PJoGO`).forEach(avatar=>{
											if (!avatar.style.backgroundImage.includes(this.settings.pfpUrl)) return;
											avatar.style = `background-image: url("https://cdn.discordapp.com/avatars/${DiscordAPI.currentUser.discordObject.id}/${DiscordAPI.currentUser.discordObject.avatar}.png?size=128");`
									})
							}
			removeClientsideBanner() {
									clearInterval(this.clientsideBanner)
									document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] div [class*="popoutBanner-"]`).forEach(banner=>{
											banner.style = `background-image: none !important; background-repeat: none; background-position: none; background-size: none; width: none; height: none;`
									})
				document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] div [class*="profileBanner-"]`).forEach(banner=>{
											banner.style = `background-image: none !important; background-repeat: none; background-position: none; background-size: none; width: none; height: none;`
									})
				document.querySelectorAll(`[class*="settingsBanner-"]`).forEach(banner=>{
											banner.style = `background-image: none !important; background-repeat: none; background-position: none; background-size: none;`
									})
				document.querySelectorAll(`[data-user-id="${DiscordAPI.currentUser.discordObject.id}"] .avatarWrapperNormal-26WQIb`).forEach(avatar=>{
											avatar.style = `top: none;`
									})
							}
							onStart() {
									this.originalNitroStatus = DiscordAPI.currentUser.discordObject.premiumType;
									this.saveAndUpdate()
									DiscordAPI.currentUser.discordObject.premiumType = 2
							}

							onStop() {
									DiscordAPI.currentUser.discordObject.premiumType = this.originalNitroStatus;
									this.removeClientsidePfp()
				this.removeClientsideBanner()
									Patcher.unpatchAll();
							}
					};
			};
			return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
