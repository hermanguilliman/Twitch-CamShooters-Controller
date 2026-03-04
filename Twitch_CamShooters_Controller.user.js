// ==UserScript==
// @name         Twitch CamShooters Controller
// @namespace    https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @version      1.2
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
        buttonSizeKey: "camshooters_button_size",
        tagNumberKey: "camshooters_tag_number",
        titleIconKey: "camshooters_title_icon",

        buttonSizes: ["compact", "normal", "large"],
        buttonSizeLabels: {
            compact: "S",
            normal: "M",
            large: "L",
        },
        buttonSizeIcons: {
            compact: "🔹",
            normal: "🔷",
            large: "⬛",
        },

        titleIcons: [
            { type: "emoji", value: "🔫" },
            {
                type: "image",
                value: "https://static-cdn.jtvnw.net/jtv_user_pictures/camelot63ru-profile_image-c274e4003eddbe3d-70x70.png",
            },
            {
                type: "image",
                value: "https://static-cdn.jtvnw.net/emoticons/v2/264767/default/light/2.0",
            },
        ],

        commands: [
            {
                cmd: "!go",
                hint: "Принять участие в битве",
                color: "#4fd682",
                icon: "⚔️",
            },
            {
                cmd: "!buff",
                hint: "Случайное влияние на персонажа",
                color: "#5dade2",
                icon: "✨",
            },
            {
                cmd: "!combo",
                hint: "Активировать ивент (нужно 3 килла)",
                color: "#f4d03f",
                icon: "💥",
            },
            {
                cmd: "!tag",
                hint: "Нарисовать граффити под ногами",
                color: "#af7ac5",
                icon: "🎨",
                hasArg: true,
            },
            {
                cmd: "!yo",
                hint: "Обратить на себя внимание противников",
                color: "#eb984e",
                icon: "📢",
            },
            {
                cmd: "!fart",
                hint: "Пустить газы",
                color: "#ec7063",
                icon: "💨",
            },
            { cmd: "!dance", hint: "Танцевать", color: "#ff79c6", icon: "💃" },
        ],

        maps: [
            { cmd: "!map 1", label: "Карта 1", color: "#1abc9c", icon: "🏝️" },
            { cmd: "!map 2", label: "Карта 2", color: "#3498db", icon: "🏔️" },
            { cmd: "!map 3", label: "Карта 3", color: "#9b59b6", icon: "🌋" },
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

            .cs-btn-animated {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .cs-btn-large:hover {
                animation: cs-pulse 0.6s ease-in-out;
            }

            @keyframes cs-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.04); }
                100% { transform: scale(1); }
            }

            .cs-size-switcher {
                display: flex;
                align-items: center;
                gap: 2px;
                background: var(--color-background-button-secondary-default);
                border-radius: 8px;
                padding: 1px 2px;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s;
            }
            .cs-size-switcher:hover {
                background: var(--color-background-button-secondary-hover);
            }
            .cs-size-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--color-text-alt);
                opacity: 0.3;
                transition: all 0.25s ease;
            }
            .cs-size-dot.active {
                opacity: 1;
                background: #5dade2;
            }
            .cs-size-dot[data-size="compact"] {
                width: 5px;
                height: 5px;
            }
            .cs-size-dot[data-size="normal"] {
                width: 7px;
                height: 7px;
            }
            .cs-size-dot[data-size="large"] {
                width: 9px;
                height: 9px;
            }

            .cs-tag-input {
                width: 28px;
                height: 18px;
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                font-family: inherit;
                border: 1px solid var(--color-border-base);
                border-radius: 4px;
                background: var(--color-background-button-secondary-default);
                color: var(--color-text-button-secondary);
                outline: none;
                padding: 0 2px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .cs-tag-input:focus {
                border-color: #af7ac5;
                box-shadow: 0 0 0 2px rgba(175, 122, 197, 0.25);
            }
            .cs-tag-input:hover {
                border-color: var(--color-border-hover, #af7ac5);
            }

            .cs-tag-wrapper {
                display: flex;
                align-items: center;
                gap: 3px;
                font-size: 10px;
                color: var(--color-text-alt);
                user-select: none;
            }
            .cs-tag-label {
                font-weight: 600;
                opacity: 0.7;
            }

            .cs-title-icon {
                cursor: pointer;
                user-select: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease, opacity 0.15s ease;
                vertical-align: middle;
            }
            .cs-title-icon:hover {
                transform: scale(1.15);
            }
            .cs-title-icon:active {
                transform: scale(0.9);
            }
            .cs-title-icon img {
                width: 16px;
                height: 16px;
                border-radius: 3px;
                vertical-align: middle;
                object-fit: cover;
            }

            @keyframes cs-icon-swap {
                0% { transform: scale(1) rotate(0deg); opacity: 1; }
                40% { transform: scale(0.5) rotate(-15deg); opacity: 0.3; }
                70% { transform: scale(1.2) rotate(5deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .cs-title-icon.swapping {
                animation: cs-icon-swap 0.35s ease-in-out;
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
            this.buttonSize =
                localStorage.getItem(CONFIG.buttonSizeKey) || "compact";
            this.tagNumber = localStorage.getItem(CONFIG.tagNumberKey) || "0";
            this.titleIconIndex = parseInt(
                localStorage.getItem(CONFIG.titleIconKey) || "0",
                10,
            );
            if (
                isNaN(this.titleIconIndex) ||
                this.titleIconIndex < 0 ||
                this.titleIconIndex >= CONFIG.titleIcons.length
            ) {
                this.titleIconIndex = 0;
            }
            this.elements = {
                container: null,
                buttonsWrapper: null,
                arrowSpan: null,
                sizeDots: [],
                mapDropdownContent: null,
                hideDropdownFn: null,
                tagInput: null,
                collapsibleElements: [],
                titleIconEl: null,
            };
        }

        exists() {
            return !!document.getElementById(CONFIG.containerId);
        }

        getCommandText(cmdData) {
            if (cmdData.hasArg) {
                return `${cmdData.cmd} ${this.tagNumber}`;
            }
            return cmdData.cmd;
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

            this._updateCollapsibleVisibility();
        }

        _updateCollapsibleVisibility() {
            this.elements.collapsibleElements.forEach((el) => {
                el.style.display = this.isCollapsed ? "none" : "";
            });
        }

        cycleButtonSize() {
            const sizes = CONFIG.buttonSizes;
            const currentIndex = sizes.indexOf(this.buttonSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            this.buttonSize = sizes[nextIndex];
            localStorage.setItem(CONFIG.buttonSizeKey, this.buttonSize);

            this._updateSizeDots();
            this._rebuildButtons();
            this._rebuildMapButtons();
        }

        cycleTitleIcon() {
            this.titleIconIndex =
                (this.titleIconIndex + 1) % CONFIG.titleIcons.length;
            localStorage.setItem(
                CONFIG.titleIconKey,
                this.titleIconIndex.toString(),
            );
            this._updateTitleIcon();
        }

        _updateTitleIcon() {
            const iconEl = this.elements.titleIconEl;
            if (!iconEl) return;

            const iconData = CONFIG.titleIcons[this.titleIconIndex];

            iconEl.classList.remove("swapping");

            void iconEl.offsetWidth;
            iconEl.classList.add("swapping");

            setTimeout(() => {
                iconEl.innerHTML = "";
                if (iconData.type === "emoji") {
                    iconEl.textContent = iconData.value;
                } else if (iconData.type === "image") {
                    const img = document.createElement("img");
                    img.src = iconData.value;
                    img.alt = "icon";
                    iconEl.appendChild(img);
                }
            }, 120);

            setTimeout(() => {
                iconEl.classList.remove("swapping");
            }, 400);
        }

        _updateSizeDots() {
            this.elements.sizeDots.forEach((dot) => {
                if (dot.dataset.size === this.buttonSize) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }

        _rebuildButtons() {
            const wrapper = this.elements.buttonsWrapper;
            if (!wrapper) return;

            wrapper.style.opacity = "0";
            wrapper.style.transform = "translateY(-4px)";

            setTimeout(() => {
                wrapper.innerHTML = "";
                this._applyWrapperStyle(wrapper);

                CONFIG.commands.forEach((cmdData) => {
                    wrapper.appendChild(this._createButton(cmdData));
                });

                setTimeout(() => {
                    wrapper.style.opacity = "1";
                    wrapper.style.transform = "translateY(0)";
                }, 20);
            }, 150);
        }

        _rebuildMapButtons() {
            const dropdown = this.elements.mapDropdownContent;
            if (!dropdown) return;

            const buttons = dropdown.querySelectorAll("button");
            buttons.forEach((btn) => btn.remove());

            CONFIG.maps.forEach((mapData) => {
                const mapBtn = this._createMapButton(mapData);

                mapBtn.addEventListener("click", () => {
                    if (this.elements.hideDropdownFn) {
                        this.elements.hideDropdownFn();
                    }
                });

                dropdown.appendChild(mapBtn);
            });
        }

        _createMapButton(mapData) {
            const mapBtn = this._createButton(mapData, mapData.label);

            Object.assign(mapBtn.style, {
                textAlign: "left",
                borderRadius: "4px",
                borderLeftWidth: "4px",
                transition: "background-color 0.2s, transform 0.1s",
            });

            switch (this.buttonSize) {
                case "compact":
                    Object.assign(mapBtn.style, {
                        fontSize: "11px",
                        padding: "4px 8px",
                        minHeight: "auto",
                        flexBasis: "auto",
                        borderBottom: "none",
                        borderLeft: `4px solid ${mapData.color}`,
                        display: "block",
                    });
                    break;
                case "normal":
                    Object.assign(mapBtn.style, {
                        fontSize: "12px",
                        padding: "6px 10px",
                        minHeight: "auto",
                        flexBasis: "auto",
                        borderBottom: "none",
                        borderLeft: `4px solid ${mapData.color}`,
                    });
                    break;
                case "large":
                    Object.assign(mapBtn.style, {
                        fontSize: "13px",
                        padding: "8px 12px",
                        minHeight: "auto",
                        flexBasis: "auto",
                        borderBottom: `3px solid ${mapData.color}`,
                        borderLeft: "none",
                        textAlign: "center",
                    });
                    break;
            }

            mapBtn.addEventListener("mouseenter", () => {
                mapBtn.style.transform = "translateX(2px)";
            });

            mapBtn.addEventListener("mouseleave", () => {
                mapBtn.style.transform = "translateX(0)";
            });

            return mapBtn;
        }

        _applyWrapperStyle(wrapper) {
            switch (this.buttonSize) {
                case "compact":
                    Object.assign(wrapper.style, {
                        gap: "4px",
                        padding: "4px 8px",
                    });
                    break;
                case "normal":
                    Object.assign(wrapper.style, {
                        gap: "5px",
                        padding: "6px 8px",
                    });
                    break;
                case "large":
                    Object.assign(wrapper.style, {
                        gap: "6px",
                        padding: "8px 8px",
                    });
                    break;
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
                transition: "opacity 0.15s ease, transform 0.15s ease",
                opacity: "1",
                transform: "translateY(0)",
            });

            this.elements.buttonsWrapper = buttonsWrapper;
            this._applyWrapperStyle(buttonsWrapper);

            CONFIG.commands.forEach((cmdData) => {
                buttonsWrapper.appendChild(this._createButton(cmdData));
            });

            this.elements.container = container;

            container.appendChild(header);
            container.appendChild(buttonsWrapper);

            this._updateCollapsibleVisibility();

            return container;
        }

        _createTitleIconElement() {
            const iconEl = document.createElement("span");
            iconEl.className = "cs-title-icon";
            iconEl.title = "Ctrl+клик — сменить иконку";

            const iconData = CONFIG.titleIcons[this.titleIconIndex];
            if (iconData.type === "emoji") {
                iconEl.textContent = iconData.value;
            } else if (iconData.type === "image") {
                const img = document.createElement("img");
                img.src = iconData.value;
                img.alt = "icon";
                iconEl.appendChild(img);
            }

            iconEl.addEventListener("click", (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.cycleTitleIcon();
                }
            });

            this.elements.titleIconEl = iconEl;
            return iconEl;
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
            Object.assign(titleSpan.style, {
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
            });

            const titleIcon = this._createTitleIconElement();
            const titleText = document.createElement("span");
            titleText.textContent = "Панель CamShooters";

            titleSpan.appendChild(titleIcon);
            titleSpan.appendChild(titleText);

            const rightControls = document.createElement("div");
            Object.assign(rightControls.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
            });

            const tagControl = this._createTagControl();
            const sizeSwitcher = this._createSizeSwitcher();
            const mapDropdown = this._createMapDropdownInHeader();

            this.elements.collapsibleElements = [
                tagControl,
                sizeSwitcher,
                mapDropdown,
            ];

            const arrowSpan = document.createElement("span");
            arrowSpan.textContent = this.isCollapsed ? "▶" : "▼";
            arrowSpan.style.fontSize = "8px";
            this.elements.arrowSpan = arrowSpan;

            rightControls.appendChild(tagControl);
            rightControls.appendChild(sizeSwitcher);
            rightControls.appendChild(mapDropdown);
            rightControls.appendChild(arrowSpan);

            header.appendChild(titleSpan);
            header.appendChild(rightControls);

            header.addEventListener("click", (e) => {
                if (
                    !mapDropdown.contains(e.target) &&
                    !sizeSwitcher.contains(e.target) &&
                    !tagControl.contains(e.target)
                ) {
                    this.toggleCollapse();
                }
            });

            return header;
        }

        _createTagControl() {
            const wrapper = document.createElement("div");
            wrapper.className = "cs-tag-wrapper";
            wrapper.title = "Номер граффити для !tag";

            const label = document.createElement("span");
            label.className = "cs-tag-label";
            label.textContent = "🎨";

            const input = document.createElement("input");
            input.type = "text";
            input.className = "cs-tag-input";
            input.value = this.tagNumber;
            input.maxLength = 3;
            input.placeholder = "0";

            this.elements.tagInput = input;

            input.addEventListener("click", (e) => {
                e.stopPropagation();
            });

            input.addEventListener("input", (e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                e.target.value = val;
                this.tagNumber = val || "0";
                localStorage.setItem(CONFIG.tagNumberKey, this.tagNumber);
            });

            input.addEventListener("keydown", (e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                    input.blur();
                }
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);

            return wrapper;
        }

        _createSizeSwitcher() {
            const switcher = document.createElement("div");
            switcher.className = "cs-size-switcher";
            switcher.title = "Переключить размер кнопок";

            this.elements.sizeDots = [];

            CONFIG.buttonSizes.forEach((size) => {
                const dot = document.createElement("div");
                dot.className = "cs-size-dot";
                dot.dataset.size = size;
                if (size === this.buttonSize) {
                    dot.classList.add("active");
                }
                switcher.appendChild(dot);
                this.elements.sizeDots.push(dot);
            });

            switcher.addEventListener("click", (e) => {
                e.stopPropagation();
                this.cycleButtonSize();
            });

            return switcher;
        }

        _createButton(data, labelOverride = null) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.classList.add("cs-btn-animated");

            this._applyButtonStyle(btn, data, labelOverride);

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
                const commandText = this.getCommandText(data);
                console.log(`[CamShooters] Кнопка: ${commandText}`);
                this.chatService.sendMessage(commandText);
            });

            return btn;
        }

        _applyButtonStyle(btn, data, labelOverride) {
            btn.classList.remove("cs-btn-large");

            switch (this.buttonSize) {
                case "compact":
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
                        pointerEvents: "auto",
                        minHeight: "auto",
                        flexBasis: "auto",
                        borderBottom: "none",
                        lineHeight: "normal",
                        display: "inline-block",
                        alignItems: "",
                        justifyContent: "",
                    });
                    break;

                case "normal":
                    btn.title = data.hint || data.cmd;
                    btn.innerHTML = "";

                    if (data.icon) {
                        const iconSpan = document.createElement("span");
                        iconSpan.textContent = data.icon;
                        iconSpan.style.marginRight = "4px";
                        iconSpan.style.fontSize = "12px";
                        btn.appendChild(iconSpan);
                    }

                    const textSpan = document.createElement("span");
                    textSpan.textContent = labelOverride || data.cmd;
                    btn.appendChild(textSpan);

                    Object.assign(btn.style, {
                        backgroundColor:
                            "var(--color-background-button-secondary-default)",
                        color: "var(--color-text-button-secondary)",
                        border: "none",
                        borderLeft: `3px solid ${data.color}`,
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        transition: "filter 0.2s, background-color 0.2s",
                        flexGrow: "1",
                        textAlign: "center",
                        pointerEvents: "auto",
                        minHeight: "28px",
                        flexBasis: "auto",
                        borderBottom: "none",
                        lineHeight: "normal",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                    });
                    break;

                case "large":
                    btn.title = data.hint || data.cmd;
                    btn.innerHTML = "";
                    btn.classList.add("cs-btn-large");

                    const container = document.createElement("div");
                    Object.assign(container.style, {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                    });

                    if (data.icon) {
                        const iconEl = document.createElement("span");
                        iconEl.textContent = data.icon;
                        iconEl.style.fontSize = "18px";
                        iconEl.style.lineHeight = "1";
                        container.appendChild(iconEl);
                    }

                    const labelEl = document.createElement("span");
                    labelEl.textContent = labelOverride || data.cmd;
                    labelEl.style.fontSize = "11px";
                    labelEl.style.fontWeight = "700";
                    labelEl.style.lineHeight = "1.1";
                    container.appendChild(labelEl);

                    if (data.hint) {
                        const hintEl = document.createElement("span");
                        hintEl.textContent = data.hint;
                        Object.assign(hintEl.style, {
                            fontSize: "9px",
                            opacity: "0.6",
                            lineHeight: "1.1",
                            maxWidth: "100px",
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        });
                        container.appendChild(hintEl);
                    }

                    btn.appendChild(container);

                    Object.assign(btn.style, {
                        backgroundColor:
                            "var(--color-background-button-secondary-default)",
                        color: "var(--color-text-button-secondary)",
                        border: "none",
                        borderLeft: "none",
                        borderBottom: `3px solid ${data.color}`,
                        borderRadius: "6px",
                        padding: "8px 6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        transition:
                            "filter 0.2s, background-color 0.2s, transform 0.15s",
                        flexGrow: "1",
                        flexBasis: "calc(33.333% - 6px)",
                        textAlign: "center",
                        pointerEvents: "auto",
                        minHeight: "56px",
                        lineHeight: "normal",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    });
                    break;
            }
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

            this.elements.mapDropdownContent = dropdown;

            let hideTimeout;

            const hideDropdown = () => {
                dropdown.style.opacity = "0";
                dropdown.style.transform = "translateY(4px)";
                setTimeout(() => {
                    dropdown.style.display = "none";
                }, 200);
                globeIcon.style.opacity = "1";
                globeIcon.style.transform = "scale(1)";
            };

            const showDropdown = () => {
                dropdown.style.display = "flex";
                setTimeout(() => {
                    dropdown.style.opacity = "1";
                    dropdown.style.transform = "translateY(0)";
                }, 10);
                globeIcon.style.opacity = "0.8";
                globeIcon.style.transform = "scale(1.1)";
            };

            this.elements.hideDropdownFn = hideDropdown;

            CONFIG.maps.forEach((mapData) => {
                const mapBtn = this._createMapButton(mapData);

                mapBtn.addEventListener("click", () => {
                    hideDropdown();
                });

                dropdown.appendChild(mapBtn);
            });

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
            console.log("[CamShooters] Panel started");
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
