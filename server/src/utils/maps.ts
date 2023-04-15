// Converts numeric degrees to radians
export function toRad(Value: number) 
{
    return Value * Math.PI / 180;
}

export function calculateCoordinateDistance(lat1: number = 0, lon1: number = 0, lat2: number = 0, lon2: number = 0) 
{
  const R = 6371; // km
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c;
  return d*1000; // in meters
}

