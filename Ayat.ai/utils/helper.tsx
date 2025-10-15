export async function sendAudioToAPI(file: string) {
  try {

    const formData = new FormData();
    formData.append('audioFile', {
      uri: file,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);

    const response = await fetch('http://10.0.0.74:8000/uploadAudio/', {
      method: 'POST',
      body: formData,
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

export async function keywordSearch(keyword: string) {
  
  // 34.201.105.88:8000
  try {
    const response = await fetch(`http://10.0.0.74:8000/searchkeyword?keyword=${keyword}`, {
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
  const endpoint = `http://10.0.0.74:8000/searchembedding?query=${query}`;

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

