const createUnreadCountRequest = async () => {
  const storage = await browser.storage.local.get({
    apikey: "",
    url: "",
  });

  let headers = new Headers({
    "X-Auth-Token": storage.apikey,
  });
  let init = { method: "GET", headers };
  let url = `${storage.url}v1/entries?status=unread&direction=desc`;
  return new Request(url, init);
};

const checkUnreadCount = async () => {
  console.log("checking Miniflux unread count");
  const storage = await browser.storage.local.get({
    apikey: "",
    url: "",
  });

  if (!storage.url || !storage.apikey) {
    console.log('miniflux Notifier not configured, skipping unread count')
    return
  }

  const request = await createUnreadCountRequest();

  fetch(request)
    .then((response) => {
      return response.json();
    })
    .then(handleResponse)
    .catch((err) => {
      console.error("error while fetching unread count", err);
    });
};

const handleResponse = (response) => {
  if (response && response.total) {
    console.log(`unread count fetched, ${response.total} unread`)
    displayBrowserActionBadge(response.total.toString());
  } else {
    displayBrowserActionBadge("");
  }
};

const displayBrowserActionBadge = (number) => {
  browser.browserAction.setBadgeBackgroundColor({
    color: "rgba(230,230,230,1)",
  });

  const badgeText = number > 99 ? `${number}+` : `${number}`;
  browser.browserAction.setBadgeText({ text: badgeText });
};

const onBrowserActionClick = async () => {
  console.log("opening Miniflux in new tab");

  const storage = await browser.storage.local.get({
    apikey: "",
    url: "",
  });

  var creating = browser.tabs.create({
    url: storage.url || browser.runtime.getURL("/options.html"),
  });
  creating.then(
    () => {
      console.log("opened in new");
    },
    (err) => {
      console.log("error tabbing");
      console.log(err);
    }
  );
};

const init = async () => {
  // Check for clicks on toolbar button
  browser.browserAction.onClicked.addListener(onBrowserActionClick);

  checkUnreadCount();

  setInterval(() => {
    try {
      checkUnreadCount();
    } catch (err) {
      console.error("error updating count", err);
    }
  }, 1000 * 60);
};

init();
