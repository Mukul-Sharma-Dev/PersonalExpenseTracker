const fs = require('fs')

async function testUpload() {
  const formData = new FormData();
  // Create a dummy image file (1x1 pixel gif)
  const dummyImg = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  const blob = new Blob([dummyImg], { type: 'image/gif' })
  formData.append('file', blob, 'test.gif');
  formData.append('upload_preset', 'expense-tracker-uploads');
  formData.append('folder', 'expense-tracker/avatars');

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/du8w7npyq/image/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch(e) {
    console.error(e)
  }
}
testUpload()
