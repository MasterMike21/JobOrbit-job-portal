// Searches hundreds of thousands of worldwide companies live via Autocomplete
export const searchGlobalCompaniesLive = async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
        const response = await fetch(
            `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return data.map(item => ({
            name: item.name,
            domain: item.domain,
            logo: item.logo,
            location: "Global / Verified"
        }));
    } catch (error) {
        return [];
    }
};