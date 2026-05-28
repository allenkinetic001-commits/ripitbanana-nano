const imageUrl = 'https://yxrcdxvwljiiojgdxvwa.supabase.co/storage/v1/object/public/posts/441fa416-3a4c-4b08-bcc5-c49975923056/1777976579111.jpg';

async function main() {
  console.log(`Fetching image metadata from URL: ${imageUrl}...`);
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
  } catch (e) {
    console.error('Error fetching image:', e);
  }
}

main();
