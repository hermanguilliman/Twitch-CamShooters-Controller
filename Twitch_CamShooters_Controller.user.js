// ==UserScript==
// @name         Twitch CamShooters Controller
// @namespace    https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @version      0.7
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
            {
                cmd: "!buff",
                hint: "Случайное влияние на персонажа",
                color: "#5dade2",
            },
            {
                cmd: "!combo",
                hint: "Активировать ивент (нужно 3 килла)",
                color: "#f4d03f",
            },
            {
                cmd: "!tag",
                hint: "Нарисовать граффити под ногами",
                color: "#af7ac5",
            },
            {
                cmd: "!yo",
                hint: "Обратить на себя внимание противников",
                color: "#eb984e",
            },
            { cmd: "!fart", hint: "Пустить газы", color: "#ec7063" },
            { cmd: "!dance", hint: "Танцевать", color: "#ff79c6" },
        ],

        maps: [
            { cmd: "!map 1", label: "Карта 1", color: "#1abc9c" },
            { cmd: "!map 2", label: "Карта 2", color: "#3498db" },
            { cmd: "!map 3", label: "Карта 3", color: "#9b59b6" },
        ],
    };

    function injectStyles() {
        if (document.getElementById("camshooters-fix-styles")) return;

        const style = document.createElement("style");
        style.id = "camshooters-fix-styles";
        style.textContent = `
            .autocomplete-match-list {
                z-index: 10002 !important;
            }
            .chat-input .autocomplete-match-list,
            .chat-input > div:has(.autocomplete-match-list) {
                z-index: 10002 !important;
                position: relative;
            }
            #${CONFIG.containerId} {
                position: relative;
                z-index: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }

    class ChatService {
        constructor() {
            this.selectors = {
                input: '[data-a-target="chat-input"]',
                sendButton: '[data-a-target="chat-send-button"]',
            };
        }

        _getReactFiber(element) {
            for (const key of Object.keys(element)) {
                if (
                    key.startsWith("__reactFiber$") ||
                    key.startsWith("__reactInternalInstance$")
                ) {
                    return element[key];
                }
            }
            return null;
        }

        sendMessage(text) {
            console.log(`[CamShooters] Отправка: "${text}"`);

            const inputEl = document.querySelector(this.selectors.input);
            if (!inputEl) {
                console.warn("[CamShooters] Поле чата не найдено");
                return;
            }

            inputEl.focus();

            setTimeout(() => {
                this._insertText(inputEl, text);

                setTimeout(() => {
                    this._submit(inputEl);
                }, 100);
            }, 50);
        }

        _insertText(inputEl, text) {
            inputEl.focus();

            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputEl);
            sel.removeAllRanges();
            sel.addRange(range);

            const deleteEvent = new InputEvent("beforeinput", {
                bubbles: true,
                cancelable: true,
                inputType: "deleteContentBackward",
            });
            inputEl.dispatchEvent(deleteEvent);

            const beforeInputEvent = new InputEvent("beforeinput", {
                bubbles: true,
                cancelable: true,
                inputType: "insertText",
                data: text,
            });
            inputEl.dispatchEvent(beforeInputEvent);

            const inputEvent = new InputEvent("input", {
                bubbles: true,
                cancelable: false,
                inputType: "insertText",
                data: text,
            });
            inputEl.dispatchEvent(inputEvent);

            setTimeout(() => {
                const currentText = inputEl.textContent.trim();
                console.log(
                    `[CamShooters] Текст после InputEvent: "${currentText}"`,
                );

                if (currentText === text) {
                    console.log("[CamShooters] ✓ React принял текст");
                    return;
                }

                console.log(
                    "[CamShooters] InputEvent не сработал, пробуем Range/Selection...",
                );
                this._insertViaRange(inputEl, text);
            }, 50);
        }

        _insertViaRange(inputEl, text) {
            inputEl.focus();

            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputEl);
            sel.removeAllRanges();
            sel.addRange(range);

            range.deleteContents();

            const textNode = document.createTextNode(text);

            range.insertNode(textNode);

            range.setStartAfter(textNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            const inputEvent = new InputEvent("input", {
                bubbles: true,
                cancelable: false,
                inputType: "insertText",
                data: text,
            });
            inputEl.dispatchEvent(inputEvent);

            setTimeout(() => {
                const currentText = inputEl.textContent.trim();
                console.log(
                    `[CamShooters] Текст после Range: "${currentText}"`,
                );

                if (!currentText || currentText !== text) {
                    console.log(
                        "[CamShooters] Range не сработал, пробуем clipboard...",
                    );
                    this._insertViaClipboard(inputEl, text);
                } else {
                    console.log("[CamShooters] ✓ Range сработал");
                }
            }, 50);
        }

        _insertViaClipboard(inputEl, text) {
            inputEl.focus();

            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputEl);
            sel.removeAllRanges();
            sel.addRange(range);

            range.deleteContents();

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(text)
                    .then(() => {
                        const clipboardData = new DataTransfer();
                        clipboardData.setData("text/plain", text);

                        const pasteEvent = new ClipboardEvent("paste", {
                            bubbles: true,
                            cancelable: true,
                            clipboardData: clipboardData,
                        });

                        inputEl.dispatchEvent(pasteEvent);

                        const inputEvent = new InputEvent("input", {
                            bubbles: true,
                            cancelable: false,
                            inputType: "insertFromPaste",
                        });
                        inputEl.dispatchEvent(inputEvent);
                    })
                    .catch(() => {
                        this._insertDirectDOM(inputEl, text);
                    });
            } else {
                this._insertDirectDOM(inputEl, text);
            }
        }

        _insertDirectDOM(inputEl, text) {
            console.log("[CamShooters] Последний fallback: прямой DOM");

            inputEl.focus();
            inputEl.textContent = "";

            const span = document.createElement("span");
            span.setAttribute("data-a-target", "chat-input-text");
            span.textContent = text;
            inputEl.appendChild(span);

            const sel = window.getSelection();
            const range = document.createRange();
            range.setStartAfter(span);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);

            ["input", "change", "keyup", "keydown"].forEach((eventType) => {
                inputEl.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
        }

        _submit(inputEl) {
            const sendButton = document.querySelector(
                this.selectors.sendButton,
            );

            if (sendButton) {
                const checkAndSend = (attempts = 0) => {
                    if (attempts > 10) {
                        console.warn("[CamShooters] Кнопка осталась disabled");
                        this._sendEnter(inputEl);
                        return;
                    }

                    if (
                        !sendButton.disabled &&
                        sendButton.getAttribute("aria-disabled") !== "true"
                    ) {
                        sendButton.click();
                        console.log("[CamShooters] ✓ Отправлено через кнопку");
                    } else {
                        setTimeout(() => checkAndSend(attempts + 1), 50);
                    }
                };

                checkAndSend();
            } else {
                this._sendEnter(inputEl);
            }
        }

        _sendEnter(inputEl) {
            inputEl.focus();

            const enterDown = new KeyboardEvent("keydown", {
                bubbles: true,
                cancelable: true,
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                which: 13,
            });

            inputEl.dispatchEvent(enterDown);
            console.log("[CamShooters] Enter отправлен");
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
                display: "flex",
                flexDirection: "column",

                position: "relative",
                zIndex: "1",
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

            header.addEventListener("click", (e) => {
                if (!mapDropdown.contains(e.target)) {
                    this.toggleCollapse();
                }
            });

            return header;
        }

        _createButton(data, labelOverride = null) {
            const btn = document.createElement("button");
            btn.textContent = labelOverride || data.cmd;
            btn.title = data.hint || data.cmd;
            btn.type = "button";

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
                pointerEvents: "auto",
            });

            btn.addEventListener("mouseenter", () => {
                btn.style.backgroundColor =
                    "var(--color-background-button-secondary-hover)";
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.backgroundColor =
                    "var(--color-background-button-secondary-default)";
            });

            btn.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`[CamShooters] Кнопка: ${data.cmd}`);
                this.chatService.sendMessage(data.cmd);
            });

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
                transition: "opacity 0.2s, transform 0.2s",
            });

            const dropdown = document.createElement("div");
            Object.assign(dropdown.style, {
                position: "absolute",
                bottom: "100%",
                right: "0",
                backgroundColor: "var(--color-background-base)",
                border: "1px solid var(--color-border-base)",
                borderRadius: "4px",
                padding: "6px",
                display: "none",
                flexDirection: "column",
                gap: "6px",
                zIndex: "10003",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                minWidth: "120px",
                opacity: "0",
                transform: "translateY(4px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
            });

            const dropdownTitle = document.createElement("div");
            Object.assign(dropdownTitle.style, {
                padding: "2px 4px",
                fontSize: "10px",
                fontWeight: "600",
                color: "var(--color-text-alt)",
                textTransform: "uppercase",
                borderBottom: "1px solid var(--color-border-base)",
                marginBottom: "4px",
            });
            dropdownTitle.textContent = "Голосование";
            dropdown.appendChild(dropdownTitle);

            CONFIG.maps.forEach((mapData) => {
                const mapBtn = this._createButton(mapData, mapData.label);
                mapBtn.style.textAlign = "left";
                mapBtn.style.fontSize = "11px";
                mapBtn.style.padding = "4px 8px";
                mapBtn.style.borderRadius = "4px";
                mapBtn.style.borderLeftWidth = "4px";
                mapBtn.style.transition =
                    "background-color 0.2s, transform 0.1s";

                mapBtn.addEventListener("mouseenter", () => {
                    mapBtn.style.transform = "translateX(2px)";
                });

                mapBtn.addEventListener("mouseleave", () => {
                    mapBtn.style.transform = "translateX(0)";
                });

                mapBtn.addEventListener("click", () => {
                    hideDropdown();
                });

                dropdown.appendChild(mapBtn);
            });

            let hideTimeout;

            const showDropdown = () => {
                dropdown.style.display = "flex";
                setTimeout(() => {
                    dropdown.style.opacity = "1";
                    dropdown.style.transform = "translateY(0)";
                }, 10);
                globeIcon.style.opacity = "0.8";
                globeIcon.style.transform = "scale(1.1)";
            };

            const hideDropdown = () => {
                dropdown.style.opacity = "0";
                dropdown.style.transform = "translateY(4px)";
                setTimeout(() => {
                    dropdown.style.display = "none";
                }, 200);
                globeIcon.style.opacity = "1";
                globeIcon.style.transform = "scale(1)";
            };

            wrapper.addEventListener("mouseenter", () => {
                clearTimeout(hideTimeout);
                showDropdown();
            });

            wrapper.addEventListener("mouseleave", () => {
                hideTimeout = setTimeout(hideDropdown, 1000);
            });

            dropdown.addEventListener("mouseenter", () => {
                clearTimeout(hideTimeout);
                globeIcon.style.opacity = "0.8";
                globeIcon.style.transform = "scale(1.1)";
            });

            dropdown.addEventListener("mouseleave", () => {
                hideTimeout = setTimeout(hideDropdown, 1000);
            });

            globeIcon.addEventListener("click", (e) => {
                e.stopPropagation();
            });

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
            console.log("[CamShooters] Panel started v0.6");
            injectStyles();
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
                console.log("[CamShooters] Панель смонтирована");
            }
        }
    }

    const app = new CamShootersApp();
    app.init();
})();
