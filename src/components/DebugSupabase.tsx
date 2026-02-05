// import React, { useEffect, useState } from 'react';
// import { db } from '@/lib/supabase';

// export const DebugSupabase: React.FC = () => {
//   const [info, setInfo] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const checkConnection = async () => {
//       try {
//         // Check if environment variables are loaded
//         const url = import.meta.env.VITE_SUPABASE_URL;
//         const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

//         setInfo({
//           urlLoaded: !!url,
//           keyLoaded: !!key,
//           urlValue: url,
//           keyPreview: key ? key.substring(0, 20) + '...' : 'Not loaded'
//         });

//         // Try to fetch from products table
//         const { data, error: fetchError, count } = await db
//           .from('products')
//           .select('*', { count: 'exact' })
//           .limit(1);

//         if (fetchError) {
//           setError(`Database Error: ${fetchError.message}`);
//         } else {
//           setInfo(prev => ({
//             ...prev,
//             productsTableExists: true,
//             totalProducts: count,
//             sampleData: data
//           }));
//         }
//       } catch (err: any) {
//         setError(`Connection Error: ${err.message}`);
//       }
//     };

//     checkConnection();
//   }, []);

//   return (
//     <div style={{
//       position: 'fixed',
//       bottom: 20,
//       right: 20,
//       background: '#1a1a1a',
//       color: '#fff',
//       padding: '15px',
//       borderRadius: '8px',
//       fontSize: '12px',
//       maxWidth: '400px',
//       zIndex: 9999,
//       maxHeight: '300px',
//       overflowY: 'auto',
//       fontFamily: 'monospace'
//     }}>
//       <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>🔍 Supabase Debug</div>
//       {error && <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>❌ {error}</div>}
//       {info && (
//         <div>
//           <div>✓ URL Loaded: {info.urlLoaded ? 'Yes' : 'No'}</div>
//           <div>✓ Key Loaded: {info.keyLoaded ? 'Yes' : 'No'}</div>
//           {info.urlValue && <div>URL: {info.urlValue}</div>}
//           {info.totalProducts !== undefined && <div>Total Products: {info.totalProducts}</div>}
//           {info.sampleData && <div>Sample: {JSON.stringify(info.sampleData[0]).substring(0, 100)}...</div>}
//         </div>
//       )}
//     </div>
//   );
// };
