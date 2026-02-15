'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Loader2, AlertCircle, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

interface QiblahData {
  direction: number; // Degrees from North
  distance: number; // Distance to Kaaba in km
  latitude: number;
  longitude: number;
  locationName?: string;
}

export default function QiblahPage() {
  const [qiblahData, setQiblahData] = useState<QiblahData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [compassSupported, setCompassSupported] = useState(false);

  // Kaaba coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  useEffect(() => {
    // Check if device orientation is supported
    if ('DeviceOrientationEvent' in window) {
      setCompassSupported(true);
    }
  }, []);

  // Calculate Qiblah direction using formula
  const calculateQiblah = (lat: number, lng: number): number => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

    const dLng = kaabaLngRad - lngRad;

    const y = Math.sin(dLng);
    const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(dLng);

    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    brng = (brng + 360) % 360;

    return brng;
  };

  // Calculate distance to Kaaba using Haversine formula
  const calculateDistance = (lat: number, lng: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
    const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((KAABA_LAT * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  };

  // Get user location and calculate Qiblah
  const findQiblah = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const direction = calculateQiblah(latitude, longitude);
        const distance = calculateDistance(latitude, longitude);

        // Try to get location name using reverse geocoding
        let locationName = 'Your Location';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          locationName = data.address?.city || data.address?.town || data.address?.state || 'Your Location';
        } catch (err) {
          console.log('Could not fetch location name:', err);
        }

        setQiblahData({
          direction,
          distance,
          latitude,
          longitude,
          locationName,
        });

        setLoading(false);
        toast.success('Qiblah direction found!');

        // Start listening to device orientation if supported
        if (compassSupported) {
          startCompass();
        }
      },
      (err) => {
        setLoading(false);
        let errorMessage = 'Unable to get your location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Start device orientation listener
  const startCompass = () => {
    if ('DeviceOrientationEvent' in window) {
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            }
          })
          .catch((err: Error) => {
            console.error('Permission denied:', err);
            toast.error('Compass permission denied');
          });
      } else {
        // Non-iOS devices
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    let heading = event.alpha || 0;
    // Handle webkit-specific compass heading (iOS Safari)
    if ((event as any).webkitCompassHeading) {
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha) {
      heading = 360 - event.alpha;
    }
    setDeviceHeading(heading);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const qiblahAngle = qiblahData ? qiblahData.direction - deviceHeading : 0;

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Compass className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Qiblah Compass</h1>
          <p className="text-muted-foreground">Find the direction to the Kaaba for prayer</p>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Holy Kaaba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mecca, Saudi Arabia</div>
            <p className="text-xs text-muted-foreground mt-1">
              {KAABA_LAT.toFixed(4)}° N, {KAABA_LNG.toFixed(4)}° E
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Location</CardTitle>
          </CardHeader>
          <CardContent>
            {qiblahData ? (
              <>
                <div className="text-2xl font-bold">{qiblahData.locationName}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {qiblahData.latitude.toFixed(4)}° N, {qiblahData.longitude.toFixed(4)}° E
                </p>
              </>
            ) : (
              <div className="text-lg text-muted-foreground">Not detected yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Compass Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Qiblah Direction</CardTitle>
          <CardDescription>
            Point your device north to see the accurate Qiblah direction
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {!qiblahData ? (
            <div className="text-center py-12 space-y-4">
              {error ? (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                  <p className="text-red-500 font-medium">{error}</p>
                  <Button onClick={findQiblah} disabled={loading}>
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Allow location access to find the Qiblah direction
                  </p>
                  <Button onClick={findQiblah} disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Find Qiblah
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Visual Compass */}
              <div className="relative w-72 h-72">
                {/* Compass Circle */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                  {/* Cardinal Directions */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-sm">N</div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-sm">E</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-sm">S</div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-sm">W</div>
                  
                  {/* Degree Markers */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-0.5 h-3 bg-gray-400"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-130px)`,
                      }}
                    />
                  ))}
                </div>

                {/* Qiblah Arrow */}
                <div
                  className="absolute inset-0 transition-transform duration-300"
                  style={{ transform: `rotate(${qiblahAngle}deg)` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Arrow Body */}
                      <div className="absolute w-2 h-24 bg-gradient-to-b from-green-500 to-green-600 rounded-full -translate-x-1/2 -translate-y-full" />
                      {/* Arrow Head */}
                      <div
                        className="absolute w-0 h-0 -translate-x-1/2"
                        style={{
                          borderLeft: '12px solid transparent',
                          borderRight: '12px solid transparent',
                          borderBottom: '20px solid #22c55e',
                          top: '-120px',
                          left: '1px',
                        }}
                      />
                      {/* Kaaba Icon */}
                      <div className="absolute -translate-x-1/2 -translate-y-full bg-green-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap" style={{ top: '-145px' }}>
                        🕋 KAABA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-green-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
              </div>

              {/* Direction Info */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Navigation className="h-4 w-4 mr-2" />
                    {qiblahData.direction.toFixed(1)}°
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {qiblahData.distance.toLocaleString()} km
                  </Badge>
                </div>
                
                {!compassSupported && (
                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Rotate your device to align with physical north for accurate direction
                  </p>
                )}
                
                <Button variant="outline" onClick={findQiblah}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Recalculate
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">1.</span>
            <p>Click "Find Qiblah" and allow location access when prompted.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">2.</span>
            <p>Hold your device flat (parallel to the ground) for best results.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">3.</span>
            <p>The green arrow points toward the Kaaba in Mecca.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">4.</span>
            <p>Rotate your body until the arrow points straight up (north alignment).</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600">5.</span>
            <p>Face the direction where the arrow is pointing - that's your Qiblah!</p>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-muted-foreground italic">
              "Turn your face toward the Sacred Mosque. Wherever you may be, turn your faces toward it." — Quran 2:144
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
