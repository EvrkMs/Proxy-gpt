document.addEventListener('DOMContentLoaded', () => {
  const addDomainButton = document.getElementById('addDomain');
  const domainInput = document.getElementById('domainInput');
  const customDomainListElement = document.getElementById('customDomainList');
  const presetListElement = document.getElementById('presetList');

  // Объявляем пресеты
  const presets = {
    youtube: [
      "googlevideo.com",
      "youtu.be",
      "youtube.com",
      "youtubei.googleapis.com",
      "i.ytimg.com",
      "ytimg.com",
      "ggpht.com",
      "youtubekids.com",
    ],
    discord: [
      "discord.com",
      "discord.gg",
      "discordapp.com",
      "discordapp.net",
      "discord.app",
      "discord.media",
      "discordcdn.com",
      "discord.dev",
      "discord.new",
      "discord.gift",
      "discordstatus.com",
      "dis.gd",
      "discord.co",
    ],
    chatgpt: ["chatgpt.com", "openai.com", "cloudflare.com"],
  };

  // Загружаем данные из хранилища
  chrome.storage.local.get({ proxyDomainList: [], activePresets: [] }, (result) => {
    updateCustomDomainList(result.proxyDomainList.filter(domain => !isPresetDomain(domain)));
    updatePresetList(result.activePresets);
  });

  // Проверка, относится ли домен к пресету
  function isPresetDomain(domain) {
    return Object.values(presets).some(presetDomains => presetDomains.includes(domain));
  }

  // Добавление пользовательских доменов
  addDomainButton.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    if (domain) {
      chrome.storage.local.get({ proxyDomainList: [] }, (result) => {
        const proxyDomainList = result.proxyDomainList;
        if (!proxyDomainList.includes(domain)) {
          proxyDomainList.push(domain);
          chrome.storage.local.set({ proxyDomainList }, () => {
            updateCustomDomainList(proxyDomainList.filter(domain => !isPresetDomain(domain)));
            domainInput.value = '';
          });
        }
      });
    }
  });

  // Обновление списка пользовательских доменов
  function updateCustomDomainList(domains) {
    customDomainListElement.innerHTML = '';
    domains.forEach((domain) => {
      const listItem = document.createElement('li');
      listItem.textContent = domain;

      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        chrome.storage.local.get({ proxyDomainList: [] }, (result) => {
          const proxyDomainList = result.proxyDomainList.filter(d => d !== domain);
          chrome.storage.local.set({ proxyDomainList }, () => {
            updateCustomDomainList(proxyDomainList.filter(domain => !isPresetDomain(domain)));
          });
        });
      });

      listItem.appendChild(removeButton);
      customDomainListElement.appendChild(listItem);
    });
  }

  // Обновление списка пресетов
  function updatePresetList(activePresets) {
    presetListElement.innerHTML = '';
    Object.keys(presets).forEach((presetName) => {
      const listItem = document.createElement('li');
      listItem.className = "preset-switch";

      const label = document.createElement('label');
      label.textContent = presetName;

      const toggleSwitch = document.createElement('input');
      toggleSwitch.type = 'checkbox';
      toggleSwitch.checked = activePresets.includes(presetName);
      toggleSwitch.addEventListener('change', () => {
        chrome.storage.local.get({ proxyDomainList: [], activePresets: [] }, (result) => {
          let proxyDomainList = result.proxyDomainList;
          let newActivePresets = result.activePresets;

          if (toggleSwitch.checked) {
            // Включить пресет
            proxyDomainList.push(...presets[presetName].filter(domain => !proxyDomainList.includes(domain)));
            newActivePresets.push(presetName);
          } else {
            // Выключить пресет
            proxyDomainList = proxyDomainList.filter(domain => !presets[presetName].includes(domain));
            newActivePresets = newActivePresets.filter(preset => preset !== presetName);
          }

          chrome.storage.local.set({ proxyDomainList, activePresets: newActivePresets }, () => {
            updatePresetList(newActivePresets);
          });
        });
      });

      listItem.appendChild(label);
      listItem.appendChild(toggleSwitch);
      presetListElement.appendChild(listItem);
    });
  }
});