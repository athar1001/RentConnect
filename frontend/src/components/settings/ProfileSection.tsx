import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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

export function ProfileSection({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const t = useTranslations('Settings');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    preferredState: '',
    preferredCity: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        preferredState: user.preferredState || '',
        preferredCity: user.preferredCity || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      if (res.ok) {
        toast.success(t('toast.profileSuccess'));
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('profile.title')}</h2>
        <p className="text-gray-500">{t('profile.subtitle')}</p>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('profile.fieldName')}</label>
                <Input 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  placeholder={t('profile.placeholderName')} 
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('profile.fieldEmail')}</label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="bg-gray-50/50 border-gray-200"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('profile.fieldPreferredState')}</label>
                <select 
                  className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.preferredState}
                  onChange={e => setFormData({...formData, preferredState: e.target.value, preferredCity: ''})}
                >
                  <option value="">{t('profile.placeholderSelect')}</option>
                  {Object.keys(germanStatesAndCities).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('profile.fieldPreferredCity')}</label>
                <select 
                  className="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  value={formData.preferredCity}
                  onChange={e => setFormData({...formData, preferredCity: e.target.value})}
                  disabled={!formData.preferredState}
                >
                  <option value="">{t('profile.placeholderSelect')}</option>
                  {formData.preferredState && germanStatesAndCities[formData.preferredState]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-[#2d3134] hover:bg-[#1a1c1e] text-white rounded-xl">
                {loading ? t('profile.actionSaving') : t('profile.actionSave')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
