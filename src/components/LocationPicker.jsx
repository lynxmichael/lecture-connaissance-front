import { useState } from 'react';

export default function LocationPicker({
  initialLat,
  initialLng,
  initialAddress,
  onSave
}) {
  const [lat, setLat] = useState(initialLat || '');
  const [lng, setLng] = useState(initialLng || '');
  const [address, setAddress] = useState(initialAddress || '');

  const handleSave = () => {
    console.log({
      latitude: lat,
      longitude: lng,
      address,
    });

    if (onSave) onSave();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">
          Latitude
        </label>

        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
          placeholder="5.3599517"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Longitude
        </label>

        <input
          type="text"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
          placeholder="-4.0082563"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Adresse
        </label>

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Abidjan, Cocody"
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-black text-white px-5 py-2 rounded-xl"
      >
        Enregistrer
      </button>
    </div>
  );
}