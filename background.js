chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get({ proxyDomainList: [] }, (result) => {
        applyProxySettings(result.proxyDomainList);
    });
});

function applyProxySettings(domains) {
    if (domains.length === 0) {
        chrome.proxy.settings.clear({ scope: "regular" });
        return;
    }

    // Прокси сервер, который будет использоваться
    const proxy = "PROXY your-proxy-server:8080";  // Здесь указываете IP и порт прокси-сервера
    const direct = "DIRECT";

    const pacScript = `
        function FindProxyForURL(url, host) {
            const proxy = "${proxy}";
            const direct = "${direct}";

            const proxyDomains = ${JSON.stringify(domains)};
            for (let i = 0; i < proxyDomains.length; i++) {
                if (host.includes(proxyDomains[i])) return proxy;
            }
            return direct;
        }
    `;

    chrome.proxy.settings.set(
        {
            value: { mode: "pac_script", pacScript: { data: pacScript } },
            scope: "regular"
        },
        () => {}
    );
}

chrome.storage.onChanged.addListener((changes) => {
    if (changes.proxyDomainList) {
        applyProxySettings(changes.proxyDomainList.newValue);
    }
});