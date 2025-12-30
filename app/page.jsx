'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSong, setCurrentSong] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlaylist([]);
    setCurrentSong(null);
    try {
      const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error fetching playlist');
      }
      const data = await res.json();
      setPlaylist(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const downloadAll = async () => {
    if (!confirm('Esto intentará abrir múltiples ventanas de descarga. Por favor, asegúrate de permitir ventanas emergentes (pop-ups) para este sitio.')) {
      return;
    }
    
    for (const item of playlist) {
      window.open(`/api/download?id=${item.id}&title=${encodeURIComponent(item.title)}`, '_blank');
      // Small delay to help with browser throttling
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Downloader de Playlist</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega URL de playlist (ej. https://music.youtube.com/playlist?list=...)"
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {playlist.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg leading-6 font-medium">
                Preview ({playlist.length} canciones)
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                  Calidad: Máxima disponible (MP3)
                </span>
                <button 
                  onClick={downloadAll}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Descargar Todas
                </button>
              </div>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {playlist.map((item) => (
                <li key={item.id} className={`px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${currentSong?.id === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex items-center flex-1 min-w-0 mr-4">
                    <div className="relative group cursor-pointer" onClick={() => setCurrentSong(item)}>
                      {item.thumbnail && (
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="h-16 w-24 object-cover rounded-md mr-4 shadow-sm"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.author} • {item.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentSong(item)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="Reproducir Preview"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => window.open(`/api/download?id=${item.id}&title=${encodeURIComponent(item.title)}`, '_blank')}
                      className="ml-2 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 whitespace-nowrap"
                    >
                      Descargar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            {currentSong.thumbnail && (
              <img 
                src={currentSong.thumbnail} 
                alt={currentSong.title} 
                className="h-12 w-12 object-cover rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentSong.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentSong.author}
              </p>
            </div>
            <audio 
              controls 
              autoPlay 
              src={`/api/stream?id=${currentSong.id}`}
              className="w-full sm:w-1/2"
              onEnded={() => {
                // Optional: Auto-play next song
                const currentIndex = playlist.findIndex(p => p.id === currentSong.id);
                if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
                  setCurrentSong(playlist[currentIndex + 1]);
                }
              }}
            />
            <button 
              onClick={() => setCurrentSong(null)}
              className="p-2 text-gray-500 hover:text-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}