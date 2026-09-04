// Airports the radar can center on. lat/lon are the field reference points.
export const AIRPORTS = [
  // India
  { icao: "VOMM", city: "Chennai", name: "Chennai Intl", lat: 12.994, lon: 80.180 },
  { icao: "VABB", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj", lat: 19.089, lon: 72.868 },
  { icao: "VIDP", city: "Delhi", name: "Indira Gandhi Intl", lat: 28.556, lon: 77.100 },
  { icao: "VOBL", city: "Bengaluru", name: "Kempegowda Intl", lat: 13.199, lon: 77.710 },
  { icao: "VOHY", city: "Hyderabad", name: "Rajiv Gandhi Intl", lat: 17.240, lon: 78.429 },
  { icao: "VECC", city: "Kolkata", name: "Netaji Subhas Chandra Bose", lat: 22.655, lon: 88.447 },
  { icao: "VOCI", city: "Kochi", name: "Cochin Intl", lat: 10.152, lon: 76.401 },
  { icao: "VOTV", city: "Trivandrum", name: "Trivandrum Intl", lat: 8.482, lon: 76.920 },
  { icao: "VAAH", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel", lat: 23.077, lon: 72.635 },
  { icao: "VOGO", city: "Goa", name: "Dabolim / Mopa", lat: 15.381, lon: 73.831 },
  // Global hubs
  { icao: "OMDB", city: "Dubai", name: "Dubai Intl", lat: 25.253, lon: 55.365 },
  { icao: "WSSS", city: "Singapore", name: "Changi", lat: 1.359, lon: 103.989 },
  { icao: "EGLL", city: "London", name: "Heathrow", lat: 51.470, lon: -0.454 },
  { icao: "KJFK", city: "New York", name: "John F. Kennedy Intl", lat: 40.641, lon: -73.779 },
  { icao: "OTHH", city: "Doha", name: "Hamad Intl", lat: 25.273, lon: 51.608 },
  { icao: "VHHH", city: "Hong Kong", name: "Hong Kong Intl", lat: 22.308, lon: 113.918 },
  { icao: "RJTT", city: "Tokyo", name: "Haneda", lat: 35.552, lon: 139.780 },
  { icao: "KLAX", city: "Los Angeles", name: "Los Angeles Intl", lat: 33.942, lon: -118.408 },
];

export const AIRPORT_BY_ICAO = Object.fromEntries(AIRPORTS.map((a) => [a.icao, a]));
