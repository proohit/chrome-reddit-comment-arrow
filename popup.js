chrome.storage.local.get(
  {
    iconSize: "80",
    moveDelay: 500,
    scrolling: { strategy: "top", behavior: "smooth" },
  },
  (res) => {
    document.getElementById("iconSize").value = res.iconSize;
    document.getElementById("moveDelay").value = res.moveDelay;
    document.getElementById("scrollingStrategy").value = res.scrolling.strategy;
    document.getElementById("scrollingBehavior").value = res.scrolling.behavior;
  }
);

const handleSave = () => {
  return chrome.storage.local.set({
    iconSize: document.getElementById("iconSize").value,
    moveDelay: document.getElementById("moveDelay").value,
    scrolling: {
      strategy: document.getElementById("scrollingStrategy").value,
      behavior: document.getElementById("scrollingBehavior").value,
    },
  });
};

const handleResetSave = async () => {
  await chrome.storage.local.set({
    iconSize: "80",
    moveDelay: 500,
    scrolling: { strategy: "top", behavior: "smooth" },
  });

  document.getElementById("iconSize").value = "80";
  document.getElementById("moveDelay").value = 500;
  document.getElementById("scrollingStrategy").value = "top";
  document.getElementById("scrollingBehavior").value = "smooth";
};

const handleResetButtonPosition = () => {
  return chrome.storage.local.set({
    arrowPosition: {
      x: `calc(100% - ${document.getElementById("iconSize").value}px - 25px)`,
      y: "50vh",
    },
  });
};

const handleConfirmation = () => {
  if (document.querySelector(".confirmation"))
    document.removeChild(document.querySelector(".confirmation"));

  const confirmation = document.createElement("p");
  confirmation.textContent =
    "Options saved and will be applied the next time the button is rendered.";
  confirmation.classList.add("confirmation");
  document.querySelector(".options").appendChild(confirmation);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
};

const closePopupDelayed = () => {
  setTimeout(() => {
    window.close();
  }, 3000);
};

document.getElementById("saveOptions").onclick = async () => {
  await handleSave();
  handleConfirmation();
  closePopupDelayed();
};

document.getElementById("resetOptions").onclick = async () => {
  await handleResetSave();
  handleConfirmation();
  closePopupDelayed();
};

document.getElementById("resetPosition").onclick = async () => {
  await handleResetButtonPosition();
};
