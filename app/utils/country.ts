type CountryLike = {
  code: string;
  name: string;
};

export function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function formatCountryLabel(country: CountryLike) {
  return `${countryCodeToFlag(country.code)} ${country.name}`;
}
