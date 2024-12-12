import { useMemo, useState, type ChangeEvent } from 'react';
import { getCodeSandboxHost } from "@codesandbox/utils";

interface Hotel {
	_id: string,
	chain_name: string,
	hotel_name: string,
	city: string,
	country: string
}

interface City {
	_id: string,
	name: string,
}

interface Country {
	_id: string,
	country: string,
	countryisocode: string,
}

interface SearchResponse {
	hotels: Hotel[]
	cities: City[],
	countries: Country[]
}

const codeSandboxHost = getCodeSandboxHost(3001);
const API_URL = codeSandboxHost ? `https://${codeSandboxHost}` : 'http://localhost:3001';

const fetchHotelsData = async (value: string) => {
  const searchResponse = await fetch(`${API_URL}/search?q=${value}`);
  const searchData = (await searchResponse.json()) as SearchResponse;
	return searchData;
}

function App() {
  const [searchInputValue, setSearchInputValue] = useState<string>('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [showClearBtn, setShowClearBtn] = useState(false);

	const onSearchHotels = async (event: ChangeEvent<HTMLInputElement>) => {
		const searchInputValue = event.target.value.trim();
		let updatedHotels: Hotel[] = [];
		let updatedCities: City[] = [];
		let updatedCountries: Country[] = [];
		let shouldShowClearBtn = false;
	
		if (searchInputValue !== '') {
			const { hotels, cities, countries } = await fetchHotelsData(searchInputValue);
			updatedHotels = hotels;
			updatedCities = cities;
			updatedCountries = countries;
			shouldShowClearBtn = true;
		}

		setHotels(updatedHotels);
		setCities(updatedCities);
		setCountries(updatedCountries);
		setShowClearBtn(shouldShowClearBtn);
		setSearchInputValue(searchInputValue);
	};

	const onClearBtnClick = () => {
		setSearchInputValue('');
		setHotels([]);
		setCities([]);
		setCountries([]);
		setShowClearBtn(false);
	};

	const renderHotelLists = () => {
		let renderedHotelList: JSX.Element | JSX.Element[]  = [];
		let renderedCitiesList: JSX.Element | JSX.Element[]  = [];
		let renderedCountriesList: JSX.Element | JSX.Element[]  = [];

		renderedHotelList = hotels.length ? hotels.map((hotel, index) => (
			<li key={index}>
				<a href={`/hotels/${hotel._id}`} className="dropdown-item">
					<i className="fa fa-building mr-2"></i>
					{hotel.hotel_name}
				</a>
				<hr className="divider" />
			</li>
		)) : <p>No hotels matched</p>;

		renderedCitiesList = cities.length ? cities.map((city, index) => (
			<li key={index}>
				<a href={`/cities/${city._id}`} className="dropdown-item">
					<i className="fa fa-building mr-2"></i>
					{city.name}
				</a>
				<hr className="divider" />
			</li>
		)) : <p>No cities matched</p>;

		renderedCountriesList = countries.length ? countries.map((country, index) => (
			<li key={index}>
				<a href={`/countries/${country._id}`} className="dropdown-item">
					<i className="fa fa-building mr-2"></i>
					{country.country}
				</a>
				<hr className="divider" />
			</li>
		)) : <p>No countries matched</p>;

		return [renderedHotelList, renderedCountriesList, renderedCitiesList];
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const [hotelList, countryList, cityList] = useMemo(() => renderHotelLists(), [searchInputValue]);

  return (
    <div className="App">
      <div className="container">
        <div className="row height d-flex justify-content-center align-items-center">
          <div className="col-md-6">
            <div className="dropdown">
              <div className="form">
                <i className="fa fa-search"></i>
                <input
                  type="text"
                  className="form-control form-input"
                  placeholder="Search accommodation..."
									value={searchInputValue}
                  onChange={onSearchHotels}
                />
                {showClearBtn && (
                  <span className="left-pan" onClick={onClearBtnClick}>
                    <i className="fa fa-close"></i>
                  </span>
                )}
              </div>
              {!!hotels.length && (
                <div className="search-dropdown-menu dropdown-menu w-100 show p-2">
                  <h2>Hotels</h2>
                  {hotelList}
                  <h2>Countries</h2>
                  {countryList}
                  <h2>Cities</h2>
                  {cityList}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
