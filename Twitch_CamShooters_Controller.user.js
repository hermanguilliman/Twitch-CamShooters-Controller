// ==UserScript==
// @name         Twitch CamShooters Controller
// @namespace    https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @version      0.3
// @description  Компактная панель управления для игры CamShooters (by Camelot63RU)
// @author       Herman Guilliman
// @match        https://www.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @updateURL    https://raw.githubusercontent.com/HermanGuilliman/Twitch-CamShooters-Controller/main/Twitch_CamShooters_Controller.user.js
// @downloadURL  https://raw.githubusercontent.com/HermanGuilliman/Twitch-CamShooters-Controller/main/Twitch_CamShooters_Controller.user.js
// @homepageURL  https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @grant        none
// @copyright    2026, Herman Guilliman (hermanguilliman@proton.me)
// ==/UserScript==

(function () {
    "use strict";

    const CONFIG = {
        containerId: "twitch-camshooters-panel",
        storageKey: "camshooters_collapsed",

        commands: [
            { cmd: "!go", hint: "Принять участие в битве", color: "#4fd682" },
            { cmd: "!buff", hint: "Случайное влияние на персонажа", color: "#5dade2" },
            { cmd: "!combo", hint: "Активировать ивент (нужно 3 килла)", color: "#f4d03f" },
            { cmd: "!tag", hint: "Нарисовать граффити под ногами", color: "#af7ac5" },
            { cmd: "!yo", hint: "Обратить на себя внимание противников", color: "#eb984e" },
            { cmd: "!fart", hint: "Пустить газы", color: "#ec7063" },
            { cmd: "!dance", hint: "Танцевать", color: "#ff79c6" },
        ],

        maps: [
            { cmd: "!map 1", label: "Карта 1", color: "#1abc9c" },
            { cmd: "!map 2", label: "Карта 2", color: "#1abc9c" },
            { cmd: "!map 3", label: "Карта 3", color: "#1abc9c" },
        ],
    };

    class ChatService {
        constructor() {
            this.selectors = {
                input: '[data-a-target="chat-input"]',
                sendButton: '[data-a-target="chat-send-button"]',
            };
        }

        sendMessage(text) {
            const inputEditor = document.querySelector(this.selectors.input);
            const sendButton = document.querySelector(
                this.selectors.sendButton,
            );

            if (!inputEditor) return;

            inputEditor.focus();

            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputEditor);
            selection.removeAllRanges();
            selection.addRange(range);

            const dataTransfer = new DataTransfer();
            dataTransfer.setData("text/plain", text);

            const pasteEvent = new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer,
            });

            inputEditor.dispatchEvent(pasteEvent);

            setTimeout(() => {
                if (sendButton && !sendButton.disabled) {
                    sendButton.click();
                } else {
                    const enterEvent = new KeyboardEvent("keydown", {
                        bubbles: true,
                        cancelable: true,
                        keyCode: 13,
                        which: 13,
                        key: "Enter",
                    });
                    inputEditor.dispatchEvent(enterEvent);
                }
            }, 100);
        }
    }

    class PanelUI {
        constructor(chatService) {
            this.chatService = chatService;
            this.isCollapsed =
                localStorage.getItem(CONFIG.storageKey) === "true";
            this.elements = {
                container: null,
                buttonsWrapper: null,
                arrowSpan: null,
            };
        }

        exists() {
            return !!document.getElementById(CONFIG.containerId);
        }

        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            localStorage.setItem(CONFIG.storageKey, this.isCollapsed);

            if (this.elements.buttonsWrapper && this.elements.arrowSpan) {
                this.elements.buttonsWrapper.style.display = this.isCollapsed
                    ? "none"
                    : "flex";
                this.elements.arrowSpan.textContent = this.isCollapsed
                    ? "▶"
                    : "▼";
            }
        }

        createDOM() {
            const container = document.createElement("div");
            container.id = CONFIG.containerId;
            Object.assign(container.style, {
                backgroundColor: "var(--color-background-base)",
                borderBottom: "1px solid var(--color-border-base)",
                zIndex: "9999",
                display: "flex",
                flexDirection: "column",
            });

            const header = this._createHeader();

            const buttonsWrapper = document.createElement("div");
            Object.assign(buttonsWrapper.style, {
                display: this.isCollapsed ? "none" : "flex",
                flexWrap: "wrap",
                gap: "4px",
                padding: "4px 8px",
            });

            CONFIG.commands.forEach((cmdData) => {
                buttonsWrapper.appendChild(this._createButton(cmdData));
            });

            this.elements.container = container;
            this.elements.buttonsWrapper = buttonsWrapper;

            container.appendChild(header);
            container.appendChild(buttonsWrapper);

            return container;
        }

        _createHeader() {
            const header = document.createElement("div");
            Object.assign(header.style, {
                padding: "2px 8px",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--color-text-alt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                userSelect: "none",
                backgroundColor: "var(--color-background-alt)",
                height: "24px",
            });

            const titleSpan = document.createElement("span");
            titleSpan.textContent = "🔫 Панель CamShooters";

            const rightControls = document.createElement("div");
            Object.assign(rightControls.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
            });

            const mapDropdown = this._createMapDropdownInHeader();

            const arrowSpan = document.createElement("span");
            arrowSpan.textContent = this.isCollapsed ? "▶" : "▼";
            arrowSpan.style.fontSize = "8px";
            this.elements.arrowSpan = arrowSpan;

            rightControls.appendChild(mapDropdown);
            rightControls.appendChild(arrowSpan);

            header.appendChild(titleSpan);
            header.appendChild(rightControls);

            header.onclick = (e) => {
                if (!mapDropdown.contains(e.target)) {
                    this.toggleCollapse();
                }
            };

            return header;
        }

        _createButton(data, labelOverride = null) {
            const btn = document.createElement("button");
            btn.textContent = labelOverride || data.cmd;
            btn.title = data.hint || data.cmd;

            Object.assign(btn.style, {
                backgroundColor:
                    "var(--color-background-button-secondary-default)",
                color: "var(--color-text-button-secondary)",
                border: "none",
                borderLeft: `3px solid ${data.color}`,
                borderRadius: "2px",
                padding: "2px 6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "11px",
                fontFamily: "inherit",
                transition: "filter 0.2s, background-color 0.2s",
                flexGrow: "1",
                textAlign: "center",
            });

            btn.onmouseenter = () =>
                (btn.style.backgroundColor =
                    "var(--color-background-button-secondary-hover)");
            btn.onmouseleave = () =>
                (btn.style.backgroundColor =
                    "var(--color-background-button-secondary-default)");

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.chatService.sendMessage(data.cmd);
            };

            return btn;
        }

        _createMapDropdownInHeader() {
            const wrapper = document.createElement("div");
            Object.assign(wrapper.style, {
                position: "relative",
                display: "flex",
                alignItems: "center",
            });

            const globeIcon = document.createElement("span");
            globeIcon.textContent = "🌏";
            globeIcon.title = "Выбор карты";
            Object.assign(globeIcon.style, {
                cursor: "pointer",
                fontSize: "14px",
                transition: "opacity 0.2s",
            });

            const dropdown = document.createElement("div");
            Object.assign(dropdown.style, {
                position: "absolute",
                bottom: "100%",
                right: "0",
                backgroundColor: "var(--color-background-alt)",
                border: "1px solid var(--color-border-base)",
                borderRadius: "4px",
                padding: "4px",
                display: "none",
                flexDirection: "column",
                gap: "4px",
                zIndex: "10001",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                minWidth: "80px",
            });

            CONFIG.maps.forEach((mapData) => {
                const mapBtn = this._createButton(mapData, mapData.label);
                mapBtn.style.textAlign = "left";
                mapBtn.style.fontSize = "10px";
                mapBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.chatService.sendMessage(mapData.cmd);
                    dropdown.style.display = "none";
                };
                dropdown.appendChild(mapBtn);
            });

            wrapper.onmouseenter = () => {
                dropdown.style.display = "flex";
                globeIcon.style.opacity = "0.7";
            };
            wrapper.onmouseleave = () => {
                dropdown.style.display = "none";
                globeIcon.style.opacity = "1";
            };

            globeIcon.onclick = (e) => e.stopPropagation();

            wrapper.appendChild(globeIcon);
            wrapper.appendChild(dropdown);

            return wrapper;
        }
    }

    class CamShootersApp {
        constructor() {
            this.chatService = new ChatService();
            this.ui = new PanelUI(this.chatService);
            this.checkInterval = null;
        }

        init() {
            console.log("[CamShooters] Panel started");
            this.checkInterval = setInterval(() => this.mount(), 1000);
        }

        mount() {
            if (this.ui.exists()) return;

            const chatInputWrapper = document.querySelector(".chat-input");

            if (chatInputWrapper) {
                const panelDOM = this.ui.createDOM();
                chatInputWrapper.insertBefore(
                    panelDOM,
                    chatInputWrapper.firstChild,
                );
            }
        }
    }

    const app = new CamShootersApp();
    app.init();
})();
