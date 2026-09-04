// Aviation facts + glossary terms, carried over from the original ARGUS portal.

export const FACTS = [
  "The Boeing 747’s wingspan is longer than the Wright brothers’ entire first flight of 1903.",
  "Airliners cruise around 35,000 ft partly because thinner air means less drag and better fuel economy.",
  "The tiny hole in an aircraft window is a breather hole that manages cabin pressure across the panes.",
  "A jet engine’s fan can ingest well over a tonne of air every second at take-off thrust.",
  "Contrails are just condensed water vapour freezing into ice crystals in the cold air behind engines.",
  "The black box is actually bright orange, so it’s easier to spot in wreckage.",
  "Pilots and co-pilots are often served different meals to reduce the chance of both getting food poisoning.",
  "Runway numbers are the runway’s magnetic heading divided by ten — Runway 09 points roughly east.",
  "The coldest air an airliner flies through can be below −60°C at cruising altitude.",
  "Winglets on the wingtips cut drag from wingtip vortices and can save airlines millions in fuel.",
  "A commercial jet’s tyres are inflated to around 200 psi — roughly six times a car tyre.",
  "The average cruising speed of a modern airliner is about 900 km/h, near Mach 0.85.",
  "Lightning strikes airliners fairly often; the metal skin channels the charge safely around the cabin.",
  "The phonetic alphabet — Alpha, Bravo, Charlie — keeps letters from being misheard on the radio.",
  "Concorde flew so fast it could arrive in New York at an earlier local time than it left London.",
];

// On this day in aviation — keyed by MM-DD → [year, event].
export const ON_THIS_DAY = {
  "01-01": [1914, "The world's first scheduled airline flight took off — the St. Petersburg–Tampa Airboat Line in Florida."],
  "01-09": [2007, "Aviation and tech converged as the smartphone era began — reshaping cockpit EFBs and flight apps within a decade."],
  "01-15": [2009, "US Airways Flight 1549 ditched safely on the Hudson River after a bird strike — the “Miracle on the Hudson.”"],
  "01-27": [1967, "The Apollo 1 crew was lost in a launch-pad fire, driving sweeping spacecraft safety reforms."],
  "02-06": [1996, "The Boeing 777 entered commercial service with United Airlines."],
  "02-09": [1969, "The Boeing 747 — the first “Jumbo Jet” — made its maiden flight."],
  "02-20": [1962, "John Glenn became the first American to orbit the Earth aboard Friendship 7."],
  "03-02": [1969, "Concorde made its maiden flight from Toulouse, France."],
  "03-08": [2014, "Malaysia Airlines Flight 370 vanished — spurring global flight-tracking mandates."],
  "03-27": [1977, "The Tenerife disaster — the deadliest accident in aviation history — reshaped runway and radio procedures worldwide."],
  "04-12": [1961, "Yuri Gagarin became the first human in space aboard Vostok 1."],
  "04-28": [1988, "Aloha Airlines Flight 243 survived explosive decompression, transforming aircraft ageing and inspection rules."],
  "05-15": [1930, "Ellen Church became the world's first flight attendant, aboard a Boeing Air Transport flight."],
  "05-20": [1927, "Charles Lindbergh began the first solo nonstop transatlantic flight aboard the Spirit of St. Louis."],
  "05-21": [1932, "Amelia Earhart became the first woman to fly solo across the Atlantic."],
  "06-18": [1928, "Amelia Earhart became the first woman to cross the Atlantic by air."],
  "06-23": [1931, "Wiley Post and Harold Gatty began their record round-the-world flight in the Winnie Mae."],
  "07-02": [1937, "Amelia Earhart disappeared over the Pacific during her attempt to circumnavigate the globe."],
  "07-15": [1954, "The Boeing 367-80 — prototype of the 707 — first flew, launching the American jet age."],
  "07-20": [1969, "Apollo 11's Eagle landed on the Moon; Neil Armstrong took humanity's first steps on another world."],
  "07-25": [2000, "Air France Concorde Flight 4590 crashed near Paris, beginning the end of Concorde service."],
  "07-27": [1949, "The de Havilland Comet, the world's first commercial jet airliner, made its maiden flight."],
  "07-28": [1935, "The Boeing B-17 Flying Fortress prototype made its first flight."],
  "07-29": [1958, "NASA was established by the U.S. Congress, opening the space age of aviation research."],
  "07-30": [1971, "Apollo 15 landed on the Moon, carrying the first Lunar Roving Vehicle."],
  "08-01": [1919, "KLM, the world's oldest airline still operating under its original name, was founded."],
  "08-19": [1871, "Orville Wright, co-inventor of the first powered aircraft, was born."],
  "08-25": [1919, "The world's first daily international scheduled air service began, London to Paris."],
  "09-08": [2004, "NASA's Genesis capsule returned — part of the era's push in aerospace sample-return engineering."],
  "09-15": [1928, "The de Havilland Gipsy engine era advanced light aviation and pilot training worldwide."],
  "10-04": [1957, "Sputnik 1, the first artificial satellite, was launched — opening the space race."],
  "10-14": [1947, "Chuck Yeager broke the sound barrier in the Bell X-1, reaching Mach 1.06."],
  "10-24": [2003, "Concorde made its final commercial flight, retiring supersonic passenger travel."],
  "11-10": [1935, "The Hawker Hurricane first flew — a fighter that would prove decisive in the Battle of Britain."],
  "11-13": [1907, "Paul Cornú achieved the first free flight of a rotary-wing aircraft — an early helicopter."],
  "12-14": [1903, "The Wright brothers made their first flight attempt at Kitty Hawk, three days before success."],
  "12-17": [1903, "The Wright brothers achieved the first powered, sustained, controlled aeroplane flight at Kitty Hawk."],
  "12-23": [1986, "Voyager completed the first non-stop, non-refuelled flight around the world."],
  "12-31": [1968, "The Tupolev Tu-144, the first supersonic transport to fly, made its maiden flight — ahead of Concorde."],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Today's aviation moment, or the most recent one on/before today.
export function onThisDay(date = new Date()) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const keys = Object.keys(ON_THIS_DAY).sort();
  let key = keys[keys.length - 1]; // wrap: before the first entry → last of year
  for (const k of keys) { if (k <= mmdd) key = k; else break; }
  const [mo, da] = key.split("-");
  const [year, text] = ON_THIS_DAY[key];
  return { key, year, text, exact: key === mmdd, label: `${Number(da)} ${MONTHS[Number(mo) - 1]}` };
}

export const TERMS = [
  ["METAR", "Meteorological Aerodrome Report", "A routine coded weather observation issued for an airport, usually every half hour."],
  ["TAF", "Terminal Aerodrome Forecast", "A coded forecast of expected weather at an airport over the next 24–30 hours."],
  ["QNH", "Altimeter setting", "The pressure setting that makes the altimeter read height above mean sea level."],
  ["ILS", "Instrument Landing System", "Radio beams (localiser + glideslope) that guide an aircraft down to the runway in poor visibility."],
  ["V1", "Decision speed", "The take-off speed past which the pilot must continue the take-off rather than abort."],
  ["TCAS", "Traffic Collision Avoidance System", "Onboard system that warns of nearby traffic and issues climb/descend commands to avoid collisions."],
  ["SID", "Standard Instrument Departure", "A published route flown just after take-off to get aircraft safely from the runway onto the airway."],
  ["STAR", "Standard Terminal Arrival Route", "A published route that funnels arriving traffic from the airway toward the approach."],
  ["ATIS", "Automatic Terminal Information Service", "A looped broadcast of an airport’s current weather, runway and NOTAM information."],
  ["Mach", "Mach number", "Aircraft speed as a fraction of the local speed of sound; Mach 1 is the sound barrier."],
  ["NOTAM", "Notice to Air Missions", "A time-critical notice of hazards or changes — closed runways, unserviceable aids, airspace restrictions."],
  ["AoA", "Angle of Attack", "The angle between the wing chord and the oncoming air; exceed the critical AoA and the wing stalls."],
  ["QFE", "Field pressure setting", "An altimeter setting that reads zero at the airfield, so it shows height above the field."],
  ["ETOPS", "Extended-range Twin OPS", "Rules letting twin-engine jets fly routes far from a diversion airport, e.g. across oceans."],
  ["FL", "Flight Level", "Altitude in hundreds of feet on the standard 1013 hPa setting — FL350 is ~35,000 ft."],
  ["MTOW", "Max Take-Off Weight", "The heaviest an aircraft is certified to be at the start of its take-off roll."],
  ["VOR", "VHF Omnidirectional Range", "A ground beacon giving aircraft a bearing to or from the station for navigation."],
  ["Squawk", "Transponder code", "The four-digit code ATC assigns so an aircraft shows up tagged on radar."],
];
