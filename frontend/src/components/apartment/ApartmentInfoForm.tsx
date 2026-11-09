import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ApartmentInfoForm({ apartment, onUpdate }: { apartment: any, onUpdate: () => void }) {
  const t = useTranslations('ApartmentDetail');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...apartment });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? null : parseFloat(value);
    } else if (e.target.tagName.toLowerCase() === 'select') {
      parsedValue = value === 'true';
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/apartments/${apartment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rentPrice: formData.rentPrice,
          warmRent: formData.warmRent,
          coldRent: formData.coldRent,
          deposit: formData.deposit,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          rooms: formData.rooms,
          squareMeters: formData.squareMeters,
          energyClass: formData.energyClass,
          utilityCosts: formData.utilityCosts,
          heatingCostsIncluded: formData.heatingCostsIncluded,
          heatingCosts: formData.heatingCosts,
          constructionYear: formData.constructionYear,
          heatingType: formData.heatingType,
          energySource: formData.energySource,
          certificateType: formData.certificateType,
          description: formData.description,
          availability: formData.availability,
          floor: formData.floor,
        }),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(t('toast.saveSuccess'));
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(t('toast.saveFailed'));
      }
    } catch (err) {
      toast.error(t('toast.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const editFields: { name: string; type: string; label?: string; colSpan?: number }[] = [
    { name: 'warmRent', type: 'number' },
    { name: 'coldRent', type: 'number' },
    { name: 'deposit', type: 'number' },
    { name: 'squareMeters', type: 'number' },
    { name: 'rooms', type: 'number' },
    { name: 'availability', type: 'text' },
    { name: 'floor', type: 'text' },
    { name: 'address', type: 'text', colSpan: 2 },
    { name: 'zipCode', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'description', type: 'textarea', colSpan: 4 },
  ];

  const viewFields: { name: string; type: string; label?: string; colSpan?: number }[] = [
    { name: 'warmRent', type: 'number' },
    { name: 'coldRent', type: 'number' },
    { name: 'deposit', type: 'number' },
    { name: 'squareMeters', type: 'number' },
    { name: 'rooms', type: 'number' },
    { name: 'availability', type: 'text' },
    { name: 'floor', type: 'text' },
    { name: 'address', label: 'fullAddress', type: 'combinedAddress', colSpan: 2 },
  ];

  return (
    <Card className="border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3 px-5 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-gray-800">{t('infoForm.title')}</CardTitle>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-gray-500 hover:text-gray-900 rounded-lg">
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> {t('infoForm.actionEdit')}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-gray-500 rounded-lg">
              <X className="w-4 h-4" /> {t('infoForm.actionCancel')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading} className="h-8 bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-lg">
              <Check className="w-4 h-4 mr-1.5" /> {t('infoForm.actionSave')}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
          {(isEditing ? editFields : viewFields).map((field) => (
            <div key={field.name} className={field.colSpan === 4 ? 'col-span-2 md:col-span-4' : field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                {t(`infoForm.fields.${field.label || field.name}`)}
              </Label>
              {isEditing ? (
                field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300 outline-none"
                  />
                ) : (
                  <Input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="h-9 rounded-lg bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-300"
                  />
                )
              ) : (
                <div className={`font-medium text-gray-900 ${field.type === 'textarea' ? 'min-h-[36px] py-1.5 whitespace-pre-wrap leading-relaxed' : 'h-9 flex items-center'}`}>
                  {field.type === 'combinedAddress' 
                    ? ([apartment.address, apartment.zipCode, apartment.city].filter(Boolean).join(', ') || '—')
                    : field.type === 'number' && apartment[field.name] !== null && apartment[field.name] !== undefined
                      ? (field.name.toLowerCase().includes('rent') || field.name === 'deposit'
                        ? `${apartment[field.name]} €`
                        : field.name === 'squareMeters'
                          ? `${apartment[field.name]} m²`
                          : apartment[field.name])
                      : (apartment[field.name] || '—')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
