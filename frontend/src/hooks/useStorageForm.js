import { useEffect, useState } from 'react';
import useSystemStore from '../store/useSystemStore';

const DEFAULT_FORM = {
  provider: 'local',
  bucket: '',
  region: '',
  path: '',
  retentionDays: 14,
  encryption: true,
};

export default function useStorageForm() {
  const { storageSettings, updateStorageSettings } = useSystemStore((state) => ({
    storageSettings: state.storageSettings,
    updateStorageSettings: state.updateStorageSettings,
  }));
  const [form, setForm] = useState(storageSettings || DEFAULT_FORM);

  useEffect(() => {
    setForm(storageSettings || DEFAULT_FORM);
  }, [storageSettings]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    await updateStorageSettings(form);
  };

  return { form, handleChange, handleSubmit };
}
