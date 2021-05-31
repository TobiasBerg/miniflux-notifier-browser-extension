function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    url: document.querySelector("#url").value,
    apikey: document.querySelector("#apikey").value,
  });
}

async function restoreOptions() {
  function setUrl(input) {
    document.querySelector("#url").value = input || "";
  }

  function setApiKey(input) {
    document.querySelector("#apikey").value = input || "";
  }

  try {
    const storage = await browser.storage.local.get({
      apikey: "",
      url: "",
    });

    setUrl(storage.url);
    setApiKey(storage.apikey);
  } catch (err) {
    console.log(`Error: ${err}`);
  }
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
