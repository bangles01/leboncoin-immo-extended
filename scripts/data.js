async function insertCitizensCount() {
  const target = document.querySelector('span[href="#map"]');

  if (target) {
    const { city, zipCode } = extractCityAndZipCode(target.innerText);
    const countCitizens = await fetchCityCount(city, zipCode);
    const parent = target.parentElement;

    const div = document.createElement("div");
    div.id = "lbc-immo-extended";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginTop = "3px";
    div.style.marginBottom = "10px";

    const span = document.createElement("span");
    span.classList.add("text-body-1");
    span.style.paddingTop = "3px";
    span.style.color = "rgb(236, 90, 19)";

    let spanText = `<strong>${formatNumber(countCitizens)} habitants</strong> dans cette commune`;
    if (countCitizens == 0)
      spanText =
        "Impossible de récupérer le nombre d'habitants de cette commune";
    span.innerHTML = spanText;

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("../icons/128.png");
    img.style.width = "16px";
    img.style.height = "16px";
    img.style.marginRight = "10px";

    div.appendChild(img);
    div.appendChild(span);

    const extensionDiv = document.getElementById("lbc-immo-extended");
    if (!extensionDiv) parent.parentNode.insertBefore(div, parent.nextSibling);
  }
}

function removeData() {
  const extensionDiv = document.getElementById("lbc-immo-extended");
  if (extensionDiv) extensionDiv.remove();
}

async function fetchCityCount(city, zipCode) {
  const response = await fetch(
    `https://geo.api.gouv.fr/communes?codePostal=${zipCode}&fields=name,population`
  );
  let data = await response.json();
  if (data.length === 0) return 0;

  cityData = data.map((cityData) => ({
      ...cityData,
      levenshteinScore: levenshtein(cityData.nom, city),
    }))
    .sort((a, b) => a.levenshteinScore - b.levenshteinScore)[0];

  if (cityData.levenshteinScore > 3) return 0;

  return cityData?.population || 0;
}

function extractCityAndZipCode(text) {
  const zipCode = text.match(/\d{5}/)[0];
  const city = text.replace(zipCode, "").trim();

  return { city, zipCode };
}

function formatNumber(number) {
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
}