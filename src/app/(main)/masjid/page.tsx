'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Phone, 
  Clock, 
  Navigation,
  ExternalLink 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

interface Masjid {
  name: string;
  address: string;
  city: string;
  province: string;
  phone?: string;
  website?: string;
  prayerTimesAvailable: boolean;
  jummahTime?: string;
  features: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Sample South African Masjids Database
const masjidsDatabase: Masjid[] = [
  {
    name: 'Al-Ansaar Islamic Centre',
    address: '31 Glenhove Rd, Melville',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '011 726 0800',
    website: 'alansaar.org.za',
    prayerTimesAvailable: true,
    jummahTime: '12:45 PM',
    features: ['Jummah', 'Daily Prayers', 'Islamic School', 'Community Center'],
  },
  {
    name: 'Masjidul Quds',
    address: 'Queens Rd, Gatesville',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '021 638 7249',
    prayerTimesAvailable: true,
    jummahTime: '1:00 PM',
    features: ['Jummah', 'Daily Prayers', 'Quran Classes'],
  },
  {
    name: 'Nizamiye Masjid',
    address: '21 Nirvana Dr, Midrand',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '011 312 1642',
    website: 'nizamiye.org.za',
    prayerTimesAvailable: true,
    jummahTime: '1:15 PM',
    features: ['Jummah', 'Daily Prayers', 'Turkish Ottoman Architecture', 'Museum', 'Restaurant'],
  },
  {
    name: 'Grey Street Mosque',
    address: '104 Grey St',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    phone: '031 306 0026',
    prayerTimesAvailable: true,
    jummahTime: '12:30 PM',
    features: ['Jummah', 'Daily Prayers', 'Historical Site'],
  },
  {
    name: 'Nurul Islam Mosque',
    address: 'Rylands',
    city: 'Cape Town',
    province: 'Western Cape',
    prayerTimesAvailable: true,
    jummahTime: '1:00 PM',
    features: ['Jummah', 'Daily Prayers', 'Community Programs'],
  },
  {
    name: 'Masjid-ut-Taqwa',
    address: 'CNR Oxford & Turf Club, Milnerton',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '021 551 0213',
    prayerTimesAvailable: true,
    jummahTime: '1:00 PM',
    features: ['Jummah', 'Daily Prayers', 'Ladies Section', 'Youth Programs'],
  },
  {
    name: 'Lenasia Masjid',
    address: 'Nirvana Dr, Lenasia',
    city: 'Johannesburg',
    province: 'Gauteng',
    prayerTimesAvailable: true,
    jummahTime: '1:00 PM',
    features: ['Jummah', 'Daily Prayers', 'Madrasah'],
  },
  {
    name: 'Claremont Main Road Mosque',
    address: 'Main Rd, Claremont',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '021 671 9402',
    prayerTimesAvailable: true,
    jummahTime: '1:00 PM',
    features: ['Jummah', 'Daily Prayers', 'Historic Building'],
  },
];

export default function MasjidFinderPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');

  const provinces = ['All', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];

  const filteredMasjids = masjidsDatabase.filter(masjid => {
    const matchesSearch = 
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      masjid.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      masjid.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = selectedProvince === 'All' || masjid.province === selectedProvince;
    
    return matchesSearch && matchesProvince;
  });

  const getDirectionsUrl = (masjid: Masjid) => {
    const query = encodeURIComponent(`${masjid.name} ${masjid.address} ${masjid.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const openDirections = (masjid: Masjid) => {
    toast.success(`Opening directions to ${masjid.name}...`);
    window.open(getDirectionsUrl(masjid), '_blank');
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Masjid Finder</h1>
          <p className="text-muted-foreground">
            Find mosques near you across South Africa
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Masjids</CardTitle>
          <CardDescription>
            Search by name, city, or address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a masjid..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Province Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Filter by Province:</p>
            <div className="flex flex-wrap gap-2">
              {provinces.map((province) => (
                <Badge
                  key={province}
                  variant={selectedProvince === province ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedProvince(province)}
                >
                  {province}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Found {filteredMasjids.length} masjid{filteredMasjids.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Masjid List */}
      <div className="grid gap-4">
        {filteredMasjids.map((masjid, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{masjid.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {masjid.address}, {masjid.city}, {masjid.province}
                        </p>
                        {masjid.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${masjid.phone}`} className="hover:text-primary">
                              {masjid.phone}
                            </a>
                          </p>
                        )}
                        {masjid.jummahTime && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Jummah: {masjid.jummahTime}
                          </p>
                        )}
                        {masjid.website && (
                          <p className="flex items-center gap-2">
                            <ExternalLink className="h-3 w-3" />
                            <a 
                              href={`https://${masjid.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline"
                            >
                              {masjid.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {masjid.features.map((feature, fIdx) => (
                      <Badge key={fIdx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => openDirections(masjid)}
                    className="whitespace-nowrap"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  {masjid.prayerTimesAvailable && (
                    <Badge variant="outline" className="justify-center">
                      Prayer Times Available
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMasjids.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No masjids found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle>About Masjid Finder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            This directory helps you locate masjids across South Africa. Each listing includes
            prayer times, contact information, and available facilities.
          </p>
          <p>
            <strong>Note:</strong> Prayer times may vary. Please contact the masjid directly
            to confirm current timings, especially for Jummah and special occasions.
          </p>
          <p className="text-muted-foreground italic">
            "The most beloved places to Allah are the mosques..." — Sahih Muslim
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
