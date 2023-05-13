import type { Country } from "@prisma/client";

export const CountrySelect = ({
  countries,
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: Country["id"];
  countries: Country[];
}) => {
  return (
    <select
      name={name}
      className="flex-1 rounded-md border-2 border-blue-500 px-3 py-1 text-lg leading-loose"
      defaultValue={defaultValue}
    >
      {countries.map((country) => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      ))}
    </select>
  );
};
