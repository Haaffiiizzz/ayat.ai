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
