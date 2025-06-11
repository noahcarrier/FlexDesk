import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BaseWidget from './BaseWidget';
import './WeatherWidget.css';

interface WeatherData {
  location: string;
  region: string;
  country: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike: number;
  visibility: number;
  icon: string;
  windDirection: string;
  uvIndex: number;
  precipMM: number;
}

interface ForecastDay {
  date: string;
  dayName: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipMM: number;
}

interface WeatherWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  displayName: string;
  population?: number;
}

export default function WeatherWidget({ onExpand, isExpanded, onClose }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('New York');
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [useFahrenheit, setUseFahrenheit] = useState(() => {
    const saved = localStorage.getItem('weather-use-fahrenheit');
    return saved ? JSON.parse(saved) : false;
  });

  // Temperature conversion utilities
  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9/5) + 32);
  };

  const formatTemperature = (celsius: number): string => {
    if (useFahrenheit) {
      return `${celsiusToFahrenheit(celsius)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('clear') || lowerDesc.includes('sunny')) return '☀️';
    if (lowerDesc.includes('partly cloudy') || lowerDesc.includes('few clouds')) return '⛅';
    if (lowerDesc.includes('cloudy') || lowerDesc.includes('overcast')) return '☁️';
    if (lowerDesc.includes('rain') || lowerDesc.includes('shower')) return '🌧️';
    if (lowerDesc.includes('drizzle')) return '🌦️';
    if (lowerDesc.includes('thunderstorm') || lowerDesc.includes('storm')) return '⛈️';
    if (lowerDesc.includes('snow') || lowerDesc.includes('blizzard')) return '❄️';
    if (lowerDesc.includes('mist') || lowerDesc.includes('fog')) return '🌫️';
    if (lowerDesc.includes('hail')) return '🌨️';
    
    return '🌤️'; // Default
  };

  const parseWeatherData = (data: any): WeatherData => {
    const current = data.current_condition[0];
    const nearestArea = data.nearest_area[0];
    
    return {
      location: nearestArea.areaName[0].value,
      region: nearestArea.region[0].value,
      country: nearestArea.country[0].value,
      temperature: parseInt(current.temp_C),
      condition: current.weatherDesc[0].value,
      description: current.weatherDesc[0].value,
      humidity: parseInt(current.humidity),
      windSpeed: parseInt(current.windspeedKmph),
      pressure: parseInt(current.pressure),
      feelsLike: parseInt(current.FeelsLikeC),
      visibility: parseInt(current.visibility),
      windDirection: current.winddir16Point,
      uvIndex: parseInt(current.uvIndex || '0'),
      precipMM: parseFloat(current.precipMM || '0'),
      icon: getWeatherIcon(current.weatherDesc[0].value)
    };
  };

  const parseForecastData = (data: any): ForecastDay[] => {
    return data.weather.slice(0, 5).map((day: any, index: number) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      
      return {
        date: day.date,
        dayName: index === 0 ? 'Today' : 
                index === 1 ? 'Tomorrow' : 
                date.toLocaleDateString('en-US', { weekday: 'short' }),
        icon: getWeatherIcon(day.hourly[0].weatherDesc[0].value),
        tempMax: parseInt(day.maxtempC),
        tempMin: parseInt(day.mintempC),
        condition: day.hourly[0].weatherDesc[0].value,
        precipMM: parseFloat(day.hourly[0].precipMM || '0')
      };
    });
  };

  // Comprehensive city database - major cities worldwide for autocomplete
  const getCityDatabase = (): string[] => {
    return [
      // United States - Major cities
      'New York, NY, USA', 'Los Angeles, CA, USA', 'Chicago, IL, USA', 'Houston, TX, USA',
      'Phoenix, AZ, USA', 'Philadelphia, PA, USA', 'San Antonio, TX, USA', 'San Diego, CA, USA',
      'Dallas, TX, USA', 'San Jose, CA, USA', 'Austin, TX, USA', 'Jacksonville, FL, USA',
      'Fort Worth, TX, USA', 'Columbus, OH, USA', 'Indianapolis, IN, USA', 'Charlotte, NC, USA',
      'San Francisco, CA, USA', 'Seattle, WA, USA', 'Denver, CO, USA', 'Washington, DC, USA',
      'Boston, MA, USA', 'El Paso, TX, USA', 'Detroit, MI, USA', 'Nashville, TN, USA',
      'Portland, OR, USA', 'Memphis, TN, USA', 'Oklahoma City, OK, USA', 'Las Vegas, NV, USA',
      'Louisville, KY, USA', 'Baltimore, MD, USA', 'Milwaukee, WI, USA', 'Albuquerque, NM, USA',
      'Tucson, AZ, USA', 'Fresno, CA, USA', 'Sacramento, CA, USA', 'Mesa, AZ, USA',
      'Kansas City, MO, USA', 'Atlanta, GA, USA', 'Miami, FL, USA', 'Colorado Springs, CO, USA',
      'Omaha, NE, USA', 'Raleigh, NC, USA', 'Long Beach, CA, USA', 'Virginia Beach, VA, USA',
      'Minneapolis, MN, USA', 'Tampa, FL, USA', 'Oakland, CA, USA', 'New Orleans, LA, USA',
      'Arlington, TX, USA', 'Cleveland, OH, USA', 'Honolulu, HI, USA', 'Orlando, FL, USA',

      // United Kingdom
      'London, England, UK', 'Birmingham, England, UK', 'Manchester, England, UK', 'Glasgow, Scotland, UK',
      'Liverpool, England, UK', 'Leeds, England, UK', 'Sheffield, England, UK', 'Edinburgh, Scotland, UK',
      'Bristol, England, UK', 'Cardiff, Wales, UK', 'Leicester, England, UK', 'Coventry, England, UK',
      'Bradford, England, UK', 'Belfast, Northern Ireland, UK', 'Nottingham, England, UK', 'Hull, England, UK',
      'Newcastle, England, UK', 'Stoke-on-Trent, England, UK', 'Southampton, England, UK', 'Derby, England, UK',

      // Canada
      'Toronto, ON, Canada', 'Montreal, QC, Canada', 'Vancouver, BC, Canada', 'Calgary, AB, Canada',
      'Edmonton, AB, Canada', 'Ottawa, ON, Canada', 'Winnipeg, MB, Canada', 'Quebec City, QC, Canada',
      'Hamilton, ON, Canada', 'Kitchener, ON, Canada', 'London, ON, Canada', 'Victoria, BC, Canada',
      'Halifax, NS, Canada', 'Oshawa, ON, Canada', 'Windsor, ON, Canada', 'Saskatoon, SK, Canada',

      // Australia
      'Sydney, NSW, Australia', 'Melbourne, VIC, Australia', 'Brisbane, QLD, Australia', 'Perth, WA, Australia',
      'Adelaide, SA, Australia', 'Gold Coast, QLD, Australia', 'Newcastle, NSW, Australia', 'Canberra, ACT, Australia',
      'Sunshine Coast, QLD, Australia', 'Wollongong, NSW, Australia', 'Hobart, TAS, Australia', 'Geelong, VIC, Australia',
      'Townsville, QLD, Australia', 'Cairns, QLD, Australia', 'Darwin, NT, Australia', 'Toowoomba, QLD, Australia',

      // Europe - Major cities
      'Paris, Île-de-France, France', 'Berlin, Berlin, Germany', 'Madrid, Madrid, Spain', 'Rome, Lazio, Italy',
      'Amsterdam, North Holland, Netherlands', 'Vienna, Vienna, Austria', 'Prague, Prague, Czech Republic',
      'Budapest, Budapest, Hungary', 'Warsaw, Mazovia, Poland', 'Stockholm, Stockholm, Sweden',
      'Copenhagen, Capital Region, Denmark', 'Oslo, Oslo, Norway', 'Helsinki, Uusimaa, Finland',
      'Brussels, Brussels, Belgium', 'Zurich, Zurich, Switzerland', 'Dublin, Leinster, Ireland',
      'Lisbon, Lisbon, Portugal', 'Athens, Attica, Greece', 'Barcelona, Catalonia, Spain',
      'Munich, Bavaria, Germany', 'Hamburg, Hamburg, Germany', 'Milan, Lombardy, Italy',
      'Naples, Campania, Italy', 'Lyon, Auvergne-Rhône-Alpes, France', 'Marseille, Provence-Alpes-Côte d\'Azur, France',
      'Rotterdam, South Holland, Netherlands', 'Valencia, Valencia, Spain', 'Seville, Andalusia, Spain',
      'Frankfurt, Hesse, Germany', 'Cologne, North Rhine-Westphalia, Germany', 'Turin, Piedmont, Italy',

      // Asia - Major cities
      'Tokyo, Tokyo, Japan', 'Shanghai, Shanghai, China', 'Beijing, Beijing, China', 'Mumbai, Maharashtra, India',
      'Delhi, Delhi, India', 'Guangzhou, Guangdong, China', 'Shenzhen, Guangdong, China', 'Seoul, Seoul, South Korea',
      'Jakarta, Jakarta, Indonesia', 'Manila, Metro Manila, Philippines', 'Bangkok, Bangkok, Thailand',
      'Singapore, Singapore, Singapore', 'Hong Kong, Hong Kong, Hong Kong', 'Kuala Lumpur, Kuala Lumpur, Malaysia',
      'Taipei, Taipei, Taiwan', 'Ho Chi Minh City, Ho Chi Minh, Vietnam', 'Osaka, Osaka, Japan',
      'Bangalore, Karnataka, India', 'Hyderabad, Telangana, India', 'Chennai, Tamil Nadu, India',
      'Kolkata, West Bengal, India', 'Pune, Maharashtra, India', 'Ahmedabad, Gujarat, India',
      'Surat, Gujarat, India', 'Jaipur, Rajasthan, India', 'Lucknow, Uttar Pradesh, India',
      'Kanpur, Uttar Pradesh, India', 'Nagpur, Maharashtra, India', 'Indore, Madhya Pradesh, India',

      // Middle East
      'Dubai, Dubai, UAE', 'Riyadh, Riyadh, Saudi Arabia', 'Tehran, Tehran, Iran', 'Baghdad, Baghdad, Iraq',
      'Kuwait City, Kuwait, Kuwait', 'Doha, Doha, Qatar', 'Abu Dhabi, Abu Dhabi, UAE', 'Manama, Manama, Bahrain',
      'Muscat, Muscat, Oman', 'Amman, Amman, Jordan', 'Beirut, Beirut, Lebanon', 'Damascus, Damascus, Syria',

      // Africa
      'Cairo, Cairo, Egypt', 'Lagos, Lagos, Nigeria', 'Johannesburg, Gauteng, South Africa',
      'Cape Town, Western Cape, South Africa', 'Casablanca, Casablanca-Settat, Morocco',
      'Alexandria, Alexandria, Egypt', 'Abuja, FCT, Nigeria', 'Accra, Greater Accra, Ghana',
      'Addis Ababa, Addis Ababa, Ethiopia', 'Nairobi, Nairobi, Kenya', 'Dar es Salaam, Dar es Salaam, Tanzania',
      'Kinshasa, Kinshasa, Democratic Republic of Congo', 'Luanda, Luanda, Angola',

      // South America
      'São Paulo, São Paulo, Brazil', 'Rio de Janeiro, Rio de Janeiro, Brazil', 'Buenos Aires, Buenos Aires, Argentina',
      'Lima, Lima, Peru', 'Bogotá, Bogotá, Colombia', 'Santiago, Santiago, Chile',
      'Caracas, Capital District, Venezuela', 'Brasília, Federal District, Brazil', 'Salvador, Bahia, Brazil',
      'Fortaleza, Ceará, Brazil', 'Belo Horizonte, Minas Gerais, Brazil', 'Manaus, Amazonas, Brazil',
      'Curitiba, Paraná, Brazil', 'Recife, Pernambuco, Brazil', 'Porto Alegre, Rio Grande do Sul, Brazil',
      'Córdoba, Córdoba, Argentina', 'Rosario, Santa Fe, Argentina', 'Medellín, Antioquia, Colombia',
      'Cali, Valle del Cauca, Colombia', 'Quito, Pichincha, Ecuador', 'Guayaquil, Guayas, Ecuador',
      'La Paz, La Paz, Bolivia', 'Santa Cruz, Santa Cruz, Bolivia', 'Montevideo, Montevideo, Uruguay'
    ];
  };

  // Fetch city suggestions using local comprehensive database
  const fetchCitySuggestions = useCallback(async (query: string): Promise<CityResult[]> => {
    if (query.length < 2) return [];

    setSearchLoading(true);
    
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const cityDatabase = getCityDatabase();
      const searchLower = query.toLowerCase();
      
      // Smart filtering with priority ranking
      const filtered = cityDatabase
        .filter(city => city.toLowerCase().includes(searchLower))
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          
          // Extract city names for more precise matching
          const aCityName = a.split(',')[0].toLowerCase();
          const bCityName = b.split(',')[0].toLowerCase();
          
          // Priority 1: Exact city name match
          if (aCityName === searchLower) return -1;
          if (bCityName === searchLower) return 1;
          
          // Priority 2: City name starts with search term
          if (aCityName.startsWith(searchLower) && !bCityName.startsWith(searchLower)) return -1;
          if (bCityName.startsWith(searchLower) && !aCityName.startsWith(searchLower)) return 1;
          
          // Priority 3: Full string starts with search term
          if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
          if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;
          
          // Priority 4: Alphabetical order within same priority
          return a.localeCompare(b);
        })
        .slice(0, 8); // Limit to 8 suggestions for UI clarity

      const cities: CityResult[] = filtered.map(city => {
        const parts = city.split(',').map(part => part.trim());
        return {
          name: parts[0],
          country: parts[parts.length - 1],
          state: parts.length > 2 ? parts[1] : undefined,
          lat: 0, // Coordinates not needed for weather API
          lon: 0,
          displayName: city,
          population: 0 // Population data not available in static database
        };
      });

      return cities;
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const fetchWeatherData = async (location: string) => {
    setLoading(true);
    setError(null);

    try {
      // Using wttr.in JSON API - completely free, no API key required
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'FlexDesk-Weather-Widget'
        }
      });

      const weatherData = parseWeatherData(response.data);
      const forecastData = parseForecastData(response.data);
      
      setWeather(weatherData);
      setForecast(forecastData);
      setSelectedLocation(location);
    } catch (err) {
      console.error('Weather API error:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await fetchWeatherData(searchQuery.trim());
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Debounced city search function for smooth UX
  const debouncedCitySearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (query.length >= 2) {
            const cities = await fetchCitySuggestions(query);
            setSuggestions(cities);
            setShowSuggestions(cities.length > 0);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }, 300); // 300ms delay for optimal UX
      };
    })(),
    [fetchCitySuggestions]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.length >= 2) {
      debouncedCitySearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const selectSuggestion = async (city: CityResult) => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    await fetchWeatherData(city.displayName);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

  const handleRefresh = async () => {
    await fetchWeatherData(selectedLocation);
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="highlight">{text.slice(index, index + searchTerm.length)}</span>
        {text.slice(index + searchTerm.length)}
      </>
    );
  };

  useEffect(() => {
    // Load default location on mount
    fetchWeatherData(selectedLocation);
  }, []);

  useEffect(() => {
    // Save temperature unit preference
    localStorage.setItem('weather-use-fahrenheit', JSON.stringify(useFahrenheit));
  }, [useFahrenheit]);

  const widgetContent = (
    <div className="weather-widget-content">
      {loading ? (
        <div className="weather-loading">Loading...</div>
      ) : error ? (
        <div className="weather-error">Error</div>
      ) : weather ? (
        <>
          <div className="weather-icon">{weather.icon}</div>
          <div className="weather-temp">{formatTemperature(weather.temperature)}</div>
          <div className="weather-condition">{weather.condition}</div>
        </>
      ) : null}
    </div>
  );  const expandedContent = weather && !loading && !error ? (
    <div className="weather-expanded">
      {/* Compact Header with Location and Controls */}
      <div className="weather-header">
        <div className="location-info">
          <h2 className="location-name">{weather.location}</h2>
          <span className="location-region">{weather.region}, {weather.country}</span>
        </div>
        <div className="header-controls">
          <button onClick={handleRefresh} className="control-btn" title="Refresh">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"></polyline>
              <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10"></path>
            </svg>
          </button>
          <button 
            onClick={() => setUseFahrenheit(!useFahrenheit)} 
            className="control-btn temp-unit"
            title={`Switch to ${useFahrenheit ? 'Celsius' : 'Fahrenheit'}`}
          >
            {useFahrenheit ? '°F' : '°C'}
          </button>
        </div>
      </div>

      {/* Primary Weather Display - Most Important Info */}
      <div className="weather-hero">
        <div className="hero-main">
          <div className="weather-icon-hero">{weather.icon}</div>
          <div className="temperature-hero">
            <span className="temp-main">{formatTemperature(weather.temperature)}</span>
            <span className="condition-main">{weather.condition}</span>
          </div>
        </div>
        <div className="feels-like-hero">
          Feels like {formatTemperature(weather.feelsLike)}
        </div>
      </div>

      {/* Essential Weather Stats - Two Columns */}
      <div className="weather-essentials">
        <div className="essential-stat">
          <span className="stat-icon">💧</span>
          <span className="stat-value">{weather.humidity}%</span>
          <span className="stat-label">Humidity</span>
        </div>
        <div className="essential-stat">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{weather.windSpeed} km/h</span>
          <span className="stat-label">Wind</span>
        </div>
      </div>

      {/* Search Section - Compact */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder="Search city..."
            className="search-input"
          />
          {searchLoading && (
            <div className="search-loading">
              <div className="search-spinner"></div>
            </div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((city, index) => (
                <div
                  key={`${city.name}-${city.country}-${index}`}
                  className={`suggestion ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(city)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {highlightMatch(city.displayName, searchQuery)}
                </div>
              ))}
            </div>
          )}
        </div>
        {searchQuery.trim() && (
          <button onClick={handleSearch} className="search-submit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        )}
      </div>

      {/* 5-Day Forecast - Horizontal Scroll */}
      <div className="forecast-container">
        <h3 className="forecast-title">5-Day Forecast</h3>
        <div className="forecast-scroll">
          {forecast.map((day) => (
            <div key={day.date} className="forecast-day">
              <div className="day-name">{day.dayName}</div>
              <div className="day-icon">{day.icon}</div>
              <div className="day-temps">
                <span className="temp-high">{formatTemperature(day.tempMax)}</span>
                <span className="temp-low">{formatTemperature(day.tempMin)}</span>
              </div>
              {day.precipMM > 0 && (
                <div className="day-rain">{day.precipMM}mm</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats - Collapsible/Secondary */}
      <details className="weather-details">
        <summary className="details-toggle">More Details</summary>
        <div className="additional-stats">
          <div className="stat-row">
            <span className="stat-name">UV Index</span>
            <span className="stat-val">{weather.uvIndex}</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Visibility</span>
            <span className="stat-val">{weather.visibility} km</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Pressure</span>
            <span className="stat-val">{weather.pressure} hPa</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Wind Direction</span>
            <span className="stat-val">{weather.windDirection}</span>
          </div>
          {weather.precipMM > 0 && (
            <div className="stat-row">
              <span className="stat-name">Precipitation</span>
              <span className="stat-val">{weather.precipMM} mm</span>
            </div>
          )}
        </div>
      </details>
    </div>
  ) : loading ? (
    <div className="weather-loading-expanded">
      <div className="loading-spinner"></div>
      <p>Fetching weather data...</p>
    </div>
  ) : error ? (
    <div className="weather-error-expanded">
      <p>{error}</p>
      <button onClick={handleRefresh} className="retry-btn">
        Try Again
      </button>
    </div>
  ) : null;

  return (
    <BaseWidget
      title="Weather"
      icon="☁️"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="weather-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
