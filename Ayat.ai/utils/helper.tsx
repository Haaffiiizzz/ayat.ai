import * as FileSystem from 'expo-file-system/legacy';

export async function sendAudioToAPI(file: string) {
  try {
    if (!file) {
      console.error('No file provided to sendAudioToAPI');
      return null;
    }

    const normalizedUri = file.startsWith('file://') ? file : `file://${file}`;

    // File existence check (legacy API explicitly)
    const info = await FileSystem.getInfoAsync(normalizedUri);
    console.log('Uploading audio:', normalizedUri, 'exists:', info.exists, 'size:', info.size);

    if (!info.exists || !info.size || info.size <= 0) {
      console.error('Audio file missing or empty, aborting upload.');
      return null;
    }

    const formData = new FormData();
    formData.append('audioFile', {
      uri: normalizedUri,
      name: 'recording.m4a',
      type: 'audio/mp4',
    } as any);

    const response = await fetch('http://3.16.180.182:8000/uploadAudio/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

export async function keywordSearch(keyword: string) {
  
  // 34.201.105.88:8000
  try {
    const response = await fetch(`http://3.16.180.182:8000/searchkeyword?keyword=${keyword}`, {
        method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }

}

export async function embeddingSearch(query: string) {
  const endpoint = `http://3.16.180.182:8000/searchembedding?query=${query}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed!
Endpoint: ${endpoint}
Status: ${response.status} ${response.statusText}
Response: ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error: any) {
    console.error(`Network or unexpected error when calling ${endpoint}:
${error.message || error}`);
    return null;
  }
}

