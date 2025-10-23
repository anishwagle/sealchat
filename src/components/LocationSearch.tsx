import { useState, useRef } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { debounce } from 'lodash';
import { IoLocationSharp } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface LocationSearchProps {
    value: string;
    onChange: (location: string) => void;
    className?: string;
    placeholder?: string;
}

interface LocationResult {
    display_name: string;
    place_id: number;
    address: {
        state_district?: string;
        municipality?: string;
        village?: string;
        district?: string;
        state?: string;
        country?: string;
    };
}

export default function LocationSearch({ value, onChange, className, placeholder }: LocationSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
    const [results, setResults] = useState<LocationResult[]>([]);
    const [loading, setLoading] = useState(false);

    // Create a memoized debounced search function
    const debouncedSearch = useRef(
        debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const query = encodeURIComponent(`${searchQuery.trim()}, Nepal`);
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&countrycodes=np&addressdetails=1&limit=10`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data: LocationResult[] = await response.json();
                
                // Filter results to only include Nepal locations
                const filteredResults = data.filter(result => 
                    result.address?.country === 'Nepal'
                );

                setResults(filteredResults);
            } catch (error) {
                console.error('Error fetching locations:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500)
    ).current;

    return (
        <Combobox
            value={selectedLocation}
            onChange={(location: LocationResult | null) => {
                if (location) {
                    setSelectedLocation(location);
                    onChange(location.display_name);
                }
            }}
        >
            <div className="relative">
                <div className="relative">
                    <ComboboxInput
                        className={className}
                        placeholder={placeholder}
                        displayValue={(location: LocationResult | null) => 
                            location ? location.display_name : value
                        }
                        onChange={(event) => {
                            setQuery(event.target.value);
                            debouncedSearch(event.target.value);
                        }}
                        autoComplete="off"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {loading ? (
                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 text-gray-400" />
                        ) : (
                            <IoLocationSharp className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                </div>

                <ComboboxOptions className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    {results.length === 0 && query !== '' && !loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No locations found in Nepal
                        </div>
                    ) : (
                        results.map((result) => (
                            <ComboboxOption
                                key={result.place_id}
                                value={result}
                                className={({ active }) =>
                                    `px-4 py-2 cursor-pointer ${
                                        active ? 'bg-gray-100' : 'bg-white'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <IoLocationSharp className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{result.display_name}</span>
                                </div>
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
}
