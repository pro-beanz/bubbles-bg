/**
 * @name BubblesBG
 * @author beanz
 * @description Overrides the Discord background with bubbles, as seen on https://www.beanz.pro. Combination plugin and theme, based on Frosted Glass, by Gibbu. Dark theme required. Works best when not used with any additional themes.
 * @version 1.1.0
 * @authorId 249922383761244161
 * @authorLink https://www.twitter.com/pro_beanz
 * @website https://www.beanz.pro
 * @source https://github.com/pro-beanz/bubbles-bg
 */

 let canvas;
 let ctx;
 const colors = [
     [255, 255, 255],
     [19, 19, 19]
 ]
 let bubbles = [];
 let running = false;
 let ratio;

module.exports = (_ => {
    const config = {
        "info": {
            "name": "Bubbles BG",
            "author": "beanz",
            "version": "1.1.0",
            "description": "Overrides the Discord background with bubbles, as seen on https://www.beanz.pro. Combination plugin and theme, based on Frosted Glass, by Gibbu. Dark theme required. Works best when not used with any additional themes."
        },
        "changeLog": {
            "added": {
                "Hidden": "BDFDB dependency"
            },
            "fixed": {
                "Styling": "Button colors have gradients now"
            }
        }
    };

    return (window.Lightcord || window.LightCord) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return "Do not use LightCord!"; }
        load() { BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)"); }
        start() { }
        stop() { }
    } : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

        downloadLibrary() {
            require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
                else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
            });
        }

        load() {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: _ => { delete window.BDFDB_Global.downloadModal; },
                    onConfirm: _ => {
                        delete window.BDFDB_Global.downloadModal;
                        this.downloadLibrary();
                    }
                });
            }
            if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() { this.load(); }
        stop() { }
        // getSettingsPanel() {
        //     let template = document.createElement("template");
        //     template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
        //     template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
        //     return template.content.firstElementChild;
        // }
    } : (([Plugin, BDFDB]) => {
        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;700&display=swap');
            @import url('https://pro-beanz.github.io/bubbles-bg/theme.css');
            @import url('https://discordstyles.github.io/Addons/windows-titlebar.css');
        `

        return class BubblesBG extends Plugin {
            onLoad() {
                this.patchedModules = {
                    after: {
                        ChannelItem: "default"
                    }
                };
            }

            onStart() {
                BDFDB.PatchUtils.forceAllUpdates(this);

                // styles
                let styleSheet = document.createElement("style");
                styleSheet.setAttribute("id", 'bubbles-bg');
                styleSheet.innerText = styles;
                document.head.appendChild(styleSheet);

                // add canvas
                let body = document.getElementsByClassName('bg-h5JY_x')[0];
                body.insertAdjacentHTML('afterbegin', '<canvas id="bubbles-canvas"> </canvas>');
                running = true;

                // local canvas variable
                canvas = document.getElementById("bubbles-canvas");
                ctx = canvas.getContext("2d");
                render();

                for (let i = 0; i < 75; i++) { bubbles.push(new Bubble()) }
                update();
            }

            onStop() {
                BDFDB.PatchUtils.forceAllUpdates(this);

                running = false;

                // styles
                let styleSheet = document.getElementById('bubbles-bg');
                console.log(styleSheet);
                if (styleSheet) document.head.removeChild(document.getElementById('bubbles-bg'));

                // canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < bubbles.length; i) bubbles.pop();
                if (document.getElementById('bubbles-canvas'))
                    document.getElementsByClassName('bg-h5JY_x')[0].removeChild(canvas);
            }

            // getSettingsPanel(collapseStates = {}) {
            //     // TODO
            // }

            // onSettingsClosed() {
            //     // TODO
            // }
        }
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();

class Bubble {
    constructor() {
        // respawn and randomize starting locations
        this.respawn();
        this.xPos = randRange(0, canvas.width);
        this.yPos = randRange(0, canvas.height);
    }

    respawn() {
        this.radius = randRange(0.00694 * canvas.height, 0.02431 * canvas.height);

        // reset position
        if (oneOrZero() > ratio) {
            this.xPos = -this.radius;
            this.yPos = randRange(0, canvas.height);
        } else {
            this.xPos = randRange(0, canvas.width);
            this.yPos = canvas.height + this.radius;
        }

        // velocity
        this.xVelocity = randRange(0.25, .75);
        this.yVelocity = randRange(0.25, .75);

        // opacity based on velocity for parallax-like effect
        this.opacity = remap(0.25, .75, 0.05, 0.35, Math.max(this.xVelocity, this.yVelocity));

        // new color
        this.colored = oneOrZero() > 0.5;
        if (this.colored) {
            this.updateColor();
        } else {
            // grey
            this.color = this.formatColor(colors[oneOrZero()]);
        }
    }

    updateColor() {
        // 0.00019634954084936208 = w * Math.PI / 1000
        // used to time angular speed (w) to 0.0625(2^-4) rev/s
        let angle = (Date.now() - this.xPos + 2 * this.yPos) * 0.00019634954084936208 % (Math.PI / 2);
        let color = [360 + Math.sin(angle) * -360, 65, 50];

        this.color = "hsla(" + color[0] + "," + color[1] + "%," + color[2] + "%," + this.opacity + ")";
    }

    formatColor(arr) { return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + this.opacity + ")"; }

    draw() {
        if (this.colored) this.updateColor();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.xPos, this.yPos, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function render() {
    canvas.height = window.screen.availHeight;
    canvas.width = window.screen.availWidth;
    ratio = Math.abs(canvas.height > canvas.width ? canvas.width / canvas.height : canvas.height / canvas.width);
    window.addEventListener('resize', render, true);
}

function update() {
    if (running) requestAnimationFrame(update);

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach(bubble => {
        // update position
        bubble.xPos += bubble.xVelocity;
        bubble.yPos -= bubble.yVelocity;

        // create new bubble if offscreen
        if (bubble.xPos > canvas.width + bubble.radius || bubble.yPos < -bubble.radius) {
            bubble.respawn();
        }

        bubble.draw();
    })
}

function remap(ol, oh, nl, nh, v) { return (v - ol) / (oh - ol) * (nh - nl) + nl; }
function randRange(low, high) { return remap(0, 1, low, high, Math.random()); }
function oneOrZero() { return Math.random() > 0.5 ? 1 : 0 }