'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const germanStatesAndCities: Record<string, string[]> = {
  "Baden-Württemberg": ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg", "Heilbronn", "Ulm", "Pforzheim", "Reutlingen"],
  "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen"],
  "Berlin": ["Berlin"],
  "Brandenburg": ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)"],
  "Bremen": ["Bremen", "Bremerhaven"],
  "Hamburg": ["Hamburg"],
  "Hesse": ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach", "Hanau", "Gießen", "Marburg"],
  "Mecklenburg-Vorpommern": ["Rostock", "Schwerin", "Neubrandenburg", "Stralsund", "Greifswald"],
  "Lower Saxony": ["Hanover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen", "Salzgitter", "Hildesheim"],
  "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Aachen", "Mönchengladbach", "Gelsenkirchen"],
  "Rhineland-Palatinate": ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern", "Worms"],
  "Saarland": ["Saarbrücken", "Neunkirchen", "Homburg", "Völklingen"],
  "Saxony": ["Leipzig", "Dresden", "Chemnitz", "Zwickau", "Plauen", "Görlitz"],
  "Saxony-Anhalt": ["Halle (Saale)", "Magdeburg", "Dessau-Roßlau", "Wittenberg"],
  "Schleswig-Holstein": ["Kiel", "Lübeck", "Flensburg", "Neumünster"],
  "Thuringia": ["Erfurt", "Jena", "Gera", "Weimar", "Gotha", "Eisenach"]
};

const GERMAN_CITIES = Object.values(germanStatesAndCities).flat().sort();

export function ManualAddModal({ 
  onAddSuccess, 
  isOpen, 
  onOpenChange, 
  initialUrl = '' 
}: { 
  onAddSuccess: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialUrl?: string;
}) {
  const t = useTranslations('ManualAdd');
  const tWohnungen = useTranslations('Wohnungen');
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [warmRent, setWarmRent] = useState('');
  const [coldRent, setColdRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [squareMeters, setSquareMeters] = useState('');
  const [availability, setAvailability] = useState('');
  const [floor, setFloor] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [rooms, setRooms] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [coverImageFiles, setCoverImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Sync initialUrl to url field when modal opens
  useEffect(() => {
    if (open) {
      if (initialUrl) setUrl(initialUrl);
    }
  }, [open, initialUrl]);

  useEffect(() => {
    const urls = coverImageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [coverImageFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);

    let uploadedImageUrls: string[] = [];

    if (coverImageFiles.length > 0) {
      const formData = new FormData();
      coverImageFiles.forEach(file => {
        formData.append('images', file);
      });

      try {
        const uploadRes = await fetch('http://localhost:3000/apartments/upload-images', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedImageUrls = uploadData.urls;
        } else {
          toast.error('Failed to upload images. Submitting without them.');
        }
      } catch (err) {
        toast.error('Network error during image upload.');
      }
    }

    let cleanedUrl = url.trim();
    if (cleanedUrl && !/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    const payload = {
      title,
      originalListingUrl: cleanedUrl || undefined,
      images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      notes: notes || undefined,
      rentPrice: warmRent ? parseFloat(warmRent) : (coldRent ? parseFloat(coldRent) : undefined),
      warmRent: warmRent ? parseFloat(warmRent) : undefined,
      coldRent: coldRent ? parseFloat(coldRent) : undefined,
      deposit: deposit ? parseFloat(deposit) : undefined,
      squareMeters: squareMeters ? parseFloat(squareMeters) : undefined,
      rooms: rooms ? parseFloat(rooms) : undefined,
      floor: floor || undefined,
      availability: availability || undefined,
      city: city || undefined,
      zipCode: zipCode || undefined,
      address: address || undefined,
      moveInDate: moveInDate ? new Date(moveInDate).toISOString() : undefined,
      sourcePlatform: 'OTHER',
      status: 'SAVED',
    };

    try {
      const res = await fetch('http://localhost:3000/apartments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Apartment added manually');
        setOpen(false);
        // Reset form
        setTitle('');
        setUrl('');
        setCoverImageFiles([]);
        setNotes('');
        setRentPrice('');
        setWarmRent('');
        setColdRent('');
        setDeposit('');
        setSquareMeters('');
        setAvailability('');
        setFloor('');
        setZipCode('');
        setAddress('');
        setState('');
        setCity('');
        setRooms('');
        setMoveInDate('');
        
        onAddSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to add apartment');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="gap-2 shadow-sm rounded-xl h-11 bg-white hover:bg-gray-50 border-gray-200 text-gray-700" />
      }>
        <Plus className="w-4 h-4" /> {tWohnungen('addManually')}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="title">{t('fields.title')} <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              placeholder="Beautiful 2-room apartment..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">{t('fields.url')}</Label>
            <Input 
              id="url" 
              type="text"
              placeholder="https://..." 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>{t('fields.uploadImages')}</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('coverImageFile')?.click()}
                className="w-full text-gray-700 bg-gray-50 hover:bg-gray-100 border-dashed"
              >
                {t('fields.chooseFiles')}
              </Button>
              <Input 
                id="coverImageFile" 
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setCoverImageFiles(prev => [...prev, ...Array.from(files)]);
                  }
                  // Removed e.target.value = '' to prevent WebKit from invalidating the File blobs
                }}
              />
            </div>
            
            {coverImageFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {coverImageFiles.map((file, idx) => (
                  <div key={idx} className="relative flex flex-col items-center w-20">
                    <div className="relative group">
                      <img 
                        src={imagePreviews[idx]} 
                        alt={`Preview ${idx + 1}`} 
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warmRent">{t('fields.warmRent')}</Label>
              <Input 
                id="warmRent" 
                type="number"
                step="0.01"
                placeholder="1200" 
                value={warmRent} 
                onChange={(e) => setWarmRent(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coldRent">{t('fields.coldRent')}</Label>
              <Input 
                id="coldRent" 
                type="number"
                step="0.01"
                placeholder="1000" 
                value={coldRent} 
                onChange={(e) => setColdRent(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">{t('fields.deposit')}</Label>
              <Input 
                id="deposit" 
                type="number"
                step="0.01"
                placeholder="3000" 
                value={deposit} 
                onChange={(e) => setDeposit(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="squareMeters">{t('fields.squareMeters')}</Label>
              <Input 
                id="squareMeters" 
                type="number"
                step="0.01"
                placeholder="65" 
                value={squareMeters} 
                onChange={(e) => setSquareMeters(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="rooms">{t('fields.rooms')}</Label>
              <Input 
                id="rooms" 
                type="number"
                step="0.5"
                placeholder="2.5" 
                value={rooms} 
                onChange={(e) => setRooms(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">{t('fields.floor')}</Label>
              <Input 
                id="floor" 
                type="text"
                placeholder="2" 
                value={floor} 
                onChange={(e) => setFloor(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">{t('fields.availability')}</Label>
              <Input 
                id="availability" 
                type="text"
                placeholder="Immediate" 
                value={availability} 
                onChange={(e) => setAvailability(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="state">{t('fields.state')}</Label>
              <Input 
                id="state" 
                placeholder="Berlin" 
                value={state} 
                onChange={(e) => {
                  setState(e.target.value);
                  setCity('');
                  setShowStateDropdown(true);
                }} 
                onFocus={() => setShowStateDropdown(true)}
                onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
              />
              {showStateDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto no-scrollbar py-1">
                  {Object.keys(germanStatesAndCities)
                    .filter(s => s.toLowerCase().includes(state.toLowerCase()))
                    .sort()
                    .map(s => (
                      <button
                        key={s}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors"
                        onMouseDown={() => {
                          setState(s);
                          setCity('');
                          setShowStateDropdown(false);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  {Object.keys(germanStatesAndCities).filter(s => s.toLowerCase().includes(state.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">{t('fields.noMatches')}</div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="city">{t('fields.city')}</Label>
              <Input 
                id="city" 
                placeholder={state ? t('fields.selectCity') : t('fields.selectStateFirst')} 
                value={city} 
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                disabled={!state}
              />
              {showCityDropdown && state && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto no-scrollbar py-1">
                  {(germanStatesAndCities[state] || [])
                    .filter(c => c.toLowerCase().includes(city.toLowerCase()))
                    .sort()
                    .map(c => (
                      <button
                        key={c}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors"
                        onMouseDown={() => {
                          setCity(c);
                          setShowCityDropdown(false);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  {(germanStatesAndCities[state] || []).filter(c => c.toLowerCase().includes(city.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">{t('fields.noMatches')}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">{t('fields.address')}</Label>
              <Input 
                id="address" 
                placeholder="Musterstraße 12" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">{t('fields.zipCode')}</Label>
              <Input 
                id="zipCode" 
                placeholder="10115" 
                value={zipCode} 
                onChange={(e) => setZipCode(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t('fields.moveInDate')}</Label>
            <Input 
              id="date" 
              type="date"
              value={moveInDate} 
              onChange={(e) => setMoveInDate(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('fields.notes')}</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any initial notes about the apartment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? t('submit.saving') : t('submit.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
