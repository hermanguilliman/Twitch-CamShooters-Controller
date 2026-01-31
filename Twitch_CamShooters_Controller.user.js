// ==UserScript==
// @name         Twitch CamShooters Controller
// @namespace    https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @version      0.1
// @description  Компактная панель управления для игры CamShooters (by Camelot63RU)
// @author       Herman Guilliman
// @match        https://www.twitch.tv/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @updateURL    https://raw.githubusercontent.com/HermanGuilliman/Twitch-CamShooters-Controller/main/Twitch_CamShooters_Controller.user.js
// @downloadURL  https://raw.githubusercontent.com/HermanGuilliman/Twitch-CamShooters-Controller/main/Twitch_CamShooters_Controller.user.js
// @supportURL   mailto:hermanguilliman@proton.me
// @homepageURL  https://github.com/HermanGuilliman/Twitch-CamShooters-Controller
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const commands = [
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
        { cmd: "!tag", hint: "Нарисовать под собой граффити", color: "#af7ac5" },
        { cmd: "!yo", hint: "Обратить на себя внимание", color: "#eb984e" },
        { cmd: "!fart", hint: "Дать гадзу!", color: "#ec7063" },
        { cmd: "!dance", hint: "Танцевать", color: "#ff79c6" },
    ];

    const CONTAINER_ID = "twitch-camshooters-panel";
    const STORAGE_KEY = "camshooters_collapsed";

    let isCollapsed = localStorage.getItem(STORAGE_KEY) === "true";

    function sendMessage(text) {
        const inputEditor = document.querySelector(
            '[data-a-target="chat-input"]',
        );
        const sendButton = document.querySelector(
            '[data-a-target="chat-send-button"]',
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

    function createButtons() {
        const chatInputWrapper = document.querySelector(".chat-input");
        if (!chatInputWrapper || document.getElementById(CONTAINER_ID)) return;

        const mainContainer = document.createElement("div");
        mainContainer.id = CONTAINER_ID;
        mainContainer.style.backgroundColor = "var(--color-background-base)";
        mainContainer.style.borderBottom = "1px solid var(--color-border-base)";
        mainContainer.style.zIndex = "9999";
        mainContainer.style.display = "flex";
        mainContainer.style.flexDirection = "column";

        const header = document.createElement("div");
        header.style.padding = "2px 8px";
        header.style.cursor = "pointer";
        header.style.fontSize = "10px";
        header.style.fontWeight = "600";
        header.style.textTransform = "uppercase";
        header.style.letterSpacing = "0.5px";
        header.style.color = "var(--color-text-alt)";
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.justifyContent = "space-between";
        header.style.userSelect = "none";
        header.style.backgroundColor = "var(--color-background-alt)";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = "🔫 Панель CamShooters";

        const arrowSpan = document.createElement("span");
        arrowSpan.textContent = isCollapsed ? "▶" : "▼";
        arrowSpan.style.fontSize = "8px";

        header.appendChild(titleSpan);
        header.appendChild(arrowSpan);

        const buttonsWrapper = document.createElement("div");
        buttonsWrapper.style.display = isCollapsed ? "none" : "flex";
        buttonsWrapper.style.flexWrap = "wrap";
        buttonsWrapper.style.gap = "4px";
        buttonsWrapper.style.padding = "4px 8px";

        header.onclick = () => {
            isCollapsed = !isCollapsed;
            localStorage.setItem(STORAGE_KEY, isCollapsed);
            buttonsWrapper.style.display = isCollapsed ? "none" : "flex";
            arrowSpan.textContent = isCollapsed ? "▶" : "▼";
        };

        commands.forEach((item) => {
            const btn = document.createElement("button");
            btn.textContent = item.cmd;
            btn.title = item.hint;

            btn.style.backgroundColor =
                "var(--color-background-button-secondary-default)";
            btn.style.color = "var(--color-text-button-secondary)";
            btn.style.border = "none";
            btn.style.borderLeft = `3px solid ${item.color}`;
            btn.style.borderRadius = "2px";
            btn.style.padding = "2px 6px";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "600";
            btn.style.fontSize = "11px";
            btn.style.fontFamily = "inherit";
            btn.style.transition = "filter 0.2s, background-color 0.2s";

            btn.onmouseenter = () => {
                btn.style.backgroundColor =
                    "var(--color-background-button-secondary-hover)";
            };
            btn.onmouseleave = () => {
                btn.style.backgroundColor =
                    "var(--color-background-button-secondary-default)";
            };

            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                sendMessage(item.cmd);
            };

            buttonsWrapper.appendChild(btn);
        });

        mainContainer.appendChild(header);
        mainContainer.appendChild(buttonsWrapper);
        chatInputWrapper.insertBefore(
            mainContainer,
            chatInputWrapper.firstChild,
        );
    }

    setInterval(createButtons, 1000);
})();
