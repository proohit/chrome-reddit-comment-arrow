chrome.storage.local.get(
  {
    iconSize: "80",
    moveDelay: 500,
  },
  (res) => {
    document.getElementById("iconSize").value = res.iconSize;
    document.getElementById("moveDelay").value = res.moveDelay;
  }
);

const handleSave = () => {
  return chrome.storage.local.set({
    iconSize: document.getElementById("iconSize").value,
    moveDelay: document.getElementById("moveDelay").value,
  });
};

const handleConfirmation = () => {
  if (document.querySelector(".confirmation"))
    document.removeChild(document.querySelector(".confirmation"));

  const confirmation = document.createElement("p");
  confirmation.textContent = "Options saved!";
  confirmation.classList.add("confirmation");
  document.querySelector(".options").appendChild(confirmation);
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
