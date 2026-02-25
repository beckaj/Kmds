import { useState } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export default function DevTools() {
  const [applicationId, setApplicationId] = useState('TAP-1770615212432-TW7Z4J');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698be164/dev/check-application/${applicationId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setResult(data);
      console.log('Check result:', data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    null
  );
}