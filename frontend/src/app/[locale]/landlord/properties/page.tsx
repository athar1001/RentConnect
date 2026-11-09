'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Euro,
  Maximize2,
  CheckCircle2,
  X,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertiesPage() {
  const t = useTranslations('Landlord');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [rentPrice, setRentPrice] = useState('1450');
  const [rooms, setRooms] = useState('2.5');
  const [squareMeters, setSquareMeters] = useState('68');
  const [description, setDescription] = useState('');

  const fetchProperties = async () => {
    try {
      const res = await fetch('http://localhost:3000/landlords/properties');
      if (res.ok) setProperties(await res.json());
    } catch (e) {
      console.error('Failed to load properties:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        address,
        rentPrice: parseFloat(rentPrice),
        rooms: parseFloat(rooms),
        squareMeters: parseFloat(squareMeters),
        description,
        status: 'ACTIVE',
      };

      const res = await fetch('http://localhost:3000/landlords/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setAddress('');
        fetchProperties();
      }
    } catch (e) {
      console.error('Failed to create property:', e);
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('properties.title')}</h1>
          <p className="text-xs text-gray-500 mt-1">Manage active rental listings and incoming candidate applications.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 text-xs font-semibold shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          {t('properties.addProperty')}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by title or address..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-500 font-medium">No active properties match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                    {prop.status}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono font-medium">{prop.referenceNumber}</span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{prop.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {prop.address}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-gray-50/70 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Rent</span>
                    <span className="font-bold text-emerald-600">€{prop.rentPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Rooms</span>
                    <span className="font-bold text-gray-800">{prop.rooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Area</span>
                    <span className="font-bold text-gray-800">{prop.squareMeters} m²</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {prop._count?.applications || 0} Applications
                </span>
                <Button variant="outline" className="border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50">
                  Manage Listing
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Add New Property Listing
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern 2-Room Apartment in Charlottenburg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Kantstraße 42, 10623 Berlin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Rent (€)</label>
                  <input
                    type="number"
                    required
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Rooms</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Area (m²)</label>
                  <input
                    type="number"
                    required
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key property details, amenities, move-in terms..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                  Save Property Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
