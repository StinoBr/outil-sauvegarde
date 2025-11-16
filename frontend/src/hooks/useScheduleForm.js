import { useEffect, useState } from 'react';
import useSystemStore from '../store/useSystemStore';

export default function useScheduleForm() {
  const { schedule, updateSchedule } = useSystemStore((state) => ({
    schedule: state.schedule,
    updateSchedule: state.updateSchedule,
  }));
  const [form, setForm] = useState(schedule);

  useEffect(() => {
    setForm(schedule);
  }, [schedule]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    await updateSchedule(form);
  };

  return { form, handleChange, handleSubmit };
}
