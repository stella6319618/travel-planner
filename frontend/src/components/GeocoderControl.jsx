import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";

function GeocoderControl({ value, onChange, onLocationSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=tw,jp&limit=5`
      );
      const results = await response.json();
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("地址搜尋錯誤:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const debouncedSearch = debounce(searchAddress, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (suggestion) => {
    if (!suggestion || !suggestion.lat || !suggestion.lon) {
      console.error("無效的地址數據:", suggestion);
      return;
    }

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    if (isNaN(lat) || isNaN(lon)) {
      console.error("無效的經緯度:", suggestion);
      return;
    }

    const displayName = suggestion.display_name || suggestion.name || value;
    onChange(displayName);
    onLocationSelect({
      name: displayName,
      center: [lat, lon],
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          debouncedSearch(e.target.value);
        }}
        onFocus={() => {
          if (value) {
            debouncedSearch(value);
          }
        }}
        placeholder="搜尋地址..."
        className="w-full p-2 border rounded"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[1001] w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name || suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GeocoderControl;
