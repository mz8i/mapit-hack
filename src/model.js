// ======================================== MODEL

const arrivalTime = new Date();

const currentPosition = {
  lat: 52,
  lng: 12,
  heading: 230, // 0 - 360
}

const position = {
  lat: 52,
  lng: 12,
}

const poi = {
  position,
  detourTime: 3434234, // detour in ms (there and back to target)
  freeTime: 433546546456, // free time in ms
  category: 'restaurant', // denotes icons
  name: 'Mamma Mia',
  rating: 4.3,
}

const route = [
  position,
  position,
  // ...
]

// ======================================== MAP API

setBigPois([poi]) // clears old, sets new
setSmallPois([poi]) // clears old, sets new
setCurrentLocation(currentPosition) // clears old, sets new
setFinalDestination(position) // clears old, sets new
setRoute(route)
  // if null clears old and zooms out
  // if not null clears old, sets new, zooms in

// ======================================== ROUTING API

setFinalDestination(position) // sets final destination
setArrivalTime(arrivalTime) // sets arrival time, search for big poi, rerenders map

setCurrentDestination(position) // sets route, enables small poi search, rerenders map
clearCurrentDestination(position) // clears route, disables small poi search, rerenders map

onCurrentLocationChange(position) // searches for new small poi if enabled, rerenders map
  // if moved enough
    // rerender route (from current location to current destination)
    // if small poi search enabled
      // search for pois - update pois on map
    // if current destination reached
      // display modal with button
      // setRoute(null)

onCurrentTimeChange(time) // calculates new free time for pois, rerenders map

