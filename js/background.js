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
  console.log("Checking Miniflux unread count");
  const request = await createUnreadCountRequest();

  fetch(request)
    .then((response) => {
      return response.json();
    })
    .then(handleResponse)
    .catch((err) => {
      console.error("Error while fetching unread count", err);
    });
};

const handleResponse = (response) => {
  if (response && response.total) {
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
  console.log("Opening Miniflux in new tab");

  const storage = await browser.storage.local.get({
    apikey: "",
    url: "",
  });

  var creating = browser.tabs.create({
    url: storage.url,
  });
  creating.then(
    () => {
      console.log("Opened in new");
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
