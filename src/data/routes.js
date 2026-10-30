/**
 * THE FOGGED CITY — CHAPTER 01: DELHI
 * Pre-computed expedition routes between landmark locations.
 *
 * Coordinates are [longitude, latitude] (GeoJSON / MapLibre standard).
 *
 * DESIGN INTENT:
 *   These are stylized progression paths — not exact road-routing API calls.
 *   Each path follows geographically plausible corridors between real Delhi
 *   landmarks (Janpath, Kartavya Path, Ring Road, etc.) using hand-crafted
 *   waypoints that mirror the actual street grid, giving a realistic feel
 *   without requiring a live routing API or API key.
 *
 *   If you later want real road routing, replace the `waypoints` arrays with
 *   OSRM / Valhalla responses converted to [lng, lat] pairs.
 */

/**
 * Returns an array of [lng, lat] coordinate pairs forming a smooth path
 * between two level IDs. Returns null if no route is defined.
 *
 * @param {string} fromId  - Level ID of origin
 * @param {string} toId    - Level ID of destination
 * @returns {[number,number][]|null}
 */
export function getRoute(fromId, toId) {
  const key = `${fromId}→${toId}`;
  const route = ROUTES[key];
  return route ? route.waypoints : null;
}

/**
 * Interpolate a position along a polyline at fraction t ∈ [0, 1].
 * Returns [lng, lat].
 *
 * @param {[number,number][]} waypoints
 * @param {number} t  0 = start, 1 = end
 * @returns {[number, number]}
 */
export function samplePath(waypoints, t) {
  if (!waypoints || waypoints.length === 0) return [0, 0];
  if (waypoints.length === 1) return waypoints[0];
  if (t <= 0) return waypoints[0];
  if (t >= 1) return waypoints[waypoints.length - 1];

  // Compute cumulative segment lengths
  const dists = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i][0] - waypoints[i - 1][0];
    const dy = waypoints[i][1] - waypoints[i - 1][1];
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const total = dists[dists.length - 1];
  const target = t * total;

  // Find the segment containing `target`
  for (let i = 1; i < waypoints.length; i++) {
    if (dists[i] >= target) {
      const segFrac = (target - dists[i - 1]) / (dists[i] - dists[i - 1]);
      const a = waypoints[i - 1];
      const b = waypoints[i];
      return [
        a[0] + (b[0] - a[0]) * segFrac,
        a[1] + (b[1] - a[1]) * segFrac,
      ];
    }
  }
  return waypoints[waypoints.length - 1];
}

/**
 * Cubic ease-in-out for smooth character acceleration / deceleration.
 * @param {number} t  raw 0→1
 * @returns {number}  eased 0→1
 */
export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Route definitions ────────────────────────────────────────────────────
//
// Each route is named "fromId→toId".
// Waypoints follow real Delhi corridors:
//
//  L1 Jantar Mantar   [77.2167, 28.6271]  Sansad Marg / Parliament St
//  L2 India Gate      [77.2295, 28.6129]  Kartavya Path / Rajpath
//  L3 Connaught Place [77.2195, 28.6328]  Connaught Circus
//  L4 Old Delhi       [77.2410, 28.6562]  Chandni Chowk / Netaji SC Marg
//  L5 Qutub Minar     [77.1855, 28.5244]  Aurobindo Marg / Mehrauli
//
// Each path has 8-12 waypoints so the animation has enough intermediate
// positions to look smooth and geographically grounded.

const ROUTES = {

  // ── L1 → L2: Jantar Mantar → India Gate ──────────────────────────────
  // South along Janpath / Maulana Azad Rd, then east onto Rajpath
  'jantar-mantar→india-gate': {
    color: '#f59e0b',  // amber — matches Jantar Mantar accentColor
    waypoints: [
      [77.2167, 28.6271],  // Jantar Mantar
      [77.2175, 28.6252],  // South on Sansad Marg
      [77.2185, 28.6228],  // Tolstoy Marg junction
      [77.2200, 28.6210],  // Kasturba Gandhi Marg
      [77.2215, 28.6195],  // Copernicus Marg junction
      [77.2230, 28.6178],  // Maulana Azad Marg entry
      [77.2248, 28.6162],  // Rajpath / Kartavya Path median
      [77.2268, 28.6148],  // Approach to hexagonal lawns
      [77.2285, 28.6135],  // Water channel east
      [77.2295, 28.6129],  // India Gate
    ]
  },

  // ── L2 → L3: India Gate → Connaught Place ────────────────────────────
  // West on Rajpath, then north along Janpath to CP outer ring
  'india-gate→connaught-place': {
    color: '#38bdf8',  // sky blue — matches India Gate accentColor
    waypoints: [
      [77.2295, 28.6129],  // India Gate
      [77.2278, 28.6143],  // West back along Rajpath median
      [77.2258, 28.6156],  // Crossing Akbar Rd
      [77.2238, 28.6170],  // Turning north on Janpath
      [77.2222, 28.6192],  // Janpath mid-section
      [77.2210, 28.6215],  // Kasturba Gandhi Marg junction
      [77.2205, 28.6238],  // Janpath near Khadi Gramodyog Bhawan
      [77.2200, 28.6265],  // Approaching CP outer ring
      [77.2198, 28.6292],  // Connaught Place outer circle south entry
      [77.2195, 28.6328],  // Connaught Place centre
    ]
  },

  // ── L3 → L4: Connaught Place → Old Delhi / Chandni Chowk ─────────────
  // East on Kashmere Gate Rd, then north along Netaji SC Marg
  'connaught-place→old-delhi': {
    color: '#e2e8f0',  // silver-white — matches CP accentColor
    waypoints: [
      [77.2195, 28.6328],  // Connaught Place
      [77.2218, 28.6342],  // Patel Chowk turn
      [77.2248, 28.6358],  // Shyama Prasad Mukherjee Marg entry
      [77.2270, 28.6378],  // Hamilton Rd / Minto Rd
      [77.2295, 28.6400],  // Asaf Ali Rd junction
      [77.2318, 28.6422],  // Netaji Subhash Chandra Bose Marg
      [77.2340, 28.6448],  // Daryaganj approach
      [77.2358, 28.6480],  // Esplanade Rd junction
      [77.2382, 28.6518],  // Lal Kuan / Faiz Bazaar
      [77.2410, 28.6562],  // Chandni Chowk heart
    ]
  },

  // ── L4 → L5: Old Delhi → Qutub Minar ─────────────────────────────────
  // South-west along Ring Rd / Outer Ring Rd, through Mehrauli
  'old-delhi→qutub-minar': {
    color: '#f97316',  // orange — matches Old Delhi accentColor
    waypoints: [
      [77.2410, 28.6562],  // Old Delhi / Chandni Chowk
      [77.2365, 28.6498],  // Back south on Netaji SC Marg
      [77.2310, 28.6430],  // Asaf Ali Rd heading west
      [77.2258, 28.6360],  // Deen Dayal Upadhyaya Marg
      [77.2210, 28.6290],  // Connaught Place pass-through west
      [77.2168, 28.6220],  // Baba Kharak Singh Marg south
      [77.2128, 28.6148],  // Tolstoy Marg south
      [77.2088, 28.6060],  // Aurobindo Marg entry (north)
      [77.2042, 28.5940],  // Aurobindo Marg mid-section
      [77.1995, 28.5788],  // Sri Aurobindo flyover approach
      [77.1958, 28.5640],  // Lado Sarai / Mehrauli Road
      [77.1910, 28.5488],  // Mehrauli Archaeological Park
      [77.1878, 28.5365],  // Mehrauli village approach
      [77.1855, 28.5244],  // Qutub Minar
    ]
  },
};
